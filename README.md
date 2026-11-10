# Finance Intelligence OS

A premium global financial research workspace with the preserved Global Research cockpit, a dedicated ICT Futures terminal, a contract-aware Futures Intelligence Desk, 585-resource source directory, macro/COT data adapters, read-only prediction-market discovery, risk tools, news research, ICT learning catalogue and Supabase-backed private workspace foundation.

**Current release:** `v1.1.0` · **Production branch:** `main` · **Deployment:** Live on Vercel · **Release date:** 10 November 2026. The tagged GitHub release remains a separate release-management step.

## Preserved source work

- The previous Finance Intelligence OS Global Research Edition remains the homepage and primary cockpit.
- The previous 585-resource research directory and 73 instrument profiles are retained.
- ICT Futures Intelligence OS 3.0 is preserved at `/ict-futures/`, including 15 contract-family pages, 76 Academy lesson pages, the original terminal UI, datasets, session/calendar tools, journal, checklist and risk modules.
- Previous Finance OS Markdown documents, notes and source ZIP baselines remain in `legacy/`.
- The complete five-platform requirements document remains in `docs/FINANCE_INTELLIGENCE_OS_COMPLETE_MASTER_REQUIREMENTS.md`.

## Routes

- `/` — preserved Global Research cockpit.
- `/markets/` — futures families and global instruments.
- `/futures-intelligence/` — premium futures control room with contract selection, GDELT headlines, BLS indicators, CFTC COT, and read-only Polymarket/Kalshi event markets.
- `/volume-open-interest/` — contract-scoped weekly CFTC open-interest observations; exchange daily/intraday volume remains explicitly unavailable until a verified volume feed is connected.
- `/prediction-markets/` — separate read-only Polymarket and Kalshi event-market context.
- `/entry-models/` — eight preserved ICT entry-model concepts, with no unaudited performance ranking.
- `/strategy-lab/` — backtest methodology and data-readiness status; strategy statistics are not published until reproducible tests exist.
- `/data-health/` — independently checked gateway/provider snapshots, retrieval times and configuration states.
- `/news/` — GDELT news-discovery snapshots.
- `/macro/` — five historical US BLS series (CPI, core CPI, unemployment, nonfarm payrolls, PPI).
- `/macro/` also exposes BEA quarterly national-accounts data, EIA weekly crude-oil stocks, FRED macro histories, US Treasury monthly average-interest-rate observations and ECB daily USD/EUR reference rates through separate provider cards.
- `/research/positioning/` — CFTC TFF and Disaggregated COT dashboard.
- `/research/` — searchable 585-resource directory.
- `/academy/` — searchable ICT Academy index and retained lesson pages.
- `/tools/` — futures risk calculator and links to the preserved journal/checklist.
- `/account/` — Supabase sign-in and private workspace (journal, watchlists, lesson progress).
- `/ict-futures/` — original ICT Futures Intelligence OS 3.0.
- `/status/`, `/docs/`, `/legacy/` — system status, developer documentation and original research archive.

## Product navigation

The primary navigation is organized into 12 areas: Overview, Futures Markets, Volume & OI, News Intelligence, Macro Calendar, COT & Positioning, Prediction Markets, ICT Academy, Entry Models, Strategy Lab, Risk & Journal, and Sources & Data Health. The older `/markets/`, `/status/`, and `/ict-futures/` routes remain available as supporting catalogues and preserved experiences.

## v1.1.0 — Premium interface and release engineering

- A coordinated visual refresh improves the homepage and generated module pages with clearer typography, spacing, responsive layouts, focus states, restrained motion and more consistent components.
- The PWA manifest, package metadata, homepage release label and Service Worker cache namespace are aligned to version 1.1.0.
- A tag-triggered release workflow verifies that a `vX.Y.Z` tag matches `package.json`, runs the build and quality gates, then publishes GitHub release notes.
- Vercel production deployments are publicly accessible while Preview deployments retain SSO protection.
- See [release notes](docs/RELEASE-NOTES-v1.1.0.md) and the [release checklist](docs/RELEASE-CHECKLIST.md).

## Build and local preview

```bash
python3 scripts/build_site.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Without `SITE_URL`, the static build is intentionally `noindex` and `robots.txt` disallows crawling. Set `SITE_URL` to the final HTTPS production origin before building an indexable deployment.

Quality gates:

```bash
python3 -m unittest discover -s tests -v
python3 scripts/validate.py
python3 scripts/audit_internal_links.py
```

## Platform state (verified 10 November 2026)

| Platform | Verified state | Remaining setup |
|---|---|---|
| GitHub | Public repo `whizz444yt-ux/Finance-Intelligence-OS` on `main`; CI quality workflow is enabled. | Continue using the linked repository and protect production releases with CI status checks. |
| Vercel | `finance-intelligence-os` project is linked to GitHub; latest verified production deployment is `READY`; both public production aliases return HTTP 200. SSO protection is now limited to Preview deployments. | No custom domain is configured; the public `vercel.app` aliases are the current production URLs. |
| Supabase | Active healthy Mumbai (`ap-south-1`) project; 22 public tables have RLS enabled; security and health advisors return no findings. | Complete a real end-user signup, email confirmation and sign-in smoke test; verify Auth redirect URLs and email delivery. |
| Cloudflare | `finance-intelligence-os-edge` Worker is deployed (Worker version 13) with KV binding, a 30-minute Cron and production-origin CORS allow-list. | No Worker secrets are currently bound. Protected Supabase writes and BEA/EIA/FRED credential-backed ingestion remain inactive until secrets are configured. |
| Builder.io | Allow-listed content proxy code remains available. | A Builder Space public API key and read-only Admin PAT have not been configured. |

### Deployed Cloudflare API

`https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev`

Routes include `/health`, `/api/v1/providers`, `/api/v1/news`, `/api/v1/macro`, `/api/v1/cot?report=tff|disaggregated`, `/api/v1/macro/funding` (New York Fed SOFR/EFFR/overnight rates), `/api/v1/prediction/polymarket`, `/api/v1/prediction/kalshi`, and `/api/v1/cms/{model}`. Polymarket and Kalshi are read-only public event-market endpoints, cached at the edge. News refresh remains scheduled every 30 minutes; the frontend reload button fetches the latest cached snapshot rather than bypassing the provider cache. GDELT collection is scheduled every 30 minutes; BLS, CFTC and NY Fed snapshots are fetched on demand and cached. BEA, EIA, FRED, Treasury and ECB use dedicated provider adapters with provider-specific TTLs. A 30-minute Cron checks whether each provider is due and performs historical ingestion no more frequently than its configured freshness interval. This is not an exchange real-time price or order-book feed.

## Historical ingestion and Supabase persistence

- Economic provider observations are normalized into `economic_observations` with provider, dataset, series, frequency, observation date, unit, source URL, retrieved time, data-as-of time and raw provider attributes. Unique keys make historical upserts idempotent.
- `ingestion_runs` stores request count, rows received/upserted, timing, skipped/missing-credential events and failure details. It is private: RLS is enabled with an explicit deny policy for anon/authenticated roles and only the server-side service role may write/read run diagnostics.
- `GET /api/v1/economic/history` provides bounded historical reads from the persisted observation table, with optional series/date filters; the ingestion-run ledger remains private.
- `economic_observations` is browser-readable under a SELECT-only RLS policy. Browser roles cannot insert, update or delete; all ingestion writes run through the Worker.
- `POST /api/v1/ingest` accepts a provider or `all` and requires `Authorization: Bearer <INGEST_TOKEN>`. Never use a query-string token.
- BLS runs on API v1 without a key (25 queries/day); set the optional `BLS_API_KEY` Worker secret to use registered API v2 (500 queries/day). Its daily rate-limit response is cached until UTC midnight, and the Macro page's refresh button can retry after the key is configured.
- BEA, EIA and FRED require `BEA_API_KEY`, `EIA_API_KEY` and `FRED_API_KEY` Worker secrets respectively. Treasury Fiscal Data and ECB SDMX use public endpoints. Supabase writes additionally require `SUPABASE_URL` and the preferred `SUPABASE_SECRET_KEY` Worker secret (`sb_secret_...`); legacy `SUPABASE_SERVICE_ROLE_KEY` JWTs remain supported for backward compatibility.
- When a credential is absent or persistence is unavailable, provider and persistence statuses remain separate. Missing observations are never written as zero, and provider API keys are stripped from stored source URLs.

## Data and safety boundaries

- Supabase browser configuration uses only the public publishable key; no service-role key is in this repository.
- RLS is enabled on all 22 project public tables; user-owned rows are scoped to `auth.uid()`. Historical economic observations are read-only to browser roles; the ingestion-run ledger is private and server-role only.
- Fifteen imported contract specification rows are explicitly `unverified`; they must be reconciled with exchange documents before being treated as current.
- CFTC COT is a weekly trader-category report with distinct TFF and Disaggregated classifications; the desk normalizes these categories using the provider's report-specific fields. The Volume & OI module uses CFTC weekly open interest only; it does not label this as daily exchange volume; BLS, BEA, EIA, FRED, Treasury and ECB series are official historical macro observations; GDELT is a discovery index, not a complete licensed newswire.
- Builder CMS content is editorial content, not a source for market prices or issuer release facts.
- Real-time CME/ICE quotes, DOM/depth, licensed intraday history and redistribution rights are outside the free integration baseline.
- Polymarket/Kalshi event-market odds are venue probabilities, not futures prices, order flow or guaranteed forecasts; no wallet or order-placement endpoints are connected.
- The new Futures Desk is a research interface; it deliberately does not label delayed/snapshot public data as live exchange quotes.

See `docs/BUILD-REPORT.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION.md`, `docs/ENVIRONMENT.md` and `SECURITY.md`.

## P3 — ICT Academy learning program

- The Academy retains all 76 original concept IDs and seven original learning tracks. Every lesson now includes learning objectives, prerequisites, a guided walkthrough, hypothetical worked example, chart-replay assignment, completion checklist, review criteria and a three-option knowledge check.
- Nine guided tutorials cover market structure, liquidity mapping, sweep-versus-acceptance, FVG/imbalance measurement, dealing ranges/PD arrays, timezone/session planning, cross-market SMT, entry-model replay and supplemental-source audits.
- Standalone lessons are generated at the existing `/ict-futures/academy/{concept-id}.html` routes. Tutorial workbooks live at `/ict-futures/academy/tutorials/`.
- Progress saves locally and syncs to the signed-in user's Supabase `lesson_progress` row using the authenticated session and its user-owned RLS policy. Migration `20261108144106_add_lesson_progress_data` adds `progress_data` JSONB for exercise checklist state and `lesson_version` for curriculum versioning. No privileged client key is used in the browser.
- Direct original ICT video links are used only where the catalogue already marks the exact upload as verified. Other YouTube links remain labelled topic-discovery links; supplemental/community terminology remains source-cautioned.
- CME and CFTC material is linked for general futures mechanics and risk education, not represented as ICT certification or evidence of strategy performance.


## P4 — Reproducible Strategy Lab

- The /strategy-lab/ route now contains a browser-based deterministic futures signal backtester. Upload one timestamped OHLC series with causal LONG, SHORT or FLAT signals. The engine does not claim to generate or verify ICT signals; signal generation is an upstream, user-documented step.
- Required CSV columns: timestamp, open, high, low, close and signal. Timestamps require an explicit UTC offset or Z; rows must be strictly increasing; one contract/expiry is accepted per run. Optional stop_ticks, contract and volume are validated.
- Entry is next-bar open after a source-bar-close signal. One position at a time; fixed stop and reward/risk target; whole-contract risk sizing; max position cap; commission/slippage; stop-gap adverse fills; conservative stop-first same-bar ambiguity; limit targets without queue/partial-fill improvement; time and end-of-data exits.
- Results report gross and net P&L, net expectancy per trade, average net R, net profit factor, win rate, commissions, estimated slippage, bar-close mark-to-market max drawdown in USD/percent, underwater duration and full trade ledger.
- Chronological in-sample / validation / out-of-sample splits are computed independently, with capital reset per split. Keep the OOS segment untouched until the signal rule and parameters are frozen. Run fingerprints use the dataset SHA-256, engine version, full configuration and split policy.
- Download a JSON manifest and CSV trade ledger. The raw uploaded CSV stays in the browser. Local history stores summary/fingerprint; signed-in users can sync manifests/metrics and trade rows to private RLS-protected Supabase tables.
- Migration 20261108151112_add_strategy_backtest_runs_and_trades creates strategy_backtests and strategy_backtest_trades; both use user ownership policies and no browser service-role credential.
- The eight preserved ICT models remain playbook descriptions; they are not yet automatically converted into machine-testable setup detectors. No preloaded historical bars or performance ranking is fabricated. Tick values, commissions, expiry/roll methodology and market-data licensing must be supplied/verified for each dataset.

## P5 — Cloud personal workspace

- The /account/ page is now a private cloud workspace with trade journal CRUD, multiple named watchlists, research-note CRUD, alert rules and event history, account preferences, analytics, JSON backup export and cross-device refresh/sync.
- Auth sessions are persisted in browser local storage using the shared finance-os-supabase-session-v1 key and mirrored to session storage for the existing Academy and Strategy Lab clients. Expiring Supabase tokens are refreshed with the rotating refresh token; failed 401 requests get one refresh/retry.
- Cloud journal CRUD uses journal_trades. Analytics use closed records with user-entered net P&L and R-multiples; no broker statement or contract conversion is inferred. Net P&L defaults to gross P&L minus recorded fees only when the user leaves net P&L blank.
- Watchlists use watchlists and watchlist_items. Profiles store display name/timezone; user_preferences store theme/preferences. New research_notes store scenario/evidence/invalidation notes. alert_rules stores threshold rules; alert_events stores user-triggered event history.
- The explicit import action reads the older Global Research watchlist and scenario-note keys plus the ICT Futures browser trade journal. Research-note, watchlist-item and legacy-trade imports use stable identifiers/upsert constraints for retry safety. Local originals are not deleted.
- Migration 20261108161355_add_cloud_workspace_notes_and_alert_events adds owner-protected research_notes and alert_events. Migration 20261108161450_add_idempotent_legacy_trade_import adds journal_trades.legacy_id and a per-user unique constraint for retry-safe legacy trade import.
- Alerts sync rules and event history across devices. In this release, price rules are evaluated against a user-entered observed value; an optional browser notification can show while the site is open. Automated quote polling, unattended email/SMS and scheduled delivery are not connected because no verified licensed futures quote feed and background delivery service is configured.
- Analytics include closed-trade count, net realised P&L, win rate, net profit factor, average recorded R, a daily realised P&L chart and counts for watchlists, notes and alerts. These are manual-journal metrics, not broker-linked portfolio analytics.
- Cloud tables use owner-scoped RLS. Browser requests use the authenticated JWT and publishable key only; no service-role secret is sent to the page.
- Migration `20261108163000_add_workspace_composite_fk_indexes` adds covering indexes for alert-event and backtest-trade composite foreign keys.
