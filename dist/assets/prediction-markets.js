(() => {
 const cfg=window.FINANCE_OS_CONFIG||{};
 const API=String(cfg.apiBase||window.FINANCE_OS_API_BASE||"").replace(/\/$/,"");
 const $=id=>document.getElementById(id);
 const num=v=>{if(v===null||v===undefined||String(v).trim()==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const money=v=>num(v)===null?"—":"$"+Number(v).toLocaleString("en-US",{maximumFractionDigits:0});
 function request(path){if(!API)throw new Error("Finance OS API gateway is not configured.");return fetch(API+path,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(18000),cache:"no-store"}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Provider returned HTTP "+r.status);return d;});}
 function polyCard(e){
  const m=(e.markets||[]).find(x=>x.outcomePrices?.length)||e.markets?.[0];
  const outcomes=m?.outcomes||[],prices=m?.outcomePrices||[];
  const probs=outcomes.slice(0,4).map((o,i)=>{const p=num(prices[i]);const pct=p===null?null:Math.max(0,Math.min(100,p*100));return '<div class="prob-line"><span>'+esc(o)+'</span><b>'+(pct===null?"—":pct.toFixed(1)+"%")+'</b></div>'+(pct===null?"":'<div class="prob-track"><i style="width:'+pct+'%"></i></div>');}).join("");
  const v24=num(e.volume24hr),total=num(e.volume);
  const volume=v24!==null?"24h volume "+money(v24):"Total volume "+money(total)+" · 24h unavailable";
  return '<article class="prediction-card"><a target="_blank" rel="noopener noreferrer" href="'+esc(e.url||"https://polymarket.com")+'">'+esc(e.title)+'</a><div class="prediction-meta">'+volume+' · liquidity '+money(e.liquidity)+'</div>'+(probs||'<p class="muted">Outcome probability not supplied.</p>')+'</article>';
 }
 function kalshiCard(e){
  const px=v=>v===null?"—":(v>1?(v/100).toFixed(3):v.toFixed(3))+" USD";
  return '<article class="prediction-card"><div class="prediction-title">'+esc(e.title)+'</div><div class="prediction-meta">'+esc(e.ticker)+' · 24h volume '+(num(e.volume24h)===null?"—":fmt(e.volume24h))+'</div><div class="prob-line"><span>YES bid</span><b>'+px(num(e.yesBid))+'</b></div><div class="prob-line"><span>YES ask</span><b>'+px(num(e.yesAsk))+'</b></div><div class="prob-line"><span>Last</span><b>'+px(num(e.lastPrice))+'</b></div><a class="text-link" target="_blank" rel="noopener noreferrer" href="'+esc(e.url||"https://kalshi.com/markets")+'">Open venue markets ↗</a></article>';
 }
 function fmt(v){return num(v)===null?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:0});}
 async function load(){
  $("predictionRefresh").disabled=true;$("predictionState").textContent="Loading read-only event-market snapshots…";
  const [poly,kalshi]=await Promise.allSettled([request("/api/v1/prediction/polymarket"),request("/api/v1/prediction/kalshi")]);
  if(poly.status==="fulfilled"){
   $("polyGrid").innerHTML=(poly.value.items||[]).slice(0,12).map(polyCard).join("")||'<div class="empty-state">No Polymarket events returned.</div>';
   $("polyStatus").textContent=String(poly.value.status||"unknown").toUpperCase()+" · "+(poly.value.items||[]).length+" events";
   $("polyRetrieved").textContent="Retrieved "+(poly.value.retrievedAt||"time not supplied");
  }else{$("polyGrid").innerHTML='<div class="empty-state">'+esc(poly.reason?.message||"Unavailable")+'</div>';$("polyStatus").textContent="UNAVAILABLE";$("polyRetrieved").textContent="—";}
  if(kalshi.status==="fulfilled"){
   $("kalshiGrid").innerHTML=(kalshi.value.items||[]).slice(0,12).map(kalshiCard).join("")||'<div class="empty-state">No Kalshi open markets returned.</div>';
   $("kalshiStatus").textContent=String(kalshi.value.status||"unknown").toUpperCase()+" · "+(kalshi.value.items||[]).length+" markets";
   $("kalshiRetrieved").textContent="Retrieved "+(kalshi.value.retrievedAt||"time not supplied");
  }else{$("kalshiGrid").innerHTML='<div class="empty-state">'+esc(kalshi.reason?.message||"Unavailable")+'</div>';$("kalshiStatus").textContent="UNAVAILABLE";$("kalshiRetrieved").textContent="—";}
  $("predictionState").textContent="Venue-reported event-market probabilities and volume are separate from CME/ICE futures prices, volume and open interest.";
  $("predictionRefresh").disabled=false;
 }
 $("predictionRefresh").addEventListener("click",load);load();
})();