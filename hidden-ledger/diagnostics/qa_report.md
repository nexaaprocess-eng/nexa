# QA report: Hidden Ledger · Episode 001 "Who Really Pays for Free Returns?"

Build date: 2026-10-26 · Machine: Linux cloud container, 4 CPU threads, 16 GB RAM, **CPU only** (no GPU) · Node 22.22, Python 3.13, FFmpeg 6.1.1, Remotion 4.0.300, kokoro-onnx 0.6.1.
All numbers below come from FFprobe/FFmpeg (`ebur128`, `blackdetect`, `silencedetect`) run on the actual files (`diagnostics/verify.json`, `pilot_report.json`, `full_report.json`, `shorts_report.json`).

## Status

| Area | Status | Evidence |
|---|---|---|
| Environment diagnosis (`npm run doctor`) | ✅ Completed | no blockers; `diagnostics/doctor.json` |
| Research + fact-check | ✅ Completed | 7 sources, 21 claims + 1 illustrative; every number in the narration links to a claim and a source (`write_docs.py script` → "claim/visual link check: OK") |
| Script (1,391 words) + Spanish synopsis + storyboard | ✅ Completed | `content/episode-001/` |
| Voice test (3 voices) | ✅ Completed | 3 WAVs (23.4–26.8 s), ASR word error rate 0 % for all; `voice_comparison.md` |
| Narration (64 segments, `am_michael`, speed 1.0) | ✅ Completed | 0 failures; weighted ASR WER 0.69 %; 149 wpm while speaking |
| Procedural music (3 moods) + 5 SFX | ✅ Completed, quality **partial** (see limits) | `assets/music/generated/`, `assets/sfx/`, `audio_provenance.md` |
| Pilot `pilot.mp4` | ✅ Completed | 82.77 s, H.264 1280×720 30 fps, AAC 48 kHz stereo, −16.2 LUFS, TP −2.4 dBFS, 0 black, 0 silences |
| Full episode `full_video.mp4` | ✅ Completed | 592.2 s (9:52), H.264 **1920×1080** 30 fps, AAC 48 kHz stereo, −16.2 LUFS, TP −2.3 dBFS, 0 black sections ≥2 s, 0 silences ≥4 s, 76 MB |
| Subtitles | ✅ Completed | burned in (toggle `--no-subs`) + `pilot.srt` (23 cues), `full_video.en.srt` (164 cues) |
| Thumbnails (3) | ✅ Completed | 1280×720 PNG |
| Shorts (2) | ✅ Completed | 28.5 s and 44.8 s, 1080×1920, −16.5 / −16.0 LUFS |
| Upload to YouTube | ⛔ Not done (by design) | — |
| Listening test by a human | ⚠️ **Pending: you** | not possible in a headless container |

## Audio mix details (full episode)
- Integrated −16.2 LUFS, LRA 4.1 LU, 0 clipped samples. True peak in the final MP4: −2.3 dBFS (mix target −2.6 dBTP; AAC adds ~0.6 dB, which is why the target is below the −1.5 guide).
- Voice-over-music ratio (from stems): first 30 s **21.6 dB**; around each of the 7 scene changes **20.1–22.5 dB**. Music dips an extra 5 dB under key figures.
- 26 SFX events (whoosh at scene changes, ticks on figure reveals, clicks on process steps, thump at the payoff).

## Screenshots (real frames from the exported files)
- Pilot: `diagnostics/screenshots/pilot_*.jpg` (7) + `pilot_contact_sheet.jpg`
- Full: `diagnostics/screenshots/full_*.jpg` (16: two per scene) + `full_contact_sheet.jpg`
Visual review: every sampled frame contains animated content (no empty or static slides); sources visible whenever a figure is shown; "ILLUSTRATIVE EXAMPLE — NOT INDUSTRY DATA" visible throughout the hypothetical example.

## Known limits / honest notes
1. **Nobody has listened to the audio.** Intelligibility was checked by speech recognition and levels by measurement. Naturalness of the voice and taste of the music need your ears.
2. **Music is minimal.** Tonal and clean (spectral flatness ≈0.002–0.012, no hiss), but dark: ~95 % of the energy is below 500 Hz and almost none above 2 kHz, so the mallets/ticks are barely noticeable. Fine as a bed under the voice; not "professional composition". You can swap in a licensed track (`assets/music/documentary_bed.*`).
3. Subtitle **chunk boundaries inside a sentence** are aligned with Whisper word timestamps on our own audio (segment starts/ends are exact). Rare one-word drift is possible.
4. Two source documents (JBL 2025 full text, Journal of Retailing 2016 full text) are paywalled; only abstracts/official summaries were read, and the script only claims what those say. Amazon's seller fee pages need a login: the claim is kept general, with no amounts.
5. Remotion is free only for individuals/companies with ≤3 employees (`LICENSE_NOTES.md`).
6. Render times here: pilot 720p ≈ 1.5–3 min; full 1080p ≈ 26 min (concurrency 2); Shorts ≈ 2.7 min for both. A modest Windows laptop will likely be 2–4× slower; use `--quality preview` and `--concurrency 1` if needed.

## Regenerate everything
```powershell
npm ci; npm run setup; npm run doctor
npm run voices          # 3-voice test
npm run pilot           # 60–90 s pilot, validated
npm run episode:001     # full 1080p episode, validated
npm run shorts:001; npm run thumbnails:001
npm run verify          # probes every deliverable
```
