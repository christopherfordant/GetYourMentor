# Atelier interne GetYourMentor

Depuis la racine du dépôt :

```powershell
node --test tools/agentic-workbench/tests/*.test.mjs
node tools/agentic-workbench/server.mjs
```

Ouvrir http://127.0.0.1:4325/ ; Ctrl+C pour arrêter. Node 22 ou plus récent. Aucun paquet nécessaire au serveur ou aux tests Node. Le contrôle navigateur optionnel réutilise Playwright existant : `node tools/agentic-workbench/tests/browser-check.cjs`, serveur déjà ouvert.

Le Kanban est lu depuis `backlog.json`. Modifications manuelles et versionnées, pas de synchronisation GitHub Projects. Les rôles sont simulés, les temps sont estimés, les mesures absentes restent nulles. Les parents terminés exigent tous les sous-tickets nécessaires terminés et des preuves.

L'assistant lit le manifeste `docs/architecture/rag-corpus.json`, découpe les sources Markdown autorisées et retourne des extraits exacts avec leur version. Recherche lexicale, pas d'embeddings, de génération ou de LangGraph actifs. Pas de clé, modèle ou fournisseur chargé. Pas d'écriture métier.

Réservé au poste du propriétaire sur loopback. Host et origine contrôlés ; aucune authentification multi-utilisateur. Ne pas publier cet atelier, ni l'intégrer à `public` ou à Netlify. Le rôle admin de l'application reste à raccorder via l'authentification serveur existante dans un lot ultérieur.

Limites connues, architecture, inventaire et sprints : `docs/architecture/AGENTIC_REFACTOR_2026-11-03.md`. Évaluation lexicale existante 7/8 et récupération par extraits 6/8 ; ne pas présenter ces résultats comme un RAG prêt pour la production. Aucun workflow GitHub Actions exécuté.
