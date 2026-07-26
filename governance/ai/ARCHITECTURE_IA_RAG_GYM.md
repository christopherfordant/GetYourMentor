# Architecture IA / RAG Senior - GetYourMentor

## Objectif

Mettre en place une architecture IA utile au projet, capable de :

- retrouver les bonnes sources
- differencier l'officiel, l'historique et l'idee
- assister la gouvernance
- aider la production produit / design / technique
- eviter les contradictions

## Principe directeur

Pas de RAG "cosmetique".

Le systeme doit d'abord savoir :

1. quelles sont les sources prioritaires
2. quelles sources sont secondaires
3. quel document fait foi
4. quel role parle
5. quelle partie du projet est concernee

## Architecture cible

### Couche 1 - Sources de verite

Documents pivots :

- `DOCUMENT_MAITRE_GYM.md`
- `Bussiness Plan.pdf`
- `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf`
- `Copie de Devis DEV - GetYourMentor.pdf`
- `MVP_ECRANS_GYM.md`
- `DESIGN_SYSTEM_GYM.md`
- `MIGRATION_NEXT_GYM.md`
- `ARCHITECTURE_MEMOIRE_GYM.md`
- README metiers de `governance/roles`

### Couche 2 - Normalisation documentaire

Pipeline recommande :

1. extraction texte
2. nettoyage encodage
3. typage du document
4. attribution d'un niveau de priorite
5. attribution d'un statut :
   - source_prioritaire
   - source_socle
   - source_support
   - historique
6. decoupage en chunks
7. enrichissement metadata

Metadonnees minimales par chunk :

- `document_id`
- `document_title`
- `source_priority`
- `role_scope`
- `topic`
- `page_or_section`
- `updated_at`
- `status`

### Couche 3 - Stockage structure

Socle recommande :

- `Supabase / Postgres`
- `pgvector`

Tables recommandees :

- `documents`
- `document_chunks`
- `decisions`
- `features`
- `pages`
- `user_flows`
- `design_rules`
- `tech_rules`
- `role_prompts`
- `governance_alerts`

### Couche 4 - Retrieval hybride

Recherche recommandee :

- full-text / BM25
- vector search
- re-ranking simple par metadata

Regles de retrieval :

1. d'abord filtrer par priorite de source
2. ensuite filtrer par role ou domaine
3. ensuite rechercher semantiquement
4. ensuite re-ranker selon :
   - proximite semantique
   - priorite documentaire
   - recence
   - statut de verite

### Couche 5 - Agents metiers

Agents logiques a brancher sur la base RAG :

- agent CTO
- agent Product
- agent Design
- agent DevOps
- agent QA
- agent SEO
- agent Superviseur Fil Rouge

Chaque agent doit :

- interroger d'abord les sources pertinentes
- citer la base documentaire interrogee
- signaler un conflit si deux sources se contredisent

### Couche 6 - Superviseur senior

Le superviseur senior IA doit :

- controler la coherence entre le document maitre et les README
- signaler les divergences
- journaliser les alertes
- recommander une mise a jour documentaire
- proposer le decoupage en mission si le contexte devient trop large

## Architecture pragmatique par phases

### Phase A - Maintenant

- documentation de gouvernance
- prompts par role
- script local de supervision
- MemPalace comme memoire locale court terme

### Phase B - Socle RAG minimal

- normaliser les documents prioritaires
- les stocker dans Supabase
- creer `documents` et `document_chunks`
- activer `pgvector`
- tester retrieval par metadata + semantic

### Phase C - RAG metier

- brancher les prompts par role
- ajouter journal des decisions
- ajouter alertes de derive
- generer briefs hebdo / rapports

### Phase D - RAG operationnel

- supervision continue des pages et docs
- relier Trello / n8n / Supabase
- relier design, code, roadmap et gouvernance

## Regles de securite epistemique

- une source historique ne peut pas battre une source prioritaire
- un chunk sans metadata fiable ne doit pas piloter une decision critique
- un agent ne doit pas faire une recommandation majeure sans rappel de source
- toute contradiction doit remonter en alerte

## Premiere version recommandee

Mettre en place tout de suite :

- le manifeste de gouvernance
- les README metiers
- les prompts par role
- le superviseur local
- puis seulement ensuite le stockage vectoriel
