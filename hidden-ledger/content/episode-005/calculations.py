"""Hypothetical hotel used in Episode 005 (all inputs made up, labelled on screen) + figures derived from the
public hotel-booking dataset (Antonio, de Almeida & Nunes 2019). Writes calculations.json.

  python content/episode-005/calculations.py [--dataset path/to/hotels.csv]

Model: each booking independently shows up with probability p (binomial). Rooms 100, $150 per night,
relocating ("moving") a guest who arrives to no room costs the hotel $250 (another hotel, transport, apology).
"""
import csv
import json
import sys
from math import comb
from pathlib import Path

ROOMS, PRICE, MOVE_COST = 100, 150, 250


def night(n, p_show):
    pmf = [comb(n, k) * p_show ** k * (1 - p_show) ** (n - k) for k in range(n + 1)]
    occ = sum(min(k, ROOMS) * q for k, q in enumerate(pmf))
    moved = sum(max(0, k - ROOMS) * q for k, q in enumerate(pmf))
    return {"bookings": n, "p_show": p_show, "expected_arrivals": round(sum(k * q for k, q in enumerate(pmf)), 2),
            "expected_occupied": round(occ, 2), "expected_empty": round(ROOMS - occ, 2),
            "expected_moved": round(moved, 2), "p_at_least_one_moved": round(sum(q for k, q in enumerate(pmf) if k > ROOMS), 3),
            "room_revenue_minus_moving": round(occ * PRICE - moved * MOVE_COST, 0)}


out = {"inputs": {"rooms": ROOMS, "price_usd": PRICE, "move_cost_usd": MOVE_COST, "no_show_rate_typical": 0.08, "no_show_rate_bad_season": 0.03}}
out["A_100_bookings"] = night(100, 0.92)
out["B_106_bookings"] = night(106, 0.92)
out["B_106_bookings_bad_forecast"] = night(106, 0.97)
out["empty_room_revenue_A_usd"] = round(out["A_100_bookings"]["expected_empty"] * PRICE)
out["B_minus_A_usd_per_night"] = out["B_106_bookings"]["room_revenue_minus_moving"] - out["A_100_bookings"]["room_revenue_minus_moving"]

ds = Path(sys.argv[sys.argv.index("--dataset") + 1]) if "--dataset" in sys.argv else None
if ds and ds.exists():
    rows = list(csv.DictReader(ds.open()))
    n = len(rows)
    st = {s: sum(r["reservation_status"] == s for r in rows) for s in ("Canceled", "No-Show", "Check-Out")}
    by_hotel = {h: sum(r["hotel"] == h for r in rows) for h in ("Resort Hotel", "City Hotel")}
    lt = {}
    for lo, hi, nm in ((0, 7, "under_7_days"), (180, 10 ** 6, "180_days_or_more")):
        sub = [r for r in rows if lo <= int(r["lead_time"]) < hi]
        lt[nm] = {"bookings": len(sub), "cancelled_pct": round(100 * sum(r["reservation_status"] == "Canceled" for r in sub) / len(sub), 1)}
    out["dataset"] = {"file": ds.name, "bookings": n, "by_hotel": by_hotel,
                      "cancelled": st["Canceled"], "cancelled_pct": round(100 * st["Canceled"] / n, 2),
                      "no_show": st["No-Show"], "no_show_pct": round(100 * st["No-Show"] / n, 2),
                      "by_lead_time": lt}
elif (Path(__file__).with_name("calculations.json")).exists():
    out["dataset"] = json.loads(Path(__file__).with_name("calculations.json").read_text()).get("dataset")
Path(__file__).with_name("calculations.json").write_text(json.dumps(out, indent=1) + "\n")
print(json.dumps(out, indent=1))
