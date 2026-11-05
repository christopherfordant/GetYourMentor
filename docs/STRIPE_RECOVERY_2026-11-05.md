# Recette Stripe sandbox et reprise webhook - 5 novembre 2026

## Resultat observe

Environnement recipe-accounts-v2, Stripe test uniquement et Supabase de recette. Aucun paiement reel, nouvelle migration distante ou deploiement.

Le paiement utilisateur deja effectue a ete relu chez Stripe : Checkout complete/paid, PaymentIntent succeeded, 40 EUR. Commission de plateforme 6 EUR, transfert brut 40 EUR (ne pas confondre avec 34 EUR nets avant frais externes). References, destination et environnement verifies.

Le webhook avait retourne HTTP 503. Le reglement fournisseur etait valide lors de la reprise. Ajout de diagnostics de phase bornes a la recette, sans payload, cle ni erreur brute. Apres reconstruction, rejeu officiel du veritable evenement avec Stripe CLI : HTTP 200, statut paid et references financieres persistantes. Le 503 initial ne s'est pas reproduit : sa cause exacte n'est PAS demontree. Aucune protection de signature, montant, droits ou environnement n'a ete relachee.

Un second rejeu officiel retourne 200 sans autre Checkout ni nouvelle notification : une session correspondante, une notification paid acceptee, une tentative. L'utilisateur confirme la reception Telegram sur son telephone. Pas de renvoi de message accepte.

Annulation normale par le sportif executee deux fois : 200, cancelled, refund succeeded, 100 % / 40 EUR, meme reference. Stripe confirme un seul remboursement de 4000 centimes, transfert 4000 integralement repris, commission 600 integralement remboursee. Snapshot financier conserve. Troisieme rejeu officiel apres remboursement : 200; relecture Supabase : toujours cancelled/refund succeeded. Les trois reservations historiques ont ete comparees et preservees avant remboursement.

## Code livre

Routage explicite et verifie par plateforme, coffre sandbox distinct, associations Connect par environnement; reservation liee atomiquement a son environnement, validation des sessions existantes, refus des melanges pour paiement/remboursement/webhook. Accounts v2 recipient et API stable. Parametre Checkout allowed_payment_method_types valide chez Stripe; ancien payment_method_types refuse par cette version. Namespace d'idempotence adapte apres refus constate, sans rotation repetee. Conservation des cles historiques legacy.

Page de retour : le coach est derive de la reservation autorisee, plutot que requis dans l'URL Stripe. Une reservation annulee ne propose plus de payer et affiche son etat. Session, preuve privee ou jeton existant restent controles; un autre compte recoit 403. Aucun changement des droits pour rendre la recette passante.

## Controles

- 21 tests fournisseurs/webhook PASS (mocks, distincts des preuves externes).
- Builds Next : compilation, types et controle frontiere secrets client PASS.
- Deux projets Playwright reels, ordinateur et mobile : retour apres remboursement, absence de debordement, bouton desactive, acces d'un autre compte refuse. Nouvelle execution finale archivee a part.
- Secrets/coffres, cookies, URLs temporaires et captures de reservation restent hors Git dans delivery-private; seules les syntheses expurgees sont versionnees.
- Preuves : docs/assets/stripe-recovery-2026-11-05/.

## Limites et suite

Pas de validation globale de production. Le deuxieme sportif reste absent suite au quota e-mail; aucun nouvel essai d'inscription inutile. Aucun refus de carte reellement observe : l'essai automatise n'avait produit aucun appel et ne vaut pas test Stripe refuse. Completer ces cas et la recette metier restante avant cloture du parent GYM-B1. Ne pas refaire le paiement rembourse. Le serveur local demande le coffre sandbox et une approbation recette non expiree; pas de renouvellement automatique. Aucun secret dans la documentation.

La reception Telegram paiement est maintenant confirmee par l'utilisateur. Les captures privees et logs bruts sont conserves localement, non publies. La consommation de credits ou de temps non mesuree n'est pas inventee.
