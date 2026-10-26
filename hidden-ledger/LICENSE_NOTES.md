# Licence notes

All content created for Hidden Ledger in this repository (script, code, vector illustrations, procedural music and SFX) is the channel's own work. Third-party software and assets:

| Component | Version | Licence | Notes for commercial YouTube use |
|---|---|---|---|
| **Remotion** (`remotion`, `@remotion/*`) | 4.0.300 | **Remotion License** (source-available) | **Free for individuals and for-profit companies with up to 3 employees**, and for non-profits. A company with 4+ employees needs a paid Company License (https://www.remotion.dev/license). If the channel grows into a company of that size, buy a licence or switch renderer. |
| React / React DOM | 18.3.1 | MIT | — |
| TypeScript | 5.6.3 | Apache-2.0 | dev only |
| Kokoro-82M model weights | v1.0 | Apache-2.0 | https://huggingface.co/hexgrad/Kokoro-82M; generated speech may be used commercially. |
| kokoro-onnx | 0.6.1 | MIT | https://github.com/thewh1teagle/kokoro-onnx; model files from its `model-files-v1.0` release, SHA-256 checked by `python/download_model.py`. |
| espeak-ng (via `espeakng-loader`, used by the phonemizer) | bundled | GPL-3.0 | Used as a local tool to turn text into phonemes; it is not distributed inside the video. Keep it as a separate install if you ever redistribute this software. |
| onnxruntime | 1.31.0 | MIT | CPU execution provider only. |
| faster-whisper + CTranslate2, Whisper `base.en` weights | 1.2.1 / 4.8.4 | MIT | QA only: intelligibility check and subtitle word anchors. Nothing from it ends up in the video. |
| jiwer | 4.0.0 | Apache-2.0 | QA only. |
| NumPy / soundfile | 2.5.4 / 0.14.0 | BSD | — |
| FFmpeg / FFprobe | system install (6.1.1 here) | LGPL/GPL depending on build | Used as an external tool. |
| Space Grotesk, Inter | variable fonts | SIL OFL 1.1 | Licence texts in `assets/fonts/`. |

No paid API, subscription, stock library or trial account is used anywhere in the pipeline.
