# H1.2.3 — préparation PostgreSQL, 5 novembre 2026

## État livré

Préparation et répétition **locales**, pas de recette distante. Supabase reste le backend du site : SQLite reste le laboratoire historique. Aucun accès Stripe/Supabase, coffre réel, paiement, remboursement, notification ou déploiement dans ce lot. Aucun branchement au parcours actif ni reprise du RAG. Exécution séquentielle, aucun agent supplémentaire ; temps réel non mesuré.

31 contrôles PostgreSQL 12.15 passent dans un cluster temporaire distinct, `127.0.0.1:55441`. Les 62 tests moteur/adaptateurs historiques passent séparément. Preuves détaillées : [checks.json](assets/reconciliation-pg-2026-11-05/checks.json). Le PostgreSQL distant archivé était 17.6 : cette version **n'est pas validée** par cette répétition sur PostgreSQL 12, version ancienne non recommandée pour une nouvelle installation. Aucun service PostgreSQL existant n'a été reconfiguré.

## Écarts et adaptations

Sources : capture privée `business-schema-after-20261104.json`, datée du 4 novembre ; proposition d'isolation par environnement et preuves `docs/assets/stripe-sandbox-2026-11-05/remote-migration.json` du 5 novembre. La capture du 4 précède l'isolation du 5. Aucun de ces fichiers ne constitue une relecture actuelle de Supabase. Le fichier privé `sandbox-before.sql` est un ancien laboratoire synthétique, pas une capture du schéma distant.

| Garantie | État précédent | Adaptation proposée | Preuve locale / reste à faire |
|---|---|---|---|
| Atomicité | CAS durable SQLite ; aucun équivalent applicatif Supabase démontré | Fonction PostgreSQL transactionnelle, verrou de ligne, comparaison JSONB complète | Deux connexions/processus, un seul gagnant |
| Changement sans nouveau statut | Empreinte SQLite incluant révision | Révision incrémentée par trigger pour tous les UPDATE ; comparaison ligne complète | Titulaire et prix modifiés : ancien instantané refusé |
| Environnement/bénéficiaire | Registres existants, lecture séparée du CAS | Enveloppe inclut registre et liaison ; verrous partagés pendant CAS | Modification plateforme ou liaison : refus |
| Intention d'annulation | Stockage SQLite distinct, non raccordé | Table privée immuable, même verrou réservation, rôle décideur séparé | Intention durable invalide l'ancien instantané |
| Autorisation | Permission serveur SQLite | Principal SQL `session_user`, appartenance à un rôle et permission bornée en base, expiration/modes/cibles | Usurpation par paramètre impossible ; révocation, rôle, cible et environnement refusés |
| Reprise | SQLite redémarrage testé auparavant | PostgreSQL commit durable, reprise idempotente | ROLLBACK avant commit, réponse ignorée après commit, nouvelle lecture ; pas de crash serveur injecté |
| RLS | Pas d'équivalence SQLite | Schéma privé hors API, fonctions à droits définis et search_path fixe ; executor NOLOGIN/NOBYPASSRLS | Accès direct refusés ; validation réelle Supabase/PostgREST à faire |

Fixture PostgreSQL : colonnes métier des archives, sur données entièrement synthétiques. Ce n'est pas une reproduction complète des contraintes, triggers Auth, grants ou politiques existants du serveur distant. Les politiques locales simplifiées ne prouvent pas l'absence d'interaction avec les politiques distantes : audit obligatoire avant application.

## SQL proposé et frontières de confiance

Dans `supabase/proposals/reconciliation-20261105/` : `preflight.sql` (lecture seule), `migration.sql`, `postflight.sql` et `rollback.sql`. **Propositions uniquement** hors laboratoire.

La migration ajoute une colonne de révision aux réservations, un trigger, deux tables privées, trois rôles NOLOGIN, des politiques et fonctions privées. Aucun statut historique ni référence financière n'est réécrit à la migration. Les UPDATE ultérieurs incrémentent la révision. Une révision seule ne remplace pas la comparaison complète, qui inclut intention, plateforme et liaison.

Le compte executor possède seulement les droits nécessaires aux fonctions. PostgreSQL exige un privilège UPDATE pour les verrous de lignes sur les registres : droits limités à une colonne et politiques `WITH CHECK(false)` ; les essais démontrent que ces droits ne permettent pas leur mutation sous les politiques du laboratoire. Les politiques existantes permissives doivent être examinées : elles peuvent modifier ce résultat sur Supabase.

Les opérateurs n'ont aucun UPDATE direct. `cas` ne permet que les champs financiers listés et les transitions prévues, conserve les références déjà enregistrées, refuse un instantané périmé. Les valeurs nulles sont refusées sauf commission absente, nécessaire aux paiements à commission nulle. Les conditions financières sont également vérifiées par le moteur partagé avant le CAS.

**Ce SQL ne prouve pas Stripe** : un opérateur autorisé au mode reprise est une autorité de maintenance sensible. Il pourrait appeler directement la fonction avec des références plausibles sans passer par le lecteur HTTP. Il faut donc un principal technique privé, non distribué aux utilisateurs, et une permission de reprise distincte du diagnostic. Aucun octroi de membership à `anon`, `authenticated` ou `service_role`. Les superutilisateurs et administrateurs restent des autorités de confiance. L'identité SQL n'est pas un JWT Supabase : un futur adaptateur doit choisir un vrai principal SQL distinct, pas passer un nom dans le corps d'une RPC ni utiliser `SET ROLE` pour simuler `session_user`.

Les fonctions privées ne doivent pas être exposées par PostgREST. Les rôles créés par la proposition restent NOLOGIN : aucun mot de passe ni utilisateur distant n'a été créé. Le laboratoire provisionne uniquement des logins locaux fictifs. Trust local n'est pas une configuration de production.

## Protocole d'annulation à raccorder explicitement plus tard

1. Le service métier authentifie le titulaire et ses droits ; lit l'état, le rendez-vous, le tarif, la commission et l'environnement faisant autorité.
2. Décision selon les règles existantes : plus de 48 h = 100 %, de 24 h à 48 h inclus = 50 %, sinon 0 %. L'intention contient date de décision, rendez-vous, environnement, bénéficiaire, PI, montant et commission arrondie selon le contrat partagé. La fonction revérifie ces valeurs. Une intention positive n'est pas inventée pour un cas à 0 %.
3. Persister l'intention par comparaison atomique, avant toute opération fournisseur. Identifiant stable : `gym-refund-<reservation>-<cents>` pour legacy, sinon `gym-refund-<environnement>-<reservation>-<cents>`. Une intention existante différente est refusée. L'intention n'annule pas à elle seule la réservation.
4. Seul le parcours métier autorisé peut rechercher/créer l'opération fournisseur existante avec cette clé, puis enregistrer le résultat et l'état d'annulation. **Ce parcours n'est pas raccordé dans ce lot.** Ni le moteur de réconciliation ni son lecteur n'ont de port de création de remboursement/paiement/transfert.
5. Après interruption avant l'intention : recalcul autorisé par le métier, sans opération fournisseur préalable. Après intention mais avant appel : reprise de la même intention, pas nouvelle décision. Après appel mais avant résultat : recherche avec les références/idempotence existantes, sans duplication. Après commit sans réponse : relire, ne pas rejouer aveuglément. Sans intention fiable, contradiction ou preuve incomplète : traitement manuel.

La fonction d'intention proposée est un stockage préparatoire, pas l'implémentation complète du service métier ci-dessus. Le SQL vérifie des invariants et des montants ; la décision de titulaire reste au service métier. La politique d'annulation active est inchangée.

## Adaptateur local

`postgres-local.mjs` : processus psql sans shell, SQL via stdin, environnement filtré sans variables PG héritées, loopback littéral uniquement, base `postgres`, sortie bornée 2 Mio, connexion 2 s, statement 4 s, lock 2 s, processus 6 s. Origine HTTP locale injectée par configuration de confiance ; lecteur existant GET uniquement, sans redirection, timeout 2 s, pagination bornée. Diagnostic par défaut ; maximum 100 identifiants et 20 éléments traités par lot. Rapports expurgés, aucun email, clé ou réponse fournisseur brute.

Le mapper réel `reservationFromRow` est réutilisé. La réponse booléenne SQL est convertie en JSON : un premier essai d'intégration a révélé l'écart entre `t/f` de psql et `true/false`, corrigé puis rejoué avec succès. Un premier verrou sur registre a également été refusé faute de privilège ; le droit minimal et la politique de non-mutation ont été ajoutés et contrôlés. Ces échecs de développement ne sont pas présentés comme réussites initiales.

Reproduction sur **nouveau cluster jetable** uniquement, Node 24.14 et PostgreSQL 12 installé : initialiser en UTF8 sur 127.0.0.1:55441 avec utilisateur `gym_lab_admin`, puis définir `GYM_LOCAL_PG_PORT=55441`, exécuter `node tools/payment-reconciliation/postgres-rehearsal.mjs`, puis `node tools/payment-reconciliation/postgres-integration.mjs`. Chemin psql Windows explicite dans les scripts, à adapter sur un autre poste. Le premier script exige un schéma vierge ; aucun reset destructif automatique n'est livré. Le second sauvegarde les données synthétiques dans `delivery-private/`, répète rollback et réapplication. Arrêter le cluster avec pg_ctl après les essais. Les tests standard restent `node --test tools/payment-reconciliation/*.test.mjs`.

## Dossier de décision pour la recette distante — NON AUTORISÉE

**Cible documentée, à vérifier au moment autorisé :** projet Supabase getyourmentor-preprod, référence `pqxqqbwesfrefzjoawmx`, PostgreSQL archivé 17.6. Ni production ni autre sandbox. Aucun ancien accord de migration/paiement n'est réutilisé.

**Étape suivante proposée : autoriser uniquement un préflight distant en lecture seule.** Vérifier identité/version, colonnes/contraintes/triggers/RLS/grants des trois tables, collisions des rôles et du schéma privé, schémas exposés et faisabilité des propriétaires de fonctions. Aucun besoin d'API Stripe, données Auth, paiement, message ni d'écriture. Arrêter sur cible différente, permission insuffisante, divergence de schéma ou risque d'exposition. Livrer le diff expurgé avant toute autre autorisation.

**Étapes futures distinctes, toujours à autoriser :**

- Répéter sur PostgreSQL 17.6 ou compatible avant qualification distante ; auditer les combinaisons RLS et droits de la cible, vérifier qu'aucun rôle applicatif ne peut devenir executor/opérateur/décideur.
- Geler les écrivains métier ; sauvegarder schéma, politiques/grants/roles/memberships pertinents et données des tables affectées dans une archive privée chiffrée, empreinte et restauration vérifiée. Capturer le baseline actuel, pas seulement les archives du 4/5 novembre.
- Appliquer le SQL exact dont l'empreinte est relue et explicitement autorisée ; arrêt sur lock timeout, divergence ou erreur. Postflight et comparaison des données historiques avant réouverture des écrivains.
- Provisionner séparément un principal technique borné et temporaire. Aucun identifiant distant dans Git, logs, captures ou argument de processus. Résolution des secrets côté serveur depuis le coffre documenté, valeurs masquées, environnement sélectionné en configuration de confiance. Il n'existe pas encore d'adaptateur distant ni de CLI distant.
- Adaptateur Stripe séparé : origine HTTPS officielle fixe, pas de redirection, plateforme attendue/compte sandbox confirmé, `livemode=false`, environnement et liaison recoupés ; diagnostic sans mutation d'abord, quelques cibles explicites, budget/expiration, journaux expurgés et arrêt sur incohérence. Une reprise locale de références exigera ensuite une autorisation distincte. Aucun paiement/remboursement/transfert ni Telegram n'est nécessaire pour la réconciliation.

**Réussite :** preuves sur la bonne recette, aucun changement en diagnostic, références/plateforme/bénéficiaire concordants, droits négatifs réellement testés, absence de doublon, historique conservé. **Arrêt :** ambiguïté, source absente, environnement live, permission expirée, décalage de schéma, erreur de privilège ou d'idempotence ; aucun succès forcé.

**Retour arrière :** suspendre les opérateurs/écrivains, exporter tables privées et métadonnées ; `rollback.sql` exige la confirmation de sauvegarde dans la session et enlève explicitement les objets, sans CASCADE. Les trois rôles restent NOLOGIN afin de ne pas supprimer des memberships provisionnés séparément ; leur suppression est une étape administrative distincte après inventaire. Le laboratoire l'a répétée pour réappliquer la proposition. Aucun retour arrière automatique des statuts/références métier déjà écrits : analyse humaine et backup requis. La perte des intentions et des révisions empêche une reprise sûre ; conserver la sauvegarde et ne pas réactiver un ancien opérateur.

## Tickets

H1.2.3.1 préparation SQL et H1.2.3.2 répétition locale terminés dans ce périmètre limité. H1.2.3.3 autorisation/prérequis distants et H1.2.3.4 recette distante restent à préparer. H1.2.3, H1.2 et H1 restent en cours. H1.2.1/H1.2.2 et autres tickets validés sont conservés. Aucun temps passé inventé ; estimations proposées seulement.

Références techniques officielles consultées : [verrous de lignes PostgreSQL 12](https://www.postgresql.org/docs/12/sql-select.html), [RLS et politiques](https://www.postgresql.org/docs/12/ddl-rowsecurity.html). Les preuves locales, et non ces références, établissent les résultats ci-dessus.
