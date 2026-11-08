(() => {
  const cfg = window.FINANCE_OS_CONFIG || {};
  const root = document.getElementById('accountApp');
  if (!root) return;
  const key = 'finance-os-supabase-session-v1';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base = String(cfg.supabaseUrl || '').replace(/\/$/, '');
  const apikey = cfg.supabaseAnonKey || '';
  const headers = (session, extra={}) => ({ apikey, ...(session?.access_token ? {Authorization:`Bearer ${session.access_token}`} : {}), ...extra });
  const getSession = () => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } };
  const setSession = s => { if(s) sessionStorage.setItem(key, JSON.stringify(s)); else sessionStorage.removeItem(key); };
  const showMessage = (msg, bad=false) => { const el=document.getElementById('accountMessage'); if(el){el.textContent=msg;el.className=bad?'account-message error':'account-message';} };
  async function api(path, options={}) {
    const res = await fetch(base + path, { ...options, headers: headers(options.session, {'Content-Type':'application/json', ...(options.headers||{})}) });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.msg || data.message || data.error_description || data.error || `Supabase returned HTTP ${res.status}`);
    return data;
  }
  function renderAuth() {
    root.innerHTML = `<section class="content-section account-layout"><div><span class="kicker">Account & sync</span><h2>Secure personal workspace</h2><p>Sign in to sync your trading journal, watchlists and lesson progress across devices. Your private data is protected by Supabase Row Level Security.</p><div class="account-benefits"><div><b>Private journal</b><span>Only your account can read or edit your trade records.</span></div><div><b>Watchlists</b><span>Save instruments and research notes.</span></div><div><b>Learning progress</b><span>Continue lessons across devices.</span></div></div></div><div class="auth-card"><div class="auth-tabs"><button type="button" data-mode="signin" class="active">Sign in</button><button type="button" data-mode="signup">Create account</button></div><form id="authForm"><label>Email address<input required name="email" type="email" autocomplete="email" placeholder="you@example.com"></label><label>Password<input required name="password" type="password" minlength="8" autocomplete="current-password" placeholder="At least 8 characters"></label><button type="submit" class="primary-button" id="authSubmit">Sign in securely</button></form><p id="accountMessage" class="account-message" aria-live="polite"></p><small>Account email confirmation follows the project's Auth settings. Never share your password or session token.</small></div></section>`;
    let mode='signin';
    root.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;root.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b===btn));document.getElementById('authSubmit').textContent=mode==='signup'?'Create account':'Sign in securely';document.querySelector('#authForm input[name=password]').setAttribute('autocomplete',mode==='signup'?'new-password':'current-password');}));
    document.getElementById('authForm').addEventListener('submit',async e=>{
      e.preventDefault(); const form=new FormData(e.currentTarget); const email=String(form.get('email')||'').trim(); const password=String(form.get('password')||''); const submit=document.getElementById('authSubmit');submit.disabled=true;submit.textContent='Connecting…';
      try{
        if(mode==='signup'){
          const data=await api('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password})});
          if(data.access_token){setSession(data);await renderWorkspace(data);} else showMessage('Account created. Check your inbox for the verification link, then return here to sign in.');
        } else {
          const data=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});setSession(data);await renderWorkspace(data);
        }
      }catch(err){showMessage(err.message,true);}finally{if(document.getElementById('authSubmit')){submit.disabled=false;submit.textContent=mode==='signup'?'Create account':'Sign in securely';}}
    });
  }
  async function renderWorkspace(session) {
    try {
      const user=await api('/auth/v1/user',{session});
      root.innerHTML=`<section class="content-section account-layout"><div><span class="kicker">Personal workspace</span><h2>You're signed in</h2><p>Authenticated as <b>${esc(user.email||user.id)}</b>. This is the private cloud workspace associated with your Supabase account.</p><div class="account-benefits"><div><b>Journal</b><span id="journalState">Loading your private trades…</span></div><div><b>Watchlists</b><span id="watchlistState">Loading your saved watchlists…</span></div><div><b>Lesson progress</b><span id="lessonState">Synced progress records are private to this account.</span></div></div></div><div class="auth-card"><div class="signed-in-head"><span class="account-check">✓</span><div><b>Workspace connected</b><small>${esc(user.email||'Authenticated user')}</small></div></div><button id="loadJournal" class="secondary-button" type="button">Refresh workspace data</button><button id="signOut" class="secondary-button danger" type="button">Sign out</button><p id="accountMessage" class="account-message" aria-live="polite"></p><small>Private records are protected by database policies that check the authenticated user ID on every operation.</small></div></section><section class="content-section"><h2>Cloud journal</h2><p>Your cloud records (if any) appear below. Your existing local-only journal remains available in the Global Research workspace until you choose to migrate it.</p><div id="journalRows" class="journal-empty">No cloud trades loaded.</div></section>`;
      document.getElementById('signOut').addEventListener('click',async()=>{try{await api('/auth/v1/logout',{method:'POST',session});}catch{}setSession(null);renderAuth();});
      document.getElementById('loadJournal').addEventListener('click',()=>loadWorkspace(session));
      await loadWorkspace(session);
    } catch(err) { setSession(null); renderAuth(); showMessage('Session expired. Please sign in again. '+err.message,true); }
  }
  async function loadWorkspace(session){
    const j=document.getElementById('journalRows');if(!j)return;
    try{
      const [trades,lists,progress]=await Promise.all([
        api('/rest/v1/journal_trades?select=id,market_id,side,setup_name,entry_price,exit_price,net_pnl,r_multiple,opened_at&order=opened_at.desc&limit=50',{session}),
        api('/rest/v1/watchlists?select=id,name,created_at&order=created_at.desc&limit=50',{session}),
        api('/rest/v1/lesson_progress?select=lesson_slug,status,score,completed_at&order=updated_at.desc&limit=100',{session})
      ]);
      document.getElementById('journalState').textContent=`${trades.length} saved trade record(s)`;
      document.getElementById('watchlistState').textContent=`${lists.length} saved watchlist(s)`;
      document.getElementById('lessonState').textContent=`${progress.length} lesson progress record(s)`;
      j.innerHTML=trades.length?`<div class="table-wrap"><table class="status-table"><thead><tr><th>Market</th><th>Side</th><th>Setup</th><th>Net P/L</th><th>R</th></tr></thead><tbody>${trades.map(t=>`<tr><td>${esc(t.market_id)}</td><td>${esc(t.side)}</td><td>${esc(t.setup_name||'—')}</td><td>${esc(t.net_pnl??'—')}</td><td>${esc(t.r_multiple??'—')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No cloud journal trades found. You can continue using local journal storage in the main Finance OS application.</p>';
    }catch(err){j.textContent=err.message;showMessage('Could not load workspace data. Confirm that RLS policies and table grants are active.',true);}
  }
  if(!base||!apikey){root.innerHTML='<section class="content-section"><h2>Cloud account setup pending</h2><p>Supabase public configuration is not present. Configure the project URL and publishable key before enabling sign-in.</p></section>';return;}
  const session=getSession(); if(session?.access_token) renderWorkspace(session); else renderAuth();
})();
