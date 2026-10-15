# GetYourMentor - Strategie de branches

## Procedure obligatoire a chaque demande - 15 octobre 2026

Cette procedure s'applique a chaque prompt GetYourMentor, avant les travaux et avant la reponse finale. Les mises a jour intermediaires restent possibles.

1. Lire AGENTS.md, cette procedure, DOCUMENT_MAITRE_GYM.md, docs/README.md, docs/REFONTE_PROGRESSIVE_2026-10-15.md et les contrats pertinents. Appliquer les decisions utilisateur les plus recentes.
2. Verifier le depot, la branche, les worktrees, les modifications indexees/non indexees, le distant et l'upstream. Choisir la branche du chantier : design/refonte-progressive-lot1 pour la refonte actuelle et ses preuves. Ne pas pousser sur main ni recopier le travail sur plusieurs branches. Les anciens noms dans les relais sont historiques.
3. Preserver les modifications anterieures. Realiser des lots cibles, verifier les changements et actualiser les documents canoniques et la reprise. Ne pas ajouter tout le depot, des secrets, des donnees personnelles ou des fichiers temporaires.
4. Avant chaque reponse finale de livraison, commiter et pousser le travail valide sur la branche appropriee. Au prompt suivant, verifier la synchronisation des commits livrables precedents. Aucun commit vide pour une discussion ; les travaux anterieurs non verifies ne sont pas automatiquement livrables.
5. Confirmer le succes du push en comparant le SHA local a la reference distante. Rapporter branche, commit, controles et changements restant locaux. Ne pas annoncer un push sans preuve distante.
6. Si les controles, un conflit ou l'acces distant bloquent, preserver le travail et signaler le blocage precis. Demander uniquement l'intervention indispensable. Ne pas forcer le push ni desactiver les protections.

Cette autorisation couvre les commits et pushes cibles, sans fusion, force-push ni deploiement en production. Verifier les declencheurs CI/CD et conserver l'isolation de demonstration. Code pousse et code deploye sont deux etats distincts.

## Principe

`main` reste la branche de reference.

Les autres branches servent a separer les grands chantiers du projet pour eviter de melanger :
- vision et documentation
- produit
- design
- automatisation
- business et acquisition

## Branches recommandees

### `docs/project-foundation`

Pour :
- document maitre
- architecture memoire
- cadrage global
- decisions fondatrices

### `product/mvp-spec`

Pour :
- MVP
- parcours utilisateur
- specification des ecrans
- logique fonctionnelle

### `design/figma-planity-like`

Pour :
- maquettes Figma
- charte graphique
- tests visuels
- prototype de reservation

### `automation/n8n-supabase`

Pour :
- schema Supabase
- workflows n8n
- memoire projet
- synchronisation Trello

### `business/finance-growth`

Pour :
- business plan
- pitch
- financement
- strategie commerciale
- acquisition coachs et clubs

## Regles simples

- `main` ne recoit que des etapes propres et valides
- une branche = un chantier principal
- les petits commits frequents sont preferables aux gros commits rares
- quand un chantier est stabilise, il peut etre fusionne vers `main`

## Usage conseille pour vous 3

- toi : `business/finance-growth`
- frere 1 : `product/mvp-spec`
- frere 2 : `automation/n8n-supabase`
- travail commun design : `design/figma-planity-like`

La branche `docs/project-foundation` peut servir a consolider les documents transverses.
