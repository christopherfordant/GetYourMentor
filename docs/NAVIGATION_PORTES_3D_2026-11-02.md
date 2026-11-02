# Navigation : ouverture 3D en deux battants — 2 novembre 2026

Demande : intégrer le prototype validé après un commit préalable. Point de retour créé avant le code : `c29b8cd2c69674b385a1f258a70d96380bd447e7`. Sauvegarde privée décrite dans POINT_RETOUR_PORTES_2026-11-02.md. Vingt modifications suivies antérieures exclues.

## Réalisation locale

La vue actuelle se sépare en deux battants articulés sur leurs bords extérieurs, tournant vers -110°/+110°. La nouvelle page réelle avance depuis le fond. Durée 950 ms ; perspective proportionnelle à la fenêtre ; easing cubic-bezier(.22,.75,.2,1). Le prototype reste disponible, mais ses captures prédéfinies ne servent pas à la navigation réelle.

`InternalNavigationEnhancer` installe le contrôleur. Liens internes, paramètres, historique et navigations GET internes par location.assign/href sont traités avec la Navigation API dans Chromium. Les navigations document internes compatibles rejoignent App Router ; un test contrôle une seule entrée supplémentaire dans l'historique. Le template fournit l'enveloppe de la page entrante. Aucun changement au layout déjà modifié, aux règles métier, aux prix ou aux API serveur.

Les battants contiennent des copies temporaires dans deux Shadow DOM inertes et aria-hidden. Les IDs ne sont pas dupliqués dans l'arbre principal. Scripts, attributs événementiels, iframes, médias actifs et dialogs retirés ; champs éditables vidés. Styles isolés ; ressources visuelles déjà affichées réutilisables par le navigateur. Aucune capture privée persistée, aucun service de capture externe. Les éléments fixes et sticky sont recalés à leur position réelle, y compris après défilement.

## Navigation et protections

Aucune animation au premier chargement, sur une ancre de la même page ou avec mouvement réduit. Le contrôleur décoratif laisse les téléchargements, autres onglets, liens externes, routes API, fichiers et soumissions POST suivre leur fonctionnement habituel. Les redirections externes de paiement restent natives.

Échap, resize, arrière-plan, mouvement réduit ou démontage nettoient les copies et annulent les animations temporaires. Une génération protège les navigations rapides contre une ancienne fin d'animation. Les copies ne capturent ni souris ni clavier. Après cinq secondes d'attente d'une route lente, elles disparaissent et la navigation continue normalement. Aucun réglage Windows modifié.

Sans Navigation API : liens internes et retour arrière testés, mais toutes les navigations document/programmatique ne sont pas garanties animées. Échec de préparation : nettoyage et navigation ordinaire. Les vidéos, canvas et contenus tiers ne bénéficient pas d'une reproduction pixel parfaite. Aucun FPS ni support universel garanti.

## Vérifications

**32 scénarios PASS : 23 desktop + 9 tactile Chromium émulé.** Ne pas additionner les relances. Neuf nouveaux scénarios par projet ; quatorze régressions desktop des équipements, du menu, des cartes et du mouvement réduit. Largeurs 320/390/768/1440 selon les suites.

Contrôles : titre de l'ancienne vue, rotations opposées, profondeur de la nouvelle page, vraies destinations, historique, recherche vers Lyon, ancre et téléchargement, annulations, navigation rapide, attente réseau de 6,2 secondes, repli sans Navigation API et éléments fixes après défilement.

Build final optimisé code 0, typage, frontière client et configuration Netlify : PASS. Avertissements CSS hérités conservés. Contrôle des secrets des fichiers indexés effectué avant commit. Aucun compte privé, paiement réel ou service distant validé dans ce lot.

Historique conservé : quatre échecs initiaux dus au sélecteur html ambigu dans les Shadow DOM ; un véritable décalage de poignée fixe après défilement, corrigé avant la recette finale. Le premier build affichait sa fin mais retournait 1 dans Powershell : seul le dernier build explicitement confirmé code 0 fait foi.

Preuves : assets/door-navigation-2026-11-02/verification.json, JSON finaux et captures opening/finished à 390/1440 px. Ces noms de captures correspondent à la dernière recette tactile, DPR 3 ; rapports desktop archivés séparément. Environnements de recette retirés des JSON. Serveurs temporaires arrêtés. Checkout : C:/Users/cashe/Documents/GYM-door-navigation-20261102.

## Références et livraison

Consultées le 2 novembre 2026 : [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API), [événement navigate](https://developer.mozilla.org/en-US/docs/Web/API/Navigation/navigate_event), [View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using). La solution finale utilise DOM et Web Animations, pas les pseudo-éléments View Transitions.

Dernière relance : 18 scénarios de navigation PASS après correction du sélecteur Unicode et attente explicite de fermeture de la bannière de confidentialité. Ces relances remplacent les précédentes exécutions des mêmes scénarios : toujours 32 scénarios distincts avec les quatorze régressions. Typage final rejoué PASS.

Branche design/refonte-progressive-lot1, commit applicatif 4f30ecf1982c505e1ee9e125b50b195f35d4f4ad. Push ordinaire rejeté non-fast-forward (code 1), distant réellement relu : d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. Diff binaire des vingt modifications antérieures strictement identique à la sauvegarde initiale. Détails dans verification.json. Aucun achat, agent, dépendance ajoutée, fusion, rebase, force-push ou déploiement. Le site public reste inchangé.
