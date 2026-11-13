# Contrat de projet pour l’atelier de développement agentique

Mis à jour le 13 novembre 2026. Ce contrat décrit les métadonnées minimales qu’un futur sélecteur de tâches peut utiliser pour travailler dans un dépôt. Il ne remplace ni `AGENTS.md`, ni le Kanban, ni le relais de reprise ; il ne fait qu’indiquer où ils se trouvent et les limites de lecture.

## Décision et frontière de responsabilité

`tools/agentic-workbench/project-contract.gym.json` est le premier profil de projet conforme à la version 1. `tools/agentic-workbench/project-contract.mjs` le valide localement sans dépendance externe. Le validateur ne lance pas les commandes décrites, ne lit pas les documents référencés au-delà de leur existence, ne modifie pas de ticket et ne récupère aucun secret. Le futur adaptateur de tâches reste un lot distinct (GYM-PLAT.3).

Le contrat ne copie aucun document maître et ne contient qu’une référence relative vers le backlog canonique. `backlog.json` reste l’unique source officielle des tickets, statuts, priorités, dépendances, preuves et cibles. Le navigateur et son `localStorage` restent des brouillons. `docs/ETAT_REPRISE_COURANT.md` reste le relais court ; les rapports demeurent les preuves détaillées.

## Champs du contrat v1

| Champ | Requis | Rôle |
|---|---:|---|
| `contractVersion` | oui | Version du contrat ; toute évolution doit être explicite. |
| `project.id`, `project.name` | oui | Identifiant stable et nom lisible, sans chemin local. |
| `repositoryRoot` | oui | Doit être `.` : la racine vient du worktree courant, jamais d’un chemin personnel enregistré. |
| `taskSource` | oui | Format, chemin relatif et indicateur de source canonique. Pour GYM, `gym-kanban-v1` et `backlog.json`. |
| `instructions` | oui | Fichiers d’instructions à consulter, référencés relativement. |
| `resumeFile` | oui | Chemin relatif vers le relais courant. |
| `permittedReadPaths` | oui | Fichiers ou répertoires autorisés pour la lecture de contexte. Une référence ne peut sortir de ces chemins. |
| `evidencePaths` | oui | Emplacements relatifs où trouver les rapports et preuves. |
| `validationCommands` | oui | Identifiant, exécutable allowlisté, arguments séparés et répertoire relatif. Description seulement : aucune exécution implicite. |
| `security` | oui | Politique sans valeurs secrètes, références de secrets limitées aux noms d’environnement, accès écriture nul par défaut, autorisation explicite pour les opérations distantes. |

La v1 refuse les propriétés inconnues. Une extension future doit augmenter la version, définir la compatibilité, mettre à jour les tests et préserver la lecture des anciens tickets. Ne jamais migrer le backlog dans ce lot. Toute migration ultérieure exige sauvegarde vérifiée, comparaison de non-perte, lecture de l’ancien format pendant la transition et procédure de retour arrière.

## Validation et limites de sécurité

Exécuter depuis la racine du dépôt :

```powershell
node tools/agentic-workbench/project-contract.mjs
node --test tools/agentic-workbench/tests/project-contract.test.mjs
```

Le validateur rejette les champs non prévus, identifiants invalides, chemins absolus, séparateurs Windows, traversées `..`, références manquantes, cibles de mauvais type et références de chemin situées hors des chemins de lecture déclarés. Il résout aussi les liens symboliques et refuse une cible dont le chemin réel sort de la racine du worktree. Il n’affiche ni la configuration entière ni les valeurs rejetées ; ses erreurs nomment seulement le champ concerné.

Les commandes sont descriptives, pas un moteur d’exécution. Les exécutables sont limités à une petite allowlist, les arguments shell et les formes usuelles de secrets sont refusés, et les chemins qu’ils mentionnent sont résolus dans le dépôt puis confrontés aux chemins autorisés. Une revue humaine reste nécessaire avant qu’un outil futur n’exécute une commande. Un contrat ne donne jamais une permission d’écriture, de réseau, de migration, de paiement ou de déploiement.

## Représentation GetYourMentor vérifiée

Le profil courant référence les instructions, le Kanban, le relais, les preuves et la commande de tests existants. La commande de validation réussit sur le worktree. Les chemins sont relatifs, existent et ne contiennent pas de chemin personnel. Aucun document privé n’est copié dans le profil, aucun secret n’y est présent, et aucun champ du backlog n’est dupliqué.

Le validateur a des tests synthétiques pour les chemins manquants, absolus et traversants, les champs secrets inattendus, les commandes non sûres et les références hors allowlist. Les résultats sont archivés dans `docs/assets/agentic-platform-contract-2026-11-13/verification.json`.

Aucun deuxième dépôt indépendant, pertinent et autorisé n’a été validé pour ce lot. Les autres worktrees visibles sont des checkouts du même dépôt GetYourMentor ; ils ne constituent pas une preuve de portabilité. La v1 est donc vérifiée pour GYM seulement. La prochaine preuve multi-projet est un fixture synthétique sous GYM-PLAT.3, puis un second dépôt réel seulement si l’utilisateur le désigne et si son accès est autorisé.

## Compatibilité et prochain pas

Ce fichier est additif : les 96 enregistrements Kanban actuels sont conservés et restent lisibles par `task-context.mjs`. Le lecteur existant n’utilise pas encore le contrat ; aucun comportement actif ne change. GYM-PLAT.3 pourra ajouter un adaptateur seulement après revue de cette frontière et des tests. Une extension doit tester simultanément le profil GYM, des configurations synthétiques invalides, les anciennes cartes et l’absence de lecture ou d’affichage de secrets.
