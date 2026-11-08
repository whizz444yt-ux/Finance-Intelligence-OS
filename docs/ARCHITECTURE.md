# Architecture

## Runtime topology

```text
Browser
  ├─ Finance Intelligence OS Global Research cockpit
  ├─ Static modules: Markets / Futures Desk / News / Macro / COT / Research / Academy / Tools / Account
  └─ ICT Futures terminal: 15 futures families + 76 ICT concepts + dedicated lesson pages
       │
       ├── Vercel static hosting (Git-linked from main)
       ├── Cloudflare Worker API gateway
       │      ├── GDELT futures-focused discovery → KV snapshot (scheduled every 30 minutes)
       │      ├── US BLS Public Data API v1 → KV (historical macro series)
       │      ├── CFTC Public Reporting Environment → KV (TFF / Disaggregated weekly COT)
       │      ├── New York Fed Markets API (SOFR / EFFR / OBFR / repo reference rates)
       │      ├── Polymarket Gamma public events → KV (read-only venue odds/volume)
       │      ├── Kalshi public Trade API v2 → KV (read-only event markets/bid-ask metadata)
       │      ├── Builder Content API allow-listed proxy (not configured)
       │      └── provider health / freshness metadata
       └── Supabase Postgres/Auth (public normalized data model + private per-user workspace)
```

## Runtime and provider responsibilities

- **Vercel** serves the static application, generated routes, and published sitemap.
- **Cloudflare Worker** is the single public-data gateway. It owns upstream calls, per-provider timeouts, cache and freshness labels. The GDELT scheduled refresh uses the existing 30-minute Cron trigger. BLS, CFTC and prediction-market feeds are refreshed on request with KV fallback.
- **Supabase** stores the normalized data model and user-owned journal/watchlists/progress. All 16 public tables currently have RLS enabled. The Worker currently has no Supabase service-role/secret key configured, so its optional server-side ingestion writes remain disabled; do not put privileged keys in browser code.
- **Builder.io** remains optional editorial CMS. Its public Content API key and Admin PAT are not configured, so existing static lessons and JSON remain the fallback.
- **GitHub Actions** runs build, unit, validation and internal-link checks on pushes and pull requests.

## API routes

| Route | Provider | Meaning / freshness |
|---|---|---|
| `/api/v1/news` | GDELT DOC | Cached news-discovery snapshot, scheduled every 30 minutes; discovery index, not licensed newswire. |
| `/api/v1/macro` | US BLS v1 | Historical CPI, core CPI, unemployment, payroll and PPI observations. Not live market data. |
| `/api/v1/cot?report=tff` | CFTC PRE | Weekly Traders in Financial Futures report. |
| `/api/v1/cot?report=disaggregated` | CFTC PRE | Weekly Disaggregated report. |
| `/api/v1/macro/funding` | New York Fed Markets API | Latest published SOFR, EFFR and supported overnight reference rates; daily business-day observations. |
| `/api/v1/prediction/polymarket` | Polymarket Gamma | Active event metadata, outcome prices, volume and liquidity fields; read-only. |
| `/api/v1/prediction/kalshi` | Kalshi public Trade API v2 | Open event markets, YES bid/ask and volume fields; read-only. |
| `/api/v1/providers` | Gateway registry | Provider configuration and last-known state. |
| `/api/v1/health` | Gateway | Worker health and secret/configuration presence flags, never secret values. |

The UI should display provider, source URL, publisher/event timestamp, retrieval timestamp, data-as-of time and freshness status separately wherever the provider supports them. Event-market probabilities are not exchange quotes, and COT is not an intraday signal.

## Security and access boundaries

- Browser runtime configuration may include only public Supabase publishable/anon values and the Worker URL. Supabase service-role keys, Builder PATs, ingestion tokens and other privileged credentials must remain Worker secrets.
- Worker CORS must be restricted to explicit deployed site origins; do not use wildcard CORS with credentialed or private data.
- Prediction-market routes are read-only. No wallet, order-placement, account-trading or execution routes are implemented.
- Public data is not necessarily licensed for redistribution or commercial use. Upstream terms and market-data exchange licenses still apply.
- Contract reference values in the retained 15-profile dataset must be verified against the relevant current exchange specification. Contract expiry, first notice, last trade and broker margin must not be inferred from a continuous chart.

## Data contract

Normalized records should retain `provider`, `source_url`, `published_at`, `event_at`, `retrieved_at`, `data_as_of`, `freshness_status`, `license_note` and a stable provider ID where supported. Publisher time, event time, retrieval time and data-as-of time are not interchangeable.

## Degradation

If a provider is rate-limited, blocked, unavailable or not configured, the UI shows an unavailable/not-configured state or a clearly identified last-known snapshot. It must not synthesize values, describe a search destination as an API, or imply that an indicative event-market probability is a futures price.
