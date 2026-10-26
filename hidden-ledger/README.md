# Hidden Ledger · documentary factory

*The hidden economics of everyday life.* Faceless economics documentaries built from code:
**fact-checked script → Kokoro TTS (CPU) → procedural music + SFX → Remotion 2D animation → FFmpeg mix/export/QA.**
Zero paid APIs, zero subscriptions, no CUDA.

Episode 001: **Who Really Pays for Free Returns?** (9:52, 1080p).

## Install (Windows PowerShell)

Requirements: Node.js 20+ (`winget install OpenJS.NodeJS.LTS`), Python 3.10+ (`winget install Python.Python.3.12`), FFmpeg on PATH (`winget install Gyan.FFmpeg`). Open a **new** terminal after installing.

```powershell
cd hidden-ledger
npm ci                 # Remotion, React, fonts (exact versions in package-lock.json)
npm run setup          # creates .venv, installs python/requirements.txt, downloads + checks the Kokoro model (~350 MB)
npm run doctor         # checks tools, RAM/CPU, model, fonts, permissions; suggests concurrency
```

macOS/Linux: identical commands (the scripts pick `.venv/bin/python` or `.venv\Scripts\python.exe` automatically).

## Commands

| Command | What it does | Output |
|---|---|---|
| `npm run doctor` | environment diagnosis | `diagnostics/doctor.json` |
| `npm run voices` | same ~25 s text with `am_michael`, `am_adam`, `af_heart` + ASR intelligibility | `output/episode-001/audio/voices/` (+ `voice_comparison.md`) |
| `npm run pilot` | first ~83 s: real voice, animation, music, SFX, subtitles, 720p, validated | `output/episode-001/preview/pilot.mp4` + `.srt`, `diagnostics/pilot_report.json`, screenshots |
| `npm run episode:001` | full episode, 1080p | `output/episode-001/full/full_video.mp4` + `full_video.en.srt`, `diagnostics/full_report.json` |
| `npm run episode:001:preview` | same at 720p (faster) | same path |
| `npm run episode:001:v2` | full episode, 1080p, **YouTube delivery encode**: two-pass H.264 High@4.2 at 8 Mbps, GOP 15, AAC 384 kbps, then A/V sync check | `output/episode-001/full/full_video_v2.mp4`, `diagnostics/av_check_full_video_v2.json` |
| `npm run shorts:001` | two 9:16 Shorts reusing the full render (needs the episode first) | `output/episode-001/shorts/` |
| `npm run thumbnails:001` | three 1280×720 PNG thumbnails | `output/episode-001/thumbnails/` |
| `npm run verify` | probes every deliverable (duration, codecs, resolution, loudness, files, licences) + contact sheets | `diagnostics/verify.json` |
| `npm run studio` | Remotion Studio to preview/scrub scenes in the browser | — |

Options (append after `--`): `--quality preview|hd`, `--concurrency N` (lower it on slow PCs), `--no-subs` (no burned-in subtitles; the `.srt` is always exported), `--name <file>` and `--bitrate 8M` (episode only: output name and two-pass delivery encode).

Review helpers: `node scripts/stills.mjs <props.json> <outDir> 0.5 <seconds...>` renders many frames from one bundle; `python python/av_check.py --video <mp4> [--asr]` checks frame count, audio offset/drift (cross-correlation with the lossless mix), picture cuts vs the narration timeline and, with `--asr`, intelligibility through the final mix.
Example: `npm run episode:001 -- --quality preview --concurrency 1`

**Measured on this build machine (4 CPU threads, CPU only):** pilot 720p ≈ 1.5 min to render; full episode 1080p ≈ 26 min at concurrency 2, Shorts ≈ 3 min. Kokoro narration for the whole script ≈ 4 min (cached afterwards).

## Change the voice
Edit `voice.voiceId` / `voice.speed` in `content/episode-001/episode.json` (or set `VOICE_ID`, e.g. `$env:VOICE_ID="am_adam"`), then rerun `npm run pilot` or `npm run episode:001`. Narration is cached per segment by a hash of text + voice + speed + model, so only what changed is re-synthesised.

## How it fits together

```
content/episode-XXX/episode.json   ← single source of truth: scenes, narration segments, claim ids, voice, pilot & shorts ranges
        │  python/generate_voice.py  (Kokoro, per segment, cached, validated: empty/silent/clipped → retry or fail loudly)
        ▼
output/.../audio/narration/scene-XX/segment-YY.wav
        │  python/build_timeline.py  (real WAV durations + configured pauses → timeline.json, narration.wav, SRT;
        │                             subtitle splits and visual sync use Whisper word timestamps of the real audio)
        │  python/mix.py             (procedural score per scene + SFX + ducking + 2-pass loudnorm → mix.wav)
        ▼
src/ (Remotion)  Episode composition reads timeline.json → scene components keyed by scene id
        │  scripts/pipeline.mjs      (render muted video → mux with mix.wav → validate → screenshots)
        ▼
output/episode-XXX/{preview,full,shorts,thumbnails}
```

- `src/components/sets.tsx` reusable animated environments: `StreetSet` (3-layer parallax street), `Conveyor` (moving belt, rollers, scanner arch, flagged parcels), `WarehouseSet` (racks, lights, floor), `DockSet` (truck backing into a loading dock while a conveyor loads it), `SetWindow` (frames any set in a panel under a persistent header).
- `src/components/` reusable building blocks: icons (original SVG), charts (counters, bars, dot grids), cards, source labels, the "Illustrative example" banner, HUD, subtitles, timing hooks (`useBeats`: `at(i)`, `during(a,b)`, `word(i, /regex/)` to sync to spoken words).
- `src/scenes/` episode-specific scenes + `index.ts` registry. `GenericScene` renders any scene without a custom component.
- `src/themes/` brand colours and local fonts.

## Make a new episode (no rewrite needed)

1. `content/episode-002/episode.json`: copy 001's file, change `id`, `title`, scenes and segments (each with `claims`), `pilot`, `shorts`.
2. Research: fill `claims.json`, `fact_check.csv`, `sources.md`, `visual_notes.json` (copy the 001 structure).
3. `npm run pilot -- --episode 002` → works immediately with `GenericScene` (animated pull-quotes) so you can check voice and timing.
4. Design pass: create `src/scenes/ep002/*.tsx` using the building blocks and register them in `src/scenes/index.ts` under `'002'`.
5. Add `"episode:002": "node scripts/pipeline.mjs episode --episode 002"` (and shorts/thumbnails) to `package.json`.
6. `python python/write_docs.py script --episode 002` checks that every number in the narration links to a claim and source.

Sound effects tied to specific spoken words go in `content/episode-XXX/sfx_cues.json` (segment + word regex + offset); scene-change whooshes and figure ticks are automatic. Scenes get a gentle beat-synced camera (`SceneShell`) and wipe transitions (`SceneWipe`) for free.

Music: moods (`intro`, `neutral`, `reveal`) are chosen per scene with `"music"` in `episode.json`. To use a licensed track instead, put it at `assets/music/documentary_bed.wav|mp3|flac` and log it in `asset_licenses.csv`.

## Key documents
- Episode content: `content/episode-001/` (script, Spanish review synopsis, storyboard, claims, sources, fact-check, YouTube description, titles/thumbnails)
- `audio_provenance.md`, `asset_licenses.csv`, `LICENSE_NOTES.md` (note the Remotion licence terms), `publishing_checklist.md`
- QA: `diagnostics/qa_report.md`
