# Controle des Routes MVP GYM

## But

Disposer d'un point de controle unique pour les pages critiques du MVP, leur source prototype, leur user story, leur etat de migration et la prochaine verification utile.

## Regle

Avant toute modification importante d'une page du tunnel ou d'un dashboard, relire sa ligne dans ce tableau.

## Tableau de controle

| Priorite | Route Next.js | Prototype de reference | User stories | Etat actuel | Prochaine verification utile |
| --- | --- | --- | --- | --- | --- |
| Critique | `/` | `prototype-site/accueil.html` | `US-SPORTIF-01`, `US-SPORTIF-02` | Route presente dans `gym-next/app/page.tsx` | verifier les CTA et les liens vers la recherche |
| Critique | `/recherche` | `prototype-site/recherche-coachs.html` | `US-SPORTIF-02` | Route presente dans `gym-next/app/recherche/page.tsx` | verifier les filtres, le maillage et l'arrivee depuis la home |
| Critique | `/coachs` | `prototype-site/selection-coachs.html` | `US-SPORTIF-03` | Route presente dans `gym-next/app/coachs/page.tsx` | verifier la logique de comparaison et les liens vers la fiche coach |
| Critique | `/coach` | `prototype-site/reserver-seance.html` | `US-SPORTIF-04`, `US-SPORTIF-05`, `US-COACH-02` | Route presente dans `gym-next/app/coach/page.tsx` | verifier photo, note, sticky, onglets et CTA reserver |
| Critique | `/creneau` | `prototype-site/choix-coach-creneau.html` | `US-SPORTIF-05` | Route presente dans `gym-next/app/creneau/page.tsx` | verifier le passage depuis la fiche coach et la lisibilite du planning |
| Critique | `/recapitulatif` | `prototype-site/reservation-recapitulatif.html` | `US-SPORTIF-06` | Route presente dans `gym-next/app/recapitulatif/page.tsx` | verifier la conservation du contexte de reservation |
| Critique | `/paiement` | `prototype-site/paiement.html` | `US-SPORTIF-08` | Route presente dans `gym-next/app/paiement/page.tsx` | verifier l'entree depuis recapitulatif et la clarte du paiement |
| Haute | `/compte` | `prototype-site/compte.html` | `US-SPORTIF-07`, `US-COACH-01`, `US-CLUB-01` | Route presente dans `gym-next/app/compte/page.tsx` | verifier les bifurcations sportif, coach et club |
| Haute | `/inscription-club` | `prototype-site/inscription-club.html` | `US-CLUB-01` | Route presente dans `gym-next/app/inscription-club/page.tsx` | verifier le parcours club dedie et les assets visuels |

## Sequence de verification recommandee

1. `/coach`
2. `/creneau`
3. `/recapitulatif`
4. `/paiement`
5. `/recherche`
6. `/coachs`
7. `/`
8. `/compte`
9. `/inscription-club`

## Regles de decision

- si une route critique est incoherente, on stoppe les retouches secondaires
- si un lien metier est casse entre deux routes critiques, la correction passe avant le design de confort
- si une page Next n'est plus fidele a son prototype alors que la consigne impose la fidelite, il faut corriger avant d'etendre le scope
