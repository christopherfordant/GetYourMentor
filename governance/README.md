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

Hiérarchie active : [BRANCH_STRATEGY_GYM.md](../BRANCH_STRATEGY_GYM.md), section « Hiérarchie et contexte progressif ». Instructions/autorisations/sécurité → décisions humaines récentes → PDF métier et synthèse arbitrée → contrats approuvés → méthodes V3/V5/REA → recommandations/archives. L’ancien classement « maître avant tout PDF » est remplacé ; une synthèse n’écrase pas sa source sans arbitrage explicite. Le code/tests établissent l’état réel, pas une décision commerciale.

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
- `../docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md` (architecture canonique mémoire/RAG)
- `DECISIONS_LOG_GYM.md`
- `CYCLE_001_ORCHESTRATION_GYM.md`
- `MVP_ROUTE_CONTROL_GYM.md`
- `CYCLE_002_FICHE_COACH_GYM.md`
- `CYCLE_003_CRENEAU_GYM.md`
- `CYCLE_004_RECAPITULATIF_GYM.md`
- `CYCLE_005_PAIEMENT_GYM.md`
- `CYCLE_006_TUNNEL_TRANSVERSE_GYM.md`
- `CYCLE_007_HAUT_FUNNEL_GYM.md`
- `CYCLE_008_COMPTE_BIFURCATIONS_GYM.md`
- `CYCLE_009_INSCRIPTION_CLUB_GYM.md`
- `CYCLE_010_SHELL_NEXT_QA_GYM.md`
- `CYCLE_011_QA_PLAYWRIGHT_GYM.md`
- `CYCLE_012_AUDIT_VISUEL_PLAYWRIGHT_GYM.md`
- `MODE_AUTO_PROJET_GYM.md`
- `auto_mode_state.json`

Ces fichiers servent de RAG local humain pour conserver l'ordre des phases, les decisions, les priorites et le contexte persistant entre les conversations.

## Mode auto projet

Le projet dispose maintenant d'un socle `mode auto` pour les cycles repetitifs de gouvernance.

Pieces principales :

- `governance/ai/MODE_AUTO_PROJET_GYM.md`
- `governance/ai/auto_mode_state.json`
- `scripts/run_auto_project_cycle.ps1`
- `scripts/start_auto_project_loop.ps1`
- `scripts/read_auto_project_state.ps1`
- `scripts/run_auto_build_supervision_lot.ps1`
- `scripts/run_auto_visual_audit_lot.ps1`
- `scripts/run_auto_orchestrator.ps1`
- `scripts/start_auto_orchestrator_loop.ps1`
- `scripts/run_auto_git_checkpoint_lot.ps1`
- `scripts/start_auto_night_run.ps1`
- `scripts/run_auto_mission_planning.ps1`
- `scripts/complete_auto_mission.ps1`
- `scripts/run_codex_mission_agent.ps1`
- `governance/ai/AGENT_MISSION_EXECUTION_PROMPT.md`

Le runner Codex exige une authentification locale valide. Il ne contourne ni les protections systeme ni les controles d acces; en cas d indisponibilite, la mission reste en attente dans le RAG.
- `governance/ai/mission_registry.json`
- `governance/ai/NEXT_MISSION_GYM.md`

But :

- relancer un cycle de controle sans perdre le fil rouge
- garder une memoire durable entre les reprises
- reduire le nombre de validations manuelles inutiles

Avant tout lot de build, audit ou checkpoint, l'orchestrateur execute le lot `mission_planning`. Ce lot relit le document maitre et le fil rouge, verifie le superviseur, choisit la mission du role actif et met a jour le RAG.

## Regle de travail

- une demande large = decoupage immediate en missions
- si une demande contredit le document maitre, elle doit etre recadree
- toute decision importante doit pouvoir etre rattachee a un role, un document source et un impact
- toute evolution importante doit etre repercutee dans les README concernes

## Gate avant push

Avant chaque push, il faut verifier explicitement que les changements ne s'ecartent pas du document maitre et du fil rouge operatoire.

Verification minimale obligatoire :

1. relire `DOCUMENT_MAITRE_GYM.md`
2. relire `governance/FIL_ROUGE_OPERATOIRE_GYM.md`
3. executer `scripts/pre_push_fil_rouge_check.ps1`
4. ne pousser que si le rapport retourne `STATUT : CONFORME`

Si le rapport remonte une alerte, le push doit etre suspendu jusqu'au recadrage documentaire ou technique.

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

## Compétences et preuves — 18 octobre 2026
Catalogue de sélection REA dans [le document existant](../docs/REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md), sans nouveau moteur, routeur ou registre. Il indique problème, preuve, outils complémentaires et validation. Sources méthodologiques : [index PDF](../docs/sources/README.md). Les rôles métier sont des angles de revue, pas 24 métiers exécutés par REA. [Le relais courant](../docs/ETAT_REPRISE_COURANT.md) contient la prochaine action ; les anciennes missions spécialisées ne remplacent pas la demande utilisateur.
