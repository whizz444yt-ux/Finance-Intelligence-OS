(async () => {
  const root = document.getElementById('resourceCards');
  const search = document.getElementById('resourceSearch');
  const category = document.getElementById('resourceCategory');
  const count = document.getElementById('resourceCount');
  if (!root) return;
  let resources=[];
  try {
    const res=await fetch('/resources.json',{cache:'force-cache'});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload=await res.json(); resources=Array.isArray(payload.resources)?payload.resources:[];
  } catch(e) { root.innerHTML='<p class="muted">Resource directory could not be loaded. Open the main Finance OS research workspace as a fallback.</p>'; return; }
  [...new Set(resources.map(x=>x.category).filter(Boolean))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;category.appendChild(o);});
  const render=()=>{
    const q=(search.value||'').trim().toLowerCase(), c=category.value;
    const rows=resources.filter(x=>(!c||x.category===c)&&(!q||[x.name,x.category,x.description,x.tags,x.access].join(' ').toLowerCase().includes(q)));
    count.textContent=`${rows.length} of ${resources.length} resources`;
    root.innerHTML=rows.slice(0,250).map(x=>`<article class="directory-card"><div class="card-eyebrow">${esc(x.category||'Resource')}</div><h3>${esc(x.name||'Unnamed resource')}</h3><p>${esc(x.description||'')}</p><a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">Open official/source link ↗</a><div class="card-meta">${esc(x.access||'Access conditions not classified')} · ${esc(x.indiaStatus||'not assessed')}</div></article>`).join('') || '<p class="muted">No matching resources.</p>';
  };
  search.addEventListener('input',render); category.addEventListener('change',render); render();
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function safeUrl(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?esc(u.href):'#'}catch{return '#'}}
})();
