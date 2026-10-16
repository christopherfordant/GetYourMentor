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
