# Mode de fonctionnement du Kanban GetYourMentor

Mis à jour le 13 novembre 2026. Le Kanban de référence est `tools/agentic-workbench/backlog.json`, rendu localement par `tools/agentic-workbench/`. Les copies présentes dans des worktrees ou dossiers de livraison servent à leurs travaux isolés ; elles ne remplacent pas le backlog du dépôt principal. Les retours d’un worktree sont reportés ici ticket par ticket, après vérification de leur preuve.

## Flux d’équipe

Les colonnes sont : Backlog, À préparer, Prêt, En cours, En revue, À vérifier, Terminé et Bloqué. Les lignes regroupent les tickets parents et leurs sous-tickets. Un ticket ne passe en « Terminé » qu’avec une preuve renseignée et une vérification manuelle confirmée. Une dépendance non terminée empêche de commencer ou de clôturer le ticket dépendant ; un blocage doit avoir une cause consignée.

La limite de travail simultané affichée est de deux sous-tickets. Les rôles Architecture, RAG, Sécurité, QA et DevOps décrivent des responsabilités de planification ; ils ne prétendent pas qu’une personne ou un agent a travaillé. Les charges sont des estimations. Le temps réellement consommé reste inconnu tant qu’il n’est pas mesuré.

Les sprints, dates proposées, objectifs et dépendances sont conservés dans le même fichier. Les dates de remise et les estimations servent à planifier ; elles ne constituent ni engagement ni preuve de réalisation.

## Séparation des environnements

Le filtre « Cible » et le badge affiché sur chaque carte rendent explicite la distinction entre :

- **Recette Connect historique — GYM-B1** : parcours exécuté avec les services de test documentés dans le checkout `GYM-connect-test-20261104` et la base `getyourmentor-preprod`. Son statut « Terminé » décrit cette recette historique, pas la démo actuelle reliée au portfolio.
- **Démo liée au portfolio — GYM-D1** : `https://getyourmentor-demo-20261014.netlify.app/`. Le projet Supabase dédié `getyourmentor-demo-recruiter` est provisionné et le schéma a ses assertions archivées ; l’adaptateur n’est pas intégré et le site public n’est pas connecté à cette base. GYM-D1.2 et D1.3 restent en cours ; les tâches dépendantes ne sont pas déclarées terminées.
- **Dépôt principal** : tickets qui n’ont pas de cible particulière déclarée. Le tableau ne déduit pas un environnement de production à partir d’un nom de branche ou d’une variable.

Les cartes utilisent les couleurs suivantes : jaune pour la priorité standard, orange pour P0, rouge pour un blocage, bleu pour un travail terminé. La couleur complète l’état textuel ; elle n’en est jamais l’unique indication.

## Mise à jour du 13 novembre

Le Kanban du dépôt principal a repris l’état de GYM-D1 du commit `7622fa06cf6737ffb5ba4afa7db337e52a51690d` de la branche isolée `demo/recruiter-supabase-adapter-20261112`, sans fusionner son code. GYM-D1.1 est terminé ; GYM-D1.2 et GYM-D1.3 sont en cours ; GYM-D1.4 est bloqué ; D1.5 à D1.7 sont à préparer ; D1.8 et D1.9 restent au backlog. Les preuves et blocages sont conservés ticket par ticket dans le JSON.

Les déplacements effectués dans l’interface sont des brouillons dans le stockage local du navigateur. Ils ne modifient pas le JSON versionné, ne vérifient pas les preuves et ne se synchronisent pas avec les autres postes. Pour rendre un changement officiel, mettre à jour le JSON avec sa preuve, passer les tests, puis effectuer un commit ciblé.

## Contrôles de cette mise à jour

- Les 36 tests de l’atelier passent ; le nouveau test vérifie l’héritage de cible parent/enfant.
- Le JSON du backlog est valide : 85 tickets, 4 sprints, identifiants, parents, dépendances et cibles résolus.
- Playwright local : le filtre « Démo liée au portfolio » affiche les neuf cartes D1 et exclut les cartes de recette historique ; la fiche D1.2 expose le nom du projet Supabase dédié. Ordinateur et mobile contrôlés, sans erreur de page ; le document ne déborde pas à 390 px.
- Captures : `docs/assets/kanban-operating-model-2026-11-13/desktop-portfolio-demo.png` et `mobile-portfolio-demo.png`.
- Ce travail concerne le Kanban local. Aucun parcours métier, service distant ou site publié n’a été modifié.

## Sélection de ticket et reprise ciblée — 13 novembre

Le lecteur local `tools/agentic-workbench/task-context.mjs` fournit `--ticket ID`, `--ticket ID --details` et `--next`. Il lit uniquement le backlog versionné, ne modifie ni le Kanban ni son localStorage, et n'ouvre pas les fichiers référencés par un ticket. `--next` exige un ticket feuille au statut `ready` et des dépendances au statut `done` ; en l'absence d'un tel ticket, il expose ce fait ainsi que des candidats non validés. Procédure détaillée et contrôles : `docs/KANBAN_CONTEXT_READER_2026-11-13.md`.

### Chantier distinct : plateforme de développement agentique réutilisable

Après le lot K1, le cadrage `docs/PLATEFORME_AGENTIQUE_REUTILISABLE.md` a ajouté GYM-PLAT et ses huit sous-tickets au backlog versionné : PLAT.1 est planifié comme terminé après ses contrôles ; le parent reste en cours et les lots PLAT.2–PLAT.8 ne sont pas déclarés prêts ni réalisés. Les sprints S6–S8 sont des propositions conditionnelles, avec dates et charges non contractuelles. Cette initiative concerne l’outillage local multi-projet, pas l’orchestration documentaire métier GYM-A5. Le lecteur sélectif existant doit être réutilisé avant toute généralisation. Aucun agent LLM additionnel, framework, base mémoire ou service distant n’est adopté par le cadrage.

Le backlog contient maintenant 96 tickets sur 8 sprints. Cette évolution conserve les 87 tickets préexistants et ajoute neuf identifiants GYM-PLAT, sans modifier les statuts des chantiers antérieurs.
