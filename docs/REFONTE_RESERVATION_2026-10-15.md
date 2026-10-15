# Créneaux et récapitulatif — 15 octobre 2026

## Reprise et périmètre

Base distante vérifiée : `3f6d3a30fec39eaac293b2989576cfaf57aae049`, branche `design/refonte-progressive-lot1`. Les nombreux changements locaux de comptes, paiements, structures, configuration et supervision ne sont pas inclus. Candidat testé dans le worktree détaché `C:/Users/cashe/Documents/GYM-booking-review`, depuis cette base et les seuls fichiers de ce lot. Dépendances accessibles par une jonction locale ; aucune nouvelle dépendance ajoutée. Les résultats ne certifient pas l’ensemble de l’arbre local modifié.

Priorité confirmée par `REFONTE_PROGRESSIVE_2026-10-15.md`, section devenue « Historique — footer et connexion ». Deux routes migrées : `/creneau` et `/recapitulatif`. Suppression de leur injection de `legacy-prototype.css`, réutilisation de `DiscoveryFrame`, feuille bornée à `#gym-booking` et classes `bk-*` pour éviter les règles et animations historiques. Header, langue et footer communs conservés.

## Sources et décisions

Les PDF originaux ont été lus avec pypdf, sans transfert externe. Pages citées : numérotation du fichier PDF.

| Décision | Source et limite |
| --- | --- |
| Conserver réservation, paiement et commission 15 % | MVP/V1 « Fonctionnalités générales », p. 1 ; devis DEV prioritaire, p. 1–2 ; Business Plan, p. 35–36 et 49–50. Aucun changement de calcul financier. |
| Clarifier demande → acceptation coach → paiement | Document maître, §5 ; `governance/roles/README_PRODUCT.md`, priorités 3–5. Le libellé ne promet plus une confirmation immédiate. |
| Respecter l’accessibilité et la simplicité | Pitch Deck, p. 12, quatre piliers ; contrat visuel actif du 15 octobre et maquette approuvée. Violet, papier, encre et typographies existants. |
| Ne pas supprimer le paiement du MVP | Perplexity, p. 4, contredit MVP p. 1 et devis p. 1–2. Recommandation secondaire écartée. Tarifs 50/200 € p. 6 déjà arbitrés dans l’audit des écarts ; aucun abonnement activé ici. |
| Progresser par essais vérifiables | Perplexity p. 5 ; Business Plan p. 49–50. Les tests automatisés ne sont pas une bêta utilisateur. |

Contradiction supplémentaire conservée dans les sources : Business Plan p. 36 évoque à la fois montant total après 48 h et remboursement 50 % entre 48 et 24 h ; le MVP p. 1 précise ce dernier palier. Aucune nouvelle politique d’annulation ni promesse de délai de remboursement introduite dans ce lot. Le devis inclut une application mobile, tandis que le document maître §1 prescrit le web d’abord ; pas de chantier natif ouvert.

## Expériences retrouvées et prévention

Pas de répertoire identifié comme une bibliothèque complète « erreurs et solutions par métier ». Sources réellement retrouvées : cycles 003 (créneaux), 004 (récapitulatif), 013 (tunnel métier), rôles PRODUCT/DESIGN/CTO/DEVOPS/QA/SEO, rapports de refonte et PDF local `docs/governance/Prompt_Codex_V5_Intelligence_Professionnelle_Adaptative.pdf`. Ce dernier est une proposition de gouvernance, pas une preuve qu’un moteur V5 existe : seules ses distinctions observations/hypothèses et ses scénarios humains éclairent cette revue. Aucun moteur ni agent supplémentaire installé.

| Métier / expérience | Cause ou risque | Prévention appliquée |
| --- | --- | --- |
| Produit / UX : confiance au moment de choisir | Adresse, notes chiffrées et bilan inclus codés en dur | Retrait de ces assertions ; ville et sélection conservées ; démonstration explicitée. |
| Développement : perte de contexte, cycles 003/004 | Paramètre reservationId absent du lien compte | Conservation avec le claimToken déjà transmis ; tests des liens connexion, création et modification. Aucun jeton réel dans les captures. |
| QA : glyphes cassés, cycle 003 | Encodages successifs et contrôle uniquement fonctionnel | Relecture des textes ; écriture Unicode directe après défaut constaté du pipe PowerShell/Python. |
| Accessibilité : erreur réseau sans issue | Disponibilités inconnues mais envoi permis | Erreur annoncée, blocage de l’envoi, bouton de nouvelle tentative ; clavier et focus testés. |
| UI : concurrence CSS, refontes précédentes | Injection globale d’une feuille héritée | Retrait sur les deux routes et frontière dédiée ; vérification des pages découverte qui partagent le cadre. |
| Exploitation : aperçu local différent de la livraison | Correctifs locaux non committés | Build isolé depuis HEAD, sélection explicite des fichiers, confirmation SHA distant. |

## Recherche web et perspective humaine

- **Recommandation professionnelle** : [W3C WAI, formulaires en plusieurs étapes](https://www.w3.org/WAI/tutorials/forms/multi-page/) : étapes logiques, instructions répétées, progression identifiable. Application : repères demande/récapitulatif et explication de l’étape suivante.
- **Recherche d’utilisabilité, secteur adjacent** : [Baymard, checkout](https://baymard.com/research/checkout-usability) : lisibilité du parcours et réduction de l’intimidation des formulaires. Ses résultats e-commerce ne prouvent pas une amélioration de conversion chez GYM.
- **Expériences humaines publiées** : [Sport England, inclusion numérique et activité physique](https://www.sportengland.org/guidance-and-support/innovation-and-digital-support/digital-inclusion-and-physical-activity) présente quatre parcours individuels et des obstacles d’accès numérique au sport. Cela motive des instructions simples et une récupération après erreur, sans les attribuer aux utilisateurs de GYM.

Hypothèses de conception à confronter à des personnes réelles : le sportif novice peut confondre demande et réservation confirmée ; le coach veut éviter une attente de paiement avant son accord ; la structure veut un planning cohérent avec celui de son coach affilié. Le lot clarifie les deux premières attentes dans le tunnel commun. Aucun écran structure ni affiliation n’est modifié ; leur recette complète demeure séparée. Aucun entretien, taux de conversion ni test physique n’est revendiqué.

## Comportement livré et limites

Le calendrier est défilable dans son cadre sur mobile. Les boutons gardent des cibles de 44 px, noms de jour/heure accessibles et états de sélection. Erreur de disponibilité : l’utilisateur peut réessayer ; ni clic ni activation clavier ne doit envoyer une demande tant que la vérification a échoué. Erreur POST : message maintenu et nouvel essai possible. Identifiant et jeton restent dans les liens déjà concernés par le tunnel. Prix affichés en euros ; liens « Revoir le coach », « Choisir une autre séance » et « Modifier la séance » décrivent leur navigation réelle, sans prétendre ajouter ou supprimer une réservation.

Le calendrier hérité utilise des dates fixes de mars/avril 2026 et transmet seulement une heure. Le récapitulatif affichait même un vendredi fixe indépendamment du choix : cette fausse restitution est retirée. Les limites sont visibles ; ce lot **ne livre pas un calendrier réel**. Le même horaire sur plusieurs jours reste une seule valeur métier, et l’occupation reste indexée sur l’heure. Ce problème nécessite un lot serveur distinct (date complète, fuseau, capacité, concurrence, compatibilité des réservations). Ne pas activer commercialement ce calendrier à partir de la seule refonte.

Les montants et noms affichés reprennent les paramètres existants ; ils ne sont pas certifiés comme source serveur. La connexion conserve `redirect=paiement` pour compatibilité du tunnel existant ; le texte explique que le paiement dépend de l’acceptation. Une revue du parcours authentifié et de la vérité serveur reste nécessaire avant production. Aucun droit, API, Stripe, RLS ou remboursement modifié.

## Vérifications et livraison

Résultats finaux et empreintes : `assets/reservation-editoriale/verification.json`. Journaux locaux conservés dans le worktree isolé sous `gym-next/playwright-artifacts/booking-editorial/`. Premier passage : 26/30, avec deux assertions détectant les anciens avis encore présents et deux sélecteurs d’alerte ambigus à cause de l’annonceur Next.js. Après correction : 30/30 puis 8/8 pour la capture. L’examen visuel a ensuite révélé les fonds sombres et panneaux masqués hérités, malgré ces tests fonctionnels verts : classes isolées, assertions de couleur et d’opacité ajoutées ; campagne 30/30 réussie. Une dernière recette ciblée couvre les ajustements de devise et de libellés, résultats dans le JSON.

Dernier build et typage : **PASS**. Après les derniers ajustements, recette ciblée **18/18 PASS** (8 réservation éditoriale, 10 tunnel métier), sur les deux profils Chromium, un worker. Campagne précédente après isolation CSS : **30/30 PASS**, incluant 12 tests de découverte. Configuration Netlify, secrets suivis et frontière client/serveur : **PASS** ; pré-push fil rouge : **CONFORME**. Les sept fichiers code/test livrés correspondent au candidat testé par SHA-256. Avertissements autoprefixer historiques présents dans les premières compilations, sans blocage ; aucune nouvelle dépendance.

Les captures finales proviennent du navigateur Playwright du cadre de recette existant, sur le build de production isolé : [créneaux desktop](assets/reservation-editoriale/creneau-1440.png), [créneaux mobile](assets/reservation-editoriale/creneau-390.png), [récapitulatif desktop](assets/reservation-editoriale/recapitulatif-1440.png), [récapitulatif mobile](assets/reservation-editoriale/recapitulatif-390.png). Disponibilités vides simulées par interception GET pour déterminisme ; aucun POST dans ces captures. L’appel au connecteur Playwright MCP n’a pas abouti ; contrôles, captures et interactions sont réalisés par Playwright local. Le lancement manuel sans cadre de recette a correctement montré la protection de production ; ces images intermédiaires ont été remplacées. Le redémarrage manuel avec les variables de recette a été refusé par le contrôle automatique ; aucune protection modifiée, utilisation du lanceur de tests existant.

CI GitHub : `mvp-gates.yml` ne se déclenche pas sur un push de cette branche ; aucun succès CI distant revendiqué. Aucun outil de publication utilisé ; `netlify.toml` définit un build mais ne permet pas, à lui seul, de vérifier les branchements externes de l’hébergeur. Aucun déploiement demandé ni lancé.

Retour arrière : revert du commit ciblé sur cette branche, sans reset des travaux locaux. Prochaine étape : cohérence du parcours authentifié récapitulatif → compte → paiement, avant une éventuelle refonte visuelle du paiement. Prompt de reprise : `PROMPT_SUITE_RESERVATION_2026-10-15.md`.
