"""Episode 004 — How Can Airlines Sell Flights for Just $20? — 3D shot list.

Each shot: id, scene, `from` (first narration segment; the first shot of a scene starts at the scene start) and a
build(ctx) function that creates the set, cameras, lights and acting, and returns the camera.
Remotion (src/scenes/ep004/) composites each shot and draws the overlays (screens, numbers, sources) on the anchors
exported here. Illustrative props are labelled on screen by Remotion.
"""
from __future__ import annotations

import math

import hl_render as R
import hl_sets as S

SHOTS = []


def shot(id, scene, frm=None, uses=()):
    def deco(fn):
        SHOTS.append({"id": id, "scene": scene, "from": frm, "build": fn, "uses": list(uses)})
        return fn
    return deco


# ------------------------------------------------------------------ shared set-ups
def apartment_setup(ctx):
    S.apartment()
    sun = R.golden(az=15, elev=7, sun_power=3.6, sky_strength=0.35, fill=False)
    R.area_light("RoomFill", (2.5, -2.5, 2.6), (0, 0.5, 1.0), power=140, size=2.5, color=(0.75, 0.82, 1.0))
    ctx.shadow_dir = R.sun_dir(sun)


def seated_at_desk(h, f0=0):
    h.place(f0, (0, 0.18), yaw=180, z=-0.25)
    h.pose(f0, "sit_type", ease=1)


def tarmac_setup(ctx, az=40, elev=4.5, stairs=True, plane=True):
    S.ground_tarmac()
    S.skyline(y0=230, seed=2)
    if plane:
        S.airliner("Plane", (0, 0, 0), yaw=0)
    if stairs:
        S.boarding_stairs("Stairs", (13.0, -7.4, 0), yaw=90, height=2.2)
    S.airliner("FarPlane", (-60, 70, 0), yaw=160, simple=True, door_anchor=False)
    sun = R.golden(az=az, elev=elev, sun_power=3.4, sky_strength=0.45, lamp_elev=elev + 4)
    ctx.shadow_dir = R.sun_dir(sun)


def terminal_setup(ctx, night=False, board=True):
    S.terminal(board=board, night=night)
    if night:
        sun = R.dusk_night()
        R.area_light("HallFill", (0, -6, 8), (0, 0, 0), power=5000, size=14, color=(1.0, 0.82, 0.62))
        R.area_light("HallPool", (4, -1, 5), (4, 1, 0), power=900, size=3, color=(1.0, 0.78, 0.55))
    else:
        sun = R.golden(az=15, elev=5, sun_power=3.6, sky_strength=0.4, fill=False)
        R.area_light("HallFill", (0, -10, 7), (0, 0, 1), power=9000, size=14, color=(0.8, 0.85, 1.0))
    ctx.shadow_dir = R.sun_dir(sun)


def gate_setup(ctx):
    S.gate()
    sun = R.golden(az=15, elev=5, sun_power=3.6, sky_strength=0.4, fill=False)
    R.area_light("HallFill", (-2, -8, 7), (1, 1, 0.5), power=10000, size=14, color=(0.85, 0.88, 1.0))
    R.area_light("GateKey", (3, -2, 4), (0.5, 1.5, 1), power=500, size=3, color=(1.0, 0.8, 0.6))
    ctx.shadow_dir = R.sun_dir(sun)


def cabin_setup(ctx, rows=12, ceiling=True):
    seats = S.cabin(rows=rows, ceiling=ceiling)
    sun = R.stage_lights(key_power=0, rim_power=0, world=0.02)
    R.area_light("WinSun", (-4, 3.2, 1.5), (-3, 0, 1.0), power=900, size=1.5, color=(1.0, 0.6, 0.32))
    R.area_light("CabinFill", (1.5, 0, 2.1), (-4, 0, 1), power=260, size=3, color=(1.0, 0.92, 0.82))
    ctx.shadow_dir = R.sun_dir(sun)
    return seats


def stage_setup(ctx, color=(0.13, 0.11, 0.10, 1)):
    S.stage(color=color)
    sun = R.stage_lights()
    ctx.shadow_dir = R.sun_dir(sun)


def seat_in_cabin(h, seats, nm, f0=0):
    x, y = seats[nm]
    h.place(f0, (x + 0.06, y), yaw=90, z=-0.2)
    h.pose(f0, "sit", ease=1)


# ================================================================== S01 · Cold open
@shot("sh01", "s01", uses=["apartment_setup", "seated_at_desk"])
def sh01(ctx):
    """Over-the-shoulder at golden hour: the passenger browses flights; '$20' appears on the screen."""
    apartment_setup(ctx)
    h = ctx.hero()
    seated_at_desk(h)
    h.expr(0, "curious")
    h.look(0, (0, 0.94, 0.9))
    t20 = ctx.word("s01-01", r"twenty|20", off=0.0)
    h.gesture(t20 - 2, t20 + 22, {"spine": (-9, 0, 0), "chest": (-6, 0, 0), "head": (-8, 0, 0)})  # recoils a little
    h.expr(t20, "surprised")
    return R.camera((0.95, -1.3, 1.62), (-0.08, 0.94, 0.98), lens=30)


@shot("sh02", "s01", "s01-02", uses=["apartment_setup", "seated_at_desk"])
def sh02(ctx):
    """Front three-quarter: surprise turns into excitement; leans in and books."""
    apartment_setup(ctx)
    h = ctx.hero()
    seated_at_desk(h)
    h.expr(0, "surprised")
    h.look(0, (0, 0.94, 0.95))
    book = ctx.word("s01-02", r"book", off=-0.15)
    h.expr(ctx.sec(0.7), "excited", ease=8)
    h.look(ctx.sec(0.5), (1.3, 1.75, 1.3), ease=10)  # a quick glance to camera: can you believe it?
    h.look(book - 10, (0, 0.94, 0.85), ease=8)
    h.gesture(book - 4, book + 10, {"forearm.R": (16, 0, 0), "hand.R": (-15, 0, 0), "spine": (6, 0, 0)})
    h.expr(book + 6, "happy")
    return R.camera((1.25, 2.2, 1.45), (0.0, 0.2, 1.25), lens=32)


@shot("sh03", "s01", "s01-03", uses=["apartment_setup", "seated_at_desk"])
def sh03(ctx):
    """Over-the-shoulder, closer: the checkout keeps adding things (screen content from Remotion)."""
    apartment_setup(ctx)
    h = ctx.hero()
    seated_at_desk(h)
    h.expr(0, "happy")
    h.look(0, (0, 0.94, 0.9))
    for i, w in enumerate((r"cabin", r"window", r"suitcase|checked")):
        f = ctx.word("s01-03", w)
        h.gesture(f, f + 14, {"head": (-4 - 2 * i, 3 - 6 * (i % 2), 0), "chest": (-3, 0, 0)})
    h.expr(ctx.word("s01-03", r"window"), "confused")
    h.expr(ctx.word("s01-03", r"suitcase|checked"), "worried")
    return R.camera((1.15, -1.05, 1.55), (-0.05, 0.94, 0.92), lens=36)


@shot("sh04", "s01", "s01-04", uses=["apartment_setup", "seated_at_desk"])
def sh04(ctx):
    """Front: the total lands. Slumps back. Then: 'the pattern is real' — a skeptical look."""
    apartment_setup(ctx)
    h = ctx.hero()
    seated_at_desk(h)
    h.expr(0, "worried")
    h.look(0, (0, 0.94, 0.9))
    f92 = ctx.word("s01-04", r"ninety|92")
    h.pose(f92, "slump", ease=14)
    h.place(f92, (0, 0.18), yaw=180, z=-0.25)
    h.expr(f92, "sad")
    real = ctx.word("s01-04", r"real")
    h.expr(real - 6, "skeptical")
    h.look(real - 8, (1.1, 1.75, 1.32), ease=10)
    return R.camera((0.9, 2.2, 1.42), (0.0, 0.2, 1.28), lens=40)


@shot("sh05", "s01", "s01-05", uses=["stage_setup"])
def sh05(ctx):
    """In the world: two cash stacks rise beside the passenger — fares vs everything else (Frontier, 2025)."""
    stage_setup(ctx)
    # stack heights proportional to $44.60 and $63.79 (1 m = $25)
    S.coin_stack("FareStack", 25, (-1.25, 0.6, 0), r=0.55, h=44.60 / 25 / 25)
    S.coin_stack("ExtraStack", 36, (1.25, 0.6, 0), r=0.55, h=63.79 / 25 / 36, color=(0.92, 0.45, 0.16, 1))
    S.anchor("fare_top", (-1.25, 0.6, 44.60 / 25 + 0.25))
    S.anchor("extra_top", (1.25, 0.6, 63.79 / 25 + 0.25))
    h = ctx.hero()
    h.place(0, (0, -0.6), yaw=0)
    h.pose(0, "stand")
    h.expr(0, "curious")
    h.look(0, (-1.25, 0.6, 1.6))
    tx = ctx.word("s01-05", r"another|other", off=0.0)
    h.look(tx, (1.25, 0.6, 2.4), ease=16)
    h.expr(tx + 6, "surprised")
    h.place(tx, (0, -0.6), yaw=-20)
    return R.camera((0.0, -6.8, 1.7), (0, 0.2, 1.35), lens=38)


@shot("sh06", "s01", "s01-06", uses=["tarmac_setup"])
def sh06(ctx):
    """Golden-hour apron: the passenger, backpack on, looks up at the aircraft. The question."""
    tarmac_setup(ctx, az=60, elev=3.5, stairs=False)
    h = ctx.hero()
    h.place(0, (6.5, -11.0), yaw=160)
    h.pose(0, "hands_in_pocket")
    h.expr(0, "thinking")
    h.look(0, (6, 0, 4.5))
    h.look(ctx.sec(2.0), (12, -1, 3.5), ease=20)
    return R.camera((3.0, -16.5, 1.05), (8.0, -2.0, 3.0), lens=28)


# ================================================================== S02 · What one passenger costs
@shot("sh07", "s02", uses=["tarmac_setup"])
def sh07(ctx):
    """Wide side view: the passenger crosses the apron and climbs the outdoor stairs."""
    tarmac_setup(ctx, az=55, elev=4.0)
    h = ctx.hero()
    n = ctx.n
    w0, w1 = 8, int(n * 0.55)
    h.walk(w0, w1, [(6.0, -15.5), (10.5, -10.5), (13.0, -7.9)])
    h.walk(w1 + 4, n - 6, [(13.0, -7.75, 0.0), (13.0, -3.25, 2.2), (13.0, -2.75, 2.2)], stride=0.55)
    h.expr(0, "curious")
    h.look(0, (13, 0, 3.5))
    return R.camera((-1.0, -24.0, 2.0), (10.5, -6.0, 2.4), lens=40)


@shot("sh08", "s02", "s02-02", uses=["cabin_setup", "seat_in_cabin"])
def sh08(ctx):
    """Inside: the passenger settles into a window seat; Remotion shows the airline's bill for the year."""
    seats = cabin_setup(ctx)
    h = ctx.hero()
    seat_in_cabin(h, seats, "4F")
    h.expr(0, "curious")
    h.look(0, (-2.3, 2.5, 1.3))
    h.look(ctx.sec(1.8), (-0.4, 0.1, 1.4), ease=14)
    h.expr(ctx.at("s02-03"), "thinking")
    return R.camera((-0.25, 0.05, 1.5), (-2.4, 1.1, 1.15), lens=30)


@shot("sh09", "s02", "s02-04", uses=["tarmac_setup"])
def sh09(ctx):
    """The cost of a flight, attached to the things that cost money: fuel, crew, airport, aircraft, air traffic control."""
    tarmac_setup(ctx, az=300, elev=5.0)
    # fuel truck under the wing, control tower and terminal in the distance
    S.box("FuelTruck", (6.5, 2.4, 2.6), (1.5, -10.5, 1.5), S.M("fueltruck", (0.85, 0.84, 0.8, 1), rough=0.4), bevel=0.15)
    S.box("FuelCab", (2.2, 2.4, 2.2), (5.5, -10.5, 1.3), S.M("fuelcab", S.ORANGE, rough=0.4), bevel=0.15)
    S.cyl("Tower", 1.4, 34, (-38, 60, 17), S.M("tower", (0.55, 0.52, 0.48, 1), rough=0.6))
    S.cyl("TowerCab", 4.2, 5.5, (-38, 60, 36), S.M("towercab", (0.1, 0.12, 0.14, 1), rough=0.1, coat=1), segs=8)
    S.box("TermBld", (80, 18, 12), (35, 55, 6), S.M("termbld", (0.42, 0.40, 0.37, 1), rough=0.7))
    S.anchor("tower", (-38, 60, 40))
    S.anchor("terminal", (30, 47, 13))
    S.anchor("truck", (2.5, -10.5, 3.4))
    h = ctx.hero()
    h.place(0, (13.0, -2.75), yaw=230, z=2.2)
    h.pose(0, "stand")
    h.expr(0, "curious")
    h.look(0, (1.5, -10.5, 2.5))
    h.look(ctx.word("s02-04", r"staff"), (16, -1, 4), ease=12)
    h.look(ctx.word("s02-04", r"[Aa]irport"), (30, 47, 8), ease=14)
    h.look(ctx.word("s02-04", r"aircraft"), (4, -2, 4), ease=12)
    h.look(ctx.word("s02-04", r"traffic"), (-38, 60, 30), ease=14)
    return R.camera((24.0, -30.0, 5.5), (6.0, -3.0, 4.5), lens=30)


@shot("sh10", "s02", "s02-06", uses=["stage_setup"])
def sh10(ctx):
    """A balance: the fare on one side, the cost on the other. It tips the wrong way."""
    stage_setup(ctx)
    wood = S.M("scalewood", (0.36, 0.24, 0.15, 1), rough=0.5)
    brass = S.M("brass", (0.8, 0.58, 0.25, 1), rough=0.25, metal=1)
    S.cyl("ScalePost", 0.08, 2.4, (0, 0.8, 1.2), brass)
    S.box("ScaleBase", (1.0, 0.7, 0.12), (0, 0.8, 0.06), wood, bevel=0.03)
    tilt = math.radians(-9)  # cost side (right) heavier
    S.box("ScaleBeam", (3.6, 0.1, 0.1), (0, 0.8, 2.4), brass, rot=(0, -tilt, 0), bevel=0.02)
    for side, n in ((-1, 10), (1, 13)):
        x = side * 1.75 * math.cos(tilt)
        z = 2.4 - side * 1.75 * math.sin(tilt) * -1
        S.cyl(f"Chain{side}", 0.012, 0.9, (x, 0.8, z - 0.45), brass)
        S.cyl(f"Pan{side}", 0.55, 0.05, (x, 0.8, z - 0.92), brass, r2=0.45)
        S.coin_stack(f"PanCoins{side}", n, (x, 0.8, z - 0.9), r=0.32, h=0.06, color=(0.85, 0.6, 0.2, 1) if side < 0 else (0.92, 0.45, 0.16, 1))
        S.anchor("fare_pan" if side < 0 else "cost_pan", (x, 0.8, z - 0.9 + n * 0.06 + 0.35))
    h = ctx.hero()
    h.place(0, (-2.6, -0.3), yaw=-35)
    h.pose(0, "think")
    h.expr(0, "thinking")
    h.look(0, (-1.7, 0.8, 1.9))
    h.look(ctx.word("s02-06", r"counts|bag"), (1.7, 0.8, 1.7), ease=14)
    h.pose(ctx.at("s02-07"), "shrug", ease=12)
    h.expr(ctx.at("s02-07"), "confused")
    h.look(ctx.at("s02-07"), (0, -7, 1.6), ease=12)
    h.pose(ctx.word("s02-07", r"secrets|three"), "stand", ease=12)
    h.expr(ctx.word("s02-07", r"secrets|three"), "curious")
    return R.camera((-0.6, -7.6, 1.75), (-0.6, 0.4, 1.45), lens=34)


# ================================================================== S03 · Secret one: the empty seat
@shot("sh11", "s03", uses=["cabin_setup", "seat_in_cabin"])
def sh11(ctx):
    """An almost empty cabin. Costs tick on regardless (Remotion meters)."""
    seats = cabin_setup(ctx)
    h = ctx.hero()
    seat_in_cabin(h, seats, "6D")
    h.expr(0, "curious")
    h.look(0, (-1, -1.2, 1.3))
    h.look(ctx.sec(1.5), (-6, 1.2, 1.2), ease=20)
    h.look(ctx.at("s03-02"), (2, 0, 1.6), ease=16)
    h.expr(ctx.at("s03-02"), "thinking")
    return R.camera((1.2, -0.25, 2.05), (-5.5, 0.4, 0.9), lens=24)


@shot("sh12", "s03", "s03-03", uses=["tarmac_setup"])
def sh12(ctx):
    """Wide: the aircraft at the stand in the low sun — one flight, one bill (plate only + Remotion camera move)."""
    tarmac_setup(ctx, az=80, elev=3.0, stairs=True)
    return R.camera((-30, -38, 3.2), (2, 0, 3.6), lens=50)


@shot("sh13", "s03", "s03-04", uses=["cabin_setup", "seat_in_cabin"])
def sh13(ctx):
    """The door closes. The passenger looks around at the empty seats (Remotion marks them unsold)."""
    seats = cabin_setup(ctx)
    h = ctx.hero()
    seat_in_cabin(h, seats, "6D")
    h.expr(0, "curious")
    h.look(0, (2.5, 0, 1.4))
    h.look(ctx.sec(1.0), (-3.0, -1.3, 1.0), ease=14)
    h.look(ctx.sec(2.6), (-4.0, 1.3, 1.0), ease=14)
    h.expr(ctx.sec(2.6), "worried")
    h.look(ctx.word("s03-04", r"sold|never"), (0.5, -0.3, 1.5), ease=12)
    return R.camera((-1.0, -0.9, 1.55), (-4.6, 0.3, 1.15), lens=28)


@shot("sh14", "s03", "s03-05", uses=["cabin_setup", "seat_in_cabin"])
def sh14(ctx):
    """One more passenger walks down the aisle and sits: almost no extra cost."""
    seats = cabin_setup(ctx)
    h = ctx.hero()
    seat_in_cabin(h, seats, "6D")
    h.expr(0, "curious")
    x5, y5 = seats["5C"]
    e = ctx.extra(0)
    e.walk(0, ctx.sec(3.2), [(1.4, 0.05), (x5 + 0.4, 0.05)])
    e.place(ctx.sec(3.2) + 1, (x5 + 0.06, y5 + 0.02), yaw=90, z=-0.2)
    e.pose(0, "stand")
    e.pose(ctx.sec(3.2), "sit", ease=14)
    e.expr(0, "neutral")
    h.look(0, (1.0, 0.0, 1.5))
    h.look(ctx.sec(3.0), (x5, y5, 1.3), ease=16)
    h.expr(ctx.at("s03-06"), "thinking")
    h.look(ctx.at("s03-06"), (0.2, -1.4, 1.5), ease=12)
    return R.camera((0.9, -0.9, 1.65), (-3.9, 0.2, 1.1), lens=30)


@shot("sh15", "s03", "s03-07", uses=["cabin_setup"])
def sh15(ctx):
    """Top-down cutaway of a 197-seat cabin (33 rows): Remotion fills seats to break-even, then to 94%."""
    seats = S.cabin(rows=33, ceiling=False)
    sun = R.stage_lights(key_power=0, rim_power=0, world=0.6)
    R.area_light("TopKey", (-12, -4, 14), (-12, 0, 0), power=6000, size=12, color=(1.0, 0.85, 0.7))
    ctx.shadow_dir = R.sun_dir(sun)
    h = ctx.hero(static=True)
    x, y = seats["6F"]
    h.place(0, (x + 0.06, y), yaw=90, z=-0.2)
    h.pose(0, "sit")
    h.expr(0, "curious")
    return R.camera((-30.0, -8.2, 7.8), (-12.0, 0.6, 0.0), lens=24)  # high, from behind the last row, looking towards the nose  # three-quarter overhead, nose to the right


# ================================================================== S04 · Secret two: the price ladder
@shot("sh16", "s04", uses=["terminal_setup"])
def sh16(ctx):
    """Departure hall at golden hour: the passenger watches a fares board that keeps changing."""
    terminal_setup(ctx)
    h = ctx.hero()
    h.walk(0, ctx.sec(2.6), [(1.5, -3.5), (4.2, 1.6)])
    h.place(ctx.sec(2.6) + 1, (4.2, 1.6), yaw=180)
    h.pose(0, "stand")
    h.pose(ctx.sec(2.8), "hands_in_pocket", ease=14)
    h.expr(0, "curious")
    h.look(0, (5, 4.2, 3.6))
    h.expr(ctx.at("s04-02"), "thinking")
    return R.camera((0.2, -6.5, 1.55), (4.6, 3.6, 2.7), lens=30)


@shot("sh17", "s04", "s04-04", uses=["stage_setup"])
def sh17(ctx):
    """A staircase made of airline seats: each step up costs more. The passenger stands on the bottom one."""
    stage_setup(ctx)
    steps = 9
    for i in range(steps):
        S.box(f"Step{i}", (1.3, 0.9, 0.42 * (i + 1)), (-3.6 + i * 1.05, 0.6, 0.21 * (i + 1)), S.M("step", (0.20, 0.19, 0.18, 1), rough=0.6), bevel=0.03)
        S.airline_seat(f"LadderSeat{i}", (-3.6 + i * 1.05, 0.8, 0.42 * (i + 1)), rot=(0, 0, 0))
        S.anchor(f"step{i}", (-3.6 + i * 1.05, 0.6, 0.42 * (i + 1) + 1.55))
    h = ctx.hero()
    h.place(0, (-3.6, 0.15), yaw=0, z=0.42)
    h.pose(0, "stand")
    h.expr(0, "happy")
    h.look(0, (-4, -6, 1.8))
    up = ctx.word("s04-04", r"bottom|rung", off=-0.4)
    h.look(up, (2.0, 0.6, 3.8), ease=24)
    h.expr(up + 8, "surprised")
    h.place(up, (-3.6, 0.15), yaw=-50, z=0.42)
    return R.camera((-1.2, -8.6, 1.8), (0.4, 0.4, 2.0), lens=30)


@shot("sh18", "s04", "s04-05", uses=["cabin_setup", "seat_in_cabin"])
def sh18(ctx):
    """Same flight, different prices: the passenger turns to the neighbour (Remotion price tags)."""
    seats = cabin_setup(ctx)
    h = ctx.hero()
    seat_in_cabin(h, seats, "4E")
    e = ctx.extra(1, static=True)
    x, y = seats["4F"]
    e.place(0, (x + 0.06, y), yaw=90, z=-0.2)
    e.pose(0, "sit")
    S.anchor("hero_tag", (seats["4E"][0], seats["4E"][1], 2.05))
    S.anchor("neighbour_tag", (x, y, 2.05))
    h.expr(0, "happy")
    h.look(0, (0, 0.3, 1.4))
    h.look(ctx.sec(0.6), (x, y, 1.35), ease=12)
    h.expr(ctx.sec(1.0), "surprised")
    h.expr(ctx.sec(3.0), "confused")
    return R.camera((0.45, 0.15, 1.6), (-2.4, 1.0, 1.2), lens=30)


@shot("sh18b", "s04", "s04-06", uses=["apartment_setup", "seated_at_desk"])
def sh18b(ctx):
    """Back at the laptop: on every price comparison the cheap fare sits at the top (screen content from Remotion)."""
    apartment_setup(ctx)
    h = ctx.hero()
    seated_at_desk(h)
    h.expr(0, "curious")
    h.look(0, (0, 0.94, 0.9))
    h.gesture(ctx.sec(1.2), ctx.sec(1.8), {"forearm.R": (10, 0, 0)})
    h.expr(ctx.word("s04-06", r"website"), "happy")
    return R.camera((0.9, -1.1, 1.55), (-0.03, 0.94, 0.94), lens=34)


@shot("sh19", "s04", "s04-07", uses=["terminal_setup"])
def sh19(ctx):
    """By the glass: planes outside; 'fill the plane first' — the passenger sits, watching the apron."""
    terminal_setup(ctx, board=False)
    h = ctx.hero()
    h.place(0, (-6.5, 2.2), yaw=180, z=-0.12)
    h.pose(0, "sit")
    h.expr(0, "thinking")
    h.look(0, (8, 34, 4))
    h.look(ctx.at("s04-08"), (-6.5, 30, 2), ease=20)
    h.expr(ctx.at("s04-08"), "skeptical")
    return R.camera((-9.5, -1.6, 1.4), (-2.0, 12.0, 2.4), lens=30)


# ================================================================== S05 · Secret three: everything else is extra
@shot("sh20", "s05", uses=["gate_setup"])
def sh20(ctx):
    """At the gate: the bag sizer, a suitcase that won't fit, and price tags for everything else."""
    gate_setup(ctx)
    S.suitcase("BigCase", (-0.3, 1.5, 0), color=S.SLATE, rot=(0, 0, math.radians(20)))
    S.anchor("case", (-0.3, 1.5, 1.25))
    S.anchor("desk", (3.2, 3.0, 1.6))
    h = ctx.hero()
    h.walk(0, ctx.sec(2.2), [(-1.6, -2.4), (0.3, 0.75)])
    h.place(ctx.sec(2.2) + 1, (0.3, 0.75), yaw=150)
    h.pose(0, "stand")
    h.expr(0, "curious")
    h.look(0, (0.8, 1.6, 0.8))
    lst = ctx.at("s05-02")
    h.look(lst, (0.8, 1.6, 0.7), ease=12)
    h.pose(ctx.word("s05-02", r"Almost|separately"), "point", ease=10)
    h.look(ctx.word("s05-02", r"suitcase"), (-0.3, 1.5, 0.6), ease=12)
    h.expr(ctx.word("s05-02", r"suitcase"), "skeptical")
    h.pose(ctx.word("s05-02", r"drink"), "shrug", ease=12)
    h.expr(ctx.word("s05-02", r"drink"), "confused")
    return R.camera((-2.4, -3.3, 1.55), (0.6, 1.6, 1.0), lens=32)


@shot("sh21", "s05", "s05-03", uses=["stage_setup"])
def sh21(ctx):
    """Blocks you can stand on: fare + extras = revenue per passenger, next to the cost. The gap is the profit."""
    stage_setup(ctx)
    k = 1 / 25.0  # metres per euro
    fare_m = S.M("fareblk", (0.82, 0.78, 0.70, 1), rough=0.5)
    extra_m = S.M("extrablk", (0.90, 0.42, 0.14, 1), rough=0.45)
    cost_m = S.M("costblk", (0.30, 0.40, 0.47, 1), rough=0.5)
    S.box("FareBlock", (1.4, 1.4, 50.66 * k), (-1.0, 0.8, 50.66 * k / 2), fare_m, bevel=0.03)
    S.box("ExtraBlock", (1.4, 1.4, 23.94 * k), (-1.0, 0.8, 50.66 * k + 23.94 * k / 2), extra_m, bevel=0.03)
    S.box("CostBlock", (1.4, 1.4, 63.21 * k), (1.0, 0.8, 63.21 * k / 2), cost_m, bevel=0.03)
    S.anchor("fare_mid", (-1.85, 0.8, 50.66 * k / 2))
    S.anchor("extra_mid", (-1.85, 0.8, 50.66 * k + 23.94 * k / 2))
    S.anchor("cost_mid", (1.85, 0.8, 63.21 * k / 2))
    S.anchor("gap", (0.0, 0.8, (63.21 + 74.60) / 2 * k))
    S.anchor("top_rev", (-1.0, 0.8, 74.60 * k + 0.2))
    S.anchor("top_cost", (1.0, 0.8, 63.21 * k + 0.2))
    h = ctx.hero()
    h.place(0, (0.0, -1.0), yaw=0)
    h.pose(0, "stand")
    h.expr(0, "curious")
    h.look(0, (-1.0, 0.8, 2.6))
    add = ctx.at("s05-04")
    h.look(add, (0, 0.8, 2.8), ease=14)
    h.pose(ctx.word("s05-04", r"gap|profit"), "point", ease=10)
    h.expr(ctx.word("s05-04", r"gap|profit"), "satisfied")
    return R.camera((0.3, -8.2, 1.9), (0, 0.6, 1.55), lens=34)


@shot("sh22", "s05", "s05-05", uses=["stage_setup"])
def sh22(ctx):
    """Frontier, 2025: the extras stack is taller than the ticket stack — and growing."""
    stage_setup(ctx, color=(0.12, 0.11, 0.11, 1))
    k = 1 / 25.0
    S.coin_stack("TicketStack", 26, (-1.3, 0.8, 0), r=0.55, h=44.60 * k / 26)
    S.coin_stack("NonFareStack", 38, (1.3, 0.8, 0), r=0.55, h=63.79 * k / 38, color=(0.92, 0.45, 0.16, 1))
    S.anchor("ticket_top", (-1.3, 0.8, 44.60 * k + 0.3))
    S.anchor("nonfare_top", (1.3, 0.8, 63.79 * k + 0.3))
    h = ctx.hero()
    h.place(0, (0.0, -0.9), yaw=0)
    h.pose(0, "stand")
    h.expr(0, "curious")
    h.look(0, (-1.3, 0.8, 1.7))
    h.look(ctx.word("s05-05", r"non|charges"), (1.3, 0.8, 2.5), ease=16)
    h.expr(ctx.word("s05-05", r"non|charges"), "surprised")
    h.pose(ctx.at("s05-06"), "think", ease=12)
    h.expr(ctx.at("s05-06"), "thinking")
    return R.camera((-0.4, -7.4, 1.6), (0, 0.5, 1.4), lens=36)


@shot("sh23", "s05", "s05-07", uses=["gate_setup"])
def sh23(ctx):
    """Travel light, pay little: the passenger strolls past a family hauling suitcases to the desk."""
    gate_setup(ctx)
    for i, (x, y, yaw) in enumerate(((2.6, 1.7, 160), (1.8, 1.5, 190), (3.4, 1.4, 170))):
        e = ctx.extra(i + 1, static=True)
        e.place(0, (x, y), yaw=yaw)
        e.pose(0, "carry" if i < 2 else "stand")
        S.suitcase(f"FamCase{i}", (x - 0.45, y - 0.1, 0), color=[S.SLATE, (0.55, 0.3, 0.2, 1), S.TAUPE][i], size=(0.45, 0.28, 0.66))
    S.anchor("family", (2.6, 1.6, 2.3))
    h = ctx.hero()
    h.walk(0, ctx.n - 1, [(-3.2, -0.6), (1.6, -2.4)])
    h.pose(0, "hands_in_pocket")
    h.expr(0, "happy")
    h.look(0, (2.6, 1.6, 1.4))
    h.look(ctx.at("s05-08"), (-1, -7, 1.6), ease=16)
    h.expr(ctx.word("s05-08", r"family|suitcases"), "skeptical")
    return R.camera((-0.8, -6.8, 1.45), (0.6, 0.4, 1.1), lens=32)


# ================================================================== S06 · A machine built to be cheap
@shot("sh24", "s06", uses=[])
def sh24(ctx):
    """Two cabins from above, same aircraft: 162 seats in two classes vs 197 seats (Remotion counts them)."""
    S.stage(color=(0.11, 0.10, 0.09, 1))
    sun = R.stage_lights(key_power=0, rim_power=0, world=0.5)
    R.area_light("TopKey", (0, -4, 18), (0, 0, 0), power=9000, size=16, color=(1.0, 0.86, 0.72))
    ctx.shadow_dir = R.sun_dir(sun)
    # two simplified cabins side by side (y = +2.6 and y = -2.6), floor plan only
    floor = S.M("cabinfloor2", (0.78, 0.76, 0.72, 1), rough=0.6)
    for yy, layout in ((2.6, "legacy"), (-2.6, "dense")):
        S.box(f"Hull{layout}", (27.5, 3.9, 0.06), (0, yy, 0.03), floor, bevel=0.5, segs=6)
        if layout == "legacy":
            # 2 rows business (4 abreast) + 26 rows economy (6 abreast) ~ 16 + 156 = 172 -> use 3 rows of 4 + 25 rows of 6 = 162
            x = 12.5
            for r in range(3):
                for k, dy in enumerate((-1.1, -0.45, 0.45, 1.1)):
                    S.box(f"B{r}{k}", (0.7, 0.6, 0.12), (x, yy + dy, 0.12), S.M("bizseat", (0.55, 0.3, 0.2, 1), rough=0.6), bevel=0.06)
                x -= 1.05
            for r in range(25):
                for k, dy in enumerate((-1.3, -0.84, -0.38, 0.38, 0.84, 1.3)):
                    S.box(f"L{r}{k}", (0.42, 0.42, 0.1), (x, yy + dy, 0.11), S.M("ecoseat", S.SLATE, rough=0.6), bevel=0.05)
                x -= 0.82
        else:
            x = 12.8
            n = 0
            for r in range(33):
                for k, dy in enumerate((-1.3, -0.84, -0.38, 0.38, 0.84, 1.3)):
                    if n >= 197:
                        break
                    S.box(f"D{r}{k}", (0.42, 0.42, 0.1), (x, yy + dy, 0.11), S.M("denseseat", (0.86, 0.40, 0.14, 1), rough=0.6), bevel=0.05)
                    n += 1
                x -= 0.76
    S.anchor("legacy", (-14.6, 2.6, 0.2))
    S.anchor("dense", (-14.6, -2.6, 0.2))
    cam = R.camera((0, 0, 30), (0, 0, 0), lens=50)
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 31
    return cam


@shot("sh25", "s06", "s06-04", uses=["tarmac_setup"])
def sh25(ctx):
    """The turnaround: passengers off down the stairs while the next ones wait; the clock is running."""
    tarmac_setup(ctx, az=300, elev=5.0)
    S.boarding_stairs("RearStairs", (-12.0, -7.4, 0), yaw=90, height=2.2)
    S.box("CleanCart", (1.6, 0.9, 1.1), (-9.0, -9.0, 0.55), S.M("cart", (0.3, 0.4, 0.47, 1), rough=0.5), bevel=0.05)
    h = ctx.hero()
    h.walk(4, int(ctx.n * 0.5), [(13.0, -2.75, 2.2), (13.0, -3.25, 2.2), (13.0, -7.75, 0.0), (13.0, -9.5, 0.0), (10.0, -13.0, 0.0)], stride=0.55)
    h.place(0, (13.0, -2.75), yaw=180, z=2.2)
    h.expr(0, "happy")
    h.look(int(ctx.n * 0.5), (4, -14, 1.5), ease=16)
    for i in range(3):
        e = ctx.extra(i)
        st = ctx.sec(1.2 + i * 1.6)
        e.place(0, (13.0, -2.75), yaw=180, z=2.2)
        e.walk(st, min(ctx.n - 1, st + ctx.sec(5.5)), [(13.0, -2.75, 2.2), (13.0, -3.25, 2.2), (13.0, -7.75, 0.0), (13.4, -10.0, 0.0), (17.0, -14.0 - i, 0.0)], stride=0.55)
        e.pose(0, "stand")
    S.anchor("clock", (2.0, -2.0, 8.5))
    return R.camera((28.0, -26.0, 4.0), (9.0, -6.0, 2.6), lens=36)


@shot("sh26", "s06", "s06-06", uses=["tarmac_setup"])
def sh26(ctx):
    """A row of identical aircraft on the apron; outdoor stairs, no jet bridges."""
    tarmac_setup(ctx, az=70, elev=3.5, plane=True)
    S.airliner("RowPlane2", (-10, 30, 0), yaw=0, door_anchor=False)
    S.boarding_stairs("Stairs2", (3.0, 22.6, 0), yaw=90, height=2.2)
    S.airliner("RowPlane3", (-20, 60, 0), yaw=0, door_anchor=False, simple=True)
    S.anchor("fleet", (-6, 30, 8))
    h = ctx.hero()
    h.walk(0, ctx.n - 1, [(4.0, -13.0), (12.0, -8.6)])
    h.expr(0, "curious")
    h.look(0, (-6, 30, 4))
    h.look(ctx.at("s06-07"), (13, -7, 2), ease=14)
    h.expr(ctx.at("s06-07"), "happy")
    return R.camera((-4.0, -38.0, 2.4), (6.0, 2.0, 3.6), lens=36)


@shot("sh27", "s06", "s06-08", uses=["stage_setup"])
def sh27(ctx):
    """Cost per passenger excluding fuel, as pillars (Ryanair's comparison). The passenger stands on the shortest."""
    stage_setup(ctx, color=(0.12, 0.105, 0.095, 1))
    data = [("RYA", 36), ("WIZ", 62), ("EZJ", 90), ("IAG", 178), ("LUF", 178), ("AFKLM", 253)]
    k = 1 / 50.0
    for i, (nm, v) in enumerate(data):
        x = -4.0 + i * 1.6
        m = S.M(f"pillar{i}", (0.90, 0.42, 0.14, 1) if i == 0 else (0.32, 0.36, 0.40, 1), rough=0.5)
        S.box(f"Pillar{nm}", (1.1, 1.1, v * k), (x, 1.2, v * k / 2), m, bevel=0.03)
        S.anchor(f"p_{nm}", (x, 1.2, v * k + 0.35))
        S.anchor(f"b_{nm}", (x, 0.6, 0.15))
    h = ctx.hero()
    h.place(0, (-4.0, 1.15), yaw=10, z=36 * k)
    h.pose(0, "hands_in_pocket")
    h.expr(0, "satisfied")
    h.look(0, (0, -8, 2))
    h.look(ctx.sec(1.6), (4.0, 1.2, 5.5), ease=24)
    h.expr(ctx.at("s06-09"), "happy")
    h.look(ctx.at("s06-09"), (-1, -8, 2), ease=14)
    return R.camera((1.2, -10.5, 2.4), (0.0, 1.0, 2.2), lens=32)


# ================================================================== S07 · When the math stops working
@shot("sh28", "s07", uses=["stage_setup"])
def sh28(ctx):
    """A narrow beam over the dark: break-even. The passenger balances on it."""
    stage_setup(ctx, color=(0.09, 0.08, 0.08, 1))
    S.box("Beam", (9.0, 0.22, 0.18), (0, 0.4, 1.6), S.M("beam", (0.8, 0.58, 0.25, 1), rough=0.3, metal=1.0), bevel=0.02)
    for x in (-4.4, 4.4):
        S.box(f"BeamPost{x}", (0.4, 0.4, 1.6), (x, 0.4, 0.8), S.M("beampost", (0.25, 0.25, 0.27, 1), rough=0.5), bevel=0.03)
    S.anchor("beam", (0, 0.4, 1.3))
    S.anchor("below", (2.4, 0.4, 0.5))
    h = ctx.hero()
    h.place(0, (-0.8, 0.4), yaw=80, z=1.69)
    h.pose(0, {"upper_arm.L": (0, 0, -6), "upper_arm.R": (0, 0, 6), "forearm.L": (10, 0, 0), "forearm.R": (10, 0, 0)})
    h.expr(0, "worried")
    h.look(0, (3, 0.4, 1.4))
    for i in range(6):
        f = ctx.sec(0.8 + i * 1.7)
        side = 1 if i % 2 else -1
        h.gesture(f, f + 30, {"spine": (0, 0, 6 * side), "chest": (0, 0, 5 * side), "upper_arm.L": (0, 0, 10 * side), "upper_arm.R": (0, 0, 10 * side)})
    h.look(ctx.at("s07-02"), (0, -8, 1.8), ease=14)
    return R.camera((0.3, -7.0, 2.0), (-0.3, 0.4, 2.1), lens=42)


@shot("sh29", "s07", "s07-03", uses=["stage_setup"])
def sh29(ctx):
    """Frontier 2025: cost per passenger stands a little taller than revenue per passenger."""
    stage_setup(ctx, color=(0.11, 0.10, 0.10, 1))
    k = 1 / 50.0
    S.box("RevBlock", (1.4, 1.4, 112.17 * k), (-1.0, 0.9, 112.17 * k / 2), S.M("revblk", (0.82, 0.78, 0.70, 1), rough=0.5), bevel=0.03)
    S.box("CostBlock2", (1.4, 1.4, 116.66 * k), (1.0, 0.9, 116.66 * k / 2), S.M("costblk2", (0.70, 0.22, 0.18, 1), rough=0.5), bevel=0.03)
    S.anchor("rev_top", (-1.0, 0.9, 112.17 * k + 0.3))
    S.anchor("cost_top", (1.0, 0.9, 116.66 * k + 0.3))
    h = ctx.hero()
    h.place(0, (0.1, -0.9), yaw=0)
    h.pose(0, "stand")
    h.expr(0, "worried")
    h.look(0, (1.0, 0.9, 2.4))
    h.look(ctx.word("s07-03", r"lost|137"), (0, -8, 1.6), ease=14)
    h.pose(ctx.word("s07-03", r"lost|137"), "slump", ease=14)
    h.expr(ctx.word("s07-03", r"lost|137"), "sad")
    return R.camera((0.4, -7.6, 1.8), (0, 0.5, 1.6), lens=36)


@shot("sh30", "s07", "s07-04", uses=["terminal_setup"])
def sh30(ctx):
    """Night. The departures board fills with CANCELLED (Remotion). The passenger, suitcase in hand, stands still."""
    terminal_setup(ctx, night=True)
    S.airliner("YellowPlane", (2, 30, 0), yaw=190, livery=(0.95, 0.80, 0.10, 1), simple=True, door_anchor=False)
    S.suitcase("HeroCase", (4.75, -0.05, 0), color=S.SLATE, rot=(0, 0, math.radians(180)))
    h = ctx.hero()
    h.place(0, (4.2, -0.3), yaw=180)
    h.pose(0, "carry")
    h.expr(0, "curious")
    h.look(0, (5, 4.2, 3.6))
    h.expr(ctx.word("s07-04", r"bankruptcy"), "worried")
    h.expr(ctx.at("s07-05"), "sad")
    h.pose(ctx.word("s07-05", r"cancel"), "slump", ease=16)
    return R.camera((0.6, -5.6, 1.5), (4.8, 3.6, 2.6), lens=30)


@shot("sh31", "s07", "s07-06", uses=["terminal_setup"])
def sh31(ctx):
    """Night, wide: the passenger alone on a bench in an empty hall."""
    terminal_setup(ctx, night=True, board=False)
    S.suitcase("HeroCase2", (-5.6, 1.6, 0), color=S.SLATE, rot=(0, 0, math.radians(200)))
    h = ctx.hero()
    h.place(0, (-6.5, 2.2), yaw=180, z=-0.12)
    h.pose(0, "sit")
    h.pose(ctx.sec(0.8), {**__import__("hl_char").POSES["sit"], "spine": (12, 0, 0), "chest": (10, 0, 0), "head": (16, 0, 0)}, ease=20)
    h.expr(0, "sad")
    h.look(0, (-6.5, 30, 1.0))
    return R.camera((-2.4, -3.6, 1.8), (-6.3, 2.0, 0.95), lens=32)


# ================================================================== S08 · Who pays for the twenty-dollar seat
@shot("sh32", "s08", uses=["terminal_setup"])
def sh32(ctx):
    """Golden hour again: the passenger walks the hall towards the gate (Remotion: the four answers)."""
    terminal_setup(ctx)
    h = ctx.hero()
    h.walk(0, ctx.n - 1, [(-12.0, -1.0), (-4.0, 0.2), (3.0, 0.6), (9.0, 2.0)])
    h.expr(0, "curious")
    h.expr(ctx.at("s08-03"), "thinking")
    h.expr(ctx.at("s08-05"), "satisfied")
    h.look(0, (0, 30, 3))
    return R.camera((-2.0, -7.5, 1.4), (-1.0, 3.0, 1.6), lens=24)


@shot("sh33", "s08", "s08-06", uses=["tarmac_setup"])
def sh33(ctx):
    """The answer: up the stairs with one small backpack. At the top, a look back and a smile."""
    tarmac_setup(ctx, az=55, elev=3.0)
    h = ctx.hero()
    top = int(ctx.n * 0.55)
    h.walk(0, top, [(12.2, -12.0), (13.0, -7.9), (13.0, -7.75, 0.0), (13.0, -3.25, 2.2), (13.0, -2.8, 2.2)], stride=0.58)
    h.place(top + 2, (13.0, -2.8), yaw=200, z=2.2)
    h.expr(0, "happy")
    h.look(top + 2, (6, -24, 2.2), ease=14)
    h.expr(top + 10, "satisfied")
    h.gesture(top + 20, top + 50, {"upper_arm.R": (20, 0, -70), "forearm.R": (60, 0, 0)})  # small wave
    return R.camera((5.0, -22.0, 1.6), (12.0, -4.0, 2.8), lens=45)
