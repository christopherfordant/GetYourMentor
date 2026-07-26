# Cycle 003 - Choix Creneau `/creneau`

## Cadre

Cycle centre sur la page de choix de creneau, rattachee a la story `US-SPORTIF-05`.

Sources relues :

- `prototype-site/choix-coach-creneau.html`
- `gym-next/app/creneau/page.tsx`
- `gym-next/components/reservation-legacy/ChoixCoachCreneauLegacyPage.tsx`
- `governance/TRACEABILITY_MATRIX_GYM.md`
- `governance/USER_STORIES_MVP_GYM.md`
- `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## Phase 1 - CTO

### impact architecture

La route `/creneau` est correctement reliee au prototype de reference et au passage de contexte depuis `/coach`.

### impact produit

Cette page reste une etape critique du tunnel : elle doit convertir une intention de reserver en choix de creneau et de mentor.

### risque

Le principal risque est de casser la confiance ou le retour arriere a cause de controles ambigus ou d'un lien contextuel incomplet.

### recommandation

Corriger uniquement les ecarts qui nuisent a la comprehension ou a la robustesse du tunnel.

### mission suivante

Verifier la sortie vers `/recapitulatif`.

## Phase 2 - Product

### probleme produit

Trois ecarts ont ete identifies :

- fleches du calendrier rendues par `?`
- lien `Supprimer` sans fallback contextuel complet
- meta header moins lisible que prevu

### valeur utilisateur

L'utilisateur doit pouvoir choisir un horaire, revenir en arriere et garder une lecture immediate de sa reservation.

### priorite

Priorite haute sur la lisibilite et sur le retour fiable vers la fiche coach.

### hors-MVP eventuel

Les disponibilites temps reel et la logique complexe de multi-seances restent hors de ce cycle.

### mission suivante

Retablir les controles et le fallback sans changer la structure.

## Phase 3 - Design

### probleme UX

Un calendrier avec des `?` a la place des fleches parait casse. Un lien de suppression sans bon fallback fragilise aussi la perception de maitrise.

### impact utilisateur

La confiance chute au moment precis ou l'utilisateur doit confirmer sa reservation.

### correction proposee

Retablir les glyphes attendus, clarifier la ligne meta et conserver les params utiles sur le retour vers `/coach`.

### risque si non corrige

Friction inutile avant le recapitulatif.

### mission suivante

Controler ensuite la restitution du contexte dans `/recapitulatif`.

## Phase 4 - DevOps

### etat environnement

La page repose sur un composant legacy simple et stable.

### risque operationnel

Un lien de fallback incomplet peut produire un retour degrade si JavaScript ne s'execute pas comme prevu.

### action proposee

Renseigner le bon `href` contextuel, tout en gardant le comportement client existant.

### verification

Faire verifier le changement par le superviseur.

### mission suivante

Passer au cycle `/recapitulatif`.

## Phase 5 - QA

### anomalies critiques

- glyphes calendrier defectueux
- fallback du lien `Supprimer` incomplet

### risques utilisateur

Perte de confiance et perte potentielle de contexte de reservation.

### hypotheses / questions

Le prochain point critique est la bonne reprise des donnees choisies dans `/recapitulatif`.

### priorite de correction

Correction immediate et locale, sans refonte de page.

### mission suivante

Auditer `/recapitulatif`.

## Phase 6 - SEO

### enjeu SEO

Le SEO est secondaire ici, mais la proprete textuelle et la solidite du tunnel participent a la qualite globale.

### page ou groupe de pages

`/creneau`

### correction recommandee

Stabiliser le tunnel avant tout travail SEO plus fin.

### impact attendu

Tunnel de reservation plus credible et plus robuste.

### mission suivante

Passer a `/recapitulatif`.

## Corrections executees

- correction des fleches du calendrier
- ajout d'un `href` contextuel complet pour `Supprimer`
- clarification de la meta du header

## Decision de cycle

- pas de refonte structurelle
- pas d'ajout de logique temps reel
- priorite transferee a `/recapitulatif`
