# GetYourMentor - Checklist build site

## 1. Cadrage

- document maitre valide
- scope MVP fige
- 4 sports figes
- langue `fr` par defaut figee
- theme sombre premium fige
- logique demande + validation coach figee

## 2. Design

- home validee
- resultats valides
- fiche coach validee
- tunnel valide
- ecran paiement visible
- ecran reservation confirmee visible
- module fidelite visible
- filtres MVP visibles
- responsive mobile / tablette / desktop valide

## 3. Data

- schema Supabase cree
- tables produit creees
- statuts reservation definis
- statuts paiement definis
- preferences langue gerees
- progression fidelite geree

## 4. Auth et comptes

- compte sportif
- compte coach
- compte admin
- connexion / inscription
- langue preferee persistante

## 5. Recherche

- recherche sport
- recherche ville
- filtre genre du coach
- filtre interieur / exterieur
- filtre niveau
- filtre format
- filtre budget
- filtre disponibilite
- filtre note
- filtre coach verifie

## 6. Tunnel de reservation

- choix seance
- choix 1 a 3 creneaux
- recap demande
- envoi demande
- acceptation coach
- refus coach
- paiement apres acceptation
- confirmation finale

## 7. Coach

- profil coach
- edition du profil
- creation d'offres
- vue demandes
- accepter / refuser
- dashboard coach

## 8. Sportif

- compte sportif
- reservations a venir
- reservations passees
- avis post-seance
- module fidelite

## 9. Paiement

- Stripe Checkout branche
- page paiement
- webhook Stripe
- mise a jour `paid`
- mise a jour `confirmed`
- echec paiement gere

## 10. Emails

- demande envoyee
- demande acceptee
- demande refusee
- paiement a faire
- reservation confirmee
- demande d'avis

## 11. I18n

- `fr` disponible
- `en` disponible
- fallback `fr`
- detection automatique
- override manuel

## 12. Admin

- verification coach
- liste reservations
- liste paiements
- statuts visibles

## 13. IA et automatisation

- Trello -> Supabase
- brief hebdo
- journal decisions
- memoire commerciale plus tard
- ingestion docs plus tard

## 14. Securite

- RLS active
- secrets non exposes
- webhooks verifies
- uploads controles
- validations serveur

## 15. Infrastructure

- environnement `dev` distinct
- environnement `preview` distinct
- `Supabase Pro` prevu avant beta externe
- `Vercel Pro` prevu avant mise en ligne commerciale
- domaine custom configure
- budget mensuel infra valide
- spend caps / alertes budget verifiees
- provider email transactionnel choisi et teste

## 16. QA

- test home > recherche > fiche
- test demande > acceptation > paiement
- test refus coach
- test changement langue
- test fidelite
- test mobile

## 17. Lancement beta

- premiers coachs onboardes
- premiers sportifs invites
- emails verifies
- analytics de base poses
- support manuel prevu en cas de blocage
