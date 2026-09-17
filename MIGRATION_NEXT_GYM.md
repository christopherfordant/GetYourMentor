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
- Derniere verification visuelle et fonctionnelle automatisee : `OK` le `2026-09-18` via Playwright desktop et mobile (44/44 par projet, 88 au total, mono-worker)
- Correction issue de la verification visuelle : `/coach` ne declenche plus l'ancre `A propos` au chargement, la carte note reste desktop et les effets sticky sont desactives en layout compact
- Artefacts locaux non commit : `docs/next-visual-validation/`

## Verification fonctionnelle actuelle

- `npm.cmd run build` : OK
- Playwright `desktop-chromium` : 44/44
- Playwright `mobile-chromium` : 44/44
- Parcours couvert : recherche, fiches coach, disponibilités, réservation, acceptation coach, paiement local, Checkout Stripe optionnel, webhook signé, avis, fidélité, contact, inscription club et administration.
- Persistance optionnelle : profils coach, réservations, messages et avis via Supabase avec repli mémoire local pour les démonstrations.
- Sécurité applicative : rôles API contrôlés côté serveur, propriétaire de réservation vérifié pour paiement/annulation/avis, signature Stripe vérifiée pour le webhook.

## Etat de validation de la mission

La migration MVP et sa vérification écran par écran sont terminées :

- la recherche depuis la home ouvre `/recherche`
- une carte coach ouvre `/coach`
- une demande de réservation arrive sur `/recapitulatif`
- le récapitulatif vers connexion arrive sur `/compte?redirect=paiement`
- après connexion, le paiement conserve les informations de réservation
- le build Next.js est vert
- les 88 tests Playwright desktop/mobile sont verts en local ; la CI distante reste à revalider séparément

La prochaine étape relève de la mise en production : renseigner les secrets Supabase, Stripe et Resend, puis effectuer une recette avec des comptes et données réelles.

### Garde-fous de préproduction

- Sans configuration Supabase et sans coach vérifié, `/creneau`, `/recapitulatif` et `/paiement` affichent un état indisponible au lieu de données de démonstration.
- Le mode de démonstration est réservé aux tests et doit être activé explicitement par `GETYOURMENTOR_ALLOW_DEMO=true`.
- Le contrôle `npm.cmd run check:production-config` reste bloquant tant que les secrets Supabase, Stripe, Resend, la clé de session et l'URL publique ne sont pas renseignés.
- Les tests locaux ne remplacent pas la recette avec comptes réels, les règles RLS Supabase, la configuration du stockage des pièces jointes, les validations juridiques ou l'acceptation utilisateur.

## Refonte visuelle 2026

Une refonte globale a ensuite été appliquée pour sortir du style Planity-like :

- nouvelle home éditoriale avec navigation en pills, hero immersif et recherche en glass panel ;
- recherche et annuaire transformés en surfaces de découverte plus aérées, avec cartes coach modernisées et filtres compacts ;
- fiche coach enrichie avec panneau de contact conversationnel, suggestions de questions et état de réponse ;
- identité visuelle harmonisée sur connexion, compte, créneau, récapitulatif et paiement ;
- accent corail, bleu nuit, surfaces translucides, rayons et états responsive cohérents ;
- vérification finale après refonte : Playwright desktop/mobile `72/72`.
