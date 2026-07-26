# Cycle 002 - Fiche Coach `/coach`

## Cadre

Cycle centre sur la page fiche coach, rattachee aux stories `US-SPORTIF-04`, `US-SPORTIF-05` et `US-COACH-02`.

Sources relues :

- `prototype-site/reserver-seance.html`
- `gym-next/app/coach/page.tsx`
- `gym-next/components/booking-legacy/ReserverSeanceLegacyPage.tsx`
- `governance/TRACEABILITY_MATRIX_GYM.md`
- `governance/USER_STORIES_MVP_GYM.md`
- `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## Phase 1 - CTO

### impact architecture

La route `/coach` est bien reliee au bon prototype et charge directement les styles legacy. L'architecture reste compatible avec une migration fidele et limite le risque de reinterpretation.

### impact produit

La page couvre les blocs clefs de reassurance avant reservation : identite du coach, media principal, note, bio, contenu de seance, planning et contenus.

### risque

Le principal risque restant n'est pas la structure, mais une divergence silencieuse sur certains comportements ou liens annexes du header.

### recommandation

Conserver la fidelite structurelle de la page et traiter ensuite les liens transverses dans un cycle dedie, plutot que d'introduire un nouveau parcours incomplet.

### mission suivante

Verifier le passage metier de `/coach` vers `/creneau`.

## Phase 2 - Product

### probleme produit

La page `/coach` doit convertir une intention en reservation. Tout ce qui brouille la confiance ou la lisibilite fragilise directement le MVP.

### valeur utilisateur

Le sportif doit comprendre vite :

- qui est le coach
- pourquoi lui faire confiance
- ce qu'il va vivre
- comment reserver

### priorite

Priorite haute sur la clarte du tunnel et sur le CTA `Reserver`.

### hors-MVP eventuel

La creation d'un parcours complet `devenir-partenaire` en Next.js n'entre pas dans ce cycle tant qu'elle ne sert pas directement la reservation sportive.

### mission suivante

Confirmer que les liens critiques utiles au sportif restent stables.

## Phase 3 - Design

### probleme UX

Le vrai enjeu n'est pas d'ajouter des effets, mais de garder une fiche coach credible, lisible et rassurante jusqu'au clic de reservation.

### impact utilisateur

Si la structure change sans raison, la confiance baisse. Si la carte note, la photo, les onglets ou le CTA perdent leur logique, la conversion peut chuter.

### correction proposee

Ne pas retoucher la structure. Garder la mise en page validee et surveiller seulement les details de fidelite, d'alignement et de scroll dans les cycles suivants.

### risque si non corrige

Accumuler des variations de structure entre le prototype et Next.js.

### mission suivante

Passer sur la page `/creneau` pour verifier la continuité de parcours.

## Phase 4 - DevOps

### etat environnement

La page est servie par une route Next.js simple avec chargement du CSS legacy et un composant React unique.

### risque operationnel

Le risque principal serait d'ouvrir de nouvelles routes ou dependances non finies pour combler des liens secondaires.

### action proposee

Ne pas ajouter de nouveau logiciel ni de nouvelle route sur ce cycle. Documenter l'arbitrage et s'appuyer sur le superviseur.

### verification

Le cycle doit etre rattache au manifeste et au rapport de supervision.

### mission suivante

Controler ensuite le cycle `/creneau`.

## Phase 5 - QA

### anomalies critiques

Aucune anomalie structurelle critique relevee sur le rattachement prototype -> Next pour `/coach`.

### risques utilisateur

Le principal point de vigilance reste la coherence de parcours entre le CTA `Reserver`, l'onglet `Planning` et la page suivante.

### hypotheses / questions

Le lien `Je suis un professionnel du sport` diverge du prototype HTML, mais il pointe actuellement vers une route existante. Il vaut mieux garder ce lien vivant que revenir vers une destination non migree ou absente.

### priorite de correction

Aucune correction lourde sur `/coach` dans ce cycle. Priorite transferee au lien `/coach` -> `/creneau`.

### mission suivante

Auditer `/creneau`.

## Phase 6 - SEO

### enjeu SEO

La fiche coach doit rester propre, rassurante et lisible avant toute optimisation plus fine.

### page ou groupe de pages

`/coach`

### correction recommandee

Stabiliser le parcours et la fidelite de page avant d'optimiser davantage le contenu.

### impact attendu

Base plus saine pour les futures optimisations SEO sur les pages coach et recherche.

### mission suivante

Passer a `/creneau`, puis revenir plus tard sur le maillage et le contenu.

## Decision de cycle

- pas de refonte structurelle de `/coach`
- pas d'ajout de route secondaire incomplete
- conservation du lien header actuel tant qu'il evite un lien mort
- transfert du prochain controle critique vers `/creneau`
