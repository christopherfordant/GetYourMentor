# Lot Auto Git Checkpoint Local GYM

## But

Créer un checkpoint Git local propre des briques d'automatisation et de gouvernance sans pousser immédiatement sur GitHub.

## Principe

Ce lot :

- relit l'état auto projet
- prépare une sélection de fichiers versionnables
- exclut les fichiers purement volatils
- crée un commit local non interactif si des changements ciblés existent
- journalise le résultat

## Fichiers visés par défaut

- `.gitignore`
- `DOCUMENT_MAITRE_GYM.md`
- `docs/UI_AUTOMATION_FALLBACK_GYM.md`
- `governance/`
- `scripts/`

## Fichiers à exclure du checkpoint

- `governance/ai/supervisor_loop.log`
- `governance/ai/auto_mode_loop.log`
- `governance/ai/auto_orchestrator_loop.log`
- `gym-next/pw_audit_stdout.log`
- `gym-next/pw_audit_stderr.log`

## Statuts possibles

- `CHECKPOINT_CREATED`
- `CHECKPOINT_SKIPPED`
- `CHECKPOINT_ALERT`

## Résultat attendu

En sortie, on doit connaître :

- la branche active
- les fichiers inclus
- le hash du commit si créé
- la prochaine action recommandée
