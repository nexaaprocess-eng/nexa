"""Writes episode005/episode_005_youtube_metadata.md: titles, description with chapters from the REAL timeline (each
chapter time rounded up to the next second so it never lands on the previous scene), sources, tags, hashtags and a
pinned comment. Run after the audio step: python content/episode-005/build_youtube.py"""
import json
import math
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
tl = json.loads((ROOT / "output" / "episode-005" / "audio" / "full" / "timeline.json").read_text())


def ts(t, up=False):
    t = int(math.ceil(t - 1e-6)) if up else int(round(t))
    return f"{t // 60}:{t % 60:02d}"


chapters = "\n".join(f"{ts(0 if i == 0 else s['start'], up=True)} {s['chapter']}" for i, s in enumerate(tl["scenes"]))
pkg = f"""# YouTube metadata: Hidden Ledger · Episode 005

**File to upload:** `hidden_ledger_episode_005_FINAL_1080p.mp4` · **Captions:** `episode_005_subtitles.srt` (English, US)
**Thumbnail:** `thumbnail_005_A.png` (recommended) or `thumbnail_005_B.png` · **Runtime:** {ts(tl['duration'])}
Not published: upload manually.

---

## Titles
1. **Why Do Hotels Sell Rooms They Don't Have?** (primary: the episode's question, matches thumbnail A)
2. I Had a Confirmed Booking. The Hotel Had No Room.
3. The Hidden Math of Hotel Overbooking

## Description (copy from here)

It's almost midnight. The booking is confirmed and paid for. And the hotel has no room.

Why would a hotel accept more reservations than it has rooms? Follow our traveler from the front desk into the economics behind it: a room night that disappears forever if nobody sleeps in it, real booking data from two hotels (36% of bookings cancelled), a simple made-up hotel that shows what overbooking gains on an average night and what it costs when the forecast is wrong, and what a guest can actually ask for — with Spain's consumer guidance and one Spanish region's law as a worked example.

The story and the hotels in it are fictional and animated. The made-up hotel's numbers (100 rooms, $150 a night, 8% no-shows, $250 to move a guest) are a hypothetical example, labelled on screen. Rules for guests differ by country and region: check the law where you are and your booking terms.

**Chapters**
{chapters}

**Sources**
- Antonio, N., de Almeida, A. & Nunes, L. (2019). Hotel booking demand datasets. Data in Brief 22, 41–49 (two hotels in Portugal, bookings arriving July 2015–August 2017; shares are our own count of the published data): https://doi.org/10.1016/j.dib.2018.11.126
- Yang, D., Miao, X. & Nguyen, H. (2024). Predicting hotel booking cancellations using tree-based neural network. PeerJ Computer Science 10:e2473: https://doi.org/10.7717/peerj-cs.2473
- de Bastos (2022). Contribution of hotels' revenue management for supply chain sustainability. Journal of Revenue and Pricing Management (open access): https://europepmc.org/article/PMC/PMC9111949
- Spain, Ministerio de Derechos Sociales, Consumo y Agenda 2030 — consumer FAQ "Llegué al hotel con reserva confirmada y me dicen que no hay habitación": https://www.dsca.gob.es/es/consumo/preguntas-frecuentes/llegue-hotel-reserva-confirmada-me-dicen-que-no-hay-habitacion-que
- Ley 15/2018, de turismo, ocio y hospitalidad de la Comunitat Valenciana, art. 20 "Overbooking o sobreventa" (consolidated text, BOE): https://www.boe.es/buscar/act.php?id=BOE-A-2018-8950
- Further reading: Schwartz, Webb, Altin & Riasi (2025), Overbooking and performance in hotel revenue management, International Journal of Hospitality Management 129: https://doi.org/10.1016/j.ijhm.2025.104192 · Zhai, Tian, Luo & Zhou (2023), Hotel overbooking based on no-show probability forecasts, Computers & Industrial Engineering 180: https://doi.org/10.1016/j.cie.2023.109226

Animation, narration and music are produced by Hidden Ledger with local tools (Blender, Remotion, Chatterbox TTS). Not legal advice. No hotel sponsored or reviewed this video.

#HotelOverbooking #Economics #Travel

## Tags
hotel overbooking, overbooking, hotels, hotel booking, confirmed reservation, no room at the hotel, hotel no-show, hotel cancellations, revenue management, hotel revenue management, perishable inventory, empty hotel room, hotel economics, travel tips, travel economics, consumer rights, Spain hotel rights, economics explained, business explained, hidden economics, Hidden Ledger

## Hashtags (3)
#HotelOverbooking #Economics #Travel

## Pinned comment
Quick note on the numbers: the 36% cancellation figure comes from real booking records of two hotels in Portugal (2015–2017), so it isn't a global average. The 100-room hotel is made up to show the trade-off: on most nights a few extra bookings fill rooms that would sit empty, but on some nights a guest with a confirmed booking has nowhere to sleep. What you're owed depends on where you are — the Spanish rules in the video are an example, not a universal right. Has this ever happened to you?

## Category / settings
Education · Language: English (US) · Captions: upload the SRT · Not made for kids · Altered or synthetic content: the narration voice is synthetic and the visuals are animated; no realistic depiction of real people or events.
"""
out = ROOT / "episode005" / "episode_005_youtube_metadata.md"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(pkg, encoding="utf-8")
print("wrote", out)
print(chapters)
