CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id
  ON public.alert_rules (user_id);

CREATE INDEX IF NOT EXISTS idx_user_events_user_id
  ON public.user_events (user_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_user
  ON public.watchlist_items (watchlist_id, user_id);
