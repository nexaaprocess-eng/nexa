"""Derived figures for Episode 002, computed from values reported in the companies' 10-K filings (USD millions).
Run: python content/episode-002/calculations.py  -> prints and writes calculations.json"""
import json
from pathlib import Path

K = dict(sales=147_642, gross_profit=33_754, operating_profit=1_890, net_attrib=1_016, charge=2_500,
         merch_costs=113_240, fifo_inv=(9_442, 9_445), lifo_inv_end=9_445 - 2_553, ap_end=10_488, our_brands=39_000)
W = dict(net_sales=706_413, revenues=713_163, cogs=535_395, inv=(56_435, 58_851), ap_end=63_061,
         us_grocery=285_482, us_total=482_975, op_income=29_825)
C = dict(net_sales=297_247, revenue=303_154, merch_costs=264_279, inv=(18_116, 19_324), ap_end=22_591,
         fees=5_907, op_income=11_685)

def per100(x, base):
    return round(100 * x / base, 2)

out = {
    "kroger_per_100": {
        "cost_of_goods": per100(K["sales"] - K["gross_profit"], K["sales"]),
        "gross_profit": per100(K["gross_profit"], K["sales"]),
        "operating_costs": per100(K["gross_profit"] - K["operating_profit"], K["sales"]),
        "operating_profit": per100(K["operating_profit"], K["sales"]),
        "interest_taxes_other": per100(K["operating_profit"] - K["net_attrib"], K["sales"]),
        "net_earnings": per100(K["net_attrib"], K["sales"]),
        "charge_2_5bn": per100(K["charge"], K["sales"]),
    },
    "kroger_our_brands_share_pct": per100(K["our_brands"], K["sales"]),
    "one_pct_of_sales_musd": round(K["sales"] * 0.01),
    "turnover": {
        "kroger_x": round(K["merch_costs"] / (sum(K["fifo_inv"]) / 2), 2),
        "costco_x": round(C["merch_costs"] / (sum(C["inv"]) / 2), 2),
        "walmart_x": round(W["cogs"] / (sum(W["inv"]) / 2), 2),
    },
    "payables_vs_inventory_pct": {
        "kroger_ap_over_lifo_inventory": per100(K["ap_end"], K["lifo_inv_end"]),
        "kroger_ap_over_fifo_inventory": per100(K["ap_end"], K["fifo_inv"][1]),
        "costco": per100(C["ap_end"], C["inv"][1]),
        "walmart": per100(W["ap_end"], W["inv"][1]),
    },
    "walmart_us_grocery_share_pct": per100(W["us_grocery"], W["us_total"]),
    "costco_fees_over_operating_income_pct": per100(C["fees"], C["op_income"]),
    "shrink_example_sales_to_replace_1usd_at_2pct": round(1 / 0.02),
}
out["turnover_days"] = {k.replace("_x", "_days"): round(365 / v, 1) for k, v in out["turnover"].items()}
print(json.dumps(out, indent=1))
Path(__file__).with_name("calculations.json").write_text(json.dumps(out, indent=1) + "\n")
