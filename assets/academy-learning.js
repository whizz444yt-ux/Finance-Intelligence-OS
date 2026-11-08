(() => {
 const PROGRESS_KEY="ictfos.academy.progress.v2";
 const LEGACY_KEY="ictfos.academy.done.v1";
 const SESSION_KEY="finance-os-supabase-session-v1";
 const cfg=window.FINANCE_OS_CONFIG||{};
 const apiBase=String(cfg.supabaseUrl||"").replace(/\/$/,"");
 const publishable=cfg.supabaseAnonKey||"";
 const $=(root,selector)=>root.querySelector(selector);
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const progressMap=()=>read(PROGRESS_KEY,{});
 const legacyDone=()=>read(LEGACY_KEY,[]);
 function paint(root,record,doneCount,total){
  const status=$(root,"[data-progress-status]"),bar=$(root,"[data-progress-bar]"),copy=$(root,"[data-progress-copy]");
  if(status)status.textContent=record?.status==="completed"?"Completed":record?.status==="in-progress"?"In progress":"Not started";
  if(bar)bar.style.width=(total?Math.round(doneCount/total*100):0)+"%";
  if(copy)copy.textContent=doneCount+" of "+total+" practice steps checked";
 }
 function session(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");}catch{return null;}}
 function headers(s,extra={}){return {apikey:publishable,Authorization:"Bearer "+s.access_token,...extra};}
 async function userId(s){
  if(s?.user?.id)return s.user.id;
  if(!apiBase||!publishable||!s?.access_token)return null;
  const r=await fetch(apiBase+"/auth/v1/user",{headers:headers(s)});
  if(!r.ok)return null;
  const u=await r.json();return u.id||null;
 }
 async function syncWrite(slug,record,s,uid){
  if(!uid||!record)return;
  const payload={user_id:uid,lesson_slug:slug,status:record.status||"in-progress",score:record.score??null,completed_at:record.completedAt||null,updated_at:new Date().toISOString()};
  const r=await fetch(apiBase+"/rest/v1/lesson_progress?on_conflict=user_id,lesson_slug",{
   method:"POST",headers:headers(s,{"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(payload)
  });
  if(!r.ok)throw new Error("Progress sync HTTP "+r.status);
 }
 function setRecord(slug,record){
  const map=progressMap();map[slug]=record;write(PROGRESS_KEY,map);
  if(!slug.startsWith("tutorial-")){
   let done=legacyDone().filter(x=>x!==slug);if(record.status==="completed")done.push(slug);write(LEGACY_KEY,done);
  }
  window.dispatchEvent(new CustomEvent("academy:progress-updated",{detail:{slug,record}}));
 }
 async function syncRecord(slug,record,statusEl){
  const s=session();
  if(!apiBase||!publishable||!s?.access_token){if(statusEl)statusEl.textContent="Saved on this device · sign in to sync across devices.";return;}
  try{const uid=await userId(s);if(!uid){if(statusEl)statusEl.textContent="Saved locally · sign in again to sync.";return;}await syncWrite(slug,record,s,uid);if(statusEl)statusEl.textContent="Synced to your signed-in Supabase account.";}
  catch(e){if(statusEl)statusEl.textContent="Saved locally · cloud sync unavailable ("+e.message+").";}
 }
 async function mergeRemote(root,slug){
  const s=session();if(!apiBase||!publishable||!s?.access_token)return;
  try{
   const uid=await userId(s);if(!uid)return;
   const q="?select=lesson_slug,status,score,completed_at,updated_at&lesson_slug=eq."+encodeURIComponent(slug)+"&limit=1";
   const r=await fetch(apiBase+"/rest/v1/lesson_progress"+q,{headers:headers(s)});if(!r.ok)return;
   const rows=await r.json(),remote=rows[0];if(!remote)return;
   const map=progressMap(),local=map[slug];
   const rt=Date.parse(remote.updated_at||remote.completed_at||"")||0,lt=Date.parse(local?.updatedAt||local?.completedAt||"")||0;
   if(!local||rt>lt){
    map[slug]={status:quiz&&remote.status==="completed"&&Number(remote.score)<100?"in-progress":remote.status,score:remote.score,completedAt:remote.completed_at,updatedAt:remote.updated_at,exerciseDone:local?.exerciseDone||[]};write(PROGRESS_KEY,map);
    if(!slug.startsWith("tutorial-")){let done=legacyDone().filter(x=>x!==slug);if(remote.status==="completed")done.push(slug);write(LEGACY_KEY,done);}
   }else if(local){await syncWrite(slug,local,s,uid);}
  }catch{const el=$(root,"[data-progress-sync]");if(el)el.textContent="Local progress active · cloud sync needs attention.";}
 }
 function initRoot(root){
  const slug=root.dataset.academyLesson;if(!slug)return;
  const checks=[...root.querySelectorAll("[data-exercise-check]")],quiz=root.querySelector("[data-academy-quiz]");
  const checkBtn=root.querySelector("[data-check-answer]"),markBtn=root.querySelector("[data-mark-complete]");
  const feedback=root.querySelector("[data-quiz-feedback]"),syncEl=root.querySelector("[data-progress-sync]"),message=root.querySelector("[data-progress-message]");
  let quizData={correctIndex:0,explanation:""};try{quizData=JSON.parse(root.querySelector("#academyQuizData")?.textContent||"{}");}catch{}
  const saved=progressMap()[slug]||{status:"not-started",exerciseDone:[]};
  const initial=quiz&&saved.status==="completed"&&Number(saved.score)<100?{...saved,status:"in-progress"}:saved;
  let quizCorrect=!!quiz&&Number(initial.score)>=100,score=initial.score??null;
  checks.forEach((check,i)=>{check.checked=(initial.exerciseDone||[]).includes(i);check.addEventListener("change",update);});
  function update(){
   const done=checks.map((x,i)=>x.checked?i:null).filter(x=>x!==null),all=checks.length?done.length===checks.length:true;
   const old=progressMap()[slug]||{},status=old.status==="completed"&&all&&(!quiz||quizCorrect)?"completed":done.length||quizCorrect?"in-progress":"not-started";
   const record={...old,status,score:score??old.score??null,completedAt:status==="completed"?(old.completedAt||new Date().toISOString()):null,exerciseDone:done,updatedAt:new Date().toISOString()};
   setRecord(slug,record);paint(root,record,done.length,checks.length);
   if(markBtn)markBtn.disabled=!(all&&(!quiz||quizCorrect));
   if(message&&markBtn)message.textContent=markBtn.disabled?"Complete all practice checks and answer the question correctly to mark the lesson complete.":"All requirements met. You can now mark this lesson complete.";
   syncRecord(slug,record,syncEl);
  }
  if(quiz&&checkBtn)checkBtn.addEventListener("click",()=>{
   const selected=quiz.querySelector('input[type="radio"]:checked');
   if(!selected){if(feedback){feedback.className="quiz-feedback bad";feedback.textContent="Select one answer first.";}return;}
   quizCorrect=Number(selected.value)===Number(quizData.correctIndex);score=quizCorrect?100:0;
   if(feedback){feedback.className="quiz-feedback "+(quizCorrect?"good":"bad");feedback.textContent=(quizCorrect?"Correct. ":"Not quite. ")+(quizData.explanation||"Review the walkthrough and try again.");}
   update();
  });
  if(markBtn)markBtn.addEventListener("click",()=>{
   if(markBtn.disabled)return;
   const old=progressMap()[slug]||{},status=old.status==="completed"?"in-progress":"completed";
   const record={...old,status,score:quiz?score:old.score??null,completedAt:status==="completed"?new Date().toISOString():null,exerciseDone:checks.map((x,i)=>x.checked?i:null).filter(x=>x!==null),updatedAt:new Date().toISOString()};
   setRecord(slug,record);markBtn.textContent=status==="completed"?"Mark incomplete":"Complete lesson after exercise + correct answer";
   if(message)message.textContent=status==="completed"?"Lesson completed. Your progress has been saved.":"Lesson reopened for review.";
   paint(root,record,record.exerciseDone.length,checks.length);syncRecord(slug,record,syncEl);
  });
  if(markBtn&&initial.status==="completed")markBtn.textContent="Mark incomplete";
  paint(root,initial,(initial.exerciseDone||[]).length,checks.length);
  if(markBtn)markBtn.disabled=!((initial.exerciseDone||[]).length===checks.length&&(!quiz||quizCorrect));
  mergeRemote(root,slug).then(()=>{
   const p=progressMap()[slug]||initial,done=new Set(p.exerciseDone||[]);checks.forEach((x,i)=>x.checked=done.has(i));
   paint(root,p,done.size,checks.length);
   if(markBtn){markBtn.disabled=!(done.size===checks.length&&(!quiz||Number(p.score)>=100));markBtn.textContent=p.status==="completed"?"Mark incomplete":"Complete lesson after exercise + correct answer";}
  });
 }
 function init(){document.querySelectorAll("main[data-academy-lesson]").forEach(initRoot);}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
 window.addEventListener("academy:progress-updated",()=>{
  const badge=document.querySelector("[data-academy-global-progress]");
  if(badge){const done=legacyDone();badge.textContent=done.length+" / 76 lessons completed";}
 });
})();
