alter table public.lesson_progress
  add column if not exists progress_data jsonb not null default '{}'::jsonb;
alter table public.lesson_progress
  add column if not exists lesson_version text not null default 'legacy';
