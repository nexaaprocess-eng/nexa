"""Near-empty-frame detector for the dark brand palette (replaces blackdetect, which flags every dark frame).

Samples the video at --fps (default 2) at 480x270, ignores the HUD band (top) and the subtitle band (bottom),
and measures the fraction of pixels that are clearly brighter than the background. Runs of frames below
--min-fraction lasting --min-run seconds or more are reported as possible "empty screen" moments.
Usage: python python/content_check.py --video output/.../file.mp4 [--fps 2]
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
W, H = 480, 270


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--fps", type=float, default=2.0)
    ap.add_argument("--min-fraction", type=float, default=0.006)
    ap.add_argument("--min-run", type=float, default=1.0)
    ap.add_argument("--luma", type=int, default=60, help="pixel counts as content above this luma (bg ≈ 20)")
    a = ap.parse_args()
    video = (ROOT / a.video) if not Path(a.video).is_absolute() else Path(a.video)
    cmd = ["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps={a.fps},scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
    top, bottom = int(H * 112 / 1080), int(H * 880 / 1080)  # HUD above, subtitles below
    core = frames[:, top:bottom, :]
    frac = (core > a.luma).mean(axis=(1, 2))
    low = frac < a.min_fraction
    runs, start = [], None
    for i, v in enumerate(np.append(low, False)):
        if v and start is None:
            start = i
        elif not v and start is not None:
            dur = (i - start) / a.fps
            if dur >= a.min_run:
                runs.append({"start": round(start / a.fps, 2), "end": round(i / a.fps, 2), "seconds": round(dur, 2), "min_fraction": round(float(frac[start:i].min()), 4)})
            start = None
    report = {"video": str(video.relative_to(ROOT)) if video.is_relative_to(ROOT) else str(video), "samples": int(len(frac)), "fps": a.fps,
              "median_content_fraction": round(float(np.median(frac)), 4), "p5_content_fraction": round(float(np.percentile(frac, 5)), 4),
              "near_empty_runs": runs, "pass": not runs}
    out = ROOT / "diagnostics" / f"content_check_{video.stem}.json"
    out.write_text(json.dumps(report, indent=2))
    print(json.dumps({k: report[k] for k in ("samples", "median_content_fraction", "p5_content_fraction", "pass")}), f"{len(runs)} near-empty run(s)")
    for r in runs:
        print(f"   near-empty {r['start']:.1f}–{r['end']:.1f} s ({r['seconds']} s)")


if __name__ == "__main__":
    main()
