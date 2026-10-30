"""Hidden Ledger protagonist V2 ("the Stickman"), episode 005 onwards: procedural build + IK rig + face.

Design: a minimalist white/ivory mascot. One smooth body (rounded torso, clean arms and legs, no clothes, no
accessories), a round head with tall black eyes, thin brows and a small line mouth, simple rounded hands with a thumb
nub and rounded feet. Recognisable as a silhouette; stylised and non-anatomical.

Rig ("<name>Rig"):
  deform bones   hips > spine > chest > neck > head, upper_arm/forearm/hand, thigh/shin/foot (.L/.R)
  control bones  ik_foot.L/R, pole_knee.L/R, ik_hand.L/R, pole_elbow.L/R (children of root, non-deforming)
  constraints    shin: IK (chain 2) to ik_foot with pole_knee; foot: copy world rotation of ik_foot
                 forearm: IK (chain 2) to ik_hand with pole_elbow; hand: copy rotation of ik_hand.
                 Arm IK influence is animated (0 = FK pose, 1 = hand on a target), legs are always IK, so feet stay
                 exactly where the animation plants them (no sliding by construction).
Face (objects parented to the head bone, driven by hl_anim2):
  eye pivots at the head centre: rotating a pivot slides its eye over the head surface (gaze);
  brows on their own pivots (raise = pivot pitch, angle = brow roll); mouth = curve whose points are re-projected onto
  the head surface every frame (smile/frown/width) + an "o" shape for open mouths.

The body is a skin-modifier graph turned into a real mesh, weighted by distance to the bone segments with a narrow
blend at each joint (clean elbows/knees), then Armature -> Subdivision so it deforms smoothly.
"""
from __future__ import annotations

import math

import bpy
import bmesh
from mathutils import Matrix, Vector

IVORY = (0.92, 0.90, 0.86, 1)
INK = (0.010, 0.010, 0.012, 1)

# --------------------------------------------------------------- proportions (metres, faces -Y, Z up)
HEAD_R = 0.175
HEAD_C = (0, 0, 1.505)          # head centre
J = {
    "root": (0, 0, 0),
    "hips": (0, 0, 0.84),
    "spine": (0, 0.0, 0.97),
    "chest": (0, 0.0, 1.10),
    "neck": (0, 0.0, 1.28),
    "head": (0, 0.0, 1.345),
    "head_top": (0, 0, 1.345 + 0.36),
}
for _s, _x in (("L", 1), ("R", -1)):
    J.update({
        # A-pose arms (about 48 deg below horizontal), elbows slightly back so the IK bends them the human way
        f"shoulder.{_s}": (_x * 0.165, 0.005, 1.235),
        f"elbow.{_s}": (_x * 0.345, 0.03, 1.035),
        f"wrist.{_s}": (_x * 0.505, 0.0, 0.85),
        f"hand_tip.{_s}": (_x * 0.565, -0.01, 0.775),
        f"hip.{_s}": (_x * 0.088, 0.0, 0.84),
        f"knee.{_s}": (_x * 0.092, -0.025, 0.465),
        f"ankle.{_s}": (_x * 0.095, 0.0, 0.085),
        f"toe.{_s}": (_x * 0.095, -0.15, 0.03),
    })
LEG_LEN = (Vector(J["hip.L"]) - Vector(J["knee.L"])).length + (Vector(J["knee.L"]) - Vector(J["ankle.L"])).length
ARM_LEN = (Vector(J["shoulder.L"]) - Vector(J["elbow.L"])).length + (Vector(J["elbow.L"]) - Vector(J["wrist.L"])).length
ANKLE_H = J["ankle.L"][2]       # ankle height above the sole
STAND_HIPS = 0.84               # rest hips height (legs ~ straight)

DEFORM = [
    ("hips", "hips", "spine", None),
    ("spine", "spine", "chest", "hips"),
    ("chest", "chest", "neck", "spine"),
    ("neck", "neck", "head", "chest"),
    ("head", "head", "head_top", "neck"),
]
for _s in ("L", "R"):
    DEFORM += [
        (f"upper_arm.{_s}", f"shoulder.{_s}", f"elbow.{_s}", "chest"),
        (f"forearm.{_s}", f"elbow.{_s}", f"wrist.{_s}", f"upper_arm.{_s}"),
        (f"hand.{_s}", f"wrist.{_s}", f"hand_tip.{_s}", f"forearm.{_s}"),
        (f"thigh.{_s}", f"hip.{_s}", f"knee.{_s}", "hips"),
        (f"shin.{_s}", f"knee.{_s}", f"ankle.{_s}", f"thigh.{_s}"),
        (f"foot.{_s}", f"ankle.{_s}", f"toe.{_s}", f"shin.{_s}"),
    ]

# skin graph: joint -> (radius x, radius y); torso is a soft rounded "bean", limbs taper slightly
SKIN = {
    "hips": (0.132, 0.10), "spine": (0.118, 0.090), "chest": (0.150, 0.102), "neck": (0.046, 0.046),
    "clav": (0.125, 0.088), "neck_top": (0.044, 0.044),
}
for _s in ("L", "R"):
    SKIN.update({
        f"shoulder.{_s}": (0.056, 0.056), f"elbow.{_s}": (0.043, 0.043), f"wrist.{_s}": (0.034, 0.034),
        f"hip.{_s}": (0.080, 0.080), f"knee.{_s}": (0.057, 0.057), f"ankle.{_s}": (0.043, 0.043),
    })
SKIN_EDGES = [("hips", "spine"), ("spine", "chest"), ("chest", "clav"), ("clav", "neck"), ("neck", "neck_top")]
for _s in ("L", "R"):
    SKIN_EDGES += [("clav", f"shoulder.{_s}"), (f"shoulder.{_s}", f"elbow.{_s}"), (f"elbow.{_s}", f"wrist.{_s}"),
                   ("hips", f"hip.{_s}"), (f"hip.{_s}", f"knee.{_s}"), (f"knee.{_s}", f"ankle.{_s}")]
SKIN_POS = dict(J)
SKIN_POS["clav"] = (0, 0.005, 1.215)
SKIN_POS["neck_top"] = (0, 0.0, 1.38)  # the neck runs up into the head: no gap when the head turns
SKIN_POS["hips"] = (0, 0.005, 0.86)


def P(n):
    return Vector(SKIN_POS[n] if n in SKIN_POS else J[n])


# --------------------------------------------------------------- materials
def _mat(name, color, rough=0.45, sss=0.0, coat=0.0, spec=0.5):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Subsurface Weight"].default_value = sss
    if sss:
        b.inputs["Subsurface Radius"].default_value = (0.9, 0.6, 0.45)
        b.inputs["Subsurface Scale"].default_value = 0.02
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.25
    b.inputs["Specular IOR Level"].default_value = spec
    return m


# Other people (receptionist, guests) share the body and rig but never the hero's white: coloured bodies, darker heads
STYLES = {
    "hero": {"body": IVORY, "head": IVORY, "brows": True},
    "clerk": {"body": (0.07, 0.12, 0.20, 1), "head": (0.34, 0.27, 0.22, 1), "brows": True},
    "guest1": {"body": (0.45, 0.19, 0.11, 1), "head": (0.36, 0.30, 0.26, 1), "brows": False},
    "guest2": {"body": (0.22, 0.27, 0.18, 1), "head": (0.52, 0.45, 0.38, 1), "brows": False},
    "guest3": {"body": (0.30, 0.26, 0.36, 1), "head": (0.28, 0.23, 0.20, 1), "brows": False},
}


def materials(style="hero"):
    st = STYLES[style]
    return {
        "body": _mat(f"C2_body_{style}", st["body"], rough=0.42, sss=0.08 if style == "hero" else 0.0, coat=0.15),
        "head": _mat(f"C2_head_{style}", st["head"], rough=0.38, sss=0.08 if style == "hero" else 0.0, coat=0.2),
        "eye": _mat("C2_eye", INK, rough=0.08, coat=1.0, spec=0.8),
        "ink": _mat("C2_ink", INK, rough=0.5),
    }


def _link(o, col):
    col.objects.link(o)
    return o


def _smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True


# --------------------------------------------------------------- body mesh
def _body_mesh(name, col, mat):
    """Skin-modifier graph -> applied mesh (+1 subdivision baked in for weighting)."""
    names = list(SKIN)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = {n: bm.verts.new(P(n)) for n in names}
    for a, b in SKIN_EDGES:
        bm.edges.new((vs[a], vs[b]))
    bm.to_mesh(me)
    bm.free()
    o = _link(bpy.data.objects.new(name, me), col)
    sk = o.modifiers.new("Skin", "SKIN")
    sk.use_smooth_shade = True
    sk.branch_smoothing = 1.0
    for i, n in enumerate(names):
        rx, ry = SKIN[n]
        me.skin_vertices[0].data[i].radius = (rx, ry)
    me.skin_vertices[0].data[names.index("hips")].use_root = True
    sub = o.modifiers.new("Sub", "SUBSURF")
    sub.levels = sub.render_levels = 2
    dg = bpy.context.evaluated_depsgraph_get()
    oe = o.evaluated_get(dg)
    me2 = bpy.data.meshes.new_from_object(oe)
    o.modifiers.clear()
    o.data = me2
    bpy.data.meshes.remove(me)
    me2.materials.append(mat)
    _smooth(o)
    return o


def _seg_dist(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length, t


def _weight(body, rig):
    """Distance-to-segment weights with a narrow smooth blend between the two nearest bones."""
    segs = {}
    for nm, h, t, _ in DEFORM:
        if nm in ("head",):
            continue
        segs[nm] = (Vector(J[h]), Vector(J[t]))
    groups = {nm: body.vertex_groups.new(name=nm) for nm in segs}
    body.vertex_groups.new(name="head")
    # torso volume belongs to the spine chain even near the shoulder/hip joints
    for v in body.data.vertices:
        p = v.co
        ds = []
        for nm, (a, b) in segs.items():
            d, _ = _seg_dist(p, a, b)
            if nm in ("hips", "spine", "chest"):
                d -= 0.06  # the torso is thick: measure from inside it
            if nm.startswith("hand") or nm.startswith("foot"):
                d += 0.01
            ds.append((d, nm))
        ds.sort()
        d0 = ds[0][0]
        ws = [(math.exp(-(d - d0) / 0.012), nm) for d, nm in ds[:3] if d - d0 < 0.05]
        tot = sum(w for w, _ in ws)
        for w, nm in ws:
            groups[nm].add([v.index], w / tot, "REPLACE")
    mod = body.modifiers.new("Armature", "ARMATURE")
    mod.object = rig
    sub = body.modifiers.new("Sub", "SUBSURF")
    sub.levels = 0
    sub.render_levels = 1


def _hand(name, col, mat, side):
    """Rounded mitten with a thumb nub, built in rest pose around the wrist->tip axis."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=12, radius=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * 0.040, v.co.y * 0.028, v.co.z * 0.055))
    bm.to_mesh(me)
    bm.free()
    o = _link(bpy.data.objects.new(name, me), col)
    me.materials.append(mat)
    _smooth(o)
    th = bpy.data.meshes.new(name + "_thumb")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * 0.014, v.co.y * 0.014, v.co.z * 0.030))
    bm.to_mesh(th)
    bm.free()
    t = _link(bpy.data.objects.new(name + "_thumb", th), col)
    th.materials.append(mat)
    _smooth(t)
    # orient along the hand bone; thumb towards the front (-Y) and slightly inward
    a, b = Vector(J[f"wrist.{side}"]), Vector(J[f"hand_tip.{side}"])
    axis = (b - a).normalized()
    rot = Vector((0, 0, -1)).rotation_difference(axis).to_matrix().to_4x4()
    ctr = a + (b - a) * 0.55
    o.matrix_world = Matrix.Translation(ctr) @ rot
    sx = 1 if side == "L" else -1
    t.matrix_world = Matrix.Translation(a + (b - a) * 0.35 + Vector((-sx * 0.01, -0.028, 0))) @ rot @ Matrix.Rotation(math.radians(-25 * sx), 4, "Y")
    return [o, t]


def _foot(name, col, mat, side):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=12, radius=1.0)
    for v in bm.verts:
        z = v.co.z
        v.co = Vector((v.co.x * 0.050, v.co.y * 0.115, max(z, -0.55) * 0.055))  # flat sole
    bm.to_mesh(me)
    bm.free()
    o = _link(bpy.data.objects.new(name, me), col)
    me.materials.append(mat)
    _smooth(o)
    sx = 1 if side == "L" else -1
    o.location = (sx * 0.095, -0.06, 0.03)
    return o


def _tube(name, col, pts, radius, mat):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (c[0], c[1], c[2], 1)
    o = _link(bpy.data.objects.new(name, cu), col)
    cu.materials.append(mat)
    return o


def _parent_bone(obj, rig, bone):
    bpy.context.view_layer.update()
    mw = obj.matrix_world.copy()
    obj.parent = rig
    obj.parent_type = "BONE"
    obj.parent_bone = bone
    pb = rig.pose.bones[bone]
    bm = rig.matrix_world @ pb.bone.matrix_local @ Matrix.Translation((0, pb.bone.length, 0))
    obj.matrix_parent_inverse = bm.inverted()
    obj.matrix_world = mw


def _empty(name, col, loc):
    e = _link(bpy.data.objects.new(name, None), col)
    e.location = loc
    e.empty_display_size = 0.05
    return e


MOUTH_PTS = 7


def mouth_points(width=1.0, curve=0.0, flat=0.0):
    """Mouth line in head-local space (x, z offsets on the face), projected onto the head sphere by the caller.
    curve > 0 smiles (corners up), < 0 frowns."""
    w = 0.030 * width
    pts = []
    for i in range(MOUTH_PTS):
        u = (i / (MOUTH_PTS - 1)) * 2 - 1
        z = curve * 0.016 * (u * u - 0.35) * (1 - flat)
        pts.append((u * w, z))
    return pts


def on_head(x, z, lift=0.003):
    """Point on the head's front surface at local offsets (x right-of-viewer is -X for a -Y facing head)."""
    r = HEAD_R + lift
    y = -math.sqrt(max(1e-6, r * r - x * x - z * z))
    return Vector((x, y, z))


# --------------------------------------------------------------- build
def build(name="Hero", style="hero", parent_col=None, at=(0, 0, 0)):
    """Create the character in its own collection. Returns (rig, parts)."""
    col = bpy.data.collections.new(name)
    (parent_col or bpy.context.scene.collection).children.link(col)
    M = materials(style)

    arm = bpy.data.armatures.new(name + "Rig")
    rig = _link(bpy.data.objects.new(name + "Rig", arm), col)
    bpy.context.view_layer.objects.active = rig
    for o in bpy.context.selected_objects:
        o.select_set(False)
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm.edit_bones
    root = eb.new("root")
    root.head, root.tail = (0, 0, 0), (0, 0.3, 0)
    for nm, h, t, par in DEFORM:
        b = eb.new(nm)
        b.head, b.tail = J[h], J[t]
        b.parent = eb[par] if par else root
        b.use_connect = bool(par) and nm not in ("hips",) and not nm.startswith(("upper_arm", "thigh"))
    for s, sx in (("L", 1), ("R", -1)):
        ik = eb.new(f"ik_foot.{s}")
        ik.head, ik.tail = J[f"ankle.{s}"], J[f"toe.{s}"]  # same rest frame as the foot bone (copy rotation is exact)
        ik.parent = root
        pk = eb.new(f"pole_knee.{s}")
        pk.head = (sx * 0.095, -0.6, 0.47)
        pk.tail = (sx * 0.095, -0.7, 0.47)
        pk.parent = root
        ih = eb.new(f"ik_hand.{s}")
        ih.head, ih.tail = J[f"wrist.{s}"], J[f"hand_tip.{s}"]
        ih.parent = root
        pe = eb.new(f"pole_elbow.{s}")
        pe.head = (sx * 0.40, 0.45, 1.0)
        pe.tail = (sx * 0.40, 0.55, 1.0)
        pe.parent = root
    for b in eb:
        b.roll = 0.0
    bpy.ops.object.mode_set(mode="OBJECT")
    for b in arm.bones:
        b.use_deform = not (b.name == "root" or b.name.startswith(("ik_", "pole_")))

    # constraints
    for s in ("L", "R"):
        c = rig.pose.bones[f"shin.{s}"].constraints.new("IK")
        c.target, c.subtarget = rig, f"ik_foot.{s}"
        c.pole_target, c.pole_subtarget = rig, f"pole_knee.{s}"
        c.pole_angle = math.radians(-90)
        c.chain_count = 2
        c.use_stretch = False
        cr = rig.pose.bones[f"foot.{s}"].constraints.new("COPY_ROTATION")
        cr.target, cr.subtarget = rig, f"ik_foot.{s}"
        cr.name = "FootRot"
        c = rig.pose.bones[f"forearm.{s}"].constraints.new("IK")
        c.target, c.subtarget = rig, f"ik_hand.{s}"
        c.pole_target, c.pole_subtarget = rig, f"pole_elbow.{s}"
        c.pole_angle = math.radians(90)  # measured on both arms: the elbow points at the pole
        c.chain_count = 2
        c.use_stretch = False
        c.influence = 0.0
        c.name = "ArmIK"
        cr = rig.pose.bones[f"hand.{s}"].constraints.new("COPY_ROTATION")
        cr.target, cr.subtarget = rig, f"ik_hand.{s}"
        cr.influence = 0.0
        cr.name = "HandRot"
    for pb in rig.pose.bones:
        pb.rotation_mode = "XYZ"

    parts = {"col": col, "face": {}}
    body = _body_mesh(name + "_body", col, M["body"])
    _weight(body, rig)
    body.parent = rig
    parts["body"] = body

    # head (slightly egg-shaped) + face
    head = bpy.data.meshes.new(name + "_head")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=HEAD_R)
    for v in bm.verts:
        v.co.z *= 1.04
        v.co.y *= 0.97
    bm.to_mesh(head)
    bm.free()
    ho = _link(bpy.data.objects.new(name + "_head", head), col)
    head.materials.append(M["head"])
    _smooth(ho)
    sub = ho.modifiers.new("Sub", "SUBSURF")
    sub.levels, sub.render_levels = 0, 1
    ho.location = HEAD_C
    _parent_bone(ho, rig, "head")
    parts["head"] = ho

    face = parts["face"]
    hc = Vector(HEAD_C)
    for s, sx in (("L", 1), ("R", -1)):
        # eye: tall glossy ellipsoid on the surface, on a pivot at the head centre
        piv = _empty(f"{name}_eyepiv.{s}", col, hc)
        e = bpy.data.meshes.new(f"{name}_eye.{s}")
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=14, radius=1.0)
        bm.to_mesh(e)
        bm.free()
        eo = _link(bpy.data.objects.new(f"{name}_eye.{s}", e), col)
        e.materials.append(M["eye"])
        _smooth(eo)
        ex, ez = sx * 0.052, 0.022
        p = on_head(ex, ez, lift=-0.004)
        eo.parent = piv  # pivot sits at the head centre: the eye's local position is its offset on the face
        eo.location = p
        eo.scale = (0.022, 0.010, 0.036)
        eo.rotation_euler = (0, 0, math.atan2(p.x, -p.y))
        _parent_bone(piv, rig, "head")
        face[f"eye.{s}"] = eo
        face[f"eyepiv.{s}"] = piv
        if STYLES[style]["brows"]:
            bpiv = _empty(f"{name}_browpiv.{s}", col, hc)
            bx, bz = sx * 0.055, 0.082
            bp = on_head(bx, bz, lift=0.0)
            br = _tube(f"{name}_brow.{s}", col, [(-0.022, 0, -0.002), (0, 0, 0.004), (0.022, 0, -0.002)], 0.0042, M["ink"])
            br.parent = bpiv
            br.location = bp
            br.rotation_euler = (math.radians(-28), 0, math.atan2(bp.x, -bp.y))  # lies on the forehead's slope
            _parent_bone(bpiv, rig, "head")
            face[f"brow.{s}"] = br
            face[f"browpiv.{s}"] = bpiv
    # mouth line (points re-projected each frame) + "o"
    pts = [tuple(hc + on_head(x, z - 0.075)) for x, z in mouth_points(1.0, 0.0)]
    mo = _tube(f"{name}_mouth", col, [(p[0] - hc.x, p[1] - hc.y, p[2] - hc.z) for p in pts], 0.0032, M["ink"])
    mo.location = hc
    _parent_bone(mo, rig, "head")
    face["mouth"] = mo
    oh = bpy.data.meshes.new(f"{name}_mouth_o")
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1.0)
    bm.to_mesh(oh)
    bm.free()
    oo = _link(bpy.data.objects.new(f"{name}_mouth_o", oh), col)
    oh.materials.append(M["eye"])
    _smooth(oo)
    op = on_head(0, -0.078, lift=-0.003)
    oo.location = hc + op
    oo.scale = (0.0, 0.0, 0.0)
    oo["rest"] = [0.016, 0.008, 0.021]
    _parent_bone(oo, rig, "head")
    face["mouth_o"] = oo

    # hands and feet: rigid children of their bones
    for s in ("L", "R"):
        for o in _hand(f"{name}_hand.{s}", col, M["body"], s):
            _parent_bone(o, rig, f"hand.{s}")
        f = _foot(f"{name}_foot.{s}", col, M["body"], s)
        _parent_bone(f, rig, f"foot.{s}")
    rig["style"] = style
    rig.location = at  # everything above is built around the origin, then the whole rig moves
    return rig, parts
