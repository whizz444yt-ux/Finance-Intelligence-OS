# Architecture

## Runtime topology

```text
Browser
  ├─ Futures Command Center homepage and shared 13-area app shell
  │    ├── Grouped desktop sidebar / compact top bar / responsive mobile drawer
  │    ├── Dark-first CSS tokens / optional light preference / independent widget states
  │    └── Overview widgets: contract reference, gateway health, news, weekly COT, clocks, private summary
  ├─ Static modules: 15 Futures Families / Futures Desk / Futures News / Macro / COT / Volume & OI / Contract Specs / Risk
  └─ ICT Futures terminal: 15 futures families + 76 ICT concepts + 9 guided tutorials + existing DST-aware sessions/calendar
       │
       ├── Vercel static hosting (Git-linked from main)
       ├── Cloudflare Worker API gateway
       │      ├── GDELT futures-focused discovery → KV snapshot (scheduled every 30 minutes)
       │      ├── US BLS Public Data API v1 → KV (historical macro series)
       │      ├── CFTC Public Reporting Environment → KV (TFF / Disaggregated weekly COT)
       │      ├── New York Fed Markets API (SOFR / EFFR / OBFR / repo reference rates)
       │      ├── Polymarket Gamma public events → KV (read-only venue odds/volume)
       │      ├── Kalshi public Trade API v2 → KV (read-only event markets/bid-ask metadata)
       │      ├── Builder Content API allow-listed proxy (not configured)
       │      └── provider health / freshness metadata
       └── Supabase Postgres/Auth (public normalized data model + private per-user workspace)
```

## User-interface architecture

The Python builder owns the shared shell for generated pages and applies the same sidebar wrapper to the two standalone Futures Desk and ICT terminal apps. The root overview remains a maintained static HTML page and loads its own small dashboard controller. The shell is browser-native HTML/CSS/JavaScript; it does not add a framework or component-library dependency.

The 13 primary areas are Overview, Futures Markets, ICT Academy, Entry Models, Sessions & Calendar, Futures News, Volume & Open Interest, COT & Positioning, Contract Specs & Expiry, Strategy Lab, Risk & Prop Firms, Journal & Watchlists, and Data Health & Sources. Existing routes /markets/, /macro/, /tools/, and /sources/ remain compatible supporting routes or redirects.

Overview widgets request data independently. A failed news or COT request must not blank the session clock or other page modules. The overview shows ET and a selectable browser/profile timezone; the current ICT terminal keeps its own DST-aware ET/IST session clock. No session high/low or range is shown unless an intraday source is connected.

The imported 15-family contract registry currently lacks expiry/first-notice fields and its tick references remain unverified. The contract-specs page marks the source values accordingly and shows missing lifecycle fields as unavailable. The sessions route reuses the ICT Futures terminal sessions anchor; no second event calendar is fabricated. The risk page retains the existing sizing logic and marks prop-firm rulebooks as not configured. Real-time CME/ICE quotes, depth, delayed quotes, consolidated event schedules and prop-firm pricing are not implied by shell state.

## Runtime and provider responsibilities

- **Vercel** serves the static application, generated routes, and published sitemap.
- **Cloudflare Worker** is the single public-data gateway. It owns upstream calls, per-provider timeouts, cache and freshness labels. The GDELT scheduled refresh uses the existing 30-minute Cron trigger. A manual `/api/v1/news?refresh=1` request queues a Worker-side refresh under a five-minute cooldown/lock; the API immediately returns the prior snapshot with refresh state, so the browser does not make upstream GDELT calls. BLS and CFTC feeds are refreshed on request with KV fallback. The former event-market handlers are retained as dormant compatibility code; the active frontend no longer requests them.
- **Supabase** stores the normalized data model and user-owned journal/watchlists/progress. All 22 public tables currently have RLS enabled. The Worker currently has no Supabase service-role/secret key configured, so its optional server-side ingestion writes remain disabled; do not put privileged keys in browser code.
- **Builder.io** remains optional editorial CMS. Its public Content API key and Admin PAT are not configured, so existing static lessons and JSON remain the fallback.
- **GitHub Actions** runs build, unit, validation and internal-link checks on pushes and pull requests.

## API routes

| Route | Provider | Meaning / freshness |
|---|---|---|
| `/api/v1/news` | GDELT DOC | Cached news-discovery snapshot, scheduled every 30 minutes; discovery index, not licensed newswire. |
| `/api/v1/volume-open-interest?report=tff&q=...` | CFTC PRE | Contract-filtered weekly futures-only open-interest history. The endpoint explicitly reports exchange trading volume as not connected; COT data is not daily/intraday volume. |
| `/api/v1/macro` | US BLS v1 | Historical CPI, core CPI, unemployment, payroll and PPI observations. Not live market data. |
| `/api/v1/cot?report=tff` | CFTC PRE | Weekly Traders in Financial Futures report. |
| `/api/v1/cot?report=disaggregated` | CFTC PRE | Weekly Disaggregated report. |
| `/api/v1/macro/funding` | New York Fed Markets API | Latest published SOFR, EFFR and supported overnight reference rates; daily business-day observations. |
| `/api/v1/economic/providers` | Worker provider registry | Credential configuration, cadence, last attempt/success, persistence state and freshness per provider. |
| `/api/v1/economic/bea` | BEA NIPA | Quarterly NIPA Table T10101; requires `BEA_API_KEY`. |
| `/api/v1/economic/eia` | EIA API v2 series ID route | Weekly US crude-oil ending stocks `PET.WCESTUS1.W`; requires `EIA_API_KEY`. |
| `/api/v1/economic/fred` | FRED observations API | DFF, DGS10, CPIAUCSL, UNRATE and PCEPI histories; requires `FRED_API_KEY` and paginated series queries. |
| `/api/v1/economic/us_treasury` | Treasury Fiscal Data | Monthly average interest rates on marketable Treasury securities; public API, historical series pages with explicit provider cadence. |
| `/api/v1/economic/ecb` | ECB SDMX 2.1 | Daily USD/EUR reference series `D.USD.EUR.SP00.A`; public endpoint. |
| `POST /api/v1/ingest` | Worker ingestion orchestrator | Protected by `INGEST_TOKEN`; starts provider ingestion and records persistence outcomes.
| `/api/v1/prediction/polymarket` | Polymarket Gamma | Dormant compatibility handler only; not linked to or called by the active frontend. |
| `/api/v1/prediction/kalshi` | Kalshi public Trade API v2 | Dormant compatibility handler only; not linked to or called by the active frontend. |
| `/api/v1/providers` | Gateway registry | Provider configuration and last-known state. |
| `/api/v1/health` | Gateway | Worker health and secret/configuration presence flags, never secret values. |

The UI should display provider, source URL, publisher/event timestamp, retrieval timestamp, data-as-of time and freshness status separately wherever the provider supports them. The Data Health page runs each active futures-relevant gateway endpoint independently and distinguishes an available-on-demand route from a fresh upstream snapshot. The Entry Models page is descriptive and does not rank models without reproducible results; Strategy Lab publishes no backtest statistics until timestamped historical inputs, costs and validation methodology are available. The Futures Desk tracks each research feed independently; one successful provider must not label the whole dashboard healthy. COT category rows are normalized according to the selected CFTC report type rather than using a generic position-field fallback. Event-market probabilities are not exchange quotes, and COT is not an intraday signal.

## Historical persistence and schedules

The economic provider adapters live in `cloudflare/src/economic-providers.js`. They normalize provider-specific observations and preserve units, source URLs, retrieval timestamps, frequency and raw provider attributes. `economic_observations` uses a unique key `(provider, dataset_id, series_id, frequency, observation_date)` so scheduled refreshes can safely upsert without duplicating history. `ingestion_runs` records each run and is deliberately inaccessible to browser roles; a second migration adds an explicit `USING (false)` / `WITH CHECK (false)` policy for anon/authenticated roles in addition to revoking their privileges. `economic_observations` is public read-only; all writes use `SUPABASE_SERVICE_ROLE_KEY` in the Cloudflare Worker only.

The Worker Cron remains every 30 minutes, but provider TTL/cadence checks control actual upstream requests. The five selected FRED series use one request per series with the documented 100,000-observation cap; EIA requests up to 5,000 weekly observations; Treasury history is paginated in bounded 1,000-row pages; ECB requests the latest 1,000 observations. BEA/EIA/FRED credentials are Worker secrets; Treasury Fiscal Data and ECB SDMX do not require registered API keys. `POST /api/v1/ingest` is protected by the `INGEST_TOKEN` bearer header. If credentials or database secrets are absent, provider fetch status and persistence status are reported independently; no secret value is included in logs or source URLs.

## Security and access boundaries

- Browser runtime configuration may include only public Supabase publishable/anon values and the Worker URL. Supabase service-role keys, Builder PATs, ingestion tokens and other privileged credentials must remain Worker secrets.
- Worker CORS must be restricted to explicit deployed site origins; do not use wildcard CORS with credentialed or private data.
- Legacy event-market handlers remain dormant and unlinked. No active event-market UI, page route, provider health check or client API call remains.
- Public data is not necessarily licensed for redistribution or commercial use. Upstream terms and market-data exchange licenses still apply.
- Contract reference values in the retained 15-profile dataset must be verified against the relevant current exchange specification. Contract expiry, first notice, last trade and broker margin must not be inferred from a continuous chart.

## Data contract

Normalized records should retain `provider`, `source_url`, `published_at`, `event_at`, `retrieved_at`, `data_as_of`, `freshness_status`, `license_note` and a stable provider ID where supported. Publisher time, event time, retrieval time and data-as-of time are not interchangeable.

## Degradation

If a provider is rate-limited, blocked, unavailable or not configured, the UI shows an unavailable/not-configured state or a clearly identified last-known snapshot. It must not synthesize values, describe a search destination as an API, or imply that an indicative event-market probability is a futures price.


## P3 ICT Academy curriculum

The ICT Academy dataset retains the existing 76 concept IDs, categories, levels and seven learning tracks. Each concept now carries a structured learning object: objectives, prerequisites, guided steps, a labelled hypothetical example, chart-replay exercise, deliverable/review criteria, three-choice knowledge check and source references. The content preserves evidence/provenance labels and does not upgrade community terminology into canonical ICT rules.

Nine guided tutorials provide multi-concept workbooks for structure, liquidity, sweep versus acceptance, imbalances, dealing ranges, timezone-aware sessions, cross-market comparisons, entry-model replay and supplemental source auditing.

The static build's `scripts/build_academy.py` creates the enhanced standalone lesson pages at existing `/ict-futures/academy/{id}.html` URLs and nine tutorial pages plus an index under `/ict-futures/academy/tutorials/`. The root `/academy/` route provides a searchable 76-lesson catalogue, seven track entry points and tutorial cards.

Lesson progress uses local storage for immediate, offline progress and attempts cloud sync only when a Supabase session is present. It sends the learner's authenticated JWT and publishable key to the existing `public.lesson_progress` Data API table; RLS checks `auth.uid() = user_id`. It uses the unique `(user_id, lesson_slug)` key for an upsert. Migration `20261108144106_add_lesson_progress_data` adds `progress_data` JSONB for practice checklist state and `lesson_version` for curriculum versioning. The browser uses only a publishable key and the learner JWT; no service-role key is exposed. Lesson completion requires the practice checklist and correct knowledge-check response; tutorial completion requires its review checklist. A synced score is a learning check, not a trading-skill metric.

Verified original ICT uploads are only embedded where the source catalogue explicitly marks them as verified. Official channel/playlist and topic-search links are distinguished. CME Institute/CFTC links provide general exchange/regulatory education and are not presented as sources for ICT setup definitions or profitability.


## P4 Strategy Lab — deterministic backtesting

The /strategy-lab/ page uses three static client assets: assets/strategy-lab.js, assets/strategy-lab.css and the pure deterministic calculation module assets/strategy-backtest-engine.mjs. The engine accepts one contract/expiry's timestamped OHLC bars with an explicit LONG/SHORT/FLAT signal column. The signal is known at source-bar close; execution is attempted at the next bar open. The system does not infer ICT signals from raw OHLC and does not silently convert lesson descriptions into rules.

The CSV parser requires an explicit timestamp timezone (ISO UTC offset or Z), strictly increasing unique timestamps, valid OHLC relationships and one contract code. The engine accepts at most 250,000 bars and the page limits uploads to 50 MB. Optional per-row stop-tick overrides are supported. Contract tick size/value, costs and the selected timezone are recorded in the run manifest. Single-expiry history is preferred; back-adjusted continuous series require a roll/adjustment note and are warned as synthetic.

Execution assumptions: one open position, no pyramiding; whole-contract sizing is floored against current cash risk budget; configured max contracts; commissions per contract per side; slippage in ticks per side; next-open entry; adverse stop slippage and worse-open stop-gap fills; no target price improvement on gaps; stop-first handling when a bar touches stop and target; no queue or partial-fill model for limits; time/end-of-data exit. Equity is marked at each bar close with estimated exit commission/slippage reserved. Drawdown is based on this marked equity.

Metrics include gross P&L, net P&L after modeled costs, net expectancy per trade, average net R, net profit factor, win rate, trade count, cost totals and maximum drawdown size/percent/underwater duration. The engine emits independent chronological in-sample, validation and out-of-sample segments; each starts flat with fresh starting capital. No signal or open position crosses segment boundaries. Full-sample metrics are descriptive and not a replacement for OOS.

The run manifest stores the CSV SHA-256, canonical run fingerprint, engine version, all parameters, split percentages, data-quality summary and execution policy. SHA-256 is computed in the browser; the source CSV is not uploaded. The authenticated browser may store the manifest, metrics and completed trades in strategy_backtests and strategy_backtest_trades, both RLS-protected by auth.uid() = user_id. No service-role key is present in browser assets. Local-only runs remain available when signed out or cloud sync fails.

The eight ICT entry models are still playbook descriptions. Until each model has a deterministic causal signal definition, P4 tests supplied signal columns rather than claiming to backtest the ICT concepts automatically. Exchange point/tick values, active contract expiry, roll mechanics, holidays, margin, market impact, broker fills and licensing are user/data-source assumptions that must be verified; unverified contract catalogue values are not automatically injected.

## P5 Cloud personal workspace

The /account/ route now loads a private workspace with Supabase Auth, refresh-token rotation, trade journal/watchlist/research-note/alert CRUD, analytics and cross-device synchronization. The browser uses the project publishable key and authenticated user JWT only. The session is persisted in localStorage under the shared finance-os-supabase-session-v1 key and mirrored to sessionStorage for compatibility with the ICT Academy and Strategy Lab clients. Expiring sessions are refreshed before database requests; an HTTP 401 triggers one refresh/retry.

Data model: journal_trades remains the user's trade-record source; watchlists/watchlist_items are the multi-list instrument shortcut model; profiles stores display name/timezone; user_preferences stores theme and JSON preferences. Migration 20261108161355 adds research_notes and alert_events. Migration 20261108161450 adds journal_trades.legacy_id plus a unique user/legacy identifier to make import of existing ICT browser journal entries idempotent. Migration 20261108163000 adds covering indexes on (alert_id,user_id) and (backtest_id,user_id) for alert and backtest composite foreign keys. Alert events link to an alert/user pair through a composite foreign key. Private tables use owner RLS.

The explicit Import action reads the old Global Research local watchlist and scenario-note keys and the ICT Futures ictfos.journal.v1 trade journal. It upserts stable legacy identifiers and does not delete local values. It must be run separately in each browser containing unique historical local data. Partial import failures can be retried without duplicate legacy rows.

Account analytics summarize saved closed trades using entered net P&L and R values. They are not connected to a broker or live account. Price alert rules are persisted in alert_rules and triggered event history in alert_events; the user enters a current observed price to run a manual threshold evaluation. Browser notifications require an open site and permission. No unattended market monitoring, exchange quote polling, email/SMS alerts or scheduled server delivery is claimed. Those capabilities require a verified appropriately licensed market-data source and a scheduled background service.

Users can export a JSON backup of the workspace. Profiles, trades, lists, notes, alerts and event history load on sign-in or via Sync now. No privileged service-role key is shipped to the browser.