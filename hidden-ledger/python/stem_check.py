"""Technical check of the separate audio stems (voice, music, SFX) of a mix. Measurement only: it does not judge naturalness.

* voice: per-segment start/end energy (cut-offs), clipping, pauses between segments vs configured pauses, unexpected gaps
* music: level relative to the voice in 400 ms windows while the narrator speaks (worst cases listed), level variation per scene
* sfx: peak relative to voice peak, events overlapping speech onsets

Usage: python python/stem_check.py --episode 001 --name full    -> diagnostics/stem_check_ep<episode>_<name>.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, load_episode, output_dir, write_json  # noqa: E402


def db(x: np.ndarray) -> float:
    return float(20 * np.log10(np.sqrt(np.mean(np.square(x, dtype=np.float64))) + 1e-12))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="001")
    ap.add_argument("--name", default="full")
    a = ap.parse_args()
    base = output_dir(a.episode) / "audio"
    tl = json.loads((base / a.name / "timeline.json").read_text())
    ep = load_episode(a.episode)
    rep: dict = {"voice": {}, "music": {}, "sfx": {}, "issues": []}

    # ---- voice: per segment WAVs
    man = json.loads((base / "narration" / "manifest.json").read_text())
    cut, clipped = [], []
    for sc in tl["scenes"]:
        for g in sc["segments"]:
            x, sr = sf.read(str(base / "narration" / man[g["key"]]["file"]), dtype="float32")
            head, tail = x[: int(0.03 * sr)], x[-int(0.03 * sr):]
            body = db(x)
            if db(tail) > body - 6:  # still loud in the last 30 ms -> possible cut-off
                cut.append({"segment": g["key"], "tail_db": round(db(tail), 1), "body_db": round(body, 1)})
            if np.sum(np.abs(x) >= 0.999):
                clipped.append(g["key"])
    segs = [g for sc in tl["scenes"] for g in sc["segments"]]
    gaps = [round(segs[i + 1]["start"] - segs[i]["end"], 3) for i in range(len(segs) - 1)]
    vc = ep["voice"]
    rep["voice"] = {
        "segments": len(segs), "possible_cutoffs": cut, "clipped_segments": clipped,
        "pause_min_s": min(gaps), "pause_max_s": max(gaps),
        "configured_pauses_s": [vc["pauseBetweenSegments"], vc["pauseBetweenScenes"]],
        "unexpected_gaps": [{"after": segs[i]["key"], "gap_s": g} for i, g in enumerate(gaps) if g > vc["pauseBetweenScenes"] + 0.05 or g < vc["pauseBetweenSegments"] - 0.05],
    }

    # ---- music + sfx vs voice in 400 ms windows during speech
    voice, sr = sf.read(str(base / a.name / "narration.wav"), dtype="float32")
    music, msr = sf.read(str(base / a.name / "stem_music.wav"), dtype="float32")
    sfx, _ = sf.read(str(base / a.name / "stem_sfx.wav"), dtype="float32")
    music = music.mean(axis=1)
    sfx = sfx.mean(axis=1)
    # bring voice to the stems' rate
    t = np.arange(len(music)) / msr
    v = np.interp(t, np.arange(len(voice)) / sr, voice).astype(np.float32) * 0.8  # same 0.8 bus gain as mix.py
    m = music * 0.8
    # 100 ms frames where the narrator is actually voicing (> -35 dBFS); comma pauses inside a sentence are excluded,
    # because there the music is meant to breathe and nothing needs to be understood
    w = int(0.1 * msr)
    rows = []
    for i in range(0, len(v) - w, w):
        vv, mm = v[i:i + w], m[i:i + w]
        vdb = db(vv)
        if vdb > -35:
            rows.append((i / msr, vdb - db(mm)))
    ratios = np.array([r[1] for r in rows])
    worst = sorted(rows, key=lambda r: r[1])[:5]
    rep["music"] = {
        "speech_windows": len(rows),
        "voice_over_music_db_median": round(float(np.median(ratios)), 1),
        "voice_over_music_db_p5": round(float(np.percentile(ratios, 5)), 1),
        "voice_over_music_db_min": round(float(ratios.min()), 1),
        "worst_windows": [{"t": round(tt, 1), "voice_over_music_db": round(r, 1)} for tt, r in worst],
        "per_scene_music_db": {sc["id"]: round(db(m[int(sc["start"] * msr):int(sc["end"] * msr)]), 1) for sc in tl["scenes"]},
    }
    # criterion on the 5th percentile: single 100 ms frames of soft consonants are naturally close to the bed
    if np.percentile(ratios, 5) < 12:
        rep["issues"].append(f"music within 12 dB of the voice in >5% of voiced frames (p5 {np.percentile(ratios, 5):.1f} dB)")
    peak_v = float(np.max(np.abs(v)))
    peak_s = float(np.max(np.abs(sfx * 0.8)))
    rep["sfx"] = {"peak_relative_to_voice_peak_db": round(20 * np.log10(peak_s / peak_v + 1e-12), 1)}
    if peak_s > peak_v * 0.5:
        rep["issues"].append("an SFX peak is within 6 dB of the voice peak")
    if cut:
        rep["issues"].append(f"{len(cut)} segment(s) end loudly (check for cut-offs)")
    write_json(ROOT / "diagnostics" / f"stem_check_ep{a.episode}_{a.name}.json", rep)
    print(json.dumps(rep, indent=1))


if __name__ == "__main__":
    main()
