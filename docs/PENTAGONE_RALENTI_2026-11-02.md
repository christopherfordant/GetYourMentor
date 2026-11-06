# Mise à jour du 6 novembre 2026

Le prototype pentagonal historique est conservé hors `public`. Aperçu : [guide local](../prototypes/README.md), sur `http://127.0.0.1:4336/design_assets/pentagon-carousel-2026-11-02/index.html`. Ce rangement ne réintroduit pas ce rendu dans le produit. Les preuves qui suivent sont conservées.

# Ouverture ralentie et carrousel pentagonal — 2 novembre 2026

## Périmètre livré

Deux demandes : ralentir uniquement la transition de navigation et montrer un prototype avant tout remplacement des carrousels. Les versions précédentes sont conservées. Aucun carrousel existant remplacé, aucune règle métier modifiée, aucun déploiement.

Le prototype des portes confirme 2 200 ms pour son mode Ralenti. `gym-next/lib/door-navigation.ts` utilise maintenant cette durée pour les deux battants et la page entrante ; nettoyage de secours dérivé de la durée, à 2 650 ms. Le garde-fou d'attente de route reste à cinq secondes. Angles, perspective, easing, interactions et autres animations inchangés.

## Démonstration pentagonale

Fichier : `gym-next/public/design_assets/pentagon-carousel-2026-11-02/index.html`, autonome avec ses trois WebP voisins. Provenance dans PROVENANCE.json. Aucun outil payant, nouvelle dépendance ou nouvelle image générée.

Prisme régulier de cinq faces, séparées de 72°. Rayon calculé par largeur / (2 × tan(π/5)). Une face principale lisible, deux voisines inclinées ; les deux autres sont naturellement masquées jusqu'à la rotation. Rotation manuelle à gauche/droite avec compteur de tours signé, sans remise à zéro à chaque révolution ni bouton de fin. Pas d'autoplay. Rotation du prototype : 850 ms, indépendante des portes à 2 200 ms.

Contenus existants : Steven Fordant / basketball / Marseille / 35 €, Madison Seck / football / Paris / 40 €, Studio Form Marseille / fitness / Marseille / 35 €. Tarifs et profils de démonstration provenant de `lib/domain.ts`, sans notes ou performances ajoutées. Portraits IA réutilisés selon `lib/demo-visuals.ts`, explicitement signalés comme illustrations sans représentation des personnes nommées. Les deux autres faces reprennent la recherche et les étapes de réservation documentées : proposition d'un à trois créneaux, réponse du coach, paiement après acceptation. Aucune réservation ni transaction réelle possible dans cet aperçu.

Flèches, choix direct d'une face, clavier et balayage horizontal. Les gestes verticaux restent disponibles pour défiler. Liens des faces inactives inertes et masquées aux aides techniques ; le focus revient au cadre si une rotation est déclenchée depuis le lien actif. Mouvement réduit : sélection immédiate sans animation. Portrait indisponible : emplacement et texte conservés, navigation disponible. Adaptation à 320/390/768/1440 px.

## Inventaire et généralisation éventuelle

| Élément | État observé dans le code | Suite possible |
|---|---|---|
| `MentorPreviewSection` → `CenteredCarousel` | Carrousel réellement appelé par l'accueil `EditorialHome` | Premier candidat après validation utilisateur |
| Expériences et parcours de `HomePageClient` | Composant historique, sans appel retrouvé dans les routes actuelles | Réexaminer seulement si cette page est réactivée |
| Trois pistes de `AccueilLegacyPage` | Ancienne page, sans appel retrouvé dans les routes actuelles | Conserver l'historique ; aucun remplacement automatique |
| Cartes de l'annuaire / aperçu des séances collectives | Cartes ou grilles, pas des instances du carrousel actif | Ne pas les convertir implicitement |

L'inventaire repose sur les imports et appels de composants, pas sur la seule présence du mot « carousel » dans une feuille de styles. L'exemple montre trois profils et deux faces pédagogiques pour ne pas inventer deux mentors supplémentaires. Une intégration future devra décider comment répartir un catalogue de taille variable ; aucun contenu éducatif n'est ajouté au produit par ce prototype.

## Contrôles et preuves

**27 scénarios distincts PASS** : 16 scénarios finaux de prototype (8 desktop + 8 tactile émulé), neuf régressions de navigation avec la nouvelle durée et deux nouveaux scénarios de conservation du focus. Les autres relances ne sont pas additionnées. Le rapport de recette intermédiaire comporte un échec à 320 px, corrigé puis remplacé par la recette finale PASS.

Contrôles : trois images chargées, matrices 3D, cinq faces et une seule active, liens et boutons dans les cartes, absence de débordement, tours positifs et négatifs au-delà d'une révolution, clavier, pointer events synthétiques horizontaux/verticaux, mouvement réduit et portrait absent. Les portes annoncent 2 200 ms dans Web Animations et restent présentes après l'ancien délai de nettoyage de 1 400 ms ; navigation et annulations restent fonctionnelles.

Corrections pendant la recette : clic sur la face courante sans transition fantôme ; erreur d'image survenue avant installation du listener ; hauteur des cartes et texte de réservation à 320 px ; focus maintenu quand le lien d'une carte devient inactif. Le détail des tentatives demeure dans les rapports.

Build optimisé avec la nouvelle durée, typage final, frontière client/secrets et configuration Netlify : PASS. Source applicative inchangée après le build ; modifications ultérieures limitées au HTML statique et aux tests. Environnements de recette expurgés des JSON archivés. Aucun Safari/Firefox, téléphone physique, compte privé, débit ou backend distant validé. Pas de garantie FPS.

Preuves : `assets/pentagon-carousel-2026-11-02/verification.json`, rapports JSON et captures. Captures navigateur `browser-desktop.png` et `browser-mobile.png` examinées. Checkout de recette : C:/Users/cashe/Documents/GYM-door-navigation-20261102, fichiers applicatifs vérifiés par empreinte. Serveur Next de test arrêté.

## Ouvrir et arrêter l'aperçu

**Aperçu local ouvert dans le navigateur : http://127.0.0.1:4321/**. Serveur statique Python lié uniquement à 127.0.0.1, racine limitée au dossier public de ce prototype, sans session applicative ni secret. PID observé 17148, session d'exécution 37872. Le serveur est laissé actif pour la revue. Les liens applicatifs sont désactivés et expliqués dans ce mode ; flèches, clavier et rotation restent fonctionnels.

Sans serveur, ouvrir index.html depuis son dossier avec les trois images à côté. Pour relancer un aperçu statique :

```powershell
python -m http.server 4321 --bind 127.0.0.1 --directory C:/Users/cashe/Documents/GetYourMentor/gym-next/public/design_assets/pentagon-carousel-2026-11-02
```

Arrêt dans le terminal de lancement : Ctrl+C. Pour le processus laissé actif par cette livraison, vérifier le PID et sa commande avant `Stop-Process -Id 17148`. Ne pas arrêter un nouveau processus qui aurait réutilisé ce numéro.

## Git et suite

Branche design/refonte-progressive-lot1, base de travail de7aec50b042f762b222880dba26a3ca55a17f04. Vingt modifications suivies antérieures préservées hors lot. Aucun changement à main, fusion, rebase, force-push, achat, publication ou déploiement. État du commit/push et SHA distant relu dans verification.json.

Livraison locale : commit applicatif **0ceaf59**. Push ordinaire réellement exécuté, rejet non-fast-forward (code 1) ; distant relu inchangé d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. Pas de nouvelle tentative identique ni contournement. Diff binaire des vingt changements antérieurs comparé à la sauvegarde du lot : strictement identique. Aperçu statique confirmé HTTP 200 après les tests et le commit.

Attendre l'avis utilisateur sur ce prototype avant de remplacer le moindre carrousel existant.
