# Sandbox Stripe et isolation - 5 novembre 2026

## Etat reel et perimetre
Sandbox cree via interface normale Stripe, compte associe acct_1UYN06LfnWg4ERQJ, nom GetYourMentor - Recette Accounts v2 (tiret long dans interface). Gestion initiale montrait uniquement Mode test et 0/5 sandboxes; aucun existant adapte. Copie production desactivee avant creation. Tableau de bord recharge et titre confirme. Aucune cle sandbox collectee, aucun changement du coffre actif ou du serveur existant; aucune acceptation de contrat, activation live, depense ou deploiement. Configuration Connect propre au nouveau sandbox encore a verifier : sa creation ne prouve pas disponibilite des comptes connectes ni onboarding termine.

## Proposition concrete a autoriser
Fichiers supabase/proposals/20261105_stripe_environment_{preflight,isolation,isolation_rollback}.sql (les noms exacts sont preflight.sql, isolation.sql et isolation_rollback.sql).
Application distante non executee. Cible exclusive : getyourmentor-preprod, pqxqqbwesfrefzjoawmx.

- Ajout gym_stripe_environments, deux registres test : legacy-test pour acct_1UGhVXPwRppadkVH et recipe-accounts-v2 pour le sandbox. Aucune cle en base.
- Ajout gym_stripe_coach_bindings, cle composee environnement/coach, unicite environnement/compte. Copie des associations legacy sans les supprimer ni modifier la table historique.
- Ajout stripe_environment_id aux reservations; attribution legacy uniquement aux lignes ayant deja des references Stripe. Reservations sans references laissees sans environnement jusqu a revendication serveur atomique.
- Cle etrangere composite verifie environnement/coach/compte beneficiaire. Environnement fige des qu attribue. Refus de references Stripe sans environnement.
- RLS et droits : tables nouvelles interdites anon/authenticated; service_role lecture registre et lecture/insertion associations seulement, aucun update/delete des associations. Aucun changement des droits des tables existantes, d Auth, de RAG ou du snapshot financier.
- Transaction et lock_timeout5s; erreurs annulent le lot, aucune relance automatique. Migration non reentrante : existence de tables nouvelles impose une revue.

## Sauvegarde et execution apres autorisation
Une capture de donnees des deux tables existantes a ete chiffree DPAPI hors Git dans LOCALAPPDATA/GetYourMentor-Test/sandbox-before-*.clixml. Capture de preparation, non transactionnelle; a rafraichir avant execution apres suspension des ecrivains. Definitions historiques disponibles en prive mais pas presentees comme sauvegarde DDL actuelle.

Avant application : confirmer projet, arreter uniquement les services de recette reconnus et suspendre les ecrivains; executer preflight read-only, conserver definitions/contraintes/politiques/ACL et corps des fonctions de triggers dans sauvegarde privee; comparer aux hypotheses du SQL, notamment absence de references orphelines et absence de schema concurrent. Rafraichir sauvegarde donnees. Ne pas appliquer si ecart non revu. Aucun secret dans captures/versionnement.

Apres application autorisee : assertions de conservation, privileges et RLS, contenu financier compare, table legacy inchangee, nombre de liaisons copiees exact, backfill restreint aux references historiques. Le code runtime actuel n est PAS compatible avec la nouvelle isolation et ne doit pas recevoir les cles sandbox avant lot applicatif verifie.

Retour arriere : fichier isolation_rollback.sql, uniquement avant toute association/reservation sandbox; garde SQL refuse sinon. Dans ce dernier cas conserver les historiques et corriger en avant. Arreter ecrivains et sauvegarder avant toute operation. Aucune restauration destructive ou suppression d operation financiere.

## Repetition locale reellement executee
PostgreSQL12 local ephemere lie a127.0.0.1:55439, schemas et roles synthetiques minimaux. Fixture et assertions dans supabase/tests/stripe_environment_{fixture,assertions}.sql, a ne jamais executer sur Supabase.
Migration PASS; conservation ancien compte/snapshot PASS; ancien environnement renseigne, reservation neuve sans environnement PASS; ajout compte sandbox pour meme coach PASS; melange beneficiaire/environnement refuse par FK; reassociation environnement refusee; references sans environnement refusees; doublon et environnement inconnu refuses; RLS/droits controles. Rollback refuse avec liaison sandbox puis reussi apres retrait du seul fixture local. Dump final identique pour definitions et lignes apres normalisation de l ordre COPY; comparaison brute initiale differente uniquement par ordre physique des lignes. Ce n est pas une comparaison byte-identique. Serveur PostgreSQL temporaire arrete. Limite : PostgreSQL12 local, pas clone complet Supabase ni validation sur son moteur distant.

## Lot applicatif suivant, avant tout paiement
- Configuration DPAPI distincte sandbox, sans ecraser services.clixml; verifier cle test par GET /v1/account et comparer au registre attendu avant tout appel financier. Aucun fallback entre environnements.
- Mapper et persister stripe_environment_id par revendication atomique avant creation Checkout; refuser reservation deja revendiquee ailleurs. Conserver instantane financier et ne pas reutiliser les anciens IDs.
- Resoudre associations par environnement/coach, idempotence namespace incluant environnement pour compte/Checkout/remboursement. Ne jamais creer plusieurs comptes suite a un echec incertain.
- Webhooks : secret propre au sandbox, verification signature/livemode et appartenance de la reservation, verification montants/destination/commission; refus environnement incompatible avant mutation ou notification. Idempotence des evenements et Telegram preservee.
- Remboursements : retrouver environnement par reservation, verifier correspondance du compte plateforme; refuser cle active incompatible. Aucun remboursement par identifiant fourni seul par client.
- Lancements separes et controles avant demarrage; forwarder distinct et secret concordant. Ancien environnement preserve, pas deux traitements concurrents d une meme reservation.
- Nouvelle reservation sandbox seulement apres onboarding et approbation recette explicite. Reception Telegram historique ne valide pas nouvelle notification.

Aucun paiement, webhook metier, transfert, remboursement ou nouveau message Telegram dans ce lot. Aucune recette mobile du paiement declaree. GYM-B1.5 reste bloque sur autorisation de migration et raccordement sandbox.

Sources officielles : https://docs.stripe.com/sandboxes/dashboard/manage et https://docs.stripe.com/sandboxes .
