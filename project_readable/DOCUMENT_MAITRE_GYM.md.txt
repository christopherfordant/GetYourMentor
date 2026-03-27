# GetYourMentor - Document Maitre v1

## 0. Sources prioritaires actuelles

A compter du `19 mars 2026`, les documents de reference prioritaires du projet sont :

- `Bussiness Plan.pdf`
- `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf`
- `Copie de Devis DEV - GetYourMentor.pdf`

Ces 3 fichiers passent avant les anciennes versions `.docx`, `.xlsx` ou variantes historiques lorsqu'il faut arbitrer :

- le perimetre du MVP
- les roles utilisateurs
- les fonctionnalites principales
- la logique de reservation et paiement
- l'ordre de construction produit

Regle de travail :

- les nouveaux PDFs = verite prioritaire actuelle
- les anciens fichiers = contexte, details, historique ou variantes
- les fichiers markdown du repo = synthese operative mise a jour a partir de ces sources prioritaires

## 1. Vision

GetYourMentor (GYM) est une plateforme web qui met en relation des coachs, des sportifs et, a terme, des clubs autour du coaching individuel sportif. L'objectif n'est pas seulement de permettre de trouver un coach, mais de construire un ecosysme simple, fiable et rentable pour organiser des seances, reserver, payer, communiquer et suivre la progression.

La promesse centrale de GYM est la suivante : rendre le coaching individuel sportif plus accessible pour les pratiquants, plus visible et plus rentable pour les coachs, et plus structurant pour les clubs.

GYM doit d'abord etre pense comme un site web responsive, pas comme une application mobile native. Le web permet de lancer plus vite, a moindre cout, avec des usages adaptes au projet : profils, recherche, reservation, paiement, planning, back-office et tableaux de bord.

## 1.0 Langue et sports visibles

Le MVP doit etre pense en **francais par defaut**.

Regles de lancement :

- toute la maquette MVP est en francais
- l'interface propose un selecteur de langue discret
- la langue par defaut est `Francais`
- une langue secondaire peut etre ajoutee via ce selecteur, avec `Anglais` comme premiere option logique
- l'application peut detecter la langue disponible de l'utilisateur et afficher automatiquement l'interface dans cette langue si elle existe
- l'utilisateur peut toujours changer sa langue manuellement via le selecteur

Le catalogue visible du MVP doit rester limite a 4 sports :

- football
- basketball
- fitness
- sports de combat

Ces 4 sports sont les seuls visibles dans :

- la recherche
- les filtres
- les suggestions
- les tags de discipline
- les ecrans de maquette

## 1.1 Direction visuelle

La direction visuelle du site doit etre clairement **"Planity-like"** dans son esprit produit. Cela veut dire :

- une interface premium, sombre et rassurante
- une home orientee recherche et prise de rendez-vous
- des fiches coachs tres lisibles avec photo, informations clefs, tarifs et disponibilites
- une presentation simple des prestations ou types de seances
- des appels a l'action visibles et repetes : reserver, contacter, creer un compte
- une experience mobile tres soignee, avec navigation fluide et rapide
- un parcours de recherche jusqu'au paiement construit `fenetre par fenetre`
- une progression ecran par ecran avec une seule decision principale a chaque etape

Le but n'est pas de copier a l'identique, mais d'adopter la meme logique d'usage : **recherche simple, confiance, reservation rapide, friction minimale**, avec un **theme sombre premium** et des accents orange plus sportifs.

Un module `Contenu premium` peut etre montre dans la maquette comme extension de la fiche coach, avec inspiration de la logique de contenus reserves visible sur MYM, mais adapte au coaching sportif : apercus publics, contenus premium floutes, deblocage simple, sans casser la priorite du booking.

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

## 1.3 Regle stricte de decoupage des missions

Pour tout travail de design, de maquettage ou de construction MVP, il faut privilegier des missions tres courtes, nettes et controlables.

Regle de travail stricte :

- des que j'oublie un element
- des que je pense pouvoir oublier un element
- des que plusieurs decisions, ecrans, blocs ou objectifs se melangent
- des que la demande devient un peu trop large pour etre traitee parfaitement en une seule passe

alors il faut **decouper immediatement la mission**.

Il ne faut pas attendre :

- d'avoir oublie `5%` ou `10%` du besoin
- que la demande devienne floue
- que la reponse devienne trop longue
- qu'une partie du perimetre soit deja traitee de travers

Application concrete :

- arreter la mission globale
- la decouper en sous-missions simples
- proposer ou demander un traitement mission par mission
- traiter une seule sous-mission claire a la fois
- valider l'etape avant de passer a la suivante

Priorite absolue :

- ne rien oublier
- ne pas melanger trop de choses en une seule fois
- proteger la clarte
- proteger la coherence du MVP
- proteger la qualite du design
- eviter toute derive hors perimetre

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

Les coachs independants dans les 4 categories visibles du MVP, avec une priorite commerciale a arbitrer ensuite selon votre reseau reel :
- football
- basketball
- fitness
- sports de combat

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
- interface en francais par defaut avec selecteur de langue
- 4 interfaces principales : `Sportif`, `Coach`, `Etablissement`, `Admin`
- profils coachs avec photo, presentation, discipline, zone geographique, diplomes, tarifs
- moteur de recherche simple par sport et localisation, limite a 4 sports visibles
- filtres de recherche MVP : genre du coach, lieu de pratique, niveau, format, budget, disponibilite, note, coach verifie
- fiche coach detaillee
- demande de reservation validee par le coach
- prise de rendez-vous
- paiement securise
- ecran de paiement apres validation du coach
- code de reservation genere pour l'execution terrain cote coach
- blocage automatique des creneaux complets
- remboursement a cadrer dans la V1 selon la base metier actuelle :
  - `100%` si annulation plus de `48h` avant le rendez-vous
  - `50%` si annulation entre `48h` et `24h` avant le rendez-vous
- module fidelite simple visible dans l'espace sportif apres plusieurs seances
- messagerie simple ou systeme de contact integre
- masquage du mail et du numero avant reservation
- avis apres seance
- espace coach basique pour gerer profil, planning, reservations et paiements
- espace etablissement en version legere
- back-office admin minimum pour verifier les coachs et suivre l'activite

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
5. La reservation du MVP fonctionne en demande de reservation validee par le coach, pas en agenda instantane complexe.
6. Une maquette courte de 5 a 8 ecrans doit etre realisee avant le developpement complet pour valider le process, la charte graphique et le MVP.
7. Les fonctions V2/V3 restent hors lancement.
8. L'interface du MVP est en francais par defaut avec selecteur de langue.
9. Le MVP ne montre que 4 sports : `football`, `basketball`, `fitness`, `sports de combat`.
10. La direction visuelle de la maquette MVP est en theme sombre premium avec accent orange.
11. L'application peut traduire automatiquement l'interface selon la langue disponible de l'utilisateur, avec changement manuel possible.
12. La maquette doit montrer explicitement le paiement apres acceptation du coach et un premier module de fidelite.
13. L'equipe se donne une verite unique dans ce document maitre.

## 11. Prochaines actions concretes

### Semaine 1

- valider ce document maitre entre vous 3
- figer la liste des 4 sports visibles du MVP
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

## 12. Prochaine etape du projet

La maquette etant maintenant suffisante pour aligner la vision, la prochaine etape n'est plus le design. La prochaine etape est le **passage en mode build**.

Le bon objectif n'est pas encore de coder tout de suite a l'aveugle. Le bon objectif est de transformer la maquette en **MVP reellement constructible**, sans ambiguite produit.

### Etape prioritaire

Transformer le travail de maquette en **dossier d'execution MVP**.

### Ce dossier doit contenir

- la liste finale des ecrans MVP
- les composants principaux a reutiliser
- les regles metier ecran par ecran
- les statuts de reservation
- les textes critiques de l'interface
- la regle langue : `FR` par defaut, `EN` en second
- la regle auto-traduction : langue detectee si disponible, sinon `FR`, avec changement manuel possible
- la regle catalogue : seulement `football`, `basketball`, `fitness`, `sports de combat`
- les cas limites importants : refus coach, paiement apres validation, etat vide, aucun resultat
- la logique fidelite : progression visible et avantage apres plusieurs seances

### Resultat attendu

A la fin de cette etape, vous devez avoir un dossier suffisamment propre pour :

- briefer un developpeur sans oral long
- decouper le projet en sprints
- estimer le temps de developpement
- commencer le build sans repartir dans le flou

### Filtres de recherche recommandes pour le MVP

Filtres a conserver dans la recherche MVP :

- sport
- ville
- genre du coach : `Homme`, `Femme`
- lieu de pratique : `Interieur`, `Exterieur`
- niveau : `Debutant`, `Intermediaire`, `Confirme`
- format : `Presentiel`, `Visio`
- budget
- disponibilite
- note
- coach verifie

Regle produit :

- ces filtres doivent aider la recherche
- ils ne doivent pas rendre la recherche lourde ou confuse
- sur mobile, seuls les filtres les plus utiles doivent rester visibles en premier

## 13. Ordre recommande apres maquette

1. figer le parcours final ecran par ecran
2. figer les fonctionnalites exactes du MVP
3. figer les regles metier de reservation
4. figer la structure de donnees MVP
5. transformer tout cela en backlog de build
6. seulement ensuite lancer le developpement

## 14. Prochain livrable concret

Le prochain livrable le plus utile pour GYM est :

**une specification fonctionnelle finale du MVP, exploitable par un developpeur**

Cette specification doit etre votre pont entre :

- le document maitre
- la maquette
- la stack technique
- le backlog de developpement

## 15. Decision de cadence

Tant que la maquette est consideree comme satisfaisante, l'equipe ne revient pas en boucle sur le design.

La priorite passe maintenant a :

- cadrer
- specifier
- ordonner
- construire
