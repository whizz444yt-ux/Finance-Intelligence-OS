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
    return (
        '<a class="academy-link" href="' + escape(url, quote=True)
        + '" target="_blank" rel="noopener noreferrer">'
        + escape(str(label)) + ' ↗</a>'
    )


def _items(values, ordered=False):
    values = [str(x) for x in (values or []) if str(x).strip()]
    if not values:
        return '<p class="small-note">No item has been supplied in the canonical lesson source.</p>'
    tag = "ol" if ordered else "ul"
    return "<" + tag + ">" + "".join("<li>" + escape(x) + "</li>" for x in values) + "</" + tag + ">"


def _section(number, kicker, title, body, class_name=""):
    cls = "lesson-section" + ((" " + class_name) if class_name else "")
    return (
        f'<section class="{cls}"><div class="section-head"><span>{number:02d}</span>'
        f'<div><p class="eyebrow">{escape(kicker)}</p><h2>{escape(title)}</h2></div></div>'
        f'{body}</section>'
    )


def _progress_markup(slug, title, content_version=2):
    return f'''
    <section class="academy-progress-box" data-academy-lesson="{escape(slug, quote=True)}" data-content-version="{int(content_version)}">
      <div class="progress-head"><div><span class="eyebrow">YOUR STUDY PROGRESS</span><h2>{escape(title)}</h2></div><span class="progress-status" data-progress-status>Not started</span></div>
      <div class="progress-track"><span data-progress-bar></span></div>
      <div class="progress-foot"><span data-progress-copy>0 practice steps checked</span><span data-progress-sync>Saved on this device</span></div>
    </section>'''


def _concept_aliases(concept, curriculum):
    aliases = curriculum.get("aliases") or [concept.get("name", "")]
    return " · ".join(str(x) for x in aliases if x)


def _resource_cards(resources, label):
    cards = []
    for resource in resources or []:
        url = resource.get("url")
        title = resource.get("title") or resource.get("name") or "Reference"
        publisher = resource.get("publisher") or resource.get("type") or "Publisher not recorded"
        note = resource.get("scope") or resource.get("summary") or ""
        status = resource.get("linkStatus") or resource.get("verificationStatus") or "Link health not rechecked"
        cards.append(
            '<article class="reference-item"><div><b>' + escape(str(title)) + '</b>'
            + '<p>' + escape(str(note)) + '</p><small>' + escape(str(publisher))
            + ' · ' + escape(str(status)) + '</small></div>'
            + _link(label, url) + '</article>'
        )
    return "".join(cards) or '<p class="small-note">No mapped resource. Use the source portal as topic discovery only.</p>'


def render_lesson(concept, all_concepts, site_url="", academy=None):
    academy = academy or {}
    learning = concept.get("learning") or {}
    curriculum = concept.get("curriculum") or {}
    refs = learning.get("references") or {}
    related_lookup = {c.get("id"): c for c in all_concepts}
    title_lookup = {c.get("name"): c for c in all_concepts}

    related_ids = curriculum.get("relatedIds") or []
    related_links = []
    for lesson_id in related_ids:
        item = related_lookup.get(lesson_id)
        if item:
            related_links.append(
                '<a class="chip" href="' + escape(lesson_id, quote=True) + '.html">'
                + escape(str(item.get("name") or lesson_id)) + ' →</a>'
            )
    next_id = curriculum.get("nextLessonId")
    next_item = related_lookup.get(next_id)
    next_link = (
        '<a class="academy-link" href="' + escape(next_id, quote=True) + '.html">'
        + 'Next lesson: ' + escape(str(next_item.get("name") or next_id)) + ' →</a>'
        if next_item else ""
    )

    track_by_id = {t.get("id"): t for t in academy.get("tracks", [])}
    track = track_by_id.get(curriculum.get("trackId"), {})
    prerequisites = []
    for prereq_id in curriculum.get("prerequisiteIds") or []:
        item = related_lookup.get(prereq_id)
        if item:
            prerequisites.append(
                '<a class="chip" href="' + escape(prereq_id, quote=True) + '.html">'
                + escape(str(item.get("name") or prereq_id)) + '</a>'
            )

    objectives = _items(learning.get("learningObjectives"), ordered=True)
    rules = _items(curriculum.get("identificationRules") or concept.get("howToUse"), ordered=True)
    setup = _items(curriculum.get("setupSequence") or learning.get("guidedWalkthrough"), ordered=True)
    if not curriculum.get("setupSequence"):
        setup = "".join(
            '<article class="reference-item"><div><b>' + escape(str(step.get("title") or "Study step"))
            + '</b><p>' + escape(str(step.get("instruction") or "")) + '</p></div></article>'
            for step in learning.get("guidedWalkthrough") or []
        ) or setup

    bullish = curriculum.get("bullishExample") or {}
    bearish = curriculum.get("bearishExample") or {}
    chart = curriculum.get("chartIllustration") or {}
    flow = chart.get("flow") or []
    flow_html = "".join(
        '<div class="diagram-step"><span>' + str(i + 1).zfill(2) + '</span><b>'
        + escape(str(step)) + '</b></div>'
        for i, step in enumerate(flow)
    )
    chart_meta = [
        ("Instrument / symbol", chart.get("symbol")),
        ("Expiry", chart.get("expiry")),
        ("Timeframe", chart.get("timeframe")),
        ("Timezone", chart.get("timezone")),
        ("Session", chart.get("session")),
        ("Sample date", chart.get("sampleDate")),
        ("Source / vendor", chart.get("sourceVendor")),
        ("Data status", chart.get("dataStatus")),
    ]
    chart_meta_html = "".join(
        '<div><span>' + escape(str(k)) + '</span><b>' + escape(str(v or "Not supplied")) + '</b></div>'
        for k, v in chart_meta
    )
    family_labels = curriculum.get("instrumentLabels") or curriculum.get("instrumentFamilies") or []
    family_html = "".join('<span class="lesson-pill">' + escape(str(x)) + '</span>' for x in family_labels)
    session_html = "".join('<span class="lesson-pill">' + escape(str(x)) + '</span>' for x in curriculum.get("sessions") or [])
    timeframe_html = "".join('<span class="lesson-pill">' + escape(str(x)) + '</span>' for x in curriculum.get("timeframes") or [])
    purpose_html = "".join('<span class="lesson-pill">' + escape(str(x).replace("-", " ")) + '</span>' for x in curriculum.get("purpose") or [])
    aliases_html = escape(_concept_aliases(concept, curriculum))
    acronym = curriculum.get("acronym") or "—"
    source_evidence = curriculum.get("sourceEvidenceLabel") or ("SOURCED" if "SOURCED" in str(concept.get("evidence","")).upper() else "CONVENTION")
    performance_evidence = curriculum.get("performanceEvidenceLabel")
    evidence = source_evidence + ((" · PERFORMANCE: " + str(performance_evidence)) if performance_evidence else "")
    source_caution = learning.get("sourceCaution") or "Use a predeclared rule and preserve source limitations."
    use_case = concept.get("useCase") or "This concept provides study context. It is not an independent entry signal."
    futures_context = curriculum.get("futuresContext") or {}
    entry = curriculum.get("entryOptions") or {}
    stop = curriculum.get("stopLogic") or {}
    targets = curriculum.get("targets") or {}
    practice = curriculum.get("practice") or learning.get("practicalExercise") or {}
    exercise_checks = practice.get("checklist") or []
    checks_html = "".join(
        '<label class="exercise-check"><input type="checkbox" data-exercise-check value="' + str(i)
        + '"><span>' + escape(str(item)) + '</span></label>'
        for i, item in enumerate(exercise_checks)
    )
    source_refs = {x.get("id"): x for x in academy.get("curriculum", {}).get("resourceRegistry", [])}
    mapped_refs = [source_refs[x] for x in curriculum.get("sourceRefs", []) if x in source_refs]
    official_videos = curriculum.get("videoResources") or refs.get("officialVideos") or []
    official_html = _resource_cards(official_videos, "Open original ICT upload")
    supplemental = curriculum.get("supplementalResources") or refs.get("secondary") or []
    supplemental_html = _resource_cards(supplemental, "Open supplemental reference")
    general_refs = refs.get("generalMarketEducation") or []
    general_html = _resource_cards(general_refs, "Open market education source")
    mapped_html = _resource_cards(mapped_refs, "Open primary source")
    topic_url = curriculum.get("topicDiscoveryUrl") or refs.get("topicDiscovery")
    official_portal = _link("Official ICT channel portal", refs.get("officialChannel"))
    playlist_portal = _link("Official ICT playlists portal", refs.get("officialPlaylists"))
    topic_link = _link("Topic discovery only — not a verified video", topic_url)
    video_note = (
        "An existing curated source mapping is present. The exact upload/uploader and current link status "
        "must be checked before treating it as a verified one-to-one lesson reference."
    )
    quiz = curriculum.get("knowledgeChecks") or learning.get("knowledgeChecks") or []
    quiz_payload = []
    quiz_sections = []
    for i, question in enumerate(quiz):
        options = question.get("options") or []
        quiz_payload.append({
            "correctIndex": question.get("correctIndex", 0),
            "explanation": question.get("explanation", ""),
        })
        option_html = "".join(
            '<label class="quiz-option"><input type="radio" name="answer-' + str(i)
            + '" value="' + str(j) + '"><span>' + escape(str(opt)) + '</span></label>'
            for j, opt in enumerate(options)
        )
        quiz_sections.append(
            '<fieldset class="academy-quiz" data-academy-quiz-question data-question-index="' + str(i) + '">'
            + '<legend>' + escape(str(question.get("question") or "Which statement best describes the concept?")) + '</legend>'
            + option_html + '<button class="primary-button" type="button" data-check-answer data-question-index="' + str(i) + '">Check answer</button>'
            + '<p class="quiz-feedback" data-quiz-feedback aria-live="polite"></p></fieldset>'
        )

    review_html = _items(practice.get("reviewCriteria"), ordered=False)
    invalidation_html = _items(curriculum.get("invalidation"), ordered=True)
    no_trade_html = _items(curriculum.get("noTradeConditions"), ordered=True)
    variants_html = _items(curriculum.get("definitionVariants"), ordered=True)
    preconditions_html = _items(curriculum.get("preconditions"), ordered=True)
    related_html = "".join(related_links) or '<span class="small-note">Related concept IDs are not mapped.</span>'
    aliases_display = aliases_html or "No aliases recorded"
    source_date = curriculum.get("reviewedAt") or "Not reviewed"
    content_version = curriculum.get("contentVersion", 2)
    canonical_url = escape((site_url.rstrip("/") + f"/ict-futures/academy/{concept.get('id')}.html") if site_url else "", quote=True)
    title = str(concept.get("name") or "ICT lesson")
    definition = str(concept.get("definition") or "")

    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} — ICT Futures Academy | Finance Intelligence OS</title>
<meta name="description" content="{escape('Source-traceable futures learning lesson: ' + definition[:145])}">
{f'<link rel="canonical" href="{canonical_url}">' if canonical_url else '<meta name="robots" content="noindex,follow">'}
<meta property="og:type" content="article"><meta property="og:title" content="{escape(title)} — ICT Futures Academy"><meta property="og:description" content="{escape(definition[:180])}">
<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css">
<script defer src="/assets/runtime-config.js"></script><script defer src="/assets/academy-learning.js"></script>
<script type="application/json" id="academyQuizData">{_json_for_script(quiz_payload)}</script>
<script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script>
</head><body>
<header class="academy-top"><a href="/academy/">← All ICT lessons</a><span>FINANCE INTELLIGENCE OS · ICT FUTURES ACADEMY</span><a href="/ict-futures/">Futures terminal ↗</a></header>
<main class="academy-page" data-academy-lesson="{escape(concept.get('id',''), quote=True)}" data-content-version="{int(content_version)}">
<header class="lesson-hero"><div><div class="lesson-tags"><span>{escape(str(track.get('name') or concept.get('category') or 'ICT'))}</span><span>{escape(str(concept.get('level') or 'Study'))}</span><span>{escape(str(learning.get('durationMinutes',20)))} min read</span><span>{escape(str(content_version))} · content version</span></div>
<p class="eyebrow">LESSON {escape(str(concept.get('id') or '').upper())} · {escape(str(acronym))}</p><h1>{escape(title)}</h1><p class="lead">{escape(definition)}</p>
<div class="lesson-aliases"><span class="eyebrow">CANONICAL NAME / ALIASES</span><p>{aliases_display}</p></div>
<div class="lesson-hero-links"><a href="/academy/">Open Academy curriculum →</a>{official_portal}</div></div>
<aside class="evidence-card"><span class="eyebrow">SOURCE / EVIDENCE LABEL</span><strong>{escape(str(evidence))}</strong><p>{escape(str(source_caution))}</p>
<div class="evidence-card-foot"><span class="eyebrow">TRACK</span><b>{escape(str(track.get('name') or curriculum.get('trackId') or 'Not assigned'))}</b></div></aside></header>
{_progress_markup(concept.get('id',''), 'Lesson progress', content_version)}
{_section(1,'CONCEPT IDENTITY','Definition and purpose','<p class="lesson-body-copy">'+escape(definition)+'</p><div class="lesson-purpose"><b>What question does this answer?</b><p>'+escape(str(use_case))+'</p><div class="lesson-pill-row">'+purpose_html+'</div></div>')}
{_section(2,'FUTURES-SPECIFIC CONTEXT','Instrument families and sessions','<h3>Relevant contract families</h3><div class="lesson-pill-row">'+family_html+'</div><h3>Session context</h3><div class="lesson-pill-row">'+session_html+'</div><div class="data-message warn">'+escape(" · ".join(futures_context.get("limitations") or []))+'</div>')}
{_section(3,'PREREQUISITES AND TIMEFRAME ROLE','What to study before this lesson','<div class="related-lessons">'+("".join(prerequisites) or '<span class="small-note">No prerequisite lesson is assigned.</span>')+'</div><h3>Framework timeframe roles</h3><div class="lesson-pill-row">'+timeframe_html+'</div><p>'+escape(str(curriculum.get("timeframeRoleNote") or curriculum.get("timeframeRole",{}).get("note") or ""))+'</p><p class="small-note">'+escape(str(learning.get("prerequisites") or ""))+'</p>')}
{_section(4,'IDENTIFICATION RULES','How to identify the concept',rules)}
{_section(5,'HYPOTHETICAL EXAMPLES','Bullish and bearish study cases','<div class="directional-examples"><article><span class="status-pill good">BULLISH · HYPOTHETICAL</span><h3>'+escape(str(bullish.get("label") or "Bullish example"))+'</h3><p>'+escape(str(bullish.get("text") or "Illustrative only — not historical market data."))+'</p></article><article><span class="status-pill warn">BEARISH · HYPOTHETICAL</span><h3>'+escape(str(bearish.get("label") or "Bearish example"))+'</h3><p>'+escape(str(bearish.get("text") or "Illustrative only — not historical market data."))+'</p></article></div><p class="example-caution">Illustrative example — not historical market data. No market price, trade result or performance claim is implied.</p>')}
{_section(6,'VISUAL LEARNING / REPLAY','Conceptual sequence and chart metadata','<div class="academy-flow-diagram">'+(flow_html or '<div class="diagram-step"><b>Conceptual sequence not supplied.</b></div>')+'</div><div class="chart-meta-grid">'+chart_meta_html+'</div><p class="small-note">Only use factual chart images when instrument, expiry, timeframe, timezone, session, date range, vendor and data status are documented. This schematic contains no market candles or historical prices.</p>')}
{_section(7,'PRECONDITIONS','Before the setup sequence',preconditions_html)}
{_section(8,'SETUP SEQUENCE','Study workflow',setup)}
{_section(9,'ENTRY AND ORDER ASSUMPTIONS','Execution study — no live orders','<span class="status-pill warn">'+escape(str(entry.get("status") or "STUDY ONLY"))+'</span><p>'+escape(str(entry.get("defaultStudy") or "This lesson is not an order instruction."))+'</p>'+_items(entry.get("assumptions")))}
{_section(10,'STOP PLACEMENT AND SIZING','Risk is calculated from the verified contract','<p>'+escape(str(stop.get("rule") or "No fixed stop is provided."))+'</p><p>'+escape(str(stop.get("costs") or ""))+'</p><p>'+escape(str(stop.get("source") or ""))+' <a href="/risk/">Risk &amp; position sizing →</a></p>')}
{_section(11,'TARGETS AND PARTIAL MANAGEMENT','Example management only','<p>'+escape(str(targets.get("rule") or "No target is supplied."))+'</p><p class="small-note">'+escape(str(targets.get("warning") or "Example only; no outcome is promised."))+'</p>')}
{_section(12,'INVALIDATION RULES','What disproves the study',invalidation_html)}
{_section(13,'NO-TRADE CONDITIONS','Common failures and no-trade rules',no_trade_html)}
{_section(14,'DEFINITION VARIANTS','Conflicting sources and terminology',variants_html)}
{_section(15,'RELATED CONCEPTS','Continue the learning chain','<div class="related-lessons">'+related_html+'</div>'+next_link)}
{_section(16,'SOURCES AND VIDEO CLASSIFICATION','Original creator, supplemental and primary references','<h3>Existing curated original ICT upload records</h3>'+official_html+'<p class="small-note">'+escape(video_note)+'</p><h3>Original ICT portals</h3><div class="reference-actions">'+official_portal+playlist_portal+topic_link+'</div><h3>Supplemental sources</h3>'+supplemental_html+'<h3>Exchange, regulator and data references</h3>'+mapped_html+'<h3>General market education</h3>'+general_html)}
{_section(17,'PRACTICE TASK','Chart replay and written deliverable','<h3>'+escape(str(practice.get("title") or "Chart-replay assignment"))+'</h3><p class="exercise-task">'+escape(str(practice.get("task") or "Create a dated chart study using a predeclared rule."))+'</p><div class="exercise-checks">'+checks_html+'</div><div class="deliverable"><b>Save / submit</b><p>'+escape(str(practice.get("deliverable") or "Save annotated screenshots and a written rule sheet."))+'</p></div><h3>Review criteria</h3>'+review_html)}
{_section(18,'SELF-REVIEW AND KNOWLEDGE CHECK','Check understanding and rule discipline','<div class="self-review">'+_items(practice.get("reviewCriteria"))+'</div><div class="quiz-stack">'+("".join(quiz_sections) or '<p class="small-note">No quiz questions supplied.</p>')+'</div><button class="complete-lesson" type="button" data-mark-complete disabled>Complete lesson after exercise + all correct answers</button><p class="small-note" data-progress-message>Complete the practice checklist and answer all questions correctly to complete this current content version. Earlier progress is retained as history.</p>')}
{_section(19,'SOURCE NOTES AND EDITORIAL REVIEW','Provenance, version and maintenance','<p><b>Source note:</b> '+escape(str(concept.get("sourceNote") or source_caution))+'</p><p><b>Editor:</b> Curriculum editorial synthesis · <b>Content version:</b> '+escape(str(content_version))+' · <b>Last reviewed:</b> '+escape(str(source_date))+'</p><p><b>Editorial status:</b> '+escape(str(curriculum.get("editorialStatus") or "Needs review"))+'</p><p class="small-note">The PDF is a secondary synthesis and its own research notes disclose limits in source review. Do not treat its historical session, tick-value, expiry or event-calendar snapshots as current without checking primary exchange/regulator sources.</p>')}
<footer class="academy-disclaimer">Educational material only. This lesson is not investment advice, a signal or a recommendation. Futures are leveraged and can cause substantial losses. Independently verify the exchange's current contract terms, trading hours, expiry, margin and data permissions.</footer>
</main></body></html>'''


def render_tutorial(tutorial, all_concepts, site_url="", academy=None):
    concepts = {c.get("id"): c for c in all_concepts}
    related = [concepts[i] for i in tutorial.get("conceptIds", []) if i in concepts]
    steps = "".join(
        '<li><b>Step ' + str(i + 1) + '</b><p>' + escape(str(x)) + '</p></li>'
        for i, x in enumerate(tutorial.get("steps") or [])
    )
    materials = _items(tutorial.get("materials"))
    review = tutorial.get("review") or []
    review_html = "".join(
        '<label class="exercise-check"><input type="checkbox" data-exercise-check value="' + str(i)
        + '"><span>' + escape(str(x)) + '</span></label>'
        for i, x in enumerate(review)
    )
    related_html = "".join(
        '<a class="academy-link" href="/ict-futures/academy/' + escape(str(c.get("id", "")), quote=True)
        + '.html">' + escape(str(c.get("name", "Lesson"))) + ' →</a>'
        for c in related
    )
    canonical = escape((site_url.rstrip("/") + f"/ict-futures/academy/tutorials/{tutorial.get('id')}.html") if site_url else "", quote=True)
    content_version = int(tutorial.get("contentVersion", 2))
    prereq_tracks = tutorial.get("prerequisiteTrackIds") or []
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(tutorial.get('title','ICT tutorial'))} — Guided ICT Futures Tutorial</title><meta name="description" content="{escape(str(tutorial.get('objective') or '')[:160])}">
{f'<link rel="canonical" href="{canonical}">' if canonical else '<meta name="robots" content="noindex,follow">'}
<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css"><script defer src="/assets/runtime-config.js"></script><script defer src="/assets/academy-learning.js"></script>
<script type="application/json" id="academyQuizData">[]</script>
<script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script></head><body>
<header class="academy-top"><a href="/ict-futures/academy/tutorials/">← Tutorial library</a><span>GUIDED ICT PRACTICE · VERSION {content_version}</span><a href="/academy/">Academy dashboard ↗</a></header>
<main class="academy-page" data-academy-lesson="tutorial-{escape(tutorial.get('id',''),quote=True)}" data-content-version="{content_version}">
<header class="lesson-hero"><div><div class="lesson-tags"><span>{escape(tutorial.get('level','Study'))}</span><span>{escape(tutorial.get('duration','Practice'))}</span><span>REPLAY / PRACTICE</span></div><p class="eyebrow">GUIDED TUTORIAL</p><h1>{escape(tutorial.get('title','ICT tutorial'))}</h1><p class="lead">{escape(tutorial.get('objective',''))}</p></div><aside class="evidence-card"><span class="eyebrow">TUTORIAL MATERIALS</span>{materials}<p>Track prerequisites: {escape(", ".join(prereq_tracks))}</p></aside></header>
{_progress_markup('tutorial-'+tutorial.get('id',''), 'Tutorial progress', content_version)}
{_section(1,'WORKFLOW','Follow the practice sequence','<ol class="walkthrough">'+steps+'</ol>')}
{_section(2,'DELIVERABLE','What to create','<p>'+escape(tutorial.get('deliverable','Save a dated chart pack and written rule sheet.'))+'</p><h3>Quality review</h3><div class="exercise-checks">'+review_html+'</div><button class="complete-lesson" type="button" data-mark-complete disabled>Complete tutorial after review</button><p class="small-note" data-progress-message>Check all review items to complete this tutorial. Earlier progress is retained when tutorial content changes.</p>')}
{_section(3,'CONCEPT LIBRARY','Relevant lessons','<div class="reference-actions">'+related_html+'</div>')}
<footer class="academy-disclaimer">Use this tutorial for historical chart study and rule writing. Do not infer an edge or trade from a practice example. Futures are leveraged and can cause substantial losses.</footer>
</main></body></html>'''


def validate_academy(academy):
    concepts = academy.get("concepts") or []
    tracks = academy.get("tracks") or []
    program = academy.get("learningProgram") or {}
    tutorials = program.get("tutorials") or []
    curriculum = academy.get("curriculum") or {}
    errors = []
    by_id = {c.get("id"): c for c in concepts if c.get("id")}
    ids = [c.get("id") for c in concepts]
    if len(ids) != len(set(ids)):
        errors.append("duplicate or missing concept IDs")
    if len(tracks) != 10:
        errors.append(f"expected 10 learning tracks, found {len(tracks)}")
    if len(tutorials) != 9:
        errors.append(f"expected 9 guided tutorials, found {len(tutorials)}")
    preserved = curriculum.get("preservedConceptIds") or []
    if len(preserved) != 76 or any(x not in by_id for x in preserved):
        errors.append("the 76 preserved concept IDs are missing or altered")
    track_ids = {t.get("id") for t in tracks}
    track_position = {t.get("id"): i for i, t in enumerate(tracks)}
    tutorial_ids = {t.get("id") for t in tutorials}
    seen = []
    lesson_order = {}
    for track in tracks:
        if not all([track.get("id"), track.get("name"), track.get("level")]):
            errors.append("a track is missing its ID/name/level")
        if not isinstance(track.get("readingMinutes"), int) or not isinstance(track.get("practiceMinutes"), int):
            errors.append(f"track effort estimate missing: {track.get('id')}")
        if not track.get("completionCriteria"):
            errors.append(f"track completion criteria missing: {track.get('id')}")
        for prereq in track.get("prerequisites") or []:
            if prereq not in track_ids:
                errors.append(f"unknown track prerequisite {track.get('id')} -> {prereq}")
            elif track_position.get(prereq, 10**6) >= track_position.get(track.get("id"), -1):
                errors.append(f"track prerequisite must point to an earlier track: {track.get('id')} -> {prereq}")
        for tutorial_id in track.get("tutorialIds") or []:
            if tutorial_id not in tutorial_ids:
                errors.append(f"track references unknown tutorial: {track.get('id')} -> {tutorial_id}")
        for position, lesson_id in enumerate(track.get("sequence") or []):
            seen.append(lesson_id)
            if lesson_id not in by_id:
                errors.append(f"track references unknown lesson: {lesson_id}")
            else:
                lesson_order[lesson_id] = (track.get("id"), position)
    if len(seen) != len(set(seen)):
        errors.append("a concept is assigned to more than one learning track")
    if set(seen) != set(ids):
        errors.append("every active concept must be assigned exactly once across tracks 1–9")
    resource_registry = curriculum.get("resourceRegistry") or []
    resource_ids = {r.get("id") for r in resource_registry}
    if curriculum.get("resourceRegistryCount") not in (None, len(resource_registry)):
        errors.append("resource registry count does not match its records")
    for resource in resource_registry:
        url = _safe_href(resource.get("url"))
        if not url:
            errors.append(f"invalid resource URL: {resource.get('id')}")
    for concept in concepts:
        lesson_id = concept.get("id")
        c = concept.get("curriculum") or {}
        if c.get("trackId") not in track_ids:
            errors.append(f"unknown track for {lesson_id}")
        if not c.get("aliases") or not c.get("purpose") or not c.get("instrumentFamilies") or not c.get("timeframes"):
            errors.append(f"curriculum discovery metadata missing for {lesson_id}")
        if c.get("sourceEvidenceLabel") not in ("SOURCED", "CONVENTION"):
            errors.append(f"unknown source evidence label for {lesson_id}")
        if c.get("performanceEvidenceLabel") not in (None, "NO DATA", "HYPOTHESIS", "TESTED"):
            errors.append(f"unknown performance evidence label for {lesson_id}")
        if c.get("performanceEvidenceLabel") == "TESTED" and not c.get("testArtifact"):
            errors.append(f"TESTED lesson lacks reproducible test artifact: {lesson_id}")
        required_metadata = ("aliases", "purpose", "instrumentFamilies", "timeframes", "sessions", "prerequisiteIds", "identificationRules", "preconditions", "setupSequence", "invalidation", "noTradeConditions", "definitionVariants", "sourceRefs", "bullishExample", "bearishExample", "chartIllustration", "entryOptions", "stopLogic", "targets", "practice", "knowledgeChecks", "contentVersion")
        if any(not c.get(field) for field in required_metadata):
            errors.append(f"full lesson metadata missing for {lesson_id}")
        chart = c.get("chartIllustration") or {}
        if any(not chart.get(field) for field in ("symbol", "expiry", "timeframe", "timezone", "session", "sampleDate", "sourceVendor", "dataStatus")):
            errors.append(f"chart illustration metadata incomplete for {lesson_id}")
        for prereq in c.get("prerequisiteIds") or []:
            if prereq not in by_id:
                errors.append(f"broken prerequisite {lesson_id} -> {prereq}")
            elif lesson_id in lesson_order and prereq in lesson_order:
                current_track, current_position = lesson_order[lesson_id]
                prereq_track, prereq_position = lesson_order[prereq]
                track_positions = {t.get("id"): i for i, t in enumerate(tracks)}
                if track_positions[prereq_track] > track_positions[current_track] or (prereq_track == current_track and prereq_position >= current_position):
                    errors.append(f"prerequisite order is not forward-only: {lesson_id} -> {prereq}")
        for ref in c.get("sourceRefs") or []:
            if ref not in resource_ids:
                errors.append(f"unknown source registry ID {lesson_id} -> {ref}")
        questions = c.get("knowledgeChecks") or []
        if not 3 <= len(questions) <= 5:
            errors.append(f"expected 3–5 knowledge checks for {lesson_id}")
        for question in questions:
            options = question.get("options") or []
            correct = question.get("correctIndex")
            if len(options) < 3 or not isinstance(correct, int) or correct < 0 or correct >= len(options) or not question.get("explanation"):
                errors.append(f"invalid knowledge check for {lesson_id}")
        if c.get("contentVersion", 0) < 2:
            errors.append(f"missing content version 2 for {lesson_id}")
        for resource in (c.get("videoResources") or []):
            if not _safe_href(resource.get("url")):
                errors.append(f"invalid exact video URL in {lesson_id}")
    for tutorial in tutorials:
        if not tutorial.get("trackId") or tutorial.get("trackId") not in track_ids:
            errors.append(f"tutorial not assigned to a track: {tutorial.get('id')}")
        elif tutorial.get("id") not in (next((t.get("tutorialIds", []) for t in tracks if t.get("id") == tutorial.get("trackId")), [])):
            errors.append(f"tutorial track mapping is incomplete: {tutorial.get('id')}")
        if not all(x in by_id for x in tutorial.get("conceptIds") or []):
            errors.append(f"tutorial has unknown concept ID: {tutorial.get('id')}")
        if len(tutorial.get("steps") or []) < 4 or not tutorial.get("deliverable") or len(tutorial.get("review") or []) < 3:
            errors.append(f"tutorial workflow incomplete: {tutorial.get('id')}")
    if errors:
        raise ValueError("Academy contract validation failed:\\n- " + "\\n- ".join(errors))
    return {"concepts": len(concepts), "tracks": len(tracks), "tutorials": len(tutorials), "preserved": len(preserved)}


def build_academy(dist: Path, academy: dict, site_url=""):
    validate_academy(academy)
    concepts = academy.get("concepts") or []
    root = dist / "ict-futures" / "academy"
    tutorials_root = root / "tutorials"
    tutorials_root.mkdir(parents=True, exist_ok=True)
    for concept in concepts:
        slug = re.sub(r"[^a-z0-9-]", "", str(concept.get("id") or "").lower())
        if not slug:
            continue
        (root / f"{slug}.html").write_text(render_lesson(concept, concepts, site_url, academy), encoding="utf-8")
    program = academy.get("learningProgram") or {}
    tutorials = program.get("tutorials") or []
    for tutorial in tutorials:
        slug = re.sub(r"[^a-z0-9-]", "", str(tutorial.get("id") or "").lower())
        if slug:
            (tutorials_root / f"{slug}.html").write_text(render_tutorial(tutorial, concepts, site_url, academy), encoding="utf-8")
    tutorial_cards = "".join(
        '<a class="module-card" href="' + escape(str(t.get("id") or "")) + '.html">'
        '<span class="card-eyebrow">' + escape(str(t.get("level") or "Tutorial")) + ' · '
        + escape(str(t.get("duration") or "")) + '</span><h3>' + escape(str(t.get("title") or ""))
        + '</h3><p>' + escape(str(t.get("objective") or ""))
        + '</p><span class="card-cta">Open tutorial →</span></a>'
        for t in tutorials
    )
    tutorial_index = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICT Guided Tutorials — Finance Intelligence OS</title><meta name="description" content="Nine guided chart exercises, replay workflows and evidence-led review assignments for ICT futures study.">{f'<link rel="canonical" href="{escape(site_url.rstrip("/")+"/ict-futures/academy/tutorials/")}">' if site_url else '<meta name="robots" content="noindex,follow">'}<link rel="stylesheet" href="/assets/site-shell.css"><link rel="stylesheet" href="/assets/academy-learning.css"><script>window.si = window.si || function () {{ (window.siq = window.siq || []).push(arguments); }};</script><script defer src="/_vercel/speed-insights/script.js"></script></head><body><header class="academy-top"><a href="/academy/">← Academy dashboard</a><span>ICT GUIDED TUTORIALS</span><a href="/ict-futures/">Futures terminal ↗</a></header><main class="academy-page"><header class="lesson-hero"><div><p class="eyebrow">PRACTICE WORKBOOKS</p><h1>Guided ICT tutorials</h1><p class="lead">Nine preserved study paths with practical tasks, chart-replay workflows, deliverables and review criteria. Completion is not evidence of strategy performance.</p></div></header><section class="tutorial-grid">{tutorial_cards}</section></main></body></html>'''
    (tutorials_root / "index.html").write_text(tutorial_index, encoding="utf-8")
