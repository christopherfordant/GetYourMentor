# Comparaison de carrousels larges — 3 novembre 2026

Demande utilisateur : remplacer la silhouette haute du pentagone par une scène large, des cartes carrées et davantage de faces ; montrer plusieurs choix avant intégration.

## Livré, hors application

Prototype autonome : `gym-next/public/design_assets/carousel-large-2026-11-03/index.html`, CSS et JavaScript locaux, aucune dépendance ajoutée. Aperçu : http://127.0.0.1:4323/carousel-large-2026-11-03/ ; serveur Python loopback, session 6899. Relance depuis la racine : `python -m http.server 4323 --bind 127.0.0.1 --directory gym-next/public/design_assets`.

1. Anneau régulier à N faces : rayon `(largeur + intervalle) / (2 tan(pi/N))`, angle `360/N`. Chaque carte occupe une face, sans limite à cinq. Scène horizontale, aucune déformation des cartes.
2. Ellipse panoramique : répartition elliptique élargie et profondeur atténuée ; interprétation graphique, pas un polygone régulier. Davantage d'éléments simultanément visibles, revers volontairement atténué.
3. Éventail horizontal : alignement avec profondeur et inclinaison progressive, pour comparer les profils sans un anneau fermé.

Sélecteur de 3/8/12/20 cartes, navigation manuelle circulaire dans les deux sens, clavier, gestion du balayage et du mouvement réduit. Scènes de 350 px sur ordinateur et 300 px sur mobile ; cartes carrées de 190 à 248 px. Aucun cadre externe ajouté. Pas de rotation automatique.

## Provenance et limites

Trois profils de démonstration repris du prototype précédent : Steven Fordant, Madison Seck, Studio Form Marseille. Illustrations IA existantes et explicitement étiquetées. Aucun nouveau coach, avis, prix, disponibilité ou donnée publique ajouté. Les cartes supplémentaires sont nommées « Emplacement de maquette », pas des profils fictifs présentés comme disponibles. Aucun lien de réservation actif : la démonstration sert au choix visuel.

Le nombre de faces devra être relié aux données publiques réellement récupérées lors d'une intégration ultérieure. L'API actuelle bornée ne charge pas tout le catalogue : pagination et performances à traiter alors, sans annoncer cette intégration livrée. Les cas zéro/un/deux et les grands catalogues ne sont pas certifiés dans ce prototype comparatif.

## Vérifications

Script reproductible `assets/carousel-large-2026-11-03/check.cjs` et résultats `verification.json`. Captures comparatives 1440 et 390 px dans le même dossier. Les résultats décrivent les exécutions réelles ; pas de validation Safari, Firefox ou téléphone physique.

Résultats : 24 combinaisons (trois représentations × quatre effectifs × deux largeurs) PASS : cartes carrées, rotation au-delà d'un tour dans chaque sens, absence de débordement horizontal de page. Clavier, mouvement réduit, images chargées et absence d'erreur JavaScript PASS. Captures ordinateur/mobile réellement examinées. Syntaxe JavaScript et diff du lot PASS ; les espaces de fin de ligne signalés dans un ancien journal hors lot sont préservés. Contrôle fil rouge avant push PASS (code 0) ; ses deux fichiers de sortie antérieurs restaurés octet pour octet pour préserver les travaux existants. Aucun build applicatif requis pour cette maquette statique indépendante.

Branche `design/refonte-progressive-lot1`. Distant lu avant livraison : `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence préexistante documentée. Aucun force-push ni fusion ; la sauvegarde locale ne signifie pas une publication sur Netlify.

L'application, le carrousel actuellement intégré, les portes 2,2 secondes et Netlify restent inchangés. Attendre le choix utilisateur avant intégration. Aucun déploiement ni migration.
