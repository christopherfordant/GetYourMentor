# Réconciliation Git — 4 novembre 2026

Demande utilisateur explicite : « règle le problème de divergence ». Branche concernée : `design/refonte-progressive-lot1`, dépôt original GetYourMentor. Cette autorisation couvre la fusion contrôlée nécessaire, pas un force-push, un rebase ou un déploiement.

## Diagnostic et méthode

Après fetch, 52 commits propres au local (`4d0760f`) et neuf propres au distant (`d50b9eb`). Deux références locales de sauvegarde : `backup/divergence-local-20261104` et `backup/divergence-remote-20261104`. Fusion préparée dans `C:/Users/cashe/Documents/GYM-git-reconcile-20261104`, sans toucher initialement au dossier principal. Les deux historiques sont conservés dans les parents du commit de fusion.

Quatorze fichiers en conflit examinés. Les décisions les plus récentes priment sur les anciens états graphiques ; les textes distants historiques restent identifiés comme tels. Sont conservés le catalogue de 14 sports et sa validation, le header partagé, l'éventail, les portes de 2 200 ms, les travaux de réservation/Stripe/Telegram et le RAG récent. Sont intégrés l'export calendrier privé, les onglets clavier et leurs panneaux, le chargement autoritatif avec annulation/erreurs/404 et les états de notes sans avis. Les pages paiement/suivi partagent le header/footer actuels, sans rétablir l'ancienne navigation à quatre sports. Les tokens complémentaires nécessaires sont adaptés à la palette courante.

Deux incompatibilités d'intégration ont été reproduites et corrigées : une réserve fixe ancienne empêchait le footer de dégager la bannière cookies ; la poignée fixe des sections recouvrait le retour en haut à une position de défilement sur mobile. La réserve dynamique partagée est retenue, et les commandes du footer sont décalées de la poignée sur mobile. Le test de couverture utilise la visibilité réelle pour exclure les liens d'un `details` fermé, au lieu de se fier aux seules boîtes de mise en page.

## Préservation du travail non commité

Inventaire de 18 fichiers suivis modifiés et 380 fichiers non suivis. Empreintes, originaux et réapplication à trois versions préparés sous `delivery-private/preservation/` du checkout de fusion. Quatre bases ont changé : document maître, index docs, styles finaux et bannière cookies. La seule réapplication conflictuelle de brouillon est la bannière : conserver à la fois sa mesure et le wrapper local. Ces brouillons ne sont pas ajoutés au commit de fusion.

Le transfert au dossier principal utilise une sauvegarde Git conservée, une avance fast-forward vers la fusion et la restitution contrôlée des brouillons. Les fichiers non suivis ne sont ni retirés ni ajoutés. Les résultats effectifs de cette étape, les empreintes et la synchronisation distante doivent être lus dans `delivery-private/reconciliation-final.json` du dépôt principal. Les brouillons réappliqués restent des modifications locales non validées par les tests de la version commitée.

## Vérifications

- Typage TypeScript et build Next réussis sur la copie fusionnée.
- 26 tests Node et 12 évaluations lexicales de référence réussis.
- Six contrôles statiques réussis : configuration Netlify, frontière client/serveur, secrets suivis, schéma Supabase et contrats des routes RAG search/context.
- Premier lot navigateur : 33 scénarios, 32 réussis et un échec footer ayant révélé les incompatibilités ci-dessus. Après correction et rebuild, les six combinaisons onglets/footer sur ordinateur et mobile réussissent. Les 30 autres scénarios distincts de ce lot couvrent calendrier privé, profils, catalogue, webhook Stripe et préférences Telegram ; leurs appels restent de démonstration.
- Aucun test global de toute l'application ni essai de paiement réel revendiqué. Les détails et limites sont dans [checks.json](assets/git-reconciliation-2026-11-04/checks.json). Traces et journaux bruts restent dans le checkout privé, hors commit.

## Push et séparation du déploiement

Lecture seule de la configuration Netlify : la démo isolée n'est pas reliée à Git ; l'ancien site relié à ce dépôt suit `feat/nextjs-migration`, seule branche autorisée. Aucun réglage Netlify n'a été changé. Le commit final porte aussi `[skip netlify]`, mécanisme documenté pour pousser sans déployer : [documentation officielle](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/). Les workflows GitHub examinés ne déclenchent pas les gates push sur la branche design ; aucun workflow manuel n'est lancé dans ce lot.

Le push est ordinaire, sans réécriture. La livraison n'est considérée synchronisée qu'après comparaison du HEAD local, de la référence distante et de la divergence `0 / 0`. Preuve finale hors commit dans `delivery-private/reconciliation-final.json`, pour enregistrer le SHA du commit qui contient ce rapport. Aucune migration Supabase ou commande de déploiement n'a été exécutée dans ce chantier.
