# Mode Auto Projet GYM

## But

Mettre en place un mode d'execution semi-autonome du projet qui :

- relit les documents directeurs
- relance le superviseur fil rouge
- conserve une trace d'etat durable
- enchaine les controles repetitifs sans derive
- reduit le nombre de validations manuelles au strict minimum utile

## Sources directrices a relire a chaque cycle

- `DOCUMENT_MAITRE_GYM.md`
- `governance/FIL_ROUGE_OPERATOIRE_GYM.md`
- `governance/ai/SUPERVISEUR_FIL_ROUGE_GYM.md`
- `governance/ai/PHASES_EXECUTION_GYM.md`
- `governance/ai/ARCHITECTURE_IA_RAG_GYM.md`

## Principe

Le mode auto ne remplace pas la gouvernance.
Il execute des cycles courts et repetables qui doivent toujours rester rattaches au fil rouge.

Chaque cycle doit :

1. recharger le contexte directeur
2. controler l'etat du projet
3. lancer le superviseur
4. journaliser le resultat
5. s'arreter si une alerte critique apparait

## Ce qui peut etre automatise

- relecture des fichiers directeurs
- verification de conformite
- collecte d'etat Git non destructive
- journalisation locale
- preparation des lots d'actions
- relance des scripts de controle

## Ce qui ne doit pas etre contourne

- consentements proteges
- validations systeme sensibles
- elevations de privilege
- prompts de securite Windows

## Objectif operatoire

- viser environ `1 validation manuelle par heure` maximum quand l'environnement le permet
- garder des cycles longs et calmes
- privilegier les lots d'actions coherents plutot que les micro-validations

## Memoire durable

Le mode auto doit conserver un etat minimal dans :

- `governance/ai/auto_mode_state.json`

Ce fichier doit servir a memoriser :

- la date du dernier cycle
- le dernier statut du superviseur
- la phase active
- la prochaine action recommandee
- les notes de recentrage

## Ordre de cycle recommande

1. `CTO`
2. `PRODUCT`
3. `DESIGN`
4. `DEVOPS`
5. `QA`
6. `SEO`

Le mode auto ne doit pas sauter cet ordre sans raison documentee.

## Sortie attendue

A la fin de chaque cycle :

- un etat durable est ecrit
- un journal court est ajoute
- le dernier statut de conformite est connu
- la prochaine etape du projet est claire

## Lots auto recommandés

Premier lot concret a privilegier :

- `scripts/run_auto_build_supervision_lot.ps1`
- `scripts/run_auto_visual_audit_lot.ps1`
- `scripts/run_auto_git_checkpoint_lot.ps1`

Ces lots permettent de demarrer l'automatisation du projet sans prendre de risque inutile sur le code ou GitHub.

## Orchestrateur de lots

Le passage de `lot isole` a `chaine de lots` se fait via :

- `scripts/run_auto_orchestrator.ps1`
- `scripts/start_auto_orchestrator_loop.ps1`
- `scripts/start_auto_night_run.ps1`

Cet orchestrateur doit :

- lire l'etat durable
- choisir le prochain lot utile
- executer un nombre limite de lots
- s'arreter proprement si une alerte apparait

## Reprise sur la requete suivante

Pour reprendre proprement a la requete d'apres, il faut pouvoir relire immediatement :

- `governance/ai/auto_mode_state.json`
- `governance/ai/auto_mode_journal.md`

Commande rapide :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\read_auto_project_state.ps1
```
