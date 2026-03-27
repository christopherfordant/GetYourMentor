# GetYourMentor - Voir la maquette dans Figma pas a pas

## Ce qu'on a maintenant

Tu n'as pas encore un fichier `.fig` final deja dessine.

Tu as maintenant un **pack complet pour le generer dans Figma Make** :

- [FIGMA_MAKE_READY_GYM.md](c:\Users\cashe\Documents\GetYourMentor\FIGMA_MAKE_READY_GYM.md)
- [FIGMA_MAKE_MOTION_GYM.md](c:\Users\cashe\Documents\GetYourMentor\FIGMA_MAKE_MOTION_GYM.md)
- [DESIGN_SYSTEM_GYM.md](c:\Users\cashe\Documents\GetYourMentor\DESIGN_SYSTEM_GYM.md)
- [RESPONSIVE_LAYOUT_GYM.md](c:\Users\cashe\Documents\GetYourMentor\RESPONSIVE_LAYOUT_GYM.md)

## Ce qu'il faut faire exactement

### 1. Ouvrir Figma Make

Dans Figma :

1. va dans `Drafts`
2. en haut a droite, clique sur `Make`
3. cree un nouveau fichier

### 2. Ajouter le contexte

Dans la zone de prompt :

1. clique sur `Add context`
2. choisis `Upload from computer`
3. ajoute ces fichiers texte :
   - `FIGMA_MAKE_READY_GYM.md`
   - `FIGMA_MAKE_MOTION_GYM.md`

Si tu veux coller aussi la capture d'ecran comme reference de style :

1. clique encore sur `Add context`
2. choisis `Upload from computer`
3. ajoute l'image de reference

## 3. Premier prompt a envoyer

Dans le chat Figma Make :

1. ouvre [FIGMA_MAKE_READY_GYM.md](c:\Users\cashe\Documents\GetYourMentor\FIGMA_MAKE_READY_GYM.md)
2. copie tout le bloc `Prompt principal a coller dans Figma Make`
3. colle-le dans le chat
4. en dessous, ajoute cette ligne :

```text
Use the attached screenshot as style inspiration only. Keep the final product more Planity-like, lighter, cleaner, and more booking-oriented.
```

5. envoie

### 4. Deuxieme prompt a envoyer

Une fois la premiere generation terminee :

1. ouvre [FIGMA_MAKE_MOTION_GYM.md](c:\Users\cashe\Documents\GetYourMentor\FIGMA_MAKE_MOTION_GYM.md)
2. copie le bloc `Prompt a coller apres le prompt principal`
3. colle-le dans le chat
4. envoie

### 5. Voir la maquette

Quand Figma Make a fini de generer :

1. regarde la preview interactive a droite
2. clique sur `Mobile Preview` en haut pour voir la version mobile
3. clique sur `Open preview in a new tab` pour la voir en grand

## 6. Si tu veux la voir comme un vrai prototype partageable

Dans la preview plein ecran :

1. clique sur `Share`
2. copie le lien
3. ouvre-le dans un autre onglet ou sur mobile

## 7. Si tu veux la recuperer dans Figma Design

Quand le rendu te plait :

1. va sur l'ecran que tu veux dans la preview
2. utilise la fonction `Copy design`
3. colle les layers dans un fichier `Figma Design`
4. refais la meme chose ecran par ecran

## 8. Ordre recommande

Genere d'abord :

1. `Home`
2. `Search Results`
3. `Coach Profile`

Ensuite demande :

1. `Session Choice`
2. `Preferred Timeslot Selection`
3. `Booking Request Review`

Puis termine avec :

1. `Request Sent`
2. `Coach Dashboard`

## 9. Important sur l'animation

Pour etre transparent :

- `Figma Make` peut mieux simuler un effet de transition 3D car il genere une preview web interactive
- `Figma Prototype` classique sait tres bien faire du `Smart animate`
- mais un vrai effet de pages tournant autour d'un axe est plus naturel dans `Make` ou en code que dans le prototype Figma classique

Donc le meilleur chemin pour toi est :

1. voir la maquette dans `Figma Make`
2. valider le style et la motion
3. seulement ensuite copier certaines vues vers `Figma Design`
