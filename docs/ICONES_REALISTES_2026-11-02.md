# Équipements réalistes du header — reprise du 2 novembre 2026

## Demande et périmètre

Remplacer les petits pictogrammes par des objets sportifs visuellement proches du réel. Travail préparé le 30 octobre puis interrompu ; reprise et contrôles le 2 novembre. Base locale `09f0f7766f6a693dd5edfaf7a6b3b68d44141815`, branche de livraison `design/refonte-progressive-lot1`. Checkout isolé `C:/Users/cashe/Documents/GYM-realistic-header-20261030`. Les vingt fichiers suivis antérieurement modifiés sont exclus du lot.

Sources : procédure/hiérarchie BRANCH_STRATEGY, AGENTS, préambules maître/index/refonte, reprise courante, contrat Factory et rapport ANIMATIONS_LUDIQUES ; composants actuels du header et bibliothèque motion. Lecture progressive : aucun PDF ou service externe annoncé réaudité.

## Réalisation

- Onze détourages RGBA, 144 × 144 pixels, réutilisés dans les quatorze disciplines. Affichage 40 px sur ordinateur et 36 px sur mobile, contre 18 px pour les anciens SVG. Pas de modification du texte ou des destinations.
- Dix visuels préexistants réutilisés : football, basketball, haltère, patte d'ours, gant de boxe, protections de tibia, élastique, cône, kettlebell, chaussures. Certaines disciplines partagent un équipement pertinent ; il ne s'agit pas de quatorze photographies distinctes. La provenance initiale des dix originaux n'est pas réattestée dans ce lot.
- Raquette de padel générée avec l'outil intégré image_gen, fond transparent, apparence photographique. Il s'agit d'un visuel généré, pas d'une photo prise sur un terrain. Original conservé sans remplacement ; aucun outil/API CLI ni clé privée utilisés.
- Dérivés WebP avec alpha, 69 814 octets au total. Originaux préexistants préservés, PNG padel également archivé. Le header charge uniquement les petits WebP. Dimensions réservées, images décoratives sans ajout au nom accessible des liens.
- Animations existantes transférées aux images : rebond, impulsion, oscillation et rotation. Focus, clics, mobile et mouvement réduit conservés. Aucun réglage Windows modifié.

Assets : `gym-next/public/design_assets/header-equipment-2026-10-30/`. Le manifeste contient sources, dimensions, tailles et SHA256. Un aperçu autonome `apercu.html` réutilise ces mêmes images et le CSS du header. Il présente uniquement les sports, sans simuler le reste du site. Préférence de mouvement réduit respectée par défaut ; activation volontaire possible dans cet aperçu uniquement.

## Prompt du nouvel asset

Compétence imagegen, mode outil intégré, génération neuve ; l'original est `padel-racket-original.png`.

```text
Use case: product-mockup. Create one photorealistic studio product photograph of a single unbranded padel racket, isolated on a truly transparent background, no text or logos. For a small sports website navigation thumbnail. Entire racket visible, diagonally from bottom-left handle to upper-right head, compact centered composition filling 88% of square canvas. Correct solid perforated padel face with round holes (NOT a tennis string bed), realistic dark graphite carbon fiber texture, subtle orange trim, textured black grip, actual believable materials and proportions, soft studio light with bright edge definition readable on dark anthracite UI. No ground plane, no backdrop, no checkerboard painted into image, no motion blur, no accompanying ball or hands. Sharp realistic object cutout with clean alpha edges.
```

Le PNG généré a été inspecté, puis optimisé localement avec Pillow, sans nouvelle génération ni modification des originaux. Pas de dépendance npm ajoutée, agent, paiement ou service métier touché.

## Vérification et livraison

Compilation du 30 octobre interrompue ; elle ne vaut pas un build réussi. Build relancé après inventaire des processus le 2 novembre, avec fichiers .next propres au checkout et dépendances existantes réutilisées. Build avec typage, configuration Netlify et frontière des secrets client/serveur PASS. **23 tests PASS, 1 ignoré** : 16 desktop (navigation et interactions), 7 tactile ; seul le survol réservé au pointeur fin est ignoré dans le projet tactile. Quatre largeurs 320/390/768/1440, quatorze images effectivement chargées, liens, focus/Échap, réduit/normal et carrousel/annuaire contrôlés. Chromium et tactile émulé seulement, aucun téléphone physique ou Safari/Firefox certifié.

Aperçu vérifié dans le navigateur connecté : quatorze images décodées, activation volontaire de l'animation dans l'aperçu et rebond constaté. Captures de l'aperçu et du header mobile inspectées. Résultats définitifs, captures et limites dans `assets/realistic-header-2026-11-02/verification.json`. Le serveur de recette temporaire est arrêté automatiquement ; le fichier HTML et ses images peuvent être ouverts localement sans serveur. Ne pas annoncer un lien localhost persistant.

Pas de déploiement autorisé implicitement. Distant relu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence préexistante conservée ; aucun pull/fusion/rebase/force-push. État final de commit/push dans le relais et la livraison, sans confondre modification locale et site public.
