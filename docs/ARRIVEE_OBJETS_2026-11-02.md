# Mise à jour du 6 novembre 2026

L'HTML de démonstration est désormais hors `public`. Aperçu courant : [guide local](../prototypes/README.md), sur `http://127.0.0.1:4336/design_assets/header-equipment-2026-10-30/apercu.html`. Le script `entrance.js` et les médias du header restent en place. Les preuves historiques ci-dessous ne sont pas réécrites.

# Arrivée des objets sportifs — 2 novembre 2026

## Demande et intégration

Faire arriver les équipements photoréalistes depuis les coins supérieurs, les faire rebondir dans plusieurs zones visibles puis les ranger dans le header. Lot limité à l'accueil, aux images déjà présentes et à l'aperçu HTML ; aucun nouvel asset généré, paquet, agent, paiement ou déploiement.

Socle consulté : AGENTS/procédure et hiérarchie BRANCH_STRATEGY, relais courant, contrat Factory, rapport des icônes réalistes et composants actuels. Les sources historiques déjà qualifiées ne sont pas annoncées relues intégralement. Base `a8ed20e9e904ae2195bf02b776bb7a193a7e6fb4`, checkout isolé `C:/Users/cashe/Documents/GYM-equipment-entrance-20261102`. Vingt modifications suivies antérieures préservées dans le dépôt principal.

## Comportement

- Accueil desktop : un passage après décodage des images. Mobile : à la première ouverture de Sports, puisque le panneau est fermé au chargement. Pas d'introduction sur les formulaires, comptes, paiements et pages de recherche ; leurs headers gardent le survol existant.
- Objets alternés depuis les deux coins supérieurs, agrandis pendant le trajet, deux rebonds et rotations puis petit amortissement sur leur place finale. Trajectoires déterministes réparties dans la fenêtre visible ; ce n'est pas un moteur de collisions physiques entre objets.
- Jusqu'à quatorze clones décoratifs, calque fixe avec pointer-events:none, aucune prise de focus. Le texte et les cibles de clic restent en place. Les images d'origine gardent leur emprise, sont temporairement cachées pendant leur trajet puis restaurées. Aucune image supplémentaire téléchargée.
- Durées 1 850–2 010 ms, décalage de 45 ms par objet, soit jusqu'à 2 595 ms après démarrage ; attente de décodage bornée à 1 200 ms. Pas de boucle, son, flash lumineux ou bibliothèque supplémentaire. Sans JavaScript/Web Animations API, le header reste statique et utilisable.
- Clic/toucher, focus dans les sports, Échap, scroll, redimensionnement, passage en arrière-plan ou activation du mouvement réduit interrompent le déplacement et restaurent les objets. Annulation aussi au démontage React ; écouteurs et animations nettoyés.
- Le site respecte prefers-reduced-motion. L'aperçu conserve son activation volontaire, et son bouton « Rejouer l’arrivée » active uniquement cette démonstration. Aucun réglage Windows modifié.

## Source partagée et aperçu

Le module `public/design_assets/header-equipment-2026-10-30/entrance.js` est importé dans PlatformHeader et intégré à l'identique dans le HTML autonome pour rester utilisable avec ses images sans serveur ni import file: bloqué par CORS. Déclaration TypeScript associée ; pas de compilation dynamique ou dépendance externe.

`apercu.html` joue l'entrée au chargement lorsque le mouvement est autorisé, et offre Rejouer. Sur mouvement réduit, il reste statique jusqu'à une activation explicite. Garder le HTML dans son dossier avec les WebP. Le site Netlify n'est pas modifié par cet aperçu.

## Contrôles et limites

Build optimisé et contrôle standard TypeScript réussis dans le checkout isolé, configuration Netlify/frontière client-secrets réussies. Avertissements Autoprefixer préexistants conservés. Première inspection : trajectoires trop groupées au centre, corrigées en répartissant les points de rebond selon l'objet ; nouveau build et contrôle ciblé requis après ce réglage.

Scénarios : déplacement/rangement sans décaler les liens à 390/1440, au moins six étapes par trajet, dispersion mesurée à mi-parcours sur plus de 35 % de la largeur, absence de débordement, restauration des originaux, Échap/resize/rejeu répété/désactivation, mouvement réduit et activation volontaire, liens réels pendant l'entrée, première ouverture mobile sans rediffusion. Régressions header/menu/cartes réutilisées. **30 scénarios distincts PASS, 1 ignoré** (survol exclu du projet tactile). Après le seul ajustement de trajectoire, les six nouveaux scénarios desktop et l'ouverture mobile tactile ont été rejoués sur le build final, sans addition aux comptes initiaux. Aperçu final rejoué dans le navigateur connecté : completed, zéro calque restant, quatorze originaux visibles. Captures finales de mi-parcours et rangement inspectées. Rapports dans `assets/equipment-entrance-2026-11-02/verification.json`.

Chromium et tactile émulé, pas certification sur téléphone physique ni Safari/Firefox. Animations de trajectoires prédéfinies, pas garantie de FPS ou simulation physique. Aucun backend réel réaudité. Le serveur temporaire de recette est arrêté automatiquement ; aperçu local conservé sans serveur persistant.

## Livraison Git

Branche unique `design/refonte-progressive-lot1`. Distant relu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence préexistante ; aucun pull/rebase/fusion/force-push ou nouvelle référence pour la contourner. Statut final du commit/push à lire dans le relais et verification.json. Aucun déploiement commandé.

Commit applicatif `1492c4801e120195a797cd90b3ade8b14c9cfd82`. Push normal tenté, rejet non-fast-forward (code 1), distant relu inchangé au SHA ci-dessus. Complément documentaire conservé localement sans répéter la tentative identique ; index ciblé et contrôle des secrets PASS. Les fichiers antérieurement modifiés restent hors lot.
