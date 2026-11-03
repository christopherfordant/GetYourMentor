# Réservation, Stripe TEST et Telegram — 3 novembre 2026

## État réel

Lot local contrôlé, raccordement externe en attente. Aucun déploiement, migration distante, paiement réel ou message Telegram réel. L'utilisateur confirme disposer d'un compte Stripe et d'un bot Telegram ; aucun accès n'a encore été enregistré par le nouveau formulaire local lors de la livraison.

Aperçu : http://127.0.0.1:3005/ et `/compte?mode=sportif`. Checkout de recette : `C:/Users/cashe/Documents/GYM-stripe-telegram-20261103`, base 7486bc9. Serveur démarré sans accès externe. Relance depuis `gym-next` : `node scripts/run-test-preview.cjs` après build. Un seul serveur Next de recette doit fonctionner à la fois.

## Réemploi et changements

Le parcours demande → acceptation → paiement existait, avec simulation locale, adaptateurs Supabase/Blobs, emails et connecteur Stripe non raccordé. Le lot réutilise ce fonctionnement. Le brouillon antérieur de durcissement du webhook et son test ont été examinés et repris ; les autres modifications antérieures restent séparées.

- Stripe : clés test uniquement, réponse Checkout test exigée, origine Checkout vérifiée, montant entier issu de la réservation, identifiant de session enregistré. Idempotency-Key stable par réservation. Les URL de retour ne contiennent plus le prix, la ville ou le nom.
- Webhook : corps brut borné, signature avec comparaison constante et tolérance 300 s, environnement test, devise/montant/session/PaymentIntent/titulaire/état contrôlés. Une réservation payée n'est pas payée une seconde fois. Un doublon payé peut réconcilier la notification, sans repayer. L'échec de persistance renvoie 503 pour permettre une reprise Stripe.
- Paiement : données affichées issues du serveur, distinction acceptation/paiement, mention explicite de démonstration, retour navigateur insuffisant. L'annulation de Checkout n'annonce plus une demande en attente de coach.
- Telegram : activation facultative depuis le compte, code aléatoire valable cinq minutes stocké sous forme de condensat, conversation privée uniquement, confirmation depuis le compte connecté et désactivation. Aucune saisie arbitraire de chat ID par le navigateur.
- Notifications minimales selon rôle et réservation : demande au coach, acceptation/refus au client, paiement de test aux deux. Pas d'email, nom, coordonnées ou détail bancaire dans les messages.
- File persistante avec déduplication, reprise bornée, suivi accepté/échec/incertain. Réponse Telegram acceptée ≠ message lu. Un envoi ambigu n'est pas relancé automatiquement. Une réponse 429 respecte retry_after ; les échecs définitifs nécessitent un diagnostic. Après sept jours, le contenu ancien est supprimé lors de l'enqueue ; un condensat de déduplication est conservé. La désactivation retire liaison, association en attente et messages de cet utilisateur.
- Reprise manuelle depuis le compte : réconcilie au plus 100 réservations accessibles dans leur état courant, puis reprend les messages éligibles. Ce n'est pas un historique complet des transitions ni un ordonnanceur automatique.
- Les erreurs Telegram n'annulent pas la réservation enregistrée. Le stockage de notification et la transaction métier sont distincts : la reprise réconcilie l'état courant ; un ancien état transitoire déjà dépassé peut ne pas être récupérable.

Les cartes en éventail, les portes 2 200 ms, les quatre disciplines visibles et le dépliage des dix autres n'ont pas été modifiés. Aucune refonte globale des parcours n'est revendiquée : les composants de réservation existants sont conservés.

## Stockage et limites de production

La recette locale conserve les réservations dans la mémoire du processus : **pas de preuve de durabilité après redémarrage pour Stripe dans cette recette**. Le stockage Supabase existant est prévu pour la persistance réelle ; ses accès et son schéma distant restent à vérifier. Les tests Blobs utilisent un adaptateur hors ligne, pas Netlify en production.

Telegram : fichier privé atomique et file sérialisée dans `.private-data/telegram-state.json`, uniquement en recette loopback mono-processus. En environnement distant, stockage Supabase avec CAS et RLS. Migration préparée : `supabase/migrations/20261103_telegram_state.sql`, **non appliquée**. Aucun fichier local partagé n'est présenté comme un stockage distribué. Pas d'envoi automatique ou de tâche planifiée installé.

## Accès locaux sans partage de secrets

Dans PowerShell :

```powershell
& 'C:\Users\cashe\Documents\GYM-stripe-telegram-20261103\gym-next\scripts\configure-test-services.ps1'
```

Saisie masquée ; sauvegarde Windows DPAPI dans `%LOCALAPPDATA%/GetYourMentor-Test/services.clixml`, hors Git et hors navigateur. Stripe : clé `sk_test_…` ou clé restreinte test, jamais live. Le secret webhook Stripe doit correspondre exactement à l'outil de transfert employé pour la recette. Telegram : token du bot existant et secret webhook aléatoire de 32 à 256 caractères (lettres, chiffres, `_`, `-`). Les champs vides conservent une valeur existante. Ne rien coller dans la conversation.

Après configuration, arrêter le serveur sans accès puis exécuter `gym-next/scripts/start-test-services.ps1`. Le lanceur n'hérite que des variables explicitement autorisées ; il charge les secrets côté serveur. **Les envois Telegram restent désactivés** : le destinataire de recette doit encore être choisi et ajouté à une liste d'autorisation serveur avant tout essai. Le lanceur fourni ne suffit donc pas à prouver un envoi.

Stripe CLI n'a pas été trouvé. Préparer un transfert officiel des événements de test vers `http://127.0.0.1:3005/api/webhooks/stripe`, puis enregistrer son secret propre. Aucun endpoint local n'est joignable directement depuis Internet. Le bot nécessite aussi une réception de `/start` via webhook HTTPS ou un outil de polling contrôlé : **pas encore configurée**, aucun webhook existant n'a été modifié. Vérifier l'usage actuel du bot avant toute modification distante.

Références : [Stripe webhooks](https://docs.stripe.com/webhooks), [Stripe testing](https://docs.stripe.com/testing), [Telegram setWebhook](https://core.telegram.org/bots/api#setwebhook).

## Rejouer la recette locale

1. Ouvrir le compte sportif de démonstration (`sportif@example.com` / `demo-password`).
2. Choisir un coach de démonstration réservable, demander un créneau futur ; le paiement reste verrouillé.
3. Depuis le compte coach de démonstration, accepter le créneau ; la demande devient payable.
4. Dans l'aperçu livré, le paiement reste la **simulation locale** ; Stripe réel de test exige le lancement configuré séparément. Ne jamais fournir de carte réelle.
5. Avec les accès et le transfert raccordés, tester Checkout, carte de test refusée, abandon, authentification, retour avant webhook, doublons et redémarrage sur le stockage persistant. Ces essais restent à faire.
6. Telegram : compte → association → `/start code` au bot → vérifier réception → confirmer sur le site. Puis désactiver pour vérifier la révocation. Réception et envoi réels restent à faire avec le destinataire choisi.

## Contrôles exécutés

Build Next 15.5.27 et vérification TypeScript intégrée PASS. Configuration Netlify PASS. Frontière client/serveur PASS : aucun marqueur de secret serveur dans les artefacts statiques.

Suite ciblée finale **20/20 PASS** (10 scénarios × ordinateur/mobile ; les tests purement serveur sont répétés par projet, ce ne sont pas 20 tests navigateur distincts) : paiement local verrouillé avant acceptation, preuve serveur de simulation et conservation, adaptateur Blobs hors ligne, webhook signé/doublon/signature expirée/mauvais montant/devise/titulaire/événement live/paiement différé, association Telegram/authentification/origine, destinataires/déduplication/rétention, réponse d'envoi simulée/timeout simulé, Checkout simulé et refus de clé réelle.

Premier passage : 16 PASS / 4 FAIL, conservé dans `assets/stripe-telegram-2026-11-03/results-initial.json`. Corrections de recette : réservation identifiée plutôt qu'anonyme pour contrôler le titulaire, et réutilisation du cookie signé sur le transport HTTP de recette (protection Secure de production inchangée). Un essai préalable relancé sur un créneau déjà occupé avait renvoyé 409 ; pas de modification du mécanisme de conflit.

Preuves finales : `assets/stripe-telegram-2026-11-03/results.json`, `build.txt`, captures ordinateur/mobile. L'affichage « non configuré » est le véritable état de l'aperçu, pas une preuve d'association réelle. Aucun appel Stripe réel de test, refus 3DS réel, webhook externe ou message Telegram réel n'a été exécuté.

## Git et prochaine action

Push initial refusé non-fast-forward, distant observé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Aucun force-push, fusion ou rebase. Le commit local de ce lot et l'état distant final sont consignés dans la preuve Git de livraison. Aucun déploiement Netlify.

Prochaine action nécessaire : saisie locale des accès, raccordement de la réception Stripe/Telegram, choix des seuls destinataires de recette, vérification du stockage durable existant avant les essais externes. Une migration distante éventuelle exige une autorisation distincte. Ne pas annoncer le parcours externe terminé avant ces preuves.

### Compl?ment de livraison

Commit applicatif local : `38dd18ed628214577e36f027252bab5e2ebe1bb8`. Push normal refus? non-fast-forward ; distant relu inchang? `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a` (preuve `assets/stripe-telegram-2026-11-03/git-delivery.json`). Aucun contournement.

Le contr?le TypeScript global relanc? dans le dossier principal ?choue sur des copies historiques non suivies sous `gym-next/playwright-artifacts/.../delivery-originals`, `originals` et `avant` (imports absents et anciennes signatures de composants). Le build/TypeScript PASS d?crit plus haut concerne le checkout isol?, pas l'ensemble du dossier principal charg? de ces archives. Ces fichiers ant?rieurs n'ont pas ?t? supprim?s ou modifi?s pour faire passer le contr?le.

Le test Telegram utilise maintenant le baseURL du runner plut?t qu'un port fix?. Contr?le compl?mentaire cibl? ordinateur/mobile **2/2 PASS**, sans addition au total de la suite initiale ; preuve `preferences-final.json`. Captures r?archiv?es ? leur emplacement canonique. Aucun acc?s r?el n'est encore enregistr? au moment de cette cl?ture du lot local.
