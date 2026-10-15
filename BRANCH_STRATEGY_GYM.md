# GetYourMentor - Strategie de branches

## Procedure obligatoire a chaque demande   15 octobre 2026

Cette procedure s'applique a chaque nouveau prompt concernant GetYourMentor, avant les travaux et avant la reponse finale. Une mise a jour interm diaire peut  tre envoy e imm diatement.

1. Lire `AGENTS.md`, cette procedure, `DOCUMENT_MAITRE_GYM.md`, `docs/README.md`, l'etat de reprise `docs/REFONTE_PROGRESSIVE_2026-10-15.md` et les contrats pertinents pour la demande. Consulter les decisions recentes et appliquer les instructions utilisateur les plus recentes.
2. Verifier le depot, la branche active, les worktrees, les modifications indexees/non indexees, le distant et l'upstream. Lire `BRANCH_STRATEGY_GYM.md`. Choisir une branche correspondant au chantier ; ne pas pousser automatiquement sur `main` ni recopier le travail sur plusieurs branches. Pour la refonte actuelle, poursuivre `design/refonte-progressive-lot1` ; sa documentation et ses preuves restent avec le code du lot. Les anciens noms de branches dans les relais sont historiques : verifier Git.
3. Preserver et identifier les modifications anterieures. Realiser des lots cibl's, verifier les changements et mettre a jour les documents canoniques et la reprise. Ne pas ajouter tout le depot ni publier des secrets, donnees personnelles ou fichiers temporaires.
4. Avant chaque reponse finale de livraison, commiter le travail valide de la demande et le pousser sur la branche appropriee. Au debut de la demande suivante, verifier  galement que les commits livrables precedents sont synchronis's. Un  change sans modification n'exige pas de commit vide. Les modifications anterieures non verifi es ne sont pas automatiquement livrables.
5. Verifier le succ s du push et comparer le SHA local avec la reference distante. Rapporter la branche, le commit, les verifications et les eventuels changements restant locaux. Ne jamais annoncer   pouss'   sans preuve distante.
6. Si une verification, un conflit ou l'acces au distant bloque, preserver le travail, expliquer precisement le blocage et demander uniquement l'intervention indispensable. Ne pas forcer le push, desactiver les contr les ou pretendre la livraison termin e.

Cette autorisation concerne les commits et pushes cibl's. Elle n'autorise ni fusion, ni force-push, ni deploiement en production. Verifier les declencheurs CI/CD avant de changer de branche ou de cible distante ; conserver l'isolation de demonstration. Le push de code et le deploiement sont deux etats distincts.


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
