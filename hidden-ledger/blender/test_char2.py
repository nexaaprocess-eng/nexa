"""QA sheet for the V2 character: turnaround + expressions.

  blender -b --factory-startup --python blender/test_char2.py -- --out output/char2/turnaround.png [--mode turn|faces]
"""
import math
import sys
from pathlib import Path

import bpy

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import hl_char2 as C  # noqa: E402
import hl_render as R  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = argv[argv.index("--out") + 1] if "--out" in argv else str(HERE.parent / "output" / "char2" / "turnaround.png")
mode = argv[argv.index("--mode") + 1] if "--mode" in argv else "turn"
Path(out).parent.mkdir(parents=True, exist_ok=True)

R.reset()
sc = R.cycles(samples=24, w=1600, h=900)
R.flat_world((0.55, 0.52, 0.48), 0.6)
R.ground(size=40, color=(0.62, 0.58, 0.53), name="Floor")
R.area_light("Key", (2.5, -4, 4), (0, 0, 1), power=900, size=3, color=(1.0, 0.92, 0.82))
R.area_light("Rim", (-3, 3, 3), (0, 0, 1.2), power=500, size=2, color=(0.8, 0.88, 1.0))
if mode == "turn":
    for i, yaw in enumerate((0, 45, 90, 180)):
        rig, parts = C.build(f"T{i}", at=((i - 1.5) * 0.9, 0, 0))
        rig.rotation_euler.z = math.radians(yaw)
    R.camera((0, -6.2, 1.1), (0, 0, 0.85), lens=50)
else:
    rig, parts = C.build("F", at=(0, 0, 0))
    R.camera((0, -1.6, 1.5), (0, 0, 1.45), lens=60)
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
