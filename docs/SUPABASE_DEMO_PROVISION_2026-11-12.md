# Supabase de démonstration — provisionnement et contrôles

Date : 12 novembre 2026.

## Ressource dédiée

- Projet : `getyourmentor-demo-recruiter`
- Référence Supabase : `rqxoovriacgoriimpbwi`
- Région : Europe (Paris), `eu-west-3`
- Offre observée : Free ; statut observé : Healthy
- Dashboard : https://supabase.com/dashboard/project/rqxoovriacgoriimpbwi

Le projet a été créé dans l’organisation déjà connectée, sans changement de formule. Il est distinct de `getyourmentor-preprod`. Le projet personnel en pause n’a pas été restauré, supprimé ou modifié. La création n’a pas connecté cette base au site Netlify du portfolio.

La création a activé l’API de données, désactivé l’exposition automatique des nouvelles tables et activé RLS automatique. Le schéma ajoute ses propres politiques RLS. Aucun secret ni clé de projet n’est consigné dans Git ou dans ce rapport. Aucune clé n’a été envoyée dans la conversation.

## Application et tests

La migration `supabase/proposals/demo-public-20261112/001_demo_schema.sql` a été appliquée à ce projet dédié via le SQL Editor. pgTAP a été activé dans `extensions`. La migration ne contient que les tables `gym_demo_*`, leurs grants, indexes et politiques.

Les 34 assertions de `002_demo_rls_tests.sql` ont été exécutées sur le projet dédié à partir de données synthétiques et se sont toutes conclues par `ok 1` à `ok 34`. Elles couvrent l’accès anonyme, les rôles sportif/coach/serveur, l’isolation des réservations, la protection des fixtures, la révocation Telegram et le rejet des états non simulés.

Le diagnostic a corrigé deux attentes pgTAP : `throws_ok` requiert le message d’erreur attendu en argument distinct du libellé du test ; et ces assertions utilisent désormais un sportif dont la session demeure présente après le scénario d’effacement. La cause n’était pas une défaillance des contraintes.

Après rollback, un contrôle SQL a confirmé zéro ligne de test dans `auth.users` (identifiants synthétiques ciblés), sessions, coachs, réservations et liaisons Telegram. Aucun contenu réel n’a été importé. Le projet contient le schéma, mais aucun parcours applicatif ni fixture métier durable.

## État et limites

- Aucun secret/API key n’a été copié dans le dépôt ou la conversation.
- Aucune variable Netlify, aucun site ou domaine n’a été modifié.
- Le site GetYourMentor relié au portfolio n’est pas connecté à cette base.
- Aucun compte réel, paiement, Telegram, parcours applicatif ou déploiement n’a été testé.
- Le schéma n’a pas encore de migration de retour dédiée ; ce lot ne clôt donc pas GYM-D1.3.
- Les tests sur le projet hébergé valident ces tables et politiques dans ce projet de démonstration, pas l’ensemble de Supabase, l’application ou sa sécurité globale.

## Suite nécessaire

Identifier le site Netlify exact lié depuis le portfolio, confirmer qu’il est bien réservé à la démo, puis configurer ses seules variables de démo au moyen du tableau de bord. Les valeurs sensibles doivent être saisies dans le gestionnaire de secrets du fournisseur, jamais dans Git, un document, un bundle navigateur ou cette conversation. Avant d’activer l’application, préparer une migration de retour, les routes serveur d’effacement/authentification et une revue d’exposition client/serveur. Garder `getyourmentor-preprod` hors de ce chantier.

## Suite - audit de compatibilite et marche arriere

La marche arriere manuelle `supabase/proposals/demo-public-20261112/003_rollback_empty_demo_schema.sql` est ajoutee. Elle verrouille les tables et refuse leur suppression si des lignes existent. Elle n'a pas ete executee. `docs/DEMO_SCHEMA_INTEGRATION_AUDIT_2026-11-12.md` documente les incompatibilites du candidat local et confirme que la cible publique garde `/demo` en 404. Aucune configuration Netlify ou migration distante supplementaire n'a ete faite.