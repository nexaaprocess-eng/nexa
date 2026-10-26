"""Verify the real deliverables on disk: durations, codecs, resolution, audio tracks, loudness,
frame samples, subtitles, fonts and licence records. Writes diagnostics/verify.json + a contact sheet.

Usage: python python/verify.py --episode 001
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, episode_dir, output_dir, write_json  # noqa: E402


def probe(p: Path) -> dict:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
                        "-of", "json", str(p)], capture_output=True, text=True)
    return json.loads(r.stdout or "{}")


def loudness(p: Path) -> dict:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"],
                       capture_output=True, text=True)
    s = r.stderr[r.stderr.rfind("Summary:"):]
    g = lambda pat: float(m.group(1)) if (m := re.search(pat, s)) else None  # noqa: E731
    return {"integrated_lufs": g(r"I:\s+(-?[\d.]+) LUFS"), "true_peak_dbfs": g(r"Peak:\s+(-?[\d.]+) dBFS"), "lra": g(r"LRA:\s+(-?[\d.]+) LU")}


def video_entry(p: Path, min_d: float, max_d: float, want_w: int | None = None) -> dict:
    if not p.exists():
        return {"file": str(p.relative_to(ROOT)), "exists": False, "ok": False}
    info = probe(p)
    v = next((s for s in info.get("streams", []) if s["codec_type"] == "video"), None)
    a = next((s for s in info.get("streams", []) if s["codec_type"] == "audio"), None)
    d = float(info["format"]["duration"])
    e = {"file": str(p.relative_to(ROOT)), "exists": True, "duration_s": round(d, 2), "size_mb": round(int(info["format"]["size"]) / 1e6, 1),
         "video": v and f"{v['codec_name']} {v['width']}x{v['height']} @ {v['r_frame_rate']}",
         "audio": a and f"{a['codec_name']} {a['sample_rate']} Hz {a['channels']}ch", **loudness(p)}
    problems = []
    if not v or v["codec_name"] != "h264":
        problems.append("video is not H.264")
    if not a or a["codec_name"] != "aac":
        problems.append("audio is not AAC")
    if not (min_d <= d <= max_d):
        problems.append(f"duration {d:.1f}s outside {min_d}-{max_d}s")
    if want_w and v and v["width"] != want_w:
        problems.append(f"width {v['width']} != {want_w}")
    if e["true_peak_dbfs"] is not None and e["true_peak_dbfs"] > -1.0:
        problems.append("true peak above -1 dBFS")
    e["problems"] = problems
    e["ok"] = not problems
    return e


def contact_sheet(video: Path, dest: Path, n: int = 12) -> str | None:
    info = probe(video)
    d = float(info["format"]["duration"])
    fps_expr = f"{n}/{d:.3f}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(video), "-vf",
                        f"fps={fps_expr},scale=480:-1,tile=4x3:padding=4", "-frames:v", "1", str(dest)], capture_output=True, text=True)
    return str(dest.relative_to(ROOT)) if r.returncode == 0 else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="001")
    a = ap.parse_args()
    out = output_dir(a.episode)
    ed = episode_dir(a.episode)
    rep = {"videos": [], "audio": [], "files": {}, "licences": {}, "summary": []}

    rep["videos"].append(video_entry(out / "preview" / "pilot.mp4", 60, 90))
    rep["videos"].append(video_entry(out / "full" / "full_video.mp4", 400, 660, 1920))
    for s in sorted((out / "shorts").glob("short_*.mp4")):
        rep["videos"].append(video_entry(s, 10, 60, 1080))

    for w in sorted((out / "audio" / "voices").glob("voice_*.wav")):
        info = probe(w)
        rep["audio"].append({"file": str(w.relative_to(ROOT)), "duration_s": round(float(info["format"]["duration"]), 2)})
    for name in ("pilot", "full"):
        p = out / "audio" / name / "audio_report.json"
        if p.exists():
            r = json.loads(p.read_text())
            rep["audio"].append({"mix": name, **{k: r[k] for k in ("duration", "integrated_lufs", "true_peak_dbtp", "clipped_samples", "music_source", "sfx_events")}})
    for w in sorted((ROOT / "assets" / "music" / "generated").glob("*.wav")) + sorted((ROOT / "assets" / "sfx").glob("*.wav")):
        rep["audio"].append({"file": str(w.relative_to(ROOT)), "duration_s": round(float(probe(w)["format"]["duration"]), 2)})

    expected = [ed / f for f in ("script_en.md", "script_review_es.md", "sources.md", "fact_check.csv", "claims.json", "storyboard.json",
                                 "episode.json", "youtube_description.md", "titles_thumbnails.md")]
    expected += [out / "preview" / "pilot.srt", out / "full" / "full_video.en.srt", out / "audio" / "voices" / "voice_comparison.md",
                 ROOT / "README.md", ROOT / "LICENSE_NOTES.md", ROOT / "asset_licenses.csv", ROOT / "audio_provenance.md", ROOT / "publishing_checklist.md"]
    expected += [out / "thumbnails" / f"thumbnail_{i}.png" for i in (1, 2, 3)]
    for f in expected:
        rep["files"][str(f.relative_to(ROOT))] = f.exists() and f.stat().st_size > 0

    fonts = sorted(p.name for p in (ROOT / "assets" / "fonts").glob("*"))
    rep["licences"]["fonts"] = fonts
    lic = ROOT / "asset_licenses.csv"
    if lic.exists():
        with open(lic, newline="", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        rep["licences"]["asset_licenses_rows"] = len(rows)
        rep["licences"]["unknown_licence_rows"] = [r["asset"] for r in rows if not r.get("license") or "unknown" in r["license"].lower()]

    full = out / "full" / "full_video.mp4"
    if full.exists():
        rep["contact_sheet"] = contact_sheet(full, ROOT / "diagnostics" / "screenshots" / "full_contact_sheet.jpg")
    pilot = out / "preview" / "pilot.mp4"
    if pilot.exists():
        rep["pilot_contact_sheet"] = contact_sheet(pilot, ROOT / "diagnostics" / "screenshots" / "pilot_contact_sheet.jpg")

    for v in rep["videos"]:
        flag = "OK " if v["ok"] else "!! "
        rep["summary"].append(f"{flag}{v['file']}: " + (f"{v['duration_s']}s {v['video']} | {v['audio']} | {v['integrated_lufs']} LUFS, TP {v['true_peak_dbfs']} dBFS" + (f" | {v['problems']}" if v["problems"] else "") if v["exists"] else "MISSING"))
    missing = [k for k, ok in rep["files"].items() if not ok]
    rep["summary"].append("files: all present" if not missing else f"files missing: {missing}")
    write_json(ROOT / "diagnostics" / "verify.json", rep)
    print("\n".join(rep["summary"]))
    for x in rep["audio"]:
        print("  audio", x)
    sys.exit(0 if all(v["ok"] for v in rep["videos"] if v["file"].endswith(("pilot.mp4", "full_video.mp4"))) and not missing else 1)


if __name__ == "__main__":
    main()
