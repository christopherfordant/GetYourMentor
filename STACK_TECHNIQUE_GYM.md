# GetYourMentor - Stack technique recommandee

## 1. Choix final

Pour le MVP web de GetYourMentor, la stack recommandee est :

- `Next.js` avec `App Router`
- `TypeScript` en mode `strict`
- `Tailwind CSS`
- `shadcn/ui` comme base de primitives, puis personnalisation forte pour le rendu "Planity-like"
- `Supabase` pour `Postgres + Auth + Storage`
- `supabase-js` avec types TypeScript generes depuis la base
- `Stripe Checkout` pour le paiement MVP
- `Resend` pour les emails transactionnels
- `Vercel` pour le deploiement
- `n8n` pour l'automatisation hors coeur produit
- `Playwright` pour les tests E2E du tunnel principal
- `pnpm` comme gestionnaire de paquets

## 2. Pourquoi cette stack est la meilleure pour GYM

Cette stack colle bien a votre projet pour 5 raisons :

1. elle permet de lancer vite un site web responsive
2. elle colle au MVP "demande de reservation validee par le coach"
3. elle limite le nombre de briques techniques a maintenir
4. elle est compatible avec votre logique `Supabase + n8n`
5. elle reste evolutive si GYM grossit ensuite

## 3. Architecture recommandee

### Frontend

- `Next.js App Router`
- pages publiques
- pages athletes
- pages coachs
- back-office admin minimum

### Backend applicatif

- `Server Functions` pour les mutations simples
- `Route Handlers` pour les endpoints techniques ou externes :
  - webhook Stripe
  - webhook Resend si utile
  - endpoints admin ou de synchronisation

### Donnees

- `Supabase Postgres` comme base principale
- `Row Level Security` sur les tables exposees
- policies par role : sportif, coach, admin

### Fichiers

- `Supabase Storage` pour :
  - photos coachs
  - pieces justificatives si necessaire

### Paiement

- `Stripe Checkout Sessions` pour le MVP

### Email

- `Resend` pour les emails de la plateforme
- `SMTP custom` sur Supabase Auth pour les emails d'authentification si vous gardez Supabase Auth

### Automatisation

- `n8n` en dehors du chemin critique du booking
- utiliser `n8n` pour :
  - sync Trello
  - resumes
  - memoire projet
  - relances CRM

## 4. Choix techniques exacts

### 4.1 Framework

Choix :
- `Next.js App Router`

Pourquoi :
- full-stack web
- adapte au SSR / SEO / pages publiques
- bon support des mutations via Server Functions
- bon support des `Route Handlers`
- deploiement tres simple sur Vercel

Decision :
- ne pas partir sur une app mobile native au debut

### 4.2 Langage

Choix :
- `TypeScript`

Regle :
- activer `strict`

Pourquoi :
- meilleur controle des donnees
- utile avec `supabase-js` et les types generes
- limite les erreurs produit sur les objets critiques : coach, offre, demande, paiement

### 4.3 UI et style

Choix :
- `Tailwind CSS`
- `shadcn/ui` uniquement comme base de composants

Pourquoi :
- rapidite d'execution
- bonne compatibilite avec Next.js
- personnalisation facile
- ideal pour construire une UI tres propre et tres precise

Regle importante :
- ne pas garder le look par defaut de `shadcn/ui`
- s'en servir comme fondation technique, pas comme design final

### 4.4 Base de donnees

Choix :
- `Supabase Postgres`

Pourquoi :
- base relationnelle parfaite pour :
  - users
  - coach_profiles
  - offers
  - booking_requests
  - payments
  - reviews
- deja coherente avec votre projet memoire `Supabase + pgvector`

### 4.5 Acces aux donnees

Choix :
- `supabase-js`
- types generes depuis la base
- SQL migrations pour les changements structurants

Pourquoi :
- moins de complexite qu'un ORM ajoute trop tot
- plus direct pour un MVP
- tres bien aligne avec RLS et les policies Supabase

Decision :
- ne pas ajouter `Prisma` ou `Drizzle` dans la v1 si l'equipe veut aller vite

### 4.6 Authentification

Choix :
- `Supabase Auth`
- email + mot de passe au lancement

Pourquoi :
- simple a mettre en place
- suffisant pour un MVP
- integre a RLS

Option plus tard :
- magic link
- OAuth

### 4.7 Stockage

Choix :
- `Supabase Storage`

Usage :
- photo de profil coach
- image de couverture si utile
- justificatifs de verification

### 4.8 Paiement

Choix MVP :
- `Stripe Checkout`

Pourquoi :
- plus rapide a mettre en place qu'un checkout entierement custom
- parfait pour votre flow : le coach accepte d'abord, le sportif paie ensuite
- bon compromis entre vitesse, fiabilite et securite

Decision :
- ne pas commencer par `Payment Element` si vous voulez sortir vite
- passer a un checkout integre plus tard seulement si la conversion l'exige

### 4.9 Email

Choix :
- `Resend`

Usage :
- demande envoyee
- demande acceptee
- demande refusee
- paiement a effectuer
- reservation confirmee

Pourquoi :
- tres simple cote dev
- bon fit avec Next.js / Node
- propre pour des emails transactionnels

### 4.10 Hebergement

Choix :
- `Vercel`

Pourquoi :
- hebergement optimise pour Next.js
- preview deploys tres utiles
- deployment zero-config pour un projet web comme GYM

### 4.11 Tests

Choix :
- `Playwright`

Usage :
- test du tunnel principal
- test recherche > fiche coach > demande > paiement apres validation
- test parcours coach

## 5. Ce qu'il ne faut pas utiliser au debut

Pour le MVP, ne pas ajouter :

- app mobile native
- microservices
- chat temps reel complexe
- agenda temps reel complet
- Algolia / Elastic
- architecture event-driven compliquee
- ORM supplementaire si vous n'en avez pas besoin
- dashboard analytics complexe

## 6. Structure de projet recommandee

```text
app/
  (marketing)/
  recherche/
  coach/[slug]/
  demande/
  compte/
  coach/
  admin/
  api/
components/
  ui/
  marketing/
  search/
  coach/
  booking/
  dashboard/
lib/
  supabase/
  stripe/
  resend/
  auth/
  validations/
  actions/
styles/
types/
tests/
supabase/
  migrations/
```

## 7. Modele de donnees de depart

Tables MVP recommandees :

- `profiles`
- `coach_profiles`
- `coach_disciplines`
- `coach_offers`
- `booking_requests`
- `booking_request_slots`
- `payments`
- `reviews`
- `club_leads`

Tables admin / support utiles :

- `coach_verification_requests`
- `email_logs`

## 8. Logique de reservation retenue

Flow retenu :

1. le sportif choisit une offre
2. il propose 1 a 3 creneaux
3. la demande est stockee en `pending_coach_validation`
4. le coach accepte ou refuse
5. si accepte, le sportif recoit un email pour payer
6. Stripe valide le paiement
7. la reservation passe en `confirmed`

## 9. Securite et bonnes pratiques

### Supabase

- activer `RLS` sur toutes les tables exposees
- ne jamais exposer la `service_role key` au frontend
- utiliser l'`anon key` seulement avec des policies strictes

### Next.js

- garder les actions sensibles cote serveur
- utiliser `Route Handlers` pour les webhooks Stripe

### Stripe

- valider les webhooks cote serveur
- ne jamais considerer un paiement comme valide sans verification webhook

### Storage

- policies precises sur les buckets
- upload restreint selon le role et le dossier

## 10. Environnements a prevoir

Variables d'environnement recommandees :

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `AUTH_SMTP_HOST`
- `AUTH_SMTP_PORT`
- `AUTH_SMTP_USER`
- `AUTH_SMTP_PASS`

## 11. Realite budgetaire et plans a retenir

Le document `GYM_Couts_Infrastructure Mensuel.xlsx` confirme que la stack retenue reste adaptee, mais avec un phasage d'infrastructure plus strict.

### Dev / prototype

- `Supabase Free` accepte pour dev interne
- `Vercel Hobby` accepte pour previews internes

### Beta privee / preprod

- `Supabase Pro` recommande avant exposition a de vrais testeurs
- `Vercel Pro` recommande avant usage commercial public

### Production

Socle prudent a retenir :

- `Supabase Pro` : environ `23 EUR/mois`
- `Vercel Pro` : environ `20 EUR/mois` pour 1 seat
- emails transactionnels : budget variable selon provider et volume

Decision maintenue :

- on garde `Resend` comme choix MVP pour sa simplicite de dev
- `Brevo` reste une alternative a revisiter si vous voulez unifier transactionnel + marketing

Regle simple du projet :

- `Resend` en phase MVP et lancement technique
- `Brevo` a reevaluer en phase croissance si GYM a besoin d'un outil plus large pour CRM, campagnes et marketing lifecycle

## 12. Ordre de build recommande

1. bootstrap Next.js + Tailwind + Supabase
2. auth + profils
3. recherche coach
4. fiche coach
5. demande de reservation
6. dashboard coach avec acceptation / refus
7. paiement Stripe apres acceptation
8. emails transactionnels
9. back-office admin
10. tests E2E Playwright

## 13. Decision finale

Si vous voulez aller vite sans sacrifier la qualite, la meilleure stack pour GYM est :

- `Next.js + TypeScript + Tailwind + shadcn/ui`
- `Supabase`
- `Stripe Checkout`
- `Resend`
- `Vercel`
- `n8n` hors coeur produit

## 14. Sources officielles

- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
- Next.js Server Functions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data
- Next.js testing with Playwright: https://nextjs.org/docs/app/guides/testing/playwright
- Vercel for Next.js: https://vercel.com/docs/frameworks/nextjs
- Tailwind CSS: https://tailwindcss.com/docs/installation
- shadcn/ui: https://ui.shadcn.com/
- Supabase docs: https://supabase.com/docs
- Supabase password auth: https://supabase.com/docs/guides/auth/passwords
- Supabase TypeScript support: https://supabase.com/docs/reference/javascript/typescript-support
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase secure data: https://supabase.com/docs/guides/database/secure-data
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Storage CDN: https://supabase.com/docs/guides/storage/cdn/fundamentals
- Stripe Checkout quickstarts: https://docs.stripe.com/payments/checkout/quickstarts
- Resend homepage / Node example: https://www.resend.com/
- Resend sender/domain setup: https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend
- pnpm: https://pnpm.io/
- Zod: https://zod.dev/

