# Mise à jour des preuves — 14 novembre 2026

Les essais locaux de D1.3 sont maintenant terminés : migration 009, 33 assertions pgTAP dédiées, concurrence sur rejeu et créneau, et retour arrière protégé. Le ticket est clos uniquement pour le contrat de schéma local ; cela ne valide ni le runtime Supabase, ni l’adaptateur, ni le site publié. Rapport : `docs/DEMO_SCHEMA_D13_FIXTURE_ACTOR_2026-11-14.md`. D1.4 devient la prochaine tâche de préparation.

# Décision produit — parcours sportif unique de démonstration

Date : 14 novembre 2026. Cette décision remplace, pour le parcours public recruteur, la demande du 12 novembre de deux entrées et deux parcours individuels coach/sportif. Elle ne signifie pas que le comportement est implémenté ou publié.

## Expérience retenue

Le recruteur suit uniquement le parcours sportif. Il n’a pas à créer un second compte ni à ouvrir un espace coach.

1. Le visiteur démarre une session de démonstration individuelle de sportif.
2. Il choisit un coach et un créneau appartenant au catalogue fictif de la démo.
3. Lors de la demande, le serveur crée le profil d’acteur fictif correspondant s’il manque, ou réutilise le profil stable déjà associé à ce coach de démonstration.
4. Le serveur accepte la réservation automatiquement selon une règle déterministe, idempotente et limitée à la démo. La réservation et son acceptation doivent être atomiques avec la protection contre la double réservation du créneau.
5. Le sportif peut confirmer un paiement simulé, puis voit clairement que la réservation a été acceptée par le scénario automatique et qu’aucun paiement réel n’a été effectué.
6. La réservation reste consultable tant que l’identité de démonstration du sportif est conservée. Une identité anonyme perdue après effacement du navigateur ne permet pas une récupération sur un autre appareil sans mécanisme d’authentification supplémentaire ; aucun e-mail ni compte partagé n’est ajouté par défaut.
7. Le sportif peut effacer ses données. Les acteurs/coachs fictifs communs de la démo et les données des autres visiteurs restent intacts.

## Nature du profil et de l’acceptation

- Le « profil coach » est un acteur synthétique de démonstration, pas un compte coach, une personne réelle ni un coach IA.
- Seuls les coachs fictifs identifiés comme démo peuvent être sélectionnés pour le parcours avec acceptation automatique. Une fiche ou disponibilité d’un coach réel ne doit jamais recevoir une acceptation fabriquée.
- Si le profil d’acteur manque, sa création est côté serveur, stable et idempotente, indexée par une clé de coach de démonstration. Les données sont fictives et minimales ; elles ne copient ni le profil, ni l’image, ni les qualifications d’un coach réel.
- L’acteur partagé est protégé contre les modifications et l’effacement par le visiteur. Le client ne peut ni créer l’acceptation, ni la modifier, ni appeler directement une fonction privilégiée.
- Le libellé doit parler d’« acceptation automatique de démonstration », jamais d’une décision réelle ou d’une décision d’IA.

## Paiement, stockage et notifications

- Le paiement reste purement simulé : aucun appel Stripe, numéro de carte/CVC, débit, transfert ou remboursement.
- Une seule source de stockage canonique persiste la session de démonstration et la réservation ; pas de double écriture Supabase/Netlify Blobs.
- La réservation est rattachée au sportif de démonstration et aux fixtures synthétiques, avec RLS/autorisation serveur et contrôles d’accès croisé.
- Telegram est hors du parcours principal et reporté. La confirmation à l’écran suffit ; aucun message externe n’est envoyé par défaut.
- Docker reste exclu. Les preuves PostgreSQL avec shim Auth ne valent pas validation du runtime Supabase.

## Portée Kanban et critères de réalisation

- GYM-D1, D1.4, D1.5, D1.7, D1.8 et D1.9 décrivent désormais un seul parcours sportif.
- GYM-D1.3 doit inclure la création/réutilisation atomique du profil acteur fictif, sa protection, l’idempotence et la réservation/acceptation. Les preuves antérieures ne couvrent pas cette évolution tant que ses tests dédiés n’ont pas été exécutés.
- GYM-D1.6 Telegram ne bloque plus l’alignement des textes ni la recette du parcours de base ; il reste une option séparée et différée.
- Aucun statut n’est changé par cette décision. D1.2 et D1.3 restent `progress`, D1.4 reste `blocked`, D1.5 reste `prepare`, selon le Kanban vérifié.

## Limites vérifiées le 14 novembre

- Checkout : `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, HEAD et distant `714234a0cf88b8387aec9835c8af05d2da48f06b`; worktree propre.
- Le checkout principal `GetYourMentor` sur `design/refonte-progressive-lot1` contient de nombreux changements préexistants. Ils ont été laissés intacts ; aucun fichier de ce checkout n’a été repris.
- Le site `https://getyourmentor-demo-20261014.netlify.app/` répond `200`; `/api/health` répond `200` avec `mode=demo`, `supabase=false`; `/demo` répond `404`.
- Le schéma `gym_demo_*` et les assertions ont été exercés le 13 novembre sur PostgreSQL 12.15 jetable avec shim Auth : 34/34 assertions de base, 25/25 additives et deux essais de concurrence réussis. Ce n’est pas une validation du runtime Supabase, du site publié ou du parcours applicatif.
- Aucune migration distante, variable Netlify, modification de compte, notification, paiement ou publication n’a été effectuée dans cette reprise.

## Prochaine étape

Ne pas raccorder les variables au site. Résoudre les critères ouverts de GYM-D1.2 (correspondance vérifiable entre artefact, dépôt/branche et cible Netlify, puis frontière client/serveur). Ensuite, mettre à jour la proposition de schéma D1.3 et ses tests pour l’acteur de démonstration stable et la transaction réservation/acceptation ; valider sur environnement jetable avant d’envisager l’adaptateur applicatif. Garder les statuts ouverts jusqu’aux preuves requises.
