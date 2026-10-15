# Prompt de prochaine étape

```text
Reprends C:\Users\cashe\Documents\GetYourMentor.

Objectif : fiabiliser le passage récapitulatif → compte → paiement, en affichant le statut réel de la demande et en préservant le contexte de réservation.

Lis AGENTS.md et BRANCH_STRATEGY_GYM.md, puis DOCUMENT_MAITRE_GYM.md, docs/README.md, docs/REFONTE_PROGRESSIVE_2026-10-15.md, docs/REFONTE_RESERVATION_2026-10-15.md et le contrat visuel actif. Relis MVP/V1 PDF p. 1, devis DEV p. 1–2 et Business Plan p. 35–36. Consulte les cycles 003/004/013 et les tests business-flow et booking-editorial. Vérifie le SHA distant de la dernière livraison.

Inventorie Git et les changements locaux ; ne livre pas automatiquement les correctifs comptes/paiements antérieurs. Utilise un candidat isolé si nécessaire. Branche : design/refonte-progressive-lot1. Aucun force-push, fusion ou déploiement.

Périmètre : choix de la destination après connexion, conservation de reservationId/claimToken, affichage des états demandé/accepté/payé et des erreurs d’accès. Vérifie d’abord les API et garanties existantes. Montants et statuts affichés doivent provenir d’une source autorisée, pas être affirmés à partir de l’URL. Paiement autorisé seulement après acceptation ; aucun paiement réel, changement de commission 15 %, d’affiliation ou de RLS. Garde l’identité violette validée.

Critères : un sportif retrouve sa propre demande après connexion ; une demande en attente ne propose pas un paiement immédiat ; une demande acceptée rejoint le paiement simulé approprié ; un identifiant inconnu ou appartenant à autrui produit un état explicite sans fuite de données ; un retour arrière conserve les informations utiles. Pas de faux avis ni de date inventée. Le calendrier actuel n’enregistre qu’une heure : n’étends pas silencieusement son modèle de données dans ce lot.

Vérifications Playwright desktop/mobile : connexion avec retour, états demandé/accepté/payé, accès interdit, erreur réseau et nouvelle tentative, navigation clavier et retour. Réutilise les fixtures autorisées et nettoie uniquement les réservations créées par la recette. Rejoue booking-editorial et les scénarios métier concernés, puis typage/build et contrôles de sécurité adaptés. Ne présente pas l’émulation comme un test utilisateur réel.

Documente preuves, limites et prochaine étape ; commit ciblé et push selon la procédure, avec comparaison SHA local/distant. Fournis ensuite le bilan et un prompt autonome pour la suite.
```
