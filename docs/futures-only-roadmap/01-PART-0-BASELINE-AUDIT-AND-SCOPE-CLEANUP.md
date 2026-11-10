# Part 0 — Baseline Audit and Futures-Only Scope Cleanup

**Goal:** Convert the active product scope from a general Finance Intelligence workspace to a Futures & ICT Futures Intelligence product without destroying useful existing work.

## 1. Outcome

A new visitor sees only futures trading/research and ICT futures education in primary navigation, search, generated pages, sitemap, homepage cards, resources and metadata. The old unrelated research is preserved in an archive unless a separate deletion approval is supplied.

## 2. Keep

- ICT Futures terminal and all 15 existing futures family pages.
- 76 existing ICT concept IDs and nine tutorials (verify actual count/routes before claiming).
- Entry models and ICT source catalogue.
- Futures contracts, futures risk tools, sessions and calendar.
- GDELT/futures news adapter and official macro event/data adapters.
- CFTC TFF/Disaggregated weekly positioning.
- Strategy Lab and deterministic backtester.
- Supabase Auth, journal, watchlists, notes, alerts and lesson progress.
- Provider registry, Data Health and source directory records that relate to futures.
- GitHub Actions, build pipeline, tests, security headers, deployment configs.

## 3. Remove from active product (not necessarily delete from Git)

- General Global Research cockpit as the active home page.
- Stock/equity screeners, issuer profile/research pages and equity-specific nav.
- General non-futures crypto dashboard; preserve CME BTC/MBT futures.
- Prediction Markets/Polymarket/Kalshi product pages and UI.
- Spot FX/CFD trading-specific pages, symbols, claims and calculators.
- Generic 73-instrument directory and unrelated resource-directory entries.
- Any generic finance landing pages, empty demo cards, duplicate tools and dead links unrelated to listed futures.

If an existing common source entry includes both futures and unrelated instruments, filter by a reviewed allowlist rather than deleting the shared source data wholesale.

## 4. Repository audit before edits

Inspect at minimum:

- `README.md`, `package.json`, `vercel.json`, `resources.json`, `index.html`.
- `scripts/build_site.py`, `scripts/build_academy.py`, `scripts/validate.py`, `scripts/audit_internal_links.py`.
- `futures-intelligence/`, `ict-futures/`, `data/`, `assets/`, `legacy/`, `docs/`.
- `cloudflare/src/index.js`, `cloudflare/src/economic-providers.js`, `cloudflare/wrangler.toml`.
- `supabase/migrations/`, `supabase/setup.sql`, `tests/`.
- `.github/workflows/`, service worker, manifest, sitemap and robots generation.

Run repository tree/path inventory and search all references for route names, nav labels, prediction market APIs, equities, spot FX, unrelated symbols, data asset IDs and service worker cache entries. Distinguish actual production code from archived files, docs and build output.

## 5. File-level change plan

| Path | Required work |
|---|---|
| `scripts/build_site.py` | Replace generic primary nav with futures-only nav; update homepage builder; stop generating unrelated routes; filter sitemap/search/resource listings; keep futures routes. |
| `index.html` | If it is the maintained homepage source, replace Global Research presentation with Futures Command Center. If generated from another builder function, edit source function only. |
| `resources.json` | Build an explicit futures-relevant resource view; archive the original unfiltered catalogue first. |
| `futures-intelligence/` | Reconcile this existing desk with the primary futures application; do not duplicate equivalent modules. |
| `ict-futures/` | Retain source and working routes; link them from the new product IA; consolidate later only with route/redirect tests. |
| `scripts/validate.py` | Add futures-only route/nav assertions and forbidden active-route assertions without banning archived words. |
| `scripts/audit_internal_links.py` | Ensure active routes resolve; allow archived content to remain unlinked from production nav. |
| `README.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION.md` | Update product mission, route map, providers and out-of-scope items. |
| `sw.js`, sitemap/robots generation | Remove stale precache/index references; version cache only when build output or assets change. |
| `tests/` | Add assertions for futures route presence, excluded product routes, legacy preservation and link integrity. |
| `legacy/` | Move/copy prior non-futures docs/data here only when needed; never overwrite existing source baselines. |

Use the real source path discovered during the audit if the repository has moved a builder or generated page. Never edit `dist/` directly; it is generated output.

## 6. Data and route classification

Build a route allowlist with explicit categories: `core-futures`, `ict-learning`, `futures-news`, `futures-macro`, `futures-positioning`, `futures-backtest`, `private-workspace`, `archive-only`, `removed-from-active`.

Every route must have a title, purpose, owner/module, source builder and test. Do not treat an API route as a page route. API endpoints for prediction markets should be disabled from active frontend use; remove worker code only after confirming no other module consumes it.

## 7. Safety checks before removal

For every candidate:
1. Find all references (imports, href/src, fetch URL, nav, sitemap, robots, service worker, test, docs, Supabase tables).
2. Identify whether it contains reusable futures code.
3. Decide: retain, refactor, hide from active routes, archive or delete.
4. If it stores user data, do not drop tables or rows as part of route cleanup.
5. Confirm the removal does not break Auth, journal, Academy, backtests or risk tools.
6. Preserve a reversible commit.

## 8. Acceptance criteria

- [ ] Homepage is a futures command center, not Global Research.
- [ ] Every primary navigation item is futures/ICT-futures related.
- [ ] No equity screeners, generic crypto dashboards, prediction markets or spot-FX pages appear in active navigation/search/sitemap.
- [ ] CME currency futures and BTC futures remain visible.
- [ ] All 15 futures families remain accessible.
- [ ] ICT Academy, tutorials, entry models and journal still work.
- [ ] No existing Supabase user data is deleted.
- [ ] Legacy source baselines remain recoverable.
- [ ] Build, tests, validator and link audit pass.
- [ ] Every removed route is either intentionally 404/410 or safely redirected; no accidental blank route.
- [ ] README and architecture reflect actual implementation.

## 9. Part-specific execution prompt

> Execute Part 0 only. Inspect the current repository tree and dependencies. Produce an exhaustive keep/remove/archive map with exact source files and route references before modifying anything. Then implement futures-only scope cleanup in the source builders and navigation, not by deleting arbitrary files. Preserve ICT Futures, 15 contract families, lessons, tutorials, futures datasets, Supabase user data, data adapters and tests. Archive generic research where needed. Update tests, sitemap, search index, service worker and documentation. Run all project quality commands and report each excluded route plus each preserved route. Do not start Part 1 UI redesign beyond the minimum new futures-only homepage shell required for the scope boundary.

