"""Turnaround + expression test renders of the Passenger (character QA).
blender -b --python blender/test_turnaround.py -- <outdir> [samples] [pct]"""
import math
import sys
import time
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).parent))
import hl_char as C  # noqa: E402
import hl_render as R  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = Path(argv[0] if argv else "/tmp/hl_turn")
samples = int(argv[1]) if len(argv) > 1 else 32
pct = int(argv[2]) if len(argv) > 2 else 50
what = argv[3] if len(argv) > 3 else "turn"
out.mkdir(parents=True, exist_ok=True)

R.reset()
R.cycles(samples=samples, pct=pct)
bpy.context.scene.view_settings.exposure = float(argv[4]) if len(argv) > 4 else 0.0
R.sky(sun_elev=5, sun_rot=150, strength=0.35)
R.sun_light("Key", rot_deg=(80, 0, 130), power=2.2)
R.area_light("Fill", (-3, -3, 2.5), (0, 0, 1.0), power=250, size=3, color=(0.7, 0.8, 1.0))
R.area_light("Rim", (2, 3, 2.5), (0, 0, 1.2), power=400, size=2, color=(1.0, 0.7, 0.45))
R.ground(color=(0.08, 0.075, 0.07), rough=0.45)
cam_dist = 5.2
rig, parts = C.build()
face = parts["face"]
cam = R.camera((0, -5.2, 1.0), (0, 0, 0.88), lens=50)

if what == "turn":
    C.apply_pose(rig, C.POSES["stand"])
    C.apply_expression(face, "neutral")
    for i, yaw in enumerate([0, 35, 90, 180, -35, -90]):
        rig.rotation_euler = (0, 0, math.radians(yaw))
        bpy.context.scene.render.filepath = str(out / f"turn_{i}_{yaw}.png")
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print("RENDER", i, round(time.time() - t, 1), "s")
elif what == "faces":
    C.apply_pose(rig, C.POSES["stand"])
    cam.location = (0, -2.0, 1.62)
    R.look_at(cam, (0, 0, 1.6))
    for name in C.EXPRESSIONS:
        C.apply_expression(face, name)
        bpy.context.scene.render.filepath = str(out / f"face_{name}.png")
        bpy.ops.render.render(write_still=True)
else:
    for name in what.split(","):
        C.apply_pose(rig, C.POSES[name])
        rig.rotation_euler = (0, 0, math.radians(25))
        C.apply_expression(face, "curious")
        bpy.context.scene.render.filepath = str(out / f"pose_{name}.png")
        bpy.ops.render.render(write_still=True)
