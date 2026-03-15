# GetYourMentor - Backlog MVP

## 1. Principe

Ce backlog est organise par blocs de livraison logiques.

Il ne s'agit pas d'un planning rigide, mais d'un ordre de construction recommande pour aller vite sans casser le coeur du produit.

## 2. Phase 0 - Validation

### Objectif

Valider que le MVP retenu est bien le bon.

### Taches

- valider le document maitre
- figer les fonctionnalites MVP
- valider la maquette courte
- faire relire le tunnel de reservation a quelques utilisateurs cibles
- acter la demande de reservation validee par le coach comme logique MVP

## 3. Phase 1 - Fondations produit

### Objectif

Poser la structure minimum de la plateforme.

### Taches

- creer les roles `sportif`, `coach`, `admin`
- mettre en place l'authentification
- definir le modele de donnees principal
- mettre en place la navigation publique
- preparer la logique email de base

## 4. Phase 2 - Acquisition publique

### Objectif

Permettre a un sportif de trouver un coach.

### Taches

- home page
- recherche par sport et ville
- resultats de recherche
- fiche coach
- badge coach verifie

## 5. Phase 3 - Reservation

### Objectif

Permettre de choisir une offre et un rendez-vous.

### Taches

- modele des offres coach
- page choix de la seance
- page choix du creneau
- recap de demande de reservation
- gestion du statut reservation
- validation / refus cote coach

### Decision cle

- la logique MVP retenue est la demande de reservation controlee par le coach

## 6. Phase 4 - Paiement

### Objectif

Confirmer une reservation par paiement.

### Taches

- integration Stripe
- page paiement
- confirmation de reservation apres validation coach
- emails de confirmation
- gestion des echecs paiement

## 7. Phase 5 - Espace coach

### Objectif

Donner une vraie valeur aux coachs.

### Taches

- onboarding coach
- edition profil coach
- creation / edition des offres
- disponibilites ou demandes
- dashboard coach
- liste des reservations coach

## 8. Phase 6 - Back-office admin

### Objectif

Permettre un pilotage humain simple du MVP.

### Taches

- liste des coachs
- verification coach
- liste des reservations
- recherche simple
- vue statuts paiement / reservation

## 9. Phase 7 - Finition beta

### Objectif

Preparer le MVP a etre teste dans la vraie vie.

### Taches

- avis post-seance
- gestion simple d'annulation
- ajustements UX
- textes de reassurance
- suivi minimum des indicateurs

## 10. Definition de done du MVP

Le MVP est livrable quand :

- un coach peut creer un profil complet
- un admin peut verifier ce profil
- un sportif peut le trouver
- un sportif peut envoyer une demande
- un coach peut valider
- un sportif peut payer apres validation
- le coach peut suivre la reservation
- l'admin peut intervenir en cas de probleme

## 11. Cartes Trello recommandees

### Produit

- `Formaliser la demande de reservation validee par le coach`
- `Definir les champs du profil coach`
- `Definir les champs de l'offre coach`
- `Definir les statuts de reservation`
- `Definir les regles d'avis post-seance`

### Dev

- `Mettre en place l'authentification`
- `Construire la home`
- `Construire la recherche coach`
- `Construire la fiche coach`
- `Construire le tunnel de reservation`
- `Integrer Stripe`
- `Construire le dashboard coach`
- `Construire le back-office admin minimum`

### QA / validation

- `Tester le parcours sportif de bout en bout`
- `Tester le parcours coach de bout en bout`
- `Tester les cas d'echec paiement`
- `Valider la recherche mobile`
- `Valider la lisibilite des profils coach`
