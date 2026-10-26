# Sources: Episode 001 "Who Really Pays for Free Returns?"

Accessed 2026-10-26. Exact quotes and claim mapping: `fact_check.csv` and `claims.json`.

## Primary data

### 1. NRF & Happy Returns: *2025 Retail Returns Landscape* (Oct 15, 2025)
- Page: https://cdn.nrf.com/research/2025-retail-returns-landscape · full PDF read: https://a-us.storyblok.com/f/1021220/x/6e22cae2b7/2025-retail-returns-landscape.pdf
- Press release: https://cdn.nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025
- **Summary:** U.S. retailers expect 15.8 % of 2025 sales to be returned ($849.9B of merchandise, projected), 19.3 % for online sales; 82 % of consumers rate free returns as important; 72 % of merchants started charging for at least one return option; ~9 % of returns estimated fraudulent by retailers that track it; restock time 6–10 days for about half of retailers.
- **Method:** two surveys fielded Aug–Sep 2025: 2,006 U.S. consumers who had returned an online purchase in the past 12 months; 358 e-commerce professionals at U.S. merchants with $500M+ revenue.
- **Reliability:** industry association + a returns-services vendor (Happy Returns, owned by UPS): **commercial interest in the topic**. Projections and self-reported data, not audited. The $849.9B is the *value of returned merchandise*, not the cost of processing returns (the report's chart header says "Total cost of retail returns"; we do not use that wording).
- **Is there something newer?** A search on 2026-10-26 found no 2026 edition, so the 2025 figures are used and always labelled as 2025 projections. If NRF publishes a 2026 report, update `claims.json` C02–C06/C09/C10/C12 and rerun.

### 2. Rogers, Davletshin, Rogers, Chen, Korde & Greve (2025), *Journal of Business Logistics*: doi:10.1111/jbl.70014
- **Summary:** network analysis of a large U.S. reverse-logistics platform's longitudinal data; abstract notes **over $800B of returned and excess inventory** flowing through secondary-market channels each year (≈3 % of U.S. GDP).
- **Reliability:** peer-reviewed. Publisher page returned HTTP 403 to our fetcher; the abstract was read via the Crossref API. Only the abstract's context figure is used, and we say it includes excess inventory.

### 3. Janakiraman, Syrdal & Freling (2016), *Journal of Retailing*: doi:10.1016/j.jretai.2015.11.002 *(independent study requested by the brief)*
- **Summary:** meta-analysis of 21 studies: lenient return policies increase purchases; they also increase returns, but by a smaller amount.
- **Date / sample:** published 2016; 21 studies across economics, marketing, operations and psychology.
- **Conflicts of interest:** academic work (UT Arlington / UT Dallas); no commercial sponsor identified.
- **Reliability:** full text paywalled; we read the university news summary (https://news.utdallas.edu/?p=11491) and bibliographic metadata, so we only claim the **direction** of the effects, not their size.

### 4. European Environment Agency (Mar 4, 2024): *The destruction of returned and unsold textiles in Europe's circular economy*
- https://www.eea.europa.eu/en/analysis/publications/the-destruction-of-returned-and-unsold-textiles-in-europes-circular-economy
- **Summary:** estimates 22–43 % of returned clothing bought online in Europe ends up destroyed; 4–9 % of textile products put on the EU market are destroyed before use.
- **Reliability:** public agency; explicitly says data are scarce and the estimate may be low. **Europe and textiles only**: never extrapolated to the U.S. or other products.

### 5. European Commission (Feb 11, 2026): ESPR ban on destroying unsold apparel and footwear
- https://circulareconomy.europa.eu/platform/en/news-and-events/all-news/new-eu-rules-stop-destruction-unsold-clothes-and-shoes
- **Summary:** under Regulation (EU) 2024/1781 (ESPR), large companies may not destroy unsold apparel, clothing accessories and footwear from 19 July 2026; derogations (e.g. safety, damage); medium-sized companies expected from 2030.
- **Reliability:** official source. The delegated act's text was not checked line by line; the script stays at the summary level.

## Company statements (attributed, not treated as independent verification)

### 6. Amazon: "What happens to Amazon returns"
- https://www.aboutamazon.com/news/retail/what-happens-to-amazon-returns
- Says "the vast majority of returns are resold as new or used"; others go to Amazon Resale, liquidation, donation (Good360) or recycling. Undated page. Used only as **Amazon's own account** and flagged as not describing all retailers.

### 7. Amazon Seller Central: FBA returns processing fees
- e.g. https://sellercentral.amazon.com/seller-forums/discussions/t/4ba71c53-681d-49e8-ab4d-5a533b0072af
- Announcements (2024–2025) of a returns processing fee for FBA products above category return-rate thresholds, plus per-unit fees for apparel and shoes. The official fee pages require a login; **no amounts are used**, and the script says the rules vary and change.

## Checked but not used
- Secondary blogs on FBA fee thresholds (inconsistent with each other about apparel/shoes): not used as sources.
- Per-return cost averages from vendor marketing: excluded (unclear methodology); the episode uses a labelled illustrative example instead.
