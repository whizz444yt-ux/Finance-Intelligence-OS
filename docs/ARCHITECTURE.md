# Architecture

## Runtime topology

```text
Browser
  ├─ Finance Intelligence OS Global Research cockpit (existing single-page app)
  ├─ Static module routes (Markets / News / Research / Academy / Tools)
  └─ ICT Futures terminal (retained original app + 15 profiles + 76 lessons)
       │
       ├── Vercel static hosting (deployment target; Git integration pending)
       ├── Cloudflare Worker API gateway
       │      ├── GDELT scheduled discovery → KV snapshot cache
       │      ├── CFTC PRE COT TFF / Disaggregated read-through (6h KV cache)
       │      └── BLS v1 CPI / PPI / unemployment / payrolls (6h KV cache)
       │      ├── Builder Content API allow-listed proxy
       │      ├── provider status / health
       │      └── optional secure Supabase write path after secret setup
       ├── Builder.io Content Space (editorial content only; not market prices)
       └── Supabase Postgres/Auth (public normalized records + private user workspace)
```

## Tool boundaries

- GitHub: code, SQL, Worker source, tests, pull requests and CI.
- Vercel: static frontend deployment and previews. This repository is static-first, so no Node server is required for the initial version.
- Cloudflare: Workers API edge, public cache, Cron ingestion, DNS/security when a domain exists.
- Supabase: relational database, Auth, RLS and per-user records. It is not duplicated in D1.
- Builder.io: editorial lessons, pages, glossary and research articles. Legacy JSON/HTML remains the fallback.

## Data contract

All normalized records should keep `provider`, `source_url`, `published_at`, `event_at`, `retrieved_at`, `data_as_of`, `freshness_status`, `license_note` and a stable provider ID where supported. Publisher time, event time, retrieval time and data-as-of time are not interchangeable.

## Degradation

If a provider or CMS is missing, the UI shows the last-known snapshot/source links or a not-configured state. It must not synthesize data or imply that a search destination is live data.
