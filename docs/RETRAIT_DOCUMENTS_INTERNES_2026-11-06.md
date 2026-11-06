# Retrait des documents internes et nettoyage historique — 6 novembre 2026

## Autorisation et périmètre

L'utilisateur demande explicitement l'exclusion Git des dossiers business plan, devis, financement, idées, Branding et commerciaux, puis leur suppression de l'historique GitHub. Cette consigne autorise exceptionnellement la réécriture historique et les mises à jour forcées nécessaires ; elle ne constitue pas une autorisation permanente de force-push.

Chemins exacts : `Dossier Business Plan/`, `Devis/`, `Financement/`, `Idée V2, V3 etc___/`, `Branding/`, `Les commerciaux/`, et leurs six copies sous `project_readable/`. Les autres dossiers, notamment banque et contacts, restent hors de cette demande. Pas de recherche ni suppression générale de tous les textes commerciaux ailleurs dans le dépôt.

## Réalisation et contrôles

- Douze règles ajoutées au `.gitignore` de la branche de travail ; `git check-ignore` positif pour chaque chemin. Exclusions ensuite propagées par commits dédiés aux 17 autres branches ; les 18 branches sont protégées par ces règles, sans modifier le tag historique.
- **44 fichiers désindexés**, sans suppression locale : empreintes SHA256 identiques avant/après, copies locales conservées.
- Sauvegarde miroir locale complète dans `delivery-private/history-cleanup-20261106/backup-local.git`. Elle contient l'ancien historique privé : ne pas la publier. Une première copie distante lente a été interrompue ; `backup.git` n'est pas la sauvegarde de référence.
- Outil libre git-filter-repo 2.47.0 installé uniquement dans `delivery-private/history-rewrite-tools`, sans installation Python globale ni achat. Traitement dans `rewrite.git`, copie isolée ; dépôt et worktrees originaux non filtrés sur place.
- **18 branches et 1 tag GitHub** mis à jour de façon atomique avec un lease explicite sur chaque ancienne référence. Références distantes revérifiées contre le résultat attendu ; aucun nom de branche/tag supprimé ni branche supplémentaire publiée.
- Aucun historique des chemins ciblés dans ces références après filtrage. Comparaison des arbres avant/après sur les 19 références : chaque fichier hors périmètre conserve mode et identifiant de contenu. Aucun code métier changé par le filtrage.
- Les messages des commits de tête portent les marqueurs `[skip ci] [skip netlify]` afin d'éviter de déclencher des builds/déploiements lors de cette opération. Aucun déploiement lancé manuellement ; aucun état de déploiement distant n'a été audité.
- Les références GitHub `refs/pull/1/head` et `refs/pull/1/merge` se sont actualisées. Récupérées dans le miroir de vérification seulement : recherche historique des chemins ciblés vide sur les deux.
- Branche locale active réalignée sur son nouvel historique après comparaison de l'arbre de base : même arbre et index inchangé. Les changements non validés des autres sessions sont conservés.

Le filtre a d'abord refusé la copie de travail à cause d'une référence stash provenant du clone local. Cette seule référence a été retirée de la copie isolée ; le stash du dépôt original et sa sauvegarde restent conservés. Aucun `--force` de filtre n'a été utilisé pour contourner sa vérification de fraîcheur. Le push forcé des références GitHub est, lui, couvert par la demande utilisateur et protégé par les leases.

Les preuves détaillées, maps ancien/nouveau et empreintes de fichiers restent locales dans `delivery-private/history-cleanup-20261106/` et `delivery-private/untrack-business-before.json`, pour ne pas republier les documents ou leurs noms détaillés.

## Prévention de réintroduction

Les anciens worktrees détachés et branches locales historiques sont préservés ; ils peuvent encore contenir l'ancien historique **localement**. Ne pas les fusionner ou pousser tels quels. Repartir d'une référence distante nettoyée et transférer uniquement des changements explicitement revus, sans les dossiers exclus.

Garde locale ajoutée, aucun hook antérieur remplacé : `.git/hooks/pre-push` et `.git/hooks/private-history-guard.py`. Elle refuse un push dont l'historique contient les chemins retirés. Essais réels : ancienne tête refusée, nouvelle tête acceptée. Cette garde est locale, non distribuée par Git ; elle ne protège pas automatiquement les autres clones. Elle ne remplace pas une coordination avec les autres sessions/collaborateurs et peut être contournée par un utilisateur disposant des mêmes droits.

Les anciens identifiants de commits changent ; les SHA mentionnés dans les rapports historiques restent des références à l'état antérieur, pas des références courantes. Consulter la map locale pour une correspondance. Ne pas restaurer un ancien historique par merge ou force-push.

## Limite GitHub

Le nettoyage vérifié porte sur les branches, le tag et les deux références PR annoncées par GitHub. Il ne garantit pas l'effacement physique immédiat des objets, vues en cache, archives ou clones/forks externes. Une purge supplémentaire de vues en cache peut nécessiter GitHub Support, selon son éligibilité ; aucun message au support envoyé ici. Voir la [procédure officielle GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

Aucune migration, notification, opération financière ou modification applicative. Aucun effacement des originaux locaux, de leurs sauvegardes ou des autres travaux.
