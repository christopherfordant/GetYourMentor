# Migration Next.js - GetYourMentor

## But

Migrer le prototype HTML vers `React + Next.js` **page par page** sans perdre :

- la logique metier validee
- les parcours MVP
- les contenus approuves
- les arbitrages du document maitre

Le prototype actuel dans `prototype-site/` reste la reference visuelle et metier tant qu'une page Next equivalente n'est pas :

1. construite
2. comparee au prototype
3. validee

## Regle de migration

Une seule mission a la fois :

1. choisir une page source
2. relever ses regles metier
3. la reconstruire dans `gym-next/`
4. verifier l'equivalence
5. valider avant de passer a la suivante

## Ordre conseille

1. `accueil.html`
2. `recherche-coachs.html`
3. `selection-coachs.html`
4. `reserver-seance.html`
5. `choix-coach-creneau.html`
6. `recapitulatif-reservation.html`
7. `compte.html`
8. `paiement.html`
9. `inscription-club.html`

## Regle d'arbitrage

Si un doute existe entre :

- le code HTML actuel
- une ancienne consigne
- une interpretation de design

alors la priorite reste :

1. `DOCUMENT_MAITRE_GYM.md`
2. les sources MVP prioritaires
3. le prototype HTML valide le plus recent

## Etat

- Base Next.js creee : `oui`
- Migration de page commencee : `oui`
- Pages construites dans Next.js : `accueil.html`, `recherche-coachs.html`, `selection-coachs.html`, `reserver-seance.html`, `choix-coach-creneau.html`, `recapitulatif-reservation.html`, `compte.html`, `paiement.html`, `inscription-club.html`
- Pages marquees `Valide` dans le tableau de migration : `accueil.html`, `recherche-coachs.html`, `selection-coachs.html`, `reserver-seance.html`, `choix-coach-creneau.html`, `recapitulatif-reservation.html`, `compte.html`, `paiement.html`, `inscription-club.html`
- Page encore a valider visuellement : `aucune`
- Page en cours : `aucune`

## Routes Next.js a verifier

- `/` depuis `prototype-site/accueil.html`
- `/recherche` depuis `prototype-site/recherche-coachs.html`
- `/coachs` depuis `prototype-site/selection-coachs.html`
- `/coach` depuis `prototype-site/reserver-seance.html`
- `/creneau` depuis `prototype-site/choix-coach-creneau.html`
- `/recapitulatif` depuis `prototype-site/recapitulatif-reservation.html`
- `/compte` depuis `prototype-site/compte.html`
- `/paiement` depuis `prototype-site/paiement.html`
- `/inscription-club` depuis `prototype-site/inscription-club.html`

## Verification technique

- Dernier build Next.js connu : `OK`
- Commande : `cd gym-next && npm.cmd run build`
- Derniere verification des liens `.html` utilisateurs : `OK`
- Les occurrences `.html` restantes sont uniquement les chemins source documentes dans `gym-next/lib/migration-pages.ts`
- Derniere verification des parametres metier du tunnel de reservation : `OK`
- Parametres suivis : `sport`, `city`, `coach`, `service`, `duration`, `price`, `objective`, `format`, `package`, `slot`, `mentor`
- Dernier smoke test HTTP Next.js : `OK` le `2026-04-10`
- Routes testees en HTTP 200 : `/`, `/recherche`, `/coachs`, `/coach`, `/creneau`, `/recapitulatif`, `/compte`, `/paiement`
- Derniere verification du contenu metier tunnel : `OK`
- Note compte : le CTA d'inscription valide est `Nouveau ? Inscription`, pas `Creer mon compte`
- Derniere verification visuelle automatisee : `partielle` le `2026-04-10`
- Correction issue de la verification visuelle : `/coach` ne declenche plus l'ancre `A propos` au chargement, la carte note reste desktop et les effets sticky sont desactives en layout compact
- Artefacts locaux non commit : `docs/next-visual-validation/`

## Prochaine mission stricte

Tester visuellement dans un vrai navigateur les parcours Next.js principaux en desktop et mobile, en priorite le header responsive de `/coach`.

Ne pas passer a une autre refonte tant que :

- la recherche depuis la home ouvre bien `/coachs`
- une carte coach ouvre bien `/coach`
- une demande de reservation arrive bien sur `/recapitulatif`
- le recapitulatif vers connexion arrive bien sur `/compte?redirect=paiement`
- apres connexion, le paiement conserve les informations de reservation
- le build Next.js reste vert
