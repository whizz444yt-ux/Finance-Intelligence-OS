# Finance Intelligence OS

A consolidated global financial research workspace with the preserved Global Research cockpit, a dedicated ICT Futures terminal, a contract-aware Futures Intelligence Desk, 585-resource source directory, macro/COT data adapters, read-only prediction-market discovery, risk tools, news research, ICT learning catalogue and Supabase-backed private workspace foundation.

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
- `/news/` — GDELT news-discovery snapshots.
- `/macro/` — five historical US BLS series (CPI, core CPI, unemployment, nonfarm payrolls, PPI).
- `/research/positioning/` — CFTC TFF and Disaggregated COT dashboard.
- `/research/` — searchable 585-resource directory.
- `/academy/` — searchable ICT Academy index and retained lesson pages.
- `/tools/` — futures risk calculator and links to the preserved journal/checklist.
- `/account/` — Supabase sign-in and private workspace (journal, watchlists, lesson progress).
- `/ict-futures/` — original ICT Futures Intelligence OS 3.0.
- `/status/`, `/docs/`, `/legacy/` — system status, developer documentation and original research archive.

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

## Platform state (verified 8 November 2026)

| Platform | Verified state | Remaining setup |
|---|---|---|
| GitHub | Public repo `whizz444yt-ux/Finance-Intelligence-OS` on `main`; CI quality workflow is enabled. | Continue using the linked repository and protect production releases with CI status checks. |
| Vercel | `finance-intelligence-os` project exists; Git-linked production deploys are triggered for commits on `main`; canonical `SITE_URL` is set. | Verify the latest deployment after build completion; add custom domain only when DNS is ready. |
| Supabase | Active Mumbai (`ap-south-1`) project; 16 public tables with RLS enabled; security advisors returned no lints. | Complete a real browser sign-in test, set allowed Auth redirect URLs, and configure email delivery. |
| Cloudflare | `finance-intelligence-os-edge` Worker deployed with KV binding and a 30-minute GDELT scheduled job. CORS is restricted to configured production origins. | No Worker secrets are currently bound, so Builder Admin and automated Supabase writes remain disabled. |
| Builder.io | Allow-listed content proxy code remains available. | A Builder Space public API key and read-only Admin PAT have not been configured. |

### Deployed Cloudflare API

`https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev`

Routes include `/health`, `/api/v1/providers`, `/api/v1/news`, `/api/v1/macro`, `/api/v1/cot?report=tff|disaggregated`, `/api/v1/macro/funding` (New York Fed SOFR/EFFR/overnight rates), `/api/v1/prediction/polymarket`, `/api/v1/prediction/kalshi`, and `/api/v1/cms/{model}`. Polymarket and Kalshi are read-only public event-market endpoints, cached at the edge. News refresh remains scheduled every 30 minutes; the frontend reload button fetches the latest cached snapshot rather than bypassing the provider cache. GDELT collection is scheduled every 30 minutes; BLS and CFTC snapshots are fetched on demand and cached. This is not an exchange real-time price or order-book feed.

## Data and safety boundaries

- Supabase browser configuration uses only the public publishable key; no service-role key is in this repository.
- RLS is enabled on all 16 project public tables; user-owned rows are scoped to `auth.uid()`.
- Fifteen imported contract specification rows are explicitly `unverified`; they must be reconciled with exchange documents before being treated as current.
- CFTC COT is a weekly trader-category report with distinct TFF and Disaggregated classifications; the desk normalizes these categories using the provider's report-specific fields; BLS series are official historical macro observations; GDELT is a discovery index, not a complete licensed newswire.
- Builder CMS content is editorial content, not a source for market prices or issuer release facts.
- Real-time CME/ICE quotes, DOM/depth, licensed intraday history and redistribution rights are outside the free integration baseline.
- Polymarket/Kalshi event-market odds are venue probabilities, not futures prices, order flow or guaranteed forecasts; no wallet or order-placement endpoints are connected.
- The new Futures Desk is a research interface; it deliberately does not label delayed/snapshot public data as live exchange quotes.

See `docs/BUILD-REPORT.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION.md`, `docs/ENVIRONMENT.md` and `SECURITY.md`.
