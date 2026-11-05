# Approbation de coach de recette distincte de la verification professionnelle

Etat : proposition locale preparee, non branchee au parcours et non appliquee en base.
Source : consigne utilisateur 52ddf956-6be7-4700-9554-40bd1defd0d3 du 4 novembre 2026.

## Constat observe

Le PATCH administratif existant /api/admin/coaches/[id] exige un vrai role admin, puis transmet uniquement verified boolean a setStoredCoachVerification. Celui-ci ecrit verified et verification_status approved/rejected. Le compte affiche ensuite Coach verifie. La reservation exige coach.verified. Ce mecanisme confond approbation technique de recette et verification professionnelle; le marquer true pour un coach fictif ne respecte pas la consigne. Aucun appel de cette approbation effectue, aucun document cree et aucun compte promu admin.

## Solution cible bornee

Conserver verified=false et verification_status=pending pour le profil fictif. Ajouter une autorisation de reservation de recette distincte, serveur uniquement, pour l identifiant immuable du premier coach de demonstration, dans une configuration administrative locale chiffree. Aucune migration distante.

Conditions cumulatives : projet Supabase exact pqxqqbwesfrefzjoawmx, application loopback http://127.0.0.1:3005, configuration de recette explicite, Stripe en mode test, identifiant coach precisement autorise, approbation administrative de recette explicite. Tout contexte public, Netlify, autre projet ou cle live refuse cette exception. Le navigateur ne peut fournir ni modifier l autorisation. Le nom Demo n est pas une preuve suffisante et ne sert pas de garde de securite.

Exposer une projection sans donnee privee distinguant verified=false, recipeDemo=true et bookingAllowed=true. Libelle visible : Profil fictif de demonstration - reservation de recette uniquement. Aucun badge Coach verifie pour cette autorisation. Les donnees de qualifications restent vides.

## Changements a realiser apres revue

| Zone | Changement borne |
|---|---|
| Service administratif | Operation distincte approuver-recette, sans modifier le role Auth ni la verification professionnelle; trace locale avec acteur et date reels |
| Lanceur recette | Charger uniquement cette autorisation serveur depuis la configuration locale, jamais variable publique |
| Service coachs et projections | Distinguer affichage professionnel et eligibilite recette; conserver l exclusion des donnees privees |
| Reservation | Utiliser une decision serveur centralisee autorisant verified OU approbation recette strictement bornee |
| Pages coach/reservation/compte | Montrer clairement la demonstration et conserver verified=false; aucune mention de diplome valide |
| Production | Aucune activation possible par simple identifiant ou corps de requete; garder les conditions strictes et verifier leur refus |

Ne pas activer simplement GETYOURMENTOR_ALLOW_DEMO ou ACCEPTANCE_MODE : cela changerait les replis de stockage/paiement et fausserait les essais externes. Ne pas recopier un cookie admin fabrique ou modifier app_metadata pour contourner requireRole.

## Controles d acceptation

- Refus par defaut si une seule condition de recette manque.
- Refus sur domaine public, autre projet, autre coach, cle live et requete utilisateur forgeant approval/verified.
- verified et verification_status inchanges en base.
- Libelles de demonstration sur carte, fiche, recapitulatif et compte; verification mobile et clavier.
- Reservation refusee pour le deuxieme coach non autorise.
- Nouvelle autorisation revoke sans toucher au statut professionnel ni aux historiques financiers.
- Parcours externe distinct des mocks : reservation, reception Telegram, acceptation, Checkout test, webhook, transfert, remboursement.

## Limites actuelles

Proposition non executee : aucun coach rendu reservable, aucune nouvelle regle active. Le blocage Stripe Connect demeure independant. La configuration exacte du mecanisme administratif distinct doit etre revue avant de le brancher au parcours, comme demande par l utilisateur.

## Realisation du 5 novembre 2026

Orientation validee par consigne utilisateur bf8ee1c7 puis reprise 8eaffb04. Integration locale controlee et appliquee, aucune migration ni modification de verified. Les sections Proposition ci-dessus conservent le contexte historique. Details actuels et limites : docs/CONNECT_PARCOURS_TEST_2026-11-04.md, section du5novembre; preuves docs/assets/recipe-approval-2026-11-05/.

Operation administrative : scripts/set-recipe-coach-approval.ps1 depuis gym-next, option -Revoke pour retirer. Ces operations sont locales et necessitent une relance du lanceur start-test-services.ps1, sans fabrication de session admin. Audit prive : LOCALAPPDATA/GetYourMentor-Test/recipe-approval-audit.jsonl. Configuration DPAPI, aucune valeur a copier dans Git.
