-- Persistance MVP du parcours de réservation GetYourMentor.
-- À exécuter après SUPABASE_SCHEMA_GYM.sql dans le projet Supabase.

create table if not exists public.gym_coaches (
  id text primary key,
  name text not null,
  sport text not null check (sport in ('football', 'basketball', 'fitness', 'sports-de-combat')),
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
  photo_url text not null default '',
  bank_account_last4 text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gym_coaches enable row level security;
alter table public.gym_coaches add column if not exists availability text not null default '';

create index if not exists gym_coaches_sport_city_idx on public.gym_coaches (sport, city);
create index if not exists gym_coaches_verified_idx on public.gym_coaches (verified);

insert into public.gym_coaches (id, name, sport, specialty, city, rating, review_count, price_from, verified, description, disciplines, diplomas, session_types)
values
  ('steven-fordant', 'Steven Fordant', 'basketball', 'Coach basketball individuel', 'Marseille', 4.9, 38, 35, true, 'Coach spécialisé dans le travail technique individuel, le développement du tir et la progression des jeunes joueurs.', 'Basketball, préparation physique', 'BPJEPS — à compléter', 'Individuel, duo, visio'),
  ('madison-seck', 'Madison Seck', 'football', 'Coach football', 'Paris', 4.8, 24, 40, true, 'Accompagnement individuel pour progresser techniquement et gagner en confiance sur le terrain.', 'Football, préparation physique', 'Diplôme fédéral — à compléter', 'Individuel, collectif'),
  ('studio-form-marseille', 'Studio Form Marseille', 'fitness', 'Coaching remise en forme', 'Marseille', 4.7, 19, 35, true, 'Séances personnalisées pour reprendre une activité régulière et progresser à son rythme.', 'Fitness, remise en forme', 'Certification fitness — à compléter', 'Individuel, duo, visio')
on conflict (id) do update set
  name = excluded.name,
  sport = excluded.sport,
  specialty = excluded.specialty,
  city = excluded.city,
  rating = excluded.rating,
  review_count = excluded.review_count,
  price_from = excluded.price_from,
  description = excluded.description,
  disciplines = excluded.disciplines,
  diplomas = excluded.diplomas,
  session_types = excluded.session_types;

update public.gym_coaches set availability = 'Lundi a vendredi, 18h-21h' where id = 'steven-fordant';
update public.gym_coaches set availability = 'Mardi et jeudi, 17h-20h - samedi matin' where id = 'madison-seck';
update public.gym_coaches set availability = 'Du lundi au samedi, 7h-12h' where id = 'studio-form-marseille';

create table if not exists public.gym_reservations (
  id text primary key,
  owner_email text,
  coach_id text not null,
  coach_name text not null,
  sport text not null check (sport in ('football', 'basketball', 'fitness', 'sports-de-combat')),
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
  created_at timestamptz not null default now()
);

create index if not exists gym_reservations_coach_id_idx on public.gym_reservations (coach_id);
create index if not exists gym_reservations_status_idx on public.gym_reservations (status);
create index if not exists gym_reservations_created_at_idx on public.gym_reservations (created_at desc);

alter table public.gym_reservations enable row level security;

-- Compatibilité avec une table créée par une version précédente du script.
alter table public.gym_reservations add column if not exists appointment_at timestamptz;
alter table public.gym_reservations add column if not exists owner_email text;
alter table public.gym_reservations add column if not exists cancelled_at timestamptz;
alter table public.gym_reservations add column if not exists refund_percent numeric(5, 2) default 0;
alter table public.gym_reservations add column if not exists refund_amount numeric(10, 2) default 0;

-- Claim atomique des créneaux : la clé unique empêche deux réservations actives
-- de prendre simultanément le même créneau pour un même coach.
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

-- Reprise non destructive des demandes déjà existantes lors de la migration.
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
