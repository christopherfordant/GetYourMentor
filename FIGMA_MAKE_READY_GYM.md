# GetYourMentor - Figma Make Ready

## 1. Usage simple

Ce fichier sert de point d'entree unique pour `Figma Make`.

Utilisation recommandee :

1. creer un nouveau fichier dans `Figma Make`
2. joindre ce fichier au prompt si Figma te propose d'attacher un document
3. coller le prompt principal ci-dessous
4. demander d'abord `Home`, `Search Results` et `Coach Profile`
5. iterer ensuite sur le tunnel de demande

## 2. Prompt principal a coller dans Figma Make

```text
Create a responsive web app prototype for a sports coaching marketplace called GetYourMentor.

The product should feel inspired by Planity in its clarity and request-first UX, but adapted to sports coaching. Do not copy another brand. The interface must feel premium, reassuring, clean, fast to understand, and strongly conversion-oriented.

Core product logic:
- this is a web-first product, not a native mobile app
- the MVP booking flow is not instant booking
- the athlete chooses a coach and a session
- the athlete proposes one to three preferred timeslots
- the coach accepts or refuses the request
- payment happens only after coach approval
- all visible UI copy should be in French by default
- include a language selector with French as default and English as secondary option
- only show these 4 sports in the MVP: football, basketball, fitness, combat sports

Target users:
- athletes looking for a coach near them
- coaches who want visibility and booking requests

Primary user journey:
1. search by sport and city
2. browse coach results
3. open a coach profile
4. choose a session type
5. choose one to three preferred timeslots
6. sign up or log in
7. review and send a booking request
8. wait for coach approval
9. pay after approval
10. view final booking confirmation

Design direction:
- dark premium background
- charcoal surfaces
- light typography
- vivid orange accent color for primary actions
- mobile-first layout
- strong trust signals
- clear CTA buttons
- premium but calm visual rhythm

Style tokens:
- background: #0B0D10
- surface: #13171C
- surface soft: #191F26
- primary text: #F3EFE8
- secondary text: #A6AFBC
- accent: #FF8A3D
- accent dark: #D96A24
- success: #28B56F
- border: #2A313B

Typography:
- use a modern clean sans serif similar to Manrope
- readable, premium, not futuristic
- optional elegant editorial accent for some titles only

Layout constraints:
- use a strict spacing system based on 8, 12, 16, 24, 32, 48, 64, 80
- keep all content aligned to a clear responsive grid
- mobile reference width around 390px
- desktop container max width around 1200px
- keep 20px side padding on mobile and around 80px outer spacing on desktop
- use consistent border radius across inputs, cards, and buttons
- buttons and inputs should be at least 52px tall
- make tabs, buttons, cards, and form fields perfectly aligned
- ensure elements are visually centered and never floating randomly
- keep all screens realistically responsive and developer-friendly

Grid rules:
- mobile: 4 columns, 12px gutters
- tablet: 8 columns, 16px gutters
- desktop: 12 columns, 24px gutters

Component rules:
- buttons radius around 16px
- inputs radius around 16px
- cards radius around 20px
- booking summary blocks radius around 24px
- coach cards must have the same padding and visual rhythm
- tabs must be the same width and perfectly aligned

Create the following screens:
- Home
- Search Results
- Coach Profile
- Session Choice
- Preferred Timeslot Selection
- Login / Sign Up
- Booking Request Review
- Request Sent
- Coach Dashboard

Screen content expectations:

Home:
- clean header with logo, become a coach, login, sign up
- language selector visible but discreet
- hero title focused on finding the right coach nearby
- subtitle mentioning basketball, football, combat sports, fitness
- search bar with sport field and city field
- strong primary CTA: Find a coach
- 3 trust points: verified coaches, simple request flow, secure payment
- simple how-it-works section in 3 steps
- testimonials section
- final CTA section

Search Results:
- page title with city and sport
- filter bar with sport, city, budget, availability, rating
- coach cards with photo, name, specialty, city, price from, rating, tags, and profile CTA
- highly scannable layout

Coach Profile:
- large coach photo
- name, specialty, city, rating, reviews, verified badge
- sticky request card with price and request CTA
- about section
- specialties section
- diplomas or certifications section
- offered sessions section
- reviews section

Session Choice:
- coach summary
- session cards for individual session, session pack, and remote video analysis
- each card must show duration, price, short description, and choose button

Preferred Timeslot Selection:
- instruction that the user can select up to 3 preferred timeslots
- visible date and time options
- booking summary card with coach, session, duration, price
- CTA to continue

Login / Sign Up:
- title about sending the request
- tabs for login and sign up
- simple sign up form
- reassurance block about secure request flow and payment after approval

Booking Request Review:
- booking summary
- coach name
- session type
- preferred date and time choices
- location
- total price
- a clear explanation that payment happens only after coach approval
- primary send-request button

Request Sent:
- success state
- coach name
- selected session
- reminder that the coach will validate or refuse
- summary of preferred timeslots sent
- CTA to view requests or contact the coach

Coach Dashboard:
- profile header
- edit profile button
- KPI cards for requests, upcoming bookings, reviews, earnings
- recent requests list with accept and refuse actions
- next sessions list
- profile completion block

Critical product rule:
- never show instant booking as the main logic
- always make it clear that the coach validates the request first
- payment should be shown only after approval

Output expectation:
- create a coherent, premium, responsive prototype
- prioritize trust, clarity, and fast understanding
- keep the design realistic to build later in Next.js
- keep all main navigation and interface labels in French
- dark theme should be the default visual direction
```

## 3. Microcopy de base a injecter

### Home

- Hero title: `Trouvez le coach qu'il vous faut. Pres de chez vous.`
- Hero subtitle: `Basket, football, sports de combat, fitness : trouvez un coach verifie, consultez son profil et envoyez une demande de reservation en quelques etapes.`
- Language selector: `FR` actif, `EN` secondaire
- Search CTA: `Trouver un coach`
- Trust points: `Coachs verifies`, `Demande simple`, `Paiement securise`

### Search Results

- Page title: `Coachs disponibles a Marseille`
- Search summary: `Basketball - 24 resultats`
- Sports filter options: `Football`, `Basketball`, `Fitness`, `Sports de combat`
- Coach card example: `Steven Fordant`
- Coach subtitle: `Coach basketball individuel`
- Price: `A partir de 35 EUR`
- Rating: `4,9 (38 avis)`
- Primary CTA: `Voir le profil`

### Coach Profile

- Sticky block title: `Demander une reservation`
- Primary CTA: `Demander`
- Badge: `Coach verifie`

### Session Choice

- Title: `Choisissez votre seance`
- Card 1: `Seance individuelle`, `60 min`, `35 EUR`
- Card 2: `Pack 5 seances`, `5 x 60 min`, `165 EUR`
- Card 3: `Visio analyse video`, `30 min`, `20 EUR`

### Preferred Timeslot Selection

- Title: `Choisissez vos creneaux preferes`
- Subtitle: `Selectionnez jusqu'a 3 creneaux preferes pour aider le coach a vous repondre rapidement.`
- Primary CTA: `Continuer`

### Login / Sign Up

- Title: `Connectez-vous pour envoyer votre demande`
- Tabs: `Connexion`, `Inscription`
- Login CTA: `Se connecter`
- Signup CTA: `Creer mon compte`

### Booking Request Review

- Title: `Confirmez votre demande`
- Subtitle: `Verifiez les details avant d'envoyer votre demande au coach.`
- Payment reassurance: `Le coach recevra votre demande. Vous ne paierez qu'apres son acceptation.`
- Primary CTA: `Envoyer ma demande`

### Request Sent

- Title: `Votre demande a bien ete envoyee`
- Subtitle: `Le coach vous repondra rapidement. Vous recevrez egalement une confirmation par email.`
- CTA 1: `Voir mes reservations`
- CTA 2: `Contacter le coach`

### Coach Dashboard

- Title: `Bonjour Steven`
- Subtitle: `Voici un apercu de votre activite.`
- Primary CTA: `Modifier mon profil`

## 4. Sequence de travail recommandee

Commencer par ces 3 ecrans :

1. `Home`
2. `Search Results`
3. `Coach Profile`

Puis construire le tunnel :

1. `Session Choice`
2. `Preferred Timeslot Selection`
3. `Login / Sign Up`
4. `Booking Request Review`
5. `Request Sent`

Terminer par :

1. `Coach Dashboard`

## 5. Checklist de validation

Avant de garder une version de la maquette, verifier :

- le service est compris en moins de 5 secondes
- les CTA sont visibles sans effort
- la logique `demande puis validation coach` est evidente
- les boutons, champs et onglets sont bien alignes
- les marges laterales sont regulieres
- la fiche coach inspire confiance
- le prototype semble realiste a integrer plus tard

## 6. Documents source lies

- `DESIGN_SYSTEM_GYM.md`
- `RESPONSIVE_LAYOUT_GYM.md`
- `FIGMA_MAKE_PROMPTS_GYM.md`
- `FIGMA_MICROCOPY_3_ECRANS_GYM.md`
- `FIGMA_MICROCOPY_TUNNEL_GYM.md`
