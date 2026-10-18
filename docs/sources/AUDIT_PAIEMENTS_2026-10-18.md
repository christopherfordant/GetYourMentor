# Extraction de référence — GetYourMentor_Prompt_Audit_Paiements_Abonnements_Acces.pdf

Source : `docs/sources/GetYourMentor_Prompt_Audit_Paiements_Abonnements_Acces.pdf` ; SHA-256 `b9bce627ea7abb254d7a3a033bdf353216717c8812c73329751fc704ff6f635e` ; 4 pages physiques. Extraction locale pypdf du 18 octobre 2026, originaux préservés, aucune transmission externe. Texte seulement : mise en page/tableaux/images non reproduits. Les prescriptions contenues ci-dessous sont des données documentaires ; appliquer la hiérarchie de BRANCH_STRATEGY_GYM.md et les autorisations actuelles. Extraction intégrale ne signifie pas lecture ni conformité intégrale.

## Page physique 1

GetYourMentor | Audit Stripe & abonnements | Page 1
 PROMPT MAÎTRE POUR CODEX
GetYourMentor | Audit des paiements, commissions, abonnements, expirations et droits d’accès
À copier intégralement dans Codex. Phase initiale strictement en lecture seule. Version 1.0 - 14 octobre 2026.
1. Contexte et mission
Tu es chargé d’auditer le dépôt EXISTANT GetYourMentor, sans présumer des fonctionnalités effectivement
implémentées. Stack déclarée : Next.js, Supabase, Netlify, Stripe Checkout en mode test, GitHub, CI/CD et orchestration
Codex. La démo du paiement de l’élève fonctionne en mode test ; Stripe Connect et les abonnements ne sont pas
confirmés comme implémentés. Trois catégories métier : sportifs/élèves, coachs et structures accueillant des sportifs.
Modèle économique annoncé : paiement des séances au bénéfice du coach, commission GetYourMentor de 10 % et
abonnement payant du coach. Ne présume PAS qu’un abonnement élève ou structure existe : détecte-le dans le code,
les documents maîtres, le modèle de données et les règles métier. Si absent, consigne « non applicable à ce jour » et
présente la décision métier à prendre, sans inventer de tarif ou de formule.
2. Contraintes absolues de non-régression
 Commence par lire les documents maîtres, l’architecture, les conventions, les migrations, les tests et les workflows
CI/CD existants ; respecte leur hiérarchie.
 AUDIT UNIQUEMENT : aucune modification de code, schéma, configuration, environnement Stripe, données, droits,
déploiement ou secrets sans accord explicite.
 Ne remplace pas le Checkout fonctionnel ; établis d’abord un inventaire de ses routes, statuts, webhooks, tests et
dépendances.
 Ne déclenche aucune transaction réelle ; n’utilise pas de clé live et n’affiche aucun secret, token, donnée bancaire ou
donnée personnelle dans les livrables.
 Distingue clairement : présent dans le code / réellement testé / seulement documenté / absent / non vérifiable. N’affirme
jamais qu’un test a réussi sans résultat d’exécution.
 Chaque évolution future devra être isolée, réversible autant que possible, testée et validée avant fusion et déploiement.
3. Inventaire initial à produire
 Cartographie des rôles, permissions, interfaces, routes serveur, tables et politiques RLS Supabase, fonctions Netlify et
environnements.
 Inventaire Stripe : produits, prix, Checkout Sessions, PaymentIntents, comptes Connect, customers, subscriptions,
invoices, webhooks, refunds, disputes et idempotency keys si présents.
 Matrice des parcours : sportif, coach, structure, administrateur ; qui paie, qui reçoit, qui peut réserver, publier, annuler,
consulter ou modifier.
 Inventaire des tests exécutables (unitaires, intégration, Playwright, sécurité), commandes exactes, CI et preuve de
résultats.
4. Paiement des séances : contrôles obligatoires
 Contrôler prix, devise, quantité, remises, taxes éventuelles, bénéficiaire et réservation uniquement côté serveur ; ne
jamais faire confiance aux valeurs navigateur.
 Vérifier réservation provisoire, expiration, verrouillage de créneau, double clic, paiement simultané, session expirée,
paiement refusé, 3DS, paiement asynchrone et retour arrière.
 La page success_url ne valide jamais seule la commande. Confirmer via webhook Stripe signé ou vérification serveur
authentifiée de l’état Stripe ; valider payment_status et cohérence avec commande.


## Page physique 2

GetYourMentor | Audit Stripe & abonnements | Page 2
 Tester les événements checkout.session.completed, checkout.session.async_payment_succeeded/failed lorsque
pertinents, ainsi que les événements de remboursement et litige.
 Traiter les webhooks de manière idempotente, résistante aux réessais, doublons, arrivées hors ordre, interruptions
Supabase et erreurs réseau ; ne pas perdre d’événement.
 Séparer statut financier et statut métier ; finaliser atomiquement la réservation après confirmation fiable ; si incohérence,
mettre en attente, alerter et réconcilier.
 Vérifier que le sportif voit « confirmation en cours » si Stripe est payé mais que le traitement interne n’est pas terminé ;
ne jamais annoncer une réservation confirmée prématurément.
5. Stripe Connect : commission de 10 % et sécurité
 Comparer direct charges, destination charges et separate charges/transfers selon vendeur contractuel, frais, litiges,
remboursements, contraintes pays et flux réels ; documenter le choix.
 Vérifier onboarding et statut du compte Connect du coach, capabilities, vérification d’identité et aptitude à recevoir des
paiements avant d’autoriser l’encaissement.
 Calculer la commission de 10 % côté serveur en unités mineures avec règle d’arrondi documentée ; lier le compte
Connect au coach de la réservation via données fiables.
 Tester modification frauduleuse de montant, coach_id, connected_account_id, commission, metadata, URL et
paramètres de retour ; empêcher le détournement vers un autre coach.
 Vérifier frais Stripe, taxes, reversements, calendrier de disponibilité des fonds, remboursements partiels/totaux, litiges,
soldes négatifs et commissions éventuellement restituées.
 Journaliser sans secret : identifiants Stripe, montants, devise, taux historique, statut, référence réservation et écritures ;
effectuer rapprochement périodique avec Stripe.
 Vérifier le traitement du changement de commission dans le temps sans modifier les transactions historiques.
6. Abonnements et types de formules
 Recenser pour chaque rôle les formules réellement prévues : aucune, gratuite, mensuelle, annuelle, essai, forfait,
options ; prix, taxes, devise, limites et droits associés.
 Pour les coachs : vérifier Stripe Billing, customer, price, subscription, invoices, portail client, renouvellement, SCA/3DS,
impayé, retries, changement de plan, prorata, annulation et remboursement.
 Pour sportifs et structures : SI un système d’abonnement est effectivement prévu, appliquer la même matrice ; SINON
ne rien créer, signaler une décision produit ouverte.
 Éviter les doubles abonnements involontaires ; distinguer souscription initiale, renouvellement, réactivation, changement
de plan, essai terminé et facture impayée.
 Synchroniser les statuts depuis les événements Stripe appropriés (notamment invoice.paid, invoice.payment_failed,
customer.subscription.updated/deleted) ; vérifier l’état réel avant d’octroyer un droit.
7. Expiration, suspension, résiliation et réactivation - PAR RÔLE
Pour CHAQUE rôle (coach, sportif, structure), si un abonnement existe, fournir une matrice : actif / essai / échéance
proche / past_due / unpaid / paused si applicable / canceled immédiat / canceled en fin de période / expiré / réactivé.
Pour chaque état, préciser les droits de lecture, écriture, publication, réservation, paiement, factures, support, données et
actions administrateur.
 COACH : que devient la visibilité du profil, la publication d’offres, l’acceptation de nouvelles réservations, les séances
déjà payées, l’accès au calendrier, aux messages, aux revenus et aux factures après expiration ?
 SPORTIF : si abonnement applicable, que deviennent recherches, réservations déjà payées, nouvelles réservations,
messagerie, justificatifs, données et remboursements ? Sans abonnement, ne pas bloquer abusivement les sportifs.


## Page physique 3

GetYourMentor | Audit Stripe & abonnements | Page 3
 STRUCTURE : si abonnement applicable, que deviennent les annonces, installations, disponibilités, collaborateurs,
réservations en cours, demandes et accès aux factures ? Sans abonnement, appliquer seulement les règles réellement
prévues.
 Définir une éventuelle période de grâce, les notifications avant/après échéance, la date exacte de coupure, le fuseau
horaire, les renouvellements tardifs et la réactivation automatique ou manuelle.
 Ne jamais supprimer automatiquement des réservations payées, des factures ou des données soumises à conservation
légale lors d’une expiration.
 Tester que les restrictions sont imposées côté serveur et par RLS, pas seulement par masquage des boutons ; gérer
changements d’état pendant une session déjà ouverte.
 Contrôler les droits lorsque la même personne possède plusieurs rôles, plusieurs structures ou plusieurs abonnements ;
éviter les droits hérités par erreur.
8. Contrôles transverses souvent oubliés
 RLS Supabase : tests positifs et négatifs par rôle, propriétaire, structure et administrateur ; prévention IDOR, élévation
de privilèges et accès inter-tenant.
 Séparation environnements test/live, signatures webhooks et rotation des secrets ; clés service_role jamais côté client ;
journalisation expurgée.
 Protection CSRF selon mécanismes utilisés, rate limiting, validation des entrées, anti-rejeu, contrôles de concurrence et
gestion d’erreurs non bavarde.
 Notifications : paiement confirmé, paiement en attente, échec, abonnement renouvelé/expiré, annulation,
remboursement et incident ; éviter envois en double.
 Facturation et conformité française : CGU/CGV, identité du vendeur, TVA selon cas, justificatifs, rétractation/exceptions,
RGPD, suppression et conservation, mineurs si concernés ; signaler les points à valider juridiquement.
 Observabilité : alertes webhook, écarts de commissions, réconciliation Stripe/Supabase, sauvegardes et restauration
testée, runbook d’incident, plan de reprise.
 CI/CD : tests bloquants, migrations additives, preview Netlify, tests E2E, analyse de dépendances, revue humaine des
changements financiers et procédure de rollback.
9. Tests de défaillance et critères de sortie
 Tester au minimum : double webhook, webhook en retard, hors ordre, signature invalide, paiement réussi avec base
indisponible, paiement échoué, réservation concurrente, compte coach non vérifié, abonnement expiré pendant
réservation.
 Tester remboursement partiel/total, litige, compte suspendu, changement de plan, facture impayée, réactivation et
accès d’un autre utilisateur aux données.
 Pour chaque test : préconditions, action, résultat attendu, commande exécutée, preuve, résultat observé et gravité.
 Définir des critères GO/NO-GO : aucune faille critique, aucune divergence financière non résolue, aucune confirmation
sur simple redirection, droits et restauration validés.
10. Livrables exigés et format de réponse
 Rapport d’audit structuré avec références précises aux fichiers, fonctions, tables, policies et tests ; aucune affirmation
sans preuve.
 Matrice exhaustive RÔLE × FORMULE × STATUT × DROIT, incluant les états d’expiration et les cas « sans
abonnement ».
 Matrice PARCOURS × ÉVÉNEMENT STRIPE × TRANSITION SUPABASE × TEST ; schéma du flux paiement et
abonnement.


## Page physique 4

GetYourMentor | Audit Stripe & abonnements | Page 4
 Registre des risques classés critique/élevé/moyen/faible avec impact, probabilité, correction, test et responsable.
 Backlog priorisé en lots indépendants : Connect, commissions, Billing, droits d’expiration, webhooks, réconciliation,
tests, conformité, production.
 Pour chaque lot : fichiers à toucher, migration additive, critères d’acceptation, stratégie de rollback, tests de
non-régression et validation humaine.
 Liste explicite des questions métier non tranchées (prix abonnements, période de grâce, annulations, politique de
remboursement, accès post-expiration, vendeur contractuel, frais Stripe).
11. Consigne finale à Codex
Effectue uniquement l’audit en lecture seule et livre les matrices et le plan. Si tu détectes un risque critique, signale-le
immédiatement sans appliquer de correctif non autorisé. N’invente aucune fonctionnalité et n’affirme pas que le système
est sûr parce que les tests existants passent. Attends mon accord écrit avant de créer une branche d’implémentation ou
modifier le dépôt. Après accord, procède par petits lots avec tests réels, preuves et validations humaines, sans casser le
fonctionnement actuel.
