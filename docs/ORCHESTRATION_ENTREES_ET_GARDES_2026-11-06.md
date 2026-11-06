# ARC2 — entrées d'orchestration et gardes, 6 novembre 2026

## Résultat

Lot local correspondant à la recommandation ARC-02 de l'audit. Les **38 scripts à la racine de `scripts/`** sont classés ; 12 anciennes entrées sont protégées avant accès au contexte, aux logs, à Git, à Codex ou au lancement de processus. Les commandes applicatives manuelles et le contrôle pré-push restent disponibles. Aucun agent, boucle historique, helper UI ou recette distante n'a été activé.

Le catalogue [orchestration-scripts-2026-11-06.json](architecture/orchestration-scripts-2026-11-06.json) est descriptif : la présence d'un fichier ou d'une capacité dans son corps ne prouve pas son exécution. Aucun processus courant, tâche planifiée, service Windows ou état d'un autre worktree n'a été inspecté ou arrêté. Les rôles Kanban restent des affectations simulées.

## Diagnostic

`run_auto_orchestrator.ps1` pouvait choisir une mission et appeler `run_codex_mission_agent.ps1`, qui invoque `codex exec`. Les boucles `start_auto_*` répétaient les lots, contrairement au lot supervisé borné actuel. `start_fil_rouge_supervisor.ps1` répétait aussi une écriture périodique.

Les anciens `DryRun` n'étaient pas uniformément sans effets : l'orchestrateur persistait encore état/journal après sa décision simulée ; le planificateur appelait le superviseur et écrivait un journal ; le lanceur Codex cherchait un exécutable, chargeait le prompt et créait des dossiers avant son arrêt simulé. Un statut READY et des noms de rôles ne constituent pas une autorisation actuelle.

## Répartition et conditions d'usage

| Classe | Nombre | Usage actuel |
|---|---:|---|
| Contrôles de lecture | 4 | Inventaire, garde, contrat visuel, ancien lecteur d'état ; l'état historique est informatif, pas prescriptif |
| Contrôles manuels avec écritures | 2 | Superviseur ponctuel et pré-push ; rapport/état modifiés par conception, pas « lecture seule » |
| Orchestration historique désactivée | 12 | Descriptif `-DryRun` seulement ; lancement refusé |
| Helpers interactifs historiques exclus | 14 | Pas d'activation dans la procédure courante, aucune automatisation du consentement |
| Outils mémoire manuels | 2 | Commande et données à cadrer explicitement ; runtime non vérifié ici |
| Recette navigateur distante | 1 | Autorisation de recette distincte indispensable ; non exécutée |
| Outils spécialisés manuels | 3 | Capture, extraction documentaire, investigation Blobs ; vérifier leurs prérequis et chemins avant usage |

Les capacités du catalogue sont issues d'une lecture statique par motifs et des sources pertinentes ; elles ne sont pas une analyse exhaustive de tous les effets transitifs. Le catalogue couvre les scripts racine, pas les utilitaires de `gym-next/scripts`, les tests sous `tools/`, ni d'autres clones. L'inspecteur refuse un catalogue incomplet ou contenant des doublons plutôt que déclarer un fichier inconnu sûr.

### Entrées désormais protégées

`run_auto_build_supervision_lot.ps1`, `run_auto_git_checkpoint_lot.ps1`, `run_auto_mission_planning.ps1`, `run_auto_orchestrator.ps1`, `run_auto_project_cycle.ps1`, `run_auto_visual_audit_lot.ps1`, `run_codex_mission_agent.ps1`, `start_auto_night_run.ps1`, `start_auto_orchestrator_loop.ps1`, `start_auto_project_loop.ps1`, `start_fil_rouge_supervisor.ps1`, `complete_auto_mission.ps1`.

Leur corps historique est conservé. Une garde commune intervient juste après les paramètres, avec erreurs bloquantes, puis l'aperçu retourne avant le corps. Les scripts qui n'avaient pas d'option d'aperçu reçoivent `-DryRun`. Les paramètres obligatoires de clôture restent obligatoires ; un aperçu de clôture nécessite des identifiants d'exemple, sans vérifier ou valider leur réalité.

L'exécution normale est refusée, même si un manifeste est modifié pour indiquer « enabled ». Il n'existe pas de `-AllowAgent`, de jeton client ou de variable d'environnement permettant d'activer la garde. Une évolution future exige une autorisation explicite, un périmètre borné, une modification de code revue et des tests. Aucun rétablissement automatique d'un ancien comportement.

## Nouvelle entrée de lecture

```powershell
powershell -NoProfile -NonInteractive -File scripts/show_orchestration_status.ps1
powershell -NoProfile -NonInteractive -File scripts/run_auto_orchestrator.ps1 -DryRun
```

L'inventaire lit seulement le catalogue et les noms des fichiers racine. L'aperçu historique lit le catalogue et retourne un JSON `preview-only`, `executable=false`, sans lire l'état de mission ni le coffre, sans journal et sans exécutable chargé. Ce n'est pas une simulation métier complète ou une preuve de fonctionnement d'un ancien pipeline. La présence de Codex n'est pas testée par cet aperçu.

Les outils interactifs non modifiés ne sont pas rendus sûrs par ce classement. Ils restent hors procédure et ne doivent pas accepter des confirmations ou poursuivre une session automatiquement. Les gardes ne sont pas un sandbox OS : un opérateur disposant des droits d'édition peut changer le code. Elles ne contrôlent pas rétroactivement un processus déjà lancé ou un autre checkout historique.

## Tests et preuves

Commande sur Windows, avec Node et Windows PowerShell déjà installés :

```powershell
node --test tools/orchestration-controls/policy.test.cjs
```

**31 tests PASS**, sans saut : pour chacune des 12 entrées, refus normal et aperçu sans écriture ; état READY trompeur ; inventaire complet ; politiques absente/invalide/dupliquée/reclassée ; nouveau script non classé. Essais exécutés dans des répertoires synthétiques isolés, PATH réduit sans Codex, sans profil PowerShell ni accès de service. Les arborescences et empreintes sont comparées avant/après. Les répertoires temporaires ne sont supprimés qu'après vérification de leur chemin absolu sous le répertoire de tests attendu.

L'inventaire a aussi été exécuté en lecture sur le dossier réel. Aucun test ne lance le corps historique avec effet. Les scénarios non autorisés sont testés comme refus, pas comme succès d'agent. Pas de test d'une instance Codex, de Power Automate, d'AutoHotkey, de n8n ou d'un ordonnanceur réel.

Preuves expurgées : [checks.json](assets/orchestration-2026-11-06/checks.json). Code du test versionné ; aucune installation ou appel modèle. Pas de build Next relancé, car aucun fichier applicatif ni configuration de compilation n'est modifié.

## Gouvernance et retour arrière

Nouveau ticket **GYM-ARC2**, quatre sous-tickets pour inventaire, gardes, contrôles et livraison. Aucun ticket équivalent déjà existant ; la recommandation PROPOSITION-ARC-02 n'était pas une carte exécutée. Estimations proposées, temps réel non mesuré. A5/H1 et leurs dépendances conservent leur état.

Parent et quatre enfants terminés dans ce périmètre. Les 35 tests de l'atelier/Kanban passent ; contrôle Playwright du tableau sur ordinateur et mobile en contextes neufs, sans surcharge manuelle ni modification des brouillons utilisateur. [Preuve du tableau](assets/orchestration-2026-11-06/kanban.json).

Les modifications antérieures des journaux/états et fichiers applicatifs sont préservées. Les seuls changements d'exécution portent sur les anciens scripts encadrés ; les scripts de contrôle pré-push ponctuels sont inchangés. Aucune mise en conformité globale ou vérification des tâches Windows existantes revendiquée.

Retour arrière technique : commit ciblé retirant les gardes et les options ajoutées, sans modifier les journaux ou restaurer un ancien état métier. Ce retour réactiverait les risques identifiés : ne pas le faire implicitement. Ne pas restaurer un ancien historique Git ni fusionner un worktree non nettoyé.

Suite proposée : revoir les prototypes sous `gym-next/public/design_assets` et leurs références avant tout déplacement (ARC-03). L'intégration agentique A5 reste distincte, conditionnée aux sources évaluées, droits et besoins démontrés ; aucun agent supplémentaire n'est nécessaire pour cette clarification.
