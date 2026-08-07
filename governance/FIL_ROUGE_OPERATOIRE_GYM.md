# Fil Rouge Operatoire GYM

## Vision

Construire une plateforme web premium de coaching individuel sportif qui permet de trouver, rassurer, reserver, payer et suivre, avec un MVP simple, credible et rentable.

## Contraintes structurantes

- web d'abord, pas mobile native en phase 1
- francais par defaut
- 4 sports visibles au MVP :
  - football
  - basketball
  - fitness
  - sports de combat
- logique d'usage de type Planity-like :
  - recherche simple
  - fiche lisible
  - confiance immediate
  - reservation rapide
  - friction minimale

## Regles de non-derive

- ne pas ajouter de complexite club qui casse le MVP
- ne pas migrer tout le prototype d'un coup
- ne pas faire du RAG sans hierarchie des sources
- ne pas melanger idees V2/V3 avec decisions MVP
- ne pas sacrifier la coherence documentaire au profit de la vitesse

## Axes de qualite obligatoires

- clarte produit
- lisibilite mobile
- coherence design
- SEO technique et semantique
- maintenabilite du code
- traçabilite des decisions
- alignement documentation / implementation

## Pages et parcours les plus sensibles

- home
- recherche coachs
- selection coachs
- fiche coach
- reservation / choix creneau
- recapitulatif
- compte
- paiement
- inscription club

## Arbitrage permanent

Toujours preferer :

- coherence > vitesse
- decoupage > confusion
- fil rouge > demande isolee
- qualite percue > accumulation de fonctions
- source prioritaire > historique contradictoire

## Controle avant push

Avant chaque push Git :

- reprendre `DOCUMENT_MAITRE_GYM.md`
- reprendre ce fichier `FIL_ROUGE_OPERATOIRE_GYM.md`
- lancer `scripts/pre_push_fil_rouge_check.ps1`
- verifier que le rapport reste `CONFORME`

Regle stricte :

- pas de push si une modification importante du code n'est pas reliee au MVP, au tunnel de reservation, a la migration progressive Next.js ou a une mise a jour de gouvernance coherente
- pas de push si une derive V2/V3 ou une complexite club non MVP est detectee

## Validations groupees

Quand l'utilisateur doit faire beaucoup d'actions manuelles dans le systeme ou le terminal, il est autorise de les faire par **lots coherents** plutot qu'une par une.

Cadre obligatoire :

- un lot = un seul objectif clair
- pas de melange entre plusieurs sujets metier sans relecture intermediaire
- apres chaque lot, relecture obligatoire de `DOCUMENT_MAITRE_GYM.md`
- apres chaque lot, relecture obligatoire de ce fil rouge
- apres chaque lot, verification superviseur avant de continuer
- objectif d'exploitation : tendre vers `1 validation manuelle par heure` maximum quand la couche systeme et les outils le permettent
- tout ce qui peut etre automatise sans contourner un consentement protege doit l'etre

Signal d'arret :

- si un lot cree une ambiguite
- si un lot touche plusieurs zones du produit sans justification unique
- si un lot risque de casser le MVP, la migration Next.js ou les liens metier

alors on arrete le flux, on recadre, puis on repart sur un nouveau lot.
