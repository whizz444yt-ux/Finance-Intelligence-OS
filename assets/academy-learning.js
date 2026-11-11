(() => {
 const PROGRESS_KEY="ictfos.academy.progress.v2";
 const LEGACY_KEY="ictfos.academy.done.v1";
 const SESSION_KEY="finance-os-supabase-session-v1";
 const cfg=window.FINANCE_OS_CONFIG||{};
 const apiBase=String(cfg.supabaseUrl||"").replace(/\/$/,"");
 const publishable=cfg.supabaseAnonKey||"";
 const $=(root,selector)=>root.querySelector(selector);
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
 const progressMap=()=>read(PROGRESS_KEY,{});
 const legacyDone=()=>read(LEGACY_KEY,[]);
 const versionOf=root=>String(root.dataset.contentVersion||"2");
 function paint(root,record,doneCount,total){
  const status=$(root,"[data-progress-status]"),bar=$(root,"[data-progress-bar]"),copy=$(root,"[data-progress-copy]");
  if(status)status.textContent=record?.status==="completed"?"Completed":record?.legacyCompletion?.status==="completed"?"Previously completed · review update":record?.status==="in-progress"?"In progress":"Not started";
  if(bar)bar.style.width=(total?Math.round(doneCount/total*100):0)+"%";
  if(copy)copy.textContent=doneCount+" of "+total+" practice checks complete";
 }
 function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY)||"null");}catch{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");}catch{return null;}}}
 function headers(s,extra={}){return {apikey:publishable,Authorization:"Bearer "+s.access_token,...extra};}
 async function userId(s){
  if(s?.user?.id)return s.user.id;
  if(!apiBase||!publishable||!s?.access_token)return null;
  const r=await fetch(apiBase+"/auth/v1/user",{headers:headers(s)});
  if(!r.ok)return null;
  const u=await r.json();return u.id||null;
 }
 function isLegacyComplete(record){
  return record?.status==="completed"||record?.legacyCompletion?.status==="completed";
 }
 function keepLegacyCompletion(record){
  if(record?.legacyCompletion)return record.legacyCompletion;
  if(record?.status==="completed"){
   return {status:"completed",score:record.score??null,completedAt:record.completedAt||null,exerciseDone:[...(record.exerciseDone||[])],quizAnswers:[...(record.quizAnswers||[])],lessonVersion:record.lessonVersion||"p3-v1"};
  }
  return null;
 }
 function migrateContentVersion(record,version){
  if(!record)return {status:"not-started",exerciseDone:[],quizAnswers:[],contentVersion:version,lessonVersion:"part-2-v2"};
  const current=String(record.lessonVersion||record.contentVersion||"legacy");
  const oldVersion=current!=="part-2-v2"&&current!==version;
  if(!oldVersion){
   if(current==="part-2-v2"&&String(record.contentVersion||version)===String(version))return record;
   return {...record,contentVersion:version,lessonVersion:"part-2-v2",exerciseDone:record.exerciseDone||[],quizAnswers:record.quizAnswers||[]};
  }
  const legacy=keepLegacyCompletion(record)||record.legacyCompletion||{
   status:record.status||"in-progress",score:record.score??null,completedAt:record.completedAt||null,
   exerciseDone:[...(record.exerciseDone||[])],quizAnswers:[...(record.quizAnswers||[])],lessonVersion:current
  };
  return {
   ...record,
   status:"in-progress",
   score:null,
   completedAt:null,
   exerciseDone:[],
   quizAnswers:[],
   legacyCompletion:legacy,
   contentVersion:version,
   lessonVersion:"part-2-v2",
   updatedAt:new Date().toISOString()
  };
 }
 function syncLegacyIndex(slug,record){
  if(slug.startsWith("tutorial-"))return;
  const set=new Set(legacyDone());
  if(record?.status==="completed"||record?.legacyCompletion?.status==="completed")set.add(slug);
  else if(!record?.legacyCompletion?.status)set.delete(slug);
  write(LEGACY_KEY,[...set]);
 }
 async function syncWrite(slug,record,s,uid){
  if(!uid||!record)return;
  const payload={
   user_id:uid,lesson_slug:slug,status:record.status||"in-progress",
   score:record.score??null,completed_at:record.completedAt||null,
   progress_data:{
    exerciseDone:record.exerciseDone||[],
    quizAnswers:record.quizAnswers||[],
    quizAnswered:Array.isArray(record.quizAnswers)&&record.quizAnswers.length>0,
    legacyCompletion:record.legacyCompletion||null,
    contentVersion:record.contentVersion||2,
    lessonVersion:"part-2-v2"
   },
   lesson_version:"part-2-v2",updated_at:new Date().toISOString()
  };
  const r=await fetch(apiBase+"/rest/v1/lesson_progress?on_conflict=user_id,lesson_slug",{
   method:"POST",headers:headers(s,{"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(payload)
  });
  if(!r.ok)throw new Error("Progress sync HTTP "+r.status);
 }
 function setRecord(slug,record){
  const map=progressMap();map[slug]=record;write(PROGRESS_KEY,map);syncLegacyIndex(slug,record);
  window.dispatchEvent(new CustomEvent("academy:progress-updated",{detail:{slug,record}}));
 }
 async function syncRecord(slug,record,statusEl){
  const s=session();
  if(!apiBase||!publishable||!s?.access_token){if(statusEl)statusEl.textContent="Saved on this device · sign in to sync across devices.";return;}
  try{const uid=await userId(s);if(!uid){if(statusEl)statusEl.textContent="Saved locally · sign in again to sync.";return;}await syncWrite(slug,record,s,uid);if(statusEl)statusEl.textContent="Synced to your signed-in Supabase account.";}
  catch(e){if(statusEl)statusEl.textContent="Saved locally · cloud sync unavailable ("+e.message+").";}
 }
 async function mergeRemote(root,slug,checks,quizData){
  const s=session();if(!apiBase||!publishable||!s?.access_token)return false;
  try{
   const uid=await userId(s);if(!uid)return false;
   const q="?select=lesson_slug,status,score,completed_at,updated_at,progress_data,lesson_version&lesson_slug=eq."+encodeURIComponent(slug)+"&limit=1";
   const r=await fetch(apiBase+"/rest/v1/lesson_progress"+q,{headers:headers(s)});if(!r.ok)return false;
   const rows=await r.json(),remote=rows[0];if(!remote)return false;
   const map=progressMap(),local=map[slug],remoteProgress=remote.progress_data||{};
   const remoteRecord={
    status:remote.status||"not-started",score:remote.score??null,completedAt:remote.completed_at||null,
    updatedAt:remote.updated_at||null,exerciseDone:remoteProgress.exerciseDone||[],
    quizAnswers:remoteProgress.quizAnswers||[],legacyCompletion:remoteProgress.legacyCompletion||null,
    lessonVersion:remote.lesson_version||remoteProgress.lessonVersion||"legacy",
    contentVersion:remoteProgress.contentVersion||1
   };
   const rt=Date.parse(remote.updated_at||remote.completed_at||"")||0,lt=Date.parse(local?.updatedAt||local?.completedAt||"")||0;
   const useRemote=!local||rt>lt;
   let chosen=useRemote?remoteRecord:local;
   const migrated=migrateContentVersion(chosen,versionOf(root));
   map[slug]=migrated;write(PROGRESS_KEY,map);syncLegacyIndex(slug,migrated);
   if(useRemote&&(migrated.lessonVersion!=="part-2-v2"||String(chosen.lessonVersion||"")!=="part-2-v2"))await syncWrite(slug,migrated,s,uid);
   else if(!useRemote&&lt>rt)await syncWrite(slug,migrated,s,uid);
   return true;
  }catch{
   const el=$(root,"[data-progress-sync]");if(el)el.textContent="Local progress active · cloud sync needs attention.";return false;
  }
 }
 function initRoot(root){
  const slug=root.dataset.academyLesson;if(!slug)return;
  const checks=[...root.querySelectorAll("[data-exercise-check]")],markBtn=root.querySelector("[data-mark-complete]");
  const syncEl=$(root,"[data-progress-sync]"),message=$(root,"[data-progress-message]");
  let quizData=[];try{const parsed=JSON.parse(root.querySelector("#academyQuizData")?.textContent||"[]");quizData=Array.isArray(parsed)?parsed:(parsed&&Object.keys(parsed).length?[parsed]:[]);}catch{}
  const quizGroups=[...root.querySelectorAll("[data-academy-quiz-question]")];
  const legacyQuiz=root.querySelector("[data-academy-quiz]");
  if(!quizGroups.length&&legacyQuiz)quizGroups.push(legacyQuiz);
  quizData=quizData.slice(0,Math.max(quizGroups.length,quizData.length));
  const savedRaw=progressMap()[slug];
  const saved=savedRaw?migrateContentVersion(savedRaw,versionOf(root)):{status:"not-started",exerciseDone:[],quizAnswers:[],contentVersion:Number(versionOf(root)),lessonVersion:"part-2-v2"};
  if(savedRaw&&saved!==savedRaw) {const m=progressMap();m[slug]=saved;write(PROGRESS_KEY,m);syncLegacyIndex(slug,saved);syncRecord(slug,saved,syncEl);}
  const answers=Array.isArray(saved.quizAnswers)?[...saved.quizAnswers]:[];
  const allExercisesDone=record=>(record.exerciseDone||[]).length===checks.length;
  const allQuestionsCorrect=vals=>quizGroups.every((group,i)=>{
   if(!quizData[i])return true;
   const val=vals[i];return val!==undefined&&Number(val)===Number(quizData[i].correctIndex);
  });
  let score=saved.score??null;
  checks.forEach((check,i)=>{check.checked=(saved.exerciseDone||[]).includes(i);check.addEventListener("change",update);});
  quizGroups.forEach((group,i)=>{
   const q=quizData[i]||{},feedback=group.querySelector("[data-quiz-feedback]"),button=group.querySelector("[data-check-answer]");
   if(answers[i]!==undefined){
    const input=group.querySelector('input[type="radio"][value="'+String(answers[i])+'"]');
    if(input)input.checked=true;
    const correct=Number(answers[i])===Number(q.correctIndex);
    if(feedback&&correct){feedback.className="quiz-feedback good";feedback.textContent="Correct. "+(q.explanation||"");}
   }
   if(button)button.addEventListener("click",()=>{
    const selected=group.querySelector('input[type="radio"]:checked');
    if(!selected){if(feedback){feedback.className="quiz-feedback bad";feedback.textContent="Select one answer first.";}return;}
    answers[i]=Number(selected.value);
    const correct=answers[i]===Number(q.correctIndex);
    if(feedback){feedback.className="quiz-feedback "+(correct?"good":"bad");feedback.textContent=(correct?"Correct. ":"Not quite. ")+(q.explanation||"Review the lesson and try again.");}
    update();
   });
  });
  function currentScore(){if(!quizGroups.length)return null;const correct=quizGroups.reduce((n,g,i)=>n+(quizData[i]&&answers[i]!==undefined&&Number(answers[i])===Number(quizData[i].correctIndex)?1:0),0);return Math.round(correct/quizGroups.length*100);}
  function refreshCompletion(record){
   const all=allExercisesDone(record),quizOk=allQuestionsCorrect(record.quizAnswers||[]);
   const complete=all&&quizOk;
   if(markBtn)markBtn.disabled=!complete;
   if(message&&markBtn)message.textContent=complete?"All requirements met. You can mark this content version complete.":"Complete every practice check and answer all knowledge-check questions correctly.";
  }
  function update(){
   const done=checks.map((x,i)=>x.checked?i:null).filter(x=>x!==null);
   const nextScore=currentScore(),all=done.length===checks.length,quizOk=allQuestionsCorrect(answers);
   const old=progressMap()[slug]||saved;
   const record={
    ...old,status:old.status==="completed"&&all&&quizOk?"completed":(done.length||answers.some(x=>x!==undefined)?"in-progress":"not-started"),
    score:nextScore,completedAt:old.status==="completed"&&all&&quizOk?(old.completedAt||new Date().toISOString()):null,
    exerciseDone:done,quizAnswers:[...answers],contentVersion:Number(versionOf(root)),lessonVersion:"part-2-v2",updatedAt:new Date().toISOString()
   };
   setRecord(slug,record);score=nextScore;paint(root,record,done.length,checks.length);refreshCompletion(record);syncRecord(slug,record,syncEl);
  }
  if(markBtn)markBtn.addEventListener("click",()=>{
   if(markBtn.disabled)return;
   const old=progressMap()[slug]||saved;
   const record={...old,status:old.status==="completed"?"in-progress":"completed",score:currentScore(),completedAt:old.status==="completed"?null:new Date().toISOString(),exerciseDone:checks.map((x,i)=>x.checked?i:null).filter(x=>x!==null),quizAnswers:[...answers],contentVersion:Number(versionOf(root)),lessonVersion:"part-2-v2",updatedAt:new Date().toISOString()};
   setRecord(slug,record);markBtn.textContent=record.status==="completed"?"Mark incomplete":"Complete lesson after all checks";
   if(message)message.textContent=record.status==="completed"?"Lesson completed. Your progress is saved.":"Lesson reopened for review.";
   paint(root,record,record.exerciseDone.length,checks.length);refreshCompletion(record);syncRecord(slug,record,syncEl);
  });
  paint(root,saved,(saved.exerciseDone||[]).length,checks.length);
  refreshCompletion(saved);
  mergeRemote(root,slug,checks,quizData).then(merged=>{
   if(!merged)return;
   const p=progressMap()[slug]||saved,done=new Set(p.exerciseDone||[]),remoteAnswers=p.quizAnswers||[];
   checks.forEach((x,i)=>x.checked=done.has(i));
   quizGroups.forEach((group,i)=>{
    if(remoteAnswers[i]!==undefined){
     const input=group.querySelector('input[type="radio"][value="'+String(remoteAnswers[i])+'"]');if(input)input.checked=true;
     const feedback=group.querySelector("[data-quiz-feedback]");
     if(feedback&&Number(remoteAnswers[i])===Number(quizData[i]?.correctIndex)){feedback.className="quiz-feedback good";feedback.textContent="Correct. "+(quizData[i]?.explanation||"");}
    }
   });
   answers.splice(0,answers.length,...remoteAnswers);score=p.score??currentScore();
   paint(root,p,done.size,checks.length);refreshCompletion(p);
   if(markBtn)markBtn.textContent=p.status==="completed"?"Mark incomplete":"Complete lesson after all checks";
  });
 }
 function init(){document.querySelectorAll("main[data-academy-lesson]").forEach(initRoot);}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
 window.addEventListener("academy:progress-updated",()=>{
  const badge=document.querySelector("[data-academy-global-progress]");
  if(badge){const done=legacyDone();badge.textContent=done.length+" / 82 lessons completed";}
 });
})();