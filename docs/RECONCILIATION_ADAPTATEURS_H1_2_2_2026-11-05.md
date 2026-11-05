# GYM-H1.2.2 - raccordement serveur local et stockage durable - 5 novembre 2026

## Statut et perimetre

H1.2.2 termine dans le perimetre local autorise : adaptateurs de lecture HTTP, autorisation operateur, stockage SQLite durable et transactions testees avec processus distincts. Le moteur de decision existant est reutilise sans affaiblir ses controles. H1.2.3 (validation externe) et les parents H1.2/H1 restent ouverts. Aucun raccordement au site actif, compte Stripe/Supabase distant ou paiement reel revendique.

Supabase reste le stockage du produit. SQLite constitue un laboratoire transactionnel local, pas un remplacement de Supabase ni une preuve de compatibilite du schema SQL avec PostgreSQL. Aucun coffre ni acces reel charge; les clefs des tests sont des valeurs fictives locales. Node24.14 present, module node:sqlite experimental dans cette version; aucune installation ou modification du package applicatif.

## Separation des responsabilites

- engine.mjs et CLI initial : decision et demonstration sur fixtures, conserves.
- local-provider.mjs : uniquement GET HTTP sur une origine127.0.0.1 provisionnee dans la base locale. Pas de DNS externe, proxy automatique, redirection, paiement ou notification; utilise node:http directement. Cle test obligatoire et version API explicite2026-10-28.endive.
- sqlite-store.mjs : donnees de reservation et registres/liaisons de laboratoire, operateurs provisionnes separement, intentions d'annulation. Aucun appel reseau.
- maintenance.mjs : autorise les cibles puis utilise les ports et planReconciliation. Aucune permission de JSON acceptee comme preuve.
- operator-cli.mjs : programme local sans listener. Diagnostic par defaut; reprise par --mode resume. Fichiers de credentials fictifs, aucune valeur de token en argument ou variable de service automatiquement chargee.

## Lectures et concordance

L'adaptateur relit /v1/account et compare object/id au registre provisionne, puis la liaison coach/environnement avant tout Checkout. Il charge Checkout, PI et charge par references simples ou objets developpes. Il normalise les references des beneficiaires, transferts, frais et remboursements.

Les remboursements du PI sont lus avec pagination explicite; transfer reversals et fee refunds sont egalement relus. Trois pages par defaut, maximum configurable cinq; une page incomplete reste has_more=true et ne prouve jamais une absence. Maximum40 requetes par instantane,100 objets par page,1Mo par reponse. Une echeance globale par instantane de2s par defaut (20ms a5s configurees pour les tests), plus signal d'annulation. Redirections refusees, corps interrompu/JSON invalide ou objet absent donnent seulement un code expurge.

Le plan existant verifie ensuite environnement, plateforme, titulaire, reservation/metadata, montant/devise, beneficiaire, snapshot de commission et references. Un faux platformVerified dans un fichier client ne permet pas d'executer la maintenance : cette information provient ici d'une lecture du serveur simule, avec cible issue du registre serveur local. Cela ne prouve pas un acces au compte Stripe reel.

## Autorisation et bornes

L'autorite du laboratoire est une table operators provisionnee hors du chemin de maintenance. Elle stocke le hash du token aleatoire, son expiration, l'environnement, les modes et les IDs autorises. Les credentials sont verifies avant toute lecture HTTP, avant chaque cible et avant commit dans la transaction CAS. Token absent/faux/expire, mode ou cible non permis sont refuses. Les fichiers de tokens doivent rester prives et hors Git; permissions/ACL du compte OS restent une condition d'exploitation, pas une garantie universelle de ce programme.

Maximum100 IDs fournis, deduplication,10 traites par defaut et plafond20. Rapport console : index, code, action et noms de champs, sans valeurs financieres personnelles, IDs, exception brute ou token. Il ne permet pas d'envoyer un patch arbitraire. Pas d'endpoint public, pas de scheduler ou activation automatique.

## Atomicite et durabilite

SQLite BEGIN IMMEDIATE protege la comparaison et l'ecriture dans la meme transaction; busy_timeout1500ms, synchronous=FULL a la creation. CAS inclut tous les champs JSON, la revision de ligne et l'empreinte de l'intention d'annulation. Une modification restant au meme statut ou une intention enregistree concurremment invalide l'ancien instantane. La revision augmente une seule fois par patch applique.

La liste de champs est bornee aux references financieres et etats autorises. Le store refuse la modification du titulaire ou du prix, les transitions arbitraires et la regression succeeded vers pending. Les champs historiques/notification existants restent dans le corps sans remplacement global. Les metadonnees de controle __reconciliationRevision/Intent sont derivees et non recopiees dans le JSON metier.

Une ecriture appliquee dont l'accuse est perdu est retrouvee a la prochaine lecture sans deuxieme ecriture. Deux processus CAS puis deux processus de maintenance complets ont ete executes contre le meme fichier SQLite : une seule revision appliquee. Ce n'est pas un simple verrou memoire. Ce test ne demontre ni la gestion d'un cluster distribue ni la securite d'un partage reseau de fichiers SQLite.

En diagnostic, la base est ouverte readOnly par le CLI; aucune ecriture metier. Son empreinte binaire avant/apres est comparee dans les tests. Une interruption fournisseur ou un signal d'annulation interdit toute persistance de la reprise en cours.

## Intention d'annulation : contrat prepare, parcours actif preserve

recordCancellationIntent conserve une decision deja calculee par le domaine, avant une future operation financiere : reservation, PI, environnement, beneficiaire, creneau d'origine, pourcentage, montant et commission, decidedAt et cle d'idempotence historique. Le store verifie concordance du creneau, coherence des centimes/pourcentage/frais, borne du montant et cle attendue; une intention existante est immuable.

Il ne recalcule pas la politique temporelle de remboursement : la decision et son autorisation doivent venir du service metier existant au moment choisi. Aucun nouveau pourcentage ou delai commercial impose. Ce contrat n'est pas appele par le parcours d'annulation du site dans ce lot.

Une reservation encore paid avec un remboursement fournisseur n'est toujours pas automatiquement annulee par le moteur, meme si une intention de laboratoire existe : traitement manuel conserve jusqu'au raccordement explicite du protocole metier et a ses verifications. Aucun remboursement orphelin ni date d'annulation ne sont inventes. Une nouvelle intention invalide aussi un CAS concurrent, meme sans changement de statut.

## Tests effectivement executes

62 tests locaux de reconciliation et adaptateurs PASS, incluant les36 tests du lot precedent. Faux serveurs HTTP sur127.0.0.1, SQLite sur dossiers temporaires isoles, processus Node distincts. Tests d'autorisation, expiration pendant lecture, plateforme/liaison et montant/beneficiaire faux, objets absents, references developpees/simples, pagination incomplete, timeout/annulation, pending/succeeded/failed, diagnostic readOnly, reprise apres reouverture, concurrence inter-processus, accuse perdu, intention durable et immutable, rollback SQL et CLI diagnostic/reprise explicite.

Tous les appels fournisseur observes sont GET. Aucun appel financier d'ecriture ni envoi Telegram possible dans les ports. Les tests du moteur preservent aussi les marqueurs de notifications accepted/uncertain; aucun raccordement d'outbox ajoute.

Une premiere verification a detecte une attente obsolete dans le test d'intention idempotente apres ajout de son empreinte au CAS : un ancien instantane doit desormais etre refuse. Le test a ete corrige pour relire avant repetition; suite finale sans echec. Resultats expurges dans docs/assets/reconciliation-adapters-2026-11-05/checks.json. Aucun build Next necessaire : fichiers applicatifs et parcours actifs inchanges.

## SQL local et retour arriere

local-schema.sql cree uniquement le laboratoire neuf; initializeLab refuse un fichier existant et effectue la creation dans une transaction. local-rollback.sql est exclusivement SQLite local : il ne doit pas etre execute sur Supabase. Test : verification du marqueur local, BEGIN IMMEDIATE, rollback applique puis ROLLBACK conserve les tables; seconde execution avec COMMIT supprime uniquement les tables de ce laboratoire isole. Les fichiers et credentials de test sont ensuite nettoyes sans suppression recursive.

Pour reprendre une experience, utiliser un nouveau dossier et la fixture originale; conserver toute base locale contenant des observations utiles avant retour arriere. Aucun script de migration PostgreSQL production n'a ete prepare ou applique. Le choix du schema/CAS Supabase devra etre explicite avant recette externe.

## Suite externe distincte (H1.2.3)

Avant toute recette distante : adaptateurs Supabase/Stripe autorises, selection serveur des comptes et permissions, strategie PostgreSQL CAS equivalente et migration eventuelle proposee/repetee puis autorisee specifiquement, protocole durable d'annulation branche explicitement, gestion des secrets/ACL et procedures d'exploitation. Les limites loopback ne doivent pas etre retirees silencieusement pour faire fonctionner le CLI sur le reseau externe.

Aucun achat, appel distant Stripe/Supabase, migration distante, message, nouveau paiement/remboursement ou deploiement. H1 reste ouvert avec ses autres tickets non traites.

## Reproduction et references

Depuis la racine : node --test tools/payment-reconciliation/*.test.mjs; details operateur dans tools/payment-reconciliation/LOCAL_ADAPTERS.md. Kanban http://127.0.0.1:4325/ filtre GYM-H1.2. Les captures sont issues de contextes neufs, sans effacer les brouillons personnels.

References officielles consultees : [pagination des remboursements Stripe](https://docs.stripe.com/api/refunds/list), [SQLite Node](https://nodejs.org/api/sqlite.html). L'API utilisee a aussi ete executee directement avec Node24.14 local; aucune compatibilite avec toutes les versions Node n'est revendiquee.

## Suite preparee, sans reouverture du ticket valide

Le lot H1.2.3 PostgreSQL local est documente dans [le dossier du 5 novembre](RECONCILIATION_POSTGRES_H1_2_3_2026-11-05.md). H1.2.2 reste termine dans son perimetre SQLite/HTTP local. Aucune validation distante implicite.
