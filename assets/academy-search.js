(() => {
 const input=document.getElementById('academySearch'), root=document.getElementById('academyCards'), count=document.getElementById('academyCount'); if(!input||!root)return;
 const cards=[...root.querySelectorAll('.module-card')]; const filter=()=>{const q=input.value.toLowerCase().trim();let n=0;cards.forEach(c=>{const show=!q||c.textContent.toLowerCase().includes(q);c.hidden=!show;if(show)n++;});count.textContent=`${n} lessons`;};input.addEventListener('input',filter);filter();
})();
