import json, os, subprocess, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class BuildTests(unittest.TestCase):
    def test_futures_sources_and_archived_baselines(self):
        active=json.loads((ROOT/'resources.json').read_text())
        ict_sources=json.loads((ROOT/'ict-futures/data/source-directory.json').read_text())
        self.assertEqual(active['scope'],'futures-only')
        self.assertEqual(active['count'],len(active['resources']))
        self.assertGreaterEqual(len(active['resources']),40)
        self.assertEqual(active['resources'],ict_sources['sources'])
        forbidden=('polymarket','kalshi','stocktwits','sec.gov','sec edgar')
        for item in active['resources']:
            hay=' '.join(str(item.get(k,'')) for k in ('category','name','description','url')).lower()
            self.assertFalse(any(term in hay for term in forbidden),hay)
        archived=json.loads((ROOT/'legacy/global-research/resources.json').read_text())
        archived_markets=json.loads((ROOT/'legacy/global-research/data/market-universe.json').read_text())
        self.assertEqual(len(archived['resources']),585)
        self.assertGreaterEqual(len(archived_markets['markets']),70)
        self.assertEqual(len(json.loads((ROOT/'ict-futures/data/market-universe.json').read_text())['markets']),15)
        academy=json.loads((ROOT/'ict-futures/data/ict-academy.json').read_text())
        self.assertEqual(len(academy['concepts']),76)
        self.assertEqual(len(academy['learningProgram']['tutorials']),9)
        for path in ['legacy/global-research/index.html','legacy/global-research/assets/prediction-markets.js',
                     'legacy/global-research/assets/research-directory.js',
                     'legacy/global-research/ict-source-directory-unfiltered.json',
                     'legacy/global-research/ict-resources-unfiltered.json']:
            self.assertTrue((ROOT/path).exists(),path)
    def test_builder_models_allowlist(self):
        models=json.loads((ROOT/'integrations/builder/models.json').read_text())['models']
        self.assertEqual({x['name'] for x in models},{'page','ict-lesson','research-article','glossary'})
    def test_rls_user_tables_present(self):
        sql=(ROOT/'supabase/setup.sql').read_text()
        for table in ['profiles','watchlists','watchlist_items','journal_trades','lesson_progress','user_events','alert_rules','user_preferences']:
            self.assertIn(f'public.{table}',sql)
        self.assertIn('(select auth.uid())',sql)
    def test_worker_no_open_proxy(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('ALLOWED_BUILDER_MODELS',js)
        self.assertNotIn('url.searchParams.get("target")',js)
    def test_bls_registered_v2_key_and_daily_limit_cache(self):
        worker=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('env.BLS_API_KEY',worker)
        self.assertIn('publicAPI/v2/timeseries/data/',worker)
        self.assertIn('registrationkey',worker)
        self.assertIn('status:\"rate-limited\"',worker)
        self.assertIn('nextMidnight',worker)
        self.assertIn('snapshot?.status===\"rate-limited\"&&(!forced||!env.BLS_API_KEY)',worker)
    def test_macro_page_manual_refresh_bypasses_limit_cache(self):
        js=(ROOT/'assets/macro-page.js').read_text()
        self.assertIn('load(force=false)',js)
        self.assertIn('?refresh=1',js)
        self.assertIn('load(true)',js)
    def test_worker_has_public_bls_and_cftc_data_adapters(self):
        worker=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('/api/v1/macro',worker)
        self.assertIn('/api/v1/cot',worker)
        self.assertIn('api.bls.gov/publicAPI/v1',worker)
        self.assertIn('publicreporting.cftc.gov/resource/',worker)
    def test_no_secret_values_in_environment_sample(self):
        data=(ROOT/'.env.example').read_text()
        self.assertNotRegex(data,r'(sk_live_|sb_secret_|Bearer [A-Za-z0-9])')

    def test_gdelt_refresh_uses_a_single_rate_limited_query(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('const GDELT_QUERY = {',js)
        self.assertIn('queryCount:1',js)
        self.assertNotIn('GDELT_QUERIES.map',js)
        self.assertIn('maxrecords","100"',js)
    def test_bls_provider_retries_transient_failures(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('attempt<2',js)
        self.assertIn('setTimeout(resolve,700)',js)
        self.assertIn('BLS HTTP ',js)
    def test_worker_manual_news_refresh_is_bounded(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('url.searchParams.get("refresh")==="1"',js)
        self.assertIn('NEWS_REFRESH_LOCK_KEY',js)
        self.assertIn('ctx.waitUntil(refreshNews(env)',js)
        self.assertIn('cooldownSeconds:300',js)
    def test_cot_category_fields_follow_cftc_schemas(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        for field in ['dealer_positions_long_all','asset_mgr_positions_long','lev_money_positions_long','prod_merc_positions_long','swap__positions_short_all','m_money_positions_long_all','other_rept_positions_long']:
            self.assertIn(field,js)
        self.assertIn('normalizedRows',js)
    def test_null_values_are_not_coerced_to_zero(self):
        js=(ROOT/'assets/futures-intelligence.js').read_text()
        self.assertIn('v===null||v===undefined',js)
        self.assertIn('function setProvider',js)
        self.assertIn('Object.values(state.providers)',js)
    def test_micro_risk_mode_and_cost_validation(self):
        js=(ROOT/'assets/risk-calculator.js').read_text()
        self.assertIn("id='contractMode'",js)
        self.assertIn('market.microSpec',js)
        self.assertIn('riskPercent>100',js)
        self.assertIn('Number.isFinite(tickValue)',js)
    def test_news_page_calls_refresh_route(self):
        js=(ROOT/'assets/news-page.js').read_text()
        self.assertIn("force?'?refresh=1':''",js)
        self.assertIn('Refresh news snapshot',js)
    def test_dormant_event_market_handlers_preserve_unknown_volume_as_null(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('volume24hr:asNumberOrNull(event.volume24hr)',js)
        self.assertIn('volume24h:asNumberOrNull(m.volume_24h_fp??m.volume_24h)',js)
        # These server handlers remain only as dormant compatibility code; no frontend consumes them.
        desk=(ROOT/'assets/futures-intelligence.js').read_text()
        self.assertNotIn('/api/v1/prediction/polymarket',desk)
        self.assertNotIn('/api/v1/prediction/kalshi',desk)

    def test_cot_fetch_is_scoped_to_selected_contract(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('fetchCot(report,market)',js)
        self.assertIn('upper(contract_market_name)',js)
        self.assertIn('marketKey',js)
        self.assertIn('u.searchParams.set("$limit",market?"2000":"5000")',js)
    def test_built_futures_desk_assets_match_source(self):
        for name in ['futures-intelligence.js','futures-intelligence.css','news-page.js','risk-calculator.js']:
            self.assertEqual((ROOT/'dist/assets'/name).read_bytes(),(ROOT/'assets'/name).read_bytes())


    def test_part1_thirteen_area_navigation_is_centralized(self):
        js=(ROOT/'scripts/build_site.py').read_text()
        labels=['Overview','Futures Markets','ICT Academy','Entry Models','Sessions & Calendar','Futures News','Volume & Open Interest','COT & Positioning','Contract Specs & Expiry','Strategy Lab','Risk & Prop Firms','Journal & Watchlists','Data Health & Sources']
        for label in labels:self.assertIn("('"+label+"',",js)
        self.assertIn('NAV_GROUPS',js)
        self.assertIn('class="os-sidebar"',js)
        self.assertNotIn("('Prediction Markets',",js)
        self.assertNotIn("('Equities',",js)
        self.assertEqual(js.count("('Overview', '/'),"),1)

    def test_part1_shared_shell_dashboard_and_accessibility_contract(self):
        shell=(ROOT/'assets/site-shell.js').read_text()
        css=(ROOT/'assets/site-shell.css').read_text()
        dashboard=(ROOT/'assets/overview-dashboard.js').read_text()
        home=(ROOT/'index.html').read_text()
        builder=(ROOT/'scripts/build_site.py').read_text()
        for token in ['sidebarToggle','sidebarScrim','Escape','fios.app-sidebar.collapsed.v1','osThemeToggle','fios.theme.preference.v1','aria-expanded']:
            self.assertIn(token,shell)
        for token in ['prefers-reduced-motion','os-app-shell','os-sidebar','os-contract-spec-card','os-state-chip','os-loading-state','os-error-state','--os-focus']:
            self.assertIn(token,css)
        for token in ['overviewContract','overviewClockET','overviewClockLocal','overviewTimezone','overviewNewsList','overviewCotSummary','overviewPrivateMetrics','overviewHealthBadge','Promise.allSettled','/api/v1/news','/api/v1/cot?report=tff','/auth/v1/user','/rest/v1/watchlists','/rest/v1/journal_trades','America/New_York']:
            self.assertIn(token,dashboard)
        self.assertNotIn('SUPABASE_SERVICE_ROLE_KEY',dashboard)
        self.assertNotIn('service_role',dashboard.lower())
        self.assertIn('Futures news is unavailable:',dashboard)
        self.assertIn('state === "not-yet-fetched"',dashboard)
        self.assertIn('articles, but none matched this contract',dashboard)
        source_loader=(ROOT/'assets/research-directory.js').read_text()
        self.assertIn('The futures source directory is temporarily unavailable',source_loader)
        self.assertNotIn('main Finance OS research workspace',source_loader)
        for token in ['overviewCalendarTitle','NOT CONNECTED','QUOTE NOT CONNECTED']:
            self.assertIn(token,home)
        self.assertIn('calendar is not available',home.lower())
        self.assertIn('wrap_standalone_shell',builder)
        self.assertIn('os-ict-terminal',builder)
        self.assertIn('os-futures-desk',builder)

    def test_part1_contract_session_and_risk_route_compatibility(self):
        builder=(ROOT/'scripts/build_site.py').read_text()
        self.assertIn("DIST/'contract-specs/index.html'",builder)
        self.assertIn("DIST/'sessions/index.html'",builder)
        self.assertIn("DIST/'risk/index.html'",builder)
        self.assertIn("DIST/'tools/index.html',redirect_page",builder)
        self.assertIn("'/ict-futures/#sessions'",builder)
        self.assertIn('UNVERIFIED IMPORTED REFERENCE',builder)
        self.assertIn('NOT SUPPLIED IN REGISTRY',builder)
        self.assertIn('NOT CONFIGURED',builder)
        sitemap_urls=next(line for line in builder.splitlines() if 'urls=[' in line)
        self.assertNotIn("'/sessions/',",sitemap_urls)
        shell_css=(ROOT/'assets/site-shell.css').read_text()
        self.assertIn('body.os-ict-terminal .topbar{z-index:var(--os-z-topbar)',shell_css)
        self.assertIn("html = html.replace('<body>', '<body class=\"dark os-ict-terminal\">', 1)",builder)
        self.assertIn('--os-z-sidebar:30',shell_css)
        self.assertIn('--os-z-topbar:20',shell_css)
    def test_futures_module_assets_and_retired_route_redirects(self):
        for name in ['volume-open-interest.js','data-health.js']:
            self.assertTrue((ROOT/'assets'/name).exists(),name)
            self.assertTrue((ROOT/'dist/assets'/name).exists(),name)
        self.assertTrue((ROOT/'assets/prediction-markets.js').exists())
        self.assertFalse((ROOT/'dist/assets/prediction-markets.js').exists())
        for route in ['volume-open-interest','sources','research','prediction-markets','legacy','entry-models','strategy-lab','data-health','sessions','contract-specs','risk','tools']:
            self.assertTrue((ROOT/'dist'/route/'index.html').exists(),route)
        self.assertIn('/sources/',(ROOT/'dist/research/index.html').read_text())
        self.assertIn('noindex',(ROOT/'dist/prediction-markets/index.html').read_text())
        self.assertIn('#sessions',(ROOT/'dist/sessions/index.html').read_text())
        self.assertIn('/risk/',(ROOT/'dist/tools/index.html').read_text())
        self.assertTrue((ROOT/'dist/contract-specs/index.html').exists())
        contract=(ROOT/'dist/contract-specs/index.html').read_text()
        self.assertEqual(contract.count('class="os-contract-spec-card"'),15)
        self.assertIn('UNVERIFIED IMPORTED REFERENCE',contract)
        self.assertIn('NOT SUPPLIED IN REGISTRY',contract)
    def test_weekly_open_interest_is_separate_from_exchange_volume(self):
        worker=(ROOT/'cloudflare/src/index.js').read_text()
        voi=(ROOT/'assets/volume-open-interest.js').read_text()
        self.assertIn('/api/v1/volume-open-interest',worker)
        self.assertIn('cadence:"weekly"',worker)
        self.assertIn('metric:"open_interest"',worker)
        self.assertIn('status:"not-connected"',worker)
        self.assertIn('/api/v1/volume-open-interest?',voi)
        self.assertIn('Daily / intraday volume', (ROOT/'scripts/build_site.py').read_text())
    def test_provider_health_checks_are_independent(self):
        js=(ROOT/'assets/data-health.js').read_text()
        self.assertIn('Promise.allSettled',js)
        for endpoint in ['/api/v1/news','/api/v1/macro','/api/v1/cot?report=tff','/api/v1/macro/funding']:
            self.assertIn(endpoint,js)
    def test_retired_event_market_ui_has_no_active_frontend_consumers(self):
        desk=(ROOT/'assets/futures-intelligence.js').read_text()
        health=(ROOT/'assets/data-health.js').read_text()
        ict=(ROOT/'ict-futures/index.html').read_text()
        worker=(ROOT/'cloudflare/src/index.js').read_text()
        for frontend in [desk,health,ict]:
            for token in ['/api/v1/prediction/polymarket','/api/v1/prediction/kalshi','gamma-api.polymarket.com','api.elections.kalshi.com']:
                self.assertNotIn(token,frontend)
        self.assertNotIn('id="predictions"',ict)
        self.assertNotIn('href="#predictions"',ict)
        self.assertIn('/api/v1/prediction/polymarket',worker)
        self.assertIn('/api/v1/prediction/kalshi',worker)


    def test_p2_economic_provider_adapters(self):
        js=(ROOT/'cloudflare/src/economic-providers.js').read_text()
        for provider in ['case "bea"','case "eia"','case "fred"','case "us_treasury"','case "ecb"']:
            self.assertIn(provider,js)
        self.assertIn('searchParams.delete("api_key")',js)
        self.assertIn('searchParams.delete("UserID")',js)
        self.assertIn('url.searchParams.set("limit", "100000")',js)
    def test_p2_ingestion_is_protected_and_persistent(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('url.pathname==="/api/v1/ingest"',js)
        self.assertIn('env.INGEST_TOKEN',js)
        self.assertIn('economic_observations',js)
        self.assertIn('ingestion_runs',js)
        self.assertIn('on_conflict=provider,dataset_id,series_id,frequency,observation_date',js)
        self.assertIn('scheduledEconomicIngestion(env)',js)
        self.assertIn('recordIngestionRun(env,provider,"skipped"',js)
        self.assertIn('recordIngestionRun(env,provider,"failed"',js)
        self.assertIn('url.pathname==="/api/v1/economic/history"',js)
        self.assertIn('query.set("and"',js)
        self.assertIn('i+=1000',js)
    def test_p2_supabase_migration_security(self):
        sql=(ROOT/'supabase/migrations/20261108134935_add_economic_observations_and_ingestion_runs.sql').read_text()
        self.assertIn('create table if not exists public.economic_observations',sql)
        self.assertIn('create table if not exists public.ingestion_runs',sql)
        self.assertIn('enable row level security',sql)
        self.assertIn('revoke all on public.ingestion_runs from anon, authenticated',sql)
        guard=(ROOT/'supabase/migrations/20261108140821_deny_browser_access_to_ingestion_runs.sql').read_text()
        self.assertIn('using (false)',guard)
        self.assertIn('with check (false)',guard)
        self.assertIn('unique(provider, dataset_id, series_id, frequency, observation_date)',sql)
    def test_p2_macro_ui_and_secret_configuration(self):
        ui=(ROOT/'assets/economic-data.js').read_text()
        env=(ROOT/'.env.example').read_text()
        build=(ROOT/'scripts/build_site.py').read_text()
        for provider in ['id:"bea"','id:"eia"','id:"fred"','id:"us_treasury"','id:"ecb"']:
            self.assertIn(provider,ui)
        self.assertIn('request("/api/v1/economic/"+p.id)',ui)
        for key in ['BEA_API_KEY','EIA_API_KEY','FRED_API_KEY']:
            self.assertIn(key,env)
        self.assertIn('economic-data.js',build)
        self.assertIn('Refresh economic providers',build)



    def test_p3_all_76_concepts_have_full_learning_content(self):
        data=json.loads((ROOT/'ict-futures/data/ict-academy.json').read_text())
        lessons=data['concepts']
        self.assertEqual(len(lessons),76)
        for lesson in lessons:
            content=lesson['learning']
            self.assertGreaterEqual(len(content['learningObjectives']),3)
            self.assertGreaterEqual(len(content['guidedWalkthrough']),3)
            self.assertTrue(content['workedExample']['body'])
            self.assertTrue(content['practicalExercise']['task'])
            self.assertTrue(content['practicalExercise']['deliverable'])
            self.assertEqual(len(content['knowledgeCheck']['options']),3)
            self.assertIn(content['knowledgeCheck']['correctIndex'],[0,1,2])
            self.assertEqual(content['knowledgeCheck']['correctAnswer'],content['knowledgeCheck']['options'][content['knowledgeCheck']['correctIndex']])
    def test_p3_nine_guided_tutorials_have_workflows_and_reviews(self):
        data=json.loads((ROOT/'ict-futures/data/ict-academy.json').read_text())
        tutorials=data['learningProgram']['tutorials']
        self.assertEqual(len(tutorials),9)
        for tutorial in tutorials:
            self.assertGreaterEqual(len(tutorial['steps']),4)
            self.assertTrue(tutorial['deliverable'])
            self.assertGreaterEqual(len(tutorial['review']),3)
    def test_p3_academy_build_generates_pages_and_tutorials(self):
        lessons=list((ROOT/'dist/ict-futures/academy').glob('*.html'))
        tutorials=list((ROOT/'dist/ict-futures/academy/tutorials').glob('*.html'))
        self.assertEqual(len(lessons),76)
        self.assertEqual(len(tutorials),10)
        for page in lessons:
            content=page.read_text()
            self.assertIn('PRACTICAL EXERCISE',content)
            self.assertIn('KNOWLEDGE CHECK',content)
            self.assertIn('REFERENCES & FURTHER STUDY',content)
        self.assertTrue((ROOT/'dist/academy/index.html').exists())
    def test_p3_progress_sync_is_user_authenticated_and_scoped(self):
        js=(ROOT/'assets/academy-learning.js').read_text()
        self.assertIn('finance-os-supabase-session-v1',js)
        self.assertIn('/auth/v1/user',js)
        self.assertIn('/rest/v1/lesson_progress',js)
        self.assertIn('on_conflict=user_id,lesson_slug',js)
        self.assertIn('progress_data',js)
        self.assertIn('lesson_version',js)
        self.assertIn('ictfos.academy.progress.v2',js)
        migration=(ROOT/'supabase/migrations/20261108144106_add_lesson_progress_data.sql').read_text()
        self.assertIn('add column if not exists progress_data jsonb',migration)
        self.assertIn('add column if not exists lesson_version text',migration)
        self.assertNotIn('SUPABASE_SERVICE_ROLE_KEY',js)
        self.assertNotIn('service_role',js.lower())


    def test_p4_reproducible_strategy_backtest_engine(self):
        engine=(ROOT/'assets/strategy-backtest-engine.mjs').read_text()
        self.assertIn('ENGINE_VERSION = "p4.1.0"',engine)
        self.assertIn('signalKnownAt: "source-bar-close"',engine)
        self.assertIn('entry: "next-bar-open"',engine)
        self.assertIn('stop-first-same-bar',engine)
        self.assertIn('runFingerprint',engine)
        self.assertIn('out-of-sample',engine)
        self.assertIn('tickMisalignedPrices',engine)
        result=subprocess.run(['node','--test',str(ROOT/'tests/test_strategy_backtest.mjs')],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stdout+'\n'+result.stderr)
    def test_p4_strategy_lab_frontend_assets_and_build(self):
        js=(ROOT/'assets/strategy-lab.js').read_text()
        build=(ROOT/'scripts/build_site.py').read_text()
        self.assertIn('runExperiment',js)
        self.assertIn('/rest/v1/strategy_backtests',js)
        self.assertIn('/rest/v1/strategy_backtest_trades',js)
        self.assertNotIn('SUPABASE_SERVICE_ROLE_KEY',js)
        self.assertIn('backtest-input-template.csv',build)
        self.assertIn('strategy-lab.css',build)
        self.assertIn('strategy-backtest-engine.mjs',js)
    def test_p4_private_backtest_schema_and_owner_rls(self):
        sql=(ROOT/'supabase/migrations/20261108151112_add_strategy_backtest_runs_and_trades.sql').read_text()
        self.assertIn('create table if not exists public.strategy_backtests',sql)
        self.assertIn('create table if not exists public.strategy_backtest_trades',sql)
        self.assertIn('enable row level security',sql)
        self.assertIn('(select auth.uid()) = user_id',sql)
        self.assertIn('foreign key (backtest_id, user_id)',sql)
        self.assertIn('revoke all on public.strategy_backtests from anon',sql)


    def test_p5_account_cloud_workspace_auth_and_crud(self):
        js=(ROOT/'assets/account.js').read_text()
        build=(ROOT/'scripts/build_site.py').read_text()
        for token in ['grant_type=refresh_token','localStorage.setItem(SESSION_KEY','/rest/v1/journal_trades','/rest/v1/watchlists','/rest/v1/watchlist_items','/rest/v1/research_notes','/rest/v1/alert_rules','/rest/v1/alert_events','/rest/v1/user_preferences','exportBackup','fios.v2.watchlist','fios.v2.journal','ictfos.journal.v1']:
            self.assertIn(token,js)
        self.assertIn('refresh_token',js)
        self.assertIn('last_condition_met',js)
        self.assertIn('manual-browser-check',js)
        self.assertNotIn('SUPABASE_SERVICE_ROLE_KEY',js)
        self.assertNotIn('service_role',js.lower())
        self.assertIn('Account & sync',build)
    def test_p5_private_notes_alert_events_and_legacy_trade_import_migrations(self):
        notes=(ROOT/'supabase/migrations/20261108161355_add_cloud_workspace_notes_and_alert_events.sql').read_text()
        legacy=(ROOT/'supabase/migrations/20261108161450_add_idempotent_legacy_trade_import.sql').read_text()
        self.assertIn('create table if not exists public.research_notes',notes)
        self.assertIn('create table if not exists public.alert_events',notes)
        self.assertIn('enable row level security',notes)
        self.assertIn('(select auth.uid()) = user_id',notes)
        self.assertIn('foreign key (alert_id, user_id)',notes)
        self.assertIn('add column if not exists legacy_id text',legacy)
        self.assertIn('unique (user_id, legacy_id)',legacy)
    def test_p5_composite_foreign_key_indexes_are_present(self):
        sql=(ROOT/'supabase/migrations/20261108163000_add_workspace_composite_fk_indexes.sql').read_text()
        self.assertIn('on public.alert_events(alert_id, user_id)',sql)
        self.assertIn('on public.strategy_backtest_trades(backtest_id, user_id)',sql)

    def test_p5_account_assets_are_in_the_static_build(self):
        build=(ROOT/'scripts/build_site.py').read_text()
        self.assertIn('account.js',build)
        self.assertIn('Account & sync',build)
        css=(ROOT/'assets/site-shell.css').read_text()
        self.assertIn('.workspace-tabs',css)
        self.assertIn('.workspace-metrics',css)

if __name__=='__main__': unittest.main()
