# Cycle 006 - Controle Transverse du Tunnel MVP

## Cadre

Cycle transverse centre sur la continuite du tunnel sportif :

- `/coach`
- `/creneau`
- `/recapitulatif`
- `/compte`
- `/paiement`

## Sources relues

- `governance/USER_STORIES_MVP_GYM.md`
- `governance/TRACEABILITY_MATRIX_GYM.md`
- `governance/ai/CONTEXT_RAG_GYM.md`
- `governance/ai/MVP_ROUTE_CONTROL_GYM.md`
- `gym-next/components/booking-legacy/ReserverSeanceLegacyPage.tsx`
- `gym-next/components/reservation-legacy/ChoixCoachCreneauLegacyPage.tsx`
- `gym-next/components/reservation-legacy/RecapitulatifReservationLegacyPage.tsx`
- `gym-next/components/account-legacy/AccountLegacyPage.tsx`
- `gym-next/components/payment-legacy/PaiementLegacyPage.tsx`

## Phase 1 - CTO

### impact architecture

Le tunnel est globalement coherent et les params circulent bien d'une page a l'autre. Une derive metier critique subsistait toutefois : la page `/coach` pouvait encore envoyer directement vers `/recapitulatif`.

### impact produit

Cette derive court-circuitait la story `US-SPORTIF-05`, qui impose un vrai passage par le choix de creneau.

### risque

L'utilisateur pouvait contourner l'etape `/creneau`, ce qui rendait le tunnel moins robuste et moins conforme au MVP.

### recommandation

Forcer la sortie de `/coach` vers `/creneau` et non vers `/recapitulatif`.

### mission suivante

Verifier ensuite que `/creneau` conserve bien le contexte et envoie correctement vers `/recapitulatif`.

## Phase 2 - Product

### probleme produit

Le tunnel individuel etait propre par page mais pas encore parfaitement ferme dans son ordre exact.

### valeur utilisateur

Le sportif doit passer par :

1. comprendre le coach
2. choisir un creneau
3. verifier le recapitulatif
4. s'identifier
5. payer

### priorite

Priorite critique sur le respect de cet ordre.

### hors-MVP eventuel

Toute alternative de tunnel plus courte ou plus complexe est hors sujet tant que la chaine MVP n'est pas impeccable.

### mission suivante

Corriger le maillon `/coach` -> `/creneau`.

## Phase 3 - Design

### probleme UX

Un tunnel qui saute une etape cree une incoherence de parcours, meme si chaque page isolee parait bonne.

### impact utilisateur

La promesse de reservation simple reste credible seulement si chaque etape a un role clair.

### correction proposee

Retablir le passage logique sans modifier la structure visuelle de la page coach.

### risque si non corrige

Experience percue comme moins maitrisée et confusion sur l'ordre reel du tunnel.

### mission suivante

Verifier ensuite la lisibilite et le sens de chaque sortie de page.

## Phase 4 - DevOps

### etat environnement

Le routage repose sur `nextRoutes` et `buildNextPath`, ce qui permet une correction simple et peu risquee.

### risque operationnel

Laisser subsister un chemin direct `/coach` -> `/recapitulatif` exposerait une incoherence persistante dans le code.

### action proposee

Basculer `confirmHref` de `nextRoutes.recap` vers `nextRoutes.slot`.

### verification

Faire repasser le superviseur apres correction.

### mission suivante

Documenter le tunnel cible comme reference de verification transverse.

## Phase 5 - QA

### anomalies critiques

- sortie `/coach` envoyant vers `/recapitulatif` au lieu de `/creneau`

### risques utilisateur

- etape de choix de creneau sautee
- tunnel non conforme a la story `US-SPORTIF-05`
- perte de clarte metier

### hypotheses / questions

Une fois ce point corrige, le tunnel sportif MVP suit bien son ordre attendu.

### priorite de correction

Correction immediate.

### mission suivante

Maintenir ensuite ce tunnel comme sequence de reference pour les futurs audits.

## Phase 6 - SEO

### enjeu SEO

Le SEO est secondaire ici, mais la coherence de tunnel renforce la qualite generale du produit.

### page ou groupe de pages

Tunnel transversal MVP.

### correction recommandee

Stabiliser l'ordre du tunnel avant toute optimisation plus large.

### impact attendu

Produit plus propre, plus coherent, plus credible.

### mission suivante

Passer ensuite a un cycle transverse sur la home, la recherche et la liste coachs.

## Correction executee

- la page `/coach` envoie maintenant vers `/creneau` au lieu de `/recapitulatif`

## Tunnel MVP de reference

`/coach` -> `/creneau` -> `/recapitulatif` -> `/compte?redirect=paiement` -> `/paiement`
