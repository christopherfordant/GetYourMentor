# D1.8 — contrôle complémentaire des outils et MCP, 21 novembre 2026

## Dépôt et cible

- Dépôt : `GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`.
- HEAD et distant vérifiés : `162e0a26dba8c48d3024fcd8bf1848673ce43761`.
- Modifications locales préexistantes préservées : `docs/DEMO_D15_LOCAL_FLOW_2026-11-14.md` et `gym-next/scripts/__pycache__/`.
- Aperçu vérifié en lecture seule : `gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app`.

## Contrôles exécutés

Scripts locaux exécutés avec Node/npm présents, sans installer de paquet :

- `check:netlify-config` : réussi, configuration statique du site Next/Netlify.
- `check:supabase-schema` : réussi, assertions statiques du schéma local (ne prouve pas l’état distant).
- `check:tracked-secrets` : réussi, aucun secret à haute confiance ni fichier sensible suivi par Git.
- `check:n8n-workflows` : réussi, six exports JSON inactifs et sans secret réel.
- `check:mcp-contract` : réussi, allowlist lecture seule et interdictions attendues présentes.
- `check:client-secret-boundary` : réussi sur le répertoire `.next/static` présent. Ce répertoire appartient à un candidat antérieur ; le résultat ne valide donc pas le bundle du HEAD actuel.

Requête HTTPS actuelle : `/api/health` répond 200 avec `ready=true`, mais `checks.supabase=false` et `recruiterDemo.status=disabled`. `/api/demo/catalog` répond 503. Aucun parcours navigateur, accès croisé ou effacement n’a été testé sur ce runtime lors de cette reprise.

## Architecture, composants et MCP

- La source de vérité reste le Kanban versionné et les décisions humaines ; n8n est une orchestration optionnelle hors du tunnel réservation/paiement. `gym_memory` reste distinct de la base et du schéma de démonstration.
- Le contrat `docs/mcp/MCP_TOOL_CONTRACT_GYM.md` est une spécification locale, pas un serveur MCP déployé. Il prévoit quatre outils documentaires en lecture seule, interdit l’accès arbitraire au disque, aux secrets, aux commandes système et aux écritures métier, et exige tests de permissions, journalisation et validation humaine avant activation.
- Dans la session Codex de ce contrôle, des outils MCP GitHub, Context7, Linear et Playwright sont exposés. Leurs capacités peuvent inclure des opérations d’écriture ; leur disponibilité n’accorde aucune permission supplémentaire et ne prouve ni qu’un serveur MCP métier du projet existe, ni qu’ils ont accès à Supabase ou Netlify. Aucun outil MCP dédié à Supabase, Netlify ou n8n n’est exposé dans cette session. Aucun MCP externe n’a été appelé pour modifier un compte ; aucun nouveau serveur, agent, credential ou accès n’a été créé.
- Le test `check:mcp-contract` vérifie la présence de marqueurs textuels dans le contrat ; il ne teste pas l’isolation réelle d’un serveur MCP en fonctionnement. Cette validation reste un prérequis avant toute activation.
- Aucune dépendance Next n’est installée dans ce worktree (`gym-next/node_modules/next/bin/next` absent). Un processus Playwright `test-server` préexistant est actif depuis un autre répertoire de travail ; son propriétaire et son rôle métier n’ont pas été établis. Conformément à la règle d’un contrôle lourd à la fois, aucun build n’a été démarré et aucun processus n’a été arrêté.

## Conclusion et prochaine action

GYM-D1.8 reste `blocked` ; GYM-D1.9 reste `backlog`. Les contrôles statiques ne démontrent pas le fonctionnement runtime Supabase. Il faut construire un artefact depuis le HEAD courant dans un emplacement isolé, vérifier son bundle et son origine, puis publier uniquement l’alias d’aperçu après autorisation explicite de déploiement. La recette runtime doit ensuite couvrir le catalogue, deux sessions isolées, persistance, effacement et absence d’appels de paiement/notification externes. Ne pas toucher à Production, `gym_memory` ou aux workflows n8n.
