# D1.3 — pgTAP, concurrence et retour arrière local — 13 novembre 2026

## Environnement et provenance

- PostgreSQL 12.15, cluster temporaire neuf sous `%LOCALAPPDATA%\Temp\gym-d13-pgtap-f735de6496e847c2a3520d1bd96c42c7\cluster-data`, écoute limitée à `127.0.0.1:55449`.
- Le service PostgreSQL Windows préexistant n'a pas été utilisé, arrêté ou reconfiguré. Aucune base distante n'a été contactée.
- pgTAP 1.3.0, code source officiel `theory/pgtap` tag `v1.3.0`, commit `e4c64d19d9b1c94b9e4b478244f7f81dbe514ec4`; archive téléchargée SHA-256 `889A868C645F4DC2D8A9112B3925C5B4A9C5D6956F51B70197DF397510A421E7`.
- Le fichier SQL pgTAP a été généré depuis `sql/pgtap.sql.in` en appliquant les substitutions de version/OS du projet, puis chargé uniquement dans cette base jetable. Aucun fichier d'extension n'a été installé dans PostgreSQL Windows. `pg_prove`, Supabase CLI et Docker n'ont pas été utilisés.
- Le shim local `008_postgres12_auth_shim_bootstrap.sql` reproduit les rôles et fonctions Auth utilisés par les politiques ; il ne constitue pas le runtime Supabase.

## Résultats

- `001_demo_schema.sql` appliquée au cluster jetable, puis `002_demo_rls_tests.sql` : **34/34 assertions pgTAP réussies**. Les mutations synthétiques ont été annulées par le test.
- `004_demo_schedule_idempotency.sql` appliquée, puis `005_demo_schedule_idempotency_tests.sql` : **25/25 assertions pgTAP réussies** après correction d'une attente de test. Le privilège `EXECUTE` étant révoqué pour `authenticated`, PostgreSQL renvoie `permission denied for function gym_demo_book_slot` avant d'entrer dans le corps de la fonction ; l'assertion attendait à tort le message interne `server role required`. L'assertion vérifie désormais le refus effectif à la frontière SQL. Aucun code applicatif ou de production n'a été modifié.
- Concurrence, deux processus `psql` distincts : (1) deux requêtes identiques simultanées avec la même clé ont reçu le même UUID et créé une seule réservation ; (2) deux sportifs avec des clés distinctes ont concouru pour le même créneau : une réservation a réussi, l'autre a reçu `slot unavailable`, une seule réservation est restée et le créneau est `booked`.
- Retour arrière `006_rollback_schedule_idempotency.sql` : avec des créneaux présents, la migration a refusé le retour (code psql 3) et les deux créneaux sont restés présents. Après suppression vérifiée des seules lignes synthétiques créées par ce contrôle (zéro résidu), le retour sur le schéma vide a réussi ; la table des créneaux et les trois colonnes additives ont disparu.
- Journaux TAP : `docs/assets/demo-schema-d13-2026-11-13/local-pgtap-002.log`, `local-pgtap-005-initial.log` et `local-pgtap-005-pass.log`.
- Le cluster PostgreSQL temporaire a été arrêté et son service préexistant est resté actif. La suppression récursive du dossier temporaire contenant le cluster et l'archive pgTAP a été refusée par la politique d'exécution ; le dossier arrêté est conservé sous `%LOCALAPPDATA%\Temp\gym-d13-pgtap-f735de6496e847c2a3520d1bd96c42c7`.

## Limites et statut

Les migrations additives, les politiques, les assertions et le retour arrière ont été exercés sur PostgreSQL 12.15 avec un shim Auth, pas sur un runtime Supabase local. Aucun contrôle Netlify, parcours web, adaptateur applicatif, donnée distante, paiement, notification ou déploiement n'a été réalisé. D1.3 reste `progress` : il dépend de D1.2, qui reste `progress`, et ces essais ne prouvent pas la compatibilité du runtime Supabase. Docker demeure exclu.
