# Couverture et limites de l'audit

## Inventorié, sans lecture de contenu

Toute l'arborescence traversable de GetYourMentor, y compris chemins masqués, .git, caches, outils, dépendances et dossiers privés, par noms de répertoires, comptes et tailles de fichiers. Résultats et erreurs dans INVENTAIRE.json. L'énumération est limitée aux chemins sous la racine, sans suivi intentionnel de liens symboliques ; la résolution physique des éventuelles jonctions Windows n'est pas certifiée. Aucun autre worktree n'est parcouru volontairement. Pas d'affirmation de complétude pour les chemins refusés par le système ; leurs chemins précis n'ont pas été conservés dans le relevé expurgé. Les tailles incluent les copies physiques/logiques présentes et ne mesurent pas l'espace disque dédupliqué.

Le CSV publie les répertoires projet, pas les descendants de delivery-private, contacts, banque, financement, mempalace ou dépendances/caches identifiés. Pas de copie de clés, noms de fichiers privés ou contenu personnel dans les rapports. Les catégories reposent sur les noms connus : elles ne constituent pas une classification automatique de toutes les données sensibles.

## Analysé automatiquement

385 fichiers TS/TSX/MJS/CJS dans app/lib/components/scripts/tests de gym-next : parsing AST des imports/exports statiques internes, comptage des lignes, empreintes pour doublons exacts. Liste complète des chemins dans DEPENDANCES.json. Le graphe ne couvre ni les imports dynamiques, ni require, ni les autres langages ni les alias de déploiement ; les fichiers de dépendances et builds sont exclus de l'analyse de contenu.

## Examiné sémantiquement, intégralement ou par passages ciblés

- Consignes : AGENTS.md, procédure BRANCH_STRATEGY_GYM, en-têtes document maître/index/refonte, relais courant, AGENTS de l'atelier ; consignes de réconciliation héritées du lot précédent, non relues intégralement ici.
- Architecture : AGENTIC_REFACTOR, ARCHITECTURE_MEMOIRE_GYM, comparaison A4.3, fiabilisation RAG, annotations proposées, rapport S2 (début actif et historique identifié), contrat MCP.
- Exécution documentaire : workflow.mjs, retrieval.mjs, server.mjs, comparison-bridge.mjs ; package.json, routes knowledge search/context, assembleur de contexte, SQL memory et proposition pgvector ; passages de qualification E5 et métadonnées archivées du modèle.
- Métier : imports et passages de auth.ts, reservations.ts, payments.ts, repositories/reservation-repository.ts, coaches.ts, structure-offers.ts, telegram.ts, domain.ts, projection public-coach.ts. Les services n'ont pas été intégralement réaudités pour leur sécurité ou leur correction financière.
- UI : points d'entrée accueil, compte, paiement, imports d'EditorialHome et composants actifs ; tailles des gros composants. Aucun audit ergonomique complet ni rendu navigateur.
- Développement : scripts orchestrateur, lanceur Codex et planification, wrappers mempalace, configuration mempalace (noms de rooms, pas base privée), README n8n, workflows CI et Netlify, .gitignore.
- Pilotage : tickets A4/A5/H1 et dépendances dans le backlog ; métadonnées worktrees Git. Aucun worktree externe audité en profondeur ou modifié.

La liste distingue lecture ciblée et analyse AST : elle ne prétend pas que tous les documents ou toutes les lignes ont été compris et validés. Les autres dossiers métier/commerciaux ont une couverture d'inventaire, pas une expertise de leur contenu.

## Exécuté dans ce lot

Inventaire Python et analyse AST TypeScript avec outils déjà présents. 35 tests atelier/Kanban ; évaluation lexicale 12 cas et contrôles 3 cas, tous réussis. Git état/branche/worktrees/SHA distant en lecture avant livraison. Aucun nouveau test de paiement, réconciliation PG, n8n, mempalace ou exécution d'agent. Aucun serveur relancé et aucun secret chargé.

Les commandes de collecte sont conservées localement dans delivery-private ; elles ne sont pas des composants du produit. Les faits financiers/PostgreSQL récents sont repris des rapports déjà livrés, avec leur périmètre. Pas de nouveau build car lot exclusivement documentaire ; contrôles de cohérence des livrables et Git avant commit.

## Non vérifié

Version réellement déployée sur Netlify, flags d'environnement, état actuel Supabase, activation n8n, contenu des bases mempalace, sessions/processus d'agents, modèle choisi par Codex, état des secrets, permissions OS des coffres, sécurité globale ou conformité réglementaire. Leur absence de vérification ne vaut pas absence de fonctionnalité, ni preuve de faille.

## Changements autorisés et réalisés

Nouveau dossier documentaire docs/audits/architecture-2026-11-05 et court relais dans ETAT_REPRISE_COURANT.md. Aucun fichier applicatif, workflow CI, AGENTS, schéma SQL ou Kanban modifié. Propositions de tickets uniquement dans le rapport. Modifications antérieures protégées par empreintes avant/après, sans les inclure au commit de l'audit.
