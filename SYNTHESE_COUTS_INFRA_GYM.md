# GetYourMentor - Synthese couts infrastructure

## 1. Source prise en compte

Document ajoute :

- `GYM_Couts_Infrastructure Mensuel.xlsx`

Version historique comparee :

- `Dossier Business Plan/GYM_Couts_Infrastructure Mensuel.xlsx`

Constat :

- les deux versions portent la meme logique de chiffrage
- la nouvelle version a ete integree comme reference active

## 2. Ce que le fichier confirme

Le document confirme que l'architecture deja retenue pour GYM reste bonne :

- `Supabase` pour `BDD + Auth + Storage`
- `Vercel` pour l'hebergement web `Next.js`
- `Stripe` pour le paiement
- un provider email transactionnel dedie

Le document apporte surtout une meilleure lecture du passage entre :

- prototype / dev
- beta privee
- production commerciale

## 3. Decisions retenues apres lecture

### Supabase

- `Free` peut servir pour prototypage et dev interne
- `Pro` devient le minimum recommande des la beta serieuse / preproduction
- raison principale : backups, logs, absence de pause automatique, meilleur cadre de prod

Decision GYM :

- garder `Supabase`
- prevoir le passage en `Pro` avant tout usage public reel

### Vercel

- `Hobby` peut servir pour maquettes, previews et tests internes
- `Hobby` ne doit pas etre considere comme plan de production commerciale
- `Pro` devient le plan cible des la mise en ligne publique

Decision GYM :

- garder `Vercel`
- prevoir `Vercel Pro` des la mise en production

### Emails

Le classeur compare `Brevo`, alors que la stack actuelle recommande `Resend`.

Lecture senior :

- `Resend` reste un tres bon choix dev pour le MVP web `Next.js`
- `Brevo` reste une option valable si vous voulez plus tard regrouper transactionnel + marketing
- le nouveau fichier ne justifie pas a lui seul de changer la decision actuelle

Decision GYM :

- conserver `Resend` comme choix recommande MVP
- garder `Brevo` comme alternative budget / marketing a reevaluer plus tard

Regle officielle du projet :

- `Resend` pour le MVP et les emails transactionnels du site
- `Brevo` a reevaluer en phase croissance si l'objectif devient d'unifier transactionnel, marketing, relances et CRM email

### Stripe

Le classeur confirme que :

- les frais Stripe restent largement couverts par une commission GYM a `15%`
- la logique `paiement apres validation coach` reste viable economiquement

Decision GYM :

- conserver `Stripe Checkout`
- conserver l'hypothese de commission `15%` dans les simulations MVP

## 4. Budget mensuel infrastructure a retenir

### Phase 0 - Prototype interne

Usage recommande :

- `Supabase Free`
- `Vercel Hobby`
- pas de cout email critique

But :

- maquette
- validation produit
- dev local
- previews internes

### Phase 1 - Beta privee / preproduction

Usage recommande :

- `Supabase Pro`
- `Vercel Pro`
- email transactionnel dedie

Ordre de grandeur mensuel a retenir :

- `Supabase Pro` : ~`23 EUR/mois` selon taux USD/EUR
- `Vercel Pro` : ~`20 EUR/mois` pour 1 seat
- provider email transactionnel : ~`0 a 18 EUR/mois` selon volume et choix

Budget de base prudent :

- environ `45 a 65 EUR/mois` hors overages

### Phase 2 - Mise en production commerciale

Socle minimum recommande :

- `Supabase Pro`
- `Vercel Pro`
- domaine custom
- provider email transactionnel fiable
- `Stripe` variable selon transactions

Budget prudent de lancement production :

- environ `50 a 80 EUR/mois` fixes
- puis frais variables :
  - `Stripe`
  - overages eventuels `Supabase` / `Vercel`

## 5. Impact concret sur le phasage du projet

Le nouveau document ne change pas le MVP.

Il change surtout la facon de phaser l'infrastructure :

1. `dev / prototype`
   - stack identique
   - plans gratuits toleres

2. `beta privee`
   - migration vers `Supabase Pro`
   - migration vers `Vercel Pro`
   - sauvegardes, logs et budget caps actives

3. `production`
   - monitoring, domaine, emails, webhooks et depenses cadres

## 6. Recommandation finale

Le meilleur choix n'est pas de changer l'architecture.

Le meilleur choix est :

- garder l'architecture actuelle
- ajouter un phasage infra plus rigoureux
- reserver les plans payants a partir du moment ou le produit sort du simple prototype

En clair :

- vos choix techniques restent bons
- le nouveau classeur sert a mieux verrouiller le budget et le moment exact du passage en prod
