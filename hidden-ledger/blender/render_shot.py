"""Render one 3D shot of an episode: background plate + animated character layer + anchors (resumable, cached).

  blender -b --factory-startup --python blender/render_shot.py -- --episode 004 --shot sh01 [--mode plate|chars|all|still] [--frame N]

Shots are defined in blender/shots/epXXX.py (one function per shot). Timing comes from the narration timeline
(output/episode-XXX/audio/full/timeline.json): a shot runs from the start of its first narration segment (or its
scene's start) to the start of the next shot, so picture and voice stay locked when the narration changes.

Output: output/episode-XXX/shots/<id>/
  plate.png        static set, rendered once at high quality (DYNAMIC collection hidden)
  char/NNNN.png    characters + moving props, transparent, cropped to the area they cover, every `step` frames;
                   static objects become shadow catchers, so contact shadows and occlusion are exact
  meta.json        frames, step, crop rectangle, projected anchors/screens, source hash (cache key)
"""
from __future__ import annotations

import argparse
import hashlib
import importlib
import inspect
import json
import math
import os
import sys
import time
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / "shots"))

import hl_anim  # noqa: E402
import hl_anim2  # noqa: E402
import hl_char  # noqa: E402
import hl_char2  # noqa: E402
import hl_render as R  # noqa: E402
import hl_sets as S  # noqa: E402

FPS = 30
W, H = 1920, 1080
PLATE_SPP = 40  # static plate, OIDN-denoised
CHAR_SPP = 4    # character layer: 4 spp + fast OIDN (the denoiser's quality mode alone was 15 s/frame on this CPU)
BIG_CROP = 0.35  # crops covering more of the frame than this render at 2/3 resolution and are upscaled 1.5x


class ShotCtx:
    """What a shot function gets: timing helpers, scene builders and the actors it creates."""

    def __init__(self, tl, t0, t1, shot_id):
        self.tl, self.t0, self.t1, self.id = tl, t0, t1, shot_id
        self.n = max(1, round((t1 - t0) * FPS))
        self.segs = {g["key"]: g for sc in tl["scenes"] for g in sc["segments"]}
        self.actors: list[hl_anim.Acting] = []
        self.step = 2
        self.char_samples = int(os.environ.get("HL_CHAR_SPP", CHAR_SPP))
        self.plate_samples = PLATE_SPP
        self.margin = 0.05
        self.shadow_dir = None
        # False: the character pass catches no floor shadows (the floor is a plain holdout). For shots under a ceiling
        # whose character shadow is hidden anyway: there the catcher would also record the ceiling's sky occlusion.
        self.floor_shadows = True
        # None: static holdouts cast shadows only under a ceiling (see the character pass). False forces the open-set
        # behaviour, e.g. a walk across a bright lounge floor, where the catcher would record the ceiling's sky occlusion
        self.static_shadows = None
        self.chars_pct = 100
        self.v2 = False  # episode 005+: V2 character, rendered on ones (set from the shot module's CHARACTER)
        self.sounds = []  # [shot-local frame, sound name, gain dB] -> meta.json "sfx" (placed by python/mix.py)
        self.bed = None   # ambience bed under the whole shot (assets/sfx/<name>.wav, looped)
        self.bed_db = 0.0

    def sfx(self, frame, name, gain_db=0.0):
        self.sounds.append([int(frame), name, float(gain_db)])

    def ambience(self, name, gain_db=0.0):
        self.bed, self.bed_db = name, gain_db

    # ---- timing (shot-local frames)
    def at(self, key, off=0.0):
        return round((self.segs[key]["start"] + off - self.t0) * FPS)

    def end(self, key, off=0.0):
        return round((self.segs[key]["end"] + off - self.t0) * FPS)

    def word(self, key, pattern, nth=0, off=0.0, frac=0.5):
        import re
        g = self.segs[key]
        hits = [t for t, w in (g.get("words") or []) if re.search(pattern, w, re.I)]
        t = hits[nth] if len(hits) > nth else g["start"] + (g["end"] - g["start"]) * frac
        return round((t + off - self.t0) * FPS)

    def sec(self, s):
        return round(s * FPS)

    # ---- actors
    def person(self, name, style, seed=1, static=False):
        """V2 rig with a style from hl_char2.STYLES ('hero', 'clerk', 'guest1'...)."""
        rig, parts = hl_char2.build(name, style, parent_col=S.col(S.STATIC if static else S.DYNAMIC))
        a = hl_anim2.Actor(rig, parts, seed=seed)
        if style != "hero":
            a.breath = 0.8
        if static:
            self._static_actors = getattr(self, "_static_actors", []) + [a]
        else:
            self.actors.append(a)
        return a

    def hero(self, seed=1, static=False):
        """The protagonist. static=True puts it in the plate (for shots where it does not move)."""
        if self.v2:
            return self.person("Hero", "hero", seed, static)
        rig, parts = hl_char.build("Passenger", parent_col=S.col(S.STATIC if static else S.DYNAMIC))
        a = hl_anim.Acting(rig, parts["face"], FPS, seed=seed)
        if static:
            self._static_actors = getattr(self, "_static_actors", []) + [a]
        else:
            self.actors.append(a)
        return a

    def extra(self, i, backpack=False, static=False):
        rig, parts = hl_char.build(f"Extra{i}", extra=i, backpack=backpack, parent_col=S.col(S.STATIC if static else S.DYNAMIC))
        a = hl_anim.Acting(rig, parts["face"], FPS, seed=10 + i)
        a.breath = 0.7
        if not static:
            self.actors.append(a)
        else:
            self._static_actors = getattr(self, "_static_actors", []) + [a]
        return a


def load_shots(ep):
    mod = importlib.import_module(f"ep{ep}")
    return mod


def shot_spans(tl, shots):
    """[(shot, t0, t1)] — contiguous within each scene."""
    by_scene = {}
    for s in shots:
        by_scene.setdefault(s["scene"], []).append(s)
    segs = {g["key"]: g for sc in tl["scenes"] for g in sc["segments"]}
    out = []
    for sc in tl["scenes"]:
        lst = by_scene.get(sc["id"], [])
        starts = []
        for i, s in enumerate(lst):
            t = sc["start"] if i == 0 else segs[s["from"]]["start"] + s.get("lead", -0.25)
            starts.append(t)
        for i, s in enumerate(lst):
            out.append((s, starts[i], starts[i + 1] if i + 1 < len(lst) else sc["end"]))
    return out


def project(cam, p):
    sc = bpy.context.scene
    v = world_to_camera_view(sc, cam, Vector(p))
    return [round(v.x * W, 1), round((1 - v.y) * H, 1), round(v.z, 3)]


def export_anchors(cam):
    bpy.context.view_layer.update()
    anchors, screens = {}, {}
    for o in bpy.data.objects:
        if o.name.startswith("ANCHOR:"):
            anchors[o.name[7:]] = project(cam, o.matrix_world.translation)
        elif o.name.startswith("SCREEN:"):
            mw = o.matrix_world
            vs = [mw @ v.co for v in o.data.vertices]
            # order: top-left, top-right, bottom-right, bottom-left in image space
            pts = [project(cam, v) for v in vs]
            cx = sum(p[0] for p in pts) / 4
            cy = sum(p[1] for p in pts) / 4
            pts.sort(key=lambda p: math.atan2(p[1] - cy, p[0] - cx))
            # atan2 order from -pi: top-left first (y up negative) -> tl, tr, br, bl
            screens[o.name[7:]] = [p[:2] for p in pts]
    return anchors, screens


def char_crop(ctx, cam, frames):
    """Union of the dynamic objects' projected bounds (+ their ground shadows) over the shot, as a border."""
    sc = bpy.context.scene
    dyn = [o for o in S.col(S.DYNAMIC).all_objects if o.type in ("MESH", "CURVE")]
    if not dyn:
        return None
    xs, ys = [], []
    sun = ctx.shadow_dir
    for f in frames[:: max(1, len(frames) // 40)] + [frames[-1]]:
        sc.frame_set(f)
        dg = bpy.context.evaluated_depsgraph_get()
        for o in dyn:
            oe = o.evaluated_get(dg)
            for c in oe.bound_box:
                p = oe.matrix_world @ Vector(c)
                pts = [p]
                if sun is not None and sun.z < -0.05 and p.z > 0:
                    # ground shadow point, capped at 2.5 m from the body (low suns give endless shadows that
                    # would otherwise stretch the crop to the whole frame; beyond that the shadow is faint)
                    sh = p - sun * (p.z / sun.z)
                    d = sh - Vector((p.x, p.y, 0))
                    if d.length > 2.5:
                        sh = Vector((p.x, p.y, 0)) + d.normalized() * 2.5
                    pts.append(sh)
                for q in pts:
                    v = world_to_camera_view(sc, cam, q)
                    if v.z > 0:
                        xs.append(v.x)
                        ys.append(v.y)
    if not xs:
        return None
    m = ctx.margin
    x0, x1 = max(0.0, min(xs) - m), min(1.0, max(xs) + m)
    y0, y1 = max(0.0, min(ys) - m), min(1.0, max(ys) + m)
    # snap to even pixels
    px = lambda v, n: round(v * n / 2) * 2 / n
    return px(x0, W), px(x1, W), px(y0, H), px(y1, H)


def source_hash(shot, mod, t0, t1, tl):
    """(plate_hash, full_hash): the plate depends on code only; the character layer also on the narration timing."""
    h = hashlib.sha256()
    # plate: what the static image depends on (not the character-pass settings in this file)
    v2 = getattr(mod, "CHARACTER", "v1") == "v2"
    for f in ("hl_char.py", "hl_sets.py", "hl_render.py") + (("hl_char2.py", "hl_hotel.py") if v2 else ()):
        h.update((HERE / f).read_bytes())
    h.update(inspect.getsource(shot["build"]).encode())
    for nm in shot.get("uses", []):
        h.update(inspect.getsource(getattr(mod, nm)).encode())
    h.update(f"plate_spp={PLATE_SPP}".encode())
    plate = h.hexdigest()[:12]
    for f in ("hl_anim.py", "render_shot.py") + (("hl_anim2.py",) if v2 else ()):
        h.update((HERE / f).read_bytes())
    segs = [g for sc in tl["scenes"] for g in sc["segments"] if g["end"] > t0 and g["start"] < t1]
    h.update(json.dumps([round(t0, 3), round(t1, 3), [(g["key"], g["start"], g["end"], g.get("words")) for g in segs]]).encode())
    return plate, h.hexdigest()[:12]


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", required=True)
    ap.add_argument("--shot", required=True)
    ap.add_argument("--mode", default="all", choices=["plate", "chars", "all", "still", "plan"])
    ap.add_argument("--frame", type=int, default=0)
    ap.add_argument("--pct", type=int, default=100)
    ap.add_argument("--threads", type=int, default=0, help="CPU threads for Cycles (0 = all)")
    ap.add_argument("--out")
    ap.add_argument("--timeline", help="override timeline.json (layout tests before the narration exists)")
    a = ap.parse_args(argv)
    tl = json.loads(Path(a.timeline).read_text() if a.timeline else (ROOT / "output" / f"episode-{a.episode}" / "audio" / "full" / "timeline.json").read_text())
    mod = load_shots(a.episode)
    spans = shot_spans(tl, mod.SHOTS)
    shot, t0, t1 = next(x for x in spans if x[0]["id"] == a.shot)
    out = ROOT / "output" / f"episode-{a.episode}" / "shots" / a.shot
    out.mkdir(parents=True, exist_ok=True)
    meta_path = out / "meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    plate_hsh, hsh = source_hash(shot, mod, t0, t1, tl)

    R.reset()
    sc = R.cycles(samples=64, threads=a.threads)
    ctx = ShotCtx(tl, t0, t1, a.shot)
    if getattr(mod, "CHARACTER", "v1") == "v2":
        ctx.v2, ctx.step = True, 1
    S.col(S.STATIC)
    S.col(S.DYNAMIC)
    cam = shot["build"](ctx)
    sc.camera = cam
    frames = list(range(0, ctx.n, ctx.step))
    if ctx.n - 1 not in frames:
        frames.append(ctx.n - 1)
    for act in ctx.actors + getattr(ctx, "_static_actors", []):
        if isinstance(act, hl_anim2.Actor):
            act.bake(ctx.n if act in ctx.actors else 1)  # springs need every frame, in order
        else:
            act.bake(frames if act in ctx.actors else [0])
    if ctx.v2 and os.environ.get("HL_VALIDATE"):
        import hl_validate
        hl_validate.run(ctx, out)
    sc.frame_start, sc.frame_end = 0, ctx.n - 1
    if a.mode == "plan":
        print(json.dumps({"shot": a.shot, "t0": t0, "t1": t1, "frames": ctx.n, "hash": hsh}))
        return

    if meta.get("plate_hash") != plate_hsh:
        (out / "plate.png").unlink(missing_ok=True)  # set/camera/code changed
    if meta.get("hash") != hsh:
        for p in (out / "char").glob("*.png"):  # code or narration timing changed
            p.unlink()
        meta = {k: v for k, v in meta.items() if k == "plate_hash" and v == plate_hsh}
    anchors, screens = export_anchors(cam)
    meta.update({"id": a.shot, "scene": shot["scene"], "t0": round(t0, 4), "t1": round(t1, 4), "frames": ctx.n, "step": ctx.step,
                 "anchors": anchors, "screens": screens, "hash": hsh, "plate_hash": plate_hsh})
    if ctx.sounds or ctx.bed:
        meta.update({"sfx": ctx.sounds, "bed": ctx.bed, "bed_db": ctx.bed_db})

    if a.mode == "still":
        # quick review frame: full composite (plate + characters), no transparency
        sc.cycles.samples = 16
        sc.render.resolution_percentage = a.pct
        sc.frame_set(a.frame)
        sc.render.filepath = a.out or str(out / f"still_{a.frame:04d}.png")
        bpy.ops.render.render(write_still=True)
        return

    if a.mode in ("plate", "all") and not (out / "plate.png").exists():
        S.col(S.DYNAMIC).hide_render = True
        sc.cycles.samples = ctx.plate_samples
        sc.render.film_transparent = False
        sc.render.image_settings.color_mode = "RGB"
        sc.frame_set(0)
        sc.render.filepath = str(out / "plate.png")
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print(f"PLATE {a.shot} {time.time() - t:.0f}s", flush=True)
        S.col(S.DYNAMIC).hide_render = False

    done = meta.get("composited_hash") == hsh and (out / "shot.mp4").exists()
    if done and a.mode in ("chars", "all"):
        print(f"CHARS {a.shot}: already composited with this hash, skipped", flush=True)
    if a.mode in ("chars", "all") and ctx.actors and not done:
        crop = char_crop(ctx, cam, frames)
        if crop:
            # Character pass, fast path: the set only masks and catches shadows; it is not path-traced again.
            #  * floors/grounds: shadow catchers (contact shadows), invisible to bounce rays
            #  * everything else static: holdout (occludes the characters where it is in front), casts shadows,
            #    but takes no part in indirect light (the shot's fill lights stand in for the room bounce)
            #  * open sets (no ceiling: tarmac, stage): holdouts cast no shadows either. Otherwise their shadows and
            #    sky occlusion land on the shadow catcher a second time (the plate already has them): a darker patch
            #    with a visible seam at the crop edge. Under a ceiling they must keep blocking the sun and sky.
            catch = ("Floor", "Tarmac", "Cyclorama", "Ground", "Street", "Rim")
            statics = [o for o in S.col(S.STATIC).all_objects if o.type in ("MESH", "CURVE")]
            open_set = not any("Ceiling" in o.name for o in statics) if ctx.static_shadows is None else not ctx.static_shadows
            for o in statics:
                o.visible_diffuse = o.visible_glossy = o.visible_transmission = o.visible_volume_scatter = False
                if ctx.floor_shadows and any(k in o.name for k in catch):
                    o.is_shadow_catcher = True
                else:
                    o.is_holdout = True
                    if open_set:
                        o.visible_shadow = False
            # emissive set pieces (city windows, screens, strip lights) stop being sampled as lights here: the
            # characters are lit by the shot's lamps + sky, and light-tree sampling of hundreds of emitters was the
            # dominant per-ray cost
            for m in bpy.data.materials:
                if m.name.startswith("E_"):
                    m.cycles.emission_sampling = "NONE"
            sc.cycles.max_bounces = 4
            sc.cycles.diffuse_bounces = 2
            sc.cycles.glossy_bounces = 2
            # stand-in for the room's warm bounce light (the set no longer bounces light in this pass)
            dyn = [o for o in S.col(S.DYNAMIC).all_objects if o.type == "ARMATURE"]
            if dyn:
                tgt = sum((o.matrix_world.translation for o in dyn), Vector()) / len(dyn) + Vector((0, 0, 1.0))
                cpos = cam.matrix_world.translation
                bpos = tgt + (cpos - tgt).normalized() * 2.5 + Vector((0, 0, -0.6))
                R.area_light("BounceFill", tuple(bpos), tuple(tgt), power=110, size=3.0, color=(1.0, 0.72, 0.48))
            sc.cycles.denoising_quality = "FAST"
            sc.cycles.denoising_prefilter = "FAST"
            sc.render.film_transparent = True
            sc.render.image_settings.color_mode = "RGBA"
            sc.cycles.samples = ctx.char_samples
            sc.render.use_border = True
            sc.render.use_crop_to_border = True
            sc.render.border_min_x, sc.render.border_max_x, sc.render.border_min_y, sc.render.border_max_y = crop
            meta["crop"] = [round(crop[0] * W), round((1 - crop[3]) * H), round((crop[1] - crop[0]) * W), round((crop[3] - crop[2]) * H)]
            area = (crop[1] - crop[0]) * (crop[3] - crop[2])
            pct = 67 if area > BIG_CROP else 100
            sc.render.resolution_percentage = pct
            meta["char_pct"] = pct
            meta_path.write_text(json.dumps(meta, indent=1))
            cdir = out / "char"
            cdir.mkdir(exist_ok=True)
            for p in cdir.glob("*.png"):  # placeholders left by an interrupted run
                if p.stat().st_size < 200:
                    p.unlink()
            todo = [f for f in frames[:-1] if not (cdir / f"{f:04d}.png").exists()]
            print(f"CHARS {a.shot}: {len(todo)}/{len(frames) - 1} frames to render, crop {meta['crop']}", flush=True)
            # one animation render (persistent data: the scene is synced once, not per frame); existing frames are skipped
            sc.frame_start, sc.frame_end, sc.frame_step = 0, ctx.n - 1, ctx.step
            sc.render.use_overwrite = False
            sc.render.use_placeholder = True
            sc.render.filepath = str(cdir / "####")
            t = time.time()
            if os.environ.get("HL_PROBE"):
                exec(open(os.environ["HL_PROBE"]).read())
            if todo:
                lim = int(os.environ.get("HL_MAX_FRAMES", "0"))
                if lim:  # timing tests: render only the first `lim` frames
                    sc.frame_end = min(sc.frame_end, todo[0] + (lim - 1) * ctx.step)
                bpy.ops.render.render(animation=True)
            print(f"CHARS {a.shot} done in {time.time() - t:.0f}s ({(time.time() - t) / max(1, len(todo)):.1f}s/frame)", flush=True)
    meta_path.write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    main()
