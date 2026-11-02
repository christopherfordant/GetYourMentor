# Liens et publication Netlify — 2 novembre 2026

Demande utilisateur : vérifier les liens puis publier le site. Cible existante confirmée par l'API : https://getyourmentor-demo-20261014.netlify.app, site `86e0379e-4d1a-4cf0-936c-1439397354f4`. Aucune liaison automatique à un dépôt Git sur ce site. La publication directe est distincte de la synchronisation Git toujours divergente.

## Vérification locale

Source candidate : `4388ce24b996b5ba244fecbf74932505ebc51dbe`, incluant les portes à 2,2 secondes, les profils enrichis et le pentagone sans encadré. Checkout isolé `C:/Users/cashe/Documents/GYM-links-netlify-20261102`. Les vingt modifications suivies antérieures du dépôt principal sont exclues et sauvegardées ; aucun fichier d'environnement privé copié.

Parcours Playwright en lecture seule : toutes les routes statiques connues comme points de départ, puis les liens HTML rendus, y compris les cartes non actives du pentagone, paramètres sport/ville, fiches et ancres. **228 pages ou variantes et 456 URL de liens**, file d'attente épuisée. Aucun lien public cassé ou fragment manquant observé. Aucun lien HTTP externe dans cet ensemble rendu. Les images/documents liés ont également été demandés en GET : 25 ressources lors du premier passage, puis 12 en continuation, sans erreur ; ces nombres se recoupent et ne sont pas additionnés.

La seule réponse 404 est `/admin/knowledge`, semée directement par l'inventaire des routes : refus volontaire sans rôle administrateur et sans activation de la recherche privée, confirmé dans son code. Aucun lien depuis une autre page publique vers cette route ; seul son écran 404 se référence lui-même. Cette protection n'est pas modifiée.

Le premier passage était borné à 200 pages ; les 27 URL restantes ont été reprises avec les pages et liens déjà connus, jusqu'à 228 pages et zéro URL restante. Les captures de données de ressource détaillées de continuation portent sur ses 12 ressources ; le journal du premier passage atteste séparément ses 25 ressources. Rapport et journaux : `assets/links-netlify-2026-11-02/local-links.json` et `local-links-pass*.log`.

Limites : vérification anonyme des URL réellement découvertes, pas de toutes les combinaisons théoriques ni des téléchargements privés. Aucun formulaire soumis, réservation créée, paiement, message ou compte réel modifié. Les deux défauts de tests métier déjà documentés restent distincts de cette vérification de liens. Aucun score global de sécurité, SEO ou performance revendiqué.

## Préparation et publication

Procédure existante `gym-next/scripts/deploy-isolated-demo.py`, d'abord `--prepare-only`, puis `--prepared`. Contrat : source Git complète identique, paquet et BUILD_ID identiques entre préparation et publication, serveur Next matérialisé dans le ZIP, taille contrôlée, frontière client/serveur contrôlée. Les variables distantes ont les six clés attendues du mode démonstration, sans Supabase, Stripe ou Resend. Aucun réglage distant ni secret modifié. Source, empreintes, résultat de déploiement et contrôles après publication sont consignés dans `assets/links-netlify-2026-11-02/verification.json`.

Les anciens prototypes, contrôles et versions sont conservés. La nouvelle vérification ne transforme pas une donnée de démonstration en donnée réelle.

## Résultat vérifié

Publication **réussie**, déploiement `6ae8a71262d2639172882244`, état `ready` et alias public confirmés par l'API. Source `4388ce24b996b5ba244fecbf74932505ebc51dbe`, BUILD_ID `zmOqhkoKQRVpXDg5srRFD`, SHA256 du paquet `62f8a839f099ffb29f752ec44bf1aee4cb05e7a4fe05b162edb8f459fa5ec632`. Le contrat des 486 fichiers applicatifs a été vérifié par la procédure, préparation et publication code 0. Aucun changement de source entre les deux.

Recette **sur l'alias public publié** : **242 pages ou variantes, 484 liens et 25 ressources**, zéro erreur inattendue et file d'attente vide. Seule la 404 d'administration protégée est conservée. Les cinq profils hébergés préexistaient : trois profils initiaux et deux fixtures de recette sans portrait. Aucun profil ajouté, supprimé ou corrigé pendant cette livraison. Cette différence explique le nombre de liens supérieur au catalogue local de trois profils.

Navigateur Playwright à 1440 et 390 px : les cinq faces parcourues dans chaque format, portraits disponibles chargés sur leur face active, repli sans fausse photo pour les deux profils sans portrait, bordure externe absente et aucune largeur débordante. Navigation vers une fiche et fin de l'ouverture 3D vérifiées. Captures `public-mentors-1440.png`, `public-mentors-390.png` et `public-coach-details.png`. Les images des faces inactives peuvent rester en chargement différé ; la vérification a donc porté sur chaque face lorsqu'elle devient active, pas sur un chargement simultané supposé.

Health HTTP 200, mode `demo` et prêt ; API de catalogue et aperçu HTTP 200, champs privés absents des projections. Robots.txt interdit l'exploration et les métadonnées des pages accueil/annuaire/séances indiquent `noindex, nofollow`. L'en-tête X-Robots-Tag est absent sur les réponses contrôlées ; il n'est pas présenté comme vérifié. Ce site reste une démonstration isolée, sans paiement ou notification externe.

Les journaux de build/publication bruts restent dans le checkout privé ; les preuves archivées sont les résultats sans environnement secret, les métadonnées Netlify, les empreintes et les captures. Statut du push documentaire dans `verification.json`, distinct de cette publication confirmée.
