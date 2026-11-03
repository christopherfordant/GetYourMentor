# Deux régressions RAG corrigées — 3 novembre 2026

Base relue : `5a2d060`, après les corrections de l'autre session `ee2e1b3` / `1e3f840`. Lot isolé dans `C:/Users/cashe/Documents/GYM-rag-fixes-20261103`. Les modifications antérieures du dossier principal n'ont pas servi de base implicite à la recette.

## Corrections

1. **Plusieurs passages par document.** La recherche réserve d'abord des places à cinq documents distincts au maximum, puis complète avec des passages admissibles. Deux extraits contradictoires ou complémentaires d'un même document peuvent donc être restitués ensemble. Les doublons de texte, après normalisation des espaces, ne prennent pas plusieurs places dans ce document. Les extraits sont rendus sans paraphrase ni troncature.
2. **Admission avant classement final.** La couverture minimale est appliquée à tous les candidats avant leur sélection : deux termes distincts pour une question à plusieurs termes, un pour une question à un terme. Un mot rare isolé ne peut plus évincer les candidats admissibles ni provoquer à lui seul l'abstention. Le garde de l'assistant vérifie aussi la présence d'un candidat admissible, pas seulement son premier élément.

Budget explicite partagé et renvoyé par l'API : **8 passages, 7 200 unités de texte JavaScript cumulées sur les extraits, 3 passages maximum par document**. La diversité de cinq documents concerne la première passe ; les places restantes sont attribuées dans l'ordre de classement et sous les mêmes limites. Un passage trop grand pour le budget restant est ignoré plutôt que tronqué pour fabriquer une citation. Les identifiants, chemins et versions restent ceux des sources.

Ce budget implique une sélection non exhaustive : plus de trois passages pertinents dans un même document ne seront pas tous affichés. La présence de plusieurs extraits ne constitue pas une détection ou une résolution sémantique des contradictions. La personne qui consulte les sources garde cette responsabilité.

## Résultats exécutés

| Contrôle | Résultat | Portée |
|---|---|---|
| Reproductions avant correction | Deux défauts reproduits | `before.json` |
| Tests Node | **26/26 PASS** | Vingt existants, six nouveaux cas de régression |
| Questions de référence | **12/12 PASS** | Huit historiques et quatre ajoutées, attentes conservées |
| Nouvelles formulations de contrôle | **2/3 PASS** | Hors des questions ayant guidé les deux correctifs ; échec conservé |
| Manifeste RAG | **8 documents valides** | Corpus existant inchangé |
| Navigateur | **1440 et 390 px PASS** | Kanban, fiche, filtres, statut, export, clavier/tactile émulé, citations et abstention |
| Conservation des déplacements | **1440 et 390 px PASS** | Ancienne vue compatible reprise ; ancienne vue différente préservée et exportée ; nouveaux déplacements persistants |

Les six nouveaux tests couvrent : contradiction dans un même document, terme rare isolé, complémentarité/doublons, budgets/citations exactes, candidats insuffisants ou privés/archivés, passage trop grand sans troncature. Le test antérieur de diversification a reçu des passages qui satisfont la couverture minimale : sa vérification des doublons reste active ; les questions de référence n'ont pas été assouplies.

### Limite révélée par les nouvelles formulations

« Quand décolleront les missions habitées vers Jupiter ? » reçoit des extraits au lieu d'une abstention. Les mots communs au corpus, notamment « missions » et « vers », suffisent au garde lexical. Le même défaut a été reproduit avec le moteur d'avant le correctif : ce n'est pas une régression introduite par ce lot.

Ce cas est conservé comme **échec**, sans changer son attente ni régler le classement pour obtenir 3/3. Il faut améliorer l'abstention hors sujet et élargir l'évaluation dans une prochaine tranche. Les douze succès de référence ne mesurent pas une pertinence sémantique universelle ; les trois nouveaux contrôles restent un très petit échantillon, pas un benchmark indépendant à grande échelle.

Le script utilise le même `runAssistant` et le même retrieval que l'API, avec vérification des identifiants de document, chemins, versions et extraits. La commande `--controls` renvoie volontairement un code non nul tant que Jupiter reste en échec ; le workflow existant ne lance que la référence par défaut. Aucun run CI distant revendiqué.

## Aperçu et déplacements utilisateur

**http://127.0.0.1:4325/** est servi depuis le nouveau checkout ci-dessus, par `node tools/agentic-workbench/server.mjs`. Aucun processus n'écoutait sur ce port au contrôle initial ; un nouveau serveur connu a été lancé. Les octets HTTP de `app.js`, `board-policy.mjs` et `backlog.json` ont été comparés aux fichiers du checkout par SHA256. Une réponse réelle de l'API a été comparée intégralement à celle du moteur local : identité vérifiée dans `runtime.json`.

Le Kanban source a reçu de nouvelles preuves pour GYM-A3 et GYM-A3.2, sans supprimer les anciennes. Leur validation concerne les deux régressions traitées ; le prochain contrôle ouvert sur Jupiter est mentionné dans leur prochaine action. Les tâches d'embeddings et LangGraph ne sont pas clôturées.

Les déplacements manuels du navigateur ne sont pas réinitialisés. Le stockage courant est séparé par empreinte du dossier source. Les anciennes clés v2/v3 restent conservées ; le bouton « Exporter mes anciens déplacements » permet de sauvegarder leurs données brutes. Une vue compatible peut être reprise ; une vue d'un autre dossier n'est pas appliquée automatiquement. Les nouveaux déplacements ne remplacent pas l'ancienne clé. Aucun accès au profil navigateur personnel n'a été utilisé pour les tests : contextes Playwright séparés et données synthétiques uniquement.

## Preuves et relance

Répertoire : `docs/assets/rag-fixes-2026-11-03/`. Contient avant/après, journaux de tests et évaluations, captures, vérification des fichiers servis, exemples d'extraits réels et deux passages contradictoires synthétiques. Les anciens rapports et captures du dossier principal sont préservés.

```powershell
cd C:\Users\cashe\Documents\GYM-rag-fixes-20261103
node --test tools/agentic-workbench/tests/*.test.mjs
node gym-next/scripts/evaluate-rag-corpus.mjs
node gym-next/scripts/evaluate-rag-corpus.mjs --controls
node tools/agentic-workbench/server.mjs
```

La troisième commande expose la limite restante et renvoie 1. Ne pas démarrer un deuxième serveur sur le même port. Contrôles navigateur, serveur déjà ouvert : `node tools/agentic-workbench/tests/browser-check.cjs` et `node tools/agentic-workbench/tests/drafts-browser.cjs` (Playwright existant réutilisé).

Aucun modèle, embedding, LangGraph, nouvelle base, appel payant, migration, changement métier ou déploiement ajouté. Pas de compilation générale Next : ses composants ne sont pas modifiés. État Git final : `C:/Users/cashe/Documents/GYM-rag-fixes-20261103/delivery-private/git-delivery.json` ; aucune fusion, rebase ou force-push autorisé.
