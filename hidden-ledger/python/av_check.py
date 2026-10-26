"""Audio/video sync and completeness check for a rendered episode.

1. Completeness: video frame count / duration vs the timeline; audio duration vs video duration.
2. Audio offset + drift: cross-correlation of the MP4's decoded audio against the lossless mix.wav
   at the start, middle and end (an offset that changes along the file = drift).
3. Picture vs narration: the scene-change wipe is located in the picture (full-height orange edge) and compared with\n   the narration timeline's scene starts (tolerance ±0.2 s).
4. Intelligibility through the final mix (optional --asr): Whisper WER on the MP4 audio vs the script.

Usage: python python/av_check.py --episode 001 --video output/episode-001/full/full_video_v2.mp4 [--asr]
Writes diagnostics/av_check_<video name>.json
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, output_dir, write_json  # noqa: E402

FPS = 30


def probe_streams(p: Path) -> dict:
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_entries",
                        "stream=codec_type,nb_read_frames,duration,start_time,sample_rate", "-of", "json", str(p)],
                       capture_output=True, text=True)
    return json.loads(r.stdout)


def decode_audio(p: Path, sr: int = 8000) -> np.ndarray:
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-map", "0:a:0", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                       capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def xcorr_lag(a: np.ndarray, b: np.ndarray, sr: int, max_lag_s: float = 0.5) -> tuple[float, float]:
    """Lag (seconds) that best aligns b to a, and normalised correlation peak."""
    n = len(a) + len(b)
    size = 1 << (n - 1).bit_length()
    A = np.fft.rfft(a - a.mean(), size)
    B = np.fft.rfft(b - b.mean(), size)
    c = np.fft.irfft(A * np.conj(B), size)
    m = int(max_lag_s * sr)
    c = np.concatenate([c[-m:], c[: m + 1]])
    k = int(np.argmax(c))
    lag = (k - m) / sr
    norm = float(c[k] / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))
    return lag, norm


def wipe_frames(p: Path, t0: float, span: float = 0.8, w: int = 192, h: int = 108) -> list[tuple[float, float]]:
    """For frames in [t0-span, t0+span], the fraction of pixel rows that contain the wipe's orange (#F59E0B) edge.
    The SceneWipe draws a full-height orange diagonal, so a value near 1.0 marks the wipe in the picture."""
    start = max(0.0, t0 - span)
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", str(p), "-t", f"{2 * span:.3f}", "-vf", f"scale={w}:{h}",
                        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
    fr = np.frombuffer(r.stdout, dtype=np.uint8).reshape(-1, h, w, 3).astype(np.int16)
    orange = (np.abs(fr[..., 0] - 245) < 40) & (np.abs(fr[..., 1] - 158) < 45) & (fr[..., 2] < 90)
    cover = orange.any(axis=2).mean(axis=1)
    return [(start + i / FPS, float(c)) for i, c in enumerate(cover)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="001")
    ap.add_argument("--video", required=True)
    ap.add_argument("--name", default="full")
    ap.add_argument("--asr", action="store_true")
    a = ap.parse_args()
    video = ROOT / a.video
    base = output_dir(a.episode) / "audio" / a.name
    tl = json.loads((base / "timeline.json").read_text())
    rep: dict = {"video": a.video, "problems": []}

    # 1. completeness
    st = probe_streams(video)["streams"]
    v = next(s for s in st if s["codec_type"] == "video")
    au = next(s for s in st if s["codec_type"] == "audio")
    frames = int(v["nb_read_frames"])
    rep["completeness"] = {
        "video_frames": frames, "timeline_frames": tl["durationInFrames"],
        "video_duration": float(v["duration"]), "audio_duration": float(au["duration"]),
        "timeline_duration": tl["duration"], "video_start": float(v.get("start_time", 0)), "audio_start": float(au.get("start_time", 0)),
    }
    if abs(frames - tl["durationInFrames"]) > 1:
        rep["problems"].append(f"frame count {frames} != timeline {tl['durationInFrames']}")
    if abs(float(v["duration"]) - float(au["duration"])) > 2 / FPS:
        rep["problems"].append("audio and video durations differ by more than 2 frames")

    # 2. offset + drift vs the lossless mix
    sr = 8000
    mp4 = decode_audio(video, sr)
    ref, rsr = sf.read(str(base / "mix.wav"), dtype="float32")
    ref = ref.mean(axis=1) if ref.ndim > 1 else ref
    ref = np.interp(np.arange(0, len(ref) / rsr, 1 / sr), np.arange(len(ref)) / rsr, ref).astype(np.float32)
    checks = []
    dur = len(ref) / sr
    for t0 in (5.0, dur / 2, max(5.0, dur - 25)):
        i, j = int(t0 * sr), int((t0 + 20) * sr)
        lag, corr = xcorr_lag(ref[i:j], mp4[i:j], sr)
        checks.append({"at_s": round(t0, 1), "offset_ms": round(lag * 1000, 1), "correlation": round(corr, 3)})
    rep["audio_offset"] = checks
    offs = [c["offset_ms"] for c in checks]
    if max(abs(o) for o in offs) > 1000 / FPS:
        rep["problems"].append(f"audio offset exceeds one frame: {offs} ms")
    if max(offs) - min(offs) > 10:
        rep["problems"].append(f"audio drift along the file: {offs} ms")

    # 3. picture transitions vs narration timeline: locate the wipe (full-height orange edge) around each scene start
    match = []
    for sc in tl["scenes"][1:]:
        cov = wipe_frames(video, sc["start"])
        best_t, best_c = max(cov, key=lambda x: x[1]) if cov else (None, 0.0)
        # centre of the run of frames where the edge spans >=80 % of rows (the HUD hides the top rows)
        run = [t for t, c in cov if c >= 0.8]
        baseline = min(c for _, c in cov) if cov else 0.0  # frames before/after the wipe
        centre = (run[0] + run[-1]) / 2 if run else best_t
        match.append({"scene": sc["id"], "timeline_start": sc["start"], "wipe_centre": None if centre is None else round(centre, 3),
                      "delta_s": None if centre is None or best_c < 0.8 else round(centre - sc["start"], 3),
                      "edge_row_coverage": round(best_c, 2), "baseline_coverage": round(baseline, 2)})
    rep["scene_transitions"] = match
    bad = [m for m in match if m["delta_s"] is None or abs(m["delta_s"]) > 0.2]
    if bad:
        rep["problems"].append(f"{len(bad)} scene change(s) where the picture transition is not within ±0.2 s of the narration timeline")

    # 4. intelligibility through the final mix
    if a.asr:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from asr_check import model, wer
        a16 = decode_audio(video, 16000)
        segs, _ = model().transcribe(a16, language="en", beam_size=5)
        hyp = " ".join(s.text.strip() for s in segs)
        script = " ".join(g["text"] for sc in tl["scenes"] for g in sc["segments"])
        rep["intelligibility"] = {"wer_final_mix": wer(script, hyp)}
        dry = output_dir(a.episode) / "audio" / "narration" / "asr_report.json"
        if dry.exists():
            rep["intelligibility"]["weighted_wer_dry_narration"] = json.loads(dry.read_text())["weighted_wer"]

    rep["ok"] = not rep["problems"]
    write_json(ROOT / "diagnostics" / f"av_check_{video.stem}.json", rep)
    print(json.dumps(rep, indent=1))
    sys.exit(0 if rep["ok"] else 3)


if __name__ == "__main__":
    main()
