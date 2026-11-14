# GYM-D1.4 — effacement et rétention des données de parcours

Date : 14 novembre 2026. Travail local dans le checkout isolé `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, à partir de `e1cf57f0d6ab830582aacb368d0d5a1347c5d91e`. Le checkout principal et ses modifications préexistantes n’ont pas été touchés.

## Contrat ajouté

- `012_demo_session_erasure.sql` ajoute `gym_demo_delete_my_athlete_session(uuid)`. La fonction s’exécute avec les droits de l’appelant et ne supprime que la session `sportif` dont `owner_user_id = auth.uid()`. Une répétition retourne `false` sans révéler si une session d’autrui existe.
- La suppression de session cascade sur les réservations, données de coach appartenant à une session, références de consentement Telegram et créneaux possédés. Pour les réservations liées à un créneau fictif public réutilisable, un déclencheur remet à `available` le créneau encore futur. Le coach fictif partagé et le catalogue restent en place.
- La rétention par défaut d’une session reste 24 h. `gym_demo_purge_expired_athlete_sessions()` supprime, lorsqu’elle est appelée, uniquement les sessions sportives expirées et est exécutable uniquement avec le rôle `service_role`.

## Contrôles exécutés

Environnement : cluster PostgreSQL 12.15 jetable déjà créé pour D1.3, chemin `%LOCALAPPDATA%\Temp\gym-d13-fixture-20261114-545b95c7\data`, écoute locale `127.0.0.1:55463`. Son chemin et sa version ont été vérifiés avant démarrage. Le service PostgreSQL Windows préexistant n’a pas été utilisé, redémarré ni reconfiguré. Aucun Docker ni Supabase distant n’a été utilisé.

Migrations déjà présentes dans le cluster : `001`, `004`, puis application locale de `009` et `012`. pgTAP 1.3.0 fourni par les artefacts locaux existants ; tests lancés via `psql` avec les assertions TAP visibles. Les suites ont toutes terminé sans `not ok` et ont annulé leurs données synthétiques par rollback :

- `002_demo_rls_tests.sql` : 34 assertions réussies ;
- `005_demo_schedule_idempotency_tests.sql` : 25 réussies ;
- `011_demo_fixture_actor_booking_tests.sql` : 33 réussies ;
- `013_demo_session_erasure_tests.sql` : 21 réussies.

Après les suites, les comptes synthétiques, sessions, coachs, réservations, créneaux et références Telegram préfixés pour ces tests étaient tous à zéro. Les journaux sont archivés sous `docs/assets/demo-schema-d14-2026-11-14/`. `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` et `git diff --check` ont également été exécutés.

## Limites et suite requise

Ce lot valide le contrat SQL sur PostgreSQL standard avec shim Auth, pas sur le runtime Supabase. Les migrations sont locales et ne sont pas appliquées au projet distant. Le dépôt n’a toujours pas de route/contrôleur applicatif qui authentifie la session, appelle l’effacement et expire le cookie ; l’identité correspondante dans `auth.users` demeure après suppression des données de parcours. La purge TTL est une fonction exécutable par le serveur, mais aucun ordonnanceur ne l’appelle encore. Il faut raccorder ces deux actions lors du travail d’adaptateur, et tester qu’elles ne peuvent supprimer que l’identité/données de démonstration du testeur.

Le site public conserve l’état précédemment observé (`/api/health` avec `supabase=false`, route `/demo` en 404) ; aucun site, variable ou compte Netlify n’a été modifié. GYM-D1.4 reste donc en progression, non terminé. Prochaine action : implémenter le handler serveur d’effacement lors de l’adaptateur D1.5, régler la suppression d’identité Auth côté serveur et connecter l’appel TTL à un ordonnanceur pris en charge par le site de démonstration, puis exécuter les tests d’intégration avant clôture.
