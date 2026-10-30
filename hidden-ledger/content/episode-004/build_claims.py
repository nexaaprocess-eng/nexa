"""Writes claims.json and fact_check.csv for Episode 004 (claims -> segments -> sources, with verbatim evidence)."""
import csv
import json
from pathlib import Path

HERE = Path(__file__).parent
C = []


def claim(id, type, text, segments, sources, evidence, caveat=""):
    C.append({"id": id, "type": type, "claim": text, "segments": segments, "sources": sources,
              "evidence": evidence, "method_or_caveat": caveat})


claim("I01", "illustrative", "Hypothetical checkout: $20 fare + $25 cabin bag + $12 window seat + $35 checked suitcase = $92.",
      ["s01-03", "s01-04"], ["HL-HYPO"], "calculations.json checkout_total_usd.",
      "Labelled MADE-UP EXAMPLE on screen and in narration. Not the prices of any named airline.")
claim("I02", "illustrative", "One 197-seat aircraft at Ryanair's FY26 fleet-average break-even load factor (80%) needs ~158 passengers; at the 94% actual load factor ~185, i.e. ~27 seats above break-even.",
      ["s03-08"], ["HL-HYPO", "RYA-20F-FY26"], "calculations.json be_seats_197, sold_seats_197_at_94pct, profit_seats_197.",
      "Illustrative: the load factors are fleet averages and cost is not identical per flight; labelled ILLUSTRATIVE on screen.")
claim("I03", "illustrative", "Fare ladder: few cheap seats sold early; prices rise as the flight fills and departure nears; last seats can cost many times the first.",
      ["s04-03", "s04-04"], ["HL-HYPO", "RYA-20F-FY26"],
      "Ryanair: \"prices generally varying on the basis of advance booking, seat availability and demand.\" Ladder steps on screen are hypothetical.",
      "Shape illustrative; no airline's actual fare buckets are shown.")
claim("F01", "fact", "Frontier 2025: fare revenue per passenger $44.60; non-fare passenger revenue per passenger $63.79.",
      ["s01-05", "s05-05"], ["FRONTIER-10K-2025"],
      "Comparative Operating Statistics: \"Fare revenue per passenger ($) | 44.60 | 43.09\"; \"Non-fare passenger revenue per passenger ($) | 63.79 | 67.50\".",
      "Non-fare passenger revenue = bags, seats, changes, bundles etc. Excludes 'other revenue' ($3.78).")
claim("F02", "fact", "Frontier ancillary revenue per passenger rose from $60.55 (2021) to $67.57 (2025).",
      ["s05-06"], ["FRONTIER-10K-2025"],
      "\"these offerings have helped increase our ancillary revenues from $60.55 per passenger in 2021 to $67.57 per passenger in 2025.\"",
      "Frontier's 'total ancillary' = non-fare passenger revenue + other revenue.")
claim("F03", "fact", "Budget fares unbundle: bags, seat selection, priority boarding, changes, onboard sales sold separately.",
      ["s05-02"], ["FRONTIER-10K-2025", "RYA-20F-FY26"],
      "Frontier: \"Such additional options include carry-on and checked baggage, advance seat selection, ... and ticket changes and cancellations... We also promote and sell products in-flight\". Ryanair: ancillary \"including priority boarding, reserved seating and in-flight sales of merchandise\".",
      "Exact allowances vary by airline and fare type; narration says 'usually'.")
claim("F04", "fact", "Frontier 2025 load factor 78.4%.", ["s07-02"], ["FRONTIER-10K-2025"],
      "\"Load factor | 78.4 | % | 76.8 | %\"", "Frontier defines load factor as RPMs/ASMs; Ryanair's is seats sold/seats flown. Close but not identical definitions.")
claim("F05", "fact", "Frontier 2025: operating expenses $3,873m / 33.2m passengers = ~$116.66 per passenger vs total revenue per passenger $112.17; net loss $137m.",
      ["s07-03"], ["FRONTIER-10K-2025"],
      "\"Total operating expenses | $ | 3,873\"; \"Passengers (thousands) | 33,200\"; \"Total revenue per passenger ($) | 112.17\"; \"We generated a net loss of $137 million during the year ended December 31, 2025\".",
      "Cost per passenger derived (calculations.json frontier_cost_per_pax_usd).")
claim("R01", "fact", "Ryanair FY26 (year to 31 March 2026): 208 million passengers; Europe's largest budget airline (Ryanair: world's largest low fare airline by passenger traffic).", ["s02-02"], ["RYA-20F-FY26", "RYA-FY26-RESULTS", "RYA-AR-FY25"],
      "20-F: \"Revenue Passengers Booked (millions) 208\"; results: \"Traffic grew 4% to 208.4m\"; AR FY25: \"We are now the world's largest low fare airline by passenger traffic, having overtaken our great mentor Southwest Airlines.\"", "")
claim("R02", "fact", "Ryanair FY26 per booked passenger: average fare €50.66; ancillary €23.94; total revenue €74.60; cost €63.21.",
      ["s02-03", "s02-04", "s02-05", "s05-04"], ["RYA-20F-FY26"],
      "Selected Operating Data: \"Average Booked Passenger Fare (€) 50.66\"; \"Ancillary Rev. per Booked Passenger (€) 23.94\"; \"Total Rev. per Booked Passenger (€) 74.60\"; \"Cost Per Booked Passenger (€) 63.21\".",
      "Per booked passenger, fleet-wide average.")
claim("R03", "fact", "Ryanair FY26 operating cost per passenger: fuel €26.01, staff €8.91, airport & handling €8.46, depreciation €6.59, route charges €6.33, marketing/distribution/other €4.26, maintenance €2.65; fuel ~41% of total operating expenses.",
      ["s02-04"], ["RYA-20F-FY26"],
      "Per-passenger table: \"Fuel and oil 26.01 ... Staff costs 8.91 ... Airport and handling charges 8.46 ... Depreciation 6.59 ... Route charges 6.33 ... Marketing, distribution and other 4.26 ... Maintenance, materials and repairs 2.65 ... Total operating expenses 63.21\"; \"fuel accounted for approximately 41% of total operating expenses in FY26\".",
      "Narration rounds; 'aircraft themselves' = depreciation; 'air traffic control charges' = route charges (Eurocontrol en-route navigation charges).")
claim("R04", "fact", "Ryanair's scheduled (fare) revenue includes baggage fees and change fees.", ["s02-05"], ["RYA-20F-FY26"],
      "\"Scheduled revenues relate to the sale of flight seats and associated direct flight fees, including baggage fares and change fees.\"",
      "So the €50.66 'fare' is not a seat-only price.")
claim("R05", "fact", "Ryanair: operating costs of each flight do not vary significantly with passengers flown.", ["s03-02"], ["RYA-20F-FY26"],
      "\"The operating costs of each flight do not vary significantly with the number of passengers flown, and therefore, a relatively small change in the number of passengers, fare pricing, or traffic mix could have a disproportionate effect on operating and financial results.\"", "")
claim("C01", "derived", "Ryanair FY26 average flight: total operating expenses €13,170.1m / 1,151.8k sectors ≈ €11,434 per flight; 208.4m passengers / 1,151.8k sectors ≈ 181 passengers per flight.",
      ["s03-03"], ["RYA-20F-FY26", "RYA-FY26-RESULTS"],
      "20-F: \"Sectors Flown ('000) 1,151.8\"; results: \"Total operating expenses ... 13,170.1\"; \"208.4m\" passengers.",
      "Derived average across all routes (calculations.json). Includes €85m exceptional charge.")
claim("C02", "derived", "Ryanair FY26 revenue per passenger minus cost per passenger: €74.60 − €63.21 = €11.39.", ["s05-04"], ["RYA-20F-FY26"],
      "See R02.", "Operating margin per passenger, before interest and tax.")
claim("R06", "fact", "Ryanair FY26 break-even load factor 80%; booked passenger load factor 94%.", ["s03-07", "s07-02"], ["RYA-20F-FY26"],
      "\"Break-even Load Factor 80%\"; \"Booked Passenger Load Factor 94%\" (FY2026 column).",
      "Ryanair definition: \"the average percent of seats that must be filled on an average flight at current average fares for the revenue to break even with the operating costs\". FY25 was 84%.")
claim("R08", "fact", "Ryanair: 197 seats on Boeing 737-8200, 189 on 737-800NG; traditional network airlines' two-class 737-800 has 162 seats.",
      ["s03-08", "s06-02"], ["RYA-20F-FY26", "RYA-AR-FY25"],
      "20-F FY26: \"...each having 197 seats, 410 Boeing 737-800 'Next Generation' ('NG') aircraft, each having 189 seats\"; AR FY25: \"high-seat density of 189 seats on the Boeing 737-800NGs and 197 on the Boeing 737-8200 aircraft. This is in contrast to the 162 seats and two-class configuration of the Boeing 737-800 aircraft used by traditional network airlines\".",
      "162 is Ryanair's description of a typical legacy configuration.")
claim("R09", "fact", "Ryanair fares vary with advance booking, seat availability and demand; 'load factor active – yield passive'; promotional fares may reduce yield and revenue on routes while they run; used to stimulate demand in quieter periods.",
      ["s04-02", "s04-06", "s04-07"], ["RYA-20F-FY26"],
      "\"Ryanair offers low fares, with prices generally varying on the basis of advance booking, seat availability and demand.\" \"Ryanair's discounted fares are driven by Ryanair's 'load factor active – yield passive' strategy whereby seats are priced to ensure that high load factor targets are achieved.\" \"Promotional fares may have the effect of increasing load factors and reducing Ryanair's yield and passenger revenues on the relevant routes during the periods they are in effect. Ryanair expects to continue to offer significant fare promotions to stimulate demand in periods of lower activity or during off-peak times\".", "")
claim("R10", "fact", "Ryanair FY26 ancillary revenue €4.99bn (≈€24 per passenger), ~32% of total operating revenue; includes priority boarding, reserved seating, in-flight sales.",
      ["s05-03"], ["RYA-20F-FY26", "RYA-FY26-RESULTS"],
      "Results: \"Ancillary revenue was solid, rising 6% to €4.99BN (€24 per passenger)\"; 20-F: \"Ancillary Revenues accounted for approximately 32% of Ryanair's total operating revenues in FY26\"; \"Ancillary revenues relate to activities connected with the flight service, including priority boarding, reserved seating and in-flight sales of merchandise.\"",
      "'Last year' = Ryanair FY26 (to March 2026). Checked bags are NOT in ancillary at Ryanair (they are in fares, see R04).")
claim("R11", "fact", "Ryanair FY26 average daily flight hour utilization 9.48 hours.", ["s06-04"], ["RYA-20F-FY26"],
      "\"Average Daily Flight Hour Utilization (hours) 9.48\"", "Narration: 'about nine and a half hours'.")
claim("R15", "fact", "Ryanair achieves quick turnaround times between flights.", ["s06-05"], ["RYA-20F-FY26"],
      "\"achieves quick turn-around times, thus reducing fuel burn and emissions when aircraft are on the ground\"",
      "No specific minute figure is claimed (none is given in the filing).")
claim("R12", "fact", "Ryanair fleet at 31 March 2026: 621 Boeing 737 and 26 Airbus A320 (Lauda).", ["s06-06"], ["RYA-FY26-RESULTS"],
      "\"At March 31, 2026 the Group had an operating fleet of 621 (2025: 587) Boeing 737 and 26 (2025: 26) Airbus A320 aircraft.\"",
      "Hence 'almost the whole fleet' (96%).")
claim("R13", "fact", "Ryanair prioritises airports with competitive prices, uses cheaper gates and outdoor boarding stairs rather than jetways, requires online check-in.",
      ["s06-07"], ["RYA-20F-FY26"],
      "\"Ryanair prioritizes airports that offer competitive prices.\" \"Ryanair endeavors to reduce its airport charges by opting, when practicable, for less expensive gate locations as well as outdoor boarding stairs, rather than jetways\" \"Ryanair requires all passengers to check-in on the Internet\".", "")
claim("R14", "fact", "Unit cost ex fuel per passenger (Ryanair's comparison, latest FY results): Ryanair €36, Wizz €62, easyJet €90, Southwest €147, IAG €178, Lufthansa €178, Air France-KLM €253.",
      ["s06-08"], ["RYA-FY26-PRES"],
      "Slide 'Europe's Lowest Costs – Gap Widens': \"Unit cost ex fuel 36 62 90 147 178 178 253\" (RYA, WIZ, EZJ, LUV, IAG, LUF, AFKLM); \"Source: latest FY Results\".",
      "Ryanair's own investor-presentation comparison; competitors' fiscal years and definitions differ. Attributed as 'Ryanair puts...' in narration and on screen.")
claim("S01", "fact", "Spirit Airlines filed chapter 11 on 18 Nov 2024 (emerged 12 Mar 2025) and again on 29 Aug 2025.",
      ["s07-04"], ["SPIRIT-10K-2025", "SPIRIT-8K-AUG25"],
      "10-K: \"On November 18, 2024, Spirit Airlines ... commenced a voluntary case under chapter 11\"; \"On March 12, 2025 ... we emerged\"; 8-K: \"On August 29, 2025, Spirit Aviation Holdings ... Voluntary Petition for Reorganization\". Press release: \"For more than 30 years, Spirit Airlines has played a pioneering role in making travel more accessible\".", "")
claim("S02", "fact", "On 2 May 2026 Spirit began an orderly wind-down, cancelled all flights, citing the material increase in oil prices.",
      ["s07-05"], ["SPIRIT-8K-MAY26"],
      "Exhibit 99.1, May 2, 2026: \"the Company has started an orderly wind-down of operations, effective immediately. All Spirit flights have been cancelled\"; \"the recent material increase in oil prices and other pressures on the business have significantly impacted Spirit's financial outlook\".", "")

SOURCES = [
    ("RYA-20F-FY26", "https://investor.ryanair.com/wp-content/uploads/2026/06/20F-Statement-2026.pdf", "Ryanair Holdings plc", "Form 20-F for fiscal year ended March 31 2026", "FY2026 (Apr 2025–Mar 2026)", "2026-06", "EUR / %", "fare 50.66; ancillary 23.94; revenue 74.60; cost 63.21 per booked pax; per-pax cost lines; break-even LF 80%; LF 94%; sectors 1,151.8k; utilisation 9.48h; fuel ~41% of opex; ancillary ~32% of revenue; seat counts; pricing & airport policy text", "Primary filing (annual report on Form 20-F, as published on Ryanair's investor site)."),
    ("RYA-FY26-RESULTS", "https://investor.ryanair.com/wp-content/uploads/2026/05/FY26-Ryanair-Results.pdf", "Ryanair Holdings plc", "Full Year FY26 results announcement", "FY2026", "2026-05-18", "EUR m", "208.4m pax; total opex 13,170.1; ancillary €4.99bn (€24/pax); fleet 621 B737 + 26 A320", "Primary company release; same figures as the RNS on investegate.co.uk."),
    ("RYA-FY26-PRES", "https://investor.ryanair.com/wp-content/uploads/2026/05/FY26-Ryanair-Presentation.pdf", "Ryanair Holdings plc", "FY26 results presentation, slide 'Europe's Lowest Costs – Gap Widens'", "latest FY of each airline", "2026-05", "EUR per pax", "unit cost ex fuel: RYA 36, WIZ 62, EZJ 90, LUV 147, IAG 178, LUF 178, AFKLM 253", "Company's own competitor comparison: different fiscal years/definitions; attributed to Ryanair."),
    ("RYA-AR-FY25", "https://investor.ryanair.com/wp-content/uploads/2025/05/Ryanair-2025-Annual-Report.pdf", "Ryanair Holdings plc", "Annual Report 2025", "FY2025", "2025", "text", "162-seat two-class legacy 737-800 comparison", "Primary."),
    ("FRONTIER-10K-2025", "https://www.sec.gov/Archives/edgar/data/1670076/000167007626000020/fron-20251231.htm", "Frontier Group Holdings, Inc.", "Form 10-K for fiscal year ended Dec 31 2025", "2025", "2026-02-18", "USD / %", "fare 44.60; non-fare 63.79; total rev 112.17 per pax; ancillary 60.55 (2021) -> 67.57 (2025); LF 78.4%; opex 3,873m; 33.2m pax; net loss 137m", "Primary filing."),
    ("SPIRIT-10K-2025", "https://www.sec.gov/Archives/edgar/data/1498710/000162828026018265/flyy-20251231.htm", "Spirit Aviation Holdings, Inc.", "Form 10-K for fiscal year ended Dec 31 2025", "2025", "2026-03-16", "text", "Chapter 11 Nov 18 2024; emergence Mar 12 2025", "Primary filing."),
    ("SPIRIT-8K-AUG25", "https://www.sec.gov/Archives/edgar/data/1498710/000095010325011031/dp233724_8k.htm", "Spirit Aviation Holdings, Inc.", "Form 8-K (Item 1.03 Bankruptcy)", "2025-08-29", "2025-08-29", "text", "second chapter 11 filing Aug 29 2025", "Primary filing."),
    ("SPIRIT-8K-MAY26", "https://www.sec.gov/Archives/edgar/data/1498710/000095010326006723/dp246246_ex9901.htm", "Spirit Aviation Holdings, Inc.", "Form 8-K, Exhibit 99.1 press release 'Spirit Airlines Begins Orderly Wind-Down of Operations'", "2026-05-02", "2026-05-04", "text", "wind-down; all flights cancelled; oil prices", "Primary filing."),
    ("HL-HYPO", "", "Hidden Ledger", "Hypothetical examples (calculations.py)", "", "", "USD", "checkout $92; 197-seat break-even illustration; fare ladder", "Illustrative, labelled on screen."),
]
used = {}
for c in C:
    for s in c["sources"]:
        used.setdefault(s, {"claims": [], "segs": []})
        used[s]["claims"].append(c["id"])
        used[s]["segs"] += c["segments"]
(HERE / "claims.json").write_text(json.dumps({"_about": "Every factual claim in Episode 004, with the narration segments that use it. Sources: fact_check.csv / sources.md. Calculations: calculations.py.", "claims": C}, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
with open(HERE / "fact_check.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["source_id", "claim_ids", "scene_segments", "url", "publisher", "document", "period", "filed_or_published", "accessed", "unit", "figures_used", "exact_text_or_table", "reliability_notes"])
    for sid, url, pub, doc, per, filed, unit, figs, rel in SOURCES:
        u = used.get(sid, {"claims": [], "segs": []})
        w.writerow([sid, ";".join(u["claims"]), ";".join(sorted(set(u["segs"]))), url, pub, doc, per, filed, "2026-10-29", unit, figs, "verbatim quotes in claims.json", rel])
print(len(C), "claims")
