# GYM-D1.5 — première tranche du parcours sportif local

Date : 14 novembre 2026. Worktree `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`. Le lot part du commit `42e7ef8e856083a6cde0095129fef0308ffdc253` ; aucun autre worktree n’a été modifié.

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
