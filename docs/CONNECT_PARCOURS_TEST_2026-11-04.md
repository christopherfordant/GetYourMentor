# Parcours métier Stripe Connect test — livraison locale du 4 novembre

## Statut réel

**Préparation locale livrée ; parcours externe non terminé.** Priorité métier avant A5, RAG hors chemin critique. Base Git `8b0c140`, checkout isolé `C:/Users/cashe/Documents/GYM-connect-test-20261104`. Les brouillons du dossier principal sont préservés.

Aperçu local : http://127.0.0.1:3005/compte?mode=coach. Il fonctionne en **simulation locale**, sans accès fournisseurs : les inscriptions de cet aperçu ne constituent pas une persistance Supabase. Le panneau Connect est masqué quand l'intégration est désactivée. Les captures du panneau utilisent un état API explicitement simulé.

Au contrôle de livraison, aucun coffre `%LOCALAPPDATA%/GetYourMentor-Test/services.clixml`, aucune variable fournisseur dans le processus et aucun fichier de configuration réel parmi les `.env*` du dossier applicatif vérifié. Ne pas confondre cette recherche limitée avec un audit de tous les disques. L'utilisateur dispose des comptes, mais les accès locaux manquent. Aucun utilisateur, compte connecté ou paiement n'a été créé à distance ; aucun message Telegram réel envoyé ou reçu.

## Ce qui a été réalisé

- Connect de test : onboarding Express depuis le compte coach authentifié, bénéficiaire issu d'une association serveur immuable. Le navigateur ne choisit ni coach bénéficiaire ni commission. Origine, rôle et fréquence contrôlés ; réponses sans cache.
- Checkout : paiement après acceptation, montant et commission issus de l'instantané historique, destination Connect vérifiée, carte de test uniquement pour ce flux, idempotence stable. Conservation du compte connecté avec la session.
- Confirmation : webhook signé existant ; avant passage à payé, lecture Stripe du PaymentIntent de test, vérification montant/devise/commission/destination/réservation et conservation des identifiants de transfert et de commission. L'argent ne transite pas par un outil RAG. Les références encore absentes provoquent un réessai, pas un succès inventé.
- Annulation avec remboursement : pour une destination Connect, demande de reprise proportionnelle du transfert et restitution proportionnelle de la commission. Les frais Stripe ne sont pas la commission de la plateforme.
- Inscription Supabase : prise en charge des deux formes de réponse GoTrue, refus des utilisateurs obfusqués/anciens avant changement de rôle, refus d'inscription administrateur et identifiant coach issu de l'identifiant Auth, distinct pour les homonymes. Une confirmation d'email attendue affiche un message de confirmation, sans prétendre ouvrir une session.
- Configuration : saisie masquée et chiffrement Windows DPAPI hors Git, projet de recette imposé, refus des clés Stripe live, secret de session conservé entre relances. En mode fournisseurs externes, aucun repli vers les comptes ou réservations mémoire. Telegram limité à une conversation privée explicitement configurée.

Choix Connect pour cette recette : **destination charges**, commission via `application_fee_amount`, destination via `transfer_data.destination`. Le transfert au solde Stripe du coach accompagne le paiement ; ce n'est pas un versement bancaire au coach après la séance. Le compte plateforme porte notamment les frais et risques de remboursement. Ce choix de test ne vaut pas validation commerciale/juridique du futur flux réel ou des contraintes de pays.

Sources officielles consultées : [destination charges et remboursements](https://docs.stripe.com/connect/destination-charges?platform=web&ui=stripe-hosted), [tests Connect](https://docs.stripe.com/connect/testing), [inscription Supabase](https://supabase.com/docs/reference/javascript/auth-signup).

## Contrôles exécutés et preuves

[Dossier de preuves](assets/connect-test-2026-11-04/) :

- **13/13 tests unitaires** avec fetch fournisseur simulé : frais, bénéficiaire, compte prêt, clés live refusées, onboarding initial, stockage absent, liens contraints, références et remboursement ; inscription sans session, doublon, rôle interdit et configuration manquante.
- **26/26 contrôles locaux** via Playwright ordinateur/mobile : contrôles d'accès Connect et inscription, parcours de paiement simulé, signatures/rejeu/erreurs du webhook, préférences Telegram et contrats de formulaires. Les tests purement API sont répétés par projet ; ce ne sont pas 26 parcours navigateur indépendants.
- **2/2 contrôles du panneau Connect** : compte coach de démonstration, état Connect simulé, rendu ordinateur/mobile, focus clavier et échec d'onboarding sans redirection. Captures `panel-desktop-chromium.png` et `panel-mobile-chromium.png`, examinées.
- Build Next terminé, routes générées et BUILD_ID présent ; `check:types`, contrôle Netlify, schéma SQL de référence et frontière des secrets client réussis. Le wrapper d'affichage du build a échoué à imprimer les caractères Unicode après la fin du build ; le journal du compilateur est conservé.
- Première recette lancée à tort sur le port 3001 : 16 contrôles réussis, 10 erreurs de connexion, archive conservée. Correction du **runner isolé** vers 3005, sans modifier le fichier Playwright déjà modifié du dossier principal ; passage final 26/26.
- Syntaxe des quatre propositions SQL analysée avec pglast 7.22 local non commité. Cela ne vérifie ni les corps PL/pgSQL ni la compatibilité effective avec la base.

Ces résultats ne prouvent ni Checkout externe, ni transfert Connect externe, ni RLS avec des JWT réels, ni persistance après redémarrage, ni réception Telegram. Ces essais restent à faire.

## État distant observé et migration proposée

Session Supabase ouverte sur `getyourmentor-preprod`, référence `pqxqqbwesfrefzjoawmx`. Deux requêtes **BEGIN READ ONLY** ont inspecté les colonnes uniquement, sans lire de lignes métier ni modifier la base. [Métadonnées observées](assets/connect-test-2026-11-04/remote-schema-readonly.json).

Les anciennes tables `gym_coaches` et `gym_reservations` existent. Il manque notamment les champs de vérification/profil actuels, l'instantané financier et les références Checkout/Connect. Les tables `gym_telegram_state` et `gym_stripe_coach_accounts` sont absentes. L'état des autres dépendances et des politiques effectives doit être revérifié lors de la répétition, pas supposé conforme.

Proposition bornée : [20261104_business_test_bundle.sql](../supabase/proposals/20261104_business_test_bundle.sql), 94 instructions. Réemploi limité aux tables coachs, réservations, conflits de créneaux, avis et messages utilisées par les lecteurs actuels ; ajout de la configuration de commission, de Telegram et du mapping Connect. Aucun club, bucket, RAG, seed de coach ni historique financier réécrit. Le taux initial de 15 % n'est inséré que si la configuration est absente. Droits directs des rôles public/anon/authenticated retirés des tables concernées, accès métier par les routes serveur autorisées.

**Non exécuté. Autorisation spécifique nécessaire selon la consigne utilisateur sur les migrations distantes.** Ordre proposé :

1. Confirmer le projet, capturer le DDL/droits/contraintes antérieurs et vérifier les dépendances et doublons éventuels. Ne pas supprimer des données pour faire passer un index ou une contrainte.
2. Exécuter [la répétition transactionnelle terminée par ROLLBACK](../supabase/proposals/20261104_business_test_rehearsal.sql), avec vérifications SQL des colonnes, droits, fonctions et contraintes avant annulation. Cette répétition prend temporairement des verrous ; l'annulation évite toute conservation du schéma.
3. Vérifier le retour à l'état antérieur ; uniquement si conforme et autorisé, exécuter la version persistante puis la recette d'accès réelle.
4. Après COMMIT, ne pas prétendre disposer d'un rollback global automatique. Le [retour arrière Connect à données vides](../supabase/proposals/20261104_stripe_connect_test_rollback_empty.sql) refuse les suppressions dès que des preuves de paiement sont présentes. Les autres évolutions demandent une restauration DDL revue à partir de la capture préalable. Aucun effacement aveugle ni restauration de sauvegarde gratuite supposée disponible.

## Intervention locale nécessaire

Dans PowerShell, depuis ce checkout :

```powershell
& 'C:\Users\cashe\Documents\GYM-connect-test-20261104\gym-next\scripts\configure-test-services.ps1'
& 'C:\Users\cashe\Documents\GYM-connect-test-20261104\gym-next\scripts\check-test-services.ps1'
```

Les champs demandés couvrent les trois accès Supabase, Stripe test, pays ISO du compte connecté de test, secret webhook et bot/destinataire Telegram. Le token du bot et les clés restent dans les champs masqués, jamais dans la conversation. Ne pas remplacer une configuration de production pour cet essai.

Le secret Stripe doit provenir du transfert officiel destiné à `http://127.0.0.1:3005/api/webhooks/stripe`. La réception de `/start` Telegram reste à raccorder : inspecter le webhook existant avant tout changement, préférer une réception adaptée sans détourner le bot d'un autre usage. Aucun changement distant du bot effectué. Ne pas inventer le chat ID.

Après migration autorisée et configuration, arrêter l'aperçu simulé puis lancer `scripts/start-test-services.ps1`. Ce lanceur exige la configuration complète ; il ne suffit pas à prouver les événements externes ou à les acheminer.

## Recette externe restant à effectuer

1. Inscrire deux coachs et deux sportifs de démonstration et garder les accès dans un dossier local privé. Vérifier inscription normale et confirmation requise ; toute fixture auto-confirmée éventuelle doit être explicitement distinguée.
2. Vérifier reconnexion, persistance et isolation par rôle. L'approbation métier du coach reste obligatoire avant réservation ; aucun faux diplôme ou badge de vérification fabriqué pour débloquer la recette.
3. Compléter le profil, le tarif et les disponibilités ; réaliser l'onboarding Connect avec les seules données de test Stripe.
4. Demander puis accepter une réservation, tester paiement réussi/refusé/abandonné et retour avant webhook. Contrôler les références Stripe et les états en base après redémarrage.
5. Tester doublons et événements désordonnés, remboursement et reprise du transfert. Le webhook des remboursements différés et la réconciliation des échecs de remboursement restent à compléter/valider avant de déclarer le cycle financier exhaustif.
6. Associer mon seul Telegram, tester envoi, panne et déduplication. Distinguer acceptation API et confirmation de réception sur mon téléphone.

## Limites et préparation au réel

Le provisionnement Auth/rôle/profil est encore multi-étapes : une panne intermédiaire peut laisser un compte partiel nécessitant une reprise contrôlée. Aucune transaction distribuée ou reprise automatique de ce cas revendiquée. Les sessions existantes et leurs expirations doivent être contrôlées lors de la recette réelle. Les six anciens échecs diagnostiques RAG restent hors de ce lot et ne conditionnent pas le paiement.

Avant le réel : vérifier comptes et capacités, responsabilités de la plateforme, pays compatibles, calendrier des versements, frais, remboursements différés/litiges, données de production, secrets et webhooks distincts, monitoring et contrôles d'accès réels. Les protections actuelles refusent les clés live ; aucune bascule automatique, encaissement réel, achat ou publication autorisée.
