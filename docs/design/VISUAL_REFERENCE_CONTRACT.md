## Référence active — maquette HTML intégralement validée, 15 octobre 2026

Source : `C:/Users/cashe/Documents/GetYourMentor_Audit_Design_2026-10-15/maquette/index.html`, avec `style.css` et `app.js`. La validation actuelle porte sur l’ensemble de cette maquette et remplace les prescriptions incompatibles ci-dessous. Elle ne se réduit pas à une palette claire appliquée à l’ancien site.

- Base papier #F6F4F0, blanc, encre #141316, violet #872BBF, violet profond #612087, lavande #EEE4F7 et bordures #DEDBE3.
- Le header original est clair. Bande de valeurs, côté de l’espace de travail, feuille de route et navigation mobile reprennent les surfaces foncées prévues dans la maquette ; le refus antérieur d’un thème entièrement sombre ne les interdit plus. Aucun retour au bleu nuit/lime d’Emergent.
- Reprendre les compositions : hero texte/photo, étiquette violette, trois profils, trois panneaux de travail, trois cartes d’offres, feuille de route, sources adaptées et pied de page.
- Typographie, SVG, rythmes, espacements et rapports de colonnes dérivent du CSS source ; aucune police distante ni nouvelle bibliothèque.
- Onglets : sélection, flèches, Home/End, focus et panneaux masqués sémantiquement. Dialogues natifs : Échap, fermeture et retour du focus. Palette violette fixe : aucun sélecteur de coloris sur l’accueil (dernière instruction utilisateur).
- Fonctions existantes conservées par liens réels : recherche, quatre disciplines, compte, préférence de langue dans le footer, FAQ et pages légales. L’accueil adopte la navigation de la maquette ; le contrat des sept liens reste applicable aux pages héritées non encore reconstruites.
- Les offres et outils futurs restent descriptifs. Les aperçus ne créent ni achat, compte, message, abonnement ou réservation. Commission de référence 15 %, réglage administrable et montants historiques inchangés.
- Validation : 320, 390, 430, 621, 768, 900, 1024, 1280 et 1440 px. Mesurer le débordement avec clientWidth, pas innerWidth. Comparer maquette et application avec Playwright MCP et capturer les états interactifs.

Implémentation du premier lot : `EditorialHome.tsx`, `gym-editorial-design.css`, tokens partagés. Les règles sont bornées par `#gym-editorial`. Suivi et correspondance exhaustive dans `docs/REFONTE_PROGRESSIVE_2026-10-15.md`.

Déclinaison découverte : trois pages sous `#gym-discovery.discovery-editorial`, classes `de-*` et feuille partagée `gym-discovery-design.css`. Recherche texte/formulaire, annuaire résultats/proximité et fiche photo/informations reprennent le rythme éditorial, sans copier toutes les sections de l’accueil. Header commun avec noms, ordre DOM et sept destinations inchangés ; les groupes se réorganisent sur mobile. Sélecteurs natifs accessibles, panneaux de profil avec boutons d’état et sections masquées sémantiquement. Planning indicatif en colonnes réorganisées sur mobile, sans masquer les jours. Utilitaires cookies/retour en haut placés après le footer pour éviter le recouvrement des CTA. Aucun changement d’autorisation, de commission ou de paiement.

Précision active avant lecture des historiques : le lot footer place maintenant les utilitaires dans une zone réservée en tête de footer, et non après lui. La zone reste dans le flux, sans liens couverts ; SVG centré, cible 44 px, focus visible et retour en haut compatible avec reduced-motion. Les URL sociales non confirmées sont absentes de l’interface. Le bouton Google non branché est désactivé et expliqué ; Gmail ne constitue pas un fournisseur distinct. Voir `docs/FOOTER_CONNEXION_2026-10-15.md`.

### Historique des références remplacées


> **Arbitrage utilisateur du 15 octobre 2026 — refonte claire.** Les fonds sombres, le bleu nuit/lime et la disposition mobile figée sont remplacés pour les pages migrées par des surfaces claires, textes contrastés et accents violets. Les noms, ordre logique et destinations du header restent identiques ; adaptation mobile et burger autorisés. Les règles de sécurité, métier, reduced-motion et validation restent actives. Les prescriptions historiques ci-dessous ne doivent pas réintroduire un thème sombre. Suivi : `docs/REFONTE_PROGRESSIVE_2026-10-15.md`.

# Contrat visuel GetYourMentor

Statut : **actif — version 1.0**  
Source observable : `https://mentor-homepage.preview.emergentagent.com/`  
Projet : `gym-next`  

## Priorité

Ce contrat gouverne l'apparence et les interactions visuelles observables. Les documents maîtres existants conservent la priorité sur l'architecture, la sécurité, les règles métier, les routes, les API, les données et l'authentification.

Les valeurs non mesurées sont marquées `À CONFIRMER`; aucune valeur ne doit être inventée à partir d'une capture.

## Décision visuelle

- Le carrousel 3D pentagonal décrit dans certains documents historiques est **retiré du périmètre actif**.
- Les sections de parcours utilisent une animation plane, progressive et accessible : `opacity`, `translate3d`/`translateY`, `scale` et blur léger uniquement.
- Aucune perspective, rotation X/Y ou `transform-style: preserve-3d` ne doit être ajoutée à cette fonctionnalité.
- Cette décision ne modifie pas les documents maîtres historiques; elle constitue la décision d'implémentation actuelle pour éviter un conflit avec la référence Emergent et les performances mobiles.

## Domaines couverts

1. Identité : bleu nuit, surfaces bleutées, accent lime, contraste élevé.
2. Typographie : hiérarchie et centrage observés sur Emergent; détails de police à confirmer par mesure.
3. Structure : sections pleines largeur dans une enveloppe contrôlée, wrappers décoratifs réduits.
4. Header : une seule source partagée, états fermé/ouvert/focus documentés par captures.
5. Hero : image/overlay, badge, titre bicolore, recherche et statistiques.
6. Composants : boutons, champs, surfaces, bordures et rayons cohérents.
7. Assets : chemins, format, poids et licence doivent être inscrits au manifeste avant validation.
8. Animations : transform/opacity privilégiés; reduced-motion obligatoire.
9. Interactions : clic, focus, clavier, scroll et glissement testés séparément.
10. Responsive : 390, 430, 768, 1280 et 1440 px.
11. Accessibilité : focus visible, labels uniques, navigation clavier, pas de clic intercepté.
12. Validation : snapshots déterministes, tests fonctionnels et rapport d'écarts.

## Statuts de preuve

`MESURÉ` · `OBSERVÉ` · `ESTIMÉ` · `À CONFIRMER` · `VALIDÉ PAR LE CLIENT`

## Périmètre de ce commit

- suppression des transformations 3D du parcours animé;
- création du contrat visuel et de la politique de validation;
- conservation du moteur d'orchestration PowerShell existant;
- aucun changement de route, métier, API, donnée ou document maître.
