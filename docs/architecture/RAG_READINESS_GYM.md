# Readiness RAG — GetYourMentor

Ce document décrit quand le RAG pourra être activé. Tant que les critères ne sont pas remplis, MemPalace reste la mémoire locale de travail et les réponses importantes doivent citer les fichiers sources.

## État actuel

| Élément | État | Décision |
|---|---|---|
| Sources prioritaires | Disponible | Document maître, sources métier et gouvernance identifiés |
| Mémoire locale | Active | MemPalace conservé pour le contexte de travail |
| Schéma mémoire | Préparé | `supabase/schemas/memory.sql` |
| Ingestion documentaire | Export n8n corrigé, inactive | Activation après credentials et test contrôlé |
| Embeddings | Non activés | Aucun fournisseur ni dimension de modèle imposé en production |
| Retrieval hybride | Non activé | À tester après ingestion d’un corpus de référence |
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

Commencer uniquement avec :

- `DOCUMENT_MAITRE_GYM.md` ;
- `Bussiness Plan.pdf` ;
- `GetYourMentor MVP_V1 - Fonctionnalités générales.pdf` ;
- `Copie de Devis DEV - GetYourMentor.pdf` ;
- `MVP_ECRANS_GYM.md` ;
- `DESIGN_SYSTEM_GYM.md` ;
- `MIGRATION_NEXT_GYM.md` ;
- les décisions validées dans `governance/ai/DECISIONS_LOG_GYM.md`.

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
4. ingérer trois documents prioritaires ;
5. contrôler les lignes et les métadonnées ;
6. ajouter les embeddings ;
7. tester retrieval lexical + vectoriel + priorité documentaire ;
8. comparer avec MemPalace ;
9. documenter les résultats ;
10. seulement ensuite brancher un agent métier en lecture seule.
