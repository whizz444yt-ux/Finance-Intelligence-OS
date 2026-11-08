-- Make the private ingestion ledger's browser-deny posture explicit.
-- All browser roles receive an explicit false policy and no table privileges.
-- Trusted Cloudflare ingestion continues to use service_role only.

drop policy if exists deny_browser_access_ingestion_runs on public.ingestion_runs;
create policy deny_browser_access_ingestion_runs
  on public.ingestion_runs
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on public.ingestion_runs from anon, authenticated;
grant all on public.ingestion_runs to service_role;
