# Implementation and service setup

## Local run

The current build uses static HTML/JSON, browser-native JavaScript and a Python standard-library route builder. It intentionally avoids external npm packages in the initial build so it can be inspected and tested in a restricted environment.

```bash
python3 scripts/build_site.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Build without `SITE_URL` sets the output to `noindex`. Set `SITE_URL=https://your-production-host` for production metadata and sitemap generation.

## Cloudflare

1. Create a KV namespace named `finance-os-snapshots`.
2. Put its ID in `cloudflare/wrangler.toml`.
3. Set `ALLOWED_ORIGINS` to the exact Vercel production and preview origins (comma separated; never `*` for credentialed private routes).
4. Deploy `cloudflare/src/index.js` with Wrangler; configure the `SNAPSHOTS` binding and Cron trigger from `wrangler.toml`.
5. Set optional Builder/Supabase secrets with `wrangler secret put`; never commit secret values.
6. Verify `/health`, `/api/v1/providers`, `/api/v1/news`, `/api/v1/cot?report=tff`, `/api/v1/cot?report=disaggregated`, `/api/v1/macro` and `/api/v1/cms/ict-lesson`. CFTC PRE is cached for six hours and BLS v1 for six hours; the request paths intentionally return provider-labelled snapshots rather than claiming streaming market data.

The Worker is published as `https://finance-intelligence-os-edge.finance-intelligence-os.workers.dev` with a 30-minute Cron trigger. The Worker Cron performs GDELT snapshot discovery every 30 minutes. GDELT discovery is not a complete news service or a trading signal.

Public endpoints currently deployed in the Worker:
- `GET /health` and `/api/v1/health` — edge health/config state.
- `GET /api/v1/providers` — provider status.
- `GET /api/v1/news` — GDELT KV snapshot.
- `GET /api/v1/macro` — BLS public v1 monthly series (CPI-U, core CPI, unemployment, payroll employment and PPI); six-hour cache.
- `GET /api/v1/cot?report=tff` or `?report=disaggregated` — CFTC PRE latest 200 futures-only report rows; six-hour cache.
- `GET /api/v1/cms/{model}` — Builder public Content API proxy when the key is configured.

BLS and CFTC calls are public dataset/history access, not licensed real-time exchange prices. COT is a weekly position report; it is not an intraday indicator.

## Supabase

`supabase/setup.sql` and `supabase/migrations/` contain the reviewed bootstrap SQL. The live Supabase project was provisioned in `ap-south-1`; the initial schema, Auth profile trigger and legacy unverified contract seed were applied through the connected Supabase integration. Table/RLS counts were checked afterward. The checked-in migration filenames use the exact versions/names recorded in the remote migration history. The Supabase CLI was not installed in this build environment; after installing it and linking the same project, run `supabase migration list` first and only then use `supabase db push` if the remote/local history still matches.

Do not expose the `service_role` key to the browser. User tables require an ownership condition matching `auth.uid()`. Public research records are read-only to browser roles; Worker/service-role ingestion is server-side only.

## Builder.io

See `integrations/builder/README.md`. The Space must be selected/created and its public Content API key configured as the `BUILDER_PUBLIC_API_KEY` Worker secret. The Builder model proxy is implemented but currently reports not-configured until that key and the four Content models exist. The Public API key is suitable for content reads; a Private API key/PAT must never go to browser code.

## Vercel

Connect the production repository after GitHub repo creation. Configure the project root, static output path `dist`, and build command `python3 scripts/build_site.py`. Set `SITE_URL` for production builds. Preview deployments should remain `noindex` until reviewed. Vercel Hobby is restricted to personal/non-commercial use; commercial use needs an eligible plan or a different host.

## Production gate

No public page should claim `24/7 live` until uptime, each provider's freshness and real collection history are monitored. Site availability and market-data availability are separate SLAs.
