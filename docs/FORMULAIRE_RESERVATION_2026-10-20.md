# Formulaire de réservation — 20 octobre 2026

## Périmètre et sources
Lot `/creneau` individuel : sélection accessible, récapitulatif avant envoi et confirmation contrôlée. Sources : CONSOLIDATION_RESERVATION_2026-10-16.md (ouverture), REFONTE_RESERVATION_2026-10-15.md et RESERVATIONS_GROUPES_2026-10-16.md ; contrats visuels existants. Les parcours collectifs, endpoints, paiements et récapitulatif suivant restent inchangés.
Référence publique consultée : [Opquast qualité numérique](https://checklists.opquast.com/fr/qualite-numerique/), version 5, 245 règles. Application ciblée : indication de sélection requise, aide/fuseau, résumé avant validation, clavier/focus, erreurs et absence de réussite trompeuse. Ce contrôle partiel ne constitue pas une conformité exhaustive ou une certification.

## Résultat
Formulaire nommé, bouton natif, choix préalable obligatoire et récapitulatif service/prix/date/participant. Palette et carte partagées. Les créneaux restent défilables horizontalement sur petit écran, sans débordement de page.
Disponibilités validées avant ouverture : schéma borné à 1000 entrées, statuts connus, dates et durées contrôlées ; données incorrectes ne deviennent pas un calendrier vide. Valeur URL hors calendrier ignorée. En cas de conflit, sélection conservée et actualisation explicite.
Verrou immédiat contre doubles soumissions. Réponse 2xx contrôlée : identité serveur du coach, séance, durée, date, statut, prix serveur et référence privée. Les refus HTTP explicites permettent correction ; réseau/5xx/réponse ambiguë bloquent une répétition automatique. Réponses tardives ignorées après démontage/changement de coach.

## Vérifications
49 tests Playwright locaux PASS, un worker : booking-form-contract, booking-request-form, booking-editorial et group-booking-foundation. Tests purs de contrats/capacité ; erreurs réseau et réponses injectées ; parcours intégré anonyme créant une demande dans le stockage local, réception du reçu puis navigation au récapitulatif, lecture anonyme par identifiant refusée (401). Ce dernier test ne valide pas une connexion ni un paiement.
Rendu et clavier à 320/390/768/1440 px ; captures finales 390 et 1440 inspectées visuellement dans assets/booking-form-2026-10-20. Pas de capture avant créée ce lot. Playwright MCP non confirmé ; recette effectuée avec Playwright local.
Typage, build et frontière secrets client : voir verification.json pour le résultat final. Aucun déploiement ni recette RLS/Stripe/Netlify distante.

## Limites et reprise
Le verrou d'envoi incertain ne persiste que sur la page ouverte. Aucun identifiant d'idempotence serveur ni réconciliation durable ajouté. Un rechargement peut permettre une nouvelle demande ; les disponibilités publiques ne prouvent pas la propriété d'une demande. Le lien Mon compte ne garantit pas la récupération d'une demande anonyme sans reçu. Ne pas promettre une absence totale de doublons.
Le récapitulatif suivant affiche encore des paramètres URL : ce n'est pas une preuve d'autorisation. Le mécanisme historique claimToken dans l'URL est conservé ; ne pas archiver d'URL privée dans captures/journaux publiés. Vérification de réponse côté client ≠ contrôle d'accès serveur.
Données de profils de démonstration déjà publiques, service synthétique dans captures ; aucun cookie, jeton, reçu ou journal brut inclus dans la livraison. Commission 15 %, historiques, capacités et règles serveur préservés. Site déployé inchangé : source bbe20d7, déploiement 6ad6a2d61f36fd8e0947b34a.
Prochain lot recommandé : reprise sûre d'une création de réservation incertaine, après examen des mécanismes existants de réconciliation/idempotence et des contraintes de confidentialité. Ne pas inventer un deuxième moteur de réservation.
Retour arrière : revert du seul commit livré sur la branche de travail, sans reset ni modification de données.
