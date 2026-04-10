# Migration Next.js - GetYourMentor

## But

Migrer le prototype HTML vers `React + Next.js` **page par page** sans perdre :

- la logique metier validee
- les parcours MVP
- les contenus approuves
- les arbitrages du document maitre

Le prototype actuel dans `prototype-site/` reste la reference visuelle et metier tant qu'une page Next equivalente n'est pas :

1. construite
2. comparee au prototype
3. validee

## Regle de migration

Une seule mission a la fois :

1. choisir une page source
2. relever ses regles metier
3. la reconstruire dans `gym-next/`
4. verifier l'equivalence
5. valider avant de passer a la suivante

## Ordre conseille

1. `accueil.html`
2. `recherche-coachs.html`
3. `selection-coachs.html`
4. `reserver-seance.html`
5. `choix-coach-creneau.html`
6. `recapitulatif-reservation.html`
7. `compte.html`
8. `paiement.html`
9. `inscription-club.html`

## Regle d'arbitrage

Si un doute existe entre :

- le code HTML actuel
- une ancienne consigne
- une interpretation de design

alors la priorite reste :

1. `DOCUMENT_MAITRE_GYM.md`
2. les sources MVP prioritaires
3. le prototype HTML valide le plus recent

## Etat

- Base Next.js creee : `oui`
- Migration de page commencee : `oui`
- Pages migrees : `accueil.html`, `recherche-coachs.html`, `selection-coachs.html`, `reserver-seance.html`, `choix-coach-creneau.html`, `recapitulatif-reservation.html`, `compte.html`, `paiement.html`, `inscription-club.html`
- Page en cours : `aucune`
