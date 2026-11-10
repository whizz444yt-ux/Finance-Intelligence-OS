# Part 4 — Session Engine and Economic Calendar

**Goal:** Build one timezone-safe source of truth for ICT sessions, exchange trading schedules and macro/event release times.

## 1. Separate three kinds of time

Do not conflate:
1. **ICT reference windows**: practitioner windows from the playbook.
2. **Exchange trading hours**: official tradable schedule, holidays, maintenance and early closes.
3. **Economic release schedule**: actual release timestamp and exceptions from the releasing agency.

These data sets have different sources and update rules. A killzone is not a guarantee of liquidity or a signal.

## 2. Playbook reference windows

Use the PDF's New York ET definitions as default profile values:
- Asia Range: 20:00–00:00 ET.
- Midnight / True Day Open: 00:00 ET.
- London Killzone: 02:00–05:00 ET.
- London Silver Bullet: 03:00–04:00 ET.
- Forex NY Killzone: 07:00–10:00 ET.
- NY AM reference: 08:30–11:00 ET.
- Cash Open: 09:30 ET.
- AM Silver Bullet: 10:00–11:00 ET.
- London Close: 10:00–12:00 ET.
- NY Lunch avoidance reference: 12:00–13:30 ET.
- Index NY PM: 13:30–16:00 ET.
- PM Silver Bullet: 14:00–15:00 ET.

Store each window with:
`window_id`, `display_name`, `market_scope`, `instrument_families`, `timezone`, `start_local`, `end_local`, `source_id`, `evidence_label`, `active_from`, `active_to`, `notes`.

Use separate profiles for index futures, metals, currency futures and energy. Do not imply the Forex-specific killzone has the same meaning for every futures family.

## 3. Timezone and DST engine

- Persist timestamps in UTC with original exchange timezone and source timezone metadata.
- Store ICT references in IANA `America/New_York`, not hardcoded UTC offset.
- Display in user's preference (default `Asia/Kolkata`) plus optional NY ET.
- Use the runtime's timezone database / reliable date-time library; do not hand-code US DST dates.
- Handle US DST start/end and UK/EU DST transitions independently. London vs New York overlap changes during the weeks when their DST transitions do not align.
- Daylight-saving ambiguous or nonexistent local times must have explicit rules.
- Daily reference candles/levels use the defined NY midnight boundary, not browser locale or broker-server midnight.
- Label session date correctly when session crosses midnight.
- Tests must include days before/after US and UK/EU DST transitions, month/year boundaries and India has no DST.

## 4. Contract-specific exchange schedule

Create a separate exchange calendar feed/registry:
- Regular trading sessions and breaks.
- Holiday closures, early closes, delayed opens.
- Product-specific maintenance windows.
- Special settlement/notice and delivery restrictions.
- Emergency closures and exchange notices.

Primary references are CME/ICE official product trading hours, holiday calendars and notices. Do not copy a static schedule across all products merely because their exchange is related. Show `exchange schedule` and `ICT reference session` as distinct layers on charts.

## 5. Economic event universe

Initial events:
- US CPI / Core CPI / PPI.
- Employment Situation / Nonfarm Payrolls / Unemployment.
- Initial Jobless Claims.
- PCE price index and Personal Income/Outlays.
- Advance GDP and GDP revisions.
- Retail Sales.
- ADP employment estimate (private provider, not official BLS NFP).
- ISM Manufacturing / Services.
- JOLTS.
- FOMC decision, statement, minutes, press conference and speeches.
- Treasury auctions and rate events relevant to ZN.
- EIA Weekly Petroleum Status Report (crude inventories, products, refinery runs and relevant subseries).
- EIA natural gas storage report.
- API petroleum report (private industry source; schedule and access differ).
- ECB rate decisions and press conferences.
- BoE, BoJ, RBA and BoC events relevant to 6B/6J/6A/6C.
- OPEC meetings and official announcements.
- Major exchange expiry/roll/holiday events.

Do not label a private survey as government official data. For each event type define source authority and affected contract families.

## 6. Event schema

```json
{
 "event_id":"provider:event-id",
 "event_type":"US_CPI",
 "title":"Consumer Price Index",
 "country":"US",
 "publisher":"BLS",
 "source_url":"https://www.bls.gov/",
 "scheduled_at_utc":null,
 "scheduled_timezone":"America/New_York",
 "published_at_utc":null,
 "actual_release_at_utc":null,
 "retrieved_at_utc":null,
 "previous_value":null,
 "forecast_value":null,
 "actual_value":null,
 "unit":null,
 "period_label":null,
 "affected_instruments":["NQ","ES","GC","ZN","DX"],
 "importance":"provider-defined-or-editorial",
 "schedule_status":"scheduled",
 "data_class":"official-release",
 "source_revision":null
}
```

Provider forecast fields may be unavailable; null is not zero. Store first-released value and revised value separately where source supports it. Never invent consensus forecast. Store cancelled, postponed, delayed and rescheduled status.

## 7. Calendar UI and event playbook

- Daily/weekly/monthly calendar and chronological feed.
- Filters by country, publisher, contract family and event importance.
- Show local timezone and New York time simultaneously.
- Show actual release time separately from planned time when available.
- Provide source link and retrieval timestamp.
- Show PDF-style T-30 / during / post-event preparation as educational risk checklist, not a trade signal.
- Provide event impact tags (e.g. rates, equity indices, metals, energy, FX futures) with explanation.
- News blackout guidance must be user-configurable and never override current prop-firm rules.

## 8. Schedule ingestion and exception handling

- Pull official agency schedules where machine-readable and permitted.
- Prefer API/ICS/RSS or official page parsing over manually maintained dates.
- Use an admin-maintained exception record when agency schedule is not machine-readable.
- Every manual exception needs official URL, checked date, editor and expiry/confirmation date.
- Recheck event times after federal holidays, government shutdowns, agency notices and data-release delays.
- Store schedule version and do not silently overwrite an event's prior published schedule.
- COT release time/date also belongs in the event calendar: CFTC typically releases at 3:30 PM ET and reports prior-Tuesday positions, but holiday schedules can delay a release. Use CFTC's annually published tentative schedule, not an assumed Friday rule.

## 9. Test matrix

Test:
- 12:00 midnight rollover.
- Sessions crossing ET date boundary.
- US DST spring-forward and fall-back.
- UK/EU DST mismatch window.
- India display conversion.
- Early-close/holiday day.
- Rescheduled EIA/other agency release.
- Duplicate event from multiple sources.
- Missing forecast/actual value.
- Provider unavailable / stale cached schedule.
- Correct session attribution of bars with UTC offset.
- Contract-specific session profile selection.

## 10. Implementation paths

Inspect/update:
- Existing `ict-futures/` session tools and calendar data.
- `data/` calendars, session configs and source metadata.
- `cloudflare/src/index.js` provider routes/cache only if needed.
- `cloudflare/src/economic-providers.js` official data adapters only if needed.
- `scripts/build_site.py` and page JS/CSS.
- Supabase schema only where dynamic events/user reminders require persistence.
- `tests/` DST, holiday, event-normalization and route tests.
- Source and provider register.

Avoid a second unrelated calendar service or hardcoded offsets.

## 11. Acceptance criteria

- [ ] All PDF reference windows are represented with scope and evidence label.
- [ ] Exchange hours, ICT windows and release schedules are separate data sources.
- [ ] UTC storage and IANA zone conversion work for ET/IST.
- [ ] DST transitions are tested, including US/UK mismatch weeks.
- [ ] Official release links and schedule timestamps are visible.
- [ ] Holiday and rescheduled-event exceptions are represented.
- [ ] No forecast/actual values are invented.
- [ ] Contract-specific event relevance is visible.
- [ ] CFTC release schedule and EIA exception behavior are testable.
- [ ] Calendar pages and feeds pass build, link and mobile QA.

## 12. Part-specific execution prompt

> Execute Part 4 only. Inspect existing session tools, time conversion code, calendar sources and event data. Implement one IANA-timezone-aware session engine and a separately sourced economic/exchange calendar. Preserve the PDF reference windows and evidence caveats. Do not hardcode a permanent ET-to-IST offset or future release dates. Implement DST/holiday/reschedule tests and show publisher, scheduled time, actual time, retrieval time and data class distinctly. Keep calendar event content separate from live futures prices and news. Stop after sessions and calendar are validated.
