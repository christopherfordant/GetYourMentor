## Reprise active — GYM-D1.5 parcours sportif local — 14 novembre 2026

Point d’avancement recruteur — 14 novembre : l’accueil local propose désormais le parcours sportif `/demo` uniquement lorsque la configuration exacte de démonstration est complète. Le bloc indique le coach fictif, l’acceptation de démonstration et le paiement sans carte ni débit réel. Build, contrôles de frontière/configuration et 36 tests Playwright ciblés desktop/mobile réussis. D1.5 reste `progress` : le runtime Supabase/RLS et la disponibilité publique ne sont pas validés. Rapport : `docs/DEMO_RECRUITER_ENTRY_2026-11-14.md`. Aucun réglage Netlify, migration distante ni déploiement effectué.

Mise a jour de reprise : sur la branche `demo/recruiter-supabase-adapter-20261112`, apres le parent `7fac27396f0756ffafb4a98f3a7a7a450a9282d5`, `/demo` affiche maintenant un etat d’indisponibilite lorsque la configuration Supabase de demo manque. Les routes catalogue, reservations et paiement repondent 503 sans appel reseau dans ce cas. Controles : typecheck, build, frontiere secret client, configuration Netlify, secrets suivis, 35 tests atelier et 34/34 tests Playwright desktop/mobile reussis. Recontrole public via curl : `/` 200, `/api/health` 200 (`mode=demo`, `ready=true`, `supabase=false`), `/demo` 404. Correctif local non publie. D1.5 reste `progress`, bloque sur runtime Supabase et preuve du parcours public. Aucun reglage Netlify ni migration distante.

Précontrôle navigateur en lecture seule après le push : accès au bon projet Netlify et au Supabase dédié confirmé. Supabase `getyourmentor-demo-recruiter` (`rqxoovriacgoriimpbwi`) est sain, mais le dashboard ne recense aucune migration ; seules les quatre tables historiques `gym_demo_*` sont présentes, avec RLS actif, sans les nouvelles tables fixtures/slots ni RPC attendues par le parcours. Aucun contenu de ligne n’a été lu. Le site Netlify cible ne liste aucune variable `GYM_DEMO_*` ni `SITE_ID`; les valeurs n’ont pas été ouvertes. Pas de migration ni de modification de configuration. D1.5 reste `progress`. Prochaine étape locale : réconcilier le schéma déjà présent avec 004/009/012, puis obtenir un lot explicitement autorisant l’application de ces migrations et la configuration Netlify avant la recette runtime.

Worktree isole `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`. Debut du lot : HEAD et distant `42e7ef8e856083a6cde0095129fef0308ffdc253`. Les autres worktrees et le checkout principal n'ont pas ete modifies.

Ajout local de la page `/demo`, du catalogue de fixtures, de la reservation idempotente, de l'acceptation de demonstration, du paiement non financier, de la consultation des propres reservations et de l'effacement individuel. Les routes reutilisent la session chiffre D1.4 ; les mutations verifient Auth anonyme + session possedee avant les RPC serveur D1.3. Aucun appel Stripe/Telegram ni aucune migration ou connexion distante.

Controles : typecheck, build Next, scan secret client, configuration Netlify et secrets suivis, validateur D1 et 35 tests atelier : reussis. Playwright : 30/30 passes desktop et mobile, avec doubles API/Supabase (aucune preuve d'integration au runtime reel). Rapport : `docs/DEMO_D15_LOCAL_FLOW_2026-11-14.md`.

GYM-D1.5 avance en `progress`, pas termine : il reste a tester les RPC et RLS sur l'environnement de demonstration autorise. Recontrole public en lecture seule apres le push : `/` 200, `/api/health` 200 (`mode=demo`, `supabase=false`), `/demo` 404. Aucune migration distante, variable Netlify ou publication n'a ete modifiee. Le processus local inspecte ne disposait pas des variables de session/Supabase attendues (noms seulement, valeurs non lues).

Prochaine action : obtenir un environnement de recette dedie deja configure avec les migrations D1.3/D1.4, puis executer la recette E2E/RLS autorisee pour D1.5/D1.8. Le runtime public indique actuellement Supabase inactif ; toute configuration de variables ou migration exige un lot explicitement autorise. Kanban : GYM-D1.5 reste en cours avec blocage runtime, D1.6 Telegram reste differe et D1.7 depend encore de D1.5.

## Historique — contrat local GYM-D1.4 livré — 14 novembre 2026

Checkout isolé C:/Users/cashe/Documents/GYM-demo-isolated-20261112, branche demo/recruiter-supabase-adapter-20261112. Au début du lot, branche et distant alignés sur 11d1b5980f27fd4d70494a8c5bdc971f55aaa7df. Le checkout principal et ses modifications locales n’ont pas été touchés.

Le cycle de session sportive anonyme est implémenté localement : création et vérification Auth, cookie chiffré HttpOnly/Secure/SameSite=Strict limité à 24 h, relecture/renouvellement, effacement SQL possédé puis suppression de l’identité anonyme, route cron protégée et fonction Netlify horaire ciblée sur le site de démo. Aucun parcours coach, paiement réel, notification ni stockage Blobs de réservation n’est raccordé à ces routes.

Contrôles : typecheck, build Next, 12 tests Playwright avec faux serveur Supabase (aucune requête réseau), scan de frontière client/serveur, contrôles Netlify/secrets, validateur du schéma et 35 tests de l’atelier : réussis. Preuve : docs/DEMO_D14_SESSION_RUNTIME_2026-11-14.md. GYM-D1.4 est clos pour le contrat et l’implémentation locale testés avec doubles. L’exécution sur le runtime Supabase et l’invocation Netlify réelle restent à vérifier aux tickets D1.8/D1.9 ; aucune configuration ou publication n’a eu lieu.

Prochaine tâche éligible : GYM-D1.5 — construire la page /demo du seul parcours sportif dans ce worktree isolé, en réutilisant /api/demo/session et les fonctions SQL D1.3. Le site public n’a pas été réactualisé ; la dernière observation archivée indique encore supabase=false et /demo 404.

## Historique — avancement local GYM-D1.4 — 14 novembre 2026

Dans le checkout isolé `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, ajout local des migrations proposées `012_demo_session_erasure.sql` et tests `013_demo_session_erasure_tests.sql`. L’effacement sportif est limité à `auth.uid()` et cascade sur les données du testeur ; les créneaux fictifs futurs sont libérés, les coachs fictifs partagés préservés. La fonction TTL côté serveur supprime les sessions sportives expirées ; rétention par défaut 24 h.

Contrôles réellement exécutés sur PostgreSQL 12.15 jetable avec shim Auth, assertions pgTAP 1.3.0 via `psql` : suites 002 34/34, 005 25/25, 011 33/33, 013 21/21, toutes sans `not ok`, transactions synthétiques annulées et zéro résidu relevé. Le cluster a été arrêté ; le service PostgreSQL Windows préexistant est toujours `Running`. Rapport : `docs/DEMO_SCHEMA_D14_ERASURE_2026-11-14.md`, journaux sous `docs/assets/demo-schema-d14-2026-11-14/`. Aucun Docker, runtime Supabase distant, réglage Netlify, notification ou déploiement.

GYM-D1.4 passe de `prepare` à `progress`, sans être terminé : aucune route applicative n’appelle l’effacement ni n’expire le cookie, l’identité Auth reste présente et la purge TTL n’est pas planifiée. La connexion Supabase du site public n’est pas démontrée ; l’état précédemment vérifié était `supabase=false` et `/demo` 404. D1.5 reste en préparation et dépend de la fin applicative de D1.4. Prochaine action précise : dans l’adaptateur, authentifier côté serveur l’identité de démo, raccorder l’effacement (y compris la suppression Auth serveur de cette identité après vérification), ajouter l’appel planifié TTL compatible avec le site cible, puis tester l’intégration avant fermeture.

## Reprise active — schéma D1.3 testé — 14 novembre 2026

Travail effectué dans le worktree isolé `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, base de travail `545b95ca5bb09cd674338703a98421d2d303b5dd`. Le distant était aligné avant ce lot. Le checkout principal `GetYourMentor` et ses changements préexistants n’ont pas été touchés.

D1.3 est terminé pour son périmètre de schéma et validation locale : migration additive 009 pour l’acteur fictif stable, création/réutilisation côté serveur, créneaux autorisés, réservation + acceptation simulée atomiques/idempotentes et confirmation de paiement simulé côté serveur ; rollback gardé en 010. PostgreSQL 12.15 jetable avec shim Auth : pgTAP 002 34/34, 005 25/25, 011 33/33 ; tests à deux processus réussis pour rejeu idempotent et compétition sur le même créneau ; rollback refusé avec données puis réussi sur le schéma vidé. Le cluster jetable est arrêté et le service PostgreSQL préexistant est resté actif. Détails, versions, résultats et limites : `docs/DEMO_SCHEMA_D13_FIXTURE_ACTOR_2026-11-14.md` et `docs/assets/demo-schema-d13-2026-11-14/`.

La validation utilise PostgreSQL standard et le shim Auth : elle ne prouve pas l’exécution sur le runtime Supabase. Aucune migration distante, variable Netlify, route applicative, notification, paiement réel ou publication n’a été faite. Le site cible reste observé à `supabase=false` et `/demo` 404 ; ces écarts relèvent des tickets suivants. D1.3 clos dans le Kanban local après les preuves ci-dessus ; D1.4 passe en préparation, car son dépendance D1.3 est satisfaite, mais l’effacement Auth côté serveur et la purge TTL restent à implémenter/tester. D1.5 reste en préparation et dépend de D1.4.

Le document `docs/KANBAN_GYM_OPERATING_MODEL_2026-11-13.md` n’existe pas dans cette branche ; le Kanban versionné `tools/agentic-workbench/backlog.json` demeure la source utilisée. Prochaine action : traiter D1.4 (effacement individuel idempotent, isolation croisée et purge des sessions expirées), sans toucher à Supabase distant ni au site Netlify.

## Reprise active — décision du parcours sportif unique — 14 novembre 2026

La consigne utilisateur du 14 novembre remplace le parcours recruteur à deux comptes décrit dans la décision du 12 novembre : le testeur suit uniquement le parcours sportif. Pour un coach fictif de démonstration sélectionné, le serveur doit créer au besoin ou réutiliser un acteur fictif stable puis accepter la demande de façon déterministe, idempotente et atomique avec la réservation du créneau. Aucun compte coach, action manuelle, vraie décision de coach/IA, paiement réel ni notification Telegram n’est nécessaire. Les détails et limites sont dans `docs/DECISION_PARCOURS_DEMO_RECRUTEUR_2026-11-14.md` ; l’ancienne décision est conservée comme historique.

État de reprise du 14 novembre : worktree isolé `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, HEAD et distant `9a3de6ca6f210b59c47b230aa08e345d49d42eab` avant cette reprise. Le checkout principal `C:/Users/cashe/Documents/GetYourMentor` sur `design/refonte-progressive-lot1` conserve ses nombreux changements préexistants ; il n’a pas été modifié ni repris.

Contrôle HTTP public du 14 novembre : accueil `200`; `/api/health` `200`, `mode=demo`, `ready=true`, `supabase=false`; `/demo` `404`. Le projet Supabase dédié et la proposition `gym_demo_*` sont documentés, mais le runtime Supabase n’est pas validé. Les preuves PostgreSQL 12.15 avec shim Auth du 13 novembre (34 + 25 assertions, concurrence et rollback) ne couvrent pas encore l’acteur fictif créé/réutilisé ni l’adaptateur web. Aucune migration distante, variable Netlify, notification, paiement ou publication n’a été effectuée.

Kanban ajusté pour refléter le choix produit, sans changement de statut : D1.2/D1.3 `progress`, D1.4 `blocked`, D1.5/D1.6/D1.7 `prepare`, D1.8/D1.9 `backlog`. Telegram ne bloque plus l’alignement des textes ni la recette du parcours de base. D1.3 doit recevoir des tests de profil acteur fictif stable/idempotent et d’acceptation limitée aux fixtures avant l’intégration applicative. Ne pas commencer l’adaptateur tant que les dépendances D1.2–D1.4 ne sont pas satisfaites.

Contrôle Netlify en lecture seule : projet cible confirmé dans le compte `getyourmentor-demo-20261014`, Site ID `86e0379e-4d1a-4cf0-936c-1439397354f4`. Le déploiement publié `6af5b42d9df69449340b3d31` du 12 novembre est marqué CLI, source SHA `892ecba8a081de29336e482824d7a177726c48a7`, étapes de build ignorées. Ce SHA est ancêtre du HEAD et le sous-arbre `gym-next` est identique ; Netlify ne fournit pas de branche source Git pour ce déploiement. `netlify.toml` déclare base `gym-next`, commande `npm run build`, publication `.next`, mais l’utilisation effective de cette commande pour l’artefact CLI n’est pas prouvée. `/api/health` répond encore `supabase=false` et `/demo` 404 ; aucun changement de configuration ou déploiement.

Le Kanban a été séquencé pour éviter d’exiger les secrets avant l’existence de l’adaptateur : la configuration des variables Supabase est différée à D1.9, après la recette complète. D1.2 est clos sur son périmètre de provisionnement/identification (projet Supabase dédié, site exact, artefact et scan client/serveur vérifiés) ; D1.3 reste `progress`, D1.4 `blocked`, D1.5/D1.6/D1.7 `prepare`, D1.8/D1.9 `backlog`. Ce statut D1.2 ne signifie pas que le runtime est raccordé : `supabase=false` reste attendu jusqu’à l’adaptateur validé. Le parcours sportif demeure non implémenté. Détails Netlify : `docs/DEMO_D1_2_PREFLIGHT_NETLIFY_2026-11-14.md`.

Prochaine action : compléter D1.3 par l’acteur fictif stable et l’acceptation atomique/idempotente limitée aux fixtures ; exécuter les tests locaux jetables et vérifier la compatibilité Supabase sans base distante. Puis traiter D1.4 (effacement et purge) avant l’adaptateur D1.5. Conserver les variables absentes jusqu’à D1.9. Aucun secret n’est requis pour cette suite locale.

## Reprise active — validation locale D1.3 — 13 novembre 2026

Le Kanban GYM-D1 reste la référence : D1.2 et D1.3 sont `progress`; D1.4 est `blocked`; aucun parcours n'est raccordé ou publié par ce lot. Docker est exclu des prochaines étapes opérationnelles, sans effacer les références historiques aux contrôles précédents.

Le contrôle a utilisé un cluster PostgreSQL 12.15 temporaire et isolé, sans toucher au service Windows préexistant. pgTAP 1.3.0 a été chargé comme SQL uniquement dans cette base jetable ; aucun outil n'a été installé globalement et Docker est exclu. Résultats : 34/34 assertions de base, 25/25 assertions additives, deux scénarios concurrents à deux processus, refus du rollback avec lignes et rollback réussi sur schéma vide. Le cluster a été arrêté ; son dossier temporaire n'a pas pu être supprimé, la commande de suppression récursive ayant été refusée par la politique d'exécution. Détails et limites Auth shim/Supabase : `docs/DEMO_SCHEMA_PGTAP_CONCURRENCY_2026-11-13.md`.

Le site ciblé reste `https://getyourmentor-demo-20261014.netlify.app/`; les vérifications publiques précédentes indiquent `/demo` en 404 et `supabase=false`. Aucune configuration Netlify, donnée distante, notification ou déploiement n'a été modifié dans ce lot. L'ancien site `gregarious-fox-fff605` et le projet `getyourmentor-preprod` restent hors périmètre.

Prochaine action : résoudre D1.2 et sa dépendance de cible Netlify ; avant l'adaptateur, faire la revue de compatibilité Supabase requise sans utiliser une base distante pour remplacer les tests locaux. D1.3 reste `progress` car D1.2 n'est pas terminé et le shim PostgreSQL n'est pas le runtime Supabase. Ne pas commencer l'adaptateur ni modifier les statuts pour libérer une place.

## Reprise active - migration progressive Blobs vers Supabase recruteur (12 novembre 2026)

Audit en lecture seule : `docs/DEMO_BLOBS_SUPABASE_MAPPING_2026-11-12.md`. Le dépôt applicatif isolé est `christopherfordant/GetYourMentor`, branche `demo/recruiter-supabase-adapter-20261112`, base `58a9f32876fe6918234f63d383e9fd2b375d656d`. Le checkout principal et ses brouillons n’ont pas été modifiés.

Contrôle public du 12 novembre : l’URL du portfolio ouvre `https://getyourmentor-demo-20261014.netlify.app/`; l’accueil répond 200, `/api/health` répond 200 (`mode=demo`, `supabase=false`) et `/demo` répond 404. La recette d’octobre documente le store Blobs `gym-isolated-demo-v1`, clé `state`, document JSON partagé avec CAS. Le build public ne fournit pas de SHA/branche; sa branche exacte n’est pas vérifiée. Aucun compte ou parcours métier n’a été écrit pendant le contrôle.

Aucun adaptateur ajouté : `gym_demo_*` ne modélise pas les créneaux coach ni l’idempotence de réservation; la RLS ne limite pas explicitement les opérations aux utilisateurs Auth anonymes. L’effacement Auth et la purge de 24 h ne sont pas raccordés. Ajouter seulement les variables Supabase ferait sortir le runtime Blobs et pourrait router vers les tables métier `gym_*`. Ne pas ajouter de variable, ne pas basculer et ne pas utiliser de fallback silencieux.

Kanban GYM-D1 mis à jour sans fermer les tickets : D1.2/D1.3 restent en progression; D1.4 bloqué; D1.5–D1.7 en préparation; D1.8/D1.9 ouverts. Aucun changement runtime, aucune dépendance installée, aucune lecture/écriture Supabase, modification Netlify, notification ou déploiement.

Contrôles locaux : validateur statique du schéma PASS; tests de l’atelier 35/35 PASS; JSON Kanban, `git diff --check` et scan de secrets suivis PASS. Le build/typecheck n’a pas été lancé (documentation seulement, dépendances du worktree absentes). Le scan du bundle a été tenté mais `.next/static` est absent; aucune conclusion sur un bundle compilé n’est revendiquée.

Prochaine priorité : proposer une migration additive locale et pgTAP pour les créneaux, l’idempotence/transitions atomiques et la RLS anon-only; exécuter uniquement sur moteur local/jetable. Construire ensuite les routes/repository isolés puis l’effacement/purge. Configurer ou publier sur Netlify requiert un lot distinct après vérification du build et de sa branche.

## Reprise active - 12 novembre 2026 : marche arriere et compatibilite

Le projet Supabase dedie est cree et les 34 assertions pgTAP passent (voir `docs/SUPABASE_DEMO_PROVISION_2026-11-12.md`). Lot suivant termine : marche arriere manuelle et protegee ajoutee dans `supabase/proposals/demo-public-20261112/003_rollback_empty_demo_schema.sql` ; validation statique du schema, des tests RLS et du garde-fou de retour PASS. Cette marche arriere n'a pas ete executee.

L'audit `docs/DEMO_SCHEMA_INTEGRATION_AUDIT_2026-11-12.md` confirme que l'accueil Netlify public repond 200, `/demo` repond 404, et le site relie au portfolio est `getyourmentor-demo-20261014` ; `gregarious-fox-fff605` reste exclu. Le candidat local a un cookie `gym_session`, des repositories historiques et un garde `isHostedDemo()` qui refuse Supabase : ajouter des variables seules ne connectera donc pas la nouvelle base. Le brouillon `/demo` du checkout de travail contient encore des comptes partages ; il n'a pas ete copie ou modifie.

`GYM-D1.2` et `GYM-D1.3` restent en cours ; `GYM-D1.4` demeure bloque par l'adaptateur applicatif, l'effacement Auth et la retention 24 h non automatisee/non testee. Aucun secret Netlify, migration distante, notification ni deploiement dans ce lot. Branche `demo/public-recruiter-schema-20261112` ; push normal effectue et SHA distant verifie apres livraison.
## Reprise active — 12 novembre 2026 : base Supabase dédiée créée

Le projet Supabase `getyourmentor-demo-recruiter` (réf. `rqxoovriacgoriimpbwi`, région Paris `eu-west-3`) a été créé dans l’organisation connectée sur l’offre Free ; statut observé Healthy. Le projet de recette `getyourmentor-preprod` et l’ancien projet en pause n’ont pas été modifiés. Aucune clé n’est copiée dans ce dépôt ou dans la conversation.

La migration `supabase/proposals/demo-public-20261112/001_demo_schema.sql` a été appliquée uniquement à ce projet. pgTAP : 34/34 assertions passent sur l’accès anon, les rôles sportif/coach/serveur, l’isolation, l’effacement, les fixtures, Telegram et l’interdiction des états réels. Une requête après rollback confirme zéro ligne synthétique résiduelle. Voir le relevé détaillé `docs/SUPABASE_DEMO_PROVISION_2026-11-12.md`.

GYM-D1.2 et D1.3 sont en cours, pas terminés : le projet est provisionné et le schéma testé, mais la migration de retour, l’intégration applicative, la frontière client/serveur et l’identification/configuration du bon site Netlify restent à traiter. Aucun site, aucune variable Netlify, aucun parcours utilisateur, compte réel, paiement, message Telegram ou déploiement n’a été modifié/testé. Ne pas utiliser `getyourmentor-preprod`.

Les paragraphes plus anciens ci-dessous décrivent des contrôles antérieurs à la création et sont conservés comme historique.

## Reprise active — 12 novembre 2026 : cadrage démo publique recruteur

## Décision produit — parcours de démonstration recruteur (12 novembre 2026)

Le propriétaire valide deux parcours individuels, sans compte partagé : sportif et coach. Le parcours sportif utilise un coach et un créneau fictifs, une approbation déterministe explicitement simulée, puis une confirmation non financière affichée sur le site. Aucun numéro de carte/CVC n'est collecté ; aucune vraie IA, disponibilité, réservation ou notification au bot personnel n'est annoncée. Le parcours coach crée un profil et des créneaux fictifs, privés à son essai. Chaque session doit pouvoir effacer uniquement ses propres données ; la rétention cible de 24 h reste à valider techniquement. Confirmation sur le site par défaut ; Telegram est reporté à une option ultérieure avec bot dédié, consentement et révocation. Voir `docs/DECISION_PARCOURS_DEMO_RECRUTEUR_2026-11-12.md` et les tickets GYM-D1.4 à D1.7.

Cette décision ne livre pas les parcours. GYM-D1.2/D1.3 restent bloqués : aucun Supabase de démo isolé ni moteur Supabase/PostgreSQL local n'a été identifié. Le site lié au portfolio demeure le déploiement statique `getyourmentor-demo-20261014.netlify.app` ; `/demo` y répondait 404 au dernier contrôle. Aucun code applicatif, Netlify, donnée distante, paiement ou notification n'a été modifié. Prochaine action bloquante : le propriétaire doit désigner ou provisionner une cible Supabase strictement isolée dans une organisation ayant de la capacité disponible ; ne pas réutiliser `getyourmentor-preprod` ni restaurer le projet personnel en pause.

Le lien GetYourMentor du portfolio vise `https://getyourmentor-demo-20261014.netlify.app/` ; le portfolio est statique et n'a pas de base applicative. L'accueil public annonce une démo non commerciale, cinq profils et l'impossibilité de réserver réellement. `/demo` retourne HTTP 404. Un candidat local non vérifié expose des comptes fictifs partagés et utilise Netlify Blobs ; il ne convient pas à des données privées par recruteur ni à une base Supabase. Le contrôle santé de l'ancien déploiement ne prouve pas une lecture métier Supabase.

Dernière vérification en lecture seule du tableau Supabase : l'organisation connectée liste `getyourmentor-preprod` et un ancien projet personnel en pause. Aucun projet démo dédié n'existe dans cette organisation, qui affiche l'offre gratuite et deux projets listés. Le projet de recette n'est pas une cible démo. L'ancien projet n'a été ni restauré ni supprimé. Pour créer la démo, le propriétaire doit désigner un projet strictement isolé ou créer la ressource dans une organisation ayant une capacité disponible ; aucune clé ne doit être transmise dans la conversation.

Rapports : `docs/DEMO_PUBLIQUE_RECRUTEUR_2026-11-12.md` et `docs/DEMO_SCHEMA_PROPOSITION_2026-11-12.md`. Tickets GYM-D1 et GYM-D1.1–D1.9 suivis dans le Kanban. D1.1 reste terminé sur les preuves d'inspection ; D1.2 et D1.3 bloqués ; aucun ticket ultérieur n'est fermé. Une proposition locale non appliquée couvre sessions, coachs fictifs, réservations, états simulés, RLS, effacement par session et liaison Telegram à consentement/révocation. `validate-proposal.mjs`, les 35 tests de l'atelier et `git diff --check` passent. Les 34 assertions pgTAP n'ont pas été exécutées : Supabase CLI, `psql`, Docker et projet isolé manquent. Aucun changement de données/base distante, migration, variable Netlify, paiement, message Telegram ou déploiement. Le commit de proposition `302cf8f5047c8b55a49cfa576df6819efe7a2f37` est poussé sur `demo/public-recruiter-schema-20261112`, SHA distant vérifié ; cette branche n'est pas la branche Netlify de production.

## Reprise active - 12 novembre 2026 : audit Git, publication et Supabase

Demande : reprendre proprement, trier l'état Git/VS Code/GitHub et préserver le portfolio, GetYourMentor et Supabase. Aucun fichier applicatif, réglage Netlify, schéma ou donnée Supabase n'a été modifié dans ce contrôle.

Git : la branche de travail `design/refonte-progressive-lot1` est à `892ecba8a081de29336e482824d7a177726c48a7`, identique au SHA lu par `git ls-remote` pour sa branche distante. Elle n'a donc pas de commit local non poussé. Le checkout porte cependant 18 fichiers suivis modifiés et de nombreux fichiers non suivis ; l'inventaire Git a compté 48 735 chemins non suivis. Aucun de ces brouillons n'a été indexé, commité ou supprimé. `feat/nextjs-migration` et `main` ont des historiques divergents au regard des références locales ; `feat/nextjs-migration` est en outre la branche de publication Netlify. Aucun rebase, fusion, force-push ni push sur cette branche n'a été fait.

GitHub : l'unique PR ouverte observée est #1, `feat/v5-adaptive-intelligence-pilot` vers `feat/visual-contract-next-step`. Le dernier workflow visible date du 13 octobre 2026 ; aucun résultat CI récent n'atteste les brouillons actuels. Les lots validés et déjà documentés ARC5/H1.5.2 sont intégrés dans `892ecba` et poussés sur la branche design ; leurs rapports et contrôles du 7 novembre restent les preuves de référence. Aucun commit supplémentaire n'était justifié par cet audit seul.

Publication : Netlify `gregarious-fox-fff605` sert `feat/nextjs-migration@6e04508`; la publication automatique est activée pour cette branche. Le dernier essai affiché (`1da7030`, 6 novembre) a échoué car le contributeur Git n'était pas reconnu par le plan du compte. L'endpoint public `/api/health` annonce `mode=production` et `supabase=true`. La source de ce SHA définit ce contrôle par la seule présence de l'URL et des clés, pas par une lecture/écriture SQL : la connectivité réelle n'est donc pas prouvée par ce résultat.

Supabase : le `SUPABASE_URL` configuré dans Netlify correspond au projet `getyourmentor-preprod` (référence `pqxqqbwesfrefzjoawmx`). Le tableau Supabase confirme « Restoration complete » ; son sélecteur affiche la branche `main` avec le badge `Production`. Cette base de recette est donc référencée par un environnement Netlify de production. Aucun SQL, aucune lecture de table, migration ou écriture n'a été effectué. **Ne pas modifier cette configuration** avant d'établir si une base de production distincte existe et laquelle doit porter les données réelles.

Dépôt d'export `C:/Users/cashe/Documents/GetYourMentor-site` : `main` et `origin/main` sont identiques à `e2cf5105a44d0c060ecf5648f6349351aa885eee`. Deux captures non suivies dans `gym-next/assets/journey-ux-2026-10-20/` sont préservées. Son README le qualifie de démonstration autonome, exportée d'une version antérieure, sans secrets, CI/CD ni lien de déploiement transférés. Il n'est pas le dépôt source du site Netlify inspecté.

Hygiène : 75 worktrees Git sont enregistrés ; le contrôle groupé de leur propreté a été interrompu car trop lent, donc leur état individuel reste inconnu. Aucun worktree, dossier VS Code, branche GitHub ou artefact n'a été fermé/supprimé. Les 16 processus `Code` observés ne permettent pas de déduire le nombre de fenêtres. Étape suivante recommandée : confirmer la cible Supabase de production, puis réaliser un inventaire borné des worktrees par lots avant toute suppression ; examiner et tester séparément les 18 modifications suivies avant tout commit ciblé.

État livré : audit et preuves de lecture seulement ; aucun déploiement et aucune régression provoquée. Historique antérieur conservé.

Gate pré-push Fil Rouge exécuté dans un worktree temporaire isolé, avec ce seul document modifié : **CONFORME**. `git diff --check` : PASS. Ce rapport d'exécution temporaire n'est pas intégré aux fichiers applicatifs ni aux modifications locales préexistantes.

## Reprise active - 7 novembre 2026 : second lot natif termine sans fenetre IDE supplementaire

Nouvelle consigne utilisateur executee avec deux agents natifs concurrents depuis la conversation,worktrees neufs GYM-parallel2-reader-20261107 et GYM-parallel2-tests-20261107,base6e62d05. Aucun lancement VS Code supplementaire ni pilotage de conversations IDE. Missions terminees,sans continuation automatique;AGENTS ferme ce lot.

H1.5.2 : lecteur serveur readTelegramSnapshot sans mutation (GET seulement a distance,lecture locale serialisee sans creation),projection readTelegramSupervision expurgee et interne non exposee. Corps mutateTelegram identique. Agent QA reproduit2 echeances429 infinies;coordinateur corrige avec fallback60s pour calcul non fini. Sources d11f79d/2fabf32 integrees b56462e/df5eb3c;correctif43b06b9.

54 tests cibles,types globaux,31 gardes historiques et35 tests Kanban PASS;tableau ordinateur/mobile avec agents reels et tickets valides.18 brouillons preserves;pas de build global,service metier distant,secret,notification,migration ou deploiement. H1.5.2 et enfants termines;H1.5 reste en cours avec H1.5.3 prepare,exposition operateur/alertes/exploitation non activees. A5/Q2 inchanges.

Rapport docs/multi-agent/2026-11-07/LOT2_COMPTE_RENDU.md;preuves docs/assets/parallel2-2026-11-07/;procedure docs/TELEGRAM_SUPERVISION_REPRISE_2026-11-07.md. Prochain lot recommande cadrage H1.5.3 sans renvoi aveugle ni operation distante implicite. Historique suivant preserve.

## Reprise active - 7 novembre 2026 : premier lot parallele natif termine

Exception utilisateur bornee consignee dans AGENTS.md et docs/multi-agent/2026-11-07/. Deux agents natifs reellement lances et observes en cours simultanement : /root/arc5 (gpt-6.1-sol medium) et /root/telegram_metrics (gpt-6-luna medium). Deux fenetres VS Code visibles sur worktrees neufs GYM-parallel-arc5-20261107 et GYM-parallel-telegram-20261107;extensions desactivees au lancement pour limiter charge. Ce ne sont pas des conversations IDE pilotees,mais les vues de dossiers des agents coordonnes ici. Pas de boucle persistante,ancien lanceur reactive,nouvelle API ou sous-delegation.

ARC5 : types purs domain/model.ts et tableau fixtures/coaches.ts;facade domain.ts conserve exports,identite mutable,donnees et fonctions textuellement. Source03a80ff integree b3c67ce. H1.5.1 : projection Telegram pure/agregats expurges non raccordes;correctif overflow demande et verifie. Sources f58300e/e5d1085 integrees134fc4c/f790bbe. Les deux missions ont rendu leurs resultats,pas de poursuite automatique.

Controles combines :9 tests unitaires,types globaux avec plafond Node384Mio,31 gardes historiques et35 tests atelier/Kanban PASS. Badges Agent natif,details et statuts controles ordinateur/mobile en contexte vierge. GYM-PAR1,ARC5,H1.5.1 etPAR1.2 termines;H1.5 reste en cours avec H1.5.2 prepare. A5 reste backlog et Q2 humain bloque.18 brouillons anterieurs preserves. Aucun build global ni navigateur applicatif (RAM libre initiale<1Go),service metier distant,paiement,notification,migration ou deploiement.

Rapport docs/multi-agent/2026-11-07/COMPTE_RENDU.md;preuves docs/assets/parallel-2026-11-07/. Base neuve7d9fa56 issue de l historique nettoye,pas de reutilisation des68 anciens worktrees. Branches agent/20261107-arc5 etagent/20261107-h15-metrics conservees sans push;livraison branche design/refonte-progressive-lot1 par coordinateur. Quotas/tokens/couts non mesurables,aucune gratuite garantie. Prochain lot recommande H1.5.2 : contrat/raccordement expurge et procedure de reprise,sans renvoi aveugle ni autorisation distante implicite. Relire la cloture AGENTS avant toute nouvelle delegation. Historique ci-dessous preserve.

## Reprise active - 6 novembre 2026 : ARC4 index documentaire,CI et voisins Documents

Guide docs/architecture/DOCUMENTATION_CI_2026-11-06.md reference par index architecture existant,sans nouveau maitre. Entrees actives et historiques explicites;les2 onglets governance ouverts sont historiques et renvoient aux references actuelles. Inventaire Markdown suivis avec SHA256,qualification semantique ciblee et inconnus conserves;pas de deplacement ni changement de corpus RAG. YAML CI lus sans activation:aucun des2 workflows ne declare un push sur la branche actuelle;Netlify distant et protections GitHub non inspectes.

Confirmation utilisateur :76 dossiers apparentes voisins du principal dans Documents,dont68 worktrees declares,1 checkout Git independant GetYourMentor-site et7 supports/copies possibles sans .git a la racine.69 worktrees registre avec principal,67 voisins detaches. Metadonnees superficielles seulement,pas de lecture des sources/cles ni statut/synchro/historique des voisins;aucune suppression,deplacement,prune ou fusion. Anciens worktrees a revalider avant push apres purge. Derniers candidats ARC3 sont dans delivery-private du principal.

Rapport docs/DOCUMENTATION_ET_DOSSIERS_ARC4_2026-11-06.md et preuves docs/assets/documentation-ci-2026-11-06/.4 tests outil PASS;35 tests Kanban PASS;liens et tableau controles avant livraison. GYM-ARC4 et3 enfants termines dans ce perimetre d index/declarations/metadonnees;inconnus semantiques restent explicitement a qualifier selon lot.18 brouillons anterieurs preserves,aucun code applicatif/workflow/service distant modifie ou execute. Pas de build applicatif,deploiement ou agent lance.

Prochaine priorite recommandee ARC-05 : types purs/fixtures via facade compatible,distinct du ticket agentique A5 conserve en backlog. H1 inchange,pas d autorisation distante implicite. Historique suivant conserve.

## Reprise active - 6 novembre 2026 : ARC3.3 candidat valide et ARC3 termine

Build Next isole PASS avec controle TypeScript,92 sources archives preservees et environnement sans cles de services. Copie privee delivery-private/arc33-candidate-*,incluant les brouillons anterieurs sans les commiter/approuver globalement.6 chemins extraits404,110 ressources publiques200 avec SHA256 identiques;4 chemins internes404 et identite du build servi verifiee. Frontiere secrets client PASS.

6 scenarios applicatifs PASS : accueil/annuaire ordinateur et mobile,header/mouvement reduit/menu Sports mobile,ouverture3D complete2200ms. Parcours complementaire accueil/eventail9 entrees de demo,annuaire puis fiche liee verifie ordinateur/mobile,sans erreur JS ni requete externe observee. Captures et preuves docs/assets/prototype-candidate-2026-11-06/. Build original et18 modifications anterieures preserves,aucun code applicatif/public modifie.

GYM-ARC3.3 et parent ARC3 termines;enfants .1/.2 conserves done.35 tests Kanban et tableau ordinateur/mobile PASS. Serveur candidat3006 arrete apres recette,le dossier prive reste disponible;apercus preexistants non touches. Rapport docs/VALIDATION_CANDIDAT_ARC3_3_2026-11-06.md et commandes outils public-assets. Avertissements CSS/cache non bloquants consignes;pas de controle global production,compte,paiement,migration ou Netlify.

Prochaine priorite recommandee ARC-04 : index documents actuels/historiques/copies et matrice CI des vrais declencheurs,sans deplacement massif ou nouvelle orchestration. A5/H1 inchanges;pas de nouvelle permission distante. Historique ci-dessous conserve.

## Reprise active - 6 novembre 2026 : ARC3.2 extraction locale des demonstrations

4 HTML et2 fichiers propres au comparatif carrousels deplaces vers prototypes/design-assets, six SHA256 preserves et110 fichiers publics inchanges dont entrance.js/images du header. Manifeste109 ressources pour serveur local127.0.0.1:4336 uniquement, aucun acces aux API/comptes/documents prives. Guide prototypes/README.md. Apercu manuel lance pour controle; Ctrl+C pour arreter, commande de reouverture documentee.

Fixture Playwright partagee pour serveur ephemere et suites normales conservees; controle header reel separe du prototype, captures historiques non ecrasees.4 tests serveur et16 scenarios demo PASS;types PASS,35 tests Kanban PASS. Quatre demos ordinateur/mobile sans erreurs ni requetes externes;eventail20 cartes et rotations continues verifies.18 brouillons anterieurs preserves. Aucun build, header applicatif ou deploiement revendique.

Rapport docs/EXTRACTION_PROTOTYPES_ARC3_2_2026-11-06.md et preuves docs/assets/prototype-extraction-2026-11-06/. ARC3.2 termine,parent ARC3 en cours,.3 backlog. Prochaine priorite ARC3.3 : build isole, verifier prototypes absents du candidat et ressources du vrai site conservees, avant cloture. Pas de service distant,migration,paiement,notification ou agent. Les chemins historiques sous design_assets ne sont disponibles que sur le serveur de preview, pas rediriges dans Next.

## Reprise active - 6 novembre 2026 : ARC3.1 inventaire des prototypes publics

116 fichiers design_assets/22084835 octets,4 HTML;888 sources texte et513 references statiques.33 fichiers avec reference applicative exacte,46 proteges par prefixe dynamique,34 a revoir et3 entrees HTML candidates. Header importe entrance.js et ses medias : aucun dossier deplace globalement. Les4 demonstrations ont des references documentaires,3 des tests URL; plan de correspondance seulement propose hors public.

Outil lecture seule tools/public-assets/audit.py et8 tests isoles PASS.35 tests Kanban PASS; GYM-ARC3.1 termine, parent ARC3 en cours, .2/.3 backlog. Aucun fichier public/applicatif modifie, build non relance; pas validation runtime/deploiement.54 litteraux outils/public sans fichier exact ne sont pas54 liens casses prouves;1 document non UTF8 omis explicitement. Anciens brouillons et preuves preserves.

Rapport docs/ASSETS_PUBLICS_ARC3_2026-11-06.md et docs/assets/public-assets-2026-11-06/. Prochain lot ARC3.2 : preview locale hors public, resolution des dependances et extraction ciblee des demos avec mapping; conserver entrance.js/images et preuves historiques. ARC3.3 build isole et controles avant cloture. Pas d autorisation distante implicite; historique Git nettoye seulement.

## Reprise active - 6 novembre 2026 : ARC2 orchestration historique encadree

Catalogue38 scripts racine et guide scripts/README.md.12 entrees historiques (agent, orchestration, lots et boucles) refusent l execution avant contexte, logs ou processus; -DryRun retourne uniquement un descriptif sans effets. Aucun switch d activation ajoute. Nouvel inventaire lecture seule show_orchestration_status.ps1. Les controles pre-push ponctuels restent applicables; helpers UI historiques hors procedure, jamais source de consentement.

31 tests Windows/PowerShell en fixtures isolees PASS, aucun agent lance; corps historiques conserves. Inventaire reel execute sans ecriture. Etat READY non assimilable a permission. Aucun processus courant/autre worktree inspecte ou arrete; gardes non retroactives et non sandbox OS. Aucun parcours metier, build ou service distant modifie/execute.

Rapport docs/ORCHESTRATION_ENTREES_ET_GARDES_2026-11-06.md; catalogue docs/architecture/orchestration-scripts-2026-11-06.json; preuves docs/assets/orchestration-2026-11-06/. GYM-ARC2 et4 enfants termines localement,35 tests atelier/Kanban PASS et tableau controle ordinateur/mobile. A5/H1 inchanges. Modifications anterieures a preserver; utiliser historique Git nettoye. Prochaine priorite : ARC-03, inventorier prototypes sous public/design_assets et references avant tout deplacement. Historique conserve.

## Reprise active - 6 novembre 2026 : TS1 controle TypeScript et build retablis

Exclusion ciblee de playwright-artifacts dans gym-next/tsconfig.json, sans changer strictness/options/include ni code metier.20 erreurs historiques avant,0 apres;470 racines dont92 archives deviennent378 sources actives. Erreur TS2322 injectee en memoire dans un fichier actif toujours detectee; aucune erreur ecrite sur disque.92 sources archives et18 modifications anterieures SHA256 identiques.

Commande npm run check:types PASS. Build Next isole PASS avec92 sources archives copiees, sans .env/coffre ni services metier; police Google Fonts publique autorisee apres un premier essai hors ligne bloque. Frontiere secrets client PASS. Build d origine et serveurs applicatifs non remplaces, aucun deploiement. Snapshot inclut et preserve les brouillons anterieurs sans les approuver.

Rapport docs/TYPESCRIPT_PERIMETRE_ACTIF_2026-11-06.md, preuves docs/assets/types-scope-2026-11-06/. GYM-TS1 et4 enfants termines dans ce perimetre;35 tests atelier/Kanban PASS et affichage controle ordinateur/mobile. A5/H1 et recette distante inchanges. Prochain lot recommande : ARC-02, clarifier scripts d orchestration actifs/historiques sans lancer d agent. Utiliser uniquement historique Git nettoye; anciennes copies non fusionnables telles quelles. Historique conserve.

## Reprise active - 6 novembre 2026 : retrait Git et purge historique autorisee

Demande explicite utilisateur : retirer six dossiers internes et leurs copies project_readable de Git et de l historique GitHub. Douze exclusions gitignore,44 fichiers desindexes et copies locales SHA256 identiques.18 branches/1 tag reecrits atomiquement avec leases, arbres hors perimetre identiques et historique des chemins vide; refs PR1 head/merge actualisees et verifiees sans ces chemins. Les SHA des rapports historiques sont des anciennes references; map privee disponible.

Sauvegarde complete : delivery-private/history-cleanup-20261106/backup-local.git, ne pas publier. Branche locale active realignee sans changer index ou fichiers. Anciens worktrees/historiques locaux preserves : NE PAS les fusionner/pousser tels quels. Hook pre-push local ajoute, ancien historique refuse/nouveau accepte; autres clones non proteges automatiquement. Autorisation exceptionnelle de reecriture pour ce lot seulement, pas de force-push permanent.

Rapport docs/RETRAIT_DOCUMENTS_INTERNES_2026-11-06.md. Branches/tag/PR verifies, pas de garantie de purge physique des caches GitHub ou forks; support GitHub eventuellement necessaire. Aucun achat, operation financiere ou deploiement lance manuellement. Reprendre le prochain lot uniquement sur historique nettoye. Historique suivant conserve.

## Reprise active - 6 novembre 2026 : ARC1 cycle metier supprime

Contrat StructureOffer extrait dans lib/domain/structure-offer.ts et tableau demo existant dans repositories/structure-offer-memory.ts. Le service conserve ses exports historiques; le repository importe directement donnees et type. Aucun corps de fonction metier modifie, aucun registre global ajoute. Cycle coaches/reservations/payments/repository/structure-offers supprime : meme analyse AST,1 groupe avant et0 apres,385 puis388 sources.

3 tests de reference PASS puis8 tests locaux PASS dont4 nouveaux contrats : capacite/chevauchement, partage de la facade, document demo injecte, separation persiste/demo et refus fallback production. Types actifs sans erreur. Controle TypeScript global reste en echec :20 diagnostics dans playwright-artifacts, prouves identiques avant/apres via CompilerHost. Ni tsconfig ni archives modifies, aucun build revendique. Rapport docs/ARCHITECTURE_CYCLE_ARC1_2026-11-06.md et preuves docs/assets/architecture-cycle-2026-11-06/.

GYM-ARC1 et4 enfants valides dans le perimetre local; Kanban4325 controle ordinateur/mobile,35 tests atelier/Kanban PASS. A5/H1 et recette distante inchanges. Aucun secret charge, service distant, paiement, notification, migration ou deploiement. Modifications anterieures preservees. Prochain lot recommande : clarifier sources actives/archives pour fiabiliser le controle TypeScript global, sans refonte implicite. Historique conserve.

## Reprise active - 5 novembre 2026 : audit architecture et rangement livre

Audit documentaire dans docs/audits/architecture-2026-11-05/ : verdict partiel, assistant lexical local et embeddings/vectoriel de recette prepares, pas d agent autonome applicatif demontre. Lanceur Codex de developpement present mais non execute/verifie ici; roles Kanban simules et A5 en backlog. Inventaire metadata41288 dossiers/306968 fichiers avec5 refus de repertoire et6 erreurs de stat, dependances/prive sans lecture de contenu; pas une lecture integrale de tous les fichiers. Analyse AST385 sources/681 imports internes, un cycle metier de5 modules, zero doublon exact dans ce sous-ensemble.

35 tests atelier/Kanban et12+3 cas lexicaux PASS dans ce lot. Aucun code applicatif, AGENTS, workflow, SQL ou Kanban modifie, aucun service lance, acces distant de compte, secret ouvert, migration ou deploiement. Rapports : RAPPORT.md, CONSTATS.md, CIBLE_ET_PLAN.md, COUVERTURE.md et inventaires JSON/CSV. Propositions de tickets dans le rapport uniquement. Prochaine decision recommandee : lot cible pour casser le cycle coaches/reservations/payments/repository/structure-offers, puis clarifier scripts/prototypes et reprendre A5 seulement apres les prerequis documentaires. H1.2.3 distant reste ouvert sans nouvelle autorisation. Historique conserve.

## Reprise active - 5 novembre 2026 : H1.2.3 preparation PostgreSQL locale livree

Proposition SQL privee dans supabase/proposals/reconciliation-20261105/ : preflight, migration, postflight, rollback. Adaptateur psql loopback avec mapper du produit, CAS transactionnel sur ligne/revision/intention/plateforme/liaison, droits operateur bornes et decideur distinct. Aucun raccordement au parcours actif. Protocole annulation prepare sans creation de remboursement par la reconciliation.

31 controles PostgreSQL12.15 reels PASS, dont deux processus, changements sans nouveau statut, diagnostic/reprise/repetition avec HTTP simule, rollback avant commit et reponse ignoree apres commit, privileges/RLS et retour arriere SQL avec donnees metier preservees. Pas de crash serveur injecte. 62 tests moteur/adaptateurs historiques PASS. PostgreSQL17.6 distant NON valide : fixture synthetique basee sur archives4/5novembre, pas une copie complete Supabase. Cluster temporaire55441 arrete apres tests ; aucun service existant reconfigure. Preuves docs/assets/reconciliation-pg-2026-11-05/ et rapport docs/RECONCILIATION_POSTGRES_H1_2_3_2026-11-05.md.

H1.2.3.1 et H1.2.3.2 termines localement; .3 autorisation/prerequis et .4 recette distante restent a preparer. H1.2.3/H1.2/H1 restent en cours. Kanban4325 a verifier sur captures. Aucune operation distante Stripe/Supabase, coffre, migration distante, paiement/remboursement, notification ou deploiement. Anciens tickets valides preserves ; aucune reprise RAG. Prochaine action precise : autoriser seulement le preflight distant en lecture seule sur getyourmentor-preprod pqxqqbwesfrefzjoawmx, scope et arrets detailles dans le dossier; aucune ancienne permission reutilisee. Historique conserve ci-dessous.

## Reprise active - 5 novembre 2026 : H1.2.2 adaptateurs locaux durables valides

HTTP GET127.0.0.1 et SQLite de laboratoire livres, CLI operateur prive avec permission provisionnee en base, expiration/modes/cibles verifies avant lecture et dans le commit. Diagnostic readOnly par defaut, reprise explicite, pagination/timeout/annulation, CAS sur ligne+revision+intention durable et concurrence de processus verifies. 62 tests locaux PASS incluant36 tests du moteur; controles Kanban et preuves dans docs/assets/reconciliation-adapters-2026-11-05/. Rapport docs/RECONCILIATION_ADAPTATEURS_H1_2_2_2026-11-05.md.

H1.2.2 termine en local, H1.2.3 a preparer, H1.2 et H1 restent en cours. Supabase reste le backend du site; SQLite n'est qu'un laboratoire, schema/rollback non compatibles Supabase. Aucun parcours actif modifie, coffre reel charge, appel distant Stripe/Supabase, migration distante, paiement ou notification. Intention d'annulation preparee et immuable, pas branchee au parcours actif ni utilisee pour inventer une annulation.

Prochaine action : cadrer H1.2.3 et l'equivalence PostgreSQL du CAS/protocole d'annulation avant toute validation externe. Autorisation distante et migration specifique eventuelle a obtenir sur un resultat concret; ne pas retirer la restriction loopback pour reutiliser ce CLI directement sur internet. GYM-B1/H1.1/H1.2.1 restent valides. Historique conserve.

## Reprise active - 5 novembre 2026 : H1.2 premiere reconciliation locale livree

Moteur/CLI fixture-only dans tools/payment-reconciliation : diagnostic sans mutation des lignes, reprise explicite vers copie nouvelle, lectures fournisseur simulees, CAS sur ligne complete et rapports expurges. Reutilise module de commission partage, aucun appel financier ou notification possible via ses ports. 36 tests locaux PASS : pannes, concurrence, doublons, remboursement pending/succeeded/failed, annulations et incoherences;35 tests Kanban PASS. Aucun fichier applicatif modifie, serveur recette3005 non relance, aucun compte distant ou migration touche.

Rapport docs/RECONCILIATION_H1_2_2026-11-05.md et preuves docs/assets/reconciliation-h1-2-2026-11-05/. H1.2.1 local termine; H1.2 parent et H1 en cours, H1.2.2 raccordement services/stockage/CAS durable et H1.2.3 validation externe/exploitation a preparer. Les fixtures et marqueurs de plateforme ne prouvent aucun appel Stripe reel. Aucun remboursement orphelin traite sans intention locale durable, aucun faux succeeded pour failed, aucune resurrection cancelled->paid.

Prochaine action : H1.2.2 sur code/tests locaux seulement; pas de permission distante implicite. Validation externe, ordonnanceur, timeouts reseau et CAS inter-processus non livres. GYM-B1 et H1.1 restent termines. Kanban4325 et preuve de statuts a verifier dans le rapport final. Historique conserve.

## Reprise active - 5 novembre 2026 : guide, audit cible et expiration serveur des sessions

Guide docs/DEMONSTRATION_PARCOURS_2026-11-05.md prepare sur preuves existantes, sans nouveau compte/paiement/notification. Audit docs/FIABILISATION_AVANT_PRODUCTION_2026-11-05.md : premier ecart retenu, cookies chiffres sans echeance serveur. Nouvelle enveloppe authentifiee version1, issuedAt/expiresAt, maximum7jours identique au cookie; anciens formats sans date refuses, reconnexion normale requise. Map memoire locale aussi bornee. Aucun compte distant modifie ni changement de droits. Pas de refresh/revocation globale Supabase revendiques.

GYM-B1 reste termine. GYM-H1 parent en cours, H1.1 expiration/guide traite; H1.2 reconciliation financiere, H1.3 inscriptions partielles, H1.4 validite/revocation fournisseur et H1.5 supervision Telegram restent a preparer. Dates/estimations proposees, temps reel non mesure. 6 tests unitaires et2 projets navigateur PASS, build/types/frontiere secrets client PASS,35 tests Kanban PASS. Voir checks.json et rapport.

Serveur recette3005 arrete pour reconstruire son build; aucune approbation renouvelee, pas de relance automatique avec des acces anciens. Tests navigateur uniquement sur serveur isole3006, secret et comptes synthetiques locaux, serveur arrete apres tests. Apercu Kanban4325 a conserver si actif. Preuves docs/assets/session-hardening-2026-11-05/. Aucun nouveau paiement, migration ou deploiement. Prochain ticket recommande H1.2, sans autorisation implicite d'operation distante. Historique conserve ci-dessous.

## Reprise active - 5 novembre 2026 : derniers cas de recette valides, GYM-B1 termine dans son perimetre

Deux coachs et deux sportifs confirmes en Supabase. Second sportif inscrit normalement puis lien confirme par utilisateur; profil et role persistants, connexion/deconnexion/reconnexion et isolation croisee verifies. Une reservation propre de test creee puis annulee sans paiement. Aucun compte auto-confirme.

Nouvelle reservation pour refus Checkout : une vraie requete sandbox402 card_declined/generic_decline observee, message visible. Session open/unpaid, PI requires_payment_method, aucune capture/transfert/commission ou notification paid. Reprise meme Checkout et lien Retour controles; reservation reste accepted/impayee. Paiement deja rembourse precedent non refait et toujours cancelled/refund succeeded. Approbation temporaire valide au test, pas de renouvellement.

GYM-B1.5.1, GYM-B1.5.2, GYM-B1.5 et parent GYM-B1 termines avec preuves; GYM-B1.4 conserve done. Tableau local4325 controle ordinateur/mobile, source JSON et absence de surcharge dans contextes de controle; anciens brouillons personnels preserves. Rapport : docs/RECETTE_CAS_RESTANTS_2026-11-05.md; preuves docs/assets/recipe-final-cases-2026-11-05/. Aucun code applicatif change, nouveau paiement reussi, migration ou deploiement. Cloture recette bornee, pas validation globale production ni RAG. Prochaine action : choisir un lot distinct parmi les exigences avant production, sans activer les cles live. Historique suivant conserve.

## Reprise active - 5 novembre 2026 : paiement sandbox recupere, rembourse et Telegram recu

Routage runtime par environnement termine; coffre sandbox distinct. Paiement test utilisateur 40 EUR confirme par rejeu officiel du webhook (200), references persistees. Second rejeu sans doublon, une notification paid acceptee puis reception telephone confirmee par utilisateur. Annulation/remboursement test 100 % execute deux fois : un seul remboursement, transfert repris et commission 6 EUR remboursee. Rejeu apres remboursement 200, statut cancelled conserve. Cause exacte du premier 503 non etablie, diagnostics de phase recette ajoutes sans relachement des controles.

21 tests mocks PASS; build/types/frontiere secrets PASS; retour navigateur ordinateur/mobile controle avec reservation autorisee et refus autre compte. Rapport : docs/STRIPE_RECOVERY_2026-11-05.md; preuves expurgees docs/assets/stripe-recovery-2026-11-05/. Donnees brutes/coffres/captures privees hors Git. Aucun deploiement, paiement reel ou nouvelle migration distante. Ne pas refaire ce paiement deja rembourse.

GYM-B1.4 reception Stripe/Telegram validee; GYM-B1.5 et parent non termines : deuxieme sportif absent (quota mail) et refus de carte externe non teste. Prochain lot : completer ces cas sans recreer les comptes existants, puis recette finale. Approbation coach recette temporaire : verifier expiration, jamais renouveler silencieusement. Les sections suivantes sont historiques et leurs blocages runtime sont depasses par cette reprise.

## Reprise active - 5 novembre 2026 : migration isolation distante appliquee apres oui utilisateur

Autorisation explicite oui recue pour isolation.sql, cible getyourmentor-preprod uniquement. APPLIQUEE et relue : deux registres plateformes, une liaison legacy copiee, table historique inchangee, trois reservations conservees hors nouvelle colonne stripe_environment_id null. Sauvegarde schema/donnees actuelle DPAPI hors Git; verrou et garde de comparaison lors application. Premier garde genere refuse42601 puis corrige, aucun effet du premier essai. PostgreSQL17.6 distant.

Tests SQL en transaction annulee PASS : refus environnement change, beneficiaire croise, doublon et reference sans environnement; fixture supprime par ROLLBACK confirme par relecture. RLS et privileges verifies; REST service_role2 registres/1 liaison et anon401. Metadonnees tables RAG comparees inchangees, aucune operation Auth ou Stripe. Preuves remote-migration.json et rest-after-migration.json dans docs/assets/stripe-sandbox-2026-11-05/.

Runtime NON adapte a isolation; cles sandbox NON collectees/basculees. Serveur recette local3005 volontairement suspendu avant migration, ne pas relancer pour paiements avant routage/claim environnement testes. Sandbox acct_1UYN06LfnWg4ERQJ conserve, ancien acct_1UGhVXPwRppadkVH preserve. Prochain lot : adaptation serveur/mapper/checkout/webhook/remboursement et lanceurs distincts, tests melanges; puis onboarding/paiement/Telegram reels de test. Aucune autorisation migration a redemander pour celle deja appliquee; aucune nouvelle migration implicite. Aucun DONE global, deploiement ou paiement. Rapport : docs/STRIPE_SANDBOX_ISOLATION_2026-11-05.md.

## Reprise active - 5 novembre 2026 : sandbox cree, migration isolation prete a autoriser

Sandbox GetYourMentor - Recette Accounts v2 cree, acct_1UYN06LfnWg4ERQJ, copie production desactivee, titre verifie apres rechargement. Aucune cle sandbox collectee ni bascule runtime; compte legacy et association preserves. Aucun paiement ni nouvel evenement metier Telegram.

Migration PROPOSEE uniquement : supabase/proposals/20261105_stripe_environment_isolation.sql, preflight et rollback associes. Registre plateformes/test, associations par environnement, environnement fige sur reservations et FK beneficiaire. Tests PostgreSQL12 local synthetique PASS, refus melanges et rollback avec historique; retour arriere equivalence schema/lignes (ordre COPY normalise). Serveur temporaire arrete. Sauvegarde donnees chiffree DPAPI hors Git; DDL actuel et capture coherente a rafraichir sous ecrivains suspendus avant application.

Utilisateur exige autorisation specifique avant migration distante : NON appliquee. Le code actuel ne gere pas encore le routage par environnement; ne pas changer les cles actives avant cette adaptation. Dossier concret : docs/STRIPE_SANDBOX_ISOLATION_2026-11-05.md. Preuves : docs/assets/stripe-sandbox-2026-11-05/sql-rehearsal.json. Prochaine action : autorisation du SQL sur pqxqqbwesfrefzjoawmx seulement puis adaptation/test runtime, onboarding et paiement test. GYM-B1.5 bloque, aucun DONE global ni deploiement.

## Reprise active - 5 novembre 2026 : Accounts v2 integre, onboarding bloque sur sandbox

Decision v2 executee, politique v1 inchangee. Endpoints comptes/liens v2 JSON version stable 2026-10-28.endive; recipient seul pour destination charges, email de session authentifiee. Un compte connecte test cree et liaison Supabase persistee; verifie distant v2.core.account/livemode=false/metadata concordante. Capacites payouts et stripe_transfers restricted, Checkout toujours refuse. Aucun paiement, webhook metier, transfert ou remboursement externe effectue.

Blocage reel : lien d onboarding refuse400 par Stripe, demande explicite de compte cree dans sandbox pour cette configuration recipient en testmode. Aucun contournement, aucune nouvelle creation repetee, aucune politique globale modifiee. Compte et association existants preserves. Examiner sandbox disponible puis plan de stockage par environnement avant toute bascule de cles : association actuelle immuable, migration distante supplementaire non autorisee. Approvals recette expires a reverifier avant reprise metier, aucun renouvellement silencieux.

API serveur du build final : GET Connect200 linked=true/ready=false et paiement409 compte non pret. Serveur recette final session86047 sur 127.0.0.1:3005.

11 tests fournisseurs mocks PASS; preuves docs/assets/accounts-v2-2026-11-05/. Rapport canonique docs/CONNECT_PARCOURS_TEST_2026-11-04.md, section Accounts v2. Pas de nouvelle recette navigateur du paiement ni nouvelle reception Telegram. Build final (compilation/types) et frontiere secrets client PASS; tests Kanban 35/35 PASS. SHA final a retrouver dans Git apres livraison. Changements anterieurs preserves; aucun deploiement. GYM-B1.5 bloque, aucune cloture globale.

## Reprise active - 5 novembre 2026 : approbation recette integree et reservations externes verifiees

Mise a jour Connect : utilisateur confirme personnellement l accord Connect; retour au guide observe et parcours Testez votre integration maintenant accessible. Le refus historique etait rejoue : en-tete Idempotent-Replayed=true. Aucun compte dans la liste test avant changement. Cle de creation passee au namespace stable gym-connect-test-v2-... (ce nom ne signifie PAS Accounts v2); aucun changement des beneficiaires ni des montants. Apres ce changement, Stripe revele un nouveau refus precis : creation Accounts v1 desactivee pour cette nouvelle integration, option officielle de compatibilite dans les politiques API. Nouvelle erreur egalement mise en cache, aucune autre rotation ni creation repetee prevue tant que politique non decidee.

Ecran test des politiques ouvert, support Accounts v1 desactive. Fenetre indique modifications applicables au compte entier, sans garantie d isolation test : aucune activation enregistree. Choix utilisateur demande compte tenu de l exclusion production : autoriser explicitement compatibilite v1 sur compte, ou conserver politique et adapter a Accounts v2. Source officielle consultee : https://docs.stripe.com/connect/accounts-v2/account-creation . L utilisateur a accepte les contrats lui-meme; l agent n a accepte aucun engagement. Forwarder Stripe test relance, secret concordant avec coffre; aucun evenement metier encore traite.

Mise a jour Stripe du 5 novembre : utilisateur a confirme personnellement les responsabilites; passage au choix industrie observe. Configuration technique effectuee : plateforme encaisse puis reverse, services a la demande, onboarding heberge Stripe, Express Dashboard. Ecran Review your setup affiche acceptation du Connect Platform Agreement sur Continue. Aucune acceptation de cet accord par agent; utilisateur sollicite pour lire et cliquer personnellement. Aucun nouveau compte Connect ou Checkout cree a ce stade.

Consigne 8eaffb04-f28b-4a5e-bfd6-40177a4bd996 executee. Autorisation administrative locale chiffree du premier coach fictif, une heure maximum, limites projet pqxqqbwesfrefzjoawmx / http://127.0.0.1:3005 / services reels recette / Stripe test, refus contexte heberge, autres coachs et flags de simulation. verified=false et verification_status inchanges; aucun role Auth modifie. Script set-recipe-coach-approval.ps1 trace acteur/date en local hors Git, peut revoquer et arrete uniquement le listener Next reconnu sur3005; redemarrage requis. Revocation reelle testee : profil public404 apres redemarrage sans autorisation; reapprobation puis relance executees pour apercu. Autorisation expire : verifier/renouveler par operation explicite avant reprise, pas de prolongation automatique. Serveur recette au lancement session18745.

Gardes calendrier, fiche, catalogue, planning et reservation utilisent decision serveur; affichages carte/fiche/calendrier/recapitulatif/compte explicitent Profil fictif de demonstration, sans Coach verifie. Accueil mentor-preview conserve son filtre professionnel verified=true : profils fictifs non introduits dans ce carrousel. Pas de repli simulation. Tests :16 unitaires/fournisseurs mocks,13 controles API metier reels,2 projets navigateur ordinateur/mobile avec5 vues chacun (3 captures publiques chacun); build PASS, types et frontiere secrets PASS dans controle final. Deux requetes forgeant autorisation refusees; premiere fixture date trop precise avait ete refusee400 avant garde, corrigee puis refus d autorisation404 obtenu et archive.

Donnees reelles RECETTE : trois reservations creees, une acceptee, une refusee, une annulee. Conflit de creneau409, action mauvais coach403, rejeu acceptation409. Tarif serveur40EUR, instantane financier present, pas de PaymentIntent. Telegram a accepte3 notifications de demande; utilisateur confirme leur reception telephone. Une seule liaison coach1 preservee, sportif non associe. Pas de notifications client pretendues. Donnees test et IDs conserves en prive, pas de suppression historique.

Stripe : dashboard Connect encore4etapes. GET Connect local200 linked=false ready=false; tentative Checkout de reservation acceptee409 avant toute session (coach doit terminer association Stripe test). Aucune nouvelle creation Connect refus-ee repetee. Sur instruction utilisateur fais le, navigation par commandes clavier ordinaires; option plateforme encaisse puis reverse selectionnee selon integration existante. Stripe affiche une fenetre Verifier et confirmer les responsabilites (remboursements et contestations a la charge de la plateforme). NON acceptee par agent, utilisateur sollicite pour lire/confirmer personnellement selon exclusion contractuelle. Ecran laisse ouvert. Ancien constat tous boutons desactives etait temporaire : profil plateforme maintenant accessible; ne pas le traiter comme blocage permanent.

Prochaine etape : attendre decision personnelle Stripe, continuer configuration technique si autorisee, onboarding coach test puis Checkout/webhook/transfert/remboursement reellement verifies. Aucun achat, live, migration ou deploiement. Preuves : docs/assets/recipe-approval-2026-11-05/ ; rapport canonique docs/CONNECT_PARCOURS_TEST_2026-11-04.md. Apercu http://127.0.0.1:3005/coachs?sport=fitness&city=Paris tant que serveur et autorisation sont actifs.

## Reprise active - 4 novembre 2026 : prerequis Connect et approbation recette bloques

Consigne 52ddf956-6be7-4700-9554-40bd1defd0d3 reprise. Dashboard Connect test accessible mais API creation compte test refuse400 invalid_request_error (plateforme pas encore inscrite a Connect); route applicative503. Page Configurer Connect affiche les commandes observees desactivees, y compris Testez votre integration. Aucun clic force ni validation contractuelle/personnelle; intervention utilisateur demandee pour terminer le parcours proprietaire. Affichage du tableau de bord ne prouve pas activation API. Aucun compte connecte, Checkout, transfert ou remboursement cree.

Approbation administrative existante = verified boolean + verification_status approved avec libelle Coach verifie. Incompatible avec une approbation de recette honnete du profil fictif. Aucun changement de verification ou role admin. Proposition locale concrete preparee dans docs/RECETTE_APPROBATION_COACH_2026-11-04.md : autorisation administrative distincte, serveur, premier coach uniquement, bornes loopback/projet recette/Stripe test, verified conserve false et mentions demo explicites. Non integree/non active; expliquer et revoir avant modification de la regle comme demande par utilisateur.

Deuxieme sportif : absence verifiee puis une seule nouvelle inscription autorisee tentee, refus429 over_email_send_rate_limit; aucun renvoi ni autre essai. Les deux coachs et sportif1 restent confirmes selon derniere preuve; liaison Telegram coach1 preservee, non modifiee. Aucun modele email, migration, donnees production ou deploiement change. Aucun parcours de reservation/notification metier declare verifie. Preuve : docs/assets/connect-test-2026-11-04/business-prerequisites-status.json. Prochaine reprise : terminer activation Connect via compte proprietaire, revoir separation approbation recette, puis essais externes sans retirer les gardes.

## Reprise active - 4 novembre 2026 : deuxieme coach Outlook inscrit, confirmations attendues

Confirmation sportif1 annoncee par utilisateur puis verifiee dans Supabase : compte unique confirme, role sportif. Connexion locale reelle HTTP200, role sportif conserve malgre demande client coach. Cookie stocke DPAPI hors Git. Le signalement precedent de mail vide ne justifie plus de renvoi; cause visuelle du message non diagnostiquee. Aucun modele email modifie. Deux coachs et un sportif confirmes; sportif2 absent. Reservations toujours soumises a approbation coach et Connect test restant a configurer.

Sur nouvelle demande explicite utilisateur, et apres verification du compte sportif encore non confirme : un seul renvoi /auth/v1/resend effectue, accepte HTTP200. Reception en boite et confirmation non verifiees. Ce resultat remplace le blocage429 pour cette nouvelle tentative uniquement; aucun reset de quota deduit. Attendre le clic du lien recu sur l alias sportif1 Gmail, sans relancer automatiquement.

Mise a jour apres retour utilisateur : confirmation du premier sportif non recue. Un seul renvoi normal via /auth/v1/resend a ete tente; refus429 avec code fournisseur over_email_send_rate_limit. Aucun nouvel envoi apres ce refus, aucune confirmation administrateur et aucune protection desactivee. Cette preuve concerne le renvoi actuel; elle ne demontre pas retroactivement la cause du refus historique ni la livraison du premier message. Compte sportif conserve en attente. Prochaine action : permettre de nouveau l envoi legitime selon la configuration de messagerie, puis un seul renvoi controle; aucun delai de reset affirme sans preuve.

Reprise autorisee par piece jointe 90452a72-a469-4ba7-b0ac-89f036fd9c00. Inscription normale du deuxieme coach avec l adresse Outlook fournie et controlee : HTTP202, role coach attribue serveur, profil persiste, confirmation email requise. Mot de passe uniquement DPAPI hors Git. Verification finale : coach1 et coach2 confirmes; sportif1 non confirme; sportif2 absent. Deux profils coachs, aucun approuve, une liaison Telegram preservee. Connexion coach2 avant confirmation refusee401, puis connexion reussie200 apres clic utilisateur. Aucun role existant reaffecte. Ancienne tentative Gmail coach2 : aucun utilisateur partiel observe, cause historique toujours non etablie.

Serveur recette initialement arrete entre sessions : premier essai Outlook echoue en transport, aucun appel fournisseur; relance puis une seule inscription fournisseur reussie. Serveur lance session87796 sur 127.0.0.1:3005 avec services de recette reels. Deuxieme sportif tente une seule fois : refus400 signup_provider_error, aucun compte cree; aucune relance. Cause non etablie, ne pas l attribuer automatiquement a une limite email. Utilisateur confirme le clic Outlook; email confirme verifie cote Supabase, connexion200 et role serveur coach malgre role client sportif. Confirmation du premier sportif encore attendue.

Diagnostic inscription local : signup-provider-error.ts + integration auth/sign-up. Messages et codes exposes limites a une liste explicite, aucun payload/message brut fournisseur. Compatibilite code et error_code selon source officielle auth-js; refus ne declenche ni nouvelle tentative ni ecriture de role/profil. Sept tests mocks PASS, types PASS; build final PASS (compilation et controle de types inclus). Huit controles API reels entre coach1/coach2 PASS : documents et modifications de l autre refuses403, acces propre valide par erreur de parametre400, liaison Telegram propre true pour coach1 et false pour coach2. Source : https://github.com/supabase/auth-js/blob/master/src/lib/fetch.ts . Preuves dans docs/assets/connect-test-2026-11-04/outlook-recipe-status.json et signup-provider-results.json.

Stripe : dernier ecran observe avant cette reprise connect/set-up/profile, aucun choix valide. Integration utilise destination charges (plateforme encaisse puis transfert avec commission), pas encaissement direct par coach. Aucun nouvel acces navigateur confirme cette reprise (appel sans retour termine); ne pas annoncer Connect active ou choisir/valider une responsabilite contractuelle sans verification. Aucun Checkout, transfert, remboursement ou notification metier execute. Aucune migration/deploiement. Prochaines etapes : confirmer email sportif, diagnostiquer prochain refus sans multiplier les envois, terminer Connect test et prevoir une approbation de demonstration explicite avant reservation; ne pas inventer qualification ni lever les gardes.

## Reprise active - 4 novembre 2026 : migration recette appliquee, Connect a activer

Autorisation specifique recue dans la piece jointe 546b4ce8-f3d2-4741-b857-322eb130777e. Bundle metier applique UNIQUEMENT au projet pqxqqbwesfrefzjoawmx apres sauvegarde privee definitions/droits/politiques/contraintes/dependances, repetition avec assertions et ROLLBACK compare identique. Assertions persistantes PASS; metadonnees RAG comparees inchangees. Tests SQL rollback PASS (droits anon/authenticated, snapshot immuable, unicites creneaux/paiement). REST reel : cinq tables refusees anon, accessibles service_role. Aucun jeu de donnees historique efface.

Un coach et un sportif de demonstration crees via la vraie inscription; mots de passe DPAPI hors Git. Coach confirme par lien email, connexion verifiee et role fourni par navigateur ignore. Sportif attend confirmation. Troisieme inscription coach2 refusee HTTP400, cause non etablie, pas de relance automatique; sportif2 non tente. Coach non approuve : garde de reservation conservee, aucun faux diplome ni verification simulee. Adresse controlee et mots de passe jamais dans les preuves versionnees. Retour du lien email ne s ouvre pas chez utilisateur; verification Supabase confirme neanmoins coach actif. Ne pas assimiler confirmation email a approbation coach.

Correction reelle : controles Origin des routes Connect et Telegram utilisent NEXT_PUBLIC_APP_URL au lieu de l URL interne Next. Build et types PASS; 15 tests de regression PASS dont deux tests API reels et 13 tests fournisseurs mocks. Controle authentifie Telegram : origine etrangere/absente refusee, action invalide400, association200. Code exact recu via bot personnel puis transmis au webhook local protege; confirmation depuis session coach200, liaison persistee et relue200. Helper receive-telegram-test-once.ps1 borne a coach1, aucune avance offset ni modification webhook; reception ponctuelle, pas un service permanent. Aucun message metier de reservation envoye.

Blocage Stripe reel : API creation compte Connect test400 invalid_request_error, plateforme non inscrite a Connect. Aucun compte connecte, Checkout, transfert ou remboursement cree. Demande utilisateur en attente : activer Connect depuis dashboard.stripe.com/connect (renseignements entreprise/acceptations personnelles si demandes), confirmer email sportif. Ne pas contourner Connect ou desactiver confirmation email. Apercu http://127.0.0.1:3005 en services REELS DE RECETTE, session serveur 88903 au lancement; ancien mode simulation remplace. Stripe listener precedent a reverifier avant paiement, aucun evenement encore traite. Pas de deploiement. Rapport et preuves : docs/CONNECT_PARCOURS_TEST_2026-11-04.md, docs/assets/connect-test-2026-11-04/business-recipe-status.json. Captures/recette navigateur du parcours connecte complet encore non realisees.

## Reprise active - 4 novembre 2026 : bot et destinataire Telegram configures

Sur instruction utilisateur de copier le jeton affiche, message BotFather explicitement pour @Christopherfordantbot capture sans retour de sa valeur. Identite getMe verifiee; jeton et destinataire personnel stockes DPAPI hors Git. Aucun webhook existant, aucun changement de webhook. Challenge /start retrouve une seule fois dans un chat prive dont expediteur et destinataire concordent; getUpdates sans offset, aucune confirmation/destruction d autres mises a jour. Message technique envoye une seule fois, accepte par Telegram; lecture sur telephone non confirmee. Presse-papiers initial restaure et sauvegarde temporaire retiree.

Ces controles valident le transport direct uniquement, pas l association authentifiee dans l application ni une notification de reservation. Coffre maintenant complet (10 parametres). Migration Supabase recette specifique toujours en attente d autorisation; aucune migration, aucun compte ou paiement externe cree. Ne pas relancer de collecte de jeton. Prochaine etape : autorisation bornee du bundle de recette, repetition transactionnelle puis raccordement des receptions et essais metier. Rapport : docs/CONNECT_PARCOURS_TEST_2026-11-04.md; preuve sans secret : docs/assets/connect-test-2026-11-04/telegram-setup-status.json.

## Reprise active - 4 novembre 2026 : renouvellement autonome Telegram non confirme

Utilisateur demande de faire soi-meme la manipulation. BotFather accessible, commande /revoke et selection de @Christopherfordantbot preparees/activation tentee par UI. Aucune nouvelle confirmation de renouvellement observee. La conversation contient l erreur BotFather 353933650; les essais de /mybots, y compris saisie native, activation du bouton et clavier, n ont pas produit de nouvelle reponse observable. Ne pas presenter les retours des actions UI comme une preuve de commande recue par Telegram. Brouillon de commande efface, presse-papiers restaure.

Copie locale par selection et raccourci standard possible, mais candidat historique identifie par getMe comme appartenant a un autre bot : rejete et supprime du coffre, aucune mutation de cet autre bot. Aucun jeton Telegram actif ou destinataire configure. Pas de notification envoyee ni webhook modifie. Etat conserve : Supabase/Stripe test configures; migration specifique toujours en attente. Rapport et preuve : docs/CONNECT_PARCOURS_TEST_2026-11-04.md et docs/assets/connect-test-2026-11-04/telegram-renewal-status.json. Ne pas reutiliser l ancien jeton expose, ne pas multiplier les memes tentatives ni redemander un script a l utilisateur.

## Reprise active - 4 novembre 2026 : bot Telegram choisi, renouvellement attendu

Utilisateur : BotFather ouvert dans navigateur et choix explicite @Christopherfordantbot. Conversation accessible et bot identifie sans consulter les autres conversations. Copie automatisee echouee (clic en delai depasse, API presse-papiers refusee). Le retour technique du clic a expose le jeton courant; aucune valeur n est reproduite dans les fichiers de livraison. Incident signale a l utilisateur, renouvellement /revoke puis copie manuelle du nouveau jeton demandes. Ne pas reutiliser l ancien jeton ni le recopier. Aucune rotation ou configuration du bot encore confirmee; aucun message de notification envoye.

A reception de la confirmation nouveau jeton copie : lire uniquement le presse-papiers local sans affichage, verifier getMe pour Christopherfordantbot et getWebhookInfo sans changer le webhook, puis enregistrer via DPAPI. Restaurer le presse-papiers initial depuis la sauvegarde chiffree hors Git apres capture. Ne pas perturber un webhook ou polling preexistant. Migration Supabase specifique toujours en attente; aucune autorisation deduite du choix de bot. Sources et rapport : docs/CONNECT_PARCOURS_TEST_2026-11-04.md.

## Reprise active - 4 novembre 2026 : acces configures par autonomie

Demande utilisateur : ne sait pas executer le script, faire la configuration. Parametres Supabase recette et cle Stripe test recuperes via sessions ouvertes puis DPAPI hors Git. Projet/roles et mode Stripe test verifies; Auth email autoconfirm false. CLI Stripe 1.55.8 local, archive officielle verifiee, secret de reception chiffre. Forwarder Stripe test lance, connexion prete et secret concordant; aucun evenement genere. Aucun paiement externe, compte de demonstration ou migration cree. Details dans docs/CONNECT_PARCOURS_TEST_2026-11-04.md, derniere section.

Telegram Web K connecte (confirme par utilisateur et recherche visible); BotFather officiel retrouve mais conversation ne s ouvre pas via automation. Demande minimale en attente : ouvrir manuellement BotFather et le laisser affiche. Bot/destinataire encore manquants; autorisation migration specifique toujours en attente. Aucun script demande a l utilisateur pour les parametres deja recuperes. Presse-papiers restaure; fragment de cle test apparu dans sortie technique documente sans reproduction. Lot applicatif pousse 0e48564 avec SHA distant confirme, brouillons preserves.

## Reprise active - 4 novembre 2026 : parcours metier Connect test prioritaire

GYM-B1 en cours de livraison locale, bloque sur acces et migration specifique. Connect test prepare (onboarding coach, commission historique, destination, references confirmees serveur, remboursement avec reprise de transfert); inscription Supabase/confirmation et identifiants de coach corriges. Configuration DPAPI et lanceur recette sans repli local. Rapport : docs/CONNECT_PARCOURS_TEST_2026-11-04.md.

Build et types PASS; 13 tests unitaires mocks, 26 controles locaux API/parcours et deux rendus de panneau ordinateur/mobile PASS. Aucun compte, paiement, transfert ou message Telegram reel execute. Deux lectures READ ONLY confirment ancien schema et absence des tables Telegram/Connect. SQL propose uniquement, autorisation specifique demandee; coffre local encore absent au controle de livraison. Toutes les preuves distinguent simulation et externe.

Checkout C:/Users/cashe/Documents/GYM-connect-test-20261104; apercu simule 127.0.0.1:3005. Avant essais externes : enregistrer acces masques, autoriser la repetition/migration bornee, raccorder receptions Stripe/Telegram, puis creer et verifier deux coachs/deux sportifs. Ne pas inventer approbation de coach, confirmation email ou reception telephone. A5 differe; RAG hors chemin critique. Aucun deploiement. Preuves Git finales : delivery-private/business-test-final.json dans le depot principal.

## Reprise active - 4 novembre 2026 : fiabilisation locale avant A5

Lot GYM-Q1 livre : exclusion des correspondances grammaticales parasites, Jupiter abstention, historique 12/12 et controles 3/3; 35 tests Node PASS. Rejeu diagnostique A4.3 45/53 avant, 47/53 apres, sans regression selon ses criteres; six cas restent non conformes. Jeu et preuves A4.3 preserves, aucune validation independante revendiquee. Rapport : docs/RAG_FIABILISATION_2026-11-04.md.

Six propositions d annotations avec extraits/lignes/versions a relire, zero validation humaine. Huit troncatures reelles confirmees; deux stress 1313/1315 tokens prouvent la perte de fin. Fenetres 200 tokens/recouvrement 32 proposees et couverture verifiee, aucune inference ni activation. GYM-Q2 bloque sur relecture humaine/nouveau jeu reserve, dependance ajoutee a A5/A5.1. Supabase et pgvector inchanges; lexical seul, aucun deploiement.

Checkout C:/Users/cashe/Documents/GYM-rag-quality-20261104. Brouillons du depot principal preserves. Preuves Git finales : delivery-private/rag-quality-final.json dans le depot principal. Le Kanban versionne ne reinitialise pas les deplacements du navigateur utilisateur.

## Reprise active - 4 novembre 2026 : economie de tokens

AGENTS.md complete a la demande utilisateur : modele disponible et effort les plus economes compatibles avec les criteres du lot, lectures ciblees, aucun changement de modele pretendu ni controle essentiel supprime. Configuration globale non modifiee. Prochain lot recommande : corriger le faux positif lexical Jupiter et preparer les annotations/controles de troncature avant A5; ce lot n est pas execute par cette mise a jour documentaire. Les resultats A4.3 ci-dessous restent inchanges.

## Reprise active - 4 novembre 2026 : A4.3 comparaison locale terminee

Comparaison E5/lexical effectuee sans ingestion distante : 16 cas de reglage, 22 validation, 15 references/controles diagnostiques. Seuil 0,84 choisi seulement sur reglage. Validation synthetique 16/22 lexical, 19/22 vectoriel; sur corpus reel 14/15 chacun, mais le vectoriel perd la source de verite retrouvee par le lexical. Jupiter reste un faux positif lexical preexistant, non corrige. Hybride non evalue faute de complementarite sur reglage. [Rapport, protocole et preuves](RAG_COMPARAISON_A4_3_2026-11-04.md).

Recommandation : conserver le lexical dans le produit; vectoriel experimental seulement. 629 passages autorises calcules localement; huit tronques a 256 tokens, citations completes preservees. Deux essais donnent les memes 106 couples cas/methode. 29 tests Node PASS; historique 12/12 PASS; controle Jupiter conserve en echec documente. Pas de mesure de pertinence universelle, performance Supabase ou audit reseau.

A4.3 et parent A4 termines pour les criteres S2 de qualification/recette/comparaison; cela ne vaut ni ingestion operationnelle, ni orchestration A5 ou architecture agentique terminee. Supabase non appele, aucun changement du schema ou du site. Prochaine etape : annotation humaine des passages reels, nouveaux controles independants et traitement de troncature avant toute integration applicative autorisee.

Checkout C:/Users/cashe/Documents/GYM-rag-comparison-20261104. Kanban versionne actualise, session navigateur non reinitialisee ni synchronisee automatiquement. Etat Git et preservation des brouillons dans delivery-private/rag-comparison-git.json du depot principal. Aucun deploiement Netlify.

## Reprise active - 4 novembre 2026 : reconciliation Git autorisee

Demande utilisateur explicite : regler la divergence. Fusion des 52 commits locaux et neuf commits distants sur design/refonte-progressive-lot1, sans rebase ni force-push. Quatorze fichiers en conflit examines; adaptations recentes conservees, calendrier prive, onglets accessibles et chargement autoritatif distant integres. [Rapport et preuves de synchronisation](RECONCILIATION_GIT_2026-11-04.md). Aucun deploiement demande ou lance.

Les modifications non commitees du dossier principal restent hors du commit de fusion. Sauvegardes privees et manifeste de preservation dans C:/Users/cashe/Documents/GYM-git-reconcile-20261104/delivery-private/preservation/. Etat Git final et SHA distant confirmes dans delivery-private/reconciliation-final.json du depot principal; ne pas annoncer une synchronisation avant cette verification. Les anciens constats de divergence ci-dessous sont historiques apres cette livraison.

## Reprise active - 4 novembre 2026 : A4.2 recette Supabase terminee

Autorisation utilisateur oui executee sur getyourmentor-preprod (pqxqqbwesfrefzjoawmx) uniquement. Repetition transactionnelle PASS, rollback du schema verifie, puis schema prive gym_rag_s2 cree et recette persistante PASS. Trois tables RLS, vector(384), fonction SECURITY INVOKER; anon/authenticated refuses et service_role autorise sans droit de reetiqueter les collections. Controle final independant : trois tables vides, pas d exposition Data API, empreinte historique colonnes/types/OID/ACL/RLS inchangee. Aucune ingestion privee, lecture de lignes historiques ou modification metier. [Rapport, preuves et limites](SUPABASE_PGVECTOR_S2_2026-11-03.md).

A4.1 et A4.2 termines dans leurs perimetres bornes; A4.3 comparaison lexical/vectoriel reste a faire. Parent A4 en cours. Assistant applicatif toujours lexical, aucun connecteur vectoriel ou LangGraph active. Aucun deploiement Netlify ou changement de plan. Preuves reelles et SQL executes : docs/assets/rag-s2-remote-2026-11-04/. Controle d acces SQL effectif, pas de garantie de pertinence ou de charge.

Checkout C:/Users/cashe/Documents/GYM-s2-recipe-20261104. Kanban versionne mis a jour, vues navigateur non reinitialisees et aucune synchronisation automatique revendiquee. Git : delivery-private/s2-recipe-git.json, divergence connue preservee. Prochaine action : A4.3 sur donnees synthetiques/locales; aucune ingestion distante de documents internes sans autorisation specifique.

## Reprise active - 4 novembre 2026 : A4.1 qualifie, A4.2 attend l autorisation distante

Projet Supabase getyourmentor-preprod disponible. Transaction READ ONLY executee : pgvector 0.8.2 dans public, gym_memory prive non expose API, neuf tables RLS, ancien embedding vector(1536), schema gym_rag_s2 absent. anon/authenticated/service_role sans USAGE ni SELECT sur la memoire historique; aucun droit historique modifie. Variables Netlify actives et raccordement public non verifies. [Rapport detaille et application proposee](SUPABASE_PGVECTOR_S2_2026-11-03.md).

A4.1 termine pour la qualification locale bornee : modele E5 quantifie, revisions/hashes figes, 384 dimensions normalisees, cinq entrees synthetiques, 256 tokens maximum, pic processus 521 Mio. Aucun corpus prive ou appel payant. A4.2 bloque sur autorisation specifique pour schema prive et recette synthetique; A4.3 non termine. Proposition corrigee, tests de refus de roles et rollback schema vide prepares, SQL/PLpgSQL analyses mais non executes en ecriture. Preuves assets/supabase-pgvector-s2-2026-11-04/. Aucun deploiement ou changement metier.

Checkout C:/Users/cashe/Documents/GYM-s2-qualification-20261104. Kanban versionne actualise; aucune remise a zero des vues navigateur ou synchronisation manuelle locale revendiquee. Git : delivery-private/s2-qualification-git.json, divergence connue preservee. Prochaine action : decision specifique de l utilisateur sur la proposition distante; ne pas confondre connexion et autorisation de migration.

## Reprise active - 3 novembre 2026 : Supabase connecte, recette en restauration

Session verifiee, projet getyourmentor-preprod retrouve (pqxqqbwesfrefzjoawmx), organisation FREE. Projet en pause remis en service par Resume project; interface affiche Restoration in progress. Fin et disponibilite non confirmees. Aucun SQL, changement de schema ou ingestion distante. Attendre la disponibilite puis verifier extension pgvector, schemas, droits et raccordements en lecture seule. [Compte rendu actualise](SUPABASE_PGVECTOR_S2_2026-11-03.md#connexion-et-restauration---3-novembre-2026-vers-17h10-europemadrid). GYM-A4.2 reste bloque; aucun test vectoriel ou modele qualifie. Git : preuves locales dans delivery-private/s2-connection-git.json, divergence existante preservee.

## Reprise active - 3 novembre 2026 : S2, Supabase + pgvector uniquement

Decision utilisateur : Supabase + pgvector, sans SQLite ni autre base vectorielle. Projet de recette distinct confirme par l'utilisateur; navigateur Supabase redirige vers la connexion, intervention demandee. Proposition SQL privee additive et recette synthetique avec rollback preparees, non appliquees. Schema historique vector(1536) preserve; dimension 384 candidate non qualifiee. GYM-A4.2 reste bloque, aucune inference ou base distante testee. [Rapport et ordre de reprise](SUPABASE_PGVECTOR_S2_2026-11-03.md).

Syntaxe SQL externe analysee avec pglast 7.22 (corps PL/pgSQL non valides), 26/26 tests Node et 12/12 evaluations historiques PASS. Preuves dans assets/supabase-pgvector-s2-2026-11-03/checks.json. Aucune migration, ingestion distante, activation produit ou modification des services metier. Connexion seule ne vaut pas autorisation de migration distante. Checkout de preparation C:/Users/cashe/Documents/GYM-vector-index-20261103. Etat Git final dans delivery-private/supabase-pgvector-s2-git.json; ne pas contourner la divergence connue.

## Reprise active - 3 novembre 2026 : deux regressions RAG corrigees

Restitution de plusieurs passages par document, diversification puis complements et admission avant classement : deux regressions de la revue corrigees. Budget : 8 passages, 7200 unites JS de texte, 3 passages/document. 26/26 tests Node et 12/12 evaluations de reference PASS. Nouveaux controles 2/3 : faux positif Jupiter preexistant conserve en echec, pas de garantie semantique generale. [Rapport, preuves et limite ouverte](RAG_REGRESSIONS_CORRIGEES_2026-11-03.md).

Apercu reel http://127.0.0.1:4325/, checkout `C:/Users/cashe/Documents/GYM-rag-fixes-20261103`, relance `node tools/agentic-workbench/server.mjs`. SHA256 des fichiers HTTP compares au disque, API comparee au moteur local. Kanban et preservation/export des anciens deplacements verifies dans des contextes Playwright distincts (1440/390), sans reinitialiser la session utilisateur. Preuves ajoutees a GYM-A3/A3.2, prochains travaux de pertinence indiques. Aucun modele, embedding, fournisseur, migration, deploiement ou changement metier. Etat Git final dans le delivery-private du checkout ; divergence existante non contournee.

## Revue croisee - 3 novembre 2026 : changements depuis 15h50

Commits ee2e1b3 / 1e3f840 relus, 20/20 tests Node et 12/12 evaluations reproduits. Deux limites P2 reproduites hors des tests actuels : une seule citation par document masque des passages contradictoires ; un terme rare peut provoquer une abstention malgre des candidats a meilleure couverture. [Rapport et reproductions](REVUE_SESSION_2026-11-03.md). Pas de correction applicative ou de reinitialisation du Kanban dans cette revue ; apercu 4325 non joignable lors du controle. Les 18 fichiers anterieurement modifies gardent les memes empreintes. Les constats sont a traiter avant de revendiquer une qualite de recherche generale.

## Reprise active - 3 novembre 2026 : GYM-A3.2, controles RAG

Evaluation historique 8/8 et nouvelle suite 12/12, citations exactes et abstentions verifiees ; tests Node 20/20. Voir [rapport et preuves](RAG_GATES_2026-11-03.md). GYM-A3.2 termine localement, parent GYM-A3 derive de ses enfants. Workflow GitHub manuel deja raccorde, aucun run distant lance. Prochaine action GYM-A4.1 : qualification, sans installation ou migration implicite. Kanban du navigateur 4325 non synchronise ni reinitialise ; modifications anterieures preservees. Etat Git final dans delivery-private/rag-gates-20261103-git.json.

## Reprise active — 3 novembre 2026 : Kanban en couloirs

Nouvelle consigne visuelle utilisateur appliquee : tableau a lignes par lot, post-it compacts colores, fiche de ticket, glisser-deposer et statut modifiable au clavier/tactile. Source : 18 tickets dont 13 sous-tickets, cinq couloirs parents ; huit etapes conservees. Apercu courant http://127.0.0.1:4325/, checkout `C:/Users/cashe/Documents/GYM-kanban-20261103`, relance `node tools/agentic-workbench/server.mjs`.

17/17 tests Node PASS ; Playwright 1440/390 : filtres, deplacement, rechargement, limite de cloture, preuve manuelle, export JSON, tactile et clavier verifies. Changements en localStorage de ce navigateur seulement, pas de synchronisation Git/Jira, pas de preuve automatique inventee. [Rapport, limites et controles](KANBAN_SWIMLANES_2026-11-03.md). Les vues precedentes sont historiques. Aucun deploiement ou service externe, divergence Git preservee sans contournement ; empreintes des modifications anterieures controlees. RAG et services metier inchanges.

Compl?ment Git/contr?les du lot Stripe-Telegram : commit applicatif local `38dd18e`, push refus? non-fast-forward, distant `d50b9eb` inchang?. Build/TypeScript du checkout isol? PASS ; contr?le global du dossier principal bloqu? par les anciennes copies sous `playwright-artifacts`, pr?serv?es. Test Telegram portable 2/2 PASS apr?s la suite compl?te 20/20. Voir le rapport pour les preuves et les essais externes encore bloqu?s.

## Reprise active ? 3 novembre 2026 : Stripe TEST et Telegram

Lot local contr?l? : connecteur Stripe limit? au test, webhook renforc?, donn?es de paiement serveur, association Telegram facultative et file priv?e d?dupliqu?e. **20/20 contr?les cibl?s PASS**, build/TypeScript, fronti?re client et configuration Netlify PASS. Les appels Stripe et messages Telegram sont simul?s dans les tests ; aucun essai externe ni durabilit? Stripe apr?s red?marrage n'est confirm?. L'utilisateur dispose des deux services ; saisie locale des acc?s encore attendue, r?ception des webhooks et destinataires de recette ? raccorder. Migration Telegram pr?par?e, non appliqu?e. Aucun d?ploiement ou paiement r?el.

Aper?u http://127.0.0.1:3005/ (recette locale sans acc?s externe), checkout `C:/Users/cashe/Documents/GYM-stripe-telegram-20261103`, relance `node gym-next/scripts/run-test-preview.cjs`. [Rapport, contr?les, configuration s?curis?e et limites](STRIPE_TELEGRAM_2026-11-03.md). Push initial refus? non-fast-forward, aucun contournement ; ?tat Git final dans les preuves du rapport. Les anciens travaux hors du webhook et de son test r?employ?s sont pr?serv?s. Prochaine action indispensable : configuration locale, transfert des ?v?nements et v?rification du stockage persistant avant essais r?els de test.

# Reprise opérationnelle — GetYourMentor

## Footers partagés — 3 novembre 2026 : titre et flèche regroupés

Chevron à 8 px de « Disciplines », titre et flèche dans une commande native commune ; quatre sports visibles, dix dépliables. Footer commun déjà réutilisé sur les pages actives : correction propagée via `SiteFooter` sans duplication ou réactivation de prototypes. **25 parcours/variantes × 1440/390 : 50 observations**, 48 avec un footer identique et 2 vues de galerie sans footer volontairement. Contenus, couleurs/police, clavier, ouverture/repli, écart 8 px et absence de débordement vérifiés. Comptes anonymes/paiement sans référence valide seulement ; administration 404 protégée. [Inventaire, preuves et limites](FOOTERS_UNIFIES_2026-11-03.md). Build/type, frontière client et Netlify PASS ; aperçu 3004, session 43318. Aucun déploiement ; changements antérieurs préservés.

## Intention corrigée — 3 novembre 2026 : footer compact repliable

La dernière consigne remplace la grille précédente : quatre sports visibles par défaut, dix autres dépliables via une petite flèche à côté de « Disciplines ». Une colonne et aucune ligne supplémentaire pour le contrôle en mode fermé ; autres rubriques préservées. `details/summary` natif, clavier et liens masqués hors Tab. [Rapport et contrôles](FOOTER_DISCIPLINES_REPLIABLE_2026-11-03.md). Aucun déploiement ; aperçu local sur 3004, checkout/lanceur existants. La section suivante décrit une version historique désormais remplacée.

Build/type, frontière client et Netlify PASS. Clic/Entrée/Espace, quatre puis quatorze liens visibles, ordre/destinations préservés, liens cachés hors Tab et absence de débordement vérifiés à 1440/768/390/320. Captures dans `assets/footer-fold-2026-11-03/`, serveur session 62808.

## Footer ciblé — 3 novembre 2026 : disciplines alignées

Rubrique « Disciplines » du footer actif convertie en grille commune à deux colonnes, titre sur toute la largeur et liens alignés en haut de leurs lignes. Quatorze libellés/destinations et ordre du catalogue conservés ; une colonne sous 481 px pour la lisibilité. Autres rubriques et animations inchangées. [Rapport, captures et contrôles](FOOTER_DISCIPLINES_2026-11-03.md). Checkout de recette et lanceur sur 3004 réutilisés. Aucun déploiement Netlify ; changements antérieurs non vérifiés préservés.

Build/type, frontière client et configuration Netlify PASS ; géométrie et absence de débordement vérifiées à 1440/768/390/320. Sept paires alignées en haut, quatorze libellés/liens inchangés et quatorze destinations HTTP 200. Captures avant/après dans `assets/footer-disciplines-2026-11-03/`. Serveur session 22015 ; divergence Git antérieure conservée.

## Accueil plus fourni — 3 novembre 2026 : neuf cartes locales

Sur demande utilisateur, les six nouveaux portraits fictifs sont maintenant ajoutés à l'éventail de l'accueil en recette locale, avec les trois profils existants : neuf cartes distinctes. Pas de comptes coachs créés, tarifs/avis/diplômes inventés ou image réattribuée à une personne réelle. Cartes explicitement fictives et détail de portrait sans réservation. Activation protégée par `isLocalPortraitPreview` ; API catalogue toujours bornée, illustratifs séparés des profils réels, aucune addition sur catalogue vide/erreur. [Rapport et contrôles](ACCUEIL_NEUF_CARTES_2026-11-03.md). Aperçu http://127.0.0.1:3004/#mentors, checkout et lanceur précédents réutilisés. Aucun déploiement Netlify, nouvelle génération ou crédit d'image requis. Attendre la revue utilisateur.

Build, typage, frontière client et Netlify PASS ; **28 tests ciblés PASS** (14 ordinateur/14 mobile). Contrôle des neuf cartes, six liens de détail et captures 1440/390/320 PASS ; preuves `assets/home-nine-coaches-2026-11-03/`. Serveur local session 69737. Les tests et captures précédents à trois cartes sont historiques pour l'accueil.

## Intégration locale — 3 novembre 2026 : éventail et portraits

L'utilisateur a validé la proposition 03 : attente de choix ci-dessous levée pour l'éventail. Accueil des mentors adapté au composant circulaire `FanCarousel`, cartes carrées, aucun groupe de cinq ou face de remplissage. L'API d'aperçu reste bornée à six, l'annuaire complet reste accessible. Six portraits fictifs ImageGen créés et conservés avec prompts/originaux/WebP ; galerie séparée, aucun faux compte ni photo attribuée à un coach réel. Aperçu isolé : http://127.0.0.1:3004/#mentors et http://127.0.0.1:3004/demo-portraits. [Rapport, provenance, contrôles et relance](EVENTAIL_PORTRAITS_2026-11-03.md). Aucun déploiement ; attendre la revue utilisateur. Modifications antérieures préservées ; divergence Git existante non résolue.

Build, frontière client, configuration Netlify et secrets PASS. Suite ciblée **26/26 PASS** ; contrôle complémentaire **18 combinaisons PASS**, avec recoupements explicités. Portes mesurées à 2 200 ms ; galerie HTTP 404 hors recette. Six portraits retenus : CrossFit, padel, Pilates, musculation, boxe, préparation physique. Quatre essais hors catalogue archivés et écartés de la sélection finale. Serveur loopback session 39405. Preuves et limites dans le rapport.

## Choix visuel en attente — 3 novembre 2026 : carrousels larges

Trois démonstrations autonomes avec cartes carrées : anneau à N faces, ellipse panoramique et éventail horizontal. Sélecteur 3/8/12/20 cartes ; seuls trois profils de démonstration existants sont repris, les autres faces sont explicitement des emplacements de maquette. Aperçu http://127.0.0.1:4323/carousel-large-2026-11-03/ ; serveur statique loopback session 6899. [Périmètre, provenance, relance et limites](CARROUSELS_LARGES_2026-11-03.md). Contrôles et captures dans `assets/carousel-large-2026-11-03/`. Aucun remplacement dans l'application ni publication Netlify. Attendre le choix utilisateur avant intégration. Divergence Git préexistante conservée, aucun force-push ni fusion autorisés.

## Reprise active — 2 novembre 2026 : catalogue métier de 14 disciplines

Commit applicatif local d74e846506dac35c8ba577f37bf6c40c55803eb8. Push normal rejete non-fast-forward (code 1), distant relu inchange d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. Aucun force-push, fusion ou repetition identique. Diff binaire des vingt changements anterieurs toujours identique.

Dernière consigne exécutée **localement uniquement** : catalogue commun de 14 disciplines pour navigation, types, validations, recherche, filtres collectifs, aperçu mentors, récapitulatif, demandes coach, formulaire propriétaire et métadonnées. Alias historique conservé : URL `metiers-de-la-forme` / stockage `fitness`, URL `fitness` reconnue. Les valeurs inconnues ne retombent plus sur le football et n'effacent pas les filtres. Aucun coach ou créneau créé pour remplir les résultats.

Build final, TypeScript, contrôle statique du schéma, configuration Netlify et frontière client/serveur PASS. **74 scénarios ordinateur distincts validés en consolidant les relances, 23 scénarios mobile PASS**. Le premier passage 65 PASS / 8 FAIL est conservé ; les 29 cas concernés et le nouveau contrôle de formulaire sont PASS après corrections, sans additionner les relances. Les contrôles API utilisent seulement les fixtures locales et restaurent leur discipline d'origine. Portraits/scènes manquants : remplacement neutre, aucune scène d'un autre sport. Pentagone sans cadre et portes à 2 200 ms inchangés.

Aperçu laissé disponible : **http://127.0.0.1:3003/**, exemple `/recherche?sport=padel&city=Lyon`, session 37668. Checkout `C:/Users/cashe/Documents/GYM-sports-catalogue-20261102`, base `1cde67ec1feaa619d8c55e2645ecbade0261a825`, relance `node delivery-private/start-preview.cjs`. Environnement de recette isolé, aucune configuration de service externe héritée. Captures et résultats : `assets/sports-catalogue-2026-11-02/verification.json`.

Migration **préparée, non exécutée** : `supabase/migrations/20261102_expand_sports_catalogue.sql`, contraintes sport de `gym_coaches` et `gym_reservations`. Schéma de référence adapté, RLS et historiques inchangés. Vérifier le schéma distant et obtenir l'autorisation d'exécution avant toute application. La gestion de plusieurs disciplines structurées par coach reste hors de ce modèle ; il s'agit d'une discipline principale et du texte libre existant. [Diagnostic, catalogue, provenance et limites](SPORTS_CATALOGUE_2026-11-02.md).

Vingt modifications suivies antérieures exclues et conservées ; aucun achat, compte réel modifié, migration distante ou déploiement Netlify. **Le site public reste sur la livraison précédente décrite ci-dessous**. Statut Git dans les preuves. Prochaine action : revue de l'aperçu puis éventuelle autorisation séparée de migration/publication, sans lancement automatique d'un nouveau lot.

---

## Publication active — 2 novembre 2026 : liens et Netlify

Livraison documentaire locale 38bd49a ; push normal rejete non-fast-forward (code 1), distant relu inchange d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. La publication Netlify est reussie independamment. Aucun force-push, fusion ou repetition identique.

Sur autorisation utilisateur, dernier code validé publié sur **https://getyourmentor-demo-20261014.netlify.app**. Déploiement `6ae8a71262d2639172882244`, état `ready` et alias confirmés. Source applicative `4388ce24b996b5ba244fecbf74932505ebc51dbe` : pentagone sans encadré, profils enrichis, portes à 2,2 secondes. Les mentions « aucun déploiement » des étapes suivantes sont désormais historiques pour ce code.

Contrôle local : 228 pages/variantes et 456 liens ; après publication : **242 pages/variantes, 484 liens et 25 ressources**, aucune erreur inattendue, files d'attente épuisées. La 404 admin volontaire reste protégée. Cinq profils de démonstration préexistants en ligne contre trois en local ; aucune donnée de profil ou compte changée. Navigateur 1440/390, cinq faces, portraits/replis, fiche et fin de transition vérifiés. Health/API HTTP 200, mode démo isolé, noindex vérifié ; X-Robots-Tag absent. Aucun service réel activé.

[Rapport, périmètre et limites](LIENS_ET_PUBLICATION_NETLIFY_2026-11-02.md), preuves `assets/links-netlify-2026-11-02/verification.json`. Checkout de préparation `C:/Users/cashe/Documents/GYM-links-netlify-20261102`, source et paquet contrôlés avant publication. Vingt changements suivis antérieurs exclus, sauvegarde privée et comparaison du diff binaire identique. Git et Netlify sont deux états séparés ; statut du push dans les preuves. Prochaine action : revue du site public, puis traitement séparé de la divergence Git et des éventuelles améliorations de contenu. Aucun nouveau lot lancé automatiquement.

---

## Ajustement actif - 2 novembre 2026 : pentagone sans encadrement

Commit local 00d82d0 ; push normal rejete non-fast-forward, distant relu inchange d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. Aucun contournement ni nouvelle tentative identique.

Bordure, arrondi et fond du conteneur externe retires sur demande utilisateur. Cartes, commandes et rotation conservees. Build optimise PASS ; inspection navigateur apres rechargement a 1440 et 390 px : bordure 0 px, fond transparent, rayon 0 px, aucun debordement ; rotation 0 vers 1 verifiee. Pas de nouvelle suite complete pour ce changement CSS. Apercu reconstruit : http://127.0.0.1:3002/#mentors, session 30649 ; relance par le lanceur du checkout isole documente ci-dessous. Preuves : assets/mentors-integration-2026-11-02/border-removal-verification.json et without-frame-*.png. Aucun deploiement.

---

## Reprise active — 2 novembre 2026 : mentors enrichis et pentagone intégré

Dernière demande : intégrer localement le pentagone dans l'accueil et enrichir les profils selon les données réelles ; l'attente de validation du prototype dans la section précédente est levée pour cette première section seulement. Référence Lovable réellement consultée, carte et fiche comprises. Trois profils de démonstration + deux accès explicites au catalogue/recherche ; aucun coach inventé. Autres sections gardées en grille, parcours ou accès direct. [Rapport et provenance](MENTORS_PENTAGONE_2026-11-02.md).

Projection publique par liste positive, formats et présentation existants rendus visibles, diplômes déclarés conservés avec leurs réserves. Aucun nouveau schéma ni migration. Navigation des pages conservée à 2 200 ms. Captures avant/après, résultats réels, serveur et statut Git : `assets/mentors-integration-2026-11-02/verification.json`. Ne pas additionner les relances ni annoncer une conformité globale.

Recette ciblée : **35 cas ordinateur + 18 cas mobile PASS**. Dernier ajustement CSS des onglets de fiche : nouveau build et deux relances ordinateur/mobile PASS. Deux anciens tests métier en échec reproduits sur le build précédent ; suite globale non certifiée verte. Aperçu réel laissé ouvert sur **http://127.0.0.1:3002/#mentors**, mode recette isolé sans services distants ; rechargement et API mentors/séances HTTP 200 vérifiés. Relance et arrêt dans le rapport.

Commit applicatif local **b78278f51a0050ce478ab3b89863b6c5d216aee7**. Push normal réellement exécuté puis rejeté non-fast-forward (code 1), distant relu inchangé **d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a**. Complément documentaire sans tentative identique répétée. Vingt changements antérieurs conservés, diff binaire identique. Aucun déploiement.

Checkout isolé `C:/Users/cashe/Documents/GYM-mentors-integration-20261102`, base `731cc4ba03e57e98813e98359e8d3d7d09f0944e`. Vingt changements antérieurs exclus. Aucun déploiement, compte réel modifié, achat ou nouvelle dépendance. L'adaptation Lovable reste partielle : les données nécessaires aux offres, avis, classements et disponibilités ne sont pas inventées. Prochaine action : revue du rendu intégré, puis traiter séparément les écarts documentés et la divergence distante.

---


## Reprise active — 2 novembre 2026 : ralenti et prototype pentagonal

Ouverture réelle passée de 950 à **2 200 ms**, comme le mode Ralenti du prototype validé. Nettoyage de secours à 2 650 ms ; garde-fou de chargement, angles et autres comportements conservés. Nouveau prototype autonome à cinq faces, rotation manuelle sans fin dans les deux sens. Trois profils de démonstration existants + deux faces de parcours, aucun mentor inventé. [Rapport, inventaire et limites](PENTAGONE_RALENTI_2026-11-02.md).

**27 scénarios distincts PASS** : 16 de prototype desktop/tactile, neuf régressions de navigation et deux cas de focus. Build, typage, frontière client et Netlify PASS. Géométrie et CTA vérifiés à 320/390/768/1440 ; clavier, gestes synthétiques, portrait manquant et mouvement réduit. Échec intermédiaire à 320 corrigé ; relances non additionnées. Preuves : assets/pentagon-carousel-2026-11-02/verification.json. Aucun carrousel existant remplacé : attendre l'avis utilisateur.

Aperçu ouvert et laissé disponible sur **http://127.0.0.1:4321/** : serveur statique Python, loopback, dossier public du prototype uniquement, PID 17148 / session 37872. Fichier hors ligne : gym-next/public/design_assets/pentagon-carousel-2026-11-02/index.html avec ses trois images. Liens applicatifs désactivés dans cet aperçu autonome ; actifs seulement sous l'URL de l'application. Serveur Next de test arrêté. Arrêt/reprise du serveur statique documentés dans le rapport.

Branche design/refonte-progressive-lot1, base de7aec50b042f762b222880dba26a3ca55a17f04 ; vingt changements suivis antérieurs préservés. **Livraison applicative locale 0ceaf59** : push ordinaire exécuté puis rejeté non-fast-forward (code 1). Distant relu inchangé d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. Diff binaire des vingt changements antérieurs strictement identique à la sauvegarde du lot. Détails dans verification.json. Aucun agent, achat, nouvelle dépendance, fusion ou déploiement. Les sections suivantes décrivent les étapes précédentes.

---

## Reprise active — 2 novembre 2026 : navigation réelle avec portes 3D

Demande utilisateur : intégrer le prototype validé après un commit préalable. Point de retour **c29b8cd2c69674b385a1f258a70d96380bd447e7**, créé avant le code. Vingt modifications suivies antérieures préservées et exclues. [Rapport](NAVIGATION_PORTES_3D_2026-11-02.md).

Intégration locale terminée : battants -110°/+110°, 950 ms, vraie page entrante depuis le fond ; copies temporaires inertes dans Shadow DOM. Éléments fixes recalés après défilement. Layout antérieurement modifié, backend, prix et paiements inchangés.

**32 scénarios PASS : 23 desktop + 9 tactile Chromium émulé**, incluant quatorze régressions des animations précédentes. Build final code 0, typage, frontière client et configuration Netlify PASS. Historique, paramètres, formulaire de recherche vers Lyon, annulations, délai maximal de cinq secondes sur route lente, mouvement réduit et repli sans Navigation API. Échecs initiaux de sélecteur et défaut de position fixe corrigés avant recette finale. Preuves : assets/door-navigation-2026-11-02/verification.json ; environnements de recette expurgés des JSON.

Checkout détaché : C:/Users/cashe/Documents/GYM-door-navigation-20261102. Serveurs de test arrêtés. Branche design/refonte-progressive-lot1. Distant avant livraison : d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a, divergence préexistante ; résultat du push dans verification.json. Aucun déploiement. Sans Navigation API : liens et retour testés, animation de toutes les navigations document/programmatique non garantie. Aucun test Safari/Firefox, compte privé ou service réel revendiqué.

Livraison applicative locale : **4f30ecf1982c505e1ee9e125b50b195f35d4f4ad**. Push ordinaire exécuté puis rejeté non-fast-forward (code 1). Distant relu inchangé : d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a. Aucun contournement ni nouvelle tentative identique. Diff binaire des vingt modifications antérieures comparé à la sauvegarde : strictement identique. Dernière relance des dix-huit scénarios de navigation PASS après correction du sélecteur de fermeture de la bannière ; ne pas ajouter ces relances aux 32 scénarios distincts. Typage final rejoué PASS.

Suite : revue locale puis traitement séparé de la divergence avant synchronisation et tout déploiement. Les sections suivantes décrivent les étapes antérieures.

---

## Reprise active — 2 novembre 2026 : démonstration de transition en deux battants

Demande : **montrer** l'effet avant intégration. Prototype autonome avec captures locales de l'accueil et de l'annuaire démo, deux moitiés articulées sur les bords extérieurs et prochaine vue qui avance depuis l'arrière-plan. [Rapport et limites](DEMO_TRANSITION_PORTES_2026-11-02.md). Aucune transition installée dans la navigation réelle, aucun formulaire, compte ou paiement modifié.

Fichier `gym-next/public/design_assets/door-transition-2026-11-02/index.html`, avec ses quatre WebP voisins. Boutons Voir l’ouverture 3D / Rejouer / Changer sans animation, normal 950 ms et ralenti 2 200 ms. Pas d'autoplay ; action 3D explicite limitée à la démo si mouvement réduit. Échap, resize et arrière-plan terminent proprement ; données des vues fictives et captures non interactives.

Recette dans `C:/Users/cashe/Documents/GYM-equipment-entrance-20261102`, build applicatif précédent réutilisé avec BUILD_ID et sources vérifiés. **2 scénarios de capture + 4 scénarios de démo PASS**, TypeScript PASS. 390/1440 px, rotations opposées, recul/avancée, rangement final, rejeu/annulation/double déclenchement et fichier manquant. Premier échec de test : tentative de cliquer un bouton correctement indisponible ; assertion corrigée et suite finale PASS. Aperçu rejoué dans le navigateur : annuaire affiché, idle, zéro animation restante. Captures inspectées. Preuves `assets/door-transition-2026-11-02/verification.json`. Aucun nouveau build Next nécessaire pour HTML/images, aucune intégration réelle certifiée.

Base `d908ceb63098dd4e13b6c0e57a9ffb6a9d109e76`, branche unique `design/refonte-progressive-lot1`. Vingt modifications suivies antérieures préservées. Distant lu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence préexistante ; aucun pull/rebase/fusion/force-push, agent, paquet ou déploiement. Statut final du push dans verification.json et la livraison. Serveur temporaire de test arrêté automatiquement ; ouvrir le HTML depuis son dossier pour une revue sans serveur.

Commit de démonstration local `c6951824c37544d5059bb8aa8c0d88819e58c363`. Push normal réellement exécuté, rejet **non-fast-forward, code 1** ; distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Complément documentaire local sans tentative identique répétée. Contrôle des secrets indexés PASS, fichiers du prototype et preuves copiés dans le dépôt principal ; aucun changement de navigation réelle ni déploiement.

Suite : revoir la simulation. Une future demande d'intégration exigera de traiter la vraie navigation, le chargement des pages, retour/historique et focus ; cet essai ne les remplace pas. Les sections suivantes décrivent les réalisations précédentes.

---

## Reprise active — 2 novembre 2026 : arrivée et rebonds des objets

Demande : les objets photoréalistes arrivent des coins supérieurs, rebondissent dans la page visible puis rejoignent leur sport. [Rapport](ARRIVEE_OBJETS_2026-11-02.md). Accueil desktop au chargement après décodage ; mobile à la première ouverture Sports, une seule fois par montage de l'accueil. Autres pages sans séquence d'entrée. Durée de déplacement jusqu'à 2,6 s ; aucun nouveau visuel généré.

Source commune JS/TypeScript dans `public/design_assets/header-equipment-2026-10-30/entrance.js` ; intégrée aussi au HTML autonome. Rejouer l’arrivée dans `apercu.html`, activation volontaire si mouvement réduit. Objets décoratifs sans interception des clics ; annulation/restauration sur interaction, Échap, resize, scroll, arrière-plan, préférence réduite ou démontage. Textes, liens et mise en page fixes, aucun réglage Windows modifié.

Checkout `C:/Users/cashe/Documents/GYM-equipment-entrance-20261102`, base `a8ed20e9e904ae2195bf02b776bb7a193a7e6fb4`. Build/typage/configuration Netlify/frontière client réussis. Première inspection : regroupement trop central, trajectoires réparties ensuite ; contrôle visuel et build final réalisés. Résultats définitifs, captures et limites dans `assets/equipment-entrance-2026-11-02/verification.json` ; ne pas additionner les relances. Chromium/tactile émulé seulement, aucun moteur de collisions ou FPS garanti.

Contrôle final : nouveau build après répartition des trajectoires PASS, frontière client PASS ; six scénarios d'entrée desktop et ouverture mobile tactile rejoués PASS. **30 scénarios distincts PASS, 1 ignoré**, sans addition des relances. Dispersion mesurée, positions des liens inchangées, nettoyage vérifié. Aperçu connecté rejoué jusqu'au rangement : completed, aucun calque restant, 14 originaux visibles. Captures finales inspectées ; fichier HTML identique au module partagé pour le moteur d'entrée.

Branche unique `design/refonte-progressive-lot1`, vingt modifications suivies antérieures exclues. Distant lu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence préexistante conservée. Aucun agent, paquet, service payant, backend, déploiement, pull/rebase/fusion/force-push ou autre référence distante. État final de livraison à lire dans verification.json et la réponse finale. Serveurs temporaires de test arrêtés automatiquement ; aperçu local conservé sans serveur persistant.

Commit applicatif local `1492c4801e120195a797cd90b3ade8b14c9cfd82`. Push normal réellement exécuté : rejet **non-fast-forward, code 1**, distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Complément documentaire local pour consigner le résultat, sans nouvelle tentative identique. Secrets suivis/indexés PASS ; code et preuves copiés dans le dépôt principal, vingt modifications antérieures préservées. Aucun déploiement.

Suite : revue de l'aperçu final et traitement séparé de la divergence Git avant synchronisation ou publication. Les sections suivantes décrivent les lots précédents, pas une autorisation de déploiement.

---

## Reprise active — 2 novembre 2026 : icônes réalistes du header

Reprise du lot interrompu le 30 octobre : SVG remplacés par onze détourages réalistes pour quatorze sports, 40 px desktop / 36 px mobile. Dix originaux réutilisés, une raquette padel générée avec image_gen intégré ; alpha réel, 69 814 octets de dérivés WebP. [Rapport, prompt, provenance et limites](ICONES_REALISTES_2026-11-02.md). Textes, destinations, autres contenus et services métier préservés.

Checkout isolé `C:/Users/cashe/Documents/GYM-realistic-header-20261030`, base `09f0f7766f6a693dd5edfaf7a6b3b68d44141815`. Build interrompu non compté comme réussi ; nouveau build avec typage et contrôles frontière client/configuration Netlify réussis. Résultats définitifs des tests et captures dans `assets/realistic-header-2026-11-02/verification.json`.

Recette finale : **23 tests PASS, 1 ignoré** (survol desktop exclu du projet tactile) ; quatre largeurs, 14 images chargées, clavier, liens, mouvement réduit et régressions du menu/cartes. Captures inspectées, aucun service réel testé. Aperçu HTTP chargé dans le navigateur pendant la recette ; serveur temporaire arrêté automatiquement après les tests. Ouvrir le HTML local depuis son dossier pour une revue sans serveur, sans compter sur un lien localhost persistant.

Aperçu autonome sans serveur dans `gym-next/public/design_assets/header-equipment-2026-10-30/apercu.html`, à ouvrir depuis son dossier avec ses images. Inspecté via le serveur temporaire de recette : quatorze images chargées, rebond constaté après activation explicite dans l'aperçu. Le navigateur de contrôle refuse file:, sans changement de protection ; pas de serveur persistant créé, réglages Windows inchangés. Le contrôle d'animation de cet aperçu ne modifie pas la préférence du site.

Branche unique `design/refonte-progressive-lot1`, vingt modifications suivies antérieures exclues. Distant relu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a` ; blocage non-fast-forward préexistant. Aucun pull/rebase/fusion/force-push, agent, déploiement ou paiement. Code local, code poussé et site public restent des états distincts. État final de livraison dans verification.json et la réponse de livraison.

Livraison applicative locale `281bd9e57475a0761959e5b1b310a5b20110a151`. Push normal réellement exécuté puis rejeté **non-fast-forward, code 1** ; distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Complément documentaire local pour tracer le résultat, sans tentative identique répétée. Contrôle des secrets suivis/indexés PASS et index ciblé vérifié. Aperçu, assets et preuves copiés dans le dépôt principal ; fichiers antérieurs préservés, aucun déploiement.

Suite : revue de l'aperçu, traitement séparé de la divergence Git avant synchronisation/publication. Les sections suivantes décrivent les lots antérieurs et leurs limites historiques.

---

## Reprise active — 30 octobre 2026 : animations ludiques

Demande : adapter les effets vidéo aux sports du header, cartes coachs et panneau droit. [Réalisation et limites](ANIMATIONS_LUDIQUES_2026-10-30.md). Factory conservé. Pictogrammes sportifs réactifs, relief/reflet des portraits accueil et annuaire, ouverture en éventail. Texte et zones cliquables fixes ; mouvement réduit sans effets décoratifs. Aucun paquet, agent, génération IA ou service payant ajouté.

Recette isolée `C:/Users/cashe/Documents/GYM-motion-20261030`, base `7688873edb5df20b98d3e57efea46ea7fb7bb472`. Build optimisé avec typage réussi ; avertissements CSS préexistants. Rapports finaux et captures : `assets/playful-motion-2026-10-30/`. Premier passage 23/24 : test tactile préexistant corrigé pour utiliser baseURL plutôt que le port 4320 en dur. Second build couvre l'annuaire. Les nombres définitifs sont dans verification.json, sans addition des relances.

Git : branche unique `design/refonte-progressive-lot1`, vingt modifications suivies antérieures exclues ; aucun reset/pull/rebase/fusion/force-push. Divergence initiale 12 commits locaux / 9 distants, distant confirmé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Push ordinaire requis ; ne pas créer une autre référence pour contourner le rejet préexistant. État final à lire dans verification.json et la livraison. Aucun déploiement : le site Netlify n'est pas actualisé par ces effets.

Suite : revoir l'aperçu local, puis traiter séparément la divergence Git avant synchronisation du chantier et toute publication. Les anciennes prochaines étapes ci-dessous sont historiques ; les règles métier, consentements et données restent protégés. Pas de validation de services réels ou d'accessibilité exhaustive annoncée.

Résultat final du lot : **33 scénarios distincts PASS, 1 ignoré** (survol réservé au desktop dans le projet tactile). Détail, journaux et captures dans verification.json. Serveurs de test terminés ; lancement d'un aperçu persistant refusé par le contrôle automatique (« blocked by policy », sans détail), aucun contournement. Revoir les captures locales avant toute mise en ligne ; l'onglet localhost de la recette ne dispose plus d'un serveur actif.

Livraison applicative committée : `8ac6949212c36523630a0e04a9e70b9dc426e470`. Push ordinaire réellement exécuté, rejeté **non-fast-forward, code 1** ; distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Complément documentaire local pour archiver ce résultat et normaliser les journaux en UTF-8 sans espaces terminaux. Pas de nouvelle tentative identique, fusion ou déploiement. Le code et les preuves restent locaux, les changements antérieurs restent préservés.

---

> Arrêt demandé le 28 octobre 2026 : serveur Playwright local `node.exe` PID 12236 et console enfant PID 1756 arrêtés. Inventaire des processus comparé aux chemins du dépôt et de ses worktrees : aucun autre processus GetYourMentor identifié après arrêt ; aucun écouteur sur 3000/3001/4320/4321. Autres applications préservées, aucun serveur relancé ni déploiement distant modifié. Cette opération ne change pas le code ni les résultats de recette ci-dessous.

## Reprise active — 28 octobre 2026 : aperçu des séances collectives

Un seul lot réalisé, sans agent supplémentaire ni déploiement : « Entraîne-toi à plusieurs » ajouté après les mentors, Factory conservé. [Audit, architecture, contrôles et limites](APERÇU_COLLECTIF_2026-10-28.md).

- Aperçu public de trois séances maximum **pour deux participants**, tarif total du coach, créneau daté Europe/Paris, capacité totale distincte des places restantes. Grille courte responsive, pas de carrousel supplémentaire ni d'image/profil inventé. Chargement/erreur/réessai/vide, aucun faux remplissage.
- `GET /api/sessions/preview` démo isolée uniquement, `no-store`, DTO public validé ; moteur de places existant réutilisé. Au plus 24 offres candidates projetées ; stockage démo toujours monolithique, catalogue/détail existant non paginé. Supabase collectif non raccordé, aucune preuve distante ni déploiement de ce lot.
- « Voir tout » → `/seances?participants=2` ; carte → `/seances?participants=2&offer=ID`, une séance sélectionnée ou état indisponible, retour avec critères, réservation existante. Double consentement recontrôlé pour les offres structure dans le catalogue et la demande. Filtres collectifs corrigés à quatre disciplines métier ; header de découverte à quatorze entrées inchangé. Montant serveur et acceptation avant paiement simulé conservés, pas de modification des historiques/commission.
- 16 scénarios distincts validés : neuf nouveaux + sept régressions mentors/affiliations/participants/capacité. Largeurs 320/390/768/1440, clavier, tactile Chromium émulé/mouvement réduit, menu/cookies/footer, indisponibilité/erreur, API locale publication/réservation/épuisement/prix total/refus paiement prématuré. Typage standard isolé/build/frontière client-secrets validés ; avertissements CSS préexistants. Sélecteur de test Discipline corrigé après quatre échecs initiaux, relance des neuf scénarios PASS. Captures de fixtures uniquement dans `docs/assets/collective-preview-2026-10-28`.
- Vérification isolée `C:/Users/cashe/Documents/GYM-collective-preview-20261028`, base `c881b6ebafb264d9978776aadb688a42f4075c93`. Vingt fichiers suivis modifiés et 79 entrées non suivies antérieurs préservés hors commit, 47 anciens worktrees conservés plus le checkout de recette. Aucun reset/pull/rebase/fusion/force-push. Le statut final du commit/push est indiqué dans la livraison ; distant de départ confirmé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence 9 locaux / 9 distants. Déclencheurs GitHub push hors branche de chantier ; aucune commande de déploiement.
- Livraison applicative : commit `2602624bb56322de6280305619a70107c5388c2e`. Push normal exécuté puis **rejeté non-fast-forward (code 1)** ; distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence 10 locaux / 9 distants après ce commit. Complément documentaire ciblé pour tracer ce résultat, sans nouvelle modification applicative. Index vidé par le commit, vingt fichiers suivis modifiés et 79 entrées non suivies antérieurs conservés. Serveur temporaire de recette arrêté ; aucun déploiement.
- Prochaine action : revoir cet aperçu local puis qualifier une seule autre rubrique Lovable et ses données. Avant ouverture du collectif hors démo : dépôt paginé, contrat catalogue/détail partagé et recette sur backend cible. Ne pas inventer proximité, popularité, disponibilité ou promotions. Le site Netlify n'est pas actualisé par ce lot ; dernier déploiement documenté ci-dessous, pas de nouvelle recette distante.

Les blocs suivants décrivent les lots antérieurs, pas l'état actif de ce lot.

## Reprise active — 28 octobre 2026 : pilote cartes et carrousel mentors

Demande exécutée : un seul aperçu « Tous les mentors » sur l'accueil, Factory conservé, sans agent ni déploiement. [Rapport, architecture, preuves et limites](CARROUSEL_MENTORS_2026-10-28.md).

- Implémenté localement : `MentorPreviewSection`, `CenteredCarousel` réutilisable, carte centrale échelle 1 contre .94 sur les côtés, scroll/snap natif, clavier/Home/End, souris/tactile, extrémités centrées, redimensionnement et mouvement réduit. Pas de boucle/clones ni de nouvelles sélections inventées. Voir tout → `/coachs`, carte → `/coach` avec ID/sport/ville ; parcours existant vers créneau préservé.
- API `GET /api/coaches/preview` : maximum six profils vérifiés, projection publique, no-store, chargement/erreur/réessai/vide. Trois profils démo disponibles et portraits stables déjà existants réutilisés ; aucune génération IA. Notes/disponibilités/promotions non qualifiées non affichées. Supabase : requête bornée testée avec fetch simulé, pas de recette réelle. Netlify Blobs : lecture monolithique du dépôt existant, à optimiser séparément si le catalogue grandit.
- Vérifié : 27 scénarios distincts validés, sans addition des relances (10 carrousel/API + 8 navigation + 9 images/recherche/annuaire). Quatre largeurs, clic des cartes latérales, extrémités, six cartes/commandes rapides, redimensionnement, souris, tactile Chromium émulé. Typage standard/build/frontière client-secrets PASS. Geste tactile réparti sur 200 ms après un échec du geste sans durée ; deux relances ciblées PASS. Contrôle complémentaire menu/cookies/focus/footer à 390 PASS. Captures et manifeste dans `docs/assets/mentor-carousel-2026-10-28`.
- Code et tests contrôlés dans `C:/Users/cashe/Documents/GYM-mentor-carousel-20261028`, base `6dbfbe5cd5d7e044b25a80570adbff1db4d74f36`, aucune copie du travail antérieur non vérifié. Les vingt fichiers suivis modifiés et 79 entrées non suivies antérieurs restent hors commit. Checkout et preuves conservés pour revue ; serveur temporaire arrêté avant livraison.
- Git : branche `design/refonte-progressive-lot1`, divergence initiale 8 contre 9. Commit ciblé local réalisé (`feat(discovery): add bounded Factory mentor preview and centered carousel`) ; push normal exécuté et rejeté non-fast-forward (code 1), distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Déclencheurs GitHub lus, aucun pull/reset/rebase/fusion/force-push. Index vide après livraison, vingt fichiers suivis modifiés et 79 entrées non suivies antérieurs préservés.
- **Non déployé.** API Netlify relue : alias toujours sur source `13420fc9d70f9b3db4c8a1f15c0228e44b3570bb`, deploy `6ae222c8945ea53de42c83b9`, ready. Le nouveau carrousel n'est pas validé à distance. Lovable rouvert en lecture seule mais preview inexploitable ; audit archivé réutilisé dans sa portée, aucun backend supposé.
- Suite : revue du pilote, puis aperçu collectif distinct relié aux offres/capacités réelles ; qualifier les nouveaux profils/sports avant de générer leurs portraits IA. Ne pas transformer ce catalogue général en proximité/popularité/soir/nouveautés sans données.

Les sections suivantes sont les relais des lots antérieurs.

## Reprise active — 28 octobre 2026 : Factory global et publication Netlify autorisée

Demande actuelle : harmoniser les pages, puis publier sur le site Netlify existant. Autorisation explicite de publication sur la démo isolée `https://getyourmentor-demo-20261014.netlify.app`, site `86e0379e-4d1a-4cf0-936c-1439397354f4` confirmé via API ; aucun autre site ou service commercial. [Périmètre, preuves et limites](FACTORY_HARMONISATION_NETLIFY_2026-10-28.md).

- Terminé localement : Factory global, surfaces et champs comptes/paiement/collectif/contenus/suivi/footer, récupération et 404, header des pages légales/admin. Les fonctions métier, droits et historiques sont conservés. Pas de nouveaux carrousels, sections ou images dans ce lot.
- Contrôles locaux finaux : 16 tests présentation/navigation PASS (39,4 s), 9 régressions images/recherche/annuaire PASS (14,2 s), build avec vérification des types PASS, configuration Netlify/frontière client-secrets/secrets suivis PASS. 24 routes/états à quatre largeurs ; trois espaces connectés à deux largeurs. Captures inspectées, 23 fichiers applicatifs du lot comparés au checkout isolé. Limites : recette locale d'acceptation, pas audit intégral ni preuve d'authentification de production.
- Checkout isolé `C:/Users/cashe/Documents/GYM-factory-unification-20261028` ; aucun changement antérieur non vérifié copié pour la publication. Les changements non vérifiés des vingt fichiers suivis et 79 entrées non suivies antérieurs restent hors lot. La page `/demo`, DemoBanner et account-ux restent locaux ; seul le noindex du layout a été revérifié puis intégré séparément, avec la couleur navigateur Factory.
- **Publié et vérifié** : source `13420fc9d70f9b3db4c8a1f15c0228e44b3570bb`, deploy `6ae222c8945ea53de42c83b9`, état ready et alias public confirmés via API Netlify. BUILD_ID `A-MH42y-VpWPSvFkYQNQ6` à lire dans le manifeste de preuves pour sa valeur exacte ; ne pas réutiliser un ancien paquet. Préparation et publication séparées, 24 empreintes applicatives conformes aux blobs Git. Aucun autre service activé.
- Git reste divergent : push final normal exécuté et rejeté non-fast-forward (code 1), distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Aucun pull/rebase/fusion/force-push. Publication Netlify réussie séparément. Sources et preuves commitées localement ; index vide, changements antérieurs non vérifiés des vingt fichiers suivis et 79 entrées non suivies préservés.

Correction après première publication : source `c6a798c`, deploy `6ae2203ef18d4f413b7c1f6b` ready, health/robots PASS, mais meta noindex absente sur l'accueil. Corrigé dans la source finale `13420fc` et seconde publication ci-dessus. Typage et build Netlify/frontière client PASS ; HTML générés accueil/plan/404 et couleur navigateur contrôlés avant publication. Recette finale distante : health démo ready et robots PASS, 8 routes/états anonymes + compte coach connecté PASS, noindex/couleurs/responsive à 390 px, menu clavier/focus, aucune erreur JavaScript ni image chargée cassée sur ce périmètre. Compte coach contrôlé à 1440 px. Une seule connexion au fixture démo, aucune mutation métier réelle. Capture menu refaite après stabilisation de l'animation : x=44, largeur=346 pour viewport 390. Captures distantes inspectées ; preuves `docs/assets/factory-pages-2026-10-28/verification.json`. Administration activée et recette distante exhaustive restent hors périmètre.

Les reprises suivantes décrivent les lots antérieurs.

## Reprise active — 28 octobre 2026 : premier lot navigation Factory

Arbitrage utilisateur prioritaire : contenus/parcours vérifiés Lovable, thème Factory anthracite/orange conservé, header local adapté, images IA locales prioritaires et panneau droit validé. Anciennes directions violet/quatre disciplines remplacées dans ce périmètre ; protections métier, historiques et autorisations conservés. [Rapport, matrice et limites](REFONTE_NAVIGATION_FACTORY_2026-10-28.md).

- Point de retour préalable : commit `b9a025ea33611103e420c72cb558208e878332c2`, tag **local** `checkpoint/avant-refonte-lovable-2026-10-28`. Patch des changements suivis antérieurs conservé hors dépôt, mais pas d'archive des fichiers non suivis. Push du checkpoint rejeté non-fast-forward.
- Implémenté : header commun Factory, quatorze entrées sportives et routes de recherche/annuaire avec états vides honnêtes, retrait du bouton coach des headers actifs, choix sportif/coach/structure via Mon compte avec contexte réservation préservé. Modèle métier de création/réservation encore limité aux quatre sports historiques.
- Menu global droit s'ouvrant à gauche, flèche seule au repos, sept destinations réellement existantes, clavier/Échap/focus et blocage du scroll. Les futures rubriques ne sont pas reliées artificiellement à des ancres absentes.
- Cloche : dialogue d'accès au compte uniquement, sans faux compteur. Prévisualisation Lovable inexploitable à la reprise : son flux de notifications n'est pas vérifié ni reproduit. Pas d'envoi réel.
- Vérifié localement dans `C:/Users/cashe/Documents/GYM-navigation-refonte-20261028` : build optimisé, typage standard et frontière client/serveur PASS ; 8 scénarios navigation + 9 régressions images/recherche/annuaire PASS. Largeurs 320/390/768/1440, six routes pour les scénarios responsive, captures dans `docs/assets/navigation-refonte-2026-10-28`. Sources applicatives comparées au checkout de contrôle. Aucune recette production/Supabase revendiquée ; amorçage des comptes inconnus du mode d'acceptation local historique à qualifier séparément.
- Git : branche `design/refonte-progressive-lot1`, vingt fichiers suivis et soixante-dix-neuf entrées non suivies antérieurs préservés hors commit. Distant connu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence conservée, aucun pull/rebase/fusion/force-push. Déclencheurs GitHub lus avant push ; réglages Netlify distants inconnus, aucun déploiement commandé.
- Prochain lot borné : modèle de carte/carrousel avec carte centrale valorisée, premier aperçu réel du catalogue/collectif, puis images IA selon les disciplines effectivement couvertes. Les quinze sections complètes, nouvelles images, sélections à critères métier et notifications internes ne sont pas livrées par ce lot.

Les reprises suivantes sont historiques et ne priment pas sur cet arbitrage.

Livraison finale du lot navigation : commit ciblé local réalisé (retrouvable par `feat(navigation): adopt Factory header and right section drawer`). Push normal exécuté, rejeté `non-fast-forward` (code 1) ; distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Le checkpoint et le lot applicatif restent locaux. Aucun déploiement. Le serveur temporaire de recette a été arrêté ; checkout isolé conservé pour revue.

## Reprise active — 28 octobre 2026 : audit Lovable et image du menu

Demande : comparer le projet Lovable `447e4f2f-dfd3-455d-a936-0e3025ea0276` et préparer l'image d'un panneau droit s'ouvrant vers la gauche, prochaine étape. [Audit et matrice des 15 rubriques](AUDIT_SECTIONS_LOVABLE_MENU_2026-10-28.md). Prévisualisation lue avec Playwright, aucun message Lovable, changement distant ou déploiement. Aucune modification de l'application Next.

- Référence : 15 titres de rubriques d'accueil observés ; dépôt déjà doté de recherche/filtres, proximité, collectif, avis par coach et accès professionnels, mais pas de la même découverte sur l'accueil. Douze entrées sport/objectif dans Lovable contre quatre familles locales : ne pas élargir silencieusement. Notes, promos, popularité et disponibilités de référence non validées côté serveur.
- Images de référence : 100 apparitions de cartes, 86 liens de profil distincts et 22 sources partagées entre plusieurs IDs dans le DOM du jour ; le lot local précédent de trois portraits ne couvre pas ce catalogue. Pas de données privées ou fichiers sources Lovable exportés.
- Livré localement : maquette indépendante `maquettes/menu-sections-2026-10-28/index.html`, planche `apercu.html`, cinq PNG et observations expurgées dans `docs/assets/audit-lovable-2026-10-28`. Fermé : petite flèche à droite ; ouvert : panneau se déployant à gauche, 15 noms regroupés, fermeture/focus/mouvement réduit. Ancres de démonstration uniquement.
- Vérification : 21 assertions PASS sur fichiers locaux à 390/1440 px, captures inspectées. Clic sur personnalisation Lovable expiré : aucun fonctionnement de recommandations annoncé. Aucune nouvelle génération IA nécessaire pour cette maquette HTML native ; les scènes du lot précédent sont réutilisées.
- Git initial : branche `design/refonte-progressive-lot1`, local `33e355e0936bb7af28938de8fb08fbf9cb1730e8`, divergence 2 contre 9. Push réel du lot rejeté `non-fast-forward` (code 1), distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Commit local identifiable par Git, diff ciblé vérifié. 20 entrées suivies modifiées et 79 non suivies antérieures, 44 worktrees préservés ; index initial vide. Aucun pull/rebase/fusion/force-push.
- Prochain lot recommandé : base Git cohérente, puis intégrer le panneau droit sur les sections réellement présentes et leurs ancres. Les autres rubriques demandent des blocs/data explicitement livrés avant d'activer leurs liens. Ne pas confondre référence Lovable, code local et version publiée.

## Reprise active — 28 octobre 2026 : bibliothèque d'images IA

Demande suivante autorisée : enrichir les images, sans réconciliation Git ni déploiement. [Rapport, inventaire et correspondances](IMAGES_IA_2026-10-28.md), [preuves](assets/ai-visuals-2026-10-28/verification.json), prompts et six captures dans le même dossier. Cette section remplace le statut « audit uniquement » ci-dessous pour ce lot d'images seulement.

- Terminé localement : sept originaux générés avec image_gen et inspectés (trois portraits illustratifs démo, quatre scènes adultes), 14 variantes WebP de 640/1280 px totalisant 776 502 octets, quatre SVG natifs. Assets dans `gym-next/public/design_assets/ai-2026-10-28/`, manifeste dimensions/tailles/SHA et prompts documentés.
- Intégration : `/coachs` et `/coach` utilisent la même association stable par ID, uniquement en démo isolée ; photo fournie prioritaire, ID inconnu/non-démo ou image cassée → initiales, sans portrait emprunté. Mention visible IA, sans identification de la personne nommée ; aucune photo persistée remplacée. `/recherche` suit les quatre disciplines avec scènes/pictogrammes. Accueil, anciens carrousels et comptes antérieurement modifiés laissés hors lot.
- Contrôles locaux : sept scénarios bibliothèque PASS, deux scénarios existants découverte PASS, 390/1440 px sans débordement mesuré ; typage ciblé PASS en excluant temporairement les copies historiques playwright-artifacts. Configuration types canonique inchangée, échec standard précédent non réparé. Erreur d'image avant hydratation corrigée ; navigation carte → fiche explicitement attendue. Captures synthétiques, aucune mutation métier. Pas de build production ou recette distante.
- Git : base locale `31067cc01ee0af62fb66489f03965d79b169d7e1`, branche `design/refonte-progressive-lot1`. Push réel du lot rejeté `non-fast-forward`, code 1 ; distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Le commit local est identifiable par Git. Les 20 fichiers suivis modifiés et 79 entrées non suivies antérieurs restent exclus du lot. Serveur temporaire arrêté, fichiers de contrôle temporaires retirés, diff indexé vérifié. Aucun force-push/fusion/déploiement.
- Prochaine action : traiter le blocage Git selon instruction utilisateur et valider l'intégration avec les neuf commits distants avant publication éventuelle. Étendre la bibliothèque seulement à des profils/emplacements réellement identifiés. Aucun agent ajouté ni quota inventé ; les nouveaux visuels ne sont pas annoncés visibles sur le site hébergé.

## Reprise active — 28 octobre 2026 : audit avant refonte

Demande actuelle : audit factuel et plan progressif uniquement, aucune refonte exécutée. [Audit, matrice des fonctionnalités, preuves et lots proposés](AUDIT_REPRISE_REFONTE_2026-10-28.md). Cette section remplace les prochaines actions et états de livraison obsolètes du relais local ci-dessous.

- Base inspectée : dossier principal `GetYourMentor`, branche `design/refonte-progressive-lot1`, HEAD initial `ddd2f548096427eaa7839ab3b9d7162e4b281f2f`. Distant confirmé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, neuf commits d'avance. 20 entrées suivies modifiées et 79 entrées non suivies au départ ; rien indexé. Changements antérieurs et 44 worktrees préservés.
- Le relais distant du 22 octobre a été lu via `git show`, sans intégration. Il décrit Factory anthracite/orange ; l'instruction actuelle du 28 octobre conserve explicitement la maquette HTML/violet fixe. Contradiction consignée, aucun changement visuel. Maintenir quatre sports, 15 % administrable/historiques, affiliations bilatérales, prix de groupe par taille et acceptation avant paiement.
- Dernière publication documentée : source `54bb70980aebaadad402a2a93d38103f5e23a9b4`, Netlify `6ad93730f89f5b5157ba9dd6` ; ce SHA n'a pas été réattesté par l'API du site aujourd'hui. Distant Git plus récent ≠ déploiement. Correctifs recruiter `d50b9eb` non annoncés déployés.
- Vérification du jour : health public `demo`, `ready:true`, Supabase/Stripe/Resend/legal false ; neuf pages publiques à 390 px, recherche aussi à 1440 px, aucun débordement DOM mesuré. Aucun compte connecté, formulaire soumis, paiement simulé ou notification. Capture MCP échouée par timeout ; pas de nouvelle preuve visuelle livrée.
- `npm run check:types` local FAIL (code 1), treize diagnostics dans les copies historiques `playwright-artifacts`, incluses par tsconfig. Aucun correctif appliqué. Certaines preuves booking du 20 citées ci-dessous ne sont pas suivies dans HEAD ; ne pas reprendre leurs nombres comme vérifiés aujourd'hui. Pas de build ni recette locale applicative complète.
- Contrôle CI/CD : workflow push hors branche actuelle, pas de job de publication observé ; raccordement Git Netlify actuel non certifié. Précontrôle et push réel rejetés `non-fast-forward` (code 1) ; distant relu inchangé à `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Deux documents seulement committés localement, contrôle du diff indexé réussi. Aucun déploiement. Commit local à identifier par Git ; aucune synchronisation automatique, fusion ou force-push.
- Prochaine action recommandée : lot 0 de préparation d'une base vérifiable et de réconciliation Git préservant les changements locaux, après instruction utilisateur ; ensuite premier lot visuel limité à l'accueil. Le plan de l'audit remplace les anciennes propositions de fonctionnalités comme priorité de cette demande. Aucun nouvel agent/service. Compteurs d'usage inconnus.

## Relais local antérieur — historique du 20 octobre, non actualisé avec le distant

Mise à jour : 20 octobre 2026. V1/V2/V3 incomplets. Aucun travail annoncé en arrière-plan.

<!-- Historique distant du 21-22 octobre; les decisions plus recentes ci-dessus priment. -->
# Reprise opérationnelle - GetYourMentor

Mise à jour : 22 octobre 2026. V1/V2/V3 et refonte globale incomplets. Aucun travail en arrière-plan.


Dernier lot : parcours recruteur du 22 octobre, [rapport et limites](REVUE_RECRUTEUR_2026-10-22.md). Base distante c0eaf47, worktree isolé GYM-recrutement-20261022 ; aucun travail antérieur du dossier principal intégré. Faux compteur transitoire 4.8/24 reproduit puis retiré : attente API, erreurs/réessai/404 distincts, absence de note cohérente liste/fiche, qualifications fictives et paiement simulé explicites. Preuves et résultats finaux : assets/recruiter-2026-10-22/verification.json. Aucun déploiement ni export public ; vérifier Git pour le SHA livré. Prochaine priorité V1 ci-dessous inchangée ; publication future des correctifs à autoriser séparément.

Lot documentaire précédent : consolidation UI/UX uniquement. Compléments dans DESIGN_SYSTEM_GYM.md (références/animations), REFONTE_PROGRESSIVE_2026-10-15.md (audit proportionné/arbitrages) et governance/ai/PLAYWRIGHT_AUTONOMIE_GYM.md (comparaison/preuves).

Publication démo expressément autorisée pour le portfolio : source exacte `54bb70980aebaadad402a2a93d38103f5e23a9b4`, déploiement Netlify `6ad93730f89f5b5157ba9dd6` prêt, `/recherche` contrôlée depuis le bouton Lovable. Rapport `DEPLOIEMENT_DEMO_54BB709_2026-10-22.md` ; remplace les mentions « aucun nouveau déploiement » anciennes pour ce seul état de livraison. Portfolio réorganisé et enregistré dans Lovable, non publié ; aucun nouveau changement métier.

## Lecture et priorités actives
AGENTS -> BRANCH_STRATEGY_GYM (hiérarchie/priorités) -> préambules maître/index -> ce relais -> docs/sources/README.md -> seules sources du lot et dépendances. Archives au besoin, pas de lecture exhaustive prétendue.
Usage maîtrisé -> contexte préservé -> un lot vérifié. Compteurs Codex/Netlify inaccessibles : aucun quota, plafond évité ou changement de modèle prétendu.
Contrat actif : Factory (police système, anthracite/orange), DESIGN_SYSTEM_GYM.md et couverture REFONTE_PROGRESSIVE_2026-10-15.md. Le violet fixe est historique.
Métier : quatre sports ; affiliations à deux accords ; prix total de groupe par taille fixé par le coach ; acceptation avant paiement ; commission 15 % administrable et historiques figés. Démo sans paiement/notification réels, Premium implicite, fusion, force-push ou production.

Prochaine action prioritaire : qualifier la suppression des anciennes entrées désormais bornées ; côté ergonomie, lire PARCOURS_PRIVE_ERGONOMIE_2026-10-20.md pour reprendre le suivi/paiement hérité sans refaire le récapitulatif. Aucun paiement réel. Vérifier HEAD/distant et résultats finaux dans verification.json.
## Reprise active — 3 novembre 2026 : premier lot agentique documentaire

Audit ciblé des dossiers Documents, réemploi du manifeste RAG et atelier interne livré : **http://127.0.0.1:4325/**. Kanban versionné avec 18 tickets, 13 feuilles, cinq rôles planifiés et sprints proposés 03–06, 09–13 et 16–20 novembre. Les rôles ne sont pas des agents exécutés ; temps réels non mesurés. [Architecture, inventaire, limites et relance](architecture/AGENTIC_REFACTOR_2026-11-03.md). Checkout `C:/Users/cashe/Documents/GYM-agentic-20261103`, relance `node tools/agentic-workbench/server.mjs`.

14/14 tests Node PASS ; Playwright 1440/390, clavier, détails, filtres et citations vérifiés. Recherche actuelle extractive/lexicale, **pas de LangGraph, embeddings ou LLM actifs**, aucun raccordement aux données clients. Corpus existant valide (huit documents), évaluation historique 7/8 ; nouvelle récupération par extraits 6/8, donc aucune amélioration de pertinence ni intégration applicative revendiquée. Gate CI bloquée, workflow manuel préparé sans exécution distante. Prochaine tranche : améliorer et élargir l'évaluation, puis qualifier modèle et stockage local isolé. Aucun déploiement, migration ou paiement ; modifications antérieures préservées, divergence Git sans contournement. Preuves sous `docs/assets/agentic-2026-11-03/`.

<!-- Historique distant du 21-22 octobre; les decisions plus recentes ci-dessus priment. -->
## Objectif courant - clôture V1 démo avant V2
Checklist sourcée dans STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md, section « Clôture V1 démo » ; BP p.49–50 et MVP p.1 relus. Les méthodes V3/V5 ne sont pas les versions produit. Ne pas réduire silencieusement le périmètre : Premium/droits, générateur/programmes, ressources/formations, formats/packs, performances/recommandations, communauté, calendriers/trackers, rappels/facturation et recette globale restent partiels/à qualifier. /beta existe : ne pas le recréer depuis une ancienne ligne obsolète.
Premier lot : export calendrier manuel .ics de la propre séance acceptée/payée du sportif, sans écriture ni contact externe. Session/propriétaire/démo isolée revérifiés, UTC/créneau convenu/durée, aucun token/code/coordonnée exporté ; annulations/déplacements non synchronisés. Rapport CALENDRIER_V1_DEMO_2026-10-21.md ; preuves assets/calendar-v1-2026-10-21/verification.json. Tests locaux intégrés distincts des erreurs injectées ; aucun import dans Google/Apple/Outlook prétendu.
MCP : compte sportif fictif et séance acceptée consultés ; clic expiré sur stabilité, téléchargement non validé par MCP. Playwright local valide clavier/téléchargement et quatre largeurs. 8 scénarios privés et 4 export public PASS, types/build/frontière/scans PASS ; détails dans verification.json. Aucun déploiement ni recette distante.
Dernier lot Factory conservé : PAIEMENT_SUIVI_FACTORY_2026-10-21.md, 21 scénarios privés et 10 publics à cette livraison ; ne pas additionner aux tests courants. Contrats REPRISE_PAIEMENT_SIMULE, TRANSPORT_PREUVE_PRIVEE et SUIVI_PERSONNEL_DEMO inchangés.
Attention recette : cookies de production restent Secure ; les parcours authentifiés ne se valident pas sur un serveur HTTP local de production. Utiliser le serveur de démonstration adapté pour ces tests, sans désactiver la protection. Pas de validation TLS/production, RLS, Stripe ou Netlify revendiquée.

## Git, confidentialité et environnement
Worktree courant : C:/Users/cashe/Documents/GYM-factory-theme-20261021. Base privée 93871bd, branche de livraison design/refonte-progressive-lot1 ; export public GetYourMentor-site, base af463c1, branche main. Vérifier HEAD et SHA distant final, pas de SHA autoréférent.
Dossier principal GetYourMentor en retard avec changements antérieurs sans rapport : ne pas les intégrer en bloc. Dépôt privé : documents/preuves ; export public : seuls fichiers publiables inspectés, sans historique privé, PDF, secrets, traces brutes ou captures de comptes réels.
Un serveur, un build, un worker ; pas de build sur les fichiers générés d'un serveur actif. Préserver VS Code/campagnes/sessions, fermer ses seuls processus temporaires. Aucun envoi de données privées à des services d'analyse/recherche.
Aucun déploiement dans le lot documentaire courant ; la livraison Netlify de source 54bb709 est décrite en tête (la mention précédente de bbe20d7 est historique). Pas de nouvel agent/moteur : REA uniquement pour comprendre un mécanisme externe autorisé si nécessaire, Playwright pour observer/tester.

## Reprise suivante
Prochain lot V1 recommandé : recommandations explicables, source BP p.50 ; réutiliser catalogue et préférences explicitement choisies, sans données de santé ou scores prédictifs inventés. Vérifier l'absence actuelle avant création et définir une tranche bornée. La finition accueil Factory reste requise avant recette finale mais passe après les lacunes métier prioritaires. Ne pas recommencer réservation/paiement/suivi/export calendrier. Aucun déploiement implicite ; candidat hébergé final à autoriser séparément.
Ne pas recommencer les onglets coach/footer : [lot précédent](COACH_ONGLETS_FOOTER_2026-10-21.md), bases livrées 7aebba1 privé / 342e62b public, 18 tests privés et 8 publics lors de cette livraison. Socle Factory : REFONTE_FACTORY_2026-10-21.md.
