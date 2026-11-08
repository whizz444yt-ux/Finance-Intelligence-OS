(async()=>{
 const sel=document.getElementById('contract'),out=document.getElementById('riskResult');
 if(!sel||!out)return;
 const number=(id)=>{const el=document.getElementById(id);if(!el||el.value.trim()==='')return null;const n=Number(el.value);return Number.isFinite(n)?n:null;};
 const fmt=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);
 let contracts=[];
 try{
  const response=await fetch('/ict-futures/data/market-universe.json',{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();contracts=Array.isArray(data.markets)?data.markets:[];
  if(!contracts.length)throw new Error('No contract profiles found');
 }catch(error){out.textContent='Contract data unavailable. Check the ICT Futures market catalogue and retry.';return;}
 for(const market of contracts){
  const option=document.createElement('option');option.value=market.id;option.textContent=market.label+' · '+(market.exchange||'Exchange');sel.appendChild(option);
 }
 const contractLabel=sel.closest('label');
 const modeLabel=document.createElement('label');modeLabel.textContent='Contract size (standard / micro)';
 const mode=document.createElement('select');mode.id='contractMode';
 const standard=document.createElement('option');standard.value='standard';standard.textContent='Standard';
 const micro=document.createElement('option');micro.value='micro';micro.textContent='Micro';
 mode.append(standard,micro);modeLabel.appendChild(mode);
 if(contractLabel?.parentNode)contractLabel.insertAdjacentElement('afterend',modeLabel);
 else sel.insertAdjacentElement('afterend',modeLabel);
 const selected=()=>contracts.find(x=>x.id===sel.value);
 function syncMode(){
  const market=selected(),hasMicro=Boolean(market?.microSpec&&Number(market.microSpec.tickValue)>0&&Number(market.microSpec.tickSize)>0);
  micro.disabled=!hasMicro;
  if(!hasMicro)mode.value='standard';
  modeLabel.hidden=!hasMicro;
 }
 function calculate(){
  const market=selected();if(!market){out.textContent='Select a futures contract.';return;}
  const spec=mode.value==='micro'?market.microSpec:market;
  const tickValue=Number(spec?.tickValue),tickSize=Number(spec?.tickSize);
  const balance=number('balance'),riskPercent=number('riskPct'),stopTicks=number('stopTicks'),targetTicks=number('targetTicks');
  const commission=number('commission'),slippage=number('slippage');
  const invalid=balance===null||balance<=0||riskPercent===null||riskPercent<=0||riskPercent>100||
   stopTicks===null||stopTicks<=0||targetTicks===null||targetTicks<=0||
   commission===null||commission<0||slippage===null||slippage<0||
   !Number.isFinite(tickValue)||tickValue<=0||!Number.isFinite(tickSize)||tickSize<=0;
  if(invalid){out.textContent='Enter a positive balance, risk between 0 and 100%, positive stop/target ticks, non-negative costs, and a valid contract tick specification.';return;}
  const riskBudget=balance*riskPercent/100;
  const stopCost=stopTicks*tickValue;
  const slippageCost=slippage*tickValue;
  const perContractRisk=stopCost+slippageCost+commission;
  if(!Number.isFinite(perContractRisk)||perContractRisk<=0){out.textContent='The estimated per-contract stop risk is invalid. Check the inputs.';return;}
  const quantity=Math.floor(riskBudget/perContractRisk);
  const estimatedStopRisk=perContractRisk*quantity;
  const grossTarget=targetTicks*tickValue*quantity;
  const netTarget=((targetTicks-slippage)*tickValue-commission)*quantity;
  const netR=(((targetTicks-slippage)*tickValue)-commission)/perContractRisk;
  const warning=quantity===0
   ?'<p><b>Risk limit:</b> One contract exceeds the stated risk budget. Reduce the stop distance or use a supported micro contract; do not increase the risk limit just to force a trade.</p>'
   :'<p>Quantity is rounded down to stay within the stated risk budget.</p>';
  const specState=market.specStatus||market.verificationStatus||'unverified';
  out.innerHTML='<div class="result-grid">'+
   '<div><span class="muted">Contracts</span><b>'+quantity+'</b></div>'+
   '<div><span class="muted">Risk budget</span><b>'+fmt(riskBudget)+'</b></div>'+
   '<div><span class="muted">Estimated stop risk</span><b>'+fmt(estimatedStopRisk)+'</b></div>'+
   '<div><span class="muted">Gross target before costs</span><b>'+fmt(grossTarget)+'</b></div>'+
   '<div><span class="muted">Estimated net target</span><b>'+fmt(netTarget)+'</b></div>'+
   '<div><span class="muted">Net reward / risk</span><b>'+netR.toFixed(2)+'R</b></div>'+
   '<div><span class="muted">Risk utilisation</span><b>'+(riskBudget?((estimatedStopRisk/riskBudget)*100).toFixed(1)+'%':'—')+'</b></div>'+
   '<div><span class="muted">Tick size / value</span><b>'+tickSize+' / '+fmt(tickValue)+'</b></div></div>'+
   '<p class="fine-print">Selected '+(mode.value==='micro'?'micro':'standard')+' profile · '+String(specState)+' · USD estimate.</p>'+warning;
 }
 sel.addEventListener('change',()=>{syncMode();calculate();});
 mode.addEventListener('change',calculate);
 document.getElementById('calculateRisk')?.addEventListener('click',calculate);
 syncMode();
})();