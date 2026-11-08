(() => {
 const cfg=window.FINANCE_OS_CONFIG||{};
 const API=String(cfg.apiBase||window.FINANCE_OS_API_BASE||"").replace(/\/$/,"");
 const $=id=>document.getElementById(id);
 const providers=[
  {id:"bea",name:"BEA · National Accounts",desc:"Quarterly NIPA Table T10101 · Real GDP growth components",source:"https://apps.bea.gov/api/data/"},
  {id:"eia",name:"EIA · Crude Oil Stocks",desc:"Weekly US ending stocks of crude oil including the Strategic Petroleum Reserve",source:"https://www.eia.gov/petroleum/supply/weekly/"},
  {id:"fred",name:"FRED · Macro History",desc:"Federal funds rate, 10-year Treasury yield, CPI, unemployment and PCE price index",source:"https://fred.stlouisfed.org/"},
  {id:"us_treasury",name:"US Treasury · Average Interest Rates",desc:"Monthly average rates on outstanding marketable Treasury securities",source:"https://fiscaldata.treasury.gov/"},
  {id:"ecb",name:"ECB · USD / EUR Reference Rate",desc:"Daily ECB reference-rate series D.USD.EUR.SP00.A",source:"https://data.ecb.europa.eu/"}
 ];
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmt=v=>v===null||v===undefined||v===""?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:4});
 const statusName=s=>({fresh:"Fresh",partial:"Partial",stale:"Stale snapshot",unavailable:"Unavailable","not-configured":"Credential required","not-yet-fetched":"Not fetched"}[String(s||"").toLowerCase()]||String(s||"Unknown").replaceAll("-"," "));
 const tone=s=>["fresh","partial"].includes(String(s||"").toLowerCase())?"good":["stale","not-yet-fetched","not-configured"].includes(String(s||"").toLowerCase())?"warn":"bad";
 async function request(path){
  const response=await fetch(API+path,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(25000),cache:"no-store"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||"Gateway HTTP "+response.status);
  return body;
 }
 function renderProvider(provider,data,error){
  const card=document.createElement("article");card.className="economic-provider-card";
  const status=error?"unavailable":data?.status||"unknown";
  const head=document.createElement("div");head.className="economic-provider-head";
  head.innerHTML='<div><span class="health-kicker">HISTORICAL DATA PROVIDER</span><h3>'+esc(provider.name)+'</h3></div><span class="status-pill '+tone(status)+'">'+esc(statusName(status))+'</span>';
  card.appendChild(head);
  const desc=document.createElement("p");desc.className="economic-provider-desc";desc.textContent=provider.desc;card.appendChild(desc);
  if(error){
   const note=document.createElement("div");note.className="health-note";note.textContent=error;card.appendChild(note);
  }else if(status==="not-configured"){
   const note=document.createElement("div");note.className="health-note";note.textContent=(data.credentialRequired||"Provider credential")+" is missing from the Cloudflare Worker. No data has been fabricated.";card.appendChild(note);
  }else{
   const records=Array.isArray(data.records)?data.records.slice():[];
   const latestBySeries=new Map();
   records.sort((a,b)=>String(b.observation_date).localeCompare(String(a.observation_date))).forEach(row=>{
    if(!latestBySeries.has(row.series_id))latestBySeries.set(row.series_id,row);
   });
   const grid=document.createElement("div");grid.className="economic-latest-grid";
   for(const row of latestBySeries.values()){
    const metric=document.createElement("div");metric.className="economic-latest-metric";
    metric.innerHTML='<span>'+esc(row.series_name)+'</span><strong>'+esc(fmt(row.value))+'</strong><small>'+esc(row.unit||"Unit not supplied")+' · '+esc(row.observation_date||"Date unavailable")+'</small>';
    grid.appendChild(metric);
   }
   card.appendChild(grid);
   const meta=document.createElement("div");meta.className="economic-provider-meta";
   meta.textContent=records.length+" observations · data as of "+(data.dataAsOf||"not supplied")+" · retrieved "+(data.retrievedAt?new Date(data.retrievedAt).toLocaleString():"timestamp unavailable");
   card.appendChild(meta);
   const persist=document.createElement("div");persist.className="economic-persistence";
   const p=data.persistence?.status||"not-run";
   persist.textContent="Supabase persistence: "+(p==="stored"?"stored "+(data.persistence.rowsUpserted||0)+" rows":p==="partial"?"partial storage":p==="failed"?"write failed":p==="not-configured"?"server credentials not configured":p);
   card.appendChild(persist);
   if(data.lastError){const note=document.createElement("div");note.className="health-note";note.textContent=data.lastError;card.appendChild(note);}
  }
  const footer=document.createElement("div");footer.className="economic-provider-footer";
  const link=document.createElement("a");link.href=provider.source;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Official source ↗";footer.appendChild(link);
  card.appendChild(footer);
  return card;
 }
 async function load(){
  $("economicRefresh").disabled=true;$("economicRefresh").textContent="Checking providers…";
  $("economicState").textContent="Requesting independent historical observations through the Cloudflare gateway.";
  $("economicProviders").innerHTML='<div class="loading-state">Loading BEA, EIA, FRED, Treasury and ECB snapshots…</div>';
  const results=await Promise.allSettled(providers.map(p=>request("/api/v1/economic/"+p.id)));
  $("economicProviders").innerHTML="";
  results.forEach((r,i)=>{
   const p=providers[i];
   $("economicProviders").appendChild(renderProvider(p,r.status==="fulfilled"?r.value:null,r.status==="rejected"?(r.reason?.message||"Provider unavailable"):null));
  });
  const available=results.filter(r=>r.status==="fulfilled"&&["fresh","partial","stale"].includes(r.value?.status)).length;
  const missing=results.filter(r=>r.status==="fulfilled"&&r.value?.status==="not-configured").length;
  $("economicState").textContent=available+" of "+providers.length+" providers returned historical data; "+missing+" require credentials. Missing values remain blank, not zero. A successful provider fetch and a successful Supabase write are reported separately.";
  $("economicRefresh").disabled=false;$("economicRefresh").textContent="Refresh economic providers";
 }
 $("economicRefresh")?.addEventListener("click",load);
 if(API)load();else{$("economicProviders").innerHTML='<div class="empty-state">Cloudflare API gateway is not configured. Add the public Worker URL to the frontend runtime configuration.</div>';$("economicState").textContent="API gateway not configured.";}
})();