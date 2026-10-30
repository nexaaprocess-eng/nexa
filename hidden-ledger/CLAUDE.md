# Hidden Ledger — project guide for Claude Code

Faceless economics documentaries, built entirely from code: **fact-checked script → TTS narration → procedural music/SFX → (Blender 3D shots, ep. 004+) → Remotion compositing → FFmpeg export + QA.**
Zero paid APIs. Everything runs on CPU. This folder lives inside the `nexa` repository (`hidden-ledger/`); the rest of the repo is an unrelated website.

## Episodes
| # | Title | Style | Runtime | Delivery folder |
|---|---|---|---|---|
| 001 | Who Really Pays for FREE Returns? | 2D Remotion infographics, dark ledger look, Kokoro `am_michael` | 9:53 | `output/episode-001/final/` |
| 002 | How Supermarkets Make Money on Tiny Margins | same | 9:59 | `episode002/` |
| 003 | Why Every App Wants a Subscription | same + light phone UIs | 11:09 | `episode003/` |
| 004 | How Can Airlines Sell Flights for Just $20? | **character-led 3D** (Blender + Remotion), Chatterbox narration | 8:02 | `episode004/` |
| 005 | Why Do Hotels Sell Rooms They Don't Have? | 3D with the **V2 character** (IK rig, footstep walks, rendered on ones) | see `episode005/episode_005_QA_report.md` | `episode005/` |

Never delete or overwrite previous episodes' content, scenes or deliverables. Shared code changes must stay backward compatible (episodes 001–003 still render with `wipe` transitions, the old HUD and Kokoro).

## The main character V2 ("the Stickman"), episode 005 onwards
Source of truth: `blender/hl_char2.py` (build + rig + face) and `blender/hl_anim2.py` (performance). Reusable for 006+.
- Design: minimalist ivory-white mascot: one smooth body (skin-modifier graph baked to a mesh, distance weights with a
  narrow blend at each joint, Armature -> Subdivision), round head (r 0.175 m, total height ~1.70 m), tall black glossy
  eyes, thin brows, a small line mouth (+ "o" shape), mitten hands with a thumb, rounded feet. No clothes, no backpack,
  no accessories. Other people (`STYLES`: clerk, guest1-3) share the rig with coloured bodies and darker heads.
- Rig: deform chain hips>spine>chest>neck>head + arms/legs; control bones `ik_foot.*`, `pole_knee.*`, `ik_hand.*`,
  `pole_elbow.*`. Legs are always IK; arms are IK with chest-space or world-space targets. Pole angles were measured
  (legs -90, arms +90): change them only after a numeric check (elbow below the shoulder, knee forward).
- Face: eye pivots at the head centre (rotating a pivot slides the eye over the head = gaze); brows on pivots (raise =
  pivot pitch, inner angle = brow roll, + = inner end up); mouth curve points re-projected onto the head every frame.
- Why ep004's Passenger looked robotic (diagnosed from `hl_anim.py`): the root slid along the path at a speed unrelated
  to the sine-wave legs (foot sliding), every bone shared one ease (no overlap), turns spun the body on planted feet,
  gestures were symmetric bumps, hands could not hold anything, and characters rendered on twos.
- `hl_anim2.Actor` fixes those at the source:
  - walks are planned as footsteps (`walk(f0, path, speed, end_yaw)` returns the frame the feet are together); each
    foot is planted in world space between steps, rolls over the heel at contact and the toe at push-off (pivots at
    sole level); the centre of mass follows the feet (spring + velocity feed-forward), the pelvis bobs/sways/twists from
    the support phase and is lowered when a leg cannot reach; `turn()` steps, `shift()` adjusts stance, `sit()`/`stand_up()`
    blend the pelvis onto a seat with a forward lean while the feet stay planted;
  - upper body: `pose()` (library `POSES`, or a dict: spine-chain euler degrees + hand/pole offsets in the chest frame),
    each channel through its own spring with per-joint delays (hips lead, hands follow: overlap and follow-through),
    `back=True` adds anticipation/overshoot; `gesture()`, `nod()`, `shake()`;
  - hands: `reach(f, side, world point | callable(f) | None)`, `attach()` (prop in the palm), `hold()` (grip taken at
    that frame), `pull()` (wheeled suitcase solved from the hand each frame, wheels on the floor); props are keyed only on
    frames the actor controls them (hand-overs between actors work);
  - gaze: `look(f, point | "phone" | None)`: eyes jump first, the head follows, eyes counter-rotate; big gaze shifts
    blink; targets behind the character never flip the head; expressions (`EXPR`) blend continuously.
  - `bake(n)` simulates every frame in order (springs need history) and keys every frame: V2 shots render ON ONES.
- Validation: `HL_VALIDATE=1` + `render_shot.py` writes `shots/<id>/validate.json` (`blender/hl_validate.py`): planted-foot
  sliding (mm), IK miss, per-frame rotation (snaps), lowest foot vertex vs floor, body/set mesh overlap (seats excluded).
- QA renders: `blender/test_char2.py` (turnaround / face), `blender/test_anim2.py` (walk-stop-turn-act-walk with numbers).

## The main character ("the Passenger"), episode 004
Reference sheet: `assets/character/reference_sheet.png` (primary reference, supplied by the channel owner).
- Smooth **ivory-white round head** (≈ one third of total height) on a thin neck; **tall black glossy oval eyes**; thin black **eyebrows** do most of the acting; no mouth unless an expression needs one.
- Oversized **cream hoodie** (hood bunched at the neck, drawstrings, pocket, ribbed cuffs), **black baggy trousers** bunching over **chunky white/grey sneakers**, **black backpack**, ivory mitten hands.
- Palette: ivory `#F2EDE4`, taupe `#8E8579`, near-black `#161616`, orange `#E07A3A`, slate `#5E7C8E`.
- Never redesign it: not a stickman, not a robot, not a TV head. Same outfit in every shot. Background people ("extras") use the same rig with darker taupe/slate heads, coloured tops and no eyebrows, so they never read as the protagonist.

Source of truth for the asset: `blender/hl_char.py` (procedural build + rig + `POSES` + `EXPRESSIONS`). The character is regenerated by code in every shot, so it is identical everywhere.
- Rig: armature `PassengerRig`. The clothed body is one skin-modifier mesh with distance-based weights; head, hands, shoes, backpack and face parts are rigid bone children.
- Bone rotation conventions are in the comment above `POSES`. For vertical bones: x = pitch, **y = yaw**, z = roll.
- Expressions: neutral, happy, curious, surprised, confused, thinking, worried, sad, skeptical, excited, angry, satisfied (as on the sheet).
- Acting: `blender/hl_anim.py` `Acting` composes eased pose keys, a procedural walk (also on stairs: path points may carry z), breathing, weight shift, look-at (head + eyes), gestures, expressions and automatic blinks. It is a pure function of the frame, so any frame re-renders identically.
- QA renders: `blender/test_turnaround.py` (turnaround / faces / poses), `blender/test_poses.py` (pose + walk sheet).

## 3D shot pipeline (episode 004)
```
blender/shots/ep004.py        one function per shot: set + camera + lights + acting, timed to narration words
  │  blender/render_shot.py   (Blender 4.5 LTS, Cycles CPU, AgX)
  │     plate.png             static set, 40 spp + OIDN, rendered once
  │     char/NNNN.png         characters only, transparent, cropped, every 2nd frame ("on twos"), 4 spp + OIDN (fast);
  │                           crops > 35 % of the frame render at 67 % and are scaled back (Lanczos, premultiplied)
  │     meta.json             frames, crop, projected anchors ("ANCHOR:x") and screens ("SCREEN:x"), source hash
  ▼  python/composite_shots.py → shots/<id>/shot.mp4 (frame-exact) + shots/manifest.json
                              crop edges inside the frame fade over 32 px (feather mask; blend forced to gbrap)
src/scenes/ep004/scenes.tsx   <Shot id=…> plays shot.mp4 under a virtual camera move; overlays (price tags, callouts,
                              screen UIs mapped with a homography) attach to the projected anchors, timed with useBeats().word()
```
- Character pass, static set: floors ("Floor", "Tarmac", "Cyclorama", "Ground", "Street", "Rim") are shadow catchers,
  everything else is a holdout. In an **open set** (no object named "Ceiling") holdouts cast no shadows, otherwise their
  shadows would be counted twice (they are already in the plate). Per-shot overrides on `ctx`:
  `ctx.static_shadows = False` (force open-set behaviour, used by the terminal and gate sets) and
  `ctx.floor_shadows = False` (floor becomes a plain holdout, used for seated characters in sh19/sh31).
- `crisp_tail()` in `shots/ep004.py` removes the subdivision from the fin and winglets (a 4-vertex section turned
  leaf-shaped); it is local to the shots that list it in `uses`, so the shared airliner is unchanged.
- Hashes: `render_shot.py` and `hl_anim.py` are part of every shot's full hash, so editing them invalidates every
  character layer. When an edit cannot change a shot's output, rewrite its meta hash instead of re-rendering
  (`render_shot.py … --mode plan` prints the new hash; set `hash`, and `composited_hash` if it was composited).
  Long renders: `scripts/render_shots_ep.sh 004 [shots…]` (detached; log in `output/episode-004/shots/render.log`).
- Install Blender: the official 4.5 LTS Linux tarball (`/opt/blender-dl/…`, symlinked as `blender`). Set `BLENDER=` to override.
- `node scripts/pipeline.mjs shots --episode 004 [--only sh01,sh02]` renders (resumable: existing frames are skipped; a changed shot function, timing or shared rig code invalidates only that shot), composites and refreshes the props.
- Layout checks before the narration exists: `render_shot.py … --mode still --timeline <provisional.json>`.
- Measured cost on this 4-vCPU machine: ≈ 1–5 s per character frame at 1080p (depends on how much of the frame the characters cover). Plates take ≈ 1–3 min each. Remotion renders the episode in per-scene chunks as before.
- The Remotion render fetches shot videos over HTTP from a local server started by the pipeline (port 8766), instead of copying them into every bundle.
- Episode 004 uses `"style": "cine"` and `"transitions": "cut"` in `episode.json`: no orange wipes or whooshes, a light HUD (logo + chapter card), softer subtitles, a vignette grade.

## Episode 005 specifics
- Sets: `blender/hl_hotel.py` (night lobby/reception, street with a 100-window facade = the hotel's inventory, corridor
  with a hinged door, guest room, room blocks; props: suitcase, phone, key card). Shot list: `blender/shots/ep005.py`
  (`CHARACTER = "v2"`: render_shot.py bakes every frame and renders on ones; hl_char2/hl_anim2/hl_hotel join the hash).
- Staging rule: the protagonist is seen from the front or three-quarters; desk scenes are shot over the clerk's shoulder.
- Sound anchored to animation: shots call `ctx.sfx(frame, name, gain)` and `ctx.ambience(bed)`; render_shot writes them to
  meta.json and `python/mix.py` places them from the shot manifest (re-run `pipeline.mjs audio` after the shots).
  New synthesised sounds in `python/music.py`: bell, keys, keycard, door, wheels, ding, paper, bed_lobby/street/corridor.
- Narration: Chatterbox with `cfg 0.3` and `tempo 0.87` (rubberband time-stretch in `chatterbox_narration.py`; the
  tempo joins the cache key only when it is not 1.0) for a calmer documentary pace.
- Docs: `content/episode-005/build_storyboard.py` (storyboard with the 8 fields per scene + shot times),
  `build_youtube.py` (metadata with chapters rounded up), `calculations.py` (binomial made-up hotel + dataset counts).

## Narration
- Episodes 001–003: Kokoro-82M (`python/generate_voice.py`), voice `am_michael`.
- Episode 004: **Chatterbox TTS 0.1.7** (Resemble AI, MIT), chosen after a measured comparison with six Kokoro voices (`output/episode-004/audio/voices/`).
  - Runs in its own venv, `.venv-cbx` (`node scripts/pipeline.mjs setup-chatterbox`).
  - `python/chatterbox_narration.py`: each segment's take is seeded from its text hash, so runs are reproducible.
  - Every take is Whisper-checked (WER ≤ 0.12, numbers normalised) and regenerated with the next seed on failure.
  - Outputs carry Resemble's inaudible Perth watermark.
- Spoken forms go in `say` (euro amounts, years); `lexicon` fixes names ("Ryanair" → "Ryan air").

## Research rules (unchanged)
Every number in the narration links to a claim in `content/episode-XXX/claims.json` with a verbatim quote and a source in `fact_check.csv`. `python python/write_docs.py script --episode XXX` fails if any number is unlinked. Illustrative figures are labelled on screen and in the narration. Episode 004 sources are primary filings (Ryanair Form 20-F FY2026, Frontier and Spirit SEC filings). See `content/episode-004/sources.md`.

## Commands (episode 004)
```bash
python3 content/episode-004/build_episode.py   # narration text → episode.json (also build_claims.py, build_notes.py)
node scripts/pipeline.mjs narration --episode 004   # Chatterbox, cached per segment
node scripts/pipeline.mjs audio --episode 004       # timeline (Whisper word times) + mix
node scripts/pipeline.mjs shots --episode 004       # Blender shots → shot.mp4 + manifest
node scripts/pipeline.mjs render --episode 004 --concurrency 3   # per-scene cached chunks
node scripts/pipeline.mjs encode --episode 004 && node scripts/pipeline.mjs qa --episode 004 && node scripts/pipeline.mjs deliver --episode 004
blender -b --factory-startup --python blender/render_thumbs.py && node scripts/pipeline.mjs thumbnails --episode 004
```
Large binaries (final MP4s, render chunks, shot frames) are git-ignored; they regenerate from the code.
