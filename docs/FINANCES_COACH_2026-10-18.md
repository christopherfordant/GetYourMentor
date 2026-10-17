# Montants du tableau coach — 18 octobre 2026

## Périmètre et sources
Lot unique, base 9df62d1 sur design/refonte-progressive-lot1, candidat isolé GYM-coach-finance. BP p.31 : visualisation des réservations et analyse des revenus ; p.35 : commission et tableaux avancés ; p.51 : gestion avancée. Contrats visuels existants conservés : seules la carte de montants et sa synthèse haute dans le CoachDashboard dans AccountLegacyPage.tsx est enrichie, pas un tableau parallèle. Aucun nouveau moteur de paiement, dépendance, migration, abonnement ou déploiement.

## Sémantique retenue
Aucun paidAt fiable dans Reservation. La carte affiche donc **réservations créées dans le mois courant Europe/Paris**, année comprise ; ce n’est ni le mois du navigateur, ni un mois de paiement ou reversement. createdAt doit être un instant explicite valide ; borne incluse début de mois et exclue au début suivant, conversion Intl Europe/Paris. Une date inexploitable est signalée hors rattachement mensuel, jamais inventée.

Statuts : paid ; cancelled seulement avec indice de paiement antérieur (identifiant de paiement ou remboursement positif succeeded/pending). Une annulation sans paiement documenté est exclue explicitement : les snapshots existent aussi dès la demande, ils ne prouvent donc pas un paiement. Requested/accepted/rejected sont exclus. Déduplication par ID et filtrage défensif par coachId.

Montants en centimes provenant du snapshot historique validé (EUR, entiers, somme part coach + frais = brut). Aucun recalcul avec la commission actuelle ou repli sur price : un historique absent/incohérent est signalé. La commission administrable de séances reste inchangée, et aucune vente de contenus n’est mélangée à cette synthèse.

- Brut historique : somme des grossCents documentés de la cohorte de création.
- Remboursements enregistrés effectués : refundAmount pour succeeded seulement. Pending est signalé sans déduction ; not_required exige un montant nul.
- Commission restante : platformFeeCents moins refundedPlatformFeeCents historique ; si cette dernière valeur manque, prorata calculé par refundedCommissionCents sur le snapshot historique existant. Aucune modification de l’historique enregistré.
- Part coach : coachAmountCents moins la part remboursée à sa charge. Invariant : brut - remboursements = commission restante + part coach.
- Sous-total explicitement partiel lorsqu’un dossier est exclu. Si aucun dossier exploitable mais présence d’informations manquantes, afficher Indisponible au lieu de zéro. Un périmètre réellement vide peut afficher zéro.

Les montants ne prouvent jamais un encaissement bancaire. En mode démo, mention explicite des simulations et absence de reversement réel ; en mode réel, formulation limitée aux réservations enregistrées. Chargement/erreur/profil non identifié sont des états distincts ; un échec de lecture n’est pas converti en zéro financier.

## Autorisations et rendu
API `/api/reservations` existante : l’identité coach est dérivée de la session côté serveur et le coachId étranger refusé. Pas de nouvel accès API ou RLS ; filtrage UI par ID remplace le filtre par nom. Les tests HTTP vérifient l’isolation avec un autre coach réellement inscrit ; la recette visuelle utilise des réponses JSON fictives contrôlées, pas un paiement réellement exécuté pour ces montants. Le parcours de paiement simulé existant est recetté séparément.

Captures 390/1440 et vérification d’absence de débordement 320/390/768/1440 : assets/coach-finance-2026-10-18. Les tests émulent America/Los_Angeles pour vérifier l’indépendance du fuseau du navigateur. Utilisation du style existant ; aucun changement de header ou des autres comptes.

## Validation et limites
Résultats finaux dans assets/coach-finance-2026-10-18/verification.json. Tests des bornes de mois/année, changement d’heure, statuts, centimes, remboursements total/partiel/en attente/incohérents, snapshot absent, date invalide, doublons, coach étranger ; UI sous-total/erreur et quatre largeurs ; régressions commission/paiement. Build/typage et contrôles ciblés selon preuve finale. Aucune recette RLS/Blobs distante, charge élevée ou WCAG exhaustive revendiquée.

Les annulations sans preuve de paiement antérieur restent ambiguës, notamment certains paiements locaux annulés sans remboursement ; pas de date ou statut antérieur reconstitué arbitrairement. Le mois est celui de la création, et non un bilan comptable des flux du mois. Aucun coût/solde Codex connu ou garantie anti-limite. Les modifications préexistantes du dépôt principal sont préservées.

Retour arrière : revert ciblé de ce lot sans purge ni recalcul des snapshots. Prochaine tranche proposée : conserver prospectivement une preuve de paiement/date fiable, si les sources métier le justifient, puis seulement envisager une période d’encaissement ; ne pas étendre maintenant aux tableaux structure/admin. V1/V2/V3 incomplets.

Le build initial a repéré une référence résiduelle à paidRevenue dans le résumé haut. Correction : un seul calcul partagé par les deux présentations ; ni ancienne somme en euros conservée ni variable artificiellement réintroduite. Validation finale dans la preuve.
