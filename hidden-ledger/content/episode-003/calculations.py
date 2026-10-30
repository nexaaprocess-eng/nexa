"""Derived figures for Episode 003, from reported values (Adobe/Spotify filings) and the hypothetical examples.
Run: python content/episode-003/calculations.py  -> prints and writes calculations.json"""
import json
from pathlib import Path

# Adobe (USD millions): FY2012-2014 from the FY2014 10-K, FY2025 from the FY2025 10-K
A = dict(rev12=4_403.7, rev13=4_055.2, rev14=4_147.1, ni12=832.775, ni13=289.985, rev25=23_769, sub25=22_904,
         op25=8_706, ni25=7_130)
# Spotify (EUR millions), 2025 Form 20-F
S = dict(rev25=17_186, cor25=11_690, gp25=5_496, op25=2_198, op24=1_365, op23=-446)
# Hypothetical subscription bundle in the cold open (USD per month)
BUNDLE = {"Music": 11.99, "Streaming": 15.49, "Cloud storage": 2.99, "Fitness": 12.99, "Productivity": 9.99, "AI assistant": 20.00}

monthly = round(sum(BUNDLE.values()), 2)
out = {
    "bundle_monthly_usd": monthly,
    "bundle_yearly_usd": round(monthly * 12, 2),
    "bundle_per_day_usd": round(monthly * 12 / 365, 2),
    "adobe_revenue_change_fy12_fy13_pct": round(100 * (A["rev13"] / A["rev12"] - 1), 1),
    "adobe_net_income_change_fy12_fy13_pct": round(100 * (A["ni13"] / A["ni12"] - 1), 1),
    "adobe_subscription_share_fy25_pct": round(100 * A["sub25"] / A["rev25"], 1),
    "adobe_revenue_fy25_vs_fy12_x": round(A["rev25"] / A["rev12"], 2),
    "spotify_cost_of_revenue_share_2025_pct": round(100 * S["cor25"] / S["rev25"], 1),
    "spotify_gross_margin_2025_pct": round(100 * S["gp25"] / S["rev25"], 1),
    # two hypothetical companies: $120 once vs $10/month, 1,000 customers
    "company_a_month1_usd": 1000 * 120,
    "company_b_month1_usd": 1000 * 10,
    "company_b_12_months_no_churn_usd": 1000 * 10 * 12,
    # hypothetical unit economics: $10/month, developer keeps 70% in year one; expected lifetime ~ 1/monthly churn
    "dev_net_per_month_usd": round(10 * 0.70, 2),
    "ltv_at_10pct_churn_usd": round(10 * 0.70 / 0.10, 2),
    "ltv_at_20pct_churn_usd": round(10 * 0.70 / 0.20, 2),
    "cac_usd": 40,
}
print(json.dumps(out, indent=1))
Path(__file__).with_name("calculations.json").write_text(json.dumps(out, indent=1) + "\n")
