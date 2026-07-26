# Contexte RAG Local GYM

## But

Conserver une memoire projet compacte, lisible et priorisee afin d'eviter la perte de contexte entre les phases, les prompts metiers et les futures conversations.

## Source de verite

Priorite documentaire :

1. `DOCUMENT_MAITRE_GYM.md`
2. `Bussiness Plan.pdf`
3. `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf`
4. `Copie de Devis DEV - GetYourMentor.pdf`
5. `MVP_ECRANS_GYM.md`
6. `DESIGN_SYSTEM_GYM.md`
7. `MIGRATION_NEXT_GYM.md`
8. `ARCHITECTURE_MEMOIRE_GYM.md`
9. `governance/roles/*.md`
10. le code actif

## Fil rouge actif

GetYourMentor doit rester une plateforme web responsive, orientee reservation sportive, avec un tunnel simple de type Planity adapte au coaching sportif, en priorisant la confiance, la lisibilite, la friction minimale et la preuve de valeur du MVP.

## Roles actives dans la gouvernance

- `CTO`
- `PRODUCT`
- `DESIGN`
- `DEVOPS`
- `QA`
- `SEO`
- `SUPERVISEUR FIL ROUGE`

## Routes Next.js actuellement actives

- `/`
- `/recherche`
- `/coachs`
- `/coach`
- `/creneau`
- `/recapitulatif`
- `/paiement`
- `/compte`
- `/inscription-club`

## Correspondance prototype vers Next.js

- `prototype-site/accueil.html` -> `/`
- `prototype-site/recherche-coachs.html` -> `/recherche`
- `prototype-site/selection-coachs.html` -> `/coachs`
- `prototype-site/reserver-seance.html` -> `/coach`
- `prototype-site/choix-coach-creneau.html` -> `/creneau`
- `prototype-site/reservation-recapitulatif.html` -> `/recapitulatif`
- `prototype-site/paiement.html` -> `/paiement`
- `prototype-site/compte.html` -> `/compte`
- `prototype-site/inscription-club.html` -> `/inscription-club`

## Regles de protection de l'existant

- ne pas casser les parcours deja valides
- ne pas perdre les images, fonds, contenus ni liens metier
- ne pas moderniser une page si la consigne est de migrer a l'identique
- ne pas melanger V2/V3 avec le coeur MVP
- ne pas modifier une page sans verifier sa user story et sa source prioritaire

## Priorites produit immediates

1. conserver un tunnel reservation coherent
2. maintenir la parite prototype / Next sur les pages migrées
3. stabiliser les dashboards sans complexifier le MVP sportif
4. maintenir une gouvernance documentaire actionnable

## Risques connus a surveiller

- divergence entre prototype HTML et rendu Next.js
- casse des liens metier entre pages
- oubli d'images ou de textes lors des migrations
- derive du scope club ou dashboard au detriment du tunnel sportif
- perte de contexte entre conversations longues

## Usage

Ce fichier doit etre relu avant toute phase importante et mis a jour des qu'un changement structurel est confirme.
