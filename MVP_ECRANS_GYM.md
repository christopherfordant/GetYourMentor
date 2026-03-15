# GetYourMentor - MVP ecran par ecran

## 1. Principe

Ce document definit le MVP concret du site web GetYourMentor.

Objectif :
- permettre a un sportif de trouver un coach
- consulter son profil
- demander une reservation
- payer
- recevoir une confirmation
- permettre au coach de gerer ses demandes de base

Direction UX :
- site responsive
- style tres `Planity-like`
- experience de reservation simple
- pages lisibles
- preuve de confiance visible
- interface en francais par defaut avec selecteur de langue
- seulement 4 sports visibles dans le MVP : football, basketball, fitness, sports de combat

## 2. Parcours MVP principal

Le parcours principal du MVP est :

1. l'utilisateur arrive sur la home
2. il recherche un coach par sport et ville
3. il consulte les resultats
4. il ouvre la fiche coach
5. il choisit un type de seance puis propose des creneaux
6. il cree son compte ou se connecte
7. il envoie une demande de reservation
8. le coach valide la demande
9. il paie
10. il recoit la confirmation

## 3. Ecrans publics

### Ecran 1 - Home

But :
- expliquer la promesse
- lancer la recherche en quelques secondes

Blocs MVP :
- header avec logo, selecteur de langue, connexion, inscription
- hero avec promesse courte
- barre de recherche :
  - sport
  - ville ou code postal
- bouton `Trouver un coach`
- section `Comment ca marche`
- section `Coachs verifies`
- section `Avis / reassurance`
- footer

Notes UX :
- le hero doit pousser la recherche avant tout
- CTA principal visible immediatement
- mobile first
- les options de sport visibles sont limitees a 4

### Ecran 2 - Resultats de recherche

But :
- comparer rapidement plusieurs coachs

Blocs MVP :
- rappel de la recherche
- filtres simples :
  - sport
  - ville
  - budget
  - disponibilite
- liste de coachs en cartes

Options de sport visibles :
- football
- basketball
- fitness
- sports de combat

Carte coach :
- photo
- nom
- discipline
- ville
- courte description
- prix a partir de
- note
- bouton `Voir le profil`

Notes UX :
- interface tres scannable
- infos utiles au premier regard

### Ecran 3 - Fiche coach

But :
- convaincre
- rassurer
- convertir vers reservation

Blocs MVP :
- photo principale
- nom
- discipline
- localisation
- tarif ou tarifs
- note et avis
- presentation du coach
- diplomes ou certifications
- types de seances proposes
- disponibilites indicatives ou demande de reservation
- bouton `Demander une reservation`
- bouton `Contacter`

Blocs de confiance :
- coach verifie
- nombre de seances ou avis
- politique d'annulation simple

Notes UX :
- page longue mais tres claire
- CTA demande toujours visible

### Ecran 4 - Choix de la seance

But :
- faire choisir une offre simple

Blocs MVP :
- recap coach
- type de seance :
  - individuel
  - groupe si present
  - visio si present
- duree
- prix
- lieu
- bouton `Continuer`

Notes UX :
- peu d'options
- comprehension immediate du prix

### Ecran 5 - Choix du creneau

But :
- proposer des creneaux au coach

Blocs MVP :
- choix de 1 a 3 creneaux preferes
- date
- heure
- recap seance
- bouton `Envoyer ma demande`

Decision MVP :
- le sportif propose 1 a 3 creneaux
- le coach valide ensuite la demande
- le paiement intervient apres validation

### Ecran 6 - Connexion / Inscription

But :
- identifier l'utilisateur sans casser la conversion

Blocs MVP :
- connexion email + mot de passe
- inscription simple :
  - prenom
  - nom
  - email
  - telephone
  - mot de passe
- acceptation CGU

Notes UX :
- possible aussi apres selection du creneau
- parcours tres court

### Ecran 7 - Confirmation de reservation

But :
- verifier avant envoi de la demande

Blocs MVP :
- recap coach
- recap seance
- recap date / heure
- recap prix
- conditions d'annulation
- bouton `Envoyer ma demande`

### Ecran 8 - Paiement

But :
- finaliser la reservation apres validation du coach

Blocs MVP :
- recap commande
- module paiement securise
- bouton `Payer`

Notes MVP :
- Stripe recommande

### Ecran 9 - Reservation confirmee

But :
- rassurer et guider la suite

Blocs MVP :
- message de confirmation
- recap reservation
- bouton `Voir mes reservations`
- bouton `Contacter le coach`
- email de confirmation envoye

## 4. Espace sportif

### Ecran 10 - Mon compte sportif

Blocs MVP :
- infos personnelles
- reservations a venir
- reservations passees
- annulation ou deplacement si autorise
- messages

### Ecran 11 - Mes rendez-vous

Blocs MVP :
- liste des seances
- statut :
  - a venir
  - terminee
  - annulee
- action `Voir le detail`

### Ecran 12 - Laisser un avis

But :
- creer la confiance

Blocs MVP :
- note
- commentaire
- validation

## 5. Espace coach

### Ecran 13 - Onboarding coach

But :
- permettre au coach de creer son profil

Blocs MVP :
- informations personnelles
- disciplines
- ville / zone d'intervention
- presentation
- diplomes
- tarifs
- types de seances
- photo
- donnees bancaires

### Ecran 14 - Dashboard coach

Blocs MVP :
- resume du profil
- nouvelles demandes
- reservations a venir
- revenus ou paiements recus
- bouton `Modifier mon profil`

### Ecran 15 - Gestion du profil coach

Blocs MVP :
- edition bio
- edition tarifs
- edition disciplines
- edition photos
- edition disponibilites basiques

### Ecran 16 - Reservations coach

Blocs MVP :
- demandes recues
- confirmees
- annulees
- details du sportif
- action accepter / refuser si demande manuelle

## 6. Back-office admin minimum

### Ecran 17 - Admin coachs

Blocs MVP :
- liste des coachs
- statut verification
- profil complet / incomplet
- action `Verifier`

### Ecran 18 - Admin reservations

Blocs MVP :
- liste des reservations
- statut paiement
- statut reservation
- recherche simple

## 7. Ce qui n'entre pas dans ce MVP

- club virtuel
- contenus videos
- abonnement a des contenus
- forum
- IA
- analyse video
- statistiques avancees
- gamification
- marketplace complexe multi-clubs

## 8. Ordre de conception des maquettes

Faites les maquettes dans cet ordre :

1. Home
2. Resultats de recherche
3. Fiche coach
4. Choix seance
5. Choix creneau
6. Connexion / inscription
7. Confirmation / paiement
8. Dashboard coach
9. Gestion reservations coach

## 9. Definition du vrai MVP

Si vous voulez aller encore plus vite, le coeur absolu du MVP est seulement :

- Home
- Resultats de recherche
- Fiche coach
- Demande de reservation
- Paiement
- Confirmation
- Dashboard coach minimum

Tout le reste peut etre simplifie ou gere manuellement au debut.

