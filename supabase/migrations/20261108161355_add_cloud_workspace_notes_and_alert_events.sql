-- P5 cloud research workspace: legacy note migration and alert event history.
-- Existing journal_trades, watchlists, watchlist_items, alert_rules and RLS policies are preserved.

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_id text,
  market text not null check (length(market) between 1 and 120),
  horizon text,
  bias text,
  confidence text,
  thesis text not null check (length(thesis) between 1 and 5000),
  invalidation text,
  evidence_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, legacy_id)
);
create index if not exists research_notes_owner_created_idx
  on public.research_notes(user_id, created_at desc);

alter table public.alert_rules
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'alert_rules_id_user_id_key'
      and conrelid = 'public.alert_rules'::regclass
  ) then
    alter table public.alert_rules add constraint alert_rules_id_user_id_key unique (id, user_id);
  end if;
end $$;

create table if not exists public.alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('price_threshold','manual_test')),
  market_id text not null,
  observed_value numeric not null,
  threshold_value numeric not null,
  event_message text not null check (length(event_message) between 1 and 500),
  delivery_channel text not null default 'in-app'
    check (delivery_channel in ('in-app','browser-notification','manual')),
  metadata jsonb not null default '{}'::jsonb,
  triggered_at timestamptz not null default now(),
  foreign key (alert_id, user_id)
    references public.alert_rules(id, user_id) on delete cascade
);
create index if not exists alert_events_owner_triggered_idx
  on public.alert_events(user_id, triggered_at desc);
create index if not exists alert_events_alert_triggered_idx
  on public.alert_events(alert_id, triggered_at desc);

alter table public.research_notes enable row level security;
alter table public.alert_events enable row level security;

drop policy if exists research_notes_owner_select on public.research_notes;
drop policy if exists research_notes_owner_insert on public.research_notes;
drop policy if exists research_notes_owner_update on public.research_notes;
drop policy if exists research_notes_owner_delete on public.research_notes;
create policy research_notes_owner_select on public.research_notes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy research_notes_owner_insert on public.research_notes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy research_notes_owner_update on public.research_notes
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy research_notes_owner_delete on public.research_notes
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists alert_events_owner_select on public.alert_events;
drop policy if exists alert_events_owner_insert on public.alert_events;
drop policy if exists alert_events_owner_update on public.alert_events;
drop policy if exists alert_events_owner_delete on public.alert_events;
create policy alert_events_owner_select on public.alert_events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy alert_events_owner_insert on public.alert_events
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy alert_events_owner_update on public.alert_events
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy alert_events_owner_delete on public.alert_events
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.research_notes from anon;
revoke all on public.alert_events from anon;
grant select, insert, update, delete on public.research_notes to authenticated;
grant select, insert, update, delete on public.alert_events to authenticated;
grant all on public.research_notes to service_role;
grant all on public.alert_events to service_role;
