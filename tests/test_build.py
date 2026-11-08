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
if __name__=='__main__': unittest.main()
