# Part 0 — Baseline Audit and Route Classification

**Baseline:** `main` at `1416e378a65b871a43537871852fea4b29720412` (10 November 2026).  
**Scope:** Part 0 only. This route map is recorded before application-source edits.  
**Product target:** Futures Intelligence OS — exchange-listed futures research and ICT Futures education.

## Audit conclusion

The active site is not yet futures-only. The builder exposes the previous Global Research homepage, a 585-entry global resources catalogue, a 73-record generic cross-asset universe and Polymarket/Kalshi routes/UI. The Futures Desk and ICT Futures sub-site also contain prediction-market sections. The core 15-family futures universe and 76-lesson Academy are separate from those generic datasets and can be retained.

Verified baseline data inventory:

| Dataset | Baseline count | Part 0 treatment |
|---|---:|---|
| `ict-futures/data/market-universe.json` | 15 futures families | Keep active |
| `ict-futures/data/ict-academy.json` | 76 concepts; 9 tutorials | Keep active; preserve IDs |
| `ict-futures/data/source-directory.json` | 52 source records | Archive original; filter active view |
| `ict-futures/resources.json` | 52 source records | Archive original; filter active view |
| Root `resources.json` | 585 general sources | Archive unchanged; replace active view |
| `data/market-universe.json` | 73 generic instruments | Archive; do not publish as futures |
| `data/social-analysis-methods.json` | General cross-asset methods | Archive |

No imported contract specification is promoted from unverified to verified by this task.

## File and component disposition

### Keep active

| Path | Purpose / decision |
|---|---|
| `futures-intelligence/index.html`, `assets/futures-intelligence.js`, `assets/futures-intelligence.css` | Keep the Futures Desk; remove prediction-market UI and consumers; retain contract selector, CFTC, macro, funding and news context. |
| `ict-futures/index.html` | Keep ICT Futures terminal, sessions, calendar, news, institutional positioning, risk, journal and learning; remove Predictions section/consumers and unrelated issuer-security presentation. |
| `ict-futures/data/market-universe.json`, `ict-futures/markets/*.html` | Keep 15 futures families and every profile route, including listed currency futures and CME BTC/MBT family. |
| `ict-futures/data/ict-academy.json`, `ict-futures/academy/*.html`, `ict-futures/academy/tutorials/` | Keep 76 concept IDs, generated lesson routes and nine tutorials. |
| `ict-futures/data/ict-playbook.json`, `ict-futures/data/news-queries.json`, `ict-futures/data/news-snapshot.json` | Keep futures/ICT research material and queries. |
| `assets/academy-*`, `assets/cot-page.js`, `assets/volume-open-interest.js`, `assets/macro-page.js`, `assets/economic-data.js`, `assets/news-page.js` | Keep Academy, CFTC weekly futures positioning/OI, official macro and news clients. |
| `assets/strategy-lab.js`, `assets/strategy-lab.css`, `assets/strategy-backtest-engine.mjs`, `assets/risk-calculator.js` | Keep deterministic signal-driven backtesting and futures risk tools; do not imply automatic ICT signal generation. |
| `assets/account.js`, `assets/data-health.js`, `assets/runtime-config.js`, `assets/site-shell.js`, `assets/site-shell.css` | Keep private workspace, data health, safe runtime configuration and shell; Data Health should test only relevant futures providers. |
| `cloudflare/src/index.js`, `cloudflare/src/economic-providers.js`, `cloudflare/wrangler.toml` | Keep shared Worker, KV, GDELT and macro adapters. Leave prediction API code dormant in this Part; remove active frontend consumers first. |
| `supabase/setup.sql`, `supabase/migrations/*.sql`, `supabase/seed-source-registry.sql`, `supabase/seed-legacy-contract-specs.sql` | Keep unchanged. No user rows, tables, Auth, RLS or progress data are deleted or migrated. |
| `scripts/build_academy.py`, `tests/*`, `.github/workflows/*`, `vercel.json`, `package.json`, `.env.example`, `SECURITY.md` | Keep pipeline/security/deployment, update relevant build assertions and product metadata only. |

### Remove from active product (retain source where applicable)

| Active surface | Decision |
|---|---|
| Root `index.html` Global Research cockpit | Save unchanged under `legacy/global-research/`; replace active root output with Futures Command Center shell. |
| Generic `/markets/` cards sourced from `data/market-universe.json` | Remove; show exactly the 15 futures families only. |
| `/research/` general 585-record catalogue | Replace with compatibility redirect to `/sources/`; new public sources view uses reviewed futures-only allowlist. |
| `/prediction-markets/` generated page | Stop generating; compatibility redirect to `/`; exclude from sitemap. |
| Prediction sections in `futures-intelligence/index.html` and `ict-futures/index.html` | Remove. |
| Prediction client functions/listeners in `assets/futures-intelligence.js` and Data Health endpoint cards | Remove active API calls and provider cards. |
| `assets/prediction-markets.js` | Exclude from public build; retain tracked source. |
| Public `/legacy/` index and archive copy in `dist/` | Stop publishing; Git legacy tree remains recoverable. |
| General stock/equity, spot FX, spot crypto, cash-index directory and SEC issuer links | Exclude from active navigation/search/resources. CME/ICE listed futures, currency futures and CME BTC/MBT remain. |

### Archive exact baselines

Save the existing versions before replacing active resource data or page sources:

- `index.html` → `legacy/global-research/index.html`
- `resources.json` → `legacy/global-research/resources.json`
- `data/market-universe.json` → `legacy/global-research/data/market-universe.json`
- `data/social-analysis-methods.json` → `legacy/global-research/data/social-analysis-methods.json`
- `ict-futures/data/source-directory.json` → `legacy/global-research/ict-source-directory-unfiltered.json`
- `ict-futures/resources.json` → `legacy/global-research/ict-resources-unfiltered.json`
- `assets/prediction-markets.js` → `legacy/global-research/assets/prediction-markets.js`
- Preserve existing `legacy/previous-markdown/`, `legacy/source-baselines/` and `legacy/source-notes/` unchanged.

Repository archives must not be copied into `dist/`.

## Active route allowlist

| Class | Route | Purpose / owner | Acceptance |
|---|---|---|---|
| core-futures | `/` | Futures Command Center; `scripts/build_site.py` | Futures-only copy, links and metadata |
| core-futures | `/futures-intelligence/` | 15-family research desk; copied from `futures-intelligence/index.html` | No prediction UI/API calls |
| core-futures | `/markets/` | Fifteen-family futures catalogue; generated from ICT universe | Exactly 15; no generic instruments |
| core-futures | `/ict-futures/markets/{id}.html` | Individual family pages | All 15 resolve |
| ict-learning | `/ict-futures/` | ICT Futures terminal | No Predictions section; sessions, Academy, risk/journal intact |
| ict-learning | `/academy/` | Searchable Academy index | 76 concepts, nine tutorials |
| ict-learning | `/ict-futures/academy/{concept-id}.html` | Stable lesson route | All 76 IDs resolve |
| ict-learning | `/ict-futures/academy/tutorials/`, `.../{id}.html` | Tutorials | Index and nine tutorials resolve |
| ict-learning | `/entry-models/` | Eight educational models | No unsupported performance ranking |
| futures-news | `/news/` | GDELT futures news discovery | Futures query/caveats |
| futures-macro | `/macro/` | BLS/BEA/EIA/FRED/Treasury/ECB historical observations | No false live/calendar claim |
| futures-positioning | `/research/positioning/` | CFTC TFF/Disaggregated futures-only | Weekly semantics retained |
| futures-positioning | `/volume-open-interest/` | CFTC weekly OI | Never label COT as daily volume |
| futures-backtest | `/strategy-lab/` | Deterministic signal backtester | Existing engine tests pass |
| private-workspace | `/tools/`, `/account/` | Futures risk tools and Supabase workspace | User data and Auth unchanged |
| private-workspace | `/data-health/` | Relevant provider health | No event-market providers |
| core-futures | `/sources/` | Reviewed futures-only source directory | No Prediction Markets, issuer/equity, spot FX or spot crypto records |
| archive-only | `/docs/`, `/status/` | Operator/developer documentation | Internal links resolve |
| removed-from-active | `/research/` | Compatibility redirect to `/sources/` | No generic directory payload |
| removed-from-active | `/prediction-markets/` | Compatibility redirect to `/` | No page data/UI/sitemap entry |
| removed-from-active | `/legacy/` | Repository-only archives | Not emitted into `dist/` |

API routes are not page routes. The Worker prediction APIs remain dormant for compatibility in Part 0; no active frontend module will call them.

## Dependency and safety decisions

- `data/market-universe.json` feeds generic Global Research cards only. Futures Desk and ICT terminal load `/ict-futures/data/market-universe.json`; preserve that 15-record source.
- Prediction UI consumers: generated `/prediction-markets/` + `assets/prediction-markets.js`; `futures-intelligence/index.html` + `assets/futures-intelligence.js`; `ict-futures/index.html`; Polymarket/Kalshi checks in `assets/data-health.js`. Remove active consumers.
- Keep Worker API implementation dormant until all consumers and compatibility dependencies are reviewed in a later authorized change.
- Leave all Supabase schema/data, user-owned rows, browser local storage keys and imports untouched.
- Do not edit `dist/` directly. Do not verify or alter contract specs, expiries, pricing, provider licensing, macro values or strategy performance in Part 0.
- Missing secrets/licenses remain explicitly not configured; no credentials are added.

## Part 0 stop condition

Archive baselines; build the futures-only homepage/nav/resources/routes; remove active event-market UI and generic instrument listings; update sitemap/service worker/docs/tests; run the build, unit tests, validator, strategy engine tests and internal-link audit. Stop before any Part 1 visual redesign, Academy expansion, provider onboarding, contract-spec verification, backtester changes or Supabase changes.
