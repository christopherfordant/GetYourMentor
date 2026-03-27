# GetYourMentor - Strategie de branches

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
