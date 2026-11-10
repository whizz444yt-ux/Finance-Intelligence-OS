# Part 9 — Journal, Watchlists, Alerts and Private Workspace

**Goal:** Deliver a reliable private workspace for futures traders, backed by existing Supabase Auth/RLS and without requiring broker credentials or unauthorized data.

## 1. Existing baseline to preserve

The current repository describes Supabase Auth and a private workspace with:
- Cloud journal CRUD.
- Multiple named watchlists and items.
- Research/scenario notes.
- Alert rules and event history.
- User profile/timezone/theme preferences.
- Lesson progress.
- Backtest summaries and trade rows.
- JSON backup export and legacy local-data import.

Inspect live schema, applied migrations and browser behavior before implementing. Do not assume every README-described capability has passed a real end-user signup/sync test. Preserve local originals during import and do not delete user history.

## 2. Workspace modules

### A. Journal
Trade record fields:
- User-owned ID and optional legacy ID.
- Instrument family, exact exchange contract and expiry.
- Side, entry timestamp, exit timestamp, timezone.
- Entry, stop, target, exit values and tick/point unit.
- Contracts and full-size/micro classification.
- Model ID/version, setup/session, HTF bias and liquidity target.
- Planned risk, realized gross P&L, fees, net P&L and R.
- Rule adherence, news/event context and reason for entry/exit.
- Pre-trade plan and post-trade review.
- Chart screenshots/attachments (user-owned).
- Source/backtest run reference where applicable.
- Created/updated time and schema version.

Avoid computing P&L from incomplete contract values. If currency conversion, commission or exit fill is unknown, mark it missing; do not default to zero without a user-visible rule.

### B. Watchlists
- Multiple named watchlists with reorder and duplicate prevention.
- Futures family, exact contract month and optional continuous-symbol alias separately.
- User notes, preferred session, selected data source and display preference.
- Contract roll warnings and inactive/expired symbol state.
- Price fields only when a valid data provider entitlement exists.

### C. Research notes
Use a structured note:
- Instrument/expiry, direction or neutral scenario.
- Thesis and HTF context.
- Liquidity targets/levels.
- Session and model.
- Confirmations, alternative scenario and invalidation.
- News/events and sources.
- Attached screenshot/source references.
- Review date and conclusion.
Notes are research hypotheses, not automated signals.

### D. Alerts
Initial supported alerts should be clearly defined:
- User-entered threshold condition on an observed price.
- Provider event/news notification.
- Session/calendar reminder.
- User-selected level alert, only if market-data provider actually supports background polling/streaming.
- Data-provider unavailable/stale alert.

Each rule has condition, instrument/expiry, source, threshold, comparator, timezone, evaluation cadence, active window, expiry, status and last evaluation timestamp. Alert evaluation against user-entered observation must not be described as automatic real-time price alert.

Automated background email/SMS/push requires a real delivery service, consent, quotas, unsubscribe and retry handling. Browser notifications require site permission and may only work while a page/service worker can legally and technically receive the event. Do not promise delivery from a tab that is closed without a configured backend push scheduler.

### E. Analytics
- Closed trade count and date range.
- Net realized P&L and R based only on valid user records.
- Win rate with denominator and handling of breakeven/partial trades.
- Net profit factor with explicit treatment of zero gross loss.
- Average R, expectancy, drawdown from recorded equity series.
- Performance by model/session/contract/weekday/event regime only when sample sizes are shown.
- Journal completion and rule-adherence trends.

Clearly label these as user-entered journal analytics, not broker-verified results, until broker statement reconciliation exists.

### F. ICT learning progress
- Keep current lesson IDs and lesson content versions.
- Store per-user status, exercise checklist and quiz results.
- Preserve progress when lesson text is updated.
- If lesson version changes materially, mark review-needed rather than silently clearing completion.
- Offline/local progress should sync safely after sign-in.

## 3. Supabase data/security model

Inspect current migrations before proposing new tables. Existing likely resources include profiles, journal trades, watchlists/items, research notes, alert rules/events, lesson progress and strategy backtest runs/trades.

Rules:
- Every private row has user ownership or is linked to a row whose owner is enforced.
- RLS enabled and policies tested with two distinct user accounts.
- A user cannot select, insert, update or delete another user's row by changing an ID.
- Browser uses Supabase publishable/anon key and authenticated JWT.
- No service-role/secret key in browser code.
- Public reference data and private workspace data are separate schemas/policies.
- Use unique indexes for idempotent import/sync.
- Migrations additive and reversible where feasible; backup before high-risk data changes.
- Foreign keys and supporting indexes included; no duplicate table or shadow schema.

For attachments use a private Storage bucket with owner/path policies and signed URLs with short expiry. Validate file type/size, sanitize filenames and avoid storing credentials or sensitive documents without a product need.

## 4. Sync and offline behavior

- Local-first draft only where appropriate; server source-of-truth after successful sync.
- Stable client-generated UUID/idempotency key for retry-safe inserts.
- Conflict policy stated (updated_at/version or explicit conflict resolution); don't silently overwrite newer edits.
- Refresh expiring sessions using supported Supabase auth flow.
- Handle 401, expired refresh token, network loss and revoked session.
- Show pending/synced/failed status.
- Export full private data with timestamp and schema version.
- Import validates records, previews changes and keeps original local data.
- Rate-limit bulk imports and paginate large histories.

## 5. Privacy and user controls

- Clear account deletion/export process, and explain which data is removed.
- Don't collect trading account passwords or exchange credentials.
- Never transmit private journal content to analytics or news vendors.
- Avoid exposing private notes via public route, CDN cache or indexable metadata.
- No secrets in browser logs, query strings or error telemetry.
- Implement least privilege and audit user-facing data access if an admin tool is added.

## 6. Implementation paths

Inspect/update:
- `/account/` page builder and auth/session JS.
- Existing Supabase migrations, RLS, table definitions and Storage buckets.
- Journal, watchlist, research note, alert and progress modules.
- `/tools/` or new `/risk/` UI only for links; do not mix public rule catalogue with private user values.
- Existing local storage keys and legacy import code.
- Tests for ownership, migrations, sync and calculation.
- Privacy/terms/source documentation.

Do not make a migration simply because a new feature name exists; reuse suitable tables or document why a new table is necessary.

## 7. Acceptance criteria

- [ ] Real new-user signup, confirmation, sign-in, sign-out and refresh works.
- [ ] Two-user RLS isolation tests pass for all private entities.
- [ ] Journal CRUD preserves exact contract/expiry and correct P&L units.
- [ ] Watchlists persist and no expired contract is silently presented as active.
- [ ] Research notes support sources and invalidation.
- [ ] Alerts distinguish manual observation vs automated provider-triggered delivery.
- [ ] Alert duplicate suppression and retry behavior are tested.
- [ ] Analytics use valid closed records and display sample count.
- [ ] Lesson progress survives content version changes.
- [ ] Legacy import is retry-safe and never deletes original local data.
- [ ] Export/backup and attachment permissions work.
- [ ] No privileged key is present in browser bundle or repository.

## 8. Part-specific execution prompt

> Execute Part 9 only. Inspect live Supabase schema, applied migrations, current Auth flow, RLS policies and local/legacy data import before changes. Preserve existing user data and table IDs. Implement only missing workspace functionality using additive migrations and owner-scoped policies. Verify isolation with two test users and test session refresh, offline retry, idempotent import, export and attachment privacy. Make price alerts only as capable as the configured data/delivery infrastructure; label manual observed-value alerts honestly. Do not ask for or store broker passwords. Stop after the private workspace is validated.

## Standalone handoff context — use this file by itself

**Repository:** https://github.com/whizz444yt-ux/Finance-Intelligence-OS  
**Product:** Futures Intelligence OS — futures-only markets, ICT futures education, futures news/data, positioning, backtesting, risk and trader workspace.  
**Architecture to inspect and preserve:** static HTML/JavaScript/JSON; Python build at `scripts/build_site.py`; Cloudflare Worker at `cloudflare/src/index.js` with KV; Supabase Postgres/Auth/RLS; Vercel static output `dist/`; GitHub Actions and tests. This is a baseline, not proof each service/credential is currently healthy.

**When this single Part file is the only document supplied:** treat it as the complete request to execute this Part. The user should not need to repeat the repository URL, product purpose or stack. Apply these global rules:
- Execute only the Part named in this file; do not implement another Part.
- Inspect current branch, commit, relevant source, dependencies and runtime first. Actual repo/runtime overrides stale documentation.
- Preserve futures modules, ICT lesson IDs, user data, Auth/RLS, build system and legacy backups. Do not blindly delete/rewrite.
- Futures-only includes CME/ICE listed futures, including currency futures and CME Bitcoin futures. Exclude unrelated equities, generic spot crypto, generic FX/CFD, prediction markets and other non-futures product areas only after dependency audit.
- Never invent prices, volume/OI, specs, expiry, schedules, prop rules, provider capability, licences, API limits or strategy performance.
- Separate real-time, delayed, historical, weekly, cached and unavailable data; display source, frequency and timestamps.
- Keep secrets out of Git/browser; use platform secret stores. Make DB migrations additive; preserve production data. No destructive action without approval.
- Edit canonical source/builders, not generated `dist/`. Use a focused feature branch and reviewable PR, not direct destructive pushes to main.
- Run build, unit tests, structural/security validator and internal-link audit where applicable; add tests and report commands that could not run.
- Verify changed routes/API states, mobile/accessibility, provider freshness/licensing, or RLS according to the Part.
- Complete unblocked work; missing credentials/licenses remain explicitly `NOT CONFIGURED`.
- Never claim a test, deployment or completion without observed evidence.

**Execution:** Read this file fully, inspect the repository and execute only the named Part. Return changed paths, test commands/results, branch/commit/PR, blockers and acceptance checklist. Stop after this Part.
