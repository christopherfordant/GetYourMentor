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

## Update - current preview candidate built and verified, 21 November 2026

The previous candidate from ff62b55 is superseded by an artifact prepared from delivered remote HEAD 7ae4df2c1d1e3e220b4bed68a63dad984606f3ff. Preparation ran in detached worktree C:/Users/cashe/Documents/GYM-demo-d1_8-build-20261121 using python gym-next/scripts/deploy-isolated-demo.py --preview --prepare-only.

- Netlify branch-deploy build completed with Next 15.5.29 and Netlify runtime 5.16.8; routes and functions compiled. Preview environment variable presence was checked by names only; secret values were not read or printed.
- Prepared package validation covered 60 runtime packages and 572 sources in verified-source.json, source commit, build ID and runtime/static hashes. Build ID: ZLJDqhvvIi8I6l6va2AK5. Runtime ZIP SHA-256: b38485b45df470578caa6af49d17af067eb9d86c06457cb3c953de8947b4582c (54,389,651 bytes). Static bundle SHA-256: 58bac4793f623a6265b82bebcd663b47c3c8dbf253ce1587774d20dfebddb9df.
- Client/server boundary scan of the newly built .next/static passed with no server-secret marker detected. The script ended with "Verified isolated-demo package prepared; no publication requested". Its temporary gym-next/netlify.toml was removed.
- Local build only: no deployment, migration, variable change, notification or remote Supabase test occurred. The candidate is ready for preview publication, but D1.8 remains blocked until the published runtime and isolation, persistence and deletion scenarios are verified. The last public state previously observed (supabase=false, catalog 404/prerendered response) remains the latest verified public state.
- The build worktree remains at 7ae4df2c1d1e3e220b4bed68a63dad984606f3ff. Its pre-existing untracked node22-tools/ and gym-next/scripts/__pycache__/ are preserved.


## Mise à jour — 21 novembre 2026 : aperçu opérationnel, blocage Supabase Auth

### Correctifs et déploiement aperçu

- Branche `demo/recruiter-supabase-adapter-20261112`, commit et distant `cd996b0cb7e07a520ded1537cf6dc2e4f90a29bc`. Deux correctifs ciblés règlent la vérification du catalogue Supabase puis l’origine compilée dans le middleware Netlify. Le SHA distant a été contrôlé après chaque push.
- Artefact préparé depuis `cd996b0` dans le worktree détaché `C:/Users/cashe/Documents/GYM-demo-d1_8-build-20261121` : build ID `6yDg8GRzAfi5rOFK8fJMT`, 60 paquets runtime, 54 390 432 octets ; ZIP SHA-256 `969e10de8881feb77583f92e86af846d51af6d80096bbf35942ae83b5db883d9`, bundle statique SHA-256 `90eedfdffd4e96492e061389960877ad54f273cd5db546405b0ed893af62bf06`. Le middleware compilé contient l’origine exacte de l’aperçu et pas l’URL Production.
- Déploiement manuel limité à l’alias non-production : [aperçu GetYourMentor](https://gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app), déploiement Netlify `6b01d93c74a0de13d6df3bf8`. Aucun réglage ou déploiement Production n’a été touché.

### Contrôles runtime

- `GET /api/health` : HTTP 200, `ready=true`, `checks.supabase=true`, `checks.demoStateStorage=true`, `recruiterDemo.status=ready`. Le contrôle interroge réellement le catalogue Supabase de démonstration en lecture seule avec la clé publishable ; la clé serveur n’est pas renvoyée.
- `GET /api/demo/catalog` : HTTP 200, un coach fictif. `GET /demo` : HTTP 200.
- Le premier POST de session a identifié une origine de middleware compilée vers l’URL Production. Le build d’aperçu injecte maintenant l’URL exacte de l’alias dans le seul contexte `branch-deploy` ; le bundle contrôlé n’embarque plus l’URL Production.
- Après ce correctif, `POST /api/demo/session` atteint Supabase Auth, mais le parcours répond 503. Une reproduction directe contrôlée vers le projet Supabase dédié retourne HTTP 422 : « Anonymous sign-ins are disabled ». Aucun compte, session ou réservation n’a été créé par ce diagnostic.

### Blocage, sécurité et décision requise

Le parcours utilise une session anonyme pour permettre à un recruteur d’essayer le site sans adresse e-mail ni mot de passe. Cette fonction est actuellement désactivée dans le projet isolé `getyourmentor-demo-recruiter` (`rqxoovriacgoriimpbwi`). L’activation du réglage Auth exige une confirmation immédiate du propriétaire selon la règle Computer Use §2.1. La demande de confirmation est en attente ; aucun réglage Supabase n’a changé.

Supabase recommande un CAPTCHA pour protéger l’authentification anonyme et documente une limite par défaut de 30 créations par heure et par IP. La démo passe par les fonctions Netlify : le comportement de cette limite doit être surveillé avant une diffusion plus large. Références : [Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous), [Rate limits](https://supabase.com/docs/guides/auth/rate-limits).

GYM-D1.8 reste **blocked** : l’état health et le catalogue sont vérifiés, mais la création de session, la réservation, l’acceptation simulée, le paiement simulé, la reconnexion, l’isolation entre testeurs et l’effacement ne sont pas recettés sur le runtime. Aucun appel à Stripe, Telegram ou paiement réel n’a été effectué. Les autres tickets `progress` GYM-H1 appartiennent à l’ancienne recette Connect ; leurs statuts et environnements n’ont pas été modifiés dans ce lot.


## Mise a jour - 22 novembre 2026 : auth anonyme, actifs et parcours verifies

Cette section remplace le blocage decrit plus haut ; les entrees du 21 novembre restent l'historique de l'incident.

- Sur le projet dedie `getyourmentor-demo-recruiter` (`rqxoovriacgoriimpbwi`), seul le reglage **Allow anonymous sign-ins** a ete active. Apres rechargement de la page Auth, son etat est reste actif. Les autres options n'ont pas ete modifiees.
- Le candidat `1bd2da3059c3c148497dfc5050719f3f82d2fc6f` a ete prepare et publie uniquement sur l'apercu `gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app` (deploy `6b02327cd9b8dd164eea04bb`). Le repertoire statique `.netlify/static` est maintenant publie. Production et l'ancien site n'ont pas ete deployes.
- Apres publication : `/api/health` HTTP 200, `ready=true`, `checks.supabase=true`, `checks.demoStateStorage=true`, demo `ready`; `/api/demo/catalog` HTTP 200 avec une fixture. `/demo` sert six CSS et neuf JS en HTTP 200 ; zero erreur console.
- Parcours navigateur reel : session anonyme, coach fictif Tennis et creneau, reservation acceptee automatiquement par la regle explicite de demonstration, paiement simule, confirmation sans paiement reel, rechargement et recuperation de la reservation.
- Isolation et effacement : une seconde session independante (cookie jar separe) n'a vu aucune reservation pendant que la premiere en detenait une. La deuxieme a ete effacee par DELETE HTTP 200 ; la premiere par le bouton UI et sa confirmation. Apres effacement, `GET /api/demo/session` indique `active=false` ; le coach fictif partage reste dans le catalogue.
- Les controles reseau du parcours n'ont pas revele de requete vers Stripe, Checkout, Payment Intent ou Telegram. Test mobile a 390 CSS px : document 375 CSS px, aucun debordement. Preuve sans secret : `docs/assets/demo-d1-8-runtime-2026-11-22/verification.json`.
- GYM-D1.8 satisfait les criteres de recette sur le runtime d'apercu et est passe a `done` dans le Kanban. GYM-D1.9 reste ouvert : aucune publication Production ni verification publique du lien portfolio n'a ete faite dans ce lot.
- Limites avant diffusion large : l'auth anonyme est exposee sur l'apercu et Supabase recommande CAPTCHA/Cloudflare Turnstile ; aucun CAPTCHA n'a ete configure. Supabase documente 30 creations anonymes par heure et par IP et indique que le nettoyage automatique des comptes anonymes n'est pas fourni par Auth. References : [Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous), [Rate limits](https://supabase.com/docs/guides/auth/rate-limits). Le projet contient un nettoyage applicatif planifie, mais `cronSecret=false` dans la reponse health : son execution n'est donc pas validee. Le comportement du quota derriere les fonctions Netlify et la transmission de l'IP du visiteur restent a controler.
