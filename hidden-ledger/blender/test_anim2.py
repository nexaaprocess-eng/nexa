"""V2 animation test: walk in, stop, turn to camera, present, react, turn away and walk off. Renders a strip of
frames and writes validation numbers (foot sliding, IK reach) to output/char2/anim_report.json.

  blender -b --factory-startup --python blender/test_anim2.py -- [--frames 0,10,20] [--pct 40] [--out dir]
"""
import json
import math
import sys
from pathlib import Path

import bpy

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import hl_anim2 as A  # noqa: E402
import hl_char2 as C  # noqa: E402
import hl_render as R  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(k, d):
    return argv[argv.index(k) + 1] if k in argv else d
out = Path(arg("--out", str(HERE.parent / "output" / "char2" / "anim")))
out.mkdir(parents=True, exist_ok=True)
frames = [int(x) for x in arg("--frames", "0,20,30,40,50,60,70,80").split(",")]
pct = int(arg("--pct", "40"))

R.reset()
sc = R.cycles(samples=int(arg("--spp", "12")), w=1920, h=1080, pct=pct)
R.flat_world((0.55, 0.52, 0.48), 0.6)
R.ground(size=40, color=(0.62, 0.58, 0.53), name="Floor")
R.area_light("Key", (2.5, -4, 4), (0, 0, 1), power=900, size=3, color=(1.0, 0.92, 0.82))
R.area_light("Rim", (-3, 3, 3), (0, 0, 1.2), power=500, size=2, color=(0.8, 0.88, 1.0))
rig, parts = C.build("Hero")
a = A.Actor(rig, parts)
a.place((-3.2, 0.3), yaw=90)
a.expr(0, "tired")
a.pose(0, "tired")
e = a.walk(6, [(-1.6, 0.1), (0, 0)], speed=0.95, end_yaw=90)
a.look(e - 10, (2.5, 0.0, 1.2))
t = a.turn(e + 4, 0)
a.look(t - 6, (0, -5, 1.5))
a.pose(t + 4, "present", ease=16)
a.expr(t + 8, "curious")
a.expr(t + 34, "surprised", ease=4)
a.pose(t + 34, "surprised", ease=8, back=True)
a.expr(t + 60, "confused")
a.pose(t + 60, "scratch", ease=16)
a.pose(t + 96, "stand", ease=16)
a.expr(t + 96, "frustrated")
t2 = a.turn(t + 108, 120)
a.look(t2 - 4, None)
a.pose(t2, "tired")
e2 = a.walk(t2 + 2, [(1.5, 1.2), (3.0, 2.5)], speed=0.9)
N = e2 + 20
a.bake(N)
R.camera((0.6, -6.0, 1.15), (-0.2, 0, 0.9), lens=40)
sc.frame_start, sc.frame_end = 0, N - 1
# validation: stance-foot sliding (planted feet should not move) and how far the IK misses the foot target
rep = {"frames": N, "slide_mm_max": 0.0, "ik_miss_mm_max": 0.0}
prev = {}
for f in range(N):
    sc.frame_set(f)
    for s in ("L", "R"):
        pb = rig.pose.bones[f"foot.{s}"]
        ik = rig.pose.bones[f"ik_foot.{s}"]
        miss = (pb.head - ik.head).length * 1000
        rep["ik_miss_mm_max"] = max(rep["ik_miss_mm_max"], round(miss, 2))
        toe = rig.matrix_world @ pb.tail
        heel = rig.matrix_world @ pb.head
        phase = a.log[f]["feet"][s][1]
        if s in prev and phase == "stance" and prev[s][2] == "stance":
            # a planted foot may roll (heel/toe), but its lowest contact point must not travel
            lo_now = toe if toe.z < heel.z else heel
            lo_prev = prev[s][0] if prev[s][0].z < prev[s][1].z else prev[s][1]
            d = ((lo_now.xy - lo_prev.xy).length) * 1000 if min(toe.z, heel.z) < 0.05 else 0
            rep["slide_mm_max"] = max(rep["slide_mm_max"], round(d, 2))
        prev[s] = (toe, heel, phase)
(out / "report.json").write_text(json.dumps(rep, indent=1))
print("REPORT", json.dumps(rep))
for f in frames:
    if f >= N:
        continue
    sc.frame_set(f)
    sc.render.filepath = str(out / f"f{f:04d}.png")
    bpy.ops.render.render(write_still=True)
if "--close" in argv:
    pb = rig.pose.bones
    cam = R.camera((0, -4.6, 1.0), (0, 0, 0.85), lens=45)
    cam2 = R.camera((0, -4.6, 1.0), (0, 0, 0.85), lens=45)
    sc.render.resolution_percentage = 40
    for f in [int(x) for x in arg("--close", "40").split(",")]:
        sc.frame_set(f)
        hip = rig.matrix_world @ pb["hips"].head
        for tag, c, off in (("side", cam, (0.0, -4.4, 0.15)), ("front", cam2, (4.4, 0.0, 0.15))):
            c.location = (hip.x + off[0], hip.y + off[1], hip.z + off[2])
            R.look_at(c, (hip.x, hip.y, hip.z))
            sc.camera = c
            sc.render.filepath = str(out / f"{tag}{f:04d}.png")
            bpy.ops.render.render(write_still=True)
