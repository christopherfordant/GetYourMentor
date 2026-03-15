# GetYourMentor - Spec responsive et layout

## 1. Objectif

Garantir que la maquette Figma soit :
- propre
- reguliere
- bien alignee
- responsive
- exploitable plus tard en integration

## 2. Breakpoints

- `Mobile S` : `360 px`
- `Mobile reference` : `390 px`
- `Tablet` : `768 px`
- `Desktop` : `1440 px`

## 3. Largeurs et marges

### Mobile

- marge gauche : `20 px`
- marge droite : `20 px`
- largeur contenu utile : `100% - 40 px`

### Tablet

- marge gauche : `32 px`
- marge droite : `32 px`

### Desktop

- conteneur max : `1200 px`
- contenu centre horizontalement
- marge externe cible : `80 px`

## 4. Grille

### Mobile

- `4 colonnes`
- gouttieres : `12 px`

### Tablet

- `8 colonnes`
- gouttieres : `16 px`

### Desktop

- `12 colonnes`
- gouttieres : `24 px`

## 5. Regles d'alignement

- tous les titres de section s'alignent sur la meme colonne de depart
- les cartes d'une meme liste utilisent le meme padding
- les boutons primaires sont toujours alignes avec le contenu qu'ils commandent
- les blocs lateraux type reservation s'alignent au haut de la section principale
- les listes passent en une colonne sur mobile

## 6. Espacements

### Entre petits elements

- `8 px`
- `12 px`
- `16 px`

### Entre blocs moyens

- `24 px`
- `32 px`

### Entre sections majeures

- `64 px` mobile
- `80 px` desktop

## 7. Composants

### Boutons

- hauteur min : `52 px`
- rayon : `16 px`
- padding horizontal : `20 px`

### Inputs

- hauteur min : `52 px`
- rayon : `16 px`
- padding horizontal : `16 px`

### Cartes

- padding mobile : `16 px`
- padding desktop : `24 px`
- rayon : `20 px`

### Blocs de reservation

- padding mobile : `20 px`
- padding desktop : `24 a 32 px`
- rayon : `24 px`

## 8. Header

### Mobile

- logo aligne a gauche
- action principale a droite ou menu
- hauteur confortable

### Desktop

- logo a gauche
- navigation centre-gauche
- connexion / inscription a droite
- alignement vertical parfait

## 9. Onglets

Les onglets doivent :
- avoir la meme largeur visuelle
- etre centres dans leur conteneur
- avoir une hauteur identique
- avoir un etat actif net
- conserver `8 px` ou moins entre eux

## 10. Bloc hero

- titre limite a une largeur lisible
- sous-titre limite a une largeur encore plus courte
- barre de recherche centree
- CTA immediatement visible
- aucun element ne doit sembler "flottant"

## 11. Resultats de recherche

### Mobile

- une carte par ligne
- infos principales visibles sans ouvrir la fiche

### Desktop

- 2 a 3 cartes par ligne selon la largeur retenue
- grille reguliere
- filtres clairement separes de la liste

## 12. Fiche coach

### Mobile

- photo
- infos cle
- CTA
- sections en pile

### Desktop

- contenu principal a gauche
- carte reservation sticky a droite
- alignement haut commun

## 13. Tunnel de reservation

- etapes courtes
- recap toujours visible
- CTA final tres clair
- formulaires jamais trop etroits
- aucun scroll inutile entre recap et action

## 14. Ce qu'il faut verifier dans Figma

- marges laterales identiques
- cartes alignees sur la grille
- hauteurs visuelles cohérentes
- rayons cohérents
- boutons a la meme hauteur
- textes bien centres ou bien alignes selon le contexte
- comportement mobile lisible sans zoom

