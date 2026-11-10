(() => {
  "use strict";

  const cfg = window.FINANCE_OS_CONFIG || {};
  const API = String(cfg.apiBase || window.FINANCE_OS_API_BASE || "").replace(/\/$/, "");
  const SUPABASE = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const PUBLIC_KEY = String(cfg.supabaseAnonKey || "");
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
  const safeUrl = value => {
    try {
      const url = new URL(String(value || ""), window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  };
  const stateText = value => ({
    fresh:"FRESH SNAPSHOT",partial:"PARTIAL",stale:"STALE SNAPSHOT",
    cached:"CACHED SNAPSHOT",unavailable:"UNAVAILABLE",
    "not-yet-fetched":"NOT YET FETCHED","not-configured":"NOT CONFIGURED",
    "available-on-demand":"AVAILABLE ON REQUEST",unknown:"UNKNOWN"
  })[String(value || "unknown").toLowerCase()] || String(value || "unknown").replaceAll("-", " ").toUpperCase();
  const stateTone = value => {
    const state = String(value || "unknown").toLowerCase();
    return ["fresh","partial"].includes(state) ? "good" :
      ["stale","cached","not-yet-fetched","not-configured","available-on-demand"].includes(state) ? "warn" :
      state === "unknown" || state === "checking" ? "neutral" : "bad";
  };
  const setChip = (id, state, label) => {
    const node = $(id);
    if (!node) return;
    node.className = "os-state-chip " + stateTone(state);
    node.textContent = label || stateText(state);
  };
  const setText = (id, value) => { const node = $(id); if (node) node.textContent = String(value ?? ""); };
  const stamp = value => {
    if (!value) return "timestamp not supplied";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) :
      new Intl.DateTimeFormat("en-IN", {dateStyle:"medium",timeStyle:"short"}).format(date);
  };
  const timeoutSignal = () => typeof AbortSignal !== "undefined" && AbortSignal.timeout
    ? AbortSignal.timeout(16000) : undefined;
  async function api(path, options = {}) {
    if (!API) throw new Error("Public Worker URL is not configured in this deployment.");
    const response = await fetch(API + path, {
      method:options.method || "GET",
      headers:Object.assign({Accept:"application/json"}, options.headers || {}),
      ...(options.body !== undefined ? {body:options.body} : {}),
      signal:timeoutSignal(),
      cache:"no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || ("HTTP " + response.status));
    return data;
  }

  let markets = [];
  let selectedMarket = "";
  let latestArticles = [];
  let userChangedTimezone = false;

  function populateMarkets() {
    const select = $("overviewContract");
    if (!select) return;
    select.innerHTML = markets.map(m =>
      '<option value="' + esc(m.id) + '">' + esc(m.label) + "</option>"
    ).join("");
    if (!markets.length) {
      select.innerHTML = '<option value="">Futures registry unavailable</option>';
      setText("overviewContractName", "Futures registry unavailable");
      setText("overviewContractMeta", "Open Futures Markets to inspect the retained catalogue.");
      return;
    }
    selectedMarket = markets.some(m => m.id === "nq") ? "nq" : markets[0].id;
    select.value = selectedMarket;
    renderSelectedMarket();
  }

  function selected() { return markets.find(m => m.id === selectedMarket) || null; }
  function renderSelectedMarket() {
    const market = selected();
    if (!market) return;
    setText("overviewContractName", market.label);
    setText("overviewContractMeta", [market.exchange, market.tier, "reference metadata only"].filter(Boolean).join(" · "));
    setText("overviewContractRole", market.role || "No additional profile summary is supplied.");
    const specs = $("overviewContractSpecs");
    if (specs) specs.href = "/contract-specs/#" + encodeURIComponent(market.id);
    const profile = $("overviewContractProfile");
    if (profile) profile.href = "/ict-futures/markets/" + encodeURIComponent(market.id) + ".html";
  }

  async function loadMarketRegistry() {
    try {
      const response = await fetch("/ict-futures/data/market-universe.json", {cache:"force-cache",signal:timeoutSignal()});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const payload = await response.json();
      markets = Array.isArray(payload.markets) ? payload.markets : [];
      populateMarkets();
    } catch (error) {
      markets = [];
      populateMarkets();
      setText("overviewQuoteDetail", "The local futures registry could not be loaded: " + error.message);
    }
  }

  function displayArticle(article) {
    const href = safeUrl(article.url || article.link);
    if (!href) return "";
    const date = article.seendate || article.publishedAt || article.published_at || "Publisher time not supplied";
    const source = article.domain || article.source || "Source not supplied";
    return '<a class="os-news-item" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' +
      "<b>" + esc(article.title || "Untitled source item") + "</b>" +
      "<span>" + esc(source) + " · " + esc(date) + "</span></a>";
  }

  function marketNews(articles) {
    const market = selected();
    if (!market) return [];
    const tags = [market.id, market.label, ...(market.news || [])]
      .filter(Boolean).map(x => String(x).toLowerCase());
    const matched = articles.filter(article => {
      const explicit = Array.isArray(article.markets) && article.markets.some(x =>
        String(x).toLowerCase() === market.id.toLowerCase());
      if (explicit) return true;
      const text = [article.title,article.topic,article.domain].join(" ").toLowerCase();
      return tags.some(tag => tag.length > 2 && text.includes(tag));
    });
    return matched;
  }

  async function loadNews(force = false) {
    setChip("overviewNewsBadge", "checking", force ? "REFRESHING" : "CHECKING");
    const list = $("overviewNewsList");
    if (list) list.innerHTML = '<div class="os-loading-state">Requesting the futures news snapshot…</div>';
    try {
      const data = await api("/api/v1/news" + (force ? "?refresh=1" : ""));
      latestArticles = Array.isArray(data.articles) ? data.articles : [];
      const matches = marketNews(latestArticles).slice(0, 5);
      if (list) list.innerHTML = matches.map(displayArticle).filter(Boolean).join("") ||
        '<div class="os-empty-state">No articles matched this selected contract in the currently available snapshot. Try another contract or open the full news research page.</div>';
      const state = data.status || "unknown";
      setChip("overviewNewsBadge", state);
      setText("overviewNewsState", stateText(state));
      setText("overviewNewsStateDetail", "Retrieved: " + stamp(data.lastCheckedAt || data.retrievedAt) +
        " · articles in snapshot: " + latestArticles.length);
      setText("overviewNewsAttribution", "GDELT discovery index · " +
        (data.provider || "provider not supplied") + " · retrieved " +
        stamp(data.lastCheckedAt || data.retrievedAt) +
        " · discovery only, not a complete or licensed newswire.");
    } catch (error) {
      latestArticles = [];
      if (list) list.innerHTML = '<div class="os-error-state">Futures news is unavailable: ' + esc(error.message) + '</div>';
      setChip("overviewNewsBadge", "unavailable");
      setText("overviewNewsState", "UNAVAILABLE");
      setText("overviewNewsStateDetail", error.message);
      setText("overviewNewsAttribution", "No usable snapshot returned. This error is isolated to the news widget.");
    }
  }

  async function loadCot() {
    const market = selected();
    if (!market) return;
    setChip("overviewCotBadge", "checking", "CHECKING");
    setChip("overviewCotState", "checking", "CHECKING");
    try {
      const term = String(market.label || market.id).split("·")[0]
        .replace(/E-mini|Micro/ig, "").trim();
      const data = await api("/api/v1/cot?report=tff&q=" + encodeURIComponent(term));
      const rows = Array.isArray(data.normalizedRows) ? data.normalizedRows :
        (Array.isArray(data.rows) ? data.rows : []);
      const reportDate = data.dataAsOf || data.reportDate || data.report_date || "Not supplied";
      const state = data.status || "unknown";
      const summary = $("overviewCotSummary");
      if (summary) summary.innerHTML = [
        ["Report date", reportDate],
        ["Report type", data.report || "TFF · futures-only"],
        ["Rows returned", rows.length]
      ].map(([label,value]) => '<div><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>').join("");
      setChip("overviewCotBadge", state);
      setChip("overviewCotState", state);
      setText("overviewCotStateDetail", "Weekly CFTC report · retrieved " + stamp(data.lastCheckedAt || data.retrievedAt));
      setText("overviewCotAttribution", "Source: " + (data.provider || "CFTC Public Reporting Environment") +
        " · report date: " + reportDate + " · weekly cadence; not intraday positioning or exchange volume.");
    } catch (error) {
      setChip("overviewCotBadge", "unavailable");
      setChip("overviewCotState", "unavailable");
      setText("overviewCotStateDetail", error.message);
      setText("overviewCotAttribution", "No CFTC snapshot returned. This error is isolated to the positioning widget.");
      const summary = $("overviewCotSummary");
      if (summary) summary.innerHTML = '<div><span>Report date</span><b>—</b></div><div><span>Report type</span><b>TFF</b></div><div><span>Rows returned</span><b>—</b></div>';
    }
  }

  async function loadGateway() {
    setChip("overviewGatewayState", "checking", "CHECKING");
    setChip("overviewHealthBadge", "checking", "CHECKING");
    const results = await Promise.allSettled([
      api("/health"),
      api("/api/v1/providers")
    ]);
    const health = results[0];
    const registry = results[1];
    if (health.status === "fulfilled") {
      const data = health.value;
      const status = data.ok ? "available-on-demand" : "unavailable";
      setChip("overviewGatewayState", status, data.ok ? "GATEWAY RESPONDS" : "UNAVAILABLE");
      setText("overviewGatewayDetail", "Worker response: " + stamp(data.time) +
        " · KV " + (data.storageConfigured ? "configured" : "not configured") +
        " · database " + (data.databaseConfigured ? "configured" : "not configured"));
      setChip("overviewHealthBadge", registry.status === "fulfilled" ? "partial" : status,
        registry.status === "fulfilled" ? "REGISTRY RESPONDS" : "GATEWAY ONLY");
      const providers = registry.status === "fulfilled" && Array.isArray(registry.value.providers)
        ? registry.value.providers : [];
      setText("overviewHealthDetail", providers.length
        ? providers.length + " provider registry entries returned. Inspect each provider's status and freshness in Data Health."
        : "Gateway health responded. Provider registry is unavailable or returned no entries.");
    } else {
      setChip("overviewGatewayState", "unavailable");
      setChip("overviewHealthBadge", "unavailable");
      setText("overviewGatewayDetail", health.reason?.message || "Gateway health request failed.");
      setText("overviewHealthDetail", "Gateway health is unavailable. Provider checks remain separate on the Data Health page.");
    }
  }

  const timezoneKey = "fios.overview.timeZone.v1";
  function initTimezone() {
    const select = $("overviewTimezone");
    if (!select) return;
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    let saved = "";
    try { saved = localStorage.getItem(timezoneKey) || ""; } catch (_) {}
    const options = [...new Set([browserZone,"America/New_York","Asia/Kolkata","UTC"])];
    select.innerHTML = options.map(zone =>
      '<option value="' + esc(zone) + '">' + esc(zone) + (zone === browserZone ? " · browser" : "") + "</option>"
    ).join("");
    select.value = options.includes(saved) ? saved : browserZone;
    $("overviewLocalZoneLabel").textContent = select.value.toUpperCase();
    select.addEventListener("change", () => {
      userChangedTimezone = true;
      try { localStorage.setItem(timezoneKey, select.value); } catch (_) {}
      $("overviewLocalZoneLabel").textContent = select.value.toUpperCase();
      renderClock();
    });
  }

  function renderClock() {
    const select = $("overviewTimezone");
    const zone = select?.value || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const now = new Date();
    const et = new Intl.DateTimeFormat("en-US", {
      timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"
    });
    const local = new Intl.DateTimeFormat("en-US", {
      timeZone:zone,hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"
    });
    setText("overviewClockET", et.format(now));
    setText("overviewDateET", new Intl.DateTimeFormat("en-US", {
      timeZone:"America/New_York",weekday:"short",month:"short",day:"2-digit",year:"numeric"
    }).format(now));
    setText("overviewClockLocal", local.format(now));
    setText("overviewDateLocal", new Intl.DateTimeFormat("en-US", {
      timeZone:zone,weekday:"short",month:"short",day:"2-digit",year:"numeric"
    }).format(now));
    setText("overviewLocalZoneLabel", zone.toUpperCase());
  }

  const sessionKey = "finance-os-supabase-session-v1";
  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) ||
        sessionStorage.getItem(sessionKey) || "null");
    } catch (_) { return null; }
  }
  function saveSession(session) {
    if (!session) return;
    const next = {...session};
    if (!next.expires_at && Number(next.expires_in)) {
      next.expires_at = Math.floor(Date.now()/1000) + Number(next.expires_in);
    }
    try {
      localStorage.setItem(sessionKey, JSON.stringify(next));
      sessionStorage.setItem(sessionKey, JSON.stringify(next));
    } catch (_) {}
    return next;
  }
  function authHeaders(session, extra = {}) {
    return Object.assign({apikey:PUBLIC_KEY}, session?.access_token
      ? {Authorization:"Bearer " + session.access_token} : {}, extra);
  }
  async function refreshSession(session) {
    if (!SUPABASE || !PUBLIC_KEY || !session?.refresh_token) throw new Error("Sign in to load private data.");
    const response = await fetch(SUPABASE + "/auth/v1/token?grant_type=refresh_token", {
      method:"POST",
      headers:authHeaders(null, {"Content-Type":"application/json"}),
      body:JSON.stringify({refresh_token:session.refresh_token}),
      signal:timeoutSignal()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.msg || data.message || "Session refresh failed.");
    return saveSession(data);
  }
  async function privateRequest(path, session) {
    const response = await fetch(SUPABASE + path, {
      headers:authHeaders(session),
      signal:timeoutSignal(),
      cache:"no-store"
    });
    const payload = await response.json().catch(() => []);
    if (!response.ok) {
      const error = new Error(payload.message || payload.msg || ("HTTP " + response.status));
      error.status = response.status;
      throw error;
    }
    return payload;
  }
  async function loadPrivateSummary() {
    const badge = $("overviewPrivateBadge");
    const state = $("overviewPrivateState");
    const metrics = $("overviewPrivateMetrics");
    if (!badge || !state || !metrics) return;
    let session = readSession();
    if (!session?.access_token) {
      setChip("overviewPrivateBadge", "not-configured", "SIGNED OUT");
      state.textContent = "Sign in to load your personal watchlists, journal summary and alert history.";
      metrics.hidden = true;
      return;
    }
    setChip("overviewPrivateBadge", "checking", "CHECKING SESSION");
    state.textContent = "Verifying your authenticated account and loading a limited private summary…";
    try {
      if (session.refresh_token && session.expires_at && Number(session.expires_at) < Date.now()/1000 + 90) {
        session = await refreshSession(session);
      }
      const user = await privateRequest("/auth/v1/user", session).catch(async error => {
        if (error.status === 401 && session.refresh_token) {
          session = await refreshSession(session);
          return privateRequest("/auth/v1/user", session);
        }
        throw error;
      });
      if (!user?.id) throw new Error("Supabase did not return an authenticated user.");
      const headers = {};
      const userFilter = encodeURIComponent("eq." + user.id);
      const params = [
        "/rest/v1/watchlists?select=id,name&order=created_at.desc&limit=50",
        "/rest/v1/journal_trades?select=id,closed_at,net_pnl&order=opened_at.desc.nullslast&limit=100",
        "/rest/v1/alert_events?select=id,triggered_at&order=triggered_at.desc&limit=20",
        "/rest/v1/profiles?select=id,timezone&id=" + userFilter + "&limit=1"
      ];
      const rows = await Promise.all(params.map(path => privateRequest(path, session)));
      const [watchlists,trades,alerts,profiles] = rows;
      const profileZone = profiles?.[0]?.timezone;
      if (profileZone && !userChangedTimezone) applyProfileTimezone(profileZone);
      const closed = (trades || []).filter(row => row.closed_at);
      metrics.innerHTML = [
        ["Watchlists", (watchlists || []).length, "up to 50 recent lists"],
        ["Closed records", closed.length, "from latest 100 journal rows"],
        ["Alert events", (alerts || []).length, "up to 20 recent events"]
      ].map(([label,value,detail]) =>
        '<div><b>' + esc(value) + '</b><span>' + esc(label) + " · " + esc(detail) + "</span></div>"
      ).join("");
      metrics.hidden = false;
      state.textContent = "Private summary loaded with your authenticated Supabase session and existing row-level policies. Counts are bounded to the recent rows noted above.";
      setChip("overviewPrivateBadge", "fresh", "SIGNED IN");
    } catch (error) {
      metrics.hidden = true;
      state.innerHTML = '<span class="os-error-state">' + esc(error.message) + '</span> <a href="/account/">Open sign-in / private workspace →</a>';
      setChip("overviewPrivateBadge", "unavailable", "SESSION NEEDS ATTENTION");
    }
  }
  function applyProfileTimezone(zone) {
    const select = $("overviewTimezone");
    if (!select || userChangedTimezone || !zone) return;
    if (![...select.options].some(option => option.value === zone)) {
      const option = document.createElement("option");
      option.value = zone;
      option.textContent = zone + " · profile";
      select.add(option);
    }
    select.value = zone;
    setText("overviewLocalZoneLabel", zone.toUpperCase());
    renderClock();
  }

  function bindEvents() {
    $("overviewContract")?.addEventListener("change", event => {
      selectedMarket = event.target.value;
      renderSelectedMarket();
      loadNews(false);
      loadCot();
    });
    $("overviewRefresh")?.addEventListener("click", () => {
      loadGateway();
      loadNews(false);
      loadCot();
    });
    $("overviewNewsRefresh")?.addEventListener("click", () => loadNews(true));
  }

  async function init() {
    initTimezone();
    renderClock();
    window.setInterval(renderClock, 1000);
    bindEvents();
    await loadMarketRegistry();
    await Promise.allSettled([loadGateway(),loadNews(false),loadCot(),loadPrivateSummary()]);
    setText("overviewUpdated", "Last source checks: " + new Intl.DateTimeFormat("en-IN", {
      dateStyle:"medium",timeStyle:"short"
    }).format(new Date()));
  }

  init();
})();