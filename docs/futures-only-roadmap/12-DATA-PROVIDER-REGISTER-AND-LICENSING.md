# Data Provider Register and Licensing Matrix

**Purpose:** A shared, maintained register of the APIs and data services the Futures Intelligence OS may use. This is a research shortlist, not a claim that every provider is configured, free, current or licensed for public display.

**Review date for this document:** 10 November 2026. Pricing, API limits, terms and availability must be rechecked at implementation time.

## 1. Source class definitions

- **Official public API:** regulator/government/exchange API with documented access.
- **Registered-key API:** publicly accessible service requiring a free/registered key.
- **Official RSS/web source:** official source link/feed, terms apply.
- **Discovery index:** helps discover article links; not comprehensive newswire.
- **Vendor market data:** market data under vendor/venue license and subscription.
- **Widget/hosted chart:** vendor-hosted embed; data scope/terms are controlled by vendor.
- **Manual source directory:** outbound links only, no promise of automatic ingestion.
- **Not yet configured:** code may exist but active environment credentials/endpoint proof absent.

## 2. Official economic and positioning providers

| Provider | Use | Access | Main caveat / implementation |
|---|---|---|---|
| CFTC Public Reporting Environment | Futures Only COT, TFF, Disaggregated, weekly positioning | Public data/API access | Report family and futures-only vs combined must be explicit; weekly positions are not intraday OI or volume. |
| BLS Public Data API | CPI, PPI, employment/payrolls, unemployment | Registered v2 key; unregistered v1 also exists | Official FAQ currently describes 500 daily v2 queries and 25 v1 queries; renew registration and recheck. |
| BEA API | GDP, PCE and NIPA national accounts | Registered 36-character UserID | Retain publication/vintage/revision information; GDP/PCE are not live prices. |
| EIA API v2 | Weekly petroleum, crude inventories, natural gas | Registered API key | Inventory releases can move CL; report calendar exceptions/holidays. |
| FRED | Historical rate, inflation, employment and other macro series | Registered API key | Display terms link; docs specify rate limiting (e.g. 120 requests/minute noted in API error guide); do not confuse FRED history with exchange quotes. |
| US Treasury Fiscal Data | Treasury rates/auctions and public datasets | Public APIs | Distinguish auction data, monthly averages and daily par yield curve. |
| New York Fed Markets Data | SOFR/EFFR and related reference rates | Public API | Published reference rates, usually daily business-day data; not futures price feed. |
| ECB Data Portal / SDMX | EUR/USD reference series and euro area data | Public data API | Daily reference rate is not live 6E quote. |
| Federal Reserve | FOMC schedules, statements, minutes and releases | Official pages/RSS where available | Event dates and statements may be updated; keep versions and actual publish times. |
| CME/ICE official sources | Contract metadata, hours, expiry, notices and market data licensing | Public contract pages + licensed market data access | Official specs and schedule have priority; prices require correct entitlement and distribution terms. |

## 3. News discovery and publishers

| Source | Role | Safe integration |
|---|---|---|
| GDELT DOC | Global news discovery/index | Query futures terms, cache snapshots, link original publisher; not comprehensive or a licensed newswire. |
| Reuters Markets | Professional publisher | Official publisher links/RSS/API only where authorized; do not reproduce paywalled story text. |
| Bloomberg Markets | Professional publisher | Links and authorized feeds only; paywall remains respected. |
| CNBC Markets | Financial publisher | Links/feed where available and permitted. |
| FinancialJuice | Market news/calendar service | Verify current API/embedding/access and terms before integration. |
| Kitco | Metals news/reference | Gold/silver source directory; verify use rights for displayed content/data. |
| CME Insights / notices | Exchange education and notices | Official outbound links/RSS where offered, respecting attribution. |
| EIA / FRED / BLS / BEA / CFTC / Fed / ECB | Primary event/release content | Prefer official machine-readable data and source page. |
| X, Reddit, YouTube, Discord, Telegram | Community and education discovery | Curated outbound links or authorized platform APIs only; do not scrape/login-bypass or promise complete feed. |

News UI stores publisher URL and timestamp, not a locally reproduced paid article. Social/community opinion is not official market data or proof of a trading edge.

## 4. Exchange market data

### Databento

Potential use: historical bars/trades/BBO/depth and live datasets across supported venues, including CME family datasets. Current public pricing page (recheck before purchase) advertises $125 initial historical credits, usage-based historical access, Standard at $199/month and higher tiers with external distribution licensing. The page distinguishes Standard from Plus/Unlimited external distribution. The live data guide says licensing/entitlements must be activated for datasets. A Standard personal subscription must not automatically be assumed to authorize public redistribution.

Links:
- https://databento.com/pricing/
- https://databento.com/docs/
- https://databento.com/docs/portal/live-data

### CME Group direct

Potential use: direct market data and market-data APIs subject to exchange entitlement, licensing and applicable real-time/delayed display/non-display fees, usage classification and reporting. Contact the exchange or authorized distributor for the exact use case and quote. A public website with many users is different from an individual chart subscription.

Links:
- https://www.cmegroup.com/market-data/market-data-api.html
- https://www.cmegroup.com/market-data/
- https://www.cmegroup.com/market-data/distributor/files/cme-group-data-licensing-policy-guidelines-and-non-display-licensing-faq.pdf

### TradingView widgets

Hosted widgets can provide ready-made charts/quotes/calendar where supported, but do not equal raw OHLC API, a guaranteed all-symbol live feed or an application-owned backtest feed. Verify each symbol, venue, data delay and widget terms. Some widget data is provided by TradingView; the host site does not control its underlying entitlements.

Links:
- https://www.tradingview.com/widget-docs/getting-started/
- https://www.tradingview.com/widget-docs/faq/general/
- https://www.tradingview.com/widget-docs/widgets/charts/

### Do not assume free data is redistribution data

Before publishing a market feed, verify:
1. Exchange and vendor data agreement.
2. Subscriber category and non-professional/professional classification.
3. Real-time vs delayed.
4. Display vs non-display use.
5. Website/public distribution and number of users/devices.
6. Attribution, derived-data and caching rights.
7. Historical retention and downloadable export rights.
8. Whether charts/screenshots can be re-hosted.
9. Venue reporting and device declarations.
10. Termination, auditing and fee changes.

If any item is unresolved, keep the feature disabled or show a link to the provider rather than redistributing its data.

## 5. Free infrastructure and limitations

### Cloudflare Workers / KV
Current official documentation at the review date lists Free Worker limits including 100,000 requests/day, 10 ms CPU/invocation, 50 subrequests/request and 5 Cron Triggers/account. KV Free currently lists 100,000 reads/day, 1,000 writes/day, 1 GB stored data and 30-second minimum cache TTL. These are plan limits, not a service-level guarantee; check current limits and actual account billing before launch.

Official:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/kv/platform/limits/
- https://developers.cloudflare.com/kv/platform/pricing/
- https://developers.cloudflare.com/workers/configuration/cron-triggers/
- https://developers.cloudflare.com/workers/configuration/secrets/

Cron schedules run in UTC. Worker secrets should be provisioned through Wrangler/dashboard secrets, never source code or vars.

### Supabase
Current official billing docs list Free plan quotas including 500 MB database size/project, 5 GB egress and 1 GB Storage, with two free projects across an account. Verify current pricing, pause/backup/compute behavior and actual account usage. Use it for users and normalized records, not unlimited high-frequency tick storage.

Official:
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/pricing

### Vercel
Hobby plan is limited to personal/non-commercial use. A public commercial/monetized service must use an eligible plan or a different compliant hosting platform.

Official:
- https://vercel.com/docs/plans/hobby
- https://vercel.com/legal/terms
- https://vercel.com/docs/limits/fair-use-guidelines

### VPS
Do not introduce a VPS for basic API proxy/cache or static hosting; Workers/KV already provide this. An always-free VM (such as Oracle Cloud Always Free when capacity/region eligibility allows) may be useful later for persistent Python backtest jobs or long-running vendor consumers, but verify current service terms, capacity and billing, and don't treat free-tier availability as uptime assurance.

## 6. Credential map

Secrets (server side only):
- `BLS_API_KEY`
- `BEA_API_KEY`
- `EIA_API_KEY`
- `FRED_API_KEY`
- `INGEST_TOKEN`
- `SUPABASE_SECRET_KEY` or legacy server-only service-role key if required by current implementation
- Optional vendor API credentials
- Optional private CMS key if still used

Public browser configuration only:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY` (publishable/anon only)
- Public Worker base URL
- Public chart widget configuration.

Use Cloudflare Worker secret store and Vercel environment variables with correct environment scope. Rotate exposed credentials, never paste them into a chat/document/commit. The exact secret command is in official Wrangler docs; use dashboard secret UI where safer.

## 7. Provider acceptance record

For each provider create a row in `data-provider-registry` (existing JSON/database table where appropriate):
- Provider ID and name.
- Instrument/event coverage.
- Endpoint and API version.
- Authentication type.
- Free/paid and quota/cadence.
- Data frequency and delay class.
- Historical depth.
- Licence/redistribution class.
- Current configured state.
- Last successful request and data-as-of.
- Source/terms links.
- Test artifact and reviewer.
- Next re-verification date.

Update this registry whenever an API, pricing plan or licence changes. Never describe provider as "free" without specifying free scope and access conditions.

## 8. Important implementation policy

No API key collection form in frontend. No provider credential committed. No scraping behind auth/paywall. No synthetic live market tape. No free-tier promise beyond documented quota. No paid price claim copied indefinitely. No public redistribution without verified license. No service status guessed from source code.
