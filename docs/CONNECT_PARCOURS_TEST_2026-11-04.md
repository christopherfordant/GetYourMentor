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

## Reprise autonome des acces apres demande utilisateur

L utilisateur ne souhaite pas executer de script : configuration poursuivie depuis les sessions ouvertes. Les trois parametres Supabase du seul projet de recette sont enregistres avec DPAPI et leurs JWT verifies pour ce projet/role, sans rotation. Auth settings atteint en lecture : confirmation email requise (autoconfirm false). Cle Stripe test enregistree avec DPAPI et verification reelle du mode test par API; pays Connect derive du compte configure, sans changement de compte. Aucun paiement ni compte connecte cree.

Un fragment de cle Stripe test a ete remonte par une inspection de libelle dans une sortie technique; il n est pas recopie ici. Les copies suivantes utilisent directement le presse-papiers Windows vers DPAPI sans retour de valeur. Le presse-papiers initial a ete restaure. Aucune cle live utilisee.

Stripe CLI 1.55.8 installe localement depuis la release officielle, archive SHA256 verifiee. Secret de reception obtenu via CLI test et enregistre avec DPAPI; forwarding continu pas encore lance. Lanceur filtre : gym-next/scripts/start-stripe-test-forwarder.ps1. Aucun log brut de secret ou payload prevu.

Telegram Web A n a pas charge; variante officielle K accessible et demandant une connexion par QR code. Le scan sur le telephone est une intervention personnelle indispensable; aucune extraction de session Telegram Desktop tentee. Token du bot et destinataire non recuperes. Autorisation de migration toujours en attente. L ancien constat de coffre absent plus haut decrit le debut du lot; il est remplace par cet etat plus recent.

### Etat le plus recent du raccordement

L utilisateur confirme Telegram connecte : champ de recherche visible et BotFather officiel verifie retrouve. La conversation reste en chargement et les clics ordinaires expirent; navigation clavier et lien de conversation sans succes. Aucune protection contournee, aucune autre conversation inspectee. Intervention minimale demandee : ouvrir manuellement BotFather officiel et laisser la conversation affichee, sans transmettre de cle dans la conversation Codex.

Le forwarder Stripe TEST a ete effectivement lance : connexion prete, secret concordant avec le coffre DPAPI. Aucun evenement de paiement genere; ce controle valide uniquement la connexion de reception. Scripts helper et version CLI syntaxes/empreinte verifies. Le serveur Next reste en simulation locale tant que migration et Telegram manquent; ne pas confondre transport Stripe connecte et parcours externe acheve.

Etat du coffre : huit parametres sur dix presents; manquent TELEGRAM_BOT_TOKEN et TELEGRAM_TEST_CHAT_IDS. Les acces Supabase, Stripe test et secrets generes ne doivent plus etre redemandes a l utilisateur. Migration distante toujours non autorisee, aucun compte ou paiement externe cree.

### Bot choisi et incident de copie Telegram

Choix explicite utilisateur : @Christopherfordantbot. BotFather est maintenant accessible. La tentative de clic sur le code a expire et son message d erreur a inclus le jeton courant. Aucune valeur de jeton n est reproduite ou archivee dans ce rapport. Incident signale; renouvellement dans BotFather et copie manuelle du nouveau jeton demandes. L API navigateur de presse-papiers a refuse la copie; pas de contournement de cette permission. Jeton Telegram non configure a ce stade, aucun getMe/getWebhookInfo encore reussi ni message envoye. Ne pas reutiliser le jeton expose. La rotation invalide les autres usages de l ancien jeton : information transmise a l utilisateur.

### Tentative autonome de renouvellement ? resultat non confirme

Apres instruction utilisateur de realiser la manipulation, les commandes /revoke et le nom du bot ont ete prepares et leur activation tentee par les controles normaux de Telegram Web. Aucune nouvelle confirmation de rotation n a ete observee. La conversation affiche une erreur BotFather 353933650. Le code ne prouve ni suppression du bot ni perte de propriete. Les activations de /mybots n ont pas produit de nouvelle reponse observable; l execution technique d une frappe ne vaut pas reception par Telegram. Aucun succes de renouvellement declare.

Un candidat copie depuis un message historique a ete controle avec getMe et appartenait a un autre bot : rejet immediat, suppression de la valeur provisoire chiffree, aucune configuration, notification ou modification de cet autre bot. getWebhookInfo n a pas ete atteint pour le bot choisi; aucun webhook change. La copie par raccourci standard fonctionne, sans desactivation de permission navigateur. Le blocage demeure l obtention d un nouveau jeton confirme pour le bon bot.

Etat final de cette tentative : aucun TELEGRAM_BOT_TOKEN ni TELEGRAM_TEST_CHAT_IDS dans le coffre. Brouillon de commande efface et presse-papiers initial restaure; sauvegarde temporaire retiree. Aucun paiement, message de notification ou migration effectue. Arret des essais similaires sans nouvelle preuve; aucune nouvelle manipulation manuelle redemandee dans cette tentative.

### Configuration Telegram confirmee apres copie autorisee

Sur instruction utilisateur de copier le jeton affiche, message BotFather explicitement pour @Christopherfordantbot capture sans retour de sa valeur. Identite getMe verifiee; jeton et destinataire personnel stockes DPAPI hors Git. Aucun webhook existant, aucun changement de webhook. Challenge /start retrouve une seule fois dans un chat prive dont expediteur et destinataire concordent; getUpdates sans offset, aucune confirmation/destruction d autres mises a jour. Message technique envoye une seule fois, accepte par Telegram; lecture sur telephone non confirmee. Presse-papiers initial restaure et sauvegarde temporaire retiree.

Ces controles valident le transport direct uniquement, pas l association authentifiee dans l application ni une notification de reservation. Coffre maintenant complet (10 parametres). Migration Supabase recette specifique toujours en attente d autorisation; aucune migration, aucun compte ou paiement externe cree. Ne pas relancer de collecte de jeton. Prochaine etape : autorisation bornee du bundle de recette, repetition transactionnelle puis raccordement des receptions et essais metier. Rapport : docs/CONNECT_PARCOURS_TEST_2026-11-04.md; preuve sans secret : docs/assets/connect-test-2026-11-04/telegram-setup-status.json.

### Migration autorisee et essais externes du parcours

Autorisation specifique recue dans la piece jointe 546b4ce8-f3d2-4741-b857-322eb130777e. Bundle metier applique UNIQUEMENT au projet pqxqqbwesfrefzjoawmx apres sauvegarde privee definitions/droits/politiques/contraintes/dependances, repetition avec assertions et ROLLBACK compare identique. Assertions persistantes PASS; metadonnees RAG comparees inchangees. Tests SQL rollback PASS (droits anon/authenticated, snapshot immuable, unicites creneaux/paiement). REST reel : cinq tables refusees anon, accessibles service_role. Aucun jeu de donnees historique efface.

Un coach et un sportif de demonstration crees via la vraie inscription; mots de passe DPAPI hors Git. Coach confirme par lien email, connexion verifiee et role fourni par navigateur ignore. Sportif attend confirmation. Troisieme inscription coach2 refusee HTTP400, cause non etablie, pas de relance automatique; sportif2 non tente. Coach non approuve : garde de reservation conservee, aucun faux diplome ni verification simulee. Adresse controlee et mots de passe jamais dans les preuves versionnees. Retour du lien email ne s ouvre pas chez utilisateur; verification Supabase confirme neanmoins coach actif. Ne pas assimiler confirmation email a approbation coach.

Correction reelle : controles Origin des routes Connect et Telegram utilisent NEXT_PUBLIC_APP_URL au lieu de l URL interne Next. Build et types PASS; 15 tests de regression PASS dont deux tests API reels et 13 tests fournisseurs mocks. Controle authentifie Telegram : origine etrangere/absente refusee, action invalide400, association200. Code exact recu via bot personnel puis transmis au webhook local protege; confirmation depuis session coach200, liaison persistee et relue200. Helper receive-telegram-test-once.ps1 borne a coach1, aucune avance offset ni modification webhook; reception ponctuelle, pas un service permanent. Aucun message metier de reservation envoye.

Blocage Stripe reel : API creation compte Connect test400 invalid_request_error, plateforme non inscrite a Connect. Aucun compte connecte, Checkout, transfert ou remboursement cree. Demande utilisateur en attente : activer Connect depuis dashboard.stripe.com/connect (renseignements entreprise/acceptations personnelles si demandes), confirmer email sportif. Ne pas contourner Connect ou desactiver confirmation email. Apercu http://127.0.0.1:3005 en services REELS DE RECETTE, session serveur 88903 au lancement; ancien mode simulation remplace. Stripe listener precedent a reverifier avant paiement, aucun evenement encore traite. Pas de deploiement. Rapport et preuves : docs/CONNECT_PARCOURS_TEST_2026-11-04.md, docs/assets/connect-test-2026-11-04/business-recipe-status.json. Captures/recette navigateur du parcours connecte complet encore non realisees.

Sauvegardes privees : delivery-private/business-schema-before-20261104.json et business-schema-after-20261104.json. Aucun rollback global automatique apres COMMIT : restauration a revoir a partir du baseline avant toute nouvelle modification. Premiere tentative de repetition refusee pour une erreur de delimiteur SQL dans le wrapper, corrigee avant repetition reussie; aucune modification persistante de cet essai, comparaison du rollback PASS. Des activations de controles SQL sans resultat observable ne sont pas comptees comme executions; seule la nouvelle requete avec resultat database_contracts_passed est retenue.

### Deuxieme coach Outlook et diagnostic des inscriptions

Reprise autorisee par piece jointe 90452a72-a469-4ba7-b0ac-89f036fd9c00. Inscription normale du deuxieme coach avec l adresse Outlook fournie et controlee : HTTP202, role coach attribue serveur, profil persiste, confirmation email requise. Mot de passe uniquement DPAPI hors Git. Verification finale : coach1 et coach2 confirmes; sportif1 non confirme; sportif2 absent. Deux profils coachs, aucun approuve, une liaison Telegram preservee. Connexion coach2 avant confirmation refusee401, puis connexion reussie200 apres clic utilisateur. Aucun role existant reaffecte. Ancienne tentative Gmail coach2 : aucun utilisateur partiel observe, cause historique toujours non etablie.

Serveur recette initialement arrete entre sessions : premier essai Outlook echoue en transport, aucun appel fournisseur; relance puis une seule inscription fournisseur reussie. Serveur lance session87796 sur 127.0.0.1:3005 avec services de recette reels. Deuxieme sportif tente une seule fois : refus400 signup_provider_error, aucun compte cree; aucune relance. Cause non etablie, ne pas l attribuer automatiquement a une limite email. Utilisateur confirme le clic Outlook; email confirme verifie cote Supabase, connexion200 et role serveur coach malgre role client sportif. Confirmation du premier sportif encore attendue.

Diagnostic inscription local : signup-provider-error.ts + integration auth/sign-up. Messages et codes exposes limites a une liste explicite, aucun payload/message brut fournisseur. Compatibilite code et error_code selon source officielle auth-js; refus ne declenche ni nouvelle tentative ni ecriture de role/profil. Sept tests mocks PASS, types PASS; build final PASS (compilation et controle de types inclus). Huit controles API reels entre coach1/coach2 PASS : documents et modifications de l autre refuses403, acces propre valide par erreur de parametre400, liaison Telegram propre true pour coach1 et false pour coach2. Source : https://github.com/supabase/auth-js/blob/master/src/lib/fetch.ts . Preuves dans docs/assets/connect-test-2026-11-04/outlook-recipe-status.json et signup-provider-results.json.

Stripe : dernier ecran observe avant cette reprise connect/set-up/profile, aucun choix valide. Integration utilise destination charges (plateforme encaisse puis transfert avec commission), pas encaissement direct par coach. Aucun nouvel acces navigateur confirme cette reprise (appel sans retour termine); ne pas annoncer Connect active ou choisir/valider une responsabilite contractuelle sans verification. Aucun Checkout, transfert, remboursement ou notification metier execute. Aucune migration/deploiement. Prochaines etapes : confirmer email sportif, diagnostiquer prochain refus sans multiplier les envois, terminer Connect test et prevoir une approbation de demonstration explicite avant reservation; ne pas inventer qualification ni lever les gardes.

### Confirmation sportif non recue : renvoi refuse

Mise a jour apres retour utilisateur : confirmation du premier sportif non recue. Un seul renvoi normal via /auth/v1/resend a ete tente; refus429 avec code fournisseur over_email_send_rate_limit. Aucun nouvel envoi apres ce refus, aucune confirmation administrateur et aucune protection desactivee. Cette preuve concerne le renvoi actuel; elle ne demontre pas retroactivement la cause du refus historique ni la livraison du premier message. Compte sportif conserve en attente. Prochaine action : permettre de nouveau l envoi legitime selon la configuration de messagerie, puis un seul renvoi controle; aucun delai de reset affirme sans preuve.

### Nouveau renvoi demande par utilisateur

Sur nouvelle demande explicite utilisateur, et apres verification du compte sportif encore non confirme : un seul renvoi /auth/v1/resend effectue, accepte HTTP200. Reception en boite et confirmation non verifiees. Ce resultat remplace le blocage429 pour cette nouvelle tentative uniquement; aucun reset de quota deduit. Attendre le clic du lien recu sur l alias sportif1 Gmail, sans relancer automatiquement.

### Sportif1 confirme et connexion verifiee

Confirmation sportif1 annoncee par utilisateur puis verifiee dans Supabase : compte unique confirme, role sportif. Connexion locale reelle HTTP200, role sportif conserve malgre demande client coach. Cookie stocke DPAPI hors Git. Le signalement precedent de mail vide ne justifie plus de renvoi; cause visuelle du message non diagnostiquee. Aucun modele email modifie. Deux coachs et un sportif confirmes; sportif2 absent. Reservations toujours soumises a approbation coach et Connect test restant a configurer.

### Verification des prerequis de reservation et Connect

Consigne 52ddf956-6be7-4700-9554-40bd1defd0d3 reprise. Dashboard Connect test accessible mais API creation compte test refuse400 invalid_request_error (plateforme pas encore inscrite a Connect); route applicative503. Page Configurer Connect affiche les commandes observees desactivees, y compris Testez votre integration. Aucun clic force ni validation contractuelle/personnelle; intervention utilisateur demandee pour terminer le parcours proprietaire. Affichage du tableau de bord ne prouve pas activation API. Aucun compte connecte, Checkout, transfert ou remboursement cree.

Approbation administrative existante = verified boolean + verification_status approved avec libelle Coach verifie. Incompatible avec une approbation de recette honnete du profil fictif. Aucun changement de verification ou role admin. Proposition locale concrete preparee dans docs/RECETTE_APPROBATION_COACH_2026-11-04.md : autorisation administrative distincte, serveur, premier coach uniquement, bornes loopback/projet recette/Stripe test, verified conserve false et mentions demo explicites. Non integree/non active; expliquer et revoir avant modification de la regle comme demande par utilisateur.

Deuxieme sportif : absence verifiee puis une seule nouvelle inscription autorisee tentee, refus429 over_email_send_rate_limit; aucun renvoi ni autre essai. Les deux coachs et sportif1 restent confirmes selon derniere preuve; liaison Telegram coach1 preservee, non modifiee. Aucun modele email, migration, donnees production ou deploiement change. Aucun parcours de reservation/notification metier declare verifie. Preuve : docs/assets/connect-test-2026-11-04/business-prerequisites-status.json. Prochaine reprise : terminer activation Connect via compte proprietaire, revoir separation approbation recette, puis essais externes sans retirer les gardes.

### Approbation de recette et essais externes du 5 novembre

Consigne 8eaffb04-f28b-4a5e-bfd6-40177a4bd996 executee. Autorisation administrative locale chiffree du premier coach fictif, une heure maximum, limites projet pqxqqbwesfrefzjoawmx / http://127.0.0.1:3005 / services reels recette / Stripe test, refus contexte heberge, autres coachs et flags de simulation. verified=false et verification_status inchanges; aucun role Auth modifie. Script set-recipe-coach-approval.ps1 trace acteur/date en local hors Git, peut revoquer et arrete uniquement le listener Next reconnu sur3005; redemarrage requis. Revocation reelle testee : profil public404 apres redemarrage sans autorisation; reapprobation puis relance executees pour apercu. Autorisation expire : verifier/renouveler par operation explicite avant reprise, pas de prolongation automatique. Serveur recette au lancement session18745.

Gardes calendrier, fiche, catalogue, planning et reservation utilisent decision serveur; affichages carte/fiche/calendrier/recapitulatif/compte explicitent Profil fictif de demonstration, sans Coach verifie. Accueil mentor-preview conserve son filtre professionnel verified=true : profils fictifs non introduits dans ce carrousel. Pas de repli simulation. Tests :16 unitaires/fournisseurs mocks,13 controles API metier reels,2 projets navigateur ordinateur/mobile avec5 vues chacun (3 captures publiques chacun); build PASS, types et frontiere secrets PASS dans controle final. Deux requetes forgeant autorisation refusees; premiere fixture date trop precise avait ete refusee400 avant garde, corrigee puis refus d autorisation404 obtenu et archive.

Donnees reelles RECETTE : trois reservations creees, une acceptee, une refusee, une annulee. Conflit de creneau409, action mauvais coach403, rejeu acceptation409. Tarif serveur40EUR, instantane financier present, pas de PaymentIntent. Telegram a accepte3 notifications de demande; utilisateur confirme leur reception telephone. Une seule liaison coach1 preservee, sportif non associe. Pas de notifications client pretendues. Donnees test et IDs conserves en prive, pas de suppression historique.

Stripe : dashboard Connect encore4etapes. GET Connect local200 linked=false ready=false; tentative Checkout de reservation acceptee409 avant toute session (coach doit terminer association Stripe test). Aucune nouvelle creation Connect refus-ee repetee. Sur instruction utilisateur fais le, navigation par commandes clavier ordinaires; option plateforme encaisse puis reverse selectionnee selon integration existante. Stripe affiche une fenetre Verifier et confirmer les responsabilites (remboursements et contestations a la charge de la plateforme). NON acceptee par agent, utilisateur sollicite pour lire/confirmer personnellement selon exclusion contractuelle. Ecran laisse ouvert. Ancien constat tous boutons desactives etait temporaire : profil plateforme maintenant accessible; ne pas le traiter comme blocage permanent.

Prochaine etape : attendre decision personnelle Stripe, continuer configuration technique si autorisee, onboarding coach test puis Checkout/webhook/transfert/remboursement reellement verifies. Aucun achat, live, migration ou deploiement. Preuves : docs/assets/recipe-approval-2026-11-05/ ; rapport canonique docs/CONNECT_PARCOURS_TEST_2026-11-04.md. Apercu http://127.0.0.1:3005/coachs?sport=fitness&city=Paris tant que serveur et autorisation sont actifs.

### Configuration technique Stripe preparee

Mise a jour Stripe du 5 novembre : utilisateur a confirme personnellement les responsabilites; passage au choix industrie observe. Configuration technique effectuee : plateforme encaisse puis reverse, services a la demande, onboarding heberge Stripe, Express Dashboard. Ecran Review your setup affiche acceptation du Connect Platform Agreement sur Continue. Aucune acceptation de cet accord par agent; utilisateur sollicite pour lire et cliquer personnellement. Aucun nouveau compte Connect ou Checkout cree a ce stade.
