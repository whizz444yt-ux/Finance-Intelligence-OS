#!/usr/bin/env python3
"""Build Finance Intelligence OS static routes from preserved source datasets."""
from __future__ import annotations
import json, os, shutil, re
from pathlib import Path
from html import escape
from build_academy import build_academy

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SITE_URL = os.getenv('SITE_URL', '').rstrip('/')

NAV_ITEMS = [
    ('Overview', '/'),
    ('Futures Markets', '/futures-intelligence/'),
    ('ICT Academy', '/academy/'),
    ('Entry Models', '/entry-models/'),
    ('Sessions & Calendar', '/sessions/'),
    ('Futures News', '/news/'),
    ('Volume & Open Interest', '/volume-open-interest/'),
    ('COT & Positioning', '/research/positioning/'),
    ('Contract Specs & Expiry', '/contract-specs/'),
    ('Strategy Lab', '/strategy-lab/'),
    ('Risk & Prop Firms', '/risk/'),
    ('Journal & Watchlists', '/account/'),
    ('Data Health & Sources', '/data-health/'),
]

NAV_GROUPS = [
    ('WORKSPACE', ['Overview', 'Futures Markets']),
    ('LEARN', ['ICT Academy', 'Entry Models']),
    ('MARKET INTELLIGENCE', ['Sessions & Calendar', 'Futures News', 'Volume & Open Interest', 'COT & Positioning', 'Contract Specs & Expiry']),
    ('RESEARCH & RISK', ['Strategy Lab', 'Risk & Prop Firms']),
    ('PERSONAL', ['Journal & Watchlists', 'Data Health & Sources']),
]

AREA_ALIASES = {
    '/markets/': '/futures-intelligence/',
    '/macro/': '/sessions/',
    '/tools/': '/risk/',
    '/sources/': '/data-health/',
}

AREA_LABELS = {
    '/markets/': 'Futures Markets',
    '/macro/': 'Sessions & Calendar',
    '/tools/': 'Risk & Prop Firms',
    '/sources/': 'Data Health & Sources',
    '/research/positioning/': 'COT & Positioning',
    '/status/': 'Platform Status',
    '/docs/': 'Documentation',
}

def current_area(path):
    active = AREA_ALIASES.get(path, path)
    for label, href in NAV_ITEMS:
        if href == active:
            return label
    return AREA_LABELS.get(path, 'Futures Research')

def nav_markup(current='/'):
    active = AREA_ALIASES.get(current, current)
    links = {label: href for label, href in NAV_ITEMS}
    groups = []
    for group, labels in NAV_GROUPS:
        items = []
        for label in labels:
            href = links[label]
            is_active = active == href
            symbol = {
                'Overview':'OV','Futures Markets':'MK','ICT Academy':'AC','Entry Models':'EM',
                'Sessions & Calendar':'SC','Futures News':'NW','Volume & Open Interest':'OI',
                'COT & Positioning':'CT','Contract Specs & Expiry':'SP','Strategy Lab':'SL',
                'Risk & Prop Firms':'RK','Journal & Watchlists':'JW','Data Health & Sources':'DH'
            }[label]
            current_attr = ' aria-current="page"' if is_active else ''
            items.append(
                f'<a class="os-nav-link{" is-active" if is_active else ""}" href="{href}"{current_attr} title="{escape(label)}">'
                f'<span class="os-nav-symbol" aria-hidden="true">{symbol}</span>'
                f'<span class="os-nav-label">{escape(label)}</span></a>'
            )
        groups.append(f'<div class="os-nav-group"><span class="os-nav-group-label">{group}</span>{"".join(items)}</div>')
    return (
        '<aside class="os-sidebar" id="appSidebar" aria-label="Primary navigation">'
        '<a class="os-sidebar-brand" href="/" aria-label="Futures Intelligence OS overview">'
        '<span class="brand-mark">FI</span><span class="os-brand-copy"><b>FUTURES INTELLIGENCE OS</b><small>RESEARCH WORKSPACE</small></span></a>'
        f'<nav class="os-sidebar-nav" aria-label="13 futures product areas">{"".join(groups)}</nav>'
        '<div class="os-sidebar-foot"><span class="os-foot-dot"></span><span class="os-foot-copy">RESEARCH MODE · NO BROKER EXECUTION</span></div>'
        '</aside>'
    )


def load(path, default=None):
    try: return json.loads(path.read_text(encoding='utf-8'))
    except Exception: return default

def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

def json_script(value):
    return json.dumps(value, ensure_ascii=False).replace('</', '<\\/')


def shell(title, description, body, canonical_path='/', extra_head='', right_panel=''):
    canonical = f'<link rel="canonical" href="{escape(SITE_URL + canonical_path)}">' if SITE_URL else '<meta name="robots" content="noindex,follow">'
    og_url = escape(SITE_URL + canonical_path) if SITE_URL else ''
    speed_insights = '<script>window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };</script><script defer src="/_vercel/speed-insights/script.js"></script>'
    area = escape(current_area(canonical_path))
    right_class = ' has-context-panel' if right_panel else ''
    content = f'<div class="os-content-grid{right_class}"><div class="os-page-body">{body}</div>{right_panel}</div>'
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description)}">{canonical}
<meta property="og:type" content="website"><meta property="og:title" content="{escape(title)}"><meta property="og:description" content="{escape(description)}"><meta property="og:image" content="{escape((SITE_URL + '/assets/social-card.png') if SITE_URL else '/assets/social-card.png')}"><meta property="og:url" content="{og_url}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="/assets/social-card.png">
<link rel="icon" href="/icon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/assets/site-shell.css"><script defer src="/assets/runtime-config.js"></script>{speed_insights}{extra_head}</head>
<body class="os-dark"><a class="skip" href="#content">Skip to content</a>
<div class="os-app-shell" data-os-shell>
{nav_markup(canonical_path)}<div class="os-sidebar-scrim" id="sidebarScrim" hidden></div>
<div class="os-main-column"><header class="os-topbar">
<div class="os-topbar-start"><button class="os-sidebar-toggle" id="sidebarToggle" type="button" aria-expanded="true" aria-controls="appSidebar" aria-label="Collapse navigation"><span aria-hidden="true">☰</span></button><div class="os-topbar-heading"><span>FUTURES INTELLIGENCE OS</span><b>{area}</b></div></div>
<div class="os-topbar-actions"><span class="os-mode-chip"><i></i> RESEARCH ONLY</span><button class="os-theme-toggle" id="osThemeToggle" type="button" aria-pressed="false" aria-label="Switch to light theme" title="Switch theme">☼</button><a class="os-workspace-link" href="/account/">Private workspace <span aria-hidden="true">↗</span></a></div>
</header><main id="content" class="os-content">{content}</main>
<footer class="os-footer"><div><b>Futures Intelligence OS</b><span>Exchange-listed futures research · ICT Futures education</span></div><div class="os-footer-links"><a href="/data-health/">Data Health &amp; Sources</a><a href="/status/">Platform status</a><a href="/docs/">Documentation</a><a href="/ict-futures/">ICT Futures terminal</a></div><small>Public-source frequency, freshness, contract verification and licensing boundaries apply. No broker execution is connected.</small></footer>
</div></div><script src="/assets/site-shell.js" defer></script></body></html>'''

def page_intro(kicker, title, desc, stats=''):
    return f'<section class="page-hero"><p class="kicker">{escape(kicker)}</p><h1>{escape(title)}</h1><p>{escape(desc)}</p>{stats}</section>'


def card(title, desc, href, eyebrow='Explore', tag=''):
    tag_html = f"<span class='card-tag'>{escape(tag)}</span>" if tag else ''
    return f'<a class="module-card" href="{escape(href)}"><span class="card-eyebrow">{escape(eyebrow)}</span><h3>{escape(title)}</h3><p>{escape(desc)}</p><span class="card-cta">Open module →</span>{tag_html}</a>'

def redirect_page(title, target):
    absolute = SITE_URL + target if SITE_URL else target
    safe = escape(absolute, quote=True)
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>{escape(title)}</title><link rel="canonical" href="{safe}"><meta http-equiv="refresh" content="0;url={safe}"></head><body><p>{escape(title)}. <a href="{safe}">Continue</a>.</p><script>location.replace({json_script(absolute)});</script></body></html>'''


def contract_value(value):
    if value is None or value == '':
        return '<span class="os-unverified-value">Not in source registry</span>'
    if isinstance(value, (int, float)):
        rendered = f'{value:.8g}'
    else:
        rendered = str(value)
    return f'<strong>{escape(rendered)}</strong><span class="os-unverified-value">UNVERIFIED IMPORTED REFERENCE</span>'



def wrap_standalone_shell(path, current_path, kind):
    if not path.exists(): return
    html = path.read_text(encoding='utf-8', errors='replace')
    if 'data-os-shell' in html: return
    sidebar = nav_markup(current_path)
    css_link = '<link rel="stylesheet" href="/assets/site-shell.css">'
    js_link = '<script defer src="/assets/site-shell.js"></script>'
    if '</head>' in html and css_link not in html:
        html = html.replace('</head>', css_link + '</head>', 1)
    if kind == 'ict':
        html = html.replace('<body>', '<body class="dark os-ict-terminal">', 1)
        html = html.replace('<body class="dark os-ict-terminal">', '<body class="dark os-ict-terminal"><div class="os-app-shell os-ict-shell" data-os-shell>' + sidebar + '<div class="os-sidebar-scrim" id="sidebarScrim" hidden></div><div class="os-main-column">', 1)
        html = html.replace("if(localStorage.getItem('ictfos.theme')==='dark')document.body.classList.add('dark');", "if(localStorage.getItem('ictfos.theme')==='light')document.body.classList.remove('dark');else document.body.classList.add('dark');")
        html = html.replace('<div class="wrap topbar-inner">', '<div class="wrap topbar-inner"><button class="os-sidebar-toggle" id="sidebarToggle" type="button" aria-expanded="true" aria-controls="appSidebar" aria-label="Collapse navigation">☰</button>', 1)
        # Retain the terminal's own theme preference/toggle and its anchor-based secondary navigation.
        html = html.replace('</body>', '</div></div>' + js_link + '</body>', 1)
    elif kind == 'desk':
        html = html.replace('<body>', '<body class="os-dark os-futures-desk">', 1)
        html = html.replace('<body class="os-dark os-futures-desk">', '<body class="os-dark os-futures-desk"><div class="os-app-shell os-desk-shell" data-os-shell>' + sidebar + '<div class="os-sidebar-scrim" id="sidebarScrim" hidden></div><div class="os-main-column">', 1)
        html = html.replace('<div class="head-inner">', '<div class="head-inner"><button class="os-sidebar-toggle" id="sidebarToggle" type="button" aria-expanded="true" aria-controls="appSidebar" aria-label="Collapse navigation">☰</button>', 1)
        html = re.sub(r'<nav class="topnav"[^>]*>.*?</nav>', '', html, count=1, flags=re.S)
        html = re.sub(r'<nav class="mobile-nav"[^>]*>.*?</nav>', '', html, count=1, flags=re.S)
        html = html.replace('<a class="fi-ict-link"', '<button class="os-theme-toggle" id="osThemeToggle" type="button" aria-pressed="false" aria-label="Switch to light theme" title="Switch theme">☼</button><a class="fi-ict-link"', 1)
        html = re.sub(r'<button class="menu-toggle" id="menuToggle"[^>]*>.*?</button>', '', html, count=1, flags=re.S)
        html = html.replace('</body>', '</div></div>' + js_link + '</body>', 1)
    path.write_text(html, encoding='utf-8')



def build():
    if DIST.exists(): shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    # Copy repository files except dev-only/legacy archive material.
    for name in ['index.html','resources.json','icon.svg','manifest.webmanifest','sw.js','assets','ict-futures','futures-intelligence','docs','README.md','SECURITY.md','LICENSE','.well-known']:
        src=ROOT/name
        if not src.exists(): continue
        dst=DIST/name
        if src.is_dir(): shutil.copytree(src,dst,dirs_exist_ok=True)
        else: shutil.copy2(src,dst)
    obsolete_prediction_client = DIST/'assets/prediction-markets.js'
    if obsolete_prediction_client.exists(): obsolete_prediction_client.unlink()
    # Apply the shared app shell to the two standalone terminal applications after copying their sources.
    wrap_standalone_shell(DIST/'futures-intelligence/index.html', '/futures-intelligence/', 'desk')
    wrap_standalone_shell(DIST/'ict-futures/index.html', '/academy/', 'ict')
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
    # Futures Command Center source is the maintained root index.html.
    home = (DIST/'index.html').read_text(encoding='utf-8')
    if SITE_URL:
        canonical = f'<link rel="canonical" href="{escape(SITE_URL + "/")}">'
        if 'rel="canonical"' not in home: home = home.replace('</head>', canonical + '</head>', 1)
        if 'property="og:image"' not in home: home = home.replace('</head>', '<meta property="og:image" content="' + escape(SITE_URL + '/assets/social-card.png') + '"></head>', 1)
    elif '<meta name="robots" content="noindex,follow">' not in home:
        home = home.replace('</head>', '<meta name="robots" content="noindex,follow"></head>', 1)
    (DIST/'index.html').write_text(home, encoding='utf-8')

    # Generate app routes from source datasets.
    resources = load(ROOT/'resources.json',{}).get('resources',[])
    mdata = load(ROOT/'ict-futures/data/market-universe.json',{}).get('markets',[])
    academy_data = load(ROOT/'ict-futures/data/ict-academy.json',{})
    academy = academy_data.get('concepts',[])
    build_academy(DIST, academy_data, SITE_URL)
    news = load(ROOT/'data/news-snapshot.json',{})

    # Contract specification and expiry reference. Imported values stay explicitly unverified.
    contract_cards=[]
    for m in mdata:
        official=str(m.get('specsUrl') or '')
        official_link=f'<a class="os-source-link" href="{escape(official, quote=True)}" target="_blank" rel="noopener noreferrer">Official exchange specification ↗</a>' if official.startswith(('https://','http://')) else '<span class="muted">Official specification link not supplied</span>'
        specs=[
            ('Tick size',contract_value(m.get('tickSize'))),
            ('Tick value',contract_value(m.get('tickValue'))),
            ('Point value',contract_value(m.get('pointValue'))),
            ('Expiry / first notice','<span class="os-unverified-value">NOT SUPPLIED IN REGISTRY</span>'),
        ]
        spec_rows=''.join(f'<div class="os-spec-field"><span>{label}</span>{value}</div>' for label,value in specs)
        contract_cards.append(
            f'<article id="{escape(str(m.get("id","")))}" class="os-contract-spec-card"><div class="os-contract-spec-head"><div><span class="os-eyebrow">{escape(str(m.get("exchange","Exchange")))} · {escape(str(m.get("tier","")))}</span><h3>{escape(str(m.get("label","Futures family")))}</h3></div><span class="os-state-chip warn">UNVERIFIED</span></div>'
            f'<div class="os-spec-grid">{spec_rows}</div><div class="os-contract-spec-source">{official_link}</div></article>'
        )
    body=page_intro('Contract reference registry','Contract Specs & Expiry','Imported contract reference values are shown for traceability only. They have not been independently reconciled against the current exchange rulebook in this UI phase. Expiry, first-notice and roll dates are not present in the current registry.')
    body+='<section class="content-section os-contract-warning"><h2>Verification required before trading</h2><p>Tick size, tick value and point value below are unverified imported references. Contract months, first notice, last trade date and roll schedule are not supplied. Confirm the active contract and current exchange specification before calculating risk or placing any trade.</p></section>'
    body+='<section class="os-contract-spec-grid">'+''.join(contract_cards)+'</section>'
    body+='<section class="content-section"><h2>Contract lifecycle coverage</h2><p><span class="os-state-chip warn">NOT CONFIGURED</span> No verified expiry calendar, first-notice-date table or automated roll alert is connected. The page does not infer a front month from a continuous chart symbol.</p><a class="text-link" href="/data-health/">Review data and source status →</a></section>'
    write(DIST/'contract-specs/index.html',shell('Contract Specs & Expiry | Futures Intelligence OS','Futures contract reference registry with explicit verification status and expiry-data coverage.',body,'/contract-specs/'))

    # Existing session and calendar tools are reused from the ICT Futures terminal.
    write(DIST/'sessions/index.html',redirect_page('Sessions & Calendar tools are available in the ICT Futures terminal','/ict-futures/#sessions'))

    # Markets
    cards=''.join(card(m.get('label',m.get('name',m.get('id','Market'))),m.get('role',m.get('note','Market context and research links.')),f"/ict-futures/markets/{m.get('id','')}.html",m.get('exchange','Market profile'),m.get('tier','')) for m in mdata)
    body=page_intro('Listed futures universe','Futures markets','Explore the 15 retained futures contract families. CME currency and Bitcoin futures remain in scope. Verify current exchange specifications before trading.')
    body+=f'<section class="content-section"><div class="section-top"><div><span class="kicker">ICT futures universe</span><h2>Contract profiles</h2><p>15 futures families retained from the supplied 3.0 source dataset.</p></div><a class="text-link" href="/ict-futures/">Open full futures terminal →</a></div><div class="card-grid">{cards}</div></section>'
    body+=f'<section class="content-section"><h2>Contract data quality rules</h2><p>Tick size, tick value, multiplier, expiry, first notice and session hours are reference values only until independently reconciled with the official exchange specification and date-stamped. No broker margin is inferred.</p></section>'
    write(DIST/'markets/index.html',shell('Futures Markets | Futures Intelligence OS','Explore 15 futures families across equity-index, rates, currency, metals, energy and CME Bitcoin futures.',body,'/markets/'))

    # P3 Academy dashboard: all 76 lessons, learning tracks, tutorials and progress.
    program=academy_data.get('learningProgram',{})
    tutorials=program.get('tutorials',[])
    tracks=academy_data.get('tracks',[])
    concept_by_name={c.get('name'):c for c in academy}
    track_cards=[]
    for i,t in enumerate(tracks):
        ids=[concept_by_name[n]['id'] for n in t.get('sequence',[]) if n in concept_by_name]
        first=ids[0] if ids else ''
        track_cards.append(
            f'<article class="academy-track-card"><span class="badge">PATH {i+1} · {escape(str(t.get("level","Study")))}</span>'
            f'<h3>{escape(str(t.get("name","Learning track")))}</h3><p>{escape(str(t.get("description","")))}</p>'
            f'<p>{len(ids)} sequenced lessons</p>'
            f'<a href="/ict-futures/academy/{escape(first)}.html">Start path →</a></article>'
        )
    tutorial_cards=[]
    for t in tutorials:
        slug=str(t.get('id',''))
        tutorial_cards.append(
            f'<article class="academy-tutorial-card"><span class="badge">{escape(str(t.get("level","Tutorial")))} · {escape(str(t.get("duration","")))}'
            f'</span><h3>{escape(str(t.get("title","Guided tutorial")))}</h3><p>{escape(str(t.get("objective","")))}</p>'
            f'<a href="/ict-futures/academy/tutorials/{escape(slug)}.html">Open tutorial →</a></article>'
        )
    catalog_cards=[]
    for c in academy:
        slug=str(c.get('id',''))
        searchable=' '.join([str(c.get('name','')),str(c.get('category','')),str(c.get('definition','')),str(c.get('evidence',''))]).lower()
        catalog_cards.append(
            f'<article class="academy-catalog-card" data-academy-card data-search="{escape(searchable,quote=True)}" '
            f'data-category="{escape(str(c.get("category","")),quote=True)}" data-level="{escape(str(c.get("level","")),quote=True)}">'
            f'<span class="badge">{escape(str(c.get("level","Study")))} · {escape(str(c.get("category","ICT")))}</span>'
            f'<h3>{escape(str(c.get("name","Lesson")))}</h3><p>{escape(str(c.get("definition","")))}</p>'
            f'<small class="muted">{escape(str(c.get("evidence","")))}</small><p><a href="/ict-futures/academy/{escape(slug)}.html">Study lesson →</a></p></article>'
        )
    categories=sorted({str(c.get('category','ICT')) for c in academy})
    category_options=''.join(f'<option value="{escape(c,quote=True)}">{escape(c)}</option>' for c in categories)
    body=page_intro('Education library','ICT Academy',
        'A structured study program with 76 guided concept lessons, 9 practice tutorials, 7 learning tracks, worked examples, replay assignments, knowledge checks and source-labelled references.',
        f'<div class="stats-row"><b>{len(academy)}</b><span>Guided lessons</span><b>{len(tutorials)}</b><span>Practice tutorials</span><b>{len(tracks)}</b><span>Learning tracks</span></div>')
    body+='<section class="academy-progress-summary"><strong data-academy-global-progress>0 / 76 lessons completed</strong><span id="academyProgressMeta">Progress is saved on this device and syncs to your account when signed in.</span></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Guided practice tutorials</h2><p>Step-by-step chart workbooks, deliverables and review criteria.</p></div><a class="text-link" href="/ict-futures/academy/tutorials/">Open all tutorials →</a></div><div class="academy-course-grid">'+''.join(tutorial_cards)+'</div></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Seven learning tracks</h2><p>Follow the recommended lesson order from foundational chart reading to advanced research terms.</p></div></div><div class="academy-course-grid">'+''.join(track_cards)+'</div></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>76-concept lesson catalogue</h2><p>Each lesson has objectives, walkthrough, worked example, a chart-replay assignment, knowledge check and references.</p></div></div>'
    body+='<div class="academy-filter"><input id="academySearch" type="search" placeholder="Search concepts, definitions, or evidence labels"><select id="academyCategory"><option value="">All categories</option>'+category_options+'</select><select id="academyLevel"><option value="">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select><span class="muted" id="academyCount"></span></div>'
    body+='<div class="academy-catalog-grid" id="academyCatalog">'+''.join(catalog_cards)+'</div></section>'
    body+='<section class="content-section"><h2>Reference standards</h2><p>Official ICT uploads are linked directly only where the source catalogue already verifies the concept match. Other YouTube links are topic searches for discovery. CME and CFTC references provide general market mechanics and risk education; they are not ICT certification or proof of strategy edge.</p><div class="source-notes"><a href="https://www.youtube.com/@InnerCircleTrader" target="_blank" rel="noopener noreferrer">Official ICT channel ↗</a><a href="https://www.youtube.com/@InnerCircleTrader/playlists" target="_blank" rel="noopener noreferrer">Official ICT playlists ↗</a><a href="https://www.cmegroup.com/education/courses/trade-and-risk-management" target="_blank" rel="noopener noreferrer">CME risk education ↗</a><a href="https://www.cftc.gov/LearnAndProtect" target="_blank" rel="noopener noreferrer">CFTC customer education ↗</a></div></section>'
    write(DIST/'academy/index.html',shell('ICT Academy | Futures Intelligence OS','76 complete concept lessons, guided ICT tutorials, chart exercises, knowledge checks, progress tracking and source references.',body,'/academy/', '<script defer src="/assets/academy-catalog.js"></script>'))

    # Macro indicators: official BLS historical observations via the edge gateway.
    body=page_intro('Official macro data','US inflation & labour indicators','Five series from the US Bureau of Labor Statistics Public Data API v1. Values are published historical observations with their own index bases and units; they are not live market quotes or a complete economic calendar.')
    body += """<section class="content-section"><div class="section-top"><div><h2>BLS macro dashboard</h2><p>API cache refreshes on demand and expires after six hours.</p></div><button class="primary-button" id="macroRefresh">Load / update BLS snapshot</button></div><div id="macroState" class="muted">Loading provider data…</div><div id="macroSeries" class="macro-grid"></div></section><section class="content-section"><h2>Method and limitations</h2><p>Version 1 of the BLS API is public without registration, with a documented limit of 25 series per request and up to 10 years of observations. It returns historical observations and can lag the original release; release time/calendar data are separate. Do not combine different index base units or infer market direction from a single series.</p><div class="source-notes"><a href="https://www.bls.gov/developers/api_signature.htm" target="_blank" rel="noopener noreferrer">BLS API signatures ↗</a><a href="https://www.bls.gov/bls/news-release/home.htm" target="_blank" rel="noopener noreferrer">BLS release calendar ↗</a><a href="https://www.bls.gov/developers/api_faqs.htm" target="_blank" rel="noopener noreferrer">BLS API FAQ ↗</a></div></section>"""
    body+='<section class="content-section"><div class="section-top"><div><h2>Additional official macro &amp; rates providers</h2><p>BEA, EIA, FRED, US Treasury and ECB historical observations with provider-specific units, retrieval times and database persistence state.</p></div><button id="economicRefresh" class="primary-button">Refresh economic providers</button></div><p id="economicState" class="muted">Checking provider availability…</p><div id="economicProviders" class="economic-provider-grid"><div class="loading-state">Loading historical provider snapshots…</div></div></section>'
    body+='<section class="content-section"><h2>Economic release calendar</h2><p><span class="status-pill warn">CALENDAR AGGREGATION · NOT CONNECTED</span></p><p>The current macro adapter provides published historical BLS observations, not a consolidated upcoming-release calendar or consensus/actual feed. Until official release schedules and additional source adapters are integrated, use the primary agency calendars below and verify all release times in the publisher timezone.</p><div class="source-notes"><a href="https://www.bls.gov/schedule/news_release/" target="_blank" rel="noopener noreferrer">BLS release schedule ↗</a><a href="https://www.bea.gov/news/schedule" target="_blank" rel="noopener noreferrer">BEA release schedule ↗</a><a href="https://www.eia.gov/petroleum/supply/weekly/" target="_blank" rel="noopener noreferrer">EIA weekly petroleum status ↗</a></div></section>'
    write(DIST/'macro/index.html',shell('US Macro Indicators | Futures Intelligence OS','Official BLS, BEA, EIA, FRED, Treasury and ECB historical observations with source labels, units and retrieval times.',body,'/macro/', '<script defer src="/assets/macro-page.js"></script><script defer src="/assets/economic-data.js"></script>'))

    # COT / institutional positioning.
    body=page_intro('Institutional positioning','CFTC Commitments of Traders','Query CFTC Public Reporting Environment datasets: TFF Futures Only for financial futures or Disaggregated Futures Only for covered commodity markets. COT is a weekly report with Tuesday positions published on Friday; it is not intraday positioning.')
    body += """<section class="content-section"><div class="section-top"><div><h2>Latest COT records</h2><p>Cached public CFTC API response. Search a contract name such as Nasdaq, S&P, Gold, Crude Oil or Euro FX.</p></div><button class="primary-button" id="cotRefresh">Load latest CFTC snapshot</button></div><div class="cot-controls"><button class="cot-toggle active" data-cot-report="tff" type="button">TFF · Financial futures</button><button class="cot-toggle" data-cot-report="disaggregated" type="button">Disaggregated · Commodities</button><input class="search-input" id="cotSearch" type="search" placeholder="Filter by market or code"><span class="muted" id="cotCount"></span></div><p class="muted" id="cotState">Loading CFTC data…</p><div class="table-wrap"><table class="cot-table"><thead><tr><th>Contract market</th><th>Report date</th><th>Open interest</th><th>Long</th><th>Short</th><th>Net</th></tr></thead><tbody id="cotRows"><tr><td colspan="6">Loading CFTC snapshot…</td></tr></tbody></table></div></section><section class="content-section"><h2>Interpretation and data caveats</h2><p>For TFF, the default net calculation uses the Leveraged Money category. For the Disaggregated report, it uses Managed Money. These are report categories, not a complete view of all market participants. Check the underlying row fields and report type before interpretation. Positions are aggregated and reported with a time lag.</p><div class="source-notes"><a href="https://publicreporting.cftc.gov/Commitments-of-Traders/TFF-Futures-Only/gpe5-46if" target="_blank" rel="noopener noreferrer">Official TFF futures-only dataset ↗</a><a href="https://publicreporting.cftc.gov/w/72hh-3qpy/default" target="_blank" rel="noopener noreferrer">Official Disaggregated dataset ↗</a><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC COT reports ↗</a><a href="https://publicreporting.cftc.gov/stories/s/Public-Reporting-FAQ/inwp-fmhz/" target="_blank" rel="noopener noreferrer">CFTC PRE FAQ ↗</a></div></section>"""
    write(DIST/'research/positioning/index.html',shell('CFTC COT Positioning | Futures Intelligence OS','Fetch official CFTC Public Reporting Environment futures-only TFF and Disaggregated positioning datasets.',body,'/research/positioning/', '<script defer src="/assets/cot-page.js"></script>'))

    # Futures-only source directory. Root resources.json is the reviewed public allowlist.
    source_categories = load(ROOT/'resources.json',{}).get('categories',[])
    body=page_intro('Exchange and research references','Futures source directory','A reviewed directory of exchange, regulator, macro, futures-news and ICT education sources. Inclusion is not a licence grant or a promise of free real-time market data.',f'<div class="stats-row"><b>{len(resources)}</b><span>Futures-relevant sources</span><b>{len(source_categories)}</b><span>Categories</span></div>')
    body+='<div class="filter-row"><input id="resourceSearch" class="search-input" type="search" placeholder="Search futures exchanges, CFTC, macro or ICT sources"><select id="resourceCategory" class="search-input"><option value="">All categories</option></select><span id="resourceCount" class="muted"></span></div><div id="resourceCards" class="directory-grid"></div>'
    write(DIST/'sources/index.html',shell('Futures Sources | Futures Intelligence OS','Reviewed futures exchange, regulator, macro, news and ICT education source directory.',body,'/sources/', '<script defer src="/assets/research-directory.js"></script>'))
    write(DIST/'research/index.html',redirect_page('Research directory moved','/sources/'))

    # News room
    articles=news.get('articles',[]) if isinstance(news,dict) else []
    nstatus=news.get('status','not-yet-fetched') if isinstance(news,dict) else 'not-yet-fetched'
    body=page_intro('Futures news intelligence','Futures headlines & catalysts','Futures-focused source discovery across exchange releases, macro, rates, metals, energy and listed currency/Bitcoin futures. Aggregated discovery is a research lead, not verified fact or a trading signal.')
    body+=f'<section class="status-panel"><div><span class="status-label">Snapshot status</span><strong>{escape(str(nstatus).upper())}</strong></div><div><span class="status-label">Stored articles</span><strong>{len(articles)}</strong></div><p>Last check: {escape(str(news.get("lastCheckedAt") or "Not yet fetched"))}</p><p>Provider: {escape(str(news.get("provider") or "GDELT DOC API"))}</p></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Curated headlines</h2><p>Last saved snapshot. Each item opens its original publisher.</p></div><button class="primary-button" id="refreshNews">Refresh news snapshot</button></div><div class="news-grid" id="newsGrid"></div><p id="newsState" class="muted"></p></section><section class="content-section"><h2>Search external sources</h2><p>Use the ICT Futures terminal for contract-specific news and public research links.</p><a class="text-link" href="/ict-futures/#news">Open full Finance research desk →</a></section>'
    write(DIST/'news/index.html',shell('Futures News | Futures Intelligence OS','Futures news discovery with source traceability, retrieval times and provider status.',body,'/news/', '<script defer src="/assets/news-page.js"></script>'))

    # Volume & Open Interest: weekly futures-only CFTC OI, with exchange volume explicitly unavailable.
    voi_options = ''.join(f'<option value="{escape(m.get("id",""))}">{escape(m.get("label",""))}</option>' for m in mdata)
    body=page_intro('Market participation data','Volume & Open Interest','A contract-aware participation research area. Weekly open interest is sourced from CFTC futures-only reports where the selected contract is covered. Daily exchange volume is deliberately withheld until a verified provider and redistribution basis are connected.')
    body+='<section class="voi-control-panel"><div class="voi-controls"><label>Futures family<select id="voiMarket">'+voi_options+'</select></label><label>CFTC market label<select id="voiInstrument" disabled><option>Loading contract rows…</option></select></label><button id="voiRefresh" class="primary-button">Refresh weekly OI</button></div><div class="voi-source-row"><span id="voiStatus" class="status-pill warn">WAITING</span><span id="voiReport">CFTC report</span><a id="voiSource" href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">Official CFTC dataset ↗</a></div><p id="voiRetrieved" class="muted">Waiting for the provider response…</p></section>'
    body+='<section class="voi-metric-grid"><article class="voi-metric"><span>Latest open interest</span><strong id="voiLatest">—</strong><small id="voiAsOf">No report date yet</small></article><article class="voi-metric"><span>Week-on-week change</span><strong id="voiChange">—</strong><small>Change in reported open-interest contracts</small></article><article class="voi-metric"><span>Historical coverage</span><strong id="voiRange">—</strong><small>Latest available rows in this CFTC dataset</small></article><article class="voi-metric unavailable"><span>Exchange trading volume</span><strong>Not connected</strong><small>Daily / intraday volume is not supplied by the COT adapter</small></article></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Weekly open-interest history</h2><p id="voiMarketName">Select a market to load the CFTC series.</p></div><span class="data-pill">WEEKLY · CFTC REPORT</span></div><div id="voiState" class="data-message">Waiting for data…</div><div id="voiChart" class="oi-chart"><div class="loading-state">Loading open-interest history…</div></div><div class="fine-print">Each bar represents a reported weekly open-interest observation for one specific CFTC market label. It is not daily trading volume, open contracts on a broker, or order-book depth.</div></section>'
    body+='<section class="content-section"><div class="section-top"><div><h2>Reported weekly observations</h2><p>Newest report first. No synthetic values or interpolation are used.</p></div><span id="voiCount" class="muted">— rows</span></div><div class="table-wrap"><table class="cot-table"><thead><tr><th>Report date</th><th>Open interest</th><th>Week change</th><th>Source market label</th></tr></thead><tbody id="voiTable"><tr><td colspan="4">No data loaded.</td></tr></tbody></table></div></section>'
    body+='<section class="content-section"><h2>Coverage and licensing boundary</h2><p>CFTC COT is a weekly positioning report and can provide reported open interest for covered futures-only markets. It does not provide the exchange daily volume series required for intraday volume profiles, volume delta, or session volume. Those require a separate official exchange feed or a licensed market-data provider. The UI will not substitute prediction-market volume, spot volume or a generic chart-widget value.</p><div class="source-notes"><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC Commitments of Traders ↗</a><a href="https://www.cmegroup.com/market-data.html" target="_blank" rel="noopener noreferrer">CME market data ↗</a><a href="https://www.ice.com/market-data" target="_blank" rel="noopener noreferrer">ICE market data ↗</a></div></section>'
    write(DIST/'volume-open-interest/index.html',shell('Futures Volume & Open Interest | Futures Intelligence OS','Contract-aware weekly open-interest history with explicit source and daily volume availability.',body,'/volume-open-interest/', '<script defer src="/assets/volume-open-interest.js"></script>'))

    # Retire the former event-market route without exposing its UI or endpoint consumers.
    write(DIST/'prediction-markets/index.html',redirect_page('This product area has been retired','/'))

    # Entry model library. Educational records only; no performance ranking without verified backtests.
    entry_models=[c for c in academy if c.get('category')=='Entry Models']
    model_cards=''.join(card(c.get('name','Entry model'),c.get('definition',''),f"/ict-futures/academy/{c.get('id','')}.html",c.get('level','ICT concept'),'PLAYBOOK') for c in entry_models)
    body=page_intro('ICT playbook library','Entry Models','Eight preserved entry-model concepts from the ICT Academy source catalogue. These are educational playbooks, not a ranked signal service or evidence of a profitable edge.',f'<div class="stats-row"><b>{len(entry_models)}</b><span>Model concepts</span><b>0</b><span>Verified model performance rankings</span></div>')
    body+='<section class="content-section"><div class="section-top"><div><h2>Model catalogue</h2><p>Open each lesson for its definition, conditions, use cases, invalidation and common mistakes.</p></div><a class="text-link" href="/academy/">Browse all Academy concepts ↗</a></div><div class="card-grid">'+model_cards+'</div></section>'
    body+='<section class="content-section"><h2>Performance evidence policy</h2><p>No model is labelled “best” until its rules are operationally defined and tested on timestamped historical data with commissions, slippage, contract rolls, survivorship controls and out-of-sample validation. The eight models have no audited win-rate, expectancy, profit-factor or drawdown ranking yet.</p></section>'
    write(DIST/'entry-models/index.html',shell('ICT Entry Models | Futures Intelligence OS','Eight ICT entry-model concepts with educational playbook links and no unsupported performance claims.',body,'/entry-models/'))

    # P4 Strategy Lab: deterministic signal-driven futures backtesting.
    body=page_intro('Research & validation','Strategy Lab','Run a reproducible, cost-aware backtest from timestamped futures OHLC bars and explicit candle-close signals. The engine does not fabricate ICT signals or publish strategy rankings.')
    body+='''
<section class="strategy-lab-wrap">
  <section class="strategy-hero">
    <div><span class="eyebrow">P4 · REPRODUCIBLE RESEARCH</span><h2>Test the rule set, not the story.</h2><p>Upload a historical OHLC CSV with LONG / SHORT / FLAT signals. Signals are evaluated at the source-bar close and entries occur at the next bar open. Commission, slippage, risk sizing, conservative stop handling and chronological holdout testing are explicit run inputs.</p></div>
    <aside class="strategy-state"><span class="status-pill warn">USER-SUPPLIED DATA REQUIRED</span><strong>No preloaded strategy performance</strong><span>Existing ICT model pages are descriptions, not executable rule engines. No win rate, expectancy or model ranking is invented.</span></aside>
  </section>
  <div class="strategy-grid">
    <section class="strategy-panel">
      <h3>01 · Dataset &amp; model</h3><p>Use one futures expiry series per run. The uploaded file stays in this browser; only its hash, manifest and completed trade ledger can sync to your private account.</p>
      <div class="strategy-file-zone">
        <label>Historical signal CSV<br><input id="strategyCsv" type="file" accept=".csv,text/csv"></label>
        <div id="strategyFileMeta" class="strategy-file-meta">No file selected. Minimum 30 timestamped bars; maximum 250,000 bars / 50 MB.</div>
        <div id="strategyDataQuality" class="strategy-quality">Required columns: timestamp, open, high, low, close, signal. Timestamps need Z or an explicit UTC offset.</div>
        <p><a class="text-link" href="/strategy-lab/backtest-input-template.csv" download>Download CSV header template →</a></p>
      </div>
      <div class="strategy-form-grid" style="margin-top:12px">
        <label>Strategy name<input id="strategyName" type="text" value="My rule-based ICT setup" maxlength="120"></label>
        <label>ICT model / research type<select id="modelId">
          <option value="custom">Custom / other</option><option value="ict-2022-model">ICT 2022 Model</option><option value="liquidity-sweep-mss-model">Liquidity Sweep + MSS</option><option value="silver-bullet">Silver Bullet</option><option value="judas-mss">Judas + MSS</option><option value="unicorn">Unicorn</option><option value="fvg-continuation-model">FVG Continuation</option><option value="ifvg-reversal-model">IFVG</option><option value="fvg-ote-confluence-model">FVG + OTE</option>
        </select></label>
        <label>Market / contract symbol<input id="marketSymbol" type="text" placeholder="e.g. ESZ6, GCZ6" maxlength="80" required></label>
        <label>Bar timeframe<input id="timeframe" type="text" placeholder="e.g. 1m, 5m, 15m" maxlength="30" required></label>
        <label>Timestamp / session timezone<input id="timezone" type="text" value="America/Chicago" maxlength="80"></label>
        <label>Series type<select id="seriesType"><option value="single-expiry">Single expiry contract</option><option value="back-adjusted-continuous">Back-adjusted continuous</option></select></label>
        <label id="rollNoteWrap" class="strategy-wide strategy-hidden">Roll / adjustment method and source<input id="rollNote" type="text" placeholder="Describe roll dates, adjustment method and vendor source" maxlength="500"></label>
        <label class="strategy-wide">Signal-generation rule / source note<textarea id="signalSourceNotes" rows="2" placeholder="Describe the causal rule and where signals were generated. Include Pine version, signal timestamp convention and any session filters."></textarea></label>
      </div>
    </section>
    <section class="strategy-panel">
      <h3>02 · Execution &amp; costs</h3><p>Tick size/value must match the uploaded contract and currency. The legacy contract catalogue is marked unverified; do not copy its figures without checking the current exchange specification.</p>
      <div class="strategy-form-grid">
        <label>Starting capital (USD)<input id="startingCapital" type="number" min="1" step="100" value="10000" required></label>
        <label>Risk per trade (%)<input id="riskPercent" type="number" min="0.01" max="20" step="0.01" value="1" required></label>
        <label>Maximum contracts<input id="maxContracts" type="number" min="1" step="1" value="5" required></label>
        <label>Tick size<input id="tickSize" type="number" min="0.00000001" step="any" placeholder="Verify exchange spec" required></label>
        <label>Tick value (USD / contract)<input id="tickValue" type="number" min="0.00000001" step="any" placeholder="Verify exchange spec" required></label>
        <label>Commission / contract / side (USD)<input id="commissionPerSide" type="number" min="0" step="0.01" placeholder="Enter broker + exchange fees" required></label>
        <label>Slippage (ticks / side)<input id="slippageTicks" type="number" min="0" step="1" value="1" required></label>
        <label>Stop distance (ticks)<input id="stopTicks" type="number" min="1" step="1" value="12" required></label>
        <label>Target reward / risk<input id="targetRR" type="number" min="0.1" step="0.1" value="2" required></label>
        <label>Maximum bars in trade<input id="maxBarsInTrade" type="number" min="1" step="1" value="60" required></label>
      </div>
      <div class="strategy-disclosure" style="margin-top:12px">Costs are applied per contract. Entry and stop/time-exit slippage are embedded in fill prices; commission is charged on both sides. A limit target is filled at its target price without queue or partial-fill simulation. Position size rounds down to whole contracts.</div>
    </section>
    <section class="strategy-panel">
      <h3>03 · Chronological holdout</h3><p>The data is split by time, not randomly. Each period starts flat with independent starting capital; no position is carried across period boundaries.</p>
      <div class="strategy-form-grid">
        <label>In-sample allocation (%)<input id="trainPercent" type="number" min="50" max="80" step="1" value="60" required></label>
        <label>Validation allocation (%)<input id="validationPercent" type="number" min="10" max="30" step="1" value="20" required></label>
      </div>
      <div class="strategy-disclosure" style="margin-top:12px"><b>Out-of-sample = remainder.</b> Keep this final segment untouched until rules and parameters are frozen. The tool does not optimize settings; inspecting OOS and then changing rules turns it into another in-sample period.</div>
      <div class="strategy-actions" style="margin-top:13px"><button id="runStrategy" class="strategy-run-button" type="button" disabled>Run reproducible backtest</button><span id="strategyRunMeta" class="strategy-help">Choose a valid CSV to enable the engine.</span></div>
      <p id="strategySyncStatus" class="strategy-sync-status" aria-live="polite">Runs stay local unless you sign in. Signed-in runs and trade ledgers sync to your user-owned Supabase tables.</p>
    </section>
    <section class="strategy-panel">
      <h3>04 · Method contract</h3>
      <ul class="strategy-help">
        <li>Signal is known only at its source candle close; entry is next-bar open.</li>
        <li>One position at a time; no pyramiding; no simultaneous reverse entry.</li>
        <li>If stop and target are both touched in one bar, stop is assumed first.</li>
        <li>Gaps through stops fill at the worse opening price plus configured slippage.</li>
        <li>Expectancy and net profit factor use P&amp;L after modeled costs.</li>
        <li>Drawdown uses bar-close mark-to-market equity with estimated exit costs reserved.</li>
        <li>Historical roll fills, margin, liquidity, market impact and broker-specific execution are not inferred.</li>
      </ul>
    </section>
  </div>
  <section id="strategyResults" class="strategy-results strategy-hidden">
    <div class="strategy-result-header"><div><p class="eyebrow">REPRODUCIBLE RUN RESULT</p><h2 id="strategyResultTitle">Strategy results</h2><p id="strategyResultFingerprint" class="strategy-code"></p></div><div class="strategy-actions"><button id="downloadManifest" type="button" class="strategy-secondary-button" disabled>Download manifest</button><button id="downloadTrades" type="button" class="strategy-secondary-button" disabled>Download trade ledger</button></div></div>
    <section class="strategy-panel"><div class="section-top"><div><h3>Out-of-sample holdout metrics</h3><p id="strategyOosNote" class="strategy-help">Final chronological segment.</p></div></div><div id="strategyOosMetrics" class="strategy-metric-grid"></div></section>
    <div id="strategySplitCards" class="strategy-split-grid"></div>
    <section class="strategy-panel"><h3>Full-sample context (descriptive only)</h3><div id="strategyOverallMetrics" class="strategy-metric-grid"></div><p class="strategy-help">Full sample includes all segments and must not replace the holdout result when judging generalisation.</p></section>
    <div class="strategy-grid">
      <section class="strategy-chart-panel"><h3>Full-sample equity curve · USD</h3><canvas id="strategyEquityChart" class="strategy-chart" role="img" aria-label="Backtest equity curve"></canvas><div class="strategy-chart-legend"><span><i style="background:#218d87"></i>Mark-to-market equity</span></div></section>
      <section class="strategy-chart-panel"><h3>Full-sample drawdown · USD</h3><canvas id="strategyDrawdownChart" class="strategy-chart" role="img" aria-label="Backtest drawdown"></canvas><div class="strategy-chart-legend"><span><i style="background:#c27e43"></i>Peak-to-current drawdown</span></div></section>
    </div>
    <section class="strategy-panel"><h3>Split comparison</h3><div id="strategySplitTable"></div></section>
    <section class="strategy-panel"><h3>Data, sample and execution warnings</h3><div id="strategyWarnings"></div></section>
  </section>
  <section class="strategy-panel"><h3>Recent runs on this device</h3><p>Local history stores fingerprints and summary metrics only. The original CSV remains with you; re-upload the identical file and match its SHA-256 to reproduce a run.</p><div id="strategyHistory" class="strategy-help">No local runs saved on this device yet.</div></section>
  <section class="strategy-panel"><h3>Evidence rules</h3><p>Win rate alone is not a decision metric. Review trade count, net expectancy, average R, net profit factor, drawdown size/duration, costs and out-of-sample stability together. Small samples, externally generated signals with look-ahead, unadjusted contract rolls, inaccurate tick values and omitted costs can invalidate results. A backtest is not a forecast or a guarantee of future performance.</p></section>
</section>
'''
    write(DIST/'strategy-lab/backtest-input-template.csv','timestamp,open,high,low,close,signal,stop_ticks,contract,volume\n')
    write(DIST/'strategy-lab/index.html',shell('Strategy Lab | Futures Intelligence OS','Reproducible futures signal backtesting with cost-aware expectancy, drawdown and chronological out-of-sample testing.',body,'/strategy-lab/', '<link rel="stylesheet" href="/assets/strategy-lab.css"><script type="module" defer src="/assets/strategy-lab.js"></script>'))

    # Independent provider and snapshot health dashboard.
    body=page_intro('Operational transparency','Sources & Data Health','Test the edge gateway and inspect each provider response independently. A successful cached API response is not necessarily a fresh upstream collection, and a configured credential is not proof of a healthy data feed.')
    body+='<section class="health-summary"><div><span class="status-pill warn">PROVIDER CHECKS</span><h2 id="healthHeadline">Connecting to the gateway…</h2><p id="healthLatency">Checks have not completed.</p></div><button id="healthRefresh" class="primary-button">Recheck providers</button></section>'
    body+='<p id="healthUpdated" class="muted">Provider states are loading.</p><section id="healthGrid" class="health-grid"><div class="loading-state">Checking independent provider endpoints…</div></section>'
    body+='<section class="content-section"><h2>How to read the status</h2><div class="health-legend"><span><i class="legend-dot good"></i> Fresh / partial response</span><span><i class="legend-dot warn"></i> Cached, not yet fetched or not configured</span><span><i class="legend-dot bad"></i> Unavailable / failed request</span></div><p>“Fresh” describes the gateway snapshot status reported by that API response. It does not mean exchange-real-time data. “Available on request” indicates a route or public provider capability, not a completed provider fetch. Supabase ingestion and Builder administration remain disabled unless the required server-side secrets are configured.</p></section>'
    body+='<section class="content-section"><h2>Source registry</h2><p>Prefer primary exchange, regulator, statistical agency and central-bank sources. Contract specification and market-data redistribution terms must be verified separately.</p><div class="source-notes"><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer">CFTC ↗</a><a href="https://www.bls.gov/developers/" target="_blank" rel="noopener noreferrer">BLS ↗</a><a href="https://fred.stlouisfed.org/docs/api/fred/" target="_blank" rel="noopener noreferrer">FRED ↗</a><a href="https://www.bea.gov/developers" target="_blank" rel="noopener noreferrer">BEA ↗</a><a href="https://www.eia.gov/opendata/" target="_blank" rel="noopener noreferrer">EIA ↗</a><a href="https://www.cmegroup.com/market-data.html" target="_blank" rel="noopener noreferrer">CME market data ↗</a><a href="https://www.ice.com/market-data" target="_blank" rel="noopener noreferrer">ICE market data ↗</a></div></section>'
    write(DIST/'data-health/index.html',shell('Sources & Data Health | Futures Intelligence OS','Independent gateway and provider snapshot health checks with provenance and freshness limitations.',body,'/data-health/', '<script defer src="/assets/data-health.js"></script>'))

    # Risk & Prop Firms. Keep /tools/ as a compatibility redirect.
    body=page_intro('Risk preparation','Risk & Prop Firms','Contract-aware position sizing and risk preparation. Imported tick references are unverified, broker margin is not estimated, and no prop-firm rulebook registry is currently connected.')
    body+='''<section class="content-section"><div class="section-top"><div><h2>Futures position size calculator</h2><p>Tick-based estimate; choose standard or micro size where the catalogue supplies a micro profile, then set account risk in USD.</p></div><span class="data-pill">ESTIMATE · NOT EXECUTION</span></div><div class="calc-grid"><label>Contract<select id="contract"></select></label><label>Account balance<input id="balance" type="number" min="0" value="10000"></label><label>Risk %<input id="riskPct" type="number" min="0.01" max="100" step="0.01" value="1"></label><label>Stop distance (ticks)<input id="stopTicks" type="number" min="1" value="20"></label><label>Target distance (ticks)<input id="targetTicks" type="number" min="1" value="60"></label><label>Round-turn commission / contract<input id="commission" type="number" min="0" step="0.01" value="4"></label><label>Entry + exit slippage (ticks)<input id="slippage" type="number" min="0" step="1" value="2"></label><button id="calculateRisk" class="primary-button">Calculate size</button></div><div id="riskResult" class="result-panel" aria-live="polite">Enter assumptions and calculate position size.</div><p class="fine-print">Tick values are copied from the supplied ICT dataset and remain unverified against current official exchange specifications. The calculator rounds contracts down and shows estimated gross/net outcomes; margin and liquidation risk are not estimated.</p></section>'''
    body+='<section class="content-section os-prop-firm-panel"><div class="section-top"><div><h2>Prop-firm rulebooks</h2><p>Firm eligibility, fees, drawdown calculation, payout rules and prohibited strategies need current, firm-specific source evidence.</p></div><span class="os-state-chip warn">NOT CONFIGURED</span></div><p>No verified firm rulebook, pricing feed or payout history is connected to this product area yet. Do not treat cached third-party summaries or older challenge rules as current terms.</p><div class="os-data-footnote">Coverage status: no firm records loaded · verification required before purchase or account sizing.</div></section>'
    body+='<section class="content-section"><h2>Personal risk workflow</h2><div class="card-grid">'+card('Journal & watchlists','Review planned and completed trades in your private workspace.','/account/','Private workspace')+card('Pre-session checklist','Prepare a repeatable market plan and evidence checklist.','/ict-futures/#checklist','ICT Futures')+card('Contract verification','Check imported tick references and missing expiry fields.','/contract-specs/','Reference registry')+'</div></section>'
    write(DIST/'risk/index.html',shell('Risk & Prop Firms | Futures Intelligence OS','Futures position sizing and prop-firm rulebook verification status.',body,'/risk/', '<script defer src="/assets/risk-calculator.js"></script>'))
    write(DIST/'tools/index.html',redirect_page('Risk tools moved','/risk/'))

    # Supabase account sign-in and private workspace sync.
    body=page_intro('Account & sync','Your private cloud workspace','Manage your cloud trade journal, multi-list watchlists, research notes, price-alert rules, performance analytics and account preferences. Every private record is scoped to your authenticated account.')+'<div id="accountApp"><section class="content-section"><p>Loading your secure cloud workspace…</p></section></div>'
    write(DIST/'account/index.html',shell('Account & Private Workspace | Futures Intelligence OS','Cloud trade journal, watchlists, research notes, alerts, analytics and cross-device account synchronization.',body,'/account/', '<script defer src="/assets/account.js"></script>'))

    # Status / docs pages
    status_rows=[('GitHub','Source repository and CI','Main repository connected; quality gates run on pushes and pull requests; v1.1.0 release workflow publishes only matching verified tags'),('Vercel','Frontend hosting','Latest main-branch production deployment is Ready; both public production aliases return HTTP 200; SSO protection is limited to Preview deployments'),('Supabase','Postgres and Auth','Active healthy Mumbai project; 22 public tables have RLS enabled and security/health advisors report no findings. Real end-user signup/sign-in still needs a browser smoke test.'),('Builder.io','Editorial CMS','Allow-listed proxy code exists; public API key and Admin PAT are not configured; the static Academy remains available'),('Cloudflare','Edge API and cache','Worker is deployed with KV and a 30-minute Cron (deployed Worker version 16). No Worker secrets are currently bound, so registered BLS v2, BEA/EIA/FRED ingestion and privileged Supabase writes remain inactive until their Worker secrets are configured.')]
    rows=''.join(f'<tr><td><b>{escape(a)}</b><small>{escape(b)}</small></td><td>{escape(c)}</td></tr>' for a,b,c in status_rows)
    body=page_intro('Platform operations','System status & integrations','This page deliberately reports verified account and runtime state. Configuration files in the repository are not evidence that a remote service has been provisioned or deployed.')
    body+=f'<section class="content-section"><table class="status-table"><thead><tr><th>Service</th><th>Verified state</th></tr></thead><tbody>{rows}</tbody></table></section>'
    body+='<section class="content-section"><h2>Data state definitions</h2><p><span class="data-pill">LIVE API</span> received from a provider at request time · <span class="data-pill">SNAPSHOT</span> stored response · <span class="data-pill">DELAYED</span> provider-labelled delay · <span class="data-pill">OFFICIAL LINK</span> publisher page · <span class="data-pill">SEARCH LINK</span> provider search query · <span class="data-pill">STALE</span> retained last-known data · <span class="data-pill">UNAVAILABLE</span> no usable response.</p></section>'
    write(DIST/'status/index.html',shell('System Status | Futures Intelligence OS','Verified setup status for GitHub, Vercel, Supabase, Builder.io and Cloudflare.',body,'/status/'))
    body=page_intro('Developer reference','Documentation','Architecture, setup, data contracts, source provenance, integration boundaries and operational instructions for maintaining this application.')
    docs_cards=[card('Master requirements','The complete five-tool architecture, APIs, phases and acceptance criteria.','/docs/FINANCE_INTELLIGENCE_OS_COMPLETE_MASTER_REQUIREMENTS.md','Specification'),card('Implementation guide','How to configure the repository, data adapters, Worker and CMS integration.','/docs/IMPLEMENTATION.md','Guide'),card('Architecture','System component boundaries and data flows.','/docs/ARCHITECTURE.md','Technical'),card('Environment variables','Names and handling rules; never commit secret values.','/docs/ENVIRONMENT.md','Operations')]
    body+='<section class="card-grid">'+''.join(docs_cards)+'</section>'
    body+='<section class="content-section"><h2>Historical source preservation</h2><p>Previous Global Research source baselines remain in the repository under <code>legacy/global-research/</code> and are not published in the active site. The ICT Futures terminal remains available under <code>/ict-futures/</code>.</p></section>'
    write(DIST/'docs/index.html',shell('Documentation | Futures Intelligence OS','Technical documentation, build and service setup for the futures-only product.',body,'/docs/'))

    # Source archives stay in Git and are intentionally not published in dist.
    write(DIST/'legacy/index.html',redirect_page('Source archives are maintained in the repository','/docs/'))

    # Sitemap only when canonical base exists, else create relative noindex sitemap not intended for submission.
    if SITE_URL:
        urls=['/','/futures-intelligence/','/markets/','/academy/','/entry-models/','/news/','/volume-open-interest/','/research/positioning/','/contract-specs/','/strategy-lab/','/risk/','/account/','/data-health/','/macro/','/status/','/docs/','/sources/','/ict-futures/']
        urls += [f'/ict-futures/markets/{p.name}' for p in (DIST/'ict-futures/markets').glob('*.html')]
        urls += [f'/ict-futures/academy/{p.name}' for p in (DIST/'ict-futures/academy').glob('*.html')]
        urls.append('/ict-futures/academy/tutorials/')
        urls += [f'/ict-futures/academy/tutorials/{p.name}' for p in (DIST/'ict-futures/academy/tutorials').glob('*.html') if p.name != 'index.html']
        xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{escape(SITE_URL+u)}</loc></url>' for u in urls)+'</urlset>'
        write(DIST/'sitemap.xml',xml)
        write(DIST/'robots.txt',f'User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n')
    else:
        write(DIST/'robots.txt','User-agent: *\nDisallow: /\n')
        write(DIST/'sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>')
    print(f'Built {DIST} | resources={len(resources)} | futures={len(mdata)} | academy={len(academy)} | site_url={SITE_URL or "local/noindex"}')

if __name__ == '__main__': build()
