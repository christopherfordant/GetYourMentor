# Footers partagés et flèche proche du titre — 3 novembre 2026

## Correction

Commande native `details/summary` conservée : quatre sports visibles par défaut, dix supplémentaires dépliables. Le libellé « Disciplines » et le chevron forment maintenant un seul groupe cliquable, séparés par **8 px**, au début de la colonne. Plus de flèche ancrée au bord droit près de « Support ». Aucune largeur de titre fixée arbitrairement, mesure JavaScript ou dépendance ajoutée.

Le titre de rubrique sémantique reste présent pour les lecteurs d'écran et conserve sa place dans la grille ; le libellé visuel appartient à la commande native. Son nom accessible inclut le titre et le nombre de sports supplémentaires. Le texte visuel du contrôle est masqué à l'accessibilité pour ne pas ajouter une seconde lecture de ce libellé. Clic, Entrée/Espace et focus conservés ; la zone cliquable comprend le titre et le chevron, minimum 32 px en hauteur.

Fichiers applicatifs : `gym-next/components/SiteFooter.tsx`, `footer-disciplines.module.css`. Les autres rubriques, les données, les animations et les droits ne changent pas.

## Inventaire des routes actives

L'inventaire montre que les footers actifs concernés utilisent **déjà le même `SiteFooter`**, directement ou par un wrapper. L'harmonisation consiste donc à corriger ce composant commun et à vérifier sa propagation, sans recopier des footers ni réactiver les anciens modèles.

| Parcours | Composant / état réellement observé |
| --- | --- |
| Accueil | `SiteFooter` direct |
| Recherche, annuaire, fiche coach, créneau, récapitulatif | `DiscoveryFrame` → `SiteFooter`, y compris récapitulatif sans référence valide |
| Séances, structures, offres, contenus, suivi, plan du site | `DiscoveryFrame` → `SiteFooter` |
| Compte et variantes coach/club | `AccountFooter` → `SiteFooter` ; vues anonymes seulement |
| Paiement | `PaymentFooter` → `SiteFooter` ; écran sans réservation valide, aucune transaction |
| Inscription structure | `SiteFooter` direct |
| Six pages légales | `SiteFooter` direct |
| Administration connaissances | HTTP 404 pour cette session ; footer public d'erreur, aucun écran privé consulté |
| Galerie locale `/demo-portraits` | Aucun footer, exception intentionnelle de maquette conservée |
| Page d'information `/demo`, écran de production indisponible | Sources consultées : page d'information autonome sans footer, indisponibilité réutilisant `SiteFooter` ; pas de recette dans ces modes d'environnement |

Les blocs historiques commentés de l'ancien footer de compte, les prototypes statiques et l'ancien accueil inutilisé sont conservés. Pas de transformation d'une page sans footer en page avec footer sans justification.

## Vérifications exécutées

**25 parcours/variantes × 2 largeurs (1440/390) : 50 observations.** Sur 48 vues avec footer : un seul footer, mêmes rubriques et couples libellé/lien, quatre puis quatorze disciplines, Entrée/Espace fonctionnels, écart titre/chevron de 8 px, aucun débordement horizontal. Deux vues de la galerie conservent zéro footer. Seul `/admin/knowledge` renvoie 404, comme attendu ; autres chemins 200. Les trois variantes de compte restent des vues anonymes, pas une validation de tableaux de bord authentifiés.

Styles calculés du footer identiques sur les 48 observations : fond `rgb(28,28,28)`, texte `rgb(252,251,249)`, famille `system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`. Les réglages responsive du composant partagé restent communs ; captures accueil/compte/paiement/légal sur ordinateur et mobile dans `assets/footer-unification-2026-11-03/`. Captures avant reprises des preuves de la livraison précédente, pas d'un état reconstruit supposé.

Différence de gabarit préservée : sur mobile, les conteneurs compte/paiement conservent leurs marges intérieures latérales de 14 px ; le footer y suit la largeur disponible (362 px à une fenêtre de 390), tandis qu'accueil/légal occupent 390 px. Le padding propre au footer reste identique, 20 px vertical / 18 px horizontal dans ces exemples. Il ne s'agit donc pas d'une refonte des marges des pages ou d'une promesse de géométrie extérieure identique. Les vues privées authentifiées et le paiement avec une réservation valide restent non recettés dans ce lot.

Build optimisé et typage PASS, frontière client et configuration Netlify PASS. Pas de nouvelle suite métier complète pour cette correction commune ; aucun accès authentifié ou service distant testé. Chromium seulement, pas de téléphone physique, Safari ou Firefox. Les liens sont comparés à l'identique entre les footers, sans revendiquer un nouveau crawl de toutes leurs destinations.

Preuves : `verification.json`, captures et `check.cjs`. Aperçu http://127.0.0.1:3004/ (footer en bas), checkout `C:/Users/cashe/Documents/GYM-fan-20261103`, relance `node delivery-private/start-preview.cjs`, session 43318. Build effectué serveur arrêté. Modifications antérieures non vérifiées exclues. Aucun achat, migration ou déploiement Netlify. Divergence Git antérieure préservée, sans fusion ni force-push autorisés.
