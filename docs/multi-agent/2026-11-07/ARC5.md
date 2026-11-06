# Mission ARC-05

Un exécutant natif, worktree neuf `GYM-parallel-arc5-20261107`, branche `agent/20261107-arc5`. Base propre à partir de la branche nettoyée et du checkpoint de coordination.

Objectif : séparer les types purs et la liste de coachs de démonstration de `gym-next/lib/domain.ts`, avec façade compatible et aucune modification des comportements métier. Garder tous les exports, signatures, données et identité du tableau partagé. Les fonctions de mutation existantes peuvent rester dans la façade ; ne pas refondre leurs règles ni introduire un autre store. Vérifier les consommateurs réels et les imports de type.

Allowlist : `gym-next/lib/domain.ts`, nouveaux `gym-next/lib/domain/model.ts`, `gym-next/lib/fixtures/coaches.ts`, tests nouveaux dans `tools/domain-contracts/`, preuve `docs/multi-agent/2026-11-07/arc5-result.md`. Tout autre fichier réservé. Ne pas modifier `domain/structure-offer.ts`, auth, paiement, Telegram, package/tsconfig, workflows, UI, instructions ou Kanban. Si cette liste ne suffit pas, signaler au coordinateur avant de l'élargir.

Tests : imports/façade, identité et mutation du même tableau en fixture isolée, préservation des données et filtrage. Réutiliser TypeScript local pour transpilation de quelques modules si nécessaire ; aucun npm install, build global, serveur, test financier ou accès réseau. Le coordinateur fera le contrôle des types complet. Rapport : fichiers, tests exécutés, limites, commit. Ne pas pousser. Aucun sous-agent.
