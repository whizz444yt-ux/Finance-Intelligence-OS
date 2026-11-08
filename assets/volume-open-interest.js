(() => {
 const cfg=window.FINANCE_OS_CONFIG||{};
 const API=String(cfg.apiBase||window.FINANCE_OS_API_BASE||"").replace(/\/$/,"");
 const $=id=>document.getElementById(id);
 const number=v=>{if(v===null||v===undefined||String(v).trim()==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
 const fmt=v=>v===null?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:0});
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const contracts=[
  {id:"nq",name:"Nasdaq-100 E-mini / Micro",report:"tff",query:"NASDAQ",exchange:"CME"},
  {id:"es",name:"S&P 500 E-mini / Micro",report:"tff",query:"S&P 500",exchange:"CME"},
  {id:"gc",name:"Gold / Micro Gold",report:"disaggregated",query:"GOLD",exchange:"COMEX"},
  {id:"cl",name:"WTI Crude Oil",report:"disaggregated",query:"CRUDE OIL",exchange:"NYMEX"},
  {id:"6e",name:"Euro FX",report:"tff",query:"EURO FX",exchange:"CME"},
  {id:"6b",name:"British Pound",report:"tff",query:"BRITISH POUND",exchange:"CME"},
  {id:"ym",name:"E-mini Dow",report:"tff",query:"DJIA STOCKS",exchange:"CBOT"},
  {id:"rty",name:"E-mini Russell 2000",report:"tff",query:"RUSSELL 2000",exchange:"CME"},
  {id:"dx",name:"US Dollar Index",report:"tff",query:"U.S. DOLLAR INDEX",exchange:"ICE"},
  {id:"zn",name:"10-Year Treasury Note",report:"tff",query:"UST 10Y NOTE",exchange:"CBOT"},
  {id:"6j",name:"Japanese Yen",report:"tff",query:"JAPANESE YEN",exchange:"CME"},
  {id:"6a",name:"Australian Dollar",report:"tff",query:"AUSTRALIAN DOLLAR",exchange:"CME"},
  {id:"6c",name:"Canadian Dollar",report:"tff",query:"CANADIAN DOLLAR",exchange:"CME"},
  {id:"si",name:"Silver",report:"disaggregated",query:"SILVER",exchange:"COMEX"},
  {id:"btc",name:"CME Bitcoin",report:"tff",query:"BITCOIN",exchange:"CME"}
 ];
 let observations=[],selectedContract=contracts[0],selectedName="",history=[];
 function message(text,kind="neutral"){$("voiState").textContent=text;$("voiState").className="data-message "+kind;}
 function api(path){if(!API)throw new Error("Finance OS API gateway is not configured.");return fetch(API+path,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(18000),cache:"no-store"}).then(async r=>{if(!r.ok)throw new Error("CFTC gateway returned HTTP "+r.status);return r.json();});}
 function marketSelect(){const s=$("voiMarket");s.innerHTML=contracts.map(c=>'<option value="'+c.id+'">'+esc(c.name)+' · '+c.exchange+'</option>').join("");}
 function contractRows(){
  const key=$("voiInstrument"), names=[...new Set(observations.map(r=>r.marketName).filter(Boolean))];
  key.innerHTML=names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
  selectedName=names[0]||"";
  $("voiMarketName").textContent=selectedName||"No matching CFTC market label";
 }
 function toRows(){
  const name=selectedName;
  const seen=new Set();
  return observations.filter(r=>r.marketName===name).map(r=>({date:r.reportDate,oi:number(r.openInterest)})).filter(r=>r.date&&r.oi!==null).filter(r=>{if(seen.has(r.date))return false;seen.add(r.date);return true;}).sort((a,b)=>a.date.localeCompare(b.date));
 }
 function renderChart(){
  history=toRows().slice(-26);
  const chart=$("voiChart");
  if(!history.length){chart.innerHTML='<div class="empty-state">No historical open-interest observations were returned for this specific CFTC market label. Try another report type or contract.</div>';return;}
  const max=Math.max(...history.map(x=>x.oi)),min=Math.min(...history.map(x=>x.oi)),range=Math.max(1,max-min);
  chart.innerHTML=history.map((x,i)=>{
   const height=Math.max(6,((x.oi-min)/range)*88+12);
   return '<div class="oi-bar-col" title="'+esc(x.date)+' · '+fmt(x.oi)+' contracts"><span>'+fmt(x.oi)+'</span><i style="height:'+height+'%"></i><small>'+esc(x.date.slice(5))+'</small></div>';
  }).join("");
  const latest=history.at(-1),previous=history.at(-2),delta=previous?latest.oi-previous.oi:null;
  $("voiLatest").textContent=fmt(latest.oi);
  $("voiAsOf").textContent="Report date "+latest.date;
  $("voiChange").textContent=delta===null?"—":(delta>0?"+":"")+fmt(delta);
  $("voiChange").className=delta===null?"metric-value":delta>0?"metric-value positive":delta<0?"metric-value negative":"metric-value";
  $("voiRange").textContent=history.length+" weekly observations";
  $("voiTable").innerHTML=history.slice().reverse().map((x,i,arr)=>{
   const prior=arr[i+1],change=prior?x.oi-prior.oi:null;
   return '<tr><td>'+esc(x.date)+'</td><td>'+fmt(x.oi)+'</td><td>'+(change===null?"—":(change>0?"+":"")+fmt(change))+'</td><td>'+esc(selectedName)+'</td></tr>';
  }).join("");
 }
 async function load(){
  selectedContract=contracts.find(x=>x.id===$("voiMarket").value)||contracts[0];
  $("voiReport").textContent=selectedContract.report==="tff"?"CFTC TFF · Futures Only":"CFTC Disaggregated · Futures Only";
  $("voiSource").href=selectedContract.report==="tff"?"https://publicreporting.cftc.gov/Commitments-of-Traders/TFF-Futures-Only/gpe5-46if":"https://publicreporting.cftc.gov/w/72hh-3qpy/default";
  $("voiMarketName").textContent="Loading CFTC market rows…";
  $("voiChart").innerHTML='<div class="loading-state">Loading weekly open-interest history…</div>';
  message("Requesting the latest public CFTC report for "+selectedContract.name+"…");
  try{
   const d=await api("/api/v1/volume-open-interest?report="+selectedContract.report+"&q="+encodeURIComponent(selectedContract.query));
   observations=Array.isArray(d.observations)?d.observations:[];
   contractRows();
   $("voiInstrument").disabled=!observations.length;
   $("voiStatus").textContent=(d.status||"unknown").toUpperCase();
   $("voiStatus").className="status-pill "+(d.status==="fresh"?"good":d.status==="stale"?"warn":"bad");
   $("voiRetrieved").textContent="Retrieved "+(d.retrievedAt||"timestamp unavailable")+" · data as of "+(d.dataAsOf||"unknown");
   $("voiCount").textContent=observations.length+" weekly observations";
   if(!observations.length){message("The CFTC query returned no weekly open-interest observations. No values have been substituted. Check the official dataset and selected market label.","warn");}
   else {message("CFTC weekly open interest loaded. Volume is not present in this COT response and remains unavailable until a separately licensed or official volume adapter is connected.","good");}
   renderChart();
  }catch(e){
   observations=[];$("voiInstrument").innerHTML='<option>No data</option>';$("voiStatus").textContent="UNAVAILABLE";$("voiStatus").className="status-pill bad";
   $("voiChart").innerHTML='<div class="empty-state">CFTC data could not be retrieved. Use the official report link to inspect the dataset.</div>';
   $("voiLatest").textContent="—";$("voiChange").textContent="—";$("voiRange").textContent="—";
   message(e.message,"bad");
  }
 }
 marketSelect();
 $("voiMarket").addEventListener("change",load);
 $("voiInstrument").addEventListener("change",()=>{selectedName=$("voiInstrument").value;$("voiMarketName").textContent=selectedName;renderChart();});
 $("voiRefresh").addEventListener("click",load);
 load();
})();