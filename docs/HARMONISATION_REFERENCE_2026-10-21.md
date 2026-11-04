# Harmonisation éditoriale — recherche, 21 octobre 2026

## Périmètre et références
Premier lot uniquement : `/recherche`, styles partagés existants et contrat du formulaire. Base `ddd2f54`, copie de travail isolée ; changements locaux antérieurs préservés. Dépôt original privé, export `GetYourMentor-site` public : la mention « dépôt désormais public » du prompt joint est obsolète.

Pages publiques directement consultées avec Playwright MCP : [accueil](https://getyourmentor.fr/), [sportifs](https://getyourmentor.fr/sportifs), [inscription coach](https://getyourmentor.fr/coach.html). Accueil : grande hiérarchie typographique, photographie monochrome, fond crème et accents orange ; sportifs : sections par objectif/discipline et progression ; coach : formulaire professionnel. Aucune soumission externe effectuée. Navigation publique inventoriée, pas de prétention d'audit de toutes les pages ou zones privées.

Correspondances : sportifs → recherche/annuaire/fiches ; coach.html → compte coach ; professionnels → inscription structure ; méthode → guide existant de l'accueil. Fiches individuelles, disponibilités et mécanismes serveur tiers non observés : inconnus, pas déduits du marketing.

Les droits de réutilisation des photographies, logos, textes et fichiers externes ne sont pas établis dans les sources consultées. Aucune ressource de ce site n'est importée. Adaptation originale des principes de composition. Le violet fixe approuvé est conservé, sans importer l'orange ni remplacer les règles métier.

## Réalisation
Titre de recherche sans empattement, gras, équilibré selon la largeur ; formulaire blanc/lavande, angles arrondis, bouton principal en pilule, champs natifs et cartes de villes arrondies. Colonne de formulaire à largeur minimale nulle pour éviter le débordement. Le lien collectif conserve sa destination avec une cible plus confortable et un soulignement visible. Nom et instructions du formulaire reliés par `aria-labelledby`/`aria-describedby`.

Le header, son ordre, les paramètres sport/ville, les quatre sports, les données et transitions métier sont conservés. Annuaire et fiche gardent leur design actuel : extension après examen du pilote. Aucun changement financier, paiement réel, notification ou déploiement.

Références publiques : [WAI — instructions des formulaires](https://www.w3.org/WAI/tutorials/forms/instructions/) et [Opquast V5](https://checklists.opquast.com/fr/qualite-numerique/), consultées pour les contrôles ciblés. Pas de conformité globale revendiquée.

## Outils et preuves
REA : catalogue existant consulté ; méthode de séparation observation/inférence/inconnu utilisée. Aucun outil REA externe exécuté ou capacité nouvelle annoncée. Playwright MCP effectivement utilisé pour la navigation, les mesures, les captures et le clavier ; Playwright local pour les scénarios de régression.

MCP : pas de débordement à 320, 390, 768 et 1440 px ; bouton de recherche mesuré à 52 px ; quatre sports vérifiés à 320 px. Menu ouvert au clavier, fermeture Échap et retour du focus, tabulation discipline → ville, formulaire nommé et quatre options. Captures locales avant/après dans `docs/assets/reference-search-*`. La capture MCP dédiée hors de sa racine autorisée a été refusée : les captures suivantes utilisent sa racine autorisée, puis sont copiées localement.

Tests locaux : 8 scénarios distincts `discovery-editorial` + `journey-ux`. Premier passage 7/8 ; attente de police historique devenue caduque, puis vérification footer pointant sur l'ancien composant. Contrat actualisé pour la police du seul pilote et le footer partagé actuel, test ciblé repassé 1/1. Parcours sur catalogue démo local et réponses synthétiques des scénarios distingués ; aucune recette de services distants.

Incident local : rechargement à chaud ayant répondu 404 une fois pendant modification ; nouvelle navigation réussie, parcours et métadonnées vérifiés ensuite. Avertissements CSS hérités et téléchargements de police à distinguer des régressions de ce lot. Typage, build, frontière client/serveur et scan des fichiers suivis réussis sur le candidat privé. Relecture UTF-8 et diff avant indexation. Accueil de référence également examiné visuellement à 390 px, sans débordement ; sa navigation sur plusieurs lignes n'est pas recopiée, notre menu accessible existant est conservé.

## Livraison, limites et suite
Le dépôt privé reçoit la documentation et les preuves locales ; l'export public reçoit uniquement le code applicable, sans documents internes, captures de comptes, historique privé ou ressources tierces. Inspection du diff et scans avant push. Pas de garantie absolue de confidentialité.

Suite : étendre la hiérarchie du pilote à l'annuaire, puis à la fiche, après comparaison des résultats et de l'action de réservation. Revert ciblé des fichiers du lot après revue, sans migration ni modification des données. Aucun déploiement Netlify/production.
