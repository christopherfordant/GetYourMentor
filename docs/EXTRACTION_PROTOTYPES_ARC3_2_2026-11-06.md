# ARC3.2 — démonstrations hors du site publié

## Livraison du 6 novembre 2026

Les **quatre pages HTML** de démonstration et les deux fichiers propres à la comparaison des carrousels (`demo.js`, `style.css`) ont quitté `gym-next/public/design_assets` pour `prototypes/design-assets`. **Six déplacements avec octets et SHA256 conservés**, sans suppression des originaux historiques dans Git. Les 110 autres fichiers publics restent inchangés, notamment `entrance.js`, les équipements du header, portraits, logos et captures des portes.

Le serveur **http://127.0.0.1:4336/** donne accès aux quatre démonstrations. Commande et destinations : [guide des prototypes](../prototypes/README.md). Il est indépendant de Next et ne publie rien sur Netlify. Les anciennes URLs `/design_assets/...` fonctionnent sur cet aperçu local uniquement ; aucune redirection n'est ajoutée au produit.

## Mise en œuvre

- Manifeste explicite [prototypes/manifest.json](../prototypes/manifest.json) : 109 ressources HTML/JS/CSS/images servies, dont six déplacées et 103 conservées dans public. Sept autres fichiers publics de métadonnées/source ne sont pas exposés par cet aperçu. Ce manifeste est local au dépôt, pas une nouvelle API publique.
- Résolution exacte des chemins, contrôle du chemin réel avant lecture, refus des liens symboliques, traversées, chemins inconnus, méthodes d'écriture, Host inattendu et Origin externe. Aucune exploration HTTP des répertoires, route API, compte ou fichier privé. CSP sans connexion réseau ni formulaire, absence de cache et serveur lié à IPv4 loopback. Ce contrôle local n'est pas une sandbox contre un opérateur modifiant les fichiers du dépôt.
- `.gitattributes` conserve les fins de ligne des six archives pour rendre les empreintes indépendantes de la normalisation Git. Les HTML, CSS et JS historiques ne sont pas réécrits pour adapter leurs liens : l'aperçu résout leur arborescence virtuelle commune.
- Les trois suites Playwright concernées utilisent une fixture partagée qui démarre et arrête un serveur loopback sur port éphémère. Leurs contrôles applicatifs restent dans la suite habituelle ; la recette autonome les exclut explicitement. Pas de modification de la configuration Playwright existante ni de ses changements antérieurs.
- Le contrôle du mouvement réduit a été séparé en deux tests : header réel et démonstration autonome. Les deux responsabilités sont conservées. Les nouvelles captures de recette ne remplacent plus les anciennes preuves datées.
- Cinq rapports de démonstration ont reçu un avertissement et un lien actuels ; leur historique est conservé. L'inventaire ARC3.1 reste une photographie avant déplacement, pas une description de l'arbre courant.

## Contrôles et preuves

Voir [checks.json](assets/prototype-extraction-2026-11-06/checks.json), [extraction.json](assets/prototype-extraction-2026-11-06/extraction.json) et [browser.json](assets/prototype-extraction-2026-11-06/browser.json).

- Quatre tests Node du serveur : exposition limitée, refus des traversées et origines, manifeste dangereux refusé, téléchargement des 109 ressources avec comparaison SHA256. Six anciens fichiers absents de public.
- Seize scénarios Playwright de démonstration : portes à 2,2 secondes, annulation et captures manquantes ; objets, restauration et mouvement réduit ; pentagone sur plusieurs largeurs, rotations, clavier, tactile et portrait manquant.
- Quatre démonstrations chargées sur ordinateur et mobile, images présentes, aucune erreur JavaScript, réponse en échec ou requête externe pendant l'essai. Éventail testé à 20 cartes et au-delà d'un tour dans les deux sens. Captures archivées ; rendu de l'éventail ordinateur et des équipements mobile également examiné visuellement.
- Contrôle TypeScript et 35 tests de l'atelier/Kanban. Kanban vérifié sur ordinateur et mobile sans modifier le localStorage de l'utilisateur. ARC3.2 terminé, parent ARC3 en cours et ARC3.3 restant en backlog.

Un premier essai a signalé le test qui mélangeait site et aperçu ; il a été séparé, puis contrôlé à nouveau. Un problème d'import ESM dans le runner Playwright a conduit à partager le cœur CommonJS typé entre la CLI ESM et la fixture, sans changer la configuration globale du projet. Les résultats finaux et leurs limites sont consignés dans les preuves, sans masquer ces corrections.

## Limites et suite

Les liens métier du pentagone historique ne sont pas des parcours utilisables sur cet aperçu statique ; ils nécessitent le vrai site. Les noms et images de démonstration restent ceux de l'archive, sans création de profil ou modification des données. Le carrousel du produit et sa transition de pages ne sont pas modifiés.

**ARC3.3 reste nécessaire avant de clôturer ARC3** : build isolé, vérification du contenu publié et des ressources applicatives conservées, contrôles représentatifs du vrai site et absence des prototypes dans le candidat. Aucun build global ni test du header applicatif n'est revendiqué dans ARC3.2. Aucun service distant, migration, compte, paiement, notification ou déploiement.

Restauration : mapping et empreintes dans le manifeste, procédure prudente dans le guide. Ne pas fusionner les anciens worktrees dont l'historique a été nettoyé et ne pas écraser un éventuel fichier recréé à l'ancien emplacement.
