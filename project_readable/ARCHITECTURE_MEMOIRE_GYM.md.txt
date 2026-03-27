# GetYourMentor - Architecture Memoire et Synthese

## 1. But

Construire une memoire projet continue pour ne pas perdre le fil entre :
- documents de vision
- decisions prises
- taches Trello
- comptes-rendus
- contacts commerciaux
- roadmap produit

Le but n'est pas de faire un systeme complexe pour le plaisir. Le but est de creer une source de verite simple, puis de l'automatiser progressivement.

## 2. Choix recommande

Le meilleur point de depart pour GYM est :

- `DOCUMENT_MAITRE_GYM.md` comme verite humaine
- `Trello` comme outil de pilotage
- `Supabase` comme base memoire structuree
- `pgvector` pour la recherche semantique dans les docs
- `n8n` pour synchroniser, resumer et journaliser

## 3. Pourquoi ne pas commencer par un RAG pur

Un systeme RAG sans base propre retrouve souvent du contenu, mais sans hierarchiser ce qui est officiel, ancien, annule ou seulement en idee.

Pour GYM, il faut separer :
- ce qui est decide
- ce qui est en cours
- ce qui est seulement envisage

Le document maitre et la base structuree servent a proteger cette distinction.

## 4. Architecture cible

### Couche 1 - Verite humaine

Fichiers de reference :
- `DOCUMENT_MAITRE_GYM.md`
- specification MVP
- roadmap trimestrielle
- dossier financement

### Couche 2 - Verite structuree

Base `Supabase / Postgres` avec tables simples.

Tables recommandees :

- `decisions`
  - id
  - titre
  - description
  - statut
  - date_decision
  - decide_par
  - source_doc

- `features`
  - id
  - nom
  - description
  - phase
  - priorite
  - statut
  - owner
  - source_doc

- `roadmap_items`
  - id
  - titre
  - phase
  - date_cible
  - statut
  - owner

- `meetings`
  - id
  - date_reunion
  - participants
  - resume
  - decisions_ids
  - actions

- `contacts`
  - id
  - type_contact
  - nom
  - organisation
  - sport
  - ville
  - statut
  - prochaine_action
  - date_relance

- `tasks_sync`
  - id_trello
  - titre
  - liste
  - statut
  - owner
  - date_echeance
  - lien

- `documents`
  - id
  - titre
  - type_doc
  - chemin
  - version
  - resume
  - statut_reference

### Couche 3 - Memoire semantique

Table `document_chunks` avec :
- `document_id`
- `chunk_text`
- `embedding`
- `section`
- `tags`

Cette couche sert a retrouver intelligemment le contenu de PDF, DOCX, notes et comptes-rendus.

### Couche 4 - Orchestration

`n8n` connecte le tout :
- Trello
- Supabase
- documents sources
- resumes
- briefs hebdo

## 5. Workflows n8n a construire dans l'ordre

### Workflow 1 - Sync Trello vers Supabase

But :
- garder une copie des cartes et de leur statut
- alimenter le suivi sans ressaisie

Entree :
- webhook ou trigger Trello

Sortie :
- mise a jour de `tasks_sync`

### Workflow 2 - Journal des decisions

But :
- enregistrer chaque decision importante
- eviter les oublis et contradictions

Entree :
- formulaire simple ou carte Trello type "Decision"

Sortie :
- insertion dans `decisions`
- mise a jour eventuelle du document maitre

### Workflow 3 - Ingestion documentaire

But :
- extraire le texte des docs utiles
- generer un resume
- stocker le document comme source

Entree :
- nouveau fichier dans un dossier defini

Sortie :
- ligne dans `documents`
- resume en base
- chunks vectorises dans `document_chunks`

### Workflow 4 - Brief hebdomadaire

But :
- savoir ou vous en etes sans relire tout Trello

Entree :
- planification hebdomadaire

Sortie :
- resume des taches en cours
- blocages
- decisions recentes
- priorites de la semaine

### Workflow 5 - Memoire commerciale

But :
- suivre clubs, coachs, partenaires, financeurs

Entree :
- ajout ou mise a jour d'un contact

Sortie :
- relance programmee
- rappel des prochaines actions

## 6. Ce qu'il ne faut pas faire au debut

- ne pas vouloir automatiser tous les documents d'un coup
- ne pas lancer 15 workflows `n8n` en parallele
- ne pas melanger idees V2/V3 et decisions MVP
- ne pas faire un systeme RAG sans schema de base

## 7. Ordre ideal de mise en place

### Phase 1 - Clarification

1. valider le document maitre
2. prioriser le MVP
3. nettoyer le board Trello

### Phase 2 - Base memoire

4. creer `Supabase`
5. creer les tables structurees
6. connecter Trello a `Supabase` via `n8n`

### Phase 3 - Synthese automatisee

7. generer un brief hebdomadaire
8. journaliser les decisions
9. centraliser les contacts et relances

### Phase 4 - Memoire intelligente

10. ajouter `pgvector`
11. chunker les documents utiles
12. activer la recherche semantique dans les docs

## 8. Recommandation finale

Pour GYM, la meilleure approche n'est ni "tout manuel", ni "tout IA des le debut".

La meilleure approche est :
- une base humaine claire
- une base structuree fiable
- une automatisation progressive

Autrement dit :
- le document maitre vous aligne
- Trello vous fait avancer
- Supabase vous memorise
- n8n vous fait gagner du temps
- pgvector vous aide a retrouver intelligemment l'information quand le volume devient important

## 9. Premiere version minimale a viser

Si vous voulez aller vite, commencez par cette version :

- 1 document maitre
- 1 board Trello
- 4 tables Supabase : `decisions`, `features`, `contacts`, `tasks_sync`
- 2 workflows `n8n` : sync Trello et brief hebdo

C'est le meilleur rapport simplicite / utilite pour le debut du projet.
