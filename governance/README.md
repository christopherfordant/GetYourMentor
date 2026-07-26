# Gouvernance GetYourMentor

## But

Ce dossier transforme le document maitre en systeme de pilotage operable.

Il sert a :

- proteger le fil rouge du projet
- distribuer les responsabilites par role
- fournir des prompts stables par metier
- cadrer l'architecture IA / RAG du projet
- alimenter un superviseur de conformite documentaire

## Source de verite

Ordre de priorite :

1. `DOCUMENT_MAITRE_GYM.md`
2. `Bussiness Plan.pdf`
3. `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf`
4. `Copie de Devis DEV - GetYourMentor.pdf`
5. les fichiers socle markdown a la racine
6. les README metiers de ce dossier
7. le code

## Fil rouge actuel

GetYourMentor est un produit web responsive, lance d'abord comme MVP francais, avec 4 sports visibles, une logique de reservation simple inspiree de Planity, une friction minimale et une migration progressive vers Next.js sans casser la reference HTML existante.

## Structure du dossier

- `FIL_ROUGE_OPERATOIRE_GYM.md`
- `roles/`
- `prompts/`
- `ai/`
- `fil_rouge_manifest.json`

## Memoire de pilotage

Le dossier `ai/` contient aussi la memoire locale de production :

- `PHASES_EXECUTION_GYM.md`
- `CONTEXT_RAG_GYM.md`
- `DECISIONS_LOG_GYM.md`
- `CYCLE_001_ORCHESTRATION_GYM.md`
- `MVP_ROUTE_CONTROL_GYM.md`
- `CYCLE_002_FICHE_COACH_GYM.md`
- `CYCLE_003_CRENEAU_GYM.md`
- `CYCLE_004_RECAPITULATIF_GYM.md`

Ces fichiers servent de RAG local humain pour conserver l'ordre des phases, les decisions, les priorites et le contexte persistant entre les conversations.

## Regle de travail

- une demande large = decoupage immediate en missions
- si une demande contredit le document maitre, elle doit etre recadree
- toute decision importante doit pouvoir etre rattachee a un role, un document source et un impact
- toute evolution importante doit etre repercutee dans les README concernes

## Limite honnete du superviseur

Le superviseur peut :

- verifier la presence et la coherence minimale des fichiers
- relever des ecarts documentaires
- sortir un rapport de conformite
- aider a recadrer

Le superviseur ne peut pas :

- bloquer techniquement toutes les requetes de conversation
- remplacer le jugement humain sur les arbitrages complexes

## Premiere mission prioritaire

Stabiliser la gouvernance entre produit, design, technique et IA avant de poursuivre les evolutions UI ou code majeures.
