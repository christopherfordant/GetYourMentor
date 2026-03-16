# GetYourMentor - Roadmap technique MVP

## 1. Objectif

Construire le MVP le plus vite possible sans casser :
- le parcours sportif
- le parcours coach
- la logique de demande de reservation
- la securite

## 2. Phase 0 - Prototype et cadrage infra

But :

- valider le produit sans surpayer trop tot

Livrables :

- environnements de travail `dev` et `preview`
- usage possible de `Supabase Free` en prototypage
- usage possible de `Vercel Hobby` pour previews internes
- budget cap et checklist de passage en prod
- choix conserve de l'architecture cible : `Supabase + Vercel + Stripe + provider email transactionnel`

## 3. Phase 1 - Socle

But :
- poser l'application

Livrables :
- projet `Next.js + TypeScript + Tailwind`
- connexion `Supabase`
- environnement `Vercel`
- base de layout responsive
- design tokens de base

## 4. Phase 2 - Donnees et auth

But :
- rendre les comptes et profils possibles

Livrables :
- schema SQL MVP
- `profiles`
- `coach_profiles`
- `coach_offers`
- `booking_requests`
- auth email/password
- RLS de base

## 5. Phase 3 - Acquisition publique

But :
- permettre de trouver un coach

Livrables :
- home
- resultats de recherche
- fiche coach
- recherche par sport et ville

## 6. Phase 4 - Demande de reservation

But :
- permettre d'envoyer une demande claire

Livrables :
- choix de l'offre
- choix de 1 a 3 creneaux
- recap de demande
- creation de la demande en base
- email "demande envoyee"

## 7. Phase 5 - Espace coach

But :
- donner la main au coach

Livrables :
- onboarding coach
- edition du profil
- edition des offres
- dashboard coach
- liste des demandes
- accepter / refuser

## 8. Phase 6 - Paiement apres validation

But :
- transformer une demande acceptee en reservation payee

Livrables :
- creation session Stripe
- email "votre demande a ete acceptee"
- page paiement
- webhook Stripe
- passage en `confirmed`

## 9. Phase 7 - Admin minimum

But :
- garder le controle humain du MVP

Livrables :
- liste coachs
- verification coach
- liste reservations
- recherche simple
- suivi des statuts

## 10. Phase 8 - Stabilisation et preproduction

But :
- rendre le MVP testable en vrai

Livrables :
- avis post-seance
- annulation simple
- emails finalises
- Playwright sur le tunnel critique
- monitoring basique
- passage `Supabase Pro` avant beta externe
- passage `Vercel Pro` avant mise en ligne commerciale
- domaine custom configure
- provider email transactionnel configure et teste
- sauvegardes, logs et plafonds budget verifies

## 11. Ce qu'il faut repousser

Repousser apres MVP :
- agenda instantane
- chat temps reel
- contenus payants
- IA
- club virtuel
- application mobile native

## 12. Definition de done technique

Le MVP est techniquement pret si :

- un coach peut completer son profil
- un admin peut le verifier
- un sportif peut l'ouvrir dans la recherche
- un sportif peut envoyer une demande
- un coach peut accepter
- un sportif peut payer apres acceptation
- la reservation passe bien en `confirmed`
- les emails critiques partent
- l'infrastructure critique est sur des plans compatibles production

