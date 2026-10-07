# État performance mobile — 2026-10-07

## Référence validée

- Branche : `perf/route-scoped-legacy-css`
- Commit de référence : `ea39760`
- Lighthouse mobile : 79/100
- LCP : 3,7 s
- FCP : 1,3–1,4 s
- TBT : environ 420 ms
- Desktop : 99/100 sur la référence précédente

## Gains conservés

- Hero livré avec l’optimisation Next/Image : environ 16,7 Ko transférés au lieu d’environ 228 Ko.
- Plugins `Draggable` et `InertiaPlugin` chargés dynamiquement.
- Sections sous le hero chargées dynamiquement.
- CSS legacy retiré du layout global et conservé pour les routes legacy.
- Animations mobiles conservées sans modification de design.

## Diagnostic restant

- Style/Layout : environ 1,77 s.
- JavaScript initial : environ 1,13 s.
- Travail total du thread principal : environ 3,9 s.
- CSS inutilisé : environ 12 Ko.
- Reflows forcés signalés par Lighthouse.

## Expérience annulée

La désactivation globale des flous et pseudo-particules mobiles a été testée puis retirée :

- Performance : 79 → 74/100.
- TBT : environ 420 → 540 ms.
- LCP : 3,7 → 3,9 s.

Conclusion : les effets visuels ne sont pas le levier principal. La prochaine étape doit cibler les lectures de layout et l’hydratation JavaScript.

## Règle de validation

Chaque changement doit passer : typecheck, build, Lighthouse mobile et vérification des routes legacy avant push.
