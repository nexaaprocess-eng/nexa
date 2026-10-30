"""Pose/walk QA sheet for the Passenger rig: blender -b --python blender/test_poses.py -- <outdir>"""
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).parent))
import hl_anim as A  # noqa: E402
import hl_char as C  # noqa: E402
import hl_render as R  # noqa: E402

out = Path(sys.argv[sys.argv.index("--") + 1])
out.mkdir(parents=True, exist_ok=True)
R.reset()
sc = R.cycles(samples=12, pct=30)
R.golden(az=300, elev=12, sun_power=3.0)
R.ground(color=(0.1, 0.09, 0.08), rough=0.5)
rig, parts = C.build()
cam = R.camera((3.2, -4.6, 1.3), (0, 0, 0.95), lens=42)
act = A.Acting(rig, parts["face"])
tests = [("stand", "neutral", None), ("think", "thinking", None), ("point", "curious", None), ("shrug", "confused", None),
         ("phone", "happy", None), ("surprised", "surprised", None), ("sit", "neutral", None), ("hands_in_pocket", "satisfied", None),
         ("stand", "curious", ("yaw", 50, 10)), ("stand", "skeptical", ("yaw", -50, -10))]
for i, (pose, ex, look) in enumerate(tests):
    a = A.Acting(rig, parts["face"])
    a.place(0, (0, 0), yaw=25, z=-0.33 if pose == "sit" else 0)
    a.pose(0, pose)
    a.expr(0, ex)
    a.look(0, look)
    a.apply_frame(0, key=False)
    sc.render.filepath = str(out / f"p{i:02d}_{pose}.png")
    bpy.ops.render.render(write_still=True)
# walk cycle frames
w = A.Acting(rig, parts["face"])
w.walk(0, 120, [(-2, 0), (2, 0)])
for j, f in enumerate((40, 44, 48, 52, 56, 60)):
    w.apply_frame(f, key=False)
    rig.location.x = 0
    sc.render.filepath = str(out / f"w{j}.png")
    bpy.ops.render.render(write_still=True)
