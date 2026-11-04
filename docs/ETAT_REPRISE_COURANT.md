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
