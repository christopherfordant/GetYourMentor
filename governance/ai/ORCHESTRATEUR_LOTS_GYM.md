# Orchestrateur de Lots GYM

## But

Enchaîner automatiquement les lots du projet sans dérive et sans croire à tort qu'un timeout outil équivaut à un échec métier.

## Principe

L'orchestrateur :

1. lit `auto_mode_state.json`
2. choisit le prochain lot utile
3. exécute ce lot
4. relit l'état
5. décide s'il peut passer au lot suivant
6. s'arrête dès qu'un statut n'est plus conforme

## Lots actuellement branchés

1. `build_supervision`
2. `visual_audit`
3. `git_checkpoint_local`
4. `mission_planning` (porte documentaire executee avant les lots techniques)
5. `codex_mission_agent` (execute la mission READY et exige sa preuve)

## Règle d'enchaînement

- si le build n'est pas `OK`, lancer `build_supervision`
- si le build est `OK` mais que l'audit visuel n'est pas `OK`, lancer `visual_audit`
- si le build et l'audit visuel sont `OK` mais qu'aucun checkpoint local n'existe, préparer `git_checkpoint_local`
- si les lots critiques déjà validés sont `OK`, s'arrêter avec un statut de chaîne stable

Le lot `mission_planning` lit `DOCUMENT_MAITRE_GYM.md`, `governance/FIL_ROUGE_OPERATOIRE_GYM.md` et `governance/ai/mission_registry.json`. Il produit `governance/ai/NEXT_MISSION_GYM.md` et met a jour `auto_mode_state.json`. Une alerte du superviseur bloque la chaine.

Apres execution reelle de la mission, `scripts/complete_auto_mission.ps1` exige une preuve de travail et une nouvelle conformite du superviseur avant de faire avancer la phase.

## Session longue

Une session longue finie peut être lancée avec :

- `scripts/start_auto_night_run.ps1`

But :

- laisser l'orchestrateur se rejouer pendant plusieurs heures
- réduire les relances manuelles
- conserver un journal exploitable au réveil

## Statuts de chaîne

- `CHAIN_OK`
- `CHAIN_PARTIAL`
- `CHAIN_ALERT`

## Garde-fous

- ne jamais lancer plus de lots que la limite prévue pour un passage
- journaliser chaque décision
- arrêter la chaîne si le superviseur n'est plus `CONFORME`
- préférer plusieurs petits passages fiables à une seule longue séquence opaque
