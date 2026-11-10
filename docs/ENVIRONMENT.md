# Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SITE_URL` | build environment | Absolute production origin for canonical tags, OG URLs, robots and sitemap. Leave unset for local/noindex build. |
| `ALLOWED_ORIGINS` | Cloudflare Worker variable | Comma-separated exact browser origins allowed by CORS. |
| `BUILDER_PUBLIC_API_KEY` | Cloudflare Worker secret | Builder Content API read key; used by the CMS proxy. |
| `BUILDER_PAT` | Cloudflare Worker secret | Read-only Builder.io Personal Access Token for the Admin API model-list endpoint. Do not reuse an exposed token. |
| `SUPABASE_URL` | Cloudflare Worker variable | Supabase project URL for server-side ingestion. |
| `SUPABASE_SECRET_KEY` | Cloudflare Worker secret | Preferred modern Supabase server-side secret API key (`sb_secret_...`) for protected database writes; never use in browser or repository. |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloudflare Worker secret | Legacy JWT-based fallback only. The Worker supports it for backward compatibility; prefer `SUPABASE_SECRET_KEY`. |
| `BLS_API_KEY` | Cloudflare Worker secret | Free registered BLS API v2 key; raises daily query allowance from 25 (unregistered v1) to 500. Never expose in browser or Git. |
| `BEA_API_KEY` | Cloudflare Worker secret | Registered BEA 36-character UserID for BEA NIPA API requests. |
| `EIA_API_KEY` | Cloudflare Worker secret | Registered EIA API key for weekly petroleum series. |
| `FRED_API_KEY` | Cloudflare Worker secret | Registered FRED API key for historical macro series. |
| `INGEST_TOKEN` | Cloudflare Worker secret | Required bearer token for `POST /api/v1/ingest`; never place it in a URL or browser bundle. |
| `PUBLIC_SUPABASE_URL` | browser build config | Project URL only (public identifier). |
| `PUBLIC_SUPABASE_ANON_KEY` | browser build config | Publishable/anon key only; relies on RLS. |
| `PUBLIC_FINANCE_OS_API_BASE` | browser build config | Worker public endpoint base URL (`https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev`). |

Never commit real values to `.env`, JSON, static HTML, Builder content or Git. `.env.example` contains placeholders only.

Set Worker secrets through Cloudflare Workers & Pages → finance-intelligence-os-edge → Settings → Variables and Secrets, or with `wrangler secret put SECRET_NAME`. Configure `SUPABASE_URL`, preferably `SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`), `INGEST_TOKEN`, and the optional registered BLS key plus BEA/EIA/FRED provider keys. Treasury Fiscal Data and ECB public SDMX do not require API keys. Do not put any provider or Supabase secret key in `[vars]`, the browser runtime, a URL query string that is logged, or Git. The Worker removes BEA/EIA/FRED keys from stored `source_url` values.
