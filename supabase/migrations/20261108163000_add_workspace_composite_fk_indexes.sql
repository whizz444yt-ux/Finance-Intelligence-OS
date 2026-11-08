-- P5 cover composite foreign keys used by alert and backtest child rows.
create index if not exists alert_events_alert_user_idx
  on public.alert_events(alert_id, user_id);
create index if not exists strategy_backtest_trades_backtest_user_idx
  on public.strategy_backtest_trades(backtest_id, user_id);
