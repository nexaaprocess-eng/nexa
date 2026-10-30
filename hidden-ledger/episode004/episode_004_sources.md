# Sources & fact check — Episode 004 "How Can Airlines Sell Flights for Just $20?"

Accessed 2026-10-29/30. Claim-by-claim mapping (narration segment IDs, verbatim excerpts): `claims.json` and `fact_check.csv`, rendered as a table in `fact_check.md`. Derived numbers: `calculations.py` → `calculations.json`.

## What is real and what is illustrative
| On screen | Status |
|---|---|
| The "$20" fare, the $92 checkout ($25 cabin bag, $12 window seat, $35 suitcase), the fictional booking and comparison sites ("SkyLow", "BudgetJet", "Network Air") | **Made-up example.** Narration says so ("Those prices are a made-up example"), and the screen is stamped **MADE-UP EXAMPLE**. Budget airlines do advertise fares in this range in seat sales, but no specific fare is claimed. |
| The price staircase ($20 → $189) and the neighbour's "$160" | **Illustrative fares** (labelled). They show the mechanism Ryanair describes ("prices generally varying on the basis of advance booking, seat availability and demand"), not real price points. |
| The 197-seat seat map filling to 158 then ~185 seats | **Illustration** using Ryanair's real fleet-wide FY26 break-even load factor (80%) and load factor (94%) on one 197-seat aircraft (labelled). A real flight's break-even varies with route and fare. |
| Every other number | Reported figures or arithmetic on reported figures, below. |

## Key distinctions kept in the script
- **Fare vs. total revenue per passenger.** Ryanair's "average fare" (€50.66) *includes* checked-bag and change fees, which Ryanair books as scheduled (fare) revenue. Its "ancillary" revenue (€23.94 per passenger) is priority boarding, reserved seats, in-flight sales and other non-flight items. Total revenue per passenger is €74.60.
- **Cost per passenger.** €63.21 is Ryanair's fleet-wide average operating cost per booked passenger, not the cost of any one seat. The cost of one *extra* passenger on a flight that is flying anyway is much lower (Ryanair: "the operating costs of each flight do not vary significantly with the number of passengers flown").
- **Profit.** €74.60 − €63.21 ≈ €11.39 is operating profit per passenger before interest and tax. Not every ticket is profitable on its own; the narration never says it is.
- **Different airlines, different currencies and years.** Ryanair figures are euros for the fiscal year to 31 March 2026. Frontier figures are US dollars for calendar 2025. They are never added together.
- **Load factor definitions differ slightly.** Ryanair uses seats sold ÷ seats flown; Frontier uses revenue passenger miles ÷ available seat miles. The episode compares them only loosely ("about 80 percent" vs "78.4 percent") and says so in the on-screen source line.

## Primary sources
1. **Ryanair Holdings plc, Annual report on Form 20-F for the fiscal year ended 31 March 2026** (published June 2026) — https://investor.ryanair.com/wp-content/uploads/2026/06/20F-Statement-2026.pdf
   - Selected operating data (FY2026): average booked passenger fare €50.66; ancillary revenue per booked passenger €23.94; total revenue per booked passenger €74.60; cost per booked passenger €63.21; break-even load factor 80% (FY2025: 84%); booked passenger load factor 94%; sectors flown 1,151.8k; average daily flight-hour utilisation 9.48 hours; revenue passengers booked 208m.
   - Per-passenger operating expenses: fuel and oil €26.01; staff €8.91; airport and handling €8.46; depreciation €6.59; route charges €6.33; marketing, distribution and other €4.26; maintenance €2.65 (total €63.21).
   - "fuel accounted for approximately 41% of total operating expenses in FY26."
   - "Scheduled revenues relate to the sale of flight seats and associated direct flight fees, including baggage fares and change fees."
   - "Ancillary Revenues accounted for approximately 32% of Ryanair's total operating revenues in FY26."
   - "The operating costs of each flight do not vary significantly with the number of passengers flown…"
   - "Ryanair offers low fares, with prices generally varying on the basis of advance booking, seat availability and demand." / "'load factor active – yield passive' strategy whereby seats are priced to ensure that high load factor targets are achieved." / "Promotional fares may have the effect of increasing load factors and reducing Ryanair's yield and passenger revenues on the relevant routes…"
   - Fleet: Boeing 737-8200 aircraft "each having 197 seats"; 737-800NG "each having 189 seats".
   - Airports: "prioritizes airports that offer competitive prices… less expensive gate locations as well as outdoor boarding stairs, rather than jetways… requires all passengers to check-in on the Internet"; "achieves quick turn-around times".
2. **Ryanair Holdings plc, Full Year FY26 results** (18 May 2026) — https://investor.ryanair.com/wp-content/uploads/2026/05/FY26-Ryanair-Results.pdf
   - Total operating expenses €13,170.1m; passengers 208.4m; ancillary revenue €4.99bn (€24 per passenger); fleet at 31 March 2026: 621 Boeing 737 and 26 Airbus A320.
3. **Ryanair FY26 results presentation** (May 2026), slide "Europe's Lowest Costs – Gap Widens" — https://investor.ryanair.com/wp-content/uploads/2026/05/FY26-Ryanair-Presentation.pdf
   - Unit cost ex fuel, € per passenger: Ryanair 36, Wizz 62, easyJet 90, Southwest 147, IAG 178, Lufthansa 178, Air France-KLM 253 ("Source: latest FY Results").
   - **Caveat:** this is Ryanair's own comparison of competitors with different fiscal years and definitions. The narration attributes it ("Ryanair puts its own costs at… It puts Wizz Air at…").
4. **Ryanair Holdings plc, Annual Report 2025** — https://investor.ryanair.com/wp-content/uploads/2025/05/Ryanair-2025-Annual-Report.pdf
   - "…in contrast to the 162 seats and two-class configuration of the Boeing 737-800 aircraft used by traditional network airlines."
   - "We are now the world's largest low fare airline by passenger traffic…"
5. **Frontier Group Holdings, Inc., Form 10-K for 2025** (filed 18 February 2026) — https://www.sec.gov/Archives/edgar/data/1670076/000167007626000020/fron-20251231.htm
   - Fare revenue per passenger $44.60; non-fare passenger revenue per passenger $63.79; total revenue per passenger $112.17; load factor 78.4%; total operating expenses $3,873m; passengers 33,200 thousand; net loss $137m.
   - "…increase our ancillary revenues from $60.55 per passenger in 2021 to $67.57 per passenger in 2025."
   - Optional services list (bags, seat selection, changes, in-flight sales).
6. **Spirit Aviation Holdings, Inc., Form 10-K for 2025** (filed 16 March 2026) — https://www.sec.gov/Archives/edgar/data/1498710/000162828026018265/flyy-20251231.htm
   - Chapter 11 filed 18 November 2024; emerged 12 March 2025.
7. **Spirit Aviation Holdings, Inc., Form 8-K (Item 1.03), 29 August 2025** — https://www.sec.gov/Archives/edgar/data/1498710/000095010325011031/dp233724_8k.htm
   - Second voluntary chapter 11 petition, 29 August 2025.
8. **Spirit Aviation Holdings, Inc., Form 8-K, Exhibit 99.1, 2 May 2026** — https://www.sec.gov/Archives/edgar/data/1498710/000095010326006723/dp246246_ex9901.htm
   - "…the Company has started an orderly wind-down of operations, effective immediately. All Spirit flights have been cancelled…"; "the recent material increase in oil prices and other pressures on the business have significantly impacted Spirit's financial outlook."
   - "For more than 30 years, Spirit Airlines has played a pioneering role in making travel more accessible…" (the basis of "described itself as a pioneer of affordable travel").

## Derived figures (calculations.py)
| Figure | Calculation |
|---|---|
| ≈ €11,400 per average Ryanair flight | €13,170.1m total operating expenses ÷ 1,151.8k sectors = €11,434 |
| ≈ 181 passengers per flight | 208.4m passengers ÷ 1,151.8k sectors = 180.9 |
| −€12.55 on the fare alone | €50.66 − €63.21 |
| ≈ €11 profit per passenger | €74.60 − €63.21 = €11.39 |
| 158 / ~27 seats | 197 × 80% = 157.6; 197 × (94% − 80%) = 27.6 (illustrative) |
| €6.91 "sales, maintenance, other" | €4.26 + €2.65 |
| ≈ $116.66 Frontier cost per passenger | $3,873m ÷ 33.2m passengers |
| $92 checkout | $20 + $25 + $12 + $35 (made-up) |

## Not used
- US Bureau of Transportation Statistics bag-fee totals: the BTS site refused automated access from the research environment, so no BTS figure appears in the episode.
- A specific real "$20" fare: past budget-airline seat sales advertised one-way fares around $19–$22, but no specific sale is cited, so the $20 is presented as a made-up example.
- Turnaround minutes: Ryanair's filing says "quick turn-around times" without a number, so the episode gives none.

## Visual and audio provenance (no third-party assets)
- **Character, sets and props:** built procedurally in Blender 4.5.9 LTS (GPL; output is not covered by the GPL) from `blender/*.py`, after the Hidden Ledger character reference sheet (`assets/character/reference_sheet.png`). Airline names on screens are fictional; aircraft carry no real livery or logos. The yellow aircraft in the Spirit segment is a generic yellow livery with no logo.
- **Narration:** Chatterbox TTS 0.1.7 (Resemble AI, MIT licence), run locally on CPU. Its output carries Resemble's inaudible "Perth" provenance watermark.
- **Music and SFX:** procedurally generated by `python/music.py` (project code). No licensed tracks are used.
- **Fonts:** Inter and Space Grotesk (SIL Open Font License), as in previous episodes.
