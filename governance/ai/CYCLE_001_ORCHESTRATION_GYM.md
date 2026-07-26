# Cycle 001 - Orchestration des Prompts GYM

## Cadre

Ce cycle sert a lancer un pilotage propre des prompts metiers sans toucher a la logique metier validee ni casser l'existant.

## Phase 1 - CTO

### impact architecture

Le projet dispose deja d'un double socle `prototype-site` et `gym-next`. La priorite n'est pas d'ajouter des briques techniques, mais de mieux verrouiller la correspondance entre pages prototype, routes Next.js et documents sources.

### impact produit

Le tunnel `trouver > choisir > reserver > payer` reste le coeur du produit. Toute evolution qui detourne l'effort vers des zones secondaires doit etre freinee.

### risque

Le risque principal est une divergence silencieuse entre les pages migrees, leurs liens metier et les documents prioritaires.

### recommandation

Imposer une orchestration documentaire stable avant les prochaines evolutions de design ou de migration.

### mission suivante

Verifier, page par page, que chaque route Next.js reste rattachee a une user story et a un prototype de reference.

## Phase 2 - Product

### probleme produit

Le projet a beaucoup de matiere et de variantes, ce qui peut disperser l'effort si chaque demande locale est traitee sans rappel du MVP.

### valeur utilisateur

La valeur immediate reste la reservation sportive simple, lisible et rassurante pour le sportif.

### priorite

Priorite haute sur les routes du tunnel MVP et sur les liens metier entre elles.

### hors-MVP eventuel

Tout enrichissement lourd de dashboard, d'automatisation ou de logique club qui ralentit le tunnel sportif doit etre considere comme secondaire tant que le coeur n'est pas impeccable.

### mission suivante

Produire un backlog de controle des pages MVP par ordre de criticite.

## Phase 3 - Design

### probleme UX

Le principal danger n'est pas l'absence d'idees visuelles, mais la perte d'homogeneite entre prototype HTML, rendu Next.js et comportement attendu.

### impact utilisateur

Si les structures changent trop ou si les blocs se deplacent sans logique, la confiance diminue et le parcours parait moins credible.

### correction proposee

Conserver les hierarchies validees et corriger ensuite les details de rythme, d'alignement, de scroll, de lisibilite et de CTA uniquement dans le cadre documente.

### risque si non corrige

Accumuler des ajustements visuels contradictoires et perdre la reference par page.

### mission suivante

Comparer les pages Next.js sensibles au prototype correspondant avant toute nouvelle retouche.

## Phase 4 - DevOps

### etat environnement

Le projet dispose deja d'un superviseur fil rouge, d'un build Next.js et d'un cadre de gouvernance minimal.

### risque operationnel

Le risque n'est pas l'absence d'outillage mais le manque de trace persistante sur les cycles de travail et leur ordre.

### action proposee

Appuyer l'environnement sur une memoire locale simple plutot qu'ajouter de nouveaux outils tout de suite.

### verification

Les nouveaux fichiers de contexte, phases et decisions doivent etre surveilles par le dossier `governance`.

### mission suivante

Verifier regulierement le rapport du superviseur apres chaque changement sensible.

## Phase 5 - QA

### anomalies critiques

Aucune anomalie de code n'est ouverte dans ce cycle, mais il existe un risque structurel de regression si les prochaines migrations ne sont pas rattachees aux bonnes pages prototype.

### risques utilisateur

Perte de reperes, liens internes incoherents, comportements scroll ou blocs manquants sur les pages reservation.

### hypotheses / questions

La priorite QA doit rester sur la comparaison prototype / Next des pages du tunnel.

### priorite de correction

Priorite haute sur les routes `/coach`, `/creneau`, `/recapitulatif`, `/paiement`.

### mission suivante

Lancer ensuite un cycle de verification ciblant les pages les plus sensibles du tunnel reservation.

## Phase 6 - SEO

### enjeu SEO

Le SEO utile du MVP depend d'abord de pages stables, lisibles et correctement reliees entre elles.

### page ou groupe de pages

Home, recherche, liste coachs, fiche coach.

### correction recommandee

Reporter les optimisations de fond tant que la parite structurelle et la logique metier n'ont pas ete reevaluees proprement sur toutes les pages critiques.

### impact attendu

Eviter d'optimiser du contenu ou du maillage sur une structure encore mouvante.

### mission suivante

Ouvrir un prochain cycle dedie au maillage, aux titres et aux contenus differenciants une fois le tunnel stabilise.

## Conclusion du cycle

Le prochain travail utile n'est pas d'ajouter de nouveaux outils, mais de verifier la cartographie exacte des pages MVP, leur etat de migration et leurs liens metier avant toute nouvelle refonte.
