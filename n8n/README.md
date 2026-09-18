# Workflows n8n GetYourMentor

Les exports sont importables dans n8n, mais restent inactifs tant que les credentials et les identifiants de board ne sont pas configurés.

## Premier workflow

`workflows/01-trello-to-supabase.json` synchronise les cartes créées, modifiées ou déplacées du board `GetYourMentor - Pilotage` vers `gym_memory.tasks_sync` par upsert sur `trello_card_id`.

`workflows/02-weekly-brief.json` prépare le brief du lundi à partir des tâches actives, décisions récentes et contacts à relancer, puis l’enregistre dans `gym_memory.weekly_briefs`.

`workflows/03-decision-journal.json` reçoit une décision par webhook, la normalise et l’insère dans `gym_memory.decisions`.

`workflows/04-document-ingestion.json` reçoit un PDF par webhook, extrait son texte, crée le document et ses chunks dans `gym_memory.documents` et `gym_memory.document_chunks`. Les embeddings et le résumé LLM peuvent être ajoutés après configuration du fournisseur IA.

`workflows/05-commercial-memory.json` enregistre les contacts commerciaux dans `gym_memory.contacts`, détecte les relances dues et contient une notification SMTP optionnelle désactivée par défaut.

`workflows/06-master-alignment-draft.json` lit les décisions, fonctionnalités MVP et éléments de roadmap, puis produit un brouillon Markdown marqué `requires_human_validation`. Il ne modifie jamais automatiquement `DOCUMENT_MAITRE_GYM.md`.

Avant activation :

1. Exécuter `SUPABASE_SCHEMA_GYM.sql` dans Supabase.
2. Créer les credentials Trello et Supabase dans n8n.
3. Remplacer `REPLACE_WITH_GETYOURMENTOR_BOARD_ID` par l’identifiant du board.
4. Importer le JSON et vérifier le mapping de la node Supabase selon la version n8n installée.
5. Tester avec une carte dans `Backlog`, puis la déplacer dans `A faire cette semaine`.

Le workflow ne contient aucun secret et n’est pas activé par défaut.
