# Accueil : neuf cartes dans l'éventail — 3 novembre 2026

## Demande et réalisation

L'utilisateur souhaite un éventail plus fourni directement à l'accueil. Les trois profils du catalogue ne suffisent pas à juger la composition. Cette consigne autorise l'utilisation locale des six portraits de démonstration déjà produits ; aucune nouvelle génération ImageGen.

L'accueil affiche **neuf cartes distinctes** en recette : trois profils du catalogue existant et six illustrations fictives (CrossFit, padel, Pilates, musculation, boxe, préparation physique). Chaque carte supplémentaire indique « Profil fictif de démonstration » et « Aucune séance proposée ». Pas de faux nom de personne, avis, diplôme, tarif, disponibilité ou compte créé. Aucun doublon de portrait pour augmenter artificiellement l'effectif.

Les six cartes ne sont pas ajoutées aux données persistées ni aux résultats de recherche. Elles ouvrent `/demo-portraits?portrait=...#portrait-detail`, avec l'image correspondante, sa nature fictive et un retour à l'accueil. Les trois profils du catalogue gardent leurs liens et parcours existants.

## Conditions et limites

Le drapeau `showDemoPortraits` est émis par l'API seulement dans l'environnement local de recette : mode de recette + CI + URL loopback + autorisation démo. Le lecteur de payload exige un booléen et l'ignore hors données démo. La galerie utilise la même condition partagée `isLocalPortraitPreview`. Aucun composant client ne lit de secret.

Les illustrations sont ajoutées uniquement après un résultat valide non vide ; aucun remplissage fictif sur erreur ou catalogue vide. Les états de chargement, erreur, reprise et absence de résultats sont préservés. Le nombre de profils réels et l'ajout des six illustrations sont indiqués séparément sous le titre de section. L'API reste bornée à six profils du catalogue ; en recette actuelle, elle en fournit trois, puis l'interface ajoute les six cartes visuelles séparées. Aucun changement de schéma, migration ou service distant.

Le site Netlify est inchangé. Cette livraison enrichit l'aperçu local, sans prétendre recruter de vrais coachs. Une utilisation publique de profils de démonstration devra conserver cet étiquetage et faire l'objet d'une décision de publication séparée.

## Aperçu et vérifications

Checkout de recette réutilisé : `C:/Users/cashe/Documents/GYM-fan-20261103`, environnement isolé et lanceur existants. http://127.0.0.1:3004/#mentors ; relance `node delivery-private/start-preview.cjs`. Les changements antérieurs non validés du dépôt principal sont exclus.

Script ciblé : `assets/home-nine-coaches-2026-11-03/check.cjs`, résultats `verification.json`, captures aux largeurs 1440/390/320. Suite `mentor-carousel.spec.ts` adaptée à neuf cartes en recette et complétée par les contrôles du drapeau local et de sa validation ; les scénarios de données explicitement simulées sans ce drapeau gardent leur effectif propre. Les sources et images de la livraison précédente restent conservées.

Respect des portes 2,2 secondes : code de transition non modifié. Les validations et la situation Git finales sont à lire dans les preuves de cette livraison ; aucun déploiement implicite.

## Résultats exécutés

- Build optimisé et TypeScript final PASS ; frontière client/serveur et configuration Netlify PASS.
- **28 tests PASS**, 14 ordinateur et 14 mobile, un worker. Journal `assets/home-nine-coaches-2026-11-03/tests.txt`. La suite couvre aussi le parcours catalogue vers fiche et les états de chargement, erreur, reprise et vide.
- Contrôle complémentaire à 1440/390/320 : neuf cartes, trois profils existants, six portraits distincts, images chargées, absence de débordement de page, clavier et tours complets dans les deux sens PASS. Six liens de portrait vérifiés individuellement ; état vide sans insertion fictive PASS. L'API renvoie toujours trois profils du catalogue, pas neuf comptes. Ce contrôle recoupe la suite ; pas d'addition des relances.
- Le focus clavier conserve son contour accessible ; captures de présentation prises après retrait du focus, sans ajouter d'encadrement décoratif. Navigateur connecté : navigation effectuée, mais défilement Playwright bloqué sur l'attente de stabilité ; tentative de lecture suivante interrompue. Les preuves de rendu proviennent du Chromium local contrôlé, pas de cette session connectée.
- Contrôle fil rouge avant push PASS ; fichiers de sortie de gouvernance antérieurs restaurés octet pour octet. Les vingt modifications antérieures restent exclues.

Serveur local final : session 69737, port 3004. Branche `design/refonte-progressive-lot1`, dernier commit de base `f0a3fec`. Divergence distante préexistante ; aucun force-push, fusion ou déploiement autorisé dans ce lot.
