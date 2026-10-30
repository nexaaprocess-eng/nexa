"""Episode 005 — Why Do Hotels Sell Rooms They Don't Have? — 3D shot list (V2 character).

Each shot: id, scene, `from` (first narration segment; the first shot of a scene starts at the scene start) and a
build(ctx) function: set + camera + lights + acting (hl_anim2), returning the camera. Timing comes from the narration
(ctx.at / ctx.word). Remotion (src/scenes/ep005/) draws screens, numbers and labels on the exported anchors.

Staging rules for this episode: the protagonist is seen from the front or three-quarters in nearly every shot, acts
with props (suitcase, phone, bell, key card, door, blocks) and reacts in close-ups; wide shots are for geography.
"""
from __future__ import annotations

import math

import bpy
from mathutils import Matrix, Vector

import hl_hotel as H
import hl_render as R
import hl_sets as S

CHARACTER = "v2"
SHOTS = []


def shot(id, scene, frm=None, uses=()):
    def deco(fn):
        SHOTS.append({"id": id, "scene": scene, "from": frm, "build": fn, "uses": list(uses)})
        return fn
    return deco


# ------------------------------------------------------------------ shared set-ups and bits of business
CLERK_XY = (0.42, 1.78)
DESK_XY = (0.05, 0.46)     # guest standing at the counter
KEYS = ((0.32, 1.40, 0.86), (0.58, 1.40, 0.86))
COUNTER = (0.0, 0.86, 1.09)


def lobby_setup(ctx, variant="main", key=0.5):
    H.lobby(variant=variant)
    H.lobby_lights(key)


def clerk(ctx, name="Clerk", look_screen=True, seed=5):
    c = ctx.person(name, "clerk", seed=seed)
    c.place(CLERK_XY, yaw=0)
    c.pose(0, "stand", ease=1)
    c.expr(0, "focused")
    if look_screen:
        c.look(0, (0.45, 1.2, 1.15))
    return c


def typing(a, f0, f1, fast=False):
    """Both hands on the keyboard, fingers tapping (small, uneven vertical beats), then back."""
    spd = 1.6 if fast else 1.0
    for s, (base, ph) in zip(("L", "R"), ((KEYS[0], 0.0), (KEYS[1], 1.7))):
        def tgt(f, base=base, ph=ph):
            u = f * 0.55 * spd + ph
            return (base[0] + 0.012 * math.sin(u * 0.37), base[1] + 0.006 * math.sin(u * 0.5), base[2] + 0.012 * max(0.0, math.sin(u)) ** 2)
        a.reach(f0, s, tgt, ease=10)
        a.reach(f1, s, None, ease=12)
    a.pose(f0, {"chest": (6, 0, 0), "head": (4, 0, 0)}, ease=12)


def ring_bell(a, f, side="L"):
    """Reach, two quick taps on the desk bell, hand back."""
    bell = (0.62, 0.97, 1.21)
    def tap(ff, f0=f + 10):
        u = ff - f0
        dz = 0.035 * max(0.0, math.sin(u * 0.45)) if 0 <= u < 14 else 0.0
        return (bell[0] + 0.02, bell[1], bell[2] + dz)
    a.reach(f, side, tap, ease=10)
    a.reach(f + 26, side, None, ease=14)


# phone in the left hand: screen towards whoever the character shows it to
PHONE_L = Matrix.Translation((0.0, 0.075, -0.022)) @ Matrix.Rotation(math.radians(90), 4, "X") @ Matrix.Rotation(math.radians(180), 4, "Z")
PRESENT_L = {"handL": (-0.05, 0.33, -0.13), "poleL": (0.6, -0.2, -0.8), "chest": (3, 0, 0)}
READ_PHONE = {"head": (16, 0, 0), "neck": (8, 0, 0), "handL": (-0.08, 0.24, -0.15), "poleL": (0.5, -0.2, -0.9),
              "handR": (-0.10, 0.22, -0.17), "poleR": (0.5, -0.2, -0.9)}
CALL_L = {"handL": (-0.07, 0.03, 0.14), "poleL": (0.6, 0.2, -0.7), "head": (4, 0, -8)}


def stage_setup(ctx, color=(0.11, 0.10, 0.10, 1)):
    S.stage(color=color)
    R.stage_lights(key_power=700, rim_power=520, world=0.06)


# ================================================================== S01 — the room that isn't there
@shot("sh01", "s01", uses=["typing", "clerk"])
def sh01(ctx):
    """Night street. The traveller pulls a suitcase along the sidewalk, slows, turns to the hotel and looks up at the sign."""
    H.street(lit=0.72)
    H.street_lights()
    h = ctx.hero()
    case = H.suitcase(loc=(-6.3, -3.5, 0))
    h.place((-6.0, -3.3), yaw=90)
    h.expr(0, "tired")
    h.pose(0, "tired", ease=1)
    end = h.walk(2, [(-3.0, -3.15), (-0.9, -2.95)], speed=0.85, end_yaw=150)
    h.pull(0, end - 2, "R", case)
    h.look(end - 20, (0.0, -2.4, 3.7))  # the HOTEL sign
    h.expr(end - 10, "relief", ease=10)
    h.nod(end + 6, amount=6, dur=18)
    return R.camera((1.9, -1.6, 1.3), (-2.6, -3.3, 1.35), lens=30)


@shot("sh02", "s01", "s01-02", uses=["lobby_setup", "clerk", "ring_bell"])
def sh02(ctx):
    """Lobby, wide from behind the desk: walks up, parks the suitcase, rings the bell, shows the booking on the phone."""
    lobby_setup(ctx)
    c = clerk(ctx)
    typing(c, 0, ctx.sec(1.2))
    h = ctx.hero()
    case = H.suitcase(loc=(-2.9, -1.5, 0))
    ph = H.phone()
    h.place((-2.6, -1.3), yaw=150)
    h.expr(0, "tired")
    h.attach(0, "L", ph, PHONE_L)
    end = h.walk(0, [(-1.2, -0.3), DESK_XY], speed=0.95, end_yaw=180)
    h.pull(0, end - 3, "R", case)
    h.look(end - 12, (0.4, 1.7, 1.5))
    ring_bell(h, end + 2, side="R")
    c.look(ctx.sec(1.0), (DESK_XY[0], DESK_XY[1], 1.5))
    c.expr(ctx.sec(1.0), "polite")
    c.nod(ctx.sec(1.4))
    f = ctx.word("s01-02", r"phone", frac=0.8)
    h.pose(max(f - 6, end + 14), PRESENT_L, ease=14)
    h.expr(max(f - 2, end + 14), "curious")
    return R.camera((2.7, 2.7, 1.8), (-1.0, -0.4, 0.95), lens=30)


@shot("sh03", "s01", "s01-03", uses=["lobby_setup", "clerk", "typing"])
def sh03(ctx):
    """Over the traveller's shoulder: the clerk types, pauses, frowns, types again (screen drawn by Remotion)."""
    lobby_setup(ctx)
    c = clerk(ctx)
    t_pause = ctx.word("s01-03", r"Pauses", frac=0.4)
    t_again = ctx.word("s01-03", r"again", frac=0.7) - 6
    typing(c, 0, t_pause)
    c.expr(t_pause, "worried", ease=8)
    c.look(t_pause, (0.45, 1.2, 1.2))
    c.gesture(t_pause, t_pause + 18, {"head": (-4, 0, 6)})
    typing(c, t_again, ctx.n + 30, fast=True)
    h = ctx.hero()
    ph = H.phone()
    h.place(DESK_XY, yaw=180)
    h.pose(0, PRESENT_L, ease=1)
    h.attach(0, "L", ph, PHONE_L)
    h.expr(0, "curious")
    h.look(0, (0.45, 1.75, 1.45))
    h.pose(ctx.sec(1.0), {"handL": (0.02, 0.18, -0.30), "poleL": (0.5, -0.4, -0.8)}, ease=18)  # lowers the phone, waits
    return R.camera((-0.50, -0.52, 1.66), (0.42, 1.55, 1.28), lens=42)


@shot("sh04", "s01", "s01-04", uses=["lobby_setup", "clerk"])
def sh04(ctx):
    """Close on the clerk: looks up, 'I'm so sorry', a small shake of the head."""
    lobby_setup(ctx)
    c = clerk(ctx, look_screen=True)
    c.pose(0, {"chest": (6, 0, 0), "head": (4, 0, 0)}, ease=1)
    t = ctx.word("s01-04", r"sorry", frac=0.4)
    c.look(t - 12, (DESK_XY[0], DESK_XY[1], 1.52))
    c.pose(t - 12, {"chest": (0, 0, 0), "handL": (0.0, 0.26, -0.28), "handR": (0.0, 0.26, -0.28),
                    "poleL": (0.6, -0.3, -0.8), "poleR": (0.6, -0.3, -0.8)}, ease=14)
    c.expr(t - 8, "sorry", ease=10)
    c.shake(t + 4, amount=7, dur=26)
    return R.camera((0.05, -0.15, 1.50), (0.40, 1.78, 1.47), lens=70)


@shot("sh05", "s01", "s01-05", uses=["lobby_setup"])
def sh05(ctx):
    """Reverse close-up on the traveller: surprise, a glance at the phone, confusion."""
    lobby_setup(ctx)
    h = ctx.hero()
    ph = H.phone()
    h.place(DESK_XY, yaw=180)
    h.attach(0, "L", ph, PHONE_L)
    h.pose(0, {"handL": (0.02, 0.18, -0.30), "poleL": (0.5, -0.4, -0.8)}, ease=1)
    h.look(0, (0.42, 1.78, 1.5))
    h.expr(0, "curious")
    h.expr(2, "surprised", ease=4)
    h.pose(2, "surprised", ease=8, back=True)
    t = ctx.word("s01-05", r"booked", frac=0.6)
    h.pose(ctx.sec(1.6), {"handL": (-0.06, 0.26, -0.16), "poleL": (0.5, -0.3, -0.8), "head": (14, 0, 0)}, ease=14)
    h.look(ctx.sec(1.6), "phone")
    h.expr(ctx.sec(1.8), "confused", ease=10)
    h.look(t, (0.42, 1.78, 1.5))
    h.pose(t, {"handL": (0.02, 0.2, -0.28), "poleL": (0.5, -0.4, -0.8)}, ease=16)
    h.expr(t + 4, "frustrated", ease=14)
    return R.camera((0.42, 1.95, 1.56), (0.05, 0.46, 1.45), lens=50)


@shot("sh06", "s01", "s01-06", uses=["lobby_setup", "clerk"])
def sh06(ctx):
    """Side two-shot: palms up, a look back at the empty lobby. The question."""
    lobby_setup(ctx)
    c = clerk(ctx)
    c.look(0, (DESK_XY[0], DESK_XY[1], 1.5))
    c.expr(0, "sorry")
    c.pose(0, {"handL": (0.0, 0.26, -0.28), "handR": (0.0, 0.26, -0.28), "poleL": (0.6, -0.3, -0.8), "poleR": (0.6, -0.3, -0.8)}, ease=1)
    h = ctx.hero()
    ph = H.phone()
    h.place(DESK_XY, yaw=180)
    h.attach(0, "L", ph, PHONE_L)
    h.look(0, (0.42, 1.78, 1.5))
    h.expr(0, "frustrated")
    h.pose(4, "palms_up", ease=16, back=True)
    h.look(ctx.sec(2.2), (-4.0, -3.5, 1.2))  # glances back at the lobby
    h.expr(ctx.sec(2.2), "confused")
    h.pose(ctx.sec(2.6), "stand", ease=18)
    h.look(ctx.sec(3.6), (0.42, 1.78, 1.5))
    h.expr(ctx.sec(3.8), "suspicious", ease=10)
    return R.camera((-2.55, 0.05, 1.42), (0.2, 1.05, 1.2), lens=32)


# ================================================================== S02 — a product that expires every night
@shot("sh07", "s02")
def sh07(ctx):
    """Back outside, wide: the facade is the inventory — one window, one night for sale."""
    H.street(lit=0.86)
    H.street_lights()
    h = ctx.hero()
    case = H.suitcase(loc=(-0.95, -3.35, 0))
    h.place((-0.6, -3.6), yaw=-160)
    h.expr(0, "curious")
    h.look(0, (0.0, -0.5, 6.0))
    h.look(ctx.sec(1.6), (-4.0, 0.0, 14.0))
    h.look(ctx.sec(3.4), (4.0, 0.0, 22.0))
    h.pose(ctx.sec(0.8), "hands_hips", ease=16)
    return R.camera((5.0, -17.0, 1.4), (0.0, 0.0, 11.0), lens=24)


@shot("sh08", "s02", "s02-02")
def sh08(ctx):
    """Corridor: the traveller passes an open, dark room, stops, looks in. Tonight it earns nothing; tomorrow it's gone."""
    hinge = H.corridor(open_door=2)
    H.corridor_lights()
    hinge.rotation_euler.z = math.radians(80)
    hinge.keyframe_insert("rotation_euler", frame=0)
    h = ctx.hero()
    h.place((0.1, 12.5), yaw=0)
    h.expr(0, "curious")
    stop = h.walk(2, [(0.15, 9.5), (0.25, 8.2)], speed=0.9, end_yaw=0)
    h.look(stop - 14, (-1.8, 8.0, 1.0))  # into the dark room
    t = h.turn(stop + 8, 40)
    h.pose(stop + 10, "think", ease=16)
    h.expr(stop + 14, "thinking", ease=10)
    t2 = ctx.at("s02-03")
    h.look(t2, (0.0, 2.0, 1.5))
    h.pose(t2 + 6, "explain", ease=14)
    h.expr(t2 + 6, "curious")
    return R.camera((-0.45, 4.2, 1.45), (0.4, 8.6, 1.15), lens=35)


@shot("sh09", "s02", "s02-04", uses=["lobby_setup", "clerk"])
def sh09(ctx):
    """Lobby: on the sofa, the traveller watches a guest check out early and another drag a suitcase back in."""
    lobby_setup(ctx)
    c = clerk(ctx)
    c.look(0, (-0.2, 0.4, 1.5))
    c.expr(0, "polite")
    h = ctx.hero()
    h.place((3.7, -2.85), yaw=180)
    h.expr(0, "tired")
    h.sit(0, (3.75, -3.32), 0.42, frames=1)
    h.pose(0, "sit", ease=1)
    h.look(0, (0.0, 0.5, 1.4))
    g = ctx.person("Guest1", "guest1", seed=11)
    case = H.suitcase(loc=(-0.5, 0.25, 0), color=(0.45, 0.32, 0.18, 1))
    g.place((-0.25, 0.35), yaw=180)
    g.pose(0, {"handR": (0.0, 0.3, -0.15), "poleR": (0.6, -0.3, -0.8)}, ease=1)
    t = ctx.word("s02-05", r"early", frac=0.3)
    gt = g.turn(t - 20, -60)
    end = g.walk(gt, [(-2.5, -1.5), (-5.8, -2.5)], speed=1.1)
    g.pull(gt + 4, ctx.n + 60, "L", case)
    g.nod(t - 30)
    h.look(t, (-3.0, -1.6, 1.3))
    h.expr(t, "curious")
    h.look(ctx.word("s02-05", r"extra", frac=0.6), (0.4, 1.8, 1.4))
    h.expr(ctx.word("s02-05", r"booked", frac=0.8), "realization", ease=8)
    return R.camera((-2.1, 2.5, 1.85), (2.6, -2.6, 0.8), lens=30)


@shot("sh10", "s02", "s02-06", uses=["stage_setup"])
def sh10(ctx):
    """Stage: 100 rooms as blocks. Real bookings data: the traveller walks the grid while Remotion marks cancellations."""
    stage_setup(ctx)
    H.room_blocks(100, cols=10, origin=(0.6, 0.6), pitch=0.46, size=0.36)
    h = ctx.hero()
    h.place((-3.4, 0.2), yaw=90)
    h.expr(0, "curious")
    e = h.walk(4, [(-2.1, 0.0), (-1.9, -0.25)], speed=0.8, end_yaw=150)
    h.look(e - 6, (0.6, 2.5, 0.3))
    t = ctx.at("s02-07")
    h.pose(t, "explain", ease=14)
    h.look(t, (1.5, 2.0, 0.6))
    h.expr(ctx.word("s02-07", r"cancel", frac=0.4), "surprised", ease=6)
    h.pose(ctx.word("s02-07", r"no-show", frac=0.6), "stand", ease=16)
    t3 = ctx.at("s02-08")
    h.expr(t3, "thinking")
    h.pose(t3 + 4, "chin", ease=16)
    h.look(t3 + 30, (-1.0, -6.0, 1.6))
    return R.camera((-4.6, -4.4, 2.3), (-0.2, 1.4, 0.55), lens=30)


@shot("sh11", "s02", "s02-09")
def sh11(ctx):
    """An empty, ready room: lamp on, bed made. Nobody comes. (No character: the absence is the point.)"""
    H.guest_room()
    H.guest_room_lights()
    return R.camera((-1.6, -2.1, 1.55), (0.9, 0.8, 0.6), lens=26)


# ================================================================== S03 — the overbooking bet
@shot("sh12", "s03", uses=["lobby_setup", "clerk", "typing"])
def sh12(ctx):
    """Behind the desk, earlier that week: the clerk accepts booking after booking past 100 (screen by Remotion)."""
    lobby_setup(ctx)
    c = clerk(ctx)
    typing(c, 0, ctx.sec(2.2))
    c.expr(0, "focused")
    t = ctx.at("s03-02")
    c.pose(ctx.sec(2.4), "chin", ease=16)
    c.expr(ctx.sec(2.4), "thinking")
    typing(c, t + 10, ctx.n + 40)
    c.expr(t + 10, "polite")
    return R.camera((1.25, 2.85, 1.72), (0.45, 1.2, 1.12), lens=38)


@shot("sh13", "s03", "s03-03", uses=["stage_setup"])
def sh13(ctx):
    """Stage: a made-up 100-room hotel plus six extra bookings. The traveller presents it, counts, reacts."""
    stage_setup(ctx)
    H.room_blocks(100, cols=10, origin=(0.9, 0.7), pitch=0.46, size=0.36)
    H.room_blocks(6, cols=6, origin=(0.9, -0.6), pitch=0.46, size=0.36, states=["extra"] * 6, name="Extra")
    h = ctx.hero()
    h.place((-2.6, -0.2), yaw=150)
    h.expr(0, "curious")
    h.pose(2, "explain", ease=14, back=True)
    h.look(0, (0.9, 2.5, 0.4))
    h.look(ctx.at("s03-04"), (-4.0, -6.0, 1.5))
    h.pose(ctx.at("s03-04"), "stand", ease=16)
    t5 = ctx.at("s03-05")
    h.look(t5, (0.9, 2.5, 0.3))
    h.pose(t5, "explain", ease=14)
    h.expr(ctx.word("s03-05", r"dark", frac=0.4), "worried", ease=8)
    t6 = ctx.at("s03-06")
    s6 = h.walk(t6, [(-2.0, -0.9)], speed=0.8, end_yaw=150)
    h.look(t6, (0.9, -0.6, 0.3))
    h.pose(s6, {"handR": (0.02, 0.45, -0.05), "poleR": (0.7, 0.0, -0.6), "chest": (3, -10, 0)}, ease=14)  # points at the extras
    h.expr(s6, "realization", ease=8)
    h.pose(ctx.word("s03-06", r"empty", frac=0.7), "stand", ease=16)
    h.expr(ctx.word("s03-06", r"empty", frac=0.8), "satisfied", ease=10)
    return R.camera((-4.2, -4.6, 1.75), (-0.4, 0.8, 0.65), lens=33)


@shot("sh14", "s03", "s03-07", uses=["stage_setup"])
def sh14(ctx):
    """Four columns: rooms, confirmed bookings, expected arrivals, actual arrivals. He walks along and names them."""
    stage_setup(ctx)
    lit = S.M("blocklit", (0.86, 0.80, 0.70, 1), rough=0.5)
    ext = S.M("blockextra", (0.86, 0.42, 0.18, 1), rough=0.5)
    ghost = S.M("ghost", (0.30, 0.28, 0.26, 1), rough=0.6)
    for i, (x, hgt, m) in enumerate(((-1.8, 2.0, lit), (-0.6, 2.12, ext), (0.6, 1.95, lit), (1.8, 1.0, ghost))):
        S.box(f"Col{i}", (0.7, 0.7, hgt), (x, 1.2, hgt / 2), m, bevel=0.04)
        S.anchor(f"col_{i}", (x, 1.2, hgt + 0.05))
    h = ctx.hero()
    h.place((-2.7, -0.3), yaw=100)
    h.expr(0, "curious")
    marks = [ctx.word("s03-07", w, frac=f) for w, f in ((r"physically", 0.35), (r"confirmed", 0.55), (r"expects", 0.72), (r"actually", 0.9))]
    xs = (-1.8, -0.6, 0.6, 1.8)
    prev_end = 0
    for k, (m, x) in enumerate(zip(marks, xs)):
        st = h.walk(max(prev_end + 2, m - 22), [(x - 0.55, -0.15)], speed=0.85, end_yaw=150)
        prev_end = st
        h.look(m - 10, (x, 1.2, 1.0 + 0.4 * k))
        h.pose(min(st, m - 2), {"handR": (0.03, 0.40, 0.02), "poleR": (0.7, 0.0, -0.6)}, ease=10)
        h.pose(m + 14, "stand", ease=12)
    t8 = ctx.at("s03-08")
    h.turn(t8, 180)
    h.look(t8 + 8, (0.0, -6.0, 1.6))
    h.pose(t8 + 10, "palms_up", ease=16)
    h.expr(t8 + 10, "thinking")
    return R.camera((-0.4, -5.3, 1.7), (0.0, 0.8, 0.95), lens=30)


@shot("sh15", "s03", "s03-09", uses=["stage_setup"])
def sh15(ctx):
    """Between two mistakes: a dark, empty room on one side, a guest with nowhere to sleep on the other. He weighs them."""
    stage_setup(ctx, color=(0.10, 0.10, 0.11, 1))
    dark = S.M("blockdark", (0.22, 0.20, 0.19, 1), rough=0.6)
    S.box("EmptyRoom", (0.9, 0.9, 0.9), (-1.6, 0.6, 0.45), dark, bevel=0.05)
    S.anchor("empty_room", (-1.6, 0.6, 1.0))
    g = ctx.person("Guest2", "guest2", seed=12)
    gc = H.suitcase(loc=(1.85, 0.75, 0), color=(0.30, 0.20, 0.32, 1))
    g.place((1.6, 0.6), yaw=-150)
    g.expr(0, "neutral")
    g.pose(0, "hands_hips", ease=1)
    S.anchor("walked_guest", (1.6, 0.6, 1.9))
    h = ctx.hero()
    h.place((0.0, -0.4), yaw=180)
    h.expr(0, "thinking")
    h.pose(0, "chin", ease=1)
    h.look(4, (-1.6, 0.6, 0.9))
    h.look(ctx.word("s03-09", r"guest", frac=0.6), (1.6, 0.6, 1.5))
    t10 = ctx.at("s03-10")
    h.turn(t10 - 4, 0)
    h.look(t10 + 6, (0.0, -6.0, 1.6))
    h.pose(t10 + 6, "explain", ease=14)
    h.expr(t10 + 6, "curious")
    h.expr(ctx.word("s03-10", r"predictable", nth=0, frac=0.6), "satisfied", ease=10)
    return R.camera((0.0, -4.4, 1.55), (0.0, 0.3, 1.0), lens=32)


# ================================================================== S04 — when too many guests show up
@shot("sh16", "s04", uses=["lobby_setup", "clerk"])
def sh16(ctx):
    """Earlier tonight: guests arrive one by one, take a key card and head for the elevator. Then he walks in."""
    lobby_setup(ctx)
    c = clerk(ctx)
    c.look(0, (0.0, 0.4, 1.5))
    c.expr(0, "polite")
    starts = (0, ctx.sec(2.0), ctx.sec(4.0))
    for i, (st, sty) in enumerate(zip(starts, ("guest1", "guest2", "guest3"))):
        g = ctx.person(f"Guest{i + 1}", sty, seed=20 + i)
        card = H.keycard(f"Card{i}")
        card.location = (-0.75, 0.98, 1.12)
        g.place((-3.2 - i * 0.7, -1.9 + i * 0.3), yaw=120)
        a = g.walk(st, [(-1.6, -0.3), (-0.62, 0.40)], speed=1.15, end_yaw=180)
        g.reach(a + 2, "L", (-0.75, 0.98, 1.12), ease=10)
        g.hold(a + 12, "L", card)
        g.reach(a + 16, "L", None, ease=12)
        g.walk(a + 20, [(1.2, -0.2), (3.0, 0.2), (6.2, 1.6)], speed=1.15)
        c.look(a - 6, (-0.62, 0.4, 1.5))
        c.nod(a + 4)
    h = ctx.hero()
    case = H.suitcase(loc=(-6.1, -2.7, 0))
    h.place((-6.2, -2.5), yaw=90)
    h.expr(0, "tired")
    t = ctx.at("s04-03") + ctx.sec(1.2)
    e = h.walk(t, [(-4.0, -2.0), (-2.2, -1.2)], speed=0.9)
    h.pull(t, ctx.n + 60, "R", case)
    h.look(t + 10, (0.0, 1.0, 1.5))
    return R.camera((3.9, -4.6, 2.3), (-1.0, 0.0, 0.9), lens=26)


@shot("sh17", "s04", "s04-04")
def sh17(ctx):
    """Outside again: every window lit. He reaches the door; on about one night in seven, someone gets this reception."""
    H.street(lit=1.0, seed=5)
    H.street_lights()
    h = ctx.hero()
    case = H.suitcase(loc=(-2.6, -3.7, 0))
    h.place((-2.4, -3.5), yaw=115)
    h.expr(0, "tired")
    e = h.walk(0, [(-0.8, -2.6), (-0.1, -1.0)], speed=0.85, end_yaw=180)
    h.pull(0, e - 2, "R", case)
    h.look(4, (0.0, 0.0, 12.0))
    return R.camera((6.5, -15.5, 1.3), (0.0, -1.0, 9.0), lens=24)


@shot("sh18", "s04", "s04-05", uses=["lobby_setup", "clerk", "typing"])
def sh18(ctx):
    """The clerk phones around for a room nearby, typing with the other hand; he waits, fingers drumming on the counter."""
    lobby_setup(ctx)
    c = clerk(ctx)
    cph = H.phone("ClerkPhone")
    c.attach(0, "L", cph, PHONE_L)
    c.pose(0, CALL_L, ease=1)
    c.expr(0, "worried")
    c.look(0, (0.45, 1.2, 1.15))
    def key_r(f):
        u = f * 0.55
        return (0.58, 1.40, 0.86 + 0.012 * max(0.0, math.sin(u)) ** 2)
    c.reach(0, "R", key_r, ease=1)
    c.look(ctx.sec(2.5), (DESK_XY[0], DESK_XY[1], 1.5))
    c.nod(ctx.sec(2.8), amount=5)
    c.look(ctx.sec(4.0), (0.45, 1.2, 1.15))
    h = ctx.hero()
    h.place((-0.35, 0.42), yaw=170)
    h.expr(0, "frustrated")
    def drum(f):
        u = f * 0.9
        return (-0.28, 0.82, 1.10 + 0.018 * max(0.0, math.sin(u)) ** 3)
    h.reach(4, "R", drum, ease=12)
    h.look(0, (0.42, 1.78, 1.5))
    t = ctx.at("s04-06")
    h.reach(t, "R", None, ease=14)
    h.pose(t + 4, "hands_hips", ease=16)
    h.expr(t + 10, "suspicious")
    return R.camera((-1.35, 2.25, 1.62), (-0.2, 0.45, 1.25), lens=34)


@shot("sh19", "s04", "s04-07", uses=["lobby_setup"])
def sh19(ctx):
    """Close: he thumbs out a review on the phone (stars drawn by Remotion), then thinks better of finishing it."""
    lobby_setup(ctx)
    h = ctx.hero()
    ph = H.phone()
    h.place((-0.9, -0.4), yaw=200)
    h.attach(0, "L", ph, PHONE_L)
    h.pose(0, READ_PHONE, ease=1)
    h.look(0, "phone")
    h.expr(0, "frustrated")
    t = ctx.word("s04-07", r"never", frac=0.5)
    h.expr(t, "sorry", ease=12)
    h.pose(t + 6, {"handL": (0.02, 0.18, -0.30), "poleL": (0.5, -0.4, -0.8)}, ease=18)
    h.look(t + 8, (0.6, 1.8, 1.5))
    return R.camera((-1.45, 1.15, 1.5), (-0.9, -0.4, 1.36), lens=45)


# ================================================================== S05 — overbooking is a bet
def scale_set(ctx):
    """Balance: post + beam (DYNAMIC, keyed per shot) with two pans; block piles on the stage floor."""
    stage_setup(ctx)
    brass = S.M("brass", (0.80, 0.60, 0.30, 1), rough=0.25, metal=1.0)
    S.cyl("ScalePost", 0.06, 1.5, (0.0, 1.0, 0.75), brass)
    S.cyl("ScaleBase", 0.35, 0.06, (0.0, 1.0, 0.03), brass)
    beam = bpy.data.objects.new("Beam", None)
    S.col(S.DYNAMIC).objects.link(beam)
    beam.location = (0.0, 1.0, 1.52)
    parts = [S.box("BeamBar", (2.2, 0.06, 0.06), (0, 0, 0), brass, collection=S.DYNAMIC)]
    for side, x in (("A", -1.0), ("B", 1.0)):
        parts.append(S.cyl(f"Pan{side}", 0.32, 0.04, (x, 0, -0.55), brass, collection=S.DYNAMIC))
        parts.append(S.box(f"Rod{side}", (0.02, 0.02, 0.55), (x, 0, -0.27), brass, collection=S.DYNAMIC))
    for p in parts:
        p.parent = beam
    dark = S.M("blockdark", (0.22, 0.20, 0.19, 1), rough=0.6)
    for i in range(4):
        S.box(f"PanABlock{i}", (0.18, 0.18, 0.18), (-1.0 + (i - 1.5) * 0.12, 0, -0.44 + 0.0 * i), dark, collection=S.DYNAMIC).parent = beam
    S.anchor("pan_A", (-1.0, 1.0, 1.4))
    S.anchor("pan_B", (1.0, 1.0, 1.4))
    return beam


def beam_keys(beam, keys):
    for f, deg in keys:
        beam.rotation_euler.y = math.radians(deg)
        beam.keyframe_insert("rotation_euler", frame=f)


@shot("sh20", "s05", uses=["stage_setup", "scale_set", "beam_keys"])
def sh20(ctx):
    """The trade-off on a scale: he picks up a guest token, carries it to pan B; the beam tips, then settles."""
    beam = scale_set(ctx)
    orange = S.M("blockextra", (0.86, 0.42, 0.18, 1), rough=0.5)
    token = S.box("Token", (0.16, 0.16, 0.16), (2.4, 0.15, 0.78), orange, bevel=0.02, collection=S.DYNAMIC)
    S.box("TokenStand", (0.4, 0.4, 0.7), (2.4, 0.15, 0.35), S.M("standgrey", (0.30, 0.28, 0.26, 1), rough=0.6), bevel=0.02)
    h = ctx.hero()
    h.place((1.9, -0.8), yaw=150)
    h.expr(0, "curious")
    h.look(0, (0.0, 1.0, 1.3))
    tB = ctx.at("s05-03")
    h.look(tB - 20, (2.4, 0.15, 0.8))
    s1 = h.turn(tB - 16, 120)
    h.reach(tB - 4, "R", (2.4, 0.15, 0.82), ease=12)
    h.hold(tB + 8, "R", token)
    h.reach(tB + 12, "R", None, ease=12)
    e = h.walk(tB + 16, [(1.25, 0.35)], speed=0.7, end_yaw=180)
    h.look(e - 10, (1.0, 1.0, 1.0))
    drop = e + 4
    place = Matrix.Translation((1.0, 1.0, 1.06))
    h.reach(drop, "R", (1.0, 0.95, 1.12), ease=14)
    h.holds[-1] = (tB + 8, "R", token, drop + 14, place, None)
    h.reach(drop + 18, "R", None, ease=14)
    h.expr(drop + 18, "satisfied")
    t4 = ctx.at("s05-04")
    h.look(t4, (0.0, -6.0, 1.6))
    h.pose(t4 + 4, "explain", ease=14)
    beam_keys(beam, [(0, 9), (drop + 14, 9), (drop + 30, -4), (drop + 40, -1.5), (drop + 48, -2.5)])
    return R.camera((0.2, -4.8, 1.6), (0.4, 0.8, 1.0), lens=32)


@shot("sh21", "s05", "s05-05", uses=["stage_setup", "scale_set", "beam_keys"])
def sh21(ctx):
    """Bad season: the beam swings against him. Hand to forehead; then a shrug at 'revenue, not profit'."""
    beam = scale_set(ctx)
    h = ctx.hero()
    h.place((-1.15, -0.2), yaw=200)
    h.expr(0, "satisfied")
    h.look(0, (0.0, 1.0, 1.4))
    t = ctx.word("s05-05", r"three guests", frac=0.7)
    beam_keys(beam, [(0, -2.5), (t - 10, -2.5), (t + 8, 11), (t + 18, 8), (t + 26, 9.5)])
    h.expr(t, "surprised", ease=4)
    h.pose(t, "surprised", ease=8, back=True)
    h.pose(t + 16, {"handR": (-0.10, 0.15, 0.30), "poleR": (0.8, 0.2, -0.4), "head": (8, 0, 0)}, ease=14)  # hand to forehead
    h.expr(t + 16, "frustrated")
    t6 = ctx.at("s05-06")
    h.look(t6, (0.0, -6.0, 1.6))
    h.pose(t6, "stand", ease=16)
    h.expr(t6 + 4, "suspicious")
    t7 = ctx.at("s05-07")
    h.pose(t7, "shrug", ease=14, back=True)
    h.expr(t7, "confused")
    h.pose(t7 + ctx.sec(2.0), "stand", ease=18)
    return R.camera((-0.3, -4.0, 1.55), (-0.45, 0.6, 1.15), lens=33)


@shot("sh22", "s05", "s05-08", uses=["stage_setup"])
def sh22(ctx):
    """Lead time: a row of rising columns. He walks from the short one to the tall one; Remotion labels 8% and >50%."""
    stage_setup(ctx)
    lit = S.M("blocklit", (0.86, 0.80, 0.70, 1), rough=0.5)
    for i, pct in enumerate((7.6, 25.2, 36.9, 43.6, 56.5)):
        hgt = 0.15 + pct / 100 * 3.2
        S.box(f"Lead{i}", (0.55, 0.55, hgt), (-1.6 + i * 0.8, 1.3, hgt / 2), lit, bevel=0.03)
        S.anchor(f"lead_{i}", (-1.6 + i * 0.8, 1.3, hgt + 0.05))
    h = ctx.hero()
    h.place((-2.4, 0.2), yaw=120)
    h.expr(0, "curious")
    h.look(0, (-1.6, 1.3, 0.4))
    t = ctx.word("s05-08", r"six months", frac=0.4)
    e = h.walk(max(4, t - 50), [(0.6, 0.15), (1.9, 0.2)], speed=0.9, end_yaw=160)
    h.look(e - 16, (1.6, 1.3, 2.0))
    h.expr(e, "surprised", ease=6)
    h.pose(e + 2, {"handR": (0.03, 0.30, 0.20), "poleR": (0.7, 0.0, -0.5)}, ease=12)
    t9 = ctx.at("s05-09")
    h.pose(t9, "think", ease=16)
    h.expr(t9, "thinking")
    h.look(t9 + 20, (0.0, -6.0, 1.6))
    return R.camera((-0.6, -4.9, 1.75), (0.2, 1.0, 1.15), lens=30)


# ================================================================== S06 — what you're owed
@shot("sh23", "s06", uses=["lobby_setup", "clerk"])
def sh23(ctx):
    """On the lobby sofa, reading up on the phone; a nod at what he finds."""
    lobby_setup(ctx)
    h = ctx.hero()
    ph = H.phone()
    h.place((3.7, -2.85), yaw=180)
    h.sit(0, (3.75, -3.32), 0.42, frames=1)
    h.attach(0, "L", ph, PHONE_L)
    h.pose(0, {"spine": (6, 0, 0)} | READ_PHONE, ease=1)
    h.look(0, "phone")
    h.expr(0, "focused")
    h.expr(ctx.word("s06-02", r"immediate", frac=0.5), "curious", ease=10)
    h.nod(ctx.word("s06-02", r"recorded", frac=0.6), amount=7)
    h.expr(ctx.at("s06-03"), "thinking")
    return R.camera((5.2, -0.6, 1.25), (3.65, -3.0, 0.9), lens=42)


@shot("sh24", "s06", "s06-04", uses=["lobby_setup", "clerk"])
def sh24(ctx):
    """Back at the desk: the clerk has found a room nearby and hands over a voucher card. He takes it."""
    lobby_setup(ctx)
    c = clerk(ctx)
    card = H.keycard("Voucher")
    c.look(0, (DESK_XY[0], DESK_XY[1], 1.5))
    c.expr(0, "sorry")
    c.attach(0, "R", card, Matrix.Translation((0.0, 0.07, -0.02)))
    t = ctx.at("s06-05") + ctx.sec(0.8)
    meet = (0.22, 0.95, 1.18)
    c.reach(t - 16, "R", meet, ease=16)
    h = ctx.hero()
    h.place(DESK_XY, yaw=180)
    h.expr(0, "suspicious")
    h.look(0, (0.42, 1.78, 1.5))
    h.reach(t - 6, "L", (meet[0] - 0.02, meet[1] - 0.06, meet[2]), ease=12)
    c.holds[-1] = (0, "R", card, t + 6, None, Matrix.Translation((0.0, 0.07, -0.02)))
    h.hold(t + 6, "L", card)
    c.reach(t + 10, "R", None, ease=14)
    h.reach(t + 12, "L", None, ease=16)
    h.look(t + 4, (0.2, 0.9, 1.15))
    h.expr(t + 10, "relief", ease=12)
    h.nod(t + 20, amount=6)
    c.expr(t + 12, "polite")
    return R.camera((-0.95, 2.35, 1.66), (0.05, 0.55, 1.3), lens=36)


@shot("sh25", "s06", "s06-06", uses=["lobby_setup", "clerk"])
def sh25(ctx):
    """He photographs the receipt with the phone, double-checks, pockets... keep the records."""
    lobby_setup(ctx)
    c = clerk(ctx)
    c.look(0, (0.45, 1.2, 1.15))
    typing(c, 0, ctx.n + 30)
    receipt = S.box("Receipt", (0.12, 0.17, 0.003), (-0.05, 0.92, 1.087), S.M("paper", (0.92, 0.91, 0.88, 1), rough=0.7))
    h = ctx.hero()
    ph = H.phone()
    h.place(DESK_XY, yaw=180)
    h.attach(0, "L", ph, PHONE_L)
    h.expr(0, "focused")
    h.look(0, (-0.05, 0.92, 1.09))
    h.pose(2, {"handL": (-0.02, 0.36, -0.06), "poleL": (0.6, -0.1, -0.7), "chest": (10, 0, 0), "head": (10, 0, 0)}, ease=16)
    t = ctx.at("s06-07")
    h.pose(t, READ_PHONE, ease=14)
    h.look(t, "phone")
    h.expr(t + 6, "thinking")
    t8 = ctx.at("s06-08")
    h.pose(t8, "stand", ease=16)
    h.look(t8 + 4, (-2.5, -3.2, 1.5))
    h.expr(t8 + 4, "satisfied")
    return R.camera((1.15, 2.25, 1.72), (0.0, 0.6, 1.2), lens=36)


# ================================================================== S07 — the inventory that disappears every night
@shot("sh26", "s07", uses=["lobby_setup", "clerk"])
def sh26(ctx):
    """The second hotel: another desk, a key card, a smile that's half relief."""
    lobby_setup(ctx, variant="alt")
    c = clerk(ctx, name="Clerk2", seed=9)
    card = H.keycard("RoomCard")
    c.attach(0, "R", card, Matrix.Translation((0.0, 0.07, -0.02)))
    c.look(0, (DESK_XY[0], DESK_XY[1], 1.5))
    c.expr(0, "polite")
    meet = (0.22, 0.95, 1.18)
    t = ctx.sec(1.6)
    c.reach(t - 16, "R", meet, ease=16)
    h = ctx.hero()
    case = H.suitcase(loc=(-0.45, 0.25, 0))
    h.place(DESK_XY, yaw=180)
    h.expr(0, "tired")
    h.look(0, (0.42, 1.78, 1.5))
    h.reach(t - 6, "R", (meet[0] - 0.02, meet[1] - 0.06, meet[2]), ease=12)
    c.holds[-1] = (0, "R", card, t + 6, None, Matrix.Translation((0.0, 0.07, -0.02)))
    h.hold(t + 6, "R", card)
    c.reach(t + 10, "R", None, ease=14)
    h.reach(t + 12, "R", None, ease=16)
    h.expr(t + 8, "relief", ease=12)
    h.nod(t + 16, amount=8)
    c.nod(t + 18)
    return R.camera((-0.9, 2.4, 1.66), (0.05, 0.5, 1.35), lens=38)


@shot("sh27", "s07", "s07-02", uses=[])
def sh27(ctx):
    """Corridor: walks to the door, taps the key card on the reader, pushes the door open and goes in."""
    hinge = H.corridor(open_door=2)
    H.corridor_lights()
    h = ctx.hero()
    card = H.keycard("RoomCard")
    case = H.suitcase(loc=(0.15, 1.2, 0))
    h.place((0.15, 1.5), yaw=180)
    h.attach(0, "L", card, Matrix.Translation((0.0, 0.07, -0.02)))
    h.expr(0, "tired")
    e = h.walk(2, [(0.0, 6.6), (-0.52, 8.05)], speed=0.9, end_yaw=-90)
    h.pull(2, e - 3, "R", case)
    hx, hy = hinge.location.x, hinge.location.y
    reader = (hx + 0.04, hy + 0.86, 1.22)
    h.look(e - 10, reader)
    h.reach(e + 2, "L", (reader[0] + 0.05, reader[1], reader[2]), ease=12)
    h.reach(e + 22, "L", None, ease=12)
    h.expr(e + 14, "relief")
    t_open = e + 30

    def ang(f):
        return 70.0 * (0.5 - 0.5 * math.cos(math.pi * min(1.0, max(0.0, (f - t_open) / 24))))

    for f in range(0, ctx.n, 2):
        hinge.rotation_euler.z = math.radians(ang(f))
        hinge.keyframe_insert("rotation_euler", frame=f)

    def handle(f):
        a = math.radians(ang(f))
        x, y = 0.05, 0.86
        return (hx + x * math.cos(a) - y * math.sin(a) + 0.05, hy + x * math.sin(a) + y * math.cos(a), 1.0)

    h.reach(t_open - 8, "R", handle, ease=8)
    h.reach(t_open + 26, "R", None, ease=12)
    h.look(t_open + 10, (-2.6, hy + 0.5, 1.2))
    h.walk(t_open + 30, [(-1.3, hy + 0.62), (-2.4, hy + 0.75)], speed=0.8)
    return R.camera((0.55, 11.8, 1.6), (-0.6, 7.4, 1.15), lens=34)


@shot("sh28", "s07", "s07-04", uses=[])
def sh28(ctx):
    """The room: he sits on the edge of the bed, exhales, looks out at the city. Satisfied, finally."""
    H.guest_room()
    H.guest_room_lights()
    h = ctx.hero()
    h.place((-0.9, -1.6), yaw=150)
    h.expr(0, "tired")
    h.look(0, (0.4, 0.2, 0.6))
    s = h.walk(2, [(-0.1, -0.4), (0.12, 0.22)], speed=0.8, end_yaw=-90)
    sit_end = h.sit(s + 4, (0.5, 0.22), 0.52, frames=28)
    h.pose(sit_end - 6, "sit", ease=18)
    h.expr(sit_end, "relief", ease=12)
    h.gesture(sit_end + 6, sit_end + 40, {"chest": (-6, 0, 0), "head": (-6, 0, 0)})  # a long exhale
    h.look(sit_end + 30, (-0.6, 2.5, 1.5))
    t5 = ctx.at("s07-05")
    h.expr(t5, "thinking")
    t6 = ctx.at("s07-06")
    h.expr(t6, "satisfied", ease=14)
    h.look(t6 + 10, (-1.5, -2.0, 1.4))
    return R.camera((-1.4, -1.9, 1.35), (0.55, 0.3, 0.85), lens=30)
