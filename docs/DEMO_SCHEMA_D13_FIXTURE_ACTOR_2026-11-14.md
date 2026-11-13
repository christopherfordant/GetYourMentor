# D1.3 — acteur fictif stable et confirmation simulée — 14 novembre 2026

## Portée

Travail effectué dans le checkout isolé `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, à partir du commit `545b95ca5bb09cd674338703a98421d2d303b5dd`. Le checkout principal et ses changements préexistants n’ont pas été modifiés.

La migration `009_demo_fixture_actor_booking.sql` ajoute un catalogue fictif public en lecture seule et des créneaux autorisés. Une fonction serveur crée ou réutilise atomiquement l’acteur fictif par clé, matérialise et réserve le créneau, puis enregistre une réservation acceptée en mode démonstration. La fonction de paiement ne fait qu’inscrire `simulated_confirmed` après l’acceptation. Les deux fonctions sont interdites aux rôles navigateur. Aucun appel Stripe, Telegram ou autre fournisseur n’existe dans ce contrat.

La migration est additive après `001` et `004`. `010_rollback_fixture_actor_booking.sql` vérifie que le catalogue correspond aux valeurs de départ et refuse de retirer l’extension si un acteur, créneau ou réservation de cette extension existe.

## Vérifications exécutées

- PostgreSQL 12.15 neuf, démarré uniquement sur `127.0.0.1:55463`, cluster temporaire `%LOCALAPPDATA%\Temp\gym-d13-fixture-20261114-545b95c7`. Le service Windows PostgreSQL préexistant est resté `Running` et n’a pas été utilisé, arrêté ou reconfiguré.
- Harness Auth local `008_postgres12_auth_shim_bootstrap.sql` et pgTAP 1.3.0 déjà préparé localement chargés dans ce cluster temporaire ; aucun Docker, Supabase distant, production ou préproduction n’a été utilisé.
- Après les migrations `001`, `004` et `009`, pgTAP : `002` 34/34, `005` 25/25 et `011` 33/33 ; zéro assertion `not ok`.
- Deux processus `psql` simultanés : répétition identique renvoie le même identifiant de réservation ; deux sportifs distincts en concurrence sur le même créneau obtiennent exactement un gagnant, l’autre reçoit `demo slot unavailable`.
- Retour arrière : refusé avec l’acteur et les réservations de synthèse présents, sans altérer ces lignes ; après suppression ciblée des seules données synthétiques créées pour le test, il a réussi. Vérification finale : les objets de l’extension `009` sont absents tandis que la table et la fonction de l’extension antérieure `004` restent présentes.
- Validateur statique `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` : PASS.

Les journaux TAP, scripts SQL de concurrence et vérifications sont archivés dans `docs/assets/demo-schema-d13-2026-11-14/`. Le cluster est arrêté. Son répertoire temporaire a été conservé après le refus de l’outil d’exécution de la suppression récursive ; il ne contient aucune donnée distante ni secret.

## Résultat et limites

Les critères locaux de contrat, RLS, idempotence, acceptation fictive, paiement simulé, concurrence et retour arrière de D1.3 sont maintenant couverts sur PostgreSQL 12.15 avec shim Auth. Le shim ne reproduit pas le runtime Supabase ; ni le runtime Supabase, ni un adaptateur web, ni `/demo`, ni le déploiement ne sont validés par ces tests. Le site publié continue donc à répondre `supabase=false` sur `/api/health` et `404` sur `/demo` jusqu’aux tickets applicatifs et à une publication autorisée.

Le ticket D1.3 peut être clos sur son périmètre de schéma/test local ; il ne signifie pas que Supabase est connecté. La prochaine tâche est D1.4, effacement individuel et purge TTL. Le fichier `docs/KANBAN_GYM_OPERATING_MODEL_2026-11-13.md` n’est pas présent dans ce checkout ; le Kanban canonique utilisé est `tools/agentic-workbench/backlog.json`.
