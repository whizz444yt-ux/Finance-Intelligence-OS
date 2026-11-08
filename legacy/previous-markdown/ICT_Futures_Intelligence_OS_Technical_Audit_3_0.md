# ICT Futures Intelligence OS 3.0 — Technical Audit & 3.1 Roadmap

**Audit date:** 8 November 2026  
**Scope:** Current 3.0 source project, generated HTML pages, JSON datasets, build scripts, GitHub Actions workflows, and connected GitHub/Vercel/Supabase account state.  
**Purpose:** Record confirmed defects, missing capabilities, SEO issues, integration constraints, and an implementation plan for the next release.

> This is a static source and integration-configuration audit. It is not a live-production penetration test, browser end-to-end certification, external-link availability report, legal opinion, or market-data licensing opinion. The website has not yet been deployed to a public domain, so Search Console indexing and real-user Core Web Vitals cannot yet be measured.

---

## 1. Executive assessment

The current 3.0 codebase is a useful static research MVP. It has a focused futures universe, market profile pages, an ICT Academy, session conversion, an event snapshot, news/source discovery, prediction-market discovery, local risk/journal tools, and static SEO pages.

It is **not yet a fully connected, always-on futures intelligence platform**. The project has no deployed website, no configured Vercel project, no Supabase project/database, no server-side API layer, and no licensed real-time CME/ICE market-data feed. Several data areas currently show links or browser-side API discovery rather than a continuously ingested, stored, normalized and monitored dataset.

### Current account / deployment state

| Service | Observed state | Meaning |
|---|---|---|
| GitHub | Connector connected; public repository `whizz444yt-ux/new.w` exists on `main`, repository size 0 | Repository is empty. The 3.0 source/package has not been pushed or published. |
| Vercel | Connector connected; project list returned no projects | No Vercel project, production environment or deployment exists yet. |
| Supabase | Connector connected; organization exists, project list is empty | No database, Auth, Storage, Realtime, Edge Functions or project-level configuration exists yet. |
| Local project | Static HTML + JSON + Python build scripts + GitHub workflows | Current application is a static frontend, not a backend-powered app. |

### What has passed

The repository's existing validation reported 15 contract families in the 5/4/6 tier split, 21 source-playbook concepts, 76 Academy lesson records, 8 entry models, 13 session windows, 52 curated source destinations, 15 market SEO pages, 76 lesson SEO pages, 92 sitemap URLs, 143 unique main-page HTML IDs and 7/7 unit tests passing.

These checks are useful, but they do not prove live data freshness, public deployment, external link reachability, responsive rendering in real browsers, accessibility, provider uptime or API correctness under production traffic.

### Highest-priority conclusion

The next release should prioritize **(1) domain/deployment correctness, (2) data ingestion and source timestamps, (3) event-calendar correctness, (4) content depth and video verification, and (5) account-backed persistence/security**. Adding more source links before these foundations are fixed will increase the size of the site without making it a more reliable intelligence platform.

---

## 2. Confirmed issues in the current codebase

Severity guide:

- **P0 — Release blocker:** must fix before public launch or any claim of live/always-on service.
- **P1 — High priority:** materially affects trust, usefulness, SEO or repeat use.
- **P2 — Improvement:** important for maturity, usability, scale or operational quality.

### P0 — Deployment and canonical domain are not established

**Finding**

- The GitHub repository exists but is empty.
- No Vercel project is configured.
- No Supabase project/database is configured.
- Both `scripts/build_market_pages.py` and `scripts/build_academy_pages.py` hardcode `https://whizz444yt-ux.github.io/new.w` as the site base URL.
- `robots.txt` and `sitemap.xml` also point to that GitHub Pages URL.
- There is no configurable `SITE_URL` build setting and no domain/environment split.

**Impact**

If the intended host changes to Vercel or a custom domain, canonical URLs, sitemap entries, robots sitemap URL, social links and internal generated links can point at the wrong host. The site also cannot be indexed as a production property until it actually returns public pages.

**Fix**

1. Decide the production hostname before generating SEO pages.
2. Add one required `SITE_URL` configuration (for example, `https://your-final-domain.example`) used by every builder.
3. Generate all canonical tags, Open Graph URLs, sitemap URLs and robots sitemap URL from that same value.
4. Add preview-domain `noindex` handling so preview deployments do not compete with production in search.
5. Push the reviewed source to GitHub, connect the repository to Vercel, deploy a Preview first, verify it, then promote to Production.
6. Verify HTTPS, redirects, 404 behaviour, MIME types and route status before submitting the sitemap.

### P0 — News snapshot is empty at package time

**Finding**

`data/news-snapshot.json` currently has:

- `status: not-yet-fetched`
- `generatedAt: null`
- `lastCheckedAt: null`
- `successfulQueries: 0`
- `articles: []`

The interface correctly displays an empty-state message. The GitHub Actions workflow contains a best-effort hourly GDELT refresh, but it has not begun running because the repository/site has not been published.

**Impact**

A user opening the packaged site sees no headline snapshot. The existence of a scheduled workflow does not mean current headlines are already present or that refresh will happen continuously.

**Fix**

1. Run and inspect the first successful GDELT fetch after deploy.
2. Add source-health metadata: attempted queries, successful queries, result counts, provider errors, latency, retrieval timestamp and stale threshold.
3. Add more official/structured feeds (CFTC, BLS, BEA, EIA, SEC, ECB and Treasury) instead of relying on GDELT as the main data source.
4. Use a server-side collector and persisted normalized records; GDELT remains discovery, not the only newsroom source.
5. Show distinct `publishedAt`, `retrievedAt`, `eventAt` and `dataAsOf` fields.

### P0 — GitHub Actions cannot guarantee a 24/7 collector

**Finding**

The Pages workflow runs an hourly GitHub Actions schedule. GitHub explicitly documents that scheduled workflow runs may be delayed during high load and some queued jobs may be dropped; scheduled jobs run from the default branch, and schedules in public repositories are disabled after 60 days without repository activity. See [GitHub scheduled workflow documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

**Impact**

An hourly schedule is best effort, not a reliable data-service SLA. It is also not a streaming market-data feed.

**Fix**

- Keep GitHub Actions for CI, build, validation, link audits and deployment.
- Move recurring data collection to Vercel Cron or Supabase Cron/Edge Functions, with retry, idempotency, error logging and a stored last-success timestamp.
- Keep one designated scheduler per task; avoid running duplicate GitHub, Vercel and Supabase jobs for the same endpoint.
- Add an admin data-health page with last success, last failure, age, provider and error summary.

### P0 — Calendar filters do not match their labels

**Finding**

In `renderEvents()`, the current `day`, `week` and `month` views calculate an end date using `addEtDays(today, 1/7/30)` and then include events with `e.date <= end`. This includes the start date and the end date. Consequently:

- “Next 24 hours” can include two New York calendar dates and events beyond 24 hours.
- “Next 7 days” can include eight date labels.
- “Next 30 days” can include 31 date labels.

The month option is a 30-day list filter, not a true calendar month grid. Events are sorted by date only, not exact event datetime. `eventIstText()` displays an IST clock but not the IST calendar date, so events crossing midnight in India can be ambiguous.

**Fix**

1. For Next 24 Hours, filter by exact timestamps: `eventDateTime >= now && eventDateTime < now + 24 hours`.
2. For the 7-day view, define the exact start and exclusive end, and label whether the range means rolling 168 hours or New York calendar days.
3. Replace “Next 30 days” with a real month grid or rename it “Next 30 days”.
4. Sort by resolved UTC timestamp, with all-day/date-only events shown separately.
5. Display both ET date/time and IST date/time, including “next day” when appropriate.
6. Store all official event times as timezone-aware ISO timestamps with original timezone and source URL.
7. Preserve date-only events as date-only; do not fabricate a clock time.
8. Add tests for DST changes, midnight rollover, all-day events, holiday shifts, and events exactly on range boundaries.

### P0 — Prediction-market cards are manual refresh, not live streams

**Finding**

- Polymarket and Kalshi fetch functions exist.
- `loadPredictionMarkets()` is bound to the manual refresh button; it is not invoked on initial `init()`.
- The current Polymarket code queries the Gamma events endpoint and renders event/market metadata such as `outcomePrices`, volume and liquidity where present. It does not implement the complete outcome-token workflow for CLOB price history/order-book streaming.
- The Kalshi code queries an open-events REST endpoint. It does not open a WebSocket stream.
- There is no server-side cache, polling scheduler, historical probability storage or API-health record.

**Impact**

The section can be blank until the user presses refresh; provider CORS/network restrictions can prevent browser fetches; the data is not a continuously updated market monitor.

**Fix**

1. Add an initial safe load when the prediction-market tab becomes visible.
2. Add bounded refresh intervals and pause polling when the page is hidden.
3. Prefer a server-side cache/proxy to protect rate limits and avoid browser CORS failures.
4. For Polymarket, use Gamma for discovery, then use the outcome token IDs with the CLOB endpoints for current prices, price history and order-book data. Record timestamps and bid/ask spread.
5. For Kalshi, use the documented public market-data REST/WebSocket endpoints and separate public data from account/trading endpoints.
6. Store snapshots for probability charts and changes over time.
7. Show implied probability only as a quoted market price/estimate, with spread, liquidity, volume and resolution criteria.
8. Never enable trading or wallet actions as part of the read-only research dashboard without a separate security, product and jurisdiction review.

### P0 — “Live” source categories are not equivalent to live integrations

**Finding**

The current site explicitly labels a number of sources as search destinations, external links or official source links. This is appropriate, but the product needs an even clearer distinction between:

- API-connected records,
- scheduled snapshots,
- delayed quotes,
- external search links,
- paywalled publisher links,
- manual/user-added events,
- unavailable provider data.

**Fix**

Use a consistent source status on every data card: `LIVE API`, `SNAPSHOT`, `DELAYED`, `OFFICIAL LINK`, `SEARCH LINK`, `PAYWALL`, `MANUAL`, `STALE`, or `UNAVAILABLE`. Never use the word “live” for a search-result URL or a cached static JSON record.

### P1 — Contract comparison display bug in generated SEO pages

**Finding**

`market-universe.json` stores `compare` as a list. `scripts/build_market_pages.py` renders it with `esc(m['compare'])`, which turns a Python list into a representation similar to `['NQ–ES–YM SMT; compare same expiry ...']` on the standalone contract pages.

**Impact**

The comparison discipline text looks like a programming data structure rather than polished user-facing copy.

**Fix**

Render `', '.join(m.get('compare', []))` (or better, use structured comparison records with related market, rule and caveat). Add a generated-page test that rejects `[`/`]` list artefacts in user-facing copy.

### P1 — CME source links are applied too broadly

**Finding**

The contract page generator adds the CME Volume & Open Interest and CME Expiration Calendar links to every market. DX is an ICE US contract, so a generic CME source destination is not sufficient for DX-specific contract data. Different contracts also have different expiry cycles and rollover methods.

**Fix**

Add source mapping fields per market: `exchangeSpecUrl`, `exchangeHoursUrl`, `volumeOpenInterestUrl`, `expiryCalendarUrl`, `settlementUrl`, `dataProviderUrl`. Use ICE-specific sources for DX and contract-specific exchange resources for each futures family. Store an `asOf`/`lastVerifiedAt` and reviewer/source note on every specification.

### P1 — Contract specifications have not yet been independently verified

**Finding**

The contract universe contains multiplier, tick size, tick value, point value and micro references transcribed from the uploaded PDF. The pages themselves warn users to verify against official exchanges. The static dataset does not currently include a last-verified date and automatic reconciliation status for each value.

**Fix**

Create a contract specification registry with:

- full contract name and root,
- exchange and product family,
- standard and micro symbols,
- contract multiplier/unit,
- minimum tick and tick value,
- point value,
- settlement type,
- active month cycle,
- last trade/first notice dates where relevant,
- trading hours and holiday exceptions,
- official specification URL,
- `lastVerifiedAt`, `verifiedBy`, and `sourceVersion`.

Verify each contract individually with CME or ICE before displaying figures as current. Do not infer margin from contract value; broker/exchange margin varies.

### P1 — Academy lesson content is too concise for a full learning product

**Finding**

The Academy has 76 lessons and 7 learning tracks, but field inspection shows:

- 63 of 76 lessons (82.9%) have no `referenceLinks`.
- All 76 concept-specific `videoSearch` destinations are YouTube search pages rather than verified direct lesson URLs.
- Average definition length is approximately 145 characters.
- Lessons contain an average of approximately 3.6 short procedural steps; the individual step text averages approximately 49 characters. This is a useful outline, but not a full lesson chapter with worked examples and annotated charts.
- The generated standalone lesson pages average about 470 words including repeated navigation/disclaimer content; the core concept-specific explanation is considerably shorter.

**Impact**

A beginner can discover a concept but cannot yet rely on the site as a complete lesson. “Official playlist” links do not prove that a particular video teaches the exact concept.

**Fix**

Give every lesson these fields:

1. Definition and terminology provenance.
2. Prerequisites and level.
3. Exact chart identification rules.
4. Bullish and bearish examples.
5. Entry/confirmation sequence, if the concept is an entry model.
6. Invalidation and stop logic.
7. Target/exit logic, if appropriate.
8. Timeframe/session suitability.
9. Contract-specific application (NQ/ES/GC/FX/CL etc.).
10. Failure cases, common mistakes and counterexamples.
11. Evidence class: source-derived, community convention, supplemental, untested.
12. References with direct citations/links.
13. Verified YouTube mapping, or an explicitly labelled search link if no direct video is verified.
14. Diagram/annotated example, quiz and related lessons.

Add a `videos[]` array with `videoId`, `playlistId`, `channelId`, title, publication date, duration, source/educator type, verification date and reviewer. Keep official ICT material distinct from secondary educators. YouTube Data API playlist items can be queried to map a playlist to actual video IDs; the standard API quota is finite and must be budgeted.

### P1 — ICT taxonomy needs stronger provenance and definition controls

**Finding**

The Academy contains original playbook concepts plus supplemental community terminology. Some terms have multiple competing definitions among educators. The existing source notes help, but the interface should make provenance impossible to miss.

**Fix**

Use four explicit taxonomy labels:

- `PLAYBOOK SOURCE` — content directly derived from the supplied PDF.
- `ICT PRIMARY SOURCE` — verified from an ICT original lesson/transcript/publication.
- `COMMUNITY CONVENTION` — common practitioner interpretation, not a single official standard.
- `SUPPLEMENTAL` — useful adjacent terminology not asserted as original ICT doctrine.

For contested terms, show “definition variants” and attribute each to a named public educator/source. Do not collapse variants into a single canonical definition. Keep strategy performance claims separate from conceptual definitions.

### P1 — Positioning and public-insider sections are link collections, not ingested intelligence

**Finding**

The current positioning module links to CFTC COT, release schedules, public datasets, BPR, CME Volume/Open Interest, SEC EDGAR and Treasury/Fed sources. It does not currently parse, normalize, chart or store those datasets.

**Fix**

Build structured datasets and charts for:

- COT report type, report date, contract, trader category, long, short, spreading, net, weekly change and open interest.
- Historical net positioning, percentile/z-score and changes over 1/4/13 weeks, with caveats about report lag and category definitions.
- Bank Participation Report aggregates by covered contract/category and month.
- CME daily preliminary/final volume and open-interest snapshots by active contract month.
- SEC Form 4 classification: open-market purchase/sale, option exercise, award, tax withholding, indirect ownership and 10b5-1 indication when disclosed.
- SEC 8-K, 10-Q, 10-K, 13F as separate filing types with filing and report dates.

Do not label public company insider filings as futures insider positions or non-public information. Do not infer bullish/bearish direction from every form transaction.

### P1 — Social research pages are searches, not ingested social feeds

**Finding**

X, LinkedIn, Reddit, YouTube, TradingView, Stocktwits, Telegram discovery and Discord discovery are primarily search links/destinations. They are not all platform APIs and do not return complete timelines or full post content. X API is usage-priced. LinkedIn developer content access is permissioned and product-specific.

**Fix**

- Keep search links as a clearly labelled no-cost fallback.
- Add provider-specific OAuth/API integrations only where available and terms permit.
- Curate public analyst/educator accounts separately from unverified crowd posts.
- Store post ID, author, platform, published time, retrieved time, topic, contract, engagement metadata and original URL only where API terms permit.
- Respect access controls, content licensing, takedown rules and platform rate limits.
- Do not scrape private accounts, private groups, private Discord/Telegram channels or content behind access controls.

### P1 — Calendar is a small snapshot, not an authoritative event service

**Finding**

The calendar includes 12 hardcoded dated records and official links. It is not yet populated dynamically from each issuer's schedule. Some events use “see official release”, “all day” or a non-ET time, so there is no exact countdown. The calendar has local reminders and ICS export, but no server push/email notification or Google Calendar account sync.

**Fix**

Create normalized event types with:

- source institution,
- event ID and source URL,
- event name/category,
- event start/end timestamp,
- original timezone,
- ET and IST render values,
- importance/impact with methodology,
- prior/forecast/actual and units (when licensed/available),
- related contract families,
- publication/retrieval timestamps,
- schedule revision/cancellation status.

Use separate provider adapters for BLS, BEA, Federal Reserve, EIA, ECB, Bank of England, Bank of Japan, RBA, Bank of Canada, Treasury auctions and CFTC COT release schedules. Build alerts via web push/email and optionally user-authorized Google/Outlook calendar sync.

### P1 — Risk calculator outputs need net/gross labels and stronger assumptions

**Finding**

The calculator uses static contract tick values from the PDF and includes fees/slippage in the estimated per-contract risk calculation. The displayed target reward is currently gross (`rewardTicks × tickValue × contracts`) and does not subtract equivalent exit costs. Commission semantics (round-turn or per-side) and slippage semantics need clearer definitions. It does not verify a selected active expiry or use broker margin schedules.

**Fix**

1. Label results as `estimated gross target` and `estimated net target`.
2. Define commission as per-side or round-turn and apply it consistently.
3. Model entry and exit slippage separately, including stop-fill slippage.
4. Show estimated risk, target gross, target net, R multiple before/after costs and contract quantity rounded down.
5. Warn when one contract exceeds risk budget.
6. Add exchange tick/point validation and dated specification source.
7. Add expiry selector; avoid relying on continuous-contract chart prices for exact trade calculation.
8. Add daily loss cap, maximum drawdown, correlated exposure and margin input as user/broker-supplied data.

### P1 — Daily Intelligence Brief is a deterministic snapshot summary, not an AI analyst or forecast

**Finding**

The current brief uses packaged source snapshot and contract context. It does not perform a full source-backed synthesis across all providers, nor calculate a price forecast, probability or signal.

**Fix**

If an AI brief is added, it should cite every source, show publication/retrieval time, separate fact from interpretation, present conflicting evidence and label unavailable data. Do not publish unverified directional predictions or automatic trade recommendations as fact.

### P2 — User state is browser-local only

**Finding**

Journal, checklist, personal calendar reminders, lesson completion and theme preferences use `localStorage`. They do not sync across devices and can be lost when browser storage is cleared.

**Fix**

After Supabase is provisioned, add Auth, RLS-protected user profiles, journal entries, watchlists, custom events, lesson progress, alerts and settings. Retain local-only mode as a useful demo/offline fallback. Add JSON/CSV export and account deletion/export flows.

### P2 — Main page is a large monolithic static bundle

**Finding**

The site is a single large HTML/JavaScript application with embedded data. This is simple to publish but makes tests, API adapters, routing, long-term maintenance, content updates and code ownership more difficult.

**Fix**

For the next production architecture, use Astro static generation or a Vite-based component frontend for public SEO pages, plus Vercel Functions/Edge Functions as API facade. Use React/Next.js only if account-heavy app functionality or server rendering justifies it. Split the application into modules (routing, calendar, market data, news, positioning, prediction markets, charts, risk, academy, authentication) and keep source data in schema-validated JSON/TypeScript modules.

### P2 — No complete production security headers or server boundary yet

**Finding**

The static HTML currently has no configurable API proxy, no Supabase Auth and no Vercel function boundary. A Content Security Policy (CSP) and deployed HTTP security headers are not present in the current project configuration. The existing client escapes many inserted values, but third-party API payloads still need strict schema validation and output encoding.

**Fix**

- Add CSP, HSTS (HTTPS only), `X-Content-Type-Options`, `Referrer-Policy`, frame restrictions where compatible with provider embeds, and restrictive permissions policy.
- Keep all secret API keys server-side in Vercel/Supabase secret configuration.
- Use allow-listed providers and paths; validate external URLs before linking/fetching.
- Add rate limiting, request timeouts, retry/backoff, response-size limits and cache controls.
- Apply Supabase RLS on every exposed table and test owner isolation.
- Never expose `service_role` or private API credentials in browser JS or public GitHub.
- Consider separating user-private records from public market data tables/schemas.

### P2 — Test suite is too small for the feature count

**Finding**

The current 7 unit tests cover build, the futures universe and GDELT snapshot parsing/retention. Static validation checks important structure and JavaScript syntax. It does not cover all generated-page links, real browser behaviour, timezone edge cases, calendar range semantics, prediction API responses, Supabase RLS, Vercel routes, accessibility or load/performance.

**Fix**

Add:

- Playwright desktop/mobile tests for navigation, search, contract switching, Academy, calendar, prediction refresh and calculator.
- API adapter tests using recorded fixtures and provider error/429/timeout cases.
- DST tests for US spring-forward/fall-back and IST date rollover.
- Risk math tests for each contract/micro, tick rounding, long/short, fee/slippage and zero-contract cases.
- SEO checks across all 92 generated pages.
- Internal/external link audit as separate reports; distinguish 403/429 from broken links.
- Accessibility checks (keyboard, focus, labels, contrast, screen reader landmarks).
- Supabase RLS tests for cross-user access.
- Build and deployment smoke tests on Preview before Production.
- Dependency and secret scans.

---

## 3. SEO audit and fixes

### Observed SEO facts in current generated pages

Inspection of 92 HTML pages (home + 15 market + 76 Academy) found:

| Check | Current result | Assessment |
|---|---:|---|
| HTML title | Present on all reviewed pages | Good foundation; uniqueness/content relevance still needs review. |
| Meta description | Present on all reviewed pages | Good foundation; should be specific and accurately describe the actual page. |
| Self canonical | 91/92 pages | Homepage is missing a canonical link. Child pages have canonicals. |
| `og:image` | 0/92 | Missing social-preview image across every page. |
| `twitter:image` | 0/92 | Missing social-preview image across every page. |
| JSON-LD | 92/92 | Present, but homepage/market/lesson schema types and properties should be improved. |
| `BreadcrumbList` schema | 0/92 | No structured breadcrumbs. Add consistent breadcrumb UI/schema. |
| Meta keywords | 77 pages | Remove; it is not a meaningful Google ranking field. |
| Sitemap | 92 URLs | Present, but all use hardcoded GitHub Pages host and no `lastmod`. |
| robots.txt | Present | Sitemap points to hardcoded GitHub Pages host. |
| Google Search Console | Not configured/verified | Indexing status cannot be assessed until deployment and property verification. |

Market profile pages average approximately 640 words including repeated layout, footer and navigation text. Academy pages average approximately 470 words including repeated layout/footer. Word count alone is not a Google quality metric. The real concern is that a large share of content is generic or short relative to the search intent, and 63 Academy lessons have no references.

### SEO issue register

| ID | Issue | Resolution |
|---|---|---|
| SEO-01 | Homepage missing self-canonical | Add absolute canonical generated from `SITE_URL`. |
| SEO-02 | Site URL is hardcoded to GitHub Pages | Centralize `SITE_URL`; generate canonical, sitemap, robots and OG URLs from it. |
| SEO-03 | No Open Graph/Twitter image | Create branded 1200×630 social image; set `og:image`, `og:image:alt`, `twitter:image` on all indexable pages. |
| SEO-04 | No breadcrumb UI/schema | Add visible breadcrumbs and valid `BreadcrumbList` JSON-LD to market and Academy pages. |
| SEO-05 | Generic `WebPage` schema on market pages | Add accurate `WebPage` + `BreadcrumbList`; include `Organization`/`WebSite` site-wide. Do not invent authors or dates. |
| SEO-06 | Academy schema is thin | Use `LearningResource` with accurate name, description, educational level, learning resource type, provider only when verified, language and dates only when known. |
| SEO-07 | Academy lessons lack source references | Add direct source citations, attribution and version/evidence metadata for each lesson. |
| SEO-08 | YouTube links are search results | Verify direct videos/playlists and store video ID/playlist ID, channel ID, title, date, duration and verification status. |
| SEO-09 | Contract pages are repetitive | Add genuinely market-specific research: contract mechanics, news catalysts, active/expiry rules, cross-market context, source tables, session rationale and unique examples. |
| SEO-10 | No useful content update metadata | Add `<lastmod>` only when the main page content genuinely changes, not on every deploy. |
| SEO-11 | No Search Console/Bing Webmaster | Verify domain, submit sitemap, inspect index coverage and monitor crawl errors. |
| SEO-12 | No performance baseline | Measure field/lab Core Web Vitals after deploy; target LCP ≤2.5s, INP <200ms, CLS <0.1. |
| SEO-13 | Potential preview/duplicate URLs | Set preview deployments to `noindex`; keep canonical and sitemap on production domain only. |
| SEO-14 | No category/topic hub pages | Add useful pages for Liquidity, Market Structure, FVG, Time & Sessions, Entry Models, COT, Contract Specs, Calendar and Futures Risk. |
| SEO-15 | No content freshness/provenance display | Show `Last reviewed` and source dates on researched lessons/specs; do not claim current when unverified. |

### Recommended SEO URL structure

Use stable, readable paths:

- `/markets/nq/`
- `/markets/es/`
- `/markets/gold/`
- `/markets/crude-oil/`
- `/academy/market-structure/`
- `/academy/fair-value-gap/`
- `/academy/silver-bullet/`
- `/academy/sessions-and-timezones/`
- `/calendar/`
- `/research/cot-positioning/`
- `/research/prediction-markets/`

Redirect old `.html` paths to the clean paths if changing URLs. Do not create multiple indexable copies for the same page or query-string filter state.

### SEO content quality standard

Every market page should answer a unique market-specific search intent. Every Academy page should be a complete lesson rather than a short glossary card. Do not pad pages to an arbitrary word count; provide helpful original content, diagrams, examples, sources and clear limitations.

---

## 4. Data/API integration map

The most useful next step is not to add every available plugin. It is to use a small number of dependable sources, normalize their data and display freshness/provenance consistently.

### No-cost or free-registration data sources worth integrating

| Provider | Potential data | Access / key requirement | Proposed use | Limitation |
|---|---|---|---|---|
| GDELT DOC API | Broad multilingual news discovery | Public endpoint; no standard API key for DOC search | Futures-related news discovery and story clustering | Not a complete Reuters/Bloomberg feed; no guarantee of every story or uptime. |
| CFTC Public Reporting Environment | COT reports and history | CFTC says PRE API tokens are currently not being issued; moderate API use can work without a token | Historical COT charts, net positions, weekly changes | Weekly report based on Tuesday positions; category data, not individual account data. |
| BLS API v1 | CPI, PPI, employment and related official series | No registration; 25 daily queries, 25 series/query | US macro history and actual release data | v2 requires registration and offers higher limits; not a live market-price feed. |
| BLS API v2 | Same, with additional features | Registration key; 500 daily queries, 50 series/query | More useful production BLS data adapter | Key and annual registration renewal requirements apply. |
| BEA API | PCE, GDP, income and expenditure statistics | Free registration; unique UserID | Macro dataset and historical charts | Release schedule/actual values must still use correct vintage and date. |
| EIA Open Data API | Crude oil, petroleum products, natural gas and inventories | Free API key registration | CL/MCL and 6C catalyst dashboard | Throttle requests; provider can temporarily suspend overuse. |
| FRED/ALFRED API | Rates, yields, macro series and vintages | Registered API key required | Macro/yield context and time-series analysis | Historical economic data, not live futures quotes; observe API terms. |
| SEC data.sec.gov | Company submissions and XBRL facts | Public JSON APIs; comply with SEC fair-access policy and clear User-Agent | NQ/ES constituent filing monitor and Form 4 dashboard | Use server-side ingestion; SEC publishes company securities disclosures, not futures positions. |
| ECB SDMX API | Euro-area and European statistics | Public statistical web service | 6E, DX and European macro research | Release timing and units differ by series. |
| New York Fed Markets Data API | Reference rates including SOFR/OBFR and other market series | Public documented API | Rates and liquidity context for NQ/ES/GC/ZN | Not CME order book or futures price feed. |
| US Treasury Fiscal Data | Treasury auctions, debt and fiscal data | Public data API; check individual endpoint rules | ZN/yields/auction calendar context | Some data has scheduled publication timing; not live market depth. |
| Polymarket Gamma API | Events, markets and metadata | Public endpoint documented without selected authentication | Prediction-market discovery | For better current prices/history/order books, map markets to outcome token IDs and query CLOB endpoints. |
| Polymarket CLOB | Prices, order books and market data | Public market data endpoints; trading/wallet flow is separate | Prediction-market charts and liquidity | Do not add wallet/trading actions in this research product without separate security/jurisdiction work. |
| Kalshi market data API | Open markets, order books and market statistics | Public information is available; authenticated account functions are separate | Macro-event prediction markets | Use documented public endpoints and WebSocket where appropriate; respect rate limits. |
| YouTube Data API | Playlists, playlist items, video metadata | API key and finite quota; playlistItems list currently costs 1 unit | Verified ICT lesson/video mapping | Search and video metadata quotas are finite; storing/embedding video must follow YouTube policies. |

### Services that are not unrestricted free data sources

| Provider | Practical approach |
|---|---|
| CME/ICE futures quotes | Use provider links or exchange-authorized/licensed distribution. CME website futures quotes are delayed at least 10 minutes; full real-time/streaming/order-book data is a separate data product. |
| X | Use public search links for a no-cost MVP; API reading is usage-priced, currently shown by X as per-resource pricing. |
| LinkedIn | Use public links/search and curated organization pages; broad community-content API access is not unrestricted and depends on product permissions/approval. |
| Reuters/Bloomberg | Link out or use licensed subscriptions/API contracts; do not copy/paywall-bypass content. |
| TradingView | Use approved chart widgets/direct chart links. Do not treat a free embed as a licensed raw OHLC/DOM feed. |
| Discord/Telegram | Only official/public content and permitted APIs. Do not ingest private groups, gated messages or personal data without authorization. |

### Recommended normalized data model

Every ingested record should have common provenance fields:

```json
{
  "id": "provider-specific-stable-id",
  "provider": "CFTC",
  "dataType": "cot-position",
  "marketIds": ["nq"],
  "publishedAt": "ISO-8601 timestamp or null",
  "eventAt": "ISO-8601 timestamp or null",
  "retrievedAt": "ISO-8601 timestamp",
  "dataAsOf": "ISO-8601 timestamp or date",
  "sourceUrl": "https://official-source.example/record",
  "accessType": "official-api",
  "freshnessStatus": "fresh|delayed|stale|unavailable",
  "licenseNote": "provider terms / redistribution status",
  "rawPayloadHash": "sha256:..."
}
```

Do not mix a publisher timestamp with retrieval time or event time. Deduplicate using provider record IDs or stable content hashes. Keep the original source URL and preserve the source's units/definitions.

### Recommended refresh schedule (initial proposal)

| Data family | Initial refresh cadence | Reason |
|---|---|---|
| GDELT discovery | 15–60 minutes | Broad discovery feed; do not hammer the endpoint. |
| Polymarket metadata/prices | 1–5 minutes for watched events; slower for broad discovery | Use rate-limited cache; WebSocket for supported real-time views. |
| Kalshi market data | WebSocket for watched market updates; REST snapshots periodically | Avoid polling every market continuously. |
| BLS/BEA/Fed/ECB/BoE/RBA/BoJ/BoC calendars | Daily and on source schedule changes | Events do not need second-by-second polling. |
| BLS/BEA/EIA releases | Trigger around known release windows plus daily verification | Fetch actuals only after issuer publication. |
| CFTC COT | Weekly after release; retain historical series | Weekly dataset with known reporting lag. |
| CFTC BPR | Monthly after publication | Monthly aggregate report. |
| SEC filings | Poll company-specific submissions on a modest cadence; ingest newly filed records | Avoid unnecessary full-market polling. |
| CME preliminary/final OI | According to exchange report publication | Show preliminary vs final state. |
| Contract specs/expiry | Daily or weekly plus change detection | Contract changes are rare but financially material. |
| Exchange real-time prices/order book | Provider stream / licensed feed | Must reflect the subscription's entitlement and delay. |

These are proposed operating intervals, not provider guarantees. They should be tuned against rate limits, fees, terms and freshness needs.

---

## 5. GitHub, Vercel and Supabase — recommended responsibility split

### GitHub — source control and CI, not the live data server

Use GitHub for:

- Private/public source repository and version history.
- Pull requests and code review.
- Unit tests, type checks, security scans and builds.
- Preview checks and deployment-triggered workflow.
- Scheduled non-critical reports/link audit where best-effort is acceptable.

Do not rely on GitHub Actions as the only always-on scheduler. Scheduled workflows can be delayed or dropped during high load and public-repo schedules can turn off after 60 days of inactivity.

### Vercel — website host and serverless API layer

Provision a Vercel project connected to the GitHub repository. Recommended responsibilities:

- Host the public static/SSG pages and production web app.
- Provide server-side API routes for provider proxying and secrets.
- Provide Cron endpoints for scheduled ingestion if the selected plan and workload support it.
- Manage Preview and Production environments separately.
- Keep API secrets in environment variables.
- Add deployment logs, error tracking and rollback procedures.

Vercel Cron is configured through `vercel.json` and calls a production endpoint using HTTP GET. It is more suitable for application-level scheduled routes than trying to implement an always-on process in static HTML. Verify the plan and function execution limits for the final project.

### Supabase — user data and application database

Provision a Supabase project after choosing the region and cost plan. Recommended tables:

**Public/market data:** `contracts`, `contract_specs`, `economic_events`, `news_items`, `cot_positions`, `bpr_reports`, `open_interest`, `prediction_markets`, `prediction_snapshots`, `provider_status`, `source_registry`, `lesson_content`, `lesson_videos`.

**User-owned data:** `profiles`, `watchlists`, `watchlist_items`, `journal_trades`, `journal_attachments`, `custom_events`, `alert_rules`, `lesson_progress`, `user_preferences`.

Enable RLS on all exposed tables. Every user-owned row must be filtered by `auth.uid()` ownership; `TO authenticated` alone is not ownership authorization. Use server-side secrets only in Edge Functions/Vercel Functions. Never publish the Supabase `service_role`/secret key. Avoid public views that bypass RLS; use secure-invoker patterns where relevant.

Supabase Free is useful for prototypes, but its current documentation says Free projects can pause after a week of low activity; plan limits and backup/uptime terms should be reviewed before users rely on it for always-on service. Production use should budget for a paid plan and verified backups.

### Use one scheduler, not three competing schedulers

Recommended first design:

- GitHub Actions: CI/build/test/deploy only.
- Vercel Cron: scheduled source-ingestion HTTP endpoints.
- Supabase: database, Auth, RLS, Realtime and durable storage. Supabase Cron may be used instead of Vercel Cron if database-side scheduling is preferred, but not for the same job simultaneously.

---

## 6. Recommended ICT Academy and technical education expansion

The product should teach the ICT trading framework and the underlying futures/data/timezone knowledge. A learner should not need external context to understand why the contract specifications, timestamps or data reports matter.

### A. ICT concept curriculum

Maintain explicit provenance groups:

1. Source-derived from the uploaded playbook.
2. Verified original ICT teaching, only after locating a direct source.
3. Community convention / terminology variation.
4. Supplemental adjacent market-structure terminology.

Suggested curriculum categories:

- Market structure: swing highs/lows, BOS, MSS, CHoCH and displacement.
- Liquidity: BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL, session highs/lows, raids, sweeps, runs, internal/external liquidity and opposing liquidity.
- Imbalance: FVG, HTF FVG, CE, IFVG, BPR, volume imbalance, liquidity void and first presented FVG.
- Blocks/arrays: OB, mean threshold, breaker, mitigation, rejection block, Unicorn and PD arrays.
- Range/retracement: dealing range, premium/discount, equilibrium, OTE and extensions.
- Time: Asian range, London/NY killzones, Silver Bullet, midnight open, 8:30/9:30 opens, NDOG/NWOG, CBDR, Flout, weekly open, macros and session ranges.
- Narrative/advanced: AMD/PO3, Judas swing, IPDA 20/40/60, weekly profiles and SMT by market family.
- Entry models: ICT 2022, Silver Bullet, Liquidity Sweep + MSS, Judas + MSS, Unicorn, FVG Continuation, IFVG and FVG+OTE. Keep the conditions/invalidations separate.

### B. Each lesson should contain

- Plain-English definition and a one-sentence summary.
- Terminology origin/provenance label.
- Required prior lessons.
- Step-by-step chart identification procedure.
- Bullish and bearish examples.
- One annotated static diagram and, where allowed, interactive chart example.
- What qualifies and what does not qualify.
- Timeframe/session context.
- Contract-specific notes (NQ, ES, GC, 6E, 6B, CL etc.).
- Entry conditions only when the lesson is an actual model.
- Invalidation and stop/target principles where appropriate.
- Failure cases, common mistakes and counterexamples.
- Evidence and limitations.
- Direct source references.
- Verified ICT original video/playlist or labelled YouTube search.
- Quiz/practice exercise and completion tracking.
- Related lessons.

### C. Futures & market microstructure learning (additional Academy)

These are not ICT concepts, but are foundational skills every futures user should be able to learn:

- Futures contract anatomy: root, expiry month, multiplier, tick, point value.
- Standard vs micro contract differences.
- Tick, pip, point, basis, settlement, first notice and last trade date.
- Contango/backwardation and calendar spreads.
- Continuous futures charts and rollover gaps; why a continuous-series gap is not automatically a tradable FVG.
- Volume, open interest and the difference between them.
- DOM, order book, bid/ask, spread, market/limit/stop orders and slippage.
- Volume Profile, TPO/Market Profile, footprint and delta/CVD (if supported by data access).
- COT report categories and the Tuesday-to-Friday reporting lag.
- Trading sessions, maintenance breaks, exchange holidays and timezone conversion.
- US/EU/UK/Australia/Japan/Canada DST rules and ET↔IST date rollover.

### D. Quantitative and risk education

Add a separate “Quant & Risk Fundamentals” learning track:

- Arithmetic/percentage return, logarithmic return and R-multiple.
- Expectancy, win rate, payoff ratio and profit factor.
- Maximum drawdown, risk of ruin and losing streaks.
- Standard deviation, volatility, ATR and realized volatility.
- Correlation vs causation; rolling correlation and correlation breakdown.
- Regression, beta, z-score and normalization.
- Sample size, confidence intervals and out-of-sample validation.
- Backtest overfitting, look-ahead bias, survivorship bias and data snooping.
- Contract rollover and continuous-series adjustment methods.
- Fees, slippage, spread and realistic fill assumptions.

These topics make the site genuinely educational, beyond just teaching ICT labels.

---

## 7. New features to add

### Priority P0 — foundational release requirements

1. Unified configurable `SITE_URL` and correct canonical/sitemap/robots output.
2. Correct calendar range/timezone handling and a real month grid.
3. Initial/automatic prediction-market loading with safe caching and provider status.
4. Data freshness and source provenance on every data card.
5. Contract spec verification workflow and contract-specific exchange links.
6. Search Console/Bing Webmaster verification after domain deploy.
7. Browser E2E, accessibility and full generated-page link tests.
8. Correct generated market-page comparison text.

### Priority P1 — meaningful intelligence features

1. Full COT history, net-position time series, percentiles and report-date lag labels.
2. Monthly BPR dashboard.
3. CME preliminary vs final Volume/Open Interest by active contract month.
4. SEC Form 4/8-K/10-Q/10-K/13F filing explorer for relevant index constituents.
5. Official issuer calendar adapters and event revision detection.
6. Event actual-vs-consensus where source/licence provides values.
7. Polymarket/Kalshi probability snapshots, history, spread, volume/liquidity and resolution terms.
8. Cross-market correlation matrix (20/60/120-day windows) and relative-strength dashboard.
9. Verified YouTube lesson/playlist IDs, durations and source attribution.
10. Annotated ICT chart examples, lesson quizzes and saved progress.
11. Daily and weekly source-backed intelligence brief with citations and conflict/uncertainty section.
12. Watchlists, push/email alerts and calendar sync.
13. Cloud journal sync with data export and account deletion.
14. Data-status monitor and provider outage/stale alerts.

### Priority P2 — advanced platform features

1. Licensed real-time quote and trade feed for CME/ICE instruments.
2. DOM/order book, footprint and market depth, if licence and provider support it.
3. Historical intraday data and robust backtesting engine.
4. Paper-trading simulator and trade replay.
5. Strategy statistics by contract/session/model from real user or licensed historical data.
6. Volatility/event studies and news-to-price reaction analysis.
7. AI-assisted research summarization with source citation and fact/opinion split.
8. Multi-user roles, paid tiers and admin content review, if the product is commercialized.

---

## 8. Plugin and connected-tool recommendations

The important distinction is that a ChatGPT plugin/connector lets ChatGPT interact with a service during a conversation; it does **not** automatically expose that service as an API to the deployed public website. The website needs its own credentials, API permissions, server-side integration, data model and deployment.

### Existing connected services

| Tool | Recommended role | Current provisioning state |
|---|---|---|
| GitHub | Repository, versioning, CI, tests and deploy trigger | Connected; target repository currently empty. |
| Vercel | Production hosting, preview deployments, serverless APIs, cron and logs | Connected; no project configured. |
| Supabase | Postgres, Auth, RLS, storage, realtime and scheduled database operations | Connected; no project configured. |

### Additional tools/services worth considering

| Service / category | Why useful | Important caveat |
|---|---|---|
| Google Calendar API / calendar connector | User-specific event sync and reminders | Requires user authorization; do not confuse personal calendar sync with public economic-event ingestion. |
| Email/push provider | Alerts for selected contract events and source health | Requires consent, unsubscribe and deliverability handling. |
| Error monitoring (Sentry or equivalent) | Frontend/backend error alerts | Store no secrets or unnecessary personal information in logs. |
| Uptime monitoring | Detect whether public site and API routes respond | Uptime monitor does not guarantee the upstream data provider works. |
| Redis/cache (for example, managed Redis/Upstash) | API caching, rate limiting and deduplication | Check free limits, request quotas and cost at volume. |
| Market-data vendor / licensed CME distributor | Live quotes, historical OHLCV, order book | Real-time exchange rights and redistribution may require separate licence/fees. |
| News provider | Structured headlines and search | Commercial rights and redistribution terms vary. |

ChatGPT finance connectors (for example financial data/research tools) can assist with research inside ChatGPT, but do not automatically become website APIs. Only integrate a provider into the website when a documented external API and appropriate rights exist.

---

## 9. Proposed technical architecture

```text
Public browser / static SEO pages
          |
          v
Vercel-hosted frontend (Astro/Vite or current static app)
          |
          v
Server-side API facade (Vercel Functions / Edge Functions)
          |
          +--> Provider adapters
          |      - GDELT
          |      - CFTC
          |      - BLS / BEA / EIA / FRED / ECB / Fed / Treasury
          |      - SEC
          |      - Polymarket / Kalshi
          |      - YouTube
          |      - Licensed CME / ICE vendor (later)
          |
          v
Normalized public-data store (Supabase Postgres)
          |
          +--> Public snapshots / cached time series
          +--> Provider health / freshness
          +--> Source / license / attribution registry
          |
          v
Supabase Auth + RLS-protected user data
          - Watchlists
          - Journal
          - Lesson progress
          - Alerts
          - Personal events / preferences
```

### Operational rules

- All secret keys stay server-side.
- Public API data and user-private data are separated.
- RLS is enabled and tested for user-owned records.
- Provider adapters use retries with exponential backoff, timeouts, rate limits and circuit breakers.
- Store raw source timestamps and retrieval timestamps separately.
- Cache data based on its expected publication rate.
- Every dataset gets a provider health state and last successful ingestion timestamp.
- Stale data is visible as stale; never silently reuse old data while labelling it current.
- API failure should degrade to clear source links, not fabricated fallback values.
- Keep licence metadata and allowed redistribution scope per provider/data type.

---

## 10. Release plan: 3.1 to 4.0

| Phase | Main work | Exit criteria |
|---|---|---|
| 3.1 — Correctness & SEO | Fix calendar range bug, comparison display, SITE_URL, canonical, OG images, sitemap/robots, exchange source mapping | All generated pages validated; exact calendar tests pass; preview domain verified. |
| 3.2 — Backend foundation | Provision Vercel/Supabase, schema, Auth, RLS, API secrets, logging and provider health | User-owned data isolation passes; secrets absent from client bundle; staging endpoints work. |
| 3.3 — Official data ingestion | CFTC, BLS, BEA, EIA, FRED, SEC, ECB, Treasury and GDELT adapters | Ingestion timestamps, source links, error/retry handling and historical records verified. |
| 3.4 — Institutional & prediction data | COT/BPR/OI history; Polymarket CLOB and Kalshi market data snapshots | Charts display valid as-of time, definitions, source and data-quality caveat. |
| 3.5 — ICT Academy depth | Expand source references, diagrams, examples, quizzes, concept video mappings | Each lesson passes editorial checklist; direct video links are verified or labelled as searches. |
| 3.6 — User experience | Watchlists, alerts, cloud journal, lesson progress and calendar sync | Multi-device sync and user privacy tests pass. |
| 4.0 — Advanced trading data | Licensed futures quotes, order flow, replay, quantitative studies and AI-assisted briefing | Exchange/data rights obtained; realistic performance and latency tests pass. |

### Release gate

Do not label the service “24/7 live” until production monitoring demonstrates the actual uptime and each provider integration publishes a recent `lastSuccessfulAt`/`dataAsOf` state. A website that remains accessible 24/7 is not the same as every data source updating 24/7.

---

## 11. Final priority list

### Fix first (before public SEO launch)

- [ ] Choose final production domain and centralize `SITE_URL`.
- [ ] Fix inclusive event-window logic and ET/IST calendar date rollover.
- [ ] Fix generated `compare` list output.
- [ ] Add exchange-specific source links (especially ICE DX).
- [ ] Verify all 15 contract specs and date-stamp them.
- [ ] Add homepage canonical, `og:image`, `twitter:image`, breadcrumbs and corrected sitemap URLs.
- [ ] Add production domain verification and Search Console/Bing Webmaster.
- [ ] Run generated-page checks, Playwright, accessibility and API smoke tests.

### Build next (to make the site an intelligence platform)

- [ ] Provision Vercel project.
- [ ] Provision Supabase project and secure schema/RLS.
- [ ] Build server-side provider adapters and normalized ingestion.
- [ ] Populate official economic-event schedule with revisions/holiday exceptions.
- [ ] Ingest COT/BPR/OI/SEC records.
- [ ] Improve prediction market price/order book/history snapshots.
- [ ] Add verified ICT YouTube video/playlist mappings and full lessons.
- [ ] Add social/news API integrations only where permissions and economics are acceptable.
- [ ] Add source health monitor and alerting.

### Add later (advanced product)

- [ ] Licensed real-time CME/ICE data.
- [ ] DOM/footprint/order-flow module.
- [ ] Paper trading and historical replay.
- [ ] Backtesting with realistic fees/slippage/rollover.
- [ ] AI daily/weekly brief with cited facts and uncertainty.
- [ ] User accounts, synced workspace and notification settings.

---

## 12. Official documentation references

- GitHub Actions schedule behaviour: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- Vercel Cron configuration: https://vercel.com/docs/project-configuration/vercel-json
- Supabase free-project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase pricing: https://supabase.com/pricing
- Google canonical URL guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google title-link guidance: https://developers.google.com/search/docs/appearance/title-link
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- BLS API FAQ: https://www.bls.gov/developers/api_faqs.htm
- BEA API docs: https://apps.bea.gov/API/docs/
- EIA API docs: https://www.eia.gov/opendata/documentation.php
- FRED API overview and terms: https://fred.stlouisfed.org/docs/api/fred/overview.html and https://fred.stlouisfed.org/docs/api/terms_of_use.html
- SEC developer resources: https://www.sec.gov/about/developer-resources
- CFTC COT/PRE: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
- Polymarket Gamma API reference: https://gamma-api.polymarket.com/docs
- Kalshi public API information: https://help.kalshi.com/en/articles/13823854-kalshi-api and https://docs.kalshi.com/
- YouTube Data API: https://developers.google.com/youtube/data/getting-started
- X Developer Platform pricing: https://developer.x.com/
- LinkedIn Community Management API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api-migration-guide
- CME delayed-quote explanation: https://www.cmegroup.com/trading/about-quotes.html
- CME Data Services: https://dataservices.cmegroup.com/pages/home

---

**Audit conclusion:** 3.0 is a good static research MVP, but not yet a production live-data terminal. The best path is to make it correct, indexable, source-traceable and backend-enabled first. Then add the licensed market-data and advanced order-flow capabilities only when their cost and redistribution rights are clear.
