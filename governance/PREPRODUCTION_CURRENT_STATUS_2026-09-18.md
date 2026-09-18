# GetYourMentor - etat de preproduction au 2026-09-18

Ce registre remplace les anciens instantanes de readiness pour la branche
`feat/nextjs-migration`. Il distingue les preuves locales des verifications qui
exigent encore un acces administrateur aux services externes.

## Version

- Branche : `feat/nextjs-migration`
- Dernier commit GitHub : `f8d6e82`
- Depot : `christopherfordant/GetYourMentor`
- Site Netlify : `gregarious-fox-fff605`
- Projet Supabase lie : `getyourmentor-preprod`
- Reference Supabase : `pqxqqbwesfrefzjoawmx`

## Preuves locales

- Build Next.js : PASS.
- TypeScript : PASS.
- Playwright : 102/102 PASS, desktop et mobile.
- Smoke de securite sans secrets : PASS.
- Contrat Netlify : PASS (`gym-next`, `npm run build`, `.next`).
- Schema applicatif statique : PASS (six tables MVP, RLS, contraintes de
  creneaux et buckets prives attendus).
- Frontiere des secrets client/serveur : PASS.
- Workflows n8n : PASS, six exports inactifs et sans secret reel.
- Geolocalisation : PASS pour le sportif, le coach avec rayon d'intervention
  et l'etablissement.
- Roles couverts : sportif, coach, etablissement et administrateur.
- Parcours couverts : recherche, filtres, reservation, acceptation, paiement,
  remboursement, fidelite, messages, avis et verification coach.

## Configuration externe verifiee sans exposer de valeur

Netlify production contient les noms suivants :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `PAYMENT_PROVIDER=stripe`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

`CRON_SECRET` a ete regenere avec une valeur aleatoire forte et enregistre
comme secret Netlify. Aucune valeur secrete n'est conservee dans ce registre.

## Validations encore ouvertes

1. Netlify refuse les nouveaux builds avec `Skipped due to account credit usage
   exceeded`. Le commit `f8d6e82` est pousse sur GitHub mais n'est pas encore
   servi publiquement.
2. La CLI Supabase refuse l'endpoint de gestion avec les droits du compte
   courant. Un proprietaire ou administrateur doit appliquer
   `SUPABASE_APP_SCHEMA_GYM.sql`, executer
   `SUPABASE_PREPRODUCTION_VERIFY.sql` et archiver les resultats.
3. La recette Stripe/Resend avec des evenements et une adresse de test reelles
   reste a executer sur une URL de preproduction a jour.
4. Les textes juridiques, l'identite de l'editeur et l'approbation juridique
   doivent etre fournis par les responsables competents. Aucun contenu invente
   ne doit etre active en production.
5. La recette utilisateur multi-roles et la politique de retention des pieces
   justificatives restent a valider avant ouverture publique.

## Regle de sortie

Ne pas declarer la mise en production tant que les cinq points ouverts ne sont
pas preuves. Le code peut continuer a evoluer et etre teste localement, mais
les donnees reelles, les secrets et les contenus juridiques ne doivent pas etre
ajoutes au depot Git.
