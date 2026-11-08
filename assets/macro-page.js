(async()=>{
 const root=document.getElementById('macroSeries'),state=document.getElementById('macroState'),refresh=document.getElementById('macroRefresh');if(!root)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const api=(window.FINANCE_OS_CONFIG?.apiBase||'').replace(/\/$/,'');
 async function load(){
  refresh.disabled=true;refresh.textContent='Loading official BLS data…';state.textContent='Querying BLS Public Data API v1 through Cloudflare edge cache.';
  try{
   if(!api)throw new Error('Cloudflare API endpoint is not configured.');
   const r=await fetch(api+'/api/v1/macro',{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`BLS API gateway returned HTTP ${r.status}`);const d=await r.json();if(!Array.isArray(d.series))throw new Error('Provider did not return a series array.');
   root.innerHTML='';
   for(const s of d.series){
    const obs=(s.observations||[]).slice(0,24);const max=Math.max(...obs.map(x=>x.value).filter(Number.isFinite));const min=Math.min(...obs.map(x=>x.value).filter(Number.isFinite));
    const last=obs[0];const card=document.createElement('article');card.className='macro-card';
    const title=document.createElement('h3');title.textContent=s.label;card.appendChild(title);
    const latest=document.createElement('div');latest.className='macro-latest';latest.textContent=last?`${Number(last.value).toLocaleString(undefined,{maximumFractionDigits:3})} ${s.unit}`:'No observations';card.appendChild(latest);
    const period=document.createElement('div');period.className='macro-period';period.textContent=last?`${last.periodName} ${last.year}`:'Data period unavailable';card.appendChild(period);
    const bars=document.createElement('div');bars.className='macro-bars';
    obs.slice().reverse().forEach(o=>{const b=document.createElement('span');b.title=`${o.periodName} ${o.year}: ${o.value}`;const range=max-min;const pct=range?((o.value-min)/range)*85+15:50;b.style.height=`${pct}%`;bars.appendChild(b);});card.appendChild(bars);
    const note=document.createElement('p');note.textContent=s.marketContext||'';card.appendChild(note);
    root.appendChild(card);
   }
   const time=d.retrievedAt?new Date(d.retrievedAt).toLocaleString():'not available';state.textContent=`${d.provider} · ${d.status||'unknown'} · retrieved ${time}. BLS API v1 historical observations; this is not a real-time market quote.`;
  }catch(e){root.innerHTML='<p class="muted">Official BLS historical series are currently unavailable. Use the linked official provider below.</p>';state.textContent=e.message;}
  finally{refresh.disabled=false;refresh.textContent='Load / update BLS snapshot';}
 }
 refresh?.addEventListener('click',load);await load();
})();
