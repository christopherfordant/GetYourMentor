# Ressources du dépôt

- `design/` : manifestes de provenance et sources de travail non servies. Les binaires déjà présents sous `gym-next/public/design_assets/` ne doivent pas être dupliqués ici.
- `evidence/` : captures et résultats de contrôles, rangés par parcours ou sujet.

Les ressources accessibles publiquement depuis l’application restent dans `gym-next/public/design_assets/`. Ne déplacez pas ces fichiers vers ce dossier sans mettre à jour les consommateurs, reconstruire l’application et vérifier les URLs publiques.

Les chemins `file` de `design/content_library/sources.json` sont relatifs au dossier `design/content_library/` pour rester portables entre machines.

Les médias référencés par `design/content_library/sources.json` sont conservés une seule fois dans `gym-next/public/design_assets/content_library/`. Le dossier `assets/design/` conserve le manifeste de provenance ; ne dupliquez pas les binaires servis par l’application.
