"""Performance animation for the V2 character (hl_char2): footstep-driven walks, IK hands, springs, gaze, face.

Why this replaces hl_anim (episode 004) for the V2 character:
  * ep004 moved the root along a path and swung the legs with sine waves: speed and steps were unrelated, so feet slid.
    Here a walk is planned as FOOTSTEPS (position, yaw, lift and land frames). Each foot is planted in world space
    between steps (IK legs), rolls over the heel at contact and over the toe at push-off, and the body (centre of mass)
    is derived from where the feet are: no sliding by construction, natural speed-up and slow-down, real turns.
  * ep004 blended every bone with one shared ease: everything started and stopped together. Here each channel goes
    through its own critically-damped spring, with per-joint delays (hips lead, chest, head, then hands), so motion
    overlaps and settles with a little follow-through.
  * Hands are IK targets in the chest frame (relaxed poses, gestures) or in the world (reaching, holding props), so the
    character can actually touch and carry things. Props follow the evaluated hand bone.
  * Gaze: eyes jump to a new target first (saccade), the head follows a few frames later and the eyes counter-rotate
    while it does; big gaze shifts trigger a blink. Expressions are continuous parameter blends (brows, lids, mouth).

The rig object stays at the origin; everything is animated in world space (hips bone + IK bones). Shots author
actions with frame numbers, then `bake(n)` simulates frames 0..n-1 in order (springs need the history) and keys
every frame, so any frame range re-renders identically.
"""
from __future__ import annotations

import math
import random

import bpy
from mathutils import Matrix, Vector

import hl_char2 as C

FPS = 30


# ------------------------------------------------------------------ small maths
def clamp(x, a, b):
    return a if x < a else b if x > b else x


def ease_io(t):
    t = clamp(t, 0.0, 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def ease_back(t, s=0.9):
    """In-out with a small anticipation dip at the start and overshoot at the end."""
    t = clamp(t, 0.0, 1.0)
    if t < 0.5:
        u = 2 * t
        return 0.5 * (u * u * ((s + 1) * u - s))
    u = 2 * t - 2
    return 0.5 * (u * u * ((s + 1) * u + s) + 2)


def cycloid(u):
    """0..1 with zero velocity at both ends (swing-foot travel)."""
    u = clamp(u, 0.0, 1.0)
    return u - math.sin(2 * math.pi * u) / (2 * math.pi)


def wrap(a):
    return (a + 180.0) % 360.0 - 180.0


def fwd(yaw):
    r = math.radians(yaw)
    return Vector((math.sin(r), -math.cos(r), 0.0))


def left(yaw):
    r = math.radians(yaw)
    return Vector((math.cos(r), math.sin(r), 0.0))


def yaw_of(v):
    return math.degrees(math.atan2(v.x, -v.y))


class Spring:
    """Critically damped (zeta=1) or slightly under-damped second-order follower, simulated at 4 substeps/frame."""

    def __init__(self, x0, omega=12.0, zeta=1.0):
        self.x = x0
        self.v = x0 * 0
        self.w, self.z = omega, zeta

    def step(self, target, dt=1.0 / FPS, sub=4):
        h = dt / sub
        for _ in range(sub):
            a = (target - self.x) * (self.w * self.w) - self.v * (2 * self.z * self.w)
            self.v = self.v + a * h
            self.x = self.x + self.v * h
        return self.x


# ------------------------------------------------------------------ libraries
# Upper-body poses. Spine-chain values are local euler degrees (x = pitch forward+, y = yaw to the character's left+,
# z = roll). Hands: target offsets from the shoulder in the chest frame, body axes (x = outward, y = forward, z = up);
# "pole": elbow pole direction (x out, y forward, z up); "rot": hand orientation weight (0 = follows the forearm).
RELAX = (0.085, 0.045, -0.50)  # almost straight arm (reach 0.52 m), elbow just soft
POSES = {
    "stand": {},
    "tired": {"spine": (3, 0, 0), "chest": (3, 0, 0), "neck": (2, 0, 0), "head": (3, 0, 0), "handL": (0.075, 0.05, -0.505), "handR": (0.075, 0.05, -0.505)},
    "alert": {"chest": (-3, 0, 0), "neck": (-2, 0, 0)},
    "think": {"chest": (2, 0, 0), "head": (4, 0, -6), "handR": (-0.115, 0.17, 0.065), "poleR": (0.4, -0.3, -0.8),
              "handL": (-0.04, 0.10, -0.24), "poleL": (0.5, -0.5, -0.6)},
    "chin": {"head": (2, 0, -5), "handR": (-0.12, 0.165, 0.085), "poleR": (0.4, -0.2, -0.9)},
    "shrug": {"chest": (-3, 0, 0), "head": (-2, 0, 7), "handL": (0.16, 0.16, -0.27), "handR": (0.16, 0.16, -0.27),
              "poleL": (0.6, -0.4, -0.5), "poleR": (0.6, -0.4, -0.5)},
    "surprised": {"spine": (-3, 0, 0), "chest": (-5, 0, 0), "head": (-5, 0, 0), "handL": (0.10, 0.14, -0.22),
                  "handR": (0.10, 0.14, -0.22)},
    "hands_hips": {"handL": (0.07, -0.01, -0.33), "handR": (0.07, -0.01, -0.33), "poleL": (1.0, -0.2, 0.0),
                   "poleR": (1.0, -0.2, 0.0), "chest": (-2, 0, 0)},
    "scratch": {"head": (3, 0, 9), "handR": (-0.03, 0.04, 0.27), "poleR": (0.9, 0.2, 0.0)},
    "present": {"chest": (3, 0, 0), "handR": (-0.03, 0.30, -0.14), "poleR": (0.6, -0.2, -0.8)},
    "phone": {"head": (14, 0, 0), "neck": (8, 0, 0), "handR": (-0.10, 0.25, -0.13), "poleR": (0.5, -0.2, -0.8),
              "handL": (-0.07, 0.22, -0.16), "poleL": (0.5, -0.2, -0.8)},
    "palms_up": {"handL": (0.12, 0.24, -0.22), "handR": (0.12, 0.24, -0.22), "poleL": (0.5, -0.4, -0.7),
                 "poleR": (0.5, -0.4, -0.7)},
    "explain": {"chest": (2, -4, 0), "handR": (0.02, 0.26, -0.16), "poleR": (0.6, -0.3, -0.7)},
    "slump": {"spine": (9, 0, 0), "chest": (9, 0, 0), "neck": (6, 0, 0), "head": (6, 0, 0), "handL": (0.05, 0.06, -0.48),
              "handR": (0.05, 0.06, -0.48)},
    "sit": {"spine": (2, 0, 0), "handL": (0.02, 0.24, -0.32), "handR": (0.02, 0.24, -0.32), "poleL": (0.5, -0.3, -0.8),
            "poleR": (0.5, -0.3, -0.8)},
    "desk": {"chest": (6, 0, 0), "handL": (0.0, 0.30, -0.26), "handR": (0.0, 0.30, -0.26), "poleL": (0.7, -0.2, -0.7),
             "poleR": (0.7, -0.2, -0.7)},
}
# Expression parameters: brow raise L/R (-1..1), brow inner angle L/R (+ = inner end up = worry, - = frown),
# eye open (1 = normal), squint, mouth curve (+ smile), mouth width, mouth open ("o"), mouth shift (smirk).
E0 = {"browL": 0.0, "browR": 0.0, "angL": 0.0, "angR": 0.0, "open": 1.0, "squint": 0.0, "curve": 0.0, "width": 1.0,
      "oh": 0.0, "shift": 0.0}
EXPR = {
    "neutral": {},
    "curious": {"browL": 0.55, "browR": 0.2, "angL": 0.2, "open": 1.06, "curve": 0.12},
    "confused": {"browL": 0.6, "browR": -0.25, "angL": 0.45, "angR": -0.2, "curve": -0.1, "width": 0.8, "shift": 0.25},
    "surprised": {"browL": 0.95, "browR": 0.95, "angL": 0.25, "angR": 0.25, "open": 1.2, "oh": 0.75, "width": 0.8},
    "frustrated": {"browL": -0.45, "browR": -0.45, "angL": -0.7, "angR": -0.7, "open": 0.9, "squint": 0.3, "curve": -0.55, "width": 0.85},
    "relief": {"browL": 0.25, "browR": 0.25, "angL": 0.45, "angR": 0.45, "open": 0.72, "curve": 0.35},
    "satisfied": {"browL": 0.1, "browR": 0.1, "open": 0.82, "squint": 0.15, "curve": 0.6, "width": 1.08},
    "suspicious": {"browL": -0.5, "browR": 0.25, "angL": -0.4, "open": 0.85, "squint": 0.45, "curve": -0.05, "shift": -0.35, "width": 0.85},
    "realization": {"browL": 0.85, "browR": 0.75, "angL": 0.1, "angR": 0.1, "open": 1.12, "oh": 0.3, "width": 0.85},
    "tired": {"browL": -0.1, "browR": -0.1, "angL": 0.35, "angR": 0.35, "open": 0.72, "curve": -0.12},
    "worried": {"browL": 0.35, "browR": 0.35, "angL": 0.85, "angR": 0.85, "open": 1.04, "curve": -0.35, "width": 0.85},
    "happy": {"browL": 0.3, "browR": 0.3, "open": 0.9, "squint": 0.2, "curve": 0.85, "width": 1.12},
    "polite": {"browL": 0.2, "browR": 0.2, "angL": 0.15, "angR": 0.15, "curve": 0.4},
    "sorry": {"browL": 0.3, "browR": 0.3, "angL": 0.8, "angR": 0.8, "open": 0.95, "curve": -0.2, "width": 0.9},
    "focused": {"browL": -0.2, "browR": -0.2, "angL": -0.15, "angR": -0.15, "open": 0.95, "squint": 0.15},
}

# spring settings per channel: (omega, zeta, delay frames) -> overlap: hips lead, extremities follow
CH = {
    "spine": (13.0, 1.0, 0), "chest": (11.0, 0.95, 1), "neck": (10.0, 0.9, 2), "head": (9.0, 0.85, 3),
    "hand": (10.5, 0.78, 3), "pole": (8.0, 1.0, 3), "face": (17.0, 1.0, 0), "com": (16.0, 0.95, 0),
}

STEP_LEN = 0.47
STEP_W = 0.095      # half distance between the feet
WALK_SPEED = 1.0    # m/s
TOE = Vector((0, -0.15, -0.055))   # toe contact relative to the ankle (foot frame, yaw 0)
HEEL = Vector((0, 0.045, -0.085))  # heel contact


class Foot:
    def __init__(self, pos, yaw):
        self.events = []  # (lift, land, to_pos, to_yaw, clearance)
        self.p0, self.y0 = Vector(pos), yaw

    def pose_at(self, f):
        """Ankle-contact pose: (ground point under the ankle, yaw, pitch (+ heel up), pivot, lift height, phase)."""
        p, y = self.p0.copy(), self.y0
        last_land = -999
        for lift, land, tp, ty, clr in self.events:
            if f < lift:
                # planted; toe-off roll in the last frames before lift
                k = clamp(1 - (lift - f) / 6.0, 0, 1)
                heel = clamp((f - last_land) / 4.0, 0, 1)
                pitch = 22 * ease_io(k) - 10 * (1 - ease_io(heel)) * (last_land > -999)
                piv = "toe" if k > 0 else "heel"
                return p, y, pitch, piv, 0.0, "stance"
            if f < land:
                u = (f - lift) / max(1, land - lift)
                c = cycloid(u)
                pp = p.lerp(tp, c)
                yy = y + wrap(ty - y) * ease_io(u)
                h = clr * math.sin(math.pi * clamp(u * 1.08, 0, 1)) ** 0.8
                pitch = 22 * (1 - u) ** 2 - 12 * clamp((u - 0.55) / 0.45, 0, 1)
                return pp, yy, pitch, "ankle", h, "swing"
            p, y, last_land = tp.copy(), ty, land
        heel = clamp((f - last_land) / 4.0, 0, 1)
        pitch = -10 * (1 - ease_io(heel)) if last_land > -999 else 0.0
        return p, y, pitch, "heel", 0.0, "stance"

    def planted_at(self, f):
        p, y = self.p0.copy(), self.y0
        for lift, land, tp, ty, _ in self.events:
            if f < land:
                return p, y, lift <= f
            p, y = tp.copy(), ty
        return p, y, False

    def last_event_end(self):
        return self.events[-1][1] if self.events else -999


class Actor:
    def __init__(self, rig, parts, seed=1, name=None):
        self.rig, self.parts, self.face = rig, parts, parts["face"]
        self.rng = random.Random(seed)
        self.feet = {}
        self.poses = []      # (frame, pose dict, ease, back)
        self.exprs = []      # (frame, params, ease)
        self.looks = []      # (frame, target or None)
        self.hands = {"L": [], "R": []}  # (frame, world target or None, ease, rot (Matrix or None))
        self.gestures = []   # (f0, f1, {channel: (x, y, z)}) additive, eased with anticipation
        self.holds = []      # (frame, side, obj, release_frame, place_to)
        self.pelvis = []     # (frame, (x, y, z) or None, ease, pitch) pelvis overrides (sitting)
        self.blinks = set()
        self.scale = 1.0
        self.breath = 1.0
        self.props = []      # objects that need per-frame keys
        self.suitcases = []
        self.doors = []
        self.log = []        # validation records per frame

    # ------------------------------------------------------------ authoring: placement and locomotion
    def place(self, xy, yaw=0.0):
        """Initial stance at frame 0 (feet side by side)."""
        c = Vector((xy[0], xy[1], 0))
        for s, sg in (("L", 1), ("R", -1)):
            self.feet[s] = Foot(c + left(yaw) * STEP_W * sg, yaw + sg * 4)
        return self

    def _com_now(self, f):
        pl, yl, _ = self.feet["L"].planted_at(f)
        pr, yr, _ = self.feet["R"].planted_at(f)
        return (pl + pr) / 2, yl + wrap(yr - yl) / 2

    def walk(self, f0, path, speed=WALK_SPEED, end_yaw=None, step=STEP_LEN, clearance=0.065, antic=4):
        """Walk from the current stance through `path` (list of (x, y)), starting at frame f0. Returns the frame at
        which the last foot is down. The last two steps bring the feet together facing `end_yaw` (default: path)."""
        start, yaw0 = self._com_now(f0)
        P = [start] + [Vector((p[0], p[1], 0)) for p in path]
        P = [p for i, p in enumerate(P) if i == 0 or (p - P[i - 1]).length > 1e-3]
        L = [(P[i + 1] - P[i]).length for i in range(len(P) - 1)]
        D = sum(L)

        def at(d):
            d = clamp(d, 0, D)
            acc = 0.0
            for i, l in enumerate(L):
                if d <= acc + l or i == len(L) - 1:
                    t = (d - acc) / (l or 1)
                    seg = (P[i + 1] - P[i]).normalized()
                    # round the corners: blend the tangent over 0.4 m around each joint
                    tan = seg.copy()
                    if i + 1 < len(L) and d > acc + l - 0.4:
                        nxt = (P[i + 2] - P[i + 1]).normalized()
                        tan = seg.lerp(nxt, 0.5 * clamp((d - (acc + l - 0.4)) / 0.4, 0, 1)).normalized()
                    if i > 0 and d < acc + 0.4:
                        prv = (P[i] - P[i - 1]).normalized()
                        tan = prv.lerp(seg, 0.5 + 0.5 * clamp((d - acc) / 0.4, 0, 1)).normalized()
                    return P[i].lerp(P[i + 1], t), tan
                acc += l
            return P[-1], (P[-1] - P[-2]).normalized()

        n = max(1, round((D - 0.5 * step) / step))
        ds = [min(D, 0.55 * step)]
        rest = D - ds[0]
        k = max(1, round(rest / step))
        for i in range(k):
            ds.append(ds[0] + rest * (i + 1) / k)
        T = step / speed * FPS
        # first foot: the one on the outside of the first direction change, else the right
        first_dir = at(0.3)[1]
        turn = wrap(yaw_of(first_dir) - yaw0)
        side = "L" if turn > 25 else "R"
        t_land = f0 + antic
        prev_land = f0 + antic - 0.25 * T
        yaw_end = end_yaw if end_yaw is not None else yaw_of(at(D)[1])
        for i, d in enumerate(ds):
            Ti = T * (1.25 if i == 0 else 1.12 if i == len(ds) - 1 else 1.0) * (1 + self.rng.uniform(-0.03, 0.03))
            p, tan = at(d)
            yw = yaw_of(tan)
            if i == len(ds) - 1:
                yw = yaw_end
                p = P[-1]
            sg = 1 if side == "L" else -1
            land = round(prev_land + Ti)
            lift = round(prev_land + 0.18 * Ti) if i else f0 + antic
            pos = p + left(yw) * STEP_W * sg + fwd(yw) * self.rng.uniform(-0.01, 0.01)
            self.feet[side].events.append((lift, land, pos, yw + sg * 4, clearance))
            prev_land = land
            side = "R" if side == "L" else "L"
        # closing step: trailing foot alongside, facing yaw_end
        sg = 1 if side == "L" else -1
        lift = round(prev_land + 0.15 * T)
        land = round(lift + 0.8 * T)
        self.feet[side].events.append((lift, land, P[-1] + left(yaw_end) * STEP_W * sg, yaw_end + sg * 4, clearance * 0.7))
        self.look_ahead = getattr(self, "look_ahead", []) + [(f0, land)]
        return land

    def turn(self, f0, yaw, step_frames=11):
        """Turn in place by stepping (each foot lifts and re-plants), never by spinning on planted feet."""
        c, y0 = self._com_now(f0)
        d = wrap(yaw - y0)
        n = max(1, math.ceil(abs(d) / 55))
        f = f0
        order = ("L", "R") if d > 0 else ("R", "L")
        for i in range(n):
            yi = y0 + d * (i + 1) / n
            for j, s in enumerate(order):
                sg = 1 if s == "L" else -1
                lift = f + j * round(step_frames * 0.55)
                land = lift + step_frames
                self.feet[s].events.append((lift, land, c + left(yi) * STEP_W * sg, yi + sg * 4, 0.045))
            f = f + round(step_frames * 1.1)
        return f + round(step_frames * 0.6)

    def shift(self, f0, side, dxy, dyaw=0.0, frames=12):
        """A single small step (weight shift / adjust stance)."""
        p, y, _ = self.feet[side].planted_at(f0)
        self.feet[side].events.append((f0, f0 + frames, p + Vector((dxy[0], dxy[1], 0)), y + dyaw, 0.04))
        return f0 + frames

    def sit(self, f0, seat, seat_h, frames=26):
        """Lower the pelvis onto a seat point (x, y) at height seat_h; feet stay planted. Returns end frame."""
        self.pelvis.append((f0, (seat[0], seat[1], seat_h + 0.075), frames, 14))
        self.pelvis.append((f0 + frames, (seat[0], seat[1], seat_h + 0.075), 10, 2))
        return f0 + frames

    def stand_up(self, f0, frames=24):
        self.pelvis.append((f0, "lean", frames // 2, 22))
        self.pelvis.append((f0 + frames // 2, None, frames, 0))
        return f0 + frames

    # ------------------------------------------------------------ authoring: acting
    def pose(self, f, name, ease=14, back=False):
        self.poses.append((f, POSES[name] if isinstance(name, str) else name, ease, back))
        return self

    def expr(self, f, name, ease=6):
        p = dict(E0)
        p.update(EXPR[name] if isinstance(name, str) else name)
        self.exprs.append((f, p, ease))
        return self

    def look(self, f, target):
        """Gaze target (world (x, y, z)) or None (ahead). Eyes lead, the head follows."""
        self.looks.append((f, target))
        return self

    def reach(self, f, side, target, ease=14, rot=None):
        """Move a hand to a world point over `ease` frames (None: back to the pose-driven hand)."""
        tg = None if target is None else (target if callable(target) else Vector(target))
        self.hands[side].append((f, tg, ease, rot))
        return self

    def gesture(self, f0, f1, offsets):
        self.gestures.append((f0, f1, offsets))
        return self

    def nod(self, f, amount=9, dur=16):
        return self.gesture(f, f + dur, {"head": (amount, 0, 0), "neck": (amount * 0.3, 0, 0)})

    def shake(self, f, amount=10, dur=24):
        return self.gesture(f, f + dur, {"head": (0, amount, 0), "shake": True})

    def blink(self, f):
        self.blinks.add(f)
        return self

    def hold(self, f, side, obj, until=None, place_to=None):
        """From frame f the object follows the hand (grip = its offset at f); released at `until`, optionally
        travelling to `place_to` (a world matrix) over the next frames."""
        self.holds.append((f, side, obj, until, place_to, None))
        if obj not in self.props:
            self.props.append(obj)
        return self

    def attach(self, f, side, obj, offset=None, until=None, place_to=None):
        """Prop sits in the hand from frame f with a fixed offset (hand-bone space; default: in the palm)."""
        if offset is None:
            offset = Matrix.Translation((0.0, 0.06, -0.03))
        self.holds.append((f, side, obj, until, place_to, offset))
        if obj not in self.props:
            self.props.append(obj)
        return self

    def pull(self, f0, f1, side, case):
        """Pull a wheeled suitcase (hl_hotel.suitcase) with one hand between f0 and f1: the case is solved from the
        hand position each frame (wheels on the floor, handle in the hand); afterwards it rights itself where it is."""
        self.suitcases.append([f0, f1, side, case, None])
        if case not in self.props:
            self.props.append(case)
        return self

    # ------------------------------------------------------------ evaluation helpers
    @staticmethod
    def _keyed(keys, f, default):
        """Eased transition through (frame, value, ease, back) keys -> (a, b, t)."""
        ks = sorted(keys, key=lambda k: k[0])
        if not ks or f < ks[0][0]:
            return default, default, 0.0
        prev = default
        for i, k in enumerate(ks):
            f0, v, ease = k[0], k[1], k[2]
            back = k[3] if len(k) > 3 else False
            nxt = ks[i + 1][0] if i + 1 < len(ks) else None
            if f < f0 + ease and (nxt is None or f < nxt):
                t = (f - f0) / max(1, ease)
                return prev, v, (ease_back(t, 0.6) if back else ease_io(t))
            if nxt is None or f < nxt:
                return v, v, 0.0
            prev = v
        return prev, prev, 0.0

    def _pose_val(self, f, key, default):
        a, b, t = self._keyed(self.poses, f, {})
        va, vb = a.get(key, default), b.get(key, default)
        return tuple(x + (y - x) * t for x, y in zip(va, vb))

    def _gest(self, f, ch):
        out = [0.0, 0.0, 0.0]
        for f0, f1, offs in self.gestures:
            if f0 <= f <= f1 and ch in offs:
                u = (f - f0) / max(1, f1 - f0)
                if offs.get("shake"):
                    w = math.sin(u * 2 * math.pi * 1.5) * (1 - u) ** 1.2
                else:
                    # anticipation (small opposite), main hit, settle
                    w = -0.18 * math.sin(clamp(u / 0.18, 0, 1) * math.pi) if u < 0.18 else math.sin(math.pi * (u - 0.18) / 0.82) ** 1.3
                d = offs[ch]
                for i in range(3):
                    out[i] += d[i] * w
        return out

    def _blink_set(self, n):
        if not hasattr(self, "_auto_blinks"):
            r = random.Random(17 + self.rng.randint(0, 999))
            out, f = [], r.randint(25, 70)
            while f < n + 100:
                out.append(f)
                f += r.randint(75, 150)
            self._auto_blinks = out
        return set(self._auto_blinks) | self.blinks

    # ------------------------------------------------------------ bake
    def bake(self, n, scene=None):
        rig = self.rig
        pbs = rig.pose.bones
        rest = {b.name: b.matrix_local.copy() for b in rig.data.bones}
        springs = {}

        def spr(name, x0, ch):
            if name not in springs:
                w, z, _ = CH[ch]
                springs[name] = Spring(x0, w, z)
            return springs[name]

        blinks = self._blink_set(n)
        prev_gaze = None
        gaze_jump = []
        head_yaw_prev = 0.0
        com_s = None
        held = {}
        for f in range(n):
            # ---------------- feet
            fs = {s: self.feet[s].pose_at(f) for s in ("L", "R")}
            foot_mats = {}
            ground = {}
            for s, (p, y, pitch, piv, h, ph) in fs.items():
                Ry = Matrix.Rotation(math.radians(y), 4, "Z")
                ax = (Ry @ Vector((1, 0, 0)).to_4d()).to_3d()
                ankle_rest = Vector((p.x, p.y, C.ANKLE_H + h))
                if piv in ("toe", "heel") and abs(pitch) > 1e-3:
                    pv = ankle_rest + (Ry @ (TOE if piv == "toe" else HEEL).to_4d()).to_3d()
                    Rp = Matrix.Rotation(math.radians(pitch), 4, ax)
                    ankle = pv + (Rp @ (ankle_rest - pv).to_4d()).to_3d()
                else:
                    Rp = Matrix.Rotation(math.radians(pitch), 4, ax)
                    ankle = ankle_rest
                foot_mats[s] = Matrix.Translation(ankle) @ Rp @ Ry
                ground[s] = (p, y, h, ph)
            # ---------------- support weight and centre of mass
            # weight on the left foot: 1 while the right foot swings, 0 while the left swings, blended in double support
            def swing_u(s):
                for lift, land, *_ in self.feet[s].events:
                    if lift <= f < land:
                        return (f - lift) / max(1, land - lift)
                return None
            uL, uR = swing_u("L"), swing_u("R")
            wl = 0.5 if (uL is None and uR is None) else (0.0 if uL is not None else 1.0)
            pl, pr = ground["L"][0], ground["R"][0]
            mid = (pl + pr) / 2
            stance = pl * wl + pr * (1 - wl)
            com_t = mid.lerp(stance, 0.28)
            yl, yr = ground["L"][1], ground["R"][1]
            facing_t = yl + wrap(yr - yl) / 2
            if com_s is None:
                com_s = Spring(com_t.copy(), 9.0, 1.0)
                yaw_s = Spring(facing_t, 8.0, 1.0)
                wl_s = Spring(wl, 14.0, 1.0)
                vel_s = Spring(Vector((0, 0, 0)), 6.0, 1.0)
                prev_com_t = com_t.copy()
            # a critically damped spring trails a moving target by 2/omega seconds: feed the (smoothed) target
            # velocity forward so the body stays over the feet instead of lagging behind them
            vt = vel_s.step((com_t - prev_com_t) * FPS)
            prev_com_t = com_t.copy()
            com = com_s.step(com_t + vt * (2.0 / com_s.w))
            facing = yaw_s.step(yaw_s.x + wrap(facing_t - yaw_s.x))
            wls = wl_s.step(wl)
            speed = com_s.v.length
            walking = clamp(speed / 0.6, 0, 1)
            single = abs(2 * wls - 1)  # 1 in single support, 0 in double support
            # ---------------- pelvis
            hz = C.STAND_HIPS - 0.012 - 0.026 * walking * (1 - single) + 0.006 * walking * single
            pel = Vector((com.x, com.y, hz))
            pitch_p = 3.0 * walking
            # pelvis overrides (sitting): blend towards the override position
            pk = [(k[0], k[1], k[2], k[3]) for k in self.pelvis]
            if pk:
                a, b, t = self._keyed([(k[0], k, k[2]) for k in pk], f, None)
                def pv_of(k):
                    if k is None or k[1] is None:
                        return None, 0
                    if k[1] == "lean":
                        return "lean", k[3]
                    return Vector(k[1]), k[3]
                va, la = pv_of(a)
                vb, lb = pv_of(b)
                def resolve(v):
                    if v is None:
                        return pel.copy()
                    if v == "lean":
                        prev = [k for k in pk if k[0] < f and k[1] not in (None, "lean")]
                        return Vector(prev[-1][1]) + fwd(facing) * 0.12 if prev else pel.copy()
                    return v
                A, B = resolve(va), resolve(vb)
                pel = A.lerp(B, t)
                # lean forward most in the middle of a sit/stand transition (centre of mass over the feet)
                pitch_p += (la + (lb - la) * t) + 18 * math.sin(math.pi * t) * (t > 0)
            # legs must reach the ankles: lower the pelvis if needed
            hipoff = {s: left(facing) * 0.088 * (1 if s == "L" else -1) for s in ("L", "R")}
            for s in ("L", "R"):
                ank = foot_mats[s].to_translation()
                hip = pel + hipoff[s]
                dxy = Vector((hip.x - ank.x, hip.y - ank.y, 0)).length
                maxz = math.sqrt(max(0.0, (C.LEG_LEN * 0.985) ** 2 - dxy * dxy))
                if hip.z - ank.z > maxz:
                    pel.z = ank.z + maxz
            sway = 3.2 * walking * (wls - 0.5) * 2
            twist = 0.0
            if walking > 0.01:
                dF = (pr - pl).dot(fwd(facing))
                twist = clamp(dF / STEP_LEN, -1, 1) * 6 * walking  # pelvis turns with the forward leg
            Rh = (Matrix.Rotation(math.radians(facing + twist), 4, "Z") @ Matrix.Rotation(math.radians(sway), 4, fwd(facing))
                  @ Matrix.Rotation(math.radians(-pitch_p), 4, left(facing)))
            # the left-axis rotation above is applied in world space, so build it as a proper chain
            Rh = Matrix.Rotation(math.radians(facing + twist), 4, "Z") @ Matrix.Rotation(math.radians(-sway), 4, "Y") @ Matrix.Rotation(math.radians(pitch_p), 4, "X")
            # ---------------- breathing
            br = math.sin(2 * math.pi * f / FPS / 4.0) * self.breath
            # ---------------- spine chain targets
            def chain(ch, extra=(0, 0, 0)):
                d = CH[ch][2]
                v = self._pose_val(f - d, ch, (0, 0, 0))
                g = self._gest(f - d, ch)
                return Vector((v[0] + g[0] + extra[0], v[1] + g[1] + extra[1], v[2] + g[2] + extra[2]))
            lean = 2.5 * walking
            sp_t = chain("spine", (lean * 0.5 - 0.6 * br, -twist * 0.4, sway * 0.4))
            ch_t = chain("chest", (lean * 0.5 - 1.0 * br, -twist * 0.9, sway * 0.5))
            # ---------------- gaze: eyes jump, head follows
            la, lb, lt = self._keyed([(k[0], k[1], 1) for k in self.looks], f, None)
            tgt = lb if lt > 0 or la is None else la
            if tgt is None and getattr(self, "look_ahead", None):
                for a0, a1 in self.look_ahead:
                    if a0 <= f <= a1:
                        tgt = tuple(com + fwd(facing) * 3 + Vector((0, 0, 1.45)))
            head_pos = pel + Vector((0, 0, 0.66))
            if tgt is None:
                gyaw, gpitch = 0.0, 0.0
            else:
                dv = Vector(tgt) - head_pos
                gyaw = clamp(wrap(yaw_of(dv) - facing), -110, 110)
                gpitch = clamp(math.degrees(math.atan2(dv.z, Vector((dv.x, dv.y)).length)), -35, 30)
            if prev_gaze is not None and math.hypot(gyaw - prev_gaze[0], gpitch - prev_gaze[1]) > 25:
                gaze_jump.append(f)
            prev_gaze = (gyaw, gpitch)
            body_yaw = sp_t.y + ch_t.y
            need = gyaw - body_yaw
            # big turns: the chest helps
            ch_t.y += clamp(need - 60, 0, 40) + clamp(need + 60, -40, 0)
            need = gyaw - (sp_t.y + ch_t.y)
            nk_t = chain("neck", (-0.35 * gpitch, 0.35 * need, -sway * 0.5))
            hd_t = chain("head", (-0.55 * gpitch, 0.55 * need, -sway * 0.4))
            sp = spr("spine", sp_t, "spine").step(sp_t)
            chv = spr("chest", ch_t, "chest").step(ch_t)
            nk = spr("neck", nk_t, "neck").step(nk_t)
            hd = spr("head", hd_t, "head").step(hd_t)
            # eyes: whatever the head has not turned yet (saccade, clamped)
            head_yaw_now = sp.y + chv.y + nk.y + hd.y
            eye_yaw = clamp(gyaw - head_yaw_now, -22, 22)
            head_pitch_now = -(nk.x + hd.x) - (sp.x + chv.x) * 0.0
            eye_pitch = clamp(gpitch - head_pitch_now, -12, 12)
            # ---------------- write torso
            hips = pbs["hips"]
            hips.matrix = Matrix.Translation(pel) @ Rh @ rest["hips"].to_3x3().to_4x4()
            for nm, v in (("spine", sp), ("chest", chv), ("neck", nk), ("head", hd)):
                pbs[nm].rotation_euler = (math.radians(v.x), math.radians(v.y), math.radians(v.z))
            # knee poles: in front of the knee, along the foot direction
            for s in ("L", "R"):
                fm = foot_mats[s]
                ank = fm.to_translation()
                y = ground[s][1]
                pk_pos = (pel + hipoff[s] + ank) / 2 + fwd(y) * 0.8
                pbs[f"pole_knee.{s}"].matrix = Matrix.Translation(pk_pos) @ rest[f"pole_knee.{s}"].to_3x3().to_4x4()
                pbs[f"ik_foot.{s}"].matrix = fm @ rest[f"ik_foot.{s}"].to_3x3().to_4x4()
            bpy.context.view_layer.update()
            chest_m = rig.matrix_world @ pbs["chest"].matrix
            chest_rest = rest["chest"]
            to_world = chest_m @ chest_rest.inverted()
            # ---------------- hands
            for s, sg in (("L", 1), ("R", -1)):
                d = CH["hand"][2]
                off = Vector(self._pose_val(f - d, f"hand{s}", RELAX))
                pole = Vector(self._pose_val(f - d, f"pole{s}", (0.45, -0.85, -0.25)))
                # walk arm swing tied to the actual feet: the arm goes forward with the opposite leg
                if walking > 0.01:
                    dF = ((pr if s == "L" else pl) - (pl if s == "L" else pr)).dot(fwd(facing))
                    sw = clamp(dF / STEP_LEN, -1, 1) * walking
                    off = off + Vector((0, 0.15 * sw, 0.03 * abs(sw)))
                for f0p, f1p, sidep, _case, _st in self.suitcases:
                    if sidep == s and f0p - 8 <= f <= f1p:
                        k = clamp((f - (f0p - 8)) / 8.0, 0, 1) * clamp((f1p - f) / 6.0, 0, 1)
                        off = off.lerp(Vector((0.10, -0.14, -0.475)), ease_io(k))
                off.z += 0.004 * br
                sh = Vector(C.J[f"shoulder.{s}"])
                body = Vector((sg * off.x, -off.y, off.z))
                local_t = sh + body
                pole_l = sh + Vector((sg * pole.x, -pole.y, pole.z)) * 0.6
                hs = spr(f"hand{s}", local_t.copy(), "hand")
                hl = hs.step(local_t)
                ps = spr(f"pole{s}", pole_l.copy(), "pole")
                pls = ps.step(pole_l)
                hand_w = to_world @ hl
                pole_w = to_world @ pls
                # world-space reach / hold targets
                ka, kb, kt = self._keyed([(k[0], k[1], k[2]) for k in self.hands[s]], f, None)
                if callable(ka):
                    ka = Vector(ka(f))
                if callable(kb):
                    kb = Vector(kb(f))
                wa = hand_w if ka is None else ka
                wb = hand_w if kb is None else kb
                tgt_w = wa.lerp(wb, kt)
                hw = springs.setdefault(f"reachw{s}", Spring(1.0 if ka is not None or kb is not None else 0.0, 12, 1.0))
                tgt = tgt_w
                ikm = Matrix.Translation(tgt) @ (to_world.to_3x3() @ rest[f"ik_hand.{s}"].to_3x3()).to_4x4()
                pbs[f"ik_hand.{s}"].matrix = ikm
                pbs[f"pole_elbow.{s}"].matrix = Matrix.Translation(pole_w) @ rest[f"pole_elbow.{s}"].to_3x3().to_4x4()
                pbs[f"forearm.{s}"].constraints["ArmIK"].influence = 1.0
                pbs[f"hand.{s}"].constraints["HandRot"].influence = 0.0
            # ---------------- face
            ea, eb, et = self._keyed(self.exprs, f, dict(E0))
            ex_t = {k: ea.get(k, E0[k]) + (eb.get(k, E0[k]) - ea.get(k, E0[k])) * et for k in E0}
            ex = {k: spr("e_" + k, ex_t[k], "face").step(ex_t[k]) for k in E0}
            bl = 0.0
            for b0 in list(blinks) + gaze_jump:
                dd = f - b0
                if 0 <= dd <= 6:
                    bl = max(bl, [0.45, 1.0, 1.0, 0.7, 0.35, 0.12, 0.0][dd])
            self._apply_face(ex, bl, eye_yaw, eye_pitch)
            bpy.context.view_layer.update()
            # ---------------- props (keyed only on frames this actor controls them)
            for h in self.holds:
                h0, side, obj, until, place_to, offset = h
                hand_m = rig.matrix_world @ pbs[f"hand.{side}"].matrix
                key = id(h)
                if f == h0:
                    held[key] = offset if offset is not None else hand_m.inverted() @ obj.matrix_world
                if key in held and h0 <= f and (until is None or f < until):
                    obj.matrix_world = hand_m @ held[key]
                    obj.keyframe_insert("location", frame=f)
                    obj.keyframe_insert("rotation_euler", frame=f)
                elif until is not None and f >= until and place_to is not None:
                    obj.matrix_world = place_to
                    obj.keyframe_insert("location", frame=f)
                    obj.keyframe_insert("rotation_euler", frame=f)
            for sc in self.suitcases:
                f0p, f1p, side, case, st = sc
                if f < f0p:
                    continue
                hand_m = rig.matrix_world @ pbs[f"hand.{side}"].matrix
                grip = hand_m @ Vector((0, 0.05, 0))
                if f <= f1p:
                    hh = case["handle_h"]
                    h = clamp(grip.z - 0.02, 0.3, hh)
                    tilt = math.degrees(math.acos(h / hh))
                    d = math.sqrt(max(0.0, hh * hh - h * h))
                    wpos = Vector((grip.x, grip.y, 0)) - fwd(facing) * d
                    if st is None:
                        sc[4] = st = {"w": Spring(wpos.copy(), 14.0, 0.9), "yaw": facing, "tilt": tilt}
                    w = st["w"].step(wpos)
                    st["yaw"], st["tilt"], st["pos"] = facing, tilt, w
                else:
                    u = clamp((f - f1p) / 10.0, 0, 1)
                    st["tilt_now"] = st["tilt"] * (1 - ease_back(u, 0.4))
                    w = st["pos"]
                tl = st["tilt"] if f <= f1p else st["tilt_now"]
                case.matrix_world = Matrix.Translation(w) @ Matrix.Rotation(math.radians(st["yaw"]), 4, "Z") @ Matrix.Rotation(math.radians(tl), 4, "X")
                case.keyframe_insert("location", frame=f)
                case.keyframe_insert("rotation_euler", frame=f)
            # ---------------- validation records
            self.log.append({
                "f": f, "feet": {s: (tuple(round(v, 4) for v in pbs[f"foot.{s}"].tail), ground[s][3]) for s in ("L", "R")},
                "speed": round(speed, 3),
            })
            # ---------------- keys
            hips.keyframe_insert("location", frame=f)
            hips.keyframe_insert("rotation_quaternion", frame=f) if hips.rotation_mode == "QUATERNION" else hips.keyframe_insert("rotation_euler", frame=f)
            for nm in ("spine", "chest", "neck", "head"):
                pbs[nm].keyframe_insert("rotation_euler", frame=f)
            for s in ("L", "R"):
                for nm in (f"ik_foot.{s}", f"ik_hand.{s}"):
                    pbs[nm].keyframe_insert("location", frame=f)
                    pbs[nm].keyframe_insert("rotation_euler", frame=f)
                for nm in (f"pole_knee.{s}", f"pole_elbow.{s}"):
                    pbs[nm].keyframe_insert("location", frame=f)
            self._key_face(f)
        self._linear()

    # ------------------------------------------------------------ face
    def _apply_face(self, ex, blink, eye_yaw, eye_pitch):
        fc = self.face
        hc = Vector(C.HEAD_C)
        for s, sg in (("L", 1), ("R", -1)):
            piv = fc[f"eyepiv.{s}"]
            piv.rotation_euler = (math.radians(eye_pitch * 0.55), 0, math.radians(eye_yaw * 0.5))
            eye = fc[f"eye.{s}"]
            op = max(0.08, ex["open"] * (1 - 0.35 * ex["squint"])) * (1 - 0.92 * blink)
            eye.scale = (0.022 * (1 + 0.08 * ex["squint"]), 0.010, 0.036 * op)
            if f"browpiv.{s}" in fc:
                bp = fc[f"browpiv.{s}"]
                raise_ = ex["brow" + s] - 0.25 * blink
                bp.rotation_euler = (math.radians(7.5 * raise_), 0, 0)
                br = fc[f"brow.{s}"]
                br.rotation_euler = (math.radians(-28), math.radians(-13 * ex["ang" + s] * sg), br.rotation_euler.z)
        # mouth line: re-projected onto the head surface
        mo = fc["mouth"]
        pts = C.mouth_points(ex["width"] * (1 - 0.45 * ex["oh"]), ex["curve"] * (1 - ex["oh"]))
        sp = mo.data.splines[0]
        for p, (x, z) in zip(sp.points, pts):
            x += ex["shift"] * 0.012
            z += ex["shift"] * 0.006 * (x / 0.03)
            q = C.on_head(x, z - 0.072)
            p.co = (q.x, q.y, q.z, 1)
        oh = fc["mouth_o"]
        r = oh["rest"]
        k = ex["oh"]
        oh.scale = (r[0] * k, r[1] * min(1, k * 2), r[2] * k)

    def _key_face(self, f):
        fc = self.face
        for k, o in fc.items():
            if k.startswith(("eyepiv", "browpiv")):
                o.keyframe_insert("rotation_euler", frame=f)
            elif k.startswith("eye") or k == "mouth_o":
                o.keyframe_insert("scale", frame=f)
            elif k.startswith("brow"):
                o.keyframe_insert("rotation_euler", frame=f)
        for i, p in enumerate(fc["mouth"].data.splines[0].points):
            p.keyframe_insert("co", frame=f)

    def _linear(self):
        objs = [self.rig] + list(self.face.values()) + self.props + [self.face["mouth"].data]
        for o in objs:
            ad = getattr(o, "animation_data", None)
            if ad and ad.action:
                for fc in ad.action.fcurves:
                    for kp in fc.keyframe_points:
                        kp.interpolation = "LINEAR"
