-- Vérification en lecture seule de la préproduction GetYourMentor.
-- À exécuter après SUPABASE_APP_SCHEMA_GYM.sql dans l'éditeur SQL Supabase.

-- 1. Les six tables MVP doivent exister avec la RLS active.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'gym_coaches',
    'gym_reservations',
    'gym_reservation_slot_claims',
    'gym_reviews',
    'gym_messages',
    'gym_club_leads'
  )
order by c.relname;

-- 2. Les buckets des justificatifs doivent être privés.
select id, name, public
from storage.buckets
where id in ('club-documents', 'coach-documents')
order by id;

-- 3. Le catalogue ne doit pas contenir de coach vérifié de démonstration.
select count(*) as verified_coach_count
from public.gym_coaches
where verified = true;

-- 4. La contrainte primaire coach/créneau doit empêcher un double claim.
select
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
from pg_constraint con
join pg_class rel on rel.oid = con.conrelid
join pg_namespace n on n.oid = rel.relnamespace
where n.nspname = 'public'
  and rel.relname = 'gym_reservation_slot_claims'
  and con.contype in ('p', 'u')
order by con.conname;

-- 5. Aucun accès direct anonyme n'est prévu : les appels métier passent par
-- le serveur avec la service role. Une ligne ici doit être revue avant ouverture.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'gym_coaches',
    'gym_reservations',
    'gym_reservation_slot_claims',
    'gym_reviews',
    'gym_messages',
    'gym_club_leads'
  )
order by tablename, policyname;

-- 6. Les identifiants Stripe nécessaires aux remboursements doivent être
-- présents sans jamais exposer de numéro de carte ou de secret.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'gym_reservations'
  and column_name in ('stripe_payment_intent_id', 'stripe_refund_id', 'refund_status')
order by column_name;

-- Résultats attendus : six tables avec rls_enabled=true, un bucket
-- club-documents avec public=false, aucune donnée de démonstration vérifiée,
-- une contrainte PRIMARY KEY (coach_id, slot), les trois colonnes Stripe
-- présentes, et aucune policy client générique non documentée.
