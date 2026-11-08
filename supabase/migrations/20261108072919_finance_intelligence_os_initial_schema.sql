-- Finance Intelligence OS database bootstrap.
-- Apply only after reviewing this script in the intended Supabase project.
-- All public-schema tables below have RLS enabled. Public research is read-only for anon/authenticated.
create extension if not exists pgcrypto;

create table if not exists public.source_registry (
  id text primary key,
  provider text not null,
  label text not null,
  source_url text not null,
  access_type text not null,
  license_note text,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_status (
  provider text primary key,
  status text not null default 'not-yet-fetched' check (status in ('fresh','partial','stale','delayed','unavailable','not-yet-fetched','error')),
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  latency_ms integer,
  details jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_record_id text,
  title text not null,
  url text not null,
  domain text,
  topic text,
  published_at timestamptz,
  event_at timestamptz,
  retrieved_at timestamptz not null default now(),
  data_as_of timestamptz,
  freshness_status text not null default 'snapshot',
  payload jsonb not null default '{}'::jsonb,
  unique(provider, url)
);
create index if not exists news_items_retrieved_idx on public.news_items(retrieved_at desc);
create index if not exists news_items_provider_idx on public.news_items(provider, retrieved_at desc);

create table if not exists public.economic_events (
  id text primary key,
  provider text not null,
  event_name text not null,
  category text,
  country text,
  start_at timestamptz,
  end_at timestamptz,
  original_timezone text,
  all_day boolean not null default false,
  actual numeric,
  forecast numeric,
  previous numeric,
  unit text,
  source_url text not null,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  revision_status text not null default 'scheduled',
  market_ids text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb
);
create index if not exists economic_events_start_idx on public.economic_events(start_at);

create table if not exists public.cot_positions (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  report_date date not null,
  contract_code text not null,
  contract_name text,
  trader_category text not null,
  long_contracts bigint,
  short_contracts bigint,
  spreading_contracts bigint,
  open_interest bigint,
  net_position bigint generated always as (coalesce(long_contracts,0)-coalesce(short_contracts,0)) stored,
  source_url text not null,
  retrieved_at timestamptz not null default now(),
  unique(report_type, report_date, contract_code, trader_category)
);
create index if not exists cot_history_idx on public.cot_positions(contract_code, trader_category, report_date desc);

create table if not exists public.contract_specs (
  market_id text primary key,
  exchange text not null,
  contract_name text not null,
  standard_symbol text,
  micro_symbol text,
  multiplier numeric,
  tick_size numeric,
  tick_value numeric,
  point_value numeric,
  settlement_type text,
  active_month_cycle text,
  exchange_spec_url text not null,
  last_verified_at timestamptz,
  verified_by text,
  source_version text,
  verification_status text not null default 'unverified'
);

create table if not exists public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  market_id text not null,
  metric text not null,
  value numeric,
  unit text,
  event_at timestamptz,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  data_as_of timestamptz,
  freshness_status text not null default 'snapshot',
  source_url text not null,
  payload jsonb not null default '{}'::jsonb
);
create index if not exists market_snapshots_lookup_idx on public.market_snapshots(market_id, metric, data_as_of desc);

create table if not exists public.prediction_market_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  market_key text not null,
  market_title text not null,
  outcome text,
  probability numeric,
  volume numeric,
  liquidity numeric,
  bid numeric,
  ask numeric,
  retrieved_at timestamptz not null default now(),
  resolves_at timestamptz,
  source_url text not null,
  payload jsonb not null default '{}'::jsonb
);
create index if not exists prediction_market_history_idx on public.prediction_market_snapshots(provider, market_key, retrieved_at desc);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index if not exists watchlists_user_idx on public.watchlists(user_id);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  watchlist_id uuid not null,
  market_id text not null,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(watchlist_id, market_id),
  foreign key (watchlist_id, user_id) references public.watchlists(id, user_id) on delete cascade
);
create index if not exists watchlist_items_owner_idx on public.watchlist_items(user_id, watchlist_id);

create table if not exists public.journal_trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  market_id text not null,
  side text not null check (side in ('long','short')),
  setup_name text,
  entry_price numeric,
  stop_price numeric,
  exit_price numeric,
  quantity numeric,
  gross_pnl numeric,
  fees numeric not null default 0,
  net_pnl numeric,
  r_multiple numeric,
  opened_at timestamptz,
  closed_at timestamptz,
  notes text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journal_trades_owner_idx on public.journal_trades(user_id, opened_at desc);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null,
  status text not null default 'not-started' check (status in ('not-started','in-progress','completed')),
  score numeric,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_slug)
);

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_at timestamptz,
  timezone text not null default 'Asia/Kolkata',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  rule jsonb not null,
  enabled boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS on every table in exposed public schema.
do $$ declare r record; begin
  for r in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- Public market data: read-only to anon/authenticated. Writes remain server-side.
do $$ declare t text; begin
  foreach t in array array['source_registry','provider_status','news_items','economic_events','cot_positions','contract_specs','market_snapshots','prediction_market_snapshots'] loop
    execute format('drop policy if exists public_read_%I on public.%I',t,t);
    execute format('create policy public_read_%I on public.%I for select to anon, authenticated using (true)',t,t);
    execute format('revoke insert, update, delete on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;

-- User-owned tables: every operation is scoped to auth.uid().
do $$ declare t text; begin
  foreach t in array array['watchlists','watchlist_items','journal_trades','lesson_progress','user_events','alert_rules','user_preferences'] loop
    execute format('drop policy if exists owner_select_%I on public.%I',t,t);
    execute format('drop policy if exists owner_insert_%I on public.%I',t,t);
    execute format('drop policy if exists owner_update_%I on public.%I',t,t);
    execute format('drop policy if exists owner_delete_%I on public.%I',t,t);
    execute format('create policy owner_select_%I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t,t);
    execute format('create policy owner_insert_%I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',t,t);
    execute format('create policy owner_update_%I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t,t);
    execute format('create policy owner_delete_%I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',t,t);
    execute format('grant select, insert, update, delete on public.%I to authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;

-- profiles and user_preferences have user_id field alias to primary key `id` / `user_id` respectively.
drop policy if exists owner_select_profiles on public.profiles;
drop policy if exists owner_insert_profiles on public.profiles;
drop policy if exists owner_update_profiles on public.profiles;
drop policy if exists owner_delete_profiles on public.profiles;
create policy owner_select_profiles on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy owner_insert_profiles on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy owner_update_profiles on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy owner_delete_profiles on public.profiles for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists owner_select_user_preferences on public.user_preferences;
drop policy if exists owner_insert_user_preferences on public.user_preferences;
drop policy if exists owner_update_user_preferences on public.user_preferences;
drop policy if exists owner_delete_user_preferences on public.user_preferences;
create policy owner_select_user_preferences on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_insert_user_preferences on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy owner_update_user_preferences on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner_delete_user_preferences on public.user_preferences for delete to authenticated using ((select auth.uid()) = user_id);

-- Private file bucket; user-scoped folders must use the authenticated user's UUID as first path segment.
insert into storage.buckets(id,name,public) values ('journal-attachments','journal-attachments',false) on conflict (id) do nothing;
drop policy if exists journal_owner_read on storage.objects;
drop policy if exists journal_owner_insert on storage.objects;
drop policy if exists journal_owner_update on storage.objects;
drop policy if exists journal_owner_delete on storage.objects;
create policy journal_owner_read on storage.objects for select to authenticated using (bucket_id='journal-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy journal_owner_insert on storage.objects for insert to authenticated with check (bucket_id='journal-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy journal_owner_update on storage.objects for update to authenticated using (bucket_id='journal-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text) with check (bucket_id='journal-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy journal_owner_delete on storage.objects for delete to authenticated using (bucket_id='journal-attachments' and (storage.foldername(name))[1]=(select auth.uid())::text);

