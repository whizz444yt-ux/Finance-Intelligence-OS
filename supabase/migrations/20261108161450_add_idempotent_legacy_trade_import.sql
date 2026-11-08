-- P5 idempotent import of the legacy ICT Futures browser journal.
alter table public.journal_trades
  add column if not exists legacy_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_trades_user_legacy_id_key'
      and conrelid = 'public.journal_trades'::regclass
  ) then
    alter table public.journal_trades
      add constraint journal_trades_user_legacy_id_key unique (user_id, legacy_id);
  end if;
end $$;

create index if not exists journal_trades_legacy_import_idx
  on public.journal_trades(user_id, legacy_id)
  where legacy_id is not null;
