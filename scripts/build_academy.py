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

def _evidence_meta(concept):
    raw = str(concept.get("evidence") or (concept.get("learning") or {}).get("evidenceBand") or "SOURCE REVIEW NEEDED")
    upper = raw.upper()
    if "NO AUDITED" in upper or "WEAK PUBLIC EVIDENCE" in upper:
        governed = "NO DATA"
    elif "CONVENTION" in upper or "SUPPLEMENTAL" in upper or "SOURCE VARIATION" in upper or "NOT STANDARDISED" in upper:
        governed = "CONVENTION"
    elif "SOURCED" in upper:
        governed = "SOURCED"
    elif "HYPOTHESIS" in upper:
        governed = "HYPOTHESIS"
    else:
        governed = "SOURCE REVIEW NEEDED"
    # TESTED is intentionally unavailable without a linked reproducible test artifact.
    return raw, governed

def _plain_list(items, empty="Not recorded in the supplied Academy source."):
    values = [str(x) for x in (items or []) if str(x).strip()]
    if not values:
        return '<p class="academy-unmapped">' + escape(empty) + '</p>'
    return '<ul class="academy-detail-list">' + ''.join('<li>' + escape(x) + '</li>' for x in values) + '</ul>'

def _lesson_section(number, eyebrow, title, content, section_id=""):
    ident = ' id="' + escape(section_id, quote=True) + '"' if section_id else ""
    return f'<section class="lesson-section"{ident}><div class="section-head"><span>{number:02d}</span><div><p class="eyebrow">{escape(eyebrow)}</p><h2>{escape(title)}</h2></div></div>{content}</section>'

def _walkthrough_html(items):
    values = []
    for item in items or []:
        if isinstance(item, dict):
            title = str(item.get("title") or item.get("step") or "Study step")
            detail = str(item.get("instruction") or item.get("description") or "")
            values.append('<li><b>' + escape(title) + '</b><p>' + escape(detail) + '</p></li>')
        else:
            values.append('<li>' + escape(str(item)) + '</li>')
    return '<ol class="walkthrough">' + ''.join(values) + '</ol>' if values else '<p class="academy-unmapped">No structured walkthrough is supplied.</p>'

def render_lesson(concept, all_concepts, site_url="", tracks=None, resource_registry=None):
    learning = concept.get("learning") or {}
    spec = concept.get("lessonSpec") or {}
    refs = learning.get("references") or {}
    tracks = tracks or []
    resource_registry = resource_registry or []
    related_lookup = {c.get("name"): c for c in all_concepts}
    related_html = []
    for name in concept.get("related") or []:
        item = related_lookup.get(name)
        if item:
            related_html.append('<a class="chip" href="' + escape(str(item.get("id", "")), quote=True) + '.html">' + escape(name) + ' →</a>')
        else:
            related_html.append('<span class="chip">' + escape(name) + '</span>')
    example = learning.get("workedExample") or {}
    exercise = learning.get("practicalExercise") or {}
    checks = exercise.get("checklist") or []
    checks_html = "".join(
        f'<label class="exercise-check"><input type="checkbox" data-exercise-check value="{i}"><span>{escape(str(item))}</span></label>'
        for i, item in enumerate(checks)
    )
    criteria = _plain_list(exercise.get("reviewCriteria"), "Review criteria are not yet mapped.")
    quiz = learning.get("knowledgeCheck") or {}
    options = quiz.get("options") or []
    options_html = "".join(
        f'<label class="quiz-option"><input type="radio" name="answer" value="{i}"><span>{escape(str(opt))}</span></label>'
        for i, opt in enumerate(options)
    )
    quiz_data = _json_for_script({"correctIndex": quiz.get("correctIndex", 0), "explanation": quiz.get("explanation", "")})
    raw_evidence, governed_evidence = _evidence_meta(concept)
    canonical = escape((site_url.rstrip("/") + f"/ict-futures/academy/{concept.get('id')}.html") if site_url else "", quote=True)
    title = str(concept.get("name") or "ICT lesson")
    track_by_id = {t.get("id"): t for t in tracks}
    track_ids = spec.get("trackIds") or ([spec.get("primaryTrackId")] if spec.get("primaryTrackId") else [])
    track_links = []
    for tid in track_ids:
        t = track_by_id.get(tid)
        if t:
            track_links.append('<span class="academy-meta-chip">' + escape(str(t.get("name") or tid)) + '</span>')
    prereq_tracks = []
    for tid in track_ids:
        t = track_by_id.get(tid) or {}
        prereq_tracks.extend(t.get("prerequisites") or [])
    prereq_tracks = list(dict.fromkeys(prereq_tracks))
    track_html = " ".join(track_links) or '<span class="academy-unmapped">Track assignment needs review.</span>'
    prerequisites_html = _plain_list([str(learning.get("prerequisites") or "No concept-specific prerequisite recorded.")] + prereq_tracks,
                                     "Prerequisites are not mapped.")
    identifiers = spec.get("identificationRules") or concept.get("howToUse") or []
    identification_html = _plain_list(identifiers, "Identification rules are not mapped; do not infer a deterministic signal rule.")
    variants = spec.get("definitionVariants") or learning.get("sourceCaution") or "No conflicting-definition note supplied."
    futures_context = spec.get("futuresContext") or "Listed-futures education scope. No specific contract-family applicability is asserted without a mapped source."
    if spec.get("instrumentTags"):
        futures_context += " Source-listed instruments in mapped original video records: " + ", ".join(spec.get("instrumentTags")) + ". These tags describe source examples, not universal applicability."
    session_context = spec.get("sessionContext") or "Not standardized. Verify the contract's official schedule, holiday calendar and maintenance break."
    timeframe_role = spec.get("timeframeRole") or "Not standardized. Declare HTF context, setup and execution roles before replay."
    preconditions = spec.get("preconditions") or learning.get("prerequisites") or "Not supplied."
    setup_html = _walkthrough_html(spec.get("setupSequence") or learning.get("guidedWalkthrough"))
    invalidation_html = _plain_list(spec.get("invalidation"), "No concept-specific invalidation rule is supplied. Define it before testing; do not invent one after the outcome.")
    no_trade_html = _plain_list(spec.get("noTradeConditions"), "No concept-specific no-trade conditions are supplied. Record ambiguous and disqualified cases during replay.")
    related_block = '<div class="related-lessons">' + ("".join(related_html) or '<span class="academy-unmapped">No related concepts were mapped.</span>') + '</div>'
    next_id = spec.get("nextLessonId")
    next_block = ""
    if next_id and next_id in {c.get("id") for c in all_concepts}:
        next_block = '<a class="academy-next" href="' + escape(str(next_id), quote=True) + '.html">Next lesson in track →</a>'

    # A supplied single worked example is not silently relabelled as both bullish and bearish examples.
    example_body = escape(str(example.get("body") or "No worked example is supplied."))
    example_card = '<div class="hypothetical-callout"><b>' + escape(str(example.get("title") or "Illustrative example")) + '</b><p>' + example_body + '</p><small>Illustrative example — not historical market data. This example is hypothetical and is not a trade recommendation.</small></div>'
    bullish = spec.get("bullishExample")
    bearish = spec.get("bearishExample")
    def directional_example(label, value):
        if not value:
            return '<article class="direction-example missing"><b>' + label + ' example</b><p>Not separately authored in the supplied source. No chart example has been invented.</p></article>'
        return '<article class="direction-example"><b>' + label + ' example · hypothetical</b><p>' + escape(str(value)) + '</p><small>Illustrative example — not historical market data.</small></article>'
    example_card += '<div class="direction-example-grid">' + directional_example("Bullish", bullish) + directional_example("Bearish", bearish) + '</div>'

    chart = spec.get("chartFigure") or {}
    chart_html = '<div class="chart-figure-placeholder"><b>Chart illustration status: ' + escape(str(chart.get("status") or "not supplied")).replace("_", " ").upper() + '</b><p>' + escape(str(chart.get("note") or "No authorized or user-owned chart figure is attached.")) + '</p>' + _plain_list(chart.get("requiredMetadata"), "Chart metadata requirements not recorded.") + '</div>'
    entry_html = _plain_list(spec.get("entryOptions"), "Entry options/order-type assumptions are not supplied for this concept.")
    stop_html = _plain_list(spec.get("stopLogic"), "Stop placement and position-sizing logic are not supplied for this concept.")
    target_html = _plain_list(spec.get("targetManagement"), "Targets and partial management are not supplied. No reward or performance promise is implied.")

    # Only registry records explicitly verified as original ICT uploads get that label.
    resources = [r for r in resource_registry if concept.get("id") in (r.get("conceptIds") or [])]
    verified = [r for r in resources if r.get("classification") == "original_ict_upload" and r.get("verificationStatus") == "verified"]
    supplemental = [r for r in resources if r.get("classification") in ("supplemental", "unverified_candidate")]
    general = [r for r in resources if r.get("classification") not in ("original_ict_upload", "supplemental", "unverified_candidate")]
    def resource_cards(items, label):
        html = []
        for r in items:
            href = _safe_href(r.get("url"))
            if not href:
                continue
            status = str(r.get("verificationStatus") or "not_checked").replace("_", " ")
            title_text = str(r.get("title") or "Reference")
            publisher = str(r.get("publisher") or "Unspecified publisher")
            html.append('<article class="reference-item"><div><b>' + escape(title_text) + '</b><p>' + escape(str(r.get("summary") or "")) + '</p><small>' + escape(publisher) + ' · ' + escape(status) + ' · ' + escape(str(r.get("linkHealth") or "not checked")) + '</small></div>' + _link(label, href) + '</article>')
        return "".join(html) or '<p class="academy-unmapped">No concept-specific ' + escape(label.lower()) + ' is mapped. Use source portals only for discovery.</p>'
    official_html = resource_cards(verified, "Open verified original ICT upload")
    supplemental_html = resource_cards(supplemental, "Open supplemental / candidate resource")
    general_html = resource_cards(general, "Open general market / regulatory source")
    channel_links = _link("Official ICT channel", refs.get("officialChannel")) + _link("Official ICT playlists · discovery", refs.get("officialPlaylists")) + _link("Topic discovery · not a verified lesson", refs.get("topicDiscovery"))
    reflection_questions = [q for q in spec.get("knowledgeQuestions") or [] if q.get("type") == "reflection"]
    reflection_html = "".join('<article class="reflection-question"><b>' + escape(str(q.get("question") or "Reflection")) + '</b><p>' + escape(str(q.get("answer") or "Write your own answer before reviewing outcomes.")) + '</p><small>' + escape(str(q.get("rationale") or "")) + '</small></article>' for q in reflection_questions)
    source_note = str(spec.get("sourceNotes") or learning.get("sourceCaution") or concept.get("sourceNote") or "Source notes are incomplete.")
    content_version = spec.get("contentVersion", 1)
    reviewed_at = spec.get("reviewedAt") or "Not yet reviewed"
    author = spec.get("author") or "Not recorded"
    editor = spec.get("editor") or "Not recorded"
    provenance = (
        '<div class="provenance-grid"><div><span>Author</span><b>' + escape(str(author)) + '</b></div>'
        '<div><span>Editor</span><b>' + escape(str(editor)) + '</b></div>'
        '<div><span>Content version</span><b>' + escape(str(content_version)) + '</b></div>'
        '<div><span>Last reviewed</span><b>' + escape(str(reviewed_at)) + '</b></div></div>'
    )
    knowledge_more = '<div class="reflection-grid">' + (reflection_html or '<p class="academy-unmapped">Additional reflection questions are not yet mapped.</p>') + '</div>'
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — ICT Academy | Finance Intelligence OS</title>
<meta name="description" content="{escape('Guided ICT futures lesson with source notes, hypothetical examples, practice and knowledge checks: ' + str(concept.get('definition') or '')[:145])}">
{f'<link rel="canonical" href="{canonical}">' if canonical else '<meta name="robots" content="noindex,follow">'}
<meta property="og:type" content="article"><meta property="og:title" content="{escape(title)} — ICT Academy"><meta property="og:description" content="{escape(str(concept.get('definition') or '')[:180])}">
<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css">
<script defer src="/assets/runtime-config.js"></script><script defer src="/assets/academy-learning.js"></script>
<script type="application/json" id="academyQuizData">{quiz_data}</script>
<script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script>
</head><body>
<header class="academy-top"><a href="/academy/">← All ICT lessons</a><span>FINANCE INTELLIGENCE OS · ICT ACADEMY</span><a href="/ict-futures/">Futures terminal ↗</a></header>
<main class="academy-page" data-academy-lesson="{escape(concept.get('id',''), quote=True)}">
<header class="lesson-hero"><div><div class="lesson-tags"><span>{escape(str(concept.get('category') or "ICT"))}</span><span>{escape(str(concept.get('level') or "Study"))}</span><span>{escape(str(learning.get('durationMinutes',20)))} min</span><span>{escape(governed_evidence)}</span></div><p class="eyebrow">LESSON {escape(str(concept.get('id') or '').upper())}</p><h1>{escape(title)}</h1><p class="lead">{escape(str(concept.get('definition') or ''))}</p><div class="lesson-hero-links"><a href="/academy/">Open Academy dashboard →</a><a href="/ict-futures/">Open futures terminal ↗</a></div><div class="lesson-track-row">{track_html}</div></div><aside class="evidence-card"><span class="eyebrow">SOURCE / EVIDENCE LABEL</span><strong>{escape(raw_evidence)}</strong><p>Governance class: {escape(governed_evidence)}. TESTED is reserved for a reproducible, linked test artifact; no strategy edge is inferred from an educational source.</p></aside></header>
{_progress_markup(concept.get('id',''), 'Lesson progress')}
{_lesson_section(1,"CONCEPT IDENTITY","Canonical name, aliases and evidence",'<dl class="academy-definition-grid"><div><dt>Canonical concept</dt><dd>' + escape(title) + '</dd></div><div><dt>Acronym / aliases</dt><dd>' + escape(str(spec.get("acronym") or "Not supplied")) + ' · ' + escape(", ".join(spec.get("aliases") or []) or "No aliases recorded") + '</dd></div><div><dt>Evidence label</dt><dd>' + escape(raw_evidence) + ' · governed as ' + escape(governed_evidence) + '</dd></div></dl>')}
{_lesson_section(2,"DEFINITION","Plain-language definition",'<p class="lesson-prose">' + escape(str(concept.get("definition") or "Definition not supplied.")) + '</p>')}
{_lesson_section(3,"INTENDED USE","What question this concept is intended to answer",'<p class="lesson-prose">' + escape(str(spec.get("purpose") or "Concept question not mapped.")) + '</p><small class="academy-unmapped">' + escape(str(spec.get("purposeLabel") or "Purpose mapping needs review.")) + '</small>')}
{_lesson_section(4,"FUTURES CONTEXT","Contract families, session context and limitations",'<p>' + escape(futures_context) + '</p><p>' + escape(session_context) + '</p>')}
{_lesson_section(5,"PREREQUISITES & TIMEFRAME","Prerequisites and timeframe role",prerequisites_html + '<p><b>Timeframe role:</b> ' + escape(timeframe_role) + '</p>')}
{_lesson_section(6,"IDENTIFICATION RULES","Testable identification rules",identification_html)}
{_lesson_section(7,"HYPOTHETICAL EXAMPLES","Bullish and bearish examples",example_card)}
{_lesson_section(8,"VISUAL LEARNING","Chart illustration / replay image",chart_html)}
{_lesson_section(9,"PRECONDITIONS","Preconditions and full setup sequence",'<p>' + escape(str(preconditions)) + '</p>' + setup_html)}
{_lesson_section(10,"ENTRY ASSUMPTIONS","Entry options and order type assumptions",entry_html)}
{_lesson_section(11,"RISK LOGIC","Stop placement and position sizing",stop_html)}
{_lesson_section(12,"TARGET MANAGEMENT","Targets and partial management",target_html)}
{_lesson_section(13,"INVALIDATION","Invalidation rules",invalidation_html)}
{_lesson_section(14,"NO-TRADE CONDITIONS","No-trade conditions and common failure modes",no_trade_html + '<div class="mistakes"><b>Common mistakes recorded by source</b><p>' + escape(str(concept.get("commonMistakes") or "No concept-specific mistake list supplied.")) + '</p></div>')}
{_lesson_section(15,"DEFINITION VARIANTS","Conflicting definitions and convention differences",'<p>' + escape(str(variants)) + '</p>')}
{_lesson_section(16,"RELATED CONCEPTS","Related lessons and next step",related_block + next_block)}
{_lesson_section(17,"SOURCE REGISTRY","Verified original ICT, supplemental and discovery resources",'<h3>Verified original ICT uploads</h3>' + official_html + '<h3>Supplemental / unverified candidates</h3>' + supplemental_html + '<h3>General market and regulatory education</h3>' + general_html + '<div class="reference-actions">' + channel_links + '</div>')}
{_lesson_section(18,"PRACTICE","Chart-replay practice task",'<h3>' + escape(str(exercise.get("title") or "Replay assignment")) + '</h3><p class="exercise-task">' + escape(str(exercise.get("task") or "No practice task supplied.")) + '</p><div class="exercise-checks">' + checks_html + '</div><div class="deliverable"><b>Deliverable</b><p>' + escape(str(exercise.get("deliverable") or "Not recorded.")) + '</p></div>')}
{_lesson_section(19,"KNOWLEDGE CHECK","Knowledge questions and self-review",'<fieldset class="academy-quiz" data-academy-quiz><legend>' + escape(str(quiz.get("question") or "Which statement best reflects the concept?")) + '</legend>' + options_html + '<button class="primary-button" type="button" data-check-answer>Check answer</button><p class="quiz-feedback" data-quiz-feedback aria-live="polite"></p></fieldset><div class="self-review"><h3>Self-review checklist</h3>' + criteria + '</div>' + knowledge_more + '<button class="complete-lesson" type="button" data-mark-complete disabled>Complete lesson after exercise + correct answer</button><p class="small-note" data-progress-message>Complete the practice checklist and answer correctly to mark this lesson complete.</p>')}
{_lesson_section(20,"PROVENANCE & VERSIONING","Source notes, author, version and review date",'<p>' + escape(source_note) + '</p>' + provenance)}
<footer class="academy-disclaimer">Educational material only. This lesson is not investment advice, a trading signal, an endorsement or evidence of a profitable edge. Futures are leveraged and can cause substantial losses. Verify contract specifications, costs, session schedules, expiry and regulatory requirements with primary sources before use.</footer>
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
    tracks = academy.get("tracks") or []
    resource_registry = academy.get("resourceRegistry") or []
    root = dist / "ict-futures" / "academy"
    tutorials_root = root / "tutorials"
    tutorials_root.mkdir(parents=True, exist_ok=True)
    for c in concepts:
        slug = re.sub(r"[^a-z0-9-]", "", str(c.get("id") or "").lower())
        if not slug:
            continue
        (root / f"{slug}.html").write_text(render_lesson(c, concepts, site_url, tracks, resource_registry), encoding="utf-8")
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
