# Part 5 — Futures News and Data Gateway

**Goal:** Build one secure, source-aware Cloudflare gateway for futures news, official macro releases and licensed futures market data. Keep news discovery, economic observations and exchange prices as distinct data products.

## 1. Target architecture

```text
Static browser pages on Vercel
  └─ Cloudflare Worker API gateway
       ├─ Provider adapters (one adapter/provider)
       ├─ Rate-limit, timeout, retry/backoff and circuit-breaker policy
       ├─ Cloudflare KV snapshots (cache/fallback, not historical database)
       ├─ Supabase server-side persistence (only for normalized long-term records)
       ├─ News classifier and source registry
       └─ Provider/Data Health status
Data sources:
  GDELT / approved RSS / official agency feeds / CFTC / official macro APIs
  Licensed exchange data vendor or exchange direct feed for market prices/volume/DOM
```

Preserve the current Worker gateway and route conventions. Before editing, inspect current Worker version, route list, bindings and deployed secret configuration; repository documentation and deployed Worker version may not match.

## 2. Existing provider baseline to verify

The current repository contains:
- GDELT DOC news discovery snapshot.
- BLS historical series.
- CFTC weekly reports.
- NY Fed SOFR/EFFR reference rates.
- BEA NIPA, EIA weekly crude-oil stocks, FRED histories, Treasury Fiscal Data and ECB reference series adapters.
- Worker provider status, KV cache and ingestion hooks.
- Optional Builder content proxy (editorial content only, not market facts).

Do not assume any provider is live/connected because source code exists. For every provider independently test: endpoint response, credentials, last successful retrieval, data-as-of, cache age, schema validity, persistence status and error state. Do not claim historical writes are working until an actual Supabase ingestion run and resulting rows are verified.

## 3. Futures news aggregation

### News categories

- Equity-index futures: Fed, CPI, PCE, NFP, GDP, Treasury yields, rates, large-cap earnings as contextual events.
- Metals: real yields, dollar, central-bank activity, geopolitical headlines, physical supply/demand.
- Energy: EIA/API inventories, OPEC, production, outages, weather, refinery activity, geopolitics.
- Currency futures: central-bank decisions, rate expectations, inflation, employment, GDP and FX macro.
- Treasury futures: FOMC, auctions, yield curve, inflation and policy expectations.
- CME Bitcoin futures: ETF flows, regulation, CME product/market notices, risk sentiment. Spot-crypto articles are context only and must be labelled as such.

### Source registry

Each publisher/source entry contains: source_id, publisher, canonical URL, category, instrument tags, official/secondary/community classification, country, content type (RSS/API/web page), access method, terms/licence URL, attribution requirement, polling interval, enabled state, last checked, parser version and known limitations.

Prioritize official agency/exchange sources and publisher RSS/API feeds where permitted. GDELT is a discovery index; it is not a complete newswire, and indexing a Reuters/Bloomberg URL does not grant republication rights. Use headlines/excerpts within allowed terms, link to the original publisher and do not circumvent paywalls, login or anti-bot controls. Community/social links can be a curated directory; do not claim broad X/Discord/Telegram ingestion without official authorized access.

### Headline classification

Normalize:
- headline, short licensed summary/excerpt if permitted, publisher, canonical URL, published_at, event_at, retrieved_at, provider ID, language, topic tags, instrument family tags, relevance score (algorithmic), sentiment only if supported and clearly labelled, verification status and duplicate/canonical cluster ID.

Classification rules should be inspectable: keyword/entity mapping, event category, instrument tags, publisher tier, time window, duplicate similarity and confidence. Do not present model sentiment as fact or trading direction. A headline can impact multiple contracts; allow tags rather than forcing one symbol.

### News user experience

- Filter by contract family, event type, publisher and time.
- Sort by publisher time, not retrieval time.
- Display both published time and fetched time.
- Clearly mark stale/cached snapshots.
- Deduplicate repeated syndicated stories but preserve publisher attribution.
- Show "Open original" external link; no fake full story text.
- Store a bounded archive in line with licence/retention terms.
- Provide an official-source directory separately from news discovery.

## 4. Data classes and API product separation

Never mix these as one "live market" feed:
1. Official macro/economic observations (daily/monthly/quarterly/weekly).
2. CFTC positioning and COT (weekly).
3. News discovery/headlines (event/publisher time, polling interval).
4. Exchange price/quote data (trade/BBO/level 2/level 3/aggregate bars).
5. Exchange volume and open interest (provider-specific frequency and contract scope).
6. Reference rates/spot context (not listed futures prices).

The API response must declare `data_type`, `frequency`, `delay_class`, `source_provider`, `source_url`, `data_as_of`, `retrieved_at`, `cache_age_seconds`, `status`, `licence_display_class` and `limitations`.

## 5. Recommended route contract

Keep existing route names stable where possible; extend versioned API:
- `GET /api/v1/health`
- `GET /api/v1/providers`
- `GET /api/v1/news?instrument=NQ&topic=macro&limit=...`
- `GET /api/v1/news/sources`
- `GET /api/v1/events` (if separate event API is introduced)
- `GET /api/v1/macro` and `GET /api/v1/economic/{provider}`
- `GET /api/v1/cot?report=tff|disaggregated`
- `GET /api/v1/market-data/status`
- `GET /api/v1/market-data/bars?... ` only when a licensed provider is configured.
- `POST /api/v1/ingest` protected by bearer token for server/administrator use only.

Validate supported instrument IDs, allowed query filters, date bounds, sort fields, page size and body size. Use consistent HTTP status codes and JSON error schema. Public GET routes must never expose credentials or private ingestion logs.

## 6. Cloudflare Worker implementation

Inspect/update:
- `cloudflare/src/index.js` route dispatch, CORS, provider registry, auth for ingest and health.
- `cloudflare/src/economic-providers.js` provider-specific normalization and source metadata.
- `cloudflare/wrangler.toml` Worker name, KV binding, Cron, environment variables and allowed origins.
- Add small adapter modules under `cloudflare/src/providers/` or existing structure, one provider per module.
- Tests for parsers/normalizers, retries, timeouts, rate limits, pagination and stale behavior.
- README, architecture and environment docs.

Implement per-provider timeout, bounded concurrency, retry only transient 429/5xx/network errors, exponential backoff with jitter, Retry-After support, circuit breaker and cache fallback. Never retry authentication/invalid query errors repeatedly. Keep one provider failing from making all routes fail.

Cron cadence should respect each provider's actual release frequency and rate limit. A 30-minute trigger may check whether a provider is due; it must not query every source every 30 minutes. Use queue/lock/idempotency where appropriate and store provider state independently.

## 7. Secrets and Supabase ingestion

- Keep BLS/BEA/EIA/FRED keys, ingest token, Supabase secret key and optional vendor keys as Cloudflare Worker secrets.
- Keep only public Supabase URL and publishable/anon key in frontend runtime configuration.
- Ingestion uses an Authorization bearer header; do not use query-string token.
- Normalize units and date frequencies without silently rescaling values.
- Upsert idempotently using provider + dataset + series + frequency + observation_date or provider-defined ID.
- Keep raw provider attributes for audit but remove API credentials from saved source URLs.
- Store ingestion run ID, started/finished, requests, rows fetched/upserted, skipped, errors and last successful data-as-of in private diagnostics.

## 8. Free vs paid reality

Free baseline suitable for historical macro/event/news discovery does not equal free live exchange data.

- CFTC/BLS/BEA/EIA/FRED/Treasury/ECB/NY Fed provide public or registered-key economic/positioning/reference data with their own limits and usage terms.
- GDELT/RSS supports discovery subject to source terms, refresh limits and incomplete coverage.
- TradingView widgets can provide hosted chart/market widgets where supported; they are not a replacement for a controllable raw exchange API, own OHLC database or Pine/strategy execution engine. Check each symbol's data level and terms.
- Databento can provide historical and live futures schemas subject to chosen dataset, subscription, entitlement and licence tier. Its public pricing may change; a Standard plan is not automatically an external public redistribution right. Verify external distribution licensing before showing data to all website visitors.
- CME/ICE direct market data requires the appropriate exchange licensing, subscriber/device reporting and fee review. Do not assume embedding a vendor chart eliminates data licensing obligations.

## 9. Data Health and provider status

Every provider card reports:
- Configured/not configured.
- Last attempt and last success.
- Provider published time / data-as-of.
- Retrieved time and snapshot age.
- Frequency and delay.
- Last error and retry-after if safe to expose.
- Persistence connected/disabled.
- Current plan/limit/licence note.
- Sample endpoint status.
- Historical range and pagination state.

Use provider-specific statuses: `fresh`, `partial`, `stale`, `unavailable`, `not-configured`, `rate-limited`, `license-required`, `not-supported`. Do not call the entire dashboard green because one source responds.

## 10. Acceptance criteria

- [ ] Every provider has been called and independently verified in the active environment.
- [ ] Each API source is clearly labelled with frequency, delay, timestamps and licence class.
- [ ] Futures news categories and contract tagging work.
- [ ] Original publisher links and attribution are correct.
- [ ] GDELT/RSS discovery is not described as complete live newswire.
- [ ] Provider timeouts, 429, 5xx, bad JSON, missing credentials and stale cache states are tested.
- [ ] Supabase ingestion writes are proven with a real run and idempotent retry.
- [ ] No secret appears in Git, browser bundle, API response, URL or log.
- [ ] Licensed exchange market data remains disabled until entitlement and public display permission are verified.
- [ ] Build, route, provider and security tests pass.

## 11. Part-specific execution prompt

> Execute Part 5 only. Audit the deployed Cloudflare Worker and current repo adapter source first; source files and production secrets may differ. Verify each data provider with live endpoint results, timestamps and persisted observations, not README claims. Build source-attributed futures news classification and versioned provider contracts. Preserve economic frequency and data classes. Configure no secret without the user supplying/authorizing it. Do not scrape restricted sources, bypass paywalls or redistribute exchange data without written licensing validation. Add error/retry/cache/rate-limit tests and Data Health evidence. Stop after the news and gateway module is independently validated.

## Standalone handoff context — use this file by itself

**Repository:** https://github.com/whizz444yt-ux/Finance-Intelligence-OS  
**Product:** Futures Intelligence OS — futures-only markets, ICT futures education, futures news/data, positioning, backtesting, risk and trader workspace.  
**Architecture to inspect and preserve:** static HTML/JavaScript/JSON; Python build at `scripts/build_site.py`; Cloudflare Worker at `cloudflare/src/index.js` with KV; Supabase Postgres/Auth/RLS; Vercel static output `dist/`; GitHub Actions and tests. This is a baseline, not proof each service/credential is currently healthy.

**When this single Part file is the only document supplied:** treat it as the complete request to execute this Part. The user should not need to repeat the repository URL, product purpose or stack. Apply these global rules:
- Execute only the Part named in this file; do not implement another Part.
- Inspect current branch, commit, relevant source, dependencies and runtime first. Actual repo/runtime overrides stale documentation.
- Preserve futures modules, ICT lesson IDs, user data, Auth/RLS, build system and legacy backups. Do not blindly delete/rewrite.
- Futures-only includes CME/ICE listed futures, including currency futures and CME Bitcoin futures. Exclude unrelated equities, generic spot crypto, generic FX/CFD, prediction markets and other non-futures product areas only after dependency audit.
- Never invent prices, volume/OI, specs, expiry, schedules, prop rules, provider capability, licences, API limits or strategy performance.
- Separate real-time, delayed, historical, weekly, cached and unavailable data; display source, frequency and timestamps.
- Keep secrets out of Git/browser; use platform secret stores. Make DB migrations additive; preserve production data. No destructive action without approval.
- Edit canonical source/builders, not generated `dist/`. Use a focused feature branch and reviewable PR, not direct destructive pushes to main.
- Run build, unit tests, structural/security validator and internal-link audit where applicable; add tests and report commands that could not run.
- Verify changed routes/API states, mobile/accessibility, provider freshness/licensing, or RLS according to the Part.
- Complete unblocked work; missing credentials/licenses remain explicitly `NOT CONFIGURED`.
- Never claim a test, deployment or completion without observed evidence.

**Execution:** Read this file fully, inspect the repository and execute only the named Part. Return changed paths, test commands/results, branch/commit/PR, blockers and acceptance checklist. Stop after this Part.
