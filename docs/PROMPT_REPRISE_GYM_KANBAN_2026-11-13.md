# Prompt de reprise — GetYourMentor piloté par le Kanban

Copier-coller le texte ci-dessous pour reprendre le chantier :

```text
Reprends GetYourMentor à partir de son état réel, en traitant le Kanban versionné comme référence de travail.

COMMENCE PAR
1. Lire AGENTS.md et tools/agentic-workbench/AGENTS.md.
2. Suivre BRANCH_STRATEGY_GYM.md, puis lire docs/ETAT_REPRISE_COURANT.md et les seules décisions, procédures et preuves nécessaires au ticket retenu.
3. Lire tools/agentic-workbench/backlog.json ainsi que docs/KANBAN_GYM_OPERATING_MODEL_2026-11-13.md. Le JSON du dépôt principal est la source de vérité des tickets, statuts, priorités, sprints, dépendances et cibles. L’interface Kanban et son localStorage peuvent contenir des brouillons : ne les considère pas comme des changements officiels.
4. Vérifier la branche, le SHA distant, les worktrees et l’état Git. Préserver tous les changements locaux, brouillons et historiques existants ; ne pas les écraser, nettoyer ou intégrer sans rapport avec le lot.

CHOIX DU TRAVAIL
À partir du Kanban et de ses dépendances, identifie la prochaine tâche réellement réalisable et la plus prioritaire. Vérifie ses critères d’acceptation et son environnement cible avant d’agir. Distingue les chantiers et environnements : GYM-B1 correspond à une recette Connect historique et ne prouve pas le fonctionnement du site GetYourMentor lié au portfolio ; GYM-D1 concerne la démo publique liée au portfolio. Ne mélange pas leurs bases, preuves ou statuts.

EXÉCUTION
- Traite un lot limité correspondant au ticket choisi, avec les contrôles nécessaires.
- N’invente ni avancement, temps passé, validation, test ou preuve. N’utilise pas le statut d’une carte comme preuve.
- Mets à jour le ticket et ses sous-tickets dans backlog.json seulement après vérification, en indiquant les preuves et blocages réels. Ne clôture pas un parent avant ses dépendances nécessaires.
- Préserve les décisions actives et les données existantes. Aucune migration distante, dépense, notification, paiement réel ou déploiement sans autorisation explicite couvrant l’opération et la cible.
- Actualise docs/ETAT_REPRISE_COURANT.md et la documentation pertinente pour que le prochain lot puisse reprendre sans ambiguïté.
- Exécute les tests ciblés et les contrôles de rendu adaptés aux changements ; indique clairement ce qui n’a pas pu être vérifié.

LIVRAISON
Respecte la procédure Git : changements ciblés seulement, commit et push normal sur la branche appropriée si les contrôles passent, puis vérification du SHA distant. Pas de force-push, fusion implicite, suppression de brouillons ni déploiement non autorisé.

Termine par un compte rendu concis : ticket traité, état Kanban, contrôles et preuves, branche/SHA local et distant, modifications préexistantes laissées intactes, limites et prochaine tâche indiquée par le Kanban.
```
