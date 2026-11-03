# Kanban de travail en couloirs — 3 novembre 2026

La consigne utilisateur remplace la présentation documentaire précédente. Référence examinée : [tableau Draft.io fourni](https://recette.draft.io/assets/site/examples/light/en/1200/example-kanban-board-d3af8af3ed255ebaf7787e67f4d32235.webp). La composition en lignes, colonnes et cartes colorées est reprise ; aucun contenu, chiffre ou graphique d'activité tiers n'est copié.

## Rendu et utilisation

**Aperçu courant : http://127.0.0.1:4325/**, checkout `C:/Users/cashe/Documents/GYM-kanban-20261103`. Relance depuis ce checkout : `node tools/agentic-workbench/server.mjs`. `GYM_WORKBENCH_PORT` permet un port loopback distinct si nécessaire ; le contrôle navigateur accepte `GYM_WORKBENCH_URL`.

- Tableau au premier plan, sans grande page de présentation au-dessus ; charge par rôle et documentation accessibles par onglets.
- Cinq couloirs pour les cinq tickets parents ; treize post-it pour leurs sous-tickets. Les dix-huit tickets sont préservés.
- Huit étapes existantes conservées, compteurs, en-têtes et noms de lots fixes pendant le défilement.
- Cartes jaunes/orange/rouges/bleues selon priorité, blocage ou clôture ; détails, preuves, dépendances et critères dans une fiche modale.
- Filtres sprint, rôle et recherche. Pas de duplication du coût des parents dans la charge par rôle.
- Glisser-déposer d'un sous-ticket dans une autre colonne du même couloir ; modification équivalente dans la fiche, utilisable au clavier et sur écran tactile. Changer de couloir ne réaffecte pas implicitement le parent.
- Deux sous-tickets en cours au maximum ; dépendances contrôlées avant progression. Une nouvelle clôture exige une preuve renseignée et une déclaration de vérification manuelle. Le parent ne peut pas être clôturé directement : son statut dépend de ses enfants.

## Persistance et exactitude

Les changements sont des **statuts manuels de planification**, sauvegardés dans ce navigateur et signalés par une bordure et un libellé. Ils ne changent pas le fichier source `backlog.json`, n'exécutent pas de tests et ne constituent pas une synchronisation GitHub/Jira ou un service collaboratif.

Une preuve saisie est une déclaration manuelle, pas une vérification automatique du fichier ou du résultat. L'export JSON conserve cette distinction (`manual`, `manuallyVerifiedAt`, `exportKind`). Une remise à zéro retrouve le dossier initial. Les anciens déplacements ne sont pas appliqués automatiquement si le contenu du dossier source a changé. La sauvegarde locale n'est pas une sauvegarde distante garantie ; l'export permet d'en garder une copie.

Les rôles ne sont toujours pas des agents actifs, et aucune mesure de temps consommé n'est inventée. Aucun graphique de vitesse ou de flux n'a été fabriqué pour imiter l'image de référence. Le RAG garde les limites documentées dans le [rapport d'architecture](architecture/AGENTIC_REFACTOR_2026-11-03.md).

## Contrôles exécutés

**17/17 tests Node PASS** : quatorze contrôles précédents, plus trois tests de politique du tableau couvrant la clôture des parents, les preuves, les dépendances, la limite WIP et les raisons de blocage.

Playwright à **1440 et 390 px** : treize cartes/cinq couloirs, filtre S1 à sept sous-tickets, filtre Architecture à trois, recherche ciblée, fiche, déplacement par statut, sauvegarde après rechargement, refus d'une clôture sans preuve, preuve manuelle de recette puis réinitialisation, export JSON et conservation des dix-huit tickets. Glisser-déposer testé sur ordinateur. La vue étroite utilise le mode tactile émulé et la fiche comme alternative. Clavier, citations et abstention documentaire contrôlés. Aucun débordement de la page ; le tableau possède son propre défilement.

Les preuves manuelles créées pendant la recette appartiennent au contexte navigateur de test et sont réinitialisées avant les captures ; le JSON source n'a pas été modifié. Les captures et résultats sont dans `docs/assets/kanban-2026-11-03/`. Inspection visuelle de la capture ordinateur effectuée. Pas de nouvelle compilation Next ni de test des parcours métier revendiqués : ce lot modifie seulement l'atelier local.

Aucun déploiement, achat, accès fournisseur, changement de compte ou migration distante. Les autres modifications du dépôt restent préservées. Commit et état du push consignés dans `C:/Users/cashe/Documents/GYM-kanban-20261103/delivery-private/git-delivery.json`. La divergence distante connue n'est ni fusionnée ni forcée.
