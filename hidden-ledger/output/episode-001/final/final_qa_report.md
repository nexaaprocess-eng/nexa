# Final QA report: Hidden Ledger · Episode 001 "Who Really Pays for Free Returns?"

Delivered 2026-10-26. All values below were **measured on the exported file** `hidden_ledger_episode_001_FINAL_1080p.mp4` (ffprobe / ffmpeg / `python/av_check.py` / `python/stem_check.py`). Raw outputs: `diagnostics/final_ffprobe.json`, `final_scan.log`, `av_check_hidden_ledger_episode_001_FINAL_1080p.json`, `stem_check_full.json`, `final_splice_check.json`, `final_frames/`.

## 1. File

| Property | Value |
|---|---|
| Path | `output/episode-001/final/hidden_ledger_episode_001_FINAL_1080p.mp4` |
| Size | 761.4 MB (761,409,865 bytes) |
| Duration | 593.53 s (**9:53.5**) — video 593.533 s, audio 593.533 s |
| Video | H.264 **High @ L4.2**, **1920×1080**, **16:9**, **30 fps** (CFR), yuv420p, BT.709, closed GOP 15, two-pass |
| Video bitrate | **10.0 Mbps** average (target 10 Mbps, maxrate 12.5 Mbps) |
| Audio | **AAC-LC, 48 kHz, stereo, 253 kbps** (target 256 kbps) |
| Frames | **17,806 / 17,806** expected by the narration timeline |
| Rendered from | original Remotion compositions (`src/`) and original assets; **not** upscaled from any 720p file |

## 2. Automated checks (all on the final export)

| Check | Result |
|---|---|
| Full decode (`ffmpeg -v info … -f null`) | **0 errors** |
| Black frames (`blackdetect`, ≥0.5 s, luma <10 %) | 1 window: 107.2–107.7 s = the designed wipe into scene 3 (dark panel crossing the screen). v1 of this delivery had 4 windows (3.3 s) of near-empty openings; fixed (§5). |
| Freezes (`freezedetect`, ≥3 s) | **none** |
| Silences (`silencedetect`, −50 dB, ≥1.5 s) | **none** (intended pauses are 0.38 s between sentences, 0.9 s between scenes, 2.5 s tail) |
| Loudness (EBU R128, final file) | **−15.3 LUFS** integrated, LRA 3.6 LU |
| True peak (final file) | **−2.5 dBFS** (limit asked: ≤ −1.5 dBTP) |
| Audio offset vs lossless mix (cross-correlation at 0:05, 4:57, 9:28) | **0.0 / 0.0 / 0.0 ms** → no offset, no drift |
| Picture transitions vs narration timeline | wipe found at all 7 scene changes, each exactly 4 frames (0.133 s) before the scene start = designed position |
| Intelligibility through the final mix (Whisper ASR on the MP4 audio) | **1.0 %** word error rate (dry narration: 0.49 %) |
| Splice integrity (render was done in chunks + 4 patches) | 17 boundary frames compared with their source: 52.9–55.2 dB PSNR (encode noise only); a one-frame shift would read 22–39 dB. Patch end frames vs original render: 57–60 dB (no visible jump). |
| Start / end complete | first frame shows the question card; last frame is the end card; last subtitle ends 9:51.0, audio tail 2.5 s |

## 3. Audio stems (measured separately)
- **Voice (64 segments):** 0 clipped segments, 0 possible cut-offs (energy in the last 30 ms of every sentence), pauses exactly 0.38 s / 0.90 s as configured, 0 unexpected gaps. Two sentences were re-synthesised with the same voice because ASR showed weak articulation (s01-06 "…for **a** free return", s03-06 "Is it… / Are the tags…"); 62 sentences untouched.
- **Music vs voice, in 100 ms frames where the narrator is voicing:** median **25.7 dB** below the voice, 5th percentile 16.3 dB, quietest single frame 9.1 dB (soft consonants). Look-ahead ducking (150 ms) added in this delivery removed dips to 6 dB at sentence onsets.
- **SFX:** peaks 12.9 dB below the voice peak; 60 events, all tied to on-screen actions or spoken words.
- Music now uses **six** moods across the acts (intro · neutral · process · tension · lift · reveal) instead of one neutral bed for 7.5 minutes.

## 4. What changed in this final delivery
1. **0:00–0:15:** the central question "WHO PAYS FOR A FREE RETURN?" is on screen from the first frame, over the v2 hook (phone → street → TOO SHORT / FREE RETURN stamps → refund).
2. **3:02–4:44 (costs):** two glass jars fill with coins; the returned parcel crosses five illustrated stations (truck, workbench, repack, customer service, fraud screen) with a coin per spoken item; the jacket either goes back on the full-price rail or gets marked down and sent to bulk; the $100 example (labelled ILLUSTRATIVE EXAMPLE — NOT INDUSTRY DATA throughout) fills the same jars ($14 + $30 = $44).
3. **4:44–6:21 (who pays):** money physically moves between Retailer, Marketplace (+ seller stall), Logistics partner and Shopper for each case; invoice from the carrier; dashed "possible" path from the shopper; fee vs free routing on a street.
4. **6:21–7:54 (where it goes):** a sorting floor with eight chutes; each destination lights up and receives a parcel when named; facts ($800B+, Amazon statement, EEA 22–43 %, EU rule) in large panels.
5. Text minimums raised (≥26 px at 1080p for footnotes/sources, 50 px subtitles, key figures 128–260 px); scene openings no longer start empty.
6. Facts unchanged and re-verified (17 NRF figures verbatim in the PDF; no 2026 edition). `claims.json` link check: OK.

## 5. Problems found and fixed during QA
- Near-empty openings (S03 1.2 s, S05 0.8 s, S07 0.8 s, S07 beat 6 0.5 s) → elements now enter with the sentence; fixed frames re-rendered from the compositions and spliced frame-exactly.
- Music too close to the voice at sentence onsets → look-ahead ducking.
- "shipping −$8" label wrapping, S05 labels near subtitles, S06 labels near subtitles, "fees" label over the source line → fixed and re-checked on stills.
- Black/"cut" detectors unsuited to the dark brand palette and gradual wipes → replaced by a wipe-edge detector + manual frame review.

## 6. Resources and licences (commercial use)
| Resource | Licence | Status |
|---|---|---|
| Narration voice: Kokoro-82M v1.0 (`am_michael`) via kokoro-onnx | Apache-2.0 weights / MIT runtime | OK for commercial use; synthetic voice, not a clone of a real person |
| Music + SFX | own procedural code (`python/music.py`, seed 1001) | own work; Content ID not guaranteed (check Studio after upload) |
| Illustrations / animation | own SVG/React code | own work; no stock, no third-party logos |
| Fonts: Space Grotesk, Inter | SIL OFL 1.1 | OK; licence files in `assets/fonts/` |
| Remotion (renderer) | Remotion License | **free only for individuals or companies with ≤3 employees**; larger companies need a paid licence |
| espeak-ng (phonemizer, local tool) | GPL-3.0 | not embedded in the video; relevant only if you redistribute the software |
| Data sources | cited in description | NRF/Happy Returns (industry + vendor, conflict of interest disclosed), JBL 2025, J. Retailing 2016, EEA 2024, European Commission 2026, Amazon (company statements) |

## 7. Needs a human check (not verifiable here)
- **Listening:** naturalness of the voice, taste and level of the music, and SFX feel. Everything audio was verified **by measurement and ASR only**; no one has listened to it.
- Watch once on a phone at normal speed for pacing.
- At upload: YouTube altered-content setting (see `youtube_upload_package.md`) and Content ID status.

## 8. Reproduce
```powershell
npm run final:001          # chunked 1080p render from the compositions + two-pass 10 Mbps encode + A/V and stem checks
```
(In this cloud session background jobs stop after 30 min, so the chunks, the two encode passes and the four patch windows were run as separate commands with the same settings.)

## 9. Shareable copy (sent through the chat, which caps files at 400 MiB)
`hidden_ledger_episode_001_FINAL_1080p_share.mp4`: same 17,806 original 1080p frames and the same audio mix, two-pass H.264 at **5.2 Mbps** + AAC 256 kbps, 385.6 MiB.
Measured against the 10 Mbps master over the whole film: **SSIM 0.9996**, PSNR 58.7 dB average (48.4 dB worst frame), i.e. visually identical; loudness unchanged (−15.3 LUFS, −2.5 dBTP).
The 10 Mbps master remains the recommended upload file (761 MB; it exceeds both the chat limit and GitHub's 100 MB limit, so it lives only in the session workspace or can be regenerated with `npm run final:001`).
