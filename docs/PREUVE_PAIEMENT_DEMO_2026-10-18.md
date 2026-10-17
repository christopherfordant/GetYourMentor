# Confirmation prospective du paiement simulé — 18 octobre 2026

## Périmètre et audit
Base 9df45d2, branche design/refonte-progressive-lot1 ; candidat isolé GYM-payment-proof. Références métier : sources du maître, parcours acceptation avant paiement et rapports CONSOLIDATION_RESERVATION_2026-10-16.md / FINANCES_COACH_2026-10-18.md. La dernière carte reste basée sur le mois de création Europe/Paris : aucune utilisation rétroactive de la nouvelle date pour modifier ce périmètre.

Audit : createdAt, acceptedAt, cancelledAt et snapshot financier existent, mais ne prouvent pas une confirmation de paiement. Les identifiants Stripe servent au chemin Stripe existant ; aucune référence stable/date de confirmation locale équivalente n’a été trouvée. Le snapshot financier est créé dès la demande. Le cycle existant est réutilisé : requested → accepted → paid → cancelled avec remboursement not_required/pending/succeeded. Aucun nouveau registre, moteur de paiement ou abonnement.

## Donnée enregistrée
Champ optionnel `Reservation.demoPaymentConfirmation` :
- `mode: "simulated"` : preuve interne d’une simulation, pas reçu bancaire, facture ou attestation de débit.
- `confirmedAt` : instant UTC ISO généré côté serveur lors de la confirmation persistée, distinct des dates de création/acceptation/annulation.
- `reference` : UUID préfixé `demo-pay-`, généré côté serveur et stable après confirmation.

Champ réservé aux nouvelles confirmations de la démonstration isolée. Le navigateur ne fournit aucune de ces valeurs : les routes existantes construisent les données autorisées, les champs JSON forgés ne sont pas utilisés. Une ligne déjà paid sans preuve reste sans preuve ; aucune reconstitution ou migration historique.

## Atomicité et conservation
`confirmDemoReservationPayment`, dans le repository existant : vérifie propriétaire, acceptation, créneau et disponibilité à l’intérieur de la mutation ; stocke statut paid, propriétaire et preuve dans le même état. Mémoire locale synchrone ou mutation CAS du DemoState partagé. Les callbacks perdant un conflit ne publient pas leur preuve préparée ; seule la référence de l’écriture réussie est retournée. Les répétitions/concurrences retournent l’état payé existant et ne changent pas l’heure/référence.

`payReservation` conserve le contrôle de propriétaire avant les retours idempotents et délègue la branche simulée au repository. Un seul gagnant déclenche l’étape de confirmation existante ; aucune notification réelle activée. Si le stockage échoue, aucun statut payé ni preuve ne reste enregistré. Une annulation concurrente ne doit pas être ressuscitée en paiement par un filtre de statut obsolète.

Les mises à jour locales/hébergées ultérieures réutilisent le mapper SQL pour les champs existants mais recopient la preuve depuis la ligne courante. Le patch générique ne peut pas remplacer cette preuve. Annulation, remboursement et déplacement la conservent. Le JSON Blobs porte le champ optionnel sans nouvelle table/colonne ; le mapper SQL ne l’émet pas. Aucun schéma Supabase, webhook réel ou clé/configuration de production modifié.

Le chemin avec identifiant de paiement Stripe reste distinct : aucune preuve simulée générée pour lui. Les signatures webhooks sont testées avec les fixtures locales existantes, pas avec Stripe réel. La nouvelle preuve est limitée à la démo isolée ; aucun nouveau support SQL pour ce champ n’est annoncé.

## Vérifications
Résultats finaux et empreintes : `assets/demo-payment-proof-2026-10-18/verification.json`.
- Mémoire : refus avant acceptation/créneau passé sans preuve, ancien paid inchangé, propriétaire étranger refusé, mise à jour conservant la preuve, mapper SQL sans nouvelle colonne, branche identifiant Stripe sans faux marqueur simulé.
- Adaptateur hébergé hors ligne : véritable code DemoState + SDK Blobs installé, fetch entièrement factice à blobs.invalid ; conflits 412, quatre confirmations concurrentes dont un seul gagnant, relecture JSON, annulation préservant la preuve, échec de toutes les écritures laissant accepted sans preuve. Fetch/environnement/contextes restaurés, promesses concurrentes toutes terminées avant nettoyage. Zéro requête réelle Netlify ; ce test ne valide pas le service distant.
- HTTP : six paiements simultanés puis répétition, date dans la fenêtre serveur du test et référence identiques, champs forgés ignorés, refus du compte étranger, snapshot financier inchangé, annulation/remboursement simulé conservant la preuve, nouvelle tentative après annulation refusée.
- Playwright : parcours existant acceptation → paiement simulé → compte → annulation/remboursement ; régressions commission, carte coach et webhook signé local. Aucun affichage produit changé, pas de nouvelle campagne de maquettes/captures pour un changement de données serveur. Images rejouées des anciens tests non incluses dans ce commit.

## Limites et reprise
Mémoire perdue au redémarrage ; les lignes JSON hébergées sont compatibles mais la persistance et concurrence Netlify réelles ne sont pas recettées ici. Aucune validation RLS, charge, Stripe ou réception d’email réelle. Anciennes lignes et environnements hors démo isolée n’acquièrent pas automatiquement ce champ. Le tableau coach n’exploite pas encore cette preuve pour résoudre les anciennes annulations ambiguës ou présenter un mois de paiement.

Aucun paiement réel, configuration de facturation, migration distante, abonnement, déploiement, nouvelle dépendance/agent ou analyse REA sans besoin. Quotas privés inaccessibles, aucun montant/tokens restants inventé. Les modifications locales préexistantes sont préservées.

Retour arrière : revert ciblé du lot sans purge du DemoState ; conserver le champ optionnel des lignes déjà confirmées. Éviter un ancien binaire qui le supprimerait lors d’une mise à jour : le mécanisme de conservation du champ doit rester actif tant que ces données doivent être préservées. Prochaine tranche : exploiter la preuve dans l’identification des annulations nouvellement payées, sans backfill ni changement implicite du mois affiché ; cadrer séparément un éventuel rapport par mois de confirmation avec cohortes historiques explicitement incomplètes. V1/V2/V3 restent incomplets.
