# Part 2 — Complete ICT Academy and Futures Learning Knowledge Base

**Goal:** Turn the ICT material in the 39-page Futures Playbook and existing 76 lesson IDs / nine tutorials into a source-traceable learning library specifically for listed futures.

## 1. Learning architecture

Organize the Academy as a prerequisite-based curriculum, not a pile of unrelated glossary cards. Keep existing concept IDs and routes where possible; add metadata and lesson objects rather than replacing stable IDs.

Required top-level tracks:
1. Foundations and futures market mechanics.
2. Market structure and dealing ranges.
3. Liquidity and draw on liquidity.
4. Displacement and imbalances.
5. PD Arrays: FVG, OB, breaker and related zones.
6. Time, sessions and daily/weekly narratives.
7. Entry models and execution checklists.
8. Cross-market futures SMT and confirmation.
9. Futures contract, roll and risk application.
10. Replay, journaling and evidence-based model evaluation.

Every track identifies prerequisites, intended skill level, estimated reading/practice effort (as editorial estimates), and completion criteria. Lessons should be searchable by concept, acronym, instrument, model, timeframe, session, bias direction and evidence label.

## 2. PDF concept inventory to preserve and expand

### Structure and directional context
- Swing high / swing low; dealing range; BOS; MSS; CHoCH terminology distinction.
- Displacement: candle body/wick characteristics, structure close and imbalance left behind.
- HTF bias and draw on liquidity.
- Internal Range Liquidity (IRL) and External Range Liquidity (ERL).

### Liquidity
- Buy-side liquidity (BSL), sell-side liquidity (SSL).
- Equal highs (EQH), equal lows (EQL).
- PDH/PDL, PWH/PWL; prior monthly/yearly levels only if included in future scope and correctly defined.
- Session highs/lows; old swing highs/lows; trendline liquidity and round-number liquidity as convention where applicable.
- Sweep/raid versus accepted breakout/liquidity run.
- Judas Swing and session-open manipulation.
- 20/40/60 trading-day IPDA lookback framing.

### Imbalances and PD Arrays
- Bullish and bearish Fair Value Gap (FVG).
- Consequent Encroachment (CE); wick-versus-close mitigation convention.
- Inversion FVG (IFVG).
- Balanced Price Range (BPR).
- Volume imbalance.
- Higher-timeframe FVG.
- First Presented FVG (FPFVG), labelled convention unless exact source definition is verified.
- Liquidity void.
- Order Block (OB), mean threshold, body-versus-wick definition.
- Breaker block, mitigation block, rejection block and Unicorn overlap.

### Range, Fibonacci and anchors
- Premium, Discount, Equilibrium.
- OTE using 0.62–0.79 / 0.705 reference band and 0.618/0.786 Fibonacci convention distinction.
- NWOG and NDOG; explicitly distinguish these from FVG.
- Midnight / True Day Open, 8:30 ET data open and 9:30 ET cash open.
- CBDR, Asian Range, Flout and standard-deviation projections; explain their original market context and futures-specific caveats.

### Narrative, time and entry
- Power of Three / AMD: Accumulation, Manipulation, Distribution.
- Judas Swing.
- Killzones and Silver Bullet windows.
- Weekly profiles: Classic Tuesday Low/High, Wednesday Low/High, Consolidation Thursday Reversal, Consolidation Midweek Rally, Wednesday Weekly Reversal.
- Entry models: Liquidity Sweep + MSS, Silver Bullet, ICT 2022 Model, Judas + MSS, Unicorn, FVG continuation, IFVG model, FVG + OTE, SMT-assisted setup.
- SMT divergence: NQ/ES/YM, 6E/6B/DX (inverse DX comparison), GC/SI; exact expiry, aligned swing time and event/correlation caveats.

## 3. Lesson-page specification

Every dedicated concept page must include, in this order:

1. Canonical concept name, aliases, acronym and evidence label.
2. Plain-language definition.
3. What question the concept is intended to answer (bias, location, timing, trigger, entry zone, target or risk).
4. Futures-specific context: which contract families use it, session context and known limitations.
5. Prerequisite concepts and timeframe role (HTF context / setup / execution), clearly labelled as framework convention when not an official universal rule.
6. Identification rules stated in testable language.
7. Bullish example and bearish example, both explicitly hypothetical.
8. Chart illustration or annotated replay image with instrument, expiry, timeframe, timezone, data source and sample date.
9. Preconditions and full setup sequence.
10. Entry options and order type assumptions; no live order execution.
11. Stop placement logic and position-sizing link.
12. Targets and partial management, labelled as example rather than promise.
13. Invalidation rules.
14. No-trade conditions and common failure modes.
15. Conflicting definitions and wick-versus-close variants.
16. Related concepts and next lesson.
17. Verified original ICT video (only exact verified upload), supplemental video/article sources separately labelled, each with title, publisher, URL, verification date and link status.
18. Practice task using chart replay or a supplied hypothetical dataset.
19. Self-review checklist and 3–5 knowledge-check questions with answer rationale.
20. Source notes, author/editor, content version and last reviewed date.

No video may be labelled "Official ICT" because its title or thumbnail looks relevant. Verify uploader/channel and the exact video. A search result or playlist topic link may be labelled "Topic discovery" only.

## 4. Evidence and terminology governance

Retain the PDF's labels and add a source-strength note:
- `SOURCED`: source URL and exact claim are recorded; distinguish primary exchange/regulator from secondary article.
- `CONVENTION`: community practice or synthesis, not a canonical deterministic rule.
- `NO DATA`: independently audited public performance evidence not located.
- `HYPOTHESIS`: a testable proposed interpretation.
- `TESTED`: only when a reproducible test artifact exists, with dataset, dates, costs, rules, sample size and out-of-sample results linked.

Do not convert the PDF's descriptive popularity statements into win-rate claims. Its Reality Check says no audited public statistics establish a best model; Judas examples in spot gold and BTC are not futures proof. Display that warning on Entry Models and contract profiles, not only in a footer.

## 5. Content data model

Extend the existing Academy JSON / build input rather than hardcoding long lesson copy in `scripts/build_academy.py`.

Suggested lesson object:
```json
{
  "id": "stable-existing-id",
  "title": "Fair Value Gap",
  "slug": "fair-value-gap",
  "track": "imbalances-and-pd-arrays",
  "aliases": ["FVG"],
  "level": "intermediate",
  "prerequisites": ["market-structure", "displacement"],
  "purpose": ["entry-zone"],
  "instrument_families": ["equity-index", "metals", "currency-futures"],
  "timeframes": ["1H", "15M", "5M", "1M"],
  "evidence_label": "SOURCED",
  "definitions": [],
  "identification_rules": [],
  "bullish_example": {},
  "bearish_example": {},
  "setup_sequence": [],
  "invalidation": [],
  "failure_modes": [],
  "source_refs": [],
  "video_resources": [],
  "practice": {},
  "quiz": [],
  "content_version": 1,
  "reviewed_at": null
}
```

Use JSON Schema validation (or equivalent repository-native validation) to reject missing IDs, malformed URLs, unknown evidence labels, empty source references for sourced claims and broken prerequisite IDs. Avoid breaking the existing 76 stable concept IDs, lesson progress references or routes.

## 6. Source and video registry

Create or extend a normalized resource registry with:
- resource ID, title, publisher/creator, URL, resource type, concept tags, contract tags, language, original/supplemental classification, exact-upload verification status, verified timestamp, checked-by and link health.
- Prefer ICT's own verified uploads for original teaching, CME/ICE for market mechanics, CFTC for positioning, BLS/BEA/EIA/FRED/Fed/ECB for official releases, and secondary educators only for explanatory supplements.
- Do not embed content or download/rehost videos without rights. Use outbound links and permitted embeds only.
- Add YouTube search/topic discovery URLs only when no exact video has been verified; label them honestly.

## 7. Visual learning and replay

Use chart images from authorized sources, original diagrams or user-owned screenshots. A chart figure must show symbol, expiry or continuous mapping policy, timeframe, ET/local timezone, session, date range, source/vendor, and whether the data is historical/delayed/live. Never create fake candlestick shapes to illustrate a factual market event. Hypothetical diagrams must say "Illustrative example — not historical market data".

## 8. Build and routes

Inspect and update:
- `scripts/build_academy.py` — generate lesson pages from structured data.
- Existing Academy JSON and `data/` content source — canonical concept definitions.
- `academy/` index and `ict-futures/academy/` existing lesson URLs — route compatibility.
- Existing tutorial workbook data and routes — retain and revise where relevant.
- `scripts/validate.py` — schema, prerequisites, evidence label, source and content version checks.
- `tests/test_build.py` — route generation and lesson count/ID stability.
- Sitemap, search index and Academy navigation.

Do not duplicate all Academy pages in two separate source systems. Establish one canonical content source and generate compatibility pages/indexes.

## 9. Acceptance criteria

- [ ] All 76 existing concept IDs survive or have a documented migration map.
- [ ] Every PDF concept and glossary term maps to a lesson, glossary entry or explicit out-of-scope reason.
- [ ] Every lesson uses the full page specification and carries provenance.
- [ ] All existing tutorials remain reachable.
- [ ] Original ICT video links are only labelled verified after exact uploader/video review.
- [ ] Supplemental and topic-discovery links are visibly distinguished.
- [ ] Hypothetical examples cannot be mistaken for market history.
- [ ] No model profitability or ranking claim is made without a linked test.
- [ ] Search, prerequisites, related lessons, quiz and completion progress work.
- [ ] Lesson content versioning does not erase existing user progress.
- [ ] Build, schema validation, tests and internal/external link checks pass.

## 10. Part-specific execution prompt

> Execute Part 2 only. Audit all current Academy data, the 76 stable IDs, nine tutorials, generated routes, progress sync and the 39-page playbook. Build a complete traceability inventory before editing. Enrich the canonical lesson source with the full lesson schema and all playbook concept families; preserve IDs and user progress. Verify exact original ICT video URLs, label secondary material separately, and attach primary sources where available. Preserve SOURCED / CONVENTION / NO DATA distinctions and never invent best-model performance. Implement build/schema tests, route tests, source checks and accessibility. Stop after Academy content and navigation are complete; do not implement the Strategy Lab or contract-engine logic in this Part.
