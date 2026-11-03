# Atelier interne GetYourMentor

Depuis la racine du dépôt :

```powershell
node --test tools/agentic-workbench/tests/*.test.mjs
node tools/agentic-workbench/server.mjs
```

Ouvrir http://127.0.0.1:4325/ ; Ctrl+C pour arrêter. Node 22 ou plus récent. Aucun paquet nécessaire au serveur ou aux tests Node. Le contrôle navigateur optionnel réutilise Playwright existant : `node tools/agentic-workbench/tests/browser-check.cjs`, serveur déjà ouvert.

Le Kanban reprend `backlog.json` : un couloir par ticket parent, des post-it pour ses sous-tickets et une fiche accessible au clic, au clavier et au tactile. Glisser-déposer entre colonnes dans le même couloir ; alternative par sélection du statut dans la fiche. Filtres sprint, rôle et texte, limite de deux tâches en cours, contrôle des dépendances et preuve explicitement vérifiée pour une nouvelle clôture.

Les déplacements sont des modifications de planification manuelles, conservées dans le localStorage de ce navigateur. Ils ne modifient ni le JSON versionné, ni Git, ni les preuves des tests. Export JSON et remise à l'état initial disponibles. Pas de synchronisation GitHub Projects ou multi-utilisateur. Un dossier source différent invalide l'application automatique des anciens déplacements. Les rôles sont simulés, les temps sont estimés, les mesures absentes restent nulles. Les statuts parents sont dérivés des sous-tickets ; pas de clôture directe d'un parent.

L'assistant lit le manifeste `docs/architecture/rag-corpus.json`, découpe les sources Markdown autorisées et retourne des extraits exacts avec leur version. Recherche lexicale, pas d'embeddings, de génération ou de LangGraph actifs. Pas de clé, modèle ou fournisseur chargé. Pas d'écriture métier.

Réservé au poste du propriétaire sur loopback. Host et origine contrôlés ; aucune authentification multi-utilisateur. Ne pas publier cet atelier, ni l'intégrer à `public` ou à Netlify. Le rôle admin de l'application reste à raccorder via l'authentification serveur existante dans un lot ultérieur.

État courant : `docs/RAG_REGRESSIONS_CORRIGEES_2026-11-03.md`. Les deux régressions revues sont corrigées, avec un budget de huit passages, 7 200 unités de texte JavaScript, trois passages par document et cinq documents prioritaires avant les compléments. Les extraits restent exacts ; aucune détection sémantique universelle des contradictions. Évaluation de référence 12/12, nouveaux contrôles 2/3 : un faux positif hors sujet reste ouvert. Aucun workflow GitHub Actions exécuté.

Les déplacements utilisent maintenant une clé locale par version du dossier (SHA256). Les anciennes clés restent intactes et exportables avec « Exporter mes anciens déplacements ». Une ancienne vue correspondant exactement au dossier est reprise ; une vue d'un autre dossier n'est pas appliquée silencieusement. Les tests navigateur utilisent leurs propres contextes, jamais le localStorage de la session utilisateur.
