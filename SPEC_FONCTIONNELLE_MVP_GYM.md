# GetYourMentor - Specification fonctionnelle MVP

## 1. Objet

Ce document transforme le document maitre et le cadrage MVP en specification fonctionnelle exploitable.

Objectif :
- definir precisement ce que le MVP doit faire
- limiter le scope
- faciliter la discussion avec un developpeur ou une equipe produit

## 2. Perimetre du MVP

Le MVP GetYourMentor est un site web responsive de reservation de coaching sportif individuel.

Le MVP doit permettre :
- a un sportif de trouver un coach
- a un sportif de consulter un profil coach
- a un sportif de reserver ou demander une seance
- a un sportif de payer en ligne
- a un coach de creer et gerer son profil
- a un coach de recevoir et gerer des reservations
- a un admin de verifier les coachs et suivre les reservations

Le MVP ne doit pas chercher a couvrir toutes les idees du projet.

## 3. Utilisateurs du MVP

### Sportif

Utilisateur qui cherche un coach, consulte des profils, reserve une seance et paie.

### Coach

Professionnel qui cree son profil, propose des seances, gere ses reservations et suit son activite de base.

### Admin

Utilisateur interne qui verifie les coachs, surveille les reservations et gere les cas bloquants.

### Club

Hors coeur du MVP. Le club n'entre que sous forme de profil vitrine ou de prise de contact.

## 4. Parcours principal a valider

1. le sportif arrive sur le site
2. il recherche un coach par sport et ville
3. il consulte une liste de resultats
4. il ouvre la fiche d'un coach
5. il choisit un type de seance
6. il choisit un creneau ou envoie une demande de reservation
7. il se connecte ou cree son compte
8. il confirme sa reservation
9. il paie
10. il recoit une confirmation

Ce parcours est le coeur du MVP. Si lui fonctionne, le MVP remplit sa mission initiale.

## 5. Entites fonctionnelles

### Utilisateur

Champs minimum :
- id
- role : `sportif`, `coach`, `admin`
- prenom
- nom
- email
- telephone
- mot de passe hash
- date_creation
- statut_compte

### Profil coach

Champs minimum :
- user_id
- photo
- bio
- disciplines
- ville
- zone_intervention
- diplomes
- experience
- tarifs
- types_seances
- disponibilites
- statut_verification
- note_moyenne

### Seance ou offre

Champs minimum :
- id
- coach_id
- titre
- type
- duree
- prix
- lieu
- description
- actif

### Reservation

Champs minimum :
- id
- sportif_id
- coach_id
- offre_id
- date_heure
- statut
- montant
- statut_paiement
- reference_paiement

### Avis

Champs minimum :
- id
- reservation_id
- coach_id
- sportif_id
- note
- commentaire
- statut_publication

## 6. Regles metier principales

### Regles coach

- un coach ne peut pas etre visible publiquement si son profil n'est pas au minimum complet
- un coach doit etre marque `verifie` par l'admin pour afficher le badge de confiance
- un coach peut modifier son profil, ses offres et ses disponibilites

### Regles sportif

- un sportif peut rechercher sans compte
- un sportif doit creer un compte avant de confirmer une reservation
- un sportif ne peut laisser un avis qu'apres une reservation terminee

### Regles reservation

- une reservation doit contenir un coach, une offre, une date et un montant
- une reservation doit passer par un statut clair
- le paiement doit etre trace

### Regles paiement

- le paiement en ligne est obligatoire pour confirmer automatiquement une reservation payante
- si la logique choisie est une demande manuelle, le paiement peut etre declenche seulement apres validation du coach

## 7. Etats fonctionnels

### Statuts reservation recommandes

- `draft`
- `pending_confirmation`
- `confirmed`
- `cancelled`
- `completed`

### Statuts paiement recommandes

- `not_started`
- `pending`
- `paid`
- `failed`
- `refunded`

### Statuts verification coach recommandes

- `incomplete`
- `submitted`
- `verified`
- `rejected`

## 8. Ecran par ecran - exigences fonctionnelles

### Ecran 1 - Home

Objectif :
- lancer la recherche rapidement

Fonctions minimum :
- afficher la promesse du service
- proposer une recherche par sport et ville
- rediriger vers la liste des resultats
- mettre en avant la confiance : verification, reservation simple, paiement securise

Conditions de reussite :
- un utilisateur comprend le service en quelques secondes
- l'action principale est visible sans chercher

### Ecran 2 - Resultats de recherche

Objectif :
- comparer des coachs

Fonctions minimum :
- afficher la liste des coachs correspondant a la recherche
- filtrer par sport, ville, budget et disponibilite
- afficher photo, nom, discipline, ville, prix de depart et note
- permettre l'acces a la fiche coach

Conditions de reussite :
- la comparaison est lisible
- les informations clefs sont visibles sans ouvrir chaque profil

### Ecran 3 - Fiche coach

Objectif :
- convertir vers la reservation

Fonctions minimum :
- afficher photo, bio, disciplines, diplomes, tarifs, offres et avis
- afficher un bloc de reservation visible
- permettre de contacter le coach
- afficher le badge `coach verifie` si applicable

Conditions de reussite :
- un sportif peut comprendre qui est le coach et ce qu'il propose
- le CTA `Reserver` est clair

### Ecran 4 - Choix de la seance

Objectif :
- faire choisir une offre

Fonctions minimum :
- afficher les types de seances proposes
- afficher duree, prix, description et lieu si utile
- permettre de selectionner une offre

Conditions de reussite :
- le prix et la proposition de valeur sont immediatement lisibles

### Ecran 5 - Choix du creneau

Objectif :
- selectionner une date et une heure

Fonctions minimum :
- afficher les disponibilites du coach
- permettre la selection d'un creneau
- afficher un recap de l'offre choisie

Alternative MVP :
- si le calendrier est trop complexe, remplacer par une demande de reservation avec 2 a 3 choix preferes

Conditions de reussite :
- l'utilisateur sait exactement quel rendez-vous il demande ou reserve

### Ecran 6 - Connexion / inscription

Objectif :
- identifier l'utilisateur

Fonctions minimum :
- connexion email / mot de passe
- creation de compte rapide
- acceptation CGU

Conditions de reussite :
- peu de friction
- pas de champs inutiles

### Ecran 7 - Confirmation

Objectif :
- verifier avant paiement

Fonctions minimum :
- afficher le recap complet de la reservation
- afficher les conditions d'annulation
- lancer le paiement

### Ecran 8 - Paiement

Objectif :
- finaliser la transaction

Fonctions minimum :
- integrer Stripe ou equivalent
- valider le paiement
- mettre a jour le statut de paiement

Conditions de reussite :
- paiement trace
- gestion simple des cas d'echec

### Ecran 9 - Reservation confirmee

Objectif :
- rassurer

Fonctions minimum :
- afficher le recap final
- permettre l'acces aux reservations
- envoyer une confirmation email

### Ecran 10 - Espace sportif

Objectif :
- suivre ses seances

Fonctions minimum :
- voir les reservations a venir
- voir les reservations passees
- acceder au detail
- laisser un avis apres seance terminee

### Ecran 11 - Onboarding coach

Objectif :
- creer un profil exploitable

Fonctions minimum :
- saisir informations personnelles
- ajouter photo, bio, disciplines, diplomes, ville, tarifs
- ajouter donnees bancaires
- proposer au moins une offre

Condition de reussite :
- un coach complete peut etre envoye en verification

### Ecran 12 - Dashboard coach

Objectif :
- gerer l'activite de base

Fonctions minimum :
- afficher les demandes recentes
- afficher les reservations a venir
- afficher les paiements recus
- acceder a l'edition du profil

### Ecran 13 - Gestion profil coach

Fonctions minimum :
- modifier bio, photo, disciplines, tarifs, offres, disponibilites

### Ecran 14 - Reservations coach

Fonctions minimum :
- voir demandes recues
- accepter ou refuser si reservation manuelle
- suivre reservations confirmees et annulees

### Ecran 15 - Admin coachs

Fonctions minimum :
- lister les coachs
- voir completude profil
- verifier ou refuser un coach

### Ecran 16 - Admin reservations

Fonctions minimum :
- lister les reservations
- voir paiement et statut
- rechercher un dossier simple

## 9. Messagerie MVP

Le MVP peut rester simple.

Option recommandee :
- une messagerie minimale liee a une reservation ou a une prise de contact

Option encore plus simple :
- formulaire de contact interne avec notification email

Decision produit recommandee :
- commencer par un systeme de contact leger, pas un chat temps reel complet

## 10. Notifications MVP

Notifications minimum :
- creation de compte
- demande ou confirmation de reservation
- paiement valide
- reservation annulee
- demande recue pour le coach

Canaux minimum :
- email

Canaux optionnels plus tard :
- SMS
- push

## 11. Gestion des clubs dans le MVP

Le club n'est pas une vraie brique produit du MVP.

Ce qui est accepte :
- une page vitrine club
- un formulaire de prise de contact

Ce qui est reporte :
- gestion des membres
- gestion multi-coachs
- gestion evenementielle

## 12. Exclusions confirmees

Ne pas developper dans le MVP :
- V2 / V3
- IA
- analyse video
- contenus payants
- club virtuel
- statistiques avancees
- forum

## 13. Criteres de validation du MVP

Le MVP est considere comme valide si :

1. un coach peut creer un profil complet
2. un admin peut verifier ce coach
3. un sportif peut le trouver dans la recherche
4. un sportif peut reserver ou demander une seance
5. un sportif peut payer
6. le coach voit la reservation
7. l'admin peut suivre la reservation

## 14. Decisions produit recommandees maintenant

Pour reduire le risque et accelerer le lancement :

1. demarrer avec un systeme de reservation simple
2. si besoin, utiliser au debut une demande de reservation plutot qu'un agenda complexe
3. limiter le nombre de filtres de recherche
4. limiter les types d'offres au strict utile
5. garder la messagerie tres legere

