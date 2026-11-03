# S2 — Supabase et pgvector

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
