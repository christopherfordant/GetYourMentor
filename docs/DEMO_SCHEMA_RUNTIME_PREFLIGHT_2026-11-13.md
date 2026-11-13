# Preflight PostgreSQL local — GYM-D1.3 — 13 novembre 2026

Contrôle en lecture seule de l'environnement disponible. Aucun service n'a été démarré ou arrêté, aucun outil installé, aucune base distante consultée et aucune donnée modifiée.

## Résultat

- PostgreSQL 12 est installé dans `C:\Program Files\PostgreSQL\12`. `initdb.exe`, `pg_ctl.exe` et `psql.exe` sont présents.
- Le service Windows `postgresql-x64-12` est déjà en cours d'exécution. Son répertoire de données est un environnement préexistant : il n'a pas été utilisé comme base jetable.
- L'extension pgTAP (`share/extension/pgtap.control`) n'est pas présente pour cette installation PostgreSQL 12.
- `pg_prove`, Supabase CLI et Docker ne sont pas disponibles dans le PATH vérifié. Aucun n'a été installé ni exécuté.
- Aucun cluster temporaire n'a été créé pendant ce contrôle. Le smoke test PostgreSQL 12 avec shim `auth` déjà archivé dans `docs/assets/demo-schema-d13-2026-11-13/CONTROL_RESULTS.md` est une preuve antérieure, pas un nouveau test de cette session.

## Conséquence pour le ticket

Les 25 assertions pgTAP de `005_demo_schedule_idempotency_tests.sql` et le scénario de concurrence restent non exécutés. Le prérequis `GYM-D1.3` n'est donc pas satisfait et son statut reste `progress`. La migration additive et les assertions doivent être exécutées sur une instance locale/jetable dédiée munie de pgTAP, puis le test de concurrence doit utiliser deux transactions/sessions distinctes. Ne pas utiliser le service PostgreSQL déjà actif, le projet Supabase distant, `getyourmentor-preprod` ou l'ancien site.

Docker est exclu des prochaines étapes opérationnelles. Pour lever ce blocage sans installer d'outil dans ce lot, il faut fournir un runner local jetable déjà équipé de PostgreSQL compatible et pgTAP (ou décider séparément d'autoriser une installation locale). Aucun contournement par une base distante n'est prévu.
