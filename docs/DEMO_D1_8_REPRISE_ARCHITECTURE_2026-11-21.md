# Reprise D1.8 et vérification de l’architecture n8n — 21 novembre 2026

## État du dépôt

- Checkout : C:/Users/cashe/Documents/GYM-demo-isolated-20261112.
- Branche : demo/recruiter-supabase-adapter-20261112.
- HEAD et upstream avant ce lot : 7b46c949fa48f346d80ddfa2ca2e98352f6a5ce0.
- Brouillon préexistant docs/DEMO_D15_LOCAL_FLOW_2026-11-14.md et cache gym-next/scripts/__pycache__/ préservés.

## Contrôle du contexte n8n

La référence lue est docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md et son résumé opérationnel n8n/README.md :

- les décisions humaines/documents métier restent la source de vérité ;
- n8n est un orchestrateur hors du chemin critique des réservations et paiements ;
- gym_memory est séparé du schéma applicatif et de la base gym_demo ;
- les exports de workflows restent inactifs tant que leurs credentials/configurations ne sont pas établis ; ils ne constituent pas un deuxième Kanban, une nouvelle source de vérité ou un RAG actif.

Contrôle exécuté depuis gym-next : npm run check:n8n-workflows — réussi, « 6 exports, inactifs et sans secret réel ». Aucun workflow n’a été activé, aucun credential créé, aucune migration de gym_memory appliquée et aucune donnée commerciale ingérée. Ce contrôle valide le format et les gardes du dépôt, pas l’authentification des webhooks ni la sécurité d’une activation future.

## Configuration et runtime Netlify

Dans le projet Netlify getyourmentor-demo-20261014, la session authentifiée correspond au compte propriétaire attendu. Les sept variables ont une valeur spécifique sur la branche gym-demo-preview-20261117. Les secrets GYM_DEMO_SUPABASE_SECRET_KEY, GYM_DEMO_SESSION_SECRET et GYM_DEMO_PURGE_SECRET sont limités à Builds/Functions/Runtime. Les valeurs secrètes n’ont pas été relues ; aucune configuration Production n’a été modifiée pendant cette reprise.

Contrôle HTTPS de l’alias https://gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app :

- GET /api/health : HTTP 200, mais checks.supabase=false et recruiterDemo.status=disabled ;
- GET /api/demo/catalog : HTTP 503.

La configuration est présente dans Netlify, mais le runtime actuellement servi ne l’a pas prise en compte. Aucun parcours distant n’a été joué.

## Candidat de déploiement

L’artefact local gym-next/.netlify/verified-source.json annonce le commit d3da6a8a883138a5afe69d0c3e7b5d0c4000de2d. Le HEAD actuel est 7b46c949fa48f346d80ddfa2ca2e98352f6a5ce0. Le diff entre ces références contient notamment des changements de sitemap, de session de démonstration et de tests SEO/session ; l’artefact d3 n’est donc pas un candidat vérifié pour le code actuel. Les répertoires .next/.netlify préexistants n’ont pas été écrasés.

Aucun build Netlify, déploiement, migration Supabase ou changement de compte n’a été effectué. La cible et le contexte précis du prochain build sont connus ; le préflight doit repartir du code actuel, pas réutiliser l’artefact d3.

## État Kanban et suite

GYM-D1.8 reste blocked : le runtime n’est pas activé et les tests d’isolation, de persistance et d’effacement n’ont pas été exécutés sur l’alias. GYM-D1.9 reste backlog. La suite est un candidat reconstruit et vérifié à partir du HEAD courant, puis un déploiement limité à la branche gym-demo-preview-20261117 et la recette runtime D1.8. Production, Telegram, paiement réel, schéma gym_memory et n8n restent hors de ce lot.

Le nouvel artefact de branche n?a pas ?t? construit ni d?ploy? pendant ce lot ; aucune publication Netlify n?a eu lieu. Le prochain d?ploiement doit viser uniquement l?alias non-production et conserver Production inchang?e.
