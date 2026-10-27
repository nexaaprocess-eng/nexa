"""One-pass technical scan of a delivery file: full decode + black/freeze/silence detection + loudness + clipping.

Decodes every video frame and audio sample once (ffmpeg -f null) with:
  video: blackdetect (>=0.5 s, luma < 10%), freezedetect (>=3 s, -60 dB)
  audio: silencedetect (-50 dB, >=1.5 s), ebur128 (integrated, LRA, true peak), astats (sample peak -> clipping)
Decode errors are anything ffmpeg prints at level "error". Writes diagnostics/final_scan_<video>.json.
Usage: python python/final_scan.py --video output/.../file.mp4
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    a = ap.parse_args()
    video = Path(a.video) if Path(a.video).is_absolute() else ROOT / a.video
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-v", "info", "-i", str(video),
           "-filter_complex", "[0:v]blackdetect=d=0.5:pic_th=0.98:pix_th=0.10,freezedetect=n=-60dB:d=3[v];"
                              "[0:a]silencedetect=n=-50dB:d=1.5,ebur128=peak=true,astats=metadata=0:reset=0[a]",
           "-map", "[v]", "-map", "[a]", "-f", "null", "-"]
    p = subprocess.run(cmd, capture_output=True, text=True)
    log = p.stderr
    errors = [l for l in log.splitlines() if re.search(r"\b(error|corrupt|invalid|non-existing)\b", l, re.I)]
    black = [(float(s), float(e)) for s, e in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", log)]
    freeze = re.findall(r"freeze_start: ([\d.]+)", log)
    silence = [(float(s), float(e)) for s, e in zip(re.findall(r"silence_start: ([\d.]+)", log), re.findall(r"silence_end: ([\d.]+)", log))]
    summ = log[log.rfind("Summary:"):]
    num = lambda pat, txt: float(m.group(1)) if (m := re.search(pat, txt)) else None
    rep = {
        "video": str(video.relative_to(ROOT)) if video.is_relative_to(ROOT) else str(video),
        "ffmpeg_exit": p.returncode,
        "decode_errors": errors[:20],
        "decode_error_count": len(errors),
        "black_windows": [{"start": s, "end": e, "seconds": round(e - s, 2)} for s, e in black],
        "freeze_starts": [float(x) for x in freeze],
        "silences": [{"start": s, "end": e, "seconds": round(e - s, 2)} for s, e in silence],
        "integrated_lufs": num(r"I:\s+(-?[\d.]+) LUFS", summ),
        "lra_lu": num(r"LRA:\s+(-?[\d.]+) LU", summ),
        "true_peak_dbtp": num(r"Peak:\s+(-?[\d.]+) dBFS", summ),
        "sample_peak_db": max((float(x) for x in re.findall(r"Peak level dB: (-?[\d.]+|-inf)", log) if x != "-inf"), default=None),
    }
    # clipping = decoded sample peak at, or within 0.1 dB of, full scale
    rep["clipping"] = rep["sample_peak_db"] is not None and rep["sample_peak_db"] >= -0.1
    rep["pass"] = (p.returncode == 0 and not errors and not rep["freeze_starts"] and not rep["silences"] and not rep["clipping"]
                   and rep["true_peak_dbtp"] is not None and rep["true_peak_dbtp"] <= -1.5
                   and rep["integrated_lufs"] is not None and -16.5 <= rep["integrated_lufs"] <= -13.5)
    out = ROOT / "diagnostics" / f"final_scan_{video.stem}.json"
    out.write_text(json.dumps(rep, indent=2))
    print(json.dumps({k: v for k, v in rep.items() if k not in ("decode_errors",)}, indent=1))


if __name__ == "__main__":
    main()
