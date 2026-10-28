# Audit de reprise et préparation de la refonte — 28 octobre 2026

## Conclusion et portée

Le projet possède une application Next.js et une démonstration navigable ; la refonte globale et les versions produit V1/V2/V3 ne sont pas terminées. Trois états différents doivent être conservés : dossier principal ancien et modifié, branche distante plus récente, dernière publication documentée encore différente. Aucun changement applicatif ni nouvelle publication dans cet audit.

Audit borné : lectures documentaires ciblées, inspection du code local et des neuf commits distants, un contrôle TypeScript local, neuf pages publiques hébergées en lecture seule. Aucune connexion, soumission, réservation, simulation de paiement ou notification déclenchée. Les validations anciennes ne sont pas reconduites automatiquement.

## Git et provenance

- Branche : `design/refonte-progressive-lot1`, upstream `origin/design/refonte-progressive-lot1` ; HEAD initial `ddd2f548096427eaa7839ab3b9d7162e4b281f2f`.
- Distant confirmé par `git ls-remote` : `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Le HEAD initial en est un ancêtre, retard de neuf commits, aucune avance initiale.
- Inventaire initial : 20 entrées suivies modifiées non indexées, 79 entrées non suivies (certaines représentent des dossiers), aucun changement indexé ; 44 worktrees. Ni nettoyage ni synchronisation. Aucun autre worktree modifié par cet audit.
- Les changements antérieurs touchent notamment layout, cookies, CSS, accueil, webhook Stripe, configuration/tests et gouvernance. Le layout importe aussi des fichiers non suivis (`account-ux.css`, `DemoBanner`). Le rendu de ce dossier ne représente donc pas nécessairement un checkout reproductible du seul HEAD.
- Commits distants non présents dans HEAD : `18061bd`, `d411117`, `7aebba1`, `d7cbbe3`, `93871bd`, `54bb709`, `4b35386`, `c0eaf47`, `d50b9eb`. Ils couvrent recherche, thème Factory, onglets/footer, réservation, paiement/suivi, export calendrier, publication et corrections de fiche coach. Lecture via `git show`, sans intégration.
- Workflow `.github/workflows/mvp-gates.yml` : push sur `main`/`feat/nextjs-migration`, pas sur la branche de chantier ; aucun job de publication observé. `netlify.toml` définit un build, sans prouver le raccordement Git du site. La preuve distante du 22 octobre indique des références de dépôt Netlify nulles ; configuration d'hébergement actuelle non relue par API. Aucun déploiement autorisé ici.
- Précontrôle `git push --dry-run origin HEAD:refs/heads/design/refonte-progressive-lot1`, puis push réel après commit documentaire : rejet `non-fast-forward` (push réel code 1). Distant relu après rejet : toujours `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Le lot documentaire est committé localement ; sa livraison distante est bloquée sans réconciliation Git. Aucun pull, rebase, merge ou force-push effectué. Contrôle ciblé `git diff --cached --check` réussi ; le contrôle global signale des espaces finaux dans le journal d'orchestration antérieur, laissé intact.

## Sources et contradictions

Socle consulté : AGENTS, procédure/hiérarchie de BRANCH_STRATEGY, préambules maître/index, relais local du 20 octobre et relais distant du 22 octobre, suivi de refonte local, index des PDF, contrat DESIGN_SYSTEM et socle Opquast. Sources distantes ciblées : REFONTE_FACTORY, REVUE_RECRUTEUR, DEPLOIEMENT_DEMO_54BB709, preuves recruiter et factory-booking. Les PDF métier et méthodes n'ont pas été relus intégralement ; aucun audit de conformité exhaustive revendiqué.

1. **Design : contradiction documentée.** Le distant rapporte une décision du 21 octobre remplaçant le violet par Factory anthracite/orange. Votre instruction explicite du 28 octobre conserve la maquette HTML et le violet fixe : elle est la cible de cette reprise. Le site déployé reste Factory sur les routes migrées ; aucun retour au violet réalisé. Conserver les améliorations fonctionnelles et d'accessibilité déjà livrées lors d'une future adaptation de palette.
2. **Relais obsolète dans le dossier principal.** Sa date du 20 octobre et ses anciennes prochaines actions ignorent neuf commits et la publication du 22. Le relais distant garde lui-même une indication de worktree Factory alors que son dernier lot vient du worktree recrutement : les chemins sont des traces historiques, pas une localisation courante fiable.
3. **Poussé ne signifie pas déployé.** Publication documentée : source `54bb70980aebaadad402a2a93d38103f5e23a9b4`, Netlify `6ad93730f89f5b5157ba9dd6`. Le correctif `d50b9eb` n'est pas annoncé déployé. Le contrôle public du jour ne fournit pas de SHA applicatif : version publiée exacte actuelle non attestée indépendamment.
4. **Preuves manquantes localement.** Les chemins `docs/assets/booking-recovery-2026-10-20/verification.json`, `booking-form-2026-10-20/verification.json` et `booking-summary-2026-10-20/verification.json`, cités par le relais local, ne sont pas suivis dans HEAD ; le premier est aussi absent sur disque lors du contrôle. Leurs nombres de tests restent des déclarations historiques, pas des résultats directement vérifiés ici.
5. Les mentions anciennes « aucun déploiement » ne valent que pour leur lot ; elles ne réfutent pas la publication autorisée ultérieure. Le socle Opquast est un référentiel de travail, pas une certification. V3/V5/REA ne prouvent aucune infrastructure installée.

## Cartographie et état des fonctionnalités

Dans ce tableau, « historique » signifie preuve lue, sans réexécution du scénario ; « public aujourd'hui » reste une observation anonyme et ne certifie pas le parcours métier complet.

| Fonction / routes | Implémentation et réemploi | Tests locaux / preuves | Distant et limites |
|---|---|---|---|
| Accueil `/` | `EditorialHome`, footer/utilitaires communs ; ancien `HomePageClient` modifié localement sans être l'entrée directe de la page | Inspection du point d'entrée ; aucune nouvelle recette locale de rendu | Public aujourd'hui à 390 px ; parcours trois profils, quatre sports, pas de débordement mesuré ; finition globale non achevée |
| Recherche `/recherche`, annuaire `/coachs` | `RechercheCoachLegacyPage`, `SelectionCoachsLegacyPage`, `DiscoveryFrame/Intro/Steps`, catalogue et filtres | Preuve Factory historique 15 scénarios décrits ; aucun rerun | Recherche observée à 390/1440 px ; quatre disciplines, champ lieu, Factory ; annuaire non revisité aujourd'hui |
| Fiche `/coach` | `ReserverSeanceLegacyPage`, `CoachDetails`, contact, avis ; correctifs distants `7aebba1` et `d50b9eb` | Preuve recruiter base `c0eaf47` : 6 tests développement et 6 build, 390/768/1440, clavier 320–1440, aucune mutation ; historique | Fiche Madison observée à 390 px : pas encore de note/avis, qualification « Profil vérifié », diplôme affiché. Ce libellé ne prouve pas une vérification professionnelle réelle ; correctifs du 22 non certifiés déployés |
| Créneau `/creneau`, résumé `/recapitulatif` | Formulaire, calendrier daté, reprise/déduplication, preuve privée et données serveur ; `DiscoveryFrame` | Preuve factory-booking : 69 tests privés dev et 9 publics compilés ; première recette HTTP compilée 13 échecs explicités, cookies Secure conservés. Preuves locales du 20 incomplètement disponibles | Créneau Madison et résumé sans référence observés à 390 px ; résumé indique l'erreur et propose retour compte/réessai. Aucune demande envoyée |
| Identification `/compte` | `AccountLegacyPage`, formulaires, session serveur, `ReservationProofBoundary` ; CSS hérité encore injecté | Inspection : rôle et identité non attribués par simples paramètres URL ; pas de nouveau test connecté | Connexion email visible, Google indisponible explicite ; fond papier différent de Factory. Aucun compte créé/connecté |
| Comptes sportif/coach/club | `AthleteDashboard`, dashboards coach/club, planning, messages/avis/finances, affiliations et séances | Couverture historique sectorielle, pas de recette globale actuelle ; données démo et droits serveur à préserver | Espaces authentifiés non ouverts aujourd'hui. Leur existence en code ne prouve pas une exploitation réelle |
| Structures `/inscription-club`, `/structures`, collectifs `/seances` | Formulaire structure, `StructureOffers`, affiliations bilatérales, capacité et prix de groupe | Gates démo lus ; pas de soumission ni test multi-rôles du jour | Inscription observée à 390 px, coordonnées fictives demandées ; ce formulaire n'annonce pas créer un compte bancaire ou un compte actif |
| Paiement `/paiement` | `PaiementLegacyPage`, reprise et contrôle du statut ; adaptateur Stripe séparé, paiement après acceptation | Inspection `payments.ts` : statut accepted requis ; aucun checkout ni webhook exécuté | Démo visible à 390 px ; sans référence, « Paiement indisponible » désactivé et erreur explicite. Champs carte en lecture seule ; options Apple/Google Pay illustratives. Pas un paiement réel |
| Suivi personnel `/suivi` | `PersonalProgress`, objectif et synthèse des réservations ; pas un suivi bancaire | Session sportif exigée, fonctionnalité isolée démo | À 390 px, invite de connexion correcte ; contenu connecté non testé |
| Contenus, offres, bêta, calendrier | `/contenus`, `/offres`, `/beta` présents ; export .ics ajouté à distance dans `54bb709` | Relais distant : calendrier 8 scénarios privés/4 publics historiques ; autres couvertures partielles | Pas d'abonnement Premium réel activé ; export/import calendriers externes non testé aujourd'hui ; ne pas recréer ces modules depuis un ancien backlog |
| Légal, plan du site, admin | `/legal/[slug]`, `/plan-du-site`, `/admin/knowledge`, `SiteFooter` | Sources et socle qualité consultés, pas de certification | Mentions/contacts encore à qualifier ; admin authentifié non audité |

### Services réellement établis

Code : Next.js/React, dépôts Supabase conditionnels, stockage démo mémoire local / Netlify Blobs hébergé avec écritures conditionnelles, adaptateurs Stripe et Resend, contrôles runtime. Présence d'un adaptateur ≠ raccordement validé.

`GET https://getyourmentor-demo-20261014.netlify.app/api/health` le 28 octobre : `status:demo`, `mode:demo`, `ready:true` ; `supabase:false`, `stripe:false`, `resend:false`, `legal:false`, `cronSecret:false`, URL et session configurées. L'endpoint relit le stockage en démo hébergée ; ce succès n'est pas une validation de concurrence, de RLS ou de persistance après redéploiement. Aucune valeur secrète lue. n8n/RAG/REA et leur disponibilité opérationnelle non revalidés.

## Vérifications de ce lot

- `npm run check:types` sur le dossier principal : **FAIL, code 1**. Treize diagnostics observés dans d'anciennes copies sous `gym-next/playwright-artifacts` (props manquantes/incompatibles et imports absents). `tsconfig.json` inclut `**/*.ts` et `**/*.tsx`, exclut seulement node_modules. Défaut de périmètre démontré ; cela ne prouve ni une régression du code applicatif courant, ni son absence. Aucun fichier déplacé/exclu pour faire passer le contrôle.
- Navigateur Playwright MCP : neuf routes publiques à 390×844, recherche également à 1440×1000. Titres, contenus, états d'accès et largeur DOM relevés : aucun débordement de page mesuré dans ces dix observations. Cela ne couvre pas toutes les tailles, le contenu connecté, le clavier complet ou les états d'erreur réseau.
- Lecture DOM du paiement sans référence : action indisponible désactivée, données non vérifiées explicitement signalées, quatre champs texte carte en lecture seule et enveloppés dans des labels. L'absence d'aria-label ne suffit pas à conclure à un champ sans nom accessible.
- Capture d'écran MCP tentée sur recherche mobile : **échec timeout 5 s** ; aucune capture nouvelle validée ou livrée. Évaluation de cohérence fondée sur DOM/classes, code et preuves historiques, pas sur une comparaison visuelle exhaustive du jour.
- Pas de build, de campagne Playwright locale complète, d'audit de dépendances, de scan exhaustif des secrets ou d'audit légal/sécurité complet dans ce lot documentaire. Aucun processus applicatif lancé. Aucun déploiement.

## Écarts classés

| Priorité / qualification | Constat et implication |
|---|---|
| P0 — défaut démontré | Branche locale en retard, copie de travail modifiée et contrôle types en échec : impossible de considérer ce dossier comme base de livraison fiable sans préparation. Push non-fast-forward bloqué |
| P1 — contradiction démontrée | Référence violette demandée aujourd'hui et thème Factory livré auparavant ; distinguer direction future et conservation des comportements utiles |
| P1 — défaut documentaire démontré | Relais local daté, chemins de preuves non suivis et états livré/déployé différents : reconstruire une base sourcée avant d'annoncer une couverture |
| P1 — risque plausible | CSS globaux, feuilles héritées et cadres partagés différents rendent la migration sensible aux régressions hors route. Le compte et le formulaire structure restent papier, les routes découvertes Factory |
| P1 — risque de compréhension observé | Paiement sans réservation affiche tout le formulaire illustratif avant l'erreur ; action bien bloquée. Simplifier cet état serait une amélioration UX, pas la correction démontrée d'un débit non autorisé |
| P1 — limite démontrée | Professionnels, qualifications, services commerciaux, mentions légales et couverture V1 non certifiés ; ne pas transformer la démo en promesse commerciale |
| P2 — préférence esthétique | Taille des titres, composition, densité et animations à comparer à la maquette. Pas de défaut visuel inventé sans capture/comparaison |

## Plan de refonte proposé — aucun lot exécuté

| Lot / dépendance | Périmètre et problème | Réemploi et changements proposés | Risques / réussite / contrôles |
|---|---|---|---|
| 0 — préalable | Base Git et recette reproductible | Préserver l'inventaire, choisir un checkout isolé du SHA distant validé après décision de réconciliation ; qualifier le périmètre TypeScript sans supprimer les archives ; rattacher les preuves disponibles | Ne pas emporter les changements locaux ni réécrire l'historique. Réussite : base nommée, retard expliqué/résolu selon instruction, types interprétables et baseline minimale. Aucun design dans ce lot |
| 1 — après lot 0 | Accueil seulement : référence violette et point d'entrée clair | Réutiliser EditorialHome, tokens, header/footer et maquette existante ; préciser couverture avant de modifier. Adapter tokens/composition sur cette seule route, sans réintroduire le sélecteur | Propagation CSS possible : activation bornée. Captures avant/après 390/1440, reflow 320/768, clavier/focus, reduced-motion, quatre sports et liens inchangés ; contrôle des routes témoins recherche/compte |
| 2 — après validation lot 1 | Recherche → annuaire → fiche | Réutiliser DiscoveryFrame, filtres, catalogue, états chargement/erreur et corrections d50b9eb ; décliner le socle retenu | Ne pas rétablir les notes fictives transitoires ni casser onglets/liens. Vérifier filtre conservé, API lente/erreur/vide/404, clavier et fiche → créneau |
| 3 — après lot 2 | Créneau → résumé → identification | Réutiliser formulaire, preuves privées, session et reprise ; harmoniser surfaces/étapes et erreur sans référence | Dates/fuseau, déduplication, propriété et cookies sensibles. Tests demande unique, retour/rechargement, double clic, résultat incertain, accès refusé, 390/1440 |
| 4 — après lot 3 | Compte sportif puis coach puis structure, un sous-lot à la fois | Réutiliser dashboards et contrôles métier existants, réduire les styles hérités uniquement après comparaison | Tests par rôle, affiliations bilatérales, prix/capacité, commission/historiques et états vides ; aucun changement de droits par le design |
| 5 — après parcours de compte stable | Paiement simulé, suivi personnel puis pages secondaires | Réutiliser reprise de paiement, PersonalProgress, footer/légal ; simplifier les erreurs d'accès et décliner le socle sans réactiver des services | Vérifier acceptation avant simulation, absence de paiement réel, données historiques et retours compte. Traiter mentions/contacts avec informations validées |
| 6 — candidat final distinct | Recette globale et préparation éventuelle de publication | Réutiliser tests/preuves par version, vérifier les parcours de bout en bout et données synthétiques isolées | Types/build/contrôles pertinents, responsive et clavier par rôle ; services réels hors périmètre. Publication à autoriser séparément, aucune fusion implicite |

**Premier lot recommandé : lot 0, préparation de la base et de la recette, sans refonte.** Première tranche visuelle ensuite : accueil seulement. Le retard Git et les copies TypeScript rendent une modification visuelle immédiate difficile à attribuer et à vérifier.

Seule décision nécessaire pour débloquer la livraison : autoriser un lot de réconciliation Git conservant intégralement les changements locaux, puis une base isolée sur le distant. Pas d'arbitrage couleur indispensable pour cet audit : l'instruction actuelle impose déjà le violet. Aucun abonnement, infrastructure, agent ou installation supplémentaire requis.
