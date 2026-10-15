## 2026-10-15 — Déclinaison éditoriale de la découverte

Recherche, annuaire et fiche : cadre/header/footer communs, typographies de l’accueil, palette fixe, cartes et colonnes responsive. Injections CSS héritées et profils de secours synthétiques retirés ; données du catalogue préservées. Préférences cookies et retour en haut après le footer, planning mobile complet, chargement/erreur et discipline inconnue traités. Pas de nouvelle dépendance, d’activation Premium ou de changement métier financier. Preuves, contrôles et rollback : `docs/REFONTE_DECOUVERTE_EDITORIALE_2026-10-15.md`.

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
# 15 octobre 2026 — palette fixe de l’accueil

Retrait du bouton de comparaison verte, de son état React et des règles CSS associées, conformément à la dernière instruction utilisateur. Violet validé conservé ; aucune modification du prototype original, des routes ou du métier. Contrats actifs et recette alignés. Audit des divergences et phases : `docs/AUDIT_ECARTS_REFONTE_2026-10-15.md`.
