"""Writes episode004/youtube_upload_package.md: titles, description with chapters from the REAL timeline, sources, tags.
Run after the audio step: python content/episode-004/build_youtube.py"""
import json
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
tl = json.loads((ROOT / "output" / "episode-004" / "audio" / "full" / "timeline.json").read_text())


def ts(t):
    t = int(round(t))
    return f"{t // 60}:{t % 60:02d}"


chapters = "\n".join(f"{ts(0 if i == 0 else s['start'])} {s['chapter']}" for i, s in enumerate(tl["scenes"]))
pkg = f"""# YouTube upload package: Hidden Ledger · Episode 004

**File to upload:** `hidden_ledger_episode_004_FINAL_1080p.mp4` · **Captions:** `episode_004_subtitles.srt` (English, US)
**Thumbnail:** `thumbnail_option_A.png` (recommended) or `thumbnail_option_B.png`
**Runtime:** {ts(tl['duration'])}

---

## Titles
1. **How Can Airlines Sell Flights for Just $20?** (recommended: the episode's question, matches the thumbnail)
2. The $20 Flight: Who Is Really Paying for Your Seat?
3. Why a $20 Plane Ticket Isn't What It Seems

## Description (copy from here)

A flight for twenty dollars. How is that even possible, when flying one passenger costs an airline more than that?

Our passenger books a $20 fare and follows it into the airline's world: the checkout that keeps adding extras, the cost of a flight, the empty seat that can never be sold again, the price ladder that puts two neighbours on the same plane at very different fares, the bag sizer at the gate, and the cost machine that makes it all work. We use the airlines' own annual reports (Ryanair, Frontier, Spirit) to show where the money really comes from — and when the model breaks.

**Chapters**
{chapters}

**Sources (primary filings)**
- Ryanair Holdings, annual report on Form 20-F for the fiscal year to 31 March 2026 (fares, ancillary revenue, cost per passenger, break-even load factor, fleet, pricing and airport policy): https://investor.ryanair.com/wp-content/uploads/2026/06/20F-Statement-2026.pdf
- Ryanair, FY26 results (18 May 2026) and results presentation (unit cost comparison, Ryanair's own figures for competitors): https://investor.ryanair.com/wp-content/uploads/2026/05/FY26-Ryanair-Results.pdf · https://investor.ryanair.com/wp-content/uploads/2026/05/FY26-Ryanair-Presentation.pdf
- Ryanair, Annual Report 2025 (seat configuration comparison): https://investor.ryanair.com/wp-content/uploads/2025/05/Ryanair-2025-Annual-Report.pdf
- Frontier Group Holdings, Form 10-K for 2025: https://www.sec.gov/Archives/edgar/data/1670076/000167007626000020/fron-20251231.htm
- Spirit Aviation Holdings, Form 10-K for 2025: https://www.sec.gov/Archives/edgar/data/1498710/000162828026018265/flyy-20251231.htm
- Spirit, Form 8-K of 29 August 2025 (second chapter 11 filing): https://www.sec.gov/Archives/edgar/data/1498710/000095010325011031/dp233724_8k.htm
- Spirit, press release of 2 May 2026 (wind-down): https://www.sec.gov/Archives/edgar/data/1498710/000095010326006723/dp246246_ex9901.htm

**Made-up and illustrative examples (labelled on screen):** the $20 fare and the $92 checkout ($25 cabin bag, $12 window seat, $35 suitcase); the booking and comparison websites and their airlines ("SkyLow", "BudgetJet", "Network Air"); the price staircase ($20 to $189) and the neighbour's $160 fare; the 197-seat aircraft filling to break-even (it uses Ryanair's real fleet-wide 80% break-even and 94% load factor). Ryanair's figures are in euros for its fiscal year to March 2026; Frontier's are in US dollars for 2025. Ryanair's "average fare" includes checked-bag and change fees.

Animation, narration and music are produced by Hidden Ledger with local tools (Blender, Remotion, Chatterbox TTS). No airline sponsored or reviewed this video.

## Tags
airlines, budget airlines, cheap flights, $20 flight, Ryanair, Frontier Airlines, Spirit Airlines, low-cost carrier, ultra low cost carrier, airline economics, how airlines make money, ancillary revenue, baggage fees, seat selection fee, airline pricing, revenue management, load factor, break-even, airline business model, hidden economics, economics explained, business explained, Hidden Ledger

## Category / settings
Education · Language: English (US) · Captions: upload the SRT · Not made for kids · Altered or synthetic content: the narration voice is synthetic (not a real person) and the visuals are animated; no realistic depiction of real people or events.
"""
out = ROOT / "episode004"
out.mkdir(exist_ok=True)
(out / "youtube_upload_package.md").write_text(pkg, encoding="utf-8")
print(chapters)
