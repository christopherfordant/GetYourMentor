# Tokens actifs — maquette HTML validée

| Token partagé | Valeur | Usage |
| --- | --- | --- |
| --gym-paper | #F6F4F0 | Fond principal |
| --gym-surface | #FFFFFF | Cartes |
| --gym-ink | #141316 | Texte et surfaces foncées de la maquette |
| --gym-muted | #625E69 | Texte secondaire |
| --gym-primary | #872BBF | Accent violet |
| --gym-primary-hover | #612087 | Violet profond de la référence |
| --gym-primary-soft | #EEE4F7 | Lavande |
| --gym-line | #DEDBE3 | Bordures |
| --gym-focus | #3863F2 | Focus clavier |

L’accueil reprend les dimensions du CSS HTML validé : enveloppe 1240 px, hero texte/photo, cartes en trois colonnes puis pile mobile. Les rayons et espacements varient par famille de composants comme dans la référence ; ne pas imposer un rayon unique à tous les blocs. L’alias --purple du composant reprend --gym-primary. La palette violette est fixe ; la variante verte de comparaison est retirée de l’application.

Typographies partagées pour les pages de découverte : `--gym-font-body: Arial, Helvetica, sans-serif` ; `--gym-font-display: Impact, "Arial Narrow", Arial, sans-serif`. Valeurs identiques à la maquette et à l’accueil, sans nouvelle police distante. Titres éditoriaux en capitales ; noms de coachs dans les cartes en casse naturelle. Rayons 6 px pour les contrôles et 10 px pour les cartes de découverte. Colonnes en `minmax(0,1fr)`, réorganisation à 1100, 760 et 480 px.

Les surfaces foncées sont réservées aux zones prévues dans la maquette. Typographie de référence : pile Arial/Helvetica pour le corps, pile condensée système du CSS source pour les titres. Aucune nouvelle police téléchargée.

## Historique remplacé

# Tokens visuels — baseline Emergent

Les tokens ci-dessous sont la baseline de travail; chaque mesure précise doit être confirmée par Playwright avant promotion.

| Token | Valeur | Statut |
|---|---|---|
| `--gym-bg` | bleu nuit du thème actuel | OBSERVÉ |
| `--gym-surface` | surface bleue légèrement relevée | OBSERVÉ |
| `--gym-accent` | `#caff3d` | MESURÉ dans l'implémentation |
| `--gym-text` | blanc cassé | OBSERVÉ |
| `--gym-muted` | bleu-gris secondaire | OBSERVÉ |
| `--gym-motion-plane` | transform/opacity, sans perspective | VALIDÉ PAR LE CLIENT |

Les valeurs existantes restent la source CSS jusqu'à la prochaine campagne de mesures. Ce fichier ne remplace aucun document maître.
