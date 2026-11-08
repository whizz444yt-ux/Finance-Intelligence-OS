# Finance Intelligence OS — Complete Master Requirements & Build Specification

**Version:** 1.0 — Master consolidation with ICT Futures Intelligence OS 3.0 carry-forward  
**Prepared:** 8 November 2026  
**Status:** Approved design brief / implementation baseline; not a claim that production infrastructure is already deployed  
**Primary goal:** Build one source-traceable, research-first financial intelligence platform using GitHub, Vercel, Supabase, Builder.io and Cloudflare, prioritising free tiers without misrepresenting free, delayed, licensed or restricted data.

---

## 0. How this document is organised

This is the consolidated build contract. It preserves the supplied **ICT Futures Intelligence OS 3.0 Technical Audit & 3.1 Roadmap** and the prior Finance Intelligence directories as source appendices in the package. The new requirements in this document add the requested **Builder.io** and **Cloudflare** integrations and specify the new repository, architecture, APIs, workflows, tests, phases and operational controls.

The source appendices are intentionally retained rather than rewritten. Where older directory documents contain overlapping lists, retain them as research references; build the production information architecture from canonical records and remove duplicate UI entries without deleting the original source material.

### Evidence labels used throughout

- **AUDIT FACT:** directly observed in the supplied 3.0 audit or project archive.
- **CARRY-FORWARD:** an existing feature or requirement that must remain in the consolidated platform.
- **NEW REQUIREMENT:** new implementation scope added in this specification.
- **RECOMMENDATION:** architecture or implementation choice; validate against final account limits and operational needs.
- **CONSTRAINT:** an API, plan, licensing, legal, privacy, or operational limit. Do not design around it as though it did not exist.

## 1. Product vision and outcomes

Build a polished global Finance Intelligence OS with a specialist ICT Futures terminal inside it. It should combine public financial research sources, market context, macro events, filings, news discovery, futures contract intelligence, source-backed educational content, quantitative/risk tools and a private trading workspace.

The product is **research and decision support**, not a broker, exchange, investment adviser, order router, wagering interface or guarantee of trading outcomes. It must distinguish:

1. public research data;
2. official structured API data;
3. delayed or cached data;
4. user-entered data;
5. search links and source destinations;
6. licensed data that is unavailable until separately contracted;
7. interpretations, hypotheses and model-generated summaries.

### Success outcomes

- A single responsive application, one code repository and repeatable deployment.
- Public SEO pages for markets, Academy lessons, glossary concepts, research hubs and selected source directories.
- A live-status-aware data layer with provider health, timestamps and provenance; never call a search URL or stale snapshot “live”.
- Accurate futures contract specifications, calendar timezones, risk calculations and clear expiry/rollover context.
- Structured research APIs where terms permit, rather than a site made only of external links.
- Builder.io editorial workflows for non-sensitive, non-transactional educational and research content.
- Cloudflare security, edge caching, API gateway and scheduled collection where supported by the free plan.
- Supabase Auth and row-level protected user data, with export and deletion.
- Automated CI, build, link checks, accessibility checks, API fixture tests and browser E2E tests.
- A low-cost baseline, with honest disclosures where commercial, high-volume or licensed operation requires payment.

## 2. Existing work to preserve

### 2.1 ICT Futures Intelligence OS 3.0 baseline

**AUDIT FACT:** The supplied audit records a static research MVP with:

- 15 futures contract families in tier split T1=5, T2=4, T3=6;
- 21 source-playbook concepts;
- 8 entry models;
- 13 session windows;
- 76 ICT Academy lesson records across 7 tracks;
- 52 curated source destinations;
- 15 market SEO pages and 76 lesson SEO pages;
- 92 sitemap URLs;
- a TradingView chart embed, cross-market context, session clock/DST handling, calendar, news/source search, social research links, positioning resources, prediction-market discovery, risk calculator, checklist and journal analytics;
- localStorage persistence for journal, checklist, events, lesson progress and preferences;
- 7 existing unit tests that cover a limited slice of the application.

The complete source baseline is included in `legacy/source-baselines/ict_futures_intelligence_os_v3_source.zip`. Preserve it as an auditable baseline; do not simply copy the monolithic output into a new production architecture without resolving the audit items.

### 2.2 The exact 15 futures families in the supplied source dataset

| ID | Market / symbols | Exchange | Role in the source playbook |
|---|---|---|---|
| `nq` | Nasdaq-100 E-mini NQ / MNQ | CME | Primary index-futures trade |
| `es` | S&P 500 E-mini ES / MES | CME | Primary index trade and NQ comparison |
| `gc` | Gold GC / MGC | COMEX | Primary precious-metals trade |
| `6e` | Euro FX 6E / M6E | CME | Primary currency-futures trade |
| `6b` | British Pound 6B / M6B | CME | London-focused currency futures |
| `ym` | Dow E-mini YM / MYM | CBOT | Index confirmation / relative strength |
| `rty` | Russell 2000 RTY / M2K | CME | Small-cap and rates-sensitive context |
| `dx` | US Dollar Index DX | ICE US | Dollar-bias context for FX and Gold |
| `zn` | 10-Year T-Note ZN | CBOT | Rates / yield context |
| `cl` | WTI Crude Oil CL / MCL | NYMEX | Energy futures |
| `6j` | Japanese Yen 6J | CME | Currency futures |
| `6a` | Australian Dollar 6A | CME | Currency / risk and commodity context |
| `6c` | Canadian Dollar 6C | CME | Currency / crude-linked macro context |
| `si` | Silver SI / SIL | COMEX | Precious-metals comparison |
| `btc` | CME Bitcoin BTC / MBT | CME | Regulated exchange-listed crypto futures |

All numeric contract specifications must be independently re-verified from the official contract specification before release. The table preserves the universe; it does not certify the values in the old dataset as current.

### 2.3 Finance Intelligence research directory baseline

**CARRY-FORWARD:** Bring the earlier Finance Intelligence work into the same platform as a source directory and research catalogue. Prior files include:

- Finance Intelligence Master Directory;
- Finance Intelligence OS Expanded Global Directory;
- Finance Intelligence OS News & Market-Movement Edition;
- Finance Intelligence OS Ultimate Global Directory;
- Global Market Cockpit edition;
- supplied source notes and the earlier packaged code baselines.

These files are retained in `legacy/previous-markdown/` and `legacy/source-notes/`; their contents are appended in this consolidated Markdown under **Appendix B**. The earlier Ultimate directory described 422 resources across 32 categories; the expanded directory described 316 resources across 24 categories; the News & Market-Movement edition described 531 unique URLs across 41 categories. Treat those counts as source-document snapshots, not as verified live counts today.

### 2.4 Research categories to keep

The merged platform should preserve, where source material supports them:

- India equities, exchanges, regulators, filings, screeners and official public data;
- US and international equities, ETFs, indices, company filings, earnings, fundamentals and ownership;
- futures, options, bonds, rates, credit, volatility, FX, commodities, agriculture, energy, freight and environmental markets;
- crypto markets, exchanges, derivatives, blockchain/on-chain research and protocol data;
- macro, central banks, inflation, employment, GDP, yields, Treasury auctions and economic calendars;
- news, RSS, press releases, earnings calls, official statements and source verification;
- public insider disclosures and institutional holdings (not confidential or stolen information);
- flows, sentiment, positioning, short interest and alternative data where public/licensed;
- social signal discovery from permitted public sources, clearly separated from verified facts;
- professional terminals and paid data providers as reference links, not as free integrations;
- public-interest OSINT, sanctions, enforcement and fraud research, with lawful access and privacy boundaries;
- forecasting and prediction research only where locally lawful and product terms permit.

## 3. Five-tool architecture — each tool has one job

The five tools are **not interchangeable**. Their connector access also does not automatically create website API credentials. The deployed application needs its own accounts, API keys, OAuth scopes, service bindings and data permissions.

### 3.1 GitHub — source of truth for code and version history

**Responsibilities**

- New repository and code ownership.
- Monorepo structure, pull requests, branch protection, releases and changelog.
- GitHub Actions for CI, automated tests, security/dependency scans, build artefacts and deployment workflow triggers.
- Versioned SQL migrations, Cloudflare Worker code, Vercel frontend code, Builder content model definitions and documentation.

**Rules**

- Production branch: `main`; feature branches use short descriptive names.
- No API secrets, service-role keys, private Builder tokens, Cloudflare API tokens or OAuth secrets in source control.
- Commit `.env.example` with variable names and descriptions only.
- Require successful checks before merge. Use a lockfile and pinned runtime/dependency versions.
- Do not rely on GitHub Actions schedules as the only critical ingestion scheduler. GitHub documents schedule delays/dropped runs and public repository schedule inactivity behaviour.

### 3.2 Vercel — frontend deployment and preview environment

**Responsibilities**

- Connect the new GitHub repository and automatically create Preview deployments for pull requests/branches.
- Deploy the Astro-based public site and static/SSR pages.
- Serve production web assets with HTTPS, redirects, headers and deployment rollback.
- Keep project-specific frontend settings, public environment configuration and build logs.

**Architecture choice**

- Primary frontend framework: **Astro + React islands + TypeScript**. Astro is selected for content-heavy SEO pages and light client-side interactivity. Do not introduce a full Next.js server application unless a measured feature requires it.
- Vercel is the frontend deployment target. Use Cloudflare Worker for the central external API gateway and ingestion scheduler, not a second competing Cron system.
- For a purely personal/non-commercial MVP, Vercel Hobby can be considered. The current Vercel Hobby plan is documented for personal, non-commercial use. If this becomes a commercial public product, use an eligible paid Vercel plan or make Cloudflare Pages the production host; do not silently use Hobby for commercial operation.

### 3.3 Supabase — Postgres, Auth and private user workspace

**Responsibilities**

- Postgres as the relational system of record for normalized research metadata, public snapshot metadata and user-owned application data.
- Supabase Auth for email/password or supported OAuth sign-in, session lifecycle and password reset.
- Row Level Security (RLS) for every user-owned table exposed through the API.
- Realtime only for appropriate user-facing notifications/status updates; do not use it as a substitute for licensed exchange market-data streams.
- Storage for user uploads only when needed; enforce access policies and size/content-type checks.

**Region recommendation**

- Prefer `ap-south-1` (Mumbai) if provisioned and compatible with account requirements; otherwise choose a nearby Asia region such as Singapore (`ap-southeast-1`). Validate latency from India after setup.

**Database policy**

- Postgres is the canonical database. Do not create parallel copies of the same core dataset in Supabase Postgres and Cloudflare D1.
- Split public data from private user data by schemas/table policies. Enable RLS on every exposed table.
- Every user-owned row must have an owner column and policy comparing it to `auth.uid()`.
- Never expose Supabase `service_role`/secret keys in browser bundles.
- Views must not accidentally bypass RLS; use secure invoker semantics where supported and restrict grants.
- For ingestion, use a server-side Worker credential only for restricted write paths; never allow a user-controlled request to choose arbitrary SQL/table/record payloads.

**Free-tier limitation**

Supabase Free is suitable for an MVP, but Free projects can pause after around 7 days of low activity. Therefore Free is not an unconditional always-on production guarantee. Check current project, storage, bandwidth, backup and compute terms before launch. If the product needs dependable production uptime, budget for a suitable paid plan.

### 3.4 Builder.io — visual CMS for editorial content

**NEW REQUIREMENT:** Integrate Builder.io as the visual editorial/content management layer, not as a replacement for the app database, market-data provider or auth system.

**Use Builder.io for**

- Academy lesson prose, diagrams, examples, editorial updates and supplementary learning pages.
- Research articles, market explainers, educational guides, glossary/editorial definitions and landing-page sections.
- Reusable page sections: hero, learning objectives, callouts, source cards, quote/citation blocks, FAQ and related lessons.
- Editorial preview and publishing workflow, where available in the chosen Builder Content plan.

**Do not use Builder.io for**

- Tick-by-tick quotes, economic event truth, COT numerical history, order books or high-frequency updates.
- Authentication, journal trade records, private watchlists, account preferences, billing or access-control decisions.
- Dynamic risk calculation logic or server-side secret storage.

**Proposed Builder models**

1. `academy-lesson`: slug, title, summary, track, level, prerequisites, learning objectives, provenance, body, diagrams, bullish example, bearish example, failure cases, quiz, practice exercise, reference links, verified videos, review metadata.
2. `research-article`: slug, title, dek, category, related markets, content blocks, source list, publication/review dates, author attribution only when verified.
3. `market-guide`: editorial introduction, contract mechanics explainer, catalysts and methodology notes; all numerical contract fields remain in the canonical structured dataset.
4. `glossary-entry`: term, alternate terms, definition variants, provenance, related concepts and references.
5. `landing-page-section`: selected reusable marketing/intro sections, not core application UI.

**Integration pattern**

- Build a small adapter in `apps/web/src/lib/builder/` using the official Builder Content SDK or documented Content API.
- Use the public Content API key for published public content. Builder documents that the public key can be exposed in client-side code.
- Any private API key or Personal Access Token used for write automation must be server-side only and stored as a secret. Never embed it in `VITE_*` or client-side bundles.
- Use Content API queries with explicit model, URL path, published state and controlled enrichment; validate response shape with Zod before rendering.
- Prefer static generation/revalidation for SEO pages, so a temporary CMS outage does not blank the entire site. Use Builder webhooks to trigger a protected rebuild/revalidation workflow if available on the plan.
- Maintain a local, version-controlled fallback content export for critical lessons and pages. Builder must not be the sole copy of core educational content.
- Register custom React components for market cards, source citations, data-status badges, lesson progress placeholders and interactive diagram frames. The components must receive validated content props; Builder cannot directly execute arbitrary application logic.

**Builder account integration status**

No Builder.io connector/action is currently available in the connected tools list. This is not the same as the Agent-Native Design workspace. Builder integration will be implemented through its documented Content API/SDK once a Builder Content Space exists and the public key is available. The public key is safe for client content reads; private write credentials remain secret.

**Free plan reality**

Builder's current pricing page advertises a Free option at $0/user/month with a stated credit allowance and workspace/design-system constraints. It does not justify assuming unlimited CMS delivery, unlimited editors, unlimited AI credits, custom domains or every preview/workflow feature. Validate the Content-specific feature table and current usage quotas in the account before committing the editorial operation to it.

### 3.5 Cloudflare — DNS, edge security, API gateway, cache and ingestion scheduler

**NEW REQUIREMENT:** Cloudflare is integrated as an edge/backend infrastructure layer while Vercel remains the frontend deploy target for the initial personal MVP.

**Core services**

- DNS for the production domain (domain registration itself is separate and is not assumed free).
- Proxy/CDN and baseline security settings once Vercel domain validation and SSL are confirmed.
- Cloudflare Worker `finance-api` as the controlled API gateway for external providers and public read endpoints.
- Worker Cron Triggers to dispatch scheduled collection tasks. Cloudflare Worker is the single scheduler for ingestion; Vercel Cron and duplicate GitHub scheduled collectors remain disabled for those same tasks.
- Workers KV for short-lived metadata/status/cache entries where eventual consistency is acceptable.
- R2 for static data exports, diagrams, generated research assets or large non-sensitive objects when needed; do not store user-private records publicly.
- Turnstile for anonymous/high-risk forms or rate-abuse protection; do not add it to every harmless page.
- WAF/security controls and cache rules appropriate to the selected plan.

**Do not add at MVP without a reason**

- Cloudflare D1 as a second primary database (Supabase Postgres already owns relational data).
- Durable Objects, Queues, paid Stream, Images or Workers Paid until there is a measurable requirement and budget approval.
- Cloudflare Pages as a second production deployment of the same site unless a formal host migration is chosen.

**Worker endpoints**

- `GET /health`: service status and build version; no credentials exposed.
- `GET /v1/status/providers`: provider health, last success, last attempt, age and status.
- `GET /v1/markets/{id}/snapshot`: latest cached public data where available.
- `GET /v1/news`: validated, cached news discovery items.
- `GET /v1/events`: normalized upcoming economic events.
- `GET /v1/cot/{contract}`: latest and historical public COT series.
- `GET /v1/filings/{ticker}`: selected company filing records.
- `GET /v1/prediction/research`: read-only crowd forecast/prediction metadata only where permitted and locally cleared.
- Internal scheduled handlers: `collect-news`, `collect-cot`, `collect-macro`, `collect-sec`, `collect-prediction`, `verify-contracts`, `refresh-provider-health`.

All endpoints must validate query parameters, enforce response-size/time limits, use allow-listed external hosts, set deliberate cache headers and return provider/source timestamps. Do not make a generic open proxy.

**Current Cloudflare Free plan limits to design around (verify before deployment)**

- Workers Free: 100,000 requests/day, 10 ms CPU per invocation, 50 subrequests per invocation, 5 Cron Triggers per account and 64 MiB Worker size (current official limits page).
- Workers KV Free: 100,000 reads/day, 1,000 writes/day, 1 GB storage per account/namespace constraints listed by Cloudflare.
- D1 Free: 5 million rows read/day, 100,000 rows written/day and 5 GB total storage.
- R2 Standard Free allowance: 10 GB-month storage, 1 million Class A requests and 10 million Class B requests per month; internet egress is free per current pricing.
- Pages Free (if later selected as host): currently 500 builds/month, 20,000 files per site and 25 MiB per file on the cited plan limits page.
- Turnstile Free: 20 widgets per account, unlimited challenges according to the current official plan page.

These are quota ceilings, not recommended operating targets. Implement graceful degradation and usage alerts before hitting the plan limits.

## 4. Final technology stack

| Layer | Chosen technology | Purpose | Free-first policy |
|---|---|---|---|
| Repository | GitHub | Version control, code review, CI | GitHub Free is sufficient for a small repo; public Actions standard runners have included usage; review private-repo minutes/storage. |
| Frontend | Astro + React + TypeScript | SEO-first site and interactive terminal modules | Static generation first; avoid server-side work if Worker handles APIs. |
| Styling | Tailwind CSS + design tokens | Responsive UI and consistent components | Open-source. |
| Visual content CMS | Builder.io Content | Academy, articles, glossary and curated editorial pages | Use Free plan within current published quotas; local content backup. |
| Deployment | Vercel | Frontend Preview/Production deploy | Hobby only for personal/non-commercial use; if commercial use, upgrade or migrate host. |
| Edge / API | Cloudflare Workers + KV | API gateway, caching, cron dispatch, edge protection | Stay within 100k req/day and 10ms CPU Free limits initially. |
| Database / Auth | Supabase Postgres + Auth + RLS | Normalized public metadata and private workspace | Free for MVP; no always-on guarantee; activity pause and backups considered. |
| Static/object assets | Git LFS not assumed; Cloudflare R2 or Supabase Storage | Images, diagrams, data exports | Use R2 free allowance where suitable; don't duplicate data unnecessarily. |
| Validation | Vitest, Playwright, axe-core, Zod | Unit, browser, accessibility, schema tests | Open-source. |
| Charts | Lightweight Charts / TradingView widgets | Historical chart visualisation / embed | Widgets are not raw exchange data rights. Verify licensing. |
| Time handling | Temporal/polyfill or Luxon + IANA zones | ET/IST and global DST conversion | Tests must include DST and date rollover. |

**Implementation baseline:** Node.js 22 LTS or another supported LTS selected at build time; pin exact patch/runtime in CI and deployment. Use `pnpm` with committed lockfile. Do not use floating dependency versions in production.

## 5. Target repository and project layout

**New repository name proposal:** `finance-intelligence-os` (new repository, not the empty legacy `new.w`).

```text
finance-intelligence-os/
├── apps/
│   └── web/                         # Astro + React frontend (Vercel)
│       ├── src/pages/               # SEO routes
│       ├── src/components/          # UI and React islands
│       ├── src/features/            # markets, news, calendar, academy, risk, journal
│       ├── src/lib/                 # API clients, Builder adapter, Supabase client
│       └── public/                  # logos, robots, generated assets
├── workers/
│   └── finance-api/                 # Cloudflare Worker API + cron dispatcher
│       ├── src/routes/
│       ├── src/providers/
│       ├── src/jobs/
│       ├── src/cache/
│       ├── src/schemas/
│       └── wrangler.toml
├── packages/
│   ├── contracts/                   # schemas and verified contract records
│   ├── data-models/                 # normalized API and data contracts
│   ├── ict-engine/                  # ICT rules/taxonomy/provenance data
│   ├── ui/                          # shared accessible UI components
│   ├── risk-engine/                 # tested futures sizing and expectancy functions
│   └── provider-adapters/            # shared provider types and fixtures
├── data/
│   ├── seed/                        # public seed datasets
│   ├── source-registry/             # source/license registry
│   └── fixtures/                    # recorded provider test fixtures
├── content/
│   ├── fallback/                    # Builder-exported fallback content
│   └── builder-models/               # CMS model schemas and examples
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/                       # RLS tests
├── scripts/                         # build, import, link audit, spec verification
├── tests/                           # cross-package and E2E suites
├── docs/                            # ADRs, API matrix, security, runbooks
├── .github/workflows/               # CI, security, release
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── astro.config.mjs
├── tsconfig.json
├── vercel.json                      # redirects/headers only; no duplicate cron
└── README.md
```

### Repository migration rules

- Import existing ICT Futures 3.0 code/data as a source baseline under controlled commits; rebuild the production front end in modules rather than shipping the monolithic HTML as the only application.
- Keep old HTML and generated SEO output in the legacy archive, not as duplicate indexable pages.
- Carry forward the old 15-market and 76-lesson datasets, then add verification, provenance and content completeness fields.
- Import Finance Intelligence directories as a normalised resource collection, with canonical URLs and tags; preserve the original Markdown files in version control.
- Use one canonical URL strategy and no legacy GitHub Pages hostname in production metadata.

## 6. Product modules and functional requirements

### 6.1 Global market universe and instrument catalogue

- Browse by asset class, geography, exchange, product type and trading mechanism.
- Preserve all assets from the legacy directories: equities, indices, FX, rates/bonds, credit, precious/industrial metals, energy, agriculture, soft commodities, crypto, volatility/options, freight, environmental products and alternative assets.
- Maintain instrument/entity identifiers, exchange, venue, symbol, currency, contract type, multiplier, tick, settlement type, data rights, market-hours source and related markets.
- Distinguish spot/CFD/futures/ETF/equity/option/crypto products; never infer equivalence from similar symbols.
- User can create watchlists by market and session.

### 6.2 ICT Futures Terminal

Preserve the 15 futures families listed in Section 2.2, contract comparison, TradingView chart embedding, session clocks, session highs/lows, cross-market context, event-aware market profile and source-linked contract page.

- Every contract page must show exchange, product, root, active month/expiry selection, point/tick value, trading hours, settlement/notice dates where applicable, official specifications and `lastVerifiedAt`.
- DX must use ICE-specific sources, not generic CME volume/OI or expiry links.
- Separate continuous-contract charts from tradable contract-month values; a continuous-series gap is not automatically a tradable imbalance.
- Add explicit exchange/product-family mapping for specifications, volume/OI, expiry, holidays, settlement and source-provider URLs.
- Provide 1H/4H/Daily/Weekly context and related contracts without implying licensed raw real-time quotes.

### 6.3 ICT taxonomy and entry models

Preserve all source-playbook concepts, 8 entry models and 13 session windows. Keep concept provenance mandatory:

- `PLAYBOOK SOURCE` — directly from the supplied ICT Futures playbook;
- `ICT PRIMARY SOURCE` — verified primary ICT material;
- `COMMUNITY CONVENTION` — commonly used practitioner interpretation, not a single official definition;
- `SUPPLEMENTAL` — adjacent useful concept not asserted to be original ICT doctrine.

For contested terms, show attributed definition variants rather than forcing one universal definition. Do not claim strategy profitability without sourced, reproducible backtests.

### 6.4 ICT Academy

Carry forward all 76 lesson records and 7 tracks. Expand each lesson with:

1. Definition, alternate terminology and provenance.
2. Required prerequisites and intended level.
3. Exact identification rules, step by step.
4. Bullish and bearish chart examples.
5. What qualifies and does not qualify.
6. Relevant timeframe/session/contract context.
7. Entry/confirmation rules only when it is an entry model.
8. Invalidation, stop and target principles where applicable.
9. Failure cases, counterexamples and common mistakes.
10. References, direct source links and verification date.
11. Video ID/playlist ID, channel, title, publication date, duration and verification state—or label it plainly as a YouTube search link.
12. Annotated diagram, quiz, practice task and related lessons.

Academy must also include futures and market microstructure learning (contract anatomy, ticks, expiry, settlement, margin, OI vs volume, spread/DOM/order types, rollover, session/DST) and quantitative/risk fundamentals (expectancy, R multiple, drawdown, risk of ruin, volatility, correlation, sampling, confidence intervals, overfitting, look-ahead bias and realistic fees/slippage).

### 6.5 Global macro and economic calendar

- Official source adapters for BLS, BEA, EIA, Federal Reserve, ECB, BoE, BoJ, RBA, BoC, Treasury auctions and CFTC report dates where data is available.
- Store exact event timestamp, original IANA timezone, source URL, published/retrieved timestamps, actual/forecast/prior/revision and units.
- Keep date-only/all-day events separate; never fabricate an intraday clock time.
- Event filters must use UTC timestamp comparisons with exclusive end boundaries.
- `Next 24 hours` means now through now+24h, not two calendar dates. `Next 7 days` must be defined as rolling 168 hours or an explicitly named set of local calendar days. `Month` must be a real calendar month grid or be labelled `Next 30 days`.
- Display both ET and IST date/time; account for next-day rollover and different DST transition dates.
- Add tests for US spring-forward/fall-back, UK/Europe/US DST mismatch, India midnight rollover, all-day events and exact range boundaries.
- Calendar notifications: local reminders initially; later optional user-authorised calendar sync and web push/email with opt-in and unsubscribe.

### 6.6 News and event intelligence

- GDELT as broad discovery, not a complete professional newswire.
- Official statements/releases and press-release sources are preferred for primary facts.
- Add RSS ingestion only when feed terms and publication rules allow.
- Deduplicate by provider ID or canonical URL/hash; store headline, source, original URL, published time, retrieved time, language, relevant markets, topic tags and confidence/evidence notes.
- Keep Reuters/Bloomberg/paywalled sources as click-through links unless licensed.
- No full-text scraping or paywall bypass.
- Search/social link destinations are labelled `SEARCH LINK`, not live feed.

### 6.7 Positioning and institutional information

- CFTC COT: contract, report type, report date, trader category, long, short, spreading, net, weekly change and open interest; preserve source category definitions and reporting lag.
- BPR: monthly aggregate fields, report month and category definitions when published.
- CME preliminary/final volume and OI: distinguish report state and contract month; use ICE-specific data for DX if publicly available/licensed.
- SEC filings: Forms 3/4/5, 8-K, 10-Q, 10-K, 13F as separate types. Classify awards, exercises, open-market purchases/sales, tax withholding, indirect ownership and 10b5-1 disclosures. A filing is public company disclosure, not “futures insider” data.
- Show filing date vs event/period date. A 13F is a lagged snapshot, not real-time positioning.
- Calculate percentiles/z-scores only with adequate history and disclose lookback/sample limitations.

### 6.8 Prediction/forecast research

- Research-only view of public forecast probabilities or public market metadata when permitted.
- Polymarket Gamma is for event/market discovery; CLOB endpoints are for appropriate token-level market data. Kalshi public market data is separate from authenticated account/trading operations.
- Store bid/ask, spread, liquidity/volume, market resolution criteria, event time, source and retrieved time where endpoint permits.
- Never treat a quoted probability as an objective forecast or guaranteed likelihood.
- India legal and platform restrictions must be reviewed before exposing platform-specific content; no VPN circumvention, real-money wagering interface, wallet actions or trading access. The legacy directory's 25 Apr 2026 MeitY advisory note is preserved in the appendix and is a prompt for legal review, not legal advice.
- Provide lawful alternatives for non-wagering crowd forecasting research where appropriate.

### 6.9 Social intelligence

- Keep X, LinkedIn, Reddit, YouTube, Stocktwits, TradingView, Telegram and Discord as distinct provider modules.
- No scraping private channels, gated accounts or content behind access controls.
- X API is usage-priced; LinkedIn access is permissioned; platform API terms and redistribution rights control what can be stored.
- Free MVP uses public search links, curated lists and permitted public RSS/API data.
- Store attribution, post URL, publication/retrieval time and platform ID only where terms permit.
- Separate user-generated opinions from official news and verified facts; provide report/mute/ignore controls if social posts are rendered.

### 6.10 Cross-market dashboard

- Correlation matrices for 20/60/120-day windows only when there is compatible, sufficiently complete input series.
- Relative strength, macro driver map and market reaction studies with explicit timeframe and source.
- Do not calculate correlations using mixed sampling intervals, mismatched sessions or unadjusted futures rolls without disclosing methodology.
- Show missingness, pairwise sample count and data delay.

### 6.11 Risk calculator and quantitative research

- Support long/short futures and micros with exchange-verified tick/point values, selected expiry and correct contract multiplier.
- Inputs: account balance, risk %, entry, stop, target, quantity cap, commission semantics (per-side/round-turn), entry/exit slippage and fees.
- Outputs: risk in ticks/points/currency, gross target, estimated net target, R multiple before/after costs, maximum quantity rounded down and warning when even one contract exceeds budget.
- Include daily loss limit, max drawdown, margin as broker-supplied input and correlated portfolio exposure.
- Do not infer broker margin from notional contract value.
- Add statistical tools: expectancy, win rate, payoff ratio, profit factor, drawdown, losing streak, risk of ruin approximations, sample-size confidence bands and walk-forward/out-of-sample tests.
- No claim of guaranteed returns, accuracy or “institutional signals”.

### 6.12 Private trading workspace

Supabase Auth-protected features:

- User profile/preferences and timezone.
- Watchlists and watchlist items.
- Journal trades with contract, side, expiry, setup/model, thesis, risk, fills, fees, slippage, screenshots and tags.
- Checklist and pre-trade plan.
- Personal calendar events and alerts.
- Lesson progress and notes.
- Trade analytics with export CSV/JSON.
- Account-data export and account deletion workflow.

Retain local-only/offline fallback for a first visit or temporary outage, with clear sync state; never silently lose locally captured journal trades.

### 6.13 Daily/weekly intelligence brief

- Deterministic source-backed synthesis first; AI-assisted brief only after data provenance is strong.
- Every factual claim cites source(s) and timestamps.
- Separate Fact / Market interpretation / Hypothesis / Unknown.
- Present conflicting evidence, stale inputs and missing data.
- No AI-generated numerical “forecast” unless methodology, sample and uncertainty are shown.
- No fabricated news or price values when APIs fail.

## 7. Data providers and API integration plan

This is a free-first priority matrix. An API being publicly reachable does not automatically mean the data may be redistributed commercially or used as an unrestricted real-time feed. Verify terms for each dataset and each use.

### 7.1 Recommended free/public or free-registration API adapters

| Provider | Data / module | Key / access | Initial integration | Caveats |
|---|---|---|---|---|
| GDELT DOC API | Broad global news discovery | Public DOC search generally no key | Phase 1 news discovery | Coverage is not a complete newswire; dedupe and verify against primary source. |
| CFTC Public Reporting Environment | COT and public reports | Public API/data; token situation/limits must be checked with current docs | Phase 2 weekly history | Weekly report uses Tuesday positions and is published later; categories are not individual accounts. |
| BLS API v1 | CPI, PPI, employment and labour series | No registration; limited daily/series request quotas | Phase 1 macro history | v2 registration increases quota; not real-time trading quotes. |
| BLS API v2 | Same, higher quotas | Free registration key; current docs describe higher daily request and series limits | Phase 2 | Key registration/renewal and quota policy apply. |
| BEA API | GDP, PCE, income/expenditure | Free API UserID registration | Phase 2 | Preserve series/vintage definitions, units and release date. |
| EIA Open Data API | Crude, petroleum, gas and inventories | Free API key registration | Phase 2 CL/energy context | Rate limiting/throttles; not CME quotes. |
| FRED / ALFRED | Rates, yields, macro history and vintages | API key registration | Phase 1/2 rates dashboard | Historical macro series, not an exchange futures feed; use ALFRED vintages correctly. |
| SEC `data.sec.gov` | Company submissions and XBRL facts | Public JSON APIs; no conventional key, clear User-Agent and fair access | Phase 2 filing monitor | SEC fair-access policy currently states no more than 10 requests/sec total; use sensible polling and only needed records. |
| ECB SDMX | Euro-area statistics | Public APIs | Phase 2 FX and macro | Units, frequency and release schedule differ by series. |
| New York Fed Markets Data | SOFR/OBFR and selected rates | Public documented API | Phase 1 rate context | Not futures order book or exchange tape. |
| US Treasury Fiscal Data | Auctions, debt and fiscal records | Public API | Phase 2 ZN/yields context | Scheduled releases; not live depth. |
| Federal Reserve / FOMC releases | Policy and primary documents | Public pages/data feeds | Phase 1 event/news source | Use official release time and document URL. |
| Polymarket Gamma | Event/market discovery | Public endpoints documented | Optional read-only adapter | Local legal restrictions and terms must be checked; discovery is not the price/order-book API. |
| Polymarket CLOB | Price/order-book/history | Public market data endpoints for eligible data | Optional, disabled until legal review | Token mapping, spread/liquidity and market resolution matter; no wallet/trading controls. |
| Kalshi public market data | Event market snapshots / WebSocket | Public data endpoints; account/trading endpoints separate | Optional, disabled until legal review | Do not infer Indian real-money eligibility. |
| YouTube Data API | Playlists/video metadata | Google API key and finite daily quota | Academy source mapping | `playlistItems.list` has a 1-unit quota cost on current docs; search costs differ. Verify exact quota settings. |
| Cloudflare Workers APIs | API gateway, cron, KV/R2 | Cloudflare account; free quotas | Phase 0/1 | CPU/request/cron ceilings apply. |
| Builder Content API | CMS content | Public API key for published content | Phase 1 Academy/editorial | Private writes need secret credentials and server-side calls. |

### 7.2 Market data: free vs licensed

| Data type | Free-first approach | What is not included |
|---|---|---|
| CME/COMEX/NYMEX/CBOT/ICE live futures ticks | Official exchange links, TradingView widgets where terms permit, delayed official quote display | Unrestricted real-time redistribution, full depth, DOM and trade tape are not assumed free. |
| Futures history | Public/delayed snapshots or a provider free tier only where coverage/terms are verified | Full-depth institutional-quality history and redistribution rights. |
| Volume and open interest | Exchange-published reports when public and licensed for intended use | Do not infer a live feed from a PDF/report schedule. |
| FX spot / crypto | Public exchange APIs or provider free tiers with symbol coverage and rate limits verified | Not equivalent to CME futures prices, and not a source for CME contract tick specifications. |
| TradingView embed | Chart view / external charting | Not a raw data API or blanket permission to redistribute the underlying data. |
| News headlines | GDELT, permitted RSS, official releases | Reuters/Bloomberg/paid-wire content without licence. |

**Hard rule:** If no authorised API provides a field, show an official external source link or `UNAVAILABLE`; never scrape a protected page or fabricate data.

### 7.3 APIs and sources that are paid, restricted or conditional

- CME/ICE live quotes, DOM, footprint and depth: require exchange-authorised access/licensing. The CME quote explanation states website quotes are delayed; do not represent them as live.
- Reuters, Bloomberg, Dow Jones/Factiva, FactSet, LSEG, S&P Capital IQ, AlphaSense and similar institutional datasets: link or licence; do not scrape paywalled content.
- X API: usage-priced; public search is fallback.
- LinkedIn: permissioned and product-specific; no assumption of broad content ingestion.
- Quartr transcripts and premium earnings services: access/redistribution restrictions vary.
- Paid APIs (FMP, Finnhub, Twelve Data, Alpha Vantage, CoinGlass, Trading Economics, Nasdaq Data Link etc.) must be assessed by current plan, symbols, historical depth, latency and commercial redistribution rights before enabling.
- Google Calendar sync requires user-granted OAuth; a website API key is not permission to read a user's calendar.
- Email/push delivery may require a verified domain/provider and can incur charges at scale.

### 7.4 Ingestion cadence (initial design, not SLA)

| Job | Target cadence | Scheduler | Notes |
|---|---|---|---|
| GDELT discovery | 30–60 minutes initially | Cloudflare Cron | Deduplicate, bounded query, cache results. |
| Official macro calendar validation | Daily | Cloudflare Cron | Source schedule changes are low-frequency but event times critical. |
| BLS/BEA/EIA values | Daily and around known releases | Cloudflare Cron | Trigger around release; verify source publication before parsing actual. |
| SEC filings | 15–60 minutes for selected watchlist companies, conservative backoff | Cloudflare Cron | Never poll all companies aggressively. |
| CFTC COT | Weekly after publication | Cloudflare Cron | Keep publication/report date separate. |
| BPR | Monthly after release | Cloudflare Cron | Preserve report vintage/date. |
| Exchange volume/OI | On official publication cycle | Cloudflare Cron | Preliminary vs final state. |
| Contract specifications | Weekly/manual change detection | Cloudflare Cron + admin review | Never auto-publish material spec changes without verification. |
| Prediction/forecast metadata | 5–15 minutes for selected read-only research markets, only after review | Cloudflare Cron | Do not poll every event continuously. |
| YouTube playlist mapping | Weekly/monthly | Cloudflare Cron or manual | Avoid repeated quota consumption. |
| Provider health | Each job + `/health` probes | Cloudflare Worker | Record success/failure and data age. |

One Cloudflare Worker Cron dispatcher should schedule the above jobs. If the five-trigger Free limit is reached, combine jobs in a single dispatcher with time-slot routing or use fewer cron triggers; do not create duplicate Vercel and GitHub schedules.

### 7.5 Normalised data contract

Every provider record must carry:

```json
{
  "id": "stable-provider-record-id-or-content-hash",
  "provider": "CFTC",
  "dataType": "cot-position",
  "marketIds": ["nq"],
  "publishedAt": "2026-11-06T15:30:00Z",
  "eventAt": null,
  "retrievedAt": "2026-11-06T15:31:20Z",
  "dataAsOf": "2026-11-03",
  "sourceUrl": "https://official-source.example/record",
  "accessType": "official-api",
  "freshnessStatus": "fresh",
  "licenseNote": "Public CFTC report; retain source attribution",
  "rawPayloadHash": "sha256:...",
  "schemaVersion": 1
}
```

`publishedAt`, `eventAt`, `retrievedAt` and `dataAsOf` are different concepts. Never collapse them into one `updatedAt` field.

### 7.6 Data state labels

Use only controlled labels, displayed on every source-backed card:

- `LIVE API` — authorised streaming/near-real-time API with current timestamp and entitlement;
- `SNAPSHOT` — stored point-in-time retrieval;
- `DELAYED` — source or contractually delayed;
- `OFFICIAL LINK` — link to official source, no local ingestion;
- `SEARCH LINK` — search destination only;
- `PAYWALL` — paid/permissioned content;
- `MANUAL` — user-entered or manually reviewed;
- `STALE` — older than configured threshold;
- `UNAVAILABLE` — data could not be obtained or is not licensed.

## 8. Data model — first schema set

All tables must include primary keys, appropriate indexes, timestamps, constraints and migrations. Exact SQL is created only after schema review.

### Public research tables

- `source_registry` — provider, name, source URL, source type, rights/licence notes, allowed storage/display/use, rate-limit metadata, review date.
- `provider_status` — provider, endpoint/job, lastAttemptAt, lastSuccessAt, status, latency, error class, data age.
- `instruments` — market ID, asset class, exchange, product type, symbol/root, currency, session and linked source references.
- `contract_specs` — contract month, point/tick value, multiplier, settlement, notice/last trade, official URL, `lastVerifiedAt`, reviewer and version.
- `market_snapshots` — instrument, metric/price type, value, source, as-of time, retrieved time, delay/entitlement.
- `economic_events` — event ID, institution, event type, UTC start/end, original timezone, source, status, actual/forecast/prior/revisions.
- `news_items` — source record ID, headline, excerpt (permitted only), canonical URL, language, publish/retrieval time, tags, hash.
- `cot_positions` — contract, report type, report date, trader category, long, short, spreading, net, open interest, weekly change.
- `bpr_reports` — report period, contract and category values.
- `open_interest_reports` — exchange, instrument/month, report date, preliminary/final state, volume/OI.
- `company_filings` — CIK/ticker, accession, form, filing date, report period, source URL, structured facts refs.
- `prediction_research_markets` / `prediction_snapshots` — source, market ID, resolution rules, spread/price/probability snapshot, volume/liquidity, terms/legal flag.
- `content_references` — Builder model/entry ID, slug, content version, fallback file ref, published/review state.

### User-owned tables

- `profiles`, `watchlists`, `watchlist_items`, `journal_trades`, `journal_attachments`, `custom_events`, `alert_rules`, `lesson_progress`, `user_notes`, `user_preferences`.

Every user-owned table has `user_id` referencing `auth.users(id)` and explicit RLS select/insert/update/delete policies scoped to `auth.uid()`. Attachment paths are user-scoped and validated. Add tests that prove user A cannot read or mutate user B's rows.

## 9. API security and secrets

### 9.1 Environment variable plan

`.env.example` lists names only. Actual values are stored in Vercel/Cloudflare/Supabase secret managers, never committed.

**Frontend/public (safe values only)**

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY` (or publishable key)
- `PUBLIC_BUILDER_API_KEY` (public Content API key only)
- `PUBLIC_API_BASE_URL`
- `PUBLIC_SITE_URL`

**Cloudflare Worker secrets**

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (only if a narrowly scoped ingestion writer requires it; never sent to clients)
- `SUPABASE_ANON_KEY` (if worker makes user-context/public requests)
- `FRED_API_KEY`
- `BEA_API_KEY`
- `EIA_API_KEY`
- `BLS_API_KEY` (if using v2)
- `YOUTUBE_API_KEY`
- `BUILDER_PRIVATE_API_KEY` (only for server write automation; not needed for published content reads)
- `BUILDER_PERSONAL_ACCESS_TOKEN` (only if a narrowly scoped automation needs it)
- `SEC_USER_AGENT`
- provider-specific secrets only when approved.

Cloudflare bindings are configured separately for KV/R2. Avoid storing any secret in a Worker plaintext variable; use Wrangler secret commands or the dashboard secret store.

### 9.2 Security controls

- Strict CORS allow-list to the production and approved preview origins.
- CSP compatible with the chart/CMS embeds actually used; do not allow broad `*` origins.
- HTTPS/HSTS after domain certificate is active; `X-Content-Type-Options`, `Referrer-Policy`, frame restrictions and restrictive Permissions Policy.
- Rate limiting and Turnstile for abusive forms/routes; never rely on client-only checks.
- Validate every provider response using schema validation; reject unknown dangerous URL schemes and encode output.
- Use timeouts, exponential backoff, jitter, bounded retries, circuit breakers and response-size limits.
- Keep raw payload hashes and minimal necessary raw data; respect deletion/retention and provider terms.
- Logs must omit API keys, access tokens, email addresses and private journal contents.
- Admin operations require server-side authorisation; do not rely on a hidden UI button.
- Rotate/revoke exposed credentials immediately; scan repository history for accidental secrets.

## 10. SEO, performance and content quality requirements

### 10.1 Fix the confirmed 3.0 defects

- Replace the hardcoded GitHub Pages URL in page generators, sitemap and robots with one `SITE_URL` setting.
- Add homepage canonical.
- Add `og:image`, `og:image:alt`, `twitter:image` to indexable pages.
- Add visible breadcrumbs and valid `BreadcrumbList` schema.
- Use suitable `LearningResource` structured data on lessons and accurate `WebPage`/sitewide organisation metadata.
- Remove `meta keywords`.
- Use `lastmod` only when the page's substantive content changes.
- Fix market comparison list rendering so it is human-readable, not Python list text.
- Ensure DX uses ICE sources and all other markets use contract-specific exchange sources.
- Add `noindex` to preview deployments.
- Add unique, useful page content; never pad word count.
- Submit sitemap and verify Search Console/Bing Webmaster after production domain exists.

### 10.2 Required route structure

```text
/
/markets/
/markets/nq/
/markets/es/
/markets/gold/
/markets/crude-oil/
/markets/{all-15-contract-family-slugs}/
/academy/
/academy/{lesson-slugs}/
/research/
/research/news/
/research/cot-positioning/
/research/filings/
/research/prediction-research/
/calendar/
/tools/risk-calculator/
/tools/journal/
/tools/correlation/
/directory/
/directory/{resource-category}/
/methodology/
/about/
/privacy/
/terms/
```

Old `.html` paths should redirect to canonical clean paths after route map verification; never leave two indexable copies.

### 10.3 Quality/performance objectives

- Lighthouse mobile/desktop as an engineering check, not a ranking promise.
- Core Web Vitals targets after field data is available: LCP ≤2.5s, INP <200ms, CLS <0.1.
- Lazy-load large chart embeds and non-critical media.
- Avoid loading the entire legacy directory or every lesson payload on the homepage.
- Use responsive images, accessible contrast, keyboard navigation, visible focus, landmarks and meaningful alt text.

## 11. Builder editorial governance

- Builder models and content schemas are version-controlled in `content/builder-models/`.
- All lessons require mandatory provenance, source list, review status and version metadata before publication.
- An editor must not be able to publish an unverified “live signal”, trading performance claim or stale contract specification as fact.
- Builder editorial pages may reference canonical market IDs; numerical market values are fetched from the data layer.
- Use a published content export/fallback snapshot on every release. Keep Builder CMS outage from breaking homepage, Academy index or SEO pages.
- A content webhook must be authenticated and replay-protected; it triggers a limited revalidation/rebuild endpoint only.
- Editorial roles and preview access depend on Builder's actual plan; do not assume the free tier includes multi-editor roles.

## 12. Testing and quality gates

### Unit and contract tests

- Contract tick/point/risk calculations for all 15 instrument families and micros.
- Expiry selection, continuous-contract rollover and specification-source consistency.
- Calendar exact-range inclusivity/exclusivity, DST, India midnight rollover and all-day events.
- News parsing, canonical URL dedupe, unicode and malformed provider payloads.
- COT report date, category and net-position math.
- API adapter rate-limit, 401/403, 404, 429, timeout, malformed JSON and stale data handling.
- Builder content model validation and fallback rendering.
- Supabase RLS owner isolation, including update and delete.
- Worker cron dispatcher idempotency; duplicate/replayed job safety.

### Browser E2E (Playwright)

- Desktop and mobile navigation, theme toggle, search and route transitions.
- Market switching, contract page spec source, chart loading fallback.
- Calendar filters and dual ET/IST display.
- News/source status and stale/error states.
- Prediction/forecast research disabled state where legal/feature flag is off.
- Risk calculator long/short, cost inputs, quantity rounding and warnings.
- Auth signup/login/logout/password reset.
- Journal create/edit/delete/export and cross-user isolation.
- Academy lesson content/quiz/progress, Builder outage fallback and responsive diagrams.

### Release gates

- Lint/typecheck/build pass.
- All unit/contract tests pass.
- RLS tests pass in a non-production Supabase environment.
- Playwright critical paths pass on Preview.
- SEO validation across every generated route.
- Accessibility scan and keyboard smoke tests pass.
- Secret/dependency scans clear.
- Provider health endpoints return honest status.
- Production deployment verified with smoke tests and rollback target.

## 13. Delivery roadmap and acceptance criteria

### Phase 0 — accounts, domain and repository foundation

1. Confirm new repo name and visibility.
2. Create a new GitHub repository and transfer project ownership to it.
3. Establish `main`, PR checks, CODEOWNERS/branch settings if available, `.gitignore`, env sample, lockfile and security policies.
4. Create Vercel project linked to the new repo; configure Preview and Production.
5. Confirm Cloudflare account/zone and decide domain. Domain purchase is separate; use temporary Vercel/Pages preview URL until then.
6. Create Supabase project in the confirmed organisation and nearest available region; confirm actual cost before any non-zero provisioning.
7. Create Builder Content Space, validate the free plan and add public API key; do not use private key in the frontend.

**Exit criteria:** all services have known owners/URLs, preview deployment exists, no production secret appears in repository, repo can build from clean checkout.

### Phase 1 — technical foundation and existing 3.0 defect repair

- Move to Astro/React modular frontend.
- Import 15-market data, 76 Academy records, source directory and ICT playbook.
- Fix `SITE_URL`, canonical, OG/Twitter images, breadcrumbs, sitemap and robots.
- Fix event window math, ET/IST date rollover, `compare` render bug and exchange-source mapping.
- Add global status badge component and typed source records.
- Build baseline APIs and mock/fixture adapters.

**Exit criteria:** 92-page legacy SEO structure is replaced or migrated with verified canonical routes, all prior useful content preserved, no known P0 defect remains.

### Phase 2 — Cloudflare edge and official data foundation

- Deploy Worker API gateway with `/health`, provider status and read endpoints.
- Configure KV cache, allowed CORS origins, secrets and Cloudflare Cron dispatcher.
- Add GDELT, BLS v1/v2 as selected, FRED/ALFRED, New York Fed and official macro/event source adapters.
- Add provider health records, staleness logic, retry/backoff and idempotent storage.
- Add CFTC COT historical ingestion.

**Exit criteria:** real records have original source URLs and four distinct timestamps; provider failures degrade gracefully; no source is mislabeled live.

### Phase 3 — Supabase Auth, user workspace and RLS

- Add Auth flows, user profile, watchlists, journal, checklist, lesson progress, custom events and preferences.
- Migrate local data with explicit user consent and export fallback.
- Apply owner-based RLS and test cross-user access.
- Add account export and deletion paths.

**Exit criteria:** user data syncs across devices, unauthorized access tests fail as expected, no private record leaks to public APIs.

### Phase 4 — institutional/official data and market intelligence

- Add BEA, EIA, SEC filings, Treasury, ECB and issuer event adapters.
- Build COT/BPR/OI visual dashboards with report-age labels.
- Add cross-market relationships only when compatible data is available.
- Add selected prediction/forecast data as research-only after legal review.

**Exit criteria:** dashboard cards cite original data and show as-of/retrieved time; source category/methodology and missing-data states visible.

### Phase 5 — Builder.io Academy and editorial CMS

- Create Builder models and custom React components.
- Import the 76 existing lesson records with provenance and draft status.
- Expand lesson content, direct reference links, verified videos, diagrams and quizzes.
- Generate SEO pages from published CMS content with local fallback.
- Add authenticated webhook revalidation and preview QA.

**Exit criteria:** every lesson meets required fields and editorial checklist; no false attribution to ICT primary sources; pages remain available on CMS/API failure.

### Phase 6 — Risk, quantitative analysis and research brief

- Release revised contract-aware risk engine and expectancy/backtesting education tools.
- Add journal analytics and portfolio correlated-risk warnings.
- Add deterministic cited daily/weekly brief with conflict/uncertainty display.

**Exit criteria:** math tests pass and all AI-assisted/factual claims are traceable to actual provider records.

### Phase 7 — hardening and public launch

- Domain/HTTPS, WAF, production CSP and rate policies.
- Search Console/Bing Webmaster, sitemap submission and index review.
- Uptime and provider health monitoring; privacy/terms/data attribution/legal pages.
- Load testing and quotas; confirm current free or paid plans for expected commercial use.
- Formal operational runbooks and rollback plan.

**Exit criteria:** no P0/P1 blocker; no hidden paid dependency; no false 24/7/live claim; operational owner can see provider freshness and costs.

### Phase 8 — advanced capabilities (optional, paid/licensed)

- Licensed CME/ICE real-time quote stream, historical tick data and redistribution rights.
- DOM/market depth, footprint, trade replay and volume profile.
- Broker connection or paper trading only after a separate security/regulatory risk assessment.
- AI analyst with citations and evaluations.
- Multi-user roles, paid subscriptions and admin moderation if product is commercialised.

## 14. Initial backlog, prioritised

### P0 — must complete before release

- [ ] New repository and deployment baseline.
- [ ] One `SITE_URL`; fix old hard-coded GitHub Pages hostname.
- [ ] Correct calendar exact-time filtering and ET/IST dates.
- [ ] Fix market comparison display artefact.
- [ ] Use exchange-specific URLs (especially ICE DX).
- [ ] Validate all 15 contract specifications and last-verified timestamps.
- [ ] Add `LIVE API`/`SNAPSHOT`/`DELAYED`/`OFFICIAL LINK`/`SEARCH LINK`/`PAYWALL`/`MANUAL`/`STALE`/`UNAVAILABLE` labels.
- [ ] Canonical/OG/Twitter/breadcrumb/schema/sitemap fixes.
- [ ] API gateway with allow-list, timeouts, error and freshness states.
- [ ] Secure Supabase RLS before public user data launch.

### P1 — core product value

- [ ] Official macro calendar adapters and revision detection.
- [ ] CFTC COT history and visualisation.
- [ ] SEC filing explorer and selected issuer monitor.
- [ ] EIA energy data and BEA macro data.
- [ ] Builder.io lesson/research models with full editorial requirements.
- [ ] Verified video/playlist mapping and Academy diagrams/quizzes.
- [ ] Cloud journal/watchlist/lesson sync.
- [ ] Data-health dashboard and alerting.
- [ ] Cross-market correlation dashboard with correct sampling.

### P2 — advanced

- [ ] BPR and exchange volume/OI history.
- [ ] Forecast/prediction research where lawful and authorised.
- [ ] Paid/licensed futures quotes and order-flow datasets.
- [ ] Paper trading/replay and backtesting engine.
- [ ] AI-assisted source-cited brief with evaluation harness.

## 15. Cost and free-tier strategy

### 15.1 Desired operating budget

**Target for prototype:** $0/month recurring infrastructure where account terms allow, excluding domain purchase and any paid APIs/licences. This is a target, not a promise that every deployment stays free.

| Service | Free-first setup | Cost trigger / caveat |
|---|---|---|
| GitHub | Free repo and CI where quota permits | Private Actions included minutes/storage vary; public runner policy and repository security matter. |
| Vercel | Hobby for personal/non-commercial prototype | Hobby is non-commercial; commercial project needs eligible paid plan or host migration. |
| Supabase | Free project for MVP and test database | Free inactivity pause; quotas/backups/production uptime may require paid plan. |
| Builder.io | Free account for small editorial authoring | Credits, seats, editor/preview capabilities and Content plan limits may force upgrade. |
| Cloudflare | Free DNS, Workers, KV, Turnstile; R2 free allowance | Usage caps; Worker CPU, Cron count, request volume and storage operations constrained. |
| Domain | Temporary provider subdomain | Custom `.com`/`.net`/etc usually costs annually; not included in free hosting. |
| Data APIs | Public/free registration APIs | Quotas, terms, redistribution/commercial use and symbol coverage vary. |
| CME/ICE | Official delayed links / embeds where permitted | Real-time, depth and redistribution normally require licensing/vendor fees. |
| Email/push | Local/in-app first | Delivery provider/domain verification/scale can incur cost. |

### 15.2 Plan-specific caveats verified on 8 Nov 2026

- Vercel Hobby is free but documented for personal, non-commercial use. Do not use it as a commercial production plan.
- Cloudflare Workers Free is currently listed at 100,000 requests/day and 10 ms CPU/invocation, with five Cron Triggers per account. This is sufficient for a small MVP if jobs are short and bounded, not an unlimited server.
- Cloudflare KV Free has daily read/write limits; avoid using it as a write-heavy database.
- Cloudflare D1 free tier is generous for a small prototype, but deliberately not selected as the primary DB because Supabase Postgres is the chosen relational store.
- Cloudflare R2 Standard has a free monthly storage/operation allowance and egress-free policy under current docs; verify before storing larger public datasets.
- Supabase Free projects can pause after low activity for around seven days; not a 24/7 SLA.
- Builder's pricing page currently lists a Free plan and monthly credit constraints. Exact CMS delivery/role requirements need confirmation inside the selected product plan.

### 15.3 Hard stop rules for cost control

- No paid plan upgrade without a usage report and explicit approval.
- No exchange-data purchase without a separate licence/use-case review.
- Set provider and Cloudflare quotas/alerts; stop expensive polling before limit exhaustion.
- Do not enable a billing-overage feature by default.
- Use cached responses and a single scheduler.
- Do not put user secrets or API tokens in Builder, frontend, public JSON or Git history.

## 16. What can be done automatically and what requires one-time account action

The intention is that implementation and routine configuration are handled by the build process, not that access, credentials, legal approvals or billing can be bypassed.

### Currently observed account state (8 Nov 2026)

| Tool | Observed state | Next action |
|---|---|---|
| GitHub | Connected; `whizz444yt-ux/new.w` exists, public, default branch `main`, size 0 (empty) | Create a **new** repository named `finance-intelligence-os`; do not reuse `new.w` as production unless deliberately approved. The currently available GitHub connector exposes repository listing and file/git-object operations but no create-repository action, so repository creation/push cannot truthfully be marked complete through this connector today. |
| Vercel | Connected; project list empty | Once new repo exists, create and link Astro project; verify account/plan suitability. |
| Supabase | Connected; project list empty; one organisation observed | Project provisioning requires organisation selection and cost confirmation if a non-zero cost is quoted. Do not create until cost and region are confirmed by the tool flow. |
| Cloudflare | Connected; authenticated identity returned; one account available | Inspect account permissions and zones; create Worker/KV/R2 only after domain/account selection. |
| Builder.io | No Builder.io connector/action found in the available tool list | Create/choose Builder Content Space and supply public Content API key; private automation token only if write automation is needed. Agent-Native Design is a separate tool and is not Builder.io. |

### What the automation can do after access is in place

- Generate the full source project, migrations, Worker, tests, CMS models, deployment configs and documentation.
- Push files/commits to a repository if GitHub write capability and target repository are available.
- Link the repository to Vercel and configure Preview/Production variables after the project exists.
- Create Supabase schema and RLS migrations once a project and approved organisation are selected.
- Configure Cloudflare Worker/cron/bindings when the account permissions allow.
- Validate builds, run tests, inspect logs and correct failures.

### What cannot honestly be done without your action/approval

- Accepting non-zero billing, domain purchase or paid data licences.
- Creating a new repository if the currently available GitHub connector does not expose that action and no authenticated Git CLI/push route exists.
- Authorising OAuth or generating Builder API credentials inside your private account if no Builder connector/account tool exists.
- Accepting terms, completing two-factor login, domain ownership verification or email confirmation.
- Legal determination of India eligibility for financial/prediction products.

The goal is to minimise your steps and do every safe, permitted setup action automatically, but these boundaries cannot be skipped or represented as already completed.

## 17. Domain, environments and DNS

Use three environment groups:

- `local` — mock fixtures and local Supabase/Worker emulation where possible;
- `preview` — Vercel Preview + non-production Supabase schema/project and Cloudflare Worker staging environment;
- `production` — production domain, production Supabase and Worker environment.

Do not use production service-role or private API credentials in Preview. Preview URLs should be noindex and CORS-restricted.

DNS sequence:

1. Select a domain or use the Vercel preview URL temporarily.
2. Add domain to Vercel and complete its requested DNS/ownership validation.
3. Configure Cloudflare DNS and SSL mode according to Vercel's current integration guidance; initially use DNS-only while validating origin and TLS, then enable proxy only after confirming correct host routing and certificate behaviour.
4. Enforce HTTPS and canonical redirect.
5. Verify API subdomain `api.<domain>` points to Cloudflare Worker.
6. Verify `www`/apex canonical policy and redirects.

## 18. Operations and monitoring

- `GET /health` indicates Worker process health only; provider availability is shown separately.
- Maintain provider dashboard: last attempt, last successful data, latency, last error category, data age, stale threshold and backoff state.
- Maintain job dashboard: job name, schedule, started/finished, retry count, records inserted/updated/skipped, payload hash and status.
- Alerts for repeated failures, stale critical records, API quota exhaustion, schema drift, CMS webhook failures and Supabase pause/outage.
- Maintain runbooks for key rotation, data-provider outage, rollback, CMS outage, failed deployment, corrupt dataset recovery and user data export.
- No claim of 24/7 if the system is only on a free tier with provider and scheduler limitations. Website uptime and data freshness are separately reported metrics.

## 19. Decisions locked for the first build

1. New repo name: `finance-intelligence-os`.
2. Preserve ICT Futures Intelligence OS as a dedicated module, not the whole product identity.
3. Astro + React + TypeScript frontend, static-first SEO.
4. Vercel for initial frontend deployment; Cloudflare for edge/API/cron/security.
5. Supabase Postgres/Auth/RLS as the only primary relational database.
6. Builder.io for editorial CMS only; structured numerical finance data remains in typed datasets/database.
7. One Cloudflare Cron dispatcher; no duplicate scheduled collectors in Vercel and GitHub Actions.
8. Free-first, but no guarantee of zero cost for commercial use, paid data or guaranteed uptime.
9. No unauthorised scraping, paywall bypass, private-channel ingestion or India geo-restriction circumvention.
10. No “live” label without current entitled API data and visible timestamps.

## 20. Acceptance checklist for a complete release

- [ ] New GitHub repo exists with reproducible build and full source; old docs and data retained.
- [ ] Vercel Preview and Production deployments work from the new repo.
- [ ] Cloudflare Worker, DNS, health endpoint, cache and cron dispatcher work in the correct environment.
- [ ] Supabase schema, Auth and RLS tests pass; data export/deletion works.
- [ ] Builder models, Content API, preview and fallback export function.
- [ ] All 15 futures families have verified specifications and correct exchange-specific sources.
- [ ] All 76 Academy lessons have required provenance, references, examples and review status before being marked complete.
- [ ] Calendar exact ranges, ET/IST and DST tests pass.
- [ ] API adapters store source IDs, timestamps and licensing metadata.
- [ ] All data cards have honest freshness/status labels.
- [ ] Risk calculations account for fee/slippage semantics and expiry selection.
- [ ] SEO validation passes on all indexable routes.
- [ ] Playwright mobile/desktop critical paths pass.
- [ ] Accessibility, secret, dependency and RLS checks pass.
- [ ] Operational dashboards and rollback procedures are documented.
- [ ] No unapproved paid plan, API or licensing spend has been incurred.

---

## Appendix A — Official documentation and current plan references

Plan limits and API quotas change. The following links were checked for this 8 November 2026 planning snapshot; before implementation, retrieve the current page and pin the applicable plan/terms.

### Platform

- GitHub Actions billing and usage: https://docs.github.com/en/actions/concepts/billing-and-usage
- GitHub scheduled workflows: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Vercel limits: https://vercel.com/docs/limits
- Vercel project configuration: https://vercel.com/docs/project-configuration/vercel-json
- Supabase Free project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase billing/plans: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase pricing: https://supabase.com/pricing
- Builder.io pricing: https://www.builder.io/pricing
- Builder Content API: https://www.builder.io/c/docs/content-api
- Builder API authentication: https://www.builder.io/c/docs/api-authentication
- Builder GraphQL Content API: https://www.builder.io/c/docs/graphql-api
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Cron Triggers: https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Cloudflare KV limits: https://developers.cloudflare.com/kv/platform/limits/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Turnstile plans: https://developers.cloudflare.com/turnstile/plans/

### Data

- BLS API FAQ: https://www.bls.gov/developers/api_faqs.htm
- BEA API documentation: https://apps.bea.gov/API/docs/
- EIA Open Data API: https://www.eia.gov/opendata/documentation.php
- FRED API overview: https://fred.stlouisfed.org/docs/api/fred/overview.html
- FRED terms of use: https://fred.stlouisfed.org/docs/api/terms_of_use.html
- SEC developer resources/fair access: https://www.sec.gov/about/developer-resources
- CFTC COT reports: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
- New York Fed Markets Data: https://markets.newyorkfed.org/
- US Treasury Fiscal Data: https://fiscaldata.treasury.gov/api-documentation/
- Polymarket Gamma API: https://gamma-api.polymarket.com/docs
- Polymarket developer docs: https://docs.polymarket.com/
- Kalshi docs: https://docs.kalshi.com/
- YouTube playlistItems API: https://developers.google.com/youtube/v3/docs/playlistItems/list
- CME delayed quotes explanation: https://www.cmegroup.com/trading/about-quotes.html
- CME Data Services: https://dataservices.cmegroup.com/pages/home

### SEO

- Google canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google title links: https://developers.google.com/search/docs/appearance/title-link
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals

### Legal / India context retained from prior directory

- MeitY advisory supplied in the earlier research directory (25 Apr 2026): https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf
- India Code — Promotion and Regulation of Online Gaming Act, 2025: https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search
- SEBI insider-trading regulations: https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-prohibition-of-insider-trading-regulations-2015-last-amended-on-march-12-2025-_92672.html

---

## Appendix B — Preserved source documents

The full original Markdown files below are appended verbatim in the companion package and retained as separate files in `legacy/previous-markdown/`. The separate files are canonical for exact prior wording; the appended content here is also preserved for single-file archival use.



---

# Preserved original: ICT_Futures_Intelligence_OS_Technical_Audit_3_0.md

> The following is the original source document, preserved verbatim.

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



---

# Preserved original: Finance_Intelligence_Master_Directory.md

> The following is the original source document, preserved verbatim.

# Finance Intelligence Master Directory

**Consolidated from the three supplied text files.** Duplicate links removed; links grouped by purpose. Last legal-reference check: **26 October 2026**.

## How to read India availability

- **Public research/data** means the site is a research source or provides publicly viewable information. It does not guarantee free access, real-time feeds, API rights, or that every financial product/transaction is permitted in India.
- **Blocked / not cleared for real-money use** is intentionally conservative. Polymarket is named in the Government of India MeitY advisory dated 25 April 2026. Kalshi and other offshore prediction-market products should not be assumed eligible merely because a website loads or a country is not listed. Do not use a VPN to bypass a platform or government restriction.
- Publicly disclosed insider trades and filings are different from confidential material non-public information. This directory covers public research sources, not obtaining stolen leaks or unpublished price-sensitive information.

Official legal references: [MeitY advisory (25 Apr 2026)](https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf) · [Promotion and Regulation of Online Gaming Act, 2025 — India Code](https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search) · [SEBI insider-trading regulations](https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-prohibition-of-insider-trading-regulations-2015-last-amended-on-march-12-2025-_92672.html)

## India Markets

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| NSE India | [Open](https://www.nseindia.com/) | India equity markets, derivatives, indices and exchange information. | Public research; some data has terms/latency restrictions. |
| BSE India | [Open](https://www.bseindia.com/) | Sensex, listed companies, corporate announcements and financial results. | Official/public. |
| SEBI | [Open](https://www.sebi.gov.in/) | Indian securities regulator: regulations, orders, enforcement and disclosures. | Official/public. |
| NSE Large Deals | [Open](https://www.nseindia.com/market-data/large-deals) | Disclosed bulk deals and block deals. | Public; interpret context and transaction type. |
| NSE All Reports | [Open](https://www.nseindia.com/all-reports) | Bhavcopy, market reports and available trading datasets. | Public; data-use terms may apply. |
| NSE Corporate Filings | [Open](https://www.nseindia.com/companies-listing/corporate-filings) | Listed-company announcements and filings. | Official/public. |
| NSE Insider Trading Disclosures | [Open](https://www.nseindia.com/companies-listing/corporate-filings-insider-trading) | Publicly disclosed insider-trading reports. | Official/public; not private insider information. |
| NSE Option Chain | [Open](https://www.nseindia.com/option-chain) | Strike-level options prices and open interest. | Public; live-data conditions may apply. |
| NSE Live Equity Market | [Open](https://www.nseindia.com/market-data/live-equity-market) | Equity prices and market activity. | Public; some feeds may be delayed. |
| SEBI Investor Support | [Open](https://investor.sebi.gov.in/Investor-support.html) | Investor support and registered-intermediary resources. | Official/public. |
| RBI Database on Indian Economy | [Open](https://data.rbi.org.in/DBIE/) | Indian monetary, banking and macroeconomic statistics. | Official/public. |

## India Screeners

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| Screener.in | [Open](https://www.screener.in/) | Financial statements, valuation ratios and custom company screens. | Freemium. |
| Trendlyne | [Open](https://trendlyne.com/) | Stock analytics, screeners, alerts and financial research. | Freemium/paid features. |
| Tickertape | [Open](https://www.tickertape.in/) | Indian stock screening and fundamental research. | Freemium. |
| Moneycontrol | [Open](https://www.moneycontrol.com/) | Indian market news, financials and market coverage. | Freemium. |
| Economic Times Markets | [Open](https://economictimes.indiatimes.com/markets) | Indian markets, corporate news and economic updates. | Freemium. |
| Mint Markets | [Open](https://www.livemint.com/market) | Business news, markets and financial analysis. | Freemium. |

## Global News

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| Reuters Markets | [Open](https://www.reuters.com/markets/) | Global financial news, macro events and company developments. | Public access; some content may be restricted. |
| Bloomberg Markets | [Open](https://www.bloomberg.com/markets) | Global equities, bonds, currencies, commodities and macro analysis. | Freemium/paid. |
| CNBC | [Open](https://www.cnbc.com/) | US/global markets, earnings and business commentary. | Public/freemium. |
| Financial Times Markets | [Open](https://www.ft.com/markets) | Global finance, economics and institutional analysis. | Paid/freemium. |
| Yahoo Finance | [Open](https://finance.yahoo.com/) | Quotes, company financials, watchlists and news. | Freemium. |
| Investing.com | [Open](https://www.investing.com/) | Economic calendar, FX, Gold, commodities and market news. | Freemium. |
| MarketWatch | [Open](https://www.marketwatch.com/) | US stocks and financial commentary. | Freemium. |
| Business Wire | [Open](https://www.businesswire.com/news/home) | Company releases, earnings announcements and corporate events. | Public releases; data services may be paid. |
| GlobeNewswire | [Open](https://www.globenewswire.com/) | Company press releases and financial results. | Public. |
| PR Newswire | [Open](https://www.prnewswire.com/news-releases/) | Company releases, acquisitions, earnings and business events. | Public releases; services may be paid. |
| Accesswire | [Open](https://www.accesswire.com/) | Corporate news and public-company press releases. | Public. |
| Quartr earnings calls | [Open](https://quartr.com/features/live-calls-and-transcripts) | Earnings calls, transcripts and management commentary. | Freemium/paid features. |
| Nasdaq Earnings Calendar | [Open](https://www.nasdaq.com/market-activity/earnings) | Upcoming and reported earnings. | Public. |
| GDELT Project | [Open](https://www.gdeltproject.org/) | Global news and event monitoring for research and AI workflows. | Public data tools. |
| Dow Jones Professional | [Open](https://www.dowjones.com/professional/) | Professional financial news and information products. | Paid/conditional. |
| Factiva | [Open](https://professional.dowjones.com/factiva/) | Business-news archive and corporate information search. | Paid/conditional. |
| Benzinga Pro | [Open](https://www.benzinga.com/pro) | Market-moving news and event-driven trading research. | Paid/conditional. |
| Financial Juice | [Open](https://www.financialjuice.com/) | Financial news feed and market-event coverage. | Access varies. |
| AlphaSense | [Open](https://www.alpha-sense.com/) | AI-assisted search across research, filings and transcripts. | Paid/conditional. |

## Forecasting & Event Data

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| Metaculus | [Open](https://www.metaculus.com/) | Crowd forecasts on economic, political, scientific and technology questions. | Forecasting platform; check specific tournament/prize terms. |
| Good Judgment Open | [Open](https://www.gjopen.com/) | Community forecasting on political, economic and technology events. | Forecasting research. |
| Manifold Markets | [Open](https://manifold.markets/) | Community probabilities on news, politics, markets and technology. | Play-money forecasts; some prize features may have separate terms. |
| Polymarket market data/docs | [Open](https://docs.polymarket.com/) | Developer documentation for prediction-market data. | Public documentation only; do not infer real-money eligibility in India. |
| Kalshi | [Open](https://kalshi.com/) | US event-contract marketplace; market data and event descriptions. | India real-money eligibility/legal clearance not established here; verify before any use. |

## Global Company Filings

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| SEC EDGAR | [Open](https://www.sec.gov/edgar/search/) | Original US public-company filings, earnings, risks and material events. | Official/public. |
| SEC Insider Transaction Datasets | [Open](https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets) | Structured data from reported Forms 3, 4 and 5. | Official/public; disclosed after filing. |
| SEC Form 13F Datasets | [Open](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets) | Institutional holdings from periodic filings. | Official/public; time-lagged snapshots. |
| SEC Investment Research Guide | [Open](https://www.sec.gov/search-filings/edgar-search-assistance/using-edgar-research-investments) | Guide to interpreting SEC filings. | Official/public. |
| London Stock Exchange News | [Open](https://www.londonstockexchange.com/en/news) | UK listed-company news and RNS announcements. | Public; some data services paid. |
| SEDAR+ Canada | [Open](https://www.sedarplus.ca/) | Canadian public securities filings. | Official/public. |
| HKEXnews | [Open](https://www.hkexnews.hk/) | Hong Kong listed-company results, dividends and disclosures. | Official/public. |
| Japan EDINET | [Open](https://disclosure2.edinet-fsa.go.jp/) | Japanese regulatory financial disclosures. | Official/public. |
| ASX Announcements | [Open](https://www.asx.com.au/markets/trade-our-cash-market/announcements) | Australian listed-company announcements and reports. | Official/public. |
| Singapore Exchange | [Open](https://www.sgx.com/securities) | Singapore-listed securities and market information. | Official/public. |
| South Korea DART | [Open](https://englishdart.fss.or.kr/) | Korean corporate regulatory disclosures. | Official/public. |
| ESMA | [Open](https://www.esma.europa.eu/) | European securities regulation, registers and supervisory information. | Official/public; not a single universal filings portal. |

## Insider & Institutional Research

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| OpenInsider | [Open](http://openinsider.com/) | Search and compare reported US insider transactions. | Third-party; verify original filings. |
| WhaleWisdom | [Open](https://whalewisdom.com/) | Institutional holdings and 13F portfolio research. | Freemium/paid; periodic data. |
| Dataroma | [Open](https://www.dataroma.com/) | Selected prominent investors’ reported holdings. | Public; selected coverage only. |
| Quiver Quantitative | [Open](https://www.quiverquant.com/) | Alternative datasets and public-disclosure analytics. | Freemium/paid; verify timestamps. |
| Capitol Trades | [Open](https://www.capitoltrades.com/) | Reported US Congress members’ transactions. | Third-party; different from corporate-insider filings. |
| Finviz | [Open](https://finviz.com/) | US stock screeners, technical and fundamental filters. | Freemium/paid. |
| Koyfin | [Open](https://www.koyfin.com/) | Charts, macro research, company comparison and watchlists. | Freemium/paid. |
| MarketScreener | [Open](https://www.marketscreener.com/) | Company news, financial results and analyst-consensus research. | Freemium/paid. |

## Macro & Central Banks

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| Federal Reserve Calendar | [Open](https://www.federalreserve.gov/newsevents/calendar.htm) | FOMC meetings, policy announcements and Fed events. | Official/public. |
| US BLS Release Calendar | [Open](https://www.bls.gov/schedule/news_release/) | US CPI, employment, unemployment and labour data. | Official/public. |
| BEA Release Schedule | [Open](https://www.bea.gov/news/schedule) | GDP, PCE inflation, income and spending releases. | Official/public. |
| US Census Economic Indicators | [Open](https://www.census.gov/economic-indicators/calendar) | Retail sales, inventories, trade and housing data. | Official/public. |
| US Treasury Interest Rates | [Open](https://home.treasury.gov/resource-center/data-chart-center/interest-rates) | Treasury yields and interest-rate series. | Official/public. |
| ECB Data Portal | [Open](https://data.ecb.europa.eu/) | Euro-area rates, inflation and monetary statistics. | Official/public. |
| Bank of England Statistics | [Open](https://www.bankofengland.co.uk/statistics) | UK banking, monetary and economic statistics. | Official/public. |
| Bank of Japan Statistics | [Open](https://www.boj.or.jp/en/statistics/) | Japanese monetary and economic indicators. | Official/public. |
| BIS Statistics | [Open](https://www.bis.org/statistics/) | International banking, debt and global credit statistics. | Official/public. |
| IMF Data | [Open](https://data.imf.org/) | Cross-country macroeconomic and financial datasets. | Public; some datasets/access conditions vary. |
| World Bank Data | [Open](https://data.worldbank.org/) | Country-level economic and development indicators. | Public. |
| OECD Data Explorer | [Open](https://data-explorer.oecd.org/) | Comparable statistics for countries and economies. | Public. |
| Eurostat Database | [Open](https://ec.europa.eu/eurostat/data/database) | European Union official statistics. | Official/public. |
| FRED Economic Data | [Open](https://fred.stlouisfed.org/) | Historical yields, inflation, credit spreads and financial series. | Public; API terms apply. |
| TradingView Economic Calendar | [Open](https://www.tradingview.com/economic-calendar/) | Upcoming events and actual/previous economic readings. | Freemium. |
| Trading Economics Calendar | [Open](https://tradingeconomics.com/calendar) | Country indicators, forecasts and historical releases. | Freemium/paid. |
| CME FedWatch | [Open](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html) | Market-implied Fed rate expectations from futures. | Public tool; interpret as market-implied probability. |
| US Treasury Fiscal Data | [Open](https://fiscaldata.treasury.gov/) | Federal debt, Treasury auctions and public finance datasets. | Official/public. |

## Bonds, Volatility & Options

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| FINRA Fixed Income Data | [Open](https://www.finra.org/finra-data/fixed-income) | US fixed-income market information. | Public/conditional datasets. |
| FINRA TRACE | [Open](https://www.finra.org/finra-data/fixed-income/trace) | Reported transactions in covered US bond markets. | Data scope and delay vary. |
| SIFMA Research | [Open](https://www.sifma.org/resources/research/) | Bond markets, securities-industry and market statistics. | Public reports. |
| Cboe VIX | [Open](https://www.cboe.com/tradable_products/vix/) | S&P 500 options-derived expected-volatility index. | Public information; data products may be paid. |
| CFTC Market Reports | [Open](https://www.cftc.gov/MarketReports/index.htm) | Futures positioning, swaps and derivatives reports. | Official/public; many reports are delayed. |
| CFTC COT Reports | [Open](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) | Reported futures positioning by trader categories. | Official/public; not real-time order flow. |
| FINRA ATS Transparency | [Open](https://www.finra.org/finra-data/browse-catalog/ats-transparency-data) | Reported activity for US alternative trading systems. | Reported/aggregated data; not a live dark-pool tape. |
| FINRA Short Sale Volume | [Open](https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data) | Short-sale volume datasets. | Not the same as short interest. |
| Nasdaq Short Interest | [Open](https://www.nasdaqtrader.com/Trader.aspx?id=ShortInterest) | Reported short-interest information. | Periodic reporting. |
| OCC Options Volume & Open Interest | [Open](https://www.theocc.com/market-data/market-data-reports/volume-and-open-interest) | Listed options volume and open interest. | Public reports; detailed data may be conditional. |
| Cboe DataShop | [Open](https://datashop.cboe.com/option-quote-intervals) | Options quote and intraday interval data. | Paid data product. |
| Unusual Whales | [Open](https://unusualwhales.com/) | Options activity and unusual-trading analytics. | Freemium/paid; flow is not necessarily directional. |
| Cheddar Flow | [Open](https://www.cheddarflow.com/) | Options-flow research and unusual activity. | Paid/conditional. |
| Unusual Flow | [Open](https://unusualflow.com/) | Options activity analytics. | Access/pricing varies. |
| CME Group | [Open](https://www.cmegroup.com/) | Futures, options, rates and commodity-market information. | Public/paid data products. |

## Commodities & Supply Data

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| EIA Weekly Petroleum Report | [Open](https://www.eia.gov/petroleum/supply/weekly/) | US crude inventories, production, refinery activity and balances. | Official/public. |
| EIA Open Data API | [Open](https://www.eia.gov/opendata/) | Energy datasets and API access. | Official/public; API key/limits may apply. |
| OPEC | [Open](https://www.opec.org/) | Oil-market reports and production information. | Official/public. |
| International Energy Agency | [Open](https://www.iea.org/reports/oil-market-report) | Oil demand, supply and market outlook. | Reports may have access conditions. |
| USDA WASDE | [Open](https://www.usda.gov/oce/commodity/wasde) | Global agricultural supply, demand and stocks estimates. | Official/public. |
| LBMA Prices & Data | [Open](https://www.lbma.org.uk/prices-and-data) | Precious-metal benchmarks and market data resources. | Some data is licensed/paid. |
| World Gold Council | [Open](https://www.gold.org/goldhub) | Gold demand, ETF flows and market research. | Public reports; some data services conditional. |
| London Metal Exchange Warehouse Data | [Open](https://www.lme.com/Market-data/Reports-and-data/Warehouse-and-stocks) | Industrial-metal warehouse and stock reports. | Some data products may be paid. |
| CME Commodity Markets | [Open](https://www.cmegroup.com/markets/commodities.html) | Commodity futures contracts, prices and exchange information. | Public/paid data products. |

## Crypto & On-chain

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| Arkham Intelligence | [Open](https://arkm.com/) | Wallet and known-entity blockchain intelligence. | Freemium/paid. |
| DeFiLlama | [Open](https://defillama.com/) | DeFi TVL, DEX volumes, stablecoins and protocol metrics. | Public; API/licensing terms apply. |
| Dune Analytics | [Open](https://dune.com/) | Blockchain SQL queries and custom dashboards. | Freemium/paid. |
| Etherscan | [Open](https://etherscan.io/) | Ethereum transactions, tokens, wallets and smart contracts. | Public; API limits apply. |
| Solscan | [Open](https://solscan.io/) | Solana wallets, transactions and token activity. | Public/paid API options. |
| Blockchain.com Explorer | [Open](https://www.blockchain.com/explorer) | Bitcoin and supported blockchain transaction exploration. | Public. |
| Whale Alert | [Open](https://whale-alert.io/) | Large crypto transaction alerts. | Freemium/paid. |
| CoinGlass | [Open](https://www.coinglass.com/) | Crypto open interest, funding, liquidations and derivatives metrics. | Freemium/paid. |
| CryptoQuant | [Open](https://cryptoquant.com/) | Exchange flows, miner activity and on-chain indicators. | Freemium/paid. |
| Glassnode | [Open](https://glassnode.com/) | On-chain metrics and holder behaviour. | Freemium/paid. |
| Nansen | [Open](https://www.nansen.ai/) | Wallet labels, token flows and wallet intelligence. | Paid/conditional. |
| Token Terminal | [Open](https://tokenterminal.com/) | Crypto-protocol fundamentals and financial metrics. | Freemium/paid. |
| Token Unlocks | [Open](https://token.unlocks.app/) | Scheduled token unlocks and supply events. | Public/paid features. |
| Bitcoin Mempool Explorer | [Open](https://mempool.space/) | Bitcoin transactions, mempool and network status. | Public. |
| Coinbase Developer Docs | [Open](https://docs.cdp.coinbase.com/) | Coinbase-supported APIs and developer integrations. | API access/terms vary. |
| Kraken API Docs | [Open](https://docs.kraken.com/api/) | Exchange market-data and trading APIs. | API terms and account eligibility apply. |

## APIs & Open Source

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| SEC EDGAR APIs | [Open](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | Company submissions and structured financial facts. | Official/public; follow fair-access requirements. |
| FRED API | [Open](https://fred.stlouisfed.org/docs/api/fred/) | Historical macroeconomic and financial time series. | Public API; terms/limits apply. |
| IMF Data APIs | [Open](https://data.imf.org/en/Resource-Pages/IMF-API) | International economic data integration. | Public/conditional by dataset. |
| World Bank Indicators API | [Open](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) | Country-level economic and development indicators. | Public. |
| Alpha Vantage API | [Open](https://www.alphavantage.co/documentation/) | Market data, FX, crypto, fundamentals and indicators. | Free/paid tiers and limits. |
| Finnhub API | [Open](https://finnhub.io/docs/api) | Market data, company information and news endpoints. | Free/paid tiers. |
| Twelve Data API | [Open](https://twelvedata.com/docs) | Stocks, Forex, crypto and technical time series. | Free/paid tiers. |
| Financial Modeling Prep | [Open](https://site.financialmodelingprep.com/developer/docs) | Financial statements, fundamentals and market data. | Free/paid tiers. |
| Nasdaq Data Link | [Open](https://docs.data.nasdaq.com/) | Financial and alternative datasets. | Dataset licensing/pricing varies. |
| Trading Economics API | [Open](https://docs.tradingeconomics.com/get_started/) | Economic calendar, indicators, yields and related datasets. | Paid/conditional limits. |
| DeFiLlama API | [Open](https://api-docs.defillama.com/) | Supported DeFi protocol and TVL metrics. | Endpoint terms vary. |
| CoinGlass API | [Open](https://docs.coinglass.com/reference/getting-started-with-your-api) | Crypto derivatives, funding, open interest and liquidation data. | API key/paid limits may apply. |
| Fincept Terminal GitHub | [Open](https://github.com/Fincept-Corporation/FinceptTerminal) | Open-source financial terminal and analytics application. | Open source; check current license and setup. |
| TradingAgents GitHub | [Open](https://github.com/TauricResearch/TradingAgents) | Multi-agent LLM financial research framework. | Open source; check current license and requirements. |
| OpenBB GitHub | [Open](https://github.com/OpenBB-finance/OpenBB) | Financial data and research infrastructure. | Open source/platform terms vary. |

## Professional Terminals

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| Bloomberg Professional | [Open](https://www.bloomberg.com/professional/) | Professional multi-asset data, news and analytics. | Paid. |
| LSEG Workspace | [Open](https://www.lseg.com/en/data-analytics/products/workspace) | Financial-market data, company information and analytics. | Paid. |
| FactSet | [Open](https://www.factset.com/) | Institutional financial data, estimates and investment research. | Paid. |
| S&P Capital IQ | [Open](https://www.spglobal.com/marketintelligence/en/solutions/sp-capital-iq-platform) | Company financials, corporate events and financial analysis. | Paid. |

## India Restricted / Not Cleared

| Website | Link | What it is useful for | Access / caveat |
|---|---|---|---|
| MeitY advisory: blocked prediction/betting platforms | [Open](https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf) | Official 25 Apr 2026 advisory names Polymarket and discusses access blocks and VPN circumvention. | Reference only; do not use to bypass restrictions. |
| Promotion and Regulation of Online Gaming Act, 2025 | [Open](https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search) | Indian legislation relevant to online money gaming; consult authoritative text and legal advice. | Official legal reference. |
| MeitY Act & Policies page | [Open](https://www.meity.gov.in/documents/act-and-policies) | Official source for the Act, rules and amendments. | Official/public. |
| SEBI Insider Trading Regulations | [Open](https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-prohibition-of-insider-trading-regulations-2015-last-amended-on-march-12-2025-_92672.html) | Indian rules on insider trading and unpublished price-sensitive information. | Official legal reference. |
| Polymarket Geographic Restrictions | [Open](https://help.polymarket.com/en/articles/13364163-geographic-restrictions) | Platform rules on restricted locations and VPN circumvention. | Do not bypass geo-restrictions; India status in government advisory is separate. |
| Kalshi International Eligibility | [Open](https://help.kalshi.com/en/articles/14026044-can-i-trade-on-kalshi-from-outside-the-united-states) | Platform states international eligibility depends on its Member Agreement and local law. | Do not assume Indian real-money eligibility; verify legal clearance. |

## Recommended daily workflow

1. Check the economic calendar and central-bank releases.
2. Read original filings and company releases before relying on summaries.
3. Compare actual figures with consensus, previous values and revisions.
4. Cross-check public positioning and flow data with timestamps and definitions.
5. Check market reaction across relevant assets (for example USD, Treasury yields, Gold, oil, indices and BTC).
6. Log the source URL, event time, retrieval time and thesis; treat all signals as evidence, not guaranteed predictions.

**Coding note:** Before integrating an API, verify coverage, latency, historical depth, rate limits, personal/commercial-use rights and redistribution licensing. Do not infer that public website access includes permission to scrape or republish data.


---

# Preserved original: Finance_Intelligence_OS_Expanded_Global_Directory.md

> The following is the original source document, preserved verbatim.

# Finance Intelligence OS — Expanded Global Directory

**Updated:** 26 October 2026 · **Unique resources:** 316 · **Categories:** 24

> Scope note: This is an expanded curated directory, not a literal index of the entire internet. It links to public-interest investigative reporting and lawful public sources, not stolen credential dumps or hacked private databases. A platform’s website being reachable does not make its real-money use legal from India.

## India access / legal note

MeitY 25 April 2026 advisory: https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf
PROG Act, 2025: https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search
Prediction market directory: https://predictionmarketsindex.com/platforms/

## Resource index

### APIs & Developer Resources

| Resource | Description | Access / caveat |
|---|---|---|
| [EOD Historical Data API](https://eodhd.com/financial-apis/) | Historical market prices, fundamentals, corporate events and related data. | Paid tiers; check exchange licensing. |
| [Marketstack API](https://marketstack.com/documentation) | REST API for stock-market data and historical EOD/intraday offerings. | Free/paid plans; latency/coverage vary. |
| [Tiingo API](https://www.tiingo.com/documentation/general/overview) | Financial data API for prices, fundamentals and news endpoints where available. | Account/plan and exchange terms apply. |
| [Polygon.io / Massive API](https://massive.com/docs) | Market-data APIs for stocks, options, indices, forex and crypto offerings. | Paid tiers and licensing apply. |
| [Intrinio](https://intrinio.com/documentation) | Financial data APIs for prices, fundamentals, estimates and institutional data products. | Paid/licensed. |
| [Tiingo IEX/News API docs](https://www.tiingo.com/documentation) | API documentation for supported market data and news. | Data entitlements vary. |
| [Stocktwits API / developer information](https://api.stocktwits.com/developers) | Social sentiment and symbol conversation integration where API access is offered. | Review access status and platform terms. |
| [X API Documentation](https://developer.x.com/en/docs) | Official developer docs for social posts, search and account data subject to current access tiers. | Paid access/rate limits; comply with platform terms. |
| [Google News RSS search](https://news.google.com/) | News discovery from many publishers; use query terms, then open original publisher. | Aggregation and availability vary; not all publishers permit reuse. |
| [World Bank API: Indicators](https://api.worldbank.org/) | Programmatic country/indicator access for macroeconomic comparisons. | Public API; query and usage conventions apply. |
| [UN Comtrade API](https://comtradeapi.un.org/) | Programmatic international trade data queries. | Registration/limits may apply. |
| [OpenBB Documentation](https://docs.openbb.co/) | Integration patterns for market/macro data and financial research workflows. | Provider entitlements still apply. |
| [SEC XBRL Company Facts API](https://www.sec.gov/edgar/sec-api-documentation) | Structured company facts and filings for quantitative fundamentals. | Official US source; fair access and data terms apply. |

### APIs & Open Source

| Resource | Description | Access / caveat |
|---|---|---|
| [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) | Company submissions and structured financial facts. | Official/public; follow fair-access requirements. |
| [FRED API](https://fred.stlouisfed.org/docs/api/fred/) | Historical macroeconomic and financial time series. | Public API; terms/limits apply. |
| [IMF Data APIs](https://data.imf.org/en/Resource-Pages/IMF-API) | International economic data integration. | Public/conditional by dataset. |
| [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) | Country-level economic and development indicators. | Public. |
| [Alpha Vantage API](https://www.alphavantage.co/documentation/) | Market data, FX, crypto, fundamentals and indicators. | Free/paid tiers and limits. |
| [Finnhub API](https://finnhub.io/docs/api) | Market data, company information and news endpoints. | Free/paid tiers. |
| [Twelve Data API](https://twelvedata.com/docs) | Stocks, Forex, crypto and technical time series. | Free/paid tiers. |
| [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs) | Financial statements, fundamentals and market data. | Free/paid tiers. |
| [Nasdaq Data Link](https://docs.data.nasdaq.com/) | Financial and alternative datasets. | Dataset licensing/pricing varies. |
| [Trading Economics API](https://docs.tradingeconomics.com/get_started/) | Economic calendar, indicators, yields and related datasets. | Paid/conditional limits. |
| [DeFiLlama API](https://api-docs.defillama.com/) | Supported DeFi protocol and TVL metrics. | Endpoint terms vary. |
| [CoinGlass API](https://docs.coinglass.com/reference/getting-started-with-your-api) | Crypto derivatives, funding, open interest and liquidation data. | API key/paid limits may apply. |
| [Fincept Terminal GitHub](https://github.com/Fincept-Corporation/FinceptTerminal) | Open-source financial terminal and analytics application. | Open source; check current license and setup. |
| [TradingAgents GitHub](https://github.com/TauricResearch/TradingAgents) | Multi-agent LLM financial research framework. | Open source; check current license and requirements. |
| [OpenBB GitHub](https://github.com/OpenBB-finance/OpenBB) | Financial data and research infrastructure. | Open source/platform terms vary. |

### Bonds, Volatility & Options

| Resource | Description | Access / caveat |
|---|---|---|
| [FINRA Fixed Income Data](https://www.finra.org/finra-data/fixed-income) | US fixed-income market information. | Public/conditional datasets. |
| [FINRA TRACE](https://www.finra.org/finra-data/fixed-income/trace) | Reported transactions in covered US bond markets. | Data scope and delay vary. |
| [SIFMA Research](https://www.sifma.org/resources/research/) | Bond markets, securities-industry and market statistics. | Public reports. |
| [Cboe VIX](https://www.cboe.com/tradable_products/vix/) | S&P 500 options-derived expected-volatility index. | Public information; data products may be paid. |
| [CFTC Market Reports](https://www.cftc.gov/MarketReports/index.htm) | Futures positioning, swaps and derivatives reports. | Official/public; many reports are delayed. |
| [CFTC COT Reports](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) | Reported futures positioning by trader categories. | Official/public; not real-time order flow. |
| [FINRA ATS Transparency](https://www.finra.org/finra-data/browse-catalog/ats-transparency-data) | Reported activity for US alternative trading systems. | Reported/aggregated data; not a live dark-pool tape. |
| [FINRA Short Sale Volume](https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data) | Short-sale volume datasets. | Not the same as short interest. |
| [Nasdaq Short Interest](https://www.nasdaqtrader.com/Trader.aspx?id=ShortInterest) | Reported short-interest information. | Periodic reporting. |
| [OCC Options Volume & Open Interest](https://www.theocc.com/market-data/market-data-reports/volume-and-open-interest) | Listed options volume and open interest. | Public reports; detailed data may be conditional. |
| [Cboe DataShop](https://datashop.cboe.com/option-quote-intervals) | Options quote and intraday interval data. | Paid data product. |
| [Unusual Whales](https://unusualwhales.com/) | Options activity and unusual-trading analytics. | Freemium/paid; flow is not necessarily directional. |
| [Cheddar Flow](https://www.cheddarflow.com/) | Options-flow research and unusual activity. | Paid/conditional. |
| [Unusual Flow](https://unusualflow.com/) | Options activity analytics. | Access/pricing varies. |
| [CME Group](https://www.cmegroup.com/) | Futures, options, rates and commodity-market information. | Public/paid data products. |

### Commodities & Supply Data

| Resource | Description | Access / caveat |
|---|---|---|
| [EIA Weekly Petroleum Report](https://www.eia.gov/petroleum/supply/weekly/) | US crude inventories, production, refinery activity and balances. | Official/public. |
| [EIA Open Data API](https://www.eia.gov/opendata/) | Energy datasets and API access. | Official/public; API key/limits may apply. |
| [OPEC](https://www.opec.org/) | Oil-market reports and production information. | Official/public. |
| [International Energy Agency](https://www.iea.org/reports/oil-market-report) | Oil demand, supply and market outlook. | Reports may have access conditions. |
| [USDA WASDE](https://www.usda.gov/oce/commodity/wasde) | Global agricultural supply, demand and stocks estimates. | Official/public. |
| [LBMA Prices & Data](https://www.lbma.org.uk/prices-and-data) | Precious-metal benchmarks and market data resources. | Some data is licensed/paid. |
| [World Gold Council](https://www.gold.org/goldhub) | Gold demand, ETF flows and market research. | Public reports; some data services conditional. |
| [London Metal Exchange Warehouse Data](https://www.lme.com/Market-data/Reports-and-data/Warehouse-and-stocks) | Industrial-metal warehouse and stock reports. | Some data products may be paid. |
| [CME Commodity Markets](https://www.cmegroup.com/markets/commodities.html) | Commodity futures contracts, prices and exchange information. | Public/paid data products. |

### Crypto & On-chain

| Resource | Description | Access / caveat |
|---|---|---|
| [Arkham Intelligence](https://arkm.com/) | Wallet and known-entity blockchain intelligence. | Freemium/paid. |
| [DeFiLlama](https://defillama.com/) | DeFi TVL, DEX volumes, stablecoins and protocol metrics. | Public; API/licensing terms apply. |
| [Dune Analytics](https://dune.com/) | Blockchain SQL queries and custom dashboards. | Freemium/paid. |
| [Etherscan](https://etherscan.io/) | Ethereum transactions, tokens, wallets and smart contracts. | Public; API limits apply. |
| [Solscan](https://solscan.io/) | Solana wallets, transactions and token activity. | Public/paid API options. |
| [Blockchain.com Explorer](https://www.blockchain.com/explorer) | Bitcoin and supported blockchain transaction exploration. | Public. |
| [Whale Alert](https://whale-alert.io/) | Large crypto transaction alerts. | Freemium/paid. |
| [CoinGlass](https://www.coinglass.com/) | Crypto open interest, funding, liquidations and derivatives metrics. | Freemium/paid. |
| [CryptoQuant](https://cryptoquant.com/) | Exchange flows, miner activity and on-chain indicators. | Freemium/paid. |
| [Glassnode](https://glassnode.com/) | On-chain metrics and holder behaviour. | Freemium/paid. |
| [Nansen](https://www.nansen.ai/) | Wallet labels, token flows and wallet intelligence. | Paid/conditional. |
| [Token Terminal](https://tokenterminal.com/) | Crypto-protocol fundamentals and financial metrics. | Freemium/paid. |
| [Token Unlocks](https://token.unlocks.app/) | Scheduled token unlocks and supply events. | Public/paid features. |
| [Bitcoin Mempool Explorer](https://mempool.space/) | Bitcoin transactions, mempool and network status. | Public. |
| [Coinbase Developer Docs](https://docs.cdp.coinbase.com/) | Coinbase-supported APIs and developer integrations. | API access/terms vary. |
| [Kraken API Docs](https://docs.kraken.com/api/) | Exchange market-data and trading APIs. | API terms and account eligibility apply. |

### Cyber Risk & Data Breach Monitoring

| Resource | Description | Access / caveat |
|---|---|---|
| [Have I Been Pwned](https://haveibeenpwned.com/) | Check whether an account/domain appears in known breaches and monitor verified domains. | Defensive use; do not search for or redistribute stolen credentials. |
| [Have I Been Pwned API docs](https://haveibeenpwned.com/API/v3) | Documented breach-exposure API including privacy-aware options. | API restrictions/key; use only with authorization. |
| [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | Official catalog of vulnerabilities known to be exploited in the wild. | Defensive cyber-risk research. |
| [CISA Cybersecurity Advisories](https://www.cisa.gov/news-events/cybersecurity-advisories) | Public technical advisories on cyber threats and mitigations. | Defensive use. |
| [The Record by Recorded Future](https://therecord.media/) | Cybercrime, ransomware, breaches and threat-intelligence journalism. | Published reporting; avoid treating allegations as proven. |
| [BleepingComputer Security News](https://www.bleepingcomputer.com/) | Cyber incidents, ransomware and breach reporting. | Published reporting; avoid raw stolen-data sources. |
| [KrebsOnSecurity](https://krebsonsecurity.com/) | Investigative cybersecurity reporting on fraud, cybercrime and financial abuse. | Journalism; validate claims with cited evidence. |
| [Chainalysis Research](https://www.chainalysis.com/blog/) | Crypto crime, illicit-flow typologies and blockchain investigation reports. | Research vendor; attribution can be probabilistic. |
| [TRM Labs Research](https://www.trmlabs.com/resources) | Blockchain intelligence, crypto crime and sanctions research. | Research/vendor reports; verify methodology. |
| [Elliptic Research](https://www.elliptic.co/blog) | Crypto compliance, illicit finance and blockchain investigation reporting. | Research/vendor reports; on-chain attribution is not always certain. |

### Flows, Sentiment & Alternative Data

| Resource | Description | Access / caveat |
|---|---|---|
| [Farside Investors — Bitcoin ETF Flows](https://farside.co.uk/btc/) | Daily US spot Bitcoin ETF flow table and historical series. | Secondary source; compare with issuer/exchange disclosures. |
| [SoSoValue](https://www.sosovalue.com/) | Crypto ETF flow dashboards, market charts and research. | Coverage and refresh time vary; verify methodology. |
| [CoinShares Digital Asset Fund Flows](https://coinshares.com/research/digital-asset-fund-flows/) | Periodic institutional digital-asset fund-flow research. | Report-based, not real-time fund positioning. |
| [ETF.com](https://www.etf.com/) | ETF research, holdings, flows and education. | Some datasets/features may be paid. |
| [VettaFi ETF Database](https://etfdb.com/) | ETF screening, holdings, sector exposure and category comparisons. | Coverage/latency varies. |
| [ETF.com ETF Fund Flows](https://www.etf.com/sections/etf-fund-flows) | Fund-flow reporting and ETF market trends. | Published flow analysis is not live order flow. |
| [Fintel](https://fintel.io/) | Short interest, institutional holdings, ownership and selected options metrics. | Freemium/paid; check source dates. |
| [Market Chameleon](https://marketchameleon.com/) | Options market statistics, unusual activity and volatility research. | Freemium/paid; US options focus. |
| [OptionStrat](https://optionstrat.com/) | Options payoff diagrams, strategy analysis and scenario testing. | Modeling tool, not proof of trade direction. |
| [Barchart](https://www.barchart.com/) | Stocks, futures, options, commodities and market-data screens. | Freemium/paid; delayed data can apply. |
| [ChartExchange](https://chartexchange.com/) | US equity market data, short-volume and related analytics. | Dataset definition and delays matter. |
| [Stock Analysis](https://stockanalysis.com/) | Financial statements, valuations, earnings calendars and stock screens. | Verify key metrics against company filings. |
| [Macrotrends](https://www.macrotrends.net/) | Historical company fundamentals, macro charts and valuation time series. | Secondary source; check restatements and definitions. |
| [S&P Dow Jones Indices](https://www.spglobal.com/spdji/en/) | Index methodology, factsheets and index data products. | Licensing applies to redistribution. |
| [MSCI Research & Indexes](https://www.msci.com/our-solutions/indexes) | Global equity/fixed-income indexes, country/sector exposures and research. | Some products require subscription/licensing. |
| [Morningstar](https://www.morningstar.com/) | Funds, ETFs, company analysis and portfolio research. | Freemium/paid. |
| [S&P Global Commodity Insights](https://www.spglobal.com/commodityinsights/en) | Professional commodity, energy and supply-chain market intelligence. | Paid; commercial data licensing. |
| [Kpler](https://www.kpler.com/) | Shipping, commodities and energy-flow intelligence. | Professional/paid; not all fields public. |
| [Freightos Baltic Index](https://fbx.freightos.com/) | Container freight rate benchmarks for supply-chain and macro research. | Some data/features may be paid. |
| [Baltic Exchange](https://www.balticexchange.com/) | Dry bulk, tanker and freight-market benchmarks. | Licensing/subscription applies for detailed data. |

### Forecasting & Event Data

| Resource | Description | Access / caveat |
|---|---|---|
| [Metaculus](https://www.metaculus.com/) | Crowd forecasts on economic, political, scientific and technology questions. | Forecasting platform; check specific tournament/prize terms. |
| [Good Judgment Open](https://www.gjopen.com/) | Community forecasting on political, economic and technology events. | Forecasting research. |
| [Manifold Markets](https://manifold.markets/) | Community probabilities on news, politics, markets and technology. | Play-money forecasts; some prize features may have separate terms. |
| [Polymarket market data/docs](https://docs.polymarket.com/) | Developer documentation for prediction-market data. IMPORTANT: public documentation/research does not authorize real-money participation from India; the platform is named in the official MeitY advisory. | Reference/data only. Polymarket real-money access is blocked/restricted in India per MeitY advisory; do not bypass geographic restrictions. |
| [Kalshi](https://kalshi.com/) | US event-contract marketplace; market data and event descriptions. | India real-money eligibility/legal clearance not established here; verify before any use. |
| [Prediction Market Index — global platform directory](https://predictionmarketsindex.com/platforms/) | An independently maintained directory comparing event-contract and prediction platforms, their funding, regulation and dated availability notes. Use it to discover venues, then verify each official rule. | Research directory; legal status changes; not India clearance. |
| [PredictIt](https://www.predictit.org/) | Political and public-affairs prediction markets; US-specific operating conditions and market rules apply. | Real-money India eligibility not established; verify local law and platform terms. |
| [ForecastEx](https://forecastex.com/) | Event contracts and economic/financial event markets; check product disclosures and eligibility. | Real-money India eligibility not established; verify local law and platform terms. |
| [Robinhood Prediction Markets](https://robinhood.com/us/en/prediction-markets/) | Event contracts available through Robinhood/partner venues in eligible US contexts. | US-focused; not evidence of India eligibility. |
| [Crypto.com Prediction Markets](https://crypto.com/us/prediction-markets) | Sports/events products in supported markets; product and country access can vary. | Real-money India eligibility not established; verify local law and platform terms. |
| [Futuur](https://futuur.com/) | Forecasting platform with play-money forecasting and, depending on jurisdiction/product, money-linked features. | Use free forecasting only unless India eligibility is independently confirmed. |
| [Myriad Markets](https://myriad.markets/) | On-chain prediction market using crypto wallet infrastructure and stablecoin-based markets. | On-chain access does not establish Indian legal eligibility. |
| [Limitless](https://limitless.exchange/) | On-chain prediction/event markets; verify chain, settlement and jurisdiction restrictions. | On-chain access does not establish Indian legal eligibility. |
| [Drift BET](https://drift.trade/bet) | On-chain prediction product in the Drift ecosystem. | On-chain access does not establish Indian legal eligibility. |
| [Zeitgeist](https://zeitgeist.pm/) | Decentralized prediction-market protocol and forecasting ecosystem. | Protocol access does not establish Indian legal eligibility. |
| [Railbird Exchange](https://www.railbirdexchange.com/) | Event-contract exchange; check current exchange status, products and eligibility. | Real-money India eligibility not established; verify local law and platform terms. |
| [CFTC: Understanding Prediction Markets and Event Contracts](https://www.cftc.gov/LearnandProtect/PredictionMarkets) | Regulator education on event contracts and prediction markets. | Official US regulatory education; not Indian legal advice. |
| [Metaculus API / developer resources](https://www.metaculus.com/help/api/) | Forecasting questions and community prediction research for data/visualization use. | Check API terms/rate limits; forecasting is not a guaranteed signal. |
| [Manifold Markets API / docs](https://docs.manifold.markets/) | Community forecast data and platform integrations. | Play-money markets are distinct from cash-linked promotions; review current rules. |

### Global Company Filings

| Resource | Description | Access / caveat |
|---|---|---|
| [SEC EDGAR](https://www.sec.gov/edgar/search/) | Original US public-company filings, earnings, risks and material events. | Official/public. |
| [SEC Insider Transaction Datasets](https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets) | Structured data from reported Forms 3, 4 and 5. | Official/public; disclosed after filing. |
| [SEC Form 13F Datasets](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets) | Institutional holdings from periodic filings. | Official/public; time-lagged snapshots. |
| [SEC Investment Research Guide](https://www.sec.gov/search-filings/edgar-search-assistance/using-edgar-research-investments) | Guide to interpreting SEC filings. | Official/public. |
| [London Stock Exchange News](https://www.londonstockexchange.com/en/news) | UK listed-company news and RNS announcements. | Public; some data services paid. |
| [SEDAR+ Canada](https://www.sedarplus.ca/) | Canadian public securities filings. | Official/public. |
| [HKEXnews](https://www.hkexnews.hk/) | Hong Kong listed-company results, dividends and disclosures. | Official/public. |
| [Japan EDINET](https://disclosure2.edinet-fsa.go.jp/) | Japanese regulatory financial disclosures. | Official/public. |
| [ASX Announcements](https://www.asx.com.au/markets/trade-our-cash-market/announcements) | Australian listed-company announcements and reports. | Official/public. |
| [Singapore Exchange](https://www.sgx.com/securities) | Singapore-listed securities and market information. | Official/public. |
| [South Korea DART](https://englishdart.fss.or.kr/) | Korean corporate regulatory disclosures. | Official/public. |
| [ESMA](https://www.esma.europa.eu/) | European securities regulation, registers and supervisory information. | Official/public; not a single universal filings portal. |

### Global Macro & Cross-Asset Data

| Resource | Description | Access / caveat |
|---|---|---|
| [Bank of Canada Valet API](https://www.bankofcanada.ca/valet/docs) | Programmatic access to Bank of Canada exchange rates and other economic series. | Official/public API. |
| [ECB Data Portal API](https://data.ecb.europa.eu/help/api/overview) | Programmatic access to ECB economic and financial datasets. | Official; check dataset metadata. |
| [BoE Interactive Database](https://www.bankofengland.co.uk/boeapps/database/) | UK time series for rates, monetary data and financial markets. | Official/public. |
| [ONS UK Data](https://www.ons.gov.uk/) | UK inflation, labour, output, population and macroeconomic statistics. | Official/public. |
| [Statistics Canada](https://www.statcan.gc.ca/en/start) | Canadian economic and labour-market releases. | Official/public. |
| [Australian Bureau of Statistics](https://www.abs.gov.au/) | Australian GDP, inflation, employment and trade statistics. | Official/public. |
| [Japan Statistics Bureau](https://www.stat.go.jp/english/) | Official Japanese economic, inflation and labour statistics. | Official/public. |
| [China National Bureau of Statistics](https://www.stats.gov.cn/english/) | Official Chinese national economic statistics. | Official/public; methodology/revisions should be read. |
| [UN Comtrade](https://comtradeplus.un.org/) | Official international merchandise trade data by country/product. | Public with API and usage conditions. |
| [ACLED](https://acleddata.com/) | Geopolitical conflict/event data relevant to country and commodity risk monitoring. | Registration/access terms and methodology apply. |
| [NOAA Climate Data Online](https://www.ncei.noaa.gov/cdo-web/) | Weather/climate observations that can contextualize agriculture, energy and insurance markets. | Official US climate data. |
| [USDA Foreign Agricultural Service PSD](https://apps.fas.usda.gov/psdonline/app/index.html) | Global production, supply and distribution data for agricultural commodities. | Official/public. |
| [ICE Futures Exchange](https://www.ice.com/) | Energy, rates, equity-index and other futures/derivatives market information. | Market data access/licensing varies. |
| [Cboe Global Markets](https://www.cboe.com/) | Options, volatility indexes and exchange market data. | Some data/products are paid. |
| [World Federation of Exchanges Statistics](https://www.world-exchanges.org/our-work/statistics) | Exchange-level global market statistics and industry data. | Public aggregate statistics. |
| [Bank for International Settlements Data Portal](https://data.bis.org/) | Structured global banking, credit, derivatives and monetary statistics. | Official/public. |

### Global News

| Resource | Description | Access / caveat |
|---|---|---|
| [Reuters Markets](https://www.reuters.com/markets/) | Global financial news, macro events and company developments. | Public access; some content may be restricted. |
| [Bloomberg Markets](https://www.bloomberg.com/markets) | Global equities, bonds, currencies, commodities and macro analysis. | Freemium/paid. |
| [CNBC](https://www.cnbc.com/) | US/global markets, earnings and business commentary. | Public/freemium. |
| [Financial Times Markets](https://www.ft.com/markets) | Global finance, economics and institutional analysis. | Paid/freemium. |
| [Yahoo Finance](https://finance.yahoo.com/) | Quotes, company financials, watchlists and news. | Freemium. |
| [Investing.com](https://www.investing.com/) | Economic calendar, FX, Gold, commodities and market news. | Freemium. |
| [MarketWatch](https://www.marketwatch.com/) | US stocks and financial commentary. | Freemium. |
| [Business Wire](https://www.businesswire.com/news/home) | Company releases, earnings announcements and corporate events. | Public releases; data services may be paid. |
| [GlobeNewswire](https://www.globenewswire.com/) | Company press releases and financial results. | Public. |
| [PR Newswire](https://www.prnewswire.com/news-releases/) | Company releases, acquisitions, earnings and business events. | Public releases; services may be paid. |
| [Accesswire](https://www.accesswire.com/) | Corporate news and public-company press releases. | Public. |
| [Quartr earnings calls](https://quartr.com/features/live-calls-and-transcripts) | Earnings calls, transcripts and management commentary. | Freemium/paid features. |
| [Nasdaq Earnings Calendar](https://www.nasdaq.com/market-activity/earnings) | Upcoming and reported earnings. | Public. |
| [GDELT Project](https://www.gdeltproject.org/) | Global news and event monitoring for research and AI workflows. | Public data tools. |
| [Dow Jones Professional](https://www.dowjones.com/professional/) | Professional financial news and information products. | Paid/conditional. |
| [Factiva](https://professional.dowjones.com/factiva/) | Business-news archive and corporate information search. | Paid/conditional. |
| [Benzinga Pro](https://www.benzinga.com/pro) | Market-moving news and event-driven trading research. | Paid/conditional. |
| [Financial Juice](https://www.financialjuice.com/) | Financial news feed and market-event coverage. | Access varies. |
| [AlphaSense](https://www.alpha-sense.com/) | AI-assisted search across research, filings and transcripts. | Paid/conditional. |

### Global News & Research Feeds

| Resource | Description | Access / caveat |
|---|---|---|
| [Associated Press Business](https://apnews.com/hub/business) | Global business and economic news reporting. | Public; some content/licensing restrictions. |
| [The Wall Street Journal Markets](https://www.wsj.com/news/markets) | Markets, companies, economy and investment news. | Paid/conditional. |
| [The Economist Finance & Economics](https://www.economist.com/finance-and-economics) | Global macro, finance and policy analysis. | Paid/conditional. |
| [Nikkei Asia](https://asia.nikkei.com/) | Asia business, markets and corporate reporting. | Freemium/paid. |
| [South China Morning Post Business](https://www.scmp.com/business) | China and Asia business/markets news. | Freemium/paid. |
| [The Information](https://www.theinformation.com/) | Technology-company, venture and private-market reporting. | Paid. |
| [TechCrunch](https://techcrunch.com/) | Tech startups, funding, acquisitions and venture news. | Public/freemium. |
| [S&P Global Market Intelligence News](https://www.spglobal.com/market-intelligence/en/) | Financial-market, credit, company and industry research products. | Paid/conditional. |
| [The Fly](https://thefly.com/) | US-market news, analyst actions and corporate catalysts. | Freemium/paid. |
| [Benzinga Newsdesk](https://www.benzinga.com/) | Market-moving headlines, company catalysts and trading news. | Freemium/paid. |
| [Seeking Alpha](https://seekingalpha.com/) | Earnings transcripts, articles, valuation and community research. | Freemium/paid; user-generated analysis needs verification. |
| [Stocktwits](https://stocktwits.com/) | Crowd sentiment streams and ticker-specific discussion. | Social sentiment only; noisy and potentially manipulated. |
| [Reddit r/Finance](https://www.reddit.com/r/Finance/) | Community discussion that can flag stories/topics for verification. | User-generated; not a primary source. |
| [Google Finance](https://www.google.com/finance/) | Broad stock/market quote lookup and news discovery. | Coverage/timing can vary by instrument. |
| [Nasdaq Market Activity](https://www.nasdaq.com/market-activity) | US stocks, options, IPO and earnings-related market pages. | Public/freemium. |

### India Markets

| Resource | Description | Access / caveat |
|---|---|---|
| [NSE India](https://www.nseindia.com/) | India equity markets, derivatives, indices and exchange information. | Public research; some data has terms/latency restrictions. |
| [BSE India](https://www.bseindia.com/) | Sensex, listed companies, corporate announcements and financial results. | Official/public. |
| [SEBI](https://www.sebi.gov.in/) | Indian securities regulator: regulations, orders, enforcement and disclosures. | Official/public. |
| [NSE Large Deals](https://www.nseindia.com/market-data/large-deals) | Disclosed bulk deals and block deals. | Public; interpret context and transaction type. |
| [NSE All Reports](https://www.nseindia.com/all-reports) | Bhavcopy, market reports and available trading datasets. | Public; data-use terms may apply. |
| [NSE Corporate Filings](https://www.nseindia.com/companies-listing/corporate-filings) | Listed-company announcements and filings. | Official/public. |
| [NSE Insider Trading Disclosures](https://www.nseindia.com/companies-listing/corporate-filings-insider-trading) | Publicly disclosed insider-trading reports. | Official/public; not private insider information. |
| [NSE Option Chain](https://www.nseindia.com/option-chain) | Strike-level options prices and open interest. | Public; live-data conditions may apply. |
| [NSE Live Equity Market](https://www.nseindia.com/market-data/live-equity-market) | Equity prices and market activity. | Public; some feeds may be delayed. |
| [SEBI Investor Support](https://investor.sebi.gov.in/Investor-support.html) | Investor support and registered-intermediary resources. | Official/public. |
| [RBI Database on Indian Economy](https://data.rbi.org.in/DBIE/) | Indian monetary, banking and macroeconomic statistics. | Official/public. |

### India Research & Public Records

| Resource | Description | Access / caveat |
|---|---|---|
| [BSE Corporate Announcements](https://www.bseindia.com/corporates/ann.html) | BSE listed-company announcements and corporate disclosures. | Official/public. |
| [SEBI Investigation & Enforcement](https://www.sebi.gov.in/enforcement.html) | Indian regulator enforcement and investigation-related public material. | Official/public; not all ongoing investigations are public. |

### India Restricted / Not Cleared

| Resource | Description | Access / caveat |
|---|---|---|
| [MeitY advisory: blocked prediction/betting platforms](https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf) | Official 25 Apr 2026 advisory names Polymarket and discusses access blocks and VPN circumvention. | Reference only; do not use to bypass restrictions. |
| [Promotion and Regulation of Online Gaming Act, 2025](https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search) | Indian legislation relevant to online money gaming; consult authoritative text and legal advice. | Official legal reference. |
| [MeitY Act & Policies page](https://www.meity.gov.in/documents/act-and-policies) | Official source for the Act, rules and amendments. | Official/public. |
| [SEBI Insider Trading Regulations](https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-prohibition-of-insider-trading-regulations-2015-last-amended-on-march-12-2025-_92672.html) | Indian rules on insider trading and unpublished price-sensitive information. | Official legal reference. |
| [Polymarket Geographic Restrictions](https://help.polymarket.com/en/articles/13364163-geographic-restrictions) | Platform rules on restricted locations and VPN circumvention. IMPORTANT: public documentation/research does not authorize real-money participation from India; the platform is named in the official MeitY advisory. | Reference/data only. Polymarket real-money access is blocked/restricted in India per MeitY advisory; do not bypass geographic restrictions. |
| [Kalshi International Eligibility](https://help.kalshi.com/en/articles/14026044-can-i-trade-on-kalshi-from-outside-the-united-states) | Platform states international eligibility depends on its Member Agreement and local law. | Do not assume Indian real-money eligibility; verify legal clearance. |
| [Promotion and Regulation of Online Gaming Rules, 2026 — PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2254606&lang=1&reg=3) | Government explanation of the 2026 rules under the 2025 Act. | Official India source; legal interpretation may require counsel. |
| [SEBI SCORES](https://scores.sebi.gov.in/) | Official investor grievance redressal platform for securities-market complaints. | Official India source. |

### India Screeners

| Resource | Description | Access / caveat |
|---|---|---|
| [Screener.in](https://www.screener.in/) | Financial statements, valuation ratios and custom company screens. | Freemium. |
| [Trendlyne](https://trendlyne.com/) | Stock analytics, screeners, alerts and financial research. | Freemium/paid features. |
| [Tickertape](https://www.tickertape.in/) | Indian stock screening and fundamental research. | Freemium. |
| [Moneycontrol](https://www.moneycontrol.com/) | Indian market news, financials and market coverage. | Freemium. |
| [Economic Times Markets](https://economictimes.indiatimes.com/markets) | Indian markets, corporate news and economic updates. | Freemium. |
| [Mint Markets](https://www.livemint.com/market) | Business news, markets and financial analysis. | Freemium. |

### Insider & Institutional Research

| Resource | Description | Access / caveat |
|---|---|---|
| [OpenInsider](http://openinsider.com/) | Search and compare reported US insider transactions. | Third-party; verify original filings. |
| [WhaleWisdom](https://whalewisdom.com/) | Institutional holdings and 13F portfolio research. | Freemium/paid; periodic data. |
| [Dataroma](https://www.dataroma.com/) | Selected prominent investors’ reported holdings. | Public; selected coverage only. |
| [Quiver Quantitative](https://www.quiverquant.com/) | Alternative datasets and public-disclosure analytics. | Freemium/paid; verify timestamps. |
| [Capitol Trades](https://www.capitoltrades.com/) | Reported US Congress members’ transactions. | Third-party; different from corporate-insider filings. |
| [Finviz](https://finviz.com/) | US stock screeners, technical and fundamental filters. | Freemium/paid. |
| [Koyfin](https://www.koyfin.com/) | Charts, macro research, company comparison and watchlists. | Freemium/paid. |
| [MarketScreener](https://www.marketscreener.com/) | Company news, financial results and analyst-consensus research. | Freemium/paid. |

### Investigative Leaks & OSINT

| Resource | Description | Access / caveat |
|---|---|---|
| [ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org/) | Searchable data from Offshore Leaks, Panama Papers, Paradise Papers, Bahamas Leaks and Pandora Papers. Inclusion is not proof of wrongdoing. | Public-interest investigative database; interpret carefully and verify identities. |
| [ICIJ Panama Papers Investigation](https://www.icij.org/investigations/panama-papers/) | Published reporting and context on the Panama Papers offshore-finance investigation. | Public-interest reporting; not a raw credential or document dump. |
| [ICIJ Pandora Papers](https://www.icij.org/investigations/pandora-papers/) | Published reporting on offshore structures, beneficial ownership and financial networks. | Public-interest reporting; allegations require source/context checks. |
| [ICIJ Paradise Papers](https://www.icij.org/investigations/paradise-papers/) | Published reporting on offshore finance, corporate structures and global wealth. | Public-interest reporting. |
| [ICIJ data sources and methodology](https://offshoreleaks.icij.org/pages/data) | Explains which investigative datasets are included, their scope and limitations. | Important: database coverage is a subset of underlying records; absence is not proof. |
| [OCCRP Aleph](https://aleph.occrp.org/) | Investigative research platform for public records, leaks, documents and entity relationships; some archives require application/access review. | Investigative research; access and licensing conditions apply. |
| [OCCRP Investigations](https://www.occrp.org/en) | Cross-border investigations into corruption, financial crime, sanctions evasion and illicit finance. | Published journalism; distinguish allegations from findings. |
| [OpenSanctions — ICIJ Offshore Leaks dataset](https://www.opensanctions.org/datasets/icij_offshoreleaks/) | Structured entity data derived from ICIJ investigations, useful for entity resolution and investigative research. | Non-commercial/public-interest and commercial licensing terms differ. |
| [ProPublica — Business & Finance](https://www.propublica.org/topics/business) | Investigative reporting on companies, finance, public spending and financial misconduct. | Public-interest journalism. |
| [The Sentry](https://thesentry.org/) | Investigations into kleptocracy, conflict finance, money laundering and illicit financial networks. | Public reports; not a live trading signal. |
| [Global Witness](https://www.globalwitness.org/en/) | Investigations of corruption, resource finance, shell companies and ownership networks. | Public reports; verify cited primary documents. |
| [Tax Justice Network](https://taxjustice.net/) | Research on offshore finance, tax abuse, secrecy jurisdictions and financial transparency. | Research and advocacy; read methodology/context. |
| [Global Financial Integrity](https://gfintegrity.org/) | Research on illicit financial flows, trade misinvoicing and cross-border financial crime. | Research; report methodology and estimates vary. |
| [Bellingcat](https://www.bellingcat.com/) | Open-source investigations using publicly accessible imagery, records and digital traces. | OSINT reporting; verify dates and geolocation claims. |
| [ICIJ — How to submit a story tip](https://www.icij.org/contact/) | Official route for submitting public-interest investigative tips and materials to journalists. | For lawful reporting; do not obtain or redistribute stolen data unlawfully. |

### Macro & Central Banks

| Resource | Description | Access / caveat |
|---|---|---|
| [Federal Reserve Calendar](https://www.federalreserve.gov/newsevents/calendar.htm) | FOMC meetings, policy announcements and Fed events. | Official/public. |
| [US BLS Release Calendar](https://www.bls.gov/schedule/news_release/) | US CPI, employment, unemployment and labour data. | Official/public. |
| [BEA Release Schedule](https://www.bea.gov/news/schedule) | GDP, PCE inflation, income and spending releases. | Official/public. |
| [US Census Economic Indicators](https://www.census.gov/economic-indicators/calendar) | Retail sales, inventories, trade and housing data. | Official/public. |
| [US Treasury Interest Rates](https://home.treasury.gov/resource-center/data-chart-center/interest-rates) | Treasury yields and interest-rate series. | Official/public. |
| [ECB Data Portal](https://data.ecb.europa.eu/) | Euro-area rates, inflation and monetary statistics. | Official/public. |
| [Bank of England Statistics](https://www.bankofengland.co.uk/statistics) | UK banking, monetary and economic statistics. | Official/public. |
| [Bank of Japan Statistics](https://www.boj.or.jp/en/statistics/) | Japanese monetary and economic indicators. | Official/public. |
| [BIS Statistics](https://www.bis.org/statistics/) | International banking, debt and global credit statistics. | Official/public. |
| [IMF Data](https://data.imf.org/) | Cross-country macroeconomic and financial datasets. | Public; some datasets/access conditions vary. |
| [World Bank Data](https://data.worldbank.org/) | Country-level economic and development indicators. | Public. |
| [OECD Data Explorer](https://data-explorer.oecd.org/) | Comparable statistics for countries and economies. | Public. |
| [Eurostat Database](https://ec.europa.eu/eurostat/data/database) | European Union official statistics. | Official/public. |
| [FRED Economic Data](https://fred.stlouisfed.org/) | Historical yields, inflation, credit spreads and financial series. | Public; API terms apply. |
| [TradingView Economic Calendar](https://www.tradingview.com/economic-calendar/) | Upcoming events and actual/previous economic readings. | Freemium. |
| [Trading Economics Calendar](https://tradingeconomics.com/calendar) | Country indicators, forecasts and historical releases. | Freemium/paid. |
| [CME FedWatch](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html) | Market-implied Fed rate expectations from futures. | Public tool; interpret as market-implied probability. |
| [US Treasury Fiscal Data](https://fiscaldata.treasury.gov/) | Federal debt, Treasury auctions and public finance datasets. | Official/public. |

### Ownership, Entity & Sanctions Research

| Resource | Description | Access / caveat |
|---|---|---|
| [OpenCorporates](https://opencorporates.com/) | Search company registry information and connect entities across jurisdictions. | Aggregator; verify with primary company registry. |
| [GLEIF LEI Search](https://search.gleif.org/) | Look up Legal Entity Identifiers and relationship data for legal entities. | Official GLEIF data; coverage varies. |
| [UK Companies House Search](https://find-and-update.company-information.service.gov.uk/) | UK company filings, officers, accounts and filing history. | Official/public; check filing dates and completeness. |
| [Companies House API](https://developer.company-information.service.gov.uk/) | Programmatic company register access for UK businesses. | API account/key and terms may apply. |
| [OpenCorporates API](https://api.opencorporates.com/documentation/API-Reference) | Search companies and registered officers in supported jurisdictions. | API limits/licensing vary. |
| [India MCA Company/LLP Services](https://www.mca.gov.in/) | Official Ministry of Corporate Affairs services and company/LLP information. | Official India source; some documents/services require login/payment. |
| [GLEIF API Documentation](https://www.gleif.org/en/lei-data/gleif-api) | Query entity LEI records and relationship/reference data programmatically. | Public API; use identifiers to disambiguate entities. |
| [OpenSanctions API](https://www.opensanctions.org/docs/api/) | API for entity search/matching and sanctions/PEP screening. | Commercial terms apply for business use; verify matches. |
| [Companies House: PSC guidance](https://www.gov.uk/guidance/people-with-significant-control-pscs) | Understand UK people-with-significant-control filings and ownership context. | Official UK guidance. |
| [GLEIF LEI Search API](https://www.gleif.org/en/lei-data/gleif-api/accessing-the-gleif-api) | Read API documentation for global LEI lookups. | Public reference data. |

### Professional Terminals

| Resource | Description | Access / caveat |
|---|---|---|
| [Bloomberg Professional](https://www.bloomberg.com/professional/) | Professional multi-asset data, news and analytics. | Paid. |
| [LSEG Workspace](https://www.lseg.com/en/data-analytics/products/workspace) | Financial-market data, company information and analytics. | Paid. |
| [FactSet](https://www.factset.com/) | Institutional financial data, estimates and investment research. | Paid. |
| [S&P Capital IQ](https://www.spglobal.com/marketintelligence/en/solutions/sp-capital-iq-platform) | Company financials, corporate events and financial analysis. | Paid. |

### Regulatory Enforcement & Fraud

| Resource | Description | Access / caveat |
|---|---|---|
| [SEC Enforcement & Litigation](https://www.sec.gov/enforcement-litigation) | US securities enforcement actions, litigation releases and public case materials. | Official US regulator; allegations and final outcomes are different. |
| [CFTC Enforcement Actions](https://www.cftc.gov/LawRegulation/EnforcementActions/index.htm) | Commodity, derivatives, forex and event-contract enforcement actions. | Official US regulator; includes complaints, settlements and orders. |
| [CFTC Registration & Disciplinary History](https://www.cftc.gov/check) | Check registration and disciplinary information for relevant CFTC-regulated firms/individuals. | Official US regulator. |
| [CFTC RED List](https://www.cftc.gov/LearnAndProtect/Resources/Check/redlist.htm) | Foreign entities that appear to be acting in a capacity requiring CFTC registration but are not registered. | Official US warning list; verify entity identity carefully. |
| [SEC Investment Adviser Public Disclosure (IAPD)](https://adviserinfo.sec.gov/) | Search US investment advisers and representatives, registrations and public disclosures. | Official US regulator. |
| [FINRA BrokerCheck](https://brokercheck.finra.org/) | Research US brokers, firms, registrations and disclosure history. | Official FINRA tool. |
| [FINRA Disciplinary Actions](https://www.finra.org/rules-guidance/oversight-enforcement/finra-disciplinary-actions) | Public disciplinary actions and notices. | Official industry regulator/SRO. |
| [FCA Warning List](https://www.fca.org.uk/consumers/warning-list-unauthorised-firms) | UK FCA list of unauthorised firms and individuals the regulator has warned about. | Official UK warning list; always verify current status. |
| [FCA Financial Services Register](https://register.fca.org.uk/) | Verify UK-authorised firms and individuals. | Official UK regulator. |
| [FCA Enforcement / Final Notices](https://www.fca.org.uk/news/search-results?category=final-notices) | Public enforcement and final notices from the UK regulator. | Official UK regulator. |
| [SEBI Orders & Directions](https://www.sebi.gov.in/enforcement/orders.html) | Indian securities enforcement orders and directions. | Official India regulator. |
| [SEBI Press Releases](https://www.sebi.gov.in/media-and-notifications/press-releases.html) | Indian regulatory announcements and action updates. | Official India regulator. |
| [RBI Press Releases](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx) | Reserve Bank of India announcements, policy updates and public notices. | Official India central bank. |
| [RBI Alert List](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4235) | RBI list of unauthorised forex trading platforms (check the latest version on the RBI site). | Official India warning resource; lists change over time. |
| [US Department of Justice — Fraud Section](https://www.justice.gov/criminal/criminal-fraud) | Public information on corporate, securities and financial fraud enforcement. | Official US DOJ. |
| [US DOJ Press Releases](https://www.justice.gov/news) | Public criminal/civil case announcements and enforcement outcomes. | Official US DOJ; charges are allegations until proven/adjudicated. |
| [CourtListener](https://www.courtlistener.com/) | Search US court opinions, dockets and RECAP documents from public PACER-derived filings. | Public legal research; some filings may be missing or restricted. |
| [PACER](https://pacer.uscourts.gov/) | Official US federal court case and docket access. | Account/fees may apply. |
| [CFTC Whistleblower Program](https://www.whistleblower.gov/) | Official program explaining how eligible tips may be submitted and awards work. | Use only for genuine, lawfully obtained information. |
| [SEC Tips, Complaints and Referrals](https://www.sec.gov/tcr) | Official channel to report suspected securities-law violations. | Do not submit fabricated or unlawfully obtained material. |
| [FBI Internet Crime Complaint Center](https://www.ic3.gov/) | Report internet-enabled fraud and cyber-enabled financial crime. | Official US reporting channel. |
| [OpenSanctions](https://www.opensanctions.org/) | Search structured sanctions, politically exposed persons and related-entity datasets. | Data vendor/aggregator; verify against primary authority and licensing. |
| [OFAC Sanctions Search](https://sanctionssearch.ofac.treas.gov/) | Search US Treasury sanctions lists. | Official US sanctions tool. |
| [UK Sanctions List](https://www.gov.uk/government/publications/the-uk-sanctions-list) | Official UK sanctions designations and notices. | Official UK government. |
| [EU Sanctions Map](https://www.sanctionsmap.eu/) | EU restrictive measures and country/sector sanctions. | Official EU information portal. |
| [UN Security Council Consolidated List](https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list) | UN Security Council sanctions list. | Official UN. |

### Whistleblower & Public-Interest Reporting

| Resource | Description | Access / caveat |
|---|---|---|
| [SEC Whistleblower Program](https://www.sec.gov/enforcement-litigation/whistleblower-program) | Official information on qualifying tips about securities-law violations. | For lawful reporting; eligibility and confidentiality rules apply. |
| [FinCEN Press Releases](https://www.fincen.gov/news-room) | Public notices on AML, suspicious finance, enforcement and financial crime. | Official US Treasury bureau. |
| [FinCEN Advisories](https://www.fincen.gov/resources/advisoriesbulletinsfact-sheets) | AML and illicit-finance typologies that help understand risk patterns. | Official; not a list of all suspicious activity. |
| [OFAC Recent Actions](https://ofac.treasury.gov/recent-actions) | Recent sanctions designations and updates. | Official US Treasury. |
| [Global Anti-Corruption Blog](https://globalanticorruptionblog.com/) | Commentary and research on corruption, compliance and corporate misconduct. | Expert commentary, not official legal decisions. |

### X / Social Market Signals

| Resource | Description | Access / caveat |
|---|---|---|
| [Federal Reserve on X](https://x.com/federalreserve) | Official Federal Reserve social account for announcements and updates. | Official source; always cross-check linked release. |
| [SEC on X](https://x.com/SECGov) | Official US Securities and Exchange Commission account. | Official source. |
| [CME Group on X](https://x.com/CMEGroup) | Official CME Group market/derivatives updates. | Exchange source; not a substitute for contract data. |
| [Reuters on X](https://x.com/Reuters) | Global news reporting and urgent headlines. | News source; verify original reporting. |
| [Bloomberg on X](https://x.com/business) | Bloomberg business and market headlines. | News source; some details may require subscription. |
| [First Squawk on X](https://x.com/FirstSquawk) | Fast market/news alert account. | Third-party feed; verify against original source. |
| [Walter Bloomberg / DeItaone on X](https://x.com/DeItaone) | Fast reposts and headline monitoring used by market participants. | Not a primary source; confirm every material claim. |
| [The Kobeissi Letter on X](https://x.com/KobeissiLetter) | Macro, rates, commodities and market commentary. | Commentary/analysis; not an official data source. |
| [FinancialJuice on X](https://x.com/financialjuice) | Economic calendar headlines and market-news alerts. | Third-party alert feed; cross-check official releases. |
| [Unusual Whales on X](https://x.com/unusual_whales) | Options, political-disclosure and market-data commentary. | Analytics/commentary; public filings should be verified. |
| [Stock Market News on X](https://x.com/StockMKTNewz) | Fast equity-market headlines and company catalysts. | Third-party news aggregation; verify before acting. |
| [ZeroHedge on X](https://x.com/zerohedge) | Macro and market commentary. | Opinion/commentary; cross-check with primary sources. |
| [Lookonchain on X](https://x.com/lookonchain) | Crypto wallet and on-chain transaction alerts. | On-chain interpretation may be uncertain; verify transaction hashes. |
| [Whale Alert on X](https://x.com/whale_alert) | Large blockchain transfer alerts. | Transfers are not proof of buying/selling intent. |
| [CoinGlass on X](https://x.com/CoinGlass_com) | Crypto derivatives, funding and liquidation analytics. | Check underlying dataset and timestamp. |
| [Glassnode on X](https://x.com/glassnode) | Crypto on-chain research and analytics. | Research vendor; metric definitions matter. |
| [DeFiLlama on X](https://x.com/DefiLlama) | DeFi metrics and protocol-data updates. | Verify definitions and protocol coverage. |
| [SEBI on X](https://x.com/SEBI_India) | Indian securities-regulator communications. | Confirm announcements on sebi.gov.in. |
| [NSE India on X](https://x.com/NSEIndia) | Exchange announcements and market notices. | Confirm market notices on nseindia.com. |
| [BSE India on X](https://x.com/BSEIndia) | Exchange updates and corporate-market information. | Confirm disclosures on bseindia.com. |
| [European Central Bank on X](https://x.com/ecb) | Central-bank announcements and research links. | Confirm on ecb.europa.eu. |
| [Bank of England on X](https://x.com/bankofengland) | UK monetary-policy and central-bank updates. | Confirm on bankofengland.co.uk. |
| [US Treasury on X](https://x.com/USTreasury) | Treasury announcements and fiscal/financial updates. | Confirm official releases. |
| [EIA on X](https://x.com/EIAgov) | US energy and petroleum data updates. | Confirm weekly report/API timestamps on eia.gov. |

## Interpretation notes

- Public insider filings are retrospective disclosures, not confidential inside information.
- Published leak investigations can contain useful leads but do not automatically prove wrongdoing.
- Social feeds are lead generation, not primary verification.
- Confirm timestamps, source methodology, licensing and India-specific eligibility before use.



---

# Preserved original: Finance_Intelligence_OS_News_and_Market_Movement.md

> The following is the original source document, preserved verbatim.

# Finance Intelligence OS — News & Market-Movement Edition

**Curated resources:** 531 unique URLs · **Categories:** 41 · **Expanded:** 26 October 2026

## What this edition adds

News propagation and RSS, official X/social signals, crowd-attention research, sentiment and breadth, unusual options and market-mover scanners, crypto token/pool risk checks, open-source charts, screening/backtesting projects, corporate-event catalysts and daily-to-yearly forecast references.

## Market direction research by horizon

- **Intraday/daily:** official calendar/catalyst, fresh headlines, price gaps, relative volume, liquidity/spread and cross-asset confirmation.
- **Weekly:** upcoming macro releases, weekly structure, COT (delayed), ETF flows, AAII sentiment and known events.
- **Monthly:** earnings revisions, yield/FX regime, sector relative strength, monthly trends, fund flows and supply/expiry events.
- **Quarterly/yearly:** growth/inflation/policy cycle, valuation, corporate cash flows, supply-demand, capex and published institutional/multilateral outlooks.

No source guarantees an asset will pump/dump or that a market will rise/fall on a given day. Use forecasts as scenarios, record publication date/horizon/assumptions and verify outcomes over time. Social chatter, whale transfers, unusual options volume and technical indicators can be misleading in isolation.

## News verification hierarchy

1. **Primary facts:** company/exchange filings, regulator releases, central banks and official data releases.
2. **Reporting/data providers:** established newswires, API feeds, analyst consensus and exchange analytics; check timestamp and methodology.
3. **Social/community leads:** X, Reddit, Stocktwits and crypto alerts; verify identity and cited source before treating as evidence.

## Research checklist

- [ ] Primary source confirms the catalyst.
- [ ] News is new, timestamped and not merely a repost.
- [ ] Price structure agrees with the intended timeframe.
- [ ] Relative volume is compared with a reasonable baseline.
- [ ] Spread and liquidity are usable.
- [ ] Related assets/macro conditions do not contradict the scenario.
- [ ] Positioning/flow data is fresh enough for the horizon.
- [ ] Promotional and manipulation risks are checked.
- [ ] Invalidation level and risk are defined.

## All resources by category

### APIs & Developer Resources

- [EOD Historical Data API](https://eodhd.com/financial-apis/) — Historical market prices, fundamentals, corporate events and related data. **Access:** Paid tiers; check exchange licensing.
- [Google News RSS search](https://news.google.com/) — News discovery from many publishers; use query terms, then open original publisher. **Access:** Aggregation and availability vary; not all publishers permit reuse.
- [Intrinio](https://intrinio.com/documentation) — Financial data APIs for prices, fundamentals, estimates and institutional data products. **Access:** Paid/licensed.
- [Marketstack API](https://marketstack.com/documentation) — REST API for stock-market data and historical EOD/intraday offerings. **Access:** Free/paid plans; latency/coverage vary.
- [OpenBB Documentation](https://docs.openbb.co/) — Integration patterns for market/macro data and financial research workflows. **Access:** Provider entitlements still apply.
- [Polygon.io / Massive API](https://massive.com/docs) — Market-data APIs for stocks, options, indices, forex and crypto offerings. **Access:** Paid tiers and licensing apply.
- [SEC XBRL Company Facts API](https://www.sec.gov/edgar/sec-api-documentation) — Structured company facts and filings for quantitative fundamentals. **Access:** Official US source; fair access and data terms apply.
- [Stocktwits API / developer information](https://api.stocktwits.com/developers) — Social sentiment and symbol conversation integration where API access is offered. **Access:** Review access status and platform terms.
- [Tiingo API](https://www.tiingo.com/documentation/general/overview) — Financial data API for prices, fundamentals and news endpoints where available. **Access:** Account/plan and exchange terms apply.
- [Tiingo IEX/News API docs](https://www.tiingo.com/documentation) — API documentation for supported market data and news. **Access:** Data entitlements vary.
- [UN Comtrade API](https://comtradeapi.un.org/) — Programmatic international trade data queries. **Access:** Registration/limits may apply.
- [World Bank API: Indicators](https://api.worldbank.org/) — Programmatic country/indicator access for macroeconomic comparisons. **Access:** Public API; query and usage conventions apply.
- [X API Documentation](https://developer.x.com/en/docs) — Official developer docs for social posts, search and account data subject to current access tiers. **Access:** Paid access/rate limits; comply with platform terms.

### APIs & Open Source

- [Alpha Vantage API](https://www.alphavantage.co/documentation/) — Market data, FX, crypto, fundamentals and indicators. **Access:** Free/paid tiers and limits.
- [CoinGlass API](https://docs.coinglass.com/reference/getting-started-with-your-api) — Crypto derivatives, funding, open interest and liquidation data. **Access:** API key/paid limits may apply.
- [DeFiLlama API](https://api-docs.defillama.com/) — Supported DeFi protocol and TVL metrics. **Access:** Endpoint terms vary.
- [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs) — Financial statements, fundamentals and market data. **Access:** Free/paid tiers.
- [Fincept Terminal GitHub](https://github.com/Fincept-Corporation/FinceptTerminal) — Open-source financial terminal and analytics application. **Access:** Open source; check current license and setup.
- [Finnhub API](https://finnhub.io/docs/api) — Market data, company information and news endpoints. **Access:** Free/paid tiers.
- [FRED API](https://fred.stlouisfed.org/docs/api/fred/) — Historical macroeconomic and financial time series. **Access:** Public API; terms/limits apply.
- [IMF Data APIs](https://data.imf.org/en/Resource-Pages/IMF-API) — International economic data integration. **Access:** Public/conditional by dataset.
- [Nasdaq Data Link](https://docs.data.nasdaq.com/) — Financial and alternative datasets. **Access:** Dataset licensing/pricing varies.
- [OpenBB GitHub](https://github.com/OpenBB-finance/OpenBB) — Financial data and research infrastructure. **Access:** Open source/platform terms vary.
- [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) — Company submissions and structured financial facts. **Access:** Official/public; follow fair-access requirements.
- [Trading Economics API](https://docs.tradingeconomics.com/get_started/) — Economic calendar, indicators, yields and related datasets. **Access:** Paid/conditional limits.
- [TradingAgents GitHub](https://github.com/TauricResearch/TradingAgents) — Multi-agent LLM financial research framework. **Access:** Open source; check current license and requirements.
- [Twelve Data API](https://twelvedata.com/docs) — Stocks, Forex, crypto and technical time series. **Access:** Free/paid tiers.
- [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) — Country-level economic and development indicators. **Access:** Public.

### Bonds, Rates & Credit

- [BIS Debt Securities Statistics](https://data.bis.org/topics/DSS) — Cross-country debt securities issuance and holdings statistics for bills, bonds and other debt instruments. **Access:** Official international statistics; mostly periodic, not tick-by-tick.
- [BIS Global Liquidity Indicators](https://www.bis.org/statistics/gli.htm) — International credit and foreign-currency borrowing indicators. **Access:** Official aggregate data; release frequency varies.
- [BIS OTC Derivatives Statistics](https://data.bis.org/topics/OTC_DER) — Global OTC derivative market statistics by product and counterparty/market attributes. **Access:** Official aggregate statistics, not individual position disclosures.
- [CCIL Periodic Market Data](https://www.ccilindia.com/periodic-data) — Indian government securities, money-market, FX and derivatives trade/settlement statistics. **Access:** Official market infrastructure; report coverage/frequency varies.
- [DTCC Trade Information Warehouse](https://www.dtcc.com/repository-and-derivatives-services/derivatives-trade-reporting) — Derivatives post-trade infrastructure and reporting information, including credit-derivative market infrastructure. **Access:** Institutional market infrastructure; not a free retail flow feed.
- [Fitch Ratings](https://www.fitchratings.com/) — Credit ratings, rating actions and research. **Access:** Public notices plus paid/conditional data.
- [Moody’s Ratings](https://ratings.moodys.com/) — Credit ratings and selected issuer/sector research. **Access:** Public notices plus paid products; rating is an opinion, not a guarantee.
- [MSRB EMMA — Municipal Bond Disclosures](https://emma.msrb.org/AboutEMMA/Overview) — Official US municipal securities disclosures, trade data, yields and offering documents. **Access:** Free public research; not a trading venue.
- [New York Fed — Markets Data APIs](https://www.newyorkfed.org/markets/data) — Markets data and API resources from the Federal Reserve Bank of New York. **Access:** Official public data; endpoint and terms vary.
- [New York Fed — SOFR Data](https://www.newyorkfed.org/markets/reference-rates/sofr) — Daily Secured Overnight Financing Rate (SOFR), methodology and market-rate links. **Access:** Official New York Fed data.
- [Office of Financial Research — Data Collections](https://www.financialresearch.gov/data/collections/) — US short-term funding, repo and financial-stability datasets. **Access:** Official research data; coverage is specific to each collection.
- [OFR Short-Term Funding Monitor](https://www.financialresearch.gov/short-term-funding-monitor/) — Monitor for US short-term funding-market conditions and selected repo/secured financing indicators. **Access:** Official public research tool.
- [RBI Retail Direct](https://rbiretaildirect.org.in/) — Official retail access framework for Indian government securities, subject to account and eligibility rules. **Access:** India-specific; not a global bond trading platform.
- [S&P Global Ratings](https://www.spglobal.com/ratings/en/) — Credit-rating research, ratings actions and issuer credit opinions. **Access:** Some research is public; substantial data/services may be paid.
- [TreasuryDirect — Auction Data & Research](https://www.treasurydirect.gov/auctions/announcements-data-results/useful-data-for-research/) — US Treasury auction schedules, auction results, debt data and related research resources. **Access:** Official US Treasury resource.

### Bonds, Volatility & Options

- [Cboe DataShop](https://datashop.cboe.com/option-quote-intervals) — Options quote and intraday interval data. **Access:** Paid data product.
- [Cboe VIX](https://www.cboe.com/tradable_products/vix/) — S&P 500 options-derived expected-volatility index. **Access:** Public information; data products may be paid.
- [CFTC COT Reports](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) — Reported futures positioning by trader categories. **Access:** Official/public; not real-time order flow.
- [CFTC Market Reports](https://www.cftc.gov/MarketReports/index.htm) — Futures positioning, swaps and derivatives reports. **Access:** Official/public; many reports are delayed.
- [Cheddar Flow](https://www.cheddarflow.com/) — Options-flow research and unusual activity. **Access:** Paid/conditional.
- [CME Group](https://www.cmegroup.com/) — Futures, options, rates and commodity-market information. **Access:** Public/paid data products.
- [FINRA ATS Transparency](https://www.finra.org/finra-data/browse-catalog/ats-transparency-data) — Reported activity for US alternative trading systems. **Access:** Reported/aggregated data; not a live dark-pool tape.
- [FINRA Fixed Income Data](https://www.finra.org/finra-data/fixed-income) — US fixed-income market information. **Access:** Public/conditional datasets.
- [FINRA Short Sale Volume](https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data) — Short-sale volume datasets. **Access:** Not the same as short interest.
- [FINRA TRACE](https://www.finra.org/finra-data/fixed-income/trace) — Reported transactions in covered US bond markets. **Access:** Data scope and delay vary.
- [Nasdaq Short Interest](https://www.nasdaqtrader.com/Trader.aspx?id=ShortInterest) — Reported short-interest information. **Access:** Periodic reporting.
- [OCC Options Volume & Open Interest](https://www.theocc.com/market-data/market-data-reports/volume-and-open-interest) — Listed options volume and open interest. **Access:** Public reports; detailed data may be conditional.
- [SIFMA Research](https://www.sifma.org/resources/research/) — Bond markets, securities-industry and market statistics. **Access:** Public reports.
- [Unusual Flow](https://unusualflow.com/) — Options activity analytics. **Access:** Access/pricing varies.
- [Unusual Whales](https://unusualwhales.com/) — Options activity and unusual-trading analytics. **Access:** Freemium/paid; flow is not necessarily directional.

### Catalyst & Corporate Events

- [ClinicalTrials.gov API](https://clinicaltrials.gov/data-api/about-api) — Structured clinical study data and status changes, useful for healthcare/biotech catalyst monitoring. **Access:** Trial records do not guarantee outcomes or commercial approval.
- [FDA Advisory Committees](https://www.fda.gov/advisory-committees) — Public advisory committee meetings and materials that can matter to regulated companies. **Access:** A committee vote is not the same as final FDA action.
- [FDA Drug Approvals & Databases](https://www.fda.gov/drugs/development-approval-process-drugs) — Official drug development and approval process resources. **Access:** Check specific approval letters and labels for primary facts.
- [FTC Press Releases](https://www.ftc.gov/news-events/news/press-releases) — Competition, antitrust, consumer-protection and business enforcement releases. **Access:** Regulatory action impacts depend on facts, timing and jurisdiction.
- [Nasdaq IPO Calendar](https://www.nasdaq.com/market-activity/ipos) — IPO calendar and listing-related information. **Access:** Dates and deal terms can change; verify issuer/exchange filings.
- [SAM.gov Contract Opportunities](https://sam.gov/content/opportunities) — US federal contracting opportunities and notices, useful for companies exposed to government contracts. **Access:** A contract notice or award does not automatically mean a public company receives revenue.
- [USPTO Patent Public Search](https://ppubs.uspto.gov/pubwebapp/) — Search US patent publications for technology and IP research. **Access:** Patent applications/grants do not directly forecast company performance.

### Commodities & Supply Data

- [CME Commodity Markets](https://www.cmegroup.com/markets/commodities.html) — Commodity futures contracts, prices and exchange information. **Access:** Public/paid data products.
- [EIA Open Data API](https://www.eia.gov/opendata/) — Energy datasets and API access. **Access:** Official/public; API key/limits may apply.
- [EIA Weekly Petroleum Report](https://www.eia.gov/petroleum/supply/weekly/) — US crude inventories, production, refinery activity and balances. **Access:** Official/public.
- [International Energy Agency](https://www.iea.org/reports/oil-market-report) — Oil demand, supply and market outlook. **Access:** Reports may have access conditions.
- [LBMA Prices & Data](https://www.lbma.org.uk/prices-and-data) — Precious-metal benchmarks and market data resources. **Access:** Some data is licensed/paid.
- [London Metal Exchange Warehouse Data](https://www.lme.com/Market-data/Reports-and-data/Warehouse-and-stocks) — Industrial-metal warehouse and stock reports. **Access:** Some data products may be paid.
- [OPEC](https://www.opec.org/) — Oil-market reports and production information. **Access:** Official/public.
- [USDA WASDE](https://www.usda.gov/oce/commodity/wasde) — Global agricultural supply, demand and stocks estimates. **Access:** Official/public.
- [World Gold Council](https://www.gold.org/goldhub) — Gold demand, ETF flows and market research. **Access:** Public reports; some data services conditional.

### Commodities, Freight & Environment

- [California Air Resources Board — Cap-and-Trade](https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program) — California carbon cap-and-trade programme, rules, auctions and public reports. **Access:** Official programme information; not a universal carbon market.
- [Drewry World Container Index](https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry) — Container freight rate benchmarks for selected routes. **Access:** Public summaries; detailed data/subscription may be paid.
- [European Energy Exchange (EEX)](https://www.eex.com/en/) — Power, gas, environmental and commodity-related listed products/data. **Access:** Official exchange; access and data subscriptions vary.
- [FAO Food Price Index](https://www.fao.org/worldfoodsituation/foodpricesindex/en/) — Global food commodity price index and monthly releases. **Access:** Official public data; macro/food market context.
- [International Copper Study Group](https://icsg.org/) — Copper production, usage and supply-demand statistics. **Access:** Industry intergovernmental group; periodic releases.
- [International Lead and Zinc Study Group](https://www.ilzsg.org/) — Lead and zinc production/usage statistics and market information. **Access:** Industry group data frequency varies.
- [International Nickel Study Group](https://insg.org/) — Nickel supply-demand and industry statistics. **Access:** Industry group data frequency varies.
- [NOAA Climate Prediction Center](https://www.cpc.ncep.noaa.gov/) — Climate outlooks and seasonal forecasts affecting agriculture and energy risk. **Access:** Official forecasts; uncertainty and regional scope matter.
- [OPEC Monthly Oil Market Report](https://www.opec.org/opec_web/en/publications/338.htm) — Oil supply-demand forecasts, production figures and market analysis. **Access:** Official OPEC report; verify current publication path.
- [Regional Greenhouse Gas Initiative (RGGI)](https://www.rggi.org/) — US regional power-sector carbon allowance auctions, market reports and programme information. **Access:** Official programme sources; scheme-specific rules apply.
- [UNCTAD Maritime Transport](https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport) — Global shipping, maritime trade, fleet and logistics research. **Access:** Official public reports; periodic data.
- [US Geological Survey — Mineral Commodity Summaries](https://www.usgs.gov/centers/national-minerals-information-center/commodity-statistics-and-information) — Annual mineral production, reserves and supply information for metals/minerals. **Access:** Official public research; periodic, not real-time.
- [USDA National Agricultural Statistics Service](https://www.nass.usda.gov/) — Crop progress, acreage, yields, inventories, livestock and agricultural statistics. **Access:** Official public data; release schedules vary.
- [World Bank Commodity Markets (Pink Sheet)](https://www.worldbank.org/en/research/commodity-markets) — Monthly historical commodity-price data and outlook material across energy, metals and agriculture. **Access:** Official public research; periodic pricing, not live execution quotes.

### Crypto & On-chain

- [Arkham Intelligence](https://arkm.com/) — Wallet and known-entity blockchain intelligence. **Access:** Freemium/paid.
- [Bitcoin Mempool Explorer](https://mempool.space/) — Bitcoin transactions, mempool and network status. **Access:** Public.
- [Blockchain.com Explorer](https://www.blockchain.com/explorer) — Bitcoin and supported blockchain transaction exploration. **Access:** Public.
- [Coinbase Developer Docs](https://docs.cdp.coinbase.com/) — Coinbase-supported APIs and developer integrations. **Access:** API access/terms vary.
- [CoinGlass](https://www.coinglass.com/) — Crypto open interest, funding, liquidations and derivatives metrics. **Access:** Freemium/paid.
- [CryptoQuant](https://cryptoquant.com/) — Exchange flows, miner activity and on-chain indicators. **Access:** Freemium/paid.
- [DeFiLlama](https://defillama.com/) — DeFi TVL, DEX volumes, stablecoins and protocol metrics. **Access:** Public; API/licensing terms apply.
- [Dune Analytics](https://dune.com/) — Blockchain SQL queries and custom dashboards. **Access:** Freemium/paid.
- [Etherscan](https://etherscan.io/) — Ethereum transactions, tokens, wallets and smart contracts. **Access:** Public; API limits apply.
- [Glassnode](https://glassnode.com/) — On-chain metrics and holder behaviour. **Access:** Freemium/paid.
- [Kraken API Docs](https://docs.kraken.com/api/) — Exchange market-data and trading APIs. **Access:** API terms and account eligibility apply.
- [Nansen](https://www.nansen.ai/) — Wallet labels, token flows and wallet intelligence. **Access:** Paid/conditional.
- [Solscan](https://solscan.io/) — Solana wallets, transactions and token activity. **Access:** Public/paid API options.
- [Token Terminal](https://tokenterminal.com/) — Crypto-protocol fundamentals and financial metrics. **Access:** Freemium/paid.
- [Token Unlocks](https://token.unlocks.app/) — Scheduled token unlocks and supply events. **Access:** Public/paid features.
- [Whale Alert](https://whale-alert.io/) — Large crypto transaction alerts. **Access:** Freemium/paid.

### Cyber Risk & Data Breach Monitoring

- [BleepingComputer Security News](https://www.bleepingcomputer.com/) — Cyber incidents, ransomware and breach reporting. **Access:** Published reporting; avoid raw stolen-data sources.
- [Chainalysis Research](https://www.chainalysis.com/blog/) — Crypto crime, illicit-flow typologies and blockchain investigation reports. **Access:** Research vendor; attribution can be probabilistic.
- [CISA Cybersecurity Advisories](https://www.cisa.gov/news-events/cybersecurity-advisories) — Public technical advisories on cyber threats and mitigations. **Access:** Defensive use.
- [CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) — Official catalog of vulnerabilities known to be exploited in the wild. **Access:** Defensive cyber-risk research.
- [Elliptic Research](https://www.elliptic.co/blog) — Crypto compliance, illicit finance and blockchain investigation reporting. **Access:** Research/vendor reports; on-chain attribution is not always certain.
- [Have I Been Pwned](https://haveibeenpwned.com/) — Check whether an account/domain appears in known breaches and monitor verified domains. **Access:** Defensive use; do not search for or redistribute stolen credentials.
- [Have I Been Pwned API docs](https://haveibeenpwned.com/API/v3) — Documented breach-exposure API including privacy-aware options. **Access:** API restrictions/key; use only with authorization.
- [KrebsOnSecurity](https://krebsonsecurity.com/) — Investigative cybersecurity reporting on fraud, cybercrime and financial abuse. **Access:** Journalism; validate claims with cited evidence.
- [The Record by Recorded Future](https://therecord.media/) — Cybercrime, ransomware, breaches and threat-intelligence journalism. **Access:** Published reporting; avoid treating allegations as proven.
- [TRM Labs Research](https://www.trmlabs.com/resources) — Blockchain intelligence, crypto crime and sanctions research. **Access:** Research/vendor reports; verify methodology.

### Exchange Product Catalogues

- [ASX Derivatives Market](https://www.asx.com.au/markets/trade-our-derivatives-market) — Australian equity index, interest-rate and other derivatives market information. **Access:** Official exchange; contract and broker support vary.
- [B3 Brazil — Products and Services](https://www.b3.com.br/en_us/products-and-services/) — Brazilian equities, interest rates, FX, commodities and derivatives products. **Access:** Official exchange; product pages may be localized.
- [Cboe Tradable Product Catalogue](https://www.cboe.com/tradable-products/product-list/) — Equity, index and volatility-related listed products, including options and VIX-linked instruments. **Access:** Official exchange catalogue; verify actual product page and permissions.
- [CME Agriculture Markets](https://www.cmegroup.com/markets/agriculture.html) — Grains, oilseeds, livestock and selected agricultural contracts. **Access:** Official exchange; weather, seasonality and delivery specifications matter.
- [CME Cryptocurrency Markets](https://www.cmegroup.com/markets/cryptocurrencies.html) — Listed crypto futures/options where available, including contract-specific institutional and micro products. **Access:** Official exchange; availability depends on broker and jurisdiction.
- [CME Energy Markets](https://www.cmegroup.com/markets/energy.html) — Crude oil, refined products, natural gas and energy-related futures/options. **Access:** Official exchange; contract and delivery details matter.
- [CME Equity Index Markets](https://www.cmegroup.com/markets/equities.html) — Equity-index futures/options and related index product groups. **Access:** Official exchange; check contract size, hours, expiry and margin.
- [CME FX Markets](https://www.cmegroup.com/markets/fx.html) — Listed currency futures and options across major, cross and emerging-market currencies. **Access:** Official exchange; not the same as broker OTC spot FX.
- [CME Group — Product Slate](https://www.cmegroup.com/markets/products?redirect=%2Ftrading%2Findex.html) — Searchable exchange product slate spanning equity indices, FX, interest rates, credit, metals, energy, agriculture, crypto and other listed products. **Access:** Official exchange catalogue; market data and trading permissions may be paid or broker-dependent.
- [CME Interest Rates](https://www.cmegroup.com/markets/interest-rates.html) — Treasury futures, short-term interest-rate products, swaps futures and rates-related derivatives. **Access:** Official exchange; products are leveraged derivatives.
- [CME Metals Markets](https://www.cmegroup.com/markets/metals.html) — Precious, base and selected battery/industrial metals contracts. **Access:** Official exchange; check product-level availability.
- [Dalian Commodity Exchange](https://www.dce.com.cn/DCE/Products/Products?locale=en_US) — Chinese commodity derivatives including agricultural, industrial and energy-related contracts. **Access:** Official exchange; availability to offshore participants varies.
- [Eurex Markets](https://www.eurex.com/ex-en/markets) — European equity-index, interest-rate, volatility, ETF/ETC and other derivatives markets. **Access:** Official exchange; product-level eligibility varies.
- [Euronext Markets](https://www.euronext.com/en/markets) — European securities and derivatives market entry point. **Access:** Official exchange network; check individual market and product.
- [European Energy Exchange (EEX) — Global Commodities](https://www.eex.com/en/global-commodities) — Energy, environmental and freight-linked futures information, including selected power and commodity contracts. **Access:** Official exchange; product terms vary by market.
- [HKEX Listed Derivatives](https://www.hkex.com.hk/Products/Listed-Derivatives?sc_lang=en) — Hong Kong index, equity, currency and other listed derivative product information. **Access:** Official exchange; product-specific permissions apply.
- [ICE Agriculture](https://www.ice.com/products/Futures-Options/Agriculture) — Agricultural futures/options product listings and specifications. **Access:** Official exchange; check contract liquidity and delivery.
- [ICE Emissions](https://www.ice.com/products/Futures-Options/Energy/Emissions) — Emissions allowances and related environmental futures/options. **Access:** Scheme-specific products; carbon allowances are not interchangeable.
- [ICE Energy](https://www.ice.com/products/Futures-Options/Energy) — Oil, refined products, natural gas, LNG, electricity, biofuels and related energy contracts. **Access:** Official exchange; product access varies.
- [ICE Equity Derivatives](https://www.ice.com/products/Futures-Options/Equity-Derivatives) — Index and equity-linked derivatives listed by ICE. **Access:** Official exchange; check regional contract rules.
- [ICE Freight](https://www.ice.com/products/Futures-Options/Freight) — Dry, wet and container freight futures/FFAs for selected routes and benchmarks. **Access:** Specialist derivatives; many contracts are institutional/niche.
- [ICE Futures & Options — All Products](https://www.ice.com/products/Futures-Options/) — Global contract catalogue covering agriculture, energy, environmental, FX, freight, interest rates, metals and equity derivatives. **Access:** Official exchange catalogue; data access and permissions vary.
- [ICE FX](https://www.ice.com/products/Futures-Options/FX) — Listed currency futures and options, including selected global benchmarks. **Access:** Official exchange; distinguish listed futures from OTC FX.
- [ICE Interest Rates](https://www.ice.com/products/Futures-Options/Interest-Rates) — Interest-rate and government-bond-related derivatives listed by ICE. **Access:** Official exchange; inspect contract details.
- [ICE Metals](https://www.ice.com/products/Futures-Options/Metals) — Metal-related contracts, including selected specialist and battery materials. **Access:** Official exchange; product-specific liquidity varies.
- [Japan Exchange Group — Derivatives](https://www.jpx.co.jp/english/derivatives/) — Japanese index, interest-rate and other derivatives market information. **Access:** Official exchange; contract rules and regional access apply.
- [London Metal Exchange](https://www.lme.com/) — Industrial metals exchange: prices, contract specifications, warehouse stocks and market reports. **Access:** Official exchange; some pricing/data products are licensed.
- [Montreal Exchange](https://www.m-x.ca/en/markets) — Canadian listed derivatives, including interest-rate and equity-index products. **Access:** Official exchange; product access varies.
- [Multi Commodity Exchange of India (MCX)](https://www.mcxindia.com/) — Indian commodity derivatives and exchange resources. **Access:** Official India exchange; confirm broker access and current contract rules.
- [National Commodity & Derivatives Exchange (NCDEX)](https://www.ncdex.com/) — Indian agricultural commodity market and contracts. **Access:** Official India exchange; verify active contracts and liquidity.
- [SGX Derivatives](https://www.sgx.com/derivatives) — Singapore derivatives product and market information. **Access:** Official exchange; product access varies.
- [Shanghai Futures Exchange](https://www.shfe.com.cn/eng/) — Chinese futures-market product information including industrial and precious metals and energy-related products. **Access:** Official exchange; international access and contract participation restrictions apply.
- [Zhengzhou Commodity Exchange](https://english.czce.com.cn/) — Chinese agricultural and commodity futures exchange information. **Access:** Official exchange; verify investor access and contract terms.

### Flows, Sentiment & Alternative Data

- [Baltic Exchange](https://www.balticexchange.com/) — Dry bulk, tanker and freight-market benchmarks. **Access:** Licensing/subscription applies for detailed data.
- [Barchart](https://www.barchart.com/) — Stocks, futures, options, commodities and market-data screens. **Access:** Freemium/paid; delayed data can apply.
- [ChartExchange](https://chartexchange.com/) — US equity market data, short-volume and related analytics. **Access:** Dataset definition and delays matter.
- [CoinShares Digital Asset Fund Flows](https://coinshares.com/research/digital-asset-fund-flows/) — Periodic institutional digital-asset fund-flow research. **Access:** Report-based, not real-time fund positioning.
- [ETF.com](https://www.etf.com/) — ETF research, holdings, flows and education. **Access:** Some datasets/features may be paid.
- [ETF.com ETF Fund Flows](https://www.etf.com/sections/etf-fund-flows) — Fund-flow reporting and ETF market trends. **Access:** Published flow analysis is not live order flow.
- [Farside Investors — Bitcoin ETF Flows](https://farside.co.uk/btc/) — Daily US spot Bitcoin ETF flow table and historical series. **Access:** Secondary source; compare with issuer/exchange disclosures.
- [Fintel](https://fintel.io/) — Short interest, institutional holdings, ownership and selected options metrics. **Access:** Freemium/paid; check source dates.
- [Freightos Baltic Index](https://fbx.freightos.com/) — Container freight rate benchmarks for supply-chain and macro research. **Access:** Some data/features may be paid.
- [Kpler](https://www.kpler.com/) — Shipping, commodities and energy-flow intelligence. **Access:** Professional/paid; not all fields public.
- [Macrotrends](https://www.macrotrends.net/) — Historical company fundamentals, macro charts and valuation time series. **Access:** Secondary source; check restatements and definitions.
- [Market Chameleon](https://marketchameleon.com/) — Options market statistics, unusual activity and volatility research. **Access:** Freemium/paid; US options focus.
- [Morningstar](https://www.morningstar.com/) — Funds, ETFs, company analysis and portfolio research. **Access:** Freemium/paid.
- [MSCI Research & Indexes](https://www.msci.com/our-solutions/indexes) — Global equity/fixed-income indexes, country/sector exposures and research. **Access:** Some products require subscription/licensing.
- [OptionStrat](https://optionstrat.com/) — Options payoff diagrams, strategy analysis and scenario testing. **Access:** Modeling tool, not proof of trade direction.
- [S&P Dow Jones Indices](https://www.spglobal.com/spdji/en/) — Index methodology, factsheets and index data products. **Access:** Licensing applies to redistribution.
- [S&P Global Commodity Insights](https://www.spglobal.com/commodityinsights/en) — Professional commodity, energy and supply-chain market intelligence. **Access:** Paid; commercial data licensing.
- [SoSoValue](https://www.sosovalue.com/) — Crypto ETF flow dashboards, market charts and research. **Access:** Coverage and refresh time vary; verify methodology.
- [Stock Analysis](https://stockanalysis.com/) — Financial statements, valuations, earnings calendars and stock screens. **Access:** Verify key metrics against company filings.
- [VettaFi ETF Database](https://etfdb.com/) — ETF screening, holdings, sector exposure and category comparisons. **Access:** Coverage/latency varies.

### Forecasting & Event Data

- [CFTC: Understanding Prediction Markets and Event Contracts](https://www.cftc.gov/LearnandProtect/PredictionMarkets) — Regulator education on event contracts and prediction markets. **Access:** Official US regulatory education; not Indian legal advice.
- [Crypto.com Prediction Markets](https://crypto.com/us/prediction-markets) — Sports/events products in supported markets; product and country access can vary. **Access:** Real-money India eligibility not established; verify local law and platform terms.
- [Drift BET](https://drift.trade/bet) — On-chain prediction product in the Drift ecosystem. **Access:** On-chain access does not establish Indian legal eligibility.
- [ForecastEx](https://forecastex.com/) — Event contracts and economic/financial event markets; check product disclosures and eligibility. **Access:** Real-money India eligibility not established; verify local law and platform terms.
- [Futuur](https://futuur.com/) — Forecasting platform with play-money forecasting and, depending on jurisdiction/product, money-linked features. **Access:** Use free forecasting only unless India eligibility is independently confirmed.
- [Good Judgment Open](https://www.gjopen.com/) — Community forecasting on political, economic and technology events. **Access:** Forecasting research.
- [Kalshi](https://kalshi.com/) — US event-contract marketplace; market data and event descriptions. **Access:** India real-money eligibility/legal clearance not established here; verify before any use.
- [Limitless](https://limitless.exchange/) — On-chain prediction/event markets; verify chain, settlement and jurisdiction restrictions. **Access:** On-chain access does not establish Indian legal eligibility.
- [Manifold Markets](https://manifold.markets/) — Community probabilities on news, politics, markets and technology. **Access:** Play-money forecasts; some prize features may have separate terms.
- [Manifold Markets API / docs](https://docs.manifold.markets/) — Community forecast data and platform integrations. **Access:** Play-money markets are distinct from cash-linked promotions; review current rules.
- [Metaculus](https://www.metaculus.com/) — Crowd forecasts on economic, political, scientific and technology questions. **Access:** Forecasting platform; check specific tournament/prize terms.
- [Metaculus API / developer resources](https://www.metaculus.com/help/api/) — Forecasting questions and community prediction research for data/visualization use. **Access:** Check API terms/rate limits; forecasting is not a guaranteed signal.
- [Myriad Markets](https://myriad.markets/) — On-chain prediction market using crypto wallet infrastructure and stablecoin-based markets. **Access:** On-chain access does not establish Indian legal eligibility.
- [Polymarket market data/docs](https://docs.polymarket.com/) — Public developer documentation for prediction-market data. Documentation access is not permission to trade; the real-money platform is subject to India restrictions listed separately. **Access:** Research/data documentation only; platform rules, geographic restrictions and Indian law still apply.
- [Prediction Market Index — global platform directory](https://predictionmarketsindex.com/platforms/) — An independently maintained directory comparing event-contract and prediction platforms, their funding, regulation and dated availability notes. Use it to discover venues, then verify each official rule. **Access:** Research directory; legal status changes; not India clearance.
- [PredictIt](https://www.predictit.org/) — Political and public-affairs prediction markets; US-specific operating conditions and market rules apply. **Access:** Real-money India eligibility not established; verify local law and platform terms.
- [Railbird Exchange](https://www.railbirdexchange.com/) — Event-contract exchange; check current exchange status, products and eligibility. **Access:** Real-money India eligibility not established; verify local law and platform terms.
- [Robinhood Prediction Markets](https://robinhood.com/us/en/prediction-markets/) — Event contracts available through Robinhood/partner venues in eligible US contexts. **Access:** US-focused; not evidence of India eligibility.
- [Zeitgeist](https://zeitgeist.pm/) — Decentralized prediction-market protocol and forecasting ecosystem. **Access:** Protocol access does not establish Indian legal eligibility.

### Forecasts & Market Outlooks

- [BlackRock Investment Institute](https://www.blackrock.com/corporate/insights/blackrock-investment-institute) — Institutional macro, allocation, rates, equity and multi-asset outlook research. **Access:** Research views are scenarios, not guaranteed price predictions.
- [Fidelity Market Insights](https://www.fidelity.com/learning-center/trading-investing/markets-sectors) — Market and sector commentary, investing research and economic context. **Access:** Content mix varies; distinguish opinion from primary data.
- [Goldman Sachs Insights](https://www.goldmansachs.com/insights) — Public macro, market and industry research from Goldman Sachs. **Access:** Some research is restricted or available only to clients.
- [IMF World Economic Outlook](https://www.imf.org/en/Publications/WEO) — Global growth, inflation, trade and country-level macro projections. **Access:** Forecast revisions and publication dates matter; not tradable price targets.
- [J.P. Morgan Guide to the Markets](https://am.jpmorgan.com/us/en/asset-management/adv/insights/market-insights/guide-to-the-markets/) — Charts on valuations, earnings, economic conditions, yields and market history. **Access:** Publication schedules and versions change; not a short-term signal.
- [Morgan Stanley Ideas](https://www.morganstanley.com/ideas) — Public market, economy and industry commentary from Morgan Stanley. **Access:** Forecasts and themes are views, not guarantees.
- [Morningstar Market Insights](https://www.morningstar.com/markets) — Market valuations, asset allocation and investment research. **Access:** Some content and datasets are subscription-based.
- [OECD Economic Outlook](https://www.oecd.org/en/publications/oecd-economic-outlook.html) — Country forecasts and global macroeconomic analysis. **Access:** Check edition date, assumptions and country coverage.
- [UBS CIO Insights](https://www.ubs.com/global/en/wealthmanagement/insights.html) — Macro, asset allocation and thematic research from UBS. **Access:** Some content may be client-only; check publication date.
- [Vanguard Economic & Market Outlook](https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo.html) — Longer-horizon macro, asset-class return and portfolio outlook research. **Access:** Model estimates have uncertainty and assumptions; not point-price certainty.
- [World Bank Global Economic Prospects](https://www.worldbank.org/en/publication/global-economic-prospects) — Global growth projections and risk analysis across economies. **Access:** Macro projections are conditional and revised.

### Funds, ETFs & Index Intelligence

- [Cboe Options Market Statistics](https://www.cboe.com/us/options/market_statistics/) — Options volume, market statistics and selected volatility data. **Access:** Coverage and data delay vary by metric.
- [ETFGI Research](https://etfgi.com/) — Global ETF industry assets, flows and industry research. **Access:** Some content is public; reports/services vary.
- [FTSE Russell Indexes](https://www.lseg.com/en/ftse-russell/indices) — Global equity and fixed-income index families and benchmark methodology. **Access:** Index data may be licensed.
- [Investment Company Institute](https://www.ici.org/research/stats) — US and global investment-company/ETF/mutual-fund industry statistics. **Access:** Industry association; periodic aggregates.
- [MSCI Indexes](https://www.msci.com/indexes) — Global equity, fixed-income and other benchmarks and methodology resources. **Access:** Some index data/products require licensing.
- [STOXX Indexes](https://stoxx.com/) — European/global equity benchmarks, strategy indices and index methodology. **Access:** Some data/products licensed.

### Global Company Filings

- [ASX Announcements](https://www.asx.com.au/markets/trade-our-cash-market/announcements) — Australian listed-company announcements and reports. **Access:** Official/public.
- [ESMA](https://www.esma.europa.eu/) — European securities regulation, registers and supervisory information. **Access:** Official/public; not a single universal filings portal.
- [HKEXnews](https://www.hkexnews.hk/) — Hong Kong listed-company results, dividends and disclosures. **Access:** Official/public.
- [Japan EDINET](https://disclosure2.edinet-fsa.go.jp/) — Japanese regulatory financial disclosures. **Access:** Official/public.
- [London Stock Exchange News](https://www.londonstockexchange.com/en/news) — UK listed-company news and RNS announcements. **Access:** Public; some data services paid.
- [SEC EDGAR](https://www.sec.gov/edgar/search/) — Original US public-company filings, earnings, risks and material events. **Access:** Official/public.
- [SEC Form 13F Datasets](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets) — Institutional holdings from periodic filings. **Access:** Official/public; time-lagged snapshots.
- [SEC Insider Transaction Datasets](https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets) — Structured data from reported Forms 3, 4 and 5. **Access:** Official/public; disclosed after filing.
- [SEC Investment Research Guide](https://www.sec.gov/search-filings/edgar-search-assistance/using-edgar-research-investments) — Guide to interpreting SEC filings. **Access:** Official/public.
- [SEDAR+ Canada](https://www.sedarplus.ca/) — Canadian public securities filings. **Access:** Official/public.
- [Singapore Exchange](https://www.sgx.com/securities) — Singapore-listed securities and market information. **Access:** Official/public.
- [South Korea DART](https://englishdart.fss.or.kr/) — Korean corporate regulatory disclosures. **Access:** Official/public.

### Global Macro & Cross-Asset Data

- [ACLED](https://acleddata.com/) — Geopolitical conflict/event data relevant to country and commodity risk monitoring. **Access:** Registration/access terms and methodology apply.
- [Australian Bureau of Statistics](https://www.abs.gov.au/) — Australian GDP, inflation, employment and trade statistics. **Access:** Official/public.
- [Bank for International Settlements Data Portal](https://data.bis.org/) — Structured global banking, credit, derivatives and monetary statistics. **Access:** Official/public.
- [Bank of Canada Valet API](https://www.bankofcanada.ca/valet/docs) — Programmatic access to Bank of Canada exchange rates and other economic series. **Access:** Official/public API.
- [BoE Interactive Database](https://www.bankofengland.co.uk/boeapps/database/) — UK time series for rates, monetary data and financial markets. **Access:** Official/public.
- [Cboe Global Markets](https://www.cboe.com/) — Options, volatility indexes and exchange market data. **Access:** Some data/products are paid.
- [China National Bureau of Statistics](https://www.stats.gov.cn/english/) — Official Chinese national economic statistics. **Access:** Official/public; methodology/revisions should be read.
- [ECB Data Portal API](https://data.ecb.europa.eu/help/api/overview) — Programmatic access to ECB economic and financial datasets. **Access:** Official; check dataset metadata.
- [ICE Futures Exchange](https://www.ice.com/) — Energy, rates, equity-index and other futures/derivatives market information. **Access:** Market data access/licensing varies.
- [Japan Statistics Bureau](https://www.stat.go.jp/english/) — Official Japanese economic, inflation and labour statistics. **Access:** Official/public.
- [NOAA Climate Data Online](https://www.ncei.noaa.gov/cdo-web/) — Weather/climate observations that can contextualize agriculture, energy and insurance markets. **Access:** Official US climate data.
- [ONS UK Data](https://www.ons.gov.uk/) — UK inflation, labour, output, population and macroeconomic statistics. **Access:** Official/public.
- [Statistics Canada](https://www.statcan.gc.ca/en/start) — Canadian economic and labour-market releases. **Access:** Official/public.
- [UN Comtrade](https://comtradeplus.un.org/) — Official international merchandise trade data by country/product. **Access:** Public with API and usage conditions.
- [USDA Foreign Agricultural Service PSD](https://apps.fas.usda.gov/psdonline/app/index.html) — Global production, supply and distribution data for agricultural commodities. **Access:** Official/public.
- [World Federation of Exchanges Statistics](https://www.world-exchanges.org/our-work/statistics) — Exchange-level global market statistics and industry data. **Access:** Public aggregate statistics.

### Global Macro, Trade & Financial Stability

- [Federal Reserve H.15 Selected Interest Rates](https://www.federalreserve.gov/releases/h15/) — Selected US interest-rate series and historical reference rates. **Access:** Official public data; series definitions matter.
- [OpenFIGI](https://www.openfigi.com/api) — API and identifiers for mapping financial instruments to FIGI and related identifiers. **Access:** API usage limits apply.

### Global News

- [Accesswire](https://www.accesswire.com/) — Corporate news and public-company press releases. **Access:** Public.
- [AlphaSense](https://www.alpha-sense.com/) — AI-assisted search across research, filings and transcripts. **Access:** Paid/conditional.
- [Benzinga Pro](https://www.benzinga.com/pro) — Market-moving news and event-driven trading research. **Access:** Paid/conditional.
- [Bloomberg Markets](https://www.bloomberg.com/markets) — Global equities, bonds, currencies, commodities and macro analysis. **Access:** Freemium/paid.
- [Business Wire](https://www.businesswire.com/news/home) — Company releases, earnings announcements and corporate events. **Access:** Public releases; data services may be paid.
- [CNBC](https://www.cnbc.com/) — US/global markets, earnings and business commentary. **Access:** Public/freemium.
- [Dow Jones Professional](https://www.dowjones.com/professional/) — Professional financial news and information products. **Access:** Paid/conditional.
- [Factiva](https://professional.dowjones.com/factiva/) — Business-news archive and corporate information search. **Access:** Paid/conditional.
- [Financial Juice](https://www.financialjuice.com/) — Financial news feed and market-event coverage. **Access:** Access varies.
- [Financial Times Markets](https://www.ft.com/markets) — Global finance, economics and institutional analysis. **Access:** Paid/freemium.
- [GDELT Project](https://www.gdeltproject.org/) — Global news and event monitoring for research and AI workflows. **Access:** Public data tools.
- [GlobeNewswire](https://www.globenewswire.com/) — Company press releases and financial results. **Access:** Public.
- [Investing.com](https://www.investing.com/) — Economic calendar, FX, Gold, commodities and market news. **Access:** Freemium.
- [MarketWatch](https://www.marketwatch.com/) — US stocks and financial commentary. **Access:** Freemium.
- [Nasdaq Earnings Calendar](https://www.nasdaq.com/market-activity/earnings) — Upcoming and reported earnings. **Access:** Public.
- [PR Newswire](https://www.prnewswire.com/news-releases/) — Company releases, acquisitions, earnings and business events. **Access:** Public releases; services may be paid.
- [Quartr earnings calls](https://quartr.com/features/live-calls-and-transcripts) — Earnings calls, transcripts and management commentary. **Access:** Freemium/paid features.
- [Reuters Markets](https://www.reuters.com/markets/) — Global financial news, macro events and company developments. **Access:** Public access; some content may be restricted.
- [Yahoo Finance](https://finance.yahoo.com/) — Quotes, company financials, watchlists and news. **Access:** Freemium.

### Global News & Research Feeds

- [Associated Press Business](https://apnews.com/hub/business) — Global business and economic news reporting. **Access:** Public; some content/licensing restrictions.
- [Benzinga Newsdesk](https://www.benzinga.com/) — Market-moving headlines, company catalysts and trading news. **Access:** Freemium/paid.
- [Google Finance](https://www.google.com/finance/) — Broad stock/market quote lookup and news discovery. **Access:** Coverage/timing can vary by instrument.
- [Nasdaq Market Activity](https://www.nasdaq.com/market-activity) — US stocks, options, IPO and earnings-related market pages. **Access:** Public/freemium.
- [Nikkei Asia](https://asia.nikkei.com/) — Asia business, markets and corporate reporting. **Access:** Freemium/paid.
- [Reddit r/Finance](https://www.reddit.com/r/Finance/) — Community discussion that can flag stories/topics for verification. **Access:** User-generated; not a primary source.
- [S&P Global Market Intelligence News](https://www.spglobal.com/market-intelligence/en/) — Financial-market, credit, company and industry research products. **Access:** Paid/conditional.
- [Seeking Alpha](https://seekingalpha.com/) — Earnings transcripts, articles, valuation and community research. **Access:** Freemium/paid; user-generated analysis needs verification.
- [South China Morning Post Business](https://www.scmp.com/business) — China and Asia business/markets news. **Access:** Freemium/paid.
- [Stocktwits](https://stocktwits.com/) — Crowd sentiment streams and ticker-specific discussion. **Access:** Social sentiment only; noisy and potentially manipulated.
- [TechCrunch](https://techcrunch.com/) — Tech startups, funding, acquisitions and venture news. **Access:** Public/freemium.
- [The Economist Finance & Economics](https://www.economist.com/finance-and-economics) — Global macro, finance and policy analysis. **Access:** Paid/conditional.
- [The Fly](https://thefly.com/) — US-market news, analyst actions and corporate catalysts. **Access:** Freemium/paid.
- [The Information](https://www.theinformation.com/) — Technology-company, venture and private-market reporting. **Access:** Paid.
- [The Wall Street Journal Markets](https://www.wsj.com/news/markets) — Markets, companies, economy and investment news. **Access:** Paid/conditional.

### India Market Access & Official Data

- [India Code](https://www.indiacode.nic.in/) — Official repository of Indian Acts and legislation. **Access:** Official legal text; check amendments and commencement notifications.
- [MCX Product Directory](https://www.mcxindia.com/market-data/market-watch) — MCX market watch and commodity contract information. **Access:** Official India exchange; current contracts and broker permissions vary.
- [NSE Currency Derivatives](https://www.nseindia.com/market-data/currency-derivatives) — Currency-derivatives segment information, market data and contract references. **Access:** Official India exchange; permitted contracts and rules apply.
- [NSE Debt Market](https://www.nseindia.com/market-data/debt-market) — Indian debt-market products and available market information. **Access:** Official India exchange; actual tradability varies by instrument.
- [RBI Authorised Electronic Trading Platforms](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4080) — RBI reference for authorised ETPs used in eligible electronic financial-market transactions. **Access:** Official India source; verify current notices and exact product permissions.
- [RBI Forex Transactions FAQ](https://www.rbi.org.in/scripts/FS_FAQs.aspx?Id=146) — RBI explanation of permitted forex transactions, authorised persons/ETPs and remittance constraints. **Access:** Official guidance; underlying FEMA/rules prevail.
- [RBI Master Direction — ETPs 2025](https://www.rbi.org.in/scripts/BS_ViewMasCirculardetails.aspx?id=12870) — RBI Master Direction on Electronic Trading Platforms, issued 16 June 2025. **Access:** Official regulatory text; interpret with current amendments.
- [SEBI Foreign Trading Portals Advisory](https://www.sebi.gov.in/media/press-releases/oct-2018/advisory-in-respect-of-foreign-trading-portals_40848.html) — SEBI advisory about overseas portals offering financial products/derivatives to Indian residents. **Access:** Official historical advisory; read with current law and regulations.
- [SEBI Virtual Trading / Gaming Platforms Advisory](https://www.sebi.gov.in/media-and-notifications/press-releases/nov-2024/advisory-on-unauthorized-virtual-trading-gaming-platforms_88200.html) — SEBI advisory regarding unauthorized virtual trading and gaming platforms. **Access:** Official India regulatory guidance.

### India Markets

- [BSE India](https://www.bseindia.com/) — Sensex, listed companies, corporate announcements and financial results. **Access:** Official/public.
- [NSE All Reports](https://www.nseindia.com/all-reports) — Bhavcopy, market reports and available trading datasets. **Access:** Public; data-use terms may apply.
- [NSE Corporate Filings](https://www.nseindia.com/companies-listing/corporate-filings) — Listed-company announcements and filings. **Access:** Official/public.
- [NSE India](https://www.nseindia.com/) — India equity markets, derivatives, indices and exchange information. **Access:** Public research; some data has terms/latency restrictions.
- [NSE Insider Trading Disclosures](https://www.nseindia.com/companies-listing/corporate-filings-insider-trading) — Publicly disclosed insider-trading reports. **Access:** Official/public; not private insider information.
- [NSE Large Deals](https://www.nseindia.com/market-data/large-deals) — Disclosed bulk deals and block deals. **Access:** Public; interpret context and transaction type.
- [NSE Live Equity Market](https://www.nseindia.com/market-data/live-equity-market) — Equity prices and market activity. **Access:** Public; some feeds may be delayed.
- [NSE Option Chain](https://www.nseindia.com/option-chain) — Strike-level options prices and open interest. **Access:** Public; live-data conditions may apply.
- [RBI Database on Indian Economy](https://data.rbi.org.in/DBIE/) — Indian monetary, banking and macroeconomic statistics. **Access:** Official/public.
- [SEBI](https://www.sebi.gov.in/) — Indian securities regulator: regulations, orders, enforcement and disclosures. **Access:** Official/public.
- [SEBI Investor Support](https://investor.sebi.gov.in/Investor-support.html) — Investor support and registered-intermediary resources. **Access:** Official/public.

### India Research & Public Records

- [BSE Corporate Announcements](https://www.bseindia.com/corporates/ann.html) — BSE listed-company announcements and corporate disclosures. **Access:** Official/public.
- [SEBI Investigation & Enforcement](https://www.sebi.gov.in/enforcement.html) — Indian regulator enforcement and investigation-related public material. **Access:** Official/public; not all ongoing investigations are public.

### India Restricted / Not Cleared

- [Kalshi International Eligibility](https://help.kalshi.com/en/articles/14026044-can-i-trade-on-kalshi-from-outside-the-united-states) — Platform states international eligibility depends on its Member Agreement and local law. **Access:** Do not assume Indian real-money eligibility; verify legal clearance.
- [MeitY Act & Policies page](https://www.meity.gov.in/documents/act-and-policies) — Official source for the Act, rules and amendments. **Access:** Official/public.
- [MeitY advisory: blocked prediction/betting platforms](https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf) — Official 25 Apr 2026 advisory names Polymarket and discusses access blocks and VPN circumvention. **Access:** Reference only; do not use to bypass restrictions.
- [Polymarket Geographic Restrictions](https://help.polymarket.com/en/articles/13364163-geographic-restrictions) — Platform rules on restricted locations and VPN circumvention. IMPORTANT: public documentation/research does not authorize real-money participation from India; the platform is named in the official MeitY advisory. **Access:** Reference/data only. Polymarket real-money access is blocked/restricted in India per MeitY advisory; do not bypass geographic restrictions.
- [Polymarket — real-money platform (India restriction applies)](https://polymarket.com/) — Prediction-market platform. MeitY’s 25 April 2026 advisory names Polymarket among blocked prediction/betting platforms; this entry is an identification/reference link, not an instruction to access or trade. **Access:** Explicit India restriction is documented by MeitY; do not circumvent geographic blocks.
- [Promotion and Regulation of Online Gaming Act, 2025](https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search) — Indian legislation relevant to online money gaming; consult authoritative text and legal advice. **Access:** Official legal reference.
- [Promotion and Regulation of Online Gaming Rules, 2026 — PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2254606&lang=1&reg=3) — Government explanation of the 2026 rules under the 2025 Act. **Access:** Official India source; legal interpretation may require counsel.
- [SEBI Insider Trading Regulations](https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-prohibition-of-insider-trading-regulations-2015-last-amended-on-march-12-2025-_92672.html) — Indian rules on insider trading and unpublished price-sensitive information. **Access:** Official legal reference.
- [SEBI SCORES](https://scores.sebi.gov.in/) — Official investor grievance redressal platform for securities-market complaints. **Access:** Official investor grievance portal; use according to its terms.

### India Screeners

- [Economic Times Markets](https://economictimes.indiatimes.com/markets) — Indian markets, corporate news and economic updates. **Access:** Freemium.
- [Mint Markets](https://www.livemint.com/market) — Business news, markets and financial analysis. **Access:** Freemium.
- [Moneycontrol](https://www.moneycontrol.com/) — Indian market news, financials and market coverage. **Access:** Freemium.
- [Screener.in](https://www.screener.in/) — Financial statements, valuation ratios and custom company screens. **Access:** Freemium.
- [Tickertape](https://www.tickertape.in/) — Indian stock screening and fundamental research. **Access:** Freemium.
- [Trendlyne](https://trendlyne.com/) — Stock analytics, screeners, alerts and financial research. **Access:** Freemium/paid features.

### Insider & Institutional Research

- [Capitol Trades](https://www.capitoltrades.com/) — Reported US Congress members’ transactions. **Access:** Third-party; different from corporate-insider filings.
- [Dataroma](https://www.dataroma.com/) — Selected prominent investors’ reported holdings. **Access:** Public; selected coverage only.
- [Finviz](https://finviz.com/) — US stock screeners, technical and fundamental filters. **Access:** Freemium/paid.
- [Koyfin](https://www.koyfin.com/) — Charts, macro research, company comparison and watchlists. **Access:** Freemium/paid.
- [MarketScreener](https://www.marketscreener.com/) — Company news, financial results and analyst-consensus research. **Access:** Freemium/paid.
- [OpenInsider](http://openinsider.com/) — Search and compare reported US insider transactions. **Access:** Third-party; verify original filings.
- [Quiver Quantitative](https://www.quiverquant.com/) — Alternative datasets and public-disclosure analytics. **Access:** Freemium/paid; verify timestamps.
- [WhaleWisdom](https://whalewisdom.com/) — Institutional holdings and 13F portfolio research. **Access:** Freemium/paid; periodic data.

### Investigative Leaks & OSINT

- [Bellingcat](https://www.bellingcat.com/) — Open-source investigations using publicly accessible imagery, records and digital traces. **Access:** OSINT reporting; verify dates and geolocation claims.
- [Global Financial Integrity](https://gfintegrity.org/) — Research on illicit financial flows, trade misinvoicing and cross-border financial crime. **Access:** Research; report methodology and estimates vary.
- [Global Witness](https://www.globalwitness.org/en/) — Investigations of corruption, resource finance, shell companies and ownership networks. **Access:** Public reports; verify cited primary documents.
- [ICIJ data sources and methodology](https://offshoreleaks.icij.org/pages/data) — Explains which investigative datasets are included, their scope and limitations. **Access:** Important: database coverage is a subset of underlying records; absence is not proof.
- [ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org/) — Searchable data from Offshore Leaks, Panama Papers, Paradise Papers, Bahamas Leaks and Pandora Papers. Inclusion is not proof of wrongdoing. **Access:** Public-interest investigative database; interpret carefully and verify identities.
- [ICIJ Panama Papers Investigation](https://www.icij.org/investigations/panama-papers/) — Published reporting and context on the Panama Papers offshore-finance investigation. **Access:** Public-interest reporting; not a raw credential or document dump.
- [ICIJ Pandora Papers](https://www.icij.org/investigations/pandora-papers/) — Published reporting on offshore structures, beneficial ownership and financial networks. **Access:** Public-interest reporting; allegations require source/context checks.
- [ICIJ Paradise Papers](https://www.icij.org/investigations/paradise-papers/) — Published reporting on offshore finance, corporate structures and global wealth. **Access:** Public-interest reporting.
- [ICIJ — How to submit a story tip](https://www.icij.org/contact/) — Official route for submitting public-interest investigative tips and materials to journalists. **Access:** For lawful reporting; do not obtain or redistribute stolen data unlawfully.
- [OCCRP Aleph](https://aleph.occrp.org/) — Investigative research platform for public records, leaks, documents and entity relationships; some archives require application/access review. **Access:** Investigative research; access and licensing conditions apply.
- [OCCRP Investigations](https://www.occrp.org/en) — Cross-border investigations into corruption, financial crime, sanctions evasion and illicit finance. **Access:** Published journalism; distinguish allegations from findings.
- [OpenSanctions — ICIJ Offshore Leaks dataset](https://www.opensanctions.org/datasets/icij_offshoreleaks/) — Structured entity data derived from ICIJ investigations, useful for entity resolution and investigative research. **Access:** Non-commercial/public-interest and commercial licensing terms differ.
- [ProPublica — Business & Finance](https://www.propublica.org/topics/business) — Investigative reporting on companies, finance, public spending and financial misconduct. **Access:** Public-interest journalism.
- [Tax Justice Network](https://taxjustice.net/) — Research on offshore finance, tax abuse, secrecy jurisdictions and financial transparency. **Access:** Research and advocacy; read methodology/context.
- [The Sentry](https://thesentry.org/) — Investigations into kleptocracy, conflict finance, money laundering and illicit financial networks. **Access:** Public reports; not a live trading signal.

### Macro & Central Banks

- [Bank of England Statistics](https://www.bankofengland.co.uk/statistics) — UK banking, monetary and economic statistics. **Access:** Official/public.
- [Bank of Japan Statistics](https://www.boj.or.jp/en/statistics/) — Japanese monetary and economic indicators. **Access:** Official/public.
- [BEA Release Schedule](https://www.bea.gov/news/schedule) — GDP, PCE inflation, income and spending releases. **Access:** Official/public.
- [BIS Statistics](https://www.bis.org/statistics/) — International banking, debt and global credit statistics. **Access:** Official/public.
- [CME FedWatch](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html) — Market-implied Fed rate expectations from futures. **Access:** Public tool; interpret as market-implied probability.
- [ECB Data Portal](https://data.ecb.europa.eu/) — Euro-area rates, inflation and monetary statistics. **Access:** Official/public.
- [Eurostat Database](https://ec.europa.eu/eurostat/data/database) — European Union official statistics. **Access:** Official/public.
- [Federal Reserve Calendar](https://www.federalreserve.gov/newsevents/calendar.htm) — FOMC meetings, policy announcements and Fed events. **Access:** Official/public.
- [FRED Economic Data](https://fred.stlouisfed.org/) — Historical yields, inflation, credit spreads and financial series. **Access:** Public; API terms apply.
- [IMF Data](https://data.imf.org/) — Cross-country macroeconomic and financial datasets. **Access:** Public; some datasets/access conditions vary.
- [OECD Data Explorer](https://data-explorer.oecd.org/) — Comparable statistics for countries and economies. **Access:** Public.
- [Trading Economics Calendar](https://tradingeconomics.com/calendar) — Country indicators, forecasts and historical releases. **Access:** Freemium/paid.
- [TradingView Economic Calendar](https://www.tradingview.com/economic-calendar/) — Upcoming events and actual/previous economic readings. **Access:** Freemium.
- [US BLS Release Calendar](https://www.bls.gov/schedule/news_release/) — US CPI, employment, unemployment and labour data. **Access:** Official/public.
- [US Census Economic Indicators](https://www.census.gov/economic-indicators/calendar) — Retail sales, inventories, trade and housing data. **Access:** Official/public.
- [US Treasury Fiscal Data](https://fiscaldata.treasury.gov/) — Federal debt, Treasury auctions and public finance datasets. **Access:** Official/public.
- [US Treasury Interest Rates](https://home.treasury.gov/resource-center/data-chart-center/interest-rates) — Treasury yields and interest-rate series. **Access:** Official/public.
- [World Bank Data](https://data.worldbank.org/) — Country-level economic and development indicators. **Access:** Public.

### Market Infrastructure, Data Vendors & Risk

- [ASIC Investor Alerts](https://moneysmart.gov.au/check-and-report-scams/investor-alert-list) — Australian investor alert list and scam-checking resources. **Access:** Australia-focused; verify through ASIC’s official website.
- [Cboe DataShop](https://datashop.cboe.com/) — Historical and interval market data, including options data products. **Access:** Paid/licensed; coverage and historical depth vary.
- [CFTC RED List](https://www.cftc.gov/LawRegulation/DoddFrankAct/Rulemakings/DF_21_RedList.html) — CFTC list of certain foreign entities that appear to be acting in a capacity requiring registration, as described by CFTC. **Access:** Official US list; not a universal or exhaustive global warning list.
- [CME Market Data & Analytics](https://www.cmegroup.com/market-data.html) — CME data catalogue, real-time/historical market data and analytics products. **Access:** Data licensing/subscription rules apply; redistribution may require entitlement.
- [FCA Warning List](https://www.fca.org.uk/scamsmart/warning-list) — UK FCA warnings about firms/individuals that may be providing financial services without proper authorization. **Access:** UK-specific; absence from list is not proof of authorization elsewhere.
- [ICE Data Services](https://www.ice.com/market-data) — Market data and analytics offerings for ICE benchmarks, venues and other markets. **Access:** Commercial data licensing applies.
- [IOSCO I-SCAN](https://www.iosco.org/i-scan/) — International database of investor alerts and warnings from regulators. **Access:** Use as a lead; check issuing regulator’s original notice.
- [IOSCO Investor Alerts Portal](https://www.iosco.org/investor_protection/?subsection=investor_alerts_portal) — Investor alerts and warnings published by securities regulators. **Access:** Coverage varies across jurisdictions.
- [Nasdaq Data Link](https://data.nasdaq.com/) — Financial, economic and alternative datasets from supported providers. **Access:** Dataset-level licensing/price varies.
- [NFA BASIC](https://www.nfa.futures.org/basicnet/) — Background-check database for US derivatives industry firms and individuals. **Access:** Use to check registration/disciplinary information; jurisdiction-specific.
- [US SEC PAUSE](https://www.sec.gov/enforce/public-alerts) — SEC public alerts about entities/individuals associated with potential securities-law issues. **Access:** Official US public alerts; does not replace registration checks.

### Market Movers & Forecasts

- [Barchart Stocks Market Movers](https://www.barchart.com/stocks/market-movers) — Market movers, top gainers/losers, volume and sector dashboards. **Access:** Confirm quote latency and exchange coverage; movers are historical/current observations, not forecasts.
- [Barchart Unusual Options Activity](https://www.barchart.com/options/unusual-activity) — Flags option contracts with volume elevated relative to open interest. **Access:** Some data may be delayed or paywalled; unusual activity is not automatically bullish/bearish.
- [CoinGecko Gainers & Losers](https://www.coingecko.com/en/highlights/gainers-losers) — Compare crypto gainers, losers and recent market performance. **Access:** Thin liquidity and exchange-specific price anomalies can distort rankings.
- [CoinGecko Trending Search](https://www.coingecko.com/en/highlights/trending-crypto) — See crypto assets trending in search/activity. **Access:** Search attention can be promotional; check market cap, liquidity and contract safety.
- [CoinMarketCap Trending](https://coinmarketcap.com/trending-cryptocurrencies/) — Explore crypto assets receiving increased platform attention. **Access:** Trending rank is not a quality or investment signal; verify liquidity and token risk.
- [Finviz Stock Screener](https://finviz.com/screener.ashx) — US-equity screens for price change, volume, valuation and technical patterns. **Access:** Some quotes/features are delayed or paid; primarily US-focused.
- [MarketBeat Analyst Ratings](https://www.marketbeat.com/ratings/) — Analyst rating changes and consensus/price-target research. **Access:** Analyst targets are opinions with uncertain horizons and track records.
- [TipRanks](https://www.tipranks.com/) — Analyst consensus, price targets, earnings and investor research tools. **Access:** Premium features and source coverage vary; targets can be wrong.
- [Trading Economics Forecasts](https://tradingeconomics.com/forecast) — Country/indicator forecasts and historical economic series. **Access:** Forecasts are provider estimates; API plans and coverage vary.
- [TradingView Crypto Coins Screener](https://www.tradingview.com/crypto-coins-screener/) — Compare crypto assets using price, volume and other supported metrics. **Access:** Listings and metrics vary by data provider and venue.
- [TradingView Stock Heatmap](https://www.tradingview.com/heatmap/stock/) — Visual map of stocks/market segments by performance and size. **Access:** Heatmap is a snapshot; time interval and exchange coverage matter.
- [TradingView Stock Screener](https://www.tradingview.com/screener/) — Screen listed stocks using technical and fundamental filters and market activity. **Access:** Screens find candidates; verify data coverage and build rules before acting.
- [Yahoo Finance Screeners](https://finance.yahoo.com/screener/) — Stock and ETF screeners, watchlists, quotes, financials and news. **Access:** Market coverage, data delay and features vary.

### News & RSS Monitoring

- [Benzinga APIs](https://www.benzinga.com/apis/) — Market newswire, corporate actions, analyst insights, unusual options, calendar and market-mover data products. **Access:** Primarily commercial data products; check rights and latency.
- [Bloomberg Economics RSS](https://www.bloomberg.com/feeds/economics/news.rss) — Bloomberg economics and macro news feed. **Access:** Feed availability and article access can vary.
- [Bloomberg Markets RSS](https://www.bloomberg.com/feeds/markets/news.rss) — Bloomberg markets feed for equities, bonds and broader market coverage. **Access:** Feed availability and article access can vary; some stories are paywalled.
- [CNBC Investing RSS](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069) — CNBC investing and market-news RSS feed. **Access:** RSS endpoint can change; confirm key facts at the original source.
- [CNBC Top News RSS](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114) — CNBC top-news RSS feed for market and business headlines. **Access:** RSS endpoint can change; test in your reader.
- [Event Registry News API](https://eventregistry.org/documentation) — News aggregation and event clustering API for monitoring topics and related articles. **Access:** Account/plan limits may apply.
- [Financial Times RSS Home](https://www.ft.com/rss/home) — Financial Times top-level news feed. **Access:** Some articles are paywalled; feed coverage may be partial.
- [GDELT DOC 2.0 API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) — Search global news coverage by query, language, domain and time window; useful for event monitoring and research pipelines. **Access:** Public API; deduplicate syndicated stories and validate source quality.
- [Google Alerts](https://www.google.com/alerts) — Create alerts for companies, tickers, economic terms, commodities and public announcements. **Access:** Free account-based alerts; delivery timing is not guaranteed real-time.
- [Google News RSS — Crypto Markets](https://news.google.com/rss/search?q=bitcoin+OR+crypto+markets+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen) — Topic feed for Bitcoin, cryptocurrency markets, exchanges and policy developments. **Access:** Public feed; crypto headlines are often promotional or speculative.
- [Google News RSS — Forex & Central Banks](https://news.google.com/rss/search?q=forex+OR+currency+OR+central+bank+markets+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen) — Topic feed for currencies, FX and central-bank developments. **Access:** Public feed; confirm rate decisions at the central bank source.
- [Google News RSS — Global Markets](https://news.google.com/rss/search?q=global+markets+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen) — RSS search feed for global market headlines from multiple publishers. Use as a discovery layer, then open and verify the original article. **Access:** Public feed; publisher coverage and feed behaviour can change.
- [Google News RSS — Gold & XAUUSD](https://news.google.com/rss/search?q=gold+OR+XAUUSD+markets+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen) — Topic feed for Gold, XAUUSD and gold-market news. **Access:** Public feed; keyword matches can include noise.
- [Google News RSS — Oil & Commodities](https://news.google.com/rss/search?q=crude+oil+OR+commodities+markets+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen) — Topic feed for crude oil and broad commodity-market developments. **Access:** Public feed; verify inventories and supply data with official sources.
- [Google News RSS — Stocks & Earnings](https://news.google.com/rss/search?q=stocks+OR+earnings+OR+company+results+when%3A1d&hl=en-US&gl=US&ceid=US%3Aen) — Topic feed for equities, earnings announcements and company results. **Access:** Public feed; go to company IR or exchange filings for the primary document.
- [Google News — Global Markets Search](https://news.google.com/search?q=global%20markets) — Browsable aggregation of global market stories from many publishers. **Access:** Public; ranking and publisher availability vary.
- [Marketaux Financial News API](https://www.marketaux.com/documentation) — Global financial news API with entity extraction, entity sentiment, trending entities and performance intervals. **Access:** API key and plan limits apply; sentiment is a model output, not a trading signal.
- [MarketWatch Top Stories RSS](https://feeds.content.dowjones.io/public/rss/mw_topstories) — MarketWatch top stories RSS feed. **Access:** Some linked articles may require subscription.
- [NewsAPI](https://newsapi.org/docs) — Search and retrieve news articles by topic, source, language and publication time. **Access:** Requires API key; plans and production-use rules apply.
- [NewsCatcher API](https://newscatcherapi.com/) — News search, article monitoring and API products for data pipelines. **Access:** Paid tiers and access limits may apply.

### Open-Source Charts & Quant Tools

- [Apache ECharts](https://echarts.apache.org/en/index.html) — Open-source JavaScript visualization library suitable for dashboards, line charts and heatmaps. **Access:** Apache 2.0; financial candle examples may need custom logic.
- [Awesome Open-Source Trading](https://github.com/WallStreetPete/awesome-open-source-trading) — Curated map of open-source trading, backtesting, broker connectivity, options, data and AI projects. **Access:** Repository metadata and status snapshots age; audit each project’s license and maintenance.
- [backtesting.py](https://github.com/kernc/backtesting.py) — Python framework for single-asset strategy prototyping and backtesting. **Access:** Simple backtests can omit market microstructure and realistic execution effects.
- [CCXT](https://github.com/ccxt/ccxt) — Unified API for public market data and supported trading operations across many crypto exchanges. **Access:** Exchange-specific eligibility, rate limits, API keys and regional restrictions still apply.
- [D3.js](https://d3js.org/) — Low-level visualization library for bespoke chart, market map and time-series experiences. **Access:** Requires implementation work; not a ready-made trading terminal.
- [edgartools](https://github.com/dgunning/edgartools) — Python library for working with SEC EDGAR company filings and financial statements. **Access:** Respect SEC fair-access policies and verify original filings.
- [Freqtrade](https://github.com/freqtrade/freqtrade) — Open-source crypto trading bot with backtesting, strategy optimization and paper/live modes. **Access:** Trading bot is software, not an edge; use dry-run, realistic fees/slippage and security review.
- [Lightweight Charts GitHub](https://github.com/tradingview/lightweight-charts) — Source repository and examples for TradingView Lightweight Charts. **Access:** Apache 2.0 project; check version, notices and datafeed rights.
- [NautilusTrader](https://github.com/nautechsystems/nautilus_trader) — Event-driven trading and backtesting framework with Python/Rust architecture. **Access:** Advanced software; verify exchange adapters, market data and live risk controls.
- [Open-Source Trading Newsdesk](https://github.com/MrChartist/Newsdesk) — Open-source market-news workstation that aggregates and deduplicates financial headlines into stories. **Access:** Repository states a PolyForm Noncommercial license; do not use commercially without rights clearance.
- [Plotly.js](https://plotly.com/javascript/) — JavaScript charting library for interactive plots and financial-style charts. **Access:** Check project licence, deployment and feature-specific requirements.
- [Python Stock Screener by KarneeshkarV](https://github.com/KarneeshkarV/screener) — CLI screener for US and Indian equities including technical, fundamental and unusual-volume workflows. **Access:** Check data source availability, exchange support and repo licence.
- [QuantConnect LEAN](https://github.com/QuantConnect/Lean) — Open-source algorithmic trading engine for research, backtesting and supported live deployments. **Access:** Data and broker integrations have their own costs/terms; production realism matters.
- [Qullamaggie Breakout Scanner](https://github.com/VladPetrariu/Qullamaggie-breakout-scanner) — Pre-market stock scanner and HTML dashboard for breakout research. **Access:** Verify data provider behaviour and repository licence before reuse; not a buy-signal guarantee.
- [React Financial Charts](https://github.com/react-financial/react-financial-charts) — React-oriented financial chart components and technical visualizations. **Access:** Check repository maintenance and dependency versions before production use.
- [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/) — Small open-source HTML5 financial chart library with custom styling and streaming updates. **Access:** Apache 2.0; review attribution notice and licence for distribution.
- [vectorbt](https://github.com/polakowo/vectorbt) — Python framework for fast portfolio research and parameter sweeps. **Access:** Backtests need out-of-sample tests, realistic fees and avoidance of look-ahead bias.
- [yfinance](https://github.com/ranaroussi/yfinance) — Python tool to retrieve Yahoo Finance data for research and prototyping. **Access:** Unofficial interface; provider terms, rate limits, delayed/missing data and redistribution restrictions apply.

### Ownership, Entity & Sanctions Research

- [Companies House API](https://developer.company-information.service.gov.uk/) — Programmatic company register access for UK businesses. **Access:** API account/key and terms may apply.
- [Companies House: PSC guidance](https://www.gov.uk/guidance/people-with-significant-control-pscs) — Understand UK people-with-significant-control filings and ownership context. **Access:** Official UK guidance.
- [GLEIF API Documentation](https://www.gleif.org/en/lei-data/gleif-api) — Query entity LEI records and relationship/reference data programmatically. **Access:** Public API; use identifiers to disambiguate entities.
- [GLEIF LEI Search](https://search.gleif.org/) — Look up Legal Entity Identifiers and relationship data for legal entities. **Access:** Official GLEIF data; coverage varies.
- [GLEIF LEI Search API](https://www.gleif.org/en/lei-data/gleif-api/accessing-the-gleif-api) — Read API documentation for global LEI lookups. **Access:** Public reference data.
- [India MCA Company/LLP Services](https://www.mca.gov.in/) — Official Ministry of Corporate Affairs services and company/LLP information. **Access:** Official India source; some documents/services require login/payment.
- [OpenCorporates](https://opencorporates.com/) — Search company registry information and connect entities across jurisdictions. **Access:** Aggregator; verify with primary company registry.
- [OpenCorporates API](https://api.opencorporates.com/documentation/API-Reference) — Search companies and registered officers in supported jurisdictions. **Access:** API limits/licensing vary.
- [OpenSanctions API](https://www.opensanctions.org/docs/api/) — API for entity search/matching and sanctions/PEP screening. **Access:** Commercial terms apply for business use; verify matches.
- [UK Companies House Search](https://find-and-update.company-information.service.gov.uk/) — UK company filings, officers, accounts and filing history. **Access:** Official/public; check filing dates and completeness.

### Private Markets, Real Assets & Specialty Finance

- [Artemis — Insurance-Linked Securities](https://www.artemis.bm/) — Insurance-linked securities and catastrophe-bond market coverage. **Access:** Specialist research; product access and data vary.
- [ILPA — Institutional Limited Partners Association](https://ilpa.org/) — Private-equity fund research, reporting principles and institutional resources. **Access:** Public resources plus member materials.
- [Lloyd’s — Market Resources](https://www.lloyds.com/market-resources) — Insurance and reinsurance market reports, exposure and market resources. **Access:** Insurance-market information; not a retail trading venue.
- [MSCI Private Capital Solutions](https://www.msci.com/our-solutions/private-assets) — Private asset data and analytics across private capital strategies. **Access:** Paid/licensed data products.
- [MSCI Real Assets](https://www.msci.com/our-solutions/real-assets) — Research and analytics for real estate, infrastructure and private real assets. **Access:** Many datasets/indices are paid/licensed.
- [NAIC — Insurance Data & Research](https://content.naic.org/) — US insurance regulatory data, reports and market resources. **Access:** Official US insurance regulator association resources.
- [Nareit REIT Research](https://www.reit.com/) — REIT market data, sector research and listed real-estate investment resources. **Access:** Industry association; product and index data terms apply.
- [National Venture Capital Association](https://nvca.org/) — US venture-capital industry data, research and policy resources. **Access:** Industry association reports; access varies.
- [PitchBook](https://pitchbook.com/) — Private-market, venture-capital, M&A and fund data. **Access:** Paid/conditional data platform.
- [Preqin](https://www.preqin.com/) — Private-capital data including private equity, private credit, real estate and infrastructure. **Access:** Substantial paid data products.

### Professional Terminals

- [Bloomberg Professional](https://www.bloomberg.com/professional/) — Professional multi-asset data, news and analytics. **Access:** Paid.
- [FactSet](https://www.factset.com/) — Institutional financial data, estimates and investment research. **Access:** Paid.
- [LSEG Workspace](https://www.lseg.com/en/data-analytics/products/workspace) — Financial-market data, company information and analytics. **Access:** Paid.
- [S&P Capital IQ](https://www.spglobal.com/marketintelligence/en/solutions/sp-capital-iq-platform) — Company financials, corporate events and financial analysis. **Access:** Paid.

### Pump/Dump Risk & Token Safety

- [Birdeye API](https://docs.birdeye.so/) — On-chain token price, trading, wallet and market-data APIs across supported networks. **Access:** API plans and chain coverage vary; data does not prove token legitimacy.
- [Bubblemaps](https://bubblemaps.io/) — Visualize token holder relationships and wallet clusters where supported. **Access:** Wallet clusters indicate relationships/transactions, not definitive identity or wrongdoing.
- [CoinGecko New Cryptocurrencies](https://www.coingecko.com/en/new-cryptocurrencies) — Browse newly tracked crypto assets and recent listings. **Access:** New assets often have low liquidity and higher scam/market-manipulation risk.
- [DEX Screener API](https://docs.dexscreener.com/api/reference) — Public DEX pair/token endpoints with price, volume, liquidity, new pairs and boost-related data. **Access:** API rate limits apply; high volume or boosts can be promotional and do not prove a pump is genuine.
- [DEXTools](https://www.dextools.io/) — DEX charts, pair monitoring, liquidity and token discovery tools. **Access:** Trending/pair ranking is not a prediction; promotional activity can distort visibility.
- [FINRA Investor Insights](https://www.finra.org/investors/insights) — Investor education on market manipulation, stock promotions and suspicious trading behaviour. **Access:** Education and warning resources; not live detection of a specific scheme.
- [GeckoTerminal API](https://api.geckoterminal.com/docs/index.html) — On-chain DEX pools, trending/new pools, OHLCV, token and trade data. **Access:** Public API limits and network coverage vary; pool data can be thin or manipulated.
- [GoPlus Security API](https://docs.gopluslabs.io/reference/api-overview) — Token and dApp security APIs including permissions, malicious-address and transaction-risk checks. **Access:** Risk APIs can have false positives/negatives; combine with contract review.
- [Honeypot.is](https://honeypot.is/) — Check supported EVM tokens for honeypot-like sell restrictions and contract warnings. **Access:** Network compatibility and tests vary; passing a check does not make a token safe.
- [RugCheck](https://rugcheck.xyz/) — Solana-focused token risk checks and market/authority analysis. **Access:** Indicators may be incomplete or change; verify on-chain.
- [SEC Investor.gov — Pump-and-Dump Schemes](https://www.investor.gov/protect-your-investments/fraud/types-fraud/pump-and-dump-schemes) — Official investor education explaining how false hype may inflate a price before promoters sell. **Access:** Use as a fraud-awareness reference, not as a signal that a specific asset will dump.
- [SEC Investor.gov — Social Media Investment Scams](https://www.investor.gov/) — SEC investor-education portal covering investment fraud and social-media risks. **Access:** Browse current alerts and bulletins; never assume a social tip is verified.
- [TokenSniffer](https://tokensniffer.com/) — Token contract and risk-screening site for supported networks. **Access:** Automated risk scores are not audits or guarantees.

### Regulatory Enforcement & Fraud

- [CFTC Enforcement Actions](https://www.cftc.gov/LawRegulation/EnforcementActions/index.htm) — Commodity, derivatives, forex and event-contract enforcement actions. **Access:** Official US regulator; includes complaints, settlements and orders.
- [CFTC RED List](https://www.cftc.gov/LearnAndProtect/Resources/Check/redlist.htm) — Foreign entities that appear to be acting in a capacity requiring CFTC registration but are not registered. **Access:** Official US warning list; verify entity identity carefully.
- [CFTC Registration & Disciplinary History](https://www.cftc.gov/check) — Check registration and disciplinary information for relevant CFTC-regulated firms/individuals. **Access:** Official US regulator.
- [CFTC Whistleblower Program](https://www.whistleblower.gov/) — Official program explaining how eligible tips may be submitted and awards work. **Access:** Use only for genuine, lawfully obtained information.
- [CourtListener](https://www.courtlistener.com/) — Search US court opinions, dockets and RECAP documents from public PACER-derived filings. **Access:** Public legal research; some filings may be missing or restricted.
- [EU Sanctions Map](https://www.sanctionsmap.eu/) — EU restrictive measures and country/sector sanctions. **Access:** Official EU information portal.
- [FBI Internet Crime Complaint Center](https://www.ic3.gov/) — Report internet-enabled fraud and cyber-enabled financial crime. **Access:** Official US reporting channel.
- [FCA Enforcement / Final Notices](https://www.fca.org.uk/news/search-results?category=final-notices) — Public enforcement and final notices from the UK regulator. **Access:** Official UK regulator.
- [FCA Financial Services Register](https://register.fca.org.uk/) — Verify UK-authorised firms and individuals. **Access:** Official UK regulator.
- [FCA Warning List](https://www.fca.org.uk/consumers/warning-list-unauthorised-firms) — UK FCA list of unauthorised firms and individuals the regulator has warned about. **Access:** Official UK warning list; always verify current status.
- [FINRA BrokerCheck](https://brokercheck.finra.org/) — Research US brokers, firms, registrations and disclosure history. **Access:** Official FINRA tool.
- [FINRA Disciplinary Actions](https://www.finra.org/rules-guidance/oversight-enforcement/finra-disciplinary-actions) — Public disciplinary actions and notices. **Access:** Official industry regulator/SRO.
- [OFAC Sanctions Search](https://sanctionssearch.ofac.treas.gov/) — Search US Treasury sanctions lists. **Access:** Official US sanctions tool.
- [OpenSanctions](https://www.opensanctions.org/) — Search structured sanctions, politically exposed persons and related-entity datasets. **Access:** Data vendor/aggregator; verify against primary authority and licensing.
- [PACER](https://pacer.uscourts.gov/) — Official US federal court case and docket access. **Access:** Account/fees may apply.
- [RBI Alert List](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4235) — RBI list of unauthorised forex trading platforms (check the latest version on the RBI site). **Access:** Official India warning resource; lists change over time.
- [RBI Press Releases](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx) — Reserve Bank of India announcements, policy updates and public notices. **Access:** Official India central bank.
- [SEBI Orders & Directions](https://www.sebi.gov.in/enforcement/orders.html) — Indian securities enforcement orders and directions. **Access:** Official India regulator.
- [SEBI Press Releases](https://www.sebi.gov.in/media-and-notifications/press-releases.html) — Indian regulatory announcements and action updates. **Access:** Official India regulator.
- [SEC Enforcement & Litigation](https://www.sec.gov/enforcement-litigation) — US securities enforcement actions, litigation releases and public case materials. **Access:** Official US regulator; allegations and final outcomes are different.
- [SEC Investment Adviser Public Disclosure (IAPD)](https://adviserinfo.sec.gov/) — Search US investment advisers and representatives, registrations and public disclosures. **Access:** Official US regulator.
- [SEC Tips, Complaints and Referrals](https://www.sec.gov/tcr) — Official channel to report suspected securities-law violations. **Access:** Do not submit fabricated or unlawfully obtained material.
- [UK Sanctions List](https://www.gov.uk/government/publications/the-uk-sanctions-list) — Official UK sanctions designations and notices. **Access:** Official UK government.
- [UN Security Council Consolidated List](https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list) — UN Security Council sanctions list. **Access:** Official UN.
- [US Department of Justice — Fraud Section](https://www.justice.gov/criminal/criminal-fraud) — Public information on corporate, securities and financial fraud enforcement. **Access:** Official US DOJ.
- [US DOJ Press Releases](https://www.justice.gov/news) — Public criminal/civil case announcements and enforcement outcomes. **Access:** Official US DOJ; charges are allegations until proven/adjudicated.

### RSS & News Aggregation

- [Feedly](https://feedly.com/) — News reader for organizing sources, topics, publications and monitoring feeds. **Access:** Freemium/paid plans; some advanced intelligence features are paid.
- [FreshRSS](https://github.com/FreshRSS/FreshRSS) — Self-hosted RSS/Atom feed reader for consolidating finance news feeds. **Access:** Open source; individual feed copyright and access terms still apply.
- [Inoreader](https://www.inoreader.com/) — RSS reader and web-monitoring workflow for tracking financial sources and saved searches. **Access:** Freemium/paid features; source terms apply.
- [Miniflux](https://github.com/miniflux/v2) — Lightweight self-hosted RSS reader and feed aggregation service. **Access:** Open source; requires hosting/setup.
- [RSS-Bridge](https://github.com/RSS-Bridge/rss-bridge) — Open-source project that generates RSS/Atom feeds for supported web sources without native feeds. **Access:** Self-hosting and supported website compatibility vary; respect site terms.

### Sentiment & Market Breadth

- [AAII Investor Sentiment Survey](https://www.aaii.com/sentiment-survey) — Weekly individual-investor bullish/neutral/bearish survey; useful as a medium-term sentiment context. **Access:** Survey sentiment is not a direct forecast; full historical data may require membership.
- [CNN Fear & Greed Index](https://www.cnn.com/markets/fear-and-greed) — US-equity risk-appetite composite built from market indicators. **Access:** Methodology and value are CNN-specific; index is not a standalone timing signal.
- [Crypto Fear & Greed Index](https://alternative.me/crypto/fear-and-greed-index/) — Crypto sentiment indicator and historical readings. **Access:** Methodology and source inputs matter; treat as one sentiment feature only.
- [Farside Investors — Bitcoin ETF Flows](https://farside.co.uk/bitcoin-etf-flow-all-data/) — Daily US spot-Bitcoin ETF flow table for flow-context research. **Access:** Check the latest date and update status; flows do not guarantee price direction.
- [Google Trends — Global Markets Explore](https://trends.google.com/trends/explore?geo=US&q=stock%20market,bitcoin,gold,oil) — Compare interest in stock market, Bitcoin, Gold and Oil topics over time. **Access:** Normalized search-interest index; not absolute volumes or sentiment.
- [Google Trends — Trending Now](https://trends.google.co.in/trending?geo=IN) — Find search queries whose interest is rising; Trends supports 100+ countries and recent time windows. **Access:** Search interest is attention, not buy/sell demand or a price forecast.
- [NAAIM Exposure Index](https://naaim.org/programs/naaim-exposure-index/) — Weekly average US equity exposure reported by active investment managers. **Access:** Some public data is delayed; it measures reported positioning, not future direction.

### Whistleblower & Public-Interest Reporting

- [FinCEN Advisories](https://www.fincen.gov/resources/advisoriesbulletinsfact-sheets) — AML and illicit-finance typologies that help understand risk patterns. **Access:** Official; not a list of all suspicious activity.
- [FinCEN Press Releases](https://www.fincen.gov/news-room) — Public notices on AML, suspicious finance, enforcement and financial crime. **Access:** Official US Treasury bureau.
- [Global Anti-Corruption Blog](https://globalanticorruptionblog.com/) — Commentary and research on corruption, compliance and corporate misconduct. **Access:** Expert commentary, not official legal decisions.
- [OFAC Recent Actions](https://ofac.treasury.gov/recent-actions) — Recent sanctions designations and updates. **Access:** Official US Treasury.
- [SEC Whistleblower Program](https://www.sec.gov/enforcement-litigation/whistleblower-program) — Official information on qualifying tips about securities-law violations. **Access:** For lawful reporting; eligibility and confidentiality rules apply.

### X & Social Signals

- [Bloomberg Markets on X](https://x.com/markets) — Bloomberg Markets social feed for global market headlines and analysis. **Access:** Social posts can be shorter than the underlying reporting; check source links.
- [CNBC on X](https://x.com/CNBC) — Business and market-news headlines, interviews and live coverage. **Access:** News/media feed; not a primary filing source.
- [Financial Times on X](https://x.com/FinancialTimes) — Global business and finance headlines from Financial Times. **Access:** Some articles require a subscription.
- [ForexLive](https://www.forexlive.com/) — FX and macro news commentary, central-bank coverage and market updates. **Access:** Commentary and headlines; not a substitute for official releases.
- [Lookonchain](https://lookonchain.com/) — Public blockchain wallet and transaction research with social-media distribution. **Access:** Wallet labels and interpretation can be wrong; verify on-chain transactions independently.
- [Nasdaq on X](https://x.com/Nasdaq) — Exchange announcements, market information and listed-company related content. **Access:** Official-source link verification recommended.
- [NYSE on X](https://x.com/NYSE) — NYSE market news, exchange announcements and company-listing content. **Access:** Official-source link verification recommended.
- [Reddit r/Forex](https://www.reddit.com/r/Forex/) — Forex trading discussion and learning resources. **Access:** User-generated; verify claims, broker rules and strategies independently.
- [Reddit r/stocks](https://www.reddit.com/r/stocks/) — Community discussion that can surface questions, narratives and crowd attention. **Access:** Unverified user-generated content; confirm claims with primary sources.
- [Reddit r/wallstreetbets](https://www.reddit.com/r/wallstreetbets/) — High-risk retail trading narratives and crowd attention. **Access:** Can contain jokes, promotions, conflicts and coordinated hype; never treat as verified signals.
- [Reuters Business on X](https://x.com/ReutersBiz) — Reuters business-news account; useful for fast headlines with a path back to Reuters reporting. **Access:** Social feed; verify stories and timestamps at the original report.
- [Stocktwits Trending](https://stocktwits.com/rankings/trending) — Discover tickers receiving attention from the Stocktwits community. **Access:** Trending indicates attention, not expected returns or trade direction.
- [X Search — Crypto Listings / Unlocks](https://x.com/search?q=%28crypto%20OR%20token%29%20%28listing%20OR%20unlock%20OR%20exploit%29&src=typed_query) — Search for token listings, unlocks and exploit reports. **Access:** Confirm on an exchange, project status page, chain explorer or security advisory.
- [X Search — Gold / XAUUSD](https://x.com/search?q=%28XAUUSD%20OR%20gold%29%20%28news%20OR%20Fed%20OR%20CPI%29&src=typed_query) — Search Gold/XAUUSD discussion and event narratives. **Access:** Use as lead discovery; not an endorsement of any account.
- [X Search — Market-Moving News](https://x.com/search?q=%22breaking%22%20%28stocks%20OR%20forex%20OR%20gold%20OR%20bitcoin%29&src=typed_query) — Live search for posts using market-moving language across major asset classes. **Access:** Search result is noisy and spoofable; verify publisher identity and source documents.

### X / Social Market Signals

- [Bank of England on X](https://x.com/bankofengland) — UK monetary-policy and central-bank updates. **Access:** Confirm on bankofengland.co.uk.
- [Bloomberg on X](https://x.com/business) — Bloomberg business and market headlines. **Access:** News source; some details may require subscription.
- [BSE India on X](https://x.com/BSEIndia) — Exchange updates and corporate-market information. **Access:** Confirm disclosures on bseindia.com.
- [Cboe on X](https://x.com/CBOE) — Exchange announcements, options/volatility information and market education. **Access:** Verify account and use official product/data documentation.
- [CFTC on X](https://x.com/CFTC) — Commodity Futures Trading Commission updates, enforcement and public notices. **Access:** Official account at time curated; verify profile.
- [CME Group on X](https://x.com/CMEGroup) — Official CME Group market/derivatives updates. **Access:** Exchange source; not a substitute for contract data.
- [CoinGlass on X](https://x.com/CoinGlass_com) — Crypto derivatives, funding and liquidation analytics. **Access:** Check underlying dataset and timestamp.
- [DeFiLlama on X](https://x.com/DefiLlama) — DeFi metrics and protocol-data updates. **Access:** Verify definitions and protocol coverage.
- [EIA on X](https://x.com/EIAgov) — US energy and petroleum data updates. **Access:** Confirm weekly report/API timestamps on eia.gov.
- [European Central Bank on X](https://x.com/ecb) — Central-bank announcements and research links. **Access:** Confirm on ecb.europa.eu.
- [Federal Reserve on X](https://x.com/federalreserve) — Official Federal Reserve social account for announcements and updates. **Access:** Official source; always cross-check linked release.
- [Financial Times on X](https://x.com/FT) — Financial Times reporting, macro and company news. **Access:** Journalism; verify article context and publication time.
- [FinancialJuice on X](https://x.com/financialjuice) — Economic calendar headlines and market-news alerts. **Access:** Third-party alert feed; cross-check official releases.
- [First Squawk on X](https://x.com/FirstSquawk) — Fast market/news alert account. **Access:** Third-party feed; verify against original source.
- [Glassnode on X](https://x.com/glassnode) — Crypto on-chain research and analytics. **Access:** Research vendor; metric definitions matter.
- [ICE on X](https://x.com/ICE_Markets) — Intercontinental Exchange company and market announcements. **Access:** Verify account authenticity and linked issuer source.
- [Lookonchain on X](https://x.com/lookonchain) — Crypto wallet and on-chain transaction alerts. **Access:** On-chain interpretation may be uncertain; verify transaction hashes.
- [NSE India on X](https://x.com/NSEIndia) — Exchange announcements and market notices. **Access:** Confirm market notices on nseindia.com.
- [RBI on X](https://x.com/RBI) — Reserve Bank of India public notices and announcements. **Access:** Verify current official profile; original RBI releases take priority.
- [Reuters on X](https://x.com/Reuters) — Global news reporting and urgent headlines. **Access:** News source; verify original reporting.
- [SEBI on X](https://x.com/SEBI_India) — Indian securities-regulator communications. **Access:** Confirm announcements on sebi.gov.in.
- [SEC on X](https://x.com/SECGov) — Official US Securities and Exchange Commission account. **Access:** Official source.
- [Stock Market News on X](https://x.com/StockMKTNewz) — Fast equity-market headlines and company catalysts. **Access:** Third-party news aggregation; verify before acting.
- [The Kobeissi Letter on X](https://x.com/KobeissiLetter) — Macro, rates, commodities and market commentary. **Access:** Commentary/analysis; not an official data source.
- [Unusual Whales on X](https://x.com/unusual_whales) — Options, political-disclosure and market-data commentary. **Access:** Analytics/commentary; public filings should be verified.
- [US Treasury on X](https://x.com/USTreasury) — Treasury announcements and fiscal/financial updates. **Access:** Confirm official releases.
- [Walter Bloomberg / DeItaone on X](https://x.com/DeItaone) — Fast reposts and headline monitoring used by market participants. **Access:** Not a primary source; confirm every material claim.
- [Whale Alert on X](https://x.com/whale_alert) — Large blockchain transfer alerts. **Access:** Transfers are not proof of buying/selling intent.
- [ZeroHedge on X](https://x.com/zerohedge) — Macro and market commentary. **Access:** Opinion/commentary; cross-check with primary sources.

## Open-source and licensing notes

Open-source applies to the code, not automatically to market data collected by the code. Check project licenses, source terms, quote latency, redistribution rights, API rate limits and commercial-use restrictions. TradingView Lightweight Charts is Apache 2.0; the Newsdesk repository identifies a non-commercial license. Backtests do not guarantee live results.

## India access and eligibility

The directory distinguishes informational access from real-money trading eligibility. Check current RBI/SEBI/exchange rules and each platform’s country restrictions. Do not use VPNs to circumvent blocks or terms. A site appearing in this directory is not a statement that it is legally tradeable from India.



---

# Preserved original: Finance_Intelligence_OS_Ultimate_Global_Directory.md

> The following is the original source document, preserved verbatim.

# Finance Intelligence OS — Ultimate Global Directory

Curated: 26 October 2026 · 422 resources · 32 categories. This is a curated directory, not an exhaustive index of the internet or a live-data terminal.

## Status key

- **research** — public research/information link; not a guarantee that related trading is allowed in India.
- **blocked** — explicit restriction reference is recorded; do not circumvent.
- **unclear** — real-money eligibility/legal status not verified; do not assume access.
- **restricted** — legal/regulatory reference page, not a platform availability label.

## Important official references

- [MeitY advisory dated 25 April 2026](https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf)
- [RBI Forex FAQ](https://www.rbi.org.in/scripts/FS_FAQs.aspx?Id=146)
- [RBI authorised ETP information](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4080)
- [RBI Alert List](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4235)
- [CME products](https://www.cmegroup.com/markets/products.html) · [ICE products](https://www.ice.com/products/Futures-Options/) · [BIS Data Portal](https://data.bis.org/)

## Tradable asset universe

### 📈 Equities & Indices

Stocks, broad and sector indices, ETFs, REITs, ADRs, IPOs, equity futures/options and dividend products.

**Sources:** CME Equity Index · Cboe · Nasdaq · NYSE · [Open catalogue](https://www.cmegroup.com/markets/equities.html)

### 💱 FX & Currencies

G10 majors, cross/minor pairs, emerging-market FX, currency futures/options, forwards, swaps and NDFs.

**Sources:** CME FX · ICE FX · BIS effective exchange rates · [Open catalogue](https://www.cmegroup.com/markets/fx.html)

### 🏦 Bonds, Rates & Credit

Treasuries, sovereign and corporate bonds, T-bills, inflation-linked debt, SOFR, rate futures, swaps, CDS and credit indices.

**Sources:** US Treasury · New York Fed · BIS · FINRA · [Open catalogue](https://www.cmegroup.com/markets/interest-rates.html)

### 🥇 Precious & Industrial Metals

Gold, silver, platinum, palladium, copper, aluminium, nickel, zinc, lead, tin, battery materials and mineral supply data.

**Sources:** CME Metals · LME · USGS · LBMA · [Open catalogue](https://www.cmegroup.com/markets/metals.html)

### ⚡ Energy & Fuels

WTI/Brent crude, refined products, natural gas, LNG, power, coal, biofuels, petrochemicals and energy spreads.

**Sources:** CME Energy · ICE Energy · EIA · IEA · [Open catalogue](https://www.ice.com/products/Futures-Options/Energy)

### 🌾 Agriculture & Softs

Wheat, corn, soy, rice-related markets, coffee, cocoa, sugar, cotton, livestock, dairy and crop-supply reports.

**Sources:** CME Agriculture · USDA · FAO · ICE · [Open catalogue](https://www.cmegroup.com/markets/agriculture.html)

### ₿ Crypto & Digital Assets

Spot crypto, listed futures/options, perpetual swaps, stablecoins, token unlocks, DeFi, on-chain flows and tokenized assets.

**Sources:** CME Crypto · CoinGlass · DeFiLlama · CryptoQuant · [Open catalogue](https://www.cmegroup.com/markets/cryptocurrencies.html)

### 〽️ Volatility & Derivatives

VIX futures/options, index options, variance exposure, dividend futures, volatility skew and options open interest.

**Sources:** Cboe · OCC · Eurex · CME · [Open catalogue](https://www.cboe.com/tradable-products/product-list/)

### 🚢 Freight & Shipping

Dry bulk, tanker, container freight, route-specific freight futures, FFAs and shipping benchmarks.

**Sources:** ICE Freight · Baltic Exchange · EEX · UNCTAD · [Open catalogue](https://www.ice.com/products/Futures-Options/Freight)

### 🌱 Carbon & Environmental

Carbon allowances, emissions products, renewable certificates and scheme-specific environmental markets.

**Sources:** ICE Emissions · EEX · RGGI · California CARB · [Open catalogue](https://www.ice.com/products/Futures-Options/Energy/Emissions)

### 🌦️ Weather & Natural Risk

Weather observations and seasonal outlooks that affect crops, power demand, shipping, energy and specialist risk contracts.

**Sources:** NOAA Climate Data · NOAA CPC · CME catalogue · [Open catalogue](https://www.ncei.noaa.gov/cdo-web/)

### 🏢 Real Estate & Private Markets

REITs, real estate funds, infrastructure, private equity, venture capital, private credit and secondary-market research.

**Sources:** Nareit · MSCI Real Assets · ILPA · NVCA · [Open catalogue](https://www.reit.com/)

### 🛡️ Insurance-Linked Finance

Catastrophe bonds, reinsurance, insurance-linked securities and catastrophe-risk transfer research.

**Sources:** Artemis · NAIC · Lloyd’s · [Open catalogue](https://www.artemis.bm/)

### 🔮 Prediction & Event Markets

Community forecasts, event probabilities and money-staked contracts; separate public research from jurisdiction-specific trading eligibility.

**Sources:** Metaculus · Good Judgment · official platform terms · [Open catalogue](https://www.metaculus.com/)

### 🧩 Private & Alternative Assets

Art, collectibles, royalties, intellectual property, domains and specialist private-market assets; liquidity and valuation vary widely.

**Sources:** ICMA/industry sources · specialist research only · [Open catalogue](https://www.msci.com/our-solutions/real-assets)

## Trading mechanisms

- **Spot / Cash:** Buy or sell the underlying asset for standard settlement. Custody, settlement and market access matter.
- **ETFs / ETPs:** Exchange-traded funds/products provide basket or rule-based exposure; check holdings, tracking, fees and legal structure.
- **Futures:** Standardized contracts with expiry, contract multiplier, margin and settlement/delivery terms.
- **Options:** Calls/puts with premium, strike, expiry, implied volatility and Greeks; payoff can be nonlinear.
- **Forwards / NDFs:** Bilateral or specialized future-date contracts; counterparty and settlement terms are central.
- **Swaps / Swaptions:** Exchange cash flows or obtain options on swaps; generally more specialized and often institutional.
- **Perpetual Swaps:** Crypto-style derivatives without fixed expiry; funding and liquidation mechanics are critical.
- **Short Selling:** Negative exposure through borrowing/other permitted mechanisms; borrow cost, recall and margin risk apply.
- **Repo / Securities Lending:** Collateralized funding and securities borrowing/lending; market plumbing rather than ordinary retail trading.
- **CFDs / Spread Betting:** Broker or jurisdiction-specific leveraged products. Availability, protections and legality vary by country.
- **Credit / ILS:** CDS, credit-index and insurance-linked contracts expose users to defined credit/catastrophe outcomes.
- **Event Contracts:** Contracts linked to a specified event outcome; resolution methodology, eligibility and local legality must be checked.
- **Private Assets:** Private equity, real assets and collectibles often have slower valuation, transfer restrictions and low liquidity.

## Full resource directory

### APIs & Developer Resources (13)

- **[EOD Historical Data API](https://eodhd.com/financial-apis/)** — Historical market prices, fundamentals, corporate events and related data. _Access:_ Paid tiers; check exchange licensing. _Status:_ `research`
- **[Google News RSS search](https://news.google.com/)** — News discovery from many publishers; use query terms, then open original publisher. _Access:_ Aggregation and availability vary; not all publishers permit reuse. _Status:_ `research`
- **[Intrinio](https://intrinio.com/documentation)** — Financial data APIs for prices, fundamentals, estimates and institutional data products. _Access:_ Paid/licensed. _Status:_ `research`
- **[Marketstack API](https://marketstack.com/documentation)** — REST API for stock-market data and historical EOD/intraday offerings. _Access:_ Free/paid plans; latency/coverage vary. _Status:_ `research`
- **[OpenBB Documentation](https://docs.openbb.co/)** — Integration patterns for market/macro data and financial research workflows. _Access:_ Provider entitlements still apply. _Status:_ `research`
- **[Polygon.io / Massive API](https://massive.com/docs)** — Market-data APIs for stocks, options, indices, forex and crypto offerings. _Access:_ Paid tiers and licensing apply. _Status:_ `research`
- **[SEC XBRL Company Facts API](https://www.sec.gov/edgar/sec-api-documentation)** — Structured company facts and filings for quantitative fundamentals. _Access:_ Official US source; fair access and data terms apply. _Status:_ `research`
- **[Stocktwits API / developer information](https://api.stocktwits.com/developers)** — Social sentiment and symbol conversation integration where API access is offered. _Access:_ Review access status and platform terms. _Status:_ `research`
- **[Tiingo API](https://www.tiingo.com/documentation/general/overview)** — Financial data API for prices, fundamentals and news endpoints where available. _Access:_ Account/plan and exchange terms apply. _Status:_ `research`
- **[Tiingo IEX/News API docs](https://www.tiingo.com/documentation)** — API documentation for supported market data and news. _Access:_ Data entitlements vary. _Status:_ `research`
- **[UN Comtrade API](https://comtradeapi.un.org/)** — Programmatic international trade data queries. _Access:_ Registration/limits may apply. _Status:_ `research`
- **[World Bank API: Indicators](https://api.worldbank.org/)** — Programmatic country/indicator access for macroeconomic comparisons. _Access:_ Public API; query and usage conventions apply. _Status:_ `research`
- **[X API Documentation](https://developer.x.com/en/docs)** — Official developer docs for social posts, search and account data subject to current access tiers. _Access:_ Paid access/rate limits; comply with platform terms. _Status:_ `research`

### APIs & Open Source (15)

- **[Alpha Vantage API](https://www.alphavantage.co/documentation/)** — Market data, FX, crypto, fundamentals and indicators. _Access:_ Free/paid tiers and limits. _Status:_ `research`
- **[CoinGlass API](https://docs.coinglass.com/reference/getting-started-with-your-api)** — Crypto derivatives, funding, open interest and liquidation data. _Access:_ API key/paid limits may apply. _Status:_ `research`
- **[DeFiLlama API](https://api-docs.defillama.com/)** — Supported DeFi protocol and TVL metrics. _Access:_ Endpoint terms vary. _Status:_ `research`
- **[Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)** — Financial statements, fundamentals and market data. _Access:_ Free/paid tiers. _Status:_ `research`
- **[Fincept Terminal GitHub](https://github.com/Fincept-Corporation/FinceptTerminal)** — Open-source financial terminal and analytics application. _Access:_ Open source; check current license and setup. _Status:_ `research`
- **[Finnhub API](https://finnhub.io/docs/api)** — Market data, company information and news endpoints. _Access:_ Free/paid tiers. _Status:_ `research`
- **[FRED API](https://fred.stlouisfed.org/docs/api/fred/)** — Historical macroeconomic and financial time series. _Access:_ Public API; terms/limits apply. _Status:_ `research`
- **[IMF Data APIs](https://data.imf.org/en/Resource-Pages/IMF-API)** — International economic data integration. _Access:_ Public/conditional by dataset. _Status:_ `research`
- **[Nasdaq Data Link](https://docs.data.nasdaq.com/)** — Financial and alternative datasets. _Access:_ Dataset licensing/pricing varies. _Status:_ `research`
- **[OpenBB GitHub](https://github.com/OpenBB-finance/OpenBB)** — Financial data and research infrastructure. _Access:_ Open source/platform terms vary. _Status:_ `research`
- **[SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)** — Company submissions and structured financial facts. _Access:_ Official/public; follow fair-access requirements. _Status:_ `research`
- **[Trading Economics API](https://docs.tradingeconomics.com/get_started/)** — Economic calendar, indicators, yields and related datasets. _Access:_ Paid/conditional limits. _Status:_ `research`
- **[TradingAgents GitHub](https://github.com/TauricResearch/TradingAgents)** — Multi-agent LLM financial research framework. _Access:_ Open source; check current license and requirements. _Status:_ `research`
- **[Twelve Data API](https://twelvedata.com/docs)** — Stocks, Forex, crypto and technical time series. _Access:_ Free/paid tiers. _Status:_ `research`
- **[World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)** — Country-level economic and development indicators. _Access:_ Public. _Status:_ `research`

### Bonds, Rates & Credit (15)

- **[BIS Debt Securities Statistics](https://data.bis.org/topics/DSS)** — Cross-country debt securities issuance and holdings statistics for bills, bonds and other debt instruments. _Access:_ Official international statistics; mostly periodic, not tick-by-tick. _Status:_ `research` _Tags:_ debt securities bonds commercial paper
- **[BIS Global Liquidity Indicators](https://www.bis.org/statistics/gli.htm)** — International credit and foreign-currency borrowing indicators. _Access:_ Official aggregate data; release frequency varies. _Status:_ `research` _Tags:_ global liquidity dollar credit foreign currency
- **[BIS OTC Derivatives Statistics](https://data.bis.org/topics/OTC_DER)** — Global OTC derivative market statistics by product and counterparty/market attributes. _Access:_ Official aggregate statistics, not individual position disclosures. _Status:_ `research` _Tags:_ swaps FX derivatives rates credit
- **[CCIL Periodic Market Data](https://www.ccilindia.com/periodic-data)** — Indian government securities, money-market, FX and derivatives trade/settlement statistics. _Access:_ Official market infrastructure; report coverage/frequency varies. _Status:_ `research` _Tags:_ India bonds G-Sec repo forex derivatives
- **[DTCC Trade Information Warehouse](https://www.dtcc.com/repository-and-derivatives-services/derivatives-trade-reporting)** — Derivatives post-trade infrastructure and reporting information, including credit-derivative market infrastructure. _Access:_ Institutional market infrastructure; not a free retail flow feed. _Status:_ `research` _Tags:_ CDS swaps derivatives clearing reporting
- **[Fitch Ratings](https://www.fitchratings.com/)** — Credit ratings, rating actions and research. _Access:_ Public notices plus paid/conditional data. _Status:_ `research` _Tags:_ credit default bonds sovereign corporate
- **[Moody’s Ratings](https://ratings.moodys.com/)** — Credit ratings and selected issuer/sector research. _Access:_ Public notices plus paid products; rating is an opinion, not a guarantee. _Status:_ `research` _Tags:_ credit risk corporate sovereign bonds
- **[MSRB EMMA — Municipal Bond Disclosures](https://emma.msrb.org/AboutEMMA/Overview)** — Official US municipal securities disclosures, trade data, yields and offering documents. _Access:_ Free public research; not a trading venue. _Status:_ `research` _Tags:_ municipal bonds muni debt yields
- **[New York Fed — Markets Data APIs](https://www.newyorkfed.org/markets/data)** — Markets data and API resources from the Federal Reserve Bank of New York. _Access:_ Official public data; endpoint and terms vary. _Status:_ `research` _Tags:_ repo SOFR treasury rates APIs
- **[New York Fed — SOFR Data](https://www.newyorkfed.org/markets/reference-rates/sofr)** — Daily Secured Overnight Financing Rate (SOFR), methodology and market-rate links. _Access:_ Official New York Fed data. _Status:_ `research` _Tags:_ SOFR repo funding rates money market
- **[Office of Financial Research — Data Collections](https://www.financialresearch.gov/data/collections/)** — US short-term funding, repo and financial-stability datasets. _Access:_ Official research data; coverage is specific to each collection. _Status:_ `research` _Tags:_ repo short-term funding liquidity
- **[OFR Short-Term Funding Monitor](https://www.financialresearch.gov/short-term-funding-monitor/)** — Monitor for US short-term funding-market conditions and selected repo/secured financing indicators. _Access:_ Official public research tool. _Status:_ `research` _Tags:_ repo funding rates liquidity
- **[RBI Retail Direct](https://rbiretaildirect.org.in/)** — Official retail access framework for Indian government securities, subject to account and eligibility rules. _Access:_ India-specific; not a global bond trading platform. _Status:_ `research` _Tags:_ India government bonds T-bills G-Sec
- **[S&P Global Ratings](https://www.spglobal.com/ratings/en/)** — Credit-rating research, ratings actions and issuer credit opinions. _Access:_ Some research is public; substantial data/services may be paid. _Status:_ `research` _Tags:_ credit risk rating sovereign corporate bonds
- **[TreasuryDirect — Auction Data & Research](https://www.treasurydirect.gov/auctions/announcements-data-results/useful-data-for-research/)** — US Treasury auction schedules, auction results, debt data and related research resources. _Access:_ Official US Treasury resource. _Status:_ `research` _Tags:_ treasury auctions debt bills notes bonds

### Bonds, Volatility & Options (15)

- **[Cboe DataShop](https://datashop.cboe.com/option-quote-intervals)** — Options quote and intraday interval data. _Access:_ Paid data product. _Status:_ `research`
- **[Cboe VIX](https://www.cboe.com/tradable_products/vix/)** — S&P 500 options-derived expected-volatility index. _Access:_ Public information; data products may be paid. _Status:_ `research`
- **[CFTC COT Reports](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm)** — Reported futures positioning by trader categories. _Access:_ Official/public; not real-time order flow. _Status:_ `research`
- **[CFTC Market Reports](https://www.cftc.gov/MarketReports/index.htm)** — Futures positioning, swaps and derivatives reports. _Access:_ Official/public; many reports are delayed. _Status:_ `research`
- **[Cheddar Flow](https://www.cheddarflow.com/)** — Options-flow research and unusual activity. _Access:_ Paid/conditional. _Status:_ `research`
- **[CME Group](https://www.cmegroup.com/)** — Futures, options, rates and commodity-market information. _Access:_ Public/paid data products. _Status:_ `research`
- **[FINRA ATS Transparency](https://www.finra.org/finra-data/browse-catalog/ats-transparency-data)** — Reported activity for US alternative trading systems. _Access:_ Reported/aggregated data; not a live dark-pool tape. _Status:_ `research`
- **[FINRA Fixed Income Data](https://www.finra.org/finra-data/fixed-income)** — US fixed-income market information. _Access:_ Public/conditional datasets. _Status:_ `research`
- **[FINRA Short Sale Volume](https://www.finra.org/finra-data/browse-catalog/short-sale-volume-data)** — Short-sale volume datasets. _Access:_ Not the same as short interest. _Status:_ `research`
- **[FINRA TRACE](https://www.finra.org/finra-data/fixed-income/trace)** — Reported transactions in covered US bond markets. _Access:_ Data scope and delay vary. _Status:_ `research`
- **[Nasdaq Short Interest](https://www.nasdaqtrader.com/Trader.aspx?id=ShortInterest)** — Reported short-interest information. _Access:_ Periodic reporting. _Status:_ `research`
- **[OCC Options Volume & Open Interest](https://www.theocc.com/market-data/market-data-reports/volume-and-open-interest)** — Listed options volume and open interest. _Access:_ Public reports; detailed data may be conditional. _Status:_ `research`
- **[SIFMA Research](https://www.sifma.org/resources/research/)** — Bond markets, securities-industry and market statistics. _Access:_ Public reports. _Status:_ `research`
- **[Unusual Flow](https://unusualflow.com/)** — Options activity analytics. _Access:_ Access/pricing varies. _Status:_ `research`
- **[Unusual Whales](https://unusualwhales.com/)** — Options activity and unusual-trading analytics. _Access:_ Freemium/paid; flow is not necessarily directional. _Status:_ `research`

### Commodities & Supply Data (9)

- **[CME Commodity Markets](https://www.cmegroup.com/markets/commodities.html)** — Commodity futures contracts, prices and exchange information. _Access:_ Public/paid data products. _Status:_ `research`
- **[EIA Open Data API](https://www.eia.gov/opendata/)** — Energy datasets and API access. _Access:_ Official/public; API key/limits may apply. _Status:_ `research`
- **[EIA Weekly Petroleum Report](https://www.eia.gov/petroleum/supply/weekly/)** — US crude inventories, production, refinery activity and balances. _Access:_ Official/public. _Status:_ `research`
- **[International Energy Agency](https://www.iea.org/reports/oil-market-report)** — Oil demand, supply and market outlook. _Access:_ Reports may have access conditions. _Status:_ `research`
- **[LBMA Prices & Data](https://www.lbma.org.uk/prices-and-data)** — Precious-metal benchmarks and market data resources. _Access:_ Some data is licensed/paid. _Status:_ `research`
- **[London Metal Exchange Warehouse Data](https://www.lme.com/Market-data/Reports-and-data/Warehouse-and-stocks)** — Industrial-metal warehouse and stock reports. _Access:_ Some data products may be paid. _Status:_ `research`
- **[OPEC](https://www.opec.org/)** — Oil-market reports and production information. _Access:_ Official/public. _Status:_ `research`
- **[USDA WASDE](https://www.usda.gov/oce/commodity/wasde)** — Global agricultural supply, demand and stocks estimates. _Access:_ Official/public. _Status:_ `research`
- **[World Gold Council](https://www.gold.org/goldhub)** — Gold demand, ETF flows and market research. _Access:_ Public reports; some data services conditional. _Status:_ `research`

### Commodities, Freight & Environment (14)

- **[California Air Resources Board — Cap-and-Trade](https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program)** — California carbon cap-and-trade programme, rules, auctions and public reports. _Access:_ Official programme information; not a universal carbon market. _Status:_ `research` _Tags:_ California carbon emissions allowances
- **[Drewry World Container Index](https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry)** — Container freight rate benchmarks for selected routes. _Access:_ Public summaries; detailed data/subscription may be paid. _Status:_ `research` _Tags:_ container shipping freight route costs
- **[European Energy Exchange (EEX)](https://www.eex.com/en/)** — Power, gas, environmental and commodity-related listed products/data. _Access:_ Official exchange; access and data subscriptions vary. _Status:_ `research` _Tags:_ electricity natural gas emissions carbon futures
- **[FAO Food Price Index](https://www.fao.org/worldfoodsituation/foodpricesindex/en/)** — Global food commodity price index and monthly releases. _Access:_ Official public data; macro/food market context. _Status:_ `research` _Tags:_ agriculture food prices grains oils sugar
- **[International Copper Study Group](https://icsg.org/)** — Copper production, usage and supply-demand statistics. _Access:_ Industry intergovernmental group; periodic releases. _Status:_ `research` _Tags:_ copper mine production refined metal inventories
- **[International Lead and Zinc Study Group](https://www.ilzsg.org/)** — Lead and zinc production/usage statistics and market information. _Access:_ Industry group data frequency varies. _Status:_ `research` _Tags:_ lead zinc industrial metals
- **[International Nickel Study Group](https://insg.org/)** — Nickel supply-demand and industry statistics. _Access:_ Industry group data frequency varies. _Status:_ `research` _Tags:_ nickel stainless steel battery supply demand
- **[NOAA Climate Prediction Center](https://www.cpc.ncep.noaa.gov/)** — Climate outlooks and seasonal forecasts affecting agriculture and energy risk. _Access:_ Official forecasts; uncertainty and regional scope matter. _Status:_ `research` _Tags:_ weather forecast climate agriculture energy
- **[OPEC Monthly Oil Market Report](https://www.opec.org/opec_web/en/publications/338.htm)** — Oil supply-demand forecasts, production figures and market analysis. _Access:_ Official OPEC report; verify current publication path. _Status:_ `research` _Tags:_ crude oil production demand supply
- **[Regional Greenhouse Gas Initiative (RGGI)](https://www.rggi.org/)** — US regional power-sector carbon allowance auctions, market reports and programme information. _Access:_ Official programme sources; scheme-specific rules apply. _Status:_ `research` _Tags:_ carbon emissions allowances auctions
- **[UNCTAD Maritime Transport](https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport)** — Global shipping, maritime trade, fleet and logistics research. _Access:_ Official public reports; periodic data. _Status:_ `research` _Tags:_ shipping ports trade logistics freight
- **[US Geological Survey — Mineral Commodity Summaries](https://www.usgs.gov/centers/national-minerals-information-center/commodity-statistics-and-information)** — Annual mineral production, reserves and supply information for metals/minerals. _Access:_ Official public research; periodic, not real-time. _Status:_ `research` _Tags:_ copper lithium cobalt nickel critical minerals
- **[USDA National Agricultural Statistics Service](https://www.nass.usda.gov/)** — Crop progress, acreage, yields, inventories, livestock and agricultural statistics. _Access:_ Official public data; release schedules vary. _Status:_ `research` _Tags:_ crops livestock yield acreage
- **[World Bank Commodity Markets (Pink Sheet)](https://www.worldbank.org/en/research/commodity-markets)** — Monthly historical commodity-price data and outlook material across energy, metals and agriculture. _Access:_ Official public research; periodic pricing, not live execution quotes. _Status:_ `research` _Tags:_ commodity prices oil metals agriculture history

### Crypto & On-chain (16)

- **[Arkham Intelligence](https://arkm.com/)** — Wallet and known-entity blockchain intelligence. _Access:_ Freemium/paid. _Status:_ `research`
- **[Bitcoin Mempool Explorer](https://mempool.space/)** — Bitcoin transactions, mempool and network status. _Access:_ Public. _Status:_ `research`
- **[Blockchain.com Explorer](https://www.blockchain.com/explorer)** — Bitcoin and supported blockchain transaction exploration. _Access:_ Public. _Status:_ `research`
- **[Coinbase Developer Docs](https://docs.cdp.coinbase.com/)** — Coinbase-supported APIs and developer integrations. _Access:_ API access/terms vary. _Status:_ `research`
- **[CoinGlass](https://www.coinglass.com/)** — Crypto open interest, funding, liquidations and derivatives metrics. _Access:_ Freemium/paid. _Status:_ `research`
- **[CryptoQuant](https://cryptoquant.com/)** — Exchange flows, miner activity and on-chain indicators. _Access:_ Freemium/paid. _Status:_ `research`
- **[DeFiLlama](https://defillama.com/)** — DeFi TVL, DEX volumes, stablecoins and protocol metrics. _Access:_ Public; API/licensing terms apply. _Status:_ `research`
- **[Dune Analytics](https://dune.com/)** — Blockchain SQL queries and custom dashboards. _Access:_ Freemium/paid. _Status:_ `research`
- **[Etherscan](https://etherscan.io/)** — Ethereum transactions, tokens, wallets and smart contracts. _Access:_ Public; API limits apply. _Status:_ `research`
- **[Glassnode](https://glassnode.com/)** — On-chain metrics and holder behaviour. _Access:_ Freemium/paid. _Status:_ `research`
- **[Kraken API Docs](https://docs.kraken.com/api/)** — Exchange market-data and trading APIs. _Access:_ API terms and account eligibility apply. _Status:_ `research`
- **[Nansen](https://www.nansen.ai/)** — Wallet labels, token flows and wallet intelligence. _Access:_ Paid/conditional. _Status:_ `research`
- **[Solscan](https://solscan.io/)** — Solana wallets, transactions and token activity. _Access:_ Public/paid API options. _Status:_ `research`
- **[Token Terminal](https://tokenterminal.com/)** — Crypto-protocol fundamentals and financial metrics. _Access:_ Freemium/paid. _Status:_ `research`
- **[Token Unlocks](https://token.unlocks.app/)** — Scheduled token unlocks and supply events. _Access:_ Public/paid features. _Status:_ `research`
- **[Whale Alert](https://whale-alert.io/)** — Large crypto transaction alerts. _Access:_ Freemium/paid. _Status:_ `research`

### Cyber Risk & Data Breach Monitoring (10)

- **[BleepingComputer Security News](https://www.bleepingcomputer.com/)** — Cyber incidents, ransomware and breach reporting. _Access:_ Published reporting; avoid raw stolen-data sources. _Status:_ `research`
- **[Chainalysis Research](https://www.chainalysis.com/blog/)** — Crypto crime, illicit-flow typologies and blockchain investigation reports. _Access:_ Research vendor; attribution can be probabilistic. _Status:_ `research`
- **[CISA Cybersecurity Advisories](https://www.cisa.gov/news-events/cybersecurity-advisories)** — Public technical advisories on cyber threats and mitigations. _Access:_ Defensive use. _Status:_ `research`
- **[CISA Known Exploited Vulnerabilities Catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)** — Official catalog of vulnerabilities known to be exploited in the wild. _Access:_ Defensive cyber-risk research. _Status:_ `research`
- **[Elliptic Research](https://www.elliptic.co/blog)** — Crypto compliance, illicit finance and blockchain investigation reporting. _Access:_ Research/vendor reports; on-chain attribution is not always certain. _Status:_ `research`
- **[Have I Been Pwned](https://haveibeenpwned.com/)** — Check whether an account/domain appears in known breaches and monitor verified domains. _Access:_ Defensive use; do not search for or redistribute stolen credentials. _Status:_ `research`
- **[Have I Been Pwned API docs](https://haveibeenpwned.com/API/v3)** — Documented breach-exposure API including privacy-aware options. _Access:_ API restrictions/key; use only with authorization. _Status:_ `research`
- **[KrebsOnSecurity](https://krebsonsecurity.com/)** — Investigative cybersecurity reporting on fraud, cybercrime and financial abuse. _Access:_ Journalism; validate claims with cited evidence. _Status:_ `research`
- **[The Record by Recorded Future](https://therecord.media/)** — Cybercrime, ransomware, breaches and threat-intelligence journalism. _Access:_ Published reporting; avoid treating allegations as proven. _Status:_ `research`
- **[TRM Labs Research](https://www.trmlabs.com/resources)** — Blockchain intelligence, crypto crime and sanctions research. _Access:_ Research/vendor reports; verify methodology. _Status:_ `research`

### Exchange Product Catalogues (33)

- **[ASX Derivatives Market](https://www.asx.com.au/markets/trade-our-derivatives-market)** — Australian equity index, interest-rate and other derivatives market information. _Access:_ Official exchange; contract and broker support vary. _Status:_ `research` _Tags:_ Australia futures options
- **[B3 Brazil — Products and Services](https://www.b3.com.br/en_us/products-and-services/)** — Brazilian equities, interest rates, FX, commodities and derivatives products. _Access:_ Official exchange; product pages may be localized. _Status:_ `research` _Tags:_ Brazil equities rates currency commodities
- **[Cboe Tradable Product Catalogue](https://www.cboe.com/tradable-products/product-list/)** — Equity, index and volatility-related listed products, including options and VIX-linked instruments. _Access:_ Official exchange catalogue; verify actual product page and permissions. _Status:_ `research` _Tags:_ options volatility VIX index
- **[CME Agriculture Markets](https://www.cmegroup.com/markets/agriculture.html)** — Grains, oilseeds, livestock and selected agricultural contracts. _Access:_ Official exchange; weather, seasonality and delivery specifications matter. _Status:_ `research` _Tags:_ wheat corn soybeans livestock sugar coffee cocoa
- **[CME Cryptocurrency Markets](https://www.cmegroup.com/markets/cryptocurrencies.html)** — Listed crypto futures/options where available, including contract-specific institutional and micro products. _Access:_ Official exchange; availability depends on broker and jurisdiction. _Status:_ `research` _Tags:_ bitcoin ether crypto futures options
- **[CME Energy Markets](https://www.cmegroup.com/markets/energy.html)** — Crude oil, refined products, natural gas and energy-related futures/options. _Access:_ Official exchange; contract and delivery details matter. _Status:_ `research` _Tags:_ oil gas energy futures
- **[CME Equity Index Markets](https://www.cmegroup.com/markets/equities.html)** — Equity-index futures/options and related index product groups. _Access:_ Official exchange; check contract size, hours, expiry and margin. _Status:_ `research` _Tags:_ stocks indices futures options
- **[CME FX Markets](https://www.cmegroup.com/markets/fx.html)** — Listed currency futures and options across major, cross and emerging-market currencies. _Access:_ Official exchange; not the same as broker OTC spot FX. _Status:_ `research` _Tags:_ forex currencies futures options
- **[CME Group — Product Slate](https://www.cmegroup.com/markets/products?redirect=%2Ftrading%2Findex.html)** — Searchable exchange product slate spanning equity indices, FX, interest rates, credit, metals, energy, agriculture, crypto and other listed products. _Access:_ Official exchange catalogue; market data and trading permissions may be paid or broker-dependent. _Status:_ `research` _Tags:_ futures options exchange contract specifications
- **[CME Interest Rates](https://www.cmegroup.com/markets/interest-rates.html)** — Treasury futures, short-term interest-rate products, swaps futures and rates-related derivatives. _Access:_ Official exchange; products are leveraged derivatives. _Status:_ `research` _Tags:_ bonds treasury SOFR futures swaps
- **[CME Metals Markets](https://www.cmegroup.com/markets/metals.html)** — Precious, base and selected battery/industrial metals contracts. _Access:_ Official exchange; check product-level availability. _Status:_ `research` _Tags:_ gold silver copper platinum palladium lithium metals
- **[Dalian Commodity Exchange](https://www.dce.com.cn/DCE/Products/Products?locale=en_US)** — Chinese commodity derivatives including agricultural, industrial and energy-related contracts. _Access:_ Official exchange; availability to offshore participants varies. _Status:_ `research` _Tags:_ China agricultural commodities futures
- **[Eurex Markets](https://www.eurex.com/ex-en/markets)** — European equity-index, interest-rate, volatility, ETF/ETC and other derivatives markets. _Access:_ Official exchange; product-level eligibility varies. _Status:_ `research` _Tags:_ bund futures eurostoxx rates options
- **[Euronext Markets](https://www.euronext.com/en/markets)** — European securities and derivatives market entry point. _Access:_ Official exchange network; check individual market and product. _Status:_ `research` _Tags:_ equities derivatives bonds Europe
- **[European Energy Exchange (EEX) — Global Commodities](https://www.eex.com/en/global-commodities)** — Energy, environmental and freight-linked futures information, including selected power and commodity contracts. _Access:_ Official exchange; product terms vary by market. _Status:_ `research` _Tags:_ power emissions freight natural gas carbon
- **[HKEX Listed Derivatives](https://www.hkex.com.hk/Products/Listed-Derivatives?sc_lang=en)** — Hong Kong index, equity, currency and other listed derivative product information. _Access:_ Official exchange; product-specific permissions apply. _Status:_ `research` _Tags:_ Hang Seng futures options
- **[ICE Agriculture](https://www.ice.com/products/Futures-Options/Agriculture)** — Agricultural futures/options product listings and specifications. _Access:_ Official exchange; check contract liquidity and delivery. _Status:_ `research` _Tags:_ coffee cocoa sugar cotton grains
- **[ICE Emissions](https://www.ice.com/products/Futures-Options/Energy/Emissions)** — Emissions allowances and related environmental futures/options. _Access:_ Scheme-specific products; carbon allowances are not interchangeable. _Status:_ `research` _Tags:_ carbon emissions EU ETS UKA
- **[ICE Energy](https://www.ice.com/products/Futures-Options/Energy)** — Oil, refined products, natural gas, LNG, electricity, biofuels and related energy contracts. _Access:_ Official exchange; product access varies. _Status:_ `research` _Tags:_ crude brent natural gas electricity LNG energy
- **[ICE Equity Derivatives](https://www.ice.com/products/Futures-Options/Equity-Derivatives)** — Index and equity-linked derivatives listed by ICE. _Access:_ Official exchange; check regional contract rules. _Status:_ `research` _Tags:_ equity index options futures
- **[ICE Freight](https://www.ice.com/products/Futures-Options/Freight)** — Dry, wet and container freight futures/FFAs for selected routes and benchmarks. _Access:_ Specialist derivatives; many contracts are institutional/niche. _Status:_ `research` _Tags:_ shipping freight Baltic Dry Index tanker container
- **[ICE Futures & Options — All Products](https://www.ice.com/products/Futures-Options/)** — Global contract catalogue covering agriculture, energy, environmental, FX, freight, interest rates, metals and equity derivatives. _Access:_ Official exchange catalogue; data access and permissions vary. _Status:_ `research` _Tags:_ catalogue futures options
- **[ICE FX](https://www.ice.com/products/Futures-Options/FX)** — Listed currency futures and options, including selected global benchmarks. _Access:_ Official exchange; distinguish listed futures from OTC FX. _Status:_ `research` _Tags:_ forex currencies
- **[ICE Interest Rates](https://www.ice.com/products/Futures-Options/Interest-Rates)** — Interest-rate and government-bond-related derivatives listed by ICE. _Access:_ Official exchange; inspect contract details. _Status:_ `research` _Tags:_ rates bonds futures
- **[ICE Metals](https://www.ice.com/products/Futures-Options/Metals)** — Metal-related contracts, including selected specialist and battery materials. _Access:_ Official exchange; product-specific liquidity varies. _Status:_ `research` _Tags:_ metals battery materials cobalt
- **[Japan Exchange Group — Derivatives](https://www.jpx.co.jp/english/derivatives/)** — Japanese index, interest-rate and other derivatives market information. _Access:_ Official exchange; contract rules and regional access apply. _Status:_ `research` _Tags:_ Nikkei futures derivatives Japan
- **[London Metal Exchange](https://www.lme.com/)** — Industrial metals exchange: prices, contract specifications, warehouse stocks and market reports. _Access:_ Official exchange; some pricing/data products are licensed. _Status:_ `research` _Tags:_ copper aluminium nickel zinc lead tin metal stocks
- **[Montreal Exchange](https://www.m-x.ca/en/markets)** — Canadian listed derivatives, including interest-rate and equity-index products. _Access:_ Official exchange; product access varies. _Status:_ `research` _Tags:_ Canada options futures bonds rates
- **[Multi Commodity Exchange of India (MCX)](https://www.mcxindia.com/)** — Indian commodity derivatives and exchange resources. _Access:_ Official India exchange; confirm broker access and current contract rules. _Status:_ `research` _Tags:_ India gold silver crude oil natural gas copper
- **[National Commodity & Derivatives Exchange (NCDEX)](https://www.ncdex.com/)** — Indian agricultural commodity market and contracts. _Access:_ Official India exchange; verify active contracts and liquidity. _Status:_ `research` _Tags:_ India agriculture commodity derivatives
- **[SGX Derivatives](https://www.sgx.com/derivatives)** — Singapore derivatives product and market information. _Access:_ Official exchange; product access varies. _Status:_ `research` _Tags:_ Asia futures FX equity indices
- **[Shanghai Futures Exchange](https://www.shfe.com.cn/eng/)** — Chinese futures-market product information including industrial and precious metals and energy-related products. _Access:_ Official exchange; international access and contract participation restrictions apply. _Status:_ `research` _Tags:_ China copper aluminium nickel gold crude oil
- **[Zhengzhou Commodity Exchange](https://english.czce.com.cn/)** — Chinese agricultural and commodity futures exchange information. _Access:_ Official exchange; verify investor access and contract terms. _Status:_ `research` _Tags:_ China cotton wheat sugar agriculture

### Flows, Sentiment & Alternative Data (20)

- **[Baltic Exchange](https://www.balticexchange.com/)** — Dry bulk, tanker and freight-market benchmarks. _Access:_ Licensing/subscription applies for detailed data. _Status:_ `research`
- **[Barchart](https://www.barchart.com/)** — Stocks, futures, options, commodities and market-data screens. _Access:_ Freemium/paid; delayed data can apply. _Status:_ `research`
- **[ChartExchange](https://chartexchange.com/)** — US equity market data, short-volume and related analytics. _Access:_ Dataset definition and delays matter. _Status:_ `research`
- **[CoinShares Digital Asset Fund Flows](https://coinshares.com/research/digital-asset-fund-flows/)** — Periodic institutional digital-asset fund-flow research. _Access:_ Report-based, not real-time fund positioning. _Status:_ `research`
- **[ETF.com](https://www.etf.com/)** — ETF research, holdings, flows and education. _Access:_ Some datasets/features may be paid. _Status:_ `research`
- **[ETF.com ETF Fund Flows](https://www.etf.com/sections/etf-fund-flows)** — Fund-flow reporting and ETF market trends. _Access:_ Published flow analysis is not live order flow. _Status:_ `research`
- **[Farside Investors — Bitcoin ETF Flows](https://farside.co.uk/btc/)** — Daily US spot Bitcoin ETF flow table and historical series. _Access:_ Secondary source; compare with issuer/exchange disclosures. _Status:_ `research`
- **[Fintel](https://fintel.io/)** — Short interest, institutional holdings, ownership and selected options metrics. _Access:_ Freemium/paid; check source dates. _Status:_ `research`
- **[Freightos Baltic Index](https://fbx.freightos.com/)** — Container freight rate benchmarks for supply-chain and macro research. _Access:_ Some data/features may be paid. _Status:_ `research`
- **[Kpler](https://www.kpler.com/)** — Shipping, commodities and energy-flow intelligence. _Access:_ Professional/paid; not all fields public. _Status:_ `research`
- **[Macrotrends](https://www.macrotrends.net/)** — Historical company fundamentals, macro charts and valuation time series. _Access:_ Secondary source; check restatements and definitions. _Status:_ `research`
- **[Market Chameleon](https://marketchameleon.com/)** — Options market statistics, unusual activity and volatility research. _Access:_ Freemium/paid; US options focus. _Status:_ `research`
- **[Morningstar](https://www.morningstar.com/)** — Funds, ETFs, company analysis and portfolio research. _Access:_ Freemium/paid. _Status:_ `research`
- **[MSCI Research & Indexes](https://www.msci.com/our-solutions/indexes)** — Global equity/fixed-income indexes, country/sector exposures and research. _Access:_ Some products require subscription/licensing. _Status:_ `research`
- **[OptionStrat](https://optionstrat.com/)** — Options payoff diagrams, strategy analysis and scenario testing. _Access:_ Modeling tool, not proof of trade direction. _Status:_ `research`
- **[S&P Dow Jones Indices](https://www.spglobal.com/spdji/en/)** — Index methodology, factsheets and index data products. _Access:_ Licensing applies to redistribution. _Status:_ `research`
- **[S&P Global Commodity Insights](https://www.spglobal.com/commodityinsights/en)** — Professional commodity, energy and supply-chain market intelligence. _Access:_ Paid; commercial data licensing. _Status:_ `research`
- **[SoSoValue](https://www.sosovalue.com/)** — Crypto ETF flow dashboards, market charts and research. _Access:_ Coverage and refresh time vary; verify methodology. _Status:_ `research`
- **[Stock Analysis](https://stockanalysis.com/)** — Financial statements, valuations, earnings calendars and stock screens. _Access:_ Verify key metrics against company filings. _Status:_ `research`
- **[VettaFi ETF Database](https://etfdb.com/)** — ETF screening, holdings, sector exposure and category comparisons. _Access:_ Coverage/latency varies. _Status:_ `research`

### Forecasting & Event Data (19)

- **[CFTC: Understanding Prediction Markets and Event Contracts](https://www.cftc.gov/LearnandProtect/PredictionMarkets)** — Regulator education on event contracts and prediction markets. _Access:_ Official US regulatory education; not Indian legal advice. _Status:_ `research`
- **[Crypto.com Prediction Markets](https://crypto.com/us/prediction-markets)** — Sports/events products in supported markets; product and country access can vary. _Access:_ Real-money India eligibility not established; verify local law and platform terms. _Status:_ `unclear`
- **[Drift BET](https://drift.trade/bet)** — On-chain prediction product in the Drift ecosystem. _Access:_ On-chain access does not establish Indian legal eligibility. _Status:_ `unclear`
- **[ForecastEx](https://forecastex.com/)** — Event contracts and economic/financial event markets; check product disclosures and eligibility. _Access:_ Real-money India eligibility not established; verify local law and platform terms. _Status:_ `unclear`
- **[Futuur](https://futuur.com/)** — Forecasting platform with play-money forecasting and, depending on jurisdiction/product, money-linked features. _Access:_ Use free forecasting only unless India eligibility is independently confirmed. _Status:_ `unclear`
- **[Good Judgment Open](https://www.gjopen.com/)** — Community forecasting on political, economic and technology events. _Access:_ Forecasting research. _Status:_ `research`
- **[Kalshi](https://kalshi.com/)** — US event-contract marketplace; market data and event descriptions. _Access:_ India real-money eligibility/legal clearance not established here; verify before any use. _Status:_ `unclear`
- **[Limitless](https://limitless.exchange/)** — On-chain prediction/event markets; verify chain, settlement and jurisdiction restrictions. _Access:_ On-chain access does not establish Indian legal eligibility. _Status:_ `unclear`
- **[Manifold Markets](https://manifold.markets/)** — Community probabilities on news, politics, markets and technology. _Access:_ Play-money forecasts; some prize features may have separate terms. _Status:_ `research`
- **[Manifold Markets API / docs](https://docs.manifold.markets/)** — Community forecast data and platform integrations. _Access:_ Play-money markets are distinct from cash-linked promotions; review current rules. _Status:_ `research`
- **[Metaculus](https://www.metaculus.com/)** — Crowd forecasts on economic, political, scientific and technology questions. _Access:_ Forecasting platform; check specific tournament/prize terms. _Status:_ `research`
- **[Metaculus API / developer resources](https://www.metaculus.com/help/api/)** — Forecasting questions and community prediction research for data/visualization use. _Access:_ Check API terms/rate limits; forecasting is not a guaranteed signal. _Status:_ `research`
- **[Myriad Markets](https://myriad.markets/)** — On-chain prediction market using crypto wallet infrastructure and stablecoin-based markets. _Access:_ On-chain access does not establish Indian legal eligibility. _Status:_ `unclear`
- **[Polymarket market data/docs](https://docs.polymarket.com/)** — Public developer documentation for prediction-market data. Documentation access is not permission to trade; the real-money platform is subject to India restrictions listed separately. _Access:_ Research/data documentation only; platform rules, geographic restrictions and Indian law still apply. _Status:_ `research`
- **[Prediction Market Index — global platform directory](https://predictionmarketsindex.com/platforms/)** — An independently maintained directory comparing event-contract and prediction platforms, their funding, regulation and dated availability notes. Use it to discover venues, then verify each official rule. _Access:_ Research directory; legal status changes; not India clearance. _Status:_ `research`
- **[PredictIt](https://www.predictit.org/)** — Political and public-affairs prediction markets; US-specific operating conditions and market rules apply. _Access:_ Real-money India eligibility not established; verify local law and platform terms. _Status:_ `unclear`
- **[Railbird Exchange](https://www.railbirdexchange.com/)** — Event-contract exchange; check current exchange status, products and eligibility. _Access:_ Real-money India eligibility not established; verify local law and platform terms. _Status:_ `unclear`
- **[Robinhood Prediction Markets](https://robinhood.com/us/en/prediction-markets/)** — Event contracts available through Robinhood/partner venues in eligible US contexts. _Access:_ US-focused; not evidence of India eligibility. _Status:_ `unclear`
- **[Zeitgeist](https://zeitgeist.pm/)** — Decentralized prediction-market protocol and forecasting ecosystem. _Access:_ Protocol access does not establish Indian legal eligibility. _Status:_ `unclear`

### Funds, ETFs & Index Intelligence (6)

- **[Cboe Options Market Statistics](https://www.cboe.com/us/options/market_statistics/)** — Options volume, market statistics and selected volatility data. _Access:_ Coverage and data delay vary by metric. _Status:_ `research` _Tags:_ options volume volatility market structure
- **[ETFGI Research](https://etfgi.com/)** — Global ETF industry assets, flows and industry research. _Access:_ Some content is public; reports/services vary. _Status:_ `research` _Tags:_ ETF flows AUM fund market
- **[FTSE Russell Indexes](https://www.lseg.com/en/ftse-russell/indices)** — Global equity and fixed-income index families and benchmark methodology. _Access:_ Index data may be licensed. _Status:_ `research` _Tags:_ Russell FTSE indices benchmark
- **[Investment Company Institute](https://www.ici.org/research/stats)** — US and global investment-company/ETF/mutual-fund industry statistics. _Access:_ Industry association; periodic aggregates. _Status:_ `research` _Tags:_ ETF mutual funds fund flows assets
- **[MSCI Indexes](https://www.msci.com/indexes)** — Global equity, fixed-income and other benchmarks and methodology resources. _Access:_ Some index data/products require licensing. _Status:_ `research` _Tags:_ MSCI world emerging markets indices
- **[STOXX Indexes](https://stoxx.com/)** — European/global equity benchmarks, strategy indices and index methodology. _Access:_ Some data/products licensed. _Status:_ `research` _Tags:_ Euro Stoxx indices benchmarks

### Global Company Filings (12)

- **[ASX Announcements](https://www.asx.com.au/markets/trade-our-cash-market/announcements)** — Australian listed-company announcements and reports. _Access:_ Official/public. _Status:_ `research`
- **[ESMA](https://www.esma.europa.eu/)** — European securities regulation, registers and supervisory information. _Access:_ Official/public; not a single universal filings portal. _Status:_ `research`
- **[HKEXnews](https://www.hkexnews.hk/)** — Hong Kong listed-company results, dividends and disclosures. _Access:_ Official/public. _Status:_ `research`
- **[Japan EDINET](https://disclosure2.edinet-fsa.go.jp/)** — Japanese regulatory financial disclosures. _Access:_ Official/public. _Status:_ `research`
- **[London Stock Exchange News](https://www.londonstockexchange.com/en/news)** — UK listed-company news and RNS announcements. _Access:_ Public; some data services paid. _Status:_ `research`
- **[SEC EDGAR](https://www.sec.gov/edgar/search/)** — Original US public-company filings, earnings, risks and material events. _Access:_ Official/public. _Status:_ `research`
- **[SEC Form 13F Datasets](https://www.sec.gov/data-research/sec-markets-data/form-13f-data-sets)** — Institutional holdings from periodic filings. _Access:_ Official/public; time-lagged snapshots. _Status:_ `research`
- **[SEC Insider Transaction Datasets](https://www.sec.gov/data-research/sec-markets-data/insider-transactions-data-sets)** — Structured data from reported Forms 3, 4 and 5. _Access:_ Official/public; disclosed after filing. _Status:_ `research`
- **[SEC Investment Research Guide](https://www.sec.gov/search-filings/edgar-search-assistance/using-edgar-research-investments)** — Guide to interpreting SEC filings. _Access:_ Official/public. _Status:_ `research`
- **[SEDAR+ Canada](https://www.sedarplus.ca/)** — Canadian public securities filings. _Access:_ Official/public. _Status:_ `research`
- **[Singapore Exchange](https://www.sgx.com/securities)** — Singapore-listed securities and market information. _Access:_ Official/public. _Status:_ `research`
- **[South Korea DART](https://englishdart.fss.or.kr/)** — Korean corporate regulatory disclosures. _Access:_ Official/public. _Status:_ `research`

### Global Macro & Cross-Asset Data (16)

- **[ACLED](https://acleddata.com/)** — Geopolitical conflict/event data relevant to country and commodity risk monitoring. _Access:_ Registration/access terms and methodology apply. _Status:_ `research`
- **[Australian Bureau of Statistics](https://www.abs.gov.au/)** — Australian GDP, inflation, employment and trade statistics. _Access:_ Official/public. _Status:_ `research`
- **[Bank for International Settlements Data Portal](https://data.bis.org/)** — Structured global banking, credit, derivatives and monetary statistics. _Access:_ Official/public. _Status:_ `research`
- **[Bank of Canada Valet API](https://www.bankofcanada.ca/valet/docs)** — Programmatic access to Bank of Canada exchange rates and other economic series. _Access:_ Official/public API. _Status:_ `research`
- **[BoE Interactive Database](https://www.bankofengland.co.uk/boeapps/database/)** — UK time series for rates, monetary data and financial markets. _Access:_ Official/public. _Status:_ `research`
- **[Cboe Global Markets](https://www.cboe.com/)** — Options, volatility indexes and exchange market data. _Access:_ Some data/products are paid. _Status:_ `research`
- **[China National Bureau of Statistics](https://www.stats.gov.cn/english/)** — Official Chinese national economic statistics. _Access:_ Official/public; methodology/revisions should be read. _Status:_ `research`
- **[ECB Data Portal API](https://data.ecb.europa.eu/help/api/overview)** — Programmatic access to ECB economic and financial datasets. _Access:_ Official; check dataset metadata. _Status:_ `research`
- **[ICE Futures Exchange](https://www.ice.com/)** — Energy, rates, equity-index and other futures/derivatives market information. _Access:_ Market data access/licensing varies. _Status:_ `research`
- **[Japan Statistics Bureau](https://www.stat.go.jp/english/)** — Official Japanese economic, inflation and labour statistics. _Access:_ Official/public. _Status:_ `research`
- **[NOAA Climate Data Online](https://www.ncei.noaa.gov/cdo-web/)** — Weather/climate observations that can contextualize agriculture, energy and insurance markets. _Access:_ Official US climate data. _Status:_ `research`
- **[ONS UK Data](https://www.ons.gov.uk/)** — UK inflation, labour, output, population and macroeconomic statistics. _Access:_ Official/public. _Status:_ `research`
- **[Statistics Canada](https://www.statcan.gc.ca/en/start)** — Canadian economic and labour-market releases. _Access:_ Official/public. _Status:_ `research`
- **[UN Comtrade](https://comtradeplus.un.org/)** — Official international merchandise trade data by country/product. _Access:_ Public with API and usage conditions. _Status:_ `research`
- **[USDA Foreign Agricultural Service PSD](https://apps.fas.usda.gov/psdonline/app/index.html)** — Global production, supply and distribution data for agricultural commodities. _Access:_ Official/public. _Status:_ `research`
- **[World Federation of Exchanges Statistics](https://www.world-exchanges.org/our-work/statistics)** — Exchange-level global market statistics and industry data. _Access:_ Public aggregate statistics. _Status:_ `research`

### Global Macro, Trade & Financial Stability (2)

- **[Federal Reserve H.15 Selected Interest Rates](https://www.federalreserve.gov/releases/h15/)** — Selected US interest-rate series and historical reference rates. _Access:_ Official public data; series definitions matter. _Status:_ `research` _Tags:_ Treasury yields rates commercial paper
- **[OpenFIGI](https://www.openfigi.com/api)** — API and identifiers for mapping financial instruments to FIGI and related identifiers. _Access:_ API usage limits apply. _Status:_ `research` _Tags:_ instrument identifiers ISIN ticker CUSIP API

### Global News (19)

- **[Accesswire](https://www.accesswire.com/)** — Corporate news and public-company press releases. _Access:_ Public. _Status:_ `research`
- **[AlphaSense](https://www.alpha-sense.com/)** — AI-assisted search across research, filings and transcripts. _Access:_ Paid/conditional. _Status:_ `research`
- **[Benzinga Pro](https://www.benzinga.com/pro)** — Market-moving news and event-driven trading research. _Access:_ Paid/conditional. _Status:_ `research`
- **[Bloomberg Markets](https://www.bloomberg.com/markets)** — Global equities, bonds, currencies, commodities and macro analysis. _Access:_ Freemium/paid. _Status:_ `research`
- **[Business Wire](https://www.businesswire.com/news/home)** — Company releases, earnings announcements and corporate events. _Access:_ Public releases; data services may be paid. _Status:_ `research`
- **[CNBC](https://www.cnbc.com/)** — US/global markets, earnings and business commentary. _Access:_ Public/freemium. _Status:_ `research`
- **[Dow Jones Professional](https://www.dowjones.com/professional/)** — Professional financial news and information products. _Access:_ Paid/conditional. _Status:_ `research`
- **[Factiva](https://professional.dowjones.com/factiva/)** — Business-news archive and corporate information search. _Access:_ Paid/conditional. _Status:_ `research`
- **[Financial Juice](https://www.financialjuice.com/)** — Financial news feed and market-event coverage. _Access:_ Access varies. _Status:_ `research`
- **[Financial Times Markets](https://www.ft.com/markets)** — Global finance, economics and institutional analysis. _Access:_ Paid/freemium. _Status:_ `research`
- **[GDELT Project](https://www.gdeltproject.org/)** — Global news and event monitoring for research and AI workflows. _Access:_ Public data tools. _Status:_ `research`
- **[GlobeNewswire](https://www.globenewswire.com/)** — Company press releases and financial results. _Access:_ Public. _Status:_ `research`
- **[Investing.com](https://www.investing.com/)** — Economic calendar, FX, Gold, commodities and market news. _Access:_ Freemium. _Status:_ `research`
- **[MarketWatch](https://www.marketwatch.com/)** — US stocks and financial commentary. _Access:_ Freemium. _Status:_ `research`
- **[Nasdaq Earnings Calendar](https://www.nasdaq.com/market-activity/earnings)** — Upcoming and reported earnings. _Access:_ Public. _Status:_ `research`
- **[PR Newswire](https://www.prnewswire.com/news-releases/)** — Company releases, acquisitions, earnings and business events. _Access:_ Public releases; services may be paid. _Status:_ `research`
- **[Quartr earnings calls](https://quartr.com/features/live-calls-and-transcripts)** — Earnings calls, transcripts and management commentary. _Access:_ Freemium/paid features. _Status:_ `research`
- **[Reuters Markets](https://www.reuters.com/markets/)** — Global financial news, macro events and company developments. _Access:_ Public access; some content may be restricted. _Status:_ `research`
- **[Yahoo Finance](https://finance.yahoo.com/)** — Quotes, company financials, watchlists and news. _Access:_ Freemium. _Status:_ `research`

### Global News & Research Feeds (15)

- **[Associated Press Business](https://apnews.com/hub/business)** — Global business and economic news reporting. _Access:_ Public; some content/licensing restrictions. _Status:_ `research`
- **[Benzinga Newsdesk](https://www.benzinga.com/)** — Market-moving headlines, company catalysts and trading news. _Access:_ Freemium/paid. _Status:_ `research`
- **[Google Finance](https://www.google.com/finance/)** — Broad stock/market quote lookup and news discovery. _Access:_ Coverage/timing can vary by instrument. _Status:_ `research`
- **[Nasdaq Market Activity](https://www.nasdaq.com/market-activity)** — US stocks, options, IPO and earnings-related market pages. _Access:_ Public/freemium. _Status:_ `research`
- **[Nikkei Asia](https://asia.nikkei.com/)** — Asia business, markets and corporate reporting. _Access:_ Freemium/paid. _Status:_ `research`
- **[Reddit r/Finance](https://www.reddit.com/r/Finance/)** — Community discussion that can flag stories/topics for verification. _Access:_ User-generated; not a primary source. _Status:_ `research`
- **[S&P Global Market Intelligence News](https://www.spglobal.com/market-intelligence/en/)** — Financial-market, credit, company and industry research products. _Access:_ Paid/conditional. _Status:_ `research`
- **[Seeking Alpha](https://seekingalpha.com/)** — Earnings transcripts, articles, valuation and community research. _Access:_ Freemium/paid; user-generated analysis needs verification. _Status:_ `research`
- **[South China Morning Post Business](https://www.scmp.com/business)** — China and Asia business/markets news. _Access:_ Freemium/paid. _Status:_ `research`
- **[Stocktwits](https://stocktwits.com/)** — Crowd sentiment streams and ticker-specific discussion. _Access:_ Social sentiment only; noisy and potentially manipulated. _Status:_ `research`
- **[TechCrunch](https://techcrunch.com/)** — Tech startups, funding, acquisitions and venture news. _Access:_ Public/freemium. _Status:_ `research`
- **[The Economist Finance & Economics](https://www.economist.com/finance-and-economics)** — Global macro, finance and policy analysis. _Access:_ Paid/conditional. _Status:_ `research`
- **[The Fly](https://thefly.com/)** — US-market news, analyst actions and corporate catalysts. _Access:_ Freemium/paid. _Status:_ `research`
- **[The Information](https://www.theinformation.com/)** — Technology-company, venture and private-market reporting. _Access:_ Paid. _Status:_ `research`
- **[The Wall Street Journal Markets](https://www.wsj.com/news/markets)** — Markets, companies, economy and investment news. _Access:_ Paid/conditional. _Status:_ `research`

### India Market Access & Official Data (9)

- **[India Code](https://www.indiacode.nic.in/)** — Official repository of Indian Acts and legislation. _Access:_ Official legal text; check amendments and commencement notifications. _Status:_ `research` _Tags:_ India law acts regulation
- **[MCX Product Directory](https://www.mcxindia.com/market-data/market-watch)** — MCX market watch and commodity contract information. _Access:_ Official India exchange; current contracts and broker permissions vary. _Status:_ `research` _Tags:_ India metals energy commodity futures
- **[NSE Currency Derivatives](https://www.nseindia.com/market-data/currency-derivatives)** — Currency-derivatives segment information, market data and contract references. _Access:_ Official India exchange; permitted contracts and rules apply. _Status:_ `research` _Tags:_ India forex USDINR EURINR currency futures options
- **[NSE Debt Market](https://www.nseindia.com/market-data/debt-market)** — Indian debt-market products and available market information. _Access:_ Official India exchange; actual tradability varies by instrument. _Status:_ `research` _Tags:_ India government bonds debt securities
- **[RBI Authorised Electronic Trading Platforms](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4080)** — RBI reference for authorised ETPs used in eligible electronic financial-market transactions. _Access:_ Official India source; verify current notices and exact product permissions. _Status:_ `research` _Tags:_ India forex ETP legal access authorised
- **[RBI Forex Transactions FAQ](https://www.rbi.org.in/scripts/FS_FAQs.aspx?Id=146)** — RBI explanation of permitted forex transactions, authorised persons/ETPs and remittance constraints. _Access:_ Official guidance; underlying FEMA/rules prevail. _Status:_ `research` _Tags:_ India forex FEMA authorised broker
- **[RBI Master Direction — ETPs 2025](https://www.rbi.org.in/scripts/BS_ViewMasCirculardetails.aspx?id=12870)** — RBI Master Direction on Electronic Trading Platforms, issued 16 June 2025. _Access:_ Official regulatory text; interpret with current amendments. _Status:_ `research` _Tags:_ India ETP forex electronic trading regulations
- **[SEBI Foreign Trading Portals Advisory](https://www.sebi.gov.in/media/press-releases/oct-2018/advisory-in-respect-of-foreign-trading-portals_40848.html)** — SEBI advisory about overseas portals offering financial products/derivatives to Indian residents. _Access:_ Official historical advisory; read with current law and regulations. _Status:_ `research` _Tags:_ India overseas derivatives broker warning
- **[SEBI Virtual Trading / Gaming Platforms Advisory](https://www.sebi.gov.in/media-and-notifications/press-releases/nov-2024/advisory-on-unauthorized-virtual-trading-gaming-platforms_88200.html)** — SEBI advisory regarding unauthorized virtual trading and gaming platforms. _Access:_ Official India regulatory guidance. _Status:_ `research` _Tags:_ India paper trading gaming app regulator

### India Markets (11)

- **[BSE India](https://www.bseindia.com/)** — Sensex, listed companies, corporate announcements and financial results. _Access:_ Official/public. _Status:_ `research`
- **[NSE All Reports](https://www.nseindia.com/all-reports)** — Bhavcopy, market reports and available trading datasets. _Access:_ Public; data-use terms may apply. _Status:_ `research`
- **[NSE Corporate Filings](https://www.nseindia.com/companies-listing/corporate-filings)** — Listed-company announcements and filings. _Access:_ Official/public. _Status:_ `research`
- **[NSE India](https://www.nseindia.com/)** — India equity markets, derivatives, indices and exchange information. _Access:_ Public research; some data has terms/latency restrictions. _Status:_ `research`
- **[NSE Insider Trading Disclosures](https://www.nseindia.com/companies-listing/corporate-filings-insider-trading)** — Publicly disclosed insider-trading reports. _Access:_ Official/public; not private insider information. _Status:_ `research`
- **[NSE Large Deals](https://www.nseindia.com/market-data/large-deals)** — Disclosed bulk deals and block deals. _Access:_ Public; interpret context and transaction type. _Status:_ `research`
- **[NSE Live Equity Market](https://www.nseindia.com/market-data/live-equity-market)** — Equity prices and market activity. _Access:_ Public; some feeds may be delayed. _Status:_ `research`
- **[NSE Option Chain](https://www.nseindia.com/option-chain)** — Strike-level options prices and open interest. _Access:_ Public; live-data conditions may apply. _Status:_ `research`
- **[RBI Database on Indian Economy](https://data.rbi.org.in/DBIE/)** — Indian monetary, banking and macroeconomic statistics. _Access:_ Official/public. _Status:_ `research`
- **[SEBI](https://www.sebi.gov.in/)** — Indian securities regulator: regulations, orders, enforcement and disclosures. _Access:_ Official/public. _Status:_ `research`
- **[SEBI Investor Support](https://investor.sebi.gov.in/Investor-support.html)** — Investor support and registered-intermediary resources. _Access:_ Official/public. _Status:_ `research`

### India Research & Public Records (2)

- **[BSE Corporate Announcements](https://www.bseindia.com/corporates/ann.html)** — BSE listed-company announcements and corporate disclosures. _Access:_ Official/public. _Status:_ `research`
- **[SEBI Investigation & Enforcement](https://www.sebi.gov.in/enforcement.html)** — Indian regulator enforcement and investigation-related public material. _Access:_ Official/public; not all ongoing investigations are public. _Status:_ `research`

### India Restricted / Not Cleared (9)

- **[Kalshi International Eligibility](https://help.kalshi.com/en/articles/14026044-can-i-trade-on-kalshi-from-outside-the-united-states)** — Platform states international eligibility depends on its Member Agreement and local law. _Access:_ Do not assume Indian real-money eligibility; verify legal clearance. _Status:_ `restricted`
- **[MeitY Act & Policies page](https://www.meity.gov.in/documents/act-and-policies)** — Official source for the Act, rules and amendments. _Access:_ Official/public. _Status:_ `restricted`
- **[MeitY advisory: blocked prediction/betting platforms](https://www.meity.gov.in/static/uploads/2026/04/c99a3ded4d682879951d238b7a671a39.pdf)** — Official 25 Apr 2026 advisory names Polymarket and discusses access blocks and VPN circumvention. _Access:_ Reference only; do not use to bypass restrictions. _Status:_ `restricted`
- **[Polymarket Geographic Restrictions](https://help.polymarket.com/en/articles/13364163-geographic-restrictions)** — Platform rules on restricted locations and VPN circumvention. IMPORTANT: public documentation/research does not authorize real-money participation from India; the platform is named in the official MeitY advisory. _Access:_ Reference/data only. Polymarket real-money access is blocked/restricted in India per MeitY advisory; do not bypass geographic restrictions. _Status:_ `blocked`
- **[Polymarket — real-money platform (India restriction applies)](https://polymarket.com/)** — Prediction-market platform. MeitY’s 25 April 2026 advisory names Polymarket among blocked prediction/betting platforms; this entry is an identification/reference link, not an instruction to access or trade. _Access:_ Explicit India restriction is documented by MeitY; do not circumvent geographic blocks. _Status:_ `blocked` _Tags:_ prediction market event contracts India restriction
- **[Promotion and Regulation of Online Gaming Act, 2025](https://www.indiacode.nic.in/indiacode/handle/123456789/22148?col=123456789%2F1362&view_type=search)** — Indian legislation relevant to online money gaming; consult authoritative text and legal advice. _Access:_ Official legal reference. _Status:_ `restricted`
- **[Promotion and Regulation of Online Gaming Rules, 2026 — PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2254606&lang=1&reg=3)** — Government explanation of the 2026 rules under the 2025 Act. _Access:_ Official India source; legal interpretation may require counsel. _Status:_ `restricted`
- **[SEBI Insider Trading Regulations](https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-prohibition-of-insider-trading-regulations-2015-last-amended-on-march-12-2025-_92672.html)** — Indian rules on insider trading and unpublished price-sensitive information. _Access:_ Official legal reference. _Status:_ `restricted`
- **[SEBI SCORES](https://scores.sebi.gov.in/)** — Official investor grievance redressal platform for securities-market complaints. _Access:_ Official investor grievance portal; use according to its terms. _Status:_ `research`

### India Screeners (6)

- **[Economic Times Markets](https://economictimes.indiatimes.com/markets)** — Indian markets, corporate news and economic updates. _Access:_ Freemium. _Status:_ `research`
- **[Mint Markets](https://www.livemint.com/market)** — Business news, markets and financial analysis. _Access:_ Freemium. _Status:_ `research`
- **[Moneycontrol](https://www.moneycontrol.com/)** — Indian market news, financials and market coverage. _Access:_ Freemium. _Status:_ `research`
- **[Screener.in](https://www.screener.in/)** — Financial statements, valuation ratios and custom company screens. _Access:_ Freemium. _Status:_ `research`
- **[Tickertape](https://www.tickertape.in/)** — Indian stock screening and fundamental research. _Access:_ Freemium. _Status:_ `research`
- **[Trendlyne](https://trendlyne.com/)** — Stock analytics, screeners, alerts and financial research. _Access:_ Freemium/paid features. _Status:_ `research`

### Insider & Institutional Research (8)

- **[Capitol Trades](https://www.capitoltrades.com/)** — Reported US Congress members’ transactions. _Access:_ Third-party; different from corporate-insider filings. _Status:_ `research`
- **[Dataroma](https://www.dataroma.com/)** — Selected prominent investors’ reported holdings. _Access:_ Public; selected coverage only. _Status:_ `research`
- **[Finviz](https://finviz.com/)** — US stock screeners, technical and fundamental filters. _Access:_ Freemium/paid. _Status:_ `research`
- **[Koyfin](https://www.koyfin.com/)** — Charts, macro research, company comparison and watchlists. _Access:_ Freemium/paid. _Status:_ `research`
- **[MarketScreener](https://www.marketscreener.com/)** — Company news, financial results and analyst-consensus research. _Access:_ Freemium/paid. _Status:_ `research`
- **[OpenInsider](http://openinsider.com/)** — Search and compare reported US insider transactions. _Access:_ Third-party; verify original filings. _Status:_ `research`
- **[Quiver Quantitative](https://www.quiverquant.com/)** — Alternative datasets and public-disclosure analytics. _Access:_ Freemium/paid; verify timestamps. _Status:_ `research`
- **[WhaleWisdom](https://whalewisdom.com/)** — Institutional holdings and 13F portfolio research. _Access:_ Freemium/paid; periodic data. _Status:_ `research`

### Investigative Leaks & OSINT (15)

- **[Bellingcat](https://www.bellingcat.com/)** — Open-source investigations using publicly accessible imagery, records and digital traces. _Access:_ OSINT reporting; verify dates and geolocation claims. _Status:_ `research`
- **[Global Financial Integrity](https://gfintegrity.org/)** — Research on illicit financial flows, trade misinvoicing and cross-border financial crime. _Access:_ Research; report methodology and estimates vary. _Status:_ `research`
- **[Global Witness](https://www.globalwitness.org/en/)** — Investigations of corruption, resource finance, shell companies and ownership networks. _Access:_ Public reports; verify cited primary documents. _Status:_ `research`
- **[ICIJ data sources and methodology](https://offshoreleaks.icij.org/pages/data)** — Explains which investigative datasets are included, their scope and limitations. _Access:_ Important: database coverage is a subset of underlying records; absence is not proof. _Status:_ `research`
- **[ICIJ Offshore Leaks Database](https://offshoreleaks.icij.org/)** — Searchable data from Offshore Leaks, Panama Papers, Paradise Papers, Bahamas Leaks and Pandora Papers. Inclusion is not proof of wrongdoing. _Access:_ Public-interest investigative database; interpret carefully and verify identities. _Status:_ `research`
- **[ICIJ Panama Papers Investigation](https://www.icij.org/investigations/panama-papers/)** — Published reporting and context on the Panama Papers offshore-finance investigation. _Access:_ Public-interest reporting; not a raw credential or document dump. _Status:_ `research`
- **[ICIJ Pandora Papers](https://www.icij.org/investigations/pandora-papers/)** — Published reporting on offshore structures, beneficial ownership and financial networks. _Access:_ Public-interest reporting; allegations require source/context checks. _Status:_ `research`
- **[ICIJ Paradise Papers](https://www.icij.org/investigations/paradise-papers/)** — Published reporting on offshore finance, corporate structures and global wealth. _Access:_ Public-interest reporting. _Status:_ `research`
- **[ICIJ — How to submit a story tip](https://www.icij.org/contact/)** — Official route for submitting public-interest investigative tips and materials to journalists. _Access:_ For lawful reporting; do not obtain or redistribute stolen data unlawfully. _Status:_ `research`
- **[OCCRP Aleph](https://aleph.occrp.org/)** — Investigative research platform for public records, leaks, documents and entity relationships; some archives require application/access review. _Access:_ Investigative research; access and licensing conditions apply. _Status:_ `research`
- **[OCCRP Investigations](https://www.occrp.org/en)** — Cross-border investigations into corruption, financial crime, sanctions evasion and illicit finance. _Access:_ Published journalism; distinguish allegations from findings. _Status:_ `research`
- **[OpenSanctions — ICIJ Offshore Leaks dataset](https://www.opensanctions.org/datasets/icij_offshoreleaks/)** — Structured entity data derived from ICIJ investigations, useful for entity resolution and investigative research. _Access:_ Non-commercial/public-interest and commercial licensing terms differ. _Status:_ `research`
- **[ProPublica — Business & Finance](https://www.propublica.org/topics/business)** — Investigative reporting on companies, finance, public spending and financial misconduct. _Access:_ Public-interest journalism. _Status:_ `research`
- **[Tax Justice Network](https://taxjustice.net/)** — Research on offshore finance, tax abuse, secrecy jurisdictions and financial transparency. _Access:_ Research and advocacy; read methodology/context. _Status:_ `research`
- **[The Sentry](https://thesentry.org/)** — Investigations into kleptocracy, conflict finance, money laundering and illicit financial networks. _Access:_ Public reports; not a live trading signal. _Status:_ `research`

### Macro & Central Banks (18)

- **[Bank of England Statistics](https://www.bankofengland.co.uk/statistics)** — UK banking, monetary and economic statistics. _Access:_ Official/public. _Status:_ `research`
- **[Bank of Japan Statistics](https://www.boj.or.jp/en/statistics/)** — Japanese monetary and economic indicators. _Access:_ Official/public. _Status:_ `research`
- **[BEA Release Schedule](https://www.bea.gov/news/schedule)** — GDP, PCE inflation, income and spending releases. _Access:_ Official/public. _Status:_ `research`
- **[BIS Statistics](https://www.bis.org/statistics/)** — International banking, debt and global credit statistics. _Access:_ Official/public. _Status:_ `research`
- **[CME FedWatch](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html)** — Market-implied Fed rate expectations from futures. _Access:_ Public tool; interpret as market-implied probability. _Status:_ `research`
- **[ECB Data Portal](https://data.ecb.europa.eu/)** — Euro-area rates, inflation and monetary statistics. _Access:_ Official/public. _Status:_ `research`
- **[Eurostat Database](https://ec.europa.eu/eurostat/data/database)** — European Union official statistics. _Access:_ Official/public. _Status:_ `research`
- **[Federal Reserve Calendar](https://www.federalreserve.gov/newsevents/calendar.htm)** — FOMC meetings, policy announcements and Fed events. _Access:_ Official/public. _Status:_ `research`
- **[FRED Economic Data](https://fred.stlouisfed.org/)** — Historical yields, inflation, credit spreads and financial series. _Access:_ Public; API terms apply. _Status:_ `research`
- **[IMF Data](https://data.imf.org/)** — Cross-country macroeconomic and financial datasets. _Access:_ Public; some datasets/access conditions vary. _Status:_ `research`
- **[OECD Data Explorer](https://data-explorer.oecd.org/)** — Comparable statistics for countries and economies. _Access:_ Public. _Status:_ `research`
- **[Trading Economics Calendar](https://tradingeconomics.com/calendar)** — Country indicators, forecasts and historical releases. _Access:_ Freemium/paid. _Status:_ `research`
- **[TradingView Economic Calendar](https://www.tradingview.com/economic-calendar/)** — Upcoming events and actual/previous economic readings. _Access:_ Freemium. _Status:_ `research`
- **[US BLS Release Calendar](https://www.bls.gov/schedule/news_release/)** — US CPI, employment, unemployment and labour data. _Access:_ Official/public. _Status:_ `research`
- **[US Census Economic Indicators](https://www.census.gov/economic-indicators/calendar)** — Retail sales, inventories, trade and housing data. _Access:_ Official/public. _Status:_ `research`
- **[US Treasury Fiscal Data](https://fiscaldata.treasury.gov/)** — Federal debt, Treasury auctions and public finance datasets. _Access:_ Official/public. _Status:_ `research`
- **[US Treasury Interest Rates](https://home.treasury.gov/resource-center/data-chart-center/interest-rates)** — Treasury yields and interest-rate series. _Access:_ Official/public. _Status:_ `research`
- **[World Bank Data](https://data.worldbank.org/)** — Country-level economic and development indicators. _Access:_ Public. _Status:_ `research`

### Market Infrastructure, Data Vendors & Risk (11)

- **[ASIC Investor Alerts](https://moneysmart.gov.au/check-and-report-scams/investor-alert-list)** — Australian investor alert list and scam-checking resources. _Access:_ Australia-focused; verify through ASIC’s official website. _Status:_ `research` _Tags:_ broker warning unlicensed investment
- **[Cboe DataShop](https://datashop.cboe.com/)** — Historical and interval market data, including options data products. _Access:_ Paid/licensed; coverage and historical depth vary. _Status:_ `research` _Tags:_ options data quotes tick historical
- **[CFTC RED List](https://www.cftc.gov/LawRegulation/DoddFrankAct/Rulemakings/DF_21_RedList.html)** — CFTC list of certain foreign entities that appear to be acting in a capacity requiring registration, as described by CFTC. _Access:_ Official US list; not a universal or exhaustive global warning list. _Status:_ `research` _Tags:_ broker warning forex derivatives
- **[CME Market Data & Analytics](https://www.cmegroup.com/market-data.html)** — CME data catalogue, real-time/historical market data and analytics products. _Access:_ Data licensing/subscription rules apply; redistribution may require entitlement. _Status:_ `research` _Tags:_ market data API real-time historical
- **[FCA Warning List](https://www.fca.org.uk/scamsmart/warning-list)** — UK FCA warnings about firms/individuals that may be providing financial services without proper authorization. _Access:_ UK-specific; absence from list is not proof of authorization elsewhere. _Status:_ `research` _Tags:_ broker warning forex CFDs scam
- **[ICE Data Services](https://www.ice.com/market-data)** — Market data and analytics offerings for ICE benchmarks, venues and other markets. _Access:_ Commercial data licensing applies. _Status:_ `research` _Tags:_ data vendor benchmarks feeds
- **[IOSCO I-SCAN](https://www.iosco.org/i-scan/)** — International database of investor alerts and warnings from regulators. _Access:_ Use as a lead; check issuing regulator’s original notice. _Status:_ `research` _Tags:_ global scam warnings unauthorized investment
- **[IOSCO Investor Alerts Portal](https://www.iosco.org/investor_protection/?subsection=investor_alerts_portal)** — Investor alerts and warnings published by securities regulators. _Access:_ Coverage varies across jurisdictions. _Status:_ `research` _Tags:_ scam warning broker regulator investor protection
- **[Nasdaq Data Link](https://data.nasdaq.com/)** — Financial, economic and alternative datasets from supported providers. _Access:_ Dataset-level licensing/price varies. _Status:_ `research` _Tags:_ alternative data API quant research
- **[NFA BASIC](https://www.nfa.futures.org/basicnet/)** — Background-check database for US derivatives industry firms and individuals. _Access:_ Use to check registration/disciplinary information; jurisdiction-specific. _Status:_ `research` _Tags:_ broker verification futures forex compliance
- **[US SEC PAUSE](https://www.sec.gov/enforce/public-alerts)** — SEC public alerts about entities/individuals associated with potential securities-law issues. _Access:_ Official US public alerts; does not replace registration checks. _Status:_ `research` _Tags:_ fraud unregistered securities broker

### Ownership, Entity & Sanctions Research (10)

- **[Companies House API](https://developer.company-information.service.gov.uk/)** — Programmatic company register access for UK businesses. _Access:_ API account/key and terms may apply. _Status:_ `research`
- **[Companies House: PSC guidance](https://www.gov.uk/guidance/people-with-significant-control-pscs)** — Understand UK people-with-significant-control filings and ownership context. _Access:_ Official UK guidance. _Status:_ `research`
- **[GLEIF API Documentation](https://www.gleif.org/en/lei-data/gleif-api)** — Query entity LEI records and relationship/reference data programmatically. _Access:_ Public API; use identifiers to disambiguate entities. _Status:_ `research`
- **[GLEIF LEI Search](https://search.gleif.org/)** — Look up Legal Entity Identifiers and relationship data for legal entities. _Access:_ Official GLEIF data; coverage varies. _Status:_ `research`
- **[GLEIF LEI Search API](https://www.gleif.org/en/lei-data/gleif-api/accessing-the-gleif-api)** — Read API documentation for global LEI lookups. _Access:_ Public reference data. _Status:_ `research`
- **[India MCA Company/LLP Services](https://www.mca.gov.in/)** — Official Ministry of Corporate Affairs services and company/LLP information. _Access:_ Official India source; some documents/services require login/payment. _Status:_ `research`
- **[OpenCorporates](https://opencorporates.com/)** — Search company registry information and connect entities across jurisdictions. _Access:_ Aggregator; verify with primary company registry. _Status:_ `research`
- **[OpenCorporates API](https://api.opencorporates.com/documentation/API-Reference)** — Search companies and registered officers in supported jurisdictions. _Access:_ API limits/licensing vary. _Status:_ `research`
- **[OpenSanctions API](https://www.opensanctions.org/docs/api/)** — API for entity search/matching and sanctions/PEP screening. _Access:_ Commercial terms apply for business use; verify matches. _Status:_ `research`
- **[UK Companies House Search](https://find-and-update.company-information.service.gov.uk/)** — UK company filings, officers, accounts and filing history. _Access:_ Official/public; check filing dates and completeness. _Status:_ `research`

### Private Markets, Real Assets & Specialty Finance (10)

- **[Artemis — Insurance-Linked Securities](https://www.artemis.bm/)** — Insurance-linked securities and catastrophe-bond market coverage. _Access:_ Specialist research; product access and data vary. _Status:_ `research` _Tags:_ cat bonds reinsurance ILS insurance risk
- **[ILPA — Institutional Limited Partners Association](https://ilpa.org/)** — Private-equity fund research, reporting principles and institutional resources. _Access:_ Public resources plus member materials. _Status:_ `research` _Tags:_ private equity private markets fund reporting
- **[Lloyd’s — Market Resources](https://www.lloyds.com/market-resources)** — Insurance and reinsurance market reports, exposure and market resources. _Access:_ Insurance-market information; not a retail trading venue. _Status:_ `research` _Tags:_ insurance reinsurance catastrophe risk
- **[MSCI Private Capital Solutions](https://www.msci.com/our-solutions/private-assets)** — Private asset data and analytics across private capital strategies. _Access:_ Paid/licensed data products. _Status:_ `research` _Tags:_ private credit private equity real estate
- **[MSCI Real Assets](https://www.msci.com/our-solutions/real-assets)** — Research and analytics for real estate, infrastructure and private real assets. _Access:_ Many datasets/indices are paid/licensed. _Status:_ `research` _Tags:_ real estate infrastructure property private assets
- **[NAIC — Insurance Data & Research](https://content.naic.org/)** — US insurance regulatory data, reports and market resources. _Access:_ Official US insurance regulator association resources. _Status:_ `research` _Tags:_ insurance solvency risk regulatory
- **[Nareit REIT Research](https://www.reit.com/)** — REIT market data, sector research and listed real-estate investment resources. _Access:_ Industry association; product and index data terms apply. _Status:_ `research` _Tags:_ REIT real estate listed property dividend
- **[National Venture Capital Association](https://nvca.org/)** — US venture-capital industry data, research and policy resources. _Access:_ Industry association reports; access varies. _Status:_ `research` _Tags:_ venture capital startup private equity
- **[PitchBook](https://pitchbook.com/)** — Private-market, venture-capital, M&A and fund data. _Access:_ Paid/conditional data platform. _Status:_ `research` _Tags:_ private equity venture capital M&A funds
- **[Preqin](https://www.preqin.com/)** — Private-capital data including private equity, private credit, real estate and infrastructure. _Access:_ Substantial paid data products. _Status:_ `research` _Tags:_ private markets private credit hedge funds

### Professional Terminals (4)

- **[Bloomberg Professional](https://www.bloomberg.com/professional/)** — Professional multi-asset data, news and analytics. _Access:_ Paid. _Status:_ `research`
- **[FactSet](https://www.factset.com/)** — Institutional financial data, estimates and investment research. _Access:_ Paid. _Status:_ `research`
- **[LSEG Workspace](https://www.lseg.com/en/data-analytics/products/workspace)** — Financial-market data, company information and analytics. _Access:_ Paid. _Status:_ `research`
- **[S&P Capital IQ](https://www.spglobal.com/marketintelligence/en/solutions/sp-capital-iq-platform)** — Company financials, corporate events and financial analysis. _Access:_ Paid. _Status:_ `research`

### Regulatory Enforcement & Fraud (26)

- **[CFTC Enforcement Actions](https://www.cftc.gov/LawRegulation/EnforcementActions/index.htm)** — Commodity, derivatives, forex and event-contract enforcement actions. _Access:_ Official US regulator; includes complaints, settlements and orders. _Status:_ `research`
- **[CFTC RED List](https://www.cftc.gov/LearnAndProtect/Resources/Check/redlist.htm)** — Foreign entities that appear to be acting in a capacity requiring CFTC registration but are not registered. _Access:_ Official US warning list; verify entity identity carefully. _Status:_ `research`
- **[CFTC Registration & Disciplinary History](https://www.cftc.gov/check)** — Check registration and disciplinary information for relevant CFTC-regulated firms/individuals. _Access:_ Official US regulator. _Status:_ `research`
- **[CFTC Whistleblower Program](https://www.whistleblower.gov/)** — Official program explaining how eligible tips may be submitted and awards work. _Access:_ Use only for genuine, lawfully obtained information. _Status:_ `research`
- **[CourtListener](https://www.courtlistener.com/)** — Search US court opinions, dockets and RECAP documents from public PACER-derived filings. _Access:_ Public legal research; some filings may be missing or restricted. _Status:_ `research`
- **[EU Sanctions Map](https://www.sanctionsmap.eu/)** — EU restrictive measures and country/sector sanctions. _Access:_ Official EU information portal. _Status:_ `research`
- **[FBI Internet Crime Complaint Center](https://www.ic3.gov/)** — Report internet-enabled fraud and cyber-enabled financial crime. _Access:_ Official US reporting channel. _Status:_ `research`
- **[FCA Enforcement / Final Notices](https://www.fca.org.uk/news/search-results?category=final-notices)** — Public enforcement and final notices from the UK regulator. _Access:_ Official UK regulator. _Status:_ `research`
- **[FCA Financial Services Register](https://register.fca.org.uk/)** — Verify UK-authorised firms and individuals. _Access:_ Official UK regulator. _Status:_ `research`
- **[FCA Warning List](https://www.fca.org.uk/consumers/warning-list-unauthorised-firms)** — UK FCA list of unauthorised firms and individuals the regulator has warned about. _Access:_ Official UK warning list; always verify current status. _Status:_ `research`
- **[FINRA BrokerCheck](https://brokercheck.finra.org/)** — Research US brokers, firms, registrations and disclosure history. _Access:_ Official FINRA tool. _Status:_ `research`
- **[FINRA Disciplinary Actions](https://www.finra.org/rules-guidance/oversight-enforcement/finra-disciplinary-actions)** — Public disciplinary actions and notices. _Access:_ Official industry regulator/SRO. _Status:_ `research`
- **[OFAC Sanctions Search](https://sanctionssearch.ofac.treas.gov/)** — Search US Treasury sanctions lists. _Access:_ Official US sanctions tool. _Status:_ `research`
- **[OpenSanctions](https://www.opensanctions.org/)** — Search structured sanctions, politically exposed persons and related-entity datasets. _Access:_ Data vendor/aggregator; verify against primary authority and licensing. _Status:_ `research`
- **[PACER](https://pacer.uscourts.gov/)** — Official US federal court case and docket access. _Access:_ Account/fees may apply. _Status:_ `research`
- **[RBI Alert List](https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4235)** — RBI list of unauthorised forex trading platforms (check the latest version on the RBI site). _Access:_ Official India warning resource; lists change over time. _Status:_ `research`
- **[RBI Press Releases](https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx)** — Reserve Bank of India announcements, policy updates and public notices. _Access:_ Official India central bank. _Status:_ `research`
- **[SEBI Orders & Directions](https://www.sebi.gov.in/enforcement/orders.html)** — Indian securities enforcement orders and directions. _Access:_ Official India regulator. _Status:_ `research`
- **[SEBI Press Releases](https://www.sebi.gov.in/media-and-notifications/press-releases.html)** — Indian regulatory announcements and action updates. _Access:_ Official India regulator. _Status:_ `research`
- **[SEC Enforcement & Litigation](https://www.sec.gov/enforcement-litigation)** — US securities enforcement actions, litigation releases and public case materials. _Access:_ Official US regulator; allegations and final outcomes are different. _Status:_ `research`
- **[SEC Investment Adviser Public Disclosure (IAPD)](https://adviserinfo.sec.gov/)** — Search US investment advisers and representatives, registrations and public disclosures. _Access:_ Official US regulator. _Status:_ `research`
- **[SEC Tips, Complaints and Referrals](https://www.sec.gov/tcr)** — Official channel to report suspected securities-law violations. _Access:_ Do not submit fabricated or unlawfully obtained material. _Status:_ `research`
- **[UK Sanctions List](https://www.gov.uk/government/publications/the-uk-sanctions-list)** — Official UK sanctions designations and notices. _Access:_ Official UK government. _Status:_ `research`
- **[UN Security Council Consolidated List](https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list)** — UN Security Council sanctions list. _Access:_ Official UN. _Status:_ `research`
- **[US Department of Justice — Fraud Section](https://www.justice.gov/criminal/criminal-fraud)** — Public information on corporate, securities and financial fraud enforcement. _Access:_ Official US DOJ. _Status:_ `research`
- **[US DOJ Press Releases](https://www.justice.gov/news)** — Public criminal/civil case announcements and enforcement outcomes. _Access:_ Official US DOJ; charges are allegations until proven/adjudicated. _Status:_ `research`

### Whistleblower & Public-Interest Reporting (5)

- **[FinCEN Advisories](https://www.fincen.gov/resources/advisoriesbulletinsfact-sheets)** — AML and illicit-finance typologies that help understand risk patterns. _Access:_ Official; not a list of all suspicious activity. _Status:_ `research`
- **[FinCEN Press Releases](https://www.fincen.gov/news-room)** — Public notices on AML, suspicious finance, enforcement and financial crime. _Access:_ Official US Treasury bureau. _Status:_ `research`
- **[Global Anti-Corruption Blog](https://globalanticorruptionblog.com/)** — Commentary and research on corruption, compliance and corporate misconduct. _Access:_ Expert commentary, not official legal decisions. _Status:_ `research`
- **[OFAC Recent Actions](https://ofac.treasury.gov/recent-actions)** — Recent sanctions designations and updates. _Access:_ Official US Treasury. _Status:_ `research`
- **[SEC Whistleblower Program](https://www.sec.gov/enforcement-litigation/whistleblower-program)** — Official information on qualifying tips about securities-law violations. _Access:_ For lawful reporting; eligibility and confidentiality rules apply. _Status:_ `research`

### X / Social Market Signals (29)

- **[Bank of England on X](https://x.com/bankofengland)** — UK monetary-policy and central-bank updates. _Access:_ Confirm on bankofengland.co.uk. _Status:_ `research`
- **[Bloomberg on X](https://x.com/business)** — Bloomberg business and market headlines. _Access:_ News source; some details may require subscription. _Status:_ `research`
- **[BSE India on X](https://x.com/BSEIndia)** — Exchange updates and corporate-market information. _Access:_ Confirm disclosures on bseindia.com. _Status:_ `research`
- **[Cboe on X](https://x.com/CBOE)** — Exchange announcements, options/volatility information and market education. _Access:_ Verify account and use official product/data documentation. _Status:_ `research` _Tags:_ X options VIX market structure
- **[CFTC on X](https://x.com/CFTC)** — Commodity Futures Trading Commission updates, enforcement and public notices. _Access:_ Official account at time curated; verify profile. _Status:_ `research` _Tags:_ X futures commodities COT regulation
- **[CME Group on X](https://x.com/CMEGroup)** — Official CME Group market/derivatives updates. _Access:_ Exchange source; not a substitute for contract data. _Status:_ `research`
- **[CoinGlass on X](https://x.com/CoinGlass_com)** — Crypto derivatives, funding and liquidation analytics. _Access:_ Check underlying dataset and timestamp. _Status:_ `research`
- **[DeFiLlama on X](https://x.com/DefiLlama)** — DeFi metrics and protocol-data updates. _Access:_ Verify definitions and protocol coverage. _Status:_ `research`
- **[EIA on X](https://x.com/EIAgov)** — US energy and petroleum data updates. _Access:_ Confirm weekly report/API timestamps on eia.gov. _Status:_ `research`
- **[European Central Bank on X](https://x.com/ecb)** — Central-bank announcements and research links. _Access:_ Confirm on ecb.europa.eu. _Status:_ `research`
- **[Federal Reserve on X](https://x.com/federalreserve)** — Official Federal Reserve social account for announcements and updates. _Access:_ Official source; always cross-check linked release. _Status:_ `research`
- **[Financial Times on X](https://x.com/FT)** — Financial Times reporting, macro and company news. _Access:_ Journalism; verify article context and publication time. _Status:_ `research` _Tags:_ X FT markets macro
- **[FinancialJuice on X](https://x.com/financialjuice)** — Economic calendar headlines and market-news alerts. _Access:_ Third-party alert feed; cross-check official releases. _Status:_ `research`
- **[First Squawk on X](https://x.com/FirstSquawk)** — Fast market/news alert account. _Access:_ Third-party feed; verify against original source. _Status:_ `research`
- **[Glassnode on X](https://x.com/glassnode)** — Crypto on-chain research and analytics. _Access:_ Research vendor; metric definitions matter. _Status:_ `research`
- **[ICE on X](https://x.com/ICE_Markets)** — Intercontinental Exchange company and market announcements. _Access:_ Verify account authenticity and linked issuer source. _Status:_ `research` _Tags:_ X ICE futures exchange energy
- **[Lookonchain on X](https://x.com/lookonchain)** — Crypto wallet and on-chain transaction alerts. _Access:_ On-chain interpretation may be uncertain; verify transaction hashes. _Status:_ `research`
- **[NSE India on X](https://x.com/NSEIndia)** — Exchange announcements and market notices. _Access:_ Confirm market notices on nseindia.com. _Status:_ `research`
- **[RBI on X](https://x.com/RBI)** — Reserve Bank of India public notices and announcements. _Access:_ Verify current official profile; original RBI releases take priority. _Status:_ `research` _Tags:_ X RBI India rates banking forex
- **[Reuters on X](https://x.com/Reuters)** — Global news reporting and urgent headlines. _Access:_ News source; verify original reporting. _Status:_ `research`
- **[SEBI on X](https://x.com/SEBI_India)** — Indian securities-regulator communications. _Access:_ Confirm announcements on sebi.gov.in. _Status:_ `research`
- **[SEC on X](https://x.com/SECGov)** — Official US Securities and Exchange Commission account. _Access:_ Official source. _Status:_ `research`
- **[Stock Market News on X](https://x.com/StockMKTNewz)** — Fast equity-market headlines and company catalysts. _Access:_ Third-party news aggregation; verify before acting. _Status:_ `research`
- **[The Kobeissi Letter on X](https://x.com/KobeissiLetter)** — Macro, rates, commodities and market commentary. _Access:_ Commentary/analysis; not an official data source. _Status:_ `research`
- **[Unusual Whales on X](https://x.com/unusual_whales)** — Options, political-disclosure and market-data commentary. _Access:_ Analytics/commentary; public filings should be verified. _Status:_ `research`
- **[US Treasury on X](https://x.com/USTreasury)** — Treasury announcements and fiscal/financial updates. _Access:_ Confirm official releases. _Status:_ `research`
- **[Walter Bloomberg / DeItaone on X](https://x.com/DeItaone)** — Fast reposts and headline monitoring used by market participants. _Access:_ Not a primary source; confirm every material claim. _Status:_ `research`
- **[Whale Alert on X](https://x.com/whale_alert)** — Large blockchain transfer alerts. _Access:_ Transfers are not proof of buying/selling intent. _Status:_ `research`
- **[ZeroHedge on X](https://x.com/zerohedge)** — Macro and market commentary. _Access:_ Opinion/commentary; cross-check with primary sources. _Status:_ `research`

## Limitations

The HTML is a static directory: it does not fetch live quotes, validate each URL at runtime, guarantee completeness or establish trade eligibility. Check current source pages, timestamps, API quotas, licences, broker access and applicable laws. Public forecasts/social posts are signals to verify, not primary evidence. The directory excludes stolen credential dumps, hacked private databases and restriction-circumvention instructions.



---

# Preserved original: Finance_Intelligence_OS_Global_Market_Cockpit.md

> The following is the original source document, preserved verbatim.

# Finance Intelligence OS — Global Market Cockpit Edition

**Updated:** 26 October 2026  
**Format:** Standalone HTML directory with an interactive market cockpit and curated source library.

## Files
- `finance_intelligence_os_market_cockpit.html` — main interactive, searchable dashboard.

## What the new cockpit does
- Select a market/pair/instrument and open chart search, latest news search, X latest-post search, Google Trends, Reddit, YouTube, an event calendar and forecast/fundamental references.
- Shows live clocks for India, London, New York, Chicago, Tokyo and Hong Kong using browser timezone data (DST-aware local times). Venue holidays and exact product hours still need checking.
- Browse FX majors, crosses and emerging-market/INR pairs; sovereign yields; global equity indices; metals/materials; energy; crypto majors and selected altcoins; global stocks; agriculture; freight and carbon instruments.
- View a conditional catalyst-to-market impact map for inflation, central banks, jobs, oil shocks, China, earnings, ETF flows, crypto transfers, token unlocks, exploits, bond auctions and risk-off events. These are scenario mechanisms, not forecasts.
- Find publisher, official institution/exchange and specialist market X accounts.
- Search and filter the broader resource directory; export visible entries as CSV.

## Important source links
- [Reuters Markets](https://www.reuters.com/markets/)
- [Bloomberg Markets](https://www.bloomberg.com/markets)
- [FinancialJuice](https://www.financialjuice.com/) — fast headlines/audio squawk; cross-check original reporting.
- [InvestingLive](https://www.investinglive.com/) — forex and macro coverage.
- [TradingView Economic Calendar](https://www.tradingview.com/economic-calendar/) — economic events linked to markets.
- [CFTC COT reports](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) — periodic/delayed futures positioning, not live order flow.
- [Google Trends help](https://support.google.com/trends/answer/3076011?hl=en) — Trending Now covers 100+ countries/regions and refreshes on average about every ten minutes per Google help documentation.
- [NSE market timings](https://www.nseindia.com/resources/exchange-communication-holidays) — official India equity-market timings and holiday notices.
- [X Search guide](https://help.x.com/en/using-x/x-search) — search public posts and filter for Latest.

## X profiles included
- [@ReutersBiz](https://x.com/ReutersBiz) · [@markets](https://x.com/markets) · [@CNBC](https://x.com/CNBC)
- [@financialjuice](https://x.com/financialjuice) · [@Investingcom](https://x.com/Investingcom) · [@investinglive_](https://x.com/investinglive_) · [@tEconomics](https://x.com/tEconomics)
- [@federalreserve](https://x.com/federalreserve) · [@BLS_gov](https://x.com/BLS_gov) · [@NSEIndia](https://x.com/NSEIndia) · [@BSEIndia](https://x.com/BSEIndia) · [@PIB_India](https://x.com/PIB_India)
- [@CoinDesk](https://x.com/CoinDesk) · [@CoinDeskMarkets](https://x.com/CoinDeskMarkets) · [@whale_alert](https://x.com/whale_alert) · [@lookonchain](https://x.com/lookonchain) · [@unusual_whales](https://x.com/unusual_whales)

## Data and scope limitations
The HTML is an information hub, not a market-data subscription: selecting an instrument opens provider websites and query pages. Actual quotes, headlines, paywalls, data latency, calendar schedules and availability depend on the provider. It does not infer guaranteed “pump/dump” outcomes. X feeds and community signals are leads; verify claims against original filings, exchange releases, official data or multiple credible reports.

For India-specific restrictions, use relevant official regulators and exchanges. Website accessibility is not proof that a real-money product is available or lawful. Do not use the directory to bypass explicit platform blocks.

