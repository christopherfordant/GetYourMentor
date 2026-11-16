# Migrations du schéma de démonstration — 16 novembre 2026

## Cible et périmètre

- Projet Supabase affiché dans la session : `getyourmentor-demo-recruiter`, ref `rqxoovriacgoriimpbwi` (organisation Mutuelle Automatisation, région Paris selon le relevé D1.2).
- Les migrations ont été lancées dans l’éditeur SQL du projet dédié, une par une. Aucune valeur secrète ni donnée métier n’a été consultée.
- Aucun changement Netlify, aucune variable, aucun déploiement, aucune notification ou paiement n’a été effectué.
- Le tableau de bord affiche le projet `main` avec le badge d’environnement `PRODUCTION` : ce badge décrit la branche primaire de ce projet Supabase, pas une preuve que les données proviennent du site de démonstration. Le projet est identifié par son nom et sa ref dédiés, et reste distinct du projet `getyourmentor-preprod` documenté.

## Migrations appliquées

| Fichier local | SHA-256 du fichier | Résultat SQL Editor |
|---|---|---|
| `supabase/proposals/demo-public-20261112/004_demo_schedule_idempotency.sql` | `8760C853C28CA0011910A52E1DDDF684E5EBEDE0D4E1A21E6197424B3F01EADC` | Success — no rows returned |
| `supabase/proposals/demo-public-20261112/009_demo_fixture_actor_booking.sql` | `FBF205C5E3AB399FAA0327944F435CDABDA77152393149C5D07B5D1CC1684750` | Success — no rows returned |
| `supabase/proposals/demo-public-20261112/012_demo_session_erasure.sql` | `DAEE1485D8D80E00F4A8CD596DE35118C96E51348F49ADB8A718FB70B50D089B` | Success — no rows returned |

Les définitions SQL ont été contrôlées avant exécution. L’avertissement Supabase sur 012 correspond aux fonctions de suppression/purge définies par cette migration ; les `DELETE` sont dans le corps des fonctions et n’ont pas supprimé de lignes pendant l’application du DDL. Le déclencheur de libération de créneau et les RPC de démo ont été créés. La fixture est fictive (coach tennis et modèles de créneau), sans import d’utilisateur.

## Vérifications après application

- Lecture du catalogue système : 13 objets attendus recensés dans le résultat (tables, politiques et fonctions RPC/déclencheur) ; les fonctions de réservation, transition, acceptation de fixture, paiement simulé, effacement et purge sont visibles.
- Une requête en lecture seule confirme `relrowsecurity = true` pour `gym_demo_fixture_catalog`, `gym_demo_fixture_slot_templates` et `gym_demo_slots`. `FORCE ROW LEVEL SECURITY` est `false` pour ces tables ; les appels privilégiés restent contrôlés par les fonctions `service_role` prévues par le contrat. Ce contrôle de métadonnées ne remplace pas les tests d’autorisation runtime.
- Aucun test d’inscription, réservation ou paiement contre Supabase n’a été exécuté ; aucune donnée métier n’a été lue.
- Contrôle public effectué par GET le 16 novembre : `/` = 200 ; `/api/health` = 200 avec `supabase=false` ; `/demo` = 404. Le code servi n’est donc pas encore raccordé à ce schéma.

## Limites et reprise

L’application des migrations est une exécution manuelle dans SQL Editor. Le tableau de bord continue d’indiquer qu’aucune migration n’est suivie par son historique ; la réconciliation avec un historique CLI n’a pas été faite. Ne pas rejouer ces fichiers sans vérifier les objets existants. GYM-D1.5 reste `progress` : l’adaptateur et l’expérience publique ne sont pas validés contre le runtime réel. Conformément à GYM-D1.2, les variables Netlify restent différées au ticket D1.9. La prochaine action est de préparer la configuration serveur de la cible Netlify dédiée au moment prévu par le Kanban, puis d’effectuer les contrôles de runtime/RLS et le parcours E2E avant toute publication.
