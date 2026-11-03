-- Prepared only: explicit authorization required before any remote migration.
create table if not exists public.gym_telegram_state (
  id text primary key check (id = 'primary'),
  version bigint not null default 0,
  payload jsonb not null default '{"pending":[],"bindings":[],"outbox":[]}'::jsonb
);
alter table public.gym_telegram_state enable row level security;
revoke all on public.gym_telegram_state from anon, authenticated;
grant select,insert,update,delete on public.gym_telegram_state to service_role;
insert into public.gym_telegram_state(id) values('primary') on conflict do nothing;
