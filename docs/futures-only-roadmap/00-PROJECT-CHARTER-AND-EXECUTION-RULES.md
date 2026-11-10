# Project Charter and Global Execution Rules

## 1. Product mission

Build one premium, clear, futures-only research and education platform. A trader should be able to move from a futures contract's specifications and session context to the relevant ICT concepts, news, positioning, data sources, replay/backtest and personal risk/journal workflow without leaving the platform.

The product is a research and education tool, not a broker, exchange, signal-selling service, order execution system or promise of profitability.

## 2. In-scope instruments

The initial universe is the 15 families from the ICT Futures Playbook:

- Equity index: NQ/MNQ, ES/MES, YM/MYM, RTY/M2K.
- Metals: GC/MGC and SI/SIL.
- Energy: CL/MCL.
- Currency futures: 6E/M6E, 6B/M6B, 6J, 6A, 6C.
- Context futures: DX and ZN.
- CME Bitcoin futures: BTC/MBT.

Tier 1/Tier 2/Tier 3 are the playbook's workflow tiers, not verified profitability rankings. A future release may add other exchange-traded futures families only through a documented scope review and verified official contract metadata.

## 3. Explicitly out of scope for the active product

General stock/equity research and screeners; spot-only crypto trading dashboards; generic Forex spot/CFD education; prediction-market trading; betting odds; generic personal finance; unrelated resource directories; broker execution/order placement; unlicensed exchange data redistribution; unverified claims that one ICT setup is objectively the best.

Do not remove a futures contract merely because its underlying market also has a spot or cash equivalent. For example 6E/6B are currency futures and BTC/MBT are CME futures and remain included.

## 4. Existing technical baseline — preserve unless audit proves otherwise

- Static HTML/JavaScript and JSON content model.
- `scripts/build_site.py` builds published pages into `dist/`.
- `scripts/build_academy.py` generates Academy lesson pages.
- `cloudflare/src/index.js` is the API gateway; `cloudflare/src/economic-providers.js` contains economic provider adapters.
- Cloudflare KV binding and scheduled Worker Cron are already present.
- Supabase migrations, RLS-protected user data and historical economic schema already exist.
- `ict-futures/` includes legacy/preserved terminal, contract pages, Academy, session tools and datasets.
- `tests/`, `scripts/validate.py` and `scripts/audit_internal_links.py` form current quality checks.
- `vercel.json` publishes the static build from `dist/`.

Do not introduce React/Next.js, a second API framework, another database, a second CMS or a VPS just for fashion. A migration is allowed only after written proof that the current implementation cannot meet a specific requirement, with a reversible migration plan.

## 5. Standard work packet required for every part

Each implementation submission must contain:

1. Current repository audit with exact paths and facts.
2. Scope confirmation: what this part changes and what it must not touch.
3. Proposed data model/API/UI changes.
4. File-by-file implementation plan.
5. Security, licensing, accessibility, mobile and failure-state review.
6. Implementation on a feature branch.
7. Build, unit, structural/security and link-audit results.
8. Manual route/API smoke-test evidence.
9. Screenshot(s) or concise visual evidence for UI changes.
10. Git diff summary, changed-file list, known limitations and handoff to the next part.

A generated answer or code snippet is not completion evidence. Do not say a test passed unless it was executed and the result was observed.

## 6. Work isolation rules

When a user provides one Part document, execute that Part only. Do not opportunistically implement future Parts. You may make a minimal prerequisite repair only if the selected Part cannot work without it; explain and separately identify that repair.

Never delete or rename files before finding all imports, links, builder references, tests, service-worker precache entries, sitemap entries, route references and database dependencies. Prefer deprecation/route removal and archival before permanent deletion.

Do not edit the same file through parallel GitHub writes. Do not create multiple competing versions of the same content. Use one branch, one coherent PR/commit group, and test the exact resulting tree.

## 7. Required labels

- `SOURCED`: exact primary or credible source URL is attached and the date/version is recorded.
- `CONVENTION`: practitioner convention or documented synthesis, not a proven rule.
- `NO DATA`: evidence needed to validate the claim is not available.
- `UNVERIFIED`: source or current validity has not yet been checked.
- `DELAYED`, `HISTORICAL`, `WEEKLY`, `DAILY`, `CACHED`, `REAL-TIME`: explicit data class; never interchangeable.
- `NOT CONFIGURED`: required credential, subscription or secret is missing.
- `STALE`, `PARTIAL`, `UNAVAILABLE`: provider-health states with timestamps and error detail.

## 8. Product-wide data quality contract

Every normalized market/economic/news observation should carry provider/source identity, provider ID, instrument/contract/expiry where relevant, exchange, event/published timestamp, retrieval timestamp, data-as-of timestamp, timezone, frequency, delay class, units, currency, adjustment/roll policy, quality status and licence/display restrictions where known.

Do not turn missing data into zero. Do not silently carry forward a stale value as current. Do not combine different expiries into an SMT or volume comparison without a labelled contract mapping. Do not merge spot, CFD, continuous synthetic and listed futures series.

## 9. Global security contract

- No provider/API/ingestion token, Supabase secret/service-role key, private Builder token or broker secret in browser code or Git.
- Browser Supabase access uses publishable/anon key and RLS only.
- All user-owned rows must have owner checks against `auth.uid()`.
- Worker CORS must be exact-origin allowlisted.
- Protected ingestion uses an Authorization bearer header, not a query-string secret.
- Validate query parameters, body size, symbol allowlists, date ranges, pagination and provider timeouts.
- Log status, request ID and safe diagnostics; never log secret values or full private payloads.
- Use least privilege and read-only provider credentials wherever possible.

## 10. Standard ChatGPT execution prompt

Use this template with the selected Part file:

> Read this Part document and the project charter completely. Work only on this Part in repository `whizz444yt-ux/Finance-Intelligence-OS`. First inspect the current main/target branch and all related source paths; do not trust the document's path assumptions without verifying them. Report the exact baseline and a file-by-file plan. Implement the full in-scope work without rewriting unrelated modules. Preserve existing user data and useful futures/ICT features. Do not invent values, provider functionality, credentials, licenses or performance. Add/update tests and docs. Run the repository's build, unit tests, structural/security validator and internal-link audit; inspect generated output and test all affected routes/API states. Fix failures caused by your changes. Do not claim completion if any required check was not run. Return the changed-file list, diff summary, executed test evidence, manual checks, outstanding configuration/licensing needs and the Part's acceptance checklist. Stop after this Part.

