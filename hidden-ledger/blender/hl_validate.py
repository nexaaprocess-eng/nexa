"""Animation validation for V2 shots (HL_VALIDATE=1 blender ... render_shot.py ...). Writes <shot>/validate.json.

Per actor, over every frame of the shot:
  slide_mm      planted foot: travel of its lowest contact point between frames (heel/toe roll is allowed)
  ik_miss_mm    distance between each foot and its IK target (unreachable targets show up here)
  snap_deg      largest per-frame rotation change of any deform bone (pops / snapping)
  floor_mm      lowest point of the feet below the floor (negative = sinking)
  penetration   frames where the body mesh intersects a static set mesh (BVH overlap; floor excluded)
Thresholds are reported as pass/fail flags; numbers are what the QA report quotes.
"""
from __future__ import annotations

import json
import math

import bpy
from mathutils.bvhtree import BVHTree

LIMITS = {"slide_mm": 6.0, "ik_miss_mm": 5.0, "snap_deg": 25.0, "floor_mm": -8.0}


def _bvh(obj, dg):
    oe = obj.evaluated_get(dg)
    me = oe.to_mesh()
    verts = [oe.matrix_world @ v.co for v in me.vertices]
    polys = [tuple(p.vertices) for p in me.polygons]
    oe.to_mesh_clear()
    return BVHTree.FromPolygons(verts, polys) if polys else None


def run(ctx, out):
    sc = bpy.context.scene
    import hl_anim2
    import hl_sets as S
    actors = [a for a in ctx.actors if isinstance(a, hl_anim2.Actor)]
    if not actors:
        return
    statics = [o for o in S.col(S.STATIC).all_objects if o.type == "MESH" and not any(k in o.name for k in ("Floor", "Street", "Ground", "Cyclorama", "Rug", "Runner",
                                                                       # seats: sitting means touching (cushions give)
                                                                       "Sofa", "Mattress", "Duvet", "Seat"))]
    res = {}
    prev = {}
    dg = bpy.context.evaluated_depsgraph_get()
    static_bvh = []
    for o in statics:
        t = _bvh(o, dg)
        if t:
            static_bvh.append((o.name, t))
    for a in actors:
        res[a.rig.name] = {"slide_mm": 0.0, "ik_miss_mm": 0.0, "snap_deg": 0.0, "snap_bone": "", "floor_mm": 0.0, "penetration": []}
    step_pen = max(1, ctx.n // 60)
    for f in range(ctx.n):
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get()
        for a in actors:
            r = res[a.rig.name]
            rig = a.rig
            pbs = rig.pose.bones
            for s in ("L", "R"):
                foot, ik = pbs[f"foot.{s}"], pbs[f"ik_foot.{s}"]
                r["ik_miss_mm"] = max(r["ik_miss_mm"], round((foot.head - ik.head).length * 1000, 2))
                toe, heel = rig.matrix_world @ foot.tail, rig.matrix_world @ foot.head
                fo = a.parts["col"].all_objects.get(f"{a.rig.name[:-3]}_foot.{s}")
                if fo:  # real lowest vertex (a rotated bounding box would dip below the floor on its own)
                    mw = fo.matrix_world
                    lo = min((mw @ v.co).z for v in fo.data.vertices)
                    r["floor_mm"] = min(r["floor_mm"], round(lo * 1000, 1))
                phase = a.log[f]["feet"][s][1] if f < len(a.log) else "stance"
                k = (a.rig.name, s)
                if k in prev and phase == "stance" and prev[k][2] == "stance" and min(toe.z, heel.z) < 0.06:
                    p0 = prev[k][0] if prev[k][0].z < prev[k][1].z else prev[k][1]
                    p1 = toe if toe.z < heel.z else heel
                    r["slide_mm"] = max(r["slide_mm"], round((p1.xy - p0.xy).length * 1000, 2))
                prev[k] = (toe.copy(), heel.copy(), phase)
            for b in pbs:
                if not b.bone.use_deform:
                    continue
                q = b.matrix.to_quaternion()
                kk = (a.rig.name, b.name)
                if kk in prev:
                    d = math.degrees(prev[kk].rotation_difference(q).angle)
                    d = min(d, 360.0 - d)  # q and -q are the same rotation
                    if d > r["snap_deg"]:
                        r["snap_deg"], r["snap_bone"] = round(d, 2), f"{b.name}@{f}"
                prev[kk] = q
            if f % step_pen == 0 and static_bvh:
                body = a.parts.get("body")
                if body:
                    t = _bvh(body, dg)
                    hits = [nm for nm, sb in static_bvh if t and t.overlap(sb)]
                    if hits:
                        r["penetration"].append({"f": f, "with": hits[:4]})
    for nm, r in res.items():
        r["pass"] = (r["slide_mm"] <= LIMITS["slide_mm"] and r["ik_miss_mm"] <= LIMITS["ik_miss_mm"]
                     and r["snap_deg"] <= LIMITS["snap_deg"] and r["floor_mm"] >= LIMITS["floor_mm"] and not r["penetration"])
    (out / "validate.json").write_text(json.dumps({"shot": ctx.id, "frames": ctx.n, "limits": LIMITS, "actors": res}, indent=1))
    print("VALIDATE", ctx.id, json.dumps({k: {kk: v for kk, v in r.items() if kk != "penetration"} | {"pen_frames": len(r["penetration"])} for k, r in res.items()}), flush=True)
