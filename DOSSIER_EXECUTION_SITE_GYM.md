# GetYourMentor - Dossier d'execution du site

## 1. Objet

Ce document sert de reference unique pour construire le site web GetYourMentor sans oublier les elements critiques du produit, du design, de la technique, des donnees, de la securite et de l'automatisation.

Il synthese :

- le document maitre
- la spec MVP
- la maquette et ses dernieres decisions
- la stack technique
- la logique `Supabase + n8n`

## 2. Decisions figees

Les decisions suivantes sont considerees comme bloquees pour le MVP :

- produit `web-first`, pas application mobile native
- parcours principal en `demande de reservation validee par le coach`
- paiement seulement apres acceptation du coach
- theme visuel `sombre premium`
- interface en `francais` par defaut
- `anglais` en langue secondaire
- traduction automatique de l'interface selon la langue disponible si supportee
- changement de langue manuel toujours possible
- catalogue MVP limite a `football`, `basketball`, `fitness`, `sports de combat`
- ecran de paiement obligatoire dans la maquette et dans le build
- module fidelite simple visible dans l'espace sportif
- pas d'IA generative dans le coeur critique du booking

## 3. Objectif du MVP

Le MVP doit prouver qu'un sportif peut :

1. trouver un coach credible
2. comprendre son offre
3. envoyer une demande claire
4. recevoir une validation
5. payer
6. revenir reserver

Le MVP doit aussi prouver qu'un coach peut :

1. creer un profil
2. recevoir des demandes
3. accepter ou refuser
4. suivre ses reservations
5. percevoir de la valeur sur la plateforme

## 4. Utilisateurs

### Sportif

- recherche un coach
- envoie une demande
- paie apres validation
- suit ses reservations
- voit sa progression fidelite

### Coach

- cree son profil
- publie des offres
- recoit des demandes
- accepte ou refuse
- suit paiements et demandes

### Admin

- verifie les coachs
- suit les reservations
- gere les cas bloquants

### Club

- hors coeur du MVP
- uniquement vitrine ou prise de contact au depart

## 5. Fonctionnalites du MVP

### Public

- home
- recherche coach
- resultats de recherche
- fiche coach
- contenu de reassurance

### Sportif

- choix de la seance
- choix de 1 a 3 creneaux preferes
- connexion / inscription
- confirmation de demande
- paiement apres validation
- reservation confirmee
- espace sportif
- module fidelite simple
- avis post-seance

### Coach

- onboarding coach
- edition du profil
- gestion des offres
- dashboard coach
- demandes recues
- acceptation / refus

### Admin

- verification coach
- suivi reservations
- suivi statuts paiement

## 6. Arborescence fonctionnelle du site

### Pages publiques

- `/`
- `/recherche`
- `/coach/[slug]`
- `/devenir-coach`
- `/connexion`
- `/inscription`

### Pages sportives

- `/demande/seance`
- `/demande/creneaux`
- `/demande/confirmation`
- `/reservation/paiement`
- `/reservation/confirmee`
- `/compte`
- `/compte/reservations`
- `/compte/fidelite`
- `/compte/avis`

### Pages coach

- `/coach/dashboard`
- `/coach/profil`
- `/coach/offres`
- `/coach/demandes`
- `/coach/reservations`

### Pages admin

- `/admin/coachs`
- `/admin/reservations`
- `/admin/paiements`

## 7. Recherche et filtres MVP

### Recherche principale

- sport
- ville

### Filtres a afficher

- sport
- ville
- genre du coach : `Homme`, `Femme`
- lieu de pratique : `Interieur`, `Exterieur`
- niveau : `Debutant`, `Intermediaire`, `Confirme`
- format : `Presentiel`, `Visio`
- budget
- disponibilite
- note
- coach verifie

### Regles UX

- sur mobile, afficher d'abord : `sport`, `ville`, `genre du coach`, `lieu`
- les autres filtres peuvent vivre dans un tiroir ou un panneau secondaire
- ne jamais afficher d'autres sports que les 4 categories retenues

## 8. Parcours principal du sportif

1. arrive sur la home
2. recherche par sport et ville
3. filtre les resultats
4. ouvre une fiche coach
5. choisit une offre
6. choisit 1 a 3 creneaux preferes
7. se connecte ou cree un compte
8. confirme la demande
9. attend la reponse du coach
10. paie apres acceptation
11. voit la reservation confirmee
12. retrouve ses seances dans son espace
13. accumule de la progression fidelite

## 9. Regles metier critiques

### Reservation

- une demande contient toujours :
  - coach
  - offre
  - au moins 1 creneau
  - montant
- le statut initial est `pending_coach_validation`
- seul le coach peut faire passer la demande a `accepted_waiting_payment` ou `refused`
- le paiement ne doit jamais etre ouvert avant l'acceptation
- la reservation devient `confirmed` uniquement apres webhook Stripe valide

### Paiement

- Stripe Checkout pour le MVP
- aucun statut `paid` sans verification webhook
- gerer `failed`, `refunded`, `cancelled`

### Fidelite

- commencer simple
- modele recommande :
  - compteur de seances completes
  - palier configurable
  - prochain avantage visible
- exemples d'avantages MVP :
  - reduction prochaine seance
  - badge fidelite
  - priorite de reservation

### Langue

- langue par defaut : `fr`
- fallback global : `fr`
- langue secondaire : `en`
- detection initiale via locale utilisateur
- override manuel stocke sur le compte ou en cookie

## 10. Ecrans minimum a livrer

### Bloc public

- home
- resultats
- fiche coach

### Bloc tunnel

- choix seance
- choix creneaux
- connexion / inscription
- confirmation demande
- demande envoyee
- paiement apres validation
- reservation confirmee

### Bloc compte

- compte sportif
- fidelite
- dashboard coach
- demandes coach

## 11. Structure de donnees necessaire

### Tables coeur produit

- `profiles`
- `coach_profiles`
- `coach_disciplines`
- `coach_offers`
- `booking_requests`
- `booking_request_slots`
- `payments`
- `reviews`

### Tables utiles a ajouter

- `languages_preferences`
- `loyalty_progress`
- `coach_verification_requests`
- `email_logs`

### Champs critiques a ne pas oublier

#### profiles

- `id`
- `role`
- `first_name`
- `last_name`
- `email`
- `phone`
- `preferred_language`

#### coach_profiles

- `user_id`
- `display_name`
- `gender`
- `city`
- `practice_locations`
- `levels_supported`
- `session_formats`
- `bio`
- `diplomas`
- `verification_status`
- `rating_average`
- `is_verified`

#### coach_offers

- `coach_id`
- `title`
- `offer_type`
- `sport`
- `duration_minutes`
- `price_cents`
- `location_type`
- `session_format`
- `description`
- `is_active`

#### booking_requests

- `sportif_id`
- `coach_id`
- `offer_id`
- `status`
- `payment_status`
- `amount_cents`
- `confirmed_slot`

#### booking_request_slots

- `booking_request_id`
- `slot_start`
- `slot_end`
- `rank`

#### loyalty_progress

- `sportif_id`
- `completed_sessions_count`
- `current_tier`
- `next_reward_label`
- `next_reward_threshold`

## 12. Architecture technique cible

### Frontend

- `Next.js App Router`
- `TypeScript strict`
- `Tailwind CSS`
- `shadcn/ui` comme base technique

### Backend

- actions serveur pour mutations
- route handlers pour webhooks et endpoints specifiques

### Data

- `Supabase Postgres`
- `RLS` partout ou pertinent
- `supabase-js` + types generes

### Paiement

- `Stripe Checkout`

### Emails

- `Resend`
- auth emails via Supabase ou SMTP dedie

### Hebergement

- `Vercel`

### Tests

- `Playwright`

## 12.1 Realite d'infrastructure et passage en production

Le fichier `GYM_Couts_Infrastructure Mensuel.xlsx` a ete integre a l'architecture.

Impact retenu :

- `Supabase Free` et `Vercel Hobby` peuvent servir pour prototypage et previews internes
- ils ne doivent pas etre consideres comme la base normale d'une mise en ligne commerciale
- avant beta externe serieuse ou lancement public, le minimum recommande devient :
  - `Supabase Pro`
  - `Vercel Pro`
  - provider email transactionnel dedie

Ordre de grandeur mensuel prudent de lancement :

- environ `50 a 80 EUR/mois` fixes
- plus frais variables `Stripe`
- plus overages eventuels si usage superieur au forfait

## 13. Internationalisation

### Recommandation senior

Pour le MVP, ne pas utiliser de traduction IA en temps reel dans le tunnel critique.

Choix recommande :

- systeme d'i18n classique
- dictionnaires `fr` et `en`
- detection initiale de langue
- fallback `fr`
- textes critiques geres manuellement

L'IA peut aider :

- a produire les brouillons de traduction
- a assister la mise a jour des textes

Mais la runtime du produit doit rester deterministe.

## 14. Automatisation IA et n8n

### Ce qui doit etre automatise des le depart

- sync Trello -> Supabase
- brief hebdomadaire
- journal des decisions

### Ce qui peut venir juste apres

- ingestion documentaire
- memoire commerciale
- recherche semantique docs via `pgvector`

### Ce qui ne doit pas etre dans le coeur du MVP

- chatbot generatif client
- recommandations IA obligatoires
- decisions automatiques sur paiements ou reservations

## 15. Notifications et emails

Emails minimum :

- compte cree
- demande envoyee
- demande acceptee
- demande refusee
- lien vers paiement
- reservation confirmee
- demande d'avis post-seance

Notifications produit plus tard :

- relance paiement non termine
- rappel de seance
- seuil fidelite atteint

## 16. Securite et qualite

### Securite

- RLS sur les tables produit
- validation serveur sur toutes les mutations
- webhook Stripe verifie par signature
- aucune `service_role key` exposee au client
- uploads controles

### Qualite

- types stricts
- validations `zod` ou equivalent
- journalisation erreurs
- tests E2E sur le tunnel critique

## 17. Analytique a prevoir

Events minimum :

- home_view
- search_submitted
- search_filtered
- coach_profile_view
- offer_selected
- slots_selected
- request_sent
- request_accepted
- payment_started
- payment_completed
- booking_confirmed
- loyalty_viewed

## 18. Exclusions du MVP

- application mobile native
- chat temps reel complexe
- agenda instantane complet
- gestion avancee club
- IA coach-facing dans le produit client
- contenus payants
- analyse video avancee

## 19. Ordre de build recommande

1. fondations Next.js / Supabase / auth
2. modele de donnees produit
3. home + recherche + resultats + fiche coach
4. tunnel de demande
5. back-office coach
6. paiement Stripe
7. confirmation + compte sportif
8. fidelite simple
9. admin minimum
10. tests E2E
11. automatisations n8n prioritaires

## 20. Definition de done

Le site est pret pour beta quand :

- la recherche fonctionne avec les 4 sports
- les filtres MVP fonctionnent
- un coach verifie peut etre trouve
- un sportif peut envoyer une demande
- un coach peut accepter ou refuser
- le sportif peut payer apres acceptation
- la reservation passe bien en `confirmed`
- les emails critiques partent
- le module fidelite affiche la progression
- `fr` et `en` sont utilisables
- le tunnel critique passe en test E2E
