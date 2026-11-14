# Point d’entrée recruteur — 14 novembre 2026

## Changement

L’accueil présente désormais, après le hero, un accès « Vous recrutez ? Testez le parcours sportif. » vers `/demo`. Le texte décrit les étapes réellement simulées : coach fictif, acceptation de démonstration, paiement sans carte ni paiement réel.

Le bloc est rendu uniquement si `getDemoSessionConfig()` valide tous les paramètres de la cible Netlify et du projet Supabase de démonstration. La page d’accueil est pré-rendue au build : le bloc sera donc visible après un build effectué avec la configuration dédiée complète. En l’absence de configuration, le parcours demeure fermé et aucun lien vers un parcours indisponible n’est affiché.

## Contrôles

- `npm run check:types` : réussi.
- `npm run check:client-secret-boundary` : réussi.
- `npm run check:netlify-config` : réussi.
- `npm run check:tracked-secrets` : réussi.
- `npm run build` : réussi. Avertissements Autoprefixer préexistants sur `flex-start`/`flex-end` dans les feuilles CSS existantes.
- `npx playwright test tests/demo-home-entry.spec.ts tests/demo-booking.spec.ts tests/demo-recruiter-session.spec.ts --reporter=line --workers=1` : 36/36 réussis, desktop et mobile. Tests réseau Supabase simulés ; aucune recette runtime.
- Inspection navigateur locale avec variables factices de démonstration : encart rendu avec le lien `/demo`. Aucune requête à Supabase n’a été faite par cette vérification d’accueil.
- `git diff --check` : réussi.

## Limites / prochaine étape

Au contrôle public du 14 novembre, le site Netlify cible n’avait ni `SITE_ID` ni variables `GYM_DEMO_*`, `GET /api/health` répondait `supabase=false` et `GET /demo` répondait 404. Aucun déploiement ni réglage distant n’a été effectué dans ce lot. Le parcours public complet reste donc indisponible. GYM-D1.5 demeure `progress`, en attente du schéma/configuration/runtime dédiés et de la recette Supabase/RLS. Ne pas fermer le ticket sur la base de tests simulés.
