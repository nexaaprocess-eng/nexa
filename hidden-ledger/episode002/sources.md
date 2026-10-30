# Sources & fact check — Episode 002 "How Supermarkets Make Money on Tiny Margins"

Accessed 2026-10-27. Exact quotes and claim mapping: `fact_check.csv` (one row per source) and `claims.json` (one row per claim, with narration segment IDs). All derived numbers are reproduced by `calculations.py` → `calculations.json`.

## Period choice (important)
The brief suggested Walmart FY2025 and Costco FY2025. Newer audited filings exist and are used instead; the older values were confirmed and are noted for context:

| Company | Period used | Filed | Older value (confirmed) |
|---|---|---|---|
| Kroger | fiscal 2025, 52 weeks ended **Jan 31, 2026** | 2026-03-31 | FY2024 operating margin 2.62% (shown on screen) |
| Walmart | fiscal **2026**, ended **Jan 31, 2026** | 2026-03-13 | FY2025: gross profit 24.1%, operating income 4.4% of net sales |
| Costco | fiscal **2026**, 52 weeks ended **Aug 30, 2026** | 2026-10-07 | FY2025: gross margin 11.12%, membership fees $5.323B |

Kroger is used as the main **supermarket** example. Walmart (supercenters + Sam's Club, general merchandise) and Costco (membership warehouse club) are presented as *different business models*, never as representative of grocery-only stores.

## Primary sources
1. **The Kroger Co., Form 10-K, fiscal 2025** — https://www.sec.gov/Archives/edgar/data/56873/000110465926037723/kr-20260131x10k.htm
   Sales $147,642M; gross margin 22.9%; operating profit $1,890M = 1.28% of sales (incl. $2.5B fulfillment-network impairment and related charges; 2.62% in FY2024); net earnings attributable $1,016M; Our Brands > $39B of sales; > 13,000 private-label items per supermarket on average; 2,697 supermarkets; "lower shrink" among reasons for the gross-margin increase.
2. **Walmart Inc., Form 10-K, fiscal 2026** — https://www.sec.gov/Archives/edgar/data/104169/000010416926000055/wmt-20260131.htm
   Gross profit 24.2% of net sales; operating income 4.2% of net sales ($29,825M on net sales $706,413M); Walmart U.S. grocery $285,482M of $482,975M; supplier payments (volume incentives, warehouse allowances, markdowns, certain advertising) recorded as a reduction of cost of sales.
3. **Costco Wholesale Corp., Form 10-K, fiscal 2026** — https://www.sec.gov/Archives/edgar/data/909832/000090983226000093/cost-20260830.htm
   Gross margin 11.09% of net sales; membership fees $5,907M; operating income $11,685M; Kirkland Signature "generally lower" prices than national brands and "generally earn higher margins" (company statement).
4. **USDA Economic Research Service, EIB-121 (Buzby, Wells & Hyman, Feb 2014)** — https://www.ers.usda.gov/publications/43836 (PDF mirror: https://ageconsearch.umn.edu/record/164262/files/EIB121.pdf)
   Retail-level food losses = 10% (43 billion lb) of the available U.S. food supply in 2010. Dated estimate; stated as such.
5. **SEC EDGAR XBRL company facts** (cross-check of every reported value) — https://data.sec.gov/api/xbrl/companyfacts/CIK0000056873.json, …CIK0000104169.json, …CIK0000909832.json

## Calculations (Hidden Ledger, from the filings above)
| Narration | Formula | Result |
|---|---|---|
| Kroger, per $100 of sales | (sales − gross profit) / sales; (gross profit − operating profit) / sales; operating profit / sales; net earnings / sales | $77.14 · $21.58 · $1.28 · $0.69 |
| Inventory turnover | annual cost of goods / avg(opening, closing inventory); days = 365 / turnover | Kroger 12.0× (≈30 d, FIFO inventory, merchandise costs incl. advertising/warehousing/transport); Costco 14.1× (≈26 d); Walmart 9.3× (≈39 d) |
| Payables vs inventory (year-end) | accounts payable / inventory | Walmart 107%; Costco 117%; Kroger 111% of FIFO (152% of LIFO as reported) |
| Our Brands share | 39,000 / 147,642 | 26.4% ("roughly a quarter") |
| Walmart U.S. grocery share | 285,482 / 482,975 | 59.1% |
| Costco fees vs operating income | 5,907 / 11,685 | 50.6% ("about half"; *equal to*, not *source of*) |
| 1% of Kroger sales | 0.01 × 147,642 | $1.48B |

## Illustrations (explicitly hypothetical, labelled on screen)
- **10-item basket** ($54.00 price, $41.45 cost, gross margin ≈ 23.2%; store-brand cereal earns more than the national brand in both dollars ($1.40 vs $1.10) and percent (35.9% vs 20.0%)) — assumptions in `fact_check.csv` row HL-BASKET and `src/scenes/ep002/basket.ts`. Tuned to land near Kroger's 22.9%, which the narration says.
- **Pasta case timing** (arrives day 1, sells within 3 weeks, invoice due day 30) — no real payment terms claimed.
- **Shrink arithmetic** — at a hypothetical 2% operating margin, $1 of loss needs ≈ $50 of sales (1/0.02).

## Figures shown on screen but not spoken (same sources, checked)
| On screen | Scene | Source / method |
|---|---|---|
| "2,697 at fiscal year-end · one square = one store" (2,697 squares drawn) | s01 | Kroger 10-K, Item 2 Properties |
| Operating profit $1,890M on sales $147,642M | s01, s02 | Kroger 10-K, Consolidated Statements of Operations |
| "$1.9B … operating profit = 1.28%"; FY2024 2.62% bar | s02 | Kroger 10-K MD&A |
| "$2.5B charge … impairment and related charges tied to its automated fulfillment network" | s02 | Kroger 10-K: "$2.5 billion of fulfillment network impairment and related charges"; closures of three "automated fulfillment" facilities |
| "1% × $147.6B = $1.48B" | s02 | calculation (calculations.json `one_pct_of_sales_musd` = 1,476) |
| Walmart "$706B net sales", "$29.8B", "4.2%" | s02 | Walmart 10-K FY2026: net sales $706,413M, operating income $29,825M |
| Waterfall rows $100.00 / −$77.14 / $22.86 / −$21.58 / $1.28 / −$0.59 / $0.69 | s03 | calculations.json `kroger_per_100` |
| Turnover counters 14.1× / 12.0× / 9.3× (animated count-up) | s05 | calculations.json `turnover` |
| Scales: Walmart $63.1B vs $58.9B (107%), Costco $22.6B vs $19.3B (117%), Kroger $10.5B vs $9.4B FIFO (111%) | s06 | 10-K balance sheets at fiscal year-end; calculations.json `payables_vs_inventory_pct` |
| "9 days holding the cash" | s06 | hypothetical pasta example: sold out by day 21, invoice paid day 30 |
| Kroger "$39B+", "13,000+" | s07 | Kroger 10-K Item 1 ("over $39 billion"; "over 13,000 private label items") |
| "≈ 1/4 … 26.4%" (lower bound) | s07 | 39,000 / 147,642 |
| Costco quotes "prices that are generally lower than national brands", "generally earn higher margins" | s07 | Costco 10-K FY2026 Item 1 (verbatim) |
| National vs store brand split bars | s07 | conceptual diagram, labelled "bar lengths are not data" |
| "10% … (43 billion pounds) … 2010" | s08 | USDA ERS EIB-121, p. iii/summary |
| "$1 lost ÷ 2¢ … = $50 of sales" | s08 | hypothetical 2% margin, labelled ILLUSTRATIVE |
| Kroger gross margin 22.9% (2025) vs 22.3% (2024); reasons list (pharmacy business sale, sourcing, lower shrink, supply chain, fuel; partly offset) | s08 | Kroger 10-K MD&A "Gross Margin" (verbatim reasons, abbreviated) |
| Walmart U.S. grocery $285.5B of $483.0B (59%); gross profit rate 24.2% | s09 | Walmart 10-K FY2026 segment disclosure and MD&A |
| Costco net sales $297,247M; 11.09%; fees $5,907M; operating income $11,685M; "≈ half (50.6%)" | s09 | Costco 10-K FY2026; calculations.json |
| Kroger 2,250 pharmacies, 1,731 fuel centers; third-party media revenue | s09 | Kroger 10-K Item 1 |
| "$1–3 kept as operating profit" | s10 | Kroger operating margin 1.28% (FY2025) and 2.62% (FY2024) |

## Verification status
- Every company figure was read in the 10-K HTML and cross-checked against SEC XBRL company facts (same values). No figure comes from a press release, a news article or a secondary database.
- The USDA figure is dated (2010 data, published 2014) and is presented as an older estimate, for scale only. The report itself (footnote 11) notes that "some data users have suggested that the total retail-level loss estimates of 10 percent and 43 billion pounds are high" given modern packaging, cold chain and inventory tracking; the video shows this caveat on screen.
- Not independently verifiable here: what any individual store earns on any individual product. The video therefore never states store-level or product-level margins as facts; all such numbers are labelled hypothetical.

## Checked and not used
- Industry-wide shrink percentages (NRF National Retail Security Survey): cover all retail, not grocery specifically → not used.
- Store-level or "national average" grocery margins from trade blogs: no primary methodology → not used.
- Specific loss-leader products of named chains: no primary source → only the general concept is explained.

## Licences of everything in the video
| Element | Licence / status |
|---|---|
| Narration: Kokoro-82M v1.0 (`am_michael`, speed 1.0) via kokoro-onnx 0.6.1 | Apache-2.0 weights / MIT runtime — commercial use OK; synthetic voice, not a clone |
| Music & SFX: `python/music.py` (seed 1001, procedural) | own code/work; Content ID not guaranteed |
| All illustrations and animation (`src/`) | own code; generic unbranded products and store fronts, no real logos |
| Fonts: Space Grotesk, Inter | SIL OFL 1.1 |
| Renderer: Remotion 4.0.300 | Remotion License: free for individuals / companies ≤ 3 employees |
| Company names and figures | factual reference to public SEC filings (nominative use, no logos) |
