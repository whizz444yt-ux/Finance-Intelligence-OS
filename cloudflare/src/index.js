const NEWS_KEY = "snapshot:gdelt:news:v1";
const PROVIDER_STATE_KEY = "provider:gdelt:state:v1";
const ALLOWED_BUILDER_MODELS = new Set(["page", "ict-lesson", "research-article", "glossary"]);
const GDELT_QUERIES = [
  { label: "Macro & central banks", query: '("Federal Reserve" OR FOMC OR inflation OR CPI OR payrolls OR "interest rates")' },
  { label: "Equities & earnings", query: '(stocks OR equities OR earnings OR Nasdaq OR "S&P 500")' },
  { label: "FX & currencies", query: '(forex OR currencies OR "US dollar" OR EURUSD OR USDJPY)' },
  { label: "Metals", query: '(gold OR silver OR copper OR "precious metals" OR bullion)' },
  { label: "Energy & commodities", query: '("crude oil" OR Brent OR WTI OR "natural gas" OR OPEC)' },
  { label: "Crypto & digital assets", query: '(Bitcoin OR Ethereum OR cryptocurrency OR crypto OR blockchain)' },
  { label: "Geopolitics & trade", query: '(sanctions OR tariffs OR "trade war" OR geopolitical OR shipping) (markets OR economy OR oil OR stocks)' }
];
const CORS_HEADERS = { "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
    const cors = origin && (allowed.includes("*") || allowed.includes(origin)) ? { ...CORS_HEADERS, "Access-Control-Allow-Origin": allowed.includes("*") ? "*" : origin } : CORS_HEADERS;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
    if (url.pathname === "/health" || url.pathname === "/api/v1/health") {
      return json({ ok: true, service: "finance-intelligence-os-edge", version: "1.0.2", time: new Date().toISOString(), storageConfigured: Boolean(env.SNAPSHOTS), cmsConfigured: Boolean(env.BUILDER_PUBLIC_API_KEY), databaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) }, 200, cors);
    }
    if (url.pathname === "/api/v1/providers") {
      const state = env.SNAPSHOTS ? await env.SNAPSHOTS.get(PROVIDER_STATE_KEY, "json") : null;
      const macroState = env.SNAPSHOTS ? await env.SNAPSHOTS.get("macro:bls:v1", "json") : null;
      const cotState = env.SNAPSHOTS ? await env.SNAPSHOTS.get("cot:tff:v1", "json") : null;
      return json({ providers: [
        { id: "gdelt-doc", label: "GDELT DOC API", access: "public-api", state: state || { status: "not-yet-fetched", lastCheckedAt: null }, notes: "Discovery coverage is not comprehensive and not a licensed newswire." },
        { id: "bls-v1", label: "US BLS Public Data API v1", access: "public-api-no-registration", state: macroState ? { status: macroState.status, dataAsOf: macroState.dataAsOf, retrievedAt: macroState.retrievedAt } : { status: "available-on-demand" } },
        { id: "cftc-pre", label: "CFTC Public Reporting Environment", access: "public-api", state: cotState ? { status: cotState.status, dataAsOf: cotState.dataAsOf, retrievedAt: cotState.retrievedAt } : { status: "available-on-demand" } },
        { id: "builder-content", label: "Builder.io Content API", access: "public-content-api", state: { status: env.BUILDER_PUBLIC_API_KEY ? "configured" : "not-configured" } },
        { id: "supabase", label: "Supabase Postgres", access: "server-side-only", state: { status: env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "not-configured" } }
      ] }, 200, cors);
    }
    if (url.pathname === "/api/v1/news") {
      const snapshot = env.SNAPSHOTS ? await env.SNAPSHOTS.get(NEWS_KEY, "json") : null;
      return json(snapshot || { status: "not-yet-fetched", provider: "GDELT DOC API", lastCheckedAt: null, articles: [], notes: ["No edge snapshot exists yet. Scheduled collection requires a deployed Worker with its KV binding."] }, 200, { ...cors, "Cache-Control": "public, max-age=30, s-maxage=60" });
    }
    if (url.pathname === "/api/v1/cot") {
      const report = url.searchParams.get("report") === "disaggregated" ? "disaggregated" : "tff";
      const market = String(url.searchParams.get("q") || "").slice(0, 80).toLowerCase();
      const cacheKey = `cot:${report}:v1`;
      let snapshot = env.SNAPSHOTS ? await env.SNAPSHOTS.get(cacheKey, "json") : null;
      if (!snapshot || !snapshot.retrievedAt || Date.now() - Date.parse(snapshot.retrievedAt) > 6 * 60 * 60 * 1000) {
        try {
          snapshot = await fetchCot(report);
          if (env.SNAPSHOTS) await env.SNAPSHOTS.put(cacheKey, JSON.stringify(snapshot), { expirationTtl: 60 * 60 * 8 });
        } catch (error) {
          if (!snapshot) return json({ status: "unavailable", report, rows: [], sourceUrl: cotSource(report), error: "CFTC PRE request failed" }, 502, cors);
          snapshot.status = "stale";
          snapshot.lastError = "CFTC PRE refresh failed; showing last successful cache";
        }
      }
      const rows = market ? snapshot.rows.filter(row => JSON.stringify(row).toLowerCase().includes(market)) : snapshot.rows;
      return json({ ...snapshot, rows, filtered: Boolean(market), query: market || null }, 200, { ...cors, "Cache-Control": "public, max-age=900, s-maxage=1800" });
    }
    if (url.pathname === "/api/v1/macro") {
      const cacheKey = "macro:bls:v1";
      let snapshot = env.SNAPSHOTS ? await env.SNAPSHOTS.get(cacheKey, "json") : null;
      if (!snapshot || !snapshot.retrievedAt || Date.now() - Date.parse(snapshot.retrievedAt) > 6 * 60 * 60 * 1000) {
        try {
          snapshot = await fetchBls();
          if (env.SNAPSHOTS) await env.SNAPSHOTS.put(cacheKey, JSON.stringify(snapshot), { expirationTtl: 60 * 60 * 8 });
        } catch (error) {
          if (!snapshot) return json({ status: "unavailable", provider: "BLS Public Data API v1", series: [], error: "BLS request failed" }, 502, cors);
          snapshot.status = "stale";
        }
      }
      return json(snapshot, 200, { ...cors, "Cache-Control": "public, max-age=1800, s-maxage=3600" });
    }
    if (url.pathname.startsWith("/api/v1/cms/")) {
      const model = url.pathname.split("/").pop();
      if (!ALLOWED_BUILDER_MODELS.has(model)) return json({ error: "Model is not allow-listed" }, 404, cors);
      if (!env.BUILDER_PUBLIC_API_KEY) return json({ status: "not-configured", model, results: [] }, 200, cors);
      const apiUrl = new URL(`https://cdn.builder.io/api/v3/content/${encodeURIComponent(model)}`);
      apiUrl.searchParams.set("apiKey", env.BUILDER_PUBLIC_API_KEY);
      apiUrl.searchParams.set("limit", String(Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20))));
      if (url.searchParams.get("urlPath")) apiUrl.searchParams.set("userAttributes.urlPath", url.searchParams.get("urlPath"));
      try {
        const result = await fetch(apiUrl, { headers: { "Accept": "application/json" }, cf: { cacheTtl: 120, cacheEverything: true } });
        const data = await result.json();
        return json({ status: result.ok ? "connected" : "provider-error", model, results: Array.isArray(data.results) ? data.results : [], error: result.ok ? undefined : `Builder API returned ${result.status}` }, result.ok ? 200 : 502, { ...cors, "Cache-Control": "public, max-age=60, s-maxage=120" });
      } catch { return json({ status: "unavailable", model, results: [] }, 502, cors); }
    }
    return json({ error: "Not found", routes: ["/health", "/api/v1/health", "/api/v1/providers", "/api/v1/news", "/api/v1/cot?report=tff|disaggregated", "/api/v1/macro", "/api/v1/cms/{model}"] }, 404, cors);
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(refreshNews(env));
  }
};

async function refreshNews(env) {
  if (!env.SNAPSHOTS) return;
  const checkedAt = new Date().toISOString();
  const previous = await env.SNAPSHOTS.get(NEWS_KEY, "json") || { articles: [] };
  const results = await Promise.allSettled(GDELT_QUERIES.map(q => fetchGdelt(q)));
  const good = results.filter(x => x.status === "fulfilled");
  const articles = dedupe(good.flatMap(x => x.value.articles)).slice(0, 90);
  const status = articles.length ? (good.length === GDELT_QUERIES.length ? "fresh" : "partial") : (previous.articles?.length ? "stale" : "unavailable");
  const next = {
    schemaVersion: 1, provider: "GDELT DOC API", status,
    generatedAt: articles.length ? checkedAt : previous.generatedAt || null,
    lastCheckedAt: checkedAt, queryCount: GDELT_QUERIES.length,
    successfulQueries: good.length, articles: articles.length ? articles : (previous.articles || []),
    notes: ["GDELT is a broad news-discovery index, not a complete newswire.", "seendate is GDELT indexing/seen time and may differ from publisher publication time.", "Headlines are leads for verification, not trading signals."]
  };
  await env.SNAPSHOTS.put(NEWS_KEY, JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 3 });
  await env.SNAPSHOTS.put(PROVIDER_STATE_KEY, JSON.stringify({ status, lastCheckedAt: checkedAt, successfulQueries: good.length, queryCount: GDELT_QUERIES.length, articleCount: next.articles.length }), { expirationTtl: 60 * 60 * 24 * 7 });
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && next.articles.length) {
    const rows = next.articles.map(a => ({ provider: "GDELT DOC API", title: a.title, url: a.url, domain: a.domain, topic: a.topic, retrieved_at: checkedAt, data_as_of: checkedAt, freshness_status: status, payload: a }));
    const endpoint = env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/news_items?on_conflict=provider,url";
    const write = await fetch(endpoint, { method: "POST", headers: { "apikey": env.SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
    if (!write.ok) console.error("Supabase news upsert failed", write.status);
  }
}

const COT_DATASETS = {
  tff: { id: "gpe5-46if", name: "TFF Futures Only", source: "https://publicreporting.cftc.gov/Commitments-of-Traders/TFF-Futures-Only/gpe5-46if" },
  disaggregated: { id: "72hh-3qpy", name: "Disaggregated Futures Only", source: "https://publicreporting.cftc.gov/w/72hh-3qpy/default" }
};
function cotSource(report) { return COT_DATASETS[report].source; }
async function fetchCot(report) {
  const dataset = COT_DATASETS[report];
  const u = new URL(`https://publicreporting.cftc.gov/resource/${dataset.id}.json`);
  u.searchParams.set("$limit", "200");
  u.searchParams.set("$order", "report_date_as_yyyy_mm_dd DESC");
  const response = await fetch(u, { headers: { "Accept": "application/json", "User-Agent": "FinanceIntelligenceOS/1.0 public research" }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`CFTC PRE ${response.status}`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("CFTC PRE response was not an array");
  const dates = rows.map(r => r.report_date_as_yyyy_mm_dd).filter(Boolean).sort();
  return { schemaVersion: 1, status: "fresh", provider: "CFTC Public Reporting Environment", report, reportName: dataset.name, dataAsOf: dates.at(-1) || null, retrievedAt: new Date().toISOString(), sourceUrl: dataset.source, access: "public-api-no-token-reported; respect moderate request use", rows };
}
const BLS_SERIES = [
  { id: "CUUR0000SA0", label: "CPI-U · All items", unit: "Index (1982-84=100)", marketContext: "Inflation context; not a tradable price." },
  { id: "CUUR0000SA0L1E", label: "CPI-U · All items less food and energy", unit: "Index (1982-84=100)", marketContext: "Core consumer-price index." },
  { id: "LNS14000000", label: "Unemployment rate", unit: "Percent", marketContext: "US labour-market context." },
  { id: "CES0000000001", label: "Total nonfarm payroll employment", unit: "Thousands of jobs", marketContext: "US employment context; seasonally adjusted series." },
  { id: "WPUFD4", label: "PPI · Final demand", unit: "Index (Nov 2009=100)", marketContext: "Producer-price inflation context." }
];
async function fetchBls() {
  const currentYear = new Date().getUTCFullYear();
  const body = { seriesid: BLS_SERIES.map(s => s.id), startyear: String(currentYear - 4), endyear: String(currentYear) };
  const response = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`BLS ${response.status}`);
  const data = await response.json();
  if (data.status !== "REQUEST_SUCCEEDED") throw new Error("BLS reported request failure");
  const byId = new Map((data.Results?.series || []).map(s => [s.seriesID, s.data || []]));
  const series = BLS_SERIES.map(meta => ({ ...meta, observations: (byId.get(meta.id) || []).filter(o => /^M\d{2}$/.test(o.period || "")).slice(0, 36).map(o => ({ year: o.year, period: o.period, periodName: o.periodName, value: Number(o.value), footnotes: o.footnotes || [] })) }));
  const periods = series.flatMap(s => s.observations.slice(0, 1).map(o => `${o.year}-${o.period}`)).sort();
  return { schemaVersion: 1, status: "fresh", provider: "US Bureau of Labor Statistics Public Data API v1", retrievedAt: new Date().toISOString(), dataAsOf: periods.at(-1) || null, access: "public, no registration; Version 1.0 limits apply", series, notes: ["BLS API v1 returns published historical series values and may lag the original public release.", "This is not a real-time market-price feed or a complete economic calendar.", "Series definitions and units are shown separately; do not compare different index bases directly."] };
}

async function fetchGdelt(spec) {
  const u = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  u.searchParams.set("query", spec.query); u.searchParams.set("mode", "ArtList"); u.searchParams.set("format", "json");
  u.searchParams.set("maxrecords", "20"); u.searchParams.set("sort", "DateDesc"); u.searchParams.set("timespan", "24h");
  const response = await fetch(u, { headers: { "Accept": "application/json", "User-Agent": "FinanceIntelligenceOS/1.0 public research" }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`GDELT ${response.status}`);
  const data = await response.json();
  return { articles: (data.articles || []).map(a => normalizeArticle(a, spec.label)).filter(Boolean) };
}
function normalizeArticle(a, topic) {
  try {
    const u = new URL(a.url); if (!["http:", "https:"].includes(u.protocol)) return null;
    const title = String(a.title || "").replace(/\s+/g, " ").trim(); if (!title) return null;
    return { title: title.slice(0, 800), url: u.href, seendate: String(a.seendate || ""), domain: String(a.domain || u.hostname).slice(0, 255), language: String(a.language || "").slice(0, 30), sourceCountry: String(a.sourceCountry || "").slice(0, 80), topic };
  } catch { return null; }
}
function dedupe(rows) {
  const seen = new Set();
  return rows.filter(a => { const key = String(a.url || "").replace(/\/$/, "").toLowerCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; }).sort((a,b) => String(b.seendate).localeCompare(String(a.seendate)));
}
function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff", ...headers } });
}
