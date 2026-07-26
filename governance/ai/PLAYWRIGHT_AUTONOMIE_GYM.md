# Playwright Autonomie GYM

## But

Redonner au projet une capacite d'observation visuelle autonome du site afin de :

- voir comment les pages sont rendues
- prendre des captures regulieres
- comparer desktop et mobile
- auditer rapidement les parcours critiques
- aider les futures modifications sans travailler a l'aveugle

## Mise en place actuelle

Le projet `gym-next` embarque maintenant :

- `playwright.config.ts`
- `tests/visual-audit.spec.ts`
- des scripts npm :
  - `npm run pw:audit`
  - `npm run pw:headed`
  - `npm run pw:codegen`

## Ce que fait l'audit actuel

Il visite les pages cles du MVP et genere des captures dans :

- `gym-next/playwright-artifacts/`

Pages couvertes :

- home
- recherche
- liste coachs
- fiche coach
- choix creneau
- compte
- inscription club

## Usage recommande

1. lancer un audit rapide avant une grosse refonte
2. capturer l'etat desktop et mobile
3. modifier le site
4. relancer l'audit
5. comparer les captures et corriger

## Limite honnete

Playwright permet de voir, cliquer, capturer et verifier.
Il ne remplace pas le jugement produit, design ou CTO.

## Etape suivante logique

Ajouter un audit metier :

- verification des CTA critiques
- verification des liens du tunnel
- verification des textes visibles casses
- verification du header / footer / responsive
