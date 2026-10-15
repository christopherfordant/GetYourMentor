# GetYourMentor — Document de relais architecture et continuité

> **Reprise obligatoire a chaque prompt :** lire AGENTS.md et la procedure de BRANCH_STRATEGY_GYM.md (a la racine du depot). Verifier, documenter, commiter et pousser les lots valides sur la branche appropriee avant la reponse finale ; confirmer le SHA distant. Preserver les travaux anterieurs non verifies.

> Document destiné à une autre conversation ou à un autre agent afin de reprendre le projet sans perdre le contexte.
> Dernière mise à jour : 2026-09-28.

## 1. Objet du document

Ce document rassemble les décisions prises pendant la réorganisation de GetYourMentor, les enseignements tirés des captures d’architecture envoyées, les changements effectivement réalisés dans le dépôt et les actions restant à exécuter.

La règle principale est la suivante : ne pas créer plusieurs architectures concurrentes. GetYourMentor doit disposer d’une seule architecture canonique, progressive et vérifiable, compatible avec le MVP de réservation sportive.

Le RAG, les agents et MCP sont des capacités d’assistance autour du produit. Ils ne doivent pas devenir une dépendance du tunnel critique : rechercher un coach, choisir un créneau, réserver, payer et gérer son compte.

## 2. État général du dépôt

Dépôt : `C:\Users\cashe\Documents\GetYourMentor`

Branche active : `v2/render-migration`

Dépôt distant : `https://github.com/christopherfordant/GetYourMentor.git`

Application : `gym-next/`

Stack applicative :

- Next.js 15 ;
- React 19 ;
- TypeScript ;
- Route Handlers Next.js ;
- Supabase/Postgres et RLS ;
- Stripe prévu pour les paiements ;
- Resend prévu pour les emails ;
- Netlify pour le déploiement ;
- Playwright pour les parcours et audits ;
- n8n hors du chemin critique ;
- MemPalace pour la mémoire locale de travail ;
- Supabase/pgvector pour un futur RAG contrôlé.

## 3. Documents canoniques à lire en premier

Avant toute nouvelle modification, lire dans cet ordre :

1. `DOCUMENT_MAITRE_GYM.md` — source de vérité produit ;
2. `docs/architecture/ARCHITECTURE_TARGET_GYM.md` — architecture applicative et migration Next.js ;
3. `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md` — architecture canonique mémoire/RAG ;
4. `docs/architecture/RAG_READINESS_GYM.md` — conditions d’activation du RAG ;
5. `docs/README.md` — organisation documentaire ;
6. `governance/FIL_ROUGE_OPERATOIRE_GYM.md` — règles de cohérence produit ;
7. `governance/ai/CONTEXT_RAG_GYM.md` — contexte opérationnel compact ;
8. `governance/ai/DECISIONS_LOG_GYM.md` — décisions confirmées ;
9. `MIGRATION_NEXT_GYM.md`, `MVP_ECRANS_GYM.md`, `DESIGN_SYSTEM_GYM.md` — migration, parcours et design.

Les documents suivants sont historiques et ne doivent pas recevoir de nouvelles décisions structurantes :

- `ARCHITECTURE_MEMOIRE_GYM.md` ;
- `governance/ai/ARCHITECTURE_IA_RAG_GYM.md`.

Ils sont conservés pour la traçabilité et renvoient vers `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`.

## 4. Ce que montrent les trois captures d’architecture RAG

### 4.1 Capture 1 — évolution des architectures de retrieval

La première capture présente une progression entre plusieurs familles :

#### Classic RAG

Flux observé :

1. requête utilisateur ;
2. génération de l’embedding ;
3. recherche vectorielle ;
4. injection des meilleurs passages ;
5. réponse du LLM.

Forces :

- faible latence ;
- coût raisonnable ;
- mise en œuvre simple ;
- adapté aux FAQ, assistants RH, politiques internes et recherche documentaire.

Limites :

- raisonnement multi-étapes faible ;
- compréhension relationnelle limitée ;
- dépendance forte à la qualité du top-k et du découpage.

#### Graph RAG

Flux observé :

1. requête ;
2. extraction des entités ;
3. parcours d’un knowledge graph ;
4. agrégation du contexte ;
5. raisonnement LLM ;
6. réponse.

Forces :

- prise en compte des relations entre les entités ;
- meilleure explicabilité ;
- utile pour conformité, fraude, analyse juridique, cartographie de relations et dépendances.

Limites :

- implémentation plus complexe ;
- besoin de gouvernance du graphe ;
- coût de maintenance supérieur à un RAG vectoriel classique.

#### Agentic RAG

Flux observé :

1. requête ;
2. raisonnement de l’agent ;
3. planification de la recherche ;
4. recherche multi-source ;
5. auto-évaluation ;
6. réponse finale.

L’agent décide notamment :

- quelles informations rechercher ;
- quels outils utiliser ;
- s’il faut effectuer une recherche complémentaire ;
- si la réponse est suffisamment fiable.

Forces :

- raisonnement multi-étapes ;
- exécution adaptative ;
- meilleure gestion des demandes ambiguës ;
- adapté à la recherche, aux copilotes d’entreprise et à l’analyse de contrats.

Limites :

- latence supérieure ;
- évaluation plus difficile ;
- coûts et risques plus élevés ;
- nécessité d’un contrôle des outils et des permissions.

### 4.2 Capture 2 — maturité progressive du retrieval

La deuxième capture insiste sur l’idée que la maturité du retrieval doit suivre la complexité du métier.

Architecture recommandée par niveau :

- Classic RAG pour les besoins rapides, simples et peu relationnels ;
- Graph RAG lorsque les relations entre entités sont essentielles ;
- Agentic RAG lorsque le système doit planifier, utiliser plusieurs sources et évaluer sa propre réponse.

Conséquence pour GetYourMentor : ne pas commencer directement par un Agentic RAG généraliste. Le projet doit démarrer par une mémoire documentaire gouvernée, puis un retrieval hybride simple. Un agent ne sera ajouté que pour des missions clairement définies et évaluées.

### 4.3 Capture 3 — comparaison synthétique

La troisième capture résume le choix de pattern :

| Architecture | Valeur principale | Exemples d’usage | Risque principal |
|---|---|---|---|
| Classic RAG | Recherche rapide dans des documents | FAQ, support, politiques, recherche MVP | Contexte incomplet |
| Graph RAG | Compréhension des relations | Fraude, conformité, légalité, dépendances | Gouvernance complexe |
| Agentic RAG | Recherche adaptative et raisonnement | Recherche avancée, analyse de contrats, copilote | Latence et contrôle |

Le choix retenu pour GetYourMentor est progressif : Classic/Hybrid RAG d’abord, Graph RAG uniquement si les relations métier le justifient, Agentic RAG ensuite pour des missions contrôlées.

## 5. Architecture retenue pour GetYourMentor

### Phase A — mémoire gouvernée actuelle

- `DOCUMENT_MAITRE_GYM.md` reste la vérité humaine ;
- les PDF métier restent prioritaires ;
- `governance/` porte les décisions, rôles et contrôles ;
- MemPalace sert à retrouver le contexte local ;
- `project_readable/` sert de représentation générée et lisible ;
- aucun agent ne modifie seul une décision produit.

### Phase B — RAG documentaire minimal

- ingestion d’un corpus limité ;
- métadonnées de priorité et de statut ;
- stockage dans `gym_memory.documents` ;
- découpage dans `gym_memory.document_chunks` ;
- embeddings dans `embedding vector(1536)` après choix explicite du modèle ;
- retrieval lexical + vectoriel ;
- citations de la source, de la section et de la date.

### Phase C — RAG métier

- décisions, fonctionnalités, pages, user flows et règles design/techniques ;
- prompts par rôle : CTO, Product, Design, DevOps, QA, SEO ;
- détection des contradictions ;
- propositions nécessitant une validation humaine ;
- briefs hebdomadaires et rapports de cohérence.

### Phase D — agents et orchestration

- outils MCP minimaux et explicitement autorisés ;
- n8n pour les synchronisations et traitements asynchrones ;
- agents limités à des missions documentées ;
- aucun accès arbitraire aux fichiers, secrets, commandes ou réseaux ;
- aucun RAG dans l’authentification, le paiement ou la réservation critique.

## 6. Supabase : organisation actuelle

Les schémas ont été rangés et poussés sur GitHub :

- `supabase/schemas/app.sql` — données applicatives ;
- `supabase/schemas/memory.sql` — données mémoire et futur RAG ;
- `supabase/verification/coach-verification.sql` — vérifications coach ;
- `supabase/verification/preproduction-verify.sql` — contrôles de préproduction ;
- `supabase/README.md` — explication des usages.

Le schéma mémoire comprend notamment :

- `gym_memory.decisions` ;
- `gym_memory.features` ;
- `gym_memory.roadmap_items` ;
- `gym_memory.meetings` ;
- `gym_memory.contacts` ;
- `gym_memory.tasks_sync` ;
- `gym_memory.documents` ;
- `gym_memory.document_chunks` ;
- `gym_memory.weekly_briefs`.

Le schéma applicatif et le schéma mémoire ne doivent pas être fusionnés.

## 7. n8n : état et correction importante

Les six workflows n8n sont présents dans `n8n/workflows/` et restent inactifs par sécurité.

Workflows :

1. synchronisation Trello → Supabase ;
2. brief hebdomadaire ;
3. journal des décisions ;
4. ingestion documentaire ;
5. mémoire commerciale ;
6. brouillon d’alignement avec le document maître.

Le workflow `04-document-ingestion.json` a été corrigé pour correspondre au schéma réel :

- `file_path` au lieu de `source_path` ;
- `chunk_text` au lieu de `content` ;
- `tags` au lieu de `metadata` ;
- `status_reference` et `source_system` renseignés ;
- identifiant UUID valide ;
- type documentaire autorisé par le schéma SQL.

Le contrôle `gym-next/scripts/check-n8n-workflows.mjs` vérifie maintenant ces colonnes et bloque le retour des anciens noms.

## 8. MemPalace

MemPalace est conservé. Il est utile pour la mémoire locale de travail et les reprises entre conversations.

Statut observé : environ 3 202 tiroirs, répartis entre :

- `documentation` ;
- `gym_next` ;
- `project_readable` ;
- `general` ;
- `design` ;
- `devis` ;
- `financement` ;
- `prototype_site` ;
- `design_assets`.

Commandes :

```powershell
scripts\mempalace.cmd status
scripts\mempalace.cmd search "migration Next.js compte paiement inscription club" --results 3
scripts\mempalace.cmd mine . --agent codex
```

Règles :

- ne pas indexer le dossier `mempalace/` lui-même ;
- ne pas utiliser MemPalace comme source de vérité produit ;
- ne pas indexer les secrets ou les répertoires d’exécution `.mempalace*` ;
- dédupliquer les rooms uniquement après vérification, sans supprimer les sources originales.

## 9. MCP et patterns de conception

Les patterns MCP étudiés sont :

- Local Resource Access Pattern ;
- Hierarchical MCP Pattern ;
- Event-Driven Integration Pattern ;
- MCP-to-Agent Pattern ;
- Composite Service Pattern ;
- Direct API Wrapper Pattern.

Choix recommandé :

- wrapper direct pour une API stable et strictement bornée ;
- composite pour regrouper un parcours métier cohérent ;
- event-driven pour un traitement asynchrone ;
- MCP-to-Agent uniquement avec permissions minimales ;
- hiérarchique uniquement si la séparation des responsabilités est nécessaire ;
- accès local aux ressources uniquement sur un périmètre explicitement autorisé.

Il ne faut pas exposer un serveur MCP capable de lire arbitrairement le disque, les secrets, les commandes système ou les réseaux.

## 10. Commits déjà poussés

Principaux commits réalisés sur `v2/render-migration` :

- `a5d7aa7` — consolidation de l’architecture mémoire et RAG ;
- `b019d78` — organisation des schémas Supabase et vérifications ;
- `0ebc424` — index documentaire ;
- `9371425` — correction de l’ingestion n8n ;
- `15c4254` — critères de readiness RAG ;
- `f88fd33` — orchestration de missions gouvernées ;
- `653bde8` — exclusion des artefacts locaux de Git.

## 11. Contrôles déjà validés

Les contrôles suivants ont été exécutés avec succès :

- `npm run check:types` ;
- `npm run build` ;
- `npm run check:supabase-schema` ;
- `npm run check:n8n-workflows` ;
- `npm run check:tracked-secrets` ;
- `npm run check:client-secret-boundary` ;
- `npm run check:production-safety` ;
- `npm run check:netlify-config` ;
- `npm run check:preproduction-template`.

## 12. Ce qui reste à faire

### Priorité 1 — compte Supabase

La CLI Supabase a été installée via `npx`, mais le compte n’était pas authentifié. La connexion exige un access token créé par le propriétaire du compte.

Procédure :

```powershell
npx supabase@latest login
npx supabase@latest projects list
```

Ne jamais placer le token dans Git, dans le README ou dans une conversation.

Le projet local contient des métadonnées `.temp` Supabase ignorées par Git. Elles ne sont pas des sources applicatives.

### Priorité 2 — préproduction

Configurer uniquement dans l’environnement sécurisé :

- `SUPABASE_URL` ;
- `SUPABASE_ANON_KEY` ;
- `SUPABASE_SERVICE_ROLE_KEY` ;
- `SESSION_SECRET` ;
- `CRON_SECRET` ;
- `NEXT_PUBLIC_APP_URL` ;
- clés Stripe ;
- clés Resend ;
- informations légales ;
- validation juridique explicite.

La vérification de production échoue volontairement tant que ces variables ne sont pas renseignées.

### Priorité 3 — test du RAG

Le socle lexical et le manifeste du corpus sont maintenant versionnés. Ne pas activer directement le RAG sémantique en production. Utiliser un projet Supabase de test et ingérer seulement :

- le document maître ;
- le business plan ;
- la spécification MVP ;
- le devis ;
- les écrans MVP ;
- le design system ;
- la migration Next.js ;
- les décisions validées.

Le contrôle local `npm run check:rag-corpus` valide les huit sources gouvernées. Le script `npm run seed:rag` a ingéré 8 documents et 67 chunks dans le projet Supabase de préproduction. La recherche SQL `gym_memory.search_document_chunks` fournit le premier niveau lexical, avec priorité documentaire, citations et RLS. Les embeddings, la recherche vectorielle et l’évaluation sémantique restent volontairement bloqués jusqu’au choix et à la validation d’un fournisseur.

Le contrat MCP lecture seule est défini dans `docs/mcp/MCP_TOOL_CONTRACT_GYM.md` et contrôlé par `npm run check:mcp-contract`. Aucun serveur MCP n’est activé tant que les tests de permission et la validation humaine ne sont pas réalisés.

Évaluer les réponses avec citations et détection de contradictions avant de connecter un agent.

### Priorité 4 — nettoyage local

Les journaux d’exécution locaux restent volontairement hors des commits :

- `governance/ai/auto_*journal.md` ;
- états d’orchestration ;
- rapports de supervision ;
- captures et résultats de tests.

Ne pas les supprimer sans vérifier leur valeur de reprise.

## 13. Consignes pour la prochaine conversation

La prochaine conversation doit :

1. lire ce fichier ;
2. lire `DOCUMENT_MAITRE_GYM.md` ;
3. vérifier `git status` avant toute modification ;
4. ne pas réinitialiser le dépôt et ne pas supprimer les changements existants ;
5. utiliser `apply_patch` pour les modifications textuelles ;
6. exécuter les contrôles après chaque lot ;
7. pousser sur GitHub tous les trois ou quatre lots validés ;
8. garder le RAG hors du tunnel critique ;
9. ne jamais demander ou enregistrer un secret dans le dépôt ;
10. documenter toute nouvelle décision dans `governance/ai/DECISIONS_LOG_GYM.md`.

## 14. Résumé exécutif

GetYourMentor dispose désormais d’une architecture propre et progressive :

- Next.js pour l’application ;
- Supabase applicatif séparé de Supabase mémoire ;
- n8n pour l’orchestration inactive et contrôlée ;
- MemPalace pour la mémoire locale ;
- Classic/Hybrid RAG comme première étape ;
- Graph RAG uniquement si les relations le justifient ;
- Agentic RAG uniquement après évaluation ;
- MCP avec permissions minimales ;
- document maître comme source de vérité ;
- validation humaine pour les décisions importantes.

La prochaine étape n’est pas d’ajouter davantage d’IA. C’est de connecter proprement Supabase, de valider la préproduction et de tester le retrieval sur un corpus restreint avant toute activation d’agent.
