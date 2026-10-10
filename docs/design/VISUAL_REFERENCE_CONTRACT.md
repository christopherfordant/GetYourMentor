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
