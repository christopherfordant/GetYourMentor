# Résultats de contrôle — GYM-D1.3, 13 novembre 2026

## Modifications proposées

- `supabase/proposals/demo-public-20261112/004_demo_schedule_idempotency.sql` : migration additive des créneaux, de la clé d'idempotence, des fonctions de réservation/transitions et de leurs droits/RLS.
- `005_demo_schedule_idempotency_tests.sql` : 25 assertions pgTAP proposées ; non exécutées dans ce lot.
- `006_rollback_schedule_idempotency.sql` : rollback ciblé, transactionnel, avec verrouillage et refus si les données ajoutées existent.
- `007_postgres12_contract_smoke.sql` : test comportemental reproductible pour PostgreSQL standard, après le bootstrap `008_postgres12_auth_shim_bootstrap.sql`. Il n'est pas présenté comme un test Supabase.

## Contrôles réellement exécutés

| Contrôle | Résultat | Périmètre réel |
|---|---|---|
| `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` | PASS | Vérifications statiques de la proposition, des rôles, des fonctions, des cas pgTAP décrits et du rollback. |
| `node --test tools/agentic-workbench/tests/*.test.mjs` | PASS, 35/35 | Tests existants du workbench. |
| PostgreSQL `initdb` / `psql` 12.15 jetable | PASS | Instance temporaire distincte du service PostgreSQL déjà actif ; shim local défini dans `008` (`auth.users`, `auth.uid()`, `auth.role()` et rôles `anon`, `authenticated`, `service_role`). Application de `001` puis `004`, exécution du smoke `007` dans une transaction annulée. |
| Accès/RLS | PASS sur le shim | Anon voit la fixture mais pas le créneau privé ; sportif voit une fixture mais pas le créneau d'un autre coach ; le coach voit son créneau privé ; rôles navigateur sans droit d'appeler les fonctions de mutation. |
| Réservation/rejeu/états | PASS sur le shim | Répétition identique retourne le même identifiant sans doublon ; payload différent sous la même clé refusé ; seconde réservation du même créneau refusée ; annulation rend le créneau disponible ; nouvelle réservation et acceptation fonctionnent ; répétition de transition finale idempotente ; inversion d'un état final refusée. |
| Rollback `006` | PASS après correction | Refus observé avec un créneau présent, données préservées ; succès après suppression des données synthétiques. Le premier essai a révélé la dépendance FK : la colonne `slot_id` doit être supprimée avant la table. Le rollback a été corrigé puis vérifié. |

## Limites et état

Ce contrôle ne couvre pas le moteur ou les extensions Supabase : Supabase CLI, Docker et pgTAP n'étaient pas disponibles. Le shim PostgreSQL n'émule pas toute l'authentification Supabase. Le test `005` reste à exécuter sur une instance Supabase locale/jetable avant d'intégrer l'adaptateur. Aucun SQL n'a été exécuté sur un projet distant, aucune variable Netlify n'a été changée et aucun code applicatif n'a été modifié.

L'instance jetable PostgreSQL a été arrêtée après les essais. La suppression de ses fichiers temporaires a été refusée par la protection d'exécution ; ils restent dans `%TEMP%\gym-demo-d13-check-20261113` et ne contiennent que le cluster de test synthétique. Le service PostgreSQL préexistant n'a pas été arrêté ni modifié.

GYM-D1.3 reste **En cours** : proposition additive et preuve comportementale sur PostgreSQL standard disponibles ; validation pgTAP/Supabase locale et revue d'intégration encore requises.
