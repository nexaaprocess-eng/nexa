"""Procedural environments + props for Hidden Ledger 3D shots (episode 004+). All generated from code: no downloaded assets.

Each set builds into the STATIC collection (rendered once as a background plate) unless told otherwise; moving things
go into DYNAMIC (rendered per frame with the characters, static objects then act as shadow catchers / occluders).

Anchors: empties named "ANCHOR:<name>" mark world points that Remotion overlays attach to (labels, price tags);
planes named "SCREEN:<name>" mark screens whose four projected corners Remotion maps HTML onto (booking site, boards).
"""
from __future__ import annotations

import math
import random

import bmesh
import bpy
from mathutils import Vector

ORANGE = (0.86, 0.36, 0.12, 1)
SLATE = (0.30, 0.40, 0.47, 1)
TAUPE = (0.45, 0.41, 0.37, 1)
WHITE = (0.86, 0.85, 0.83, 1)
DARK = (0.03, 0.03, 0.035, 1)
METAL = (0.55, 0.56, 0.58, 1)


# ------------------------------------------------------------------ collections & materials
def col(name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


STATIC = "STATIC"
DYNAMIC = "DYNAMIC"


def M(name, color, rough=0.5, metal=0.0, emit=None, emit_strength=1.0, alpha=1.0, coat=0.0):
    key = f"S_{name}"
    m = bpy.data.materials.get(key)
    if m:
        return m
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = emit
        b.inputs["Emission Strength"].default_value = emit_strength
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
    return m


def emissive(name, color, strength=4.0):
    key = f"E_{name}"
    m = bpy.data.materials.get(key)
    if m:
        return m
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = color
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs[0])
    return m


def put(obj, collection=STATIC):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col(collection).objects.link(obj)
    return obj


# ------------------------------------------------------------------ primitives
def mesh_obj(name, bm, mat=None, collection=STATIC, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    col(collection).objects.link(o)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    if mat:
        me.materials.append(mat)
    return o


def box(name, size, loc, mat=None, bevel=0.0, rot=(0, 0, 0), collection=STATIC, segs=2, subsurf=0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    o = mesh_obj(name, bm, mat, collection, smooth=bool(bevel or subsurf))
    o.location = loc
    o.rotation_euler = rot
    if bevel:
        b = o.modifiers.new("Bevel", "BEVEL")
        b.width = bevel
        b.segments = segs
        b.limit_method = "NONE"
        b.harden_normals = True
    if subsurf:
        s = o.modifiers.new("Sub", "SUBSURF")
        s.levels = s.render_levels = subsurf
    return o


def cyl(name, r, depth, loc, mat=None, rot=(0, 0, 0), segs=32, collection=STATIC, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    o = mesh_obj(name, bm, mat, collection)
    o.location = loc
    o.rotation_euler = rot
    return o


def sphere(name, r, loc, mat=None, scale=(1, 1, 1), collection=STATIC, segs=24):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=segs // 2, radius=r)
    o = mesh_obj(name, bm, mat, collection)
    o.location = loc
    o.scale = scale
    return o


def plane(name, size, loc, mat=None, rot=(0, 0, 0), collection=STATIC):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], 0))
    o = mesh_obj(name, bm, mat, collection, smooth=False)
    o.location = loc
    o.rotation_euler = rot
    return o


def anchor(name, loc, collection=STATIC):
    e = bpy.data.objects.new(f"ANCHOR:{name}", None)
    col(collection).objects.link(e)
    e.location = loc
    e.empty_display_size = 0.2
    return e


def screen(name, w, h, loc, rot=(0, 0, 0), color=(0.02, 0.03, 0.05, 1), strength=1.0, collection=STATIC):
    """A screen surface (dark emissive). Remotion draws its content via the exported corners."""
    o = plane(f"SCREEN:{name}", (w, h), loc, emissive(f"scr_{name}", color, strength), rot=rot, collection=collection)
    return o


def parent(child, par):
    bpy.context.view_layer.update()
    mw = child.matrix_world.copy()
    child.parent = par
    child.matrix_parent_inverse = par.matrix_world.inverted()
    child.matrix_world = mw


def group(name, objs, loc=(0, 0, 0), rot=(0, 0, 0), collection=STATIC):
    e = bpy.data.objects.new(name, None)
    col(collection).objects.link(e)
    for o in objs:
        parent(o, e)
    e.location = loc
    e.rotation_euler = rot
    return e


# ------------------------------------------------------------------ props
def suitcase(name, loc, color=SLATE, rot=(0, 0, 0), collection=STATIC, size=(0.42, 0.26, 0.62)):
    m = M(f"case_{name}", color, rough=0.35, coat=0.3)
    parts = [box(f"{name}_body", size, (0, 0, size[2] / 2 + 0.06), m, bevel=0.05, segs=4, collection=collection)]
    for i, dx in enumerate((-0.1, 0.1)):
        parts.append(box(f"{name}_rib{i}", (0.02, size[1] + 0.01, size[2] * 0.92), (dx, 0, size[2] / 2 + 0.06), m, bevel=0.008, collection=collection))
    hm = M("handle", DARK, rough=0.4)
    parts.append(box(f"{name}_h1", (0.02, 0.02, 0.32), (-0.08, size[1] / 2 - 0.04, size[2] + 0.22), hm, collection=collection))
    parts.append(box(f"{name}_h2", (0.02, 0.02, 0.32), (0.08, size[1] / 2 - 0.04, size[2] + 0.22), hm, collection=collection))
    parts.append(box(f"{name}_h3", (0.2, 0.03, 0.03), (0, size[1] / 2 - 0.04, size[2] + 0.38), hm, bevel=0.01, collection=collection))
    for i, (dx, dy) in enumerate(((-0.16, -0.1), (0.16, -0.1), (-0.16, 0.1), (0.16, 0.1))):
        parts.append(cyl(f"{name}_w{i}", 0.03, 0.025, (dx, dy, 0.03), hm, rot=(0, math.pi / 2, 0), collection=collection))
    return group(name, parts, loc, rot, collection)


def airline_seat(name, loc, rot=(0, 0, 0), color=SLATE, collection=STATIC, headrest=True):
    m = M(f"seat_{color}", color, rough=0.75)
    frame = M("seatframe", (0.12, 0.12, 0.13, 1), rough=0.4, metal=0.5)
    head = M("headrest", (0.75, 0.73, 0.70, 1), rough=0.8)
    parts = [
        box(f"{name}_cush", (0.46, 0.48, 0.12), (0, 0, 0.43), m, bevel=0.04, segs=3, collection=collection),
        box(f"{name}_back", (0.46, 0.10, 0.68), (0, 0.24, 0.80), m, bevel=0.04, segs=3, rot=(math.radians(-8), 0, 0), collection=collection),
        box(f"{name}_leg", (0.36, 0.05, 0.36), (0, 0.0, 0.19), frame, collection=collection),
        box(f"{name}_arm", (0.05, 0.44, 0.04), (0.25, 0.02, 0.62), frame, bevel=0.015, collection=collection),
    ]
    if headrest:
        parts.append(box(f"{name}_head", (0.40, 0.11, 0.18), (0, 0.29, 1.08), head, bevel=0.03, segs=3, rot=(math.radians(-8), 0, 0), collection=collection))
    return group(name, parts, loc, rot, collection)


def coin_stack(name, n, loc, r=0.35, h=0.07, color=(0.85, 0.6, 0.2, 1), collection=STATIC):
    m = M("coin", color, rough=0.25, metal=1.0)
    rng = random.Random(len(name) + n)
    parts = [cyl(f"{name}_{i}", r, h * 0.92, (rng.uniform(-0.02, 0.02), rng.uniform(-0.02, 0.02), h * (i + 0.5)), m, segs=48, collection=collection) for i in range(n)]
    return group(name, parts, loc, collection=collection)


def plant(name, loc, collection=STATIC):
    pot = cyl(f"{name}_pot", 0.18, 0.32, (0, 0, 0.16), M("pot", (0.55, 0.36, 0.25, 1), rough=0.8), r2=0.22, collection=collection)
    rng = random.Random(3)
    leaves = [sphere(f"{name}_l{i}", rng.uniform(0.12, 0.2), (rng.uniform(-0.15, 0.15), rng.uniform(-0.15, 0.15), 0.45 + rng.uniform(0, 0.45)),
                     M("leaf", (0.12, 0.24, 0.12, 1), rough=0.6), scale=(1, 1, 1.4), collection=collection) for i in range(9)]
    return group(name, [pot] + leaves, loc, collection=collection)


# ------------------------------------------------------------------ airliner (generic narrow-body, fictional livery)
def airliner(name, loc=(0, 0, 0), yaw=0.0, collection=STATIC, livery=ORANGE, simple=False, door_anchor=True):
    """~36 m narrow-body along +X (nose at +X). Origin on the ground below the wing root. Fictional livery, no logos."""
    body_m = M("planebody", WHITE, rough=0.3, coat=0.4)
    liv_m = M(f"livery_{livery}", livery, rough=0.35, coat=0.3)
    win_m = M("planewin", (0.02, 0.025, 0.03, 1), rough=0.1, coat=1.0)
    dark_m = M("planedark", (0.08, 0.08, 0.09, 1), rough=0.5)
    L, R, zc = 36.0, 1.9, 3.1
    ring = 28 if simple else 40
    bm = bmesh.new()
    rows = []
    steps = 40
    for i in range(steps + 1):
        u = i / steps
        x = -L / 2 + u * L
        if u < 0.13:  # nose
            k = math.sqrt(1 - ((0.13 - u) / 0.13) ** 2) if u < 0.13 else 1
            r = R * max(0.05, k)
            dz = -0.25 * (1 - k)
        elif u > 0.72:  # tail cone sweeping up
            q = (u - 0.72) / 0.28
            r = R * max(0.12, 1 - q ** 1.4 * 0.88)
            dz = 1.25 * q ** 1.5
        else:
            r, dz = R, 0.0
        # nose is at +X: mirror u
        xx = -x
        rr = []
        for j in range(ring):
            a = 2 * math.pi * j / ring
            rr.append(bm.verts.new((xx, r * math.cos(a), zc + dz + r * 1.03 * math.sin(a))))
        rows.append(rr)
    for i in range(steps):
        for j in range(ring):
            a, b = rows[i][j], rows[i][(j + 1) % ring]
            c, d = rows[i + 1][(j + 1) % ring], rows[i + 1][j]
            bm.faces.new((a, b, c, d))
    bm.faces.new(rows[0])
    bm.faces.new(list(reversed(rows[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    fus = mesh_obj(f"{name}_fuselage", bm, body_m, collection)
    sub = fus.modifiers.new("Sub", "SUBSURF")
    sub.levels = sub.render_levels = 1
    parts = [fus]

    def slab(nm, root, tip, root_chord, tip_chord, root_t, tip_t, mat, vertical=False):
        """Tapered aerofoil-ish slab from root (x_le, y, z) to tip (x_le, y, z)."""
        bm = bmesh.new()
        vs = []
        for (xle, yy, zz), ch, th in ((root, root_chord, root_t), (tip, tip_chord, tip_t)):
            for xx, tt in ((xle, 0), (xle - ch * 0.3, th / 2), (xle - ch, 0), (xle - ch * 0.3, -th / 2)):
                if vertical:
                    vs.append(bm.verts.new((xx, tt, zz)))
                else:
                    vs.append(bm.verts.new((xx, yy, zz + tt)))
        for k in range(4):
            bm.faces.new((vs[k], vs[(k + 1) % 4], vs[4 + (k + 1) % 4], vs[4 + k]))
        bm.faces.new(vs[0:4])
        bm.faces.new(list(reversed(vs[4:8])))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        o = mesh_obj(nm, bm, mat, collection)
        s = o.modifiers.new("Sub", "SUBSURF")
        s.levels = s.render_levels = 1
        return o

    for side in (1, -1):
        parts.append(slab(f"{name}_wing{side}", (3.2, side * 1.6, zc - 1.2), (-3.4, side * 17.0, zc - 0.2), 6.2, 1.6, 0.55, 0.14, body_m))
        parts.append(slab(f"{name}_winglet{side}", (-3.1, side * 17.0, zc - 0.25), (-4.4, side * 17.3, zc + 2.0), 1.7, 0.8, 0.14, 0.08, body_m))
        parts.append(slab(f"{name}_stab{side}", (-13.6, side * 0.6, zc + 1.3), (-16.8, side * 6.6, zc + 1.6), 3.8, 1.3, 0.3, 0.1, body_m))
        ex = 3.9
        ey = side * 5.6
        # engine: rounded cowl (lathe profile), dark intake with a spinner, exhaust cone
        bm = bmesh.new()
        prof = [(1.75, 0.80), (1.68, 0.93), (1.45, 0.98), (0.6, 0.97), (-0.6, 0.90), (-1.4, 0.74), (-1.62, 0.62)]
        ringsv = []
        for xx, rr in prof:
            ringsv.append([bm.verts.new((xx, rr * math.cos(2 * math.pi * j / 32), rr * math.sin(2 * math.pi * j / 32))) for j in range(32)])
        for i in range(len(ringsv) - 1):
            for j in range(32):
                bm.faces.new((ringsv[i][j], ringsv[i][(j + 1) % 32], ringsv[i + 1][(j + 1) % 32], ringsv[i + 1][j]))
        nac = mesh_obj(f"{name}_eng{side}", bm, liv_m, collection)
        nac.location = (ex, ey, zc - 2.05)
        sb = nac.modifiers.new("Sub", "SUBSURF")
        sb.levels = sb.render_levels = 1
        sol = nac.modifiers.new("Solid", "SOLIDIFY")
        sol.thickness = 0.04
        parts.append(nac)
        parts.append(cyl(f"{name}_intake{side}", 0.79, 0.05, (ex + 1.45, ey, zc - 2.05), dark_m, rot=(0, math.pi / 2, 0), segs=36))
        parts.append(cyl(f"{name}_spinner{side}", 0.26, 0.5, (ex + 1.62, ey, zc - 2.05), M("spinner", (0.7, 0.7, 0.72, 1), rough=0.25, metal=0.9), rot=(0, math.pi / 2, 0), segs=24, r2=0.02))
        parts.append(cyl(f"{name}_exhaust{side}", 0.55, 0.9, (ex - 1.95, ey, zc - 2.05), M("exhaust", (0.25, 0.25, 0.26, 1), rough=0.4, metal=0.8), rot=(0, math.pi / 2, 0), segs=24, r2=0.25))
        parts.append(box(f"{name}_pylon{side}", (2.4, 0.25, 0.9), (ex - 0.4, ey, zc - 1.35), body_m, bevel=0.08))
        if not simple:
            # main gear
            parts.append(cyl(f"{name}_strut{side}", 0.09, 2.0, (-0.4, side * 2.9, 1.1), METAL and M("metal", METAL, rough=0.3, metal=0.9)))
            for dy in (-0.25, 0.25):
                parts.append(cyl(f"{name}_wheel{side}{dy}", 0.55, 0.32, (-0.4, side * 2.9 + dy, 0.55), dark_m, rot=(math.pi / 2, 0, 0)))
    parts.append(slab(f"{name}_fin", (-12.2, 0, zc + 1.6), (-16.9, 0, zc + 7.6), 5.6, 2.1, 0.42, 0.14, liv_m, vertical=True))
    if not simple:
        parts.append(cyl(f"{name}_nosegear", 0.07, 2.2, (14.2, 0, 1.1), M("metal", METAL, rough=0.3, metal=0.9)))
        parts.append(cyl(f"{name}_nosewheel", 0.38, 0.3, (14.2, 0, 0.38), dark_m, rot=(math.pi / 2, 0, 0)))
    # cabin windows: two rows of small rounded dark rectangles (array)
    for side in (1, -1):
        w = box(f"{name}_win{side}", (0.24, 0.06, 0.34), (11.2, side * (R * 0.985), zc + 0.45), win_m, bevel=0.1, segs=3)
        arr = w.modifiers.new("Arr", "ARRAY")
        arr.count = 38 if not simple else 30
        arr.relative_offset_displace = (-2.2, 0, 0)
        parts.append(w)
        # cheat line in livery colour along the lower fuselage
        parts.append(box(f"{name}_stripe{side}", (24.0, 0.04, 0.16), (-0.6, side * (R * 0.94), zc - 0.75), liv_m))
    # cockpit windows
    for side in (1, -1):
        cw = box(f"{name}_cockpit{side}", (0.9, 0.05, 0.38), (16.05, side * 0.75, zc + 0.75), win_m, bevel=0.1, rot=(0, 0, side * math.radians(-28)))
        parts.append(cw)
    # forward door (left side = -Y when nose is +X)
    door_m = M("door", (0.78, 0.77, 0.75, 1), rough=0.35)
    parts.append(box(f"{name}_door", (0.95, 0.05, 1.85), (13.0, -R * 0.99, zc + 0.05), door_m, bevel=0.15, segs=3))
    g = group(name, parts, (0, 0, 0), collection=collection)
    if door_anchor:
        a = anchor(f"{name}_door", (13.0, -R - 0.05, zc - 0.85), collection)
        parent(a, g)
        for nm, p in (("fuel", (0.0, -9.0, zc - 0.6)), ("cockpit", (16.0, -0.9, zc + 0.9)), ("body", (2.0, -R, zc + 1.2)), ("tail", (-14.5, 0, zc + 6.0)),
                      ("engine", (ex, -5.6, zc - 2.05))):
            a = anchor(f"{name}_{nm}", p, collection)
            parent(a, g)
    g.location = loc
    g.rotation_euler = (0, 0, math.radians(yaw))
    return g


def boarding_stairs(name, loc, yaw=0.0, height=2.75, collection=STATIC):
    """Truck-mounted passenger stairs; climbing direction +X (top at the +X end). Origin = bottom step."""
    steel = M("stairs", (0.80, 0.80, 0.79, 1), rough=0.4, metal=0.3)
    tread = M("tread", (0.15, 0.15, 0.16, 1), rough=0.8)
    acc = M("stairs_acc", ORANGE, rough=0.4)
    n = 14
    run = 0.30
    rise = height / n
    parts = []
    for i in range(n):
        parts.append(box(f"{name}_s{i}", (run + 0.02, 1.25, 0.05), (i * run, 0, (i + 1) * rise), tread))
    top_x = n * run
    parts.append(box(f"{name}_platform", (1.3, 1.4, 0.08), (top_x + 0.5, 0, height + 0.02), tread))
    length = math.hypot(top_x, height)
    ang = math.atan2(height, top_x)
    for side in (1, -1):
        parts.append(box(f"{name}_string{side}", (length + 0.4, 0.06, 0.28), (top_x / 2, side * 0.66, height / 2 + 0.05), steel, rot=(0, -ang, 0)))
        parts.append(box(f"{name}_rail{side}", (length + 0.3, 0.05, 0.05), (top_x / 2 - 0.05, side * 0.68, height / 2 + 1.05), acc, bevel=0.02, rot=(0, -ang, 0)))
        for k in range(5):
            xx = k * top_x / 4
            parts.append(box(f"{name}_post{side}{k}", (0.04, 0.04, 1.0), (xx, side * 0.68, xx * height / top_x + 0.55), steel))
        parts.append(box(f"{name}_toprail{side}", (1.3, 0.05, 0.05), (top_x + 0.5, side * 0.7, height + 1.05), acc))
        parts.append(box(f"{name}_toppost{side}", (0.04, 0.04, 1.0), (top_x + 1.1, side * 0.7, height + 0.55), steel))
    parts.append(box(f"{name}_truck", (3.6, 1.8, 0.9), (top_x / 2 - 0.4, 0, 0.6), M("truck", (0.92, 0.92, 0.9, 1), rough=0.4), bevel=0.06))
    for i, (dx, dy) in enumerate(((-1.2, 0.85), (1.6, 0.85), (-1.2, -0.85), (1.6, -0.85))):
        parts.append(cyl(f"{name}_wh{i}", 0.32, 0.25, (top_x / 2 - 0.4 + dx, dy, 0.32), M("planedark", (0.08, 0.08, 0.09, 1)), rot=(math.pi / 2, 0, 0)))
    g = group(name, parts, loc, (0, 0, math.radians(yaw)), collection)
    return g


# ------------------------------------------------------------------ environments
def ground_tarmac(size=400, collection=STATIC):
    m = bpy.data.materials.get("S_tarmac")
    if not m:
        m = M("tarmac", (0.11, 0.105, 0.10, 1), rough=0.55)
        nt = m.node_tree
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = 3.0
        n.inputs["Detail"].default_value = 6
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (0.085, 0.082, 0.08, 1)
        ramp.color_ramp.elements[1].color = (0.14, 0.135, 0.13, 1)
        nt.links.new(n.outputs["Fac"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    g = plane("Tarmac", (size, size), (0, 0, 0), m, collection=collection)
    # painted guide lines
    lm = M("paint", (0.75, 0.55, 0.12, 1), rough=0.6)
    for i, (x, y, w, l, r) in enumerate(((0, -6, 0.2, 80, 0), (14, -20, 0.2, 40, 90))):
        plane(f"Line{i}", (l, w), (x, y, 0.005), lm, rot=(0, 0, math.radians(r)), collection=collection)
    return g


def skyline(y0=120, x_span=(-220, 220), seed=4, collection=STATIC, lit=0.4, dome=True, z0=0.0):
    """Distant city silhouettes (boxes) with a few lit windows, plus an optional dome (the reference sheet's skyline)."""
    rng = random.Random(seed)
    m = M("city", (0.05, 0.045, 0.045, 1), rough=0.9)
    lights = emissive("citylights", (1.0, 0.65, 0.35, 1), 3.0)
    x = x_span[0]
    i = 0
    while x < x_span[1]:
        w = rng.uniform(6, 16)
        h = rng.uniform(8, 38) * (1.4 if rng.random() < 0.12 else 1)
        box(f"Bld{i}", (w, rng.uniform(6, 14), h), (x + w / 2, y0 + rng.uniform(-10, 25), z0 + h / 2), m, collection=collection)
        if rng.random() < lit:
            for k in range(rng.randint(2, 6)):
                box(f"BldL{i}_{k}", (0.8, 0.3, 0.6), (x + rng.uniform(1, w - 1), y0 - 3.2 - 0.1, z0 + rng.uniform(2, h - 2)), lights, collection=collection)
        x += w + rng.uniform(0.5, 4)
        i += 1
    if dome:
        sphere("Dome", 14, (40, y0 + 10, z0 + 30), m, scale=(1, 1, 1.15), collection=collection)
        cyl("DomeDrum", 15, 18, (40, y0 + 10, z0 + 16), m, collection=collection)
        cyl("DomeLantern", 2, 8, (40, y0 + 10, z0 + 48), m, collection=collection)


def terminal(collection=STATIC, glass_y=7.0, length=40.0, seats=True, board=True, outside_plane=True, night=False):
    """Departure lounge facing a full-height glass wall (+Y side) onto the apron. Floor at z=0, character area around origin."""
    floor_m = M("termfloor", (0.36, 0.33, 0.30, 1), rough=0.35, coat=0.15)
    plane("TermFloor", (length, 30), (0, -5, 0.004), floor_m, collection=collection)  # just above the apron plane (no z-fighting)
    mull = M("mullion", (0.06, 0.06, 0.065, 1), rough=0.4, metal=0.6)
    for i in range(int(length / 3.2) + 1):
        x = -length / 2 + i * 3.2
        box(f"Mullion{i}", (0.12, 0.25, 9), (x, glass_y, 4.5), mull, collection=collection)
    for z in (0.15, 3.0, 6.2):
        box(f"Transom{z}", (length, 0.25, 0.12), (0, glass_y, z), mull, collection=collection)
    ceil = M("ceiling", (0.55, 0.53, 0.5, 1), rough=0.8)
    box("Ceiling", (length, 30, 0.3), (0, -5, 9.1), ceil, collection=collection)
    strip = emissive("striplight", (1.0, 0.92, 0.8, 1), 6.0 if not night else 9.0)
    for i in range(6):
        box(f"Strip{i}", (length - 4, 0.12, 0.05), (0, -14 + i * 3.6, 8.92), strip, collection=collection)
    back = M("termwall", (0.32, 0.30, 0.28, 1), rough=0.8)
    box("BackWall", (length, 0.3, 9), (0, -18, 4.5), back, collection=collection)
    for i in range(5):
        cyl(f"Column{i}", 0.35, 9, (-16 + i * 8, -12.5, 4.5), M("column", (0.62, 0.6, 0.57, 1), rough=0.5), collection=collection)
    if seats:
        frame = M("benchframe", (0.1, 0.1, 0.11, 1), rough=0.35, metal=0.7)
        cush = M("benchcush", (0.22, 0.24, 0.27, 1), rough=0.7)
        for r, y in enumerate((2.2, -2.0)):
            for b in range(4):
                x0 = -15 + b * 8.5
                box(f"Bench{r}{b}", (4.2, 0.5, 0.06), (x0, y, 0.45), frame, collection=collection)
                for s in range(6):
                    box(f"Seat{r}{b}{s}", (0.62, 0.52, 0.08), (x0 - 1.75 + s * 0.7, y, 0.5), cush, bevel=0.03, collection=collection)
                    box(f"SeatB{r}{b}{s}", (0.62, 0.08, 0.5), (x0 - 1.75 + s * 0.7, y - 0.27, 0.8), cush, bevel=0.03, rot=(math.radians(10), 0, 0), collection=collection)
                for lx in (-1.9, 1.9):
                    box(f"BenchLeg{r}{b}{lx}", (0.06, 0.45, 0.45), (x0 + lx, y, 0.22), frame, collection=collection)
    if board:
        bx, by = board if isinstance(board, tuple) else (5.0, 4.2)
        box("BoardHousing", (4.4, 0.25, 2.5), (bx, by, 3.6), M("boardhouse", (0.05, 0.05, 0.055, 1), rough=0.4), bevel=0.05, collection=collection)
        screen("board", 4.1, 2.25, (bx, by - 0.14, 3.6), rot=(math.radians(90), 0, 0), color=(0.01, 0.02, 0.05, 1), strength=1.0, collection=collection)
        for dx in (-1.6, 1.6):
            box(f"BoardPole{dx}", (0.06, 0.06, 4.3), (bx + dx, by, 7.0), mull, collection=collection)
    # outside
    ground_tarmac(collection=collection)
    if outside_plane:
        airliner("ParkedPlane", (6, 34, 0), yaw=200, collection=collection, simple=True, door_anchor=False)
        airliner("ParkedPlane2", (-40, 52, 0), yaw=160, collection=collection, simple=True, door_anchor=False)
    skyline(y0=170, collection=collection)


def apartment(collection=STATIC):
    """Small apartment at golden hour: desk facing the camera-left wall, big window behind with the city."""
    wood = M("wood", (0.33, 0.21, 0.13, 1), rough=0.45)
    floor = M("floorwood", (0.25, 0.16, 0.10, 1), rough=0.5)
    wall = M("wall", (0.62, 0.57, 0.50, 1), rough=0.9)
    plane("Floor", (12, 12), (0, 0, 0), floor, collection=collection)
    # back wall (y=+2.4) with a large window opening (built from 4 pieces)
    box("WallL", (3.0, 0.2, 3.2), (-3.3, 2.4, 1.6), wall, collection=collection)
    box("WallR", (3.0, 0.2, 3.2), (3.3, 2.4, 1.6), wall, collection=collection)
    box("WallTop", (3.6, 0.2, 0.7), (0, 2.4, 2.85), wall, collection=collection)
    box("WallBot", (3.6, 0.2, 0.75), (0, 2.4, 0.375), wall, collection=collection)
    box("WallSide", (0.2, 8, 3.2), (-4.7, -1.2, 1.6), wall, collection=collection)
    box("Ceiling", (12, 12, 0.2), (0, 0, 3.3), wall, collection=collection)
    frame = M("winframe", (0.08, 0.075, 0.07, 1), rough=0.4)
    for x in (-1.8, 0, 1.8):
        box(f"WinV{x}", (0.06, 0.12, 1.75), (x, 2.4, 1.625), frame, collection=collection)
    for z in (0.75, 2.5):
        box(f"WinH{z}", (3.6, 0.12, 0.06), (0, 2.4, z), frame, collection=collection)
    # desk + chair + laptop + mug + lamp + plant
    box("DeskTop", (1.6, 0.75, 0.05), (0, 0.9, 0.74), wood, bevel=0.01, collection=collection)
    for dx in (-0.75, 0.75):
        for dy in (0.6, 1.2):
            box(f"DeskLeg{dx}{dy}", (0.05, 0.05, 0.72), (dx, dy, 0.36), M("deskleg", DARK, rough=0.4), collection=collection)
    lap = M("laptop", (0.55, 0.56, 0.58, 1), rough=0.3, metal=0.8)
    box("LaptopBase", (0.34, 0.24, 0.015), (0.0, 0.82, 0.775), lap, bevel=0.006, collection=collection)
    lid = box("LaptopLid", (0.34, 0.012, 0.23), (0.0, 0.95, 0.89), lap, bevel=0.006, rot=(math.radians(-14), 0, 0), collection=collection)
    scr = screen("laptop", 0.31, 0.2, (0.0, 0.942, 0.89), rot=(math.radians(76), 0, 0), color=(0.6, 0.7, 0.8, 1), strength=1.4, collection=collection)
    cyl("Mug", 0.045, 0.1, (0.5, 0.75, 0.82), M("mug", (0.85, 0.83, 0.8, 1), rough=0.3), collection=collection)
    cyl("LampBase", 0.08, 0.02, (-0.6, 1.05, 0.775), M("lamp", DARK, rough=0.4), collection=collection)
    cyl("LampPole", 0.012, 0.45, (-0.6, 1.05, 1.0), M("lamp", DARK, rough=0.4), collection=collection)
    cyl("LampShade", 0.11, 0.14, (-0.6, 1.0, 1.22), M("shade", (0.9, 0.82, 0.68, 1), rough=0.8), r2=0.07, collection=collection)
    d = bpy.data.lights.new("LampLight", "POINT")
    d.energy = 25
    d.color = (1.0, 0.72, 0.45)
    d.shadow_soft_size = 0.1
    lo = bpy.data.objects.new("LampLight", d)
    col(collection).objects.link(lo)
    lo.location = (-0.6, 1.0, 1.16)
    plant("Plant", (1.4, 1.7, 0), collection)
    box("Shelf", (0.9, 0.3, 0.04), (-3.0, 2.2, 1.8), wood, collection=collection)
    for i in range(6):
        box(f"Book{i}", (0.05, 0.22, 0.22 + 0.04 * (i % 3)), (-3.35 + i * 0.07, 2.2, 1.93), M(f"book{i % 3}", [(0.6, 0.3, 0.2, 1), SLATE, TAUPE][i % 3], rough=0.7), collection=collection)
    # chair (character sits on it, seat top ~0.36)
    box("ChairSeat", (0.48, 0.46, 0.06), (0, 0.22, 0.45), M("chair", (0.2, 0.2, 0.21, 1), rough=0.6), bevel=0.02, collection=collection)
    box("ChairBack", (0.46, 0.05, 0.5), (0, -0.04, 0.74), M("chair", (0.2, 0.2, 0.21, 1), rough=0.6), bevel=0.02, rot=(math.radians(8), 0, 0), collection=collection)
    cyl("ChairPole", 0.025, 0.42, (0, 0.22, 0.21), M("lamp", DARK, rough=0.4), collection=collection)
    box("WallFront", (12, 0.2, 3.2), (0, -3.6, 1.6), wall, collection=collection)
    box("WallRight", (0.2, 8, 3.2), (4.7, -1.2, 1.6), wall, collection=collection)
    box("Picture", (0.05, 1.1, 0.75), (4.58, -0.8, 1.7), M("picframe", DARK, rough=0.4), bevel=0.01, collection=collection)
    box("PictureArt", (0.02, 0.98, 0.63), (4.55, -0.8, 1.7), M("picart", (0.72, 0.45, 0.28, 1), rough=0.7), collection=collection)
    box("Sofa", (2.0, 0.85, 0.45), (2.6, -2.7, 0.225), M("sofa", (0.36, 0.33, 0.30, 1), rough=0.9), bevel=0.08, segs=3, collection=collection)
    box("SofaBack", (2.0, 0.25, 0.5), (2.6, -3.15, 0.65), M("sofa", (0.36, 0.33, 0.30, 1), rough=0.9), bevel=0.08, segs=3, collection=collection)
    box("DoorFrame", (1.0, 0.1, 2.2), (-2.4, -3.48, 1.1), M("door2", (0.5, 0.42, 0.34, 1), rough=0.6), bevel=0.02, collection=collection)
    # outside: city
    plane("Street", (2400, 2400), (0, 600, -30), M("street", (0.06, 0.055, 0.05, 1), rough=0.8), collection=collection)
    skyline(y0=420, x_span=(-700, 700), seed=9, collection=collection, lit=0.6, z0=-30)
    return scr


def cabin(collection=STATIC, rows=14, ceiling=True, row0=0, lights=True):
    """Aircraft cabin interior along +X (rows go towards -X from row0 at x=0). 3+3 seating, aisle on y=0. Floor z=0."""
    pitch = 0.78
    shell_m = M("cabinwall", (0.80, 0.78, 0.74, 1), rough=0.6)
    carpet = M("carpet", (0.16, 0.18, 0.22, 1), rough=0.9)
    plane("CabinFloor", (rows * pitch + 8, 3.6), (-(rows * pitch) / 2 + 1, 0, 0), carpet, collection=collection)
    # walls: two curved panels per side (approximated by tilted boxes) + window cutouts glowing
    length = rows * pitch + 8
    xc = -(rows * pitch) / 2 + 1
    for side in (1, -1):
        if not ceiling:  # cutaway: only a low rim, so the seats are visible from above at an angle
            box(f"Rim{side}", (length, 0.12, 0.35), (xc, side * 1.78, 0.175), shell_m, bevel=0.03, collection=collection)
            continue
        box(f"WallLow{side}", (length, 0.08, 1.0), (xc, side * 1.78, 0.5), shell_m, collection=collection)
        box(f"WallMid{side}", (length, 0.08, 0.9), (xc, side * 1.72, 1.4), shell_m, rot=(side * math.radians(10), 0, 0), collection=collection)
        if ceiling:
            box(f"Bin{side}", (length, 0.62, 0.42), (xc, side * 1.35, 1.95), M("bins", (0.86, 0.85, 0.82, 1), rough=0.5), bevel=0.05, collection=collection)
            box(f"BinLip{side}", (length, 0.04, 0.06), (xc, side * 1.03, 1.76), M("binlip", (0.6, 0.6, 0.6, 1), rough=0.4), collection=collection)
        win = emissive("cabinwin", (1.0, 0.72, 0.45, 1), 6.0)
        for r in range(rows + 4):
            x = row0 + 1.2 - r * pitch
            box(f"Win{side}_{r}", (0.24, 0.1, 0.34), (x, side * 1.70, 1.25), win, bevel=0.08, rot=(side * math.radians(10), 0, 0), collection=collection)
    bh = 2.4 if ceiling else 0.35
    box("RearBulkhead", (0.1, 3.6, bh), (xc - length / 2, 0, bh / 2), shell_m, collection=collection)
    box("FrontBulkhead", (0.1, 3.6, bh), (xc + length / 2, 0, bh / 2), shell_m, collection=collection)
    if ceiling:
        box("CabinCeiling", (length, 2.2, 0.08), (xc, 0, 2.25), shell_m, collection=collection)
        if lights:
            box("CeilStrip", (length, 0.1, 0.03), (xc, 0, 2.2), emissive("cabinlight", (1.0, 0.9, 0.78, 1), 4.0), collection=collection)
    seats = {}
    letters = "ABCDEF"
    for r in range(rows):
        x = row0 - r * pitch
        for k, y in enumerate((-1.30, -0.84, -0.38, 0.38, 0.84, 1.30)):
            nm = f"{r + 1}{letters[k]}"
            airline_seat(f"Seat{nm}", (x, y, 0), rot=(0, 0, math.radians(90)), collection=collection, headrest=True)
            seats[nm] = (x, y)
            anchor(f"seat_{nm}", (x, y, 1.25), collection)
    return seats


def gate(collection=STATIC):
    """Boarding gate: desk with a screen, a metal bag sizer, queue posts, window onto a parked plane."""
    terminal(collection=collection, seats=False, board=False, outside_plane=False)
    airliner("GatePlane", (4, 22, 0), yaw=180, collection=collection, simple=False)
    desk = M("gatedesk", (0.75, 0.72, 0.68, 1), rough=0.5)
    box("GateDesk", (2.4, 0.8, 1.05), (3.2, 3.0, 0.525), desk, bevel=0.03, collection=collection)
    box("GateDeskTop", (2.5, 0.9, 0.04), (3.2, 3.0, 1.07), M("gatedesktop", (0.2, 0.2, 0.21, 1), rough=0.3), collection=collection)
    box("GateSignBox", (1.8, 0.12, 1.0), (3.2, 3.6, 2.5), M("boardhouse", (0.05, 0.05, 0.055, 1), rough=0.4), bevel=0.03, collection=collection)
    screen("gate", 1.7, 0.92, (3.2, 3.53, 2.5), rot=(math.radians(90), 0, 0), color=(0.01, 0.02, 0.05, 1), collection=collection)
    # bag sizer: open-top steel frame box 0.55 x 0.40 x 0.20 scaled up (cabin-bag sizer is ~55x40x20 cm) on a plinth
    steel = M("sizer", (0.62, 0.63, 0.65, 1), rough=0.25, metal=1.0)
    sx, sy, sz, base = 0.55, 0.40, 0.20, 0.55
    cx, cy = 0.8, 1.6
    box("SizerPlinth", (0.7, 0.55, base), (cx, cy, base / 2), M("sizerplinth", ORANGE, rough=0.4), bevel=0.02, collection=collection)
    t = 0.02
    for ix in (-1, 1):
        for iy in (-1, 1):
            box(f"SizerPost{ix}{iy}", (t, t, sz), (cx + ix * sx / 2, cy + iy * sy / 2, base + sz / 2), steel, collection=collection)
    for z in (base + t / 2, base + sz):
        for iy in (-1, 1):
            box(f"SizerX{z}{iy}", (sx, t, t), (cx, cy + iy * sy / 2, z), steel, collection=collection)
        for ix in (-1, 1):
            box(f"SizerY{z}{ix}", (t, sy, t), (cx + ix * sx / 2, cy, z), steel, collection=collection)
    anchor("sizer", (cx, cy, base + sz + 0.15), collection)
    for i in range(4):
        cyl(f"QPost{i}", 0.03, 1.0, (-2.5 + i * 1.2, 0.6, 0.5), steel, collection=collection)
        cyl(f"QBase{i}", 0.16, 0.03, (-2.5 + i * 1.2, 0.6, 0.015), steel, collection=collection)
    for i in range(3):
        box(f"QBelt{i}", (1.2, 0.01, 0.05), (-1.9 + i * 1.2, 0.6, 0.93), M("belt", SLATE, rough=0.6), collection=collection)


def stage(collection=STATIC, color=(0.13, 0.11, 0.10, 1), size=40):
    """Seamless cyclorama for 'explanation in the world' shots: floor curving into a back wall."""
    bm = bmesh.new()
    prev = None
    steps = 16
    for i in range(steps + 1):
        a = i / steps * (math.pi / 2)
        r = 6.0
        y = 6 + math.sin(a) * r
        z = r - math.cos(a) * r
        if i == 0:
            pts = [(-size / 2, -size, 0), (size / 2, -size, 0)]
            prev = [bm.verts.new(p) for p in pts]
        cur = [bm.verts.new((-size / 2, y, z)), bm.verts.new((size / 2, y, z))]
        bm.faces.new((prev[0], prev[1], cur[1], cur[0]))
        prev = cur
    top = [bm.verts.new((-size / 2, 12, 30)), bm.verts.new((size / 2, 12, 30))]
    bm.faces.new((prev[0], prev[1], top[1], top[0]))
    m = M("cyc", color, rough=0.65)
    o = mesh_obj("Cyclorama", bm, m, collection)
    return o
