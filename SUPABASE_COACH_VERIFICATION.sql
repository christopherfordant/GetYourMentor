-- GetYourMentor - verification professionnelle des coachs
-- À appliquer dans Supabase après SUPABASE_APP_SCHEMA_GYM.sql.
-- Les pièces restent privées dans le bucket coach-documents.

alter table public.gym_coaches
  add column if not exists phone text,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists identity_file_name text,
  add column if not exists identity_storage_path text,
  add column if not exists diploma_file_name text,
  add column if not exists diploma_storage_path text,
  add column if not exists verification_status text not null default 'pending',
  add column if not exists verification_note text,
  add column if not exists verified_at timestamptz,
  add column if not exists gender text,
  add column if not exists practice text,
  add column if not exists level text,
  add column if not exists session_format text,
  add column if not exists availability_tags jsonb not null default '[]'::jsonb;

alter table public.gym_coaches
  drop constraint if exists gym_coaches_verification_status_check;

alter table public.gym_coaches
  add constraint gym_coaches_verification_status_check
  check (verification_status in ('pending', 'approved', 'rejected'));

create index if not exists gym_coaches_verification_status_idx
  on public.gym_coaches (verification_status);

insert into storage.buckets (id, name, public)
values ('coach-documents', 'coach-documents', false)
on conflict (id) do update set public = false;

-- Le serveur utilise la service role pour les uploads et les URLs signées.
-- Aucun document ne doit être rendu public.
notify pgrst, 'reload schema';
