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

### Comparaison et preuves proportionnées — 22 octobre 2026

Pour un lot modifiant l'interface, choisir les routes et états concernés, avec les largeurs contractuelles 320/390/768/1440 px. Comparer avant/après et référence autorisée avec viewport, données synthétiques, état cookies, polices chargées et environnement identifiés. Signaler toute différence de conditions ; une capture seule ne prouve ni identité parfaite ni fonctionnement du parcours. Ne pas renouveler une campagne complète si seuls des contrôles ciblés ont été invalidés.

Contrôler aussi clavier/focus, états interactifs, débordements, navigation et accès complet au footer selon le [socle Opquast](../../docs/OPQUAST_SOCLE_2026-10-20.md). Distinguer Playwright MCP et local, réponses injectées, parcours persistés et services distants réellement validés. Conserver uniquement des preuves sans données personnelles ni secrets.

Le rapport indique écarts corrigés, différences restantes, tests et limites. Une amélioration de performance doit être mesurée dans des conditions comparables ; sinon la déclarer non mesurée. Réutiliser les preuves encore valides. Ces critères précisent la recette existante, sans lancer automatiquement le cycle d'orchestration historique ni imposer REA. Ressources : [BRANCH_STRATEGY_GYM.md](../../BRANCH_STRATEGY_GYM.md).

Playwright permet de voir, cliquer, capturer et verifier.
Il ne remplace pas le jugement produit, design ou CTO.

## Etape suivante logique

Ajouter un audit metier :

- verification des CTA critiques
- verification des liens du tunnel
- verification des textes visibles casses
- verification du header / footer / responsive
