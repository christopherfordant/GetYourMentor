# Traceability Matrix GYM

## But

Relier les pages, le code actif, les user stories et les documents maitres pour eviter les modifications deconnectees du projet.
Cette matrice sert a maintenir le fil rouge, a garder la logique de reservation MVP et a rattacher chaque decision sensible au document maitre.

## Matrice

| Zone | Route / Page | User stories | Sources maitres prioritaires |
| --- | --- | --- | --- |
| Home | `/` | `US-SPORTIF-01`, `US-SPORTIF-02` | `DOCUMENT_MAITRE_GYM.md`, `MVP_ECRANS_GYM.md`, `DESIGN_SYSTEM_GYM.md` |
| Recherche | `/recherche` | `US-SPORTIF-02` | `DOCUMENT_MAITRE_GYM.md`, `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf` |
| Liste coachs | `/coachs` | `US-SPORTIF-03` | `DOCUMENT_MAITRE_GYM.md`, `MVP_ECRANS_GYM.md` |
| Fiche coach | `/coach` | `US-SPORTIF-04`, `US-COACH-02` | `DOCUMENT_MAITRE_GYM.md`, `Parcours Utilisateur (user flow)/Parcours Utilisateur COACH.docx`, `Ateliers/Sports - Cibles/Football.docx`, `Ateliers/Sports - Cibles/Basketball.docx`, `Ateliers/Sports - Cibles/Métiers de la forme.docx`, `Ateliers/Sports - Cibles/Sport de combat.docx` |
| Choix creneau | `/creneau` | `US-SPORTIF-05` | `DOCUMENT_MAITRE_GYM.md`, `MVP_ECRANS_GYM.md` |
| Recapitulatif | `/recapitulatif` | `US-SPORTIF-06` | `DOCUMENT_MAITRE_GYM.md`, `GetYourMentor MVP_V1 - Fonctionnalites generales.pdf` |
| Compte | `/compte` | `US-SPORTIF-07`, `US-COACH-01`, `US-CLUB-01` | `DOCUMENT_MAITRE_GYM.md`, `MVP_ECRANS_GYM.md` |
| Paiement | `/paiement` | `US-SPORTIF-08` | `DOCUMENT_MAITRE_GYM.md`, `Copie de Devis DEV - GetYourMentor.pdf` |
| Inscription club | `/inscription-club` | `US-CLUB-01` | `DOCUMENT_MAITRE_GYM.md`, `MVP_ECRANS_GYM.md` |

## Regle d'usage

- toute modification importante sur une zone doit etre relue a travers cette matrice
- si une page change mais qu'aucune user story ou source prioritaire n'est mobilisee, il faut lever une alerte
- si le code actif diverge des documents sources, la divergence doit etre explicitement arbitree
- toute modification du tunnel de reservation doit rappeler la story, la page et la source prioritaire mobilisee

## Lot comptes et Stratégie Perplexity — 16 octobre 2026
Compte `/compte` : US-SPORTIF-07, US-COACH-01, US-CLUB-01 et rôle admin du MVP PDF p.1/devis p.1. Une seule déconnexion UI réutilise l’API existante ; contrôle serveur des paramètres du compte, erreurs et navigation. Les 25 pages du PDF secondaire sont rattachées aux sources maîtres dans `docs/STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md`. Cette analyse n’active aucun mécanisme V2/V3 en production ni paiement ; les démarches commerciales restent distinctes du MVP et de la réservation.

## Consolidation réservation démonstration — 16 octobre 2026
US-SPORTIF-05/06/07/08, US-COACH-01 et US-CLUB-01 : dates/fuseau, capacité et plannings selon MVP PDF p.1, devis p.1–2, Business Plan p.35–36/49–50 et document maître §5. Contrôles serveur, snapshots 15 % et refus/annulation libérant les places. Extension structure limitée au coach affilié et paiement sportif. Rapport : `docs/CONSOLIDATION_RESERVATION_2026-10-16.md`. Aucun abonnement activé, nouvelle couche d’agents, paiement réel ni validation RLS distante.

## Réservations groupées — 16 octobre 2026
US-SPORTIF-05/07/08, US-COACH-01 et US-CLUB-01 : MVP p.1 et devis p.1–2. Prix total par taille décidé par l’utilisateur ; capacité pondérée du moteur existant, identité des participants et confidentialité. Aucun autre moteur, bénéficiaire bancaire, abonnement ou consentement parental simulé. Rapport : `docs/RESERVATIONS_GROUPES_2026-10-16.md`.

## Préparation affiliations multi-coachs — 16 octobre 2026
US-CLUB-01 / US-COACH-01, document maître §5 (post-MVP), Business Plan p.49–50 et reprise réservations groupées : maquette locale, rôles et dépendances du rattachement, pas d’activation métier. Reprise et sources : `docs/RESERVATIONS_GROUPES_2026-10-16.md`. La validation du coach est proposée, pas attribuée à une exigence PDF. Procédure ressources et modèle dans `BRANCH_STRATEGY_GYM.md` ; aucun nouvel agent, stockage ou gouvernance ajouté.

## Contrôle préalable du choix coach — 16 octobre 2026
US-CLUB-01 / US-COACH-01 : session serveur, coach choisi explicitement autorisé par l’affiliation existante, conservation des anciennes offres. MVP PDF p.1/devis p.1–2 ; confirmation d’affiliation non spécifiée, arbitrage en attente. Aucun nouveau rattachement intégré avant réponse. Reprise : `docs/RESERVATIONS_GROUPES_2026-10-16.md`.

## Affiliations à consentement réciproque — 16 octobre 2026
US-CLUB-01 / US-COACH-01 / US-SPORTIF-05 : décision utilisateur bilatérale, deux initiateurs possibles, aucun administrateur substitué aux accords ; point d’autorité unique et stockage démo existant. Choix du coach de séance contrôlé serveur, prix total et réservations historiques préservés. Sources : document maître §5 (post-MVP), MVP/devis p.1–2 pour les rôles et réservations, décision utilisateur pour le consentement. Reprise/limites/preuves : `docs/RESERVATIONS_GROUPES_2026-10-16.md`. Aucune activation Premium, infrastructure IA ou RLS distante revendiquée.

## Séances collectives propres aux coachs — 16 octobre 2026
US-COACH-01 / US-SPORTIF-05/06/07/08 : MVP PDF p.1 et devis p.1–2, prix total par taille décidé par l’utilisateur. Origine coach dans le stockage d’offres existant, publication réservée au propriétaire validé, réservation depuis fiche, capacité pondérée et montants historiques. Structures et consentements bilatéraux conservés, pas de nouveau moteur ni paiement réel. Maquette, limites et preuves : `docs/RESERVATIONS_GROUPES_2026-10-16.md`.

## Recette démo hébergée — 17 octobre 2026
US-COACH-01 / US-CLUB-01 / US-SPORTIF-05/07/08 : persistance profils/tarifs/affiliations/offres/réservations entre deux déploiements, concurrence HTTP, droits et snapshots simulés. MVP/devis p.1–2 et décisions utilisateur conservés. Défaut d’empaquetage et health/robots corrigés ; aucun nouveau moteur ni RLS distante revendiquée. Rapport : `docs/RECETTE_DEMO_HEBERGEE_2026-10-17.md`.

## Découverte collective — 17 octobre 2026
US-SPORTIF-05 / US-COACH-01 / US-CLUB-01 : MVP p.1, Business Plan p.28–31/49–51. Catalogue des offres existantes ; filtres quatre sports/ville du coach/origine/taille, dates, capacités restantes et tarifs totaux. Projection sans participants, moteur de réservation réutilisé, commission historique conservée. Rapport : `docs/DECOUVERTE_COLLECTIVE_2026-10-17.md`.
