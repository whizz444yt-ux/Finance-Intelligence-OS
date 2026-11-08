#!/usr/bin/env python3
"""Build Finance Intelligence OS static routes from preserved source datasets."""
from __future__ import annotations
import json, os, shutil, re
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SITE_URL = os.getenv('SITE_URL', '').rstrip('/')

NAV_ITEMS = [
    ('Overview', '/'),
    ('Futures Markets', '/futures-intelligence/'),
    ('Volume & OI', '/volume-open-interest/'),
    ('News Intelligence', '/news/'),
    ('Macro Calendar', '/macro/'),
    ('COT & Positioning', '/research/positioning/'),
    ('Prediction Markets', '/prediction-markets/'),
    ('ICT Academy', '/academy/'),
    ('Entry Models', '/entry-models/'),
    ('Strategy Lab', '/strategy-lab/'),
    ('Risk & Journal', '/tools/'),
    ('Sources & Data Health', '/data-health/'),
]

def nav_markup(current='/', css_class='topnav'):
    links = []
    for label, href in NAV_ITEMS:
        active = ' aria-current="page"' if current == href else ''
        links.append(f'<a href="{href}"{active}>{escape(label)}</a>')
    return f'<nav class="{css_class}" aria-label="Finance Intelligence OS areas">{"".join(links)}</nav>'


def load(path, default=None):
    try: return json.loads(path.read_text(encoding='utf-8'))
    except Exception: return default

def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

def json_script(value):
    return json.dumps(value, ensure_ascii=False).replace('</', '<\\/')


def shell(title, description, body, canonical_path='/', extra_head=''):
    canonical = f'<link rel="canonical" href="{escape(SITE_URL + canonical_path)}">' if SITE_URL else '<meta name="robots" content="noindex,follow">'
    og_url = escape(SITE_URL + canonical_path) if SITE_URL else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description)}">{canonical}
<meta property="og:type" content="website"><meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(description)}"><meta property="og:image" content="{escape((SITE_URL + '/assets/social-card.png') if SITE_URL else '/assets/social-card.png')}"><meta property="og:url" content="{og_url}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="/assets/social-card.png">
<link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/assets/site-shell.css"><script defer src="/assets/runtime-config.js"></script>{extra_head}</head>
<body><a class="skip" href="#content">Skip to content</a><header class="site-head"><div class="head-inner"><a class="brand" href="/"><span class="brand-mark">FI</span><span>FINANCE INTELLIGENCE OS<small>Global research · futures · ICT</small></span></a>{nav_markup(canonical_path)}<button class="menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="mobileNav">Areas ☰</button></div>{nav_markup(canonical_path, 'mobile-nav')} </header>
<main id="content">{body}</main><footer class="site-footer"><div><b>Finance Intelligence OS</b><p>Research and education workspace. Not a broker, investment adviser, exchange data terminal or trade execution service.</p></div><div class="footer-links"><a href="/data-health/">Sources & Data Health</a><a href="/docs/">Documentation</a><a href="/ict-futures/">ICT Futures terminal</a><a href="/legacy/">Archived research</a></div><small>Source labels, provider timestamps and data licensing limitations should remain visible wherever market information is shown.</small></footer><script src="/assets/site-shell.js" defer></script></body></html>'''


def page_intro(kicker, title, desc, stats=''):
    return f'<section class="page-hero"><p class="kicker">{escape(kicker)}</p><h1>{escape(title)}</h1><p>{escape(desc)}</p>{stats}</section>'


def card(title, desc, href, eyebrow='Explore', tag=''):
    return f'<a class="module-card" href="{escape(href)}"><span class="card-eyebrow">{escape(eyebrow)}</span><h3>{escape(title)}</h3><p>{escape(desc)}</p><span class="card-cta">Open module →</span>{f"<span class='card-tag'>{escape(tag)}</span>" if tag else ''}</a>'


def build():
    if DIST.exists(): shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    # Copy repository files except dev-only/legacy archive material.
    for name in ['index.html','resources.json','icon.svg','manifest.webmanifest','sw.js','data','assets','ict-futures','futures-intelligence','docs','README.md','SECURITY.md','LICENSE','.well-known']:
        src=ROOT/name
        if not src.exists(): continue
        dst=DIST/name
        if src.is_dir(): shutil.copytree(src,dst,dirs_exist_ok=True)
        else: shutil.copy2(src,dst)
    shutil.copytree(ROOT/'legacy/previous-markdown', DIST/'legacy/previous-markdown', dirs_exist_ok=True)
    # Route SEO metadata and old hardcoded host cleanup in copied ICT child pages.
    for html in DIST.rglob('*.html'):
        if html == DIST/'index.html': continue
        s=html.read_text(encoding='utf-8', errors='replace')
        s=re.sub(r'<link rel="canonical" href="https://whizz444yt-ux\.github\.io/new\.w/[^\"]*">', '', s, flags=re.I)
        s=re.sub(r'https://whizz444yt-ux\.github\.io/new\.w', '', s)
        if SITE_URL:
            rel='/' + str(html.relative_to(DIST)).replace('\\','/')
            if html.name == 'index.html': rel = '/' + str(html.parent.relative_to(DIST)).replace('\\','/') .strip('.') + '/' if html.parent != DIST else '/'
            canonical=f'<link rel="canonical" href="{escape(SITE_URL+rel)}">'
            if re.search(r'<link rel="canonical"',s,re.I): s=re.sub(r'<link rel="canonical"[^>]*>',canonical,s,count=1,flags=re.I)
            else: s=s.replace('</head>',canonical+'</head>',1)
            if 'property="og:image"' not in s: s=s.replace('</head>','<meta property="og:image" content="'+escape(SITE_URL+'/assets/social-card.png')+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="'+escape(SITE_URL+'/assets/social-card.png')+'"></head>',1)
        else:
            s=re.sub(r'<meta name="robots" content="index,follow">','<meta name="robots" content="noindex,follow">',s,count=1,flags=re.I)
        # Repair only the generated contract-page comparison sentence; never run this through scripts.
        if html.parent.name == 'markets' and 'Comparison discipline:' in s:
            s=re.sub(r'(<p><strong>Comparison discipline:</strong>\s*)\[&#x27;(.*?)&#x27;\](\s*</p>)',r'\1\2\3',s,flags=re.I|re.S)
        html.write_text(s,encoding='utf-8')
    # The legacy child sitemap used the previous GitHub Pages domain; the root sitemap below owns all canonical URLs.
    for stale in [DIST/'ict-futures/sitemap.xml', DIST/'ict-futures/robots.txt']:
        if stale.exists(): stale.unlink()
    # The merged site has one authoritative root robots.txt and sitemap; discard the legacy ICT sub-site copies.
    for old_seo_file in [DIST/'ict-futures/robots.txt', DIST/'ict-futures/sitemap.xml']:
        if old_seo_file.exists(): old_seo_file.unlink()
    # Homepage metadata and quick module bridge.
    home = (DIST/'index.html').read_text(encoding='utf-8')
    bridge = '<div class="module-bridge"><div class="wrap bridge-inner"><span>FINANCE INTELLIGENCE OS · 12 RESEARCH AREAS</span>'+nav_markup('/', 'module-nav')+'</div></div>'
    if 'module-bridge' not in home:
        skip = '<a class="skip-link" href="#main-content">Skip to main content</a>'
        home = home.replace(skip, skip + '\n' + bridge, 1)
    if SITE_URL:
        canonical = f'<link rel="canonical" href="{escape(SITE_URL + "/")}">'
        home = home.replace('</head>', canonical + '<meta property="og:image" content="' + escape(SITE_URL + '/assets/social-card.png') + '"><meta name="twitter:card" content="summary_large_image">' + '</head>', 1)
    elif '<meta name="robots" content="noindex,follow">' not in home:
        home = home.replace('</head>', '<meta name="robots" content="noindex,follow"></head>', 1)
    home = home.replace('</head>', '<link rel="stylesheet" href="/assets/site-shell.css"><script defer src="/assets/runtime-config.js"></script><script defer src="/assets/site-shell.js"></script></head>', 1)
    (DIST/'index.html').write_text(home, encoding='utf-8')

    # Generate app routes from source datasets.
    resources = load(ROOT/'resources.json',{}).get('resources',[])
    mdata = load(ROOT/'ict-futures/data/market-universe.json',{}).get('markets',[])
    academy = load(ROOT/'ict-futures/data/ict-academy.json',{}).get('concepts',[])
    news = load(ROOT/'data/news-snapshot.json',{})
    fin_markets = load(ROOT/'data/market-universe.json',{}).get('markets',[])

    # Markets
    cards=''.join(card(m.get('label',m.get('name',m.get('id','Market'))),m.get('role',m.get('note','Market context and research links.')),f"/ict-futures/markets/{m.get('id','')}.html",m.get('exchange','Market profile'),m.get('tier','')) for m in mdata)
    cards += ''.join(card(m.get('label',m.get('symbol',m.get('id','Instrument'))),m.get('note','Cross-asset research profile.'),f"/index.html#market-cockpit",m.get('group','Global instrument')) for m in fin_markets[:24])
    body=page_intro('Market universe','Global markets & futures','Explore the 15 retained ICT futures contract families and the wider cross-asset instrument catalogue. Contract specifications must be checked against the current exchange source before a trade.')
    body+=f'<section class="content-section"><div class="section-top"><div><span class="kicker">ICT futures universe</span><h2>Contract profiles</h2><p>15 futures families retained from the supplied 3.0 source dataset.</p></div><a class="text-link" href="/ict-futures/">Open full futures terminal →</a></div><div class="card-grid">{cards}</div></section>'
    body+=f'<section class="content-section"><h2>Contract data quality rules</h2><p>Tick size, tick value, multiplier, expiry, first notice and session hours are reference values only until independently reconciled with the official exchange specification and date-stamped. No broker margin is inferred.</p></section>'
    write(DIST/'markets/index.html',shell('Global Markets & Futures | Finance Intelligence OS','Explore global instruments and the retained 15-contract ICT futures universe.',body,'/markets/'))

    # Academy listing
    lesson_cards=''.join(card(c.get('name','Lesson'),c.get('definition',''),f"/ict-futures/academy/{c.get('id','')}.html",c.get('category','ICT Academy'),c.get('level','')) for c in academy)
    body=page_intro('Education library','ICT Academy','76 concept records across seven learning tracks from the supplied ICT Futures playbook. Concepts include evidence/provenance notes; an educator search link is not represented as a verified lesson video.',f'<div class="stats-row"><b>{len(academy)}</b><span>Concept records</span><b>7</b><span>Learning tracks</span></div>')
    body+='<div class="filter-row"><input id="academySearch" class="search-input" type="search" placeholder="Search concepts, definitions or categories"><span id="academyCount" class="muted"></span></div>'
    body+=f'<section class="card-grid" id="academyCards">{lesson_cards}</section>'
    write(DIST/'academy/index.html',shell('ICT Academy | Finance Intelligence OS','Browse ICT concepts, models, market structure, liquidity, sessions and futures education.',body,'/academy/', '<script defer src="/assets/academy-search.js"></script>'))

    # Macro indicators: official BLS historical observations via the edge gateway.
    body=page_intro('Official macro data','US inflation & labour indicators','Five series from the US Bureau of Labor Statistics Public Data API v1. Values are published historical observations with their own index bases and units; they are not live market quotes or a complete economic calendar.')
    body += """<section class="content-section"><div class="section-top"><div><h2>BLS macro dashboard</h2><p>API cache refreshes on demand and expires after six hours.</p></div><button class="primary-button" id="macroRefresh">Load / update BLS snapshot</button></div><div id="macroState" class="muted">Loading provider data…</div><div id="macroSeries" class="macro-grid"></div></section><section class="content-section"><h2>Method and limitations</h2><p>Version 1 of the BLS API is public without registration, with a documented limit of 25 series per request and up to 10 years of observations. It returns historical observations and can lag the original release; release time/calendar data are separate. Do not combine different index base units or infer market direction from a single series.</p><div class="source-notes"><a href="https://www.bls.gov/developers/api_signature.htm" target="_blank" rel="noopener noreferrer">BLS API signatures ↗</a><a href="https://www.bls.gov/bls/news-release/home.htm" target="_blank" rel="noopener noreferrer">BLS release calendar ↗</a><a href="https://www.bls.gov/developers/api_faqs.htm" target="_blank" rel="noopener noreferrer">BLS API FAQ ↗</a></div></section>"""
    body+='<section class="content-section"><h2>Economic release calendar</h2><p><span class="status-pill warn">CALENDAR AGGREGATION · NOT CONNECTED</span></p><p>The current macro adapter provides published historical BLS observations, not a consolidated upcoming-release calendar or consensus/actual feed. Until official release schedules and additional source adapters are integrated, use the primary agency calendars below and verify all release times in the publisher timezone.</p><div class="source-notes"><a href="https://www.bls.gov/schedule/news_release/" target="_blank" rel="noopener noreferrer">BLS release schedule ↗</a><a href="https://www.bea.gov/news/schedule" target="_blank" rel="noopener noreferrer">BEA release schedule ↗</a><a href="https://www.eia.gov/petroleum/supply/weekly/" target="_blank" rel="noopener noreferrer">EIA weekly petroleum status ↗</a></div></section>'
    write(DIST/'macro/index.html',shell('US Macro Indicators | Finance Intelligence OS','Official BLS inflation and labour-market historical series, with source labels, units and retrieval times.',body,'/macro/', '<script defer src="/assets/macro-page.js"></script>'))

    # COT / institutional positioning.
    body=page_intro('Institutional positioning','CFTC Commitments of Traders','Query CFTC Public Reporting Environment datasets: TFF Futures Only for financial futures or Disaggregated Futures Only for covered commodity markets. COT is a weekly report with Tuesday positions published on Friday; it is not intraday positioning.')
    body += """<section class="content-section"><div class="section-top"><div><h2>Latest COT records</h2><p>Cached public CFTC API response. Search a contract name such as Nasdaq, S&P, Gold, Crude Oil or Euro FX.</p></div><button class="primary-button" id="cotRefresh">Load latest CFTC snapshot</button></div><div class="cot-controls"><button class="cot-toggle active" data-cot-report="tff" type="button">TFF · Financial futures</button><button class="cot-toggle" data-cot-report="disaggregated" type="button">Disaggregated · Commodities</button><input class="search-input" id="cotSearch" type="search" placeholder="Filter by market or code"><span class="muted" id="cotCount"></span></div><p class="muted" id="cotState">Loading CFTC data…</p><div class="table-wrap"><table class="cot-table"><thead><tr><th>Contract market</th><th>Report date</th><th>Open interest</th><th>Long</th><th>Short</th><th>Net</th></tr></thead><tbody id="cotRows"><tr><td colspan="6">Loading CFTC snapshot…</td></tr></tbody></table></div></section><section class="content-section"><h2>Interpretation and data caveats</h2><p>For TFF, the default net calculation uses the Leveraged Money category. For the Disaggregated report, it uses Managed Money. These are report categories, not a complete view of all market participants. Check the underlying row fields and report type before interpretation. Positions are aggregated and reported with a time lag.</p><div class="source-notes"><a href="https://publicreporting.cftc.gov/Commitments-of-Traders/TFF-Futures-Only/gpe5-46if" target="_blank" rel="noopener noreferrer">Official TFF futures-only dataset ↗</a><a href="https://publicreporting.cftc.gov/w/72hh-3qpy/default" target="_blank" rel="noopener noreferrer">Official Disaggregated dataset ↗</a><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC COT reports ↗</a><a href="https://publicreporting.cftc.gov/stories/s/Public-Reporting-FAQ/inwp-fmhz/" target="_blank" rel="noopener noreferrer">CFTC PRE FAQ ↗</a></div></section>"""
    write(DIST/'research/positioning/index.html',shell('CFTC COT Positioning | Finance Intelligence OS','Fetch official CFTC Public Reporting Environment futures-only TFF and Disaggregated positioning datasets.',body,'/research/positioning/', '<script defer src="/assets/cot-page.js"></script>'))

    # Research directory
    body=page_intro('Curated sources','Research directory','A searchable catalogue of public financial research resources retained from the previous Finance Intelligence OS baseline. Access notes are descriptive metadata, not legal clearance or a promise of free real-time data.',f'<div class="stats-row"><b>{len(resources)}</b><span>Curated resources</span><b>{len(load(ROOT/"resources.json",{}).get("categories",[]))}</b><span>Categories</span></div>')
    body+='<div class="filter-row"><input id="resourceSearch" class="search-input" type="search" placeholder="Search providers, topics or descriptions"><select id="resourceCategory" class="search-input"><option value="">All categories</option></select><span id="resourceCount" class="muted"></span></div><div id="resourceCards" class="directory-grid"></div>'
    write(DIST/'research/index.html',shell('Research Directory | Finance Intelligence OS','Search global financial data, exchanges, research platforms and open-source finance tools.',body,'/research/', '<script defer src="/assets/research-directory.js"></script>'))

    # News room
    articles=news.get('articles',[]) if isinstance(news,dict) else []
    nstatus=news.get('status','not-yet-fetched') if isinstance(news,dict) else 'not-yet-fetched'
    body=page_intro('News intelligence','Global news & market movement','Source-discovery workspace for macro, central banks, equities, FX, metals, energy, crypto and geopolitics. Aggregated discovery is a research lead, not verified fact or a trading signal.')
    body+=f'<section class="status-panel"><div><span class="status-label">Snapshot status</span><strong>{escape(str(nstatus).upper())}</strong></div><div><span class="status-label">Stored articles</span><strong>{len(articles)}</strong></div><p>Last check: {escape(str(news.get("lastCheckedAt") or "Not yet fetched"))}</p><p>Provider: {escape(str(news.get("provider") or "GDELT DOC API"))}</p></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Curated headlines</h2><p>Last saved snapshot. Each item opens its original publisher.</p></div><button class="primary-button" id="refreshNews">Refresh news snapshot</button></div><div class="news-grid" id="newsGrid"></div><p id="newsState" class="muted"></p></section><section class="content-section"><h2>Search external sources</h2><p>Use the preserved Finance OS news and social research desk for one-click discovery across publishers and platforms.</p><a class="text-link" href="/#live-news-hub">Open full Finance research desk →</a></section>'
    write(DIST/'news/index.html',shell('News & Market Movement | Finance Intelligence OS','Market news discovery with source traceability, retrieval times and provider status.',body,'/news/', '<script defer src="/assets/news-page.js"></script>'))

    # Volume & Open Interest: weekly futures-only CFTC OI, with exchange volume explicitly unavailable.
    voi_options = ''.join(f'<option value="{escape(m.get("id",""))}">{escape(m.get("label",""))}</option>' for m in mdata)
    body=page_intro('Market participation data','Volume & Open Interest','A contract-aware participation research area. Weekly open interest is sourced from CFTC futures-only reports where the selected contract is covered. Daily exchange volume is deliberately withheld until a verified provider and redistribution basis are connected.')
    body+='<section class="voi-control-panel"><div class="voi-controls"><label>Futures family<select id="voiMarket">'+voi_options+'</select></label><label>CFTC market label<select id="voiInstrument" disabled><option>Loading contract rows…</option></select></label><button id="voiRefresh" class="primary-button">Refresh weekly OI</button></div><div class="voi-source-row"><span id="voiStatus" class="status-pill warn">WAITING</span><span id="voiReport">CFTC report</span><a id="voiSource" href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">Official CFTC dataset ↗</a></div><p id="voiRetrieved" class="muted">Waiting for the provider response…</p></section>'
    body+='<section class="voi-metric-grid"><article class="voi-metric"><span>Latest open interest</span><strong id="voiLatest">—</strong><small id="voiAsOf">No report date yet</small></article><article class="voi-metric"><span>Week-on-week change</span><strong id="voiChange">—</strong><small>Change in reported open-interest contracts</small></article><article class="voi-metric"><span>Historical coverage</span><strong id="voiRange">—</strong><small>Latest available rows in this CFTC dataset</small></article><article class="voi-metric unavailable"><span>Exchange trading volume</span><strong>Not connected</strong><small>Daily / intraday volume is not supplied by the COT adapter</small></article></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Weekly open-interest history</h2><p id="voiMarketName">Select a market to load the CFTC series.</p></div><span class="data-pill">WEEKLY · CFTC REPORT</span></div><div id="voiState" class="data-message">Waiting for data…</div><div id="voiChart" class="oi-chart"><div class="loading-state">Loading open-interest history…</div></div><div class="fine-print">Each bar represents a reported weekly open-interest observation for one specific CFTC market label. It is not daily trading volume, open contracts on a broker, or order-book depth.</div></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Reported weekly observations</h2><p>Newest report first. No synthetic values or interpolation are used.</p></div><span id="voiCount" class="muted">— rows</span></div><div class="table-wrap"><table class="cot-table"><thead><tr><th>Report date</th><th>Open interest</th><th>Week change</th><th>Source market label</th></tr></thead><tbody id="voiTable"><tr><td colspan="4">No data loaded.</td></tr></tbody></table></div></section>'
    body+='<section class="content-section"><h2>Coverage and licensing boundary</h2><p>CFTC COT is a weekly positioning report and can provide reported open interest for covered futures-only markets. It does not provide the exchange daily volume series required for intraday volume profiles, volume delta, or session volume. Those require a separate official exchange feed or a licensed market-data provider. The UI will not substitute prediction-market volume, spot volume or a generic chart-widget value.</p><div class="source-notes"><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC Commitments of Traders ↗</a><a href="https://www.cmegroup.com/market-data.html" target="_blank" rel="noopener noreferrer">CME market data ↗</a><a href="https://www.ice.com/market-data" target="_blank" rel="noopener noreferrer">ICE market data ↗</a></div></section>'
    write(DIST/'volume-open-interest/index.html',shell('Futures Volume & Open Interest | Finance Intelligence OS','Contract-aware weekly open-interest history with explicit source and daily volume availability.',body,'/volume-open-interest/', '<script defer src="/assets/volume-open-interest.js"></script>'))

    # Prediction-market event context: venue-specific probabilities, not futures market data.
    body=page_intro('Event probability research','Prediction Markets','Read-only event-market context from Polymarket and Kalshi. Outcome probabilities and venue-reported turnover are not exchange futures prices, volume, open interest, or verified forecasts.')
    body+='<section class="content-section"><div class="section-top"><div><h2>Polymarket</h2><p>Public event metadata and outcome prices.</p></div><div><span id="polyStatus" class="status-pill warn">WAITING</span><p id="polyRetrieved" class="muted">—</p></div></div><div id="polyGrid" class="prediction-grid"><div class="loading-state">Loading Polymarket snapshots…</div></div></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Kalshi</h2><p>Public market prices and venue-reported trading volume.</p></div><div><span id="kalshiStatus" class="status-pill warn">WAITING</span><p id="kalshiRetrieved" class="muted">—</p></div></div><div id="kalshiGrid" class="prediction-grid"><div class="loading-state">Loading Kalshi snapshots…</div></div></section>'
    body+='<section class="content-section"><h2>Interpretation rules</h2><p>Prediction-market probabilities are prices of event contracts on their own venues and may reflect thin liquidity, spreads or venue-specific participation. Volume and liquidity are not transferable to CME or ICE futures. No trading, wallet, order-entry or execution integration is present.</p><p id="predictionState" class="muted">Provider state has not been checked.</p><button id="predictionRefresh" class="primary-button">Refresh event-market snapshots</button><div class="source-notes"><a href="https://polymarket.com/" target="_blank" rel="noopener noreferrer">Polymarket ↗</a><a href="https://kalshi.com/markets" target="_blank" rel="noopener noreferrer">Kalshi ↗</a></div></section>'
    write(DIST/'prediction-markets/index.html',shell('Prediction Markets | Finance Intelligence OS','Read-only Polymarket and Kalshi event market probabilities and venue-specific volume.',body,'/prediction-markets/', '<script defer src="/assets/prediction-markets.js"></script>'))

    # Entry model library. Educational records only; no performance ranking without verified backtests.
    entry_models=[c for c in academy if c.get('category')=='Entry Models']
    model_cards=''.join(card(c.get('name','Entry model'),c.get('definition',''),f"/ict-futures/academy/{c.get('id','')}.html",c.get('level','ICT concept'),'PLAYBOOK') for c in entry_models)
    body=page_intro('ICT playbook library','Entry Models','Eight preserved entry-model concepts from the ICT Academy source catalogue. These are educational playbooks, not a ranked signal service or evidence of a profitable edge.',f'<div class="stats-row"><b>{len(entry_models)}</b><span>Model concepts</span><b>0</b><span>Verified model performance rankings</span></div>')
    body+='<section class="content-section"><div class="section-top"><div><h2>Model catalogue</h2><p>Open each lesson for its definition, conditions, use cases, invalidation and common mistakes.</p></div><a class="text-link" href="/academy/">Browse all Academy concepts ↗</a></div><div class="card-grid">'+model_cards+'</div></section>'
    body+='<section class="content-section"><h2>Performance evidence policy</h2><p>No model is labelled “best” until its rules are operationally defined and tested on timestamped historical data with commissions, slippage, contract rolls, survivorship controls and out-of-sample validation. The eight models have no audited win-rate, expectancy, profit-factor or drawdown ranking yet.</p></section>'
    write(DIST/'entry-models/index.html',shell('ICT Entry Models | Finance Intelligence OS','Eight ICT entry-model concepts with educational playbook links and no unsupported performance claims.',body,'/entry-models/'))

    # Strategy Lab landing page: methodology and evidence readiness, not fabricated backtests.
    body=page_intro('Research & validation','Strategy Lab','A reproducible research workspace for turning a written entry model into a testable rule set. Historical strategy statistics remain disabled until suitable, quality-controlled market data is available.')
    body+='<section class="strategy-readiness"><div><span class="status-pill warn">BACKTEST ENGINE · NOT YET CONNECTED</span><h2>No audited strategy results are published</h2><p>The repository contains eight model descriptions, but no reproducible strategy-level performance dataset. We do not infer edge from lesson popularity, discretionary examples or a handful of screenshots.</p></div><div class="strategy-steps"><article><b>01 · Specify</b><span>Define setup, entry trigger, stop, target, session, timeframe and invalidation in machine-testable terms.</span></article><article><b>02 · Source</b><span>Obtain timestamped contract-level bars, correct expiry/roll history, session calendar and verified fees.</span></article><article><b>03 · Validate</b><span>Run in-sample, walk-forward and out-of-sample tests with slippage, costs and data-quality checks.</span></article></div></section>'
    body+='<section class="content-section"><h2>Required reporting metrics</h2><div class="metric-definition-grid"><article><b>Expectancy</b><span>Average net result per trade after costs, in R and currency.</span></article><article><b>Profit factor</b><span>Gross profit divided by gross loss, with trade count and period.</span></article><article><b>Drawdown</b><span>Peak-to-trough equity decline, duration and recovery.</span></article><article><b>Robustness</b><span>Out-of-sample, walk-forward, parameter sensitivity and regime splits.</span></article></div></section>'
    body+='<section class="content-section"><h2>Data readiness</h2><p>Daily and intraday futures bars, historical contract rolls, exchange calendars, commissions, slippage and point-in-time macro data are not yet unified in the platform. See <a href="/volume-open-interest/">Volume & Open Interest</a> and <a href="/data-health/">Sources & Data Health</a> for current feed coverage.</p></section>'
    write(DIST/'strategy-lab/index.html',shell('Strategy Lab | Finance Intelligence OS','Methodology and readiness for reproducible futures strategy backtesting.',body,'/strategy-lab/'))

    # Independent provider and snapshot health dashboard.
    body=page_intro('Operational transparency','Sources & Data Health','Test the edge gateway and inspect each provider response independently. A successful cached API response is not necessarily a fresh upstream collection, and a configured credential is not proof of a healthy data feed.')
    body+='<section class="health-summary"><div><span class="status-pill warn">PROVIDER CHECKS</span><h2 id="healthHeadline">Connecting to the gateway…</h2><p id="healthLatency">Checks have not completed.</p></div><button id="healthRefresh" class="primary-button">Recheck providers</button></section>'
    body+='<p id="healthUpdated" class="muted">Provider states are loading.</p><section id="healthGrid" class="health-grid"><div class="loading-state">Checking independent provider endpoints…</div></section>'
    body+='<section class="content-section"><h2>How to read the status</h2><div class="health-legend"><span><i class="legend-dot good"></i> Fresh / partial response</span><span><i class="legend-dot warn"></i> Cached, not yet fetched or not configured</span><span><i class="legend-dot bad"></i> Unavailable / failed request</span></div><p>“Fresh” describes the gateway snapshot status reported by that API response. It does not mean exchange-real-time data. “Available on request” indicates a route or public provider capability, not a completed provider fetch. Supabase ingestion and Builder administration remain disabled unless the required server-side secrets are configured.</p></section>'
    body+='<section class="content-section"><h2>Source registry</h2><p>Prefer primary exchange, regulator, statistical agency and central-bank sources. Contract specification and market-data redistribution terms must be verified separately.</p><div class="source-notes"><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC ↗</a><a href="https://www.bls.gov/developers/" target="_blank" rel="noopener noreferrer">BLS ↗</a><a href="https://fred.stlouisfed.org/docs/api/fred/" target="_blank" rel="noopener noreferrer">FRED ↗</a><a href="https://www.bea.gov/developers" target="_blank" rel="noopener noreferrer">BEA ↗</a><a href="https://www.eia.gov/opendata/" target="_blank" rel="noopener noreferrer">EIA ↗</a><a href="https://www.cmegroup.com/market-data.html" target="_blank" rel="noopener noreferrer">CME market data ↗</a><a href="https://www.ice.com/market-data" target="_blank" rel="noopener noreferrer">ICE market data ↗</a></div></section>'
    write(DIST/'data-health/index.html',shell('Sources & Data Health | Finance Intelligence OS','Independent gateway and provider snapshot health checks with provenance and freshness limitations.',body,'/data-health/', '<script defer src="/assets/data-health.js"></script>'))

    # Tools
    body=page_intro('Trading tools','Risk & research tools','Standalone contract-aware sizing helper, journal link, pre-session checklist and research tools. Calculations are estimates; verify current contract specs and broker costs before use.')
    body+='''<section class="content-section"><div class="section-top"><div><h2>Futures position size calculator</h2><p>Tick-based estimate; choose standard or micro size where the catalogue supplies a micro profile, then set account risk in USD.</p></div><span class="data-pill">ESTIMATE · NOT EXECUTION</span></div><div class="calc-grid"><label>Contract<select id="contract"></select></label><label>Account balance<input id="balance" type="number" min="0" value="10000"></label><label>Risk %<input id="riskPct" type="number" min="0.01" max="100" step="0.01" value="1"></label><label>Stop distance (ticks)<input id="stopTicks" type="number" min="1" value="20"></label><label>Target distance (ticks)<input id="targetTicks" type="number" min="1" value="60"></label><label>Round-turn commission / contract<input id="commission" type="number" min="0" step="0.01" value="4"></label><label>Entry + exit slippage (ticks)<input id="slippage" type="number" min="0" step="1" value="2"></label><button id="calculateRisk" class="primary-button">Calculate size</button></div><div id="riskResult" class="result-panel" aria-live="polite">Enter assumptions and calculate position size.</div><p class="fine-print">Tick values are copied from the supplied ICT dataset and remain unverified against current official exchange specifications. The calculator rounds contracts down and shows estimated gross/net outcomes; margin and liquidation risk are not estimated.</p></section>'''
    body+='<section class="content-section"><h2>Personal workspace</h2><div class="card-grid">'+card('Global watchlist & journal','Open the existing local-first watchlist, viewpoint ledger and research journal.','/#personal-workspace','Private workspace')+card('Pre-session checklist','Prepare a repeatable market plan and evidence checklist.','/ict-futures/#checklist','ICT Futures')+card('Trade review & statistics','Use the original journal analytics and workspace backup/export.','/#personal-workspace','Research tools')+'</div></section>'
    write(DIST/'tools/index.html',shell('Risk & Research Tools | Finance Intelligence OS','Futures risk calculator, watchlist, journal and checklist.',body,'/tools/', '<script defer src="/assets/risk-calculator.js"></script>'))

    # Supabase account sign-in and private workspace sync.
    body=page_intro('Account & sync','Your private trading workspace','Use Supabase authentication to access your own journal, watchlists and ICT lesson progress. Database policies enforce user ownership; public market data is read-only.')+'<div id="accountApp"><section class="content-section"><p>Loading secure account workspace…</p></section></div>'
    write(DIST/'account/index.html',shell('Account & Private Workspace | Finance Intelligence OS','Sign in to sync private journal, watchlists and ICT lesson progress.',body,'/account/', '<script defer src="/assets/account.js"></script>'))

    # Status / docs pages
    status_rows=[('GitHub','Source repository and CI','Main repository connected; current quality workflow enabled'),('Vercel','Frontend hosting','Production project exists; Git-linked builds triggered on main; latest release status is shown in Vercel'),('Supabase','Postgres and Auth','Active Mumbai project; 16 public tables have RLS enabled; security advisors returned no lints'),('Builder.io','Editorial CMS','Allow-listed proxy code exists; public API key and Admin PAT not configured'),('Cloudflare','Edge API and cache','Worker deployed with KV and 30-minute GDELT Cron; public read-only news, macro, COT and prediction endpoints configured; privileged Worker secrets not configured')]
    rows=''.join(f'<tr><td><b>{escape(a)}</b><small>{escape(b)}</small></td><td>{escape(c)}</td></tr>' for a,b,c in status_rows)
    body=page_intro('Platform operations','System status & integrations','This page deliberately reports verified account and runtime state. Configuration files in the repository are not evidence that a remote service has been provisioned or deployed.')
    body+=f'<section class="content-section"><table class="status-table"><thead><tr><th>Service</th><th>Verified state</th></tr></thead><tbody>{rows}</tbody></table></section>'
    body+='<section class="content-section"><h2>Data state definitions</h2><p><span class="data-pill">LIVE API</span> received from a provider at request time · <span class="data-pill">SNAPSHOT</span> stored response · <span class="data-pill">DELAYED</span> provider-labelled delay · <span class="data-pill">OFFICIAL LINK</span> publisher page · <span class="data-pill">SEARCH LINK</span> provider search query · <span class="data-pill">STALE</span> retained last-known data · <span class="data-pill">UNAVAILABLE</span> no usable response.</p></section>'
    write(DIST/'status/index.html',shell('System Status | Finance Intelligence OS','Verified setup status for GitHub, Vercel, Supabase, Builder.io and Cloudflare.',body,'/status/'))
    body=page_intro('Developer reference','Documentation','Architecture, setup, data contracts, source provenance, integration boundaries and operational instructions for maintaining this application.')
    docs_cards=[card('Master requirements','The complete five-tool architecture, APIs, phases and acceptance criteria.','/docs/FINANCE_INTELLIGENCE_OS_COMPLETE_MASTER_REQUIREMENTS.md','Specification'),card('Implementation guide','How to configure the repository, data adapters, Worker and CMS integration.','/docs/IMPLEMENTATION.md','Guide'),card('Architecture','System component boundaries and data flows.','/docs/ARCHITECTURE.md','Technical'),card('Environment variables','Names and handling rules; never commit secret values.','/docs/ENVIRONMENT.md','Operations')]
    body+='<section class="card-grid">'+''.join(docs_cards)+'</section>'
    body+='<section class="content-section"><h2>Archived source material</h2><p>Prior global directory documents and source ZIPs are preserved under <code>/legacy/</code>. The ICT Futures 3.0 site is retained under <code>/ict-futures/</code>.</p><a class="text-link" href="/legacy/">Browse preserved Markdown →</a></section>'
    write(DIST/'docs/index.html',shell('Documentation | Finance Intelligence OS','Technical documentation, setup guides and original source archives.',body,'/docs/'))

    # Public archive index is readable, but source ZIP baselines stay repository-only.
    archive_files = sorted((ROOT/'legacy/previous-markdown').glob('*.md'))
    archive_items = ''.join(card(p.stem.replace('_',' '), 'Preserved original research document.', '/legacy/previous-markdown/'+p.name, 'Archived reference') for p in archive_files)
    archive_body = page_intro('Original documents','Preserved research archive','Prior Finance Intelligence directories and the full 3.0 technical audit are preserved without rewriting their source content.') + '<section class="card-grid">' + archive_items + '</section>'
    write(DIST/'legacy/index.html', shell('Archived Research Documents | Finance Intelligence OS','Browse preserved original Finance Intelligence OS research documents.',archive_body,'/legacy/'))
    # Sitemap only when canonical base exists, else create relative noindex sitemap not intended for submission.
    if SITE_URL:
        urls=['/','/markets/','/futures-intelligence/','/volume-open-interest/','/data-health/','/prediction-markets/','/entry-models/','/strategy-lab/','/academy/','/research/','/research/positioning/','/news/','/macro/','/tools/','/account/','/status/','/docs/','/legacy/','/ict-futures/']
        urls += [f'/ict-futures/markets/{p.name}' for p in (DIST/'ict-futures/markets').glob('*.html')]
        urls += [f'/ict-futures/academy/{p.name}' for p in (DIST/'ict-futures/academy').glob('*.html')]
        xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{escape(SITE_URL+u)}</loc></url>' for u in urls)+'</urlset>'
        write(DIST/'sitemap.xml',xml)
        write(DIST/'robots.txt',f'User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n')
    else:
        write(DIST/'robots.txt','User-agent: *\nDisallow: /\n')
        write(DIST/'sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>')
    print(f'Built {DIST} | resources={len(resources)} | futures={len(mdata)} | academy={len(academy)} | site_url={SITE_URL or "local/noindex"}')

if __name__ == '__main__': build()
