"""Narration with Chatterbox TTS (Resemble AI, MIT licence) on CPU — episode 004+.

Same output contract as generate_voice.py (narration/scene-XX/segment-YY.wav + manifest.json, 24 kHz mono, peak -3 dBFS),
so build_timeline.py / mix.py work unchanged. Runs in its own venv (.venv-cbx: torch CPU + chatterbox-tts + faster-whisper):

  node scripts/pipeline.mjs setup-chatterbox      # once
  .venv-cbx/bin/python python/chatterbox_narration.py --episode 004

Chatterbox samples stochastically, so every segment is
  * seeded from its text hash (re-running reproduces the same take),
  * transcribed with Whisper and compared with the script (word error rate),
  * re-generated with the next seed when it fails a check (garbled words, repeats, cut-offs, long silences);
    the best take is kept and its WER is stored in the manifest.
Cache: a segment is re-rendered only when its text or the voice settings change.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import SR, analyze, int_words, load_episode, normalize_for_tts, output_dir, trim_silence, write_json  # noqa: E402

ENGINE = "chatterbox-tts==0.1.7"


def words(s: str) -> list[str]:
    """Comparable words: Whisper writes "$25" / "41%" / "2,000" where the script says the words."""
    s = re.sub(r"(?<=\d),(?=\d{3})", "", s)
    s = normalize_for_tts(s)  # $ amounts, years, decimals, % -> words (integers stay digits)
    s = re.sub(r"\d+", lambda m: int_words(int(m.group(0))), s)
    s = s.lower().replace("-", " ")
    s = re.sub(r"[^a-z0-9' ]", " ", s)
    return s.split()


def wer(ref: str, hyp: str) -> float:
    import jiwer
    r, h = " ".join(words(ref)), " ".join(words(hyp))
    return float(jiwer.wer(r, h)) if r else 0.0


_tts = None
_asr = None


def tts():
    global _tts
    if _tts is None:
        import torch
        from chatterbox.tts import ChatterboxTTS
        torch.set_num_threads(4)
        _tts = ChatterboxTTS.from_pretrained(device="cpu")
    return _tts


def asr(x: np.ndarray) -> str:
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    import librosa
    y = librosa.resample(x.astype(np.float32), orig_sr=SR, target_sr=16000)
    segs, _ = _asr.transcribe(y, language="en", beam_size=5, vad_filter=False)
    return " ".join(s.text.strip() for s in segs)


def take(text: str, seed: int, exaggeration: float, cfg: float, temperature: float) -> np.ndarray:
    import librosa
    import torch
    torch.manual_seed(seed)
    m = tts()
    wav = m.generate(text, exaggeration=exaggeration, cfg_weight=cfg, temperature=temperature)
    x = wav.squeeze(0).cpu().numpy().astype(np.float32)
    if m.sr != SR:
        x = librosa.resample(x, orig_sr=m.sr, target_sr=SR)
    return trim_silence(x, SR)


def stretch(x: np.ndarray, tempo: float) -> np.ndarray:
    """Slow the delivery down without changing pitch (ffmpeg rubberband, formant-preserving). Chatterbox speaks at
    ~220 words/min even with a low cfg; a documentary pace is nearer 170-180."""
    if abs(tempo - 1.0) < 1e-3:
        return x
    import subprocess
    p = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                        "-af", f"rubberband=tempo={tempo}:transients=smooth:formant=preserved:pitchq=quality", "-f", "f32le", "pipe:1"],
                       input=x.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()


def check(x: np.ndarray, text: str) -> tuple[list[str], dict]:
    a = analyze(x, SR)
    n = len(words(text))
    probs = []
    if a["duration"] < 0.16 * n:
        probs.append(f"too short ({a['duration']}s for {n} words)")
    if a["duration"] > 0.62 * n + 1.5:
        probs.append(f"too long ({a['duration']}s for {n} words): repeats or babble")
    if a["longest_silence"] > 1.2:
        probs.append(f"internal silence {a['longest_silence']}s")
    # (float output above 1.0 is not clipping: every take is peak-normalised to -3 dBFS before writing)
    return probs, a


def seg_hash(text: str, vc: dict) -> str:
    h = hashlib.sha256()
    parts = [text, ENGINE, vc.get("exaggeration"), vc.get("cfg"), vc.get("temperature"), vc.get("prompt")]
    if vc.get("tempo", 1.0) != 1.0:  # only part of the key when used: older episodes keep their cached takes
        parts.append(vc["tempo"])
    h.update(json.dumps(parts).encode())
    return h.hexdigest()[:16]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--episode", required=True)
    p.add_argument("--force", action="store_true")
    p.add_argument("--only", help="comma-separated segment keys, e.g. s01-03,s02-01")
    p.add_argument("--max-takes", type=int, default=4)
    a = p.parse_args()
    ep = load_episode(a.episode)
    vc = ep["voice"]
    ex, cfg, temp = float(vc.get("exaggeration", 0.45)), float(vc.get("cfg", 0.5)), float(vc.get("temperature", 0.8))
    max_wer = float(vc.get("maxWer", 0.12))
    root = output_dir(a.episode) / "audio" / "narration"
    mpath = root / "manifest.json"
    manifest = json.loads(mpath.read_text()) if mpath.exists() else {}
    only = set(a.only.split(",")) if a.only else None
    # takes are reusable by content: when segments are renumbered (a line inserted), unchanged text is not re-generated
    import shutil
    snap = root / "_prev_takes"
    shutil.rmtree(snap, ignore_errors=True)
    snap.mkdir(parents=True, exist_ok=True)
    by_hash = {}
    for k, v in manifest.items():
        if (root / v["file"]).exists():
            dst = snap / f"{v['hash']}.wav"
            shutil.copyfile(root / v["file"], dst)
            by_hash[v["hash"]] = (k, v, dst)
    out, failures, rendered, cached = {}, [], 0, 0
    for scene in ep["scenes"]:
        for seg in scene["segments"]:
            key = f"{scene['id']}-{seg['id']}"
            text = normalize_for_tts(seg.get("say", seg["text"]), ep.get("lexicon"))
            h = seg_hash(text, vc)
            path = root / f"scene-{scene['id'][1:]}" / f"segment-{seg['id']}.wav"
            prev = manifest.get(key)
            if prev and path.exists() and ((prev.get("hash") == h and not a.force) or (only and key not in only)):
                out[key] = prev
                cached += 1
                continue
            if h in by_hash and not a.force:
                _, prev, src = by_hash[h]
                path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, path)
                out[key] = {**prev, "file": str(path.relative_to(root))}
                cached += 1
                continue
            print(f"-> {key}: {text[:72]}...", flush=True)
            base = int(h[:8], 16)
            best = None
            t0 = time.time()
            for k in range(a.max_takes):
                seed = base + k
                x = stretch(take(text, seed, ex, cfg, temp), float(vc.get("tempo", 1.0)))
                probs, an = check(x, text)
                hyp = asr(x)
                w = wer(text, hyp)
                if w > max_wer:
                    probs.append(f"WER {w:.2f}")
                score = (len(probs), w)
                print(f"   take {k + 1} seed {seed}: {an['duration']}s WER {w:.2f} {'; '.join(probs) or 'ok'}", flush=True)
                if best is None or score < best[0]:
                    best = (score, x, an, hyp, w, seed, probs)
                if not probs:
                    break
            score, x, an, hyp, w, seed, probs = best
            peak = float(np.max(np.abs(x))) or 1.0
            x = (x / peak * 10 ** (-3 / 20)).astype(np.float32)
            path.parent.mkdir(parents=True, exist_ok=True)
            sf.write(path, x, SR, subtype="PCM_16")
            out[key] = {"hash": h, "file": str(path.relative_to(root)), "voice": f"chatterbox(ex={ex},cfg={cfg},T={temp})",
                        "engine": ENGINE, "seed": seed, "tts_text": text, "asr": hyp, "wer": round(w, 3),
                        "render_seconds": round(time.time() - t0, 1), **analyze(x, SR)}
            if probs:
                failures.append({"segment": key, "problems": probs, "asr": hyp})
            rendered += 1
            write_json(mpath, {**manifest, **out})  # checkpoint: an interrupted run resumes here
    shutil.rmtree(snap, ignore_errors=True)
    write_json(mpath, out)
    print(f"narration: {rendered} rendered, {cached} cached, {len(failures)} still flagged (engine={ENGINE})")
    if failures:
        write_json(root / "failures.json", failures)
        sys.exit(1)
    (root / "failures.json").unlink(missing_ok=True)


if __name__ == "__main__":
    main()
