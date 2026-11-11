(() => {
 const root=document.getElementById("academyCatalog");
 if(!root)return;
 const search=document.getElementById("academySearch");
 const category=document.getElementById("academyCategory");
 const level=document.getElementById("academyLevel");
 const evidence=document.getElementById("academyEvidence");
 const count=document.getElementById("academyCount");
 const progress=document.querySelector("[data-academy-global-progress]");
 const cards=[...root.querySelectorAll("[data-academy-card]")];
 const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 function updateProgress(){
  let done=[];try{done=JSON.parse(localStorage.getItem("ictfos.academy.done.v1")||"[]");}catch{}
  let map={};try{map=JSON.parse(localStorage.getItem("ictfos.academy.progress.v2")||"{}");}catch{}
  const merged=new Set([...done,...Object.entries(map).filter(([id,p])=>p?.status==="completed"&&!id.startsWith("tutorial-")).map(([id])=>id)]);
  const current=[...merged].filter(id=>cards.some(c=>c.querySelector("a")?.getAttribute("href")==="/ict-futures/academy/"+id+".html")).length;
  if(progress)progress.textContent=current+" / "+cards.length+" lessons completed";
 }
 function filter(){
  const q=(search?.value||"").trim().toLowerCase(),cat=category?.value||"",lvl=level?.value||"";
  let shown=0;
  cards.forEach(card=>{
   const visible=(!q||card.dataset.search.includes(q))&&(!cat||card.dataset.category===cat)&&(!lvl||card.dataset.level===lvl)&&(!evidence||!evidence.value||card.dataset.evidence===evidence.value);
   card.hidden=!visible;if(visible)shown++;
  });
  if(count)count.textContent=shown+" of "+cards.length+" lessons";
 }
 [search,category,level,evidence].forEach(el=>el?.addEventListener(el===search?"input":"change",filter));
 window.addEventListener("storage",updateProgress);
 window.addEventListener("academy:progress-updated",updateProgress);
 filter();updateProgress();
})();
