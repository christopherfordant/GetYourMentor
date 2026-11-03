# Footer : alignement des disciplines — 3 novembre 2026

Périmètre : rubrique « Disciplines » uniquement, sans déploiement. Le footer actif est `SiteFooter`, alimenté par le catalogue partagé de quatorze sports. L'examen initial constate une seule colonne dans le DOM et les styles, pas deux listes structurées ; les liens dépassent les quatre lignes des autres rubriques. Les captures avant et le relevé de géométrie conservent ce constat.

Correction : classe CSS Module spécifique à cette rubrique, grille de deux colonnes avec lignes communes, titre sur les deux colonnes. Les liens d'une même ligne commencent à la même hauteur, y compris lorsqu'un libellé revient à la ligne. L'alignement en haut du texte remplace son centrage vertical dans la cellule, avec six pixels de marge intérieure verticale. Ordre du catalogue, intitulés, quatorze destinations et autres rubriques inchangés. Sous 481 px, retour à une colonne dans cette rubrique pour éviter des demi-colonnes trop étroites ; aucune réorganisation du reste du footer.

Fichiers applicatifs : `gym-next/components/SiteFooter.tsx` et `footer-disciplines.module.css`. Pas de modification des animations, API, comptes, données ou services distants. Pas de nouvelle dépendance. Modifications antérieures non vérifiées préservées.

Recette : checkout isolé existant `C:/Users/cashe/Documents/GYM-fan-20261103`, uniquement ces deux fichiers superposés à la dernière livraison locale ; serveur arrêté pendant la reconstruction. Relance par `node delivery-private/start-preview.cjs`. Aperçu : http://127.0.0.1:3004/#mentors puis footer en bas de page ; accès direct via la touche Fin.

Script et preuves : `assets/footer-disciplines-2026-11-03/check.cjs`, captures avant/après à 1440, 768, 390 et 320 px, géométrie et destinations dans `before.json` / `after.json`. Pas de prétention de compatibilité générale Safari/Firefox ou appareil physique. Aucun déploiement Netlify ; revue locale avant toute publication.

## Résultats

Build optimisé avec typage PASS ; frontière client/serveur et configuration Netlify PASS. Les quatre largeurs sont contrôlées : deux colonnes à 1440/768, une à 390/320, aucun débordement horizontal. Pour les sept paires de sports à deux colonnes : haut de cellule et haut du texte égaux à moins d'un pixel, y compris après le cinquième sport. Comparaison avant/après des quatorze couples libellé/lien identique. Les quatorze liens suivis en HTTP local renvoient 200. Captures ordinateur et mobile examinées ; capture finale ordinateur reprise après disparition du bandeau cookies pour montrer la rubrique entière. Contrôle fil rouge avant push PASS, sorties antérieures restaurées octet pour octet. Pas de suite métier complète pour cette correction CSS isolée.

Serveur local final session 22015. Branche `design/refonte-progressive-lot1`, base locale `faa44eb`. Distant divergent préexistant : pas de force-push ni fusion. Les validations locales ne prouvent pas une mise en ligne.
