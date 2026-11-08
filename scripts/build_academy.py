from __future__ import annotations
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urlparse

def _safe_href(value):
    value = str(value or "").strip()
    try:
        parsed = urlparse(value)
        return value if parsed.scheme == "https" and parsed.netloc else ""
    except Exception:
        return ""

def _json_for_script(value):
    return json.dumps(value, ensure_ascii=False).replace("</", "<\\/")

def _link(label, url, kind="reference"):
    url = _safe_href(url)
    if not url:
        return ""
    return '<a class="academy-link" href="' + escape(url, quote=True) + '" target="_blank" rel="noopener noreferrer">' + escape(str(label)) + ' ↗</a>'

def _progress_markup(slug, title):
    return f'''
    <section class="academy-progress-box" data-academy-lesson="{escape(slug, quote=True)}">
      <div class="progress-head"><div><span class="eyebrow">YOUR STUDY PROGRESS</span><h2>{escape(title)}</h2></div><span class="progress-status" data-progress-status>Not started</span></div>
      <div class="progress-track"><span data-progress-bar></span></div>
      <div class="progress-foot"><span data-progress-copy>0 of 0 practice steps checked</span><span data-progress-sync>Saved on this device</span></div>
    </section>'''

def render_lesson(concept, all_concepts, site_url=""):
    learning = concept.get("learning") or {}
    refs = learning.get("references") or {}
    related_lookup = {c.get("name"): c for c in all_concepts}
    related = []
    for name in concept.get("related") or []:
        item = related_lookup.get(name)
        if item:
            related.append(f'<a class="chip" href="{escape(item.get("id",""))}.html">{escape(name)} →</a>')
        else:
            related.append(f'<span class="chip">{escape(name)}</span>')
    steps = learning.get("guidedWalkthrough") or []
    step_html = "".join(
        f'<li><b>{escape(str(step.get("title") or "Study step"))}</b><p>{escape(str(step.get("instruction") or ""))}</p></li>'
        for step in steps
    )
    objectives = "".join(f'<li>{escape(str(x))}</li>' for x in learning.get("learningObjectives") or [])
    example = learning.get("workedExample") or {}
    exercise = learning.get("practicalExercise") or {}
    checks = exercise.get("checklist") or []
    checks_html = "".join(
        f'<label class="exercise-check"><input type="checkbox" data-exercise-check value="{i}"><span>{escape(str(item))}</span></label>'
        for i, item in enumerate(checks)
    )
    criteria = "".join(f'<li>{escape(str(x))}</li>' for x in exercise.get("reviewCriteria") or [])
    quiz = learning.get("knowledgeCheck") or {}
    options = quiz.get("options") or []
    options_html = "".join(
        f'<label class="quiz-option"><input type="radio" name="answer" value="{i}"><span>{escape(str(opt))}</span></label>'
        for i, opt in enumerate(options)
    )
    quiz_data = _json_for_script({"correctIndex": quiz.get("correctIndex", 0), "explanation": quiz.get("explanation", "")})
    official_videos = refs.get("officialVideos") or []
    videos_html = "".join(
        '<article class="reference-item"><div><b>' + escape(str(v.get("title") or "Official ICT lesson")) + '</b><p>' + escape(str(v.get("summary") or "")) + '</p><small>' + escape(str(v.get("publisher") or "The Inner Circle Trader")) + ' · ' + escape(str(v.get("published") or "Date not listed")) + '</small></div>' + _link("Watch original lesson", v.get("url")) + '</article>'
        for v in official_videos if _safe_href(v.get("url"))
    )
    secondary = refs.get("secondary") or []
    secondary_html = "".join(
        '<article class="reference-item"><div><b>' + escape(str(r.get("name") or "Secondary reference")) + '</b><p>' + escape(str(r.get("scope") or r.get("classification") or "Supplemental terminology reference. This is not an official ICT source.")) + '</p><small>' + escape(str(r.get("type") or r.get("classification") or "Secondary / community")) + '</small></div>' + _link("Open reference", r.get("url")) + '</article>'
        for r in secondary if _safe_href(r.get("url"))
    )
    general_refs = refs.get("generalMarketEducation") or []
    general_html = "".join(
        '<article class="reference-item"><div><b>' + escape(str(r.get("name") or "General education")) + '</b><p>' + escape(str(r.get("scope") or "")) + '</p><small>' + escape(str(r.get("type") or "Reference")) + '</small></div>' + _link("Open reference", r.get("url")) + '</article>'
        for r in general_refs if _safe_href(r.get("url"))
    )
    video_links = (
        _link("Official ICT channel", refs.get("officialChannel")) +
        _link("Official ICT playlists", refs.get("officialPlaylists")) +
        _link("Search this topic", refs.get("topicDiscovery"))
    )
    canonical = escape((site_url.rstrip("/") + f"/ict-futures/academy/{concept.get('id')}.html") if site_url else "", quote=True)
    title = str(concept.get("name") or "ICT lesson")
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — ICT Academy | Finance Intelligence OS</title>
<meta name="description" content="{escape('Guided ICT lesson with objectives, worked example, replay exercise, knowledge check and source references: ' + str(concept.get('definition') or '')[:155])}">
{f'<link rel="canonical" href="{canonical}">' if canonical else '<meta name="robots" content="noindex,follow">'}
<meta property="og:type" content="article"><meta property="og:title" content="{escape(title)} — ICT Academy"><meta property="og:description" content="{escape(str(concept.get('definition') or '')[:180])}">
<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css">
<script defer src="/assets/runtime-config.js"></script><script defer src="/assets/academy-learning.js"></script>
<script type="application/json" id="academyQuizData">{quiz_data}</script>
<script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script>
</head><body>
<header class="academy-top"><a href="/academy/">← All ICT lessons</a><span>FINANCE INTELLIGENCE OS · ICT ACADEMY</span><a href="/ict-futures/">Futures terminal ↗</a></header>
<main class="academy-page" data-academy-lesson="{escape(concept.get('id',''), quote=True)}">
<header class="lesson-hero"><div><div class="lesson-tags"><span>{escape(str(concept.get('category') or "ICT"))}</span><span>{escape(str(concept.get('level') or "Study"))}</span><span>{escape(str(learning.get('durationMinutes',20)))} min</span></div><p class="eyebrow">LESSON {escape(str(concept.get('id') or '').upper())}</p><h1>{escape(title)}</h1><p class="lead">{escape(str(concept.get('definition') or ''))}</p><div class="lesson-hero-links"><a href="../index.html#academy">Open terminal concept library →</a>{_link("Official ICT channel", refs.get("officialChannel"))}</div></div><aside class="evidence-card"><span class="eyebrow">SOURCE / EVIDENCE LABEL</span><strong>{escape(str(concept.get('evidence') or learning.get('evidenceBand') or 'Source note needed'))}</strong><p>{escape(str(learning.get('sourceCaution') or 'Use a predeclared rule and preserve source limitations.'))}</p></aside></header>
{_progress_markup(concept.get('id',''), 'Lesson progress')}
<section class="lesson-section"><div class="section-head"><span>01</span><div><p class="eyebrow">LEARNING TARGETS</p><h2>What you should be able to do</h2></div></div><ol class="objectives">{objectives}</ol><div class="prereq"><b>Before you begin</b><p>{escape(str(learning.get('prerequisites') or 'Review the chart/timeframe definitions and source note first.'))}</p></div></section>
<section class="lesson-section"><div class="section-head"><span>02</span><div><p class="eyebrow">GUIDED TUTORIAL</p><h2>Learn the concept step by step</h2></div></div><ol class="walkthrough">{step_html}</ol></section>
<section class="lesson-section example-section"><div class="section-head"><span>03</span><div><p class="eyebrow">WORKED EXAMPLE · HYPOTHETICAL DATA</p><h2>{escape(str(example.get('title') or 'Illustrative example'))}</h2></div></div><p>{escape(str(example.get('body') or 'Use a hypothetical chart example and state all assumptions.'))}</p><div class="example-caution">Illustration only. Values are invented teaching examples, not historical quotes, trade calls or evidence of profitability.</div></section>
<section class="lesson-section"><div class="section-head"><span>04</span><div><p class="eyebrow">PRACTICAL EXERCISE</p><h2>{escape(str(exercise.get('title') or 'Chart-replay assignment'))}</h2></div></div><p class="exercise-task">{escape(str(exercise.get('task') or 'Create a dated chart study using a predeclared rule.'))}</p><div class="exercise-checks">{checks_html}</div><div class="deliverable"><b>Submit / save</b><p>{escape(str(exercise.get('deliverable') or 'Save annotated screenshots and a written rule sheet.'))}</p></div><h3>Review criteria</h3><ul>{criteria}</ul></section>
<section class="lesson-section quiz-section"><div class="section-head"><span>05</span><div><p class="eyebrow">KNOWLEDGE CHECK</p><h2>Test your understanding</h2></div></div><fieldset class="academy-quiz" data-academy-quiz><legend>{escape(str(quiz.get('question') or 'Which statement best describes the concept?'))}</legend>{options_html}<button class="primary-button" type="button" data-check-answer>Check answer</button><p class="quiz-feedback" data-quiz-feedback aria-live="polite"></p></fieldset><button class="complete-lesson" type="button" data-mark-complete disabled>Complete lesson after exercise + correct answer</button><p class="small-note" data-progress-message>Complete the checklist and answer correctly to mark this lesson complete. Progress is stored locally and syncs to your signed-in account when available.</p></section>
<section class="lesson-section"><div class="section-head"><span>06</span><div><p class="eyebrow">LIMITS & REVIEW</p><h2>Common mistakes and source cautions</h2></div></div><div class="mistakes"><b>Common mistakes</b><p>{escape(str(concept.get('commonMistakes') or 'Avoid hindsight definitions, inconsistent boundaries and isolated pattern labels.'))}</p></div><div class="mistakes caution"><b>Evidence / source caution</b><p>{escape(str(learning.get('sourceCaution') or 'A framework description is not evidence of trading edge.'))}</p></div></section>
<section class="lesson-section"><div class="section-head"><span>07</span><div><p class="eyebrow">REFERENCES & FURTHER STUDY</p><h2>Source-linked learning</h2></div></div>
<h3>Verified official ICT videos</h3>{videos_html or '<p class="small-note">No direct official upload is mapped to this concept yet. Use the channel and playlist links as discovery sources, not as a verified one-to-one lesson mapping.</p>'}
<h3>Official ICT source portals</h3><div class="reference-actions">{video_links}</div>
<h3>Supplemental references</h3>{secondary_html or '<p class="small-note">No concept-specific secondary reference is mapped in the source catalogue.</p>'}
<h3>General market and risk education</h3>{general_html}
</section>
<section class="lesson-section"><div class="section-head"><span>08</span><div><p class="eyebrow">CONTINUE LEARNING</p><h2>Related lessons</h2></div></div><div class="related-lessons">{''.join(related) or '<span class="small-note">No related concepts were mapped.</span>'}</div><div class="lesson-footer-links"><a href="/ict-futures/academy/tutorials/">Browse guided tutorials →</a><a href="/academy/">Back to Academy dashboard →</a></div></section>
<footer class="academy-disclaimer">Educational material only. This lesson is not investment advice, a trading signal or an endorsement. Futures are leveraged and can cause substantial losses. Verify current exchange specifications, costs, session schedules and regulatory requirements independently.</footer>
</main></body></html>'''

def render_tutorial(tutorial, all_concepts, site_url=""):
    concepts = {c.get("id"): c for c in all_concepts}
    related = [concepts[i] for i in tutorial.get("conceptIds",[]) if i in concepts]
    steps = "".join(
      f'<li><b>Step {i+1}</b><p>{escape(str(x))}</p></li>'
      for i,x in enumerate(tutorial.get("steps") or [])
    )
    materials = "".join(f'<li>{escape(str(x))}</li>' for x in tutorial.get("materials") or [])
    review = "".join(f'<li>{escape(str(x))}</li>' for x in tutorial.get("review") or [])
    related_html = "".join('<a class="academy-link" href="/ict-futures/academy/' + escape(str(c.get("id","")), quote=True) + '.html">' + escape(str(c.get("name","Lesson"))) + ' →</a>' for c in related)
    canonical = escape((site_url.rstrip("/") + f"/ict-futures/academy/tutorials/{tutorial.get('id')}.html") if site_url else "", quote=True)
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(tutorial.get('title','ICT tutorial'))} — Guided ICT Tutorial</title><meta name="description" content="{escape(str(tutorial.get('objective') or '')[:160])}">
{f'<link rel="canonical" href="{canonical}">' if canonical else '<meta name="robots" content="noindex,follow">'}
<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css"><script defer src="/assets/runtime-config.js"></script><script defer src="/assets/academy-learning.js"></script>
<script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script>
</head><body><header class="academy-top"><a href="/ict-futures/academy/tutorials/">← Tutorial library</a><span>GUIDED ICT PRACTICE</span><a href="/academy/">Academy dashboard ↗</a></header><main class="academy-page" data-academy-lesson="tutorial-{escape(tutorial.get('id',''),quote=True)}">
<header class="lesson-hero"><div><div class="lesson-tags"><span>{escape(tutorial.get('level','Study'))}</span><span>{escape(tutorial.get('duration','Practice'))}</span></div><p class="eyebrow">GUIDED TUTORIAL</p><h1>{escape(tutorial.get('title','ICT tutorial'))}</h1><p class="lead">{escape(tutorial.get('objective',''))}</p></div><aside class="evidence-card"><span class="eyebrow">TUTORIAL MATERIALS</span><ul>{materials}</ul></aside></header>
{_progress_markup('tutorial-'+tutorial.get('id',''), 'Tutorial progress')}
<section class="lesson-section"><div class="section-head"><span>01</span><div><p class="eyebrow">WORKFLOW</p><h2>Follow the practice sequence</h2></div></div><ol class="walkthrough">{steps}</ol></section>
<section class="lesson-section"><div class="section-head"><span>02</span><div><p class="eyebrow">DELIVERABLE</p><h2>What to create</h2></div></div><p>{escape(tutorial.get('deliverable','Save a dated chart pack and written rule sheet.'))}</p><h3>Quality review</h3><div class="exercise-checks">{''.join(f'<label class="exercise-check"><input type="checkbox" data-exercise-check value="{i}"><span>{escape(str(x))}</span></label>' for i,x in enumerate(review))}</div><button class="complete-lesson" type="button" data-mark-complete disabled>Complete tutorial after review</button><p class="small-note" data-progress-message>Check all review items to complete this tutorial. Progress is stored locally and syncs to your signed-in account when available.</p></section>
<section class="lesson-section"><div class="section-head"><span>03</span><div><p class="eyebrow">CONCEPT LIBRARY</p><h2>Relevant lessons</h2></div></div><div class="reference-actions">{related_html}</div></section>
<footer class="academy-disclaimer">Use this tutorial for historical chart study and rule writing. Do not infer an edge or trade from a practice example. Futures are leveraged and can cause substantial losses.</footer></main></body></html>'''

def build_academy(dist: Path, academy: dict, site_url=""):
    concepts = academy.get("concepts") or []
    root = dist / "ict-futures" / "academy"
    tutorials_root = root / "tutorials"
    tutorials_root.mkdir(parents=True, exist_ok=True)
    for c in concepts:
        slug = re.sub(r"[^a-z0-9-]", "", str(c.get("id") or "").lower())
        if not slug:
            continue
        (root / f"{slug}.html").write_text(render_lesson(c, concepts, site_url), encoding="utf-8")
    program = academy.get("learningProgram") or {}
    tutorials = program.get("tutorials") or []
    for t in tutorials:
        slug = re.sub(r"[^a-z0-9-]", "", str(t.get("id") or "").lower())
        if slug:
            (tutorials_root / f"{slug}.html").write_text(render_tutorial(t, concepts, site_url), encoding="utf-8")
    tutorial_cards = "".join(
      '<a class="module-card" href="' + escape(str(t.get("id") or "")) + '.html"><span class="card-eyebrow">' + escape(str(t.get("level") or "Tutorial")) + ' · ' + escape(str(t.get("duration") or "")) + '</span><h3>' + escape(str(t.get("title") or "")) + '</h3><p>' + escape(str(t.get("objective") or "")) + '</p><span class="card-cta">Open tutorial →</span></a>'
      for t in tutorials
    )
    tutorial_index = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICT Guided Tutorials — Finance Intelligence OS</title><meta name="description" content="Guided chart exercises, tutorial workflows and replay assignments for ICT futures study.">{f'<link rel="canonical" href="{escape(site_url.rstrip("/")+"/ict-futures/academy/tutorials/")}">' if site_url else '<meta name="robots" content="noindex,follow">'}<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css"><script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script></head><body><header class="academy-top"><a href="/academy/">← Academy dashboard</a><span>ICT GUIDED TUTORIALS</span><a href="/ict-futures/">Futures terminal ↗</a></header><main class="academy-page"><header class="lesson-hero"><div><p class="eyebrow">PRACTICE WORKBOOKS</p><h1>Guided ICT tutorials</h1><p class="lead">Nine structured study paths with practical tasks, chart-replay workflows, deliverables and review criteria. These are educational exercises, not strategy performance claims.</p></div></header><section class="tutorial-grid">{tutorial_cards}</section></main></body></html>'''
    (tutorials_root / "index.html").write_text(tutorial_index, encoding="utf-8")
