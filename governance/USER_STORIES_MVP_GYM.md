# User Stories MVP GYM

## Cadre

Ces user stories derivent du document maitre, du MVP, des ecrans prioritaires et du tunnel de reservation valide.
Elles servent aussi a proteger le fil rouge et a encadrer les decisions produit du MVP.

Regle :

- toute evolution importante doit pouvoir se rattacher a au moins une user story
- toute user story critique doit pointer vers une page ou un tunnel reel
- toute demande hors user stories MVP doit etre signalee comme idee V2/V3 ou exception assume

## Stories coeur eleve / sportif

### US-SPORTIF-01

En tant que sportif, je veux comprendre rapidement la promesse de GetYourMentor depuis la home afin de savoir si la plateforme correspond a mon besoin.

Pages :

- `/`

### US-SPORTIF-02

En tant que sportif, je veux rechercher un coach par sport et ville afin de trouver une offre pertinente sans friction.

Pages :

- `/`
- `/recherche`
- `/coachs`

### US-SPORTIF-03

En tant que sportif, je veux comparer plusieurs coachs sur une liste claire afin de choisir celui qui m'inspire le plus confiance.

Pages :

- `/coachs`

### US-SPORTIF-04

En tant que sportif, je veux consulter une fiche coach rassurante afin de comprendre son niveau, ses preuves de confiance et le contenu de la seance.

Pages :

- `/coach`

### US-SPORTIF-05

En tant que sportif, je veux choisir un creneau simplement afin de transformer mon intention en reservation concrete.

Pages :

- `/coach`
- `/creneau`

### US-SPORTIF-06

En tant que sportif, je veux valider un recapitulatif lisible afin de verifier ma demande avant identification et paiement.

Pages :

- `/recapitulatif`

### US-SPORTIF-07

En tant que sportif, je veux m'identifier ou creer mon compte au bon moment afin de finaliser ma reservation sans perdre mon contexte.

Pages :

- `/compte`

### US-SPORTIF-08

En tant que sportif, je veux payer dans un cadre clair afin de finaliser ma reservation en confiance.

Pages :

- `/paiement`

## Stories coach

### US-COACH-01

En tant que coach, je veux acceder a un espace compte simple afin de voir mes seances, mes messages et mes revenus.

Pages :

- `/compte?mode=coach`

### US-COACH-02

En tant que coach, je veux que ma fiche publique valorise ma credibilite afin d'augmenter la conversion reservation.

Pages :

- `/coach`

## Stories club / structure

### US-CLUB-01

En tant que club ou structure, je veux pouvoir m'inscrire avec un parcours dedie afin d'affilier des coachs et structurer mon offre.

Pages :

- `/inscription-club`
- `/compte?mode=club`

## Regles de priorite

- les stories sportif priment sur les idees secondaires tant que le tunnel MVP n'est pas impeccable
- les stories coach et club ne doivent pas detruire la simplicite du tunnel sportif
- toute fonctionnalite non rattachee a une story ci-dessus doit etre revue avant implementation
- toute evolution qui s'eloigne du document maitre ou du fil rouge doit etre recadree avant execution
