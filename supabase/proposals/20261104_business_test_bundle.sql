-- PROPOSAL ONLY: target recipe pqxqqbwesfrefzjoawmx. No production.
-- No business rows, users, clubs, buckets or RAG changed by this proposal.
BEGIN;

-- Relevant existing app.sql definitions only.
create table if not exists public.gym_coaches (
  id text primary key,
  name text not null,
  sport text not null check (sport in ('football', 'basketball', 'fitness', 'sports-de-combat', 'boxe', 'mma', 'pilates', 'coaching-sportif', 'crossfit', 'preparation-physique', 'musculation', 'hyrox', 'perte-de-poids', 'padel')),
  specialty text not null default '',
  city text not null default '',
  rating numeric(3, 2) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  price_from numeric(10, 2) not null default 0 check (price_from >= 0),
  verified boolean not null default false,
  description text not null default '',
  disciplines text not null default '',
  diplomas text not null default '',
  session_types text not null default '',
  availability text not null default '',
  gender text check (gender is null or gender in ('homme', 'femme')),
  practice text check (practice is null or practice in ('interieur', 'exterieur')),
  level text check (level is null or level in ('debutant', 'intermediaire', 'confirme')),
  session_format text check (session_format is null or session_format in ('presentiel', 'visio')),
  availability_tags jsonb not null default '[]'::jsonb check (jsonb_typeof(availability_tags) = 'array'),
  photo_url text not null default '',
  bank_account_last4 text not null default '',
  phone text,
  phone_verified_at timestamptz,
  identity_file_name text,
  identity_storage_path text,
  diploma_file_name text,
  diploma_storage_path text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  verification_note text,
  verified_at timestamptz,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  service_radius_km numeric(5, 2) not null default 10 check (service_radius_km > 0 and service_radius_km <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gym_coaches enable row level security;

alter table public.gym_coaches add column if not exists availability text not null default '';

alter table public.gym_coaches add column if not exists gender text;

alter table public.gym_coaches add column if not exists practice text;

alter table public.gym_coaches add column if not exists level text;

alter table public.gym_coaches add column if not exists session_format text;

alter table public.gym_coaches add column if not exists availability_tags jsonb not null default '[]'::jsonb;

alter table public.gym_coaches add column if not exists latitude numeric(9, 6);

alter table public.gym_coaches add column if not exists longitude numeric(9, 6);

alter table public.gym_coaches add column if not exists service_radius_km numeric(5, 2) not null default 10;

alter table public.gym_coaches add column if not exists phone text;

alter table public.gym_coaches add column if not exists phone_verified_at timestamptz;

alter table public.gym_coaches add column if not exists identity_file_name text;

alter table public.gym_coaches add column if not exists identity_storage_path text;

alter table public.gym_coaches add column if not exists diploma_file_name text;

alter table public.gym_coaches add column if not exists diploma_storage_path text;

alter table public.gym_coaches add column if not exists verification_status text not null default 'pending';

alter table public.gym_coaches add column if not exists verification_note text;

alter table public.gym_coaches add column if not exists verified_at timestamptz;

create index if not exists gym_coaches_sport_city_idx on public.gym_coaches (sport, city);

create index if not exists gym_coaches_verified_idx on public.gym_coaches (verified);

create index if not exists gym_coaches_location_idx on public.gym_coaches (latitude, longitude) where latitude is not null and longitude is not null;

create index if not exists gym_coaches_verification_status_idx on public.gym_coaches (verification_status);

create index if not exists gym_coaches_filters_idx on public.gym_coaches (gender, practice, level, session_format);

create table if not exists public.gym_reservations (
  id text primary key,
  owner_email text,
  coach_id text not null,
  coach_name text not null,
  sport text not null check (sport in ('football', 'basketball', 'fitness', 'sports-de-combat', 'boxe', 'mma', 'pilates', 'coaching-sportif', 'crossfit', 'preparation-physique', 'musculation', 'hyrox', 'perte-de-poids', 'padel')),
  city text not null,
  service text not null,
  duration text not null,
  price numeric(10, 2) not null check (price >= 0),
  slots jsonb not null check (jsonb_typeof(slots) = 'array'),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'rejected', 'cancelled', 'paid')),
  reservation_code text unique,
  accepted_at timestamptz,
  appointment_at timestamptz,
  cancelled_at timestamptz,
  refund_percent numeric(5, 2) default 0 check (refund_percent between 0 and 100),
  refund_amount numeric(10, 2) default 0 check (refund_amount >= 0),
  stripe_payment_intent_id text,
  stripe_refund_id text,
  refund_status text not null default 'not_required' check (refund_status in ('not_required', 'pending', 'succeeded')),
  created_at timestamptz not null default now()
);

create index if not exists gym_reservations_coach_id_idx on public.gym_reservations (coach_id);

create index if not exists gym_reservations_status_idx on public.gym_reservations (status);

create index if not exists gym_reservations_created_at_idx on public.gym_reservations (created_at desc);

alter table public.gym_reservations enable row level security;

alter table public.gym_reservations add column if not exists appointment_at timestamptz;

alter table public.gym_reservations add column if not exists owner_email text;

alter table public.gym_reservations add column if not exists cancelled_at timestamptz;

alter table public.gym_reservations add column if not exists refund_percent numeric(5, 2) default 0;

alter table public.gym_reservations add column if not exists refund_amount numeric(10, 2) default 0;

alter table public.gym_reservations add column if not exists stripe_payment_intent_id text;

alter table public.gym_reservations add column if not exists stripe_refund_id text;

alter table public.gym_reservations add column if not exists refund_status text not null default 'not_required';

create table if not exists public.gym_reservation_slot_claims (
  reservation_id text not null references public.gym_reservations(id) on delete cascade,
  coach_id text not null,
  slot text not null,
  created_at timestamptz not null default now(),
  primary key (coach_id, slot),
  unique (reservation_id, slot)
);

alter table public.gym_reservation_slot_claims enable row level security;

create index if not exists gym_reservation_slot_claims_reservation_idx on public.gym_reservation_slot_claims (reservation_id);

insert into public.gym_reservation_slot_claims (reservation_id, coach_id, slot)
select r.id, r.coach_id, jsonb_array_elements_text(r.slots)
from public.gym_reservations r
where r.status in ('requested', 'accepted', 'paid')
on conflict (coach_id, slot) do nothing;

create table if not exists public.gym_reviews (
  id text primary key,
  reservation_id text not null unique references public.gym_reservations(id) on delete cascade,
  author_email text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

alter table public.gym_reviews enable row level security;

create table if not exists public.gym_messages (
  id text primary key,
  sender_email text not null,
  recipient_name text not null,
  reservation_id text references public.gym_reservations(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.gym_messages enable row level security;

-- SOURCE: supabase/migrations/20261014_commission.sql
-- Additive only. Apply to a dedicated test database before any production review.

create table if not exists public.gym_commission_settings (
  id text primary key check (id = 'platform'),
  bps integer not null check (bps between 0 and 10000),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb check (jsonb_typeof(history) = 'array')
);
alter table public.gym_commission_settings enable row level security;
revoke all on public.gym_commission_settings from anon, authenticated;
grant select, insert, update on public.gym_commission_settings to service_role;
-- 15% is the primary MVP specification. Administrator can change it; no historic backfill.
insert into public.gym_commission_settings (id, bps) values ('platform', 1500) on conflict (id) do nothing;

create or replace function public.gym_update_commission(new_bps integer, expected_version integer, actor text)
returns void language plpgsql security invoker set search_path = public as $$
declare previous public.gym_commission_settings;
begin
  if new_bps < 0 or new_bps > 10000 or new_bps is null or actor is null or length(actor) > 320 then
    raise exception 'invalid commission settings' using errcode = '22023';
  end if;
  select * into previous from public.gym_commission_settings where id = 'platform' for update;
  if previous.version is distinct from expected_version then
    raise sqlstate 'PT409' using message = 'Commission version conflict';
  end if;
  update public.gym_commission_settings set bps = new_bps, version = previous.version + 1, updated_at = now(),
    history = previous.history || jsonb_build_array(jsonb_build_object('id', gen_random_uuid(), 'fromBps', previous.bps,
      'toBps', new_bps, 'version', previous.version + 1, 'changedBy', actor, 'changedAt', now()))
    where id = 'platform';
end;
$$;
revoke all on function public.gym_update_commission(integer, integer, text) from public, anon, authenticated;
grant execute on function public.gym_update_commission(integer, integer, text) to service_role;

alter table public.gym_reservations add column if not exists financial_snapshot jsonb;
alter table public.gym_reservations add column if not exists refunded_platform_fee_cents bigint;
alter table public.gym_reservations add column if not exists stripe_checkout_session_id text;
create unique index if not exists gym_reservations_checkout_unique on public.gym_reservations(stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create unique index if not exists gym_reservations_payment_intent_unique on public.gym_reservations(stripe_payment_intent_id) where stripe_payment_intent_id is not null;

create or replace function public.gym_protect_financial_snapshot()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.financial_snapshot is not null and new.financial_snapshot is distinct from old.financial_snapshot then
    raise exception 'Historic financial snapshot is immutable';
  end if;
  return new;
end;
$$;
drop trigger if exists gym_financial_snapshot_immutable on public.gym_reservations;
create trigger gym_financial_snapshot_immutable before update on public.gym_reservations
  for each row execute function public.gym_protect_financial_snapshot();


-- SOURCE: supabase/migrations/20261102_expand_sports_catalogue.sql
-- Prepared only: inspect deployed schema before applying. No data rewrite or RLS change.

ALTER TABLE public.gym_coaches DROP CONSTRAINT IF EXISTS gym_coaches_sport_check;
ALTER TABLE public.gym_coaches ADD CONSTRAINT gym_coaches_sport_check CHECK (sport IN ('football', 'basketball', 'fitness', 'sports-de-combat', 'boxe', 'mma', 'pilates', 'coaching-sportif', 'crossfit', 'preparation-physique', 'musculation', 'hyrox', 'perte-de-poids', 'padel')) NOT VALID;
ALTER TABLE public.gym_coaches VALIDATE CONSTRAINT gym_coaches_sport_check;
ALTER TABLE public.gym_reservations DROP CONSTRAINT IF EXISTS gym_reservations_sport_check;
ALTER TABLE public.gym_reservations ADD CONSTRAINT gym_reservations_sport_check CHECK (sport IN ('football', 'basketball', 'fitness', 'sports-de-combat', 'boxe', 'mma', 'pilates', 'coaching-sportif', 'crossfit', 'preparation-physique', 'musculation', 'hyrox', 'perte-de-poids', 'padel')) NOT VALID;
ALTER TABLE public.gym_reservations VALIDATE CONSTRAINT gym_reservations_sport_check;


-- SOURCE: supabase/migrations/20261103_telegram_state.sql
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


-- SOURCE: supabase/proposals/20261104_stripe_connect_test.sql
-- PROPOSAL ONLY. Requires explicit authorization before remote execution.
-- Target: getyourmentor-preprod (pqxqqbwesfrefzjoawmx), not production.
-- Precondition: existing business schema and commission migrations reviewed.

CREATE TABLE public.gym_stripe_coach_accounts (
 coach_id text PRIMARY KEY REFERENCES public.gym_coaches(id),
 stripe_account_id text NOT NULL UNIQUE CHECK (stripe_account_id ~ '^acct_[A-Za-z0-9]+$'),
 mode text NOT NULL DEFAULT 'test' CHECK (mode = 'test'),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gym_stripe_coach_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_stripe_coach_accounts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.gym_stripe_coach_accounts FROM service_role;
-- Immutable binding: server can create and read, never silently relabel a coach.
GRANT SELECT, INSERT ON public.gym_stripe_coach_accounts TO service_role;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_connect_account_id text;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.gym_reservations ADD COLUMN IF NOT EXISTS stripe_application_fee_id text;

-- No account creation, business rows, seeds, grants on unrelated tables or RAG.


-- Business tables accessed by authenticated server routes only.
REVOKE ALL ON public.gym_coaches FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_coaches TO service_role;
REVOKE ALL ON public.gym_messages FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_messages TO service_role;
REVOKE ALL ON public.gym_reservation_slot_claims FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_reservation_slot_claims TO service_role;
REVOKE ALL ON public.gym_reservations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_reservations TO service_role;
REVOKE ALL ON public.gym_reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_reviews TO service_role;

COMMIT;
