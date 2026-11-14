# GYM-D1.5 — première tranche du parcours sportif local

## Complément de contrôle — 14 novembre 2026

Le worktree est maintenant au commit parent `7fac27396f0756ffafb4a98f3a7a7a450a9282d5`. Le parcours `/demo` échoue désormais de façon explicite et sans proposer un démarrage impossible lorsque l’API signale que Supabase démo n’est pas configuré. Les routes catalogue, réservations et paiement répondent toutes 503 sans appel réseau quand la configuration est absente.

### Précontrôle distant en lecture seule

Session navigateur déjà ouverte, compte et cible vérifiés : Netlify `getyourmentor-demo-20261014`, Site ID `86e0379e-4d1a-4cf0-936c-1439397354f4` ; Supabase `getyourmentor-demo-recruiter`, ref `rqxoovriacgoriimpbwi`, région `eu-west-3`, statut `Healthy`, distinct de `getyourmentor-preprod`. Le dashboard Supabase indique « No migrations » et aucun dépôt Git connecté.

Des requêtes SQL strictement en lecture seule sur les catalogues système ont trouvé quatre tables publiques `gym_demo_*` : `coaches`, `reservations`, `sessions`, `telegram_links`. RLS est activé sur les quatre ; nombre de politiques respectif : 4, 1, 3 et 0. Aucun RPC `gym_demo_*` n’est présent. Les tables `gym_demo_slots`, `gym_demo_fixture_catalog` et `gym_demo_fixture_slot_templates` attendues par les migrations applicatives ne sont pas présentes. Aucune ligne métier ni valeur de secret n’a été lue. Le schéma distant correspond donc à une base partielle préexistante, pas au contrat complet des migrations D1.3/D1.4.

Dans les variables du seul site Netlify cible, les noms visibles sont `DEPLOY_ENV`, `GETYOURMENTOR_ALLOW_DEMO`, `NEXT_PUBLIC_APP_URL`, `PAYMENT_PROVIDER`, `PLATFORM_COMMISSION_BPS` et `SESSION_SECRET`. Aucun `SITE_ID` ni variable `GYM_DEMO_*` n’est présent dans cette liste. La valeur de `SESSION_SECRET` n’a pas été consultée ; l’interface la signale comme probablement sensible mais non marquée comme secret. Le contrôle public reste `/api/health` avec `supabase=false` et `/demo` en 404.

Aucune migration distante, modification de variable, lecture de donnée métier, publication ou notification n’a été effectuée. Avant tout raccordement, il faut réconcilier le schéma existant sans rejouer `001` à l’aveugle, tester l’enchaînement additif 004/009/012 contre cette base réelle, puis autoriser explicitement l’application distante et la configuration du site cible. Le ticket reste ouvert.

Contrôles de cette tranche : `npm run check:types`, `npm run build`, `npm run check:client-secret-boundary`, `npm run check:netlify-config`, `npm run check:tracked-secrets`, `node --test tools/agentic-workbench/tests/*.test.mjs` (35/35) et Playwright `tests/demo-booking.spec.ts tests/demo-recruiter-session.spec.ts` (34/34 sur desktop et mobile). Les tests de parcours et d’API utilisent des réponses simulées ; ils ne prouvent pas l’intégration au runtime Supabase.

Recontrôle HTTP public par `curl.exe` : `/` 200, `/api/health` 200 avec `mode=demo`, `ready=true`, `supabase=false`, et `/demo` 404. Le site public n’a pas reçu ce correctif. La configuration runtime dédiée et la publication restent donc bloquantes ; aucun réglage Netlify, secret, migration distante ni déploiement n’a été touché.

Contexte historique de l’implémentation initiale : worktree `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, départ au commit `42e7ef8e856083a6cde0095129fef0308ffdc253` ; aucun autre worktree n’a été modifié.

## Réalisation

- Ajout de `/demo`, sans référencement, avec un parcours unique de sportif : session temporaire, sélection d’une fixture et d’un créneau, acceptation automatique explicitement simulée, paiement simulé, affichage des réservations et effacement individuel.
- Ajout des routes `/api/demo/catalog`, `/api/demo/reservations` et `/api/demo/payment`. Le catalogue expose uniquement les fixtures actives et leurs modèles de créneau. La lecture des réservations utilise le jeton de l’identité anonyme et RLS. Les mutations valident le cookie chiffré, l’identité anonyme Auth et la ligne de session possédée avant d’appeler les RPC de service.
- La réservation utilise `gym_demo_book_and_accept_fixture` avec une clé d’idempotence UUID, et mappe l’indisponibilité du créneau à HTTP 409. Le paiement vérifie préalablement que la réservation acceptée appartient à la session, puis appelle seulement `gym_demo_confirm_simulated_payment`. Aucun fournisseur de paiement ou service de notification n’est appelé.
- Le contrat D1.4 est réutilisé pour renouveler et vérifier la session. Le nettoyage conserve les fixtures partagées.

## Contrôles réalisés

- `npm run check:types` : réussi.
- `npm run build` : réussi ; Next inclut `/demo` et les routes API de démonstration.
- `npm run check:client-secret-boundary`, `npm run check:netlify-config` et `npm run check:tracked-secrets` : réussis.
- `npx playwright test tests/demo-booking.spec.ts tests/demo-recruiter-session.spec.ts --reporter=line` : 30/30 réussis sur les projets desktop Chromium et mobile Chromium. Le test de parcours navigateur utilise des réponses d’API simulées ; les tests de routes injectent des réponses Supabase fictives. Ils vérifient le rendu sans débordement, les appels de réservation/paiement, le conflit de créneau, l’effacement, la session possédée et l’absence d’appel Stripe.
- `node --test tools/agentic-workbench/tests/*.test.mjs` : 35/35 réussis.
- `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` et `git diff --check` : réussis.

## Limites et suite

Ce lot ne valide pas une transaction réelle sur PostgreSQL ni le runtime Supabase : aucune requête réseau Supabase, migration distante, configuration Netlify ou déploiement n’a eu lieu. Les routes restent inactives tant que les variables dédiées à la cible du site ne sont pas configurées. Le catalogue SQL actuel contient une fixture tennis et deux modèles de créneau ; l’interface n’invente aucun autre coach. La disponibilité réelle reste décidée atomiquement par la fonction SQL, qui peut répondre « créneau indisponible ».

Contrôle public en lecture seule effectué après le commit local : `GET /` = 200, `GET /api/health` = 200 avec `mode=demo` et `supabase=false`, `GET /demo` = 404. Aucun déploiement ne s’est produit à la suite du push Git. Dans le processus local contrôlé, les noms des variables de session/Supabase attendues ne sont pas définis ; aucune valeur de secret n’a été lue. Ce constat ne prouve pas à lui seul la configuration interne de Netlify, mais l’endpoint public confirme que Supabase n’est pas actif dans le runtime servi.

Le ticket GYM-D1.5 reste `progress` : les contrôles HTTP/SQL sont simulés et ne satisfont pas la recette avec identité jetable sur une base configurée. Les étapes de runtime/RLS et de vérification sur l’URL restent ouvertes ; les constats publics ci-dessus ont été renouvelés le 14 novembre après le push Git.
