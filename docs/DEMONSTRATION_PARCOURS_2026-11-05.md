# Guide de demonstration du parcours de recette - 5 novembre 2026

## Mode de presentation

Presenter les preuves deja obtenues, sans creer de compte, reservation, paiement ou notification pour les captures. Comptes fictifs existants : coach1, coach2, sportif1 et sportif2; les alias appartiennent au meme proprietaire. Acces dans le coffre DPAPI local GetYourMentor-Test, jamais dans ce guide. Les images de coachs et donnees de recette ne prouvent aucune qualification professionnelle.

Le serveur recette habituel est http://127.0.0.1:3005; sa disponibilite et l'approbation temporaire doivent etre verifiees avant visite. Le lot de securite courant arrete ce serveur pour reconstruire son build et ne renouvelle aucune approbation. Les anciennes sessions sans echeance serveur sont refusees apres cette correction : se reconnecter normalement, sans recreer les comptes ni reutiliser les anciens cookies du coffre. Ne pas afficher les fichiers prives ou leurs URLs temporaires en presentation.

## Fil conducteur (5 a 8 minutes proposees)

| Etape / page | Action de presentation et resultat attendu | Prerequis et preuve existante | Limite / intervention |
|---|---|---|---|
| Inscription, /compte | Expliquer le formulaire et la confirmation normale par e-mail; montrer la synthese des quatre comptes confirmes | assets/recipe-final-cases-2026-11-05/accounts-persistence.json | Ne pas soumettre une nouvelle inscription; confirmation humaine deja obtenue |
| Espace sportif, /compte | Presenter reconnexion, liste personnelle et deconnexion; illustrer le refus d'un role choisi dans l'URL | sportif2-controls.json dans le meme dossier | Acces normal requis; captures de compte uniquement dans delivery-private, masquer adresse et identifiants |
| Recherche et fiche, /recherche et /coachs | Montrer recherche et profil de demonstration existant sans envoyer de demande | assets de recipe-accounts du lot Stripe et preuves privees existantes | Approbation coach recette temporaire; ne pas transformer verified=false en badge professionnel |
| Reservation, /creneau puis /recapitulatif | Expliquer creneau, prix serveur40EUR et demande requested sur archives | CONNECT_PARCOURS_TEST_2026-11-04.md et resultats de recette prives | Ne pas recreer de reservation pour la demonstration |
| Acceptation, /compte mode coach | Expliquer requested vers accepted, mauvais coach403 et conflit409 deja observes | Rapport CONNECT, section reservations externes | Compte coach requis pour une visite; aucune nouvelle transition ici |
| Checkout, /paiement | Montrer le fonctionnement du Checkout Stripe test a partir des preuves, pas d'un nouveau paiement | assets/stripe-recovery-2026-11-05/sandbox-paid-replay-summary.json | Le paiement historique est deja rembourse; ne jamais le repayer ni reutiliser son lien comme s'il etait payable |
| Confirmation | Montrer paiement test40EUR, commission6EUR, transfert brut40EUR et persistance apres webhook | STRIPE_RECOVERY_2026-11-05.md | Distinguer preuve historique et controle execute pendant la presentation |
| Telegram | Expliquer notification unique, deduplication et reception telephone confirmee par utilisateur | Meme rapport et synthese des rejeux | Ne pas renvoyer la notification ni montrer bot token/chatId |

Les noms de routes sont ceux de l'application. Pour une fiche ou reservation precise, utiliser la navigation normale ou la reference locale privee apres authentification, pas un identifiant invente dans un lien public.

## Variantes utiles

- Refus : declined-payment.json, reponse reelle402 card_declined/generic_decline et message Checkout. Reservation accepted/impayee, aucune capture/transfert/commission ni notification paid. Pas de nouveau clic Payer.
- Quitter/reprendre : checkout-exit.json et browser-controls.json; lien Retour normal et session impayee reutilisable lors du controle historique. Une session expiree ulterieurement ne constitue pas une regression de ce controle.
- Remboursement : sandbox-refund-api.json et sandbox-refund-stripe-summary.json, un seul remboursement40EUR apres deux demandes idempotentes, transfert repris et commission remboursee.
- Isolation : sportif2-controls.json, lectures et annulations croisees403, action coach401 et liste personnelle filtree. Les captures de comptes sont privees; preferer la synthese expurgee.
- Expiration serveur : nouveau test local avec cookies synthetiques expires/anciens, API401 puis connexion normale et deconnexion. Aucun compte distant ni paiement implique.

## Kanban et honnetete de presentation

http://127.0.0.1:4325/ : filtrer GYM-B1 pour la recette terminee, puis GYM-H1 pour la fiabilisation suivante. Roles planifies simules, estimations distinctes du temps reel non mesure. Une carte terminee pointe sur ses preuves; ce n'est pas une certification de production.

Limites : mode Stripe test force, pas de ventes reelles, approbation de recette non professionnelle, remboursements differes/reconciliation et exploitation a completer. Cause exacte du503 initial non etablie. Ne pas revendiquer RAG vectoriel ou agents autonomes pour ce parcours metier.
