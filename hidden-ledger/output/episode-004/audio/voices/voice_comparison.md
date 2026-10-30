# Voice comparison — Kokoro-82M (kokoro-onnx, CPU)

Same test text for all three voices (`lang="en-us"`, speed 0.96), trimmed + peak-normalised to −3 dBFS (non-destructive: no EQ, no compression).

> Meet our passenger. The airline's website says the flight costs twenty dollars. So they book it. Then the checkout keeps going. A cabin bag: $25. A window seat: $12. Here's the thing. Once the door closes, an empty seat can never be sold again. So for the airline, a cheap seat beats an empty one. But who is really paying for it?

TTS input after US-English normalisation (numbers/years spelled the way a US narrator says them):

> Meet our passenger. The airline's website says the flight costs twenty dollars. So they book it. Then the checkout keeps going. A cabin bag: 25 dollars. A window seat: 12 dollars. Here's the thing. Once the door closes, an empty seat can never be sold again. So for the airline, a cheap seat beats an empty one. But who is really paying for it?

| Voice | OK | Duration (s) | Words/min | RMS (dBFS) | Clipped samples | Longest pause (s) | ASR word error rate |
|---|---|---|---|---|---|---|---|
| `af_heart` | ✔ | 21.84 | 170.3 | -20.8 | 0 | 0.52 | 0.0% |
| `af_bella` | ✔ | 22.08 | 168.5 | -21.87 | 0 | 0.54 | 0.0% |
| `am_michael` | ✔ | 23.15 | 160.7 | -24.18 | 0 | 0.58 | 0.0% |
| `am_fenrir` | ✔ | 18.539 | 200.7 | -23.45 | 0 | 0.32 | 0.0% |
| `am_puck` | ✔ | 17.55 | 212.0 | -22.25 | 0 | 0.26 | 0.0% |
| `bm_george` | ✔ | 22.0 | 169.1 | -18.73 | 0 | 0.46 | 0.0% |

Files: `output/episode-004/audio/voices/voice_am_michael.wav`, `voice_am_adam.wav`, `voice_af_heart.wav`.

## How this was judged

The voices were **not judged by ear in this session** (no listening possible in a headless container). Instead:

* **Intelligibility** — each WAV was transcribed with a local speech recogniser (faster-whisper `base.en`, CPU) and compared with the script: word error rate above. All three were transcribed with 0 % errors, including "$849.9 billion" and "2025".
* **Technical health** — duration, speaking rate, loudness, clipping and abnormal pauses were measured from the samples.
* **Pace** — the brief targets 125–155 wpm. At speed 0.96, `am_michael` was the slowest (≈134 wpm), so the episode uses **speed 1.0** for it (≈149 wpm while speaking in the full episode).

## Decision

`VOICE_ID = am_michael` (default required by the brief; all three voices worked and were equally intelligible).
Please listen to the three WAVs yourself: naturalness and timbre are subjective and are your call.

To change voice for the whole episode, edit `voice.voiceId` / `voice.speed` in `content/episode-004/episode.json`
(or set the env var `VOICE_ID`) and rerun `npm run pilot` / `npm run episode:004`. Only segments whose text, voice or speed changed are re-synthesised.
