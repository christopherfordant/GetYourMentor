# Premier carrousel de mentors Factory — 28 octobre 2026

## Livraison et périmètre

Un aperçu **Tous les mentors** est ajouté sur l'accueil, après le hero et avant les parcours des trois profils. Il contient au maximum six profils vérifiés du catalogue, sans duplication ni carte clonée. Le catalogue local de démonstration en fournit trois. « Voir tout » ouvre `/coachs` ; chaque carte conserve identifiant, discipline et ville vers `/coach`, puis le parcours de réservation existant.

**Implémenté et testé localement, non déployé et non vérifié à distance dans cette version.** Aucun déploiement lancé. L'API Netlify a confirmé au départ que l'alias sert encore la source `13420fc9d70f9b3db4c8a1f15c0228e44b3570bb`, déploiement `6ae222c8945ea53de42c83b9`, ready. Les preuves de ce précédent déploiement ne valident pas le nouveau carrousel.

Base Git `6dbfbe5cd5d7e044b25a80570adbff1db4d74f36`, branche `design/refonte-progressive-lot1`, huit commits locaux contre neuf distants au départ. Distant relu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Vingt fichiers suivis modifiés et 79 entrées non suivies antérieurs préservés hors commit, index initial vide. 46 worktrees préexistants conservés ; un checkout détaché de contrôle ajouté : `C:/Users/cashe/Documents/GYM-mentor-carousel-20261028`.

## Sources, réemploi et arbitrages

AGENTS, procédure/hiérarchie de branches, préambules maître/index, relais, index des sources, suivi de refonte, DESIGN_SYSTEM, socle qualité Opquast et rapports Factory/navigation/images/audit Lovable consultés dans le périmètre utile. Les anciennes mentions violet/quatre disciplines de découverte sont historiques ; Factory et quatorze destinations de découverte restent prioritaires, sans élargir les quatre sports du modèle métier.

Projet Lovable rouvert en lecture seule : éditeur accessible, prévisualisation toujours inexploitable lors du snapshot ciblé. Aucun prompt, changement ou publication sur Lovable. L'audit et les observations archivées du 28 octobre prouvent l'intitulé « Tous les mentors » et son entrée catalogue ; ils ne fournissent pas une nouvelle recette des interactions ou du backend. Les champs affichés proviennent des données locales existantes, pas d'une identité, disponibilité, note ou promotion inventée depuis la référence.

Ancien effet local examiné dans les composants historiques : carte active à l'échelle 1, cartes latérales en retrait. Ces anciens composants ne sont pas l'accueil actif. Le nouveau composant reprend sobrement ce principe, avec échelle .94/1, bordure orange et ombre, sans copier leurs styles bleu/vert ni leurs modifications locales non vérifiées. Aucune rotation 3D ou lecture automatique.

## Architecture, routes et données

| Élément | Réalisation | Preuve / limite |
|---|---|---|
| Accueil | `EditorialHome` ajoute une seule `MentorPreviewSection` | Pas de duplication des autres rubriques ou de faux classement |
| Carrousel réutilisable | `CenteredCarousel`, scroll natif et snap, taille réservée, extrémités centrables | Clavier, souris, tactile Chromium émulé, redimensionnement, rapidité des commandes testés |
| Carte | Nom, discipline, spécialité, ville, tarif source ou « Tarif à confirmer », portrait et lien fiche | Pas de note, nombre d'avis, disponibilité ou label commercial non qualifié |
| API publique | `GET /api/coaches/preview`, projection explicite, maximum six, `Cache-Control: no-store`, erreur 503 générique | Aucun accès banque, documents, coordonnées GPS, session ou historique dans la réponse |
| Source | `listMentorPreview` lit le même stockage de coachs que l'annuaire, profils vérifiés, ordre alphabétique | Sélection générale, aucune prétention de proximité/popularité/recommandation |
| Supabase | Une requête sur `gym_coaches`, sept colonnes publiques, `verified=eq.true`, `limit=6`, ordre stable nom/id et délai de huit secondes | Contrat contrôlé avec fetch simulé ; aucun appel Supabase réel |
| Démonstration | Catalogue mémoire ou `readDemoState`, filtré/trié puis limité à six | Le stockage Netlify Blobs existant reste monolithique : cette lecture serveur peut charger son état global. La projection navigateur est bornée ; pas de prétention à une lecture Blobs paginée ou à un cache nouveau |
| Chargement | Un appel d'aperçu au montage en build production ; annulation au démontage, délai client de dix secondes, reprise explicite | Pas de récupération automatique sans borne, pas de repli silencieux sur des faux profils en cas d'erreur |

Le contrat JSON est validé côté API et côté client : maximum six, identifiants uniques, champs et tarifs valides, sports métier existants. Un JSON incohérent produit l'état d'erreur, pas des cartes partielles trompeuses. Le lien de fiche utilise `buildNextPath` et les routes existantes ; l'alias Fitness est conservé. Aucun paramètre ne crée de droit. Aucun changement financier, de consentement, d'affiliation ou de réservation.

L'accueil reste statique et son hero n'attend pas le catalogue. Le titre et le lien d'annuaire sont présents dans le document initial ; les liens des cartes arrivent après chargement client. Pas de nouvelle donnée structurée commerciale ni de promesse d'indexation de cartes rendues côté client. Le build indique environ 120 kB de First Load JS pour l'accueil contre 116 kB dans le lot précédent : indication de build, pas mesure terrain ni score de performance.

## Portraits et bibliothèque

`CoachVisual` et la correspondance existante par identifiant sont réutilisés. Un paramètre optionnel `sizes` adapte le choix de variante aux cartes de 320 px maximum ; la valeur par défaut des autres pages est conservée. Dimensions 3:2, visages cadrés en haut et espace de légende dans le flux. Aucune image générée dans ce lot, aucune photo utilisateur remplacée, pas de recadrage utilisé comme nouvelle identité.

| ID | Asset IA existant, variantes 640/1280 WebP | Réemploi |
|---|---|---|
| madison-seck | coach-football | Aperçu, annuaire et fiche de démonstration |
| steven-fordant | coach-basketball | Aperçu, annuaire et fiche de démonstration |
| studio-form-marseille | coach-fitness | Aperçu, annuaire et fiche de démonstration |

La photo fournie par un utilisateur prime toujours. Sans image autorisée ou après échec de chargement, initiales et fond neutre, sans emprunter le portrait d'un autre profil. Légendes IA et alt illustratif conservés. Le portrait IA ne prétend pas représenter réellement la personne nommée.

Besoin restant : aucun profil local vérifié supplémentaire de sports de combat ou des nouvelles disciplines n'est inventé pour remplir ce pilote. Un prochain lot doit d'abord qualifier les profils/catégories et leur modèle métier, puis produire les visuels manquants. Les douze disciplines observées dans Lovable et les 86 liens distincts de son audit ne constituent pas notre catalogue livré.

## Accessibilité et vérifications

Commandes natives de 44 px minimum, focus visible, flèches/Home/End sur la piste, boutons précédent/suivant bornés, compteur correspondant aux vraies cartes. Chaque lien latéral reste utilisable. Le recentrage clavier ne déplace pas un lien entre pointerdown et clic. Pas de `scrollIntoView` dans le composant, donc pas de recentrage vertical imposé. Mouvement réduit respecté pour scroll et transitions. Les portraits et textes ne sont pas agrandis au-delà de leur espace réservé.

Checkout isolé, dépendances existantes réutilisées et configuration canonique de typage inchangée ; aucun fichier applicatif antérieur non vérifié copié. Serveur de recette local `127.0.0.1:4320` en mode d'acceptation, services externes neutralisés, un worker Chromium. Aucun compte ou paiement réel, aucune écriture distante.

Résultats : **27 scénarios distincts validés** : dix nouveaux scénarios carrousel/API, huit navigation et neuf régressions images/recherche/annuaire. Ce nombre ne cumule pas les relances. Le passage final groupé de dix-huit scénarios a donné dix-sept PASS et un échec du geste tactile synthétique sans durée ; le même geste, réparti sur 200 ms pour couvrir plusieurs frames, passe deux fois en contrôle ciblé. Les neuf régressions passent ensuite en 13,8 s. Le test de production utilise un fetch simulé vers un domaine `.invalid` : c'est un contrôle du contrat de requête, pas une validation Supabase.

- Quatre largeurs : 320, 390, 768 et 1440 px ; centrage initial, premier/dernier élément, commandes, cartes latérales cliquables, photos chargées, unicité et identité carte → fiche → retour.
- Maintien de la sélection après redimensionnement, glissement souris et molette horizontale ; geste tactile Chromium émulé ; six cartes et commandes rapides ; absence de saut vertical observée dans ces scénarios.
- Chargement, erreur 503, réessai, vide, un seul mentor, tarif inconnu, initiales et JSON à identifiants dupliqués ; cap de l'API et projection publique.
- Régressions : images IA et photos fournies, fallback, disciplines/filtres/tri, fiche/planning vers créneau et huit scénarios de navigation/header/menu/cloche/accès.
- Contrôle complémentaire à 390 px : menu ouvert au-dessus du carrousel, Échap/focus, refus des cookies, lien de carte au clavier et utilitaire footer. Un header, un footer, zéro débordement horizontal. Capture et résultats dans `assets/mentor-carousel-2026-10-28`.
- Typage standard, build optimisé et frontière secrets client/serveur PASS. Captures 390/1440 inspectées. Dix fichiers applicatifs/tests comparés entre dossier principal et checkout de contrôle ; le manifeste borne le build et leurs empreintes.

Diagnostics conservés : première erreur de typage sur l'union d'état corrigée ; premier passage de neuf tests : six PASS, deux échecs révélant le déplacement du lien latéral au clic et un import de module serveur non résolu par le harnais. Clic corrigé ; lecture réseau bornée isolée en helper serveur sans dépendance Next, testée directement, sans assouplir le tsconfig. Aucun contrôle désactivé ou succès non exécuté déclaré. La première capture de cohabitation utilisait un libellé accentué corrompu par le pipe PowerShell ; contrôle repris avec sélecteurs ASCII, résultat final PASS.

## Git, livraison et suite

Déclencheurs CI/CD lus avant push : workflow GitHub sur main/feat/nextjs-migration, pas sur cette branche ; contrat Netlify inchangé. Aucun déploiement commandé. Commit ciblé local réalisé ; push normal réellement exécuté, rejeté non-fast-forward (code 1), distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Aucun contournement. Les changements non vérifiés des vingt fichiers suivis et 79 entrées non suivies restent locaux.

Prochaine étape recommandée : revue du pilote, puis aperçu collectif distinct à partir des offres existantes et de leurs capacités réelles. L'extension des disciplines/profils et la génération IA doivent rester liées aux données approuvées. Proximité, disponibilités du soir, popularité et nouveautés exigent leurs propres critères et données ; ne pas dupliquer ce carrousel sous ces promesses. Aucun déploiement sans nouvelle demande explicite pour ce lot.
