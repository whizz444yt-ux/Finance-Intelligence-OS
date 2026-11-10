# Futures-Only Implementation Roadmap

**Repository:** `whizz444yt-ux/Finance-Intelligence-OS`  
**Branch for this documentation set:** `docs/futures-only-implementation-roadmap`  
**Product target:** Futures Intelligence OS — Futures markets, ICT education, futures news, market data, research, backtesting, risk and trader workspace.  
**Source playbook:** `ICT_Futures_Playbook_Complete_Edition(2).pdf` (39 pages; reviewed 10 November 2026).

> This folder is the implementation contract for the product transformation. It is documentation only. It does not itself change application code, credentials, provider subscriptions, user data, production routes or deployments.

## Read this first

1. [Project charter and global execution rules](00-PROJECT-CHARTER-AND-EXECUTION-RULES.md)
2. [Part 0 — Baseline audit and scope cleanup](01-PART-0-BASELINE-AUDIT-AND-SCOPE-CLEANUP.md)
3. [Part 1 — Premium UI and information architecture](02-PART-1-PREMIUM-UI-AND-INFORMATION-ARCHITECTURE.md)
4. [Part 2 — Complete ICT Academy](03-PART-2-COMPLETE-ICT-ACADEMY.md)
5. [Part 3 — Futures contract intelligence](04-PART-3-FUTURES-CONTRACT-INTELLIGENCE.md)
6. [Part 4 — Session engine and economic calendar](05-PART-4-SESSION-ENGINE-AND-ECONOMIC-CALENDAR.md)
7. [Part 5 — Futures news and data gateway](06-PART-5-FUTURES-NEWS-AND-DATA-GATEWAY.md)
8. [Part 6 — Volume, open interest and COT](07-PART-6-VOLUME-OPEN-INTEREST-AND-COT.md)
9. [Part 7 — Strategy Lab and ICT backtesting](08-PART-7-STRATEGY-LAB-AND-ICT-BACKTESTING.md)
10. [Part 8 — Risk and prop-firm intelligence](09-PART-8-RISK-AND-PROP-FIRM-INTELLIGENCE.md)
11. [Part 9 — Journal and private workspace](10-PART-9-JOURNAL-AND-PRIVATE-WORKSPACE.md)
12. [Production QA, security and release runbook](11-PRODUCTION-QA-SECURITY-AND-RELEASE.md)
13. [Provider register, data contracts and licensing](12-DATA-PROVIDER-REGISTER-AND-LICENSING.md)
14. [ChatGPT / Claude / GitHub execution protocol](13-CHATGPT-EXECUTION-PROMPTS-AND-HANDOFF.md)
15. [PDF-to-product traceability map](14-PDF-TO-PRODUCT-TRACEABILITY.md)

## Product boundary

The production product is futures-only. It covers exchange-traded futures and futures-specific research, including CME/CBOT/COMEX/NYMEX/ICE instruments, equity-index futures, metals, energy, currency futures, Treasury futures, and CME Bitcoin futures. A related cash/spot indicator may be shown only as clearly labelled context, never as the instrument being analysed or backtested.

Do not delete useful source history. Generic equity research, stock screeners, general spot-crypto dashboards, prediction markets and unrelated directories must be removed from the active product navigation, generated routes, search index and sitemap. Preserve the prior material under `legacy/` or another documented archive until a separate verified deletion decision exists. CME currency futures (6E, 6B, 6J, 6A, 6C) and CME Bitcoin futures (BTC/MBT) remain in scope.

## Existing baseline from the inspected repository

The `main` branch already has a static HTML/JSON application, Python site builder, Cloudflare Worker API gateway, KV cache, Supabase Auth/Postgres, GitHub Actions quality checks, a 15-family ICT Futures section, 76 lesson IDs, nine guided tutorials, entry-model catalogue, a deterministic OHLC signal backtester and private workspace foundations. The build is currently driven by `scripts/build_site.py`; tests and audits are in `tests/` and `scripts/`. The dedicated `ict-futures/` site should be preserved and reconciled with the new primary navigation rather than rebuilt blindly.

Current documented gaps include: generic Global Research content remains; prediction-market routes remain; imported contract specifications are marked unverified; licensed exchange real-time prices/DOM are not part of the free baseline; several provider credentials and Supabase server-side ingestion secrets need configuration; automatic ICT detectors and preloaded verified history are not established merely because the backtester exists.

## Part order and dependency

`Part 0 → Part 1 → Part 2 → Part 3 → Part 4 → Part 5 → Part 6 → Part 7 → Part 8 → Part 9 → Production QA`.

Data Health, security, tests, accessibility, documentation and source attribution are cross-cutting requirements and must be maintained from Part 0 onward.

## Definition of done

A part is not complete because code was generated. It is complete only when its stated scope is implemented, existing features are preserved or intentionally migrated, automated checks pass, key routes and failure states are manually smoke-tested, data provenance is visible, security controls are reviewed, the build output matches source, and the completion report lists evidence plus any remaining blockers.

## Important evidence policy

- Never invent market prices, volumes, open interest, contract specifications, margin, exchange schedules, prop-firm rules, API capabilities, pricing, win rates or backtest results.
- Separate `SOURCED`, `CONVENTION`, `NO DATA`, `UNVERIFIED` and `USER CONFIGURATION REQUIRED`.
- Keep source time, event time, retrieval time and data-as-of time separate.
- Distinguish exchange real-time, exchange-delayed, provider-delayed, historical, indicative, weekly, daily and cached snapshots.
- Do not present GDELT as a licensed Reuters/Bloomberg wire or CFTC weekly OI as intraday exchange OI.
- Do not treat an ICT idea as a guaranteed edge. Publish comparative performance only after reproducible, cost-aware, out-of-sample testing.

## Files and change policy

The current source of truth is `main`. Work in a feature branch, inspect the current source before editing, update source data/builders rather than generated `dist/` output, and avoid unrelated rewrites. Database migrations are additive and reviewed; never reset the live Supabase project or overwrite existing user data. Secrets stay in Cloudflare/Vercel/Supabase secret stores, never in Git, HTML, JSON, client bundles, screenshots or URLs.

