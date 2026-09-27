# Architecture canonique de mémoire et de RAG — GetYourMentor

> Document de référence unique pour la mémoire projet, la gouvernance documentaire et le futur RAG de GetYourMentor.
> Statut : canonique, version 1, 2026-09-27.

## 1. Décision d’architecture

GetYourMentor ne doit pas maintenir plusieurs architectures RAG concurrentes. Le projet distingue clairement :

1. **la source de vérité produit** : les décisions humaines et les documents métier ;
2. **la mémoire opérationnelle locale** : MemPalace, utilisée pour retrouver rapidement le contexte de travail ;
3. **la mémoire structurée future** : Supabase/Postgres, puis `pgvector` lorsque le volume et le besoin de recherche le justifieront ;
4. **l’orchestration** : n8n, hors du chemin critique des réservations et paiements ;
5. **le code actif** : l’implémentation réellement déployée, qui doit respecter les décisions précédentes.

Le RAG est une capacité d’assistance documentaire. Il ne devient pas une nouvelle source de vérité et ne doit jamais arbitrer silencieusement une contradiction.

## 2. Hiérarchie des sources

En cas de contradiction, appliquer cet ordre :

1. `DOCUMENT_MAITRE_GYM.md` ;
2. les sources métier prioritaires :
   - `Bussiness Plan.pdf` ;
   - `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf` ;
   - `Copie de Devis DEV - GetYourMentor.pdf` ;
3. les spécifications produit, UX et migration : `MVP_ECRANS_GYM.md`, `DESIGN_SYSTEM_GYM.md`, `MIGRATION_NEXT_GYM.md` ;
4. ce document et les décisions validées dans `governance/ai/DECISIONS_LOG_GYM.md` ;
5. le contexte opérationnel compact `governance/ai/CONTEXT_RAG_GYM.md` ;
6. le code actif et ses tests ;
7. les archives, exports, captures et notes historiques.

Une source historique peut expliquer l’origine d’une décision, mais ne peut pas remplacer une source prioritaire sans décision explicite et journalisée.

## 3. Ce qui existe réellement aujourd’hui

### 3.1 Mémoire locale active : MemPalace

MemPalace est utile et doit être conservé. Il sert de mémoire de travail locale et d’index de contexte entre les phases, conversations et lots d’exécution. Il ne constitue pas la base métier déployée et ne doit pas être considéré comme la vérité du produit.

Les répertoires `.mempalace*` sont des données d’exécution locales et restent hors Git. Le dossier `mempalace/` contient l’outil lui-même : il ne doit pas être indexé comme documentation produit.

Commandes de référence :

```powershell
scripts\mempalace.cmd status
scripts\mempalace.cmd search "migration Next.js compte paiement inscription club" --results 3
scripts\mempalace.cmd mine . --agent codex
```

Le statut observé le 2026-09-27 est de 3 202 tiroirs, répartis notamment entre `gym_next`, `documentation`, `project_readable` et `general`. Cette mémoire est donc active, mais elle contient des espaces de travail qu’il faudra éventuellement dédupliquer progressivement, sans supprimer les sources originales.

### 3.2 Contexte documentaire compact

`governance/ai/CONTEXT_RAG_GYM.md` est un contexte opérationnel court destiné à être relu rapidement. Ce n’est pas un moteur RAG et ce n’est pas une deuxième architecture. Il doit rester synchronisé avec ce document et le document maître.

### 3.3 Mémoire structurée préparée, mais non activée comme RAG de production

`SUPABASE_SCHEMA_GYM.sql` prépare le schéma `gym_memory`, notamment `documents`, `document_chunks` et les vecteurs `pgvector`. Il s’agit d’un socle d’infrastructure documentaire, pas d’une preuve qu’un RAG de production est déjà opérationnel.

`n8n/workflows/04-document-ingestion.json` prépare l’ingestion des documents et des morceaux de texte. Les embeddings et l’appel LLM restent à configurer avec un fournisseur et des critères d’évaluation explicites.

### 3.4 Schéma applicatif

`SUPABASE_APP_SCHEMA_GYM.sql` est séparé du schéma mémoire. Il porte les données métier de l’application : utilisateurs, coachs, réservations, paiements et règles associées. Les deux schémas ne doivent pas être fusionnés.

Le fichier reste à la racine car `gym-next/scripts/check-supabase-schema.mjs` et les workflows actuels utilisent ce chemin. Un futur déplacement devra modifier tous les consommateurs dans le même commit et être validé par le build.

### 3.5 `project_readable/`

`project_readable/` est une représentation générée et lisible des documents du projet. Ce n’est pas une nouvelle source de vérité et ce n’est pas un troisième RAG. Les originaux restent prioritaires ; les fichiers générés ne doivent pas être édités manuellement.

## 4. Architecture cible par étapes

### Phase A — maintenant : mémoire gouvernée

- document maître et sources métier conservés comme références ;
- MemPalace utilisé pour la recherche de contexte ;
- gouvernance et décisions dans `governance/ai/` ;
- aucun agent ne modifie seul une décision produit ;
- n8n reste réservé aux synchronisations et productions contrôlées.

### Phase B — RAG documentaire minimal

- normaliser les documents prioritaires ;
- enregistrer les métadonnées dans `gym_memory.documents` ;
- découper les contenus dans `gym_memory.document_chunks` ;
- activer `pgvector` ;
- tester une recherche hybride : texte, vecteur, priorité de source et statut ;
- conserver la citation du document, de la section et de la date.

### Phase C — RAG métier

- ajouter les décisions, fonctionnalités, pages, parcours et règles design/techniques ;
- brancher les prompts CTO, Product, Design, DevOps et QA ;
- détecter les contradictions et les remonter dans un journal ;
- produire des briefs et propositions nécessitant validation humaine.

### Phase D — orchestration opérationnelle

- relier Trello, n8n, Supabase et les documents ;
- automatiser l’ingestion et les briefs ;
- exposer uniquement les outils MCP nécessaires, avec droits minimaux ;
- garder le RAG hors du chemin critique de réservation, paiement et authentification.

## 5. Modèle de retrieval

Le retrieval futur suit cette séquence :

1. filtrer par domaine et rôle ;
2. exclure les archives si une source prioritaire existe ;
3. rechercher par texte et vecteur ;
4. reclasser par priorité, statut, fraîcheur et proximité ;
5. retourner les extraits avec leurs sources ;
6. signaler explicitement toute contradiction ;
7. demander une validation humaine pour une décision structurante.

Métadonnées minimales d’un morceau : `document_id`, `document_title`, `source_priority`, `status`, `role_scope`, `topic`, `page_or_section`, `updated_at`.

## 6. Règles de rangement et de maintenance

- ce fichier est l’architecture canonique mémoire/RAG ;
- `ARCHITECTURE_MEMOIRE_GYM.md` et `governance/ai/ARCHITECTURE_IA_RAG_GYM.md` sont conservés comme documents historiques ;
- ne pas créer une nouvelle architecture RAG ailleurs ;
- ne pas supprimer les sources originales pour réduire les doublons ;
- ne pas indexer le dépôt de l’outil MemPalace dans la documentation métier ;
- ne pas éditer manuellement `project_readable/` ;
- ne pas activer les embeddings sans fournisseur configuré, métadonnées fiables et jeu de tests ;
- toute décision de structure doit être ajoutée au journal des décisions ;
- toute modification de chemin doit mettre à jour les scripts, workflows, README et contrôles de build dans le même changement.

## 7. Conclusion

La meilleure architecture actuelle est volontairement progressive : MemPalace pour le contexte immédiat, la gouvernance pour la vérité humaine, Supabase pour le futur socle structuré, `pgvector` pour la recherche sémantique quand elle sera justifiée, et n8n pour l’orchestration. Cette séparation évite de maintenir plusieurs RAG concurrents tout en gardant une trajectoire claire vers une mémoire fiable et exploitable par les futurs agents.
