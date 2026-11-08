# Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SITE_URL` | build environment | Absolute production origin for canonical tags, OG URLs, robots and sitemap. Leave unset for local/noindex build. |
| `ALLOWED_ORIGINS` | Cloudflare Worker variable | Comma-separated exact browser origins allowed by CORS. |
| `BUILDER_PUBLIC_API_KEY` | Cloudflare Worker secret | Builder Content API read key; used by the CMS proxy. |
| `BUILDER_PAT` | Cloudflare Worker secret | Read-only Builder.io Personal Access Token for the Admin API model-list endpoint. Do not reuse an exposed token. |
| `SUPABASE_URL` | Cloudflare Worker variable | Supabase project URL for server-side ingestion. |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Worker secret | Server-only elevated key; never use in browser or repository. |
| `INGEST_TOKEN` | Cloudflare Worker secret | Reserved optional authorization for protected ingestion endpoints. |
| `PUBLIC_SUPABASE_URL` | browser build config | Project URL only (public identifier). |
| `PUBLIC_SUPABASE_ANON_KEY` | browser build config | Publishable/anon key only; relies on RLS. |
| `PUBLIC_FINANCE_OS_API_BASE` | browser build config | Worker public endpoint base URL (`https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev`). |

Never commit real values to `.env`, JSON, static HTML, Builder content or Git. `.env.example` contains placeholders only.

Set Worker secrets through Cloudflare Workers & Pages → finance-intelligence-os-edge → Settings → Variables and Secrets. Never paste secret values into chat or commit them.
