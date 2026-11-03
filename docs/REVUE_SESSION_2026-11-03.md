# Revue des modifications de l'autre session — 3 novembre 2026

Périmètre : différences depuis la livraison `2bafb8c`, état relu `1e3f8401f227110087adb5bb33f7a5d0faaffcc3`. Deux commits à 16:04:31 et 16:04:46 (+01:00), `ee2e1b3` puis `1e3f840`. Treize fichiers concernés : retrieval lexical, évaluateur, nouvelles questions/tests, backlog et preuves. Aucune modification de l'interface du site dans ces deux commits.

Les 18 fichiers déjà modifiés avant cette session ont les mêmes empreintes qu'à la dernière livraison. Leurs changements n'ont pas été attribués à tort à cette nouvelle session. Les tampons non enregistrés de VS Code ne sont pas accessibles à cette revue.

## Constats

### P2 — La diversification masque les contradictions au sein d'un même document

`tools/agentic-workbench/retrieval.mjs:55` conserve un seul passage par `documentId`. Deux passages actifs du même document portant respectivement « Commission reservations : 15 pourcent. » et « Commission reservations : 10 pourcent. » donnaient deux extraits avant la modification ; un seul est maintenant restitué avec le statut `sources`.

Ce cas importe pour le document maître, qui contient des paragraphes historiques et des décisions plus récentes. La contradiction devient invisible à la personne qui consulte les extraits. Le test existant utilise deux documents différents : il ne couvre pas cette régression.

Correction proposée : diversifier les premiers documents tout en conservant les passages complémentaires nécessaires à leur revue, ou proposer explicitement une consultation des autres passages pertinents. Ajouter un cas de contradiction à l'intérieur du même document. Ne pas prétendre résoudre sémantiquement toutes les contradictions.

### P2 — Un mot rare peut déclencher une abstention malgré des candidats mieux couverts

Le calcul IDF et la multiplication par la couverture (`retrieval.mjs:47–51`) ne garantissent pas qu'un passage couvrant deux termes devance un passage à un seul terme rare. Le garde dans `workflow.mjs:23` ne regarde ensuite que le premier résultat.

Reproduction avec huit documents : sept contiennent « coach tarif », un contient « orchestration ». Pour « coach tarif orchestration », l'ancien premier résultat avait deux termes ; le nouveau n'en a qu'un et l'assistant s'abstient, alors que plusieurs candidats avec deux termes restent dans les résultats suivants.

Il s'agit d'un faux négatif de recherche, pas d'une réponse inventée. Correction proposée : appliquer le critère de couverture à l'ensemble des candidats avant la sélection finale, ou examiner les candidats admissibles avant de s'abstenir. Ajouter ce cas à l'évaluation, sans affaiblir les règles d'abstention.

## Contrôles rejoués

- Tests Node : **20/20 PASS**.
- Évaluation : **12/12 PASS**, dont les huit questions historiques. Les attentes historiques n'ont pas été supprimées ; les nouveaux cas ajoutent bien provenance, schémas, abstention et refus de mutation.
- Manifeste : **8 documents valides**.
- Les deux constats ci-dessus sont reproduits avec des données synthétiques, sans fournisseur, appel LLM ou donnée privée. Script : `node docs/assets/review-session-2026-11-03/reproduce.mjs`.
- L'aperçu `http://127.0.0.1:4325/backlog.json` n'était pas joignable pendant la vérification. Aucun contrôle visuel actuel ni synchronisation des états navigateur ne sont revendiqués. Aucun serveur de l'autre session n'a été arrêté ou remplacé.

Le gain de classement observé sur les douze questions est réel et reproductible, mais ne suffit pas à couvrir ces deux scénarios de régression. LangGraph, embeddings et intégrations externes ne sont pas devenus actifs par ces commits.

## Périmètre préservé

Cette revue ne corrige ni ne remplace le code de l'autre session, ne réinitialise aucun Kanban et ne modifie aucun compte, service ou déploiement. Seuls ce rapport, ses reproductions et la reprise sont ajoutés. État Git final archivé dans `delivery-private/review-session-20261103-git.json` ; aucun force-push, fusion ou rebase.
