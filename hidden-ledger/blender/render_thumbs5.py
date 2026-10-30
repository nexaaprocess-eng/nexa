"""Episode 005 thumbnail plates (1280x720): A = shocked at the reception desk, the clerk apologising;
B = the confirmed booking held up in front of a fully booked hotel. Text is added by Remotion (Thumbnail, episode 005).

  blender -b --factory-startup --python blender/render_thumbs5.py
"""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / "shots"))
import hl_anim2 as A  # noqa: E402
import hl_char2 as C  # noqa: E402
import hl_hotel as H  # noqa: E402
import hl_render as R  # noqa: E402
import hl_sets as S  # noqa: E402
import ep005 as E  # noqa: E402

OUT = HERE.parent / "assets" / "thumbs"
OUT.mkdir(parents=True, exist_ok=True)


def actor(name, style, xy, yaw, seed=1):
    rig, parts = C.build(name, style, parent_col=S.col(S.DYNAMIC))
    a = A.Actor(rig, parts, seed=seed)
    a.place(xy, yaw=yaw)
    a._auto_blinks = []  # a still: never caught mid-blink
    return a


def render(path, cam):
    sc = bpy.context.scene
    sc.camera = cam
    sc.frame_set(39)
    sc.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


ONLY = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "AB"

# ---------------------------------------------------------------- A
if "A" in ONLY:  # noqa: E701
  R.reset()
  sc = R.cycles(samples=64, w=1280, h=720)
  S.col(S.STATIC)
  S.col(S.DYNAMIC)
  H.lobby()
  H.lobby_lights(0.55)
  R.area_light("HeroKey", (-1.4, -1.2, 2.2), (0.0, 0.5, 1.4), power=260, size=1.5, color=(1.0, 0.9, 0.8))
  h = actor("Hero", "hero", (0.05, 0.46), 205)
  ph = H.phone()
  h.attach(0, "L", ph, E.PHONE_L)
  h.pose(0, {"spine": (-3, 0, 0), "chest": (-6, 0, 0), "head": (-6, 0, 4), "handL": (0.10, 0.22, -0.18), "handR": (0.14, 0.16, -0.12),
             "poleL": (0.6, -0.4, -0.6), "poleR": (0.6, -0.4, -0.6)}, ease=1)
  h.expr(0, "surprised", ease=1)
  h.look(0, (-2.2, -1.4, 1.45))
  c = actor("Clerk", "clerk", E.CLERK_XY, 10, seed=5)
  c.pose(0, {"handL": (0.08, 0.30, -0.24), "handR": (0.08, 0.30, -0.24), "poleL": (0.6, -0.3, -0.8), "poleR": (0.6, -0.3, -0.8)}, ease=1)
  c.expr(0, "sorry", ease=1)
  c.look(0, (0.05, 0.46, 1.5))
  h.bake(40)
  c.bake(40)
  render(OUT / "ep005_plate_A.png", R.camera((-2.0, -1.2, 1.42), (0.35, 0.9, 1.38), lens=38))

# ---------------------------------------------------------------- B
if "B" not in ONLY:
    sys.exit(0)
R.reset()
sc = R.cycles(samples=64, w=1280, h=720)
S.col(S.STATIC)
S.col(S.DYNAMIC)
H.street(lit=1.0, seed=8)
H.street_lights()
red = S.emissive("novacancy", (1.0, 0.16, 0.10, 1), 9.0)
H.text("NoVacancy", "NO VACANCY", (2.6, -2.45, 3.0), size=0.36, mat=red, extrude=0.03)
R.area_light("HeroKeyB", (-1.8, -7.4, 1.9), (-0.55, -5.75, 1.3), power=360, size=1.6, color=(1.0, 0.88, 0.75))
h = actor("Hero", "hero", (-0.55, -5.75), 15)
ph = H.phone(glow=(0.82, 1.0, 0.86, 1))
h.attach(0, "R", ph, Matrix.Translation((0.0, 0.075, -0.022)) @ Matrix.Rotation(math.radians(90), 4, "X"))
h.pose(0, {"handR": (-0.06, 0.38, -0.12), "poleR": (0.7, -0.1, -0.6), "chest": (-2, -6, 0), "head": (2, 0, -5)}, ease=1)
h.expr(0, "worried", ease=1)
h.look(0, (-1.1, -7.9, 1.1))
h.bake(40)
cam = R.camera((-1.1, -7.9, 0.95), (0.1, -3.2, 2.7), lens=22)
# a still: the phone is posed in world space, screen square to the camera and a little larger so it reads at thumbnail size
bpy.context.scene.frame_set(39)
hand = h.rig.matrix_world @ h.rig.pose.bones["hand.R"].matrix
pos = hand @ Vector((0.0, 0.08, 0.0))
d = (cam.location - pos).normalized()
ph.animation_data_clear()
ph.matrix_world = Matrix.Translation(pos) @ Matrix.Rotation(math.atan2(d.x, -d.y), 4, "Z") @ Matrix.Rotation(math.radians(8), 4, "X") @ Matrix.Scale(1.5, 4)
render(OUT / "ep005_plate_B.png", cam)
