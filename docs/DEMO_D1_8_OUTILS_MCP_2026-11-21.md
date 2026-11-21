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
- Au contrôle initial dans le checkout principal, aucune dépendance Next n’était installée (`gym-next/node_modules/next/bin/next` absent). Un processus Playwright `test-server` préexistant était actif depuis un autre répertoire de travail ; son propriétaire et son rôle métier n’ont pas été établis. Aucun build n’a été lancé dans ce checkout et aucun processus n’a été arrêté. Le complément ci-dessous documente la préparation ultérieure dans un worktree détaché.

## Conclusion et prochaine action

GYM-D1.8 reste `blocked` ; GYM-D1.9 reste `backlog`. Complément de reprise ci-dessous : le candidat a depuis été construit et contrôlé dans un worktree détaché. Le runtime Supabase distant n’est toutefois pas actif. Avant publication, vérifier/corriger le chemin du script : il exécute un `netlify build`, puis `netlify deploy --build`, donc demande explicitement un second build. Ne pas risquer cette double exécution compte tenu de la limite d’usage Netlify ; aucun correctif du script n’a été fait sans tests dédiés. Après validation d’un chemin à build unique, déployer uniquement l’alias d’aperçu après autorisation explicite, puis recetter le catalogue, deux sessions isolées, la persistance, l’effacement et l’absence d’appels financiers/notifications externes. Ne pas toucher à Production, `gym_memory` ou aux workflows n8n.

## Complément — candidat construit et vérifié

La tentative initiale a échoué avant le build parce que le Netlify CLI en cache ne contenait pas `ci-info`. Aucun artefact du checkout principal n’a été modifié. Une installation temporaire sans sauvegarde de manifeste (`npm install --no-save --no-package-lock netlify-cli@27.17.0`) a ensuite été faite dans le seul worktree de build.

- Worktree détaché : `C:/Users/cashe/Documents/GYM-demo-d1_8-build-20261121`, source `9481824f37f7b0ad4666477f577d0e5800e577d6`.
- Installation depuis `package-lock.json` : `npm ci --no-audit --no-fund` réussi ; 78 paquets ajoutés. CLI local isolé : 27.17.0.
- Préparation : `python gym-next/scripts/deploy-isolated-demo.py --preview --prepare-only` réussi. Le contexte de build Netlify était `branch-deploy`, le runtime Next Netlify 5.16.8, Next 15.5.29. L’application, ses pages et fonctions ont compilé ; le contrôle de frontière client/serveur a réussi sur le nouveau bundle. Le script a validé les 569 sources, le commit et le ZIP runtime, puis s’est arrêté avant la publication. Le build local a utilisé Node 24.14.0 ; la configuration Netlify temporaire indique Node 22, donc le build n’atteste pas une exécution sur le builder distant Node 22.
- Source : `9481824f37f7b0ad4666477f577d0e5800e577d6`. Build ID : `jLA3wyT7M4YhtSje4B3zT`. SHA-256 ZIP runtime : `38662fb20823f2df4c2df2e901f12a0c2f30b43e1be3f285842bc4fc141c4fec` (54 388 986 octets, sous la limite du script de 250 MiB).
- Le build a émis des avertissements Autoprefixer sur `start`/`end` dans les CSS ; il s’est terminé avec succès. Ils ne bloquent pas le parcours de démonstration et n’ont pas été modifiés dans ce lot.
- Revue locale de `deploy-isolated-demo.py` : le chemin de publication contient un appel `netlify build` puis un appel `netlify deploy --build`. Le CLI 27.17.0 indique que `deploy` construit localement par défaut (sauf `--no-build`), ce qui confirme le risque d’un second build. Le chemin de publication n’a pas été exécuté ; il faut valider un flux à build unique avant toute publication pour éviter une consommation inutile.
- Divergence documentaire à garder en vue : certains comptes rendus historiques décrivent une publication « sans nouveau build », alors que le script actuel contient ces deux étapes explicites. Les comptes rendus restent historiques ; la procédure active devra être réconciliée après validation d’un flux à build unique.
- Les contrôles types, configuration Netlify, schéma statique Supabase, secrets suivis, n8n et contrat MCP ont réussi sur la même source. Le test MCP vérifie les marqueurs du contrat, pas un serveur MCP actif.
- Aucun déploiement, modification de variables, migration ou parcours distant n’a été effectué. Le candidat préparé reste dans le worktree détaché pour éviter de l’écraser. D1.8 reste bloqué jusqu’à validation du chemin de publication, déploiement de l’aperçu autorisé et recette réelle ; le health du site reste `supabase=false` et le catalogue `503` au dernier contrôle.


## Mise a jour : flux a build unique verifie, 21 novembre 2026

Cette mise a jour remplace, pour le prochain candidat, la recommandation precedente de corriger puis valider le chemin a build unique. Les entrees anterieures restent l'historique de la premiere preparation.

- `gym-next/scripts/deploy-isolated-demo.py` effectue un seul `netlify build`, materialise et verifie le runtime, puis prepare la publication avec `netlify deploy --no-build`. `--prepared` est limite a l'apercu et verifie le commit, les empreintes des sources, le build ID, les SHA-256 du ZIP runtime et du bundle statique, ainsi que la presence du runtime Next.
- Ajouts : `gym-next/scripts/demo_deploy_helpers.py` et `gym-next/tests/python/test_demo_deploy_helpers.py`. Les 10 tests unitaires passent, y compris le mode preview uniquement, `--no-build`, la fraicheur et la detection d'artefacts modifies. La syntaxe Python (AST), `git diff --check` cible, la configuration Netlify, le schema Supabase statique, le scan de secrets suivis, les workflows n8n et le contrat MCP passent.
- Commit `ff62b55b68bd77a8bd2413be2c3aaf88ca9481c4` pousse sur `demo/recruiter-supabase-adapter-20261112`; le SHA distant est identique. Les changements preexistants `docs/DEMO_D15_LOCAL_FLOW_2026-11-14.md` et `gym-next/scripts/__pycache__/` n'ont pas ete inclus.
- Worktree de build isole : `C:/Users/cashe/Documents/GYM-demo-d1_8-build-20261121`, detache sur ce commit ; Node `v22.23.5`, Netlify CLI `27.17.0`. `python gym-next/scripts/deploy-isolated-demo.py --preview --prepare-only` reussit : Next `15.5.29`, runtime Netlify `5.16.8`, compilation des routes/fonctions et controle de frontiere client/serveur reussis. ZIP runtime : 60 dependances materialisees, 54 389 011 octets.
- Candidat conserve dans ce worktree : source `ff62b55b68bd77a8bd2413be2c3aaf88ca9481c4`, build ID `SIEiZ1CLDKaxOiUXNV4qQ`, SHA-256 ZIP `a816e4f013850bdd6af8f850fc6c1fe02bc7a8817959f2c853d970b5b80f95d4`, SHA-256 du bundle statique `2a63ed7908a7569df6b858e2c585151910798dbceb1899d2f486587088404627`, 571 sources verifiees. Une seconde execution `--preview --prepared --prepare-only` valide a nouveau l'artefact sans rebuilder ni publier.
- **Aucun deploiement n'a ete lance.** GYM-D1.8 reste `blocked` : le controle public en lecture seule du 21 novembre retourne `ready=true`, `supabase=false`, `recruiterDemo.status=disabled` et HTTP 503 pour le catalogue ; les tests sur le runtime distant restent a faire. La prochaine action necessite une autorisation explicite pour publier uniquement l'apercu `gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app`, puis executer les controles D1.8. Aucun reglage Netlify/Supabase n'a change.
