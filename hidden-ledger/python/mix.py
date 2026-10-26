"""Mix narration + procedural score + UI SFX for a timeline, then loudness-normalise with FFmpeg.

* Music: one original cue per scene (mood from episode.json), crossfaded at scene boundaries.
  If assets/music/documentary_bed.(wav|mp3|flac) exists it replaces the synthesized score
  (log its licence in asset_licenses.csv first).
* Ducking: gain curve driven by the narration envelope (attack 40 ms / release 350 ms) plus an extra
  dip during segments flagged "duck": true (key figures).
* SFX: whoosh on scene changes, tick on figure reveals, click on process steps, thump on the payoff.
* Loudness: two-pass ffmpeg loudnorm, target -16 LUFS integrated, -1.5 dBTP (guide values).

Usage
  python python/mix.py --episode 001 --name pilot
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import MIX_SR, ROOT, output_dir, write_json  # noqa: E402
from music import render_cue  # noqa: E402

SR = MIX_SR
XFADE = 2.0
MUSIC_UNDER_VOICE_DB = -21.0  # music level while narration is active, relative to voice RMS
MUSIC_IN_GAPS_DB = -13.0      # music level in pauses
EXTRA_DIP_DB = -5.0           # additional dip on key figures
SFX_DB = -17.0                # SFX peak relative to voice peak
STEP_SCENES = {"s03"}         # scenes whose segments are numbered process steps


def ffmpeg(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", *args], capture_output=True, text=True)


def load_resampled(path: Path) -> np.ndarray:
    tmp = path.with_suffix(".48k.wav")
    r = ffmpeg("-i", str(path), "-ar", str(SR), "-ac", "1", "-c:a", "pcm_f32le", str(tmp))
    if r.returncode:
        sys.exit(r.stderr[-2000:])
    x, sr = sf.read(str(tmp), dtype="float32")
    tmp.unlink()
    return x


def smooth_env(x: np.ndarray, attack: float, release: float, hop: int = 240) -> np.ndarray:
    """Peak-ish envelope at hop resolution with asymmetric attack/release, upsampled to SR."""
    n = len(x) // hop
    frames = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    a_c = np.exp(-hop / (attack * SR))
    r_c = np.exp(-hop / (release * SR))
    env = np.zeros(n)
    v = 0.0
    for i, f in enumerate(frames):
        c = a_c if f > v else r_c
        v = c * v + (1 - c) * f
        env[i] = v
    return np.interp(np.arange(len(x)), np.arange(n) * hop + hop / 2, env)


def music_track(tl: dict, total_n: int, cache: Path) -> tuple[np.ndarray, str]:
    override = next((p for p in (ROOT / "assets" / "music").glob("documentary_bed.*")
                     if p.suffix.lower() in (".wav", ".mp3", ".flac")), None)
    out = np.zeros((total_n, 2), dtype=np.float32)
    if override:
        tmp = cache / "bed.wav"
        ffmpeg("-i", str(override), "-ar", str(SR), "-ac", "2", str(tmp))
        bed, _ = sf.read(str(tmp), dtype="float32")
        reps = int(np.ceil(total_n / len(bed)))
        out[:] = np.tile(bed, (reps, 1))[:total_n]
        return out, f"user file {override.name}"
    cache.mkdir(parents=True, exist_ok=True)
    scenes = tl["scenes"]
    for i, sc in enumerate(scenes):
        start = max(0.0, sc["start"] - (XFADE / 2 if i else 0))
        end = sc["end"] + (XFADE / 2 if i < len(scenes) - 1 else 0)
        dur = round(end - start, 2)
        mood = sc["music"]
        seed = int(sc["id"][1:]) * 10
        key = hashlib.sha1(f"{mood}-{dur}-{seed}-v1".encode()).hexdigest()[:12]
        f = cache / f"{sc['id']}_{mood}_{key}.wav"
        if f.exists():
            cue, _ = sf.read(str(f), dtype="float32")
        else:
            print(f"   music cue {sc['id']} {mood} {dur}s")
            cue = render_cue(mood, dur, seed_offset=seed, intensity=1.0 if mood != "neutral" else 0.8,
                             resolve_end=(i == len(scenes) - 1))
            sf.write(str(f), cue, SR, subtype="FLOAT")
        a = int(start * SR)
        b = min(total_n, a + len(cue))
        out[a:b] += cue[: b - a]
    return out, "procedural (python/music.py)"


def sfx_events(tl: dict) -> list[tuple[float, str]]:
    ev = []
    for i, sc in enumerate(tl["scenes"]):
        if i:
            ev.append((sc["start"] - 0.35, "whoosh"))
        for j, seg in enumerate(sc["segments"]):
            if seg["duck"]:
                ev.append((seg["start"] + 0.1, "tick"))
            if sc["id"] in STEP_SCENES and re.match(r"Step ", seg["text"]):
                ev.append((seg["start"] + 0.05, "click"))
        if i == len(tl["scenes"]) - 1 and i:
            ev.append((sc["segments"][0]["start"] - 0.1, "thump"))
    return ev


def rms_db(x: np.ndarray) -> float:
    return float(20 * np.log10(np.sqrt(np.mean(np.square(x, dtype=np.float64))) + 1e-12))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="001")
    ap.add_argument("--name", default="full")
    a = ap.parse_args()
    base = output_dir(a.episode) / "audio" / a.name
    tl = json.loads((base / "timeline.json").read_text())
    voice = load_resampled(base / "narration.wav")
    n = len(voice)

    # voice activity / envelope
    env = smooth_env(voice, 0.04, 0.35)
    speech_mask = env > (np.max(env) * 0.08)
    voice_rms = rms_db(voice[speech_mask])
    voice_peak = float(np.max(np.abs(voice)))

    music, music_src = music_track(tl, n, output_dir(a.episode) / "audio" / "cache" / "music")
    music_rms = rms_db(music[music != 0]) if np.any(music) else -120
    act = np.clip(env / (np.max(env) * 0.25), 0, 1)  # 0 = gap, 1 = speaking
    gain_db = MUSIC_IN_GAPS_DB + (MUSIC_UNDER_VOICE_DB - MUSIC_IN_GAPS_DB) * act
    dip = np.zeros(n)
    for sc in tl["scenes"]:
        for seg in sc["segments"]:
            if seg["duck"]:
                s0, s1 = int((seg["start"] - 0.3) * SR), int((seg["end"] + 0.4) * SR)
                dip[max(0, s0):min(n, s1)] = 1
    dip = np.convolve(dip, np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same")  # smooth ramps
    gain_db += EXTRA_DIP_DB * dip
    # first and last seconds: let music breathe (intro before voice, outro after)
    g = 10 ** ((gain_db + voice_rms - music_rms) / 20)
    music_mixed = music * g[:, None].astype(np.float32)

    # sfx
    sfx = np.zeros((n, 2), dtype=np.float32)
    lib = {p.stem: sf.read(str(p), dtype="float32")[0] for p in (ROOT / "assets" / "sfx").glob("*.wav")}
    events = sfx_events(tl)
    for t, name in events:
        s = lib.get(name)
        if s is None:
            continue
        if s.ndim == 1:
            s = np.stack([s, s], 1)
        s = s * (voice_peak * 10 ** (SFX_DB / 20) / (np.max(np.abs(s)) or 1))
        i = int(max(0, t) * SR)
        j = min(n, i + len(s))
        sfx[i:j] += s[: j - i]

    mix = np.stack([voice, voice], 1) * 0.8 + music_mixed * 0.8 + sfx * 0.8
    pre = base / "mix_pre.wav"
    sf.write(str(pre), mix, SR, subtype="FLOAT")
    sf.write(str(base / "stem_music.wav"), music_mixed, SR, subtype="PCM_16")
    sf.write(str(base / "stem_sfx.wav"), sfx, SR, subtype="PCM_16")

    # two-pass loudnorm
    target = "I=-16:TP=-2.0:LRA=11"  # -2.0 leaves headroom for the AAC encode (guide: <= -1.5 dBTP)
    r = ffmpeg("-i", str(pre), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-")
    m = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
    flt = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
           f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    final = base / "mix.wav"
    r = ffmpeg("-i", str(pre), "-af", flt + ",aresample=48000", "-ar", "48000", "-c:a", "pcm_s16le", str(final))
    if r.returncode:
        sys.exit(r.stderr[-2000:])
    pre.unlink()

    # measure final
    r = ffmpeg("-i", str(final), "-af", "ebur128=peak=true", "-f", "null", "-")
    tail = r.stderr[r.stderr.rindex("Summary:"):]
    integ = float(re.search(r"I:\s+(-?[\d.]+) LUFS", tail).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", tail).group(1))
    lra = float(re.search(r"LRA:\s+(-?[\d.]+) LU", tail).group(1))
    fx, _ = sf.read(str(final), dtype="float32")

    # audits: voice-vs-music ratio in first 30 s and around scene changes (from stems, pre-normalisation)
    def window_ratio(t0, t1):
        i, j = int(t0 * SR), int(t1 * SR)
        v = voice[i:j][speech_mask[i:j]]
        mu = music_mixed[i:j].mean(axis=1)
        return {"from": round(t0, 2), "to": round(t1, 2), "voice_db": round(rms_db(v), 1) if len(v) else None,
                "music_db": round(rms_db(mu), 1), "voice_over_music_db": round(rms_db(v) - rms_db(mu), 1) if len(v) else None}

    audits = [window_ratio(0, min(30, n / SR))]
    for sc in tl["scenes"][1:]:
        audits.append(window_ratio(max(0, sc["start"] - 4), min(n / SR, sc["start"] + 4)))
    report = {"name": a.name, "duration": round(len(fx) / SR, 3), "sample_rate": SR, "channels": 2,
              "integrated_lufs": integ, "true_peak_dbtp": tp, "lra": lra,
              "clipped_samples": int(np.sum(np.abs(fx) >= 0.999)),
              "music_source": music_src, "sfx_events": len(events), "audits": audits,
              "targets": {"integrated_lufs": -16, "true_peak_max": -1.5}}
    write_json(base / "audio_report.json", report)
    print(json.dumps({k: report[k] for k in ("duration", "integrated_lufs", "true_peak_dbtp", "lra", "clipped_samples", "music_source", "sfx_events")}))
    for au in audits[:4]:
        print("  audit", au)


if __name__ == "__main__":
    main()
