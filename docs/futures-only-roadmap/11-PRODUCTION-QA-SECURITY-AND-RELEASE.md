# Production QA, Security and Release Runbook

**Purpose:** A release is production-ready only when source, generated build, GitHub CI, Vercel, Cloudflare, Supabase and data-provider behavior have all been verified for the exact commit.

## 1. Environments

- Local: build/test only; use synthetic or permitted sample data.
- Preview: Vercel preview deployment with noindex and access protection.
- Production: known Vercel project/domain, deployed from the approved main commit.
- Cloudflare development/preview Worker: separate KV namespace and secret set where feasible; never allow preview to write production data.
- Supabase local/test project: migrations and RLS test fixtures.
- Supabase production: applied migration history and backed-up user data.

Never point a preview branch at production ingestion writes by default.

## 2. GitHub workflow

1. Create feature branch from current main.
2. Make focused commit(s) for one Part.
3. Run local quality commands.
4. Push branch and inspect CI on exact commit.
5. Review changed files/diff and any generated artifacts.
6. Open PR with summary, test evidence, migrations, secrets needed, risk and rollback.
7. Wait for required checks and human review.
8. Merge using repository's configured strategy.
9. Verify main CI and release version consistency.
10. Tag only after tests and release checklist pass.

Never force-push main, overwrite another contributor's changes, or merge with failing required checks. Avoid broad mixed-purpose commits.

## 3. Required repository quality commands

Existing documented commands:
```bash
python3 scripts/build_site.py
python3 -m unittest discover -s tests -v
python3 scripts/validate.py
python3 scripts/audit_internal_links.py
```

If command/package/tooling changes, update CI consistently. Capture full outputs and exit codes. Also perform:
- JavaScript syntax checks for affected scripts/Worker modules.
- JSON/schema validation for data files.
- SQL migration syntax and RLS policy tests.
- Link audit for external source links, rate-limited and safely throttled.
- Route inventory vs generated `dist/`.
- Missing asset, duplicate title/ID, source attribution and noindex checks.
- Secret scanning and dependency review.
- Build twice and compare deterministic artifacts where applicable.

## 4. Production smoke-test matrix

### Site
- Homepage, all primary pages and all 15 contract profiles.
- Every Academy index, lesson, tutorial and related link.
- Entry model pages and session tools.
- Futures news, macro calendar, COT and Data Health.
- Strategy Lab upload and results export.
- Risk calculator and prop-firm records.
- Account Auth, journal, watchlist, alerts, notes and export.
- Mobile layout and keyboard-only navigation.
- 404/redirects, robots, sitemap, canonical URL, PWA manifest/service worker.

### API
- `/health`, `/api/v1/health`, `/api/v1/providers`.
- News and source list.
- Macro providers individually.
- CFTC TFF and Disaggregated variants.
- Market data status and any licensed bars route.
- Ingestion success, missing credential, bad token, rate limit and upstream failure.
- Cache age, stale fallback and no-data responses.
- CORS exact allowed origin and rejected origin.
- No secret leak in response/error/log.

### Supabase
- Signup/confirmation/login/logout and token refresh.
- Authenticated owner CRUD.
- Anonymous access denied for private records.
- User A cannot read/change User B rows.
- Historical economic reads respect policy.
- Worker writes use server secret only.
- Migrations applied in correct order and remote migration history matches repo.
- Backup/restore or rollback tested before high-impact migration.

## 5. Visual and browser QA

For every changed page capture:
- Desktop wide viewport.
- Tablet viewport.
- Mobile viewport.
- Loading, empty, error, stale and populated state for data modules where practical.

Check:
- No horizontal page overflow (tables may scroll inside their container).
- No clipped labels or hidden actions.
- Readable chart axes and units.
- Focus visibility and tab order.
- Reduced-motion preference.
- External links accessible and safe target behavior.
- Console errors and failed network requests.
- No placeholder market numbers or skeletons stuck forever.

## 6. Deployment verification

Vercel:
- Correct repository, branch, commit SHA, build command and output directory.
- Build logs have no warning/error hidden by overall status.
- Production deployment status is READY and tied to approved commit.
- Primary alias/domain returns expected status.
- Preview remains protected/noindex.
- All required routes return content, not default homepage or 404.
- SITE_URL/canonical/robots/sitemap use real current production origin.
- Verify cache headers and stale asset/service-worker invalidation.
- Confirm commercial usage plan is compliant before monetized/public commercial launch; Hobby is personal/non-commercial only under Vercel terms.

Cloudflare:
- Worker deployed version and code correspond to intended commit.
- KV namespace binding correct for environment.
- Cron configured and runs UTC schedule.
- Allowed origins exact; no wildcard.
- Secrets presence checked by safe boolean status, never value.
- Provider TTL/freshness and real last-success timestamp visible.
- Worker logs and error handling checked.

Supabase:
- Project/environment matches target.
- Migration list checked before push.
- RLS and security advisors reviewed.
- Auth redirect URLs/email deliverability checked.
- Database/Storage backup and quota status checked.

## 7. Observability and operational SLOs

Track separately:
- Site uptime/response time.
- Worker uptime/error rate.
- Each provider availability/freshness.
- Ingestion run success/rows/duration.
- Last valid market-data timestamp per vendor.
- Cache hit/miss and rate-limit responses.
- Supabase write failures/quota.
- User-facing error frequency.

Do not claim "24/7 live data" from a 24/7 website uptime. Define separate freshness objectives by provider frequency. For example, a weekly COT report should not be expected to refresh every minute.

## 8. Rollback

- Keep previous Vercel production deployment available for instant rollback.
- Revert code in Git with a new commit; do not rewrite history.
- Worker version rollback through deployment history, confirming Worker secrets/bindings compatibility.
- Database changes use backward-compatible additive migrations; do not drop/rename a live column until all old application versions stop using it.
- Keep source data snapshots and migration backups for high-impact changes.
- Rollback plan must name owner, trigger, exact prior commit/deployment and data impact.

## 9. Launch sign-off evidence

Each release report contains:
- Exact branch, commit SHA and deployed commit SHA.
- Part scope and changed paths.
- CI job links and result summary.
- Test commands and exit codes.
- Vercel production URL and status.
- Cloudflare Worker version and health result.
- Supabase project environment, migration state and RLS evidence.
- Provider list with configured/fresh/stale/unavailable/not-configured state.
- Licensing/redistribution decisions.
- Desktop/tablet/mobile screenshots.
- Known gaps and rollback reference.

## 10. Acceptance criteria

- [ ] All required automated checks green on exact commit.
- [ ] Changed pages and routes manually smoke-tested.
- [ ] Preview/production separation verified.
- [ ] Worker/Cron/KV/secrets verified in correct environment.
- [ ] Supabase migrations/RLS/Auth verified.
- [ ] Provider freshness and data classes correct.
- [ ] No secret, license violation, fabricated data or misleading live label.
- [ ] No console/network critical errors.
- [ ] Rollback route identified and executable.
- [ ] README, release notes and deployment status match reality.

## 11. Release prompt

> Perform production QA and release validation only for the requested commit. Inspect current GitHub CI, Vercel deployment, Cloudflare Worker/KV/Cron, Supabase migrations/RLS/Auth and configured provider states. Do not assume docs mean a service is deployed or credentials exist. Execute the applicable build/tests, inspect exact deployment commit and smoke-test routes/APIs. Report successful checks separately from untested or blocked checks. Do not change production secrets, database data, plan/billing or domain settings without explicit authorization. Do not claim launch complete if any required gate remains unresolved.
