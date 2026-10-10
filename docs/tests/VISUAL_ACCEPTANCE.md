# Validation visuelle

## Viewports obligatoires

- 390 × 844
- 430 × 932
- 768 × 1024
- 1280 × 800
- 1440 × 900

## États obligatoires

- chargement stabilisé en haut de page;
- header initial et après scroll;
- menu langue fermé/ouvert/sélection/Échap/clic extérieur;
- hero initial, champs et CTA;
- parcours animé avant, pendant et après révélation;
- reduced-motion;
- absence de débordement horizontal;
- un seul header et un seul footer.

## Critères bloquants

- erreur console non expliquée;
- route ou interaction métier cassée;
- clic intercepté par un wrapper décoratif;
- débordement horizontal mobile;
- transformation 3D du parcours;
- snapshot pris avec `scrollY` non nul quand l'état initial est requis.
