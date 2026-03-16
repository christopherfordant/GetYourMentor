# GetYourMentor - Document Maitre v1

## 1. Vision

GetYourMentor (GYM) est une plateforme web qui met en relation des coachs, des sportifs et, a terme, des clubs autour du coaching individuel sportif. L'objectif n'est pas seulement de permettre de trouver un coach, mais de construire un ecosysme simple, fiable et rentable pour organiser des seances, reserver, payer, communiquer et suivre la progression.

La promesse centrale de GYM est la suivante : rendre le coaching individuel sportif plus accessible pour les pratiquants, plus visible et plus rentable pour les coachs, et plus structurant pour les clubs.

GYM doit d'abord etre pense comme un site web responsive, pas comme une application mobile native. Le web permet de lancer plus vite, a moindre cout, avec des usages adaptes au projet : profils, recherche, reservation, paiement, planning, back-office et tableaux de bord.

## 1.1 Direction visuelle

La direction visuelle du site doit etre clairement **"Planity-like"** dans son esprit produit. Cela veut dire :

- une interface tres claire, rassurante et facile a reserver
- une home orientee recherche et prise de rendez-vous
- des fiches coachs tres lisibles avec photo, informations clefs, tarifs et disponibilites
- une presentation simple des prestations ou types de seances
- des appels a l'action visibles et repetes : reserver, contacter, creer un compte
- une experience mobile tres soignee, avec navigation fluide et rapide

Le but n'est pas de copier a l'identique, mais d'adopter la meme logique d'usage : **recherche simple, confiance, reservation rapide, friction minimale**.

## 1.2 Validation visuelle et produit

Avant de lancer le developpement complet, l'equipe doit realiser une petite maquette de **5 a 8 ecrans** avec `Figma` et, si utile, `Figma Make`, pour montrer concretement le produit.

Cette maquette a pour but de valider :

- le process de reservation
- la charte graphique
- la logique des ecrans
- les fonctionnalites MVP vraiment visibles
- la coherence de l'experience "Planity-like"

L'objectif n'est pas de maquetter tout le produit au debut, mais de produire un prototype court, lisible et convaincant, utile pour :

- s'aligner entre vous 3
- montrer le projet
- recueillir des retours
- eviter de developper trop tot dans la mauvaise direction

## 2. Probleme a resoudre

### Pour les coachs

Les coachs ont du mal a :
- gagner en visibilite sans dependre uniquement d'Instagram ou du bouche-a-oreille
- gerer simplement leurs disponibilites, reservations et paiements
- fideliser leurs clients
- monetiser leur expertise au-dela de la seance ponctuelle

### Pour les sportifs

Les sportifs ont du mal a :
- trouver un coach credible et adapte a leur niveau, leur budget et leur discipline
- comparer les offres clairement
- reserver facilement
- faire confiance a une offre peu structuree

### Pour les clubs

Les clubs ont du mal a :
- structurer une offre de coaching individuel ou complementaire
- collaborer avec des coachs externes
- creer de nouvelles sources de revenus
- moderniser l'experience de leurs adherents

## 3. Cible prioritaire

Le projet vise trois publics, mais le lancement doit etre plus etroit pour eviter de disperser l'equipe.

### Cible primaire de lancement

Les coachs independants dans 1 ou 2 disciplines prioritaires, avec une premiere recommandation forte pour :
- basketball
- football ou sports de combat selon le reseau reel le plus accessible

### Cible secondaire de lancement

Les sportifs cherchant un accompagnement individuel dans ces memes disciplines.

### Cible tertiaire de lancement

Les clubs, mais de maniere legere au debut. Le club ne doit pas complexifier le MVP. Il doit plutot etre une porte d'entree commerciale et un futur relais de croissance.

## 4. Positionnement

GYM n'est pas un simple annuaire. Le positionnement est celui d'une plateforme web de coaching individuel sportif, orientee action et execution :
- trouver
- reserver
- payer
- communiquer
- progresser

Le coeur de valeur a court terme est la fluidite du passage entre decouverte d'un coach et reservation d'une premiere seance.

## 5. MVP exact

Le MVP doit etre volontairement restreint. Il doit permettre de prouver qu'un coach peut etre visible, qu'un sportif peut reserver, et qu'une transaction peut avoir lieu dans de bonnes conditions.

### Inclus dans le MVP

- page d'accueil et pages de presentation du service
- creation de compte
- profils coachs avec photo, presentation, discipline, zone geographique, diplomes, tarifs
- moteur de recherche simple par sport et localisation
- fiche coach detaillee
- demande de reservation avec proposition de 1 a 3 creneaux preferes
- validation ou refus de la demande par le coach
- paiement securise apres acceptation de la demande
- messagerie simple ou systeme de contact integre
- avis apres seance
- espace coach basique pour gerer profil, planning, reservations et paiements
- back-office admin minimum pour verifier les coachs et suivre l'activite

### Logique exacte du tunnel MVP

Le MVP ne fonctionne pas en reservation instantanee. Le parcours retenu est le suivant :

1. le sportif choisit un coach et une offre
2. le sportif propose 1 a 3 creneaux preferes
3. la demande part en attente de validation
4. le coach accepte ou refuse
5. en cas d'acceptation, le sportif recoit le lien de paiement
6. la reservation est confirmee apres paiement

### Inclus en version legere seulement

- profil club vitrine
- formulaire de prise de contact club
- gestion manuelle en back-office pour les premiers clubs

### Exclu du MVP et reporte

- vente de contenus
- abonnement a des contenus
- fonctionnalite "My Club" ou club virtuel
- IA de personnalisation
- analyse video
- statistiques avancees
- forum
- gamification
- integrations complexes avec des outils tiers
- gestion complete multi-coachs et multi-evenements pour les clubs

## 6. Modele economique initial

Le modele doit etre simple au lancement.

### Revenus MVP

- abonnement premium coach
- commission sur les reservations payees

### Revenus apres validation

- abonnement club
- commission sur vente de contenus
- abonnement a des contenus
- evenements ou packs

Le lancement doit d'abord demontrer qu'un coach accepte de payer pour la visibilite et que des seances se reservent reellement via la plateforme.

## 7. Strategie de lancement

Le lancement ne doit pas etre national et multisport dans les faits, meme si la vision est large. La strategie recommandee est :

### Etape 1

Lancer dans 1 ou 2 disciplines seulement, avec une base territoriale ou relationnelle forte.

### Etape 2

Signer ou onboarder un premier noyau de coachs tests.

Objectif recommande :
- 10 a 20 coachs tests qualifies
- 30 a 50 sportifs beta
- 3 a 5 clubs partenaires conversationnels ou pilotes

### Etape 3

Valider 3 choses :
- les coachs comprennent l'offre
- les sportifs reservent
- les reservations peuvent etre gerees sans friction

### Etape 4

Industrialiser ensuite :
- acquisition locale
- ambassadeurs
- contenus reseaux sociaux
- prospection clubs
- partenariats

## 8. Repartition conseillee entre vous 3

### Pole 1 - Business et vente

Responsable de :
- banques et financements
- prospection coachs et clubs
- pitch
- partenariats

### Pole 2 - Produit et execution

Responsable de :
- cadrage MVP
- parcours utilisateur
- lien avec le developpement
- recette produit

### Pole 3 - Operations et croissance

Responsable de :
- Trello et organisation
- contenu marketing
- CRM et base de contacts
- suivi des tests utilisateurs

Chaque sujet doit avoir un responsable principal. Les autres peuvent contribuer, mais pas piloter en meme temps.

## 9. Indicateurs a suivre

### Avant lancement

- nombre de coachs interesses
- nombre de rendez-vous commerciaux obtenus
- nombre de coachs prets a tester
- nombre de besoins utilisateurs verifies

### Pendant beta

- coachs onboardes
- profils completes
- recherches effectuees
- reservations demandees
- reservations confirmees
- taux de conversion visite vers inscription
- taux de conversion inscription vers reservation

### Apres beta

- coachs premium actifs
- chiffre d'affaires mensuel
- panier moyen
- retention des coachs
- repetition des seances

## 10. Decisions fondatrices a acter

Ces decisions doivent etre considerees comme prioritaires :

1. GYM commence comme un site web responsive.
2. Le MVP reste volontairement simple et centre sur coach + sportif.
3. Le club entre dans le MVP en mode leger, pas en gestion avancee.
4. Le style produit du site sera tres "Planity-like" dans sa clarte et sa logique de reservation.
5. Une maquette courte de 5 a 8 ecrans doit etre realisee avant le developpement complet pour valider le process, la charte graphique et le MVP.
6. Les fonctions V2/V3 restent hors lancement.
7. Le tunnel MVP fonctionne en demande de reservation validee par le coach, puis paiement.
8. La stack de lancement retenue est : `Next.js + TypeScript + Tailwind + Supabase + Stripe + Resend + Vercel + n8n`.
9. L'equipe se donne une verite unique dans ce document maitre.

## 11. Prochaines actions concretes

### Semaine 1

- valider ce document maitre entre vous 3
- choisir les 1 a 2 disciplines de lancement
- fixer la liste finale des fonctionnalites MVP
- choisir la personne responsable du cadrage produit
- lister les 5 a 8 ecrans de la premiere maquette Figma

### Semaine 2

- structurer le board Trello
- preparer la base de coachs et clubs a contacter
- finaliser le pitch court et la version de prospection
- decider du mode de construction technique
- realiser la maquette Figma / Figma Make du parcours principal

### Semaine 3

- lancer les premiers entretiens utilisateurs
- comparer les solutions de developpement
- commencer la specification fonctionnelle ecran par ecran
- faire valider la maquette a froid par quelques utilisateurs ou proches cibles

### Semaine 4

- figer le MVP
- lancer le planning d'execution
- preparer la base memoire `Supabase + n8n`

## 12. Documents de build de reference

Pour construire le site sans oublier les elements critiques, utiliser maintenant en priorite :

- `DOSSIER_EXECUTION_SITE_GYM.md`
- `CHECKLIST_BUILD_SITE_GYM.md`
- `STACK_TECHNIQUE_GYM.md`
- `ROADMAP_TECHNIQUE_GYM.md`
- `SUPABASE_SCHEMA_GYM.sql`
- `SYNTHESE_COUTS_INFRA_GYM.md`

## 13. Phasage infrastructure et couts

Le document `GYM_Couts_Infrastructure Mensuel.xlsx` confirme que l'architecture retenue reste bonne, mais impose de distinguer clairement `prototype`, `beta privee` et `production`.

### Prototype interne

- `Supabase Free` accepte pour dev et tests internes
- `Vercel Hobby` accepte pour previews et maquettes
- aucun engagement de production sur ces plans

### Beta privee / preproduction

Des que le produit commence a etre teste en conditions plus reelles, la base recommandee devient :

- `Supabase Pro`
- `Vercel Pro`
- provider email transactionnel dedie

### Production commerciale

La mise en ligne publique doit etre consideree comme payante des le depart sur l'infrastructure critique.

Decision retenue :

1. ne pas changer l'architecture cible
2. garder `Supabase + Vercel + Stripe`
3. conserver `Resend` comme choix email MVP
4. utiliser le nouveau fichier de couts pour piloter le passage du gratuit vers le payant

Budget mensuel prudent de lancement production :

- environ `50 a 80 EUR/mois` fixes hors frais variables Stripe et eventuels overages
