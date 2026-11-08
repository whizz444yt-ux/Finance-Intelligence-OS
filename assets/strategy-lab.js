import {
  ENGINE_VERSION, parseSignalCsv, runExperiment, tradesToCsv, decimateEquity
} from "./strategy-backtest-engine.mjs";

(() => {
  const $ = id => document.getElementById(id);
  const SESSION_KEY = "finance-os-supabase-session-v1";
  const HISTORY_KEY = "finance-os.strategy-runs.v1";
  const cfg = window.FINANCE_OS_CONFIG || {};
  const supabaseUrl = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const publishableKey = cfg.supabaseAnonKey || "";
  let csvText = "";
  let csvFile = null;
  let lastResult = null;
  let lastSummary = null;
  let cloudHistory = [];

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const formatMoney = value => value === null || value === undefined || !Number.isFinite(Number(value))
    ? "—" : new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(Number(value));
  const formatPct = value => value === null || value === undefined || !Number.isFinite(Number(value))
    ? "—" : Number(value).toFixed(2) + "%";
  const formatR = value => value === null || value === undefined || !Number.isFinite(Number(value))
    ? "—" : Number(value).toFixed(2) + "R";
  const parseSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "null"); } catch { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } } };
  const setStatus = (message, bad=false) => {
    const el=$("strategySyncStatus");
    if(el){el.textContent=message;el.className="strategy-sync-status"+(bad?" bad":"");}
  };
  const readHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
  const saveHistory = summary => {
    const next=[summary,...readHistory().filter(x=>x.runFingerprint!==summary.runFingerprint)].slice(0,12);
    localStorage.setItem(HISTORY_KEY,JSON.stringify(next));
    renderHistory();
  };
  function getConfig(){
    return {
      strategyName:$("strategyName").value,
      modelId:$("modelId").value,
      signalSourceNotes:$("signalSourceNotes").value.trim(),
      marketSymbol:$("marketSymbol").value.trim(),
      timeframe:$("timeframe").value.trim(),
      timezone:$("timezone").value.trim(),
      seriesType:$("seriesType").value,
      rollNote:$("rollNote").value.trim(),
      startingCapital:$("startingCapital").value,
      riskPercent:$("riskPercent").value,
      maxContracts:$("maxContracts").value,
      tickSize:$("tickSize").value,
      tickValue:$("tickValue").value,
      commissionPerSide:$("commissionPerSide").value,
      slippageTicks:$("slippageTicks").value,
      stopTicks:$("stopTicks").value,
      targetRR:$("targetRR").value,
      maxBarsInTrade:$("maxBarsInTrade").value,
      trainPercent:$("trainPercent").value,
      validationPercent:$("validationPercent").value
    };
  }
  function updateRollNote(){
    const isContinuous=$("seriesType").value==="back-adjusted-continuous";
    $("rollNoteWrap").classList.toggle("strategy-hidden",!isContinuous);
    $("rollNote").required=isContinuous;
  }
  function previewFile(file){
    csvFile=file; csvText="";
    $("strategyFileMeta").textContent=file ? file.name+" · "+file.size.toLocaleString()+" bytes · reading…" : "No file selected.";
    $("strategyDataQuality").className="strategy-quality";
    $("strategyDataQuality").textContent="Select a CSV with timestamp, open, high, low, close and signal columns.";
    $("runStrategy").disabled=true;
    if(!file)return;
    if(file.size>50*1024*1024){
      $("strategyDataQuality").className="strategy-quality bad";
      $("strategyDataQuality").textContent="CSV exceeds 50 MB. Split the dataset into smaller, independently documented runs.";
      return;
    }
    file.text().then(text=>{
      csvText=text;
      const parsed=parseSignalCsv(text);
      const q=parsed.quality;
      $("strategyFileMeta").textContent=file.name+" · "+file.size.toLocaleString()+" bytes · "+q.rows.toLocaleString()+" bars";
      $("strategyDataQuality").className="strategy-quality good";
      $("strategyDataQuality").textContent=
        q.rows.toLocaleString()+" bars · "+q.firstTimestamp+" → "+q.lastTimestamp+
        " · "+q.signalCount.toLocaleString()+" signals ("+q.longSignals+" long / "+q.shortSignals+" short)"+
        (q.contract?" · contract "+q.contract:"")+
        (q.stopOverrideCount?" · "+q.stopOverrideCount+" row-level stop overrides":"");
      $("runStrategy").disabled=false;
    }).catch(error=>{
      csvText="";
      $("strategyDataQuality").className="strategy-quality bad";
      $("strategyDataQuality").textContent=error.message;
    });
  }
  function metricCard(label,value,sub){
    return '<article class="strategy-metric"><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value)+'</strong><small>'+escapeHtml(sub||"")+'</small></article>';
  }
  function profitFactor(m){
    if(m.profitFactorState==="no-losses")return "No losses";
    if(m.profitFactorState==="undefined")return "—";
    return Number(m.profitFactor).toFixed(2)+"×";
  }
  function splitCard(split,label,isOos){
    const m=split.metrics;
    return '<article class="strategy-split-card'+(isOos?' oos':'')+'"><h3>'+escapeHtml(label)+(isOos?' · HOLDOUT':'')+'</h3>'+
      '<div class="split-period">'+escapeHtml(split.startAt)+' → '+escapeHtml(split.endAt)+'</div>'+
      '<div class="split-stats">'+
      '<div><span>Closed trades</span><b>'+m.trades+'</b></div>'+
      '<div><span>Win rate</span><b>'+formatPct(m.winRatePct)+'</b></div>'+
      '<div><span>Net P&L</span><b>'+formatMoney(m.netPnlUsd)+'</b></div>'+
      '<div><span>Expectancy</span><b>'+formatMoney(m.expectancyUsdPerTrade)+'</b></div>'+
      '<div><span>Average R</span><b>'+formatR(m.averageR)+'</b></div>'+
      '<div><span>Net profit factor</span><b>'+escapeHtml(profitFactor(m))+'</b></div>'+
      '<div><span>Max drawdown</span><b>'+formatMoney(m.maxDrawdownUsd)+'</b></div>'+
      '<div><span>Max DD %</span><b>'+formatPct(m.maxDrawdownPct)+'</b></div>'+
      '</div></article>';
  }
  function renderSplitTable(splits){
    return '<div class="strategy-table-wrap"><table class="strategy-table"><thead><tr><th>Period</th><th>Bars</th><th>Trades</th><th>Win rate</th><th>Net P&amp;L</th><th>Expectancy / trade</th><th>Avg R</th><th>Net PF</th><th>Max DD</th></tr></thead><tbody>'+
      splits.map(s=>{
        const m=s.metrics;
        return '<tr><td>'+escapeHtml(s.key)+'</td><td>'+s.bars+'</td><td>'+m.trades+'</td><td>'+formatPct(m.winRatePct)+'</td><td>'+formatMoney(m.netPnlUsd)+'</td><td>'+formatMoney(m.expectancyUsdPerTrade)+'</td><td>'+formatR(m.averageR)+'</td><td>'+escapeHtml(profitFactor(m))+'</td><td>'+formatMoney(m.maxDrawdownUsd)+' ('+formatPct(m.maxDrawdownPct)+')</td></tr>';
      }).join("")+'</tbody></table></div>';
  }
  function renderWarnings(warnings){
    const el=$("strategyWarnings");
    if(!warnings.length){el.innerHTML='<div class="strategy-quality good">No engine warnings were raised. This does not establish that the signal rules or source data are unbiased.</div>';return;}
    el.innerHTML='<ul class="strategy-warning-list">'+warnings.map(w=>'<li>'+escapeHtml(w)+'</li>').join("")+'</ul>';
  }
  function drawLine(canvas,points,key,fillZero=false){
    if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const width=Math.max(320,Math.floor(rect.width||820));
    const height=210,dpr=Math.max(1,window.devicePixelRatio||1);
    canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.height=height+"px";
    const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
    ctx.font="10px system-ui";ctx.fillStyle="#7c8f9d";ctx.strokeStyle="#e7edf1";ctx.lineWidth=1;
    const pad={l:55,r:12,t:12,b:28},plotW=width-pad.l-pad.r,plotH=height-pad.t-pad.b;
    if(!points.length){ctx.fillText("No equity points",pad.l,pad.t+20);return;}
    const vals=points.map(p=>Number(p[key])||0);
    let min=Math.min(...vals),max=Math.max(...vals);
    if(fillZero){min=Math.min(0,min);max=Math.max(0,max);}
    if(Math.abs(max-min)<1e-8){max+=1;min-=1;}
    for(let i=0;i<=4;i++){
      const y=pad.t+plotH*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();
      const v=max-(max-min)*i/4;ctx.fillText(v.toFixed(0),4,y+3);
    }
    const xFor=i=>pad.l+(points.length===1?0:i/(points.length-1))*plotW;
    const yFor=v=>pad.t+(max-v)/(max-min)*plotH;
    ctx.strokeStyle=key==="equity"?"#218d87":"#c27e43";ctx.lineWidth=2;ctx.beginPath();
    vals.forEach((v,i)=>{const x=xFor(i),y=yFor(v);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
    ctx.stroke();
    ctx.fillStyle="#7c8f9d";
    ctx.fillText(points[0].timestamp.slice(0,10),pad.l,height-7);
    const end=points[points.length-1].timestamp;
    const endLabel=end.slice(0,10);const textW=ctx.measureText(endLabel).width;
    ctx.fillText(endLabel,width-pad.r-textW,height-7);
  }
  function renderHistory(){
    const el=$("strategyHistory");if(!el)return;
    const local=readHistory();
    const merged=new Map();
    for(const h of [...cloudHistory,...local])if(h.runFingerprint)merged.set(h.runFingerprint,{...(merged.get(h.runFingerprint)||{}),...h});
    const history=[...merged.values()].sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0)).slice(0,12);
    if(!history.length){el.textContent="No saved runs on this device or in your signed-in account.";return;}
    el.innerHTML=history.map(h=>'<div class="strategy-history-item"><div><b>'+escapeHtml(h.strategyName)+'</b><small>'+escapeHtml(new Date(h.createdAt).toLocaleString())+' · '+escapeHtml(h.marketSymbol)+' · SHA '+escapeHtml(String(h.datasetSha256||"").slice(0,12))+'…'+(h.cloud?" · private cloud":" · this device")+'</small></div><div><b>'+formatMoney(h.oosNetPnlUsd)+'</b><small>OOS · '+escapeHtml(formatR(h.oosExpectancyR))+' expectancy</small></div></div>').join("");
  }
  function renderResult(result){
    lastResult=result;
    const full=result.fullSample.metrics;
    const oos=result.splits[2].metrics;
    const oosNote=oos.trades<30?"Low OOS trade count; exploratory only.":"OOS is still a holdout only if strategy rules were frozen before inspection.";
    $("strategyResults").classList.remove("strategy-hidden");
    $("strategyResultTitle").textContent=result.config.strategyName+" · "+result.config.marketSymbol;
    $("strategyResultFingerprint").textContent="Run fingerprint: "+result.manifest.runFingerprint+" · Dataset SHA-256: "+result.manifest.dataset.sha256;
    $("strategyOosMetrics").innerHTML=[
      metricCard("OOS net P&L",formatMoney(oos.netPnlUsd),"After modeled commission and slippage"),
      metricCard("OOS expectancy",formatMoney(oos.expectancyUsdPerTrade),formatR(oos.averageR)+" average net R per trade"),
      metricCard("OOS win rate",formatPct(oos.winRatePct),oos.trades+" closed trades"),
      metricCard("OOS max drawdown",formatMoney(oos.maxDrawdownUsd),formatPct(oos.maxDrawdownPct)+" · bar-close mark-to-market")
    ].join("");
    $("strategySplitCards").innerHTML=[
      splitCard(result.splits[0],"In-sample",false),
      splitCard(result.splits[1],"Validation",false),
      splitCard(result.splits[2],"Out-of-sample",true)
    ].join("");
    $("strategyOverallMetrics").innerHTML=[
      metricCard("Full-sample trades",String(full.trades),"Descriptive only; contains all periods"),
      metricCard("Full-sample net P&L",formatMoney(full.netPnlUsd),"After modeled costs"),
      metricCard("Net profit factor",profitFactor(full),full.profitFactorBasis),
      metricCard("Full-sample max DD",formatMoney(full.maxDrawdownUsd),formatPct(full.maxDrawdownPct)+" · "+full.maxDrawdownDurationBars+" bars underwater")
    ].join("");
    $("strategySplitTable").innerHTML=renderSplitTable(result.splits);
    drawLine($("strategyEquityChart"),decimateEquity(result.fullSample.equityCurve,500),"equity",true);
    drawLine($("strategyDrawdownChart"),decimateEquity(result.fullSample.equityCurve,500),"drawdownUsd",true);
    renderWarnings(result.warnings);
    const q=result.quality;
    $("strategyRunMeta").textContent=q.rows.toLocaleString()+" bars · "+q.firstTimestamp+" → "+q.lastTimestamp+
      " · "+q.signalCount+" signals · "+result.splitTrades.length+" split-scored trades";
    $("strategyOosNote").textContent=oosNote;
    $("downloadManifest").disabled=false;$("downloadTrades").disabled=false;
    lastSummary={
      runFingerprint:result.manifest.runFingerprint,
      datasetSha256:result.manifest.dataset.sha256,
      strategyName:result.config.strategyName,
      marketSymbol:result.config.marketSymbol,
      createdAt:result.manifest.generatedAt,
      oosNetPnlUsd:oos.netPnlUsd,
      oosExpectancyR:oos.averageR
    };
    saveHistory(lastSummary);
    syncRun(result).catch(error=>setStatus("Run remains available locally. Cloud sync failed: "+error.message,true));
  }
  function download(name,content,type){
    const blob=new Blob([content],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=name;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function downloadManifest(){
    if(!lastResult)return;
    const result=lastResult;
    const payload={
      manifest:result.manifest,
      fullSampleMetrics:result.fullSample.metrics,
      splitMetrics:result.splits.map(s=>({period:s.key,startAt:s.startAt,endAt:s.endAt,bars:s.bars,metrics:s.metrics})),
      warnings:result.warnings
    };
    download("strategy-run-"+result.manifest.runFingerprint.slice(0,12)+".json",JSON.stringify(payload,null,2),"application/json");
  }
  function downloadTrades(){
    if(!lastResult)return;
    const rows=lastResult.splitTrades.map(t=>({...t}));
    download("strategy-trades-"+lastResult.manifest.runFingerprint.slice(0,12)+".csv",tradesToCsv(rows),"text/csv;charset=utf-8");
  }
  function apiHeaders(session,extra={}){
    return {apikey:publishableKey,Authorization:"Bearer "+session.access_token,...extra};
  }
  async function getUserId(session){
    if(session?.user?.id)return session.user.id;
    const r=await fetch(supabaseUrl+"/auth/v1/user",{headers:apiHeaders(session)});
    if(!r.ok)throw new Error("Supabase session is not valid; sign in again.");
    const user=await r.json();return user.id;
  }
  async function loadCloudHistory(){
    const session=parseSession();
    if(!session?.access_token||!supabaseUrl||!publishableKey)return;
    const userId=await getUserId(session);
    const query="?select=run_fingerprint,strategy_name,dataset_sha256,market_symbol,created_at,split_metrics,cloud_sync_status&order=created_at.desc&limit=12";
    const response=await fetch(supabaseUrl+"/rest/v1/strategy_backtests"+query,{headers:apiHeaders(session)});
    if(!response.ok)throw new Error("Private run history HTTP "+response.status);
    const rows=await response.json();
    cloudHistory=rows.map(row=>{
      const oos=(row.split_metrics||[]).find(x=>x.period==="out-of-sample")?.metrics||{};
      return {runFingerprint:row.run_fingerprint,strategyName:row.strategy_name,datasetSha256:row.dataset_sha256,
        marketSymbol:row.market_symbol,createdAt:row.created_at,oosNetPnlUsd:oos.netPnlUsd??null,
        oosExpectancyR:oos.averageR??null,cloud:true,cloudSyncStatus:row.cloud_sync_status};
    });
    renderHistory();
    setStatus("Loaded "+cloudHistory.length+" private Strategy Lab run summaries for this account.");
  }
  async function syncRun(result){
    const session=parseSession();
    if(!session?.access_token||!supabaseUrl||!publishableKey){
      setStatus("Run saved in this browser only. Sign in to sync run summaries and trade ledgers across devices.");
      return;
    }
    const userId=await getUserId(session);
    const manifest=result.manifest;
    const parent={
      user_id:userId,run_fingerprint:manifest.runFingerprint,
      strategy_name:result.config.strategyName,model_id:result.config.modelId,
      engine_version:ENGINE_VERSION,dataset_name:manifest.dataset.name,
      dataset_sha256:manifest.dataset.sha256,dataset_rows:manifest.dataset.rows,
      dataset_start_at:manifest.dataset.firstTimestamp,dataset_end_at:manifest.dataset.lastTimestamp,
      market_symbol:result.config.marketSymbol,timeframe:result.config.timeframe,
      timezone:result.config.timezone,series_type:result.config.seriesType,
      config:result.config,manifest,
      full_sample_metrics:result.fullSample.metrics,
      split_metrics:result.splits.map(s=>({period:s.key,startAt:s.startAt,endAt:s.endAt,bars:s.bars,metrics:s.metrics})),
      trade_count:result.splitTrades.length,status:"complete",cloud_sync_status:"writing"
    };
    const created=await fetch(supabaseUrl+"/rest/v1/strategy_backtests?select=id",{
      method:"POST",headers:apiHeaders(session,{"Content-Type":"application/json","Prefer":"return=representation"}),body:JSON.stringify(parent)
    });
    if(!created.ok)throw new Error("Backtest summary insert HTTP "+created.status+": "+(await created.text()).slice(0,250));
    const rows=await created.json(),backtestId=rows[0]?.id;
    if(!backtestId)throw new Error("Supabase did not return a backtest id.");
    try{
      const trades=result.splitTrades.map(t=>({
        backtest_id:backtestId,user_id:userId,trade_no:t.tradeNo,period:t.period,
        side:t.side,signal_at:t.signalAt,entry_at:t.entryAt,exit_at:t.exitAt,
        entry_price:t.entryPrice,stop_price:t.stopPrice,target_price:t.targetPrice,exit_price:t.exitPrice,
        quantity:t.quantity,stop_ticks:t.stopTicks,target_ticks:t.targetTicks,
        gross_pnl_usd:t.grossPnlUsd,commissions_usd:t.commissionsUsd,slippage_cost_usd:t.slippageCostUsd,
        net_pnl_usd:t.netPnlUsd,risk_usd:t.riskUsd,r_multiple:t.rMultiple,exit_reason:t.exitReason,bars_held:t.barsHeld
      }));
      for(let i=0;i<trades.length;i+=250){
        const response=await fetch(supabaseUrl+"/rest/v1/strategy_backtest_trades",{
          method:"POST",headers:apiHeaders(session,{"Content-Type":"application/json","Prefer":"return=minimal"}),body:JSON.stringify(trades.slice(i,i+250))
        });
        if(!response.ok)throw new Error("Trade batch insert HTTP "+response.status+": "+(await response.text()).slice(0,250));
      }
      await fetch(supabaseUrl+"/rest/v1/strategy_backtests?id=eq."+encodeURIComponent(backtestId),{
        method:"PATCH",headers:apiHeaders(session,{"Content-Type":"application/json","Prefer":"return=minimal"}),
        body:JSON.stringify({cloud_sync_status:"complete",updated_at:new Date().toISOString()})
      });
      setStatus("Run and "+trades.length+" split-scored trade rows synced to your private Supabase account. Re-run fingerprint is "+manifest.runFingerprint+".");
      await loadCloudHistory();
    }catch(error){
      await fetch(supabaseUrl+"/rest/v1/strategy_backtests?id=eq."+encodeURIComponent(backtestId),{
        method:"PATCH",headers:apiHeaders(session,{"Content-Type":"application/json","Prefer":"return=minimal"}),
        body:JSON.stringify({cloud_sync_status:"partial",sync_error:String(error.message||error).slice(0,500),updated_at:new Date().toISOString()})
      }).catch(()=>{});
      throw error;
    }
  }
  async function run(){
    if(!csvText)throw new Error("Choose a valid signal CSV before running the test.");
    const config=getConfig();
    if(!config.marketSymbol||!config.timeframe)throw new Error("Enter the market symbol and chart timeframe.");
    $("runStrategy").disabled=true;$("runStrategy").textContent="Running deterministic test…";
    setStatus("Validating dataset, hashing inputs and running chronological splits…");
    try{
      const result=await runExperiment(csvText,config,csvFile?.name||"uploaded.csv");
      renderResult(result);
    }finally{
      $("runStrategy").disabled=false;$("runStrategy").textContent="Run reproducible backtest";
    }
  }
  $("strategyCsv")?.addEventListener("change",e=>previewFile(e.target.files?.[0]||null));
  $("seriesType")?.addEventListener("change",updateRollNote);
  $("runStrategy")?.addEventListener("click",()=>{
    run().catch(error=>{
      $("strategyDataQuality").className="strategy-quality bad";
      setStatus(error.message,true);
      $("runStrategy").disabled=false;$("runStrategy").textContent="Run reproducible backtest";
    });
  });
  $("downloadManifest")?.addEventListener("click",downloadManifest);
  $("downloadTrades")?.addEventListener("click",downloadTrades);
  updateRollNote();
  renderHistory();
  loadCloudHistory().catch(error=>setStatus("Cloud history unavailable; local runs remain available: "+error.message,true));
  window.addEventListener("resize",()=>{if(lastResult){drawLine($("strategyEquityChart"),decimateEquity(lastResult.fullSample.equityCurve,500),"equity",true);drawLine($("strategyDrawdownChart"),decimateEquity(lastResult.fullSample.equityCurve,500),"drawdownUsd",true);}});
})();
