# Publishing checklist: Episode 001

Mark each box before uploading. Nothing in this pipeline uploads to YouTube.

## Originality & licences
- [ ] All visuals are original vector code (`src/`); no stock footage, no real logos, no photorealistic people.
- [ ] Music and SFX are procedural (`audio_provenance.md`). If you replaced them with `assets/music/documentary_bed.*`, the track is logged in `asset_licenses.csv` with author, title, licence and required attribution, and that attribution is in the description.
- [ ] Fonts: SIL OFL 1.1 (licence files in `assets/fonts/`).
- [ ] Remotion licence: free only for individuals / companies with ≤3 employees (`LICENSE_NOTES.md`).
- [ ] `npm run verify` shows no `unknown` licences.

## Accuracy
- [ ] `python python/write_docs.py script` reports `claim/visual link check: OK` (every number links to `claims.json` → `fact_check.csv`).
- [ ] The NRF figures are presented as **2025 projections/survey results for the U.S.** (check whether NRF has released a newer report; if so, update the claims).
- [ ] The $849.9B figure is never described as a cost or a loss.
- [ ] The $100 jacket example shows "ILLUSTRATIVE EXAMPLE — NOT INDUSTRY DATA" for its whole duration.
- [ ] Amazon statements are attributed as the company's own account; EEA figures are labelled Europe/clothing only.
- [ ] You have listened to the full narration (pronunciation of NRF, numbers, "reverse logistics").

## Technical quality
- [ ] `output/episode-001/full/full_video.mp4`: H.264, 1920×1080, 30 fps, AAC 48 kHz stereo (see `diagnostics/qa_report.md`).
- [ ] Watched in full at least once on a phone (legibility of on-screen text and subtitles).
- [ ] Upload `full_video.en.srt` as English captions (the burned-in subtitles can be disabled with `--no-subs`; if you upload the SRT, consider rendering without burned-in subtitles to avoid double captions).
- [ ] Thumbnail chosen from `output/episode-001/thumbnails/` matches the chosen title (`titles_thumbnails.md`).
- [ ] Chapters in `youtube_description.md` were regenerated from the final timeline (`python python/write_docs.py chapters`). First chapter starts at 0:00.

## Altered or synthetic content disclosure (YouTube Studio)
Official guidance: https://support.google.com/youtube/answer/14328491?hl=en

YouTube asks creators to disclose content that is **meaningfully altered or synthetically generated and seems realistic**: e.g. making a real person appear to say or do something they didn't, altering footage of real events or places, or generating realistic-looking scenes that didn't happen.

For this episode:
- Narration is a synthetic voice reading our own script, not imitating a real person → by itself this is generally **not** the realistic-deception case the policy targets.
- Graphics are clearly stylised 2D animation, not realistic footage → not realistic (the help page lists "an AI-animated missile in a fully animated video" and AI-made infographics/thumbnails among the cases that need no disclosure).
- Music: the page asks for disclosure of generated music that is "the main focus of the video". Here the procedural music is a quiet background bed (≈20 dB under the voice), and it was made by deterministic code, not by a generative AI model.
- **Decision for Ep. 001: disclosure likely not required**, but re-check the current wording of the help page at upload time, and **tick "Altered content: Yes"** if any future episode adds realistic synthetic imagery, a cloned/real-person voice, or depicts real events realistically.
- Either way, the description already states transparently that the voice is synthetic and the visuals are animated.

## Monetisation
- [ ] No guarantee of monetisation: YouTube Partner Program review looks at originality and added value. This episode's original research, script and animation help, but approval is not automatic.
- [ ] After upload, check *Studio → Content → Copyright/Restrictions* before making the video public.
