# Rapport de validation RAG — préproduction

Date : 2026-09-28
Périmètre : corpus documentaire GetYourMentor, recherche lexicale Supabase et contrat MCP en lecture seule.

## Résultat

Le socle RAG documentaire est validé pour la préproduction :

- 8 documents gouvernés dans `docs/architecture/rag-corpus.json` ;
- 67 chunks générés et ingérés dans `gym_memory.document_chunks` ;
- priorités documentaires appliquées de 1 à 4 ;
- recherche SQL contrôlée par priorité, pertinence et citations ;
- RLS activé sur les tables mémoire ;
- exécution de la recherche limitée au rôle `service_role` ;
- 5 correspondances vérifiées pour la requête `reservation paiement` ;
- 8/8 scénarios de référence validés par `npm run evaluate:rag` ;
- contrat MCP validé : allowlist explicite, lecture seule et interdiction des secrets/actions métier.
- route applicative RAG contrôlée par `npm run check:rag-route` : désactivée par défaut, session administrateur obligatoire, serveur uniquement et hors parcours critique.
- smoke test local : `/api/knowledge/search` et `/admin/knowledge` répondent `404` lorsque le flag d’activation est absent.
- Render staging inspecté en lecture seule : le flag `RAG_PUBLIC_SEARCH_ENABLED` n’est pas encore présent ; aucune modification distante n’a été effectuée.

## Vérifications exécutées

Depuis `gym-next` :

```text
npm run evaluate:rag
npm run check:rag-corpus
npm run check:mcp-contract
npm run check:rag-route
npm run check:types
```

Résultat : tous les contrôles sont passants.

## Ce qui est volontairement différé

Le système utilise actuellement une recherche lexicale SQL robuste et traçable. Les embeddings, la recherche vectorielle et le mode hybride ne sont pas activés : ils nécessitent le choix explicite d’un fournisseur, d’un modèle, d’un budget et d’une politique de conservation des vecteurs.

Le contrat MCP est prêt, mais aucun serveur MCP de production n’est activé. Il devra être branché sur un hôte approuvé avec les mêmes permissions en lecture seule avant toute exposition externe.

Le RAG reste hors du chemin critique réservation, paiement, authentification et webhooks. Une réponse documentaire ne peut donc pas bloquer une opération métier.

## Suite recommandée

1. Tester la fonction SQL sur un jeu de requêtes métier élargi en préproduction.
2. Brancher un client applicatif en lecture seule avec citations visibles.
3. Ajouter les tests de permissions MCP et les tests de non-divulgation de secrets.
4. Décider ensuite, avec un fournisseur approuvé, si la recherche hybride apporte un gain suffisant pour justifier son coût et sa complexité.
