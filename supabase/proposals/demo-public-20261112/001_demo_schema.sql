-- PROPOSAL ONLY — isolated public recruiter demo, 2026-11-12.
-- Never run against getyourmentor-preprod or any production project.
-- Apply only to a newly designated demo Supabase project after review and backup.

begin;

create table if not exists public.gym_demo_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('coach', 'sportif')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  check (expires_at > created_at),
  unique (owner_user_id, role)
);

create table if not exists public.gym_demo_coaches (
  id uuid primary key default gen_random_uuid(),
  owner_session_id uuid references public.gym_demo_sessions(id) on delete cascade,
  is_fixture boolean not null default false,
  display_name text not null check (char_length(display_name) between 1 and 80),
  sport text not null check (char_length(sport) between 1 and 60),
  city_label text not null default 'Ville de démonstration',
  service_label text not null check (char_length(service_label) between 1 and 120),
  display_price_cents integer not null check (display_price_cents between 0 and 100000),
  created_at timestamptz not null default now(),
  check ((is_fixture and owner_session_id is null) or (not is_fixture and owner_session_id is not null))
);

create table if not exists public.gym_demo_reservations (
  id uuid primary key default gen_random_uuid(),
  athlete_session_id uuid not null references public.gym_demo_sessions(id) on delete cascade,
  coach_id uuid references public.gym_demo_coaches(id) on delete set null,
  coach_name_snapshot text not null check (char_length(coach_name_snapshot) between 1 and 80),
  sport_snapshot text not null check (char_length(sport_snapshot) between 1 and 60),
  service_snapshot text not null check (char_length(service_snapshot) between 1 and 120),
  appointment_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'cancelled')),
  approval_mode text not null default 'simulated' check (approval_mode = 'simulated'),
  display_price_cents integer not null check (display_price_cents between 0 and 100000),
  payment_mode text not null default 'simulated' check (payment_mode = 'simulated'),
  payment_status text not null default 'not_started' check (payment_status in ('not_started', 'simulated_confirmed')),
  created_at timestamptz not null default now()
);

create table if not exists public.gym_demo_telegram_links (
  session_id uuid primary key references public.gym_demo_sessions(id) on delete cascade,
  consented_at timestamptz not null,
  revoked_at timestamptz,
  chat_id_ciphertext bytea not null,
  key_version text not null check (char_length(key_version) between 1 and 40),
  check (revoked_at is null or revoked_at >= consented_at)
);

create index if not exists gym_demo_sessions_owner_idx on public.gym_demo_sessions(owner_user_id);
create index if not exists gym_demo_coaches_owner_idx on public.gym_demo_coaches(owner_session_id) where owner_session_id is not null;
create index if not exists gym_demo_reservations_athlete_idx on public.gym_demo_reservations(athlete_session_id, created_at desc);
create index if not exists gym_demo_reservations_coach_idx on public.gym_demo_reservations(coach_id, created_at desc);

alter table public.gym_demo_sessions enable row level security;
alter table public.gym_demo_coaches enable row level security;
alter table public.gym_demo_reservations enable row level security;
alter table public.gym_demo_telegram_links enable row level security;

revoke all on public.gym_demo_sessions, public.gym_demo_coaches,
  public.gym_demo_reservations, public.gym_demo_telegram_links from public, anon, authenticated;

grant select, insert, delete on public.gym_demo_sessions to authenticated;
-- Needed by the public coach fixture policy's EXISTS predicate; sessions has
-- no anon policy, so direct anon reads remain default-deny under RLS.
grant select on public.gym_demo_sessions to anon;
grant select, insert, update, delete on public.gym_demo_coaches to authenticated;
grant select on public.gym_demo_coaches to anon;
grant select on public.gym_demo_reservations to authenticated;
grant select, insert, update, delete on public.gym_demo_sessions, public.gym_demo_coaches,
  public.gym_demo_reservations, public.gym_demo_telegram_links to service_role;

create policy gym_demo_sessions_select_owner on public.gym_demo_sessions
  for select to authenticated using (owner_user_id = (select auth.uid()));
create policy gym_demo_sessions_insert_owner on public.gym_demo_sessions
  for insert to authenticated with check (owner_user_id = (select auth.uid()));
create policy gym_demo_sessions_delete_owner on public.gym_demo_sessions
  for delete to authenticated using (owner_user_id = (select auth.uid()));

create policy gym_demo_coaches_read_fixture_or_owner on public.gym_demo_coaches
  for select to anon, authenticated using (
    (is_fixture and owner_session_id is null)
    or exists (
      select 1 from public.gym_demo_sessions s
      where s.id = owner_session_id and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  );
create policy gym_demo_coaches_insert_owner on public.gym_demo_coaches
  for insert to authenticated with check (
    not is_fixture and exists (
      select 1 from public.gym_demo_sessions s
      where s.id = owner_session_id and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  );
create policy gym_demo_coaches_update_owner on public.gym_demo_coaches
  for update to authenticated using (
    not is_fixture and exists (
      select 1 from public.gym_demo_sessions s
      where s.id = owner_session_id and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  ) with check (
    not is_fixture and exists (
      select 1 from public.gym_demo_sessions s
      where s.id = owner_session_id and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  );
create policy gym_demo_coaches_delete_owner on public.gym_demo_coaches
  for delete to authenticated using (
    not is_fixture and exists (
      select 1 from public.gym_demo_sessions s
      where s.id = owner_session_id and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  );

create policy gym_demo_reservations_read_participants on public.gym_demo_reservations
  for select to authenticated using (
    exists (
      select 1 from public.gym_demo_sessions s
      where s.id = athlete_session_id and s.owner_user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.gym_demo_coaches c
      join public.gym_demo_sessions s on s.id = c.owner_session_id
      where c.id = coach_id and s.owner_user_id = (select auth.uid()) and s.role = 'coach'
    )
  );

-- Telegram chat identifiers are encrypted by the application. Only server APIs
-- using service_role may read them. The client receives consent/revocation state
-- only; no bot is enabled by this proposal.

commit;
