# Phases d'Execution GYM

## But

Orchestrer les prompts metiers dans un ordre stable, logique et repetable afin de faire evoluer GetYourMentor sans derive, sans oubli et sans casser la logique metier validee.

## Regle directrice

Chaque cycle suit le meme ordre :

1. `CTO`
2. `PRODUCT`
3. `DESIGN`
4. `DEVOPS`
5. `QA`
6. `SEO`

Cet ordre est obligatoire tant qu'aucun incident critique ne force un recadrage.

## Pourquoi cet ordre

### Phase 1 - CTO

Le CTO fixe le cadre technique, les risques de structure, les dependances et les garde-fous de non-derive.

### Phase 2 - Product

Le Product verifie que la demande sert bien le MVP, la reservation et la valeur utilisateur reelle.

### Phase 3 - Design

Le Design ajuste ensuite la clarte UX/UI sans contredire l'architecture ni elargir le scope.

### Phase 4 - DevOps

Le DevOps verifie que l'environnement, les scripts, les builds et les automatismes suivent proprement.

### Phase 5 - QA

Le QA controle les parcours critiques, les regressions et les ecarts entre prototype, Next.js et logique metier.

### Phase 6 - SEO

Le SEO optimise seulement apres stabilisation produit, design et parcours critiques, afin d'eviter d'optimiser une base incoherente.

## Regles de decoupage

- une demande large devient une `phase`
- une phase peut contenir plusieurs `missions`
- une mission peut contenir plusieurs `actions`
- si plus de 3 pages, 2 roles ou 1 tunnel critique sont impactes, il faut decouper

## Regles de passage a la phase suivante

On ne passe a la phase suivante que si :

- le role precedent a produit une recommandation claire
- le fil rouge reste respecte
- aucun risque critique non arbitre ne subsiste
- les pages sensibles du tunnel reservation ne sont pas fragilisees

## Pages MVP les plus sensibles a surveiller a chaque cycle

- `/`
- `/recherche`
- `/coachs`
- `/coach`
- `/creneau`
- `/recapitulatif`
- `/compte`
- `/paiement`
- `/inscription-club`

## Livrables obligatoires par cycle

- mise a jour du contexte RAG local
- synthese du cycle metier
- journal de decisions si arbitrage important
- verification du superviseur fil rouge si changement sensible
