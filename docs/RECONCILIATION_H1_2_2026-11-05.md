# GYM-H1.2 - diagnostic et premiere reconciliation locale - 5 novembre 2026

## Livraison reelle

Moteur local fixture-only avec diagnostic sans modification des lignes et reprise explicite vers une nouvelle copie de travail. GYM-H1.2.1 termine sur tests locaux; GYM-H1.2 reste en cours. Aucun raccordement du site au moteur, operation distante, paiement/remboursement nouveau, envoi Telegram, endpoint, migration ou deploiement. GYM-B1 et H1.1 restent valides, aucune regression demontree.

## Diagnostic cible : code et preuves distingues

- Paiement : webhook Stripe existant signe puis relit reservation, controle environnement/montant/titulaire et Connect. References de transfert/commission puis statut paid sont ecrits separement : interruption entre ces ecritures possible selon le code. Le lot Stripe precedent a effectivement observe une confirmation503 puis un rejeu200 et persistance, sans demontrer la cause exacte du503.
- Remboursement : cancelReservation lit une reservation paid, appelle refundStripePayment puis ecrit cancelled et resultat. Une creation Stripe suivie d'une panne de persistance peut laisser l'intention locale d'annulation absente. C'est un risque deduit du code, pas un incident distant reproduit ici.
- Statuts : le modele applicatif refundStatus ne represente que not_required/pending/succeeded. Les echecs et actions supplementaires ne peuvent pas etre declares succeeded. Ce lot signale manual/refund_failed, refund_canceled ou refund_requires_action dans le rapport; il n'ajoute pas de colonne ni ne modifie ce contrat en cachette.
- Concurrence : updatePersistedReservation filtre notamment le statut attendu. Ce n'est pas un CAS sur la ligne complete pour un changement concurrent restant dans le meme statut. Le nouveau port local exige cette garantie plus forte; aucun remplacement de l'adaptateur existant n'est revendique.
- Evenements : seul checkout.session.completed est traite dans le webhook actuel. Rejeux apres paiement et apres remboursement deja observes; pas de reconciliation complete des remboursements differes. Le moteur ne consomme pas des payloads d'evenements : il lit un instantane courant par reference, donc n'utilise pas leur ordre de reception comme autorite.
- Telegram : outbox et deduplication existantes, accepted conserve, uncertain sans renvoi aveugle. Le moteur ne dispose d'aucun port d'envoi, meme pour pending. L'enqueue/reconciliation de notification apres reprise paid reste un travail d'integration distinct.

## Autorites et protections

| Information | Autorite attendue pour le futur raccordement | Traitement local livre |
|---|---|---|
| Droit de maintenance et cible | Principal serveur autorise et liste bornee de reservations | Permission fixture interne, aucun acces HTTP ni authentification de production revendiquee |
| Plateforme/environnement/coach | Registre et liaison de recette + verification fournisseur existante | Concordance enveloppe fixture / contexte / reservation / liaison, mode test uniquement |
| Besoin et montant d'annulation | Intention metier locale deja persistee | Montant refundAmount conserve, jamais recalcule depuis une date supposee |
| Paiement effectif | Checkout complet/paye et PI succeeded du meme compte | ID, metadata reservation, titulaire, montant, devise, frais, beneficiaire, charge capturee et references concordants |
| Remboursement existant | Objets refund du meme PI, liste complete | Une seule correspondance, montant/devise/ID concordants; plusieurs ou pagination incomplete => manuel |
| Reprise transfert et commission | Transfer/reversal/application_fee/refund concordants | Pas de succeeded sans preuve de montant, devise, beneficiaire et liens de reversal/fee; prorata issu du module de commission partage |
| Etat local apres lecture | Stockage avec CAS atomique | Empreinte de toute la ligne, patch limite aux references et transitions autorisees |

Le calcul financier reutilise financialSnapshot, eurosToCents et refundedCommissionCents du domaine existant. Il ne change aucun tarif, taux, date ou regle de remboursement. Les cles d'idempotence actuelles restent intactes : le moteur ne cree aucun objet financier.

## Transitions autorisees et cas manuels

- accepted -> paid uniquement sur preuves concordantes et recherche complete sans remboursement. References partiellement absentes restaurees; references deja presentes mais divergentes refusees.
- paid reste paid; cancelled reste cancelled. Aucune resurrection lors d'une nouvelle lecture ou d'un ancien evenement.
- cancelled avec intention de remboursement persistee : retrouve une reference existante non ambigue, conserve pending ou constate succeeded apres verification des reversals. Aucune nouvelle demande de remboursement.
- failed/canceled/requires_action, PI incoherent, remboursement inconnu, intention d'annulation perdue, plusieurs remboursements ou preuve incompl?te => manual avec code fixe. Un pending apres succeeded ne degrade pas l'etat.
- Storage/provider indisponible => retry expurge, sans nouvel appel financier. Aucune relance interne non bornee. Si l'accuse d'ecriture est perdu mais CAS applique, la prochaine lecture devient already_consistent.

Bornes :100 IDs candidats maximum, IDs dupliques dedupliques,10 traites par defaut et plafond20, fichier CLI1Mo. Les ports locaux sont immediats; les delais reseau, timeouts/cancellation, verrous inter-processus et ordonnanceur durable sont a concevoir avec l'adaptateur distant, pas demontres par ces bornes de volume.

## Execution et preuves

Voir tools/payment-reconciliation/README.md pour commandes reproductibles et example.fixture.json. Diagnostic execute : would_patch, ligne accepted conservee. Reprise explicite executee sur une copie : updated/paid. Entree preservee et ecrasement refuse par le test CLI.

Tests locaux : interruption avant ecriture, references partielles, pending vers succeeded, echecs de remboursement explicites, panne fournisseur/base, accuse perdu apres CAS, doublons, annulation preservee, observations desordonnees, concurrence et modification de titulaire dans le meme statut, environnement/plateforme/beneficiaire/montant/titulaire/metadata errones, recherche incomplete, notification accepted/uncertain preservee, diagnostic sans ecriture. Les appels financiers et notifications sont des pieges verifies a zero, et fetch est interdit dans les tests/CLI.

Preuves expurgees : docs/assets/reconciliation-h1-2-2026-11-05/. Tests du Kanban et affichage ordinateur/mobile controles. Aucun nouveau build Next necessaire : aucun fichier applicatif, module partage ou route modifie, seulement un outil isole et des documents. Pas de nouvelle validation externe des paiements ni de test de charge.

## Reste a faire et Kanban

- H1.2.1 : conception, moteur et CLI locaux/tests, termine.
- H1.2.2 : adaptateurs de lecture/provider et CAS durable raccordes aux services metier, a preparer. Reutiliser controles actifs de plateforme/liaison et autorisations, jamais croire un platformVerified fourni par un client. Preparer SQL local si necessaire; pas de migration distante autorisee. Definir l'intention d'annulation durable avant tout traitement automatique d'un remboursement orphelin.
- H1.2.3 : validation de recette externe et procedure d'exploitation bornee, a preparer apres H1.2.2 et autorisation des operations correspondantes. Ordonnanceur, files de reprise et indicateurs, pas d'envoi sur uncertain sans decision explicite.

Le parent H1.2 et H1 restent ouverts. Aucune validation humaine, duree mesuree ou operation distante inventee. Prochain ticket : H1.2.2, d'abord developpement/tests locaux sans acces fournisseur.

## References officielles consultees le 5 novembre 2026

Les evenements peuvent etre dupliques et livres hors ordre; relire les objets lie(s) et ne pas se fier a leur timestamp comme ordre unique : [webhooks Stripe](https://docs.stripe.com/webhooks#event-ordering). Les etats de remboursement comprennent aussi les echecs et actions requises : [objet Refund](https://docs.stripe.com/api/refunds/object). Liens financiers compares : [Transfer Reversal](https://docs.stripe.com/api/transfer_reversals/object), [Application Fee](https://docs.stripe.com/api/application_fees/object).

Pour le futur branchement evenementiel, examiner checkout.session.completed, refund.created, refund.updated, refund.failed et application_fee.refund.updated selon les besoins reels : [catalogue Stripe](https://docs.stripe.com/api/events/types). Aucun abonnement evenementiel ni configuration distante change dans ce lot.
