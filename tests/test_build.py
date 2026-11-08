import json, os, subprocess, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class BuildTests(unittest.TestCase):
    def test_sources_exist_and_counts(self):
        self.assertEqual(len(json.loads((ROOT/'resources.json').read_text())['resources']),585)
        self.assertEqual(len(json.loads((ROOT/'ict-futures/data/market-universe.json').read_text())['markets']),15)
        self.assertEqual(len(json.loads((ROOT/'ict-futures/data/ict-academy.json').read_text())['concepts']),76)
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
    def test_worker_has_public_bls_and_cftc_data_adapters(self):
        worker=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('/api/v1/macro',worker)
        self.assertIn('/api/v1/cot',worker)
        self.assertIn('api.bls.gov/publicAPI/v1',worker)
        self.assertIn('publicreporting.cftc.gov/resource/',worker)
    def test_no_secret_values_in_environment_sample(self):
        data=(ROOT/'.env.example').read_text()
        self.assertNotRegex(data,r'(sk_live_|sb_secret_|Bearer [A-Za-z0-9])')

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
    def test_prediction_volume_fields_keep_null(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('volume24hr:asNumberOrNull(event.volume24hr)',js)
        self.assertIn('volume24h:asNumberOrNull(m.volume_24h_fp??m.volume_24h)',js)
        desk=(ROOT/'assets/futures-intelligence.js').read_text()
        self.assertIn('24h unavailable',desk)

    def test_cot_fetch_is_scoped_to_selected_contract(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('fetchCot(report,market)',js)
        self.assertIn('upper(contract_market_name)',js)
        self.assertIn('marketKey',js)
        self.assertIn('u.searchParams.set("$limit",market?"2000":"5000")',js)
    def test_built_futures_desk_assets_match_source(self):
        for name in ['futures-intelligence.js','futures-intelligence.css','news-page.js','risk-calculator.js']:
            self.assertEqual((ROOT/'dist/assets'/name).read_bytes(),(ROOT/'assets'/name).read_bytes())


    def test_twelve_area_navigation_is_centralized(self):
        js=(ROOT/'scripts/build_site.py').read_text()
        labels=['Overview','Futures Markets','Volume & OI','News Intelligence','Macro Calendar','COT & Positioning','Prediction Markets','ICT Academy','Entry Models','Strategy Lab','Risk & Journal','Sources & Data Health']
        for label in labels:self.assertIn("('"+label+"',",js)
        self.assertEqual(js.count("('Overview', '/'),"),1)
    def test_p1_module_assets_and_routes_exist_after_build(self):
        for name in ['volume-open-interest.js','data-health.js','prediction-markets.js']:
            self.assertTrue((ROOT/'assets'/name).exists(),name)
            self.assertTrue((ROOT/'dist/assets'/name).exists(),name)
        for route in ['volume-open-interest','prediction-markets','entry-models','strategy-lab','data-health']:
            self.assertTrue((ROOT/'dist'/route/'index.html').exists(),route)
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
        for endpoint in ['/api/v1/news','/api/v1/macro','/api/v1/cot?report=tff','/api/v1/macro/funding','/api/v1/prediction/polymarket','/api/v1/prediction/kalshi']:
            self.assertIn(endpoint,js)
    def test_prediction_markets_are_separate_read_only_context(self):
        js=(ROOT/'assets/prediction-markets.js').read_text()
        self.assertIn('/api/v1/prediction/polymarket',js)
        self.assertIn('/api/v1/prediction/kalshi',js)
        self.assertIn('24h unavailable',js)


    def test_p2_economic_provider_adapters(self):
        js=(ROOT/'cloudflare/src/economic-providers.js').read_text()
        for provider in ['case "bea"','case "eia"','case "fred"','case "us_treasury"','case "ecb"']:
            self.assertIn(provider,js)
        self.assertIn('searchParams.delete("api_key")',js)
        self.assertIn('searchParams.delete("UserID")',js)
        self.assertIn('offset < 5000',js)
    def test_p2_ingestion_is_protected_and_persistent(self):
        js=(ROOT/'cloudflare/src/index.js').read_text()
        self.assertIn('url.pathname==="/api/v1/ingest"',js)
        self.assertIn('env.INGEST_TOKEN',js)
        self.assertIn('economic_observations',js)
        self.assertIn('ingestion_runs',js)
        self.assertIn('on_conflict=provider,dataset_id,series_id,frequency,observation_date',js)
        self.assertIn('scheduledEconomicIngestion(env)',js)
    def test_p2_supabase_migration_security(self):
        sql=(ROOT/'supabase/migrations/20261108134935_add_economic_observations_and_ingestion_runs.sql').read_text()
        self.assertIn('create table if not exists public.economic_observations',sql)
        self.assertIn('create table if not exists public.ingestion_runs',sql)
        self.assertIn('enable row level security',sql)
        self.assertIn('revoke all on public.ingestion_runs from anon, authenticated',sql)
        self.assertIn('unique(provider, dataset_id, series_id, frequency, observation_date)',sql)
    def test_p2_macro_ui_and_secret_configuration(self):
        ui=(ROOT/'assets/economic-data.js').read_text()
        env=(ROOT/'.env.example').read_text()
        build=(ROOT/'scripts/build_site.py').read_text()
        for provider in ['bea','eia','fred','us_treasury','ecb']:
            self.assertIn('/api/v1/economic/'+provider,ui)
        for key in ['BEA_API_KEY','EIA_API_KEY','FRED_API_KEY']:
            self.assertIn(key,env)
        self.assertIn('economic-data.js',build)
        self.assertIn('Refresh economic providers',build)

if __name__=='__main__': unittest.main()
