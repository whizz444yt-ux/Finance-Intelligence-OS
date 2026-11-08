# Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SITE_URL` | build environment | Absolute production origin for canonical tags, OG URLs, robots and sitemap. Leave unset for local/noindex build. |
| `ALLOWED_ORIGINS` | Cloudflare Worker variable | Exact allowed browser origins. |
| `BUILDER_PUBLIC_API_KEY` | Cloudflare Worker secret | Builder Content API read key; only used server-side by the CMS proxy. |
| `SUPABASE_URL` | Cloudflare Worker variable/secret | Supabase project URL for server-side ingestion. |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Worker secret | Server-only elevated key; never use in browser or repository. |
| `INGEST_TOKEN` | Cloudflare Worker secret | Optional authorization for protected ingestion endpoints when implemented. |
| `PUBLIC_SUPABASE_URL` | browser build config | Project URL only (public identifier). |
| `PUBLIC_SUPABASE_ANON_KEY` | browser build config | Publishable/anon key only; relies on RLS. |
| `PUBLIC_FINANCE_OS_API_BASE` | browser build config | Worker public endpoint base URL (`https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev`). |

Do not commit real values to `.env`, JSON, static HTML, Builder content or Git. `.env.example` contains only variable names.
