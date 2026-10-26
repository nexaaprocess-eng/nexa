# QA report: Episode 001 · v2 (`full_video_v2.mp4`)

Date: 2026-10-26. Same script, same voice (`am_michael`, the existing 64 narration WAVs were reused unchanged), same brand identity. Everything below was measured on the delivered file with FFprobe/FFmpeg and `python/av_check.py` (`diagnostics/av_check_full_video_v2.json`).

## 1. Facts re-verified before changing anything
- All 17 NRF figures used on screen/in narration found **verbatim** in the official PDF (15.8 %, $849.9B, 19.3 %, 82 %, 57 %, 72 % / 66 %, ~9 %, 6–10 days / ~49 %, 17 → 25 %, 53 / 52 / 47 / 37 %, 2,006 / 358, bulk consolidation).
- No 2026 edition of the NRF/Happy Returns report exists (search + predictable URL → 404), so the 2025 figures stay, labelled as 2025 projections.
- Other claims (EEA 2024, ESPR ban from 19 July 2026, JBL 2025, Journal of Retailing 2016, Amazon statements) unchanged and already traced in `claims.json` / `fact_check.csv`; `write_docs.py script` link check: OK.
- **No script or claim was changed.** The only new on-screen figure in the hook ($849.9B at 0:16) is claim C03 and carries "2025 projection · NRF & Happy Returns".

## 2. What changed visually (v1 → v2)
| Area | v1 | v2 |
|---|---|---|
| First 15 s | phone + house icons, small calendar, slow route | phone close-up with tap → zoom **through the screen** into a 3-layer parallax street; truck brakes in, parcel drops with impact; giant **TUESDAY → THURSDAY** flip behind the action; jacket rises out of the box; **TOO SHORT** and **FREE RETURN** stamps with screen shake; refund toast; truck leaves with speed lines; **DONE… for you**; whip-pan into a warehouse with a 210 px **$849.9B** teaser (0:16) |
| Variety | cards/diagrams most of the time | new reusable animated sets used in 7 beats: warehouse zoom-out (scale), street with mailbox/truck/store (hand-off), **loading dock** where a conveyor loads a truck (consolidation), **conveyor through a scanner** (returns center), conveyor with flagged parcels (fraud), parcels travelling each branch (destinations), conveyor journey with stations (cold open) |
| Figures | 110–190 px | 128–260 px ($849.9B 230 px, 82 % / 57 % 260 px, ~9 % 250 px, ~49 % 190 px, $800B+ 150 px); bar values 54 → 88 px; bar labels 30 → 38 px |
| Mobile legibility | subtitles 40 px, sources 21 px, kickers 26 px | subtitles **50 px** on a darker box, sources 25 px, kickers 32 px, HUD 28 px |
| Dynamism | slow drift + fades | gentle beat camera (≈2 % push + small alternating pan at every sentence, overdamped springs), orange **wipe transitions** at every scene change, stamps/impacts only in the hook |
| Sound | scene whooshes + figure ticks | + 16 **word-anchored SFX** (`sfx_cues.json`): tap on "order", impact on "Tuesday", stamps on "short"/"free", whoosh as the truck leaves, ticks on each station word |
| Music vs voice | music −21 dB under voice | **−23 dB** under voice, −14 dB in pauses, −5 dB extra dip on figures |

Unchanged on purpose: scenes 5 (cost-flow diagram), 7 and 8 keep their v1 layouts (with bigger type, beat camera and wipes) — they are already diagram-driven explanations; converting them to sets would be the next step.

## 3. Delivery file
| Check | Result |
|---|---|
| File | `output/episode-001/full/full_video_v2.mp4` (616.8 MB; not in git: GitHub's limit is 100 MB) |
| Video | H.264 **High @ L4.2**, **1920×1080**, **30 fps**, yuv420p, BT.709, closed GOP 15, two-pass, **8.04 Mbps** measured |
| Audio | AAC-LC, 48 kHz, stereo, target 384 kbps (measured average 280 kbps: the encoder needs less for this content) |
| Duration | 592.30 s video = 592.30 s audio |
| Completeness | **17,769 / 17,769 frames** (v1 had lost 4 frames to `-shortest`; v2 pads the audio to the exact video length) |
| Loudness | −16.2 LUFS integrated, LRA 4.1 LU, true peak −2.5 dBFS |
| Black frames ≥1 s / freezes ≥4 s / silences ≥3 s | none / none / none |
| Splice check | first 28 s re-rendered after a fix (see §5); no freeze or jump around the join at frame 854 |

## 4. Sync and intelligibility (measured, not assumed)
- **Audio offset vs the lossless mix (cross-correlation):** 0.0 ms at 0:05, 4:56 and 9:27 → no offset, no drift.
- **Picture vs narration timeline:** the wipe is located in the picture at each of the 7 scene changes; it peaks **0.133 s (4 frames) before** every scene start, identical for all 7, which is the designed position (the 22-frame wipe straddles the cut). Outside the wipe the detector reads 0 %.
- **Word-level sync:** visuals for figures, stamps and SFX are driven by Whisper word timestamps of the actual narration WAVs (e.g. "free." 9.88 s, "refund" 10.94 s).
- **Music never masks the voice:** Whisper word error rate on the **final mixed audio** is **1.0 %** vs 0.69 % on the dry narration; the remaining differences are formatting-level ("Step 3." vs "Step three:").

## 5. Problems found and fixed during this pass
1. The "FREE RETURN" stamp was visible for only ~0.3 s (the parcel was picked up 0.7 s before "refund"). Pickup now happens after the toast → stamp ≈1.4 s.
2. Phone close-up initially covered the subtitles; parcel initially landed on the truck; teaser reappeared under the title; 82 %/57 % footnote collided with subtitles. All fixed and re-checked on stills.
3. The v1 delivery had lost 4 frames at the end; fixed in the export step.
4. The first scene-cut detector could not see gradual wipes; replaced with an edge detector specific to the wipe.

## 6. Reproduce
```powershell
npm run episode:001:v2          # render 1080p + two-pass 8 Mbps encode + A/V check -> full_video_v2.mp4
python python/av_check.py --video output/episode-001/full/full_video_v2.mp4 --asr
```
In this cloud session, background jobs stop after 30 min, so the render, the encode and a 28-second re-render were run as separate steps with the same settings; on your PC the single command above does it in one go.

`output/episode-001/full/full_video_v2_preview720.mp4` (30 MB) is a **viewing copy only** (720p, CRF 25); upload the 8 Mbps master to YouTube.
