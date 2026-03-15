# GetYourMentor - Workflows n8n

## 1. Principe

Le systeme `n8n` ne doit pas essayer de "penser" a votre place. Il doit faire 4 choses :
- synchroniser
- resumer
- ranger
- rappeler

Le cerveau du projet reste :
- le document maitre
- vos decisions
- votre priorisation MVP

## 2. Ordre de construction recommande

### Workflow 1 - Trello -> Supabase

But :
- garder une copie fiable des cartes Trello
- alimenter automatiquement le suivi projet

Declencheur :
- `Trello Trigger`
  - card created
  - card updated
  - card moved

Noeuds :
1. `Trello Trigger`
2. `Set` ou `Code`
   - normaliser le payload
   - extraire `card_id`, `title`, `desc`, `list_name`, `labels`, `members`, `due`, `url`
3. `Supabase`
   - operation `upsert`
   - table `gym_memory.tasks_sync`

Sortie attendue :
- chaque carte Trello existe aussi dans `tasks_sync`

Mapping conseille :
- `status` = nom de la liste Trello
- `members` = noms ou emails des responsables
- `labels` = labels Trello

## 3. Workflow 2 - Brief hebdomadaire

But :
- produire chaque semaine un point clair pour vous 3

Declencheur :
- `Schedule Trigger`
  - chaque lundi matin

Noeuds :
1. `Schedule Trigger`
2. `Supabase`
   - recuperer les cartes `En cours`, `En attente`, `A faire cette semaine`
3. `Supabase`
   - recuperer les decisions des 7 derniers jours
4. `Supabase`
   - recuperer les contacts a relancer
5. `AI / LLM`
   - generer un brief structure :
     - ce qui a avance
     - ce qui bloque
     - ce qui doit etre fait cette semaine
6. `Supabase`
   - insertion dans `gym_memory.weekly_briefs`
7. `Email`, `Slack`, `Telegram` ou `Notion`
   - envoyer le resume

Sortie attendue :
- 1 resume hebdo automatique

Format de brief recommande :
- progression de la semaine passee
- blocages
- decisions recentes
- top 3 priorites
- relances commerciales a faire

## 4. Workflow 3 - Journal des decisions

But :
- ne plus perdre les arbitrages importants

Declencheur possible :
- carte Trello label `Decision`
- formulaire `Tally` ou `Google Form`
- table `Notion` ou `Airtable`

Noeuds :
1. `Trigger` de la source choisie
2. `Set`
   - `title`
   - `description`
   - `category`
   - `decided_by`
   - `impact_level`
3. `Supabase`
   - insert dans `gym_memory.decisions`
4. `Optional AI`
   - resumer la decision en 3 lignes
5. `Optional`
   - ajouter un rappel pour revoir cette decision plus tard

Regle importante :
- toute decision produit, finance ou go-to-market importante doit vivre dans cette table

## 5. Workflow 4 - Ingestion documentaire

But :
- transformer vos docs en memoire consultable

Declencheur :
- nouveau fichier dans un dossier source
- ou execution manuelle au debut

Dossier de depart conseille :
- business plan
- pitch
- fonctionnalites
- parcours utilisateur
- reunions

Noeuds :
1. `Google Drive Trigger` ou source locale equivalente
2. `Extract From File`
   - PDF, DOCX, TXT selon votre flux
3. `Code`
   - nettoyage du texte
   - decoupage en chunks
4. `AI`
   - resume global du document
5. `Supabase`
   - insert dans `gym_memory.documents`
6. `Embeddings`
   - generer les embeddings des chunks
7. `Supabase Vector Store`
   - stocker dans `gym_memory.document_chunks`

Important :
- au debut, ingerer seulement les documents stratégiques
- ne pas charger tout le disque d'un coup

## 6. Workflow 5 - Memoire commerciale

But :
- suivre coachs, clubs, incubateurs, financeurs

Declencheur :
- ajout d'un contact
- changement de statut
- date de relance atteinte

Noeuds :
1. `Trigger`
2. `Supabase`
   - upsert dans `gym_memory.contacts`
3. `IF`
   - `next_action_date <= today`
4. `Email` ou `Telegram`
   - rappel de relance
5. `Optional AI`
   - generer un mini contexte du contact avant appel

Sortie attendue :
- plus aucune relance importante oubliee

## 7. Workflow 6 - Alignement document maitre

But :
- eviter que le document maitre reste decale par rapport au reel

Declencheur :
- 1 fois par semaine
- ou manuellement apres une grosse decision

Noeuds :
1. `Schedule Trigger`
2. `Supabase`
   - lire decisions recentes
   - lire features MVP
   - lire roadmap items
3. `AI`
   - proposer un brouillon de mise a jour
4. `Create File` ou `Notion`
   - generer un draft de synthese

Regle :
- ne jamais ecraser automatiquement le document maitre sans validation humaine

## 8. Stack minimale pour commencer

Commencez avec seulement :
- workflow 1
- workflow 2
- workflow 3

Cela suffit deja pour :
- suivre les taches
- ne pas perdre les decisions
- recevoir un resume hebdo

## 9. Credentials et connexions a preparer

- `Trello API`
- `Supabase URL + service key`
- provider IA pour resume et embeddings
- canal de sortie :
  - email
  - Telegram
  - Slack
  - Notion

## 10. Priorite absolue

Si vous manquez de temps, construisez dans cet ordre :

1. Trello -> Supabase
2. Brief hebdo
3. Journal des decisions
4. Memoire commerciale
5. Ingestion documentaire
6. Recherche semantique

