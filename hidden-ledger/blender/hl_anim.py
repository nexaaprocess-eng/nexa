"""Character animation for Hidden Ledger shots: a small, deterministic acting system.

A shot describes WHAT the character does on a timeline (frames are shot-local, 30 fps):
    act = Acting(rig, face, fps=30)
    act.place(0, (0, 0), yaw=0)                 # root position on the floor (x, y) + facing (deg, 0 = faces -Y / camera)
    act.walk(30, 90, [(0, 0), (2, -1)])         # walk along a path between frames 30 and 90 (procedural cycle)
    act.pose(0, "stand"); act.pose(40, "think", ease=12)
    act.expr(0, "neutral"); act.expr(45, "surprised")
    act.look(50, (1.5, -3, 1.4))               # head/eyes turn towards a world point (None = straight ahead)
    act.bake(frames)                            # writes keyframes on exactly the frames that get rendered

Layered per frame: base pose (eased blend between pose keys) + walk cycle + breathing + weight shift + head look +
expression (brows/eyes/mouth, eased) + automatic blinks. Everything is a pure function of the frame number, so any
frame can be re-rendered alone and match its neighbours (resumable renders).
"""
from __future__ import annotations

import math
import random

from mathutils import Euler, Vector

from hl_char import EXPRESSIONS, POSES


def smooth(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ease_io(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 0.5 - 0.5 * math.cos(math.pi * t)


class Acting:
    def __init__(self, rig, face, fps=30, seed=1, scale=1.0):
        self.rig, self.face, self.fps = rig, face, fps
        self.poses: list[tuple[int, dict, int]] = []
        self.exprs: list[tuple[int, str, int]] = []
        self.looks: list[tuple[int, object, int]] = []
        self.places: list[tuple[int, tuple, float, float]] = []  # frame, (x, y), yaw, z
        self.walks: list[tuple[int, int, list, float]] = []
        self.overrides: list[tuple[int, int, dict]] = []  # additive bone offsets over a frame range (gestures)
        self.blink_off = set()
        self.rng = random.Random(seed)
        self.scale = scale
        self.breath = 1.0
        self.sitting: list[tuple[int, float]] = []
        self._blinks = None

    # ---------------------------------------------------------------- authoring
    def place(self, f, xy, yaw=0.0, z=0.0):
        self.places.append((f, tuple(xy), float(yaw), float(z)))
        return self

    def walk(self, f0, f1, path, stride=0.5, run=False):
        """Walk through the points of `path` (x, y) between f0 and f1; facing follows the path."""
        self.walks.append((f0, f1, [tuple(p) for p in path], stride * (1.5 if run else 1.0)))
        return self

    def pose(self, f, name_or_dict, ease=10):
        p = POSES[name_or_dict] if isinstance(name_or_dict, str) else name_or_dict
        self.poses.append((f, p, ease))
        return self

    def expr(self, f, name, ease=6):
        self.exprs.append((f, name, ease))
        return self

    def look(self, f, target, ease=12):
        """target: world point (x, y, z), ('yaw', deg, pitch) relative to the body, or None (ahead)."""
        self.looks.append((f, target, ease))
        return self

    def gesture(self, f0, f1, offsets: dict):
        """Additive bone rotation (deg) that eases in/out over [f0, f1] — nods, small hand beats, shrugs."""
        self.overrides.append((f0, f1, offsets))
        return self

    def nod(self, f, amount=8, dur=14):
        return self.gesture(f, f + dur, {"head": (amount, 0, 0), "neck": (amount * 0.4, 0, 0)})

    # ---------------------------------------------------------------- evaluation
    @staticmethod
    def _keyed(keys, f, default):
        """Eased step interpolation through (frame, value, ease) keys. Returns (prev, next, t)."""
        ks = sorted(keys, key=lambda k: k[0])
        if not ks:
            return default, default, 0.0
        prev = ks[0]
        if f <= prev[0]:
            return prev[1], prev[1], 0.0
        for k in ks[1:]:
            if f < k[0]:
                return prev[1], prev[1], 0.0
            if f < k[0] + k[2]:
                return prev[1], k[1], ease_io((f - k[0]) / max(1, k[2]))
            prev = k
        return prev[1], prev[1], 0.0

    def _root(self, f):
        """Root (x, y, yaw, z) and walk phase/speed at frame f."""
        # walking segments override placement while active
        for f0, f1, path, stride in self.walks:
            if f0 <= f <= f1 and len(path) > 1:
                P = [Vector((p[0], p[1], p[2] if len(p) > 2 else 0.0)) for p in path]
                segs = [(P[i], P[i + 1]) for i in range(len(P) - 1)]
                lens = [(b - a).length for a, b in segs]
                total = sum(lens) or 1e-6
                # accelerate/decelerate over the first/last 12 frames
                n = max(1, f1 - f0)
                acc = min(12, n // 3)

                def dist_at(ff):
                    u = (ff - f0)
                    vmax = total / (n - acc)  # trapezoid profile
                    if u < acc:
                        return 0.5 * vmax / acc * u * u
                    if u > n - acc:
                        r = n - u
                        return total - 0.5 * vmax / acc * r * r
                    return 0.5 * vmax * acc + vmax * (u - acc)

                d = max(0.0, min(total, dist_at(f)))
                acc_d = 0.0
                for (a, b), L in zip(segs, lens):
                    if d <= acc_d + L or (a, b) == segs[-1]:
                        t = (d - acc_d) / (L or 1e-6)
                        p = a.lerp(b, max(0, min(1, t)))
                        dirv = (b - a).normalized()
                        break
                    acc_d += L
                yaw = math.degrees(math.atan2(dirv.x, -dirv.y))
                speed = (dist_at(min(f1, f + 1)) - dist_at(max(f0, f - 1))) / 2
                phase = d / stride * math.pi
                return p.x, p.y, yaw, p.z, phase, speed * self.fps / (total / (n / self.fps) or 1)
        # otherwise: last placement (eased between placements), or the end of the last finished walk
        cands = [(pf, (xy[0], xy[1], yaw, z)) for pf, xy, yaw, z in self.places]
        for f0, f1, path, _ in self.walks:
            if f1 < f and len(path) > 1:
                a, b = Vector(path[-2][:2]), Vector(path[-1][:2])
                dv = (b - a).normalized() if (b - a).length > 1e-6 else Vector((0, -1))
                zz = path[-1][2] if len(path[-1]) > 2 else 0.0
                cands.append((f1, (b.x, b.y, math.degrees(math.atan2(dv.x, -dv.y)), zz)))
        cands.sort(key=lambda c: c[0])
        cur = cands[0][1] if cands else (0, 0, 0, 0)
        for i, (pf, val) in enumerate(cands):
            if pf <= f:
                cur = val
                # turning in place to the next placement eases over 14 frames
                nxt = cands[i + 1] if i + 1 < len(cands) else None
                if nxt and nxt[0] - 14 < f < nxt[0] and nxt[0] > pf:
                    t = ease_io((f - (nxt[0] - 14)) / 14)
                    dyaw = (nxt[1][2] - val[2] + 180) % 360 - 180
                    cur = (val[0] + (nxt[1][0] - val[0]) * t, val[1] + (nxt[1][1] - val[1]) * t, val[2] + dyaw * t,
                           val[3] + (nxt[1][3] - val[3]) * t)
        return cur[0], cur[1], cur[2], cur[3], 0.0, 0.0

    def _blink_frames(self, n):
        if self._blinks is None:
            r = random.Random(7)
            out, f = [], r.randint(20, 60)
            while f < n + 200:
                out.append(f)
                f += r.randint(70, 140)
                if r.random() < 0.15:  # occasional double blink
                    out.append(f - r.randint(60, 64))
            self._blinks = sorted(out)
        return self._blinks

    def evaluate(self, f, n_frames=10000):
        """Return (root, bone_rotations{name: (x,y,z) deg}, expression params) for frame f."""
        a, b, t = self._keyed(self.poses, f, POSES["stand"])
        bones = {}
        names = set(a) | set(b)
        for nm in names:
            va, vb = a.get(nm, (0, 0, 0)), b.get(nm, (0, 0, 0))
            bones[nm] = tuple(x + (y - x) * t for x, y in zip(va, vb))

        x, y, yaw, z, phase, speed = self._root(f)
        walking = speed > 0.02

        def add(nm, d):
            cur = bones.get(nm, (0, 0, 0))
            bones[nm] = tuple(c + e for c, e in zip(cur, d))

        root_z = z
        if walking:
            k = min(1.0, speed)
            s = math.sin(phase)
            c = math.cos(phase)
            # legs: thigh swing, knee bend on the forward swing, foot roll
            for side, sg in (("L", 1), ("R", -1)):
                sw = s * sg
                add(f"thigh.{side}", (23 * sw * k, 0, 0))
                knee = 8 + 34 * max(0.0, -math.cos(phase + (0 if sg > 0 else math.pi))) * (0.5 + 0.5 * max(0, sw))
                add(f"shin.{side}", (-knee * k, 0, 0))
                add(f"foot.{side}", (-12 * sw * k, 0, 0))
                # arms counter-swing, elbows soften
                add(f"upper_arm.{side}", (-30 * sw * k, 0, 0))
                add(f"forearm.{side}", (18 * k + 10 * max(0, -sw) * k, 0, 0))
            add("hips", (0, 6 * s * k, 0))
            add("chest", (3 * k, -8 * s * k, 0))
            add("head", (0, 4 * s * k, 0))
            add("spine", (4 * k, 0, 0))
            root_z += (0.022 * abs(c) - 0.01) * k
        # breathing + idle weight shift (always on, tiny)
        tb = f / self.fps
        br = math.sin(2 * math.pi * tb / 4.2) * self.breath
        add("chest", (-1.2 * br, 0, 0))
        add("neck", (0.8 * br, 0, 0))
        add("upper_arm.L", (0, 0, 0.8 * br))
        add("upper_arm.R", (0, 0, -0.8 * br))
        if not walking:
            sway = math.sin(2 * math.pi * tb / 7.3)
            add("hips", (0, 0, 1.0 * sway))
            add("spine", (0, 0, -0.8 * sway))
            add("head", (0.6 * math.sin(2 * math.pi * tb / 5.1), 0.8 * math.sin(2 * math.pi * tb / 6.7), 0))
        # gestures
        for f0, f1, offs in self.overrides:
            if f0 <= f <= f1:
                w = math.sin(math.pi * (f - f0) / max(1, f1 - f0))
                for nm, d in offs.items():
                    add(nm, tuple(v * w for v in d))
        # head look: split between neck (40%) and head (60%)
        la, lb, lt = self._keyed(self.looks, f, None)
        def look_angles(tgt):
            if tgt is None:
                return 0.0, 0.0
            if isinstance(tgt, tuple) and tgt and tgt[0] == "yaw":
                return float(tgt[1]), float(tgt[2]) if len(tgt) > 2 else 0.0
            hx, hy, hz = x, y, root_z + 1.55 * self.scale
            dx, dy, dz = tgt[0] - hx, tgt[1] - hy, tgt[2] - hz
            world_yaw = math.degrees(math.atan2(dx, -dy))
            rel = (world_yaw - yaw + 180) % 360 - 180
            rel = max(-75, min(75, rel))
            pitch = math.degrees(math.atan2(dz, math.hypot(dx, dy)))
            return rel, max(-16, min(30, pitch))  # faces stay readable: the head never drops much below level
        ya, pa = look_angles(la)
        yb, pb = look_angles(lb)
        ly, lp = ya + (yb - ya) * lt, pa + (pb - pa) * lt
        add("neck", (-0.4 * lp, 0.4 * ly, 0))
        add("head", (-0.6 * lp, 0.6 * ly, 0))
        # expression (blend numeric params)
        ea, eb, et = self._keyed(self.exprs, f, "neutral")
        A, B = EXPRESSIONS[ea], EXPRESSIONS[eb]
        ex = {
            "brow_dz": A["brow"][0] + (B["brow"][0] - A["brow"][0]) * et,
            "brow_roll": A["brow"][1] + (B["brow"][1] - A["brow"][1]) * et,
            "brow_asym": A.get("brow_asym", 0) + (B.get("brow_asym", 0) - A.get("brow_asym", 0)) * et,
            "eye": tuple(p + (q - p) * et for p, q in zip(A["eye"], B["eye"])),
            "mouth": (B if et > 0.5 else A)["mouth"],
        }
        # blinks (4-frame close/open), suppressed when explicitly turned off
        blink = 0.0
        for bf in self._blink_frames(n_frames):
            d = f - bf
            if 0 <= d <= 5:
                blink = [0.5, 1.0, 1.0, 0.6, 0.25, 0.0][d]
        # eyes follow the look a little (saccade lead)
        eye_look = (max(-0.012, min(0.012, ly * 0.00022)), max(-0.008, min(0.008, lp * 0.0002)))
        return (x, y, yaw, root_z), bones, ex, blink, eye_look

    # ---------------------------------------------------------------- write keyframes
    def apply_frame(self, f, key=True, n_frames=10000):
        (x, y, yaw, z), bones, ex, blink, eye_look = self.evaluate(f, n_frames)
        rig = self.rig
        rig.location = (x, y, z)
        rig.rotation_euler = (0, 0, math.radians(yaw))
        if key:
            rig.keyframe_insert("location", frame=f)
            rig.keyframe_insert("rotation_euler", frame=f)
        for pb in rig.pose.bones:
            if pb.name == "root":
                continue
            r = bones.get(pb.name, (0, 0, 0))
            pb.rotation_euler = Euler([math.radians(v) for v in r], "XYZ")
            if key:
                pb.keyframe_insert("rotation_euler", frame=f)
        face = self.face
        for s, sx in (("L", 1), ("R", -1)):
            piv = face.get(f"brow.{s}")
            if piv is None:  # extras have eyes only
                piv = None
            elif "rest_loc" not in piv:
                piv["rest_loc"] = list(piv.location)
                piv["rest_rot"] = list(piv.rotation_euler)
            if piv is not None:
                rl = Vector(piv["rest_loc"])
                piv.location = rl + Vector((0, 0, 1.6 * (ex["brow_dz"] + (ex["brow_asym"] if s == "L" else 0))))
                rr = piv["rest_rot"]
                piv.rotation_euler = (rr[0], rr[1] + math.radians(1.5 * ex["brow_roll"]) * sx, rr[2])  # + = inner end up
            eye = face[f"eye.{s}"]
            if "rest_scale" not in eye:
                eye["rest_scale"] = list(eye.scale)
                eye["rest_loc"] = list(eye.location)
            rs = eye["rest_scale"]
            op = max(0.06, 1 - blink)
            eye.scale = (rs[0] * ex["eye"][0], rs[1], rs[2] * ex["eye"][1] * op)
            eye.location = Vector(eye["rest_loc"]) + Vector((eye_look[0], 0, eye_look[1]))
            if key:
                if piv is not None:
                    piv.keyframe_insert("location", frame=f)
                    piv.keyframe_insert("rotation_euler", frame=f)
                eye.keyframe_insert("scale", frame=f)
                eye.keyframe_insert("location", frame=f)
        for k in ("smile", "frown", "flat", "grin", "oh"):
            mo = face.get(f"mouth.{k}")
            if mo is None:
                continue
            if "rest_scale" not in mo:
                mo["rest_scale"] = [1.0, 1.0, 1.0] if k != "oh" else [0.02, 0.012, 0.026]
            mo.scale = tuple(mo["rest_scale"]) if ex["mouth"] == k else (0, 0, 0)
            if key:
                mo.keyframe_insert("scale", frame=f)

    def bake(self, frames):
        frames = list(frames)
        n = max(frames) + 1 if frames else 1
        for f in frames:
            self.apply_frame(f, True, n)
        # constant interpolation: each rendered frame is exactly the evaluated pose
        objs = [self.rig] + list(self.face.values())
        for o in objs:
            ad = o.animation_data
            if ad and ad.action:
                for fc in ad.action.fcurves:
                    for kp in fc.keyframe_points:
                        kp.interpolation = "CONSTANT"
