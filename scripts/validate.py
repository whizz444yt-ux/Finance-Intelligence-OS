#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys, subprocess, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
errors=[]; checks=[]
def ok(name, condition, detail=''):
    checks.append((name, bool(condition), detail))
    if not condition: errors.append(name + (': '+detail if detail else ''))

def readj(p): return json.loads((ROOT/p).read_text(encoding='utf-8'))

try:
    resources=readj(Path('resources.json')); ok('Resource directory has 585 curated records',len(resources.get('resources',[]))==585,f"found {len(resources.get('resources',[]))}")
    markets=readj(Path('ict-futures/data/market-universe.json')); ok('ICT Futures retains 15 contract families',len(markets.get('markets',[]))==15,f"found {len(markets.get('markets',[]))}")
    academy=readj(Path('ict-futures/data/ict-academy.json')); ok('ICT Academy retains 76 concepts',len(academy.get('concepts',[]))==76,f"found {len(academy.get('concepts',[]))}")
    fm=readj(Path('data/market-universe.json')); ok('Finance instrument navigator retains market records',len(fm.get('markets',[]))>=70,f"found {len(fm.get('markets',[]))}")
except Exception as e: errors.append(f'dataset parsing: {e}')

for p in ['cloudflare/src/index.js','cloudflare/src/economic-providers.js','assets/academy-learning.js','assets/academy-catalog.js','assets/site-shell.js','assets/runtime-config.js','assets/research-directory.js','assets/academy-search.js','assets/academy-learning.js','assets/academy-catalog.js','assets/news-page.js','assets/risk-calculator.js','assets/account.js','assets/macro-page.js','assets/economic-data.js','assets/cot-page.js','assets/futures-intelligence.js','assets/volume-open-interest.js','assets/data-health.js','assets/prediction-markets.js']:
    r=subprocess.run(['node','--check',str(ROOT/p)],capture_output=True,text=True)
    ok(f'JavaScript syntax: {p}',r.returncode==0,(r.stderr or r.stdout).strip()[:300])

worker=(ROOT/'cloudflare/src/index.js').read_text()
ok('Worker limits Builder models to allow-list','ALLOWED_BUILDER_MODELS' in worker and 'Model is not allow-listed' in worker)
ok('Worker has GDELT scheduled collection','async scheduled' in worker and 'refreshNews(env)' in worker)
ok('Worker contains health/news/provider endpoints','/api/v1/health' in worker and '/api/v1/news' in worker and '/api/v1/providers' in worker)
ok('Worker contains BLS and CFTC endpoints','/api/v1/macro' in worker and '/api/v1/cot' in worker and 'api.bls.gov/publicAPI/v1' in worker and 'publicreporting.cftc.gov/resource/' in worker)
ok('Worker contains NY Fed public reference rates','/api/v1/macro/funding' in worker and 'markets.newyorkfed.org/api/rates/all/latest.json' in worker)
ok('Worker contains read-only Polymarket and Kalshi endpoints','/api/v1/prediction/polymarket' in worker and '/api/v1/prediction/kalshi' in worker and 'gamma-api.polymarket.com/events' in worker and 'external-api.kalshi.com/trade-api/v2/markets' in worker)
ok('Worker has production-origin allow-list without wildcard','finance-intelligence-os-whizz444yt-7353.vercel.app' in worker and 'includes("*")' in worker and 'return json' in worker)

worker=(ROOT/'cloudflare/src/index.js').read_text()
dashboard=(ROOT/'assets/futures-intelligence.js').read_text()
risk=(ROOT/'assets/risk-calculator.js').read_text()
news_page=(ROOT/'assets/news-page.js').read_text()
ok('Manual GDELT refresh is supported with a lock and cooldown','url.searchParams.get("refresh")==="1"' in worker and 'NEWS_REFRESH_LOCK_KEY' in worker and 'ctx.waitUntil(refreshNews(env)' in worker)
ok('COT response exposes normalized report categories','normalizeCotRows(rows,report)' in worker and 'normalizedRows' in worker and 'swap__positions_short_all' in worker and 'm_money_positions_long_all' in worker)
ok('COT query is scoped to the selected market','fetchCot(report,market)' in worker and 'upper(contract_market_name)' in worker and 'marketKey' in worker)
ok('Dashboard preserves missing numeric values','v===null||v===undefined' in dashboard and 'Object.values(state.providers)' in dashboard)
ok('Risk calculator supports verified micro profile fields','market.microSpec' in risk and 'contractMode' in risk and 'Number.isFinite(tickValue)' in risk)
ok('News page requests controlled refresh','?refresh=1' in news_page and 'Refresh news snapshot' in news_page)
ok('Prediction volume metrics remain nullable','volume24hr:asNumberOrNull(event.volume24hr)' in worker and 'volume24h:asNumberOrNull(m.volume_24h_fp??m.volume_24h)' in worker)
ok('Static assets no longer receive a one-year immutable cache','max-age=300, stale-while-revalidate=86400' in (ROOT/'vercel.json').read_text() and 'immutable' not in (ROOT/'vercel.json').read_text())

nav_source=(ROOT/'scripts/build_site.py').read_text()
ok('12-area navigation is defined centrally',all("('"+label+"'," in nav_source for label in ['Overview','Futures Markets','Volume & OI','News Intelligence','Macro Calendar','COT & Positioning','Prediction Markets','ICT Academy','Entry Models','Strategy Lab','Risk & Journal','Sources & Data Health']))
ok('Weekly open-interest endpoint is distinct from exchange volume','/api/v1/volume-open-interest' in worker and 'cadence:"weekly"' in worker and 'metric:"open_interest"' in worker and 'status:"not-connected"' in worker)
ok('P1 health checker tests provider endpoints independently','Promise.allSettled' in (ROOT/'assets/data-health.js').read_text() and '/api/v1/providers' in (ROOT/'assets/data-health.js').read_text())
ok('Prediction page uses read-only venue endpoints','/api/v1/prediction/polymarket' in (ROOT/'assets/prediction-markets.js').read_text() and '/api/v1/prediction/kalshi' in (ROOT/'assets/prediction-markets.js').read_text())
ok('Entry Models page does not claim an audited ranking',"no audited win-rate" in nav_source.lower() and 'Strategy Lab' in nav_source)

economic=(ROOT/'cloudflare/src/economic-providers.js').read_text()
ok('P2 supports BEA, EIA, FRED, Treasury and ECB adapters',all(x in economic for x in ['case "bea"','case "eia"','case "fred"','case "us_treasury"','case "ecb"']))
ok('Provider API keys are removed before source URLs are stored','searchParams.delete("api_key")' in economic and 'searchParams.delete("UserID")' in economic)
ok('Worker protects manual ingestion with a bearer token','url.pathname==="/api/v1/ingest"' in worker and 'Authorization' in worker and 'env.INGEST_TOKEN' in worker)
ok('Economic history is persisted with idempotent upserts','economic_observations' in worker and 'on_conflict=provider,dataset_id,series_id,frequency,observation_date' in worker and 'ingestion_runs' in worker)
ok('Economic providers use cadence-aware scheduled ingestion','scheduledEconomicIngestion(env)' in worker and 'cfg.ttlSeconds*1000' in worker)
ok('Supabase migration keeps ingestion runs private', (ROOT/'supabase/migrations/20261108134935_add_economic_observations_and_ingestion_runs.sql').exists() and 'revoke all on public.ingestion_runs from anon, authenticated' in (ROOT/'supabase/migrations/20261108134935_add_economic_observations_and_ingestion_runs.sql').read_text())
ok('P2 economic dashboard loads all five providers',all(('id:"'+x+'"') in (ROOT/'assets/economic-data.js').read_text() for x in ['bea','eia','fred','us_treasury','ecb']) and 'request("/api/v1/economic/"+p.id)' in (ROOT/'assets/economic-data.js').read_text())

academy_data=readj(Path('ict-futures/data/ict-academy.json'))
academy_concepts=academy_data.get('concepts',[])
learning_program=academy_data.get('learningProgram',{})
ok('P3 enriches all 76 lessons with objectives, walkthrough, example, exercise and quiz',
   len(academy_concepts)==76 and all(len(c.get('learning',{}).get('learningObjectives',[]))>=3 and len(c.get('learning',{}).get('guidedWalkthrough',[]))>=3 and c.get('learning',{}).get('workedExample',{}).get('body') and c.get('learning',{}).get('practicalExercise',{}).get('task') and len(c.get('learning',{}).get('knowledgeCheck',{}).get('options',[]))==3 for c in academy_concepts))
ok('P3 supplies nine guided tutorials with tasks and review criteria',
   len(learning_program.get('tutorials',[]))==9 and all(len(t.get('steps',[]))>=4 and t.get('deliverable') and len(t.get('review',[]))>=3 for t in learning_program.get('tutorials',[])))
verified_video_urls=[v.get('url') for v in academy_data.get('featuredVideos',[]) if v.get('verifiedOfficial')]
ok('P3 verified video references are drawn only from marked official records',
   all(ref.get('url') in verified_video_urls for c in academy_concepts for ref in c.get('learning',{}).get('references',{}).get('officialVideos',[])))
ok('P3 progress sync uses authenticated user and existing lesson_progress table',
   'finance-os-supabase-session-v1' in (ROOT/'assets/academy-learning.js').read_text() and '/rest/v1/lesson_progress' in (ROOT/'assets/academy-learning.js').read_text() and 'on_conflict=user_id,lesson_slug' in (ROOT/'assets/academy-learning.js').read_text() and 'progress_data' in (ROOT/'assets/academy-learning.js').read_text() and 'lesson_version' in (ROOT/'assets/academy-learning.js').read_text())
ok('P3 progress client exposes no service-role credential',
   'service_role' not in (ROOT/'assets/academy-learning.js').read_text().lower() and 'SUPABASE_SERVICE_ROLE_KEY' not in (ROOT/'assets/academy-learning.js').read_text())


ok('P2 exposes bounded read-only Supabase history API','url.pathname==="/api/v1/economic/history"' in worker and 'query.set("and"' in worker and 'Math.min(5000' in worker)
ok('P2 records provider skips and fetch failures when persistence is configured','recordIngestionRun(env,provider,"skipped"' in worker and 'recordIngestionRun(env,provider,"failed"' in worker)
ok('Ingestion ledger has explicit browser-deny migration','using (false)' in (ROOT/'supabase/migrations/20261108140821_deny_browser_access_to_ingestion_runs.sql').read_text() and 'with check (false)' in (ROOT/'supabase/migrations/20261108140821_deny_browser_access_to_ingestion_runs.sql').read_text())




sql=(ROOT/'supabase/setup.sql').read_text()
ok('Supabase schema includes RLS enablement','enable row level security' in sql)
ok('User RLS checks ownership with auth.uid()','(select auth.uid())' in sql and 'with check' in sql)
ok('No service role in browser assets','SUPABASE_SERVICE_ROLE_KEY' not in ''.join(p.read_text(errors='ignore') for p in (ROOT/'assets').glob('*.js')))

# Run generated route build and test final output if it exists.
dist=ROOT/'dist'
if dist.exists():
    expected=['index.html','markets/index.html','academy/index.html','research/index.html','research/positioning/index.html','macro/index.html','news/index.html','tools/index.html','account/index.html','status/index.html','docs/index.html','legacy/index.html','ict-futures/index.html','futures-intelligence/index.html','volume-open-interest/index.html','prediction-markets/index.html','entry-models/index.html','strategy-lab/index.html','data-health/index.html']
    ok('All primary route entry points generated',all((dist/p).exists() for p in expected),', '.join(p for p in expected if not (dist/p).exists()))
    html=list(dist.rglob('*.html'))
    ok('Legacy ICT SEO route set preserved',len(list((dist/'ict-futures/academy').glob('*.html')))==76 and len(list((dist/'ict-futures/markets').glob('*.html')))==15)
    bad=[]
    for p in html:
        if 'whizz444yt-ux.github.io/new.w' in p.read_text(errors='ignore'): bad.append(str(p.relative_to(dist)))
    ok('No obsolete hard-coded GitHub Pages hostname',not bad,', '.join(bad[:4]))
    bad_seo=[str(p.relative_to(dist)) for p in [*dist.rglob('sitemap.xml'),*dist.rglob('robots.txt')] if 'whizz444yt-ux.github.io/new.w' in p.read_text(errors='ignore')]
    ok('No stale nested robots/sitemap hostname',not bad_seo,', '.join(bad_seo[:4]))
    ok('Only one authoritative root robots and sitemap',len(list(dist.rglob('robots.txt')))==1 and len(list(dist.rglob('sitemap.xml')))==1)
    ok('No archived nested source ZIPs exposed in static output',not list(dist.rglob('*.zip')))
    ok('P3 Academy learning assets match source',
        all((dist/'assets'/name).exists() and (dist/'assets'/name).read_bytes()==(ROOT/'assets'/name).read_bytes() for name in ['academy-learning.css','academy-learning.js','academy-catalog.js']))
    p3_lessons=list((dist/'ict-futures/academy').glob('*.html'))
    p3_tutorials=list((dist/'ict-futures/academy/tutorials').glob('*.html'))
    ok('P3 builds 76 enhanced standalone lessons',len(p3_lessons)==76 and all('KNOWLEDGE CHECK' in p.read_text(errors='ignore') and 'PRACTICAL EXERCISE' in p.read_text(errors='ignore') for p in p3_lessons))
    ok('P3 builds nine guided tutorials plus their index',len(p3_tutorials)==10 and (dist/'ict-futures/academy/tutorials/index.html').exists())
    ok('P2 economic dashboard asset matches source',
        (dist/'assets/economic-data.js').exists() and (dist/'assets/economic-data.js').read_bytes()==(ROOT/'assets/economic-data.js').read_bytes())
    ok('P1 module assets match source files',
        all((dist/'assets'/name).exists() and (dist/'assets'/name).read_bytes()==(ROOT/'assets'/name).read_bytes()
            for name in ['volume-open-interest.js','data-health.js','prediction-markets.js','site-shell.css']))
    ok('Built Futures Desk assets match source files',
        (dist/'assets/futures-intelligence.js').exists() and (dist/'assets/futures-intelligence.css').exists() and
        (dist/'assets/futures-intelligence.js').read_bytes()==(ROOT/'assets/futures-intelligence.js').read_bytes() and
        (dist/'assets/futures-intelligence.css').read_bytes()==(ROOT/'assets/futures-intelligence.css').read_bytes())
    ok('Runtime config exists only with publishable Supabase key', (dist/'assets/runtime-config.js').exists() and 'service_role' not in (dist/'assets/runtime-config.js').read_text().lower())
    # Validate inline scripts in the two preserved monolithic applications.
    for page in [dist/'index.html', dist/'ict-futures/index.html']:
        page_html=page.read_text(encoding='utf-8',errors='replace')
        inline=[]
        for match in re.finditer(r'<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script\s*>',page_html,re.I|re.S):
            attrs,body=match.group(1),match.group(2)
            if 'application/json' in attrs.lower() or 'application/ld+json' in attrs.lower(): continue
            if body.strip(): inline.append(body)
        for i,body in enumerate(inline):
            with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as f:
                f.write(body); temp=f.name
            result=subprocess.run(['node','--check',temp],capture_output=True,text=True)
            Path(temp).unlink(missing_ok=True)
            ok(f'Inline app JavaScript: {page.relative_to(dist)} [{i+1}]',result.returncode==0,(result.stderr or '').strip()[:400])
    if not __import__('os').getenv('SITE_URL'):
        robots=(dist/'robots.txt').read_text()
        ok('Local output disallows search indexing','Disallow: /' in robots)
else:
    errors.append('dist output is missing; run scripts/build_site.py')

for name,passed,detail in checks:
    print(('PASS' if passed else 'FAIL')+'  '+name+(f' — {detail}' if detail else ''))
print(f'\n{sum(x[1] for x in checks)}/{len(checks)} checks passed')
if errors:
    print('\nErrors:'); print('\n'.join('- '+e for e in errors)); sys.exit(1)
