# Finance Intelligence OS

A consolidated global financial research workspace with the preserved Global Research cockpit, a dedicated ICT Futures terminal, a 585-resource source directory, macro/COT data adapters, risk tools, news discovery, learning catalogue and account-backed workspace foundation.

## Preserved source work

- The previous Finance Intelligence OS Global Research Edition remains the homepage and primary cockpit.
- The previous 585-resource research directory and 73 instrument profiles are retained.
- ICT Futures Intelligence OS 3.0 is preserved at `/ict-futures/`, including 15 contract-family pages, 76 Academy lesson pages, the original terminal UI, datasets, session/calendar tools, journal, checklist and risk modules.
- Previous Finance OS Markdown documents, notes and source ZIP baselines remain in `legacy/`.
- The complete five-platform requirements document remains in `docs/FINANCE_INTELLIGENCE_OS_COMPLETE_MASTER_REQUIREMENTS.md`.

## Routes

- `/` — preserved Global Research cockpit.
- `/markets/` — futures families and global instruments.
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

## Five-platform state at build time

| Platform | What is configured | What remains |
|---|---|---|
| GitHub | Existing linked account inspected; workflows and source included | A new repository has not been created. The connected GitHub action set did not expose repository creation; the existing empty `whizz444yt-ux/new.w` was left untouched. |
| Vercel | Account/team inspected; static project settings prepared | Project creation is waiting for one-time team-access approval. After approval, link the new GitHub repository and use `dist` as output. |
| Supabase | Free-quoted project created in Mumbai (`ap-south-1`), schema/migrations applied, 16 public tables with RLS enabled, 32 owner policies verified | Browser sign-in requires a real user test, final auth redirect origins and mail settings. Existing local journal data remains separate until an import flow is chosen. |
| Builder.io | Content model specs and allow-listed Worker proxy prepared | A Builder Content Space and its public Content API key have not been connected. Configure `BUILDER_PUBLIC_API_KEY` as a Cloudflare Worker secret after selecting the Space. |
| Cloudflare | `finance-intelligence-os-edge` Worker deployed; `finance-intelligence-os` workers.dev subdomain enabled; KV namespace bound; 30-minute Cron configured | External HTTP response testing was blocked by this execution environment's outbound network policy. Restrict CORS to final site origins once the public website URL exists. |

### Deployed Cloudflare API

`https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev`

Routes include `/health`, `/api/v1/providers`, `/api/v1/news`, `/api/v1/macro`, `/api/v1/cot?report=tff|disaggregated`, and `/api/v1/cms/{model}`. GDELT collection is scheduled every 30 minutes; BLS and CFTC snapshots are fetched on demand and cached. This is not an exchange real-time price or order-book feed.

## Data and safety boundaries

- Supabase browser configuration uses only the public publishable key; no service-role key is in this repository.
- RLS is enabled on all 16 project public tables; user-owned rows are scoped to `auth.uid()`.
- Fifteen imported contract specification rows are explicitly `unverified`; they must be reconciled with exchange documents before being treated as current.
- CFTC COT is a weekly trader-category report; BLS series are official historical macro observations; GDELT is a discovery index, not a complete licensed newswire.
- Builder CMS content is editorial content, not a source for market prices or issuer release facts.
- Real-time CME/ICE quotes, DOM/depth, licensed intraday history and redistribution rights are outside the free integration baseline.

See `docs/BUILD-REPORT.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION.md`, `docs/ENVIRONMENT.md` and `SECURITY.md`.
