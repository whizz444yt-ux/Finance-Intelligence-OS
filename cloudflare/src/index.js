import { ECONOMIC_PROVIDER_CONFIG, fetchEconomicProvider } from "./economic-providers.js";

const NEWS_KEY = "snapshot:gdelt:news:v1";
const NEWS_REFRESH_LOCK_KEY = "lock:gdelt:manual-refresh:v1";
const PROVIDER_STATE_KEY = "provider:gdelt:state:v1";
const ALLOWED_BUILDER_MODELS = new Set(["page", "ict-lesson", "research-article", "glossary"]);
const GDELT_QUERY = {
 label: "Finance futures, macro & commodities",
 query: '("Nasdaq futures" OR "S&P 500 futures" OR "E-mini" OR "equity index futures" OR "gold futures" OR "silver futures" OR COMEX OR "WTI futures" OR "crude oil futures" OR "natural gas futures" OR NYMEX OR "Treasury futures" OR "SOFR futures" OR FOMC OR inflation OR CPI OR PCE OR payrolls OR NFP OR GDP OR ISM OR OPEC OR commodities OR metals OR energy OR agriculture OR CFTC OR "Commitments of Traders" OR "CME Group" OR "ICE Futures" OR "central bank")'
};
const CORS_HEADERS = { "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Vary": "Origin" };
function supabaseAdminKey(env){
 return env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY||"";
}
function supabaseApiHeaders(env){
 const key=supabaseAdminKey(env);
 return{apikey:key,...(key.startsWith("sb_secret_")?{}:{Authorization:"Bearer "+key})};
}

export default {
 async fetch(request,env,ctx){
  const url=new URL(request.url);const origin=request.headers.get("Origin")||"";
  const configuredOrigins=(env.ALLOWED_ORIGINS||"https://finance-intelligence-os-whizz444yt-7353.vercel.app,https://finance-intelligence-os-alpha.vercel.app").split(",").map(x=>x.trim()).filter(Boolean);
  const allowed=configuredOrigins.includes("*")?["https://finance-intelligence-os-whizz444yt-7353.vercel.app","https://finance-intelligence-os-alpha.vercel.app"]:configuredOrigins;
  const cors=origin&&(allowed.includes("*")||allowed.includes(origin))?{...CORS_HEADERS,"Access-Control-Allow-Origin":allowed.includes("*")?"*":origin}:CORS_HEADERS;
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
  if(request.method!=="GET"&&!(request.method==="POST"&&url.pathname==="/api/v1/ingest"))return json({error:"Method not allowed"},405,cors);
  if(request.method==="POST"&&url.pathname==="/api/v1/ingest"){
   if(!env.INGEST_TOKEN)return json({status:"not-configured",error:"INGEST_TOKEN is not configured on the Worker"},503,cors);
   if(request.headers.get("Authorization")!=="Bearer "+env.INGEST_TOKEN)return json({error:"Unauthorized"},401,cors);
   let payload={};try{payload=await request.json();}catch{return json({error:"Invalid JSON body"},400,cors);}
   const requested=payload.provider==="all"?Object.keys(ECONOMIC_PROVIDER_CONFIG):[String(payload.provider||"")];
   if(!requested.length||requested.some(p=>!Object.prototype.hasOwnProperty.call(ECONOMIC_PROVIDER_CONFIG,p)))return json({error:"provider must be one of "+Object.keys(ECONOMIC_PROVIDER_CONFIG).join(", ")+" or all"},400,cors);
   const results=await Promise.all(requested.map(async provider=>({provider,...await ingestEconomicProvider(provider,env,true)})));
   return json({status:results.every(x=>x.status==="fresh")?"fresh":results.some(x=>["fresh","partial"].includes(x.status))?"partial":"unavailable",results},200,cors);
  }
  if(url.pathname==="/health"||url.pathname==="/api/v1/health")return json({ok:true,service:"finance-intelligence-os-edge",version:"2.0.0",time:new Date().toISOString(),storageConfigured:Boolean(env.SNAPSHOTS),cmsConfigured:Boolean(env.BUILDER_PUBLIC_API_KEY),databaseConfigured:Boolean(env.SUPABASE_URL&&supabaseAdminKey(env)),economicProviders:Object.keys(ECONOMIC_PROVIDER_CONFIG).length,ingestionTokenConfigured:Boolean(env.INGEST_TOKEN)},200,cors);
  if(url.pathname==="/api/v1/providers"){
   const state=env.SNAPSHOTS?await env.SNAPSHOTS.get(PROVIDER_STATE_KEY,"json"):null;
   const macroState=env.SNAPSHOTS?await env.SNAPSHOTS.get("macro:bls:v1","json"):null;
   const cotKeys=env.SNAPSHOTS?await env.SNAPSHOTS.list({prefix:"cot:tff:v2:",limit:1}):{keys:[]};
   const cotState=env.SNAPSHOTS&&cotKeys.keys?.length?await env.SNAPSHOTS.get(cotKeys.keys[0].name,"json"):null;
   return json({providers:[
    {id:"gdelt-doc",label:"GDELT DOC API",access:"public-api",state:state||{status:"not-yet-fetched",lastCheckedAt:null},notes:"Discovery coverage is not comprehensive and not a licensed newswire."},
    {id:"bls-v1",label:"US BLS Public Data API v1",access:"public-api-no-registration",state:macroState?{status:macroState.status,dataAsOf:macroState.dataAsOf,retrievedAt:macroState.retrievedAt}:{status:"available-on-demand"}},
    {id:"cftc-pre",label:"CFTC Public Reporting Environment",access:"public-api",state:cotState?{status:cotState.status,dataAsOf:cotState.dataAsOf,retrievedAt:cotState.retrievedAt}:{status:"available-on-demand"}},
    {id:"nyfed-markets",label:"Federal Reserve Bank of New York Markets Data API",access:"public-api-no-key",state:env.SNAPSHOTS?{status:"available-on-demand"}:{status:"not-configured"},notes:"SOFR, EFFR, OBFR and related published reference rates; not live futures prices."},
    {id:"builder-content",label:"Builder.io Content API",access:"public-content-api",state:{status:env.BUILDER_PUBLIC_API_KEY?"configured":"needs-public-space-key"}},
    {id:"builder-admin",label:"Builder.io Admin API",access:"read-only-personal-access-token",state:{status:env.BUILDER_PAT?"configured":"needs-worker-secret"},notes:"Read-only user-scoped PAT; secret stays server-side."},{id:"polymarket",label:"Polymarket Gamma & public CLOB",access:"public-read-api-no-key",state:{status:"available-on-demand"},notes:"Read-only event metadata and indicative outcome prices; no order placement or wallet access."},
    {id:"kalshi",label:"Kalshi public market data",access:"public-read-api-no-key",state:{status:"available-on-demand"},notes:"Read-only markets, bid/ask and volume metadata; no trading endpoints."},
    {id:"cme-rss",label:"CME Group RSS",access:"official-rss-link",state:{status:"official-source-link"},notes:"Use subject to CME RSS terms and attribution requirements."},
    {id:"bea",label:"Bureau of Economic Analysis",access:"registered-api-key",state:await getEconomicProviderState(env,"bea"),notes:"BEA NIPA quarterly national-accounts data; BEA_API_KEY required."},
    {id:"eia",label:"US Energy Information Administration",access:"registered-api-key",state:await getEconomicProviderState(env,"eia"),notes:"Weekly US crude-oil stocks series PET.WCESTUS1.W; EIA_API_KEY required."},
    {id:"fred",label:"Federal Reserve Economic Data",access:"registered-api-key",state:await getEconomicProviderState(env,"fred"),notes:"Daily and monthly macro histories; FRED_API_KEY required."},
    {id:"us-treasury",label:"US Treasury Fiscal Data",access:"public-api-no-key",state:await getEconomicProviderState(env,"us_treasury"),notes:"Monthly average interest rates on marketable Treasury securities; not the daily par yield curve."},
    {id:"ecb",label:"European Central Bank Data Portal",access:"public-sdmx-api-no-key",state:await getEconomicProviderState(env,"ecb"),notes:"Daily USD/EUR reference exchange-rate series; not a live FX quote."},
    {id:"supabase",label:"Supabase Postgres",access:"server-side-only",state:{status:env.SUPABASE_URL&&supabaseAdminKey(env)?"configured":"not-configured"},notes:"Server-side ingestion writes only; browser roles cannot write economic observations or ingestion logs."}
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
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(NEWS_KEY,"json"):null;
   let refreshStatus="not-requested";
   if(url.searchParams.get("refresh")==="1"){
    if(!env.SNAPSHOTS)return json({status:"not-configured",provider:"GDELT DOC API",articles:[],refresh:{status:"storage-unavailable"}},503,cors);
    const lastChecked=Date.parse(snapshot?.lastCheckedAt||"");
    const coolingDown=Number.isFinite(lastChecked)&&Date.now()-lastChecked<5*60*1000;
    const running=await env.SNAPSHOTS.get(NEWS_REFRESH_LOCK_KEY);
    if(coolingDown)refreshStatus="cooldown";
    else if(running)refreshStatus="in-progress";
    else{
     await env.SNAPSHOTS.put(NEWS_REFRESH_LOCK_KEY,new Date().toISOString(),{expirationTtl:300});
     ctx.waitUntil(refreshNews(env).finally(()=>env.SNAPSHOTS.delete(NEWS_REFRESH_LOCK_KEY)));
     refreshStatus="queued";
    }
   }
   const base=snapshot||{status:"not-yet-fetched",provider:"GDELT DOC API",lastCheckedAt:null,articles:[],notes:["No edge snapshot exists yet. The configured Cron trigger populates this KV cache after its first successful run."]};
   return json({...base,refresh:{status:refreshStatus,cooldownSeconds:300}},200,{...cors,"Cache-Control":url.searchParams.get("refresh")==="1"?"no-store":"public, max-age=30, s-maxage=60"});
  }

  if(url.pathname==="/api/v1/volume-open-interest"){
   const report=url.searchParams.get("report")==="disaggregated"?"disaggregated":"tff";
   const market=String(url.searchParams.get("q")||"").slice(0,80).trim();
   if(market.length<3)return json({status:"invalid-query",observations:[],error:"Supply a CFTC contract-market search term of at least three characters."},400,cors);
   const marketKey=market.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"market";
   const cacheKey="voi:"+report+":v1:"+marketKey;
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(cacheKey,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>6*60*60*1000){
    try{
     const cot=await fetchCot(report,market);
     const observations=(cot.rows||[]).map(row=>({
      marketName:row.contract_market_name||row.market_and_exchange_names||row.contract_name||"Contract",
      reportDate:row.report_date_as_yyyy_mm_dd||row.report_date||null,
      openInterest:asNumberOrNull(row.open_interest_all??row.open_interest)
     })).filter(row=>row.reportDate&&row.openInterest!==null).sort((a,b)=>String(a.reportDate).localeCompare(String(b.reportDate)));
     snapshot={schemaVersion:1,status:cot.status,provider:cot.provider,report,reportName:cot.reportName,query:market,dataAsOf:cot.dataAsOf,retrievedAt:cot.retrievedAt,sourceUrl:cot.sourceUrl,cadence:"weekly",metric:"open_interest",unit:"contracts",observations,volume:{status:"not-connected",metric:"exchange_traded_volume",reason:"CFTC COT does not provide the daily/intraday exchange volume series required by this module."}};
     if(env.SNAPSHOTS)await env.SNAPSHOTS.put(cacheKey,JSON.stringify(snapshot),{expirationTtl:60*60*8});
    }catch(error){
     if(!snapshot)return json({status:"unavailable",provider:"CFTC Public Reporting Environment",report,query:market,observations:[],volume:{status:"not-connected"},error:"CFTC open-interest request failed"},502,cors);
     snapshot={...snapshot,status:"stale",lastError:"CFTC refresh failed; showing last successful open-interest snapshot."};
    }
   }
   return json(snapshot,200,{...cors,"Cache-Control":"public, max-age=900, s-maxage=1800"});
  }

  if(url.pathname==="/api/v1/cot"){
   const report=url.searchParams.get("report")==="disaggregated"?"disaggregated":"tff";
   const market=String(url.searchParams.get("q")||"").slice(0,80).toLowerCase();
   const marketKey=market.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"all";
   const cacheKey="cot:"+report+":v2:"+marketKey;
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(cacheKey,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>6*60*60*1000){
    try{snapshot=await fetchCot(report,market);if(env.SNAPSHOTS)await env.SNAPSHOTS.put(cacheKey,JSON.stringify(snapshot),{expirationTtl:60*60*8});}
    catch(error){if(!snapshot)return json({status:"unavailable",report,rows:[],sourceUrl:cotSource(report),error:"CFTC PRE request failed"},502,cors);snapshot.status="stale";snapshot.lastError="CFTC PRE refresh failed; showing last successful cache";}
   }
   const rows=market?snapshot.rows.filter(row=>JSON.stringify(row).toLowerCase().includes(market)):snapshot.rows;
   const normalizedRows=(snapshot.normalizedRows||normalizeCotRows(snapshot.rows||[],report)).filter(row=>!market||String(row.contractName+" "+row.traderCategory).toLowerCase().includes(market));
   return json({...snapshot,rows,normalizedRows,filtered:Boolean(market),query:market||null},200,{...cors,"Cache-Control":"public, max-age=900, s-maxage=1800"});
  }
  if(url.pathname==="/api/v1/macro"){
   const cacheKey="macro:bls:v1";
   let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(cacheKey,"json"):null;
   if(!snapshot||!snapshot.retrievedAt||Date.now()-Date.parse(snapshot.retrievedAt)>6*60*60*1000){
    try{snapshot=await fetchBls();if(env.SNAPSHOTS)await env.SNAPSHOTS.put(cacheKey,JSON.stringify(snapshot),{expirationTtl:60*60*8});}
    catch(error){if(!snapshot)return json({status:"unavailable",provider:"BLS Public Data API v1",series:[],error:"BLS request failed: "+String(error.message||error).slice(0,180)},502,cors);snapshot={...snapshot,status:"stale",lastError:"BLS refresh failed; serving the last successful snapshot."};}
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
  if(url.pathname==="/api/v1/economic/history"){
   if(!env.SUPABASE_URL||!supabaseAdminKey(env))return json({status:"not-configured",observations:[],error:"Server-side Supabase credentials are not configured."},503,cors);
   const provider=String(url.searchParams.get("provider")||"").toLowerCase();
   if(!Object.prototype.hasOwnProperty.call(ECONOMIC_PROVIDER_CONFIG,provider))return json({error:"A supported provider is required."},400,cors);
   const seriesId=String(url.searchParams.get("series_id")||"").trim();
   if(seriesId.length>160)return json({error:"series_id is too long."},400,cors);
   const startDate=String(url.searchParams.get("start_date")||"");
   const endDate=String(url.searchParams.get("end_date")||"");
   const datePattern=/^\d{4}-\d{2}-\d{2}$/;
   const validDate=value=>{if(!datePattern.test(value))return false;const parsed=new Date(value+"T00:00:00Z");return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;};
   if((startDate&&!validDate(startDate))||(endDate&&!validDate(endDate))||(startDate&&endDate&&startDate>endDate))return json({error:"Dates must be valid YYYY-MM-DD values and start_date must not follow end_date."},400,cors);
   const parsedLimit=Number(url.searchParams.get("limit")||1000),limit=Number.isInteger(parsedLimit)?Math.min(5000,Math.max(1,parsedLimit)):1000;
   const parsedOffset=Number(url.searchParams.get("offset")||0),offset=Number.isInteger(parsedOffset)?Math.min(1000000,Math.max(0,parsedOffset)):0;
   const query=new URLSearchParams({select:"provider,dataset_id,series_id,series_name,country_code,frequency,observation_date,value,unit,data_as_of,published_at,retrieved_at,source_url,freshness_status"});
   query.set("provider","eq."+provider);
   if(seriesId)query.set("series_id","eq."+seriesId);
   if(startDate&&endDate)query.set("and","(observation_date.gte."+startDate+",observation_date.lte."+endDate+")");
   else if(startDate)query.set("observation_date","gte."+startDate);
   else if(endDate)query.set("observation_date","lte."+endDate);
   query.set("order","series_id.asc,observation_date.asc");
   query.set("limit",String(limit));query.set("offset",String(offset));
   try{
    const observations=await supabaseRequest(env,"economic_observations","GET",query.toString());
    return json({schemaVersion:1,status:"fresh",provider,seriesId:seriesId||null,count:Array.isArray(observations)?observations.length:0,limit,offset,observations:Array.isArray(observations)?observations:[],source:"Supabase economic_observations",retrievedAt:new Date().toISOString()},200,{...cors,"Cache-Control":"public, max-age=60, s-maxage=120"});
   }catch(error){
    return json({status:"unavailable",provider,observations:[],error:"Historical Supabase query failed: "+String(error.message||error).slice(0,180)},502,cors);
   }
  }
  if(url.pathname==="/api/v1/economic/providers"){
   const providers=await Promise.all(Object.entries(ECONOMIC_PROVIDER_CONFIG).map(async([id,cfg])=>({id,label:cfg.label,credential:cfg.credential||null,credentialConfigured:!cfg.credential||Boolean(env[cfg.credential]),cadence:cfg.cadence,ttlSeconds:cfg.ttlSeconds,state:await getEconomicProviderState(env,id)})));
   return json({schemaVersion:1,providers,retrievedAt:new Date().toISOString(),persistenceConfigured:Boolean(env.SUPABASE_URL&&supabaseAdminKey(env))},200,cors);
  }
  if(url.pathname.startsWith("/api/v1/economic/")){
   const provider=url.pathname.split("/").pop();
   if(!Object.prototype.hasOwnProperty.call(ECONOMIC_PROVIDER_CONFIG,provider))return json({error:"Unsupported economic provider"},404,cors);
   const result=await getEconomicData(provider,env,false);
   const status=result.status==="unavailable"?502:200;
   return json(result,status,{...cors,"Cache-Control":"public, max-age=900, s-maxage=1800"});
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
  return json({error:"Not found",routes:["/health","/api/v1/health","/api/v1/providers","/api/v1/news","/api/v1/volume-open-interest?report=tff|disaggregated","/api/v1/cot?report=tff|disaggregated","/api/v1/macro","/api/v1/macro/funding","/api/v1/economic/providers","/api/v1/economic/{bea|eia|fred|us_treasury|ecb}","POST /api/v1/ingest","/api/v1/economic/history?provider=...&series_id=...","/api/v1/prediction/polymarket","/api/v1/prediction/kalshi","/api/v1/cms/{model}"]},404,cors);
 },
 async scheduled(controller,env,ctx){ctx.waitUntil(Promise.allSettled([refreshNews(env),scheduledEconomicIngestion(env)]));}
};

function economicCacheKey(provider){return "economic:"+provider+":v1";}
async function getEconomicProviderState(env,provider){
 if(env.SNAPSHOTS){const state=await env.SNAPSHOTS.get("economic-provider:"+provider,"json");if(state)return state;}
 const cfg=ECONOMIC_PROVIDER_CONFIG[provider];
 return{status:cfg?.credential&&!env[cfg.credential]?"not-configured":"not-yet-fetched",credentialRequired:cfg?.credential||null,lastAttemptAt:null,lastSuccessAt:null,persistenceStatus:env.SUPABASE_URL&&supabaseAdminKey(env)?"ready":"not-configured"};
}
async function getEconomicData(provider,env,force){
 const cfg=ECONOMIC_PROVIDER_CONFIG[provider],key=economicCacheKey(provider);
 let snapshot=env.SNAPSHOTS?await env.SNAPSHOTS.get(key,"json"):null;
 const retrieved=Date.parse(snapshot?.retrievedAt||"");
 const stale=!Number.isFinite(retrieved)||Date.now()-retrieved>cfg.ttlSeconds*1000;
 if(force||!snapshot||stale)return await ingestEconomicProvider(provider,env,force);
 return snapshot;
}
async function supabaseRequest(env,table,method,query,body,prefer){
 if(!env.SUPABASE_URL||!supabaseAdminKey(env))throw new Error("Supabase server credentials are not configured");
 const base=String(env.SUPABASE_URL).replace(/\/+$/,"");
 const response=await fetch(base+"/rest/v1/"+table+(query?"?"+query:""),{
  method,headers:{...supabaseApiHeaders(env),"Content-Type":"application/json","Accept":"application/json",...(prefer?{"Prefer":prefer}:{})},
  body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)
 });
 const text=await response.text();
 if(!response.ok)throw new Error("Supabase "+table+" HTTP "+response.status+": "+text.slice(0,300));
 if(!text)return null;
 try{return JSON.parse(text);}catch{return null;}
}
async function upsertProviderStatus(env,provider,status,details,lastError=null,latencyMs=null){
 if(!env.SUPABASE_URL||!supabaseAdminKey(env))return{status:"not-configured"};
 const now=new Date().toISOString(),cfg=ECONOMIC_PROVIDER_CONFIG[provider]||{};
 const body={provider,status,last_attempt_at:now,last_success_at:["fresh","partial"].includes(status)?now:undefined,
  last_error:lastError,latency_ms:latencyMs,updated_at:now,
  details:{credentialRequired:cfg.credential||null,cadence:cfg.cadence||null,ttlSeconds:cfg.ttlSeconds||null,...(details||{}),updatedAt:now}};
 await supabaseRequest(env,"provider_status","POST","on_conflict=provider",body,"resolution=merge-duplicates,return=minimal");
 return{status:"stored"};
}
async function recordIngestionRun(env,provider,status,datasetId,requestCount,errorCode,errorMessage,details={}){
 if(!env.SUPABASE_URL||!supabaseAdminKey(env))return{status:"not-configured"};
 const completedAt=new Date().toISOString();
 try{
  await supabaseRequest(env,"ingestion_runs","POST","",{
   provider,dataset_id:datasetId||null,status,started_at:details.startedAt||completedAt,completed_at:completedAt,
   rows_received:0,rows_upserted:0,request_count:requestCount||0,error_code:errorCode||null,
   error_message:errorMessage?String(errorMessage).slice(0,500):null,details
  },"return=minimal");
  return{status:"stored"};
 }catch{return{status:"failed"};}
}
async function persistEconomicSnapshot(env,snapshot){
 if(!env.SUPABASE_URL||!supabaseAdminKey(env))return{status:"not-configured",rowsUpserted:0};
 const started=Date.now(),provider=snapshot.providerId||"unknown",records=Array.isArray(snapshot.records)?snapshot.records:[];
 let runId=null,rowsUpserted=0;
 try{
  const runRows=await supabaseRequest(env,"ingestion_runs","POST","",{
   provider,dataset_id:snapshot.datasetId,status:"running",request_count:snapshot.requestCount||1,
   details:{dataAsOf:snapshot.dataAsOf||null,sourceUrl:snapshot.sourceUrl||null}
  },"return=representation");
  runId=Array.isArray(runRows)?runRows[0]?.id:null;
  for(let i=0;i<records.length;i+=1000){
   const chunk=records.slice(i,i+1000);
   await supabaseRequest(env,"economic_observations","POST",
    "on_conflict=provider,dataset_id,series_id,frequency,observation_date",chunk,
    "resolution=merge-duplicates,return=minimal");
   rowsUpserted+=chunk.length;
  }
  const completedAt=new Date().toISOString();
  if(runId)await supabaseRequest(env,"ingestion_runs","PATCH","id=eq."+encodeURIComponent(runId),{
   status:snapshot.status==="partial"?"partial":"success",completed_at:completedAt,
   rows_received:records.length,rows_upserted:rowsUpserted,request_count:snapshot.requestCount||1,
   details:{dataAsOf:snapshot.dataAsOf||null,series:snapshot.series||[],elapsedMs:Date.now()-started}
  },"return=minimal");
  await upsertProviderStatus(env,provider,snapshot.status==="partial"?"partial":"fresh",{
   datasetId:snapshot.datasetId,dataAsOf:snapshot.dataAsOf,rows:rowsUpserted,sourceUrl:snapshot.sourceUrl,persistence:"stored"
  });
  return{status:snapshot.status==="partial"?"partial":"stored",rowsUpserted,runId};
 }catch(error){
  if(runId)try{await supabaseRequest(env,"ingestion_runs","PATCH","id=eq."+encodeURIComponent(runId),{
   status:rowsUpserted?"partial":"failed",completed_at:new Date().toISOString(),rows_received:records.length,
   rows_upserted:rowsUpserted,error_message:String(error.message||error).slice(0,500),
   details:{dataAsOf:snapshot.dataAsOf||null,elapsedMs:Date.now()-started}
  },"return=minimal");}catch{}
  try{await upsertProviderStatus(env,provider,rowsUpserted?"partial":"error",{
   datasetId:snapshot.datasetId,rowsUpserted,persistence:"failed"
  },String(error.message||error).slice(0,500),Date.now()-started);}catch{}
  return{status:"failed",rowsUpserted,runId,error:String(error.message||error).slice(0,300)};
 }
}
async function ingestEconomicProvider(provider,env,force=false){
 const cfg=ECONOMIC_PROVIDER_CONFIG[provider],started=Date.now();
 try{
  const snapshot=await fetchEconomicProvider(provider,env);
  snapshot.providerId=provider;
  if(snapshot.status==="not-configured"){
   const state={status:"not-configured",credentialRequired:snapshot.credentialRequired,lastAttemptAt:snapshot.retrievedAt,lastSuccessAt:null,
    persistenceStatus:env.SUPABASE_URL&&supabaseAdminKey(env)?"ready":"not-configured",note:snapshot.notes?.at(-1)};
   if(env.SNAPSHOTS){
    await env.SNAPSHOTS.put(economicCacheKey(provider),JSON.stringify(snapshot),{expirationTtl:Math.max(cfg.ttlSeconds,3600)});
    await env.SNAPSHOTS.put("economic-provider:"+provider,JSON.stringify(state),{expirationTtl:60*60*24*7});
   }
   await upsertProviderStatus(env,provider,"unavailable",{credentialRequired:cfg.credential,configured:false,note:state.note});
   await recordIngestionRun(env,provider,"skipped",snapshot.datasetId,0,"missing_credential",state.note,{credentialRequired:cfg.credential});
   return snapshot;
  }
  let persistence={status:"not-configured",rowsUpserted:0};
  if(env.SUPABASE_URL&&supabaseAdminKey(env))persistence=await persistEconomicSnapshot(env,snapshot);
  snapshot.persistence=persistence;
  snapshot.elapsedMs=Date.now()-started;
  const state={status:snapshot.status,lastAttemptAt:snapshot.retrievedAt,lastSuccessAt:snapshot.retrievedAt,
   dataAsOf:snapshot.dataAsOf,persistenceStatus:persistence.status,rowsStored:persistence.rowsUpserted||0,datasetId:snapshot.datasetId};
  if(env.SNAPSHOTS){
   await env.SNAPSHOTS.put(economicCacheKey(provider),JSON.stringify(snapshot),{expirationTtl:Math.max(cfg.ttlSeconds*2,3600)});
   await env.SNAPSHOTS.put("economic-provider:"+provider,JSON.stringify(state),{expirationTtl:60*60*24*7});
  }
  return snapshot;
 }catch(error){
  const previous=env.SNAPSHOTS?await env.SNAPSHOTS.get(economicCacheKey(provider),"json"):null;
  const lastError=String(error.message||error).slice(0,300);
  const state={status:previous?"stale":"unavailable",lastAttemptAt:new Date().toISOString(),lastSuccessAt:previous?.retrievedAt||null,
   persistenceStatus:env.SUPABASE_URL&&supabaseAdminKey(env)?"ready":"not-configured",lastError};
  if(env.SNAPSHOTS)await env.SNAPSHOTS.put("economic-provider:"+provider,JSON.stringify(state),{expirationTtl:60*60*24*7});
  try{await upsertProviderStatus(env,provider,previous?"stale":"error",{datasetId:previous?.datasetId||null},lastError,Date.now()-started);}catch{}
  await recordIngestionRun(env,provider,"failed",previous?.datasetId||null,1,"provider_request_failed",lastError,{elapsedMs:Date.now()-started});
  return previous?{...previous,status:"stale",lastError}:{
   schemaVersion:1,provider,status:"unavailable",retrievedAt:new Date().toISOString(),dataAsOf:null,records:[],series:[],sourceUrl:null,
   error:"Economic data provider request failed",details:state
  };
 }
}
async function scheduledEconomicIngestion(env){
 if(!env.SNAPSHOTS)return;
 const jobs=Object.entries(ECONOMIC_PROVIDER_CONFIG);
 await Promise.allSettled(jobs.map(async([provider,cfg])=>{
  const previous=await env.SNAPSHOTS.get(economicCacheKey(provider),"json");
  const at=Date.parse(previous?.retrievedAt||"");
  if(!Number.isFinite(at)||Date.now()-at>cfg.ttlSeconds*1000)return await ingestEconomicProvider(provider,env,false);
  return{status:"fresh-cache"};
 }));
}

async function refreshNews(env){
 if(!env.SNAPSHOTS)return;
 const checkedAt=new Date().toISOString();
 const previous=await env.SNAPSHOTS.get(NEWS_KEY,"json")||{articles:[]};
 let fresh=null,error=null;
 try{fresh=await fetchGdelt(GDELT_QUERY);}catch(cause){error=cause;}
 const articles=fresh?dedupe(fresh.articles).slice(0,100):[];
 const status=fresh?"fresh":(previous.articles?.length?"stale":"unavailable");
 const next={schemaVersion:1,provider:"GDELT DOC API",status,generatedAt:fresh?checkedAt:previous.generatedAt||null,lastCheckedAt:checkedAt,queryCount:1,successfulQueries:fresh?1:0,articles:articles.length?articles:(previous.articles||[]),lastError:error?String(error.message||error).slice(0,180):null,notes:["One consolidated 72-hour query is used to respect GDELT's request-rate guidance.","GDELT is a broad news-discovery index, not a complete licensed newswire.","seendate is GDELT indexing/seen time and may differ from publisher publication time.","Headlines are leads for verification, not trading signals."]};
 await env.SNAPSHOTS.put(NEWS_KEY,JSON.stringify(next),{expirationTtl:60*60*24*3});
 await env.SNAPSHOTS.put(PROVIDER_STATE_KEY,JSON.stringify({status,lastCheckedAt:checkedAt,successfulQueries:fresh?1:0,queryCount:1,articleCount:next.articles.length,lastError:next.lastError}),{expirationTtl:60*60*24*7});
 if(env.SUPABASE_URL&&supabaseAdminKey(env)&&next.articles.length){
  const rows=next.articles.map(a=>({provider:"GDELT DOC API",title:a.title,url:a.url,domain:a.domain,topic:a.topic,retrieved_at:checkedAt,data_as_of:checkedAt,freshness_status:status,payload:a}));
  const endpoint=env.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1/news_items?on_conflict=provider,url";
  const write=await fetch(endpoint,{method:"POST",headers:{...supabaseApiHeaders(env),"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(rows)});
  if(!write.ok)console.error("Supabase news upsert failed",write.status);
 }
}

const COT_DATASETS={
 tff:{id:"gpe5-46if",name:"TFF Futures Only",source:"https://publicreporting.cftc.gov/Commitments-of-Traders/TFF-Futures-Only/gpe5-46if"},
 disaggregated:{id:"72hh-3qpy",name:"Disaggregated Futures Only",source:"https://publicreporting.cftc.gov/w/72hh-3qpy/default"}
};
function cotSource(report){return COT_DATASETS[report].source;}
function asNumberOrNull(value){
 if(value===null||value===undefined||String(value).trim()==="")return null;
 const n=Number(value);return Number.isFinite(n)?n:null;
}
const COT_POSITION_FIELDS={
 tff:[
  {label:"Dealer / Intermediary",long:"dealer_positions_long_all",short:"dealer_positions_short_all",spread:"dealer_positions_spread_all"},
  {label:"Asset Manager / Institutional",long:"asset_mgr_positions_long",short:"asset_mgr_positions_short",spread:"asset_mgr_positions_spread"},
  {label:"Leveraged Funds",long:"lev_money_positions_long",short:"lev_money_positions_short",spread:"lev_money_positions_spread"},
  {label:"Other Reportables",long:"other_rept_positions_long",short:"other_rept_positions_short",spread:"other_rept_positions_spread"},
  {label:"Non-Reportables",long:"nonrept_positions_long_all",short:"nonrept_positions_short_all"}
 ],
 disaggregated:[
  {label:"Producer / Merchant / Processor / User",long:"prod_merc_positions_long",short:"prod_merc_positions_short",spread:"prod_merc_positions_spread"},
  {label:"Swap Dealers",long:"swap_positions_long_all",short:"swap__positions_short_all",spread:"swap__positions_spread_all"},
  {label:"Managed Money",long:"m_money_positions_long_all",short:"m_money_positions_short_all",spread:"m_money_positions_spread"},
  {label:"Other Reportables",long:"other_rept_positions_long",short:"other_rept_positions_short",spread:"other_rept_positions_spread"},
  {label:"Non-Reportables",long:"nonrept_positions_long_all",short:"nonrept_positions_short_all"}
 ]
};
function normalizeCotRows(rows,report){
 const fields=COT_POSITION_FIELDS[report]||[];
 return rows.flatMap(raw=>fields.map(category=>{
  const long=asNumberOrNull(raw[category.long]),short=asNumberOrNull(raw[category.short]),spread=category.spread?asNumberOrNull(raw[category.spread]):null;
  if(long===null&&short===null&&spread===null)return null;
  return{contractName:raw.contract_market_name||raw.market_and_exchange_names||raw.contract_name||"Contract",reportDate:raw.report_date_as_yyyy_mm_dd||raw.report_date||null,traderCategory:category.label,long,short,spread,net:long!==null&&short!==null?long-short:null,openInterest:asNumberOrNull(raw.open_interest_all??raw.open_interest)};
 }).filter(Boolean));
}
async function fetchCot(report,market=""){
 const dataset=COT_DATASETS[report];
 const u=new URL("https://publicreporting.cftc.gov/resource/"+dataset.id+".json");
 u.searchParams.set("$limit",market?"2000":"5000");
 u.searchParams.set("$order","report_date_as_yyyy_mm_dd DESC");
 if(market){
  const safeMarket=market.toUpperCase().replace(/[^A-Z0-9 &.-]/g,"").trim();
  if(safeMarket.length>=3){
   const term=safeMarket.replace(/'/g,"''");
   u.searchParams.set("$where","upper(contract_market_name) like '%"+term+"%' OR upper(market_and_exchange_names) like '%"+term+"%'");
  }
 }
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.1 public research"},signal:AbortSignal.timeout(18000)});
 if(!response.ok)throw new Error("CFTC PRE "+response.status);
 const rows=await response.json();if(!Array.isArray(rows))throw new Error("CFTC PRE response was not an array");
 const dates=rows.map(r=>r.report_date_as_yyyy_mm_dd).filter(Boolean).sort();
 return{schemaVersion:1,status:"fresh",provider:"CFTC Public Reporting Environment",report,reportName:dataset.name,dataAsOf:dates.at(-1)||null,retrievedAt:new Date().toISOString(),sourceUrl:dataset.source,access:"public API; respect moderate request use",rows,normalizedRows:normalizeCotRows(rows,report)};
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
 let data=null,lastError=null;
 for(let attempt=0;attempt<2;attempt++){
  try{
   const response=await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(18000)});
   if(!response.ok)throw new Error("BLS HTTP "+response.status);
   data=await response.json();
   if(data.status!=="REQUEST_SUCCEEDED")throw new Error("BLS request failed: "+String(data.message?.[0]||data.status).slice(0,160));
   lastError=null;break;
  }catch(error){
   lastError=error;
   if(attempt===0)await new Promise(resolve=>setTimeout(resolve,700));
  }
 }
 if(lastError||!data)throw lastError||new Error("BLS returned no response");
 const byId=new Map((data.Results?.series||[]).map(s=>[s.seriesID,s.data||[]]));
 const series=BLS_SERIES.map(meta=>({...meta,observations:(byId.get(meta.id)||[]).filter(o=>/^M\d{2}$/.test(o.period||"")).slice(0,36).map(o=>({year:o.year,period:o.period,periodName:o.periodName,value:Number(o.value),footnotes:o.footnotes||[]}))}));
 const periods=series.flatMap(s=>s.observations.slice(0,1).map(o=>String(o.year)+"-"+o.period)).sort();
 return{schemaVersion:1,status:"fresh",provider:"US Bureau of Labor Statistics Public Data API v1",retrievedAt:new Date().toISOString(),dataAsOf:periods.at(-1)||null,access:"public, no registration; Version 1.0 limits apply",series,notes:["BLS API v1 returns published historical series, not a live market-price feed.","Series definitions and units are distinct; do not compare different index bases.","BLS data do not replace the issuer release calendar or timestamps."]};
}

async function fetchGdelt(spec){
 const u=new URL("https://api.gdeltproject.org/api/v2/doc/doc");
 u.searchParams.set("query",spec.query);u.searchParams.set("mode","ArtList");u.searchParams.set("format","json");u.searchParams.set("maxrecords","100");u.searchParams.set("sort","DateDesc");u.searchParams.set("timespan","72h");
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
 const items=data.map(event=>({title:String(event.title||event.question||"Untitled event"),slug:String(event.slug||""),url:event.slug?"https://polymarket.com/event/"+event.slug:"https://polymarket.com",volume:asNumberOrNull(event.volume),volume24hr:asNumberOrNull(event.volume24hr),liquidity:asNumberOrNull(event.liquidity),endDate:event.endDate||event.endDateIso||null,markets:parseArray(event.markets).slice(0,8).map(m=>({question:String(m.question||m.groupItemTitle||""),slug:String(m.slug||""),outcomes:parseArray(m.outcomes),outcomePrices:parseArray(m.outcomePrices).map(Number),volume:Number(m.volume||0),liquidity:Number(m.liquidity||0),active:m.active!==false,closed:Boolean(m.closed),clobTokenIds:parseArray(m.clobTokenIds)}))})).filter(item=>item.title);
 return{schemaVersion:1,provider:"Polymarket Gamma API",status:"fresh",retrievedAt:new Date().toISOString(),dataAsOf:null,access:"public read-only API; no key required",items,notes:["Gamma event volume/liquidity and outcomePrices are venue-reported metadata, not CME/ICE futures prices.","Outcome prices are indicative probabilities and may be stale or thinly traded.","No wallet, order-entry or execution endpoints are connected."]};
}
async function fetchKalshi(){
 const u=new URL("https://external-api.kalshi.com/trade-api/v2/markets");u.searchParams.set("status","open");u.searchParams.set("limit","100");u.searchParams.set("mve_filter","exclude");
 const response=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"FinanceIntelligenceOS/1.1 public research"},signal:AbortSignal.timeout(14000)});
 if(!response.ok)throw new Error("Kalshi public markets "+response.status);
 const data=await response.json();if(!Array.isArray(data.markets))throw new Error("Kalshi response did not include markets");
 const items=data.markets.map(m=>({title:String(m.title||m.subtitle||m.ticker||"Untitled market"),ticker:String(m.ticker||""),eventTicker:String(m.event_ticker||""),yesBid:Number(m.yes_bid_dollars??m.yes_bid??NaN),yesAsk:Number(m.yes_ask_dollars??m.yes_ask??NaN),lastPrice:Number(m.last_price_dollars??m.last_price??NaN),volume24h:asNumberOrNull(m.volume_24h_fp??m.volume_24h),volume:asNumberOrNull(m.volume_fp??m.volume),liquidity:asNumberOrNull(m.liquidity_dollars),closeTime:m.close_time||m.expected_expiration_time||null,updatedAt:m.updated_time||null,url:"https://kalshi.com/markets"})).filter(item=>item.ticker&&item.title);
 return{schemaVersion:1,provider:"Kalshi public Trade API v2",status:"fresh",retrievedAt:new Date().toISOString(),dataAsOf:null,access:"public read-only market-data endpoint; no key required",items,notes:["YES bid/ask and volume are Kalshi event-contract data, not exchange futures prices.","Displayed market probabilities are venue-specific and may be thinly traded.","No portfolio, wallet or order-entry endpoints are connected."]};
}

function json(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json; charset=utf-8","X-Content-Type-Options":"nosniff",...headers}});}
