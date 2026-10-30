"""Episode 004 thumbnail plates (1280x720, Cycles): the text is added by Remotion (src/scenes/ep004/Thumbnail.tsx).
  blender -b --factory-startup --python blender/render_thumbs.py -- [A|B|all]
Output: output/episode-004/thumbnails/plate_A.png, plate_B.png
"""
import math
import sys
from pathlib import Path

import bpy

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import hl_anim as A  # noqa: E402
import hl_char as C  # noqa: E402
import hl_render as R  # noqa: E402
import hl_sets as S  # noqa: E402

OUT = HERE.parent / "output" / "episode-004" / "thumbnails"
OUT.mkdir(parents=True, exist_ok=True)
which = (sys.argv[sys.argv.index("--") + 1:] or ["all"])[0] if "--" in sys.argv else "all"


def setup():
    R.reset()
    sc = R.cycles(samples=96, w=1280, h=720)
    S.col(S.STATIC)
    S.col(S.DYNAMIC)
    return sc


def crisp_tail():
    """Fin and winglets without subdivision, as in the shots (subdivided, their 4-point sections round into leaves)."""
    for o in bpy.data.objects:
        if (o.name.endswith("_fin") or "_winglet" in o.name) and "Sub" in o.modifiers:
            o.modifiers.remove(o.modifiers["Sub"])


def plate_a():
    """Close-up: wide-eyed surprise at the terminal glass, aircraft and sunset behind."""
    sc = setup()
    S.terminal(board=False)
    R.golden(az=15, elev=4, sun_power=3.6, sky_strength=0.45, fill=False)
    R.area_light("Key", (1.8, 0.8, 2.6), (-0.6, 3.6, 1.4), power=500, size=2.5, color=(1.0, 0.86, 0.72))
    crisp_tail()
    rig, parts = C.build("Passenger")
    a = A.Acting(rig, parts["face"])
    a.place(0, (-0.6, 3.6), yaw=-20)  # yaw 0 faces -Y: three-quarter toward the camera, the glass behind
    a.pose(0, "surprised")
    a.expr(0, "surprised")
    a.look(0, (1.6, -0.9, 1.65))
    a.apply_frame(0, key=False)
    R.camera((1.3, -0.6, 1.62), (-0.2, 3.4, 1.5), lens=40)
    sc.render.filepath = str(OUT / "plate_A.png")
    bpy.ops.render.render(write_still=True)


def plate_b():
    """Wide: the passenger points up at a big aircraft against the setting sun."""
    sc = setup()
    S.ground_tarmac()
    S.skyline(y0=230, seed=2)
    S.airliner("Plane", (0, 0, 0), yaw=0)
    crisp_tail()
    R.golden(az=40, elev=3.0, sun_power=3.4, sky_strength=0.5, lamp_elev=7)
    R.area_light("Key", (12, -16, 3), (8.6, -11, 1.2), power=900, size=3, color=(1.0, 0.85, 0.7))
    rig, parts = C.build("Passenger")
    a = A.Acting(rig, parts["face"])
    a.place(0, (8.6, -11.0), yaw=-15)  # facing the camera, the aircraft behind
    a.pose(0, "cheer")
    a.expr(0, "excited")
    a.look(0, (10.5, -15.5, 1.6))
    a.apply_frame(0, key=False)
    R.camera((10.5, -15.5, 1.0), (5.5, -3.0, 2.7), lens=24)
    sc.render.filepath = str(OUT / "plate_B.png")
    bpy.ops.render.render(write_still=True)


if which in ("A", "all"):
    plate_a()
if which in ("B", "all"):
    plate_b()
