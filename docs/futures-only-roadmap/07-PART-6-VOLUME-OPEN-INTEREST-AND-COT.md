# Part 6 — Volume, Open Interest and COT Intelligence

**Goal:** Deliver a contract-aware futures participation and positioning dashboard that never confuses intraday exchange volume, exchange open interest and weekly CFTC reports.

## 1. Data definitions shown to users

- **Exchange volume:** number of contracts traded over a specified interval/period, sourced from an exchange or authorized vendor.
- **Open Interest (OI):** outstanding open futures contracts as reported for a particular contract/market and provider publication time. It is not the same as volume.
- **COT report:** CFTC weekly trader-positioning report with report-specific categories and reporting methodology.
- **TFF:** Traders in Financial Futures report with financial-market trader classifications.
- **Disaggregated:** report-specific categories such as Producer/Merchant, Swap Dealers, Managed Money and Other Reportables where applicable.
- **Legacy:** separate CFTC classification; do not merge with TFF/Disaggregated categories without explicit mapping.
- **Futures-only:** exclude options positions from the report view when the source offers a Futures Only variant. Do not label combined futures-and-options data as futures-only.

A weekly CFTC open-interest total is not intraday exchange OI and never a substitute for daily exchange volume. The source and frequency must always be visible.

## 2. Main dashboard modules

1. Contract overview: selected futures root, exchange, selected expiry/active contract, source and data class.
2. Volume: daily total, intraday interval bars, relative volume, session volume distribution, rolling averages and historical comparison.
3. Open Interest: latest published OI, change from prior observation, term structure by expiry, historical chart and report date.
4. COT positioning: report family, category, long, short, spreading where present, net, week-over-week change and percentage/normalization only where correctly defined.
5. Historical positioning: multi-year time series and optional COT index/percentile with explicit lookback/method.
6. Contract comparison: NQ vs ES, GC vs SI, 6E vs 6B etc only on matching timestamps, units and compatible contract scope.
7. Event context: release date, report date, source publication time and whether data refers to prior Tuesday.
8. Download/export: CSV with source, units, report family, expiry/contract scope, observation time and transformations.

## 3. CFTC ingestion and normalization

Use CFTC Public Reporting Environment / official COT downloadable data. Confirm each dataset's current API resource ID, field names, release schedule, schema and Futures Only selector before use.

Store source-native fields unchanged in raw archive. Normalized view contains:
- provider/report family (Legacy, TFF, Disaggregated).
- futures-only vs futures-and-options combined.
- market name and CFTC contract-market code.
- exchange/market identifier where available.
- report date (position as-of date, commonly previous Tuesday).
- publication timestamp/date (usually scheduled later; use actual release schedule).
- open interest.
- category positions: long, short, spreading (where present).
- changes from prior report (source fields or computed with exact previous observation).
- units/contracts and source URL.
- retrieval timestamp, schema version and data-as-of.
- missing/suppressed field reason rather than zero.

Do not map CFTC market names to 6E/NQ/GC by fuzzy text alone. Maintain a reviewed instrument mapping table with source-native market name/code, exchange, contract family, currency/unit and effective dates.

### Derived measures

- Net = long − short, computed only for comparable same-category data.
- Weekly change = current net − previous report net.
- Percentage of OI = category position / open interest × 100 only where category/report definition and denominator are compatible.
- COT percentile/index requires an explicitly selected lookback range, missing-data policy, methodology and date.
- Do not compute "smart money" score or directional trade signal from category name.

## 4. Exchange volume/OI ingestion

When an authorized exchange/vendor feed is available:
- Ingest per exchange instrument ID and listed contract month.
- Keep trade date and timestamp frequency (tick, 1-second, 1-minute, daily) explicit.
- Store volume unit (contracts, trades, lots) and bar construction method.
- Store OI official publication date/frequency, not synthetic intraday values unless vendor explicitly provides a defined intraday field.
- Keep full-size and micro contracts separate; do not add them together without an explicitly labelled equivalent-notional/contract conversion.
- Roll continuous series only with a reproducible roll schedule. Do not combine old/new month volume as if same instrument.
- Persist vendor schema, entitlement, source ID and licence restrictions.

## 5. Proposed normalized schema

```text
market_observations
  id, provider, venue, instrument_id, contract_month, exchange_instrument_id
  observation_type (trade_bar|volume|open_interest|quote)
  interval, observed_at, data_as_of, retrieved_at
  open, high, low, close, volume, open_interest, currency, unit
  delay_class, source_url, source_record_id, schema_version, quality_status

cot_reports
  id, provider, report_family, report_variant, market_code, market_name
  report_date, published_at, retrieved_at, open_interest
  raw_payload, source_url, schema_version

cot_positions
  report_id, trader_category, long_contracts, short_contracts, spreading_contracts
  long_change, short_change, net_contracts, net_change
  unit, source_field_mapping, missing_reason
```

Use unique constraints on provider + report variant + market code + report date and provider + instrument + expiry + observation type + interval + timestamp. Add indexes for instrument/time, report family/date and market code/date. Keep raw payloads immutable or versioned.

Before any migration, inspect existing Supabase tables and migrations; extend existing tables where possible. Additive migrations only, RLS for private administrative/user data, read-only public policies for allowed historical public data, server-only write for ingestion.

## 6. Visualizations

- Volume by session and time interval (selected session/timezone).
- Daily/weekly volume and relative-volume trend.
- OI history and change.
- OI by expiry (term structure).
- COT long/short/net history per report category.
- COT category percent-of-OI comparison.
- COT report release markers on price/volume charts.
- Contract comparison with matching expiry and data interval.
- Provider freshness and missing-data overlay.

Every chart needs title, instrument, expiry, unit, interval, source, last update, data-as-of and legend. Do not hide negative/zero/NA values or use a visual scale that exaggerates changes without disclosure.

## 7. UI states and guardrails

- CFTC report not released yet: show last report date, not today's invented value.
- Holiday delay: show scheduled/actual release date from CFTC.
- Exchange feed not configured: show weekly COT only; don't render empty volume graph with fake zeros.
- Provider lacks intraday OI: say "intraday OI unavailable from configured source".
- Different expiries: prevent direct compare or mark non-comparable.
- Micro vs mini: separate line unless normalization method is stated.
- Combined report vs futures only: distinct tabs/data sets; never aggregate.
- Revisions/corrections: preserve original release and corrected version where source supports it.

## 8. Implementation paths

Inspect/update:
- `cloudflare/src/index.js` existing CFTC routes and provider registry.
- CFTC adapter/module and mapping data.
- Existing `/volume-open-interest/` and `/research/positioning/` page builders/scripts.
- Existing Supabase `economic_observations`, COT/market schema and migrations.
- `scripts/build_site.py`, `scripts/validate.py`, tests.
- Provider register, Data Health, README and architecture.

Do not call the module "live OI" unless the exact configured provider delivers that frequency and licence.

## 9. Acceptance criteria

- [ ] TFF, Disaggregated and Futures Only / Combined variants are distinguished correctly.
- [ ] CFTC field/category mapping is report-specific and source-native fields are retained.
- [ ] Position date and publication date are separate.
- [ ] COT report date/holiday delay follows CFTC schedule.
- [ ] Intraday/daily exchange volume uses a separately verified exchange/vendor feed.
- [ ] Daily/intraday OI is only shown if provider actually supplies it.
- [ ] Contract mapping and expiry are explicit.
- [ ] Derived net/percentile calculations are tested and documented.
- [ ] All charts show unit/source/frequency/freshness.
- [ ] Missing data is not zero; stale snapshots are not labelled live.
- [ ] Database policies, indexes, idempotency and export are tested.

## 10. Part-specific execution prompt

> Execute Part 6 only. Audit current CFTC adapter, dataset IDs, report schema, Supabase tables and existing Volume & OI pages. Verify TFF/Disaggregated/Futures Only variants from official CFTC source and record position date vs publication date. Implement robust market-code mapping and tested category normalization. Keep weekly CFTC open interest separate from exchange daily/intraday volume. Add volume/OI only through an authorized verified provider; otherwise show honest unavailable states. Add visualizations, export and tests. Do not create a COT-based guaranteed signal or start automatic ICT detector work.

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
