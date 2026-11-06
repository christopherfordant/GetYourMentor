# Premier lot parallèle supervisé — 7 novembre 2026

## Résultat et mécanisme réel

Deux sous-agents natifs de la conversation ont été lancés et observés **tous deux en cours simultanément**. Deux fenêtres VS Code ont été ouvertes sur leurs dossiers, avec leurs missions affichées et les extensions désactivées au lancement pour réduire la charge. Leurs titres visibles ont été vérifiés en lecture seule par `EnumWindows`.

Les agents ne sont **pas** des conversations VS Code pilotées automatiquement. Le coordinateur les a lancés via `collaboration.spawn_agent`, suivis par leurs messages et `list_agents`, puis a réuni leurs commits. Aucune acceptation de permission par automatisation d'interface. Pas de script Codex historique, nouvelle API applicative, compte ou agent persistant.

La [documentation officielle OpenAI sur la délégation](https://developers.openai.com/api/docs/guides/responses-multi-agent) décrit les contextes indépendants, le partage des outils et du système de fichiers, ainsi que le coût potentiel de la parallélisation en tokens. La capacité de ce lot a été vérifiée par les outils réellement disponibles. Aucun compteur privé de quota ou de facturation n'était accessible ; aucune gratuité ou économie chiffrée n'est promise. Aucun achat, changement d'abonnement ou appel API payant supplémentaire configuré.

## Répartition et résultats

| Exécutant réel | Modèle/effort demandé au lancement | Dossier dans Documents | Branche | Résultat |
|---|---|---|---|---|
| `/root/arc5` | `gpt-6.1-sol`, medium | `GYM-parallel-arc5-20261107` | `agent/20261107-arc5` | ARC-05 : types et fixtures séparés avec façade compatible |
| `/root/telegram_metrics` | `gpt-6-luna`, medium | `GYM-parallel-telegram-20261107` | `agent/20261107-h15-metrics` | H1.5.1 : indicateurs Telegram agrégés, purs et non raccordés |

Choix proportionné : extraction TypeScript et préservation des contrats pour Sol ; projection pure étroitement bornée pour Luna. Aucun réglage global de modèle n'a été changé et aucun autre sous-agent lancé.

Les deux worktrees proviennent du checkpoint nettoyé `7d9fa56`. Aucun des 68 anciens worktrees n'a été réutilisé. Les dépendances existantes sont partagées par jonctions `node_modules` ignorées de Git, sans installation ni duplication des packages. Aucun brouillon non commité n'a été incorporé silencieusement à leur base.

### ARC-05

Les trois types de `lib/domain.ts` sont dans `lib/domain/model.ts`, le tableau mutable dans `lib/fixtures/coaches.ts`. Les consommateurs conservent leurs imports historiques ; la façade conserve les exports et les six fonctions. La revue indépendante confirme les mêmes déclarations, données et corps de fonctions, hors fins de ligne, ainsi que l'identité du tableau partagé. Pas de nouveau store ni de changement des règles métier.

Commit source `03a80ffb5c47b84e37d6cbe70492ad4f26a1c569`, intégré par cherry-pick `b3c67ce`. [Preuve de l'exécutant](arc5-result.md). Quatre tests Node isolés sur exports, données, filtres, mutations et modèle sans dépendance runtime.

### H1.5.1

`lib/telegram-observability.ts` reçoit une outbox et une horloge en mémoire, et retourne uniquement des compteurs agrégés. Aucun stockage, fichier réel, clé ou appel réseau. Les champs d'identité, messages et erreurs ne sont pas retournés. `accepted` n'atteste pas la réception téléphone ; `retryAt.due` observe une échéance, sans sélectionner ni autoriser un renvoi.

La revue a demandé une correction de dépassement de la somme des tentatives : saturation à `MAX_SAFE_INTEGER` et indicateur explicite, sans valeur imprécise. Le correctif et son test ont été livrés. Commits sources `f58300ebacfe192bc2fb3f66e269a9a07128903f` puis `e5d1085b9e079b57a85c74355d1608810fe0de84`, intégrés par `134fc4c` et `f790bbe`. [Preuve de l'exécutant](telegram-result.md). Cinq tests synthétiques.

Ce sous-lot ne termine pas **H1.5** : le raccordement, les alertes et les scénarios 429/panne/incertain restent dans H1.5.2, non exécuté. Aucun message Telegram envoyé ni nouvelle notification de recette déclenchée.

## Coordination, revue et contrôles

Allowlist disjointes et un commit ciblé par résultat, avec correctif de revue séparé pour Telegram. Le coordinateur a réservé instructions, Kanban, reprise et intégration. Aucun agent n'a poussé sa branche, fusionné un ancien historique ou désactivé une protection. Les cherry-picks des seuls commits revus ont été intégrés à `design/refonte-progressive-lot1` ; pas de conflit ou force-push.

Le Kanban affiche désormais un badge « Agent natif », l'identifiant, la phase et les détails du worktree pour ces missions. Les autres rôles restent des affectations de planification. Les déplacements manuels et l'historique localStorage de l'utilisateur sont conservés. PAR1, ARC5, H1.5.1 et la revue d'intégration sont clôturés sur leurs preuves ; H1.5 reste en cours avec un sous-ticket ouvert.

Contrôles combinés : **9 tests unitaires**, **TypeScript complet**, **31 tests des gardes d'orchestration**, **35 tests de l'atelier/Kanban** et affichage du tableau sur ordinateur/mobile. Aucun agent, build ou navigateur applicatif supplémentaire n'est déclenché par ces tests. Résultats détaillés : [checks.json](../../assets/parallel-2026-11-07/checks.json), [exécution](../../assets/parallel-2026-11-07/execution.json), [fenêtres](../../assets/parallel-2026-11-07/windows.json).

Mémoire relevée : environ 7,9 Gio utilisables et 0,79 Gio libres initialement, environ 0,49 Gio libres après ouverture des vues. Ces relevés sont ponctuels, pas des mesures de consommation attribuables aux agents. Un seul contrôle TypeScript global a été exécuté, avec plafond mémoire Node ; aucun build lourd ni test applicatif complet relancé. La validation est proportionnée à l'extraction conservatrice et à la fonction pure non raccordée ; elle n'est pas une recette de production ou de paiement.

Les 18 modifications antérieures ont été préservées octet pour octet. Aucun dossier précédent supprimé, données réelles ou accès connecté utilisé, migration, déploiement ou service distant métier appelé. La consultation officielle OpenAI était documentaire uniquement.

## État après livraison

Les deux missions natives ont rendu leur résultat ; aucune boucle ne poursuit le travail. Les fenêtres restent disponibles pour examiner les fichiers. Les dossiers d'exécution sont conservés, sans déclaration qu'ils sont devenus des copies inutiles. Pour un autre lot, repartir des instructions et du relais actuels, avec tâches indépendantes, limites de ressources et validation combinée. L'exception de ce premier lot ne vaut pas autorisation de déléguer indéfiniment.

Prochaine étape métier recommandée : préparer H1.5.2 (raccordement expurgé et procédure de reprise), sans renvoi automatique ni service distant implicite. L'intégration agentique applicative A5 reste distincte et dépend toujours des validations documentaires/humaines ouvertes.
