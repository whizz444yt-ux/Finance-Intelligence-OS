# Architecture

## Runtime topology

```text
Browser
  ├─ Finance Intelligence OS Global Research cockpit
  ├─ Static modules: Markets / Futures Desk / News / Macro / COT / Research / Academy / Tools / Account
  └─ ICT Futures terminal: 15 futures families + 76 ICT concepts + dedicated lesson pages
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

## Runtime and provider responsibilities

- **Vercel** serves the static application, generated routes, and published sitemap.
- **Cloudflare Worker** is the single public-data gateway. It owns upstream calls, per-provider timeouts, cache and freshness labels. The GDELT scheduled refresh uses the existing 30-minute Cron trigger. A manual `/api/v1/news?refresh=1` request queues a Worker-side refresh under a five-minute cooldown/lock; the API immediately returns the prior snapshot with refresh state, so the browser does not make upstream GDELT calls. BLS, CFTC and prediction-market feeds are refreshed on request with KV fallback.
- **Supabase** stores the normalized data model and user-owned journal/watchlists/progress. All 16 public tables currently have RLS enabled. The Worker currently has no Supabase service-role/secret key configured, so its optional server-side ingestion writes remain disabled; do not put privileged keys in browser code.
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
| `/api/v1/prediction/polymarket` | Polymarket Gamma | Active event metadata, outcome prices, volume and liquidity fields; read-only. |
| `/api/v1/prediction/kalshi` | Kalshi public Trade API v2 | Open event markets, YES bid/ask and volume fields; read-only. |
| `/api/v1/providers` | Gateway registry | Provider configuration and last-known state. |
| `/api/v1/health` | Gateway | Worker health and secret/configuration presence flags, never secret values. |

The UI should display provider, source URL, publisher/event timestamp, retrieval timestamp, data-as-of time and freshness status separately wherever the provider supports them. The Data Health page runs each public gateway endpoint independently and distinguishes an available-on-demand route from a fresh upstream snapshot. Prediction-market data remains a separate venue context. The Entry Models page is descriptive and does not rank models without reproducible results; Strategy Lab publishes no backtest statistics until timestamped historical inputs, costs and validation methodology are available. The Futures Desk tracks each research feed independently; one successful provider must not label the whole dashboard healthy. COT category rows are normalized according to the selected CFTC report type rather than using a generic position-field fallback. Event-market probabilities are not exchange quotes, and COT is not an intraday signal.

## Historical persistence and schedules

The economic provider adapters live in `cloudflare/src/economic-providers.js`. They normalize provider-specific observations and preserve units, source URLs, retrieval timestamps, frequency and raw provider attributes. `economic_observations` uses a unique key `(provider, dataset_id, series_id, frequency, observation_date)` so scheduled refreshes can safely upsert without duplicating history. `ingestion_runs` records each run and is deliberately inaccessible to browser roles; a second migration adds an explicit `USING (false)` / `WITH CHECK (false)` policy for anon/authenticated roles in addition to revoking their privileges. `economic_observations` is public read-only; all writes use `SUPABASE_SERVICE_ROLE_KEY` in the Cloudflare Worker only.

The Worker Cron remains every 30 minutes, but provider TTL/cadence checks control actual upstream requests. The five selected FRED series use one request per series with the documented 100,000-observation cap; EIA requests up to 5,000 weekly observations; Treasury history is paginated in bounded 1,000-row pages; ECB requests the latest 1,000 observations. BEA/EIA/FRED credentials are Worker secrets; Treasury Fiscal Data and ECB SDMX do not require registered API keys. `POST /api/v1/ingest` is protected by the `INGEST_TOKEN` bearer header. If credentials or database secrets are absent, provider fetch status and persistence status are reported independently; no secret value is included in logs or source URLs.

## Security and access boundaries

- Browser runtime configuration may include only public Supabase publishable/anon values and the Worker URL. Supabase service-role keys, Builder PATs, ingestion tokens and other privileged credentials must remain Worker secrets.
- Worker CORS must be restricted to explicit deployed site origins; do not use wildcard CORS with credentialed or private data.
- Prediction-market routes are read-only. No wallet, order-placement, account-trading or execution routes are implemented.
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
