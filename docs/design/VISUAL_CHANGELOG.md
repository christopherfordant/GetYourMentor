# Journal des décisions visuelles

## 2026-10-10 — VIS-001

- Décision : retirer le carrousel 3D pentagonal du périmètre actif.
- Motif : le rendu demandé est une composition Emergent plane; la perspective et les rotations X/Y ajoutaient une couche visuelle non souhaitée et un risque de performance mobile.
- Impact : `GsapJourneyScene`, styles des étapes et styles de la section journey.
- Préservation : logique de parcours, contenu, scroll, nettoyage GSAP et routes inchangés.
- Preuve attendue : typecheck, build, Playwright et snapshots aux cinq viewports.
- Retour arrière : revert du commit portant `VIS-001`.
