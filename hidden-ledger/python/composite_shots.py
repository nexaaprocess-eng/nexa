"""Composite rendered 3D shots (plate + character layer) into frame-exact videos and write the shot manifest.

  python python/composite_shots.py --episode 004 [--only sh01,sh02]

For each output/episode-XXX/shots/<id>/ with a meta.json and plate.png:
  shot.mp4 = plate (still) + char/NNNN.png overlaid at the crop offset, each character frame held for `step` frames,
             exactly meta.frames frames at 30 fps (H.264 CRF 12, GOP 30 so Remotion can seek fast).
Re-encodes only when the plate, a character frame or meta.json is newer than shot.mp4.
Writes output/episode-XXX/shots/manifest.json ({id: meta + file}) — the Episode composition reads it via props.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, output_dir  # noqa: E402


def newest(paths):
    return max((p.stat().st_mtime for p in paths if p.exists()), default=0)


def composite(d: Path, meta: dict) -> Path:
    out = d / "shot.mp4"
    plate = d / "plate.png"
    chars = sorted((d / "char").glob("*.png")) if (d / "char").exists() else []
    if out.exists() and meta.get("composited_hash") == meta.get("hash"):
        return out  # verified earlier; its character frames may already be deleted to save disk
    if out.exists() and out.stat().st_mtime > newest([plate, d / "meta.json", *chars]):
        return out
    n, step, fps = meta["frames"], meta["step"], 30
    tmp = d / "shot.partial.mp4"
    enc = ["-c:v", "libx264", "-preset", "medium", "-crf", "12", "-g", "30", "-pix_fmt", "yuv420p", "-r", "30", "-frames:v", str(n), "-movflags", "+faststart"]
    if chars and meta.get("crop"):
        x, y, cw, ch = meta["crop"]
        lst = d / "char_list.txt"
        frames = {int(p.stem): p for p in chars}
        lines = []
        expected = list(range(0, n, step))
        last = None
        for f in expected:
            p = frames.get(f) or last
            if p is None:
                raise SystemExit(f"{d.name}: character frame {f} missing (render the shot first)")
            last = p
            lines += [f"file '{p.as_posix()}'", f"duration {step / fps:.6f}"]
        lines.append(f"file '{last.as_posix()}'")
        lst.write_text("\n".join(lines) + "\n")
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-loop", "1", "-framerate", "30", "-i", str(plate),
               "-f", "concat", "-safe", "0", "-i", str(lst),
               # character frames rendered below 100% (big crops) are scaled back to the crop size (Lanczos)
               # premultiply BEFORE scaling: scaling straight alpha bleeds the black of transparent pixels into the
               # edges (a dark fringe around the character); overlay then treats the layer as premultiplied
               "-filter_complex", f"[1:v]fps=30,format=rgba,premultiply=inplace=1,scale={cw}:{ch}:flags=lanczos[c];"
                                  f"[0:v][c]overlay={x}:{y}:alpha=premultiplied:eof_action=repeat:format=auto,format=yuv420p[v]",
               "-map", "[v]", *enc, str(tmp)]
    else:
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-loop", "1", "-framerate", "30", "-i", str(plate), *enc, str(tmp)]
    subprocess.run(cmd, check=True)
    got = int(subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets",
                              "-of", "csv=p=0", str(tmp)], capture_output=True, text=True).stdout.strip() or 0)
    if got != n:
        raise SystemExit(f"{d.name}: composited {got} frames, expected {n}")
    tmp.replace(out)
    print(f"composited {d.name}: {n} frames")
    # mark done (same hash as the rendered layer) and free the disk: ~1.2 MB per character frame
    meta["composited_hash"] = meta.get("hash")
    (d / "meta.json").write_text(json.dumps(meta, indent=1))
    for p in chars:
        p.unlink()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", required=True)
    ap.add_argument("--only")
    a = ap.parse_args()
    base = output_dir(a.episode) / "shots"
    only = set(a.only.split(",")) if a.only else None
    manifest = {}
    missing = []
    for d in sorted(p for p in base.iterdir() if p.is_dir()):
        mp = d / "meta.json"
        if not mp.exists() or not (d / "plate.png").exists():
            missing.append(d.name)
            continue
        meta = json.loads(mp.read_text())
        if not only or d.name in only:
            composite(d, meta)
        if (d / "shot.mp4").exists():
            meta["file"] = (d / "shot.mp4").relative_to(ROOT).as_posix()
            manifest[d.name] = meta
    (base / "manifest.json").write_text(json.dumps(manifest, indent=1))
    print(f"manifest: {len(manifest)} shots" + (f"; not rendered yet: {', '.join(missing)}" if missing else ""))


if __name__ == "__main__":
    main()
