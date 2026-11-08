-- P2 economic-data history and auditable provider ingestion
-- Applied to the finance-intelligence-os Supabase project as migration
-- 20261108134935_add_economic_observations_and_ingestion_runs.

create table if not exists public.economic_observations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  dataset_id text not null,
  series_id text not null,
  series_name text not null,
  country_code text not null default 'US',
  frequency text not null,
  observation_date date not null,
  value numeric,
  unit text,
  data_as_of date,
  published_at timestamptz,
  vintage_start date,
  vintage_end date,
  retrieved_at timestamptz not null default now(),
  source_url text not null,
  freshness_status text not null default 'snapshot'
    check (freshness_status in ('fresh','partial','stale','snapshot','delayed')),
  raw_payload jsonb not null default '{}'::jsonb,
  unique(provider, dataset_id, series_id, frequency, observation_date)
);

create index if not exists economic_observations_series_date_idx
  on public.economic_observations(provider, dataset_id, series_id, frequency, observation_date desc);
create index if not exists economic_observations_retrieved_idx
  on public.economic_observations(provider, retrieved_at desc);
create index if not exists economic_observations_asof_idx
  on public.economic_observations(data_as_of desc);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  dataset_id text,
  status text not null check (status in ('running','success','partial','failed','skipped')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  rows_received integer not null default 0 check (rows_received >= 0),
  rows_upserted integer not null default 0 check (rows_upserted >= 0),
  request_count integer not null default 0 check (request_count >= 0),
  error_code text,
  error_message text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists ingestion_runs_provider_started_idx
  on public.ingestion_runs(provider, started_at desc);

alter table public.economic_observations enable row level security;
alter table public.ingestion_runs enable row level security;

drop policy if exists public_read_economic_observations on public.economic_observations;
create policy public_read_economic_observations
  on public.economic_observations for select to anon, authenticated using (true);

revoke insert, update, delete on public.economic_observations from anon, authenticated;
grant select on public.economic_observations to anon, authenticated;
grant all on public.economic_observations to service_role;

-- ingestion_runs is deliberately private. RLS is enabled and no policies are
-- granted to anon/authenticated; trusted ingestion uses service_role only.
revoke all on public.ingestion_runs from anon, authenticated;
grant all on public.ingestion_runs to service_role;

insert into public.source_registry (id, provider, label, source_url, access_type, license_note)
values
 ('bea-nipa','BEA','BEA National Income and Product Accounts','https://apps.bea.gov/api/data/','api-key','Registered BEA UserID required. Published US GDP and personal income tables; historical observations, not real-time markets.'),
 ('eia-petroleum','EIA','EIA Weekly Petroleum Status Report','https://api.eia.gov/v2/seriesid/PET.WCESTUS1.W','api-key','Registered EIA API key required. Weekly petroleum inventory and supply observations.'),
 ('fred-macro','FRED','Federal Reserve Economic Data API','https://api.stlouisfed.org/fred/series/observations','api-key','Registered FRED API key required. Observation histories; check each series units, frequency, revisions and release cadence.'),
 ('treasury-fiscaldata','US_TREASURY','US Treasury Fiscal Data API','https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates','public-api','Public Fiscal Data REST API. Average interest-rate series are monthly; publication cadence varies by dataset.'),
 ('ecb-sdmx','ECB','European Central Bank Data Portal SDMX API','https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A','public-api','Public SDMX 2.1 data service; series keys and units must be interpreted from the data structure.')
on conflict (id) do update set
 provider=excluded.provider,label=excluded.label,source_url=excluded.source_url,
 access_type=excluded.access_type,license_note=excluded.license_note,updated_at=now();

insert into public.provider_status(provider,status,details)
values
 ('bea','not-yet-fetched','{"credential":"BEA_API_KEY","cadence":"quarterly / release-driven","dataset":"NIPA:T10101"}'::jsonb),
 ('eia','not-yet-fetched','{"credential":"EIA_API_KEY","cadence":"weekly","dataset":"PET.WCESTUS1.W"}'::jsonb),
 ('fred','not-yet-fetched','{"credential":"FRED_API_KEY","cadence":"series-specific","dataset":"fred:series_observations"}'::jsonb),
 ('us_treasury','not-yet-fetched','{"credential":"none","cadence":"monthly","dataset":"avg_interest_rates"}'::jsonb),
 ('ecb','not-yet-fetched','{"credential":"none","cadence":"daily business-day reference data","dataset":"EXR:D.USD.EUR.SP00.A"}'::jsonb)
on conflict (provider) do update set
 details=provider_status.details || excluded.details,
 updated_at=now();
