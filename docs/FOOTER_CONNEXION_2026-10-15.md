# Footer, utilitaires et présentation de connexion — 15 octobre 2026

## Décision et réalisation

La dernière demande remplace le placement précédent des utilitaires après le footer. Une zone réservée au début du footer accueille « Préférences cookies » et « Retour en haut », avant les liens. Le z-index 2 ne sert pas à compenser un manque d’espace : les contrôles restent dans le flux et se réorganisent sur petit écran.

`FooterUtilities` monte une seule instance de chaque contrôle. Un portail React place le bouton de préférences et la flèche dans `FooterUtilitySlot`, sans déplacer manuellement des nœuds gérés par React. La bannière initiale reste gérée séparément, hors du footer. Le choix de consentement est conservé ; après réouverture au clavier, le focus revient au bouton de préférences.

La flèche typographique est remplacée par un SVG symétrique, dans une cible 44 × 44 px avec centrage grid. Le retour utilise le défilement réel vers zéro même si une page ne possède pas d’identifiant `top`. Le mouvement réduit est respecté.

Le footer commun conserve ses groupes et liens utiles, en quatre colonnes sur grand écran et deux sur mobile. Sa marque et ses liens se placent côte à côte sur desktop pour réduire la hauteur. Les ancres « Comment ça marche » et « Tarifs » visent les sections actuelles de l’accueil. Les footers de l’accueil et de la découverte conservent leurs contenus et reçoivent la même zone d’utilitaires. Les pages courtes utilisent un contenu principal extensible ; pas de footer fixé au viewport.

## Réseaux sociaux — informations manquantes

La recherche dans les documents Markdown, les extractions `project_readable` et les annotations des PDF n’a identifié aucune URL officielle de compte GetYourMentor. Les deux liens YouTube de « Stratégie perplexity » sont des vidéos de référence, pas les comptes de la marque. Les anciennes ancres fictives du footer commun sont supprimées.

`gym-next/lib/social-links.ts` centralise les futurs liens confirmés ; `SocialLinks` fournit les icônes et noms accessibles. La liste reste vide tant que les URL officielles ne sont pas fournies. Aucune fausse destination ni mention technique n’est ajoutée dans le site. Une question ciblée a été adressée au propriétaire ; cela ne bloque pas les autres corrections.

## Connexion : état réel

Les anciens boutons « Gmail » et « Google » n’avaient aucun handler OAuth. Le mécanisme existant reste le formulaire email/mot de passe, dont le bouton porte maintenant une enveloppe à gauche. Il est vérifié en recette avec des comptes de test ; une configuration réelle des services reste nécessaire hors démonstration. Son libellé « Se connecter », les sessions et les redirections ne changent pas.

La présentation Google utilise un seul bouton par écran d’authentification, désactivé, avec une explication visible : connexion indisponible, utiliser l’adresse email. Aucun SDK, fournisseur, endpoint de callback ou connexion Google fictive n’est ajouté. Son activation future nécessitera un lot d’authentification et une configuration OAuth distincts ; les icônes ne rendent pas ce parcours opérationnel.

L’icône est téléchargée sans modification depuis [Google](https://developers.google.com/static/identity/images/g-logo.png), via les [consignes officielles de marque](https://developers.google.com/identity/branding-guidelines), consultées le 15 octobre 2026. Fichier local, proportions conservées, fond blanc, aucun appel Google au chargement de l’application. Provenance également enregistrée à côté de l’asset.

## Vérification et livraison

Build et typage exécutés en worktree isolé depuis `8d021d3`, à partir des seuls changements indexés du lot. Les modifications préexistantes de `layout.tsx`, `CookieConsentBanner.tsx` et `AccountLegacyPage.tsx` sont conservées dans le checkout principal mais exclues du candidat isolé et du commit ciblé. Aucun changement des API d’authentification, de paiement, des droits, de la commission de 15 % ou des politiques RLS.

La recette vérifie les quatre largeurs, le centrage et les intersections réelles des contrôles avec les liens, le footer d’une page courte, l’absence de doublons, la persistance des préférences, le clavier, les icônes de connexion et Google désactivé. Non-régression prévue : comptes coach, accueil, découverte et tunnel métier. Résultats finaux et empreintes : `assets/footer-connexion/verification.json` ; captures dans le même dossier. Journaux locaux : `gym-next/playwright-artifacts/footer-auth/`.

Résultats : **build et typage PASS**, campagne **56/56 tests PASS** (comptes 14, tunnel métier 10, découverte 12, accueil 10, footer/connexion 10), puis **20/20 tests ciblés PASS** après retrait du lien de retour en haut en double et de la ligne descriptive du footer commun. Un worker, aucun paiement réel. Frontière client/serveur du bundle, configuration Netlify et secrets suivis PASS. Les assertions de footer portent sur sa hauteur, le centrage, les intersections et le bas du viewport, pas uniquement sur une couleur CSS attendue. Aucune validation OAuth réelle, RLS distante ou CI distante prétendue.

| Vue | Desktop | Mobile |
| --- | --- | --- |
| Accueil avant | [avant](assets/footer-connexion/avant-home-desktop.png) | [avant](assets/footer-connexion/avant-home-mobile.png) |
| Accueil corrigé | [desktop](assets/footer-connexion/home-1440.png) | [mobile](assets/footer-connexion/home-390.png) |
| Compte et connexion | [desktop](assets/footer-connexion/compte-1440.png) | [mobile](assets/footer-connexion/compte-390.png) |
| Recherche | [desktop](assets/footer-connexion/recherche-1440.png) | [mobile](assets/footer-connexion/recherche-390.png) |

Les premières vérifications ont révélé un footer d’accueil non repliable sur tablette et des titres hérités trop clairs. Ces défauts sont corrigés. Les tests attendent désormais l’initialisation du contrôleur de cookies et mesurent le bouton/SVG dans une même lecture de géométrie, sans confondre le défilement avec un décentrage.

Branche de livraison : `design/refonte-progressive-lot1` ; le SHA et sa synchronisation distante se vérifient dans Git à chaque reprise. Aucun force-push, fusion ou déploiement. Retour arrière : revert du commit du lot, sans reset des travaux locaux ni des données.
