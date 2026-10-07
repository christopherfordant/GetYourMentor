# Architecture mobile de la homepage

## Branches

- `v2/render-migration` : base visuelle stable.
- `feat/mobile-home-architecture` : extraction des sections sous le hero.
- `perf/mobile-bundle-split` : réduction du JavaScript initial et séparation GSAP.

## Ordre d’exécution

1. Mesurer la homepage production avant chaque étape.
2. Extraire une seule section indépendante à la fois.
3. Vérifier le typecheck, le build et le rendu mobile.
4. Mesurer Lighthouse mobile et desktop.
5. Pousser un commit atomique sur la branche concernée.
6. Fusionner uniquement après validation visuelle et fonctionnelle.

## Découpage prévu

- Hero et recherche : chargement initial prioritaire.
- Rail des disciplines : composant indépendant, images différées.
- Expériences : carrousel isolé, GSAP chargé à la demande.
- Parcours : interaction Draggable isolée.
- Métriques, recrutement, villes et FAQ : sections sous le viewport, chargement différé.
- Footer : rendu statique, sans animation.

## Garde-fous

- Aucun texte, lien, couleur ou fonctionnalité supprimé.
- Aucun secret dans le dépôt.
- Aucun chargement dynamique ne doit empêcher l’affichage du hero.
- Chaque branche doit rester compilable seule.
- Retour possible vers `v2/render-migration` à tout moment.
