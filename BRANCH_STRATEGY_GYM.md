# GetYourMentor - Strategie de branches

## Proc?dure obligatoire ? chaque demande ? 15 octobre 2026

Cette proc?dure s?applique ? chaque nouveau prompt concernant GetYourMentor, avant les travaux et avant la r?ponse finale. Une mise ? jour interm?diaire peut ?tre envoy?e imm?diatement.

1. Lire `AGENTS.md`, cette proc?dure, `DOCUMENT_MAITRE_GYM.md`, `docs/README.md`, l??tat de reprise `docs/REFONTE_PROGRESSIVE_2026-10-15.md` et les contrats pertinents pour la demande. Consulter les d?cisions r?centes et appliquer les instructions utilisateur les plus r?centes.
2. V?rifier le d?p?t, la branche active, les worktrees, les modifications index?es/non index?es, le distant et l?upstream. Lire `BRANCH_STRATEGY_GYM.md`. Choisir une branche correspondant au chantier ; ne pas pousser automatiquement sur `main` ni recopier le travail sur plusieurs branches. Pour la refonte actuelle, poursuivre `design/refonte-progressive-lot1` ; sa documentation et ses preuves restent avec le code du lot. Les anciens noms de branches dans les relais sont historiques : v?rifier Git.
3. Pr?server et identifier les modifications ant?rieures. R?aliser des lots cibl?s, v?rifier les changements et mettre ? jour les documents canoniques et la reprise. Ne pas ajouter tout le d?p?t ni publier des secrets, donn?es personnelles ou fichiers temporaires.
4. Avant chaque r?ponse finale de livraison, commiter le travail valid? de la demande et le pousser sur la branche appropri?e. Au d?but de la demande suivante, v?rifier ?galement que les commits livrables pr?c?dents sont synchronis?s. Un ?change sans modification n?exige pas de commit vide. Les modifications ant?rieures non v?rifi?es ne sont pas automatiquement livrables.
5. V?rifier le succ?s du push et comparer le SHA local avec la r?f?rence distante. Rapporter la branche, le commit, les v?rifications et les ?ventuels changements restant locaux. Ne jamais annoncer ? pouss? ? sans preuve distante.
6. Si une v?rification, un conflit ou l?acc?s au distant bloque, pr?server le travail, expliquer pr?cis?ment le blocage et demander uniquement l?intervention indispensable. Ne pas forcer le push, d?sactiver les contr?les ou pr?tendre la livraison termin?e.

Cette autorisation concerne les commits et pushes cibl?s. Elle n?autorise ni fusion, ni force-push, ni d?ploiement en production. V?rifier les d?clencheurs CI/CD avant de changer de branche ou de cible distante ; conserver l?isolation de d?monstration. Le push de code et le d?ploiement sont deux ?tats distincts.


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
