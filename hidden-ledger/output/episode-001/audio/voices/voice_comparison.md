# Voice comparison — Kokoro-82M (kokoro-onnx, CPU)

Same test text for all three voices (`lang="en-us"`, speed 0.96), trimmed + peak-normalised to −3 dBFS (non-destructive: no EQ, no compression).

> You order a jacket online, and three days later, you send it back. The label is free. The refund arrives. But the jacket's journey is only beginning. It gets scanned, trucked, sorted, and inspected... and every step costs somebody something. In 2025, the National Retail Federation projected $849.9 billion in returned merchandise. So who actually pays for a free return?

TTS input after US-English normalisation (numbers/years spelled the way a US narrator says them):

> You order a jacket online, and three days later, you send it back. The label is free. The refund arrives. But the jacket's journey is only beginning. It gets scanned, trucked, sorted, and inspected... and every step costs somebody something. In twenty twenty-five, the National Retail Federation projected 849.9 billion dollars in returned merchandise. So who actually pays for a free return?

| Voice | OK | Duration (s) | Words/min | RMS (dBFS) | Clipped samples | Longest pause (s) | ASR word error rate |
|---|---|---|---|---|---|---|---|
| `am_michael` | ✔ | 26.81 | 134.3 | -26.47 | 0 | 0.6 | 0.0% |
| `am_adam` | ✔ | 23.381 | 154.0 | -20.81 | 0 | 0.58 | 0.0% |
| `af_heart` | ✔ | 25.02 | 143.9 | -25.07 | 0 | 0.62 | 0.0% |

Files: `output/episode-001/audio/voices/voice_am_michael.wav`, `voice_am_adam.wav`, `voice_af_heart.wav`.

## How this was judged

The voices were **not judged by ear in this session** (no listening possible in a headless container). Instead:

* **Intelligibility** — each WAV was transcribed with a local speech recogniser (faster-whisper `base.en`, CPU) and compared with the script: word error rate above. All three were transcribed with 0 % errors, including "$849.9 billion" and "2025".
* **Technical health** — duration, speaking rate, loudness, clipping and abnormal pauses were measured from the samples.
* **Pace** — the brief targets 125–155 wpm. At speed 0.96, `am_michael` was the slowest (≈134 wpm), so the episode uses **speed 1.0** for it (≈149 wpm while speaking in the full episode).

## Decision

`VOICE_ID = am_michael` (default required by the brief; all three voices worked and were equally intelligible).
Please listen to the three WAVs yourself: naturalness and timbre are subjective and are your call.

To change voice for the whole episode, edit `voice.voiceId` / `voice.speed` in `content/episode-001/episode.json`
(or set the env var `VOICE_ID`) and rerun `npm run pilot` / `npm run episode:001`. Only segments whose text, voice or speed changed are re-synthesised.
