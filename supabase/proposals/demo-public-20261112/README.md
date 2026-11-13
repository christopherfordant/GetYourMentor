# Schéma de démonstration recruteur — état courant

Le schéma de `001_demo_schema.sql` est appliqué uniquement au projet Supabase dédié `getyourmentor-demo-recruiter` (réf. non secrète `rqxoovriacgoriimpbwi`, région Paris, offre Free). Il ne doit jamais être appliqué à `getyourmentor-preprod` ou à une base de production.

Le modèle sépare les sessions coach/sportif, les profils fictifs, les réservations dont l'approbation et le paiement sont contraints à `simulated`, et les liaisons Telegram protégées côté serveur. L'accès est limité par RLS. Les parcours et mutations applicatifs ne sont pas encore implémentés.

## Contrôles

`002_demo_rls_tests.sql` contient 34 assertions pgTAP avec identités synthétiques. Les tests ont été exécutés dans le projet dédié : les 34 assertions passent. Ils couvrent les accès anon, sportif, coach et service, l'isolation des données, les fixtures, l'effacement, Telegram et le rejet des modes réels. Les données synthétiques sont dans une transaction annulée ; une vérification a confirmé zéro utilisateur de test, session, coach, réservation ou liaison Telegram restant.

Consulter `docs/SUPABASE_DEMO_PROVISION_2026-11-12.md` pour les preuves et les limites. Le résultat ne valide ni l'application, ni le site Netlify, ni la sécurité globale.

## Garde-fous et suite

- Aucun secret ou clé de projet dans Git ou la conversation ; les secrets sont à saisir uniquement dans le gestionnaire du site démo confirmé.
- Le projet de recette `getyourmentor-preprod` et le projet personnel en pause n'ont pas été touchés.
- Le site GetYourMentor du portfolio n'est pas connecté à cette base.
- Préparer une migration de retour et examiner la compatibilité des routes avant l'intégration.
- Confirmer le site Netlify exact depuis le lien du portfolio avant d'y configurer la moindre variable.
- Ne pas annoncer un vrai coach IA, un paiement réel, ou une notification Telegram fonctionnelle : aucun n'est raccordé ici.

## Marche arriere et compatibilite

`003_rollback_empty_demo_schema.sql` est une marche arriere manuelle, transactionnelle, avec verrouillage et refus si une des quatre tables contient des donnees. Verifier la reference projet `rqxoovriacgoriimpbwi` dans le tableau avant execution. Elle n'a pas ete executee. L'audit de compatibilite est dans `docs/DEMO_SCHEMA_INTEGRATION_AUDIT_2026-11-12.md` : l'auth anonyme et les repositories `gym_demo_*` ne sont pas encore raccordes au candidat applicatif.

## Proposition additive — créneaux et rejeu idempotent (13 novembre)

`004_demo_schedule_idempotency.sql` ajoute les créneaux coach, la clé de rejeu et une empreinte non sensible aux réservations, ainsi que deux fonctions serveur transactionnelles pour réserver et faire évoluer l'état. Les écritures directes par `anon`/`authenticated` sont refusées ; la lecture anon est limitée aux créneaux des fixtures. La réservation verrouille le créneau, réserve atomiquement son état et renvoie le même identifiant pour une répétition identique. Une annulation libère le créneau ; une réservation déjà finale n'est pas réouverte. Ces fonctions ne réalisent aucun paiement ni notification.

`005_demo_schedule_idempotency_tests.sql` ajoute 25 assertions pgTAP. `006_rollback_schedule_idempotency.sql` ne retire que l'extension additive et refuse de le faire si des créneaux ou des réservations utilisant les nouveaux champs existent. `007_postgres12_contract_smoke.sql` vérifie le comportement sur PostgreSQL 12 standard avec un shim `auth` local ; ce n'est pas un test Supabase ni pgTAP. Les migrations 004 et 006 sont des propositions locales : elles n'ont pas été appliquées au projet Supabase distant.

Le contrôle statique `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` vérifie maintenant ces contrats. Le 13 novembre, 34 assertions de base et 25 assertions additives ont passé pgTAP 1.3.0 sur un cluster temporaire PostgreSQL 12.15 avec shim Auth ; deux scénarios à deux processus ont vérifié le rejeu concurrent et la réservation concurrente du même créneau. Le shim ne constitue pas le runtime Supabase. Résultats et limites : `docs/DEMO_SCHEMA_PGTAP_CONCURRENCY_2026-11-13.md`.

Reproduction locale : créer un cluster neuf jetable (`initdb -D <nouveau-dossier-temporaire> -U postgres -A trust`), le démarrer sur `127.0.0.1` avec un port libre, puis exécuter dans ce cluster `008_postgres12_auth_shim_bootstrap.sql`, `001_demo_schema.sql`, `004_demo_schedule_idempotency.sql` et `007_postgres12_contract_smoke.sql` via `psql -v ON_ERROR_STOP=1`. Arrêter puis supprimer uniquement le cluster neuf après avoir vérifié son chemin. Ne pas réutiliser le service local préexistant ni lancer `008` sur Supabase. Ce smoke test ne remplace pas pgTAP ni le runtime Supabase.

**Contrainte opérationnelle du 13 novembre 2026 : Docker est exclu (ne pas installer ni utiliser).** Les tests pgTAP et de concurrence peuvent être reproduits sur un cluster PostgreSQL 12 jetable avec le shim Auth local. Ces contrôles ne remplacent pas une validation du runtime Supabase ; ne pas basculer vers une base distante pour la compléter.

## Acteur fictif stable et acceptation de démonstration (14 novembre)

`009_demo_fixture_actor_booking.sql` ajoute un catalogue de coachs fictifs et de créneaux autorisés, puis une fonction réservée au serveur qui crée/réutilise l’acteur fictif stable, réserve le créneau et enregistre l’acceptation simulée dans une transaction idempotente. `gym_demo_confirm_simulated_payment` ne met à jour que l’état `simulated_confirmed` après acceptation ; il n’appelle aucun fournisseur de paiement. Les rôles `anon` et `authenticated` ne peuvent pas invoquer ces mutations ni modifier le catalogue/acteur partagé. `011_demo_fixture_actor_booking_tests.sql` couvre ces garanties ; `010_rollback_fixture_actor_booking.sql` refuse toute suppression si les objets métier de cette extension existent et vérifie le catalogue initial avant son retrait.

Résultats locaux du 14 novembre, PostgreSQL 12.15 jetable avec shim Auth : les suites `002` 34/34, `005` 25/25 et `011` 33/33 passent ; deux essais concurrents vérifient le rejeu idempotent et le conflit de créneau ; le rollback a refusé le schéma peuplé puis réussi après nettoyage des seules données synthétiques de test. Rapport et journaux : `docs/DEMO_SCHEMA_D13_FIXTURE_ACTOR_2026-11-14.md` et `docs/assets/demo-schema-d13-2026-11-14/`. Cela ne valide pas le runtime Supabase ni l’application web.
