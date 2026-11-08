(async()=>{
 const sel=document.getElementById('contract'),out=document.getElementById('riskResult');if(!sel||!out)return;
 let contracts=[];try{const r=await fetch('/ict-futures/data/market-universe.json');const d=await r.json();contracts=d.markets||[];}catch{out.textContent='Contract data unavailable.';return;}
 contracts.forEach(m=>{const o=document.createElement('option');o.value=m.id;o.textContent=`${m.label} · ${m.exchange||'Exchange'}`;sel.appendChild(o);});
 const num=id=>Number(document.getElementById(id)?.value||0);
 const calc=()=>{const m=contracts.find(x=>x.id===sel.value);if(!m){out.textContent='Select a contract.';return;}
  const balance=num('balance'),pct=num('riskPct'),stop=num('stopTicks'),target=num('targetTicks'),commission=num('commission'),slip=num('slippage');
  const tick=Number(m.tickValue);if(!(balance>0&&pct>0&&stop>0&&target>0&&tick>0)){out.textContent='Enter positive account balance, risk, stop/target ticks and a valid tick value.';return;}
  const budget=balance*pct/100,slipCost=slip*tick,perContract=stop*tick+slipCost+commission,qty=Math.floor(budget/perContract),gross=target*tick*qty,net=(target-slip)*tick*qty-commission*qty,risk=perContract*qty,rr=perContract>0?((target-slip)*tick-commission)/perContract:0;
  out.innerHTML=`<div class="result-grid"><div><span class="muted">Contracts</span><b>${qty}</b></div><div><span class="muted">Risk budget</span><b>${fmt(budget)}</b></div><div><span class="muted">Estimated stop risk</span><b>${fmt(risk)}</b></div><div><span class="muted">Est. gross target</span><b>${fmt(gross)}</b></div><div><span class="muted">Est. net target</span><b>${fmt(net)}</b></div><div><span class="muted">Net R multiple</span><b>${rr.toFixed(2)}R</b></div><div><span class="muted">Risk utilisation</span><b>${budget?((risk/budget)*100).toFixed(1)+'%':'—'}</b></div><div><span class="muted">Tick value (source)</span><b>${fmt(tick)}</b></div></div>${qty===0?'<p><b>Warning:</b> One contract exceeds your risk budget at the stated costs and stop size.</p>':'<p>Quantity is rounded down. This does not model margin, spread, exchange fees, broker liquidation or gap/stop-fill risk.'}</p>`;
 };
 document.getElementById('calculateRisk').addEventListener('click',calc);sel.addEventListener('change',calc);
 function fmt(v){return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number.isFinite(v)?v:0)}
})();
