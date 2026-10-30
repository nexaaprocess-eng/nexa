"""Derived figures for Episode 004, from reported values (Ryanair FY2026 Form 20-F, Frontier 2025 Form 10-K)
and the hypothetical examples. Run: python content/episode-004/calculations.py -> prints and writes calculations.json"""
import json
from pathlib import Path

# Ryanair Holdings, fiscal year to 31 March 2026 (Form 20-F, filed June 2026). EUR millions unless noted.
R = dict(total_opex=13_170.1, total_rev=15_544.3, ancillary=4_988.3, pax_m=208.4, sectors_k=1_151.8,
         fare=50.66, anc_pp=23.94, rev_pp=74.60, cost_pp=63.21, be_lf=0.80, lf=0.94, seats_8200=197)
# Frontier Group Holdings, calendar 2025 (Form 10-K). USD millions unless noted.
F = dict(opex=3_873, pax_k=33_200, fare_pp=44.60, nonfare_pp=63.79, rev_pp=112.17)
# Hypothetical checkout in the cold open (USD)
CHECKOUT = {"Fare": 20, "Cabin bag": 25, "Window seat": 12, "Checked suitcase": 35}

out = {
    "checkout_total_usd": sum(CHECKOUT.values()),
    "ryanair_cost_per_flight_eur": round(R["total_opex"] * 1e6 / (R["sectors_k"] * 1e3)),
    "ryanair_pax_per_flight": round(R["pax_m"] * 1e6 / (R["sectors_k"] * 1e3), 1),
    "ryanair_revenue_per_flight_eur": round(R["total_rev"] * 1e6 / (R["sectors_k"] * 1e3)),
    "ryanair_margin_per_pax_eur": round(R["rev_pp"] - R["cost_pp"], 2),
    "ryanair_fare_minus_cost_per_pax_eur": round(R["fare"] - R["cost_pp"], 2),
    "ryanair_ancillary_share_pct": round(100 * R["ancillary"] / R["total_rev"], 1),
    # illustrative: Ryanair's fleet-average break-even and actual load factors applied to one 197-seat aircraft
    "be_seats_197": round(R["seats_8200"] * R["be_lf"], 1),
    "sold_seats_197_at_94pct": round(R["seats_8200"] * R["lf"], 1),
    "profit_seats_197": round(R["seats_8200"] * (R["lf"] - R["be_lf"]), 1),
    "frontier_cost_per_pax_usd": round(F["opex"] * 1e6 / (F["pax_k"] * 1e3), 2),
    "frontier_loss_per_pax_usd": round(F["opex"] * 1e6 / (F["pax_k"] * 1e3) - F["rev_pp"], 2),
    "frontier_nonfare_vs_fare_x": round(F["nonfare_pp"] / F["fare_pp"], 2),
}
print(json.dumps(out, indent=1))
Path(__file__).with_name("calculations.json").write_text(json.dumps(out, indent=1) + "\n")
