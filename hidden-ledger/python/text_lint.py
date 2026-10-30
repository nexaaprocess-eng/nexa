"""Flag on-screen text that may be too small for a phone (default: under 26 px at 1080p).

Checks HTML text in scene/component TSX: `fontSize: N`, `fontSize={N}` and `size={N}` on Title/Body/Chip.
SVG <text> inside a scaled <g> is reported separately as "svg" (its on-screen size depends on the scale).
Usage: python python/text_lint.py [--min 26] [paths...]
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAT = re.compile(r"(fontSize[:=]\s*\{?\s*(\d+(?:\.\d+)?)\b)|(<(?:Title|Body|Chip)\b[^>]*\bsize=\{(\d+)\})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--min", type=float, default=26)
    ap.add_argument("paths", nargs="*", default=["src/scenes", "src/components", "src/compositions"])
    a = ap.parse_args()
    html, svg = [], []
    for base in a.paths:
        for f in sorted((ROOT / base).rglob("*.tsx")):
            for n, line in enumerate(f.read_text().splitlines(), 1):
                for m in PAT.finditer(line):
                    v = float(m.group(2) or m.group(4))
                    if v < a.min:
                        rec = f"{f.relative_to(ROOT)}:{n}: {v:g}px  {line.strip()[:110]}"
                        (svg if "<text" in line or "label(" in line or "fontSize={" in line else html).append(rec)
    for r in html:
        print("HTML", r)
    for r in svg:
        print("svg ", r)
    print(f"{len(html)} HTML text size(s) under {a.min:g}px; {len(svg)} SVG size(s) to check against their group scale")
    raise SystemExit(1 if html else 0)


if __name__ == "__main__":
    main()
