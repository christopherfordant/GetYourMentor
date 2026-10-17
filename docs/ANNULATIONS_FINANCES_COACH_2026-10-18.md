# Annulations payées et synthèse coach — 18 octobre 2026

## Périmètre
Lot unique, base ba25fa9, branche design/refonte-progressive-lot1 ; candidat isolé GYM-cancel-finance. Sources : FINANCES_COACH_2026-10-18.md, PREUVE_PAIEMENT_DEMO_2026-10-18.md, règles de remboursement existantes et BP p.31/35/51 déjà rapprochés dans ces rapports. Seul le calcul coach existant est étendu ; pas de tableau, API, période ou moteur financier parallèle. Aucun réglage 15 % ou snapshot historique modifié.

Avant ce lot, une annulation était reconnue comme précédemment payée par identifiant Stripe existant ou remboursement positif pending/succeeded. Un paiement local annulé à moins de 24 h avec remboursement nul restait ambigu, même après l’ajout de la preuve serveur du lot ba25fa9.

## Reconnaissance et provenance
`hasCoherentDemoPayment` dans le module coach-finance partagé valide la structure de `demoPaymentConfirmation` : objet non-tableau, mode simulated, référence demo-pay-UUID v4 au format exact généré par le serveur et instant UTC canonique au format toISOString. La confirmation ne doit être ni future ni antérieure à la création ou à l’acceptation lorsqu’elle est fournie ; l’acceptation ne peut précéder la création. Une acceptation absente (`undefined` ou `null` dans les adaptateurs historiques) ne reçoit aucune date inventée ; une valeur fournie mais invalide est rejetée. Pour une annulation, cancelledAt doit être exploitable, après ou égal à la confirmation et non futur.

Cette validation est structurelle/chronologique, **pas une signature cryptographique ni une attestation bancaire**. La provenance repose sur les routes existantes : création/règlement ne prennent pas la preuve dans le corps envoyé par le navigateur ; le repository l’enregistre atomiquement côté serveur, puis la conserve. Le calcul reçoit les réservations de l’API authentifiée du coach. Ne pas considérer un objet local fabriqué ou une capture UI comme une preuve de paiement réelle.

Une preuve valide devient un critère additionnel pour reconnaître une annulation payée. Les critères historiques indépendants restent applicables ; un champ simulé absent/malformé n’efface pas une autre preuve historique justifiée. Sans aucun critère valable, annulation ambiguë exclue et signalée. L’absence de preuve n’affirme pas rétroactivement l’absence de paiement.

Les anciens snapshots, dates de création/acceptation ou corps clients ne deviennent jamais une preuve par défaut. Aucun backfill, mutation de réservation, nouvelle référence ou date n’est créé par la synthèse.

## Règles financières conservées
Mois de création Europe/Paris, année comprise, toujours indépendant du mois de confirmation et du fuseau navigateur. Gross/refund/commission/part coach en centimes à partir des snapshots historiques, pas du taux actuel. Remboursement succeeded déduit, pending signalé sans déduction, not_required exige un montant nul explicite ; donnée de remboursement absente reste manquante. Déduplication ID, filtrage coachId, sous-totaux partiels et Indisponible inchangés.

Nouvelle annulation payée avec preuve valide et remboursement 0/not_required : brut et commission/part coach historiques conservés dans le sous-total documenté. Annulation sans paiement enregistrée sans preuve : exclue sans fabriquer une histoire financière. Montants de démonstration toujours distincts d’un encaissement ou reversement réel.

## Vérifications
Résultats finaux/empreintes : assets/cancel-finance-2026-10-18/verification.json.
- Matrice du calcul : nul, partiel, total, pending, donnée de remboursement absente, preuve absente/malformée, chronologie impossible, date invalide, référence/mode erroné, confirmations futures, anciennes règles indépendantes, doublons, coach étranger, absence de mutation et mois de création inchangé.
- Régressions existantes : bornes Paris/mois/année/changement d’heure, historique des commissions, centimes, paiement simulé et preuve atomique.
- Intégration distincte des fixtures injectées : inscription d’un coach fictif dédié, définition de son tarif, validation admin dans la démo locale, demande du sportif, acceptation, paiement simulé réel du moteur local, annulation à moins de 24 h et remboursement nul ; seconde annulation avant paiement. Lecture du vrai endpoint puis du vrai compte coach sans interception réseau. Attendus : une réservation documentée à 35 EUR brut, 5,25 EUR de commission historique, 29,75 EUR de part coach, et une annulation sans paiement attesté explicitement exclue.
- Rendu : libellés existants inchangés vérifiés dans ce compte ; captures ciblées 390/1440. Les contrôles 320/768 et la carte globale sont rejoués par la régression existante ; pas de nouvelle refonte ou maquette.

## Limites et suite
Tests et stockage locaux, pas de validation Netlify/Stripe/RLS distants ou de débit bancaire. La preuve simulée ne résout pas les anciens dossiers sans données et ne constitue pas une mesure d’assiduité. Une preuve datée d’un autre mois ne déplace pas la réservation hors de sa cohorte de création. Aucun déploiement, abonnement, paiement ou message réel ; aucune dépendance/agent ajouté. Les modifications locales préexistantes sont conservées ; quotas privés inconnus, aucune économie chiffrée annoncée.

Retour arrière : revert ciblé de ce lot de calcul/docs, sans toucher à la preuve persistée ou aux historiques. Prochaine tranche : cadrer un filtre temporel explicite du tableau coach, en conservant par défaut le mois de création et en séparant toute future vue par confirmation avec couverture historique affichée. Ne pas ajouter simultanément les comptes structure/admin. V1/V2/V3 restent incomplets.

Revue de compatibilité après la première campagne 28/28 : traitement explicite de acceptedAt null comme absence, conformément au mapper historique ; tests correspondants ajoutés. Nouveau build et rejeu financier ciblé figurent dans la preuve, sans compter les replays comme de nouveaux cas.
