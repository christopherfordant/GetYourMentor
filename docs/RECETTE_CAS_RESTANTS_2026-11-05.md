# Recette des cas restants et cloture GYM-B1 - 5 novembre 2026

## Perimetre et conclusion

GYM-B1 et GYM-B1.5 satisfont leurs criteres de recette bornes : deux coachs et deux sportifs confirmes en base, isolation, acceptation et paiement Connect sandbox, remboursement et Telegram. GYM-B1.4 conserve sa validation precedente. Deux sous-tickets rendent les derniers controles visibles : GYM-B1.5.1 (second sportif) et GYM-B1.5.2 (refus Checkout), tous deux termines avec preuves.

Il ne s'agit ni d'une validation globale de production, ni d'une cloture du RAG ou de tous les parcours financiers. Le paiement reussi de 40 EUR, le remboursement et Telegram restent les preuves du lot precedent : [rapport de reprise Stripe](STRIPE_RECOVERY_2026-11-05.md). Aucun nouveau paiement reussi n'a ete effectue. Cause exacte du premier 503 toujours non demontree.

## Deuxieme sportif

Verification prealable : compte absent. Une premiere requete locale mal renseignee (telephone vide) a ete refusee avant appel fournisseur; correction du champ obligatoire avec une valeur fictive de recette, sans appel/SMS. Une seule inscription fournisseur effective a ete acceptee HTTP202, puis compte en attente relu avec role sportif. Utilisateur a confirme le lien e-mail normal; confirmation ensuite relue chez Supabase, sans auto-confirmation administrative ni modification de protection.

Deux coachs et deux sportifs uniques sont confirmes. Pour les coachs, profils gym_coaches presents. Pour les sportifs, informations d'inscription persistantes dans Supabase Auth user_metadata et role app_metadata : aucune table dediee aux sportifs inventee. Alias Gmail controles par le meme utilisateur, pas des personnes reelles distinctes.

Connexion du second sportif avec role client coach volontairement contradictoire : role serveur sportif conserve. Espace sportif affiche meme avec URL mode=coach. Creation d'une seule reservation de demonstration pour rendre l'isolation observable; lecture et liste propres accessibles, reservation de l'autre sportif absente de cette liste. Lecture et annulation croisees refusees403 dans les deux sens; action coach refusee401. Reservation personnelle ensuite annulee par son proprietaire, sans paiement. Deconnexion : API privee401; reconnexion reussie et role conserve. Cookies utilises uniquement en memoire; mot de passe deja present dans le coffre DPAPI, hors Git.

## Refus Checkout externe

Nouvelle reservation distincte de celle deja remboursee, tarif serveur40EUR, creation puis acceptation normale par coach. Approbation temporaire relue valide, non renouvelee. Plateforme sandbox verifiee, cles test uniquement. Checkout obtenu par endpoint metier et persiste; une nouvelle demande de paiement retrouve la meme session.

Carte officielle de refus generique 4000 0000 0000 0002, expiration12/30 et CVC de test. Saisie dans les champs visibles de Checkout via Playwright local : une requete confirm observee, reponse HTTP402, card_declined/generic_decline. Message visible : Votre carte de credit a ete refusee. Essayez de payer avec une carte de debit. Le message vient de Stripe, pas d'une simulation de notre UI. Aucune verification humaine contournee.

Relecture Stripe : session open/unpaid, PaymentIntent requires_payment_method, charge non payee/non capturee, aucun transfert ni application_fee creee. Relecture metier : reservation accepted, aucune reference de paiement reussi/transfert/commission persistante. Aucune notification paid pour cette reservation dans l'outbox. Champ carte encore modifiable sur reouverture, meme Checkout retourne par API. Lien Retour natif suivi : retour a l'application sans message de paiement confirme, reservation toujours accepted. La reservation de refus reste volontairement acceptee/impayee pour pouvoir reprendre ce scenario; ne pas la presenter comme une vente.

La reservation historique deja remboursee reste cancelled/refund succeeded.

Sources officielles consultees le 5 novembre 2026 : [cartes de refus Stripe](https://docs.stripe.com/testing#declined-payments), [tests automatises](https://docs.stripe.com/automated-testing). Aucun test de charge ni appel direct avec un vrai numero de carte.

## Kanban et controles

Source versionnee : tools/agentic-workbench/backlog.json, servie par http://127.0.0.1:4325/backlog.json. Interface : http://127.0.0.1:4325/.

Statuts termines uniquement apres controles ci-dessus et relecture des criteres/dependances. Temps reels non mesures, actualHours reste null; roles de planification simules. Estimation du lot final repartie en deux sous-tickets1-2h, sans la presenter comme temps passe.

Affichage controle avec Playwright dans des contextes neufs sur ordinateur et mobile, statuts visibles compares aux donnees, sans surcharges manuelles appliquees. Le tableau utilise une cle localStorage derivee du SHA256 des tickets : les anciens brouillons sont conserves par l'application et ne sont pas automatiquement reappliques sur un nouveau dossier. Aucune suppression/reset du stockage personnel ni ecrasement des deplacements manuels. Les captures de ces contextes ne prouvent pas l'etat d'une autre fenetre deja ouverte : la recharger pour afficher la source mise a jour; utiliser l'export des anciens deplacements si necessaire.

Tests Kanban executes; aucun code applicatif modifie dans ce lot, pas de rebuild necessaire. Les21 tests Stripe/webhook et le build du lot precedent ne sont pas presentes comme reexecutes aujourd'hui. Controles secrets et pre-push executes avant livraison, SHA distant a lire dans Git apres push.

Preuves expurgees : [dossier](assets/recipe-final-cases-2026-11-05/). Captures de compte, Checkout, URLs temporaires, identifiants et secrets restent en local hors Git dans delivery-private. Aucun achat, deploiement Netlify, migration distante ni paiement reel.

## Limites restantes avant production

Refus live volontairement maintenu. Provisionnement Auth multi-etapes non transactionnel, gestion des remboursements differes et reconciliation des echecs, litiges/obligations et exploitation restent des travaux distincts. Aucun cycle financier exhaustif ni conformite globale revendiques. Toute approbation de coach recette reste temporaire et non professionnelle. La cloture de GYM-B1 n'autorise pas le reel ou un deploiement.
