# Audio provenance

Everything you hear in the Hidden Ledger videos is generated locally by code in this repository. Nothing is downloaded from music or SFX libraries.

## Narration
- **Engine:** Kokoro-82M v1.0 (Apache-2.0 weights) through `kokoro-onnx` 0.6.1 (MIT), CPU (`onnxruntime` CPUExecutionProvider).
- **Model files:** `kokoro-v1.0.onnx` (sha256 `7d5df8ec…6a6c5`) and `voices-v1.0.bin` (sha256 `bca610b8…f1fbf7d`) from the official kokoro-onnx GitHub release `model-files-v1.0`.
- **Voice:** `am_michael` (built-in Kokoro voice pack), `lang=en-us`, speed 1.0. Not a clone of any real person.
- **Text normalisation** (`python/common.py`): years → "twenty twenty-five", decimals spelled out ("fifteen point eight"), `$X billion` → "X billion dollars", `UPS` → "U P S". Display text and subtitles keep the normal written form.
- **Processing:** silence trim with 40 ms margins, 6 ms fades, peak normalisation to −3 dBFS per segment. No EQ or compression on the voice.
- **QA:** every segment is transcribed by faster-whisper `base.en`. Weighted word error rate over the episode: **0.69 %** (the remaining differences are mostly "Step 3." vs "Step three:" style). Report: `output/episode-001/audio/narration/asr_report.json`.

## Music (procedural, `python/music.py`)
- **Method:** additive synthesis in NumPy (sine partials with detuned voices), synthetic sub-bass, pitched "mallet" plucks, noise-based ticks, FFT convolution reverb with a synthetic noise impulse response, frequency-domain low-pass. **Fixed seed `1001`** (+ an offset per scene) → bit-identical regeneration.
- **Cues (one per scene, exact scene length, crossfaded ±1 s):**

| Mood | Used in | BPM | Progression (pitch classes) | Layers | Character |
|---|---|---|---|---|---|
| `intro` | cold open | ~72 | Dm7 · B♭maj7 · Gm7 · A (with C♯) | pads, low pulse every 2 beats, sparse noise ticks | intrigue / light tension |
| `neutral` | scenes 2–7 | ~84 | Fmaj7 · Dm7 · B♭maj7 · C7 | soft pads, occasional mallet notes, no drums | discreet explanation bed |
| `reveal` | payoff + end card | ~76 | B♭maj7 · C · Dm7 · F (resolves to F) | warmer pads, gentle pulse, mallets | resolution |

  Chord voicings are randomly lifted/thinned per chord and the starting chord rotates per scene, so it is not a loop of a few seconds. These are generic diatonic progressions; no melody, motif or composition by anyone else is reproduced.
- **Standalone demos:** `assets/music/generated/1_intro.wav`, `2_neutral.wav`, `3_reveal.wav` (60 s each).
- **Mix rules** (`python/mix.py`, v2): music −23 dB below the voice RMS while narration is active, −14 dB in pauses, an extra −5 dB dip during key figures (`"duck": true` segments), envelope attack 40 ms / release 350 ms. Final two-pass `loudnorm` at −16 LUFS integrated, −2.6 dBTP ceiling (AAC adds ≈0.6 dB, so the MP4 stays below −1.5 dBTP). Measured: see `diagnostics/full_report.json`.
- **Honest quality note:** this is a minimalist, functional bed, not professional composition. It was checked by measurement (levels, spectra, clipping), not by ear in this session. If you don't like it, put a licensed track at `assets/music/documentary_bed.wav|mp3|flac`, log it in `asset_licenses.csv`, and `mix.py` will use it instead (looped and ducked the same way).

## Sound effects (`python/music.py` → `assets/sfx/`)
`whoosh` (band-limited noise sweep; scene changes), `click` (short filtered transient; process steps), `tick` (tiny high blip; figure reveals), `thump` (pitched-down sine kick; payoff), `pop` (spare). Placement comes from the timeline, so they follow the animation beats; v2 adds word-anchored cues (`content/episode-001/sfx_cues.json`: tap on "order", impact when the parcel lands on "Tuesday", stamps on "short"/"free", ticks on each conveyor station) at the same ASR word times the animation uses. Level: −17 dB relative to voice peak.

## Content ID / copyright
Avoiding third-party material lowers the risk but **does not guarantee** that YouTube's Content ID will never flag generated audio (false matches happen with simple tonal music). After uploading, check *YouTube Studio → Content → Copyright* before publishing. If a claim appears, you can dispute it with this provenance file and the generator code.
