(async()=>{
 const grid=document.getElementById('newsGrid'),state=document.getElementById('newsState'),btn=document.getElementById('refreshNews');
 if(!grid)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const valid=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}};
 let pollHandle=null;
 const render=(items,status='snapshot')=>{
  grid.innerHTML=items.length?items.map(a=>'<article class="news-card"><h3><a href="'+esc(valid(a.url))+'" target="_blank" rel="noopener noreferrer">'+esc(a.title)+'</a></h3><p>'+esc(a.topic||a.domain||'News discovery')+' · '+esc(a.seendate||a.publishedAt||'Time unavailable')+'</p></article>').join(''):'<p class="muted">No saved articles. The app does not invent headlines; use official sources and search links while the collector has no snapshot.</p>';
  state.textContent='Displayed '+items.length+' record(s) · '+status;
 };
 async function loadSnapshot(force=false){
  const base=String(window.FINANCE_OS_API_BASE||'').replace(/\/$/,'');
  if(!base)throw new Error('API gateway is not configured.');
  const response=await fetch(base+'/api/v1/news'+(force?'?refresh=1':''),{headers:{Accept:'application/json'},cache:'no-store'});
  if(!response.ok)throw new Error('News gateway HTTP '+response.status);
  return response.json();
 }
 try{
  const d=await loadSnapshot(false);render(Array.isArray(d.articles)?d.articles:[],(d.status||'unknown')+' snapshot · checked '+(d.lastCheckedAt||'time unavailable'));
 }catch{render([],'local snapshot / API unavailable');}
 btn?.addEventListener('click',async()=>{
  if(btn.disabled)return;
  btn.disabled=true;btn.textContent='Queuing refresh…';state.textContent='Requesting a controlled GDELT refresh; current snapshot remains visible.';
  try{
   const d=await loadSnapshot(true);
   render(Array.isArray(d.articles)?d.articles:[],(d.status||'unknown')+' · refresh '+(d.refresh?.status||'unknown'));
   btn.textContent=d.refresh?.status==='cooldown'?'Recently checked':'Refresh queued';
   if(d.refresh?.status==='queued'||d.refresh?.status==='in-progress'){
    let attempts=0;
    pollHandle=setInterval(async()=>{
     attempts++;
     try{
      const next=await loadSnapshot(false);
      render(Array.isArray(next.articles)?next.articles:[],(next.status||'unknown')+' · checked '+(next.lastCheckedAt||'time unavailable'));
      if(attempts>=8||next.lastCheckedAt!==d.lastCheckedAt){clearInterval(pollHandle);btn.disabled=false;btn.textContent='Refresh news snapshot';}
     }catch{if(attempts>=8){clearInterval(pollHandle);btn.disabled=false;btn.textContent='Refresh news snapshot';}}
    },5000);
   }else{btn.disabled=false;btn.textContent='Refresh news snapshot';}
  }catch(error){state.textContent=error.message;btn.disabled=false;btn.textContent='Retry news refresh';}
 });
 if(btn)btn.textContent='Refresh news snapshot';
})();