# ARC4 — documents, CI et dossiers associés à GetYourMentor

## Livraison du 6 novembre 2026

Un [index d'orientation documentaire et une matrice CI](architecture/DOCUMENTATION_CI_2026-11-06.md) ont été ajoutés à l'index d'architecture existant. Aucun nouveau maître concurrent, déplacement de document, changement de workflow ou activation d'agent. Le relais courant reste le point de reprise.

L'inventaire porte sur les Markdown suivis, leurs empreintes dans le workspace et une lecture sémantique ciblée des entrées de référence. Il identifie explicitement les références canoniques, historiques, copies de lecture et documents restant à qualifier selon le lot. Il ne prétend pas valider sémantiquement tous les documents ou classer comme obsolète tout rapport daté. Les nombres exacts et les éventuelles omissions sont dans [inventory.json](assets/documentation-ci-2026-11-06/inventory.json).

Les deux fichiers ouverts dans VS Code ne nécessitaient pas de nouvelle refonte : leurs en-têtes les déclarent déjà historiques. `ARCHITECTURE_IA_RAG_GYM.md` renvoie à la mémoire/RAG canonique ; `AGENT_MISSION_EXECUTION_PROMPT.md` décrit un ancien runner et ne régit pas l'ensemble des sessions actuelles. Le guide rend ces correspondances explicites sans modifier leurs archives.

## Confirmation concernant les dossiers dans Documents

**Oui : 76 dossiers apparentés ont été repérés à la racine de `C:\Users\cashe\Documents`, en plus du dossier principal `GetYourMentor`.** Le périmètre retient les noms GetYourMentor/GYM et le registre de ses worktrees ; ce nombre n'est pas une recherche exhaustive de tous les liens possibles avec les autres projets personnels.

| Catégorie confirmée par les métadonnées | Nombre hors dossier principal | Conclusion |
|---|---:|---|
| Worktrees inscrits au registre Git du dépôt principal | 68 | Dossiers de travail séparés, partageant le dépôt Git ; pas de simples copies à effacer |
| Checkout Git indépendant | 1 | `GetYourMentor-site`, distinct du dépôt principal ; la procédure le décrit comme export publiable, sans vérifier ici sa connexion Netlify |
| Dossiers apparentés sans `.git` à leur racine | 7 | Supports ou copies possibles ; leur contenu et leur utilité ne sont pas établis par leur nom |

Le registre contient **69 worktrees en comptant le dossier principal**. Parmi les 68 voisins, 67 sont en HEAD détachée selon le registre. Cela ne démontre ni leur propreté, ni leur compatibilité avec l'historique nettoyé, ni qu'ils sont encore nécessaires.

Exemples de worktrees réellement déclarés : `GYM-agentic-20261103`, `GYM-connect-test-20261104`, `GYM-rag-comparison-20261104`, `GYM-door-navigation-20261102` et `GYM-fan-20261103`. Ils correspondent à l'organisation des chantiers isolés déjà décrite dans les rapports ; ce lot n'a pas exécuté leur code ni relancé leurs services.

Les sept dossiers sans marqueur Git à la racine sont :

- `GetYourMentor - Copie` ;
- `GetYourMentor_Audit_Design_2026-10-15` ;
- `GetYourMentor_Checkpoints` ;
- `GetYourMentor_Refonte_2026-10-15` ;
- `GYM-backups` ;
- `GYM-reprise-20261018` ;
- `GYM-tooling`.

L'absence de `.git` à la racine ne prouve pas l'absence d'un dépôt imbriqué. Aucun de ces dossiers n'est déclaré vide, redondant, sauvegarde fiable ou supprimable. Les noms de worktrees ne prouvent pas non plus une architecture multi-agents : ce sont des espaces de travail Git, pas des agents lancés.

Les derniers candidats de recette ARC3, eux, sont conservés **dans `GetYourMentor/delivery-private/`**, pas comme nouveaux dossiers voisins à la racine de Documents. Les prototypes extraits se trouvent dans `GetYourMentor/prototypes/`. Cette vérification n'a créé aucun nouveau dossier voisin.

## Méthode et protection des données

- Enumération superficielle des voisins apparentés, consultation du registre des worktrees et du chemin des métadonnées Git pour distinguer le checkout indépendant. Pas de lecture des sources, clés, bases, documents privés ou journaux des voisins. Les dossiers personnels sans rapport restent hors périmètre.
- Aucune récursion d'audit des voisins, aucun calcul de taille totale, statut Git, comparaison d'historique ou preuve de synchronisation. Les anciens SHA des worktrees ne sont pas réintroduits dans les livrables.
- Dans le dépôt principal, seuls les Markdown suivis sont inventoriés ; les documents commerciaux ignorés et copies non suivies ne sont pas lus. Les empreintes portent sur les fichiers locaux, y compris les brouillons existants, et ne constituent pas une validation de ces brouillons.
- Aucun groupe de Markdown strictement identiques détecté dans cette photographie. Cela n'exclut pas des copies réécrites, divergentes, non suivies ou ailleurs dans Documents. `project_readable/INDEX.md` et `project_readable/README.md` restent des exports, pas des sources canoniques.
- Les liens symboliques ou chemins résolus hors du périmètre sont exclus, les omissions sont visibles. L'outil travaille sans verrou optionnel Git, sans commande de mutation ni accès réseau.

Après la purge d'historique précédente, ne pas fusionner ou pousser un ancien worktree simplement parce qu'il figure dans le registre. Un éventuel rangement des voisins doit d'abord vérifier son statut, ses fichiers uniques, ses références et sa sauvegarde, dans un lot explicitement consacré à cela. Aucun nettoyage n'a été effectué ici.

## CI : constat réel et limites

Les deux YAML ont été lus avec un chargeur conservant la clé `on`, sans exporter les valeurs d'environnement ni accéder aux secrets :

- `agentic-local.yml` déclare uniquement un déclenchement manuel ;
- `mvp-gates.yml` couvre les pushes vers `main` et `feat/nextjs-migration`, certaines bases de PR et le mode manuel ;
- la branche actuelle `design/refonte-progressive-lot1` ne correspond à aucun déclencheur de push déclaré ;
- le contrôle `production-readiness` est conditionné au mode manuel et n'a pas été lancé ;
- `netlify.toml` décrit le build Next mais ne permet pas de conclure sur les réglages de connexion Git ou les déploiements distants.

Aucune consultation des paramètres GitHub, checks requis ou journaux Actions ; aucune garantie d'activation distante déduite des seuls fichiers. La [matrice détaillée](architecture/DOCUMENTATION_CI_2026-11-06.md) distingue les commandes déclarées des contrôles exécutés dans ce lot.

## Contrôles et suite

Quatre tests de l'outil : redirection des références historiques, copies et inconnus, parseur NUL des worktrees, dépôt temporaire avec doublons/CI/voisins et vérification d'absence d'écriture dans les fichiers et l'index Git. Les résultats sont reproductibles sur le périmètre inventorié. Les liens locaux des nouveaux documents et les références de remplacement sont contrôlés.

Les 35 tests de l'atelier/Kanban et son affichage ordinateur/mobile sont contrôlés, sans toucher les brouillons localStorage de l'utilisateur. GYM-ARC4 et ses sous-tickets sont clôturés dans ce périmètre documentaire et de métadonnées. Les changements antérieurs, workflows, code applicatif, sources RAG et dossiers voisins sont préservés. Aucun build ou parcours applicatif relancé : aucun changement du produit dans ce lot. Voir [checks.json](assets/documentation-ci-2026-11-06/checks.json).

Prochain lot recommandé : **ARC-05**, séparation des types purs et des données de démonstration via une façade compatible, selon l'audit d'architecture. Il est distinct du ticket agentique **A5**, toujours non activé. Aucune autorisation distante, migration, publication ou intégration d'agent n'est donnée par cet index.
