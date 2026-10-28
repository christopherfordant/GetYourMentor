# Audit des sections Lovable et proposition de menu — 28 octobre 2026

## Résultat et périmètre

Comparaison de l'accueil rendu dans le [projet Lovable transmis](https://lovable.dev/projects/447e4f2f-dfd3-455d-a936-0e3025ea0276) avec les points d'entrée et composants actuels du dépôt GetYourMentor. La prévisualisation est accessible dans la session navigateur existante ; lecture seule, aucun prompt envoyé à Lovable, sauvegarde, publication, inscription ou paiement. Le lecteur web textuel n'a pas pu ouvrir le projet ; observation effectuée avec Playwright dans son iframe de prévisualisation.

**La référence possède 15 rubriques titrées sur l'accueil. Le dépôt possède déjà plusieurs fonctions sous-jacentes, mais son accueil éditorial ne les organise pas comme un catalogue de découverte.** Ce n'est donc pas une liste de quinze fonctions à recréer intégralement. La comparaison porte sur le rendu de référence et le code local inspecté ; elle ne prouve pas le fonctionnement serveur de Lovable, l'exhaustivité de ses autres pages ou l'état d'une publication publique.

Livraison de ce lot : audit, observation structurée, maquette HTML séparée et cinq images PNG du menu. **Aucune modification du site applicatif**, aucune importation du code Lovable ni déploiement. La maquette de fond illustre la proposition ; elle n'affirme pas que les sections manquantes sont implémentées.

## État Git et sources

- Branche `design/refonte-progressive-lot1`, base locale `33e355e0936bb7af28938de8fb08fbf9cb1730e8`, distant confirmé au départ `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Deux commits locaux contre neuf distants, état divergent : ni pull, rebase, fusion ni force-push.
- 20 entrées suivies modifiées et 79 entrées non suivies antérieures ; index vide, 44 worktrees. Préservés hors du commit de ce lot. Le dépôt local, les neuf commits distants et le projet Lovable sont trois états distincts : aucune synchronisation présumée.
- Socle : AGENTS, procédure/priorités/hiérarchie déjà consultées, préambules maître/index, relais, index PDF, suivi de refonte, préambule DESIGN_SYSTEM et socle Opquast. Aucun PDF annoncé relu intégralement. Direction violette conservée conformément à la demande actuelle ; pas d'activation des offres ou règles nouvelles de la référence.
- Inspection ciblée : `EditorialHome` (entrée réelle de `/`), `SiteFooter`, plan du site, annuaire/filtres, modèle CoachProfile, offres, séances de structures, suivi personnel et avis. Recherche ciblée de recommandation/promotion/popularité/domicile dans components/lib : aucun module dédié identifié sous ces termes. Absence de résultat textuel ne certifie pas l'absence de tout mécanisme dans d'autres environnements.
- Preuve externe expurgée : [reference-observation.json](assets/audit-lovable-2026-10-28/reference-observation.json), sans chat, cookies, jetons ou journal réseau. Les avertissements/erreurs de l'éditeur Lovable ne sont pas attribués automatiquement au site.

## Tableau des écarts

« Absente de l'accueil » ne signifie pas « inexistante dans toute l'application ». Les comportements de référence sont observés visuellement/au DOM, pas recettés comme des services réels.

| Rubrique observée dans Lovable | État dans le dépôt local | Ce qui manque / réemploi possible |
|---|---|---|
| Ça démarre bientôt | Absente de l'accueil ; créneaux et séances existent | Vue bornée sur les créneaux encore réservables, fuseau et heure de référence fiables. Ne pas afficher une urgence ou une place restante fictive |
| Offres du moment | Absente ; `/offres` est un aperçu d'abonnements, pas un moteur de promotions | Données de réduction/période/éligibilité et contrôle des montants. Pas de réutilisation trompeuse des prix d'abonnement |
| Les mentors qui te correspondent | Absente ; aucun moteur de recommandations identifié dans les fichiers ciblés | Préférences explicitement choisies, filtres réutilisés et explication du résultat. Bouton de personnalisation vu dans Lovable, clic expiré : assistant et algorithme non validés |
| Pour atteindre un objectif | Absente comme découverte publique ; `/suivi` gère un objectif personnel démo | Catégories d'objectifs et correspondance au catalogue, sans réutiliser silencieusement des objectifs privés ou données de santé |
| À proximité | Partielle : géolocalisation/rayon/distances dans l'annuaire | Exposition sur l'accueil, accord de localisation et état sans position ; réutiliser les calculs existants plutôt que créer des distances illustratives |
| Les JIM les plus demandés | Absente comme classement | Clarifier « JIM » et le critère de demande ; classement sourcé distinct de la note et du Premium. Aucun compteur de popularité inventé |
| Disponible ce soir | Absente de l'accueil ; disponibilités matin/après-midi et créneaux déjà présents | Filtre temporel du soir sur de vrais créneaux autorisés, après sélection du lieu/fuseau ; pas un simple changement de titre du filtre après-midi |
| Entraîne-toi à plusieurs | Fonction partielle déjà livrée : `/seances`, `/structures`, prix par taille/capacité | Section d'entrée sur l'accueil branchée aux offres collectives existantes ; préserver prix total du groupe, capacité et acceptation avant paiement |
| Ton coach se déplace | Absente comme offre à domicile explicite ; rayon de service et présentiel/visio ne prouvent pas un déplacement | Mode à domicile, zone, frais éventuels approuvés et confidentialité de l'adresse. Aucun supplément de la référence recopié automatiquement |
| Découvre les nouveaux mentors | Absente ; CoachProfile n'expose pas de date d'inscription dans le modèle inspecté | Date fiable/publication/validation et critère de nouveauté, pas l'ordre des fixtures |
| Fais-toi guider, trouve ton Mentor | Partielle : recherche et guide existants | Entrée recherche discipline/lieu/date plus visible ; réutiliser `/recherche` et le calendrier existant. Le bloc de référence est une interface observée, pas une disponibilité réelle garantie |
| Encadrement sportif / explication du parcours | Déjà couvert en partie par profils, espace et guide `#suite` | Réorganisation et présentation, plutôt qu'une nouvelle logique métier |
| Ils ont trouvé leur mentor | Pas de témoignages globaux sur l'accueil ; avis par coach déjà présents | Réemploi d'avis autorisés et vérifiables ; pas de témoignage, note ou identité de sportif inventés |
| Deviens mentor | Accès existant via compte coach, zone profils et footer | CTA/section d'acquisition plus visible ; préserver la validation et les consentements d'affiliation |
| Tous les mentors | Annuaire `/coachs` déjà présent, pas de catalogue complet sur l'accueil | Entrée/liste publique liée à l'annuaire, pagination/filtrage conservés ; le catalogue démo local contient seulement trois profils, pas les profils Lovable |

## Autres différences importantes

- **Disciplines :** douze entrées de découverte dans la référence (football, basketball, boxe, MMA, Pilates, coaching sportif, CrossFit, préparation physique, musculation, HYROX, perte de poids, padel). Le dépôt garde quatre familles approuvées. Plusieurs entrées peuvent être des sous-disciplines ou objectifs ; le padel n'entre pas dans ces quatre familles sans arbitrage. Aucune extension métier réalisée par l'audit.
- **Filtres :** la référence expose aussi type de professionnel, âge, promotions, packs, abonnements et séance entre femmes, en plus des champs déjà proches du dépôt. Un filtre « coach femme » ne prouve pas une séance exclusivement entre femmes. L'âge et les offres commerciales demandent des contrats adaptés avant activation.
- **Header/navigation :** référence avec ville, notifications, accès « JIM » et connexion ; dépôt avec sports, accès comptes et liens éditoriaux. Les liens `/search`, `/mentor/...`, `/pros`, `/pricing`, `/auth`, `/signup`, `/decouvrir`, `/faq` ne correspondent pas directement aux routes Next actuelles : établir une table de destinations, ne pas les copier en liens cassés.
- **Recherche fixe et footer :** barre sport/lieu/date en bas et footer orienté sportifs/professionnels dans Lovable. Le dépôt possède un footer et un plan du site partagés ; conserver les liens légaux, cookies et accès utiles lors d'une future harmonisation. Le bandeau de marque animé est une préférence visuelle, pas une fonction manquante prioritaire.
- **Images :** dans le DOM de référence observé : 100 apparitions de cartes avec image, 86 liens de profils distincts, **22 sources d'image partagées entre plusieurs identifiants de profil**. Une personne répétée dans plusieurs rubriques est normale ; plusieurs profils distincts avec la même URL constituent une répétition à traiter. Ces nombres sont une photographie du DOM, pas un décompte certifié de la base. Le « 12 sur 92 » visible en bas est un libellé de l'interface, pas une preuve d'effectif réel. Le lot de trois portraits démo local ne couvre pas ce catalogue Lovable.
- **Ancres et titre :** aucun `section[id]` ni H1 détecté dans le corps de prévisualisation observé. Cela motive un vrai repérage des rubriques pour le futur menu et une revue des titres, sans conclure à un audit SEO complet. Les liens du footer observés ne prouvent pas que chaque destination fonctionne.

## Proposition du menu demandé

[Image fermé / ouvert](assets/audit-lovable-2026-10-28/menu-ferme-ouvert.png) · [maquette interactive locale](../maquettes/menu-sections-2026-10-28/index.html) · [planche comparative HTML](../maquettes/menu-sections-2026-10-28/apercu.html).

- Panneau ancré **au bord droit**, largeur maximale 360 px ; entrée **vers la gauche**, sans déplacement du contenu de fond. Sur mobile, largeur limitée à l'écran moins 44 px.
- Au repos, seule une petite flèche gauche dans une languette de 28 px reste visible ; zone de clic/focus de 44 × 56 px. Pas de gros bouton « Menu », pas de trois barres ajoutées contrairement au détail explicite de la demande.
- Une fois ouvert, noms de sections dans le panneau, groupés « Trouver une séance » / « Découvrir GYM », et flèche orientée à droite pour fermer. Quinze liens proposés, défilement interne sur petit écran ; deux longs titres explicatifs abrégés pour rester lisibles. Libellés à conserver/adopter selon l'audit, pas promesse de sections déjà livrées.
- Fermeture par la flèche, Échap ou clic sur le fond ; focus initial, retour de focus, boucle clavier, arrière-plan inerte et mouvement réduit prévus dans la maquette. Liens vers des ancres **de démonstration existant seulement dans la maquette**.
- Réalisation native HTML/CSS avec images IA déjà présentes : capture exacte de l'interface, aucun nouveau bitmap génératif requis pour les textes/flèches. Aucun nouveau moteur ou agent.

## Contrôles et prochaine étape

Script `gym-next/scripts/verify-menu-mock-20261028.cjs`, Chromium local sur fichiers HTML, sans serveur ni réseau nécessaire : **21 assertions PASS** à 390/1440 px (position droite, déplacement vers la gauche, 15 liens/ancres, inertie fermé, absence de débordement, focus, Échap, mouvement réduit). Cinq captures, planche fermé/ouvert inspectée. [Résultats](assets/audit-lovable-2026-10-28/mock-verification.json). Ce sont des contrôles de maquette, pas une recette du site Next. Aucun build applicatif ni test des comptes/paiements rejoué pour ce lot documentaire isolé.

Ordre recommandé :
1. Préparer une base Git cohérente et arrêter la liste des sections/destinations à reprendre ; préserver les évolutions distantes et les changements antérieurs.
2. Prochain lot UI limité : intégrer ce menu et des ancres stables sur les **sections réellement présentes**, sans liens trompeurs vers des blocs absents. Si l'on veut les quinze destinations dès le premier lot, créer/relier explicitement les blocs d'accueil nécessaires avant activation des liens.
3. Exposer d'abord les fonctions existantes : annuaire, proximité, collectif, guide et devenir coach. Prévoir les états vide/chargement/erreur et les données démo explicites.
4. Traiter ensuite les nouvelles données métier : soir/imminence, nouveautés/popularité, préférences/objectifs. Promotions/packs/abonnements et domicile après arbitrage des conditions, jamais par simple imitation de la maquette.
5. Étendre la bibliothèque d'images au catalogue effectivement retenu, avec une association unique par profil et stable entre rubriques.

Points à décider pour l'intégration ultérieure : regroupement des disciplines, définition de JIM/popularité, données réelles ou démonstration des nouveaux blocs et conditions des nouvelles offres. Aucun de ces choix n'empêche cet audit ou la livraison de l'image demandée.

CI/CD relu : workflow push sur `main`/`feat/nextjs-migration`, pas la branche de chantier ; aucun déploiement ajouté. Push réel de ce lot rejeté `non-fast-forward` (code 1), distant relu inchangé à `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Travail committé localement, aucun changement antérieur intégré ; aucune fusion/production/force-push.
