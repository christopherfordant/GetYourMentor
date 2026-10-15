## 2026-10-15 — Validation intégrale de la maquette HTML

Référence prioritaire : maquette/index.html de l’audit du 15 octobre, CSS et JavaScript inclus. L’accueil est reconstruit à partir de sa composition complète. Contrat, tokens, design system et recette actualisés ; les anciennes consignes « entièrement clair » et Emergent deviennent historiques.

Adaptations : recherche et disciplines réelles, accès au compte conservé sur mobile, langue dans le footer, liens légaux et FAQ existante. Offres et modules futurs restent descriptifs, sans achat ni activation Premium. Détails, matrice exhaustive et preuves : docs/REFONTE_PROGRESSIVE_2026-10-15.md.

# Journal des décisions visuelles

## 2026-10-10 — VIS-001

- Décision : retirer le carrousel 3D pentagonal du périmètre actif.
- Motif : le rendu demandé est une composition Emergent plane; la perspective et les rotations X/Y ajoutaient une couche visuelle non souhaitée et un risque de performance mobile.
- Impact : `GsapJourneyScene`, styles des étapes et styles de la section journey.
- Préservation : logique de parcours, contenu, scroll, nettoyage GSAP et routes inchangés.
- Preuve attendue : typecheck, build, Playwright et snapshots aux cinq viewports.
- Retour arrière : revert du commit portant `VIS-001`.
