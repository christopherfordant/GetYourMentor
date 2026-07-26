# Cycle 005 - Paiement `/paiement`

## Cadre

Cycle centre sur la page de paiement, rattachee a la story `US-SPORTIF-08`.

Sources relues :

- `prototype-site/paiement.html`
- `gym-next/app/paiement/page.tsx`
- `gym-next/components/payment-legacy/PaiementLegacyPage.tsx`
- `gym-next/components/account-legacy/AccountLegacyPage.tsx`
- `governance/TRACEABILITY_MATRIX_GYM.md`
- `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## Phase 1 - CTO

### impact architecture

La route `/paiement` est bien alimentee par les params transmis depuis `/compte` apres l'etape `redirect=paiement`.

### impact produit

La page clot le tunnel sportif. Elle doit confirmer calmement le recap, le mode de paiement et la validation finale.

### risque

Le risque principal n'est pas le routing, mais une restitution trop faible ou trop confuse des informations finales.

### recommandation

Conserver la structure validee et ameliorer uniquement la lisibilite du recap de paiement.

### mission suivante

Passer ensuite a un cycle transverse de verification du tunnel complet.

## Phase 2 - Product

### probleme produit

Le paiement est fonctionnel, mais le recap lateral pouvait etre rendu plus net sur :

- la ligne de duree / options
- la ligne date et heure

### valeur utilisateur

Au moment de payer, l'utilisateur doit confirmer tres vite qu'il paie bien pour la bonne seance, au bon moment, avec le bon coach.

### priorite

Priorite haute sur la clarte de verification pre-paiement.

### hors-MVP eventuel

Pas de logique de promo, de wallet ou de paiement fractionne dans ce cycle.

### mission suivante

Clarifier le recap sans ajouter de nouvelle logique.

## Phase 3 - Design

### probleme UX

Des lignes de recap trop compactes ou peu ponctuees rendent la verification plus fatigante sur une etape sensible.

### impact utilisateur

Cela peut ralentir la decision finale ou introduire un doute inutile.

### correction proposee

Utiliser des separateurs simples et une formulation plus nette pour la date et les options.

### risque si non corrige

Paiement moins lisible que les etapes precedentes du tunnel.

### mission suivante

Verifier ensuite le tunnel complet de bout en bout.

## Phase 4 - DevOps

### etat environnement

Le tunnel `/recapitulatif` -> `/compte?redirect=paiement` -> `/paiement` reste coherent.

### risque operationnel

Aucun risque de routing critique releve dans ce cycle.

### action proposee

Limiter la phase a une correction locale de lisibilite et tracer la decision dans la gouvernance.

### verification

Faire repasser le superviseur apres mise a jour.

### mission suivante

Cycle transverse QA du tunnel.

## Phase 5 - QA

### anomalies critiques

Aucune anomalie critique de navigation detectee sur `/paiement`.

### risques utilisateur

Le risque principal etait la lisibilite du recap final.

### hypotheses / questions

Le prochain meilleur controle est maintenant transversal, sur le tunnel complet :

- `/coach`
- `/creneau`
- `/recapitulatif`
- `/compte`
- `/paiement`

### priorite de correction

Correction locale de lisibilite, sans refonte.

### mission suivante

Lancer un cycle de verification bout en bout.

## Phase 6 - SEO

### enjeu SEO

Le SEO est tres secondaire ici, mais la coherence de contenu et de structure participe a la qualite globale percue.

### page ou groupe de pages

`/paiement`

### correction recommandee

Stabiliser le recap final et conserver une structure claire.

### impact attendu

Confirmation finale plus lisible et plus credibile.

### mission suivante

Passer a un cycle transverse de verification du tunnel.

## Corrections executees

- clarification de la ligne duree / options du recap
- clarification de la ligne date et heure

## Decision de cycle

- pas de refonte structurelle
- pas d'ajout de moyen de paiement supplementaire
- priorite transferee a un controle global du tunnel MVP
