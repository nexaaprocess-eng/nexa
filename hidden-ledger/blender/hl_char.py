"""Hidden Ledger main character ("the Passenger"): procedural 3D build + rig + pose/expression library.

Built from the reference sheet in assets/character/reference_sheet.png:
  smooth ivory-white round head on a thin neck, tall black oval eyes with a gloss highlight,
  thin black eyebrows (the main acting tool), no mouth unless an expression needs one,
  oversized cream hoodie (hood bunched at the neck, drawstrings, kangaroo pocket, ribbed cuffs),
  black baggy trousers bunching over chunky white/grey sneakers, black backpack, ivory mitten hands.

Everything is generated from code so the asset is reproducible and editable:
  blender -b --python blender/build_asset.py      -> assets/character/passenger.blend (+ turnaround renders)

Rig: one armature "PassengerRig"; the clothing body is a single skin-modifier mesh weighted to the bones
(distance-based weights computed here, no bone-heat guesswork); head, hands, shoes, backpack and face parts are
rigid children of their bones. Poses are dicts of bone -> (x, y, z) Euler degrees in the bone's local space.
"""
from __future__ import annotations

import math

import bpy
import bmesh
from mathutils import Euler, Matrix, Vector

# ------------------------------------------------------------------ palette (reference sheet)
IVORY = (0.93, 0.90, 0.85, 1)
HOODIE = (0.78, 0.71, 0.60, 1)
HOODIE_DARK = (0.68, 0.61, 0.51, 1)
PANTS = (0.016, 0.016, 0.018, 1)
INK = (0.012, 0.012, 0.014, 1)
SHOE = (0.90, 0.89, 0.86, 1)
SOLE = (0.42, 0.41, 0.40, 1)
BAG = (0.018, 0.018, 0.02, 1)

# ------------------------------------------------------------------ skeleton (rest = A-pose-ish T, metres, character faces -Y)
HEAD_R = 0.33
JOINTS = {
    "hips": (0, 0, 0.84),
    "spine": (0, 0, 0.98),
    "chest": (0, 0, 1.10),
    "neck": (0, 0, 1.18),
    "head": (0, 0, 1.27),
    "head_top": (0, 0, 1.27 + 2 * HEAD_R),
}
for s, sx in (("L", 1), ("R", -1)):
    JOINTS.update({
        f"shoulder.{s}": (sx * 0.19, 0, 1.13),
        f"elbow.{s}": (sx * 0.40, 0, 1.13),
        f"wrist.{s}": (sx * 0.60, 0, 1.13),
        f"hand_tip.{s}": (sx * 0.71, 0, 1.13),
        f"hip.{s}": (sx * 0.095, 0, 0.84),
        f"knee.{s}": (sx * 0.10, -0.01, 0.47),
        f"ankle.{s}": (sx * 0.10, 0, 0.10),
        f"toe.{s}": (sx * 0.10, -0.16, 0.04),
    })

# bone name -> (head joint, tail joint, parent)
BONES = [
    ("root", None, None, None),
    ("hips", "hips", "spine", "root"),
    ("spine", "spine", "chest", "hips"),
    ("chest", "chest", "neck", "spine"),
    ("neck", "neck", "head", "chest"),
    ("head", "head", "head_top", "neck"),
]
for s in ("L", "R"):
    BONES += [
        (f"upper_arm.{s}", f"shoulder.{s}", f"elbow.{s}", "chest"),
        (f"forearm.{s}", f"elbow.{s}", f"wrist.{s}", f"upper_arm.{s}"),
        (f"hand.{s}", f"wrist.{s}", f"hand_tip.{s}", f"forearm.{s}"),
        (f"thigh.{s}", f"hip.{s}", f"knee.{s}", "hips"),
        (f"shin.{s}", f"knee.{s}", f"ankle.{s}", f"thigh.{s}"),
        (f"foot.{s}", f"ankle.{s}", f"toe.{s}", f"shin.{s}"),
    ]

# skin-modifier graph for the clothed body: (joint, radius x, radius y)
SKIN_VERTS = {
    "hips": (0.18, 0.135), "spine": (0.195, 0.145), "chest": (0.225, 0.15), "neck": (0.075, 0.07),
}
for s in ("L", "R"):
    SKIN_VERTS.update({
        f"shoulder.{s}": (0.095, 0.095), f"elbow.{s}": (0.078, 0.078), f"wrist.{s}": (0.068, 0.068),
        f"hip.{s}": (0.122, 0.122), f"knee.{s}": (0.112, 0.112), f"ankle.{s}": (0.104, 0.104),
    })
SKIN_EDGES = [("hips", "spine"), ("spine", "chest"), ("chest", "neck")]
for s in ("L", "R"):
    SKIN_EDGES += [("chest", f"shoulder.{s}"), (f"shoulder.{s}", f"elbow.{s}"), (f"elbow.{s}", f"wrist.{s}"),
                   ("hips", f"hip.{s}"), (f"hip.{s}", f"knee.{s}"), (f"knee.{s}", f"ankle.{s}")]


def V(name):
    return Vector(JOINTS[name])


# ------------------------------------------------------------------ materials
def mat(name, color, rough=0.5, sss=0.0, coat=0.0, spec=0.5, sheen=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Subsurface Weight"].default_value = sss
    if sss:
        b.inputs["Subsurface Radius"].default_value = (0.08, 0.06, 0.05)
        b.inputs["Subsurface Scale"].default_value = 0.05
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Specular IOR Level"].default_value = spec
    b.inputs["Sheen Weight"].default_value = sheen
    return m


def fabric_mat(name, color, rough=0.85, bump_scale=420.0, bump=0.12, sheen=0.35):
    """Cloth: rough, a little sheen, fine noise bump so big surfaces don't look like plastic."""
    m = mat(name, color, rough=rough, sheen=sheen, spec=0.3)
    nt = m.node_tree
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = bump_scale
    tex.inputs["Detail"].default_value = 4
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = bump
    bmp.inputs["Distance"].default_value = 0.002
    nt.links.new(tex.outputs["Fac"], bmp.inputs["Height"])
    nt.links.new(bmp.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    return m


# Extras (other passengers) share the rig but never the hero's look: taupe/slate heads, coloured tops, no brows.
EXTRA_STYLES = [
    {"skin": (0.20, 0.17, 0.14, 1), "top": (0.12, 0.20, 0.27, 1), "pants": (0.10, 0.11, 0.13, 1)},
    {"skin": (0.15, 0.13, 0.12, 1), "top": (0.38, 0.13, 0.07, 1), "pants": (0.06, 0.06, 0.07, 1)},
    {"skin": (0.24, 0.21, 0.18, 1), "top": (0.17, 0.20, 0.13, 1), "pants": (0.14, 0.12, 0.10, 1)},
    {"skin": (0.12, 0.11, 0.11, 1), "top": (0.30, 0.27, 0.22, 1), "pants": (0.08, 0.09, 0.12, 1)},
]


def materials(style=None, tag=""):
    """Hero materials, or a muted extra palette (style dict) with material names suffixed by `tag`."""
    if style:
        return {
            "ivory": mat(f"HL_XSkin{tag}", style["skin"], rough=0.5),
            "hoodie": mat(f"HL_XTop{tag}", style["top"], rough=0.8, sheen=0.2),
            "hoodie_dark": mat(f"HL_XTopRib{tag}", tuple(c * 0.8 for c in style["top"][:3]) + (1,), rough=0.85),
            "pants": mat(f"HL_XPants{tag}", style["pants"], rough=0.75),
            "ink": mat("HL_XInk", INK, rough=0.3),
            "brow": mat("HL_XInk", INK, rough=0.3),
            "shoe": mat("HL_XShoe", (0.35, 0.34, 0.33, 1), rough=0.6),
            "sole": mat("HL_XSole", (0.2, 0.2, 0.2, 1), rough=0.7),
            "bag": mat("HL_Bag2", BAG, rough=0.5),
        }
    return {
        "ivory": mat("HL_Ivory", IVORY, rough=0.32, sss=0.12, coat=0.25),
        "hoodie": fabric_mat("HL_Hoodie", HOODIE),
        "hoodie_dark": fabric_mat("HL_HoodieRib", HOODIE_DARK, bump_scale=900, bump=0.3),
        "pants": fabric_mat("HL_Pants", PANTS, rough=0.72, sheen=0.06),
        "ink": mat("HL_Ink", INK, rough=0.12, coat=1.0, spec=0.8),
        "brow": mat("HL_Brow", INK, rough=0.5),
        "shoe": mat("HL_Shoe", SHOE, rough=0.55),
        "sole": mat("HL_Sole", SOLE, rough=0.7),
        "bag": fabric_mat("HL_Bag", BAG, rough=0.5, bump_scale=600, bump=0.2, sheen=0.04),
    }


# ------------------------------------------------------------------ helpers
def link(obj, col):
    col.objects.link(obj)
    return obj


def shade_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def add_subsurf(obj, levels=2, render=2):
    m = obj.modifiers.new("Subsurf", "SUBSURF")
    m.levels = levels
    m.render_levels = render
    return m


def uv_sphere(name, col, r, loc, scale=(1, 1, 1), segs=48, rings=24, material=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=r)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me), col)
    o.location = loc
    o.scale = scale
    shade_smooth(o)
    if material:
        me.materials.append(material)
    return o


def rounded_box(name, col, size, loc, bevel=0.3, material=None, subsurf=2):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me), col)
    o.location = loc
    if bevel:
        b = o.modifiers.new("Bevel", "BEVEL")
        b.width = bevel * min(size)
        b.segments = 3
    if subsurf:
        add_subsurf(o, subsurf, subsurf)
    shade_smooth(o)
    if material:
        me.materials.append(material)
    return o


def tube(name, col, pts, radius, material, res=12):
    """Bevelled poly curve through pts (brows, mouth, drawstrings, straps)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (c[0], c[1], c[2], 1)
    sp.order_u = min(4, len(pts))
    sp.use_endpoint_u = True
    sp.resolution_u = res
    o = link(bpy.data.objects.new(name, cu), col)
    cu.materials.append(material)
    return o


def parent_to_bone(obj, rig, bone):
    """Rigid child of a bone, keeping the current world transform."""
    bpy.context.view_layer.update()  # matrix_world is stale right after setting location/scale from Python
    mw = obj.matrix_world.copy()
    obj.parent = rig
    obj.parent_type = "BONE"
    obj.parent_bone = bone
    pb = rig.pose.bones[bone]
    # bone-parented objects are relative to the bone TAIL in rest pose
    bone_mat = rig.matrix_world @ pb.bone.matrix_local @ Matrix.Translation((0, pb.bone.length, 0))
    obj.matrix_parent_inverse = bone_mat.inverted()
    obj.matrix_world = mw


# ------------------------------------------------------------------ build
def build(col_name="Passenger", at=(0, 0, 0), extra=None, backpack=True, parent_col=None):
    """Create the character in a new collection. Returns (rig, parts dict).
    extra=<int> builds a background passenger with EXTRA_STYLES[extra % 4] (object names prefixed with col_name)."""
    col = bpy.data.collections.new(col_name)
    (parent_col or bpy.context.scene.collection).children.link(col)
    style = EXTRA_STYLES[extra % len(EXTRA_STYLES)] if extra is not None else None
    M = materials(style, tag=str(extra % len(EXTRA_STYLES)) if style else "")

    # --- armature
    arm = bpy.data.armatures.new(col_name + "Rig")
    rig = link(bpy.data.objects.new(col_name + "Rig", arm), col)
    rig.show_in_front = True
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    eb = {}
    for name, h, t, parent in BONES:
        b = arm.edit_bones.new(name)
        if name == "root":
            b.head, b.tail = (0, 0, 0), (0, 0.25, 0)
        else:
            b.head, b.tail = V(h), V(t)
        # roll: keep local X pointing sideways so (x = bend forward/back) is consistent
        b.roll = 0
        if parent:
            b.parent = eb[parent]
            b.use_connect = name not in ("hips",) and (eb[parent].tail - b.head).length < 1e-4
        eb[name] = b
    # arms/legs: align rolls so local Z points forward-ish (-Y world) for predictable rotations
    for name, b in eb.items():
        if name.startswith(("upper_arm", "forearm", "hand")):
            b.align_roll(Vector((0, -1, 0)))
        elif name.startswith(("thigh", "shin")):
            b.align_roll(Vector((0, -1, 0)))
        elif name.startswith("foot"):
            b.align_roll(Vector((0, 0, 1)))
        elif name != "root":
            b.align_roll(Vector((0, -1, 0)))
    bpy.ops.object.mode_set(mode="OBJECT")
    for pb in rig.pose.bones:
        pb.rotation_mode = "XYZ"

    # --- clothed body (skin modifier graph)
    names = list(SKIN_VERTS)
    me = bpy.data.meshes.new("PassengerBodyMesh")
    me.from_pydata([V(n) for n in names], [(names.index(a), names.index(b)) for a, b in SKIN_EDGES], [])
    body = link(bpy.data.objects.new("PassengerBody", me), col)
    sk = body.modifiers.new("Skin", "SKIN")
    sk.use_smooth_shade = True
    sk.branch_smoothing = 0.6
    for v, n in zip(me.skin_vertices[0].data, names):
        v.radius = SKIN_VERTS[n]
        if n == "hips":
            v.use_root = True
    add_subsurf(body, 2, 2)
    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    for m in list(body.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    body.select_set(False)
    shade_smooth(body)
    # hoodie is fuller and baggier: inflate the torso a little and give the trousers a slight flare
    for v in me.vertices:
        z = v.co.z
        if 0.80 < z < 1.16 and abs(v.co.x) < 0.24:
            k = 1 + 0.06 * math.sin(math.pi * (z - 0.80) / 0.36)
            v.co.x *= k
            v.co.y *= k * 1.04
        if z < 0.80:  # trousers: wider towards the knee, bunched at the ankle
            cx = math.copysign(0.10, v.co.x)
            v.co.x = cx + (v.co.x - cx) * (1.0 + 0.10 * math.sin(math.pi * min(1, max(0, (0.8 - z) / 0.7))))
    # materials by region (rest pose: arms horizontal, so z separates trousers from sleeves)
    me.materials.append(M["hoodie"])
    me.materials.append(M["pants"])
    for p in me.polygons:
        p.material_index = 1 if p.center.z < 0.815 else 0

    # distance-based weights to bone segments
    def seg_dist(p, a, b):
        ab = b - a
        t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
        return (p - (a + ab * t)).length, t

    deform = [b for b in BONES if b[0] != "root" and not b[0].startswith(("hand", "foot", "head"))]
    groups = {b[0]: body.vertex_groups.new(name=b[0]) for b in deform}
    for v in me.vertices:
        p = v.co
        is_leg = p.z < 0.815 and abs(p.x) < 0.3
        is_arm = abs(p.x) > 0.21 and p.z > 1.0
        cands = []
        for name, h, t, _ in deform:
            if is_leg and not name.startswith(("thigh", "shin", "hips")):
                continue
            if is_arm and not name.startswith(("upper_arm", "forearm", "chest")):
                continue
            if not is_leg and not is_arm and name.startswith(("thigh", "shin", "forearm")):
                continue
            if name.startswith(("thigh", "shin", "upper_arm", "forearm")) and (p.x > 0) != name.endswith(".L"):
                continue
            d, _ = seg_dist(p, V(h), V(t))
            cands.append((d, name))
        cands.sort()
        best = cands[:2]
        ws = [1.0 / (d + 0.02) ** 4 for d, _ in best]
        tot = sum(ws)
        for (d, name), w in zip(best, ws):
            groups[name].add([v.index], w / tot, "REPLACE")
    body.parent = rig
    am = body.modifiers.new("Armature", "ARMATURE")
    am.object = rig
    am.use_deform_preserve_volume = True
    add_subsurf(body, 0, 1)

    parts = {"body": body}

    # --- hoodie details (rigid on chest/hips)
    hood = rounded_box("Hood", col, (0.33, 0.20, 0.13), (0, 0.06, 1.17), bevel=0.45, material=M["hoodie"])
    hood.rotation_euler = (math.radians(-12), 0, 0)
    parent_to_bone(hood, rig, "chest")
    collar = rounded_box("HoodCollar", col, (0.24, 0.20, 0.06), (0, -0.01, 1.185), bevel=0.5, material=M["hoodie"])
    parent_to_bone(collar, rig, "chest")
    pocket = rounded_box("Pocket", col, (0.24, 0.035, 0.12), (0, -0.142, 0.92), bevel=0.4, material=M["hoodie"])
    parent_to_bone(pocket, rig, "spine")
    band = rounded_box("Waistband", col, (0.37, 0.27, 0.05), (0, 0, 0.82), bevel=0.5, material=M["hoodie_dark"])
    parent_to_bone(band, rig, "hips")
    for sx in (1, -1):
        s = tube(f"Drawstring.{sx}", col, [(sx * 0.035, -0.13, 1.16), (sx * 0.04, -0.155, 1.09), (sx * 0.045, -0.158, 1.02)], 0.006, M["hoodie_dark"])
        parent_to_bone(s, rig, "chest")

    # --- per side: cuffs, hands, shoes, trouser hems
    for s, sx in (("L", 1), ("R", -1)):
        cuff = uv_sphere(f"Cuff.{s}", col, 0.068, (sx * 0.585, 0, 1.13), scale=(0.75, 1, 1), material=M["hoodie_dark"])
        parent_to_bone(cuff, rig, f"forearm.{s}")
        # mitten hand: palm + thumb
        palm = uv_sphere(f"Hand.{s}", col, 0.062, (sx * 0.645, -0.0, 1.125), scale=(1.25, 0.65, 1.0), material=M["ivory"])
        parent_to_bone(palm, rig, f"hand.{s}")
        thumb = uv_sphere(f"Thumb.{s}", col, 0.026, (sx * 0.63, -0.045, 1.14), scale=(1.4, 0.9, 0.9), material=M["ivory"])
        parent_to_bone(thumb, rig, f"hand.{s}")
        hem = uv_sphere(f"Hem.{s}", col, 0.105, (sx * 0.10, -0.005, 0.17), scale=(1.05, 1.05, 0.6), material=M["pants"])
        parent_to_bone(hem, rig, f"shin.{s}")
        shoe = rounded_box(f"Shoe.{s}", col, (0.155, 0.31, 0.125), (sx * 0.10, -0.055, 0.07), bevel=0.4, material=M["shoe"])
        parent_to_bone(shoe, rig, f"foot.{s}")
        sole = rounded_box(f"Sole.{s}", col, (0.165, 0.325, 0.045), (sx * 0.10, -0.055, 0.022), bevel=0.4, material=M["sole"], subsurf=1)
        parent_to_bone(sole, rig, f"foot.{s}")
        stripe = rounded_box(f"ShoeStripe.{s}", col, (0.16, 0.13, 0.035), (sx * 0.10, -0.03, 0.085), bevel=0.4, material=M["sole"], subsurf=1)
        stripe.rotation_euler = (math.radians(20), 0, 0)
        parent_to_bone(stripe, rig, f"foot.{s}")

    # --- backpack (on chest bone)
    if not backpack:
        pass
    pack = rounded_box("Backpack", col, (0.30, 0.15, 0.38), (0, 0.205, 0.99), bevel=0.35, material=M["bag"])
    parent_to_bone(pack, rig, "chest")
    flap = rounded_box("BackpackPocket", col, (0.22, 0.05, 0.15), (0, 0.29, 0.92), bevel=0.4, material=M["bag"])
    parent_to_bone(flap, rig, "chest")
    for sx in (1, -1):
        strap = tube(f"Strap.{sx}", col, [(sx * 0.11, 0.13, 1.15), (sx * 0.12, -0.02, 1.19), (sx * 0.135, -0.135, 1.10),
                                          (sx * 0.135, -0.15, 0.98), (sx * 0.12, -0.1, 0.88), (sx * 0.11, 0.13, 0.86)], 0.014, M["bag"])
        parent_to_bone(strap, rig, "chest")

    # --- neck + head + face (head bone)
    neck = uv_sphere("Neck", col, 0.042, (0, 0, 1.25), scale=(1, 1, 2.4), material=M["ivory"])
    parent_to_bone(neck, rig, "neck")
    hc = Vector((0, 0, 1.27 + HEAD_R * 1.0))
    head = uv_sphere("Head", col, HEAD_R, hc, scale=(1.0, 0.97, 1.04), segs=64, rings=32, material=M["ivory"])
    parent_to_bone(head, rig, "head")
    parts["head"] = head

    def on_head(yaw, pitch, out=1.0):
        """Point on the head surface; yaw/pitch in degrees, 0,0 = straight forward (-Y)."""
        y, p = math.radians(yaw), math.radians(pitch)
        d = Vector((math.sin(y) * math.cos(p), -math.cos(y) * math.cos(p), math.sin(p)))
        return hc + Vector((d.x * HEAD_R * 1.0, d.y * HEAD_R * 0.97, d.z * HEAD_R * 1.04)) * out

    face = {}
    for s, sx in (("L", 1), ("R", -1)):
        c = on_head(sx * 18, 0, 0.955)
        k = HEAD_R / 0.215
        eye = uv_sphere(f"Eye.{s}", col, 1.0, c, scale=(0.027 * k, 0.02 * k, 0.062 * k), segs=32, rings=16, material=M["ink"])
        eye.rotation_euler = (0, 0, math.radians(sx * 17))
        parent_to_bone(eye, rig, "head")
        face[f"eye.{s}"] = eye
        # brow: a short arc above the eye; acted through rotation/height on its pivot empty
        piv = link(bpy.data.objects.new(f"BrowPivot.{s}", None), col)
        piv.location = on_head(sx * 18, 22, 0.99)
        piv.empty_display_size = 0.02
        parent_to_bone(piv, rig, "head")
        pts = []
        for i in range(5):
            u = (i / 4 - 0.5)
            q = on_head(sx * 18 + u * 16, 22 + 2.6 * (1 - (2 * u) ** 2), 1.012)
            pts.append(tuple(q - piv.location))
        brow = tube(f"Brow.{s}", col, pts, 0.0068, M["brow"])
        brow.parent = piv
        face[f"brow.{s}"] = piv
    # mouth shapes (hidden by default): smile, small open, frown, flat
    for key, curve in (("smile", lambda u: -3.2 * (1 - (2 * u) ** 2)), ("frown", lambda u: 2.6 * (1 - (2 * u) ** 2)),
                       ("flat", lambda u: 0.0), ("grin", lambda u: -4.5 * (1 - (2 * u) ** 2))):
        pts = [tuple(on_head((i / 6 - 0.5) * (22 if key != "grin" else 30), -22 + curve(i / 6 - 0.5), 1.008)) for i in range(7)]
        mo = tube(f"Mouth.{key}", col, pts, 0.0065 if key != "grin" else 0.009, M["brow"])
        parent_to_bone(mo, rig, "head")
        mo.scale = (0, 0, 0)
        face[f"mouth.{key}"] = mo
    oh = uv_sphere("Mouth.oh", col, 1.0, on_head(0, -24, 0.985), scale=(0.02, 0.012, 0.026), material=M["ink"])
    parent_to_bone(oh, rig, "head")
    oh.scale = (0, 0, 0)
    face["mouth.oh"] = oh
    parts["face"] = face

    if not backpack:
        for o in list(col.objects):
            if o.name.startswith(("Backpack", "Strap")):
                bpy.data.objects.remove(o)
    if style:
        for o in list(col.objects):
            if o.name.startswith(("Brow", "Mouth")):
                if o.type == "CURVE" or o.name.startswith("Mouth"):
                    bpy.data.objects.remove(o)
        face = {k: v for k, v in face.items() if k.startswith("eye")}
        parts["face"] = face
    if col_name != "Passenger":
        for o in col.objects:
            if not o.name.startswith(col_name):
                o.name = f"{col_name}.{o.name}"
    rig.location = at
    return rig, parts


# ------------------------------------------------------------------ poses (bone local Euler degrees)
# Conventions after the roll alignment above (verified with the turnaround render):
#   upper_arm.L z<0 lowers the arm towards the body, x>0 swings it forward; .R mirrors z.
#   forearm x>0 bends the elbow forward/up.  thigh x>0 lifts the knee forward; shin x<0 bends the knee.
#   spine/chest/neck/head (vertical bones): x = pitch (+ leans/looks down), y = yaw (+ turns to the character's
#   left), z = roll (sideways tilt).
POSES = {
    "rest": {},
    "stand": {"upper_arm.L": (8, 0, -72), "upper_arm.R": (8, 0, 72), "forearm.L": (14, 0, 0), "forearm.R": (14, 0, 0),
              "hand.L": (0, 0, 0), "hand.R": (0, 0, 0), "thigh.L": (0, 0, 2), "thigh.R": (0, 0, -2)},
    "hands_in_pocket": {"upper_arm.L": (22, 0, -66), "upper_arm.R": (22, 0, 66), "forearm.L": (62, 0, 18), "forearm.R": (62, 0, -18),
                        "spine": (-3, 0, 0)},
    "think": {"upper_arm.L": (8, 0, -72), "forearm.L": (14, 0, 0), "upper_arm.R": (52, 0, 52), "forearm.R": (118, 0, -12),
              "hand.R": (0, 0, -25), "head": (6, 0, -8), "neck": (4, 0, 0)},
    "point": {"upper_arm.L": (8, 0, -72), "forearm.L": (14, 0, 0), "upper_arm.R": (78, 0, 22), "forearm.R": (8, 0, 0),
              "chest": (0, -8, 0), "head": (-6, -12, 0)},
    "shrug": {"upper_arm.L": (18, -10, -48), "upper_arm.R": (18, 10, 48), "forearm.L": (78, 0, -24), "forearm.R": (78, 0, 24),
              "hand.L": (0, 40, 0), "hand.R": (0, -40, 0), "chest": (-4, 0, 0), "head": (-4, 0, 8)},
    "surprised": {"upper_arm.L": (24, 0, -54), "upper_arm.R": (24, 0, 54), "forearm.L": (60, 0, -10), "forearm.R": (60, 0, 10),
                  "chest": (-8, 0, 0), "head": (-8, 0, 0), "spine": (-3, 0, 0)},
    "phone": {"upper_arm.L": (30, 0, -62), "forearm.L": (92, 0, 22), "hand.L": (-20, 0, 0), "upper_arm.R": (26, 0, 64),
              "forearm.R": (86, 0, -24), "hand.R": (-20, 0, 0), "head": (24, 0, 0), "neck": (8, 0, 0), "chest": (6, 0, 0)},
    "sit": {"thigh.L": (88, 0, 4), "thigh.R": (88, 0, -4), "shin.L": (-90, 0, 0), "shin.R": (-90, 0, 0), "foot.L": (0, 0, 0),
            "foot.R": (0, 0, 0), "upper_arm.L": (30, 0, -66), "upper_arm.R": (30, 0, 66), "forearm.L": (50, 0, 10),
            "forearm.R": (50, 0, -10), "spine": (-4, 0, 0)},
    "sit_type": {"thigh.L": (88, 0, 4), "thigh.R": (88, 0, -4), "shin.L": (-88, 0, 0), "shin.R": (-88, 0, 0),
                 "upper_arm.L": (48, 0, -60), "upper_arm.R": (48, 0, 60), "forearm.L": (58, 0, 16), "forearm.R": (58, 0, -16),
                 "spine": (6, 0, 0), "chest": (4, 0, 0), "head": (14, 0, 0)},
    "slump": {"upper_arm.L": (4, 0, -78), "upper_arm.R": (4, 0, 78), "forearm.L": (6, 0, 0), "forearm.R": (6, 0, 0),
              "spine": (10, 0, 0), "chest": (10, 0, 0), "head": (18, 0, 0)},
    "cheer": {"upper_arm.L": (10, 0, 40), "upper_arm.R": (10, 0, -40), "forearm.L": (30, 0, 0), "forearm.R": (30, 0, 0),
              "chest": (-6, 0, 0), "head": (-10, 0, 0)},
    "carry": {"upper_arm.L": (8, 0, -72), "forearm.L": (14, 0, 0), "upper_arm.R": (4, 0, 76), "forearm.R": (4, 0, 0),
              "hand.R": (0, 0, 0), "chest": (0, 0, 0)},
    "strain": {"upper_arm.L": (14, 0, -62), "forearm.L": (40, 0, 0), "upper_arm.R": (0, 0, 80), "forearm.R": (0, 0, 0),
               "spine": (8, 0, 6), "chest": (6, 0, 6), "head": (4, 0, 0), "thigh.L": (6, 0, 4), "shin.L": (-10, 0, 0),
               "thigh.R": (-4, 0, -4)},
    "reach": {"upper_arm.R": (70, 0, 40), "forearm.R": (24, 0, 0), "upper_arm.L": (8, 0, -72), "forearm.L": (14, 0, 0),
              "chest": (8, 0, 0), "head": (8, 0, 0)},
}

# Expressions: brow (dz metres, roll degrees inner-up positive) per side, eye scale (x, z) and mouth key
EXPRESSIONS = {
    "neutral": {"brow": (0.0, 0), "eye": (1, 1), "mouth": None},
    "happy": {"brow": (0.004, -6), "eye": (1, 0.92), "mouth": "smile"},
    "curious": {"brow": (0.006, 8), "brow_asym": 0.008, "eye": (1, 1.05), "mouth": None},
    "surprised": {"brow": (0.016, 4), "eye": (1.08, 1.16), "mouth": "oh"},
    "confused": {"brow": (0.004, 14), "brow_asym": 0.01, "eye": (1, 1), "mouth": "flat"},
    "thinking": {"brow": (0.002, 10), "brow_asym": 0.006, "eye": (1, 0.95), "mouth": None},
    "worried": {"brow": (0.008, 18), "eye": (1, 1.02), "mouth": "frown"},
    "sad": {"brow": (-0.002, 22), "eye": (1, 0.85), "mouth": "frown"},
    "skeptical": {"brow": (-0.004, -14), "brow_asym": 0.012, "eye": (1, 0.8), "mouth": "flat"},
    "excited": {"brow": (0.012, -4), "eye": (1.06, 1.1), "mouth": "grin"},
    "angry": {"brow": (-0.008, -22), "eye": (1, 0.9), "mouth": "frown"},
    "satisfied": {"brow": (0.002, -8), "eye": (1, 0.78), "mouth": "smile"},
}


def find_rig(col_name="Passenger"):
    return bpy.data.objects[col_name + "Rig"]


def face_parts(col_name="Passenger"):
    d = {}
    for s in ("L", "R"):
        d[f"eye.{s}"] = bpy.data.objects[f"Eye.{s}" if col_name == "Passenger" else f"{col_name}.Eye.{s}"]
        d[f"brow.{s}"] = bpy.data.objects[f"BrowPivot.{s}" if col_name == "Passenger" else f"{col_name}.BrowPivot.{s}"]
    for k in ("smile", "frown", "flat", "grin", "oh"):
        d[f"mouth.{k}"] = bpy.data.objects[f"Mouth.{k}" if col_name == "Passenger" else f"{col_name}.Mouth.{k}"]
    return d


def apply_pose(rig, pose: dict, frame=None, weight=1.0, base=None):
    """Set (and optionally keyframe) a pose; bones not named return to rest. `base` blends from another pose."""
    for pb in rig.pose.bones:
        if pb.name == "root":
            continue
        tgt = pose.get(pb.name, (0, 0, 0))
        src = (base or {}).get(pb.name, (0, 0, 0))
        e = [math.radians(s + (t - s) * weight) for s, t in zip(src, tgt)]
        pb.rotation_euler = Euler(e, "XYZ")
        if frame is not None:
            pb.keyframe_insert("rotation_euler", frame=frame)


def apply_expression(face: dict, name: str, frame=None, blink=0.0, look=(0.0, 0.0)):
    """Expression + blink (0..1) + eye look offset (x, z in metres along the head surface)."""
    ex = EXPRESSIONS[name]
    dz, roll = ex["brow"]
    asym = ex.get("brow_asym", 0.0)
    for s, sx in (("L", 1), ("R", -1)):
        piv = face[f"brow.{s}"]
        if "rest_loc" not in piv:
            piv["rest_loc"] = list(piv.location)
            piv["rest_rot"] = list(piv.rotation_euler)
        rl = Vector(piv["rest_loc"])
        piv.location = rl + Vector((0, 0, 1.6 * (dz + (asym if s == "L" else 0))))
        rr = piv["rest_rot"]
        # roll about the viewing axis: inner end up for worried/sad, inner end down for angry
        piv.rotation_euler = (rr[0], rr[1] + math.radians(1.5 * roll) * sx, rr[2])
        eye = face[f"eye.{s}"]
        if "rest_scale" not in eye:
            eye["rest_scale"] = list(eye.scale)
            eye["rest_loc"] = list(eye.location)
        rs = eye["rest_scale"]
        open_ = max(0.06, 1 - blink)
        eye.scale = (rs[0] * ex["eye"][0], rs[1], rs[2] * ex["eye"][1] * open_)
        el = Vector(eye["rest_loc"])
        eye.location = el + Vector((look[0], 0, look[1]))
        if frame is not None:
            for o in (piv, eye):
                o.keyframe_insert("location", frame=frame)
            piv.keyframe_insert("rotation_euler", frame=frame)
            eye.keyframe_insert("scale", frame=frame)
    for k in ("smile", "frown", "flat", "grin", "oh"):
        mo = face[f"mouth.{k}"]
        if "rest_scale" not in mo:
            mo["rest_scale"] = [1.0, 1.0, 1.0] if k != "oh" else [0.02, 0.012, 0.026]
        on = ex["mouth"] == k
        mo.scale = tuple(mo["rest_scale"]) if on else (0, 0, 0)
        if frame is not None:
            mo.keyframe_insert("scale", frame=frame)
            # mouths switch, they don't grow
            for fc in (mo.animation_data.action.fcurves if mo.animation_data and mo.animation_data.action else []):
                for kp in fc.keyframe_points:
                    kp.interpolation = "CONSTANT"
