# Readiness RAG — GetYourMentor

Ce document décrit quand le RAG pourra être activé. Tant que les critères ne sont pas remplis, MemPalace reste la mémoire locale de travail et les réponses importantes doivent citer les fichiers sources.

## État actuel

| Élément | État | Décision |
|---|---|---|
| Sources prioritaires | Disponible | Document maître, sources métier et gouvernance identifiés |
| Mémoire locale | Active | MemPalace conservé pour le contexte de travail |
| Schéma mémoire | Préparé | `supabase/schemas/memory.sql` |
| Ingestion documentaire | Corpus de préproduction ingéré manuellement | Le workflow n8n reste inactif par sécurité ; le script `npm run seed:rag` est idempotent |
| Embeddings | Non activés | Aucun fournisseur ni dimension de modèle imposé en production |
| Retrieval lexical | Actif en préproduction | Fonction SQL `gym_memory.search_document_chunks`, RLS et citations vérifiées |
| Retrieval hybride | Non activé | À tester après choix d’un fournisseur d’embeddings |
| Agents métier | Non branchés au RAG | Les prompts restent gouvernés par les documents existants |

## Conditions d’entrée

Avant activation, il faut :

1. choisir un fournisseur d’embeddings et confirmer la dimension du vecteur ;
2. définir un corpus limité de documents prioritaires ;
3. attribuer à chaque document un statut, une priorité et une date ;
4. tester l’ingestion sur un environnement Supabase séparé ;
5. vérifier que les chunks utilisent `chunk_text`, `tags` et `document_id` ;
6. créer un jeu de questions/réponses de référence ;
7. mesurer la présence de la bonne source et le taux de réponses contradictoires ;
8. conserver une validation humaine pour les décisions produit, financières et de sécurité.

## Corpus initial recommandé

Le corpus actuellement gouverné est défini dans `docs/architecture/rag-corpus.json`. Il contient les documents maîtres, architecture, mémoire RAG, readiness, MVP, design system, migration et décisions validées.

Ne pas ingérer au départ les exports générés, captures, journaux d’exécution, dossiers `.mempalace*`, le dépôt `mempalace/` ni les idées V2/V3 non validées.

## Critères de sortie

Le RAG pourra être considéré comme utilisable seulement si :

- chaque réponse de test cite au moins une source ;
- une source historique ne remplace pas une source prioritaire ;
- les conflits sont signalés au lieu d’être arbitrés silencieusement ;
- les documents hors corpus sont ignorés ;
- la suppression ou l’archivage d’un document est répercuté dans les résultats ;
- les secrets et données personnelles ne sont pas envoyés au fournisseur sans décision explicite ;
- le chemin critique de réservation, paiement et authentification reste indépendant du RAG.

## Séquence d’activation

1. préparer un projet Supabase de test ;
2. exécuter `supabase/schemas/memory.sql` ;
3. configurer les credentials n8n sans activer les workflows en production ;
4. ingérer le corpus local gouverné avec `npm run seed:rag` ;
5. contrôler les lignes, priorités et métadonnées ;
6. exécuter les 8 cas de référence avec `npm run evaluate:rag` ;
7. ajouter les embeddings seulement après choix explicite du fournisseur ;
8. tester retrieval lexical + vectoriel + priorité documentaire ;
9. comparer avec MemPalace ;
10. documenter les résultats ;
11. seulement ensuite brancher un agent métier en lecture seule.

Le contrôle local `npm run check:rag-corpus` valide le manifeste et les chemins du corpus. Il ne remplace pas l’ingestion Supabase ni l’évaluation sémantique.

Le jeu de référence local contient maintenant huit cas dans `rag-evaluation.json` et peut être exécuté avec `npm run evaluate:rag`. Cette évaluation valide les sources candidates et les citations du socle lexical ; elle ne prétend pas mesurer la qualité d’un modèle d’embeddings.

Une route serveur optionnelle `GET /api/knowledge/search?q=...` prépare l’intégration applicative en lecture seule. Elle est désactivée par défaut, exige une session administrateur et ne devient accessible que lorsque `RAG_PUBLIC_SEARCH_ENABLED=true` est explicitement défini ; elle utilise uniquement la clé service côté serveur et renvoie les citations avec les extraits.
