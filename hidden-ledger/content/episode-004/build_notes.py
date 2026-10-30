"""Writes visual_notes.json (visual objective + exact on-screen text per narration segment, mirrors
blender/shots/ep004.py + src/scenes/ep004/scenes.tsx) and sfx_cues.json (word-anchored sound effects)."""
import json
from pathlib import Path

HERE = Path(__file__).parent
N = {
    "s01-01": ("sh01 · Apartment, golden hour, over the shoulder: the passenger browses flights; '$20' lands at the top of the results and pops out of the screen; the passenger recoils a little", ["One way $20"]),
    "s01-02": ("sh02 · Front three-quarter: surprise turns into a grin, a glance to camera, then a click: booked", []),
    "s01-03": ("sh03 · Closer over the shoulder: the checkout adds a cabin bag, a window seat, a checked suitcase; expression goes happy → confused → worried", ["+ $25 cabin bag", "+ $12 window seat", "+ $35 checked suitcase"]),
    "s01-04": ("sh04 · Close-up: the total lands, the passenger slumps, then a skeptical look to camera", ["New total $92", "MADE-UP EXAMPLE"]),
    "s01-05": ("sh05 · Studio stage: two coin stacks beside the passenger, heights proportional to $44.60 (fares) and $63.79 (other charges); the passenger looks up at the taller one", ["FRONTIER · AVERAGE PER PASSENGER, 2025", "$44.60 fares", "$63.79 other charges"]),
    "s01-06": ("sh06 · Apron at sunset: the passenger, backpack on, hands in pockets, looks up at the aircraft", ["How can a flight cost $20?", "And who is really paying for it?"]),
    "s02-01": ("sh07 · Wide: the passenger crosses the apron and climbs the outdoor boarding stairs", []),
    "s02-02": ("sh08 · Cabin: the passenger settles in window seat 4F, looks around", ["RYANAIR · 12 MONTHS TO MARCH 2026", "208 million passengers"]),
    "s02-03": ("sh08 · Same seat, thinking", ["Average cost to fly one passenger €63.21"]),
    "s02-04": ("sh09 · Wide apron with fuel truck, tower and terminal: callouts pinned to the things that cost money", ["Fuel · 41% of costs €26.01", "Staff €8.91", "Airport & handling €8.46", "The aircraft (depreciation) €6.59", "Air traffic control €6.33", "+ sales, maintenance, other €6.91"]),
    "s02-05": ("sh09 · Hold on the apron; the fuel callout stays lit", ["Fuel ≈ 41% of the bill"]),
    "s02-06": ("sh10 · A balance scale on the stage: the fare pan rides higher than the cost pan; the passenger looks from one to the other", ["Fare €50.66 incl. bag & change fees", "Cost €63.21"]),
    "s02-07": ("sh10 · The passenger shrugs, then looks up: three secrets", ["On the fare alone −€12.55 per passenger", "Three secrets."]),
    "s03-01": ("sh11 · An almost empty cabin seen from the aisle; the passenger alone in row 6", []),
    "s03-02": ("sh11 · Costs keep ticking", ["Crew: paid", "Fuel: burned", "Airport: billed", "Quote: Ryanair Form 20-F, operating costs of each flight"]),
    "s03-03": ("sh12 · Wide: the aircraft at the stand in the low sun, slow push-in", ["One average Ryanair flight ≈ €11,400 to operate · ≈ 181 passengers"]),
    "s03-04": ("sh13 · The door has closed; the passenger looks around at the empty seats, worried", ["€0 — an empty seat can never be sold again"]),
    "s03-05": ("sh14 · Another passenger walks down the aisle and sits in 5C", ["+ per-passenger fees & taxes", "+ a bit of extra fuel"]),
    "s03-06": ("sh14 · The passenger thinks", ["How full does the plane need to be?"]),
    "s03-07": ("sh15 · Top-down cutaway of a 197-seat cabin: seats fill to break-even (158)", ["158 / 197 seats covering the cost of the flight"]),
    "s03-08": ("sh15 · Seats keep filling to 94%: the last ~27 are orange (profit)", ["ILLUSTRATIVE · ONE 197-SEAT AIRCRAFT", "break-even at 158 · 27 seats of profit"]),
    "s04-01": ("sh16 · Departure hall at golden hour: the passenger walks to a fares board whose prices keep rising", []),
    "s04-02": ("sh16 · Board prices tick up; quote card", ["Quote: prices vary with advance booking, seat availability and demand — Ryanair"]),
    "s04-03": ("sh16 · Board keeps changing: one-way pricing", ["Sold one way: every seat, its own price"]),
    "s04-04": ("sh17 · A staircase of airline seats; the passenger on the bottom step, price tags rising up the stairs", ["ILLUSTRATIVE FARES", "$20 … $189"]),
    "s04-05": ("sh18 · Cabin two-shot: the passenger turns to the neighbour; price tags over their heads", ["$20 booked weeks ahead", "$160 booked yesterday", "ILLUSTRATIVE FARES"]),
    "s04-06": ("sh18b · Back at the laptop: a comparison site with the budget fare on top", ["fills the plane early", "tops every price comparison", "brings you to its website"]),
    "s04-07": ("sh19 · By the glass, sitting, watching aircraft outside", ["“load factor active – yield passive”", "Fill the plane first. Worry about the price of each seat second."]),
    "s04-08": ("sh19 · Skeptical look", ["Promotional fares: lower revenue, fuller planes"]),
    "s05-01": ("sh20 · Gate: the passenger walks up to the bag sizer", []),
    "s05-02": ("sh20 · Sizer tag 'Included · one small bag'; everything else pops up as a list; the passenger points, then shrugs", ["Included · one small bag", "bigger bag", "suitcase", "choosing your seat", "boarding early", "changing your ticket", "a drink on board"]),
    "s05-03": ("sh21 · Stage: blocks you could stand on", ["Ryanair extras, year to March 2026 €4.99 billion · ≈ €24 per passenger · about a third of revenue"]),
    "s05-04": ("sh21 · Fare block + extras block vs cost block; the passenger points at the gap", ["Fare €50.66", "Extras €23.94", "€74.60 revenue", "Cost €63.21", "The gap: profit ≈ €11"]),
    "s05-05": ("sh22 · Frontier coin stacks: fares vs non-fare charges; the passenger is surprised", ["$44.60 fares", "$63.79 non-fare charges"]),
    "s05-06": ("sh22 · Thinking", ["Frontier · ancillary revenue per passenger $60.55 → $67.57 (2021 → 2025)"]),
    "s05-07": ("sh23 · The passenger strolls past a family with suitcases at the desk", ["The headline: the fare"]),
    "s05-08": ("sh23 · Contrast", ["One small backpack: a genuine bargain", "A family with suitcases: maybe not"]),
    "s06-01": ("sh24 · Top-down: two cabins of the same aircraft", []),
    "s06-02": ("sh24 · Seat counts labelled", ["Traditional airline · Boeing 737-800 · ~162 seats, two classes", "Ryanair · Boeing 737-8200 · 197 seats (189 on older 737-800s)"]),
    "s06-03": ("sh24 · Hold on the dense cabin", []),
    "s06-04": ("sh25 · Turnaround at the stand: the passenger and others come down the stairs", ["Each aircraft, every day ≈ 9.5 hours in the air"]),
    "s06-05": ("sh25 · The clock is running", ["passengers off", "quick clean", "next ones on", "back in the air"]),
    "s06-06": ("sh26 · A row of identical aircraft; the passenger walks to the outdoor stairs", ["One aircraft family: 621 of 647 aircraft are Boeing 737s"]),
    "s06-07": ("sh26 · Cheaper ways to board", ["airports that charge less", "outdoor stairs, no jet bridges", "online check-in for everyone"]),
    "s06-08": ("sh27 · Pillars of cost per passenger excluding fuel; the passenger stands on the shortest", ["COST PER PASSENGER, EXCLUDING FUEL", "Ryanair €36", "Wizz Air €62", "easyJet €90", "IAG €178", "Lufthansa €178", "Air France-KLM €253"]),
    "s06-09": ("sh27 · The passenger looks back to camera, pleased", []),
    "s07-01": ("sh28 · A narrow beam over the dark; the passenger balances on it", []),
    "s07-02": ("sh28 · Labels", ["Ryanair break-even 80% full", "Frontier, 2025 78.4% full"]),
    "s07-03": ("sh29 · Frontier blocks: cost per passenger slightly taller than revenue per passenger; the passenger slumps", ["$112.17 revenue / passenger", "$116.66 cost / passenger", "Frontier, 2025 −$137 million"]),
    "s07-04": ("sh30 · Night terminal: the passenger with a suitcase in front of the departures board", ["SPIRIT AIRLINES", "Nov 2024 Chapter 11 bankruptcy", "Mar 2025 emerges", "Aug 2025 Chapter 11 again"]),
    "s07-05": ("sh30 · Every flight on the board turns CANCELLED; the passenger slumps", ["2 May 2026 all flights cancelled · wind-down", "CANCELLED"]),
    "s07-06": ("sh31 · Night, wide: the passenger alone on a bench, head down", []),
    "s07-07": ("sh31 · Night, the passenger on the bench; a fuel-hedge note", ["Ryanair: ~80% of fuel for the year to March 2027 already hedged"]),
    "s07-08": ("sh31 · Hold", []),
    "s08-01": ("sh32 · Golden hour: the passenger walks the hall towards the gate", []),
    "s08-02": ("sh32 · Answer 1", ["1 An empty seat earns nothing."]),
    "s08-03": ("sh32 · Answer 2", ["2 Cheap seats: a handful, at the bottom of the ladder."]),
    "s08-04": ("sh32 · Answer 3", ["3 Bags, seats and extras close the gap."]),
    "s08-05": ("sh32 · Answer 4", ["4 A machine built to cost less per seat."]),
    "s08-06": ("sh33 · Up the stairs with one small backpack; at the top a look back, a smile and a small wave", ["Who pays for the $20 seat?", "people who book late", "people who add a suitcase", "the airline's obsession with cost"]),
    "s08-07": ("sh33 · End card", ["HIDDEN LEDGER", "Every number in this video is sourced in the description."]),
}
notes = {"_about": "Visual objective and exact on-screen text per narration segment (mirrors blender/shots/ep004.py and src/scenes/ep004/scenes.tsx)."}
for k, (v, t) in N.items():
    notes[k] = {"visual": v, "onScreen": t}
(HERE / "visual_notes.json").write_text(json.dumps(notes, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
C = [
    ("s01-01", r"twenty", 0.05, "pop", -4), ("s01-02", r"book", 0.1, "click", 0),
    ("s01-03", r"cabin", 0.0, "register", -4), ("s01-03", r"window", 0.0, "register", -4), ("s01-03", r"suitcase|checked", 0.0, "register", -3),
    ("s01-04", r"ninety", 0.1, "decline", -2), ("s01-04", r"made", 0.0, "stamp", 0),
    ("s01-06", r"So", -1.5, "jet", -8), ("s02-01", r"follow", 0.0, "jet", -9), ("s02-04", r"fuel", 0.0, "tick", -2),
    ("s03-04", r"door", -0.1, "thump", -6), ("s03-07", r"break", 0.0, "tick", -3), ("s04-02", r"change", 0.0, "tick", -4),
    ("s05-02", r"gate", 0.0, "chime", -8), ("s06-05", r"clock", 0.0, "tick", -2), ("s07-05", r"cancel", 0.0, "decline", -3),
    ("s08-06", r"travel", 0.0, "chime", -8), ("s08-07", r"Hidden", -0.3, "jet", -10),
]
cues = {"_about": "Word-anchored sound effects for python/mix.py (episode 004). Sparse: registers on the checkout, a stamp, a door thump, distant jets on the apron.",
        "cues": [{"segment": s, "word": w, "offset": o, "sound": snd, "gain_db": g} for s, w, o, snd, g in C]}
(HERE / "sfx_cues.json").write_text(json.dumps(cues, indent=1) + "\n")
print(len(N), "notes,", len(C), "cues")
