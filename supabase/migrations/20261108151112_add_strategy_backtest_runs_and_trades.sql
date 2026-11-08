-- P4 reproducible Strategy Lab runs and trade ledgers.
-- Raw uploaded market CSV files are never stored in these tables.
create table if not exists public.strategy_backtests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_fingerprint text not null,
  strategy_name text not null,
  model_id text not null default 'custom',
  engine_version text not null,
  dataset_name text not null,
  dataset_sha256 char(64) not null,
  dataset_rows integer not null check (dataset_rows >= 30),
  dataset_start_at timestamptz not null,
  dataset_end_at timestamptz not null,
  market_symbol text not null,
  timeframe text not null,
  timezone text not null default 'UTC',
  series_type text not null check (series_type in ('single-expiry','back-adjusted-continuous')),
  config jsonb not null default '{}'::jsonb,
  manifest jsonb not null default '{}'::jsonb,
  full_sample_metrics jsonb not null default '{}'::jsonb,
  split_metrics jsonb not null default '[]'::jsonb,
  trade_count integer not null default 0 check (trade_count >= 0),
  status text not null default 'complete' check (status in ('complete','failed')),
  cloud_sync_status text not null default 'writing' check (cloud_sync_status in ('writing','complete','partial','failed')),
  sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index if not exists strategy_backtests_owner_created_idx
  on public.strategy_backtests(user_id, created_at desc);
create index if not exists strategy_backtests_fingerprint_idx
  on public.strategy_backtests(user_id, run_fingerprint);

create table if not exists public.strategy_backtest_trades (
  id uuid primary key default gen_random_uuid(),
  backtest_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_no integer not null check (trade_no > 0),
  period text not null check (period in ('in-sample','validation','out-of-sample')),
  side text not null check (side in ('long','short')),
  signal_at timestamptz not null,
  entry_at timestamptz not null,
  exit_at timestamptz not null,
  entry_price numeric not null,
  stop_price numeric not null,
  target_price numeric not null,
  exit_price numeric not null,
  quantity integer not null check (quantity > 0),
  stop_ticks integer not null check (stop_ticks > 0),
  target_ticks integer not null check (target_ticks > 0),
  gross_pnl_usd numeric not null,
  commissions_usd numeric not null,
  slippage_cost_usd numeric not null,
  net_pnl_usd numeric not null,
  risk_usd numeric not null check (risk_usd > 0),
  r_multiple numeric not null,
  exit_reason text not null,
  bars_held integer not null check (bars_held > 0),
  created_at timestamptz not null default now(),
  foreign key (backtest_id, user_id)
    references public.strategy_backtests(id, user_id) on delete cascade,
  unique (backtest_id, period, trade_no)
);
create index if not exists strategy_backtest_trades_parent_idx
  on public.strategy_backtest_trades(backtest_id, period, trade_no);
create index if not exists strategy_backtest_trades_owner_exit_idx
  on public.strategy_backtest_trades(user_id, exit_at desc);

alter table public.strategy_backtests enable row level security;
alter table public.strategy_backtest_trades enable row level security;

drop policy if exists strategy_backtests_owner_select on public.strategy_backtests;
drop policy if exists strategy_backtests_owner_insert on public.strategy_backtests;
drop policy if exists strategy_backtests_owner_update on public.strategy_backtests;
drop policy if exists strategy_backtests_owner_delete on public.strategy_backtests;
create policy strategy_backtests_owner_select on public.strategy_backtests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy strategy_backtests_owner_insert on public.strategy_backtests
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy strategy_backtests_owner_update on public.strategy_backtests
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy strategy_backtests_owner_delete on public.strategy_backtests
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists strategy_backtest_trades_owner_select on public.strategy_backtest_trades;
drop policy if exists strategy_backtest_trades_owner_insert on public.strategy_backtest_trades;
drop policy if exists strategy_backtest_trades_owner_update on public.strategy_backtest_trades;
drop policy if exists strategy_backtest_trades_owner_delete on public.strategy_backtest_trades;
create policy strategy_backtest_trades_owner_select on public.strategy_backtest_trades
  for select to authenticated using ((select auth.uid()) = user_id);
create policy strategy_backtest_trades_owner_insert on public.strategy_backtest_trades
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy strategy_backtest_trades_owner_update on public.strategy_backtest_trades
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy strategy_backtest_trades_owner_delete on public.strategy_backtest_trades
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.strategy_backtests from anon;
revoke all on public.strategy_backtest_trades from anon;
grant select, insert, update, delete on public.strategy_backtests to authenticated;
grant select, insert, update, delete on public.strategy_backtest_trades to authenticated;
grant all on public.strategy_backtests to service_role;
grant all on public.strategy_backtest_trades to service_role;
