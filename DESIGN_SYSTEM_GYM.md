# GetYourMentor - Design system v1

## 1. Direction

GetYourMentor doit adopter un style :
- sombre
- premium
- rassurant
- rapide a comprendre
- tres centre sur la reservation

Inspiration produit :
- logique "Planity-like"
- mais adaptee au sport, a la performance et a la confiance

Le but est de donner l'impression suivante :
- je trouve vite
- je comprends vite
- je peux reserver sans stress

## 2. Positionnement visuel

Le design ne doit pas ressembler a un site de startup abstrait ni a une app de sport agressive.

Il faut un equilibre entre :
- elegance
- credibilite
- energie

Le ton visuel doit etre :
- plus premium que "fitness low cost"
- plus dynamique qu'une plateforme de reservation beaute

## 2.1 Direction visuelle v2

Une deuxieme direction visuelle peut etre utilisee pour la maquette si vous voulez un rendu plus fort visuellement.

Cette direction garde l'esprit `Planity-like`, mais reprend certains codes d'une capture premium de type app fitness :

- composition hero plus cinematographique
- profondeur visuelle plus marquee
- couches d'ecrans ou de mockups mobiles inclines
- contrastes un peu plus forts
- sensation de mouvement plus moderne

Regle importante :

- assumer un theme sombre premium comme direction principale de la maquette
- garder le coeur de l'interface lisible, rassurant et tres scannable
- utiliser des surfaces charbon, des bordures discretes et des accents orange nets

En resume :

- inspiration de la capture pour l'energie et la mise en scene
- adaptation Planity-like pour la clarte, la confiance et la conversion

## 2.2 Motion design

La motion doit rester discrete et premium.

Animations recommandees :

- apparition progressive des cartes
- hover doux sur coach cards et CTA
- transition de page avec profondeur legere
- effet "carousel 3D" subtil entre quelques ecrans clefs

Regles :

- pas d'animation permanente envahissante
- pas de gimmick trop "gaming"
- la motion doit toujours servir la comprehension
- si le 3D complet degrade la lisibilite, reduire l'effet

## 3. Palette recommandee

### Couleurs principales

- `Background`: `#0B0D10`
- `Surface`: `#13171C`
- `Surface soft`: `#191F26`
- `Primary`: `#F3EFE8`
- `Secondary`: `#A6AFBC`
- `Accent`: `#FF8A3D`
- `Accent dark`: `#D96A24`
- `Success`: `#28B56F`
- `Border`: `#2A313B`

### Usage

- fond principal charbon profond
- cartes sombres legerement relevees
- texte principal clair
- accent orange energique pour les CTA
- vert reserve aux confirmations

## 4. Typographie recommandee

### Font UI

- `Manrope`

### Font d'accent possible

- `Newsreader` pour quelques titres premium

Regles :
- titres simples et forts
- peu de fantaisie
- tres bonne lisibilite mobile
- interface en francais par defaut
- selecteur de langue discret dans le header ou le menu compte

## 4.1 Regles contenu MVP

Pour la maquette MVP :

- tous les textes visibles sont en francais
- le selecteur de langue peut afficher `FR` actif et `EN` disponible
- les sports visibles sont limites a `Football`, `Basketball`, `Fitness`, `Sports de combat`
- aucun autre sport ne doit apparaitre dans la home, la recherche, les filtres ou les cartes coach

## 5. Style des composants

### Boutons

- grands
- rayon moyen a large
- texte tres lisible
- CTA principal plein avec couleur accent

### Champs de recherche

- aspect large, propre, respirant
- icones simples
- placeholders tres explicites

### Cartes coach

- photo visible
- infos essentielles au premier regard
- note et prix visibles
- CTA direct

### Fiche coach

- structure en blocs
- infos hierarchisees
- reservation toujours proche de l'utilisateur

## 6. Espace et rythme

- gros hero sur la home
- sections bien separees
- tres peu de bruit visuel
- ombres douces
- bordures discretes

## 6.1 Echelle d'espacement

Utiliser une echelle fixe pour garder une interface reguliere :

- `4 px`
- `8 px`
- `12 px`
- `16 px`
- `24 px`
- `32 px`
- `40 px`
- `48 px`
- `64 px`
- `80 px`

Regle :
- ne pas inventer des espacements aleatoires
- les espaces verticaux entre sections doivent etre plus grands que les espaces entre elements d'une meme carte

## 6.2 Grille et conteneurs

### Mobile

- largeur de reference : `390 px`
- marge laterale : `20 px`
- largeur de contenu : `calc(100% - 40 px)`
- grille : `4 colonnes`

### Tablette

- largeur de reference : `768 px`
- marge laterale : `32 px`
- grille : `8 colonnes`

### Desktop

- largeur de reference : `1440 px`
- conteneur max : `1200 px`
- marge laterale externe : `80 px`
- grille : `12 colonnes`

Regle :
- le contenu principal reste centre
- les blocs ne flottent jamais de facon arbitraire
- les cartes s'alignent sur la grille

## 6.3 Rythme vertical

- espace entre titre et sous-titre : `12 a 16 px`
- espace entre sous-titre et CTA ou formulaire : `24 px`
- espace entre sections majeures : `64 px` mobile, `80 px` desktop
- espace entre cartes dans une meme liste : `16 px` mobile, `24 px` desktop

## 6.4 Paddings composants

### Cartes standards

- padding mobile : `16 px`
- padding desktop : `24 px`

### Cartes hero ou reservation

- padding mobile : `20 px`
- padding desktop : `24 a 32 px`

### Inputs

- hauteur minimale : `52 px`
- padding horizontal : `16 px`

### Boutons

- hauteur minimale : `52 px`
- padding horizontal : `20 a 24 px`

## 6.5 Rayons et bordures

- rayon petits elements : `12 px`
- rayon cartes : `20 px`
- rayon hero search / blocs importants : `24 px`
- bordure standard : `1 px solid #E7DED2`

Regle :
- garder des rayons cohérents
- pas de mix entre coins tres carres et tres ronds dans un meme ecran

## 6.6 Alignement et centrage

- titres de section alignes a gauche dans les blocs de contenu
- hero centre visuellement, mais la barre de recherche reste rigoureusement alignee
- boutons d'action alignes sur la meme ligne de base quand ils sont cote a cote
- cartes d'une meme rangée avec meme hauteur visuelle si possible
- colonnes et blocs toujours relies a la meme largeur de conteneur

## 6.7 Onglets et navigation

Pour les onglets comme `Connexion / Inscription` :

- largeur egale des onglets
- hauteur uniforme
- alignement horizontal strict
- etat actif tres visible
- espace de `8 px` maximum entre onglets si separes

Pour la navigation desktop :

- logo a gauche
- liens centraux ou legerement decales a gauche
- actions compte a droite
- alignement vertical rigoureux

## 6.8 Responsive behavior

- aucune carte ne doit coller au bord de l'ecran
- aucun texte ne doit depasser sur 2 colonnes sans raison
- les blocs lateraux desktop passent sous le contenu en mobile
- les CTA principaux restent visibles sans scroller trop loin
- les listes de cartes passent de multi-colonnes a une seule colonne en mobile
- les formulaires doivent rester remplissables au pouce

## 7. Iconographie et images

- vraies photos de coachs ou scenes d'entrainement credibles
- pas d'illustrations trop generiques
- pas d'imagerie trop bodybuild ou trop extreme

## 8. Experience mobile

Le prototype doit etre pense en mobile d'abord :
- CTA fixes ou tres visibles
- cartes scannables
- etapes de reservation tres courtes
- recap toujours lisible
- espacements respirants sans gaspiller l'ecran
- alignements stricts pour eviter l'effet brouillon
- boutons et champs faciles a toucher

## 9. Ce qu'il faut eviter

- trop de couleurs
- effets futuristes inutiles
- look trop "app de running"
- look trop medical
- tunnel trop technique
- elements mal centres
- bordures incoherentes
- cartes de tailles inegales sans logique
- espaces irreguliers entre les blocs
