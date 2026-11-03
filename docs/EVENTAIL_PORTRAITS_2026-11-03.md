# Éventail intégré et six portraits — 3 novembre 2026

## Décision et périmètre

L'utilisateur valide la proposition 03 du comparateur : éventail horizontal large, cartes carrées et rotation manuelle continue. Cette décision lève l'attente de choix pour cette variante et autorise l'intégration locale, six portraits et leur aperçu. Aucun achat, déploiement, migration distante ou changement de compte réel.

Inventaire : `EditorialHome` monte `MentorPreviewSection`, seul carrousel actif concerné. `CenteredCarousel` n'a plus de consommateur ; `PentagonCarousel` est conservé comme historique mais n'est plus monté. Le parcours de `HomePageClient` appartient à l'ancien accueil, non utilisé ici et portant des modifications antérieures : préservé. Les grilles d'annuaire, séances et sections latérales restent adaptées à leur rôle.

## Intégration

Composant réutilisable `FanCarousel` : tous les éléments reçus, identifiants stables, un seul exemplaire de chaque carte, index circulaire, commandes précédent/suivant, Home/End, clavier et balayage horizontal. Aucune lecture automatique. Lorsqu'une carte contenant le focus devient inactive, le focus revient à la scène avant sa désactivation ; les cartes latérales sont inertes, les actions restent sur la carte centrale. Les cartes plus éloignées que trois positions sont masquées visuellement.

Cartes carrées de 280–340 px sur ordinateur, 78vw plafonnés à 310 px sur mobile, scène large sans encadrement. La préférence de mouvement réduit supprime l'animation et le relief. Un profil garde une carte centrale sans commande active ; zéro résultat utilise l'état vide existant. Chargement, erreur et reprise gardent le fetch validé et son annulation. Le nombre n'est plus découpé en groupes de cinq ; aucun remplissage par cartes promotionnelles.

La carte compacte conserve identité, discipline, spécialité, ville, prix disponible et lien vers la fiche. Présentation longue, modalités et précisions restent dans la fiche existante ; la réserve montant/durée est visible sous le titre de section. La légende courte « Illustration IA · démo » s'applique seulement à ces cartes, sans modifier les légendes de l'annuaire ou de la fiche.

**Limite de données conservée** : l'aperçu public reçoit au plus six profils (contrat serveur existant). Le composant accepte davantage d'éléments, sans prétendre charger tout l'annuaire. Les cas 8 et 20 sont exercés dans une maquette locale clairement identifiée ; aucune API publique rendue illimitée. « Voir tout » conserve l'accès à l'annuaire.

## Images et provenance

La provenance antérieure confirme ImageGen intégré : `IMAGES_IA_2026-10-28.md`, prompts et manifeste associés. Dix appels distincts à `image_gen` intégré : six initiaux puis quatre corrections de périmètre. Le lot final retenu couvre **CrossFit, padel, Pilates, musculation, boxe et préparation physique**, tous présents dans le catalogue. Tennis, yoga, natation et course à pied, absents de ce catalogue, sont écartés de la galerie finale et conservés dans l'historique. Aucun CLI/API facturant via une clé ajouté. Les compteurs de consommation ne sont pas accessibles et aucun solde n'est prétendu.

Prompts exacts : `assets/ai-coaches-2026-11-03/generation.json` et `generation-corrections.json`. Les PNG originaux sont préservés dans `assets/ai-coaches-2026-11-03/originals/`, en plus des sorties ImageGen ; planche finale `planche.jpg`, planche et variantes initiales conservées séparément. Versions publiques optimisées dans `gym-next/public/design_assets/ai-coaches-2026-11-03/`, WebP carrés 640/1280, empreintes et poids dans `manifest.json`. La planche initiale a été examinée ; le contrôle de la sélection corrigée et les poids définitifs sont consignés avec les résultats finaux. Une inspection de planche ne garantit pas l'absence de tout artefact fin.

Les images restent des illustrations de personnes fictives. Aucun nouveau coach inscrit, qualification, témoignage, prix ou créneau ajouté. Aucun portrait attribué à un utilisateur réel. Les trois profils historiques de l'accueil gardent leurs images existantes.

## Aperçu

Checkout isolé : `C:/Users/cashe/Documents/GYM-fan-20261103`, base `903a568`. Dépendances existantes réutilisées par jonction, Next exécuté 15.5.27 ; pas de téléchargement ou modification du lockfile. Les vingt changements antérieurs du dépôt principal ne sont pas inclus dans l'aperçu.

- Application : http://127.0.0.1:3004/#mentors
- Galerie et éventail des six images : http://127.0.0.1:3004/demo-portraits
- Effectifs de maquette : `?count=0`, `1`, `2`, `6`, `8`, `20`. Au-delà de six, répétitions explicitement nommées, pas de nouvelles identités.

Route de galerie dynamique et noindex, accessible seulement lorsque les deux indicateurs locaux `GETYOURMENTOR_ACCEPTANCE_MODE` et `GETYOURMENTOR_ALLOW_DEMO` sont vrais. Sinon `notFound()`. Aucun ajout à la navigation publique ni au sitemap. Les images elles-mêmes sont des ressources publiques non sensibles lorsqu'elles seront éventuellement déployées.

Relance : `node delivery-private/start-preview.cjs` depuis le checkout. Lanceur loopback, clé de session éphémère, environnement filtré sans configuration de fournisseurs externes, paiement local. Build via `node delivery-private/build.cjs`, serveur arrêté avant toute reconstruction de ses artefacts. Les démonstrations statiques précédentes restent conservées.

## Contrôles et limites

Preuves : `assets/fan-integration-2026-11-03/verification.json`, captures ordinateur/mobile et script reproductible `check.cjs`. Tests de régression `gym-next/tests/mentor-carousel.spec.ts` adaptés à l'éventail tout en conservant projection publique, bornage et parcours vers la fiche. Ne pas additionner les relances.

Défauts intermédiaires documentés : débordement de ligne sous image corrigé avec affichage block/conteneur ; contraste galerie corrigé par palette claire ; légende raccourcie sur les cartes carrées. Une assertion de recette supposait Steven premier, alors que l'API trie autrement : corrigée pour comparer l'identifiant réel du lien. Premier lancement de la suite configuré par erreur vers 3001 : connexion refusée, puis configuration isolée explicite vers 3004. Les premiers contrôles de frontière exécutés hors du bon dossier ou pendant la reconstruction signalaient des artefacts absents ; seul le contrôle final sur build terminé fait foi.

Pas de validation Safari/Firefox ou appareil physique, ni de service distant ou réservation réelle. Ouverture des pages inchangée dans le code, durée 2 200 ms à vérifier dans les preuves finales. Aucun déploiement Netlify.

### Résultats exécutés

- Build optimisé final, typage inclus : PASS ; Netlify et frontière client/serveur : PASS. Avertissements Autoprefixer historiques `start/end` hors lot, pas d'erreur de compilation. Premier build validé puis reconstruit après les corrections visuelles et la sélection de portraits.
- Suite ciblée adaptée : **26/26 PASS**, 13 ordinateur + 13 mobile, un worker, configuration isolée pointant explicitement vers 3004. Projection publique, bornage, 320/390/768/1440, effectifs 1/2/5/6, focus, clavier, absence de remplissage et parcours fiche. Journal `assets/fan-integration-2026-11-03/mentor-tests.txt`.
- Contrôle complémentaire du composant : **18 combinaisons PASS**, 0/1/2/6/8/20 éléments à 1440/390/320 px ; erreur/reprise, portrait absent, texte long, geste tactile Chromium et navigation vers le bon coach PASS. Trois animations de porte mesurées à **2 200 ms**. Résultats dans `verification.json` ; les cas à 8/20 restent des répétitions de galerie, pas des coachs disponibles. Ce contrôle recoupe la suite ciblée, sans additionner les relances comme des scénarios nouveaux.
- Galerie hors mode de recette : HTTP **404** effectivement reçu. L'arrêt du processus de sonde a ensuite émis une assertion libuv sous Windows (code 1) ; ce diagnostic d'arrêt est distingué du résultat HTTP. Le serveur normal a été redémarré sans erreur.
- Planche finale inspectée : six portraits distincts, cadrage et environnements cohérents avec les disciplines ; aucun défaut anatomique évident constaté à cette échelle. WebP 640 : **20 792 à 39 002 octets**. Aucun original écarté supprimé de l'historique.
- Contrôle fil rouge avant push : PASS, ses sorties antérieures préservées par sauvegarde/restauration octet pour octet. Contrôle des secrets suivis/indexés final PASS, diff du lot PASS. Une invocation du scanner depuis la racine, alors qu'il attend `gym-next`, a échoué sur le chemin Git ; relancé dans le bon dossier avant commit.
- Chargement local mesuré dans un contexte Chromium neuf : six ressources 640 récupérées en **25,6 à 62 ms**, chargement page observé à environ **642 ms**. Mesure ponctuelle sur localhost, sans valeur de performance publique ou promesse commerciale ; détails `local-load.json`.

Serveur final loopback sur 3004, session 39405. Aucun push réussi ni déploiement ne doit être déduit de ces validations locales ; le distant divergent reste à traiter séparément sans fusion ou force-push implicite.
