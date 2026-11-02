# Démonstration « page en deux battants » — 2 novembre 2026

## Périmètre autorisé

Montrer le rendu demandé avant une intégration : la page actuelle se sépare verticalement, les deux moitiés pivotent vers l'extérieur, puis la suivante avance depuis l'arrière-plan. **Prototype autonome à partir de captures**, pas une transition branchée sur la navigation réelle. Aucun routeur, écran, formulaire, compte, paiement ou donnée métier modifié. Aucun nouveau service, paquet, agent, génération IA ou déploiement.

Sources : AGENTS, procédure/hiérarchie BRANCH_STRATEGY, préambules maître/index/refonte, relais courant, contrats Factory et aperçu précédent. Base du dépôt principal `d908ceb63098dd4e13b6c0e57a9ffb6a9d109e76`. Recette dans `C:/Users/cashe/Documents/GYM-equipment-entrance-20261102`, en réutilisant le build isolé déjà vérifié ; ses sources applicatives sont comparées au manifeste de la livraison précédente. Les vingt modifications suivies antérieures du dépôt principal sont préservées et exclues de l'essai.

## Rendu et commandes

- Vues propres de l'accueil et de l'annuaire football démo : 1440 × 900 sur ordinateur, 390 × 780 sur mobile, sans bannière cookies et sans animation d'entrée pendant la capture. Données de démonstration, pas une séance ou un résultat réel.
- Battant gauche articulé au bord gauche, rotation jusqu'à −110° ; droit au bord droit, jusqu'à +110°. Le contenu de la page courante reste aligné sur les deux faces au départ. Dos sombre, fine tranche et perspective pour suggérer l'épaisseur.
- Vue suivante initialement reculée et assombrie, puis avancée et remise à son échelle normale. Durée normale 950 ms, ralenti 2 200 ms. Instantané alternatif « Changer sans animation ».
- Boutons Voir l’ouverture 3D et Rejouer, sélection de vitesse ; Échap, resize ou passage en arrière-plan terminent la séquence proprement. Doubles déclenchements ignorés pendant l'ouverture, ancienne promesse d'animation empêchée de terminer une séquence plus récente. Aucun piège de focus.
- Aucun démarrage automatique. Avec mouvement réduit, le bouton 3D représente une activation explicite limitée à cette démonstration ; la voie sans animation reste disponible. Réglages Windows inchangés.
- Préchargement réel des quatre captures ; contrôles indisponibles tant qu'elles ne sont pas prêtes. Si un fichier manque, message explicite et pas d'ouverture sur une destination vide.

Fichier : `gym-next/public/design_assets/door-transition-2026-11-02/index.html`, à conserver avec ses quatre WebP dans le même dossier. Fonctionne sans serveur dans un navigateur local. Les images sont des captures et leurs contrôles internes ne sont pas des formulaires interactifs. Le choix d'une future intégration dans le vrai site, ses chargements, son historique et ses restaurations de focus restent hors de cette démonstration.

## Contrôles

Deux scénarios de capture et quatre scénarios de démonstration PASS. Démo : 390/1440 px, rotations opposées vérifiées, destination encore reculée et réduite à mi-parcours puis à l'échelle normale, pas de débordement horizontal ; rejeu, double activation, Échap, resize, voie sans mouvement et capture manquante. Premier passage : trois scénarios PASS, un échec du test qui tentait de cliquer un bouton correctement indisponible ; assertion corrigée pour vérifier son état désactivé, puis quatre scénarios PASS. Ce n'est pas un défaut applicatif masqué.

Contrôle TypeScript standard PASS. Aucun nouveau build Next nécessaire pour cet ajout HTML/images de démonstration ; le build applicatif réutilisé ne certifie pas une intégration de navigation. Captures d'ouverture et d'arrivée inspectées visuellement. Démo aussi rejouée dans le navigateur connecté : annuaire au premier plan, état idle et aucune animation restante. Chromium et viewport mobile émulé ; pas de validation sur appareil physique, Safari/Firefox ou FPS garanti.

Preuves : `docs/assets/door-transition-2026-11-02/`, captures PNG originales, dérivés WebP, rapports/journaux et verification.json. Quatre WebP totalisant 149 470 octets ; aucun téléchargement externe, capture privée ou modification des originaux. Serveur temporaire de recette arrêté automatiquement ; pas d'aperçu localhost persistant annoncé.

## Git et publication

Branche unique `design/refonte-progressive-lot1`. Distant de départ `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence existante préservée. Aucun pull/rebase/fusion/force-push ou nouvelle référence de contournement. État final du commit/push dans le relais et verification.json. Aucun déploiement ni changement de la navigation publique.
