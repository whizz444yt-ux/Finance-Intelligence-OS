# Release and production sign-off checklist

## Code and release
- [ ] Confirm the feature PR has been merged into main.
- [ ] Confirm GitHub Actions quality gates are green on the merge commit.
- [ ] Confirm package.json, homepage badge and Service Worker cache use the same version.
- [ ] Create the matching vX.Y.Z tag only after version consistency checks pass.
- [ ] Confirm the tag-triggered workflow publishes a GitHub Release.

## Vercel
- [ ] Confirm latest production deployment is Ready and linked to the expected main commit.
- [ ] Confirm canonical SITE_URL matches the public production alias.
- [ ] Confirm Production is publicly accessible and Preview remains protected.
- [ ] Open every primary route and check for missing assets, 404s and client-side errors.
- [ ] Verify Speed Insights after real visitor traffic is collected.

## Cloudflare
- [ ] Confirm Worker source version, KV namespace and 30-minute Cron are deployed.
- [ ] Configure server-side secrets in Cloudflare only; never commit them.
- [ ] Test /health, /api/v1/providers, news, macro and COT endpoints.
- [ ] Verify ingestion logs, provider freshness and Supabase upserts after one real run.

## Supabase
- [ ] Confirm all repository migrations are applied to the active project.
- [ ] Confirm RLS and security advisors remain clean.
- [ ] Test a real user signup, confirmation, login, logout and cross-device session refresh.
- [ ] Test owner-scoped journal, watchlist, notes, alert and lesson-progress reads/writes.
- [ ] Reconcile the 15 imported contract specifications against official exchange sources.

## Market-data boundaries
- [ ] Do not describe cached public snapshots as real-time exchange data.
- [ ] Do not publish a futures strategy performance ranking without reproducible OOS evidence.
- [ ] Confirm data source licensing and redistribution rights before exposing exchange feeds.
