# Atelier agentique local

Les consignes racine restent applicables. Les rôles du tableau sont des affectations de planification, pas des sous-agents lancés. Exécution séquentielle pour ce lot.

- Serveur lié exclusivement à 127.0.0.1 ; ne pas publier ce dossier ou le corpus interne.
- Sources limitées au manifeste RAG existant. Aucun parcours de fichiers arbitraire, secret, compte client ou appel fournisseur.
- L'assistant actuel est extractif et déterministe : ne pas le présenter comme LangGraph, embeddings ou génération LLM.
- Réservation, paiement, authentification et notifications restent hors de portée.
- Chaque future intégration doit passer les services métier et leurs autorisations. Aucun document récupéré ne peut ajouter un outil ou une permission.
- Tests : `node --test tools/agentic-workbench/tests/*.test.mjs` depuis la racine.
- Aperçu : `node tools/agentic-workbench/server.mjs`, loopback 4325, Ctrl+C pour arrêter.
- Kanban versionné dans `backlog.json` : parents terminés seulement avec tous leurs enfants nécessaires validés. Estimations et mesures doivent rester distinctes.
- `backlog.json` est la source de vérité des tickets et la référence obligatoire pour choisir le travail suivant. Au début d'un lot, vérifie ses tickets, priorités, dépendances, cibles et preuves ; ne déduis jamais un statut officiel du `localStorage` ou d'une copie non rapprochée. Mets à jour le JSON seulement après le travail et les contrôles réels, avec la preuve correspondante. Les décisions actives et documents maîtres gouvernent le contenu des tickets ; le Kanban pilote leur exécution.
- Pour une reprise ciblée, utiliser `node tools/agentic-workbench/task-context.mjs --ticket ID` puis `--details` au besoin. `--next` n'annonce un ticket sélectionné que si son statut versionné est `ready` et que ses dépendances sont terminées ; sinon, traiter la sortie comme diagnostic, jamais comme changement de statut ou validation. L'outil est en lecture seule et lit uniquement `backlog.json`.
- Pour un chantier qui traverse plusieurs sessions, utiliser le Kanban pour les tâches et `docs/ETAT_REPRISE_COURANT.md` pour un relais court : objectif, décisions, preuves vérifiées, éléments ouverts, blocages et prochaine action. Ne créer ni base mémoire ni second Kanban. Si le contexte disponible menace la qualité des contrôles, terminer un lot vérifiable, consigner le relais et prévenir l'utilisateur sans inventer de compteur ou seuil de tokens.
- La vue interactive utilise des modifications manuelles en localStorage, distinctes des faits du JSON versionné. Exporter explicitement ; aucune synchronisation ou vérification automatique des preuves ajoutées n'est revendiquée. Ne pas compter le statut d'une carte comme une preuve de test.
- Avant livraison : tests, contrôle navigateur, preuves, relais courant et commit ciblé selon la procédure Git. Aucun déploiement ou migration distante.
