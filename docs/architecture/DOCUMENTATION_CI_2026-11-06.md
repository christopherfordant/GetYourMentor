# Orientation documentaire et contrôles CI — 6 novembre 2026

Cet index aide à retrouver la bonne entrée. **Il ne remplace pas les documents maîtres et n'accorde aucune autorisation.** Les dernières consignes utilisateur, les protections et la hiérarchie de `BRANCH_STRATEGY_GYM.md` restent prioritaires. Les décisions et résultats récents se retrouvent dans `docs/ETAT_REPRISE_COURANT.md`.

## Entrées à utiliser

| Besoin | Entrée | Nature et limite |
|---|---|---|
| Consignes de travail | [AGENTS.md](../../AGENTS.md) | Instructions racine, économie de ressources, pas de sous-agents supplémentaires |
| Git et hiérarchie des sources | [BRANCH_STRATEGY_GYM.md](../../BRANCH_STRATEGY_GYM.md) | Procédure et autorisations de commit/push ciblé ; pas de déploiement implicite |
| Point d'interruption et prochaine étape | [ETAT_REPRISE_COURANT.md](../ETAT_REPRISE_COURANT.md) | Relais opérationnel ; les sections suivantes restent historiques |
| Contrat produit | [DOCUMENT_MAITRE_GYM.md](../../DOCUMENT_MAITRE_GYM.md) | Synthèse produit, à confronter aux décisions humaines récentes et aux sources concernées |
| Index général | [docs/README.md](../README.md) | Catalogue documentaire, pas une preuve de fonctionnement |
| Architecture applicative | [ARCHITECTURE_TARGET_GYM.md](ARCHITECTURE_TARGET_GYM.md) | Cible progressive ; le code et les contrôles déterminent ce qui existe réellement |
| Mémoire et RAG | [ARCHITECTURE_MEMORY_RAG_GYM.md](ARCHITECTURE_MEMORY_RAG_GYM.md) | Référence canonique ; ne pas confondre les phases futures avec une intégration livrée |
| Conditions d'activation du RAG | [RAG_READINESS_GYM.md](RAG_READINESS_GYM.md) | Critères, pas permission d'ingestion, bascule ou ajout d'agent |
| Atelier documentaire | [AGENTS de l'atelier](../../tools/agentic-workbench/AGENTS.md) | Assistant extractif local ; rôles du Kanban simulés, pas agents autonomes |
| Design et parcours | [Couverture de refonte](../REFONTE_PROGRESSIVE_2026-10-15.md), [design system](../../DESIGN_SYSTEM_GYM.md), [écrans MVP](../../MVP_ECRANS_GYM.md) | Consulter seulement les contrats utiles au lot ; respecter les décisions plus récentes |
| Scripts et anciennes boucles | [Guide scripts](../../scripts/README.md), [preuve ARC2](../ORCHESTRATION_ENTREES_ET_GARDES_2026-11-06.md) | Historiques encadrés, aucune ancienne boucle relancée par un document |
| Démonstrations hors publication | [Guide prototypes](../../prototypes/README.md), [validation ARC3](../VALIDATION_CANDIDAT_ARC3_3_2026-11-06.md) | Aperçu local distinct du candidat et du site réellement déployé |

## Documents historiques et copies

Les deux fichiers actuellement ouverts dans VS Code ont déjà une mention explicite :

- [governance/ai/ARCHITECTURE_IA_RAG_GYM.md](../../governance/ai/ARCHITECTURE_IA_RAG_GYM.md) est **historique**. Sa référence actuelle est `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`.
- [AGENT_MISSION_EXECUTION_PROMPT.md](../../governance/ai/AGENT_MISSION_EXECUTION_PROMPT.md) est le **contrat historique d'un runner**, pas la procédure de cette session. Ses anciennes restrictions générales ne révoquent pas les autorisations récentes. Aucun agent n'est lancé pour « satisfaire » ce fichier.
- [ARCHITECTURE_MEMOIRE_GYM.md](../../ARCHITECTURE_MEMOIRE_GYM.md) est également un renvoi historique vers la référence canonique.

`project_readable` contient des exports de lecture, pas un second maître. Les rapports datés décrivent des constats dans un périmètre donné : leur nom ou leur présence ne prouve pas un état courant, un déploiement ou une décision validée. Les preuves historiques sont conservées et ne sont pas réécrites pour faire disparaître un ancien blocage.

L'inventaire classe les Markdown suivis et calcule leurs empreintes ; il sépare les entrées explicitement relues, les rapports datés, les historiques d'orchestration, les copies et les fichiers **à qualifier selon le lot**. Ce dernier statut est volontaire : pas d'autorité inventée à partir d'un nom de fichier. Aucun document commercial ignoré ni fichier privé non suivi n'est ajouté au corpus RAG ou au dépôt. Aucun déplacement documentaire effectué.

## Matrice des automatismes déclarés localement

Branche examinée : **`design/refonte-progressive-lot1`**. Sources : [agentic-local.yml](../../.github/workflows/agentic-local.yml), [mvp-gates.yml](../../.github/workflows/mvp-gates.yml), [netlify.toml](../../netlify.toml).

| Configuration | Déclencheurs déclarés | Contrôles déclarés | Conséquence pour la branche actuelle |
|---|---|---|---|
| `agentic-local.yml` | `workflow_dispatch` seulement | Tests de l'atelier, évaluation lexicale/corpus et garde des secrets suivis | Aucun lancement automatique sur un push vers cette branche |
| `mvp-gates.yml` — `validate` | Manuel ; push vers `main` ou `feat/nextjs-migration` ; PR ciblant `main`, `feat/nextjs-migration` ou `feat/visual-contract-next-step` | Installation, types, audit dépendances, configuration préprod/production, secrets, contrat Netlify, n8n, schéma, build, frontière client, refus production et Playwright | Un simple push vers la branche actuelle ne correspond pas aux branches déclarées ; une PR vers une base couverte est un autre événement |
| `mvp-gates.yml` — `production-readiness` | Condition supplémentaire `github.event_name == 'workflow_dispatch'` | Contrôle de configuration de production utilisant les références de secrets GitHub | Ne pas lancer dans ce lot ; déclarer une étape ne signifie ni secrets présents ni production prête |
| `netlify.toml` | Aucun événement GitHub Actions défini par ce fichier | Base `gym-next`, commande `npm run build`, publication `.next`, plugin Next.js | Contrat local de build ; connexion Git et réglages de déploiement Netlify non inspectés |
| Procédure locale avant push | À chaque livraison selon la procédure Git | Contrôle fil rouge et hook local de protection de l'historique privé | Obligatoire indépendamment d'un éventuel lancement de CI distante |

Cette matrice porte sur **les déclarations des fichiers**, pas sur les paramètres ou historiques d'exécution de GitHub. Les checks requis, leur activation distante et la possibilité de déclencher manuellement un workflow sur la branche par défaut n'ont pas été consultés. Aucun workflow n'a été modifié ou déclenché. Aucun nouveau build facturable automatique n'est ajouté.

L'absence d'un déclencheur automatique sur cette branche n'est pas une validation : les tests locaux documentés restent nécessaires. Une future extension de la couverture CI devra être un lot distinct, avec périmètre, coût et critères explicites.

## Dossiers associés dans Documents

Voir le [compte rendu ARC4 et l'inventaire des voisins](../DOCUMENTATION_ET_DOSSIERS_ARC4_2026-11-06.md). Un worktree partage le dépôt Git mais possède un dossier de travail propre ; ce n'est pas un doublon à effacer automatiquement. `GetYourMentor-site` est un checkout Git indépendant. Les dossiers sans `.git` à leur racine ne sont pas pour autant déclarés inutiles ou sauvegardes fiables.

Les anciens worktrees doivent être revérifiés avant une réutilisation, particulièrement après la purge de l'historique privé. Cet inventaire n'autorise aucune fusion, réécriture ou suppression.
