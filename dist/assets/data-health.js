(() => {
 const cfg=window.FINANCE_OS_CONFIG||{};
 const API=String(cfg.apiBase||window.FINANCE_OS_API_BASE||"").replace(/\/$/,"");
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const endpoints=[
  {id:"news",name:"GDELT News Discovery",path:"/api/v1/news",detail:"Global discovery index; scheduled collection every 30 minutes."},
  {id:"bls",name:"US Bureau of Labor Statistics",path:"/api/v1/macro",detail:"Historical inflation and labour observations; not a real-time market feed."},
  {id:"cftc",name:"CFTC COT · TFF",path:"/api/v1/cot?report=tff&q=NASDAQ",detail:"Weekly financial-futures positioning and reported open interest."},
  {id:"nyfed",name:"Federal Reserve Bank of New York",path:"/api/v1/macro/funding",detail:"Published overnight reference rates; daily/business-day cadence."},
  {id:"polymarket",name:"Polymarket public events",path:"/api/v1/prediction/polymarket",detail:"Read-only prediction-market outcomes, volume and liquidity metadata."},
  {id:"kalshi",name:"Kalshi public market data",path:"/api/v1/prediction/kalshi",detail:"Read-only event-market prices and venue volume metadata."}
 ];
 const stateLabel=s=>({fresh:"Fresh",partial:"Partial",stale:"Stale snapshot",unavailable:"Unavailable","not-yet-fetched":"Not fetched","not-configured":"Not configured","available-on-demand":"Available on request"}[String(s||"").toLowerCase()]||String(s||"Unknown").replaceAll("-"," "));
 const tone=s=>["fresh","partial"].includes(String(s||"").toLowerCase())?"good":["stale","not-yet-fetched","available-on-demand","not-configured"].includes(String(s||"").toLowerCase())?"warn":"bad";
 async function request(path){
  const response=await fetch(API+path,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(18000),cache:"no-store"});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error("HTTP "+response.status);
  return payload;
 }
 function rowCard(p){
  return '<article class="health-card"><div class="health-card-head"><div><span class="health-kicker">'+esc(p.group||"PUBLIC DATA PROVIDER")+'</span><h3>'+esc(p.name)+'</h3></div><span class="status-pill '+tone(p.status)+'">'+esc(stateLabel(p.status))+'</span></div><p>'+esc(p.detail||"Provider status.")+'</p><div class="health-meta"><span>Endpoint: <code>'+esc(p.path||"configuration")+'</code></span><span>Last checked: '+esc(p.checked||"—")+'</span></div>'+(p.asOf?'<div class="health-asof">Data as of: '+esc(p.asOf)+'</div>':'')+(p.note?'<div class="health-note">'+esc(p.note)+'</div>':'')+'</article>';
 }
 async function refresh(){
  if(!API){$("healthGrid").innerHTML='<div class="empty-state">API gateway is not configured. Set the public Worker URL in the deployment environment.</div>';$("healthHeadline").textContent="Gateway not configured";return;}
  $("healthRefresh").disabled=true;$("healthRefresh").textContent="Checking…";
  $("healthGrid").innerHTML='<div class="loading-state">Checking provider snapshots independently…</div>';
  const started=performance.now();
  try{
   const [edge,providerRegistry]=await Promise.allSettled([request("/health"),request("/api/v1/providers")]);
   const providers=providerRegistry.status==="fulfilled"?providerRegistry.value.providers||[]:[];
   const cards=[];
   cards.push(edge.status==="fulfilled"
    ?{name:"Cloudflare API Gateway",group:"EDGE RUNTIME",status:edge.value.ok?"fresh":"unavailable",detail:"Worker health route and KV configuration flags.",path:"/health",checked:edge.value.time||new Date().toISOString(),note:"KV: "+(edge.value.storageConfigured?"configured":"not configured")+" · Supabase ingestion: "+(edge.value.databaseConfigured?"configured":"not configured")}
    :{name:"Cloudflare API Gateway",group:"EDGE RUNTIME",status:"unavailable",detail:"Gateway health check failed.",path:"/health",checked:"—",note:String(edge.reason||"Request failed")});
   const results=await Promise.allSettled(endpoints.map(async e=>({endpoint:e,data:await request(e.path)})));
   for(let i=0;i<results.length;i++){
    const result=results[i],e=endpoints[i];
    if(result.status!=="fulfilled"){
     cards.push({name:e.name,group:"UPSTREAM SNAPSHOT",status:"unavailable",detail:e.detail,path:e.path,checked:new Date().toISOString(),note:String(result.reason?.message||"Request failed")});
     continue;
    }
    const d=result.value.data;
    const status=String(d.status||"unknown").toLowerCase();
    const checked=d.lastCheckedAt||d.retrievedAt||d.generatedAt||"timestamp not supplied";
    const asOf=d.dataAsOf||null;
    let note=d.lastError||d.error||"";
    if(e.id==="news"&&d.successfulQueries!==undefined)note=(d.successfulQueries+"/"+d.queryCount+" discovery queries succeeded. "+(d.refresh?.status&&d.refresh.status!=="not-requested"?"Manual refresh: "+d.refresh.status+". ":""))+note;
    if(e.id==="cftc")note=(d.rows?.length||0)+" matching CFTC report rows returned. Weekly reporting; not intraday.";
    if(e.id==="polymarket")note=(d.items?.length||0)+" event records returned. Event-market venue metrics are not futures volume.";
    if(e.id==="kalshi")note=(d.items?.length||0)+" open event-market records returned. Venue volume is not futures volume.";
    cards.push({name:e.name,group:"UPSTREAM SNAPSHOT",status,detail:e.detail,path:e.path,checked,asOf,note});
   }
   for(const p of providers){
    if(["builder-content","builder-admin","supabase","cme-rss"].includes(p.id)){
     const status=p.state?.status||"unknown";
     cards.push({name:p.label,group:"CONFIGURATION / SOURCE REGISTRY",status,detail:p.notes||"Configuration status as reported by the edge provider registry.",path:"/api/v1/providers",checked:new Date().toISOString(),note:p.state?.lastError||p.state?.lastCheckedAt||""});
    }
   }
   $("healthGrid").innerHTML=cards.map(rowCard).join("");
   const healthy=cards.filter(x=>["fresh","partial"].includes(x.status)).length;
   const stale=cards.filter(x=>["stale","not-yet-fetched","available-on-demand","not-configured"].includes(x.status)).length;
   const unavailable=cards.length-healthy-stale;
   $("healthHeadline").textContent=healthy+" responding · "+stale+" waiting/configuration · "+unavailable+" unavailable";
   $("healthLatency").textContent="Checks completed in "+Math.round(performance.now()-started)+" ms · "+new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"});
   $("healthUpdated").textContent="Each card reports its own endpoint or cache state. A cached response is not the same as a fresh upstream collection.";
  }catch(e){$("healthGrid").innerHTML='<div class="empty-state">'+esc(e.message)+'</div>';$("healthHeadline").textContent="Health check failed";}
  finally{$("healthRefresh").disabled=false;$("healthRefresh").textContent="Recheck providers";}
 }
 $("healthRefresh").addEventListener("click",refresh);
 refresh();
})();