# Proposition locale de stockage — démo recruteur

Date : 12 novembre 2026. Ce document décrit une proposition non appliquée. Aucune connexion, migration, lecture de table, création de ressource, variable Netlify ou notification distante n'a été effectuée.

## Projet Supabase dédié

La liste de projets de l'organisation Supabase actuellement connectée a été consultée en lecture seule : elle contient `getyourmentor-preprod` et un ancien projet personnel en pause. Aucun projet réservé à la démo n'y est disponible. L'organisation indique l'offre gratuite et deux projets listés. Le projet de recette ne doit pas être réutilisé, et l'ancien projet n'a été ni restauré ni supprimé.

Étape propriétaire requise : désigner un projet déjà strictement isolé et destiné à cette démo, ou créer un projet de démo dans une organisation disposant d'une capacité disponible. Si l'organisation actuelle est retenue, son propriétaire doit d'abord examiner lui-même l'ancien projet en pause et choisir comment libérer une place ; aucune suppression ou restauration n'est autorisée par cette demande. Ne transmettre aucune clé dans la conversation. Après désignation, la référence du projet peut être saisie localement dans un environnement dédié, puis les tests exécutés sur une base locale jetable avant toute migration.

## Proposition locale

- `supabase/proposals/demo-public-20261112/001_demo_schema.sql` : tables séparées pour les sessions liées à `auth.users`, profils coach fictifs, réservations, états exclusivement simulés et liaison Telegram chiffrée côté serveur avec horodatage de consentement et révocation.
- `supabase/proposals/demo-public-20261112/002_demo_rls_tests.sql` : 34 assertions pgTAP proposées avec visiteur anonyme, coach, deux sportifs distincts et rôle serveur. Le scénario comprend la lecture des seules fixtures publiques, les refus d'accès croisé, la suppression individuelle en cascade sans toucher l'autre testeur ni aux fixtures, les droits serveur, le consentement/révocation Telegram et le rejet des états non simulés.
- `supabase/proposals/demo-public-20261112/README.md` : limites, prérequis et garde-fous.
- `supabase/proposals/demo-public-20261112/validate-proposal.mjs` : contrôle statique et textuel, sans connexion à une base.

Le rôle `anon` a `SELECT` sur `gym_demo_sessions` uniquement pour permettre à la politique de profils coach d'évaluer sa sous-requête `EXISTS`. Aucune politique sur les sessions ne s'applique à `anon` : RLS doit donc refuser et renvoyer zéro session. Les fixtures, elles, restent sélectionnables via la politique limitée à `is_fixture`.

Cette proposition ne constitue pas une migration prête à appliquer ni une intégration aux parcours applicatifs. Elle doit faire l'objet d'une revue, d'une validation de la compatibilité avec l'application et d'une exécution de pgTAP sur Supabase local. Les mutations de réservation, la suppression Auth, le chiffrement du chat Telegram et l'envoi de notifications nécessiteront des routes serveur vérifiant l'identité et le propriétaire ; rien de cela n'est implémenté ici. Les profils de test ne sont pas des coachs réels et la validation reste une simulation, sans modèle IA.

## Vérifications de ce lot

- `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` : PASS (présence des tables, RLS, grants, états simulés et scénarios de rôle attendus).
- `node --test tools/agentic-workbench/tests/*.test.mjs` : 35/35 PASS.
- `git diff --check` : PASS.
- `supabase test db`, `psql` et Docker : non exécutés, exécutables absents de l'environnement vérifié. En conséquence, la syntaxe PostgreSQL, les politiques RLS et les 34 assertions pgTAP n'ont pas été validées par un moteur PostgreSQL.
- Aucun parcours coach/sportif applicatif, paiement, message Telegram ou effacement de compte complet n'est revendiqué comme testé.

## Tickets

GYM-D1.2 reste bloqué jusqu'à la désignation d'un projet de démo isolé. GYM-D1.3 reste bloqué : seul un brouillon local est prêt et ses tests doivent être revus puis exécutés sur Supabase local. GYM-D1.4 à GYM-D1.9 restent dans leurs statuts précédents, car leurs critères applicatifs ou distants ne sont pas satisfaits. Les statuts sont consignés dans le Kanban ; aucun ticket n'est fermé par cette proposition.
