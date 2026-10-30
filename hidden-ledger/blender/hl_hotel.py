"""Episode 005 sets: hotel lobby/reception, night street with a 100-window facade, corridor, guest room, room-block stage.

Kept deliberately modest (the character is the priority): clean shapes, warm practical lights, a few bevelled props.
Conventions as hl_sets: floor at z = 0, STATIC collection unless told otherwise; floors are named "Floor"/"Street"/
"Ground"/"Cyclorama" so the character pass turns them into shadow catchers; interiors have an object named "Ceiling".

Lobby layout (metres): reception desk front at y = 0.85, spanning x -1.7..1.7, counter height 1.08; the clerk stands at
(0, 1.55) facing -Y; a guest at the desk stands around (0, 0.35) facing +Y (yaw 180). Entrance doors in the left wall
(x = -6.5, y = -2.5). Lounge (sofa, armchair, table, rug) around (3.6, -2.6). Back wall y = 3.2 with the HOTEL sign.
"""
from __future__ import annotations

import math
import random

import bpy

import hl_sets as S
from hl_sets import M, box, cyl, emissive, plane, screen, anchor, sphere, STATIC, DYNAMIC

WARM = (1.0, 0.78, 0.52, 1)
GOLD = (0.78, 0.56, 0.24, 1)


def text(name, body, loc, size=0.4, rot=(math.radians(90), 0, 0), mat=None, extrude=0.02, align="CENTER", collection=STATIC):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.size = size
    cu.extrude = extrude
    cu.align_x = align
    cu.align_y = "CENTER"
    o = bpy.data.objects.new(name, cu)
    S.col(collection).objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    if mat:
        cu.materials.append(mat)
    return o


def pendant(name, loc, drop=0.9, collection=STATIC):
    cord = M("cord", (0.05, 0.05, 0.05, 1), rough=0.5)
    cyl(f"{name}_cord", 0.006, drop, (loc[0], loc[1], loc[2] - drop / 2), cord, collection=collection)
    shade = M("pendshade", (0.82, 0.62, 0.34, 1), rough=0.35, metal=0.6)
    cyl(f"{name}_shade", 0.2, 0.22, (loc[0], loc[1], loc[2] - drop - 0.11), shade, r2=0.07, collection=collection)
    sphere(f"{name}_bulb", 0.07, (loc[0], loc[1], loc[2] - drop - 0.2), emissive("bulb", (1.0, 0.8, 0.55, 1), 18.0), collection=collection)


def plant(name, loc, h=1.3, collection=STATIC):
    pot = M("pot", (0.12, 0.11, 0.10, 1), rough=0.5)
    cyl(f"{name}_pot", 0.22, 0.45, (loc[0], loc[1], 0.225), pot, r2=0.18, collection=collection)
    leaf = M("leaf", (0.10, 0.22, 0.12, 1), rough=0.6)
    r = random.Random(hash(name) % 1000)
    for i in range(7):
        a = i / 7 * 2 * math.pi
        sphere(f"{name}_leaf{i}", 0.2, (loc[0] + 0.16 * math.cos(a), loc[1] + 0.16 * math.sin(a), 0.5 + h * (0.45 + 0.4 * r.random())),
               leaf, scale=(0.8, 0.8, 1.5), collection=collection)


# ------------------------------------------------------------------ lobby
def lobby(collection=STATIC, variant="main"):
    """Hotel lobby at night. variant 'alt' recolours it (the second hotel at the end)."""
    alt = variant == "alt"
    floor = M("lobbyfloor" + variant, (0.16, 0.14, 0.12, 1) if not alt else (0.13, 0.14, 0.15, 1), rough=0.22, coat=0.35)
    plane("Floor", (16, 13), (0, -1.2, 0), floor, collection=collection)
    wall = M("lobbywall" + variant, (0.25, 0.21, 0.17, 1) if not alt else (0.17, 0.21, 0.23, 1), rough=0.85)
    wood = M("wood" + variant, (0.14, 0.075, 0.04, 1) if not alt else (0.08, 0.09, 0.10, 1), rough=0.45, coat=0.25)
    box("BackWall", (16, 0.2, 4.0), (0, 3.3, 2.0), wall, collection=collection)
    box("BackPanel", (6.0, 0.08, 3.0), (0, 3.18, 1.9), wood, bevel=0.01, collection=collection)
    box("LeftWall", (0.2, 13, 4.0), (-6.6, -1.2, 2.0), wall, collection=collection)
    box("RightWall", (0.2, 13, 4.0), (6.6, -1.2, 2.0), wall, collection=collection)
    ceil = M("lobbyceil", (0.30, 0.27, 0.24, 1), rough=0.9)
    box("Ceiling", (16, 13, 0.2), (0, -1.2, 3.9), ceil, collection=collection)
    # recessed downlights
    dl = emissive("downlight", (1.0, 0.86, 0.66, 1), 12.0)
    for x in (-4.5, -1.5, 1.5, 4.5):
        for y in (-4.5, -1.5, 1.5):
            cyl(f"Down{x}{y}", 0.09, 0.02, (x, y, 3.79), dl, collection=collection)
    # sign
    gold = M("signgold", GOLD, rough=0.25, metal=1.0)
    text("Sign", "HOTEL" if not alt else "INN", (0, 3.12, 2.75), size=0.42, mat=gold, extrude=0.03, collection=collection)
    box("SignGlow", (2.2, 0.02, 0.06), (0, 3.13, 2.42), emissive("signline", (1.0, 0.75, 0.45, 1), 6.0), collection=collection)
    # reception desk
    top = M("desktop" + variant, (0.62, 0.58, 0.52, 1), rough=0.25, coat=0.4)
    box("DeskFront", (3.4, 0.08, 1.02), (0, 0.89, 0.51), wood, bevel=0.01, collection=collection)
    box("DeskSideL", (0.08, 0.8, 1.02), (-1.66, 1.25, 0.51), wood, collection=collection)
    box("DeskSideR", (0.08, 0.8, 1.02), (1.66, 1.25, 0.51), wood, collection=collection)
    box("DeskTop", (3.5, 0.42, 0.05), (0, 0.98, 1.06), top, bevel=0.012, collection=collection)
    box("DeskWork", (3.3, 0.42, 0.04), (0, 1.30, 0.80), top, collection=collection)
    box("DeskStrip", (3.3, 0.02, 0.03), (0, 0.845, 0.25), emissive("deskstrip", (1.0, 0.7, 0.4, 1), 5.0), collection=collection)
    # monitor on the working shelf, facing the clerk (+Y); screen drawn by Remotion
    dark = M("monitor", (0.04, 0.04, 0.045, 1), rough=0.35)
    box("MonitorBody", (0.56, 0.035, 0.36), (0.45, 1.20, 1.18), dark, bevel=0.008, collection=collection)
    box("MonitorStand", (0.05, 0.05, 0.22), (0.45, 1.24, 0.92), dark, collection=collection)
    screen("desk", 0.52, 0.32, (0.45, 1.222, 1.18), rot=(math.radians(-90), 0, 0), color=(0.10, 0.16, 0.24, 1), strength=1.4, collection=collection)
    box("Keyboard", (0.42, 0.14, 0.02), (0.45, 1.40, 0.83), dark, bevel=0.005, collection=collection)
    # bell + key-card tray on the counter (guest side)
    brass = M("brass", (0.80, 0.60, 0.30, 1), rough=0.25, metal=1.0)
    sphere("Bell", 0.05, (0.62, 0.97, 1.10), brass, scale=(1, 1, 0.7), collection=collection)
    cyl("BellBase", 0.06, 0.015, (0.62, 0.97, 1.09), dark, collection=collection)
    box("CardTray", (0.22, 0.14, 0.03), (-0.75, 0.98, 1.095), dark, bevel=0.005, collection=collection)
    box("Lamp", (0.08, 0.08, 0.4), (1.45, 1.0, 1.28), brass, collection=collection)
    sphere("LampShade", 0.13, (1.45, 1.0, 1.55), emissive("lampshade", (1.0, 0.82, 0.6, 1), 6.0), scale=(1, 1, 0.8), collection=collection)
    anchor("desk_screen", (0.45, 1.20, 1.18), collection=collection)
    anchor("bell", (0.62, 0.97, 1.15), collection=collection)
    # lounge
    sofa = M("sofa" + variant, (0.18, 0.30, 0.36, 1) if not alt else (0.42, 0.24, 0.16, 1), rough=0.8)
    box("SofaBase", (2.2, 0.85, 0.42), (3.8, -3.4, 0.21), sofa, bevel=0.06, collection=collection)
    box("SofaBack", (2.2, 0.22, 0.5), (3.8, -3.72, 0.66), sofa, bevel=0.07, collection=collection)
    for dx in (-1.02, 1.02):
        box(f"SofaArm{dx}", (0.2, 0.85, 0.62), (3.8 + dx, -3.4, 0.31), sofa, bevel=0.06, collection=collection)
    box("CoffeeTable", (1.1, 0.6, 0.05), (3.8, -2.3, 0.42), top, bevel=0.01, collection=collection)
    for dx in (-0.45, 0.45):
        for dy in (-0.22, 0.22):
            box(f"CTLeg{dx}{dy}", (0.04, 0.04, 0.4), (3.8 + dx, -2.3 + dy, 0.2), dark, collection=collection)
    rug = M("rug" + variant, (0.45, 0.22, 0.12, 1) if not alt else (0.20, 0.24, 0.28, 1), rough=0.95)
    plane("Rug", (3.6, 2.8), (3.8, -2.7, 0.006), rug, collection=collection)
    pendant("Pend1", (3.8, -2.3, 3.8), drop=1.4, collection=collection)
    pendant("Pend2", (-0.9, 1.2, 3.8), drop=1.2, collection=collection)
    pendant("Pend3", (0.9, 1.2, 3.8), drop=1.2, collection=collection)
    plant("Plant1", (-2.6, 2.6), collection=collection)
    plant("Plant2", (5.8, -0.6), collection=collection)
    plant("Plant3", (-5.8, -5.2), collection=collection)
    # entrance: glass doors in the left wall, night outside
    glass = M("lobbyglass", (0.02, 0.03, 0.05, 1), rough=0.05, emit=(0.03, 0.05, 0.09, 1), emit_strength=0.6)
    box("DoorFrame", (0.14, 2.4, 2.6), (-6.52, -2.5, 1.3), dark, collection=collection)
    box("DoorGlass", (0.06, 2.2, 2.4), (-6.45, -2.5, 1.2), glass, collection=collection)
    anchor("entrance", (-6.2, -2.5, 1.2), collection=collection)
    # elevator in the right wall
    steel = M("steel", (0.55, 0.55, 0.56, 1), rough=0.25, metal=1.0)
    box("Elevator", (0.08, 1.2, 2.3), (6.5, 1.6, 1.15), steel, collection=collection)
    box("ElevatorFrame", (0.1, 1.4, 2.45), (6.55, 1.6, 1.22), dark, collection=collection)
    cyl("ElevatorBtn", 0.025, 0.02, (6.48, 0.75, 1.15), emissive("btn", (1.0, 0.7, 0.3, 1), 8.0), rot=(0, math.radians(90), 0), collection=collection)
    # columns
    for x in (-3.4, 3.4):
        cyl(f"Column{x}", 0.22, 3.8, (x, -0.6, 1.9), M("column", (0.36, 0.32, 0.28, 1), rough=0.4), collection=collection)


def lobby_lights(key=0.5):
    """Night interior: warm overhead pools + a cool spill from the entrance."""
    from hl_render import area_light, flat_world
    flat_world((0.03, 0.035, 0.05), 0.3)
    area_light("LobbyKey", (0.6, -1.2, 3.6), (0, 0.6, 0.6), power=900 * key, size=3.0, color=(1.0, 0.82, 0.6))
    area_light("DeskWash", (0, 2.6, 3.4), (0, 0.6, 1.0), power=420 * key, size=2.0, color=(1.0, 0.78, 0.55))
    area_light("LoungePool", (3.8, -2.5, 3.6), (3.8, -2.6, 0), power=500 * key, size=2.0, color=(1.0, 0.75, 0.5))
    area_light("DoorSpill", (-6.0, -2.5, 2.0), (-3, -2, 0.8), power=160 * key, size=2.0, color=(0.6, 0.72, 1.0))
    area_light("Fill", (-2.5, -5.5, 2.4), (0, 0, 1.0), power=260 * key, size=4.0, color=(1.0, 0.9, 0.8))


# ------------------------------------------------------------------ street + facade
def street(collection=STATIC, lit=None, seed=3, cols=10, floors=10, facade_x=0.0):
    """Night street; the hotel facade has cols x floors guest-room windows (100 by default) above a lobby floor.
    lit: None (random ~70% lit) | float fraction | set of window indices to light. Windows: ANCHOR:win_<i>."""
    r = random.Random(seed)
    ground = M("sidewalk", (0.24, 0.23, 0.22, 1), rough=0.7)
    plane("Street", (80, 8), (0, -2.0, 0), ground, collection=collection)
    road = M("road", (0.06, 0.06, 0.065, 1), rough=0.55, coat=0.3)
    plane("Ground", (80, 12), (0, -12.0, -0.01), road, collection=collection)
    box("Curb", (80, 0.25, 0.15), (0, -6.0, 0.075), M("curb", (0.35, 0.34, 0.33, 1), rough=0.7), collection=collection)
    stripe = emissive("roadline", (0.6, 0.55, 0.4, 1), 0.4)
    for i in range(-10, 11):
        plane(f"Dash{i}", (1.6, 0.12), (i * 3.6, -12, 0.0), stripe, collection=collection)
    # facade
    W, fh = cols * 1.5 + 1.0, 3.0
    H = 4.2 + floors * fh + 1.2
    stone = M("facade", (0.36, 0.33, 0.30, 1), rough=0.8)
    box("Facade", (W, 1.0, H), (facade_x, 0.6, H / 2), stone, collection=collection)
    dark = M("winoff", (0.015, 0.02, 0.03, 1), rough=0.15, emit=(0.01, 0.015, 0.03, 1), emit_strength=0.5)
    on = emissive("winon", (1.0, 0.72, 0.42, 1), 3.2)
    frame = M("winframe", (0.12, 0.11, 0.10, 1), rough=0.5)
    n = cols * floors
    if lit is None:
        lit = {i for i in range(n) if r.random() < 0.7}
    elif isinstance(lit, float):
        lit = {i for i in range(n) if r.random() < lit}
    for fl in range(floors):
        for c in range(cols):
            i = fl * cols + c
            x = facade_x - W / 2 + 1.25 + c * 1.5
            z = 4.2 + fl * fh + 1.5
            box(f"WinFrame{i}", (1.1, 0.06, 1.7), (x, 0.08, z), frame, collection=collection)
            box(f"Win{i}", (0.95, 0.06, 1.55), (x, 0.06, z), on if i in lit else dark, collection=collection)
            anchor(f"win_{i}", (x, 0.0, z), collection=collection)
    # lobby floor: glass + canopy + sign
    glass = M("lobbywin", (0.5, 0.36, 0.22, 1), rough=0.2, emit=(1.0, 0.70, 0.42, 1), emit_strength=0.9)
    box("LobbyGlass", (W - 3, 0.08, 3.0), (facade_x, 0.08, 1.6), glass, collection=collection)
    for i in range(7):
        box(f"LobbyMull{i}", (0.1, 0.12, 3.2), (facade_x - (W - 3) / 2 + i * (W - 3) / 6, 0.05, 1.6), frame, collection=collection)
    canopy = M("canopy", (0.08, 0.08, 0.09, 1), rough=0.4)
    box("Canopy", (4.4, 2.6, 0.18), (facade_x, -1.1, 3.4), canopy, bevel=0.03, collection=collection)
    box("CanopyStrip", (4.3, 0.04, 0.05), (facade_x, -2.38, 3.32), emissive("canopystrip", (1.0, 0.78, 0.5, 1), 7.0), collection=collection)
    gold = emissive("streetsign", (1.0, 0.76, 0.42, 1), 6.0)
    text("FacadeSign", "HOTEL", (facade_x, -2.42, 3.62), size=0.5, mat=gold, extrude=0.03, collection=collection)
    box("Door", (2.0, 0.1, 2.6), (facade_x, 0.02, 1.3), M("doorglass", (0.6, 0.45, 0.3, 1), rough=0.1, emit=(1.0, 0.75, 0.48, 1), emit_strength=1.3), collection=collection)
    anchor("hotel_door", (facade_x, -0.2, 1.2), collection=collection)
    anchor("facade_top", (facade_x, 0, H), collection=collection)
    # neighbours, lamps, trees
    nb = M("neighbour", (0.10, 0.10, 0.11, 1), rough=0.8)
    for side in (-1, 1):
        for k in range(3):
            h = 10 + r.random() * 18
            x = facade_x + side * (W / 2 + 4 + k * 9)
            box(f"Nb{side}{k}", (8.4, 6, h), (x, 2.8 + k * 2, h / 2), nb, collection=collection)
            for j in range(int(h / 3)):
                if r.random() < 0.35:
                    box(f"NbWin{side}{k}{j}", (1.0, 0.05, 1.3), (x + r.uniform(-3, 3), -0.25 + k * 2, 3 + j * 3), emissive("nbwin", (1.0, 0.7, 0.4, 1), 1.6), collection=collection)
    pole = M("pole", (0.05, 0.05, 0.055, 1), rough=0.4, metal=0.6)
    for x in (-11, 11, -25, 25):
        cyl(f"Lamp{x}", 0.06, 5.0, (facade_x + x, -5.4, 2.5), pole, collection=collection)
        sphere(f"LampHead{x}", 0.22, (facade_x + x, -5.4, 5.05), emissive("streetlamp", (1.0, 0.75, 0.45, 1), 14.0), scale=(1, 1, 0.6), collection=collection)
    for x in (-7.5, 7.5):
        cyl(f"TreeTrunk{x}", 0.09, 2.4, (facade_x + x, -4.6, 1.2), M("trunk", (0.12, 0.09, 0.07, 1), rough=0.8), collection=collection)
        sphere(f"TreeTop{x}", 1.1, (facade_x + x, -4.6, 3.2), M("treetop", (0.05, 0.10, 0.06, 1), rough=0.8), scale=(1, 1, 1.2), collection=collection)
    return lit


def street_lights():
    from hl_render import area_light, flat_world
    flat_world((0.012, 0.02, 0.045), 1.0)
    area_light("CanopyLight", (0, -1.4, 3.2), (0, -2.5, 0), power=700, size=3.0, color=(1.0, 0.78, 0.5))
    area_light("StreetFill", (-6, -12, 6), (0, -2, 1), power=900, size=8.0, color=(0.55, 0.65, 1.0))
    area_light("LampPoolL", (-11, -5.0, 4.8), (-11, -4, 0), power=600, size=1.0, color=(1.0, 0.72, 0.45))
    area_light("LampPoolR", (11, -5.0, 4.8), (11, -4, 0), power=600, size=1.0, color=(1.0, 0.72, 0.45))


# ------------------------------------------------------------------ corridor
def corridor(collection=STATIC, length=18.0, open_door=None):
    """Corridor along +Y from y = 0, width 2.4 (x -1.2..1.2). Doors alternate sides every 3 m.
    open_door: index of the door built as a separate DYNAMIC hinge (returned) instead of a static leaf."""
    carpet = M("carpet", (0.22, 0.12, 0.10, 1), rough=0.95)
    plane("Floor", (2.4, length), (0, length / 2, 0), carpet, collection=collection)
    runner = M("runner", (0.40, 0.26, 0.16, 1), rough=0.95)
    plane("Runner", (1.1, length), (0, length / 2, 0.004), runner, collection=collection)
    wall = M("corrwall", (0.72, 0.66, 0.58, 1), rough=0.85)
    box("WallL", (0.2, length, 3.0), (-1.3, length / 2, 1.5), wall, collection=collection)
    box("WallR", (0.2, length, 3.0), (1.3, length / 2, 1.5), wall, collection=collection)
    box("EndWall", (2.8, 0.2, 3.0), (0, length, 1.5), wall, collection=collection)
    box("Ceiling", (2.8, length, 0.2), (0, length / 2, 3.1), M("corrceil", (0.66, 0.62, 0.57, 1), rough=0.9), collection=collection)
    door_m = M("door", (0.28, 0.16, 0.09, 1), rough=0.45, coat=0.2)
    frame_m = M("doorframe", (0.85, 0.82, 0.76, 1), rough=0.4)
    brass = M("brass", (0.80, 0.60, 0.30, 1), rough=0.25, metal=1.0)
    hinge = None
    for i in range(int(length / 3)):
        side = -1 if i % 2 == 0 else 1
        y = 2.0 + i * 3.0
        x = side * 1.19
        box(f"DoorFrame{i}", (0.06, 1.1, 2.25), (x, y, 1.12), frame_m, collection=collection)
        num = text(f"DoorNum{i}", f"{214 + i}", (x - side * 0.04, y, 1.75), size=0.09, rot=(math.radians(90), 0, math.radians(-90 * side)), mat=brass, extrude=0.004, collection=collection)
        if i == open_door:
            # hinge empty at the door's edge; the leaf is its child and rotates with it
            hinge = bpy.data.objects.new("DoorHinge", None)
            S.col(DYNAMIC).objects.link(hinge)
            hinge.location = (x - side * 0.05, y - 0.48, 0)
            leaf = box("DoorLeaf", (0.05, 0.96, 2.15), (0, 0.48, 1.075), door_m, collection=DYNAMIC)
            handle = sphere("DoorHandle", 0.03, (-side * 0.05, 0.86, 1.0), brass, collection=DYNAMIC)
            reader = box("CardReader", (0.03, 0.08, 0.12), (-side * 0.04, 0.86, 1.22), M("reader", (0.03, 0.03, 0.035, 1), rough=0.4), collection=DYNAMIC)
            for o in (leaf, handle, reader):
                o.parent = hinge
            # dark room behind the open door
            box("RoomBehind", (3.0, 3.0, 0.02), (x + side * 1.6, y, 0.001), M("roomfloor", (0.25, 0.20, 0.17, 1), rough=0.6), collection=collection)
            box("RoomBack", (0.1, 3.0, 3.0), (x + side * 3.1, y, 1.5), M("roomwall", (0.30, 0.27, 0.24, 1), rough=0.8), collection=collection)
            anchor("door_handle", (x - side * 0.1, y + 0.38, 1.0), collection=collection)
            anchor("door_reader", (x - side * 0.09, y + 0.38, 1.22), collection=collection)
        else:
            box(f"DoorLeaf{i}", (0.05, 0.96, 2.15), (x - side * 0.02, y, 1.075), door_m, collection=collection)
            sphere(f"Handle{i}", 0.03, (x - side * 0.06, y + 0.38, 1.0), brass, collection=collection)
        sc = box(f"Sconce{i}", (0.06, 0.16, 0.26), (-x * 1.0 - side * 0.0, y + 1.5, 1.9), emissive("sconce", (1.0, 0.8, 0.55, 1), 7.0), collection=collection)
        sc.location.x = -side * 1.18
    for j in range(int(length / 3)):
        cyl(f"CeilLight{j}", 0.12, 0.02, (0, 1.5 + j * 3, 2.99), emissive("ceillight", (1.0, 0.85, 0.65, 1), 10.0), collection=collection)
    return hinge


def corridor_lights(length=18.0):
    from hl_render import area_light, flat_world
    flat_world((0.03, 0.03, 0.035), 0.3)
    for j in range(0, int(length / 3), 2):
        area_light(f"CorrLight{j}", (0, 1.5 + j * 3, 2.9), (0, 1.5 + j * 3, 0), power=180, size=1.2, color=(1.0, 0.82, 0.6))


# ------------------------------------------------------------------ guest room
def guest_room(collection=STATIC):
    """Room 4 x 5 m: door wall at y = -2.5, window wall at y = 2.5 (city at night), bed against the right wall."""
    floor = M("roomwood", (0.36, 0.24, 0.15, 1), rough=0.5, coat=0.2)
    plane("Floor", (4.2, 5.2), (0, 0, 0), floor, collection=collection)
    wall = M("roomwall2", (0.42, 0.36, 0.30, 1), rough=0.85)
    box("WallBack", (4.4, 0.15, 2.9), (0, 2.6, 1.45), wall, collection=collection)
    box("WallL", (0.15, 5.2, 2.9), (-2.15, 0, 1.45), wall, collection=collection)
    box("WallR", (0.15, 5.2, 2.9), (2.15, 0, 1.45), wall, collection=collection)
    box("WallFront", (4.4, 0.15, 2.9), (0, -2.6, 1.45), wall, collection=collection)
    box("Ceiling", (4.4, 5.4, 0.15), (0, 0, 2.95), M("roomceil", (0.45, 0.41, 0.37, 1), rough=0.9), collection=collection)
    win = M("citywin", (0.03, 0.05, 0.10, 1), rough=0.05, emit=(0.06, 0.09, 0.16, 1), emit_strength=1.0)
    box("Window", (2.2, 0.05, 1.6), (-0.6, 2.52, 1.55), win, collection=collection)
    r = random.Random(9)
    for i in range(26):
        box(f"CityLight{i}", (0.05, 0.02, 0.05), (-1.6 + r.random() * 2.0, 2.55, 0.85 + r.random() * 1.2), emissive("citylight", (1.0, 0.75, 0.45, 1), 6.0), collection=collection)
    box("Curtain", (0.5, 0.08, 2.4), (-1.95, 2.45, 1.4), M("curtain", (0.55, 0.40, 0.28, 1), rough=0.9), bevel=0.03, collection=collection)
    # bed (seat height ~0.5)
    linen = M("linen", (0.88, 0.86, 0.82, 1), rough=0.8)
    duvet = M("duvet", (0.80, 0.70, 0.56, 1), rough=0.85)
    wood = M("bedwood", (0.22, 0.13, 0.07, 1), rough=0.5)
    box("BedFrame", (1.7, 2.1, 0.3), (1.15, 0.6, 0.15), wood, bevel=0.03, collection=collection)
    box("Mattress", (1.6, 2.0, 0.22), (1.15, 0.6, 0.41), linen, bevel=0.06, collection=collection)
    box("Duvet", (1.62, 1.3, 0.06), (1.15, 0.25, 0.54), duvet, bevel=0.03, collection=collection)
    box("Headboard", (1.8, 0.1, 1.1), (1.15, 1.68, 0.75), wood, bevel=0.03, collection=collection)
    for dx in (-0.4, 0.4):
        box(f"Pillow{dx}", (0.6, 0.35, 0.14), (1.15 + dx, 1.35, 0.58), linen, bevel=0.06, collection=collection)
    box("Nightstand", (0.45, 0.4, 0.5), (0.05, 1.45, 0.25), wood, bevel=0.02, collection=collection)
    cyl("LampBase", 0.06, 0.3, (0.05, 1.45, 0.65), M("lampbase", (0.8, 0.6, 0.3, 1), rough=0.3, metal=1.0), collection=collection)
    cyl("LampShadeR", 0.16, 0.22, (0.05, 1.45, 0.9), emissive("roomlamp", (1.0, 0.8, 0.55, 1), 7.0), r2=0.11, collection=collection)
    box("Art", (0.9, 0.03, 0.6), (-1.0, -2.5, 1.6), M("art", (0.55, 0.30, 0.16, 1), rough=0.6), collection=collection)
    anchor("bed_edge", (0.45, 0.2, 0.52), collection=collection)
    anchor("window", (-0.6, 2.5, 1.55), collection=collection)


def guest_room_lights():
    from hl_render import area_light, flat_world
    flat_world((0.02, 0.03, 0.05), 0.3)
    area_light("RoomLamp", (0.1, 1.2, 1.3), (0.6, 0.2, 0.6), power=160, size=0.6, color=(1.0, 0.75, 0.5))
    area_light("RoomCeil", (0, -0.3, 2.8), (0.4, 0.2, 0.3), power=150, size=2.0, color=(1.0, 0.85, 0.65))
    area_light("WindowCool", (-0.6, 2.3, 1.6), (0.4, 0, 0.8), power=90, size=2.0, color=(0.55, 0.65, 1.0))


# ------------------------------------------------------------------ room-block stage
def room_blocks(n=100, cols=10, origin=(0, 0), pitch=0.42, size=0.34, states=None, collection=STATIC, name="Room"):
    """A grid of small rooms (bevelled blocks with a lit or dark 'window'): the hotel's inventory as objects.
    states: list of 'lit'|'dark'|'gone'|'extra' per block. Anchors ANCHOR:<name>_<i> at each block top."""
    lit = M("blocklit", (0.86, 0.80, 0.70, 1), rough=0.5)
    darkm = M("blockdark", (0.22, 0.20, 0.19, 1), rough=0.6)
    winon = emissive("blockwin", (1.0, 0.74, 0.44, 1), 4.0)
    winoff = M("blockwinoff", (0.03, 0.03, 0.035, 1), rough=0.3)
    extra = M("blockextra", (0.86, 0.42, 0.18, 1), rough=0.5)
    objs = []
    for i in range(n):
        st = states[i] if states else "lit"
        if st == "gone":
            continue
        c, r = i % cols, i // cols
        x = origin[0] + (c - (cols - 1) / 2) * pitch
        y = origin[1] + r * pitch
        b = box(f"{name}{i}", (size, size, size), (x, y, size / 2), extra if st == "extra" else (lit if st == "lit" else darkm), bevel=0.03, collection=collection)
        box(f"{name}Win{i}", (size * 0.4, 0.01, size * 0.4), (x, y - size / 2 - 0.004, size * 0.55), winon if st in ("lit", "extra") else winoff, collection=collection)
        anchor(f"{name}_{i}", (x, y, size), collection=collection)
        objs.append(b)
    return objs


# ------------------------------------------------------------------ props (DYNAMIC: carried, pulled, handed over)
def suitcase(name="Suitcase", loc=(0, 0, 0), color=(0.16, 0.24, 0.30, 1), collection=DYNAMIC):
    """Wheeled cabin suitcase. Origin at the wheel axle (floor contact, back edge), so it tilts about its wheels.
    Children: body, extended handle (top at local (0, 0, 1.0)) and two wheels."""
    root = bpy.data.objects.new(name, None)
    S.col(collection).objects.link(root)
    shell = M("caseshell", color, rough=0.35, coat=0.3)
    dark = M("casedark", (0.03, 0.03, 0.035, 1), rough=0.5)
    body = box(f"{name}_body", (0.38, 0.24, 0.56), (0, -0.12, 0.33), shell, bevel=0.04, collection=collection)
    rib = box(f"{name}_rib", (0.39, 0.245, 0.03), (0, -0.12, 0.45), dark, bevel=0.01, collection=collection)
    rod1 = box(f"{name}_rodL", (0.02, 0.02, 0.45), (-0.12, 0.005, 0.78), dark, collection=collection)
    rod2 = box(f"{name}_rodR", (0.02, 0.02, 0.45), (0.12, 0.005, 0.78), dark, collection=collection)
    grip = box(f"{name}_grip", (0.28, 0.03, 0.035), (0, 0.005, 1.0), dark, bevel=0.012, collection=collection)
    w1 = cyl(f"{name}_wheelL", 0.04, 0.03, (-0.15, 0.0, 0.04), dark, rot=(0, math.radians(90), 0), collection=collection)
    w2 = cyl(f"{name}_wheelR", 0.04, 0.03, (0.15, 0.0, 0.04), dark, rot=(0, math.radians(90), 0), collection=collection)
    for o in (body, rib, rod1, rod2, grip, w1, w2):
        o.parent = root
    root.location = loc
    root["handle_h"] = 1.0
    return root


def phone(name="Phone", collection=DYNAMIC, glow=(0.75, 0.88, 1.0, 1)):
    root = bpy.data.objects.new(name, None)
    S.col(collection).objects.link(root)
    body = box(f"{name}_body", (0.075, 0.009, 0.15), (0, 0, 0), M("phonebody", (0.03, 0.03, 0.035, 1), rough=0.3), bevel=0.006, collection=collection)
    scr = box(f"{name}_screen", (0.066, 0.002, 0.136), (0, -0.0052, 0), emissive("phonescreen", glow, 2.5), collection=collection)
    chk = box(f"{name}_check", (0.03, 0.003, 0.012), (0, -0.0065, 0.02), emissive("phonecheck", (0.30, 0.85, 0.45, 1), 4.0), collection=collection)
    for o in (body, scr, chk):
        o.parent = root
    return root


def keycard(name="KeyCard", collection=DYNAMIC):
    root = bpy.data.objects.new(name, None)
    S.col(collection).objects.link(root)
    c = box(f"{name}_card", (0.085, 0.003, 0.054), (0, 0, 0), M("keycard", (0.86, 0.45, 0.18, 1), rough=0.3), bevel=0.003, collection=collection)
    c.parent = root
    return root
