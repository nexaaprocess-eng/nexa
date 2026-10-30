# Sources & fact check — Episode 003 "Why Every App Wants a Subscription"

Accessed 2026-10-28. Claim-by-claim mapping (with narration segment IDs and verbatim excerpts): `claims.json`, `fact_check.csv`, rendered as a table in `fact_check.md`. Derived numbers: `calculations.py` → `calculations.json`.

## Three different kinds of "subscription" (kept apart in the script)
| Kind | Example in the video | Data used |
|---|---|---|
| **App-store subscription apps** (auto-renewing in-app subscriptions on iOS / Google Play) | the hypothetical $10 app; RevenueCat data | RevenueCat *State of Subscription Apps 2026*; Apple developer terms |
| **Streaming services** | Spotify | Spotify Form 20-F 2025 — explicitly called "a streaming service rather than a typical app" |
| **Business / enterprise software** (licences, support contracts, SaaS) | Oracle support contracts; Adobe (mostly creative and document software, also enterprise) | Oracle and Adobe Forms 10-K |

No number from one group is used to describe another.

## Primary sources
1. **RevenueCat, *State of Subscription Apps 2026*** — https://www.revenuecat.com/state-of-subscription-apps
   - **Scope.** 115,000+ apps, $16B+ in revenue, 1B+ transactions. Metrics target calendar 2025, with older cohorts used where needed.
   - **Population limits.** Only apps integrated with RevenueCat and above a minimum install or revenue threshold, so this is **not** all apps. Launch and cohort charts come from Appfigures.
   - **Figures used:**
     - launches ~2,000/month (Jan 2022) → 14,700+/month (Jan 2026);
     - median monthly revenue one year after launch ~$72; top 10% above $2,574;
     - 4.6% of new apps reach $10K monthly revenue within two years;
     - apps launched before 2020 = 69% of subscription revenue;
     - median one-year retention (2024 cohort): monthly 8%, yearly 28%;
     - nearly half of monthly subscribers do not renew once;
     - hard paywall 10.7% vs freemium 2.1% download-to-paid by day 35, with nearly identical year-one retention;
     - 23.2% of apps combine subscriptions with lifetime purchases;
     - involuntary billing failures 31% of cancellations on Google Play vs 14% on the App Store;
     - AI-powered apps +41% revenue per payer, churn ~30% faster.
   - **Retention is defined by RevenueCat as a *subscription-level* metric, not a user-level one.** The narration says so explicitly ("subscriptions, not people… payments, not use").
   - **Vendor report.** RevenueCat sells subscription infrastructure. Its data are used for distributions within its customer base, not as a census.
2. **Adobe, Form 10-K FY2013** — https://www.sec.gov/Archives/edgar/data/796343/000079634314000004/adbe10kfy13.htm
   - "In May 2013 we announced we would exclusively deliver new creative product innovations and features to Creative Cloud subscribers, and that Adobe Creative Suite 6 ("CS6")… would be the last major update we provide for perpetual licensees."
3. **Adobe, Form 10-K FY2014** — https://www.sec.gov/Archives/edgar/data/796343/000079634315000022/adbe10kfy14.htm
   - Subscription share of revenue: 15% (FY2012), 28% (FY2013), 50% (FY2014).
   - Total revenue: $4,403.7M, $4,055.2M, $4,147.1M.
   - Net income: $832.8M, $290.0M, $268.4M.
4. **Adobe, Form 10-K FY2025** — https://www.sec.gov/Archives/edgar/data/796343/000079634326000003/adbe-20251128.htm
   - Total revenue $23,769M, of which subscription $22,904M (96%).
   - "We also license perpetual versions of certain products…"
5. **Oracle, Form 10-K FY2026** — https://www.sec.gov/Archives/edgar/data/1341439/000119312526277521/orcl-20260531.htm
   - "Substantially all of our customers elect to purchase and renew their software support contracts annually."
6. **Apple, Auto-renewable subscriptions (developer documentation)** — https://developer.apple.com/app-store/subscriptions/
   - 70% to the developer in a subscriber's first year, 85% after one year of paid service.
   - 85% from the start for App Store Small Business Program members.
   - Terms can change; they were checked on the access date.
7. **U.S. FTC, press release, Sept 25, 2025** — https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-secures-historic-25-billion-settlement-against-amazon
   - $2.5B settlement: $1B civil penalty plus $1.5B in refunds.
   - The FTC alleged Prime enrollment without consent and a difficult cancellation process.
   - Narrated as "claims" settled, not as proven facts.
8. **Spotify Technology S.A., Form 20-F 2025** — https://www.sec.gov/Archives/edgar/data/1639920/000162828026006874/ck0001639920-20251231.htm
   - 290M Premium Subscribers at Dec 31, 2025; revenue €17,186M; cost of revenue €11,690M.
   - "Cost of revenue consists predominantly of royalty and distribution costs related to content streaming."
   - Consolidated gross margin 32%.
   - Operating income €2,198M (2025), €1,365M (2024), −€446M (2023).

## Calculations (Hidden Ledger)
| Narration / screen | Formula | Result |
|---|---|---|
| Adobe revenue FY2012→FY2013 | 4,055.2 / 4,403.7 − 1 | −7.9% ("about 8 percent") |
| Adobe net income FY2012→FY2013 | 290.0 / 832.8 − 1 | −65% (on screen) |
| Adobe subscription share FY2025 | 22,904 / 23,769 | 96.4% |
| Spotify cost of revenue share 2025 | 11,690 / 17,186 | 68% ("most of that money") |

## Hypothetical examples (labelled on screen and in narration)
- **Subscription bundle**
  - Prices: $11.99 + $15.49 + $2.99 + $12.99 + $9.99 + $20.00 = $73.45 a month.
  - Totals: $881.40 a year, $2.41 a day.
  - These are generic categories, not real services or price lists.
- **Two companies**
  - $120 once vs $10 a month, with 1,000 customers.
  - Month one: $120,000 vs $10,000; after 12 months with no cancellations, both reach $120,000.
- **Unit economics**
  - $10 a month; the developer keeps $7 (Apple's first-year 70%).
  - Expected lifetime ≈ 1 / monthly churn: 10% churn gives about 10 months, worth about $70; 20% churn gives about 5 months, worth about $35.
  - Acquisition cost is $40.
  - This is a simplification: constant churn, revenue before other costs, Apple's year-two rate ignored.

## Checked and not used
- The share of people who "forget" subscriptions: no primary data with a clear method was found, so it was not claimed.
- Average household spending on subscriptions: estimates vary widely by survey method and population, so it was not used. The opening bundle is explicitly hypothetical.
- Some RevenueCat figures conflict internally, so they were not used:
  - IN/SEA download-to-paid appears as 1.4% vs 0.7%;
  - the monthly price median appears as flat at $10 vs $7→$8;
  - plan mix by category, where productivity appears as both 77% monthly and 77% yearly.
- The claim that customer acquisition costs are "rising" across all apps: no primary series was found. It was rewritten as reasoning ("with thousands of new apps every month…").
- Microsoft Office one-time purchase: the official page was unavailable at check time (HTTP 503). Adobe's own statement about perpetual licences was used instead.

## Licences of everything in the video
| Element | Licence / status |
|---|---|
| Narration: Kokoro-82M v1.0 (`am_michael`, speed 1.0) via kokoro-onnx 0.6.1 | Apache-2.0 weights / MIT runtime. Commercial use OK. Synthetic voice, not a clone. |
| Music & SFX: `python/music.py` (seed 1001, procedural) | Own code and work. Content ID not guaranteed. |
| Illustrations, fictional app interfaces, animation (`src/`) | Own code. Fictional app names, no real logos or UI copies. |
| Fonts: Space Grotesk, Inter | SIL OFL 1.1 |
| Renderer: Remotion 4.0.300 | Remotion License: free for individuals and companies with ≤3 employees |
| Company names and figures | Factual references to public filings and press releases (nominative use, no logos) |
