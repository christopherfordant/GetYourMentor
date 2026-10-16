# Découverte des séances collectives — 17 octobre 2026

## Périmètre
Base et distant vérifiés : 9493e095ab8890c32ae1cae119982bed07b1e1ee, branche design/refonte-progressive-lot1. Checkout GYM-demo-completion et dépendances réutilisées par jonction. Travaux antérieurs préservés dans le dépôt principal. Sources : MVP p.1, Business Plan p.28–31/49–51, prix total par taille décidé par utilisateur, contrat visuel et maquette approuvée. BP p.35–36/62–64 relus pour la suite.

`/seances` et `/api/sessions` regroupent les offres existantes coach/structure. Réutilisation listStructureOffers/publicSessionOffer/réservations, aucune nouvelle base ni moteur. Profils non validés exclus, aucune identité des participants ni ownerEmail dans la projection. Réservations lues une fois, chaque coach une fois pour le catalogue : pas de gain chiffré revendiqué.
Filtres GET partageables : quatre sports, ville du profil coach, organisateur, participants (1–50, limite technique existante). Ville du rendez-vous non déduite du champ libre. Créneaux futurs, places restantes et tarif positif défini pour la taille sélectionnée. Prix total coach, pas multiplication du tarif individuel. Réservation via API existante et retour Mon compte ; droits/capacité/acceptation/commission historiques inchangés.
Liens recherche/annuaire/structures, header inchangé ; chargement, état vide et erreur/réessai. Catalogue démo isolée uniquement, noindex. Réglage Next cpus=2 préexistant local repris après examen ; aucune dépendance ajoutée ni mesure comparative RAM.

## Vérifications et corrections
Build final et typage PASS. Campagne finale 26/26 PASS (session-discovery, coach-collective, discovery-editorial), desktop/mobile, un worker. Rejeu de capture desktop 3/3 PASS sur les mêmes scénarios, pas trois fonctionnalités supplémentaires. Contrat Netlify, frontière client/serveur et secrets suivis PASS avant livraison.
Première campagne 22/26 PASS : sélecteur de champ inadéquat et confusion avec l’alerte Next. Reprise : lecture du JSON après redirection corrigée dans le test via interception transmettant la vraie requête au serveur avant archivage du résultat. Recette suivante : défaut réel de réinitialisation après navigation Next corrigé par remontage selon paramètres serveur. Projection partagée : typage des callbacks map détecté au build, callbacks corrigés, build final réussi. Ces échecs ne sont pas comptés comme réussites.
Vérifiés : normalisation URL/accents, sports/source/capacité/prix/dates, projection publique, demande réelle de groupe 73 EUR fictifs, droits, catalogue/profil/créneau, concurrence et historique/remboursement simulé. Réservations finales refusées en finally, tarifs restaurés ; fixtures locales éphémères.
Playwright MCP : ancien écran hébergé puis catalogue local pendant première campagne. Captures finales via harness Playwright sur build final ; 320/390/768/1440 sans débordement. Navigation MCP après arrêt automatique du serveur : connexion refusée, pas une preuve de rendu. Favicon local 404 observé. Démarrage manuel optionnel refusé par politique d’exécution ; harness de test avec arrêt géré utilisé, aucune protection désactivée.

- [Avant : anciennes structures hébergées](assets/collective-discovery-2026-10-17/before-structures-390.png), pas un avant de la nouvelle route.
- [Après mobile](assets/collective-discovery-2026-10-17/after-390.png).
- [Après desktop](assets/collective-discovery-2026-10-17/after-1440.png).

## Livraison, limites et reprise
Branche design/refonte-progressive-lot1 ; confirmation SHA distante après commit. Aucun déploiement dans ce lot à ce stade : démo publique toujours 6ad2ad63b8e082659be8bb15. URL locale http://127.0.0.1:3001/seances pendant tests, serveur fermé ensuite. Retour arrière : revert ciblé, sans reset/clean ni effacement Blobs ; nouvelle lecture sans migration.
Petit catalogue démo sans pagination ni garantie de charge élevée ; filtrage client des seules offres publiques, pas géolocalisation du rendez-vous. Places indicatives recontrôlées serveur au moment de la demande, aucun polling. RLS, paiements réels et appareils physiques non validés. Modification/retrait de séance et révocation d’affiliation non inventés.
Suite : qualifier correctifs locaux messages/avis/clubs et réponse coach, puis bêta/retours, abonnements/contenus/suivi simulés et fonctions avancées. Matrice Stratégie actualisée. V1/V2/V3 non terminées. PDF V5 appliqué à la revue et aux preuves sans couche d’agents.
