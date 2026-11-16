# Organisation du dépôt GetYourMentor

Mis à jour le 16 novembre 2026 pour préparer la revue d’architecture.

## Structure de référence

| Emplacement | Rôle |
|---|---|
| `gym-next/` | Application Next.js, interfaces, parcours et tests applicatifs. |
| `supabase/` | Schémas, migrations et contrôles SQL du projet. |
| `governance/` | Décisions, règles de travail, traçabilité et documents de gouvernance. |
| `tools/` | Outils locaux, Kanban versionné, vérifications et scripts de maintenance. |
| `scripts/` | Commandes de dépôt et génération documentaire. |
| `docs/` | Architecture, procédures, preuves et comptes rendus. |
| `assets/design/` | Sources visuelles et images de travail non servies directement par l’application. |
| `assets/evidence/` | Captures et résultats de vérification classés par parcours ou contrôle. |
| `prototypes/` et `gym-next/public/design_assets/` | Démonstrations visuelles ; ne pas les confondre avec le code produit actif. |
| Racine | Documents maîtres et quelques entrées historiques conservés car leurs chemins sont référencés par les scripts et la gouvernance. |

Les deux anciens dossiers racine `design_assets/` et `assets/` ont été regroupés sous `assets/`, respectivement dans `assets/design/` et `assets/evidence/`. Les chemins `gym-next/public/design_assets/` restent séparés : ils contiennent les médias effectivement servis par le site et leurs URLs publiques ne doivent pas être remplacées par les chemins des sources de travail. Le manifeste `assets/design/content_library/sources.json` utilise des chemins relatifs afin de rester portable entre clones.

## Matériel déplacé hors dépôt

Les plans d’affaires, devis, éléments de financement, pitch decks, stratégie commerciale, analyse concurrentielle et sondage ont été déplacés hors du dépôt. Les originaux sont conservés localement dans le dossier frère `../GetYourMentor-private/business-materials/`, avec leurs noms et sous-dossiers. `delivery-private/` a également été archivé intact dans le dossier privé frère. Ces archives ne sont ni suivies ni requises pour construire l’application.

Les anciennes extractions texte correspondantes ont été retirées de `project_readable/`. Son générateur ne parcourt désormais que les fichiers suivis par Git : les pièces locales ignorées ou non suivies ne peuvent donc pas se retrouver accidentellement dans l’index ou les pages de consultation.

## Limites et prochaines décisions

- L’historique Git antérieur peut encore contenir les anciennes versions des documents ; ce changement nettoie le contenu courant de la branche et ne réécrit pas l’historique partagé.
- Plusieurs notes techniques historiques citent encore les sources déplacées pour expliquer une décision passée. Ces références restent des traces historiques, pas des liens vers des fichiers disponibles dans un clone.
- Les documents maîtres à la racine restent là pour éviter de casser les consommateurs existants. Tout autre déplacement doit d’abord cartographier les références, adapter les consommateurs dans le même changement, puis vérifier les tests concernés.
- Les artefacts locaux créés par certains anciens scripts peuvent continuer à utiliser le chemin ignoré `delivery-private/`. Les anciens artefacts ont été archivés hors dépôt ; une exécution future peut recréer un dossier local ignoré à cet emplacement.
- Les brouillons, captures et fichiers non suivis préexistants n’ont pas été triés ni déplacés dans ce lot. Ils doivent être examinés par propriétaire avant toute suppression ou reclassement.
