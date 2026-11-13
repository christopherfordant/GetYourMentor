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

Le contrôle statique `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` vérifie maintenant ces contrats. L'essai comportemental a été exécuté sur une instance temporaire PostgreSQL 12.15 séparée du service local déjà actif. L'auth shim reproduit les noms de rôles et les fonctions `auth.uid()`/`auth.role()` nécessaires, sans équivaloir au runtime Supabase. Le passage pgTAP/Supabase CLI et la revue de compatibilité restent obligatoires avant de considérer GYM-D1.3 terminé ou d'intégrer l'adaptateur. Résultats détaillés : `docs/assets/demo-schema-d13-2026-11-13/CONTROL_RESULTS.md`.

Reproduction locale : créer un cluster neuf jetable (`initdb -D <nouveau-dossier-temporaire> -U postgres -A trust`), le démarrer sur `127.0.0.1` avec un port libre, puis exécuter dans ce cluster `008_postgres12_auth_shim_bootstrap.sql`, `001_demo_schema.sql`, `004_demo_schedule_idempotency.sql` et `007_postgres12_contract_smoke.sql` via `psql -v ON_ERROR_STOP=1`. Arrêter puis supprimer uniquement le cluster neuf après avoir vérifié son chemin. Ne pas réutiliser le service local préexistant ni lancer `008` sur Supabase. Ce smoke test ne remplace pas pgTAP ni le runtime Supabase.

**Contrainte opérationnelle du 13 novembre 2026 : Docker est exclu (ne pas installer ni utiliser).** La validation pgTAP/Supabase locale ne peut être lancée que si un runner local jetable compatible, déjà disponible sans Docker, est fourni. Sinon, conserver GYM-D1.3 ouvert et demander ce runner ou une décision distincte sur l'installation locale d'outils ; ne pas basculer vers une base distante.
