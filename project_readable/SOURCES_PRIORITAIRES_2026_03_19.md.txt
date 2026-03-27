# Sources prioritaires - 19 mars 2026

## 1. Documents devenus prioritaires

Les 3 documents suivants deviennent la base prioritaire du projet :

- `Bussiness Plan.pdf`
- `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf`
- `Copie de Devis DEV - GetYourMentor.pdf`

Ils passent avant les anciens fichiers historiques lorsqu'il faut trancher une decision produit, business ou execution.

## 2. Ce qu'ils fixent clairement

### Perimetre produit

- plateforme en `Francais`
- `4 sports` visibles au lancement :
  - football
  - basketball
  - sports de combat
  - remise en forme / fitness
- `4 interfaces utilisateurs` :
  - coach
  - sportif
  - etablissement / club
  - administrateur

### Logique coeur du MVP

- geolocalisation et recherche par rayon
- recherche coach / club
- filtres metier concrets
- gestion des seances et creneaux
- planning
- paiement en ligne
- verification d'identite et stockage securise
- messagerie
- rappels de reservation
- facturation
- systeme de mise en avant des coachs / clubs les plus actifs et mieux notes

### Filtres explicitement cites

- genre du coach
- lieu de pratique
- niveau
- format de cours
- budget
- disponibilite
- note
- coach verifie

### Regles de reservation / paiement citees

- annulation `48h avant` : `100%` de remboursement sportif
- annulation entre `48h` et `24h` : `50%` de remboursement sportif
- retenue de `15%` de commission coach
- blocage automatique des reservations lorsque le creneau est complet
- code de reservation a remettre au coach

## 3. Ce que le devis change dans notre lecture

Le devis confirme une `V1 complete`, plus large que le MVP ultra-minimal, avec :

- `Next.js`
- `Supabase`
- `Stripe`
- `RLS`
- profils par roles
- documents et validation admin
- localisation et filtres
- seances et creneaux
- planning
- messagerie temps reel
- back-office administrateur
- mobile `React Native`

Il chiffre l'ensemble a :

- `21 900 EUR HT`
- environ `625 heures`
- `12 a 16 semaines` pour un developpeur solo

Conclusion :

- le devis correspond a une `V1 large`
- il ne faut pas prendre ce devis comme le vrai perimetre du `MVP restreint`
- il sert surtout de repere de cout, de charge et d'architecture cible

## 4. Ajustement de notre doctrine projet

Nous gardons les decisions structurantes deja prises dans les fichiers markdown :

- web-first
- mobile-first dans l'experience
- `4 sports`
- interface en francais par defaut
- parcours de reservation guide
- charte `Planity-like`

Mais nous integrons des elements nouveaux ou renforces :

- `4 roles` explicites des le MVP
- remboursement et annulation a cadrer des maintenant
- code de reservation
- blocage automatique des creneaux complets
- masquage des coordonnees avant reservation
- messagerie liee a la reservation
- verification d'identite et documents admin

## 5. Arbitrage important

Le `Business Plan.pdf` parle souvent de :

- reservation instantanee
- contenu premium plus ambitieux
- logique communautaire plus large
- abonnement premium coach avec `0%` de commission

Ces points doivent etre lus comme :

- `vision V1 / V2 / ambition business`
- pas comme obligation immediate du MVP maquette

La regle a conserver est :

- les nouveaux PDFs sont prioritaires
- mais le MVP reste volontairement contenu pour pouvoir etre construit et teste

## 6. Regle de lecture pour la suite

Quand une contradiction apparait :

1. on regarde d'abord les 3 nouveaux PDFs
2. ensuite le `DOCUMENT_MAITRE_GYM.md`
3. ensuite les autres documents historiques

Objectif :

- ne pas perdre la vision
- ne pas reconstruire le projet sur des fichiers plus anciens que les nouvelles versions
