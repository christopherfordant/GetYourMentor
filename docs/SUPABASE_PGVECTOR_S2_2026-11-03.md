# S2 — Supabase et pgvector

## Recette effective du 4 novembre 2026 — A4.2 terminé dans le périmètre de recette

L'utilisateur a répondu « oui » à la création de `gym_rag_s2` et à sa recette synthétique sur `getyourmentor-preprod`. Cette autorisation remplace l'attente décrite dans les sections historiques ci-dessous, pour ce seul schéma. Aucun achat, changement d'abonnement, ingestion documentaire ou déploiement du site n'est inclus.

Exécution réelle dans l'éditeur SQL Supabase du projet `pqxqqbwesfrefzjoawmx` :
1. Contrôle préalable en transaction READ ONLY : pgvector 0.8.2, schéma S2 absent ; empreinte des colonnes/types, OID, ACL et indicateurs RLS des tables `public` et `gym_memory` archivée.
2. Création et recette dans une transaction terminée par ROLLBACK : checkpoint `s2_rehearsal_passed`. Contrôle indépendant suivant : schéma toujours absent et empreinte identique.
3. Création persistante du seul schéma privé, de ses trois tables et de sa fonction de recherche : checkpoint `s2_schema_created`, COMMIT exécuté.
4. Nouvelle recette sur le schéma persistant, terminée par ROLLBACK des fixtures : checkpoint `s2_persistent_recipe_passed`.
5. Nouveau contrôle READ ONLY depuis un nouvel écran SQL : schéma présent, vecteurs `vector(384)`, trois tables avec RLS, fonction SECURITY INVOKER, et **zéro ligne** dans chacune des trois tables. L'empreinte historique est toujours `0ded7adc5481a43cb4f53ed3a880b28b`.
6. Interface Policies du nouveau schéma : absence d'exposition via les API Supabase confirmée.

Les deux recettes ont exercé l'isolation des collections, le plafond de huit résultats, les refus de dimensions incompatibles et de requête zéro, l'exclusion des chunks périmés, leur mise à jour, la désactivation et la suppression en cascade. Les appels sous `anon` et `authenticated` ont réellement échoué pour privilèges insuffisants ; la recherche sous `service_role` a réussi, tandis que son réétiquetage d'une collection a été refusé. Les métadonnées finales confirment les privilèges attendus. Les confirmations natives de l'éditeur concernant les opérations de suppression ont été acceptées pour les seules fixtures autorisées.

**GYM-A4.2 est terminé pour le stockage et la recette synthétique.** A4.1 conserve sa qualification locale bornée ; A4.3, comparaison de pertinence lexical/vectoriel, reste à faire. Le parent A4 n'est pas terminé. Aucun HNSW/IVFFlat n'a été ajouté : recherche exacte pour ce petit stockage de recette. Aucun connecteur d'ingestion, assistant vectoriel applicatif ou LangGraph n'est activé par ce lot. Aucun document privé n'a été envoyé à Supabase.

L'empreinte historique porte sur les métadonnées indiquées, pas sur les contenus des lignes ou tous les objets du projet. Aucune lecture de données métier ni écriture sur les tables historiques n'a été exécutée. Les données synthétiques ont toutes été annulées ; le schéma privé persiste vide, prêt pour la prochaine étape autorisée.

Preuves et SQL exacts exécutés : [remote-proof.json](assets/rag-s2-remote-2026-11-04/remote-proof.json) et fichiers `01` à `05` du même dossier. Les marqueurs SELECT ajoutés avant COMMIT/ROLLBACK servent uniquement à constater le passage de toutes les assertions ; aucun changement de la logique SQL préparée. Application manuelle via SQL Editor, pas de migration CLI ou déploiement GitHub/Netlify revendiqué.

Le script de rollback du schéma vide reste disponible pour une décision explicite de retour arrière ; il n'a pas été exécuté sur le schéma persistant. Les limites de pertinence, de charge et de raccordement applicatif restent celles décrites plus bas. Git et contrôles locaux finaux : `delivery-private/s2-recipe-git.json` et [local-checks.json](assets/rag-s2-remote-2026-11-04/local-checks.json).

## Reprise du 4 novembre 2026 : préparation contrôlée, application distante en attente

Le projet `getyourmentor-preprod` répond de nouveau. Playwright puis une transaction SQL **READ ONLY**, timeout de cinq secondes et `ROLLBACK`, ont contrôlé uniquement les métadonnées. Aucune donnée métier ou documentaire n'a été lue ou transférée. La connexion navigateur a d'abord été indisponible, puis rétablie ; aucune intervention de connexion n'est encore nécessaire au dernier contrôle.

Constats distants archivés dans [supabase-preflight.json](assets/supabase-pgvector-s2-2026-11-04/supabase-preflight.json) :
- offre FREE affichée ; pgvector **0.8.2**, schéma `public` ;
- `gym_memory` existe, neuf tables avec RLS activée, et `document_chunks.embedding` est `vector(1536)` ;
- l'interface indique que `gym_memory` n'est pas exposé par les API Supabase ;
- `anon`, `authenticated` et `service_role` n'ont ni USAGE sur `gym_memory` ni SELECT sur ses chunks ; aucun de ces rôles ne peut créer dans `public` ;
- `service_role` possède BYPASSRLS, ce qui ne lui donne pas les privilèges SQL manquants ;
- `gym_rag_s2` est absent. Aucun schéma ou droit n'a été modifié.

Les variables actives du déploiement Netlify et sa connexion réelle à cette base ne sont pas vérifiées. Le dépôt comporte une référence au projet dans un script d'ingestion et une ancienne documentation ; cela ne démontre pas un raccordement du site public. L'étiquette Supabase main/PRODUCTION ne prouve pas non plus l'usage métier de ce projet nommé preprod. Les opérations envisagées restent séparées dans un nouveau schéma privé.

### Qualification locale A4.1

Essai CPU exécuté avec `tools/agentic-workbench/qualify_embeddings.py`, sans document interne ni appel fournisseur facturable. Dépendances déjà installées : NumPy 2.2.6, ONNX Runtime 1.31.0, tokenizers 0.23.3. Poids ONNX quantifiés de 118 308 185 octets et tokenizer de 17 082 730 octets conservés hors Git dans LOCALAPPDATA/GetYourMentor/models. Les quatre fichiers téléchargés ont des SHA256 figés et contrôlés ; aucun code distant du modèle n'est exécuté.

Modèle amont : `intfloat/multilingual-e5-small`, révision `614241f622f53c4eeff9890bdc4f31cfecc418b3`, licence MIT déclarée par sa carte. Conversion : `Xenova/multilingual-e5-small`, révision `761b726dd34fb83930e26aab4e9ac3899aa1fa78`. La carte de conversion référence le modèle amont sans déclaration de licence indépendante : cette provenance et cette limite sont conservées, aucune certification juridique ou équivalence exacte avec les poids non quantifiés n'est revendiquée. Les poids ne sont pas redistribués dans le dépôt.

Pipeline `e5-onnx-int8-mean-mask-l2-max256-v1` : préfixes query/passage, moyenne masquée, normalisation L2, batch un, plafond 256 tokens, deux threads intra-op et un inter-op. Cinq entrées synthétiques, dont une répétition et une entrée longue tronquée : 384 dimensions finies, normes proches de un et répétabilité contrôlée à 1e-6. Dernier essai : chargement 0,678 s ; inférences courtes 0,009 à 0,015 s ; entrée de 256 tokens 0,156 s ; pic du processus **546 533 376 octets**, environ 521 Mio. Ce n'est ni une mesure de toute la RAM du poste ni un test de charge.

La vérification française élémentaire classe le passage apparenté devant celui sur les fruits (cosinus 0,901 contre 0,751). Deux valeurs sur des exemples synthétiques ne définissent aucun seuil d'abstention et ne mesurent pas Recall. A4.1 est terminé pour cette qualification technique locale bornée ; A4.2 reste bloqué sur l'autorisation distante et A4.3 reste distinct. [Mesures exactes](assets/supabase-pgvector-s2-2026-11-04/model-qualification.json).

### Changement distant concret proposé — non appliqué

Le SQL préparé crée uniquement `gym_rag_s2`, trois tables (`collections`, `sources`, `chunks`) et une fonction `search_chunks`. Il réserve l'accès au service serveur, active RLS, retire les éventuels grants hérités avant d'accorder les seuls droits nécessaires et refuse la modification de l'identité d'une collection par `service_role`. Le schéma historique et les tables métier sont préservés. Recherche exacte bornée, pas d'index HNSW prématuré ni exposition Data API.

Les sources désactivées ou dont le hash ne correspond plus sont exclues avant restitution. Les suppressions de sources suppriment leurs chunks. Le remplacement atomique d'un document reste à effectuer dans une transaction par le futur connecteur ; cette proposition ne livre pas une ingestion opérationnelle.

Recette synthétique préparée : isolation, plafond de résultats, dimensions, requête zéro, mise à jour, invalidation, désactivation, suppression, appels réellement refusés sous anon/authenticated et appel permis sous service_role. Le test serveur vérifie également le refus de réétiquetage des collections. **Aucun de ces tests d'écriture n'a été exécuté sur Supabase.**

Après autorisation spécifique :
1. Reconfirmer le projet et l'absence du schéma, puis exécuter une répétition transactionnelle : proposition sans son COMMIT final + recette sans son BEGIN initial, terminée par le ROLLBACK de la recette. Elle doit annuler également le schéma d'essai.
2. Si cette répétition réussit et que l'autorisation couvre la création persistante, appliquer la proposition puis exécuter séparément la recette. Ne pas poursuivre après une erreur ; contrôler le rollback effectif et archiver le résultat.
3. Contrôler l'absence des UUID synthétiques après rollback. Aucune ingestion de document privé ni modification des accès historiques n'est incluse.
4. Si un retour arrière est nécessaire, le script manuel `supabase/proposals/20261104_rag_s2_rollback_empty.sql` refuse la présence d'une collection et supprime les seuls objets attendus, sans CASCADE global. Une dépendance inattendue bloque et annule sa transaction. Ne pas le lancer automatiquement ; inventorier les données et obtenir une décision si le schéma n'est plus vide.

SQL et corps PL/pgSQL analysés avec pglast 7.22 ; cette analyse ne vérifie pas leur sémantique dans la base. Régressions locales : 26/26 tests Node et 12/12 évaluations lexicales PASS. [Contrôles du lot](assets/supabase-pgvector-s2-2026-11-04/checks.json). RAG applicatif, réservations, paiements et notifications inchangés.

La demande de reprise impose explicitement une autorisation spécifique pour l'application distante. La préparation est terminée ; la prochaine décision porte uniquement sur la création de ce schéma privé et sa recette synthétique sur le projet identifié. Historique ci-dessous conservé.

## Décision et état réel

Décision utilisateur du 3 novembre 2026 : utiliser **Supabase + pgvector**, sans autre base vectorielle ni stockage SQLite. Un projet de recette distinct existe selon confirmation utilisateur. Son identifiant et son abonnement ne sont pas encore vérifiés. Le navigateur consulté redirige vers la connexion Supabase ; aucune configuration Supabase dans les emplacements locaux vérifiés. Une demande de connexion est en attente, sans collecte de secrets dans la conversation.

GYM-A4.2 reste **bloqué** : aucune requête de recette distante n'a été exécutée. Le choix technologique ne constitue ni une qualification du modèle ni un test de stockage réussi. Le RAG lexical local et les parcours métier restent inchangés.

## Préparation livrée

- `supabase/proposals/20261103_rag_s2_pgvector.sql` : proposition transactionnelle, hors dossier des migrations automatiques. Schéma privé `gym_rag_s2`, accès réservé au rôle serveur, collections séparant modèle/révision/pipeline, vecteurs normalisés de dimension 384, sources désactivées par défaut et hash de contenu contrôlé avant restitution. Suppression des sources en cascade. Recherche exacte bornée à huit résultats ; pas d'index HNSW avant mesure du besoin.
- `supabase/verification/rag-s2-pgvector.sql` : recette transactionnelle synthétique, avec `ROLLBACK`, couvrant isolation des collections, dimensions des documents/requêtes/modèles, invalidation puis mise à jour, désactivation, suppression et privilèges clients. **Préparée, non exécutée en base.**
- Aucun changement du schéma historique `gym_memory`, de sa colonne `vector(1536)`, des données, des API publiques ou du site. Aucune activation d'API PostgREST pour ce schéma privé.

La dimension 384 est le contrat candidat de `intfloat/multilingual-e5-small`, pas un modèle déjà installé/qualifié. L'ancien contrat 1536 ne permet pas de déduire un fournisseur actif. A4.1 reste à qualifier par une vraie inférence locale, avec révision figée, licence, normalisation, temps et mémoire mesurés. Les vecteurs unitaires synthétiques de la recette ne remplacent pas cette qualification.

## Ordre de reprise

1. Connexion utilisateur au tableau de bord, identification non ambiguë du projet de recette et lecture seule de son plan, extension vector, schémas et droits existants. Ne jamais publier de clés.
2. Qualification locale bornée du modèle candidat, sans API d'embeddings payante. Conserver sa révision et celle du pipeline ; ne pas mélanger les espaces vectoriels.
3. Faire relire la proposition et obtenir l'autorisation spécifique d'application distante, encore exclue par le périmètre actif. Ne pas appliquer sur le projet de production. La connexion seule ne vaut pas autorisation de migration.
4. Appliquer la proposition uniquement sur la recette autorisée. Elle échoue si `gym_rag_s2` existe déjà : inspection obligatoire plutôt qu'écrasement. L'extension doit déjà être activée explicitement dans cette recette.
5. Exécuter le script de vérification avec arrêt sur erreur et rollback, archiver le résultat réel. Contrôler également les appels refusés sous rôles clients, pas seulement les privilèges déclarés.
6. Préparer ensuite ingestion atomique et connecteur serveur authentifié : corpus autorisé uniquement, source/révision vérifiées, pas d'identité ou de rôle fourni librement par le navigateur. Aucun upload documentaire distant n'est effectué par ces fichiers.
7. Ne clôturer A4.2 qu'après les preuves de stockage et de suppression effectives ; A4.3 doit encore comparer lexical/vectoriel, abstentions et qualité. Une distance cosine n'est pas une preuve de pertinence.

Rollback avant commit : transaction annulée. Après application : ne supprimer le schéma de recette qu'après inventaire et autorisation ; ne pas utiliser de suppression automatique ou de `CASCADE` global. Le script de recette annule ses propres données synthétiques, sans garantir l'absence de coûts ou d'effets de logs sur un service distant.

## Gratuité et sources

L'offre Free documentée comprend 500 Mo de base et jusqu'à deux projets actifs gratuits ; pgvector utilise PostgreSQL dans ce budget. Ce n'est pas une garantie sur le plan du compte, la capacité restante ou une gratuité illimitée. Pas de changement d'abonnement ni d'appel d'embeddings facturable.

Sources officielles consultées le 3 novembre 2026 : [offre base seule](https://supabase.com/kb/faqs/platform/database-only-cost), [colonnes vectorielles](https://supabase.com/docs/guides/ai/vector-columns), [index](https://supabase.com/docs/guides/ai/vector-indexes), [modèle candidat](https://huggingface.co/intfloat/multilingual-e5-small).

Les preuves du contrôle syntaxique et des régressions locales se trouvent dans `docs/assets/supabase-pgvector-s2-2026-11-03/checks.json`. Ce contrôle de syntaxe ne valide pas les corps PL/pgSQL, les permissions effectives ni les opérations de pgvector.


## Connexion et restauration - 3 novembre 2026, vers 17h10 Europe/Madrid

Session Supabase connectee verifiee. La liste des projets contient `getyourmentor-preprod`, reference `pqxqqbwesfrefzjoawmx`, dans une organisation affichee FREE. Le projet ouvert initialement appartient a un autre chantier : aucune modification ni interrogation de ses donnees.

Le projet GetYourMentor etait en pause. Le bouton natif Resume project a ete active sans changement de plan. L'interface confirme ensuite Restoration in progress et indique que le projet reste hors ligne pendant la restauration, avec une duree allant de quelques minutes a plusieurs heures. La fin n'est pas encore confirmee. Aucune extension, table, migration ou donnee documentaire n'a ete ajoutee. Les schemas, la version de pgvector et les droits restent a verifier apres disponibilite.

Point de reprise : https://supabase.com/dashboard/project/pqxqqbwesfrefzjoawmx . L'etiquette main/PRODUCTION designe la branche Supabase visible; le nom preprod et la confirmation utilisateur identifient la recette, sans preuve supplementaire d'isolation avec une application de production. Verifier les raccordements avant toute mutation. GYM-A4.2 reste bloque. Le choix du projet et sa remise en service ne constituent pas une autorisation d'application de la proposition SQL distante.

Controle suivant : le tableau de bord est reapparu, statut Coming up... puis Checking...; la navigation vers Extensions redirige encore vers cet ecran. Disponibilite SQL toujours non demontree. Tests de politique Kanban 3/3 PASS. Aucun test DB execute.
