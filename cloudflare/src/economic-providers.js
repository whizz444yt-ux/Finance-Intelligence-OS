const USER_AGENT = "FinanceIntelligenceOS/2.0 public economic research";

function canonicalSource(value) { const u = new URL(value); u.searchParams.delete("api_key"); u.searchParams.delete("UserID"); return u.origin + u.pathname; }

function finiteNumber(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || ["(NA)", "(D)", "(Z)", "(M)", "--", ".", "N/A"].includes(text.toUpperCase())) return null;
  const cleaned = text.replace(/,/g, "").replace(/%$/, "").trim();
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function observationDate(value, frequency) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}$/.test(text)) return text + "-01";
  if (/^\d{4}Q[1-4]$/i.test(text)) return text.slice(0, 4) + "-" + String((Number(text.slice(5)) - 1) * 3 + 1).padStart(2, "0") + "-01";
  if (/^\d{4}M\d{2}$/i.test(text)) return text.slice(0, 4) + "-" + text.slice(5, 7) + "-01";
  if (/^\d{4}$/.test(text)) return text + "-01-01";
  if (/^\d{4}W\d{2}$/i.test(text)) {
    const year = Number(text.slice(0, 4)), week = Number(text.slice(5));
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const weekday = jan4.getUTCDay() || 7;
    const monday = new Date(Date.UTC(year, 0, 4 - weekday + 1 + (week - 1) * 7));
    return monday.toISOString().slice(0, 10);
  }
  return null;
}

function record(provider, datasetId, seriesId, seriesName, frequency, date, value, unit, sourceUrl, rawPayload, countryCode = "US") {
  const parsedDate = observationDate(date, frequency);
  if (!parsedDate) return null;
  return {
    provider, dataset_id: datasetId, series_id: String(seriesId), series_name: String(seriesName),
    country_code: countryCode, frequency, observation_date: parsedDate,
    value: finiteNumber(value), unit: unit || null, data_as_of: parsedDate,
    published_at: null, vintage_start: null, vintage_end: null,
    source_url: sourceUrl, freshness_status: "fresh",
    raw_payload: rawPayload && typeof rawPayload === "object" ? rawPayload : { source_value: rawPayload }
  };
}

async function getJson(url, provider, timeout = 18000) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(timeout)
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error(provider + " returned non-JSON HTTP " + response.status); }
  if (!response.ok) {
    const message = body?.error?.message || body?.error || body?.message || ("HTTP " + response.status);
    throw new Error(provider + " request failed: " + String(message).slice(0, 240));
  }
  return body;
}

function notConfigured(provider, credential, sourceUrl, notes) {
  return {
    schemaVersion: 1, provider, status: "not-configured", retrievedAt: new Date().toISOString(),
    dataAsOf: null, sourceUrl, datasetId: null, records: [], requestCount: 0,
    credentialRequired: credential, notes: [...(notes || []), "Add " + credential + " as a Cloudflare Worker secret. The provider has not been queried."]
  };
}

async function fetchBea(env) {
  const sourceUrl = "https://apps.bea.gov/api/data/";
  if (!env.BEA_API_KEY) return notConfigured("BEA", "BEA_API_KEY", sourceUrl, ["BEA requires a registered 36-character UserID."]);
  const url = new URL(sourceUrl);
  for (const [key, value] of Object.entries({
    UserID: env.BEA_API_KEY, method: "GetData", datasetname: "NIPA",
    TableName: "T10101", Frequency: "Q", Year: Array.from({ length: new Date().getUTCFullYear() - 2009 }, (_, i) => String(2010 + i)).join(","), ResultFormat: "JSON"
  })) url.searchParams.set(key, value);
  const body = await getJson(url, "BEA");
  const api = body.BEAAPI;
  if (api?.Error || api?.Results?.Error) throw new Error("BEA returned an API error");
  const rows = api?.Results?.Data;
  if (!Array.isArray(rows)) throw new Error("BEA response did not contain NIPA Data rows");
  const records = rows.map(row => record(
    "bea", "NIPA:T10101", "T10101:" + (row.SeriesCode || row.LineNumber || row.LineDescription),
    row.LineDescription || "NIPA T10101 series", "quarterly", row.TimePeriod,
    row.DataValue, row.CL_UNIT || null, canonicalSource(url.toString()),
    { ...row, unitMultiplier: row.UNIT_MULT || null }
  )).filter(Boolean);
  return snapshot("BEA", "NIPA:T10101", records, canonicalSource(url.toString()), 1, [
    "NIPA Table T10101 is requested at quarterly frequency.",
    "Values are stored as published by BEA; UNIT_MULT and CL_UNIT are retained in raw_payload and values are not rescaled.",
    "GDP national-accounts figures are subject to revisions and are not live market prices."
  ]);
}

async function fetchEia(env) {
  const sourceUrl = "https://api.eia.gov/v2/seriesid/PET.WCESTUS1.W";
  if (!env.EIA_API_KEY) return notConfigured("EIA", "EIA_API_KEY", sourceUrl, ["EIA API v2 requires a registered API key."]);
  const url = new URL(sourceUrl);
  url.searchParams.set("api_key", env.EIA_API_KEY);
  url.searchParams.set("length", "1000");
  url.searchParams.set("sort[0][column]", "period");
  url.searchParams.set("sort[0][direction]", "desc");
  const body = await getJson(url, "EIA");
  const response = body.response || {};
  const rows = Array.isArray(response.data) ? response.data : Array.isArray(body.data) ? body.data : [];
  if (!rows.length) throw new Error("EIA series route returned no data rows");
  const records = rows.map(row => record(
    "eia", "PET.WCESTUS1.W", "PET.WCESTUS1.W",
    "US ending stocks of crude oil including the Strategic Petroleum Reserve",
    "weekly", row.period, row.value, row.units || row.unit || "provider-reported units",
    canonicalSource(url.toString()), row
  )).filter(Boolean);
  return snapshot("EIA", "PET.WCESTUS1.W", records, canonicalSource(url.toString()), 1, [
    "Series PET.WCESTUS1.W is the selected US weekly crude-oil stocks series.",
    "The value and units are taken from the EIA response; no conversion is applied.",
    "Weekly inventory releases are not intraday futures volume or order-book data."
  ]);
}

const FRED_SERIES = [
  { id: "DFF", name: "Effective Federal Funds Rate", frequency: "daily", unit: "percent" },
  { id: "DGS10", name: "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity", frequency: "daily", unit: "percent" },
  { id: "CPIAUCSL", name: "Consumer Price Index for All Urban Consumers: All Items", frequency: "monthly", unit: "index 1982-84=100" },
  { id: "UNRATE", name: "Unemployment Rate", frequency: "monthly", unit: "percent" },
  { id: "PCEPI", name: "Personal Consumption Expenditures: Chain-type Price Index", frequency: "monthly", unit: "index; see FRED series metadata" }
];

async function fetchFred(env) {
  const sourceUrl = "https://api.stlouisfed.org/fred/series/observations";
  if (!env.FRED_API_KEY) return notConfigured("FRED", "FRED_API_KEY", sourceUrl, ["FRED Web Services requires a registered API key."]);
  const results = await Promise.allSettled(FRED_SERIES.map(async meta => {
    const url = new URL(sourceUrl);
    url.searchParams.set("api_key", env.FRED_API_KEY);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("series_id", meta.id);
    url.searchParams.set("observation_start", "2010-01-01");
    url.searchParams.set("limit", "1000");
    url.searchParams.set("sort_order", "desc");
    const rows = []; let requestCount = 0;
    for (let offset = 0; offset < 5000; offset += 1000) {
      requestCount += 1;
      url.searchParams.set("offset", String(offset));
      const body = await getJson(url, "FRED");
      const page = Array.isArray(body.observations) ? body.observations : [];
      rows.push(...page);
      if (page.length < 1000 || (body.count !== undefined && offset + page.length >= Number(body.count))) break;
    }
    return { rows: rows.map(row => record(
      "fred", "fred:series_observations", meta.id, meta.name, meta.frequency,
      row.date, row.value, meta.unit, canonicalSource(url.toString()), row
    )).filter(Boolean), requestCount };
  }));
  const successful = results.filter(x => x.status === "fulfilled");
  const records = successful.flatMap(x => x.value.rows);
  const requestCount = successful.reduce((sum, x) => sum + x.value.requestCount, 0);
  if (!records.length) throw new Error("FRED returned no usable observations for the configured series set");
  return {
    ...snapshot("FRED", "fred:series_observations", records, sourceUrl, requestCount, [
      "Five explicitly listed FRED series are requested independently.",
      "Unsuccessful individual series are reported in provider notes; missing values are not converted to zero.",
      "FRED observation histories can be revised. Vintage-aware backtesting requires explicit realtime/vintage parameters."
    ]),
    status: successful.length === FRED_SERIES.length ? "fresh" : "partial",
    seriesResults: results.map((x, i) => ({ seriesId: FRED_SERIES[i].id, status: x.status === "fulfilled" ? "success" : "failed", error: x.status === "rejected" ? String(x.reason?.message || "Request failed").slice(0, 180) : null })),
    requestCount: FRED_SERIES.length
  };
}

async function fetchTreasury() {
  const sourceUrl = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates";
  const url = new URL(sourceUrl);
  url.searchParams.set("fields", "record_date,security_desc,security_type_desc,avg_interest_rate_amt");
  url.searchParams.set("filter", "security_type_desc:eq:Marketable");
  url.searchParams.set("sort", "-record_date");
  url.searchParams.set("page[size]", "1000");
  const rows = []; let requestCount = 0;
  for (let page = 1; page <= 5; page += 1) {
    url.searchParams.set("page[number]", String(page));
    const body = await getJson(url, "US Treasury Fiscal Data");
    const data = Array.isArray(body.data) ? body.data : [];
    requestCount += 1; rows.push(...data);
    if (data.length < 1000) break;
  }
  if (!rows.length) throw new Error("Treasury Fiscal Data returned no average-interest-rate rows");
  const records = rows.map(row => record(
    "us_treasury", "avg_interest_rates", "avg_interest_rates:" + (row.security_desc || "unknown"),
    "Average interest rate on " + (row.security_desc || "US Treasury securities"),
    "monthly", row.record_date, row.avg_interest_rate_amt, "percent",
    canonicalSource(url.toString()), row
  )).filter(Boolean);
  return snapshot("US Treasury Fiscal Data", "avg_interest_rates", records, canonicalSource(url.toString()), requestCount, [
    "This dataset reports monthly average interest rates paid on outstanding Treasury securities by security description.",
    "It is not the daily Treasury par yield curve or a real-time traded yield."
  ]);
}

function parseEcb(body, sourceUrl) {
  const dataSet = body?.dataSets?.[0];
  const dimensions = body?.structure?.dimensions?.observation?.[0]?.values || [];
  const seriesMap = dataSet?.series || {};
  const records = [];
  for (const [seriesKey, series] of Object.entries(seriesMap)) {
    const observations = series?.observations || {};
    for (const [index, raw] of Object.entries(observations)) {
      const dimension = dimensions[Number(index)];
      const date = dimension?.id || dimension?.name || null;
      const value = Array.isArray(raw) ? raw[0] : raw;
      const row = record(
        "ecb", "EXR", "EXR:D.USD.EUR.SP00.A:" + seriesKey,
        "ECB daily exchange-rate reference series (USD/EUR key D.USD.EUR.SP00.A)",
        "daily", date, value, "ECB series units; see official SDMX attributes",
        sourceUrl, { seriesKey, observation: raw, period: date }, "EU"
      );
      if (row) records.push(row);
    }
  }
  return records;
}

async function fetchEcb() {
  const sourceUrl = "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A";
  const url = new URL(sourceUrl);
  url.searchParams.set("lastNObservations", "1000");
  url.searchParams.set("format", "jsondata");
  url.searchParams.set("detail", "dataonly");
  const body = await getJson(url, "ECB Data Portal");
  const records = parseEcb(body, canonicalSource(url.toString()));
  if (!records.length) throw new Error("ECB SDMX JSON contained no observation rows in the expected dimensions");
  return snapshot("ECB", "EXR", records, url.toString(), 1, [
    "The ECB Data Portal SDMX series key D.USD.EUR.SP00.A is used.",
    "Series key, period dimension and raw observation attributes are retained; no inverse currency conversion is applied.",
    "The latest ECB business-day reference observation is not a live FX quote."
  ]);
}

function snapshot(provider, datasetId, records, sourceUrl, requestCount, notes) {
  const dates = records.map(row => row.observation_date).filter(Boolean).sort();
  const bySeries = new Map();
  for (const row of records) {
    const item = bySeries.get(row.series_id) || { seriesId: row.series_id, seriesName: row.series_name, frequency: row.frequency, unit: row.unit, records: 0 };
    item.records += 1;
    bySeries.set(row.series_id, item);
  }
  return {
    schemaVersion: 1, provider, status: "fresh", datasetId, retrievedAt: new Date().toISOString(),
    dataAsOf: dates.at(-1) || null, sourceUrl, requestCount,
    series: [...bySeries.values()], records, notes
  };
}

export async function fetchEconomicProvider(provider, env) {
  switch (provider) {
    case "bea": return await fetchBea(env);
    case "eia": return await fetchEia(env);
    case "fred": return await fetchFred(env);
    case "us_treasury": return await fetchTreasury();
    case "ecb": return await fetchEcb();
    default: throw new Error("Unsupported economic data provider");
  }
}

export const ECONOMIC_PROVIDER_CONFIG = {
  bea: { label: "Bureau of Economic Analysis", credential: "BEA_API_KEY", ttlSeconds: 21600, cadence: "quarterly / release-driven" },
  eia: { label: "Energy Information Administration", credential: "EIA_API_KEY", ttlSeconds: 21600, cadence: "weekly" },
  fred: { label: "Federal Reserve Economic Data", credential: "FRED_API_KEY", ttlSeconds: 21600, cadence: "series-specific" },
  us_treasury: { label: "US Treasury Fiscal Data", credential: null, ttlSeconds: 43200, cadence: "monthly for average interest rates" },
  ecb: { label: "European Central Bank Data Portal", credential: null, ttlSeconds: 21600, cadence: "daily business-day reference data" }
};
