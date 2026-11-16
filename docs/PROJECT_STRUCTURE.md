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
| `assets/design/` | Provenance et sources de travail non servies ; les binaires utilisés par l’application restent dans son dossier public unique. |
| `assets/evidence/` | Captures et résultats de vérification classés par parcours ou contrôle. |
| `prototype-site/` | Prototype historique utilisé comme référence par la migration ; ce n’est pas l’application déployée. |
| `prototypes/design-assets/` | Démonstrations visuelles isolées, conservées séparément du produit. |
| `gym-next/public/design_assets/` | Médias statiques servis par l’application et réutilisés par le prototype historique. |
| Racine | Documents maîtres et quelques entrées historiques conservés car leurs chemins sont référencés par les scripts et la gouvernance. |

Les anciennes sources visuelles racine et leur copie `docs/design_assets/` ont été consolidées : les binaires identiques sont conservés une seule fois sous `gym-next/public/design_assets/`, avec le manifeste de provenance sous `assets/design/`. `prototype-site/` est la référence historique canonique. `docs/prototype-site/` reste archivée temporairement dans ce lot, car son retrait complet dépasserait la limite de revue de 400 lignes ; elle n’est plus le point d’entrée documentaire ni une source active. `docs/index.html` redirige vers le prototype racine. `docs/assets/` reste réservé aux preuves.

## Matériel déplacé hors dépôt

Les plans d’affaires, devis, éléments de financement, pitch decks, stratégie commerciale, analyse concurrentielle et sondage ont été déplacés hors du dépôt. Les originaux sont conservés localement dans le dossier frère `../GetYourMentor-private/business-materials/`, avec leurs noms et sous-dossiers. `delivery-private/` a également été archivé intact dans le dossier privé frère. Ces archives ne sont ni suivies ni requises pour construire l’application.

Les anciennes extractions texte correspondantes ont été retirées de `project_readable/`. Son générateur ne parcourt désormais que les fichiers suivis par Git : les pièces locales ignorées ou non suivies ne peuvent donc pas se retrouver accidentellement dans l’index ou les pages de consultation.

## Limites et prochaines décisions

- L’historique Git antérieur peut encore contenir les anciennes versions des documents ; ce changement nettoie le contenu courant de la branche et ne réécrit pas l’historique partagé.
- Plusieurs notes techniques historiques citent encore les sources déplacées pour expliquer une décision passée. Ces références restent des traces historiques, pas des liens vers des fichiers disponibles dans un clone.
- Les documents maîtres à la racine restent là pour éviter de casser les consommateurs existants. Tout autre déplacement doit d’abord cartographier les références, adapter les consommateurs dans le même changement, puis vérifier les tests concernés.
- Les artefacts locaux créés par certains anciens scripts peuvent continuer à utiliser le chemin ignoré `delivery-private/`. Les anciens artefacts ont été archivés hors dépôt ; une exécution future peut recréer un dossier local ignoré à cet emplacement.
- Les brouillons, captures et fichiers non suivis préexistants n’ont pas été triés ni déplacés dans ce lot. Ils doivent être examinés par propriétaire avant toute suppression ou reclassement.
