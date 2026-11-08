const NEWS_KEY = "snapshot:gdelt:news:v1";
const PROVIDER_STATE_KEY = "provider:gdelt:state:v1";
const ALLOWED_BUILDER_MODELS = new Set(["page", "ict-lesson", "research-article", "glossary"]);
const GDELT_QUERIES = [
  { label: "Index futures & derivatives", query: '(("Nasdaq futures" OR "S&P 500 futures" OR "E-mini" OR "equity index futures") OR (CME OR "Chicago Mercantile Exchange") (futures OR derivatives))' },
  { label: "Gold & metals futures", query: '(("gold futures" OR "silver futures" OR COMEX OR "precious metals") OR (gold OR silver) (futures OR bullion))' },
  { label: "Crude oil & energy futures", query: '(("WTI futures" OR "crude oil futures" OR "natural gas futures" OR NYMEX) OR (Brent OR OPEC) (oil OR futures))' },
  { label: "Treasury & rates futures", query: '(("Treasury futures" OR "SOFR futures" OR "bond futures" OR "Federal Reserve") OR (FOMC OR yields OR rates) (futures OR markets))' },
  { label: "FX & dollar futures", query: '(("Euro FX futures" OR "British pound futures" OR "Japanese yen futures" OR "Dollar Index") OR (forex OR currencies) (futures OR markets))' },
  { label: "Macro releases & central banks", query: '("Federal Reserve" OR FOMC OR inflation OR CPI OR PCE OR payrolls OR NFP OR GDP OR ISM OR "Treasury yields")' },
  { label: "Commodities, supply & geopolitics", query: '(commodities OR metals OR energy OR agriculture) (supply OR inventories OR OPEC OR sanctions OR tariffs OR shipping)' },
  { label: "CFTC positioning & exchange notices", query: '(CFTC OR "Commitments of Traders" OR "CME Group" OR "ICE Futures" OR "exchange notice" OR "clearing advisory")' }
];
const CORS_HEADERS = { "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
export default {
 async fetch(request,env,ctx){
  const url=new URL(request.url);const origin=request.headers.get("Origin")||"";
  const configuredOrigins=(env.ALLOWED_ORIGINS||"https://finance-intelligence-os-whizz444yt-7353.vercel.app,https://finance-intelligence-os-alpha.vercel.app").split(",").map(x=>x.trim()).filter(Boolean);
  const allowed=configuredOrigins.includes("*")?["https://finance-intelligence-os-whizz444yt-7353.vercel.app","https://finance-intelligence-os-alpha.vercel.app"]:configuredOrigins;
  const cors=origin&&(allowed.includes("*")||allowed.includes(origin))?{...CORS_HEADERS,"Access-Control-Allow-Origin":allowed.includes("*")?"*":origin}:CORS_HEADERS;
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
  if(request.method!=="GET")return json({error:"Method not allowed"},405,cors);
  if(url.pathname==="/health"||url.pathname==="/api/v1/health")return json({ok:true,service:"finance-intelligence-os-edge",version:"1.0.3",time:new Date().toISOString(),storageConfigured:Boolean(env.SNAPSHOTS),cmsConfigured:Boolean(env.BUILDER_PUBLIC_API_KEY),databaseConfigured:Boolean(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY)},200,cors);
  if(url.pathname==="/api/v1/providers"){
   const state=env.SNAPSHOTS?await env.SNAPSHOTS.get(PROVIDER_STATE_KEY,"json"):null;
   const macroState=env.SNAPSHOTS?await env.SNAPSHOTS.get("macro:bls:v1","json"):null;
   const cotState=env.SNAPSHOTS?await env.SNAPSHOTS.get("cot:tff:v1","json"):null;
   return json({providers:[
    {id:"gdelt-doc",label:"GDELT DOC API",access:"public-api",state:state||{status:"not-yet-fetched",lastCheckedAt:null},notes:"Discovery coverage is not comprehensive and not a licensed newswire."},
    {id:"bls-v1",label:"US BLS Public Data API v1",access:"public-api-no-registration",state:macroState?{status:macroState.status,dataAsOf:macroState.dataAsOf,retrievedAt:macroState.retrievedAt}:{status:"available-on-demand"}},
    {id:"cftc-pre",label:"CFTC Public Reporting Environment",access:"public-api",state:cotState?{status:cotState.status,dataAsOf:cotState.dataAsOf,retrievedAt:cotState.retrievedAt}:{status:"available-on-demand"}},
    {id:"nyfed-markets",label:"Federal Reserve Bank of New York Markets Data API",access:"public-api-no-key",state:env.SNAPSHOTS?{status:"available-on-demand"}:{status:"not-configured"},notes:"SOFR, EFFR, OBFR and related published reference rates; not live futures prices."},
    {id:"builder-content",label:"Builder.io Content API",access:"public-content-api",state:{status:env.BUILDER_PUBLIC_API_KEY?"configured":"needs-public-space-key"}},
    {id:"builder-admin",label:"Builder.io Admin API",access:"read-only-personal-access-token",state:{status:env.BUILDER_PAT?"configured":"needs-worker-secret"},notes:"Read-only user-scoped PAT; secret stays server-side."},{id:"polymarket",label:"Polymarket Gamma & public CLOB",access:"public-read-api-no-key",state:{status:"available-on-demand"},notes:"Read-only event metadata and indicative outcome prices; no order placement or wallet access."},
    {id:"kalshi",label:"Kalshi public market data",access:"public-read-api-no-key",state:{status:"available-on-demand"},notes:"Read-only markets, bid/ask and volume metadata; no trading endpoints."},
    {id:"cme-rss",label:"CME Group RSS",access:"official-rss-link",state:{status:"official-source-link"},notes:"Use subject to CME RSS terms and attribution requirements."},
    {id:"supabase",label:"Supabase Postgres",access:"server-side-only",state:{status:env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY?"configured":"not-configured"},notes:"No service-role secret is currently bound to this Worker; automatic database writes remain disabled."}
   ]},200,cors);
  }

  if(url.pathname==="/api/v1/builder/models"){
   if(!env.BUILDER_PAT)return json({status:"not-configured",credential:"Add BUILDER_PAT as a Cloudflare Worker secret",scope:"read"},200,cors);
   const spaceKey=String(url.searchParams.get("spaceKey")||"").trim();
   if(!spaceKey||spaceKey.length>128)return json({error:"A valid Builder Space API key is required as the spaceKey query parameter."},400,cors);
   const adminUrl=new URL("https://cdn.builder.io/api/v2/admin");
   adminUrl.searchParams.set("apiKey",spaceKey);
   try{
    const response=await fetch(adminUrl,{method:"POST",headers:{"Authorization":"Bearer "+env.BUILDER_PAT,"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:"query { models { id name kind fields } }"}),signal:AbortSignal.timeout(12000)});
    const data=await response.json();
    if(!response.ok||data.errors)return json({status:"provider-error",provider:"Builder.io Admin API",httpStatus:response.status,error:data.errors||"Builder Admin API request failed"},502,cors);
    const models=Array.isArray(data.data?.models)?data.data.models:[];
    return json({status:"connected",provider:"Builder.io Admin API",access:"read-only",modelCount:models.length,models,retrievedAt:new Date().toISOString()},200,{...cors,"Cache-Control":"private, max-age=60"});
   }catch{return json({status:"unavailable",provider:"Builder.io Admin API",error:"Builder Admin API request could not be completed"},502,cors);}
  }

  if(url.pathname==="/api/v1/news"){
   const snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(NEWS_KEY,"json"):null;
   return json(snapshot||{status:"not-yet-fetched",provider:"GDELT DOC API",lastCheckedAt:null,articles:[],notes:["No edge snapshot exists yet. The configured Cron trigger populates this KV cache after its first successful run."]},200,{...cors,"Cache-Control":"public, max-age=30, s-maxage=60"});
  }

  if(url.pathname==="/api/v1/cot"){
   const report=url.searchParams.get("report")==="disaggregated"?"disaggregated":"tff";
   const market=String(url.searchParams.get("q")||"").slice(0,80).toLowerCase();
   const cacheKey="cot:"+report+":v1";
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(cacheKey,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>6*60*60*1000){
    try{snapshot=await fetchCot(report);if(env.SNAPSHOTS)await env.SNAPSHOTS.put(cacheKey,JSON.stringify(snapshot),{expirationTtl:60*60*8});}
    catch(error){if(!snapshot)return json({status:"unavailable",report,rows:[],sourceUrl:cotSource(report),error:"CFTC PRE request failed"},502,cors);snapshot.status="stale";snapshot.lastError="CFTC PRE refresh failed; showing last successful cache";}
   }
   const rows=market?snapshot.rows.filter(row=>JSON.stringify(row).toLowerCase().includes(market)):snapshot.rows;
   return json({...snapshot,rows,filtered:Boolean(market),query:market||null},200,{...cors,"Cache-Control":"public, max-age=900, s-maxage=1800"});
  }
  if(url.pathname==="/api/v1/macro"){
   const cacheKey="macro:bls:v1";
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(cacheKey,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>6*60*60*1000){
    try{snapshot=await fetchBls();if(env.SNAPSHOTS)await env.SNAPSHOTS.put(cacheKey,JSON.stringify(snapshot),{expirationTtl:60*60*8});}
    catch(error){if(!snapshot)return json({status:"unavailable",provider:"BLS Public Data API v1",series:[],error:"BLS request failed"},502,cors);snapshot.status="stale";}
   }
   return json(snapshot,200,{...cors,"Cache-Control":"public, max-age=1800, s-maxage=3600"});
  }

  if(url.pathname==="/api/v1/macro/funding"){
   const key="macro:nyfed:funding:v1";
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(key,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>60*60*1000){
    try{snapshot=await fetchNyFedFunding();if(env.SNAPSHOTS)await env.SNAPSHOTS.put(key,JSON.stringify(snapshot),{expirationTtl:60*60*4});}
    catch(error){if(!snapshot)return json({status:"unavailable",provider:"Federal Reserve Bank of New York Markets Data API",rates:[],error:"NY Fed reference-rate request failed"},502,cors);snapshot={...snapshot,status:"stale"};}
   }
   return json(snapshot,200,{...cors,"Cache-Control":"public, max-age=900, s-maxage=1800"});
  }
  if(url.pathname.startsWith("/api/v1/prediction/")){
   const provider=url.pathname.split("/").pop();
   if(!["polymarket","kalshi"].includes(provider))return json({error:"Unsupported prediction-market provider"},404,cors);
   const search=String(url.searchParams.get("q")||"").trim().toLowerCase().slice(0,100);
   const cacheKey="prediction:"+provider+":v1";
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(cacheKey,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>5*60*1000){
    try{snapshot=provider==="polymarket"?await fetchPolymarket():await fetchKalshi();if(env.SNAPSHOTS)await env.SNAPSHOTS.put(cacheKey,JSON.stringify(snapshot),{expirationTtl:60*15});}
    catch(error){if(!snapshot)return json({status:"unavailable",provider,items:[],error:"Public market-data request failed"},502,cors);snapshot={...snapshot,status:"stale",lastError:"Provider refresh failed; showing last successful cache"};}
   }
   const items=search?snapshot.items.filter(item=>JSON.stringify(item).toLowerCase().includes(search)):snapshot.items;
   return json({...snapshot,items,filtered:Boolean(search),query:search||null,retrievedAt:snapshot.retrievedAt},200,{...cors,"Cache-Control":"public, max-age=60, s-maxage=120"});
  }

  if(url.pathname.startsWith("/api/v1/cms/")){
   const model=url.pathname.split("/").pop();
   if(!ALLOWED_BUILDER_MODELS.has(model))return json({error:"Model is not allow-listed"},404,cors);
   if(!env.BUILDER_PUBLIC_API_KEY)return json({status:"not-configured",model,results:[]},200,cors);
   const apiUrl=new URL("https://cdn.builder.io/api/v3/content/"+encodeURIComponent(model));
   apiUrl.searchParams.set("apiKey",env.BUILDER_PUBLIC_API_KEY);
   apiUrl.searchParams.set("limit",String(Math.min(50,Math.max(1,Number(url.searchParams.get("limit")||20)))));
   if(url.searchParams.get("urlPath"))apiUrl.searchParams.set("userAttributes.urlPath",url.searchParams.get("urlPath"));
   try{
    const result=await fetch(apiUrl,{headers:{"Accept":"application/json"},cf:{cacheTtl:120,cacheEverything:true}});
    const data=await result.json();
    return json({status:result.ok?"connected":"provider-error",model,results:Array.isArray(data.results)?data.results:[],error:result.ok?undefined:"Builder API returned "+result.status},result.ok?200:502,{...cors,"Cache-Control":"public, max-age=60, s-maxage=120"});
   }catch{return json({status:"unavailable",model,results:[]},502,cors);}
  }
  return json({error:"Not found",routes:["/health","/api/v1/health","/api/v1/providers","/api/v1/news","/api/v1/cot?report=tff|disaggregated","/api/v1/macro","/api/v1/macro/funding","/api/v1/prediction/polymarket","/api/v1/prediction/kalshi","/api/v1/cms/{model}"]},404,cors);
 },
 async scheduled(controller,env,ctx){ctx.waitUntil(refreshNews(env));}
};
async function refreshNews(env){
 if(!env.SNAPSHOTS)return;
 const checkedAt=new Date().toISOString();
 const previous=await env.SNAPSHOTS.get(NEWS_KEY,"json")||{articles:[]};
 const results=await Promise.allSettled(GDELT_QUERIES.map(q=>fetchGdelt(q)));
 const good=results.filter(x=>x.status==="fulfilled");
 const articles=dedupe(good.flatMap(x=>x.value.articles)).slice(0,120);
 const status=articles.length?(good.length===GDELT_QUERIES.length?"fresh":"partial"):(previous.articles?.length?"stale":"unavailable");
 const next={schemaVersion:1,provider:"GDELT DOC API",status,generatedAt:articles.length?checkedAt:previous.generatedAt||null,lastCheckedAt:checkedAt,queryCount:GDELT_QUERIES.length,successfulQueries:good.length,articles:articles.length?articles:(previous.articles||[]),notes:["GDELT is a broad news-discovery index, not a complete newswire.","seendate is GDELT indexing/seen time and may differ from publisher publication time.","Headlines are leads for verification, not trading signals."]};
 await env.SNAPSHOTS.put(NEWS_KEY,JSON.stringify(next),{expirationTtl:60*60*24*3});
 await env.SNAPSHOTS.put(PROVIDER_STATE_KEY,JSON.stringify({status,lastCheckedAt:checkedAt,successfulQueries:good.length,queryCount:GDELT_QUERIES.length,articleCount:next.articles.length}),{expirationTtl:60*60*24*7});
 if(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY&&next.articles.length){
  const rows=next.articles.map(a=>({provider:"GDELT DOC API",title:a.title,url:a.url,domain:a.domain,topic:a.topic,retrieved_at:checkedAt,data_as_of:checkedAt,freshness_status:status,payload:a}));
  const endpoint=env.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1/news_items?on_conflict=provider,url";
  const write=await fetch(endpoint,{method:"POST",headers:{"apikey":env.SUPABASE_SERVICE_ROLE_KEY,"Authorization":"Bearer "+env.SUPABASE_SERVICE_ROLE_KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(rows)});
  if(!write.ok)console.error("Supabase news upsert failed",write.status);
 }
}

const COT_DATASETS={
 tff:{id:"gpe5-46if",name:"TFF Futures Only",source:"https://publicreporting.cftc.gov/Commitments-of-Traders/TFF-Futures-Only/gpe5-46if"},
 disaggregated:{id:"72hh-3qpy",name:"Disaggregated Futures Only",source:"https://publicreporting.cftc.gov/w/72hh-3qpy/default"}
};
function cotSource(report){return COT_DATASETS[report].source;}
async function fetchCot(report){
 const dataset=COT_DATASETS[report];
 const u=new URL("https://publicreporting.cftc.gov/resource/"+dataset.id+".json");
 u.searchParams.set("$limit","200");u.searchParams.set("$order","report_date_as_yyyy_mm_dd DESC");
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.0 public research"},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error("CFTC PRE "+response.status);
 const rows=await response.json();if(!Array.isArray(rows))throw new Error("CFTC PRE response was not an array");
 const dates=rows.map(r=>r.report_date_as_yyyy_mm_dd).filter(Boolean).sort();
 return{schemaVersion:1,status:"fresh",provider:"CFTC Public Reporting Environment",report,reportName:dataset.name,dataAsOf:dates.at(-1)||null,retrievedAt:new Date().toISOString(),sourceUrl:dataset.source,access:"public API; respect moderate request use",rows};
}
const BLS_SERIES=[
 {id:"CUUR0000SA0",label:"CPI-U · All items",unit:"Index (1982-84=100)",marketContext:"Inflation context; not a tradable price."},
 {id:"CUUR0000SA0L1E",label:"CPI-U · All items less food and energy",unit:"Index (1982-84=100)",marketContext:"Core consumer-price index."},
 {id:"LNS14000000",label:"Unemployment rate",unit:"Percent",marketContext:"US labour-market context."},
 {id:"CES0000000001",label:"Total nonfarm payroll employment",unit:"Thousands of jobs",marketContext:"US employment context; seasonally adjusted series."},
 {id:"WPUFD4",label:"PPI · Final demand",unit:"Index (Nov 2009=100)",marketContext:"Producer-price inflation context."}
];
async function fetchBls(){
 const year=new Date().getUTCFullYear();
 const body={seriesid:BLS_SERIES.map(s=>s.id),startyear:String(year-4),endyear:String(year)};
 const response=await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error("BLS "+response.status);
 const data=await response.json();if(data.status!=="REQUEST_SUCCEEDED")throw new Error("BLS request failed");
 const byId=new Map((data.Results?.series||[]).map(s=>[s.seriesID,s.data||[]]));
 const series=BLS_SERIES.map(meta=>({...meta,observations:(byId.get(meta.id)||[]).filter(o=>/^M\d{2}$/.test(o.period||"")).slice(0,36).map(o=>({year:o.year,period:o.period,periodName:o.periodName,value:Number(o.value),footnotes:o.footnotes||[]}))}));
 const periods=series.flatMap(s=>s.observations.slice(0,1).map(o=>String(o.year)+"-"+o.period)).sort();
 return{schemaVersion:1,status:"fresh",provider:"US Bureau of Labor Statistics Public Data API v1",retrievedAt:new Date().toISOString(),dataAsOf:periods.at(-1)||null,access:"public, no registration; Version 1.0 limits apply",series,notes:["BLS API v1 returns published historical series, not a live market-price feed.","Series definitions and units are distinct; do not compare different index bases.","BLS data do not replace the issuer release calendar or timestamps."]};
}

async function fetchGdelt(spec){
 const u=new URL("https://api.gdeltproject.org/api/v2/doc/doc");
 u.searchParams.set("query",spec.query);u.searchParams.set("mode","ArtList");u.searchParams.set("format","json");u.searchParams.set("maxrecords","20");u.searchParams.set("sort","DateDesc");u.searchParams.set("timespan","48h");
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.0 public research"},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error("GDELT "+response.status);
 const data=await response.json();return{articles:(data.articles||[]).map(a=>normalizeArticle(a,spec.label)).filter(Boolean)};
}
function normalizeArticle(a,topic){
 try{const u=new URL(a.url);if(!["http:","https:"].includes(u.protocol))return null;const title=String(a.title||"").replace(/\s+/g," ").trim();if(!title)return null;return{title:title.slice(0,800),url:u.href,seendate:String(a.seendate||""),domain:String(a.domain||u.hostname).slice(0,255),language:String(a.language||"").slice(0,30),sourceCountry:String(a.sourceCountry||"").slice(0,80),topic,markets:matchMarketIds(title+" "+topic)};}catch{return null;}
}
function dedupe(rows){const seen=new Set();return rows.filter(a=>{const key=String(a.url||"").replace(/\/$/,"").toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>String(b.seendate).localeCompare(String(a.seendate)));}

const MARKET_KEYWORDS=[
 ["nq",["nasdaq","nq futures","nasdaq-100","technology stocks"]],
 ["es",["s&p 500","s&p futures","sp500","e-mini s&p"]],
 ["ym",["dow jones","dow futures","djia"]],
 ["rty",["russell 2000","russell futures"]],
 ["gc",["gold","bullion","comex gold"]],
 ["si",["silver","comex silver"]],
 ["cl",["crude oil","wti","brent","nymex crude"]],
 ["ng",["natural gas","henry hub"]],
 ["zn",["treasury futures","10-year yield","10 year treasury","bond yields","sofr"]],
 ["zb",["30-year treasury","long bond"]],
 ["6e",["euro","eur/usd","ecb"]],
 ["6b",["british pound","sterling","gbp/usd","bank of england"]],
 ["6j",["japanese yen","boj","usd/jpy"]],
 ["dx",["us dollar","dollar index","dxy","broad dollar"]]
];
function matchMarketIds(text){const value=String(text||"").toLowerCase();return MARKET_KEYWORDS.filter(([,words])=>words.some(word=>value.includes(word))).map(([id])=>id);}
function parseArray(value){if(Array.isArray(value))return value;if(typeof value==="string"){try{const v=JSON.parse(value);return Array.isArray(v)?v:[];}catch{return[];}}return[];}
async function fetchNyFedFunding(){
 const u="https://markets.newyorkfed.org/api/rates/all/latest.json";
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.1 public research"},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error("NY Fed Markets API "+response.status);
 const data=await response.json();const raw=Array.isArray(data.refRates)?data.refRates:[];
 const rates=raw.filter(r=>["SOFR","EFFR","OBFR","TGCR","BGCR","SOFRAI"].includes(String(r.type||""))).map(r=>({type:String(r.type),effectiveDate:r.effectiveDate||null,percentRate:Number.isFinite(Number(r.percentRate))?Number(r.percentRate):null,average30day:Number.isFinite(Number(r.average30day))?Number(r.average30day):null,average90day:Number.isFinite(Number(r.average90day))?Number(r.average90day):null,average180day:Number.isFinite(Number(r.average180day))?Number(r.average180day):null,volumeInBillions:Number.isFinite(Number(r.volumeInBillions))?Number(r.volumeInBillions):null}));
 return{schemaVersion:1,status:rates.length?"fresh":"unavailable",provider:"Federal Reserve Bank of New York Markets Data API",retrievedAt:new Date().toISOString(),dataAsOf:rates.map(r=>r.effectiveDate).filter(Boolean).sort().at(-1)||null,access:"public reference-rate API; no API key",rates,sourceUrl:u,notes:["Official NY Fed reference rates are published on US business days and are not exchange futures quotes.","The effective date is distinct from the retrieval timestamp; reference rates may reflect the prior business day.","Use of NY Fed reference rates is subject to the NY Fed terms and rate-specific disclaimers."]};
}

async function fetchPolymarket(){
 const u=new URL("https://gamma-api.polymarket.com/events");u.searchParams.set("active","true");u.searchParams.set("closed","false");u.searchParams.set("limit","100");u.searchParams.set("order","volume_24hr");u.searchParams.set("ascending","false");
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.1 public research"},signal:AbortSignal.timeout(14000)});
 if(!response.ok)throw new Error("Polymarket Gamma "+response.status);
 const data=await response.json();if(!Array.isArray(data))throw new Error("Polymarket Gamma response was not an array");
 const items=data.map(event=>({title:String(event.title||event.question||"Untitled event"),slug:String(event.slug||""),url:event.slug?"https://polymarket.com/event/"+event.slug:"https://polymarket.com",volume:Number(event.volume24hr||event.volume||0),volume24hr:Number(event.volume24hr||0),liquidity:Number(event.liquidity||0),endDate:event.endDate||event.endDateIso||null,markets:parseArray(event.markets).slice(0,8).map(m=>({question:String(m.question||m.groupItemTitle||""),slug:String(m.slug||""),outcomes:parseArray(m.outcomes),outcomePrices:parseArray(m.outcomePrices).map(Number),volume:Number(m.volume||0),liquidity:Number(m.liquidity||0),active:m.active!==false,closed:Boolean(m.closed),clobTokenIds:parseArray(m.clobTokenIds)}))})).filter(item=>item.title);
 return{schemaVersion:1,provider:"Polymarket Gamma API",status:"fresh",retrievedAt:new Date().toISOString(),dataAsOf:null,access:"public read-only API; no key required",items,notes:["Gamma event volume/liquidity and outcomePrices are venue-reported metadata, not CME/ICE futures prices.","Outcome prices are indicative probabilities and may be stale or thinly traded.","No wallet, order-entry or execution endpoints are connected."]};
}
async function fetchKalshi(){
 const u=new URL("https://external-api.kalshi.com/trade-api/v2/markets");u.searchParams.set("status","open");u.searchParams.set("limit","100");u.searchParams.set("mve_filter","exclude");
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.1 public research"},signal:AbortSignal.timeout(14000)});
 if(!response.ok)throw new Error("Kalshi public markets "+response.status);
 const data=await response.json();if(!Array.isArray(data.markets))throw new Error("Kalshi response did not include markets");
 const items=data.markets.map(m=>({title:String(m.title||m.subtitle||m.ticker||"Untitled market"),ticker:String(m.ticker||""),eventTicker:String(m.event_ticker||""),yesBid:Number(m.yes_bid_dollars??m.yes_bid??NaN),yesAsk:Number(m.yes_ask_dollars??m.yes_ask??NaN),lastPrice:Number(m.last_price_dollars??m.last_price??NaN),volume24h:Number(m.volume_24h_fp??m.volume_24h??0),volume:Number(m.volume_fp??m.volume??0),liquidity:Number(m.liquidity_dollars??0),closeTime:m.close_time||m.expected_expiration_time||null,updatedAt:m.updated_time||null,url:"https://kalshi.com/markets"})).filter(item=>item.ticker&&item.title);
 return{schemaVersion:1,provider:"Kalshi public Trade API v2",status:"fresh",retrievedAt:new Date().toISOString(),dataAsOf:null,access:"public read-only market-data endpoint; no key required",items,notes:["YES bid/ask and volume are Kalshi event-contract data, not exchange futures prices.","Displayed market probabilities are venue-specific and may be thinly traded.","No portfolio, wallet or order-entry endpoints are connected."]};
}

function json(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json; charset=utf-8","X-Content-Type-Options":"nosniff",...headers}});}
