# Modèles de messages coach — 19 octobre 2026

## Source, besoin et périmètre
Business Plan (`Bussiness Plan.pdf`), page physique 29 : modèles prédéfinis pour faciliter les échanges du coach. Page consultée directement par extraction locale, en complément de l’index `sources/README.md` et de la matrice. Le bouton d’accueil existait déjà dans `MessageInbox` : il ne constituait pas une bibliothèque sélectionnable et remplaçait immédiatement le texte saisi.

Ce lot réutilise cette messagerie, son formulaire, ses permissions et son endpoint. Trois suggestions : accueil/objectifs (texte historique conservé), préparation pratique, disponibilités. Les deux derniers textes sont des propositions rédactionnelles de mise en œuvre, pas des citations du PDF ni de nouvelles règles commerciales. Aucune date, disponibilité, confirmation de réservation ou donnée personnelle n’est inventée.

## Comportement livré
- Sélecteur natif étiqueté, aperçu complet, insertion explicite et texte modifiable.
- Choisir un modèle ne change pas le brouillon et n’envoie rien. Remplacer un brouillon différent nécessite une confirmation native ; refuser conserve le texte.
- Après insertion, focus dans le texte. Sélecteur et insertion désactivés pendant l’envoi ; garde synchrone existante réutilisée.
- Réinsérer le même texte conserve l’identifiant de tentative : une nouvelle tentative explicite après perte de réponse réutilise la déduplication serveur existante.
- Bibliothèque réservée à la vue coach existante, réinitialisée au changement de conversation. Aucun élargissement des permissions serveur. Les messages restent envoyés uniquement par l’action explicite du formulaire.
- Aucun endpoint, schéma, stockage de modèles personnels, traitement IA ou abonnement ajouté. Paiements, commissions historiques, affiliations et filtres inchangés.

## Vérifications
Voir `assets/message-templates-2026-10-19/verification.json`. Playwright **local**, un worker ; pas de session MCP revendiquée. Contrat catalogue, aperçu, confirmation acceptée/refusée, édition, conservation à l’actualisation, clavier/focus, désactivation pendant envoi, rôle sportif sans bibliothèque, isolation et régressions des échanges structure/coach.

Les tests intégrés créent des messages fictifs via les vrais endpoints locaux et relisent leur stockage local depuis le compte sportif. Le test de réponse perdue laisse le serveur enregistrer, vérifie cet enregistrement, puis coupe la réponse navigateur : le nouvel envoi explicite retourne le même identifiant, sans doublon. L’interception contrôle le transport ; elle ne fabrique pas une réussite persistée.

Responsive contrôlé à 320, 390, 768 et 1440 px, contraste de l’aperçu mesuré au moins à 4,5:1 ; captures recadrées sur le composant, examinées visuellement. Aucun compte réel, secret ou journal identifiable dans les preuves. Contrôles statiques Netlify et frontière client/serveur uniquement : aucune validation distante de RLS, Stripe, notification, persistance après redéploiement ou déploiement.

## Limites et suite
Modèles fixes modifiables dans le brouillon, sans bibliothèque personnelle persistante, personnalisation automatique ou envoi automatique. Les documents restent plus larges que ce lot ; V1/V2/V3 ne sont pas terminées. Prochaine action : vérifier une autre lacune métier documentée, notamment les pièces jointes, en qualifiant d’abord les capacités réelles du stockage existant ; ne pas simuler un téléchargement réussi.

## Livraison et retour arrière
Branche `design/refonte-progressive-lot1`, base vérifiée `c213d2761e01d570cf9e793dad1b455f5d9b77de`. Candidat isolé `C:/Users/cashe/Documents/GYM-message-templates`. Commit ciblé seulement, SHA final vérifiable dans Git (pas de référence autoréférente). Aucun déploiement. Retour arrière : revert du seul commit de ce lot après contrôle de la branche et des changements ultérieurs, sans reset ni force-push.

Résultats : campagne de régression **26/26**, puis **6/6** tests concernés rejoués après raccourcissement des libellés mobiles. Build final, frontière client/serveur, configuration Netlify statique et Fil Rouge conformes. Typage explicite également exécuté. Captures finales 390/1440 examinées visuellement. Les captures anciennes régénérées par les régressions, journaux temporaires et rapports automatiques ne font pas partie du commit.
