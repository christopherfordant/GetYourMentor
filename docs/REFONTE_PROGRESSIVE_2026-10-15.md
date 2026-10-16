> **Décision active — affiliations, 16 octobre 2026 :** coach ou structure peut demander un rattachement ; activation uniquement avec les deux accords. L’envoi vaut accord de son auteur, le destinataire accepte ou refuse. Deux demandes explicites croisées réunissent les deux accords sans doublon. L’administrateur ne remplace aucun consentement. Démo uniquement, sans révocation. Cette décision remplace les mentions historiques d’arbitrage en attente. Reprise : `docs/RESERVATIONS_GROUPES_2026-10-16.md`.

> **Reprise affiliations — 16 octobre 2026 :** contrôle serveur du coach sélectionné renforcé, compatibilité historique conservée. Le cycle demande/confirmation attend un arbitrage utilisateur explicitement demandé ; multi-coachs non terminé. Voir la dernière section de `RESERVATIONS_GROUPES_2026-10-16.md` avant toute intégration du mécanisme.

> **Reprise active — préparation affiliations, 16 octobre 2026 :** maquette interactive séparée desktop/mobile et contrat de réutilisation des services existants, sans modification de l’application. Voir `RESERVATIONS_GROUPES_2026-10-16.md`, section Préparation affiliations multi-coachs, et `maquettes/affiliations-multicoachs/index.html`. Procédure ressources/modèles intégrée à `BRANCH_STRATEGY_GYM.md`. Les priorités ci-dessous plus anciennes restent historiques ; intégration multi-coachs encore à réaliser.

> **Réservations groupées — 16 octobre 2026 :** prix total défini par le coach selon la taille, informations des participants supplémentaires, capacité pondérée, confidentialité par rôle et remboursements historiques simulés. Parcours collectif des structures ; limites mineurs et services distants conservées. Reprise : `docs/RESERVATIONS_GROUPES_2026-10-16.md`.

> **Consolidation réservation — 16 octobre 2026 :** calendrier daté UTC/Europe-Paris, chevauchements par durée, capacité des séances structure, confirmation d’un créneau et libération des alternatives, commission historique et annulation simulée. Périmètre, preuves, limites et reprise : `docs/CONSOLIDATION_RESERVATION_2026-10-16.md`. Réservation pour plusieurs tiers et RLS distante restent à traiter ; aucun déploiement ni paiement réel.

> **Reprise obligatoire a chaque prompt :** lire AGENTS.md et la procedure de BRANCH_STRATEGY_GYM.md (a la racine du depot). Verifier, documenter, commiter et pousser les lots valides sur la branche appropriee avant la reponse finale ; confirmer le SHA distant. Preserver les travaux anterieurs non verifies.

## Dernier lot — textes visiteurs et accès réels, 16 octobre 2026

Accueil débarrassé des consignes de conception et citations internes, guide/aide adaptés aux visiteurs ; recherche, compte coach et inscription structure accessibles par des liens réels. Informations d'offres et suivi avec limites explicites, sans achat ni activation Premium. Six pages légales provisoires reformulées, cookies reliés au contrôle existant et routes légales héritées inconnues rejetées en 404.

[Audit complet, inventaire, preuves et limites](AUDIT_TEXTES_ACTIONS_2026-10-16.md). Build/typage isolés PASS ; 74/74 tests puis 6/6 comptes connectés PASS. Les contrôles inventoriés des comptes ne fonctionnent pas tous : liens latéraux de déconnexion vers l'accueil, ancres absentes et planning illustratif dans la base committée. Correctifs métier locaux préservés, exclus de ce lot. `/structures` et `/demo` restent locaux ; pas de livraison ni déploiement implicite.

Prochain lot prioritaire : valider les correctifs de déconnexion UI et corriger les menus inertes des comptes, avant réservation datée, services réels et abonnements. Commission 15 % et historiques inchangés. Branche : `design/refonte-progressive-lot1`, SHA distant à vérifier à chaque reprise. Aucun déploiement.

## Historique — créneaux et récapitulatif

Deux routes reprennent le cadre éditorial partagé, sans injection CSS héritée. Le calendrier mobile défile dans son cadre, les données fictives de confiance sont retirées, les erreurs de disponibilité permettent une nouvelle tentative et bloquent l’envoi. Identifiant de réservation conservé vers le compte. La demande, l’acceptation du coach et le paiement sont explicités.

[Rapport, sources et limites](REFONTE_RESERVATION_2026-10-15.md). Le calendrier hérité ne transmet qu’une heure ; les dates illustratives ne constituent pas une réservation réelle. Prochain lot : cohérence du statut et du contexte récapitulatif → compte → paiement, avec [prompt de reprise](PROMPT_SUITE_RESERVATION_2026-10-15.md). Aucun changement des API, droits, commission ou RLS, aucun déploiement.

## Historique — footer et connexion

Zone réservée en tête de footer pour la flèche SVG centrée et les préférences cookies, sans doublon ni recouvrement des liens ; bannière initiale indépendante et retour de focus. Footer commun compact, sans ancres sociales fictives, avec disposition en colonnes et ancrage bas de viewport sur une page courte. Bouton email avec enveloppe ; Google identifié mais désactivé, aucun OAuth simulé.

[Rapport, preuves et informations manquantes](FOOTER_CONNEXION_2026-10-15.md). Les URL officielles des réseaux sociaux restent à fournir ; configuration commune prête, aucune adresse inventée. Build/typage isolés et vérifications consignés dans le rapport et son JSON de preuves. Branche : `design/refonte-progressive-lot1`. Modifications antérieures de layout, cookies et comptes préservées hors du commit ciblé ; aucun paiement réel, changement de droits ou déploiement.

La suite reste la déclinaison des créneaux et du récapitulatif. Ce lot n’active pas Google OAuth, ne certifie pas les services de production et ne remplace pas les décisions métier.

## Historique — découverte éditoriale

Recherche, annuaire et fiche déclinent le design de l’accueil : cadre partagé, typographies communes, palette violette fixe, compositions responsive, données de catalogue et sept destinations du header préservées. Les trois injections de CSS hérité sont retirées ; classes `de-*`, sans modification des CSS comptes/paiements locaux. Préférences cookies et retour en haut après le footer ; validation des disciplines inconnues et états de chargement/erreur ajoutés.

Livraison détaillée, limites, captures desktop/mobile et retour arrière : [lot découverte](REFONTE_DECOUVERTE_EDITORIALE_2026-10-15.md). Build et typage isolés PASS ; 40/40 tests de production (découverte, tunnel et accueil), puis 6/6 contrôles responsive après le dernier ajustement du libellé accessible du logo, un worker. Aucun paiement réel, changement de commission, de droits, de RLS ni déploiement. Branche : `design/refonte-progressive-lot1`.

Prochain lot : créneaux et récapitulatif selon la même identité, avant le paiement. Catalogue local non configuré : les captures de profils complets utilisent les fixtures de recette existantes. Changements antérieurs préservés et non inclus automatiquement. RLS distante et audit SEO/performance exhaustif non certifiés par ce lot.

## Historique — palette fixe, audit et contrats alignés

Instruction actuelle : poursuivre la refonte par phases et retirer de l’accueil le changement de coloris. Retrait du bouton `#palette`, de l’état React et des dix règles CSS de variante/comparaison. Violet validé conservé ; prototype original intact. Contrats, tokens et recette alignés ; consignes de reprise corrigées après un défaut d’encodage de leur première écriture.

[Audit des écarts et phases suivantes](AUDIT_ECARTS_REFONTE_2026-10-15.md) : PDF Stratégie perplexity consulté directement, divergences p. 4 et 6 consignées. Les propositions 50/200 € et l’exclusion des paiements ne remplacent pas les sources prioritaires. RAG distant non configuré ici ; recherche locale et évaluation lexicale 8/8, sans nouvelle couche d’outils.

Recette : build et typage PASS en worktree isolé, trois fichiers de code/test strictement identiques par SHA-256. Accueil : 10/10 tests développement, puis 10/10 production isolée, un worker ; neuf largeurs de 320 à 1440 px, profils, dialogues, Échap/focus, palette fixe après rechargement, langue, FAQ, cookies et accès compte. Playwright MCP a examiné le rendu local avant/après puis le build isolé. Configuration Netlify, secrets suivis, frontière client/serveur et schéma Supabase statique PASS. Les avertissements CSS autoprefixer historiques restent présents.

Preuves : [avant desktop](assets/alignement-accueil/avant-1440.png), [production desktop](assets/alignement-accueil/production-1440.png), [production mobile](assets/alignement-accueil/production-390.png), [haut mobile](assets/alignement-accueil/production-top390.png), [empreintes et résultats](assets/alignement-accueil/verification.json).

Périmètre : aucun changement de route, API, autorisation, RLS, paiement, commission ou donnée. Pas de validation RLS en base distante, de certification SEO/sécurité globale ni de CI distante déclenchée sur cette branche. Changements métier antérieurs préservés et exclus du lot. Aucun déploiement. Branche de livraison : `design/refonte-progressive-lot1` ; SHA de livraison à vérifier dans Git, sans inscription auto-référente dans son propre commit.

Prochain lot : composition et typographie éditoriales sur recherche/annuaire/fiches, avec maquettes pour toute évolution importante dépassant la référence, maintien des paramètres et recette du passage vers `/creneau`. V2/V3 restent incomplètes. Retour arrière : revert du lot ciblé, sans reset des travaux locaux.

## Historique — accueil issu de la maquette HTML complète

La nouvelle validation porte sur l’ensemble de `GetYourMentor_Audit_Design_2026-10-15/maquette/index.html` et remplace la direction « recolorer en clair » comme méthode de refonte. Le HTML, son CSS et son JavaScript ont été lus ; Playwright MCP a examiné desktop/mobile, panneaux coach/structure, dialogue Premium et variante verte.

État initial : branche `design/refonte-progressive-lot1`, dernier push connu `1e8a6df`, commit local `64ad4e8` non poussé (37/38 tests isolés), corrections de dimensions/carrousel indexées. Le lot de découverte n’était pas livré. Ses correctifs utiles sont conservés ; l’ancien accueil est remplacé sur la route principale, pas effacé avec les travaux antérieurs.

### Correspondance de tous les éléments de la maquette

| Élément source | Intégration dans l’application | Comportement / dépendance | Statut |
| --- | --- | --- | --- |
| Bande de revue | Bande de présentation | Texte adapté ; offres sans achat | Intégré / adapté |
| Logo et header | Header éditorial | Trois ancres ; Mon compte vers /compte, y compris mobile | Intégré / adapté |
| Hero, étiquette violette, photo et carte superposée | Haut de l’accueil | CTA vers recherche réelle ; visuel d’illustration | Intégré |
| Quatre disciplines | Puces du hero | Liens vers recherche avec sport conservé | Intégré / adapté |
| Bande de valeurs | Sous le hero | Surface encre et SVG source | Intégré |
| Trois cartes de profils | Section profils | Sélectionne le panneau correspondant | Intégré |
| Espace sportif | Panneau indépendant de la session | Étapes de réservation expliquées, aucune séance inventée | Aperçu intégré |
| Espace coach | Panneau coach | Demande illustrative ; états financiers distingués | Aperçu intégré |
| Espace structure | Panneau structure | Affiliation et planning illustratifs ; aucune équipe réelle créée | Aperçu intégré |
| Modules suivi/contenus/multi-coachs | Cartes, étiquettes et dialogues | Droits, facturation et critères restent à développer | Présentation intégrée / métier prévu |
| Forfait sportif 0 % | Carte dédiée | Pas de frais ajoutés au sportif ; séance toujours payante | Présentation documentée |
| Premium coach 19,99 €/mois | Carte dédiée | 0 % séances et 20 % contenus prévus, non activés | Présentation documentée / activation prévue |
| Structure 29,99 €/mois, +3,99 € | Carte dédiée | Deux coachs ; périodicité du supplément à confirmer | Présentation documentée / activation prévue |
| Feuille de route | Section suite | Ordre de progression, pas une annonce de V2/V3 terminée | Intégré |
| Sources | Section de projet | Texte de validation actualisé ; liens légaux réels, PDF locaux non publiés | Intégré / adapté |
| FAQ existante | Sous la section de projet | Accordéons natifs, ancres historiques préservées | Fonction conservée |
| Pied de page | Footer éditorial | Texte adapté ; langue native conservée | Intégré / adapté |
| Navigation mobile | Barre de la maquette | Ancres, accès compte en header ; cookies séparés | Intégré / adapté |
| Dialogues sportif/coach/club/réservation/suivi | Dialog HTML natif | Échap, fermeture, focus ; aucun POST commercial | Intégré |
| Comparaison verte | Retirée par la demande utilisateur suivante | Palette violette fixe, aucun contrôle de coloris | Retiré du site ; prototype original préservé |
| Nouvelles pages non représentées dans le HTML | Lots suivants | Déclinaisons desktop/mobile avant changement important | Prévu |

### Socle, sources et limites

Le composant `EditorialHome.tsx` reprend la structure source en React ; `gym-editorial-design.css` est transposé et borné par `#gym-editorial`. Les anciennes feuilles de l’accueil ne sont plus utilisées par la route / ; leurs composants restent conservés pour ne pas supprimer le travail local. Pas de framework, agent ou installation supplémentaire.

L’image est réutilisée à l’identique depuis `public/design_assets/content_library/football/football-coach-rain.jpg`, déjà suivie dans le dépôt. SHA-256 : `933cd2875e09e925e03701384dcb7c2637f4978fc4abd635c14d5db229627027`. Aucun nouveau droit de licence attribué et aucun document transmis à un service externe. Les fichiers originaux de la maquette restent intacts.

Sources commerciales : Business Plan p. 30 et 35–36, pitch p. 13–16, MVP p. 1. Commission de référence 15 %, réglage administrable et historiques inchangés. Offres, outils et données illustratives restent explicitement distingués des fonctions réelles. HT/TTC, engagement, résiliation et supplément structure restent à préciser avant activation.

Les contrats VISUAL_REFERENCE_CONTRACT, DESIGN_SYSTEM et VISUAL_ACCEPTANCE sont alignés sur cette validation. Le header de la maquette est clair ; ses surfaces foncées ciblées sont maintenant admises. Cette décision ne rétablit pas le thème bleu nuit/lime. Les anciennes décisions restent visibles comme historique.

### Recette et livraison

**Livraison vérifiée et code poussé : `37c8db2` sur `origin/design/refonte-progressive-lot1`. Aucun déploiement.** Build et typage PASS dans un checkout isolé, sans les correctifs métier locaux. **42/42 tests PASS**, un worker : accueil éditorial (10), découverte et cohérence de catalogue (8), comptes (14), parcours métier (10). Largeurs de découverte/accueil : 320, 390, 430, 621, 768, 900, 1024, 1280, 1440 px.

Le premier build isolé du candidat `3bb0edf` a détecté un attribut JSX dupliqué dans l’ancien composant conservé. Correction dans `37c8db2`, puis build complet et 42/42 PASS. Les campagnes de développement 5/5 puis 10/10 restent des preuves intermédiaires, pas une certification du premier candidat.

Playwright MCP : maquette et vrai build isolé, six sections, panneaux coach/structure, dialogue, variante locale et retour au violet. Échantillons de contraste : intro 5,75:1 ; CTA et onglet sélectionné 6,71:1. Reflow à 720 px avec introduction allongée : clientWidth = scrollWidth = 705 px. Cela vérifie la composition équivalente à 1440 px à 200 %, sans certifier tous les mécanismes de zoom natif et de traduction de chaque navigateur.

Contrôles secrets suivis, frontière client/serveur et configuration Netlify : PASS. Aucun POST commercial pendant les aperçus testés. Aucun paiement réel, aucune activation Premium, aucun changement de commission ou de droits.

| Aperçu | Référence HTML | Application réelle |
| --- | --- | --- |
| Desktop | [maquette](assets/refonte-editoriale/editorial-reference-1440.png) | [accueil](assets/refonte-editoriale/editorial-final-1440.png) |
| Mobile | [maquette](assets/refonte-editoriale/editorial-reference-390.png) | [accueil](assets/refonte-editoriale/editorial-final-390.png) |
| Hero desktop | [référence](assets/refonte-editoriale/editorial-reference-top1440.png) | [résultat](assets/refonte-editoriale/editorial-final-top-1440.png) |
| États | — | [coach](assets/refonte-editoriale/editorial-final-coach.png), [structure](assets/refonte-editoriale/editorial-final-structure.png), [dialogue](assets/refonte-editoriale/editorial-final-dialog.png) |

[Ancien accueil mobile](assets/refonte-editoriale/discovery-before-accueil.png). [Synthèse et empreintes](assets/refonte-editoriale/verification.json). Journaux : `gym-next/playwright-artifacts/editorial/commit-build-final.log` et `commit-tests.log`. Les preuves sont ajoutées dans le commit documentaire suivant. Le serveur de test et l’onglet MCP temporaires sont fermés ; les sessions utilisateur et VS Code sont préservés.

Limites de livraison : seule la route d’accueil reprend la maquette intégrale. Recherche, annuaire, fiche et comptes conservent leurs migrations précédentes en attendant les déclinaisons visuelles dédiées. Les modules de progression, multi-coachs, facturation d’abonnements et droits de contenus restent prévus, tels qu’indiqués dans les cartes et la matrice. Aucun déploiement Netlify ni changement de production.


Retour arrière : revert des commits éditoriaux, sans reset des données ni suppression des modifications métier locales. Prochain lot : déclinaison de cette référence sur recherche/annuaire/fiches ; consolider leurs contrôles puis comptes et tunnel. La refonte complète, V2 et V3 ne sont pas déclarées terminées.

---

# Refonte progressive GetYourMentor — état de reprise

## Décision et références

Le 15 octobre, l'utilisateur valide la maquette locale `GetYourMentor_Audit_Design_2026-10-15/maquette/index.html` comme direction de refonte progressive, puis demande l'implémentation d'un premier lot vérifié, documenté et poussé. Le header conserve noms, ordre, destinations et organisation. Les vérifications visuelles utilisent Playwright MCP. Aucune publication en production, aucun paiement réel.

Références métier : les trois PDF prioritaires du document maître ; Business Plan p. 30 et 35–36 pour les offres, MVP p. 1 et devis p. 1–2 pour les fonctions. Audit local `GetYourMentor_Audit_Design_2026-10-15/AUDIT.md`. La commission actuelle reste **15 %**, administrable avec historique. Premium à 0 %, contenus à 20 % et abonnements restent des fonctionnalités prévues, pas activées par la refonte.

## Inventaire et périmètre

Routes existantes : `/`, `/recherche`, `/coachs`, `/coach`, `/creneau`, `/recapitulatif`, `/compte`, `/paiement`, `/inscription-club`, `/structures`, `/demo`, `/legal/[slug]`, `/admin/knowledge`. L'administration métier est également un mode de `/compte`.

Composants à préserver : header propre à chaque famille de pages, sélecteur de langue, navigation, cookies, session/authentification, autorisations et modules de réservation/paiement. Les pages héritées injectent `legacy-prototype.css` ; `redesign-2026.css`, `final-motion-overrides.css`, le style JSX et les corrections de comptes ont des règles concurrentes. Ne pas ajouter une nouvelle collection d'overrides par page sans frontière de migration explicite.

Le dépôt avait de nombreuses modifications antérieures, dont les correctifs de paiements et de comptes et des journaux de supervision. Référence initiale : `27c2a5b`. Le diff complet, les empreintes et les originaux des deux fichiers touchés sont sauvegardés dans `gym-next/playwright-artifacts/refonte-lot1-2026-10-15/`. Ces changements antérieurs restent locaux ; ils ne sont pas automatiquement inclus dans le commit de design.

## Lots proposés

| Lot | Périmètre et résultat attendu | Vérifications / retour arrière |
|---|---|---|
| 1 — comptes et socle | Tokens partagés ; frontière opt-in du compte ; panneau coach complet, contrastes, navigation mobile ; header seulement recoloré | Largeurs 320/390/768/1440, contrat du header, clavier, formulaires, rôles, cookies ; retirer l'import et le marqueur pour revenir au style précédent |
| 2 — découverte | Accueil, recherche, annuaire et fiche coach selon la maquette ; cohérence des informations et mentions d'acceptation | Captures desktop/mobile et parcours recherche→profil ; rollback par commit |
| 3 — réservation | Créneaux, récapitulatif et paiement : états, annulation, dates, montants et simulation explicites | Régression métier, droits et snapshots ; rollback sans modifier les réservations |
| 4 — structures/admin | Inscription structure et administration homogènes ; maquettes avant nouvelles fonctions | Vérification des rôles et données privées ; aucun nouveau bénéficiaire de paiement implicite |
| V2 — fiabilité et gestion | Affiliations, permissions, groupes et communication documentés ; séquençage après dépendances métier | Spécifications et maquettes des états nouveaux, capacité/concurrence, permissions et canaux réels |
| V3 — valeur additionnelle | Premium, contenus protégés, suivi et statistiques seulement selon périmètre arbitré | Billing, droits serveur, consentements, critères de suivi et maquettes validés avant activation |

Les termes V2/V3 doivent rester cohérents avec les documents métier existants : ce tableau est un ordre de travail, pas une redéfinition ni une déclaration de livraison de ces versions. Les critères de suivi, le bénéficiaire structure et les conditions d'abonnement restent des arbitrages distincts.

## Lot 1 : changement réalisé

- `gym-design-tokens.css` porte la palette validée : violet #872BBF, papier #F6F4F0, encre #141316, surfaces blanches et contrastes cohérents. Les variables sont préfixées ; elles ne changent pas les autres pages.
- `gym-account-design.css` applique cette direction uniquement dans `#gym-account[data-gym-design="pitch-v1"]`. Le marqueur est ajouté au composant existant et la feuille au layout. Aucun déplacement ou renommage d'élément du header ; seules couleurs et bordures sont adaptées.
- Cause mesurée avec Playwright MCP : `.account-panel` en flex et `.account-dashboard` rétréci à **99 px** sur mobile ; passage à un panneau bloc et une grille bornée. L'aperçu DOM donne **308 px** après adaptation initiale. La suppression d'un scroll interne parasite libère aussi de la largeur ; le header garde ses groupes et leur ordre.
- Menu coach sombre avec liens clairs et cibles de 44 px ; groupes de liens repliés en lignes sur mobile. Cartes, champs et images bornés, grille pleine largeur sous 900 px. Les styles du header n'imposent aucun nouveau display, ordre, alignement ou texte.
- Suppression ciblée du reflet décoratif `account-panel::before` : sa hauteur suivait le tableau de bord entier (plus de 9 500 px) et sa rotation provoquait un débordement horizontal à 1 877 px pour une fenêtre de 390 px. Sans cet effet, Playwright MCP mesure 375 px de largeur de document dans une fenêtre de 390 px avec scrollbar. Le contenu reste déplié ; aucune donnée n'est masquée pour faire passer le contrôle. Le libellé latéral « Vérification » est corrigé.
- Les déclarations prioritaires restent nécessaires à la frontière avec les anciennes règles forcées. Elles sont centralisées dans une seule feuille de migration du compte ; suppression des anciennes couches à prévoir après migration des routes, pas avant contrôle de leurs consommateurs.
- Aucun changement de logique financière, aucun nouvel abonnement, aucune nouvelle dépendance applicative. Le problème des séances annulées dans les « prochaines séances » appartient au lot métier suivant et n'est pas dissimulé par du CSS.

## Simplification : constat initial

LangChain/LangGraph : **non ajoutés**. Aucun besoin mesurable ne justifie ces dépendances pour une refonte visuelle ou le contrôle du tunnel. Les Route Handlers et les tests existants suffisent ici.

RAG/gouvernance/orchestration : les contrôles de corpus et contrats sont référencés par `package.json` et la CI ; les schémas et documents métier ont des consommateurs. Aucune suppression globale justifiée sur ce premier lot. Les tableaux de bord historiques non rendus, scripts de diagnostic à la racine et couches CSS sont candidats à une analyse de références séparée. Les documents originaux ne sont pas des doublons à effacer.

## Vérifications et livraison

Typage et build optimisé : **PASS**, journaux `types-final.log` et `build-release.log`. Contrat Netlify et frontière secrets du bundle client : **PASS**. Garde production et isolation du module structures : **PASS**, journal `production-safety.log`.

Recette : les **38 scénarios distincts sont vérifiés**, sans annoncer une campagne unique à 38/38. La campagne `tests-release.log` donne **36/38** ; les deux échecs utilisent un sélecteur `data-account-dashboard="sportif"` qui n'existe pas dans le composant sportif. Après remplacement par le titre réellement affiché « Mes réservations », les deux scénarios sont rejoués : **2/2 PASS** dans `tests-business-final.log`, desktop et mobile. La connexion et l'annulation de la réservation de recette passent par le navigateur, pour respecter le cookie Secure même en HTTP local, sans modifier les règles de l'application.

Les huit nouveaux scénarios `account-design.spec.ts` vérifient largeur utile du planning, absence de débordement, contraste du menu, clavier, champs présents et contrat des sept liens du header, aux quatre largeurs et sur les deux profils de navigateur. Les trente scénarios de régression couvrent comptes/déconnexions, cookies, navigation, réservation et tunnel structures avec paiement simulé. La première recette intermédiaire révélant le reflet décoratif reste archivée ; elle a été interrompue pour corriger la cause avant recompilation.

Playwright MCP a servi à reproduire le défaut sur la démo existante, mesurer les largeurs, prévisualiser les styles dans le DOM puis vérifier le vrai build local. Les captures suivantes proviennent du build final, pas d'une image de maquette : [mobile avant](assets/refonte-lot1/coach-mobile-before.png), [mobile après](assets/refonte-lot1/coach-mobile.png), [desktop après](assets/refonte-lot1/coach-desktop.png). Les journaux et empreintes sont dans `gym-next/playwright-artifacts/refonte-lot1-2026-10-15/`.

Les tests et le serveur ont été exécutés séquentiellement avec un worker. Aucun serveur additionnel conservé. Aucun nouveau déploiement Netlify dans ce lot ; le rendu contrôlé est local et la démo publique conserve sa version précédente. Les travaux backend antérieurs restent dans l'arbre de travail et ne sont pas inclus automatiquement dans le commit visuel.

Branche de travail : `design/refonte-progressive-lot1`. Aucun force-push ni fusion dans `main`. Le commit sélectionne seulement la refonte, les tests associés et les mises à jour documentaires correspondantes. Les snapshots locaux et le diff de référence ne sont pas poussés ; trois captures optimisées accompagnent le rapport. Le test de réservation inclut explicitement la correction connexe de choix d'un créneau libre et d'annulation de sa propre fixture, nécessaire au rejeu fiable.

Retour arrière : revert du commit de design sur cette branche ; pour l'arbre de travail courant, retirer l'import de `gym-account-design.css` et les attributs opt-in du composant, sans effacer les changements backend antérieurs. Prochain lot : découverte (accueil/recherche/annuaire/fiche) et cohérence des informations. **V2 et V3 ne sont pas livrées** par ce premier lot.

### Commit vérifié et poussé

Le commit de code **`ac8e8e4`** a été vérifié dans un checkout Git isolé, sans les modifications backend locales : **typage PASS, build PASS et 18/18 tests PASS** (`account-design.spec.ts` et `business-flow.spec.ts`, desktop/mobile, 57,7 s). Les dépendances installées ont été réutilisées par jonction locale ; la version Next du lockfile commité et celle installée sont identiques (15.5.27). Aucune réinstallation ni deuxième serveur simultané. Journaux `commit-types.log`, `commit-build.log`, `commit-tests.log`.

Le push de ce commit vers `origin/design/refonte-progressive-lot1` a réussi. Les compléments de preuves sont enregistrés dans un commit documentaire suivant, sans changement de code. Synthèse exportée : [verification.json](assets/refonte-lot1/verification.json). Les captures intégrées plus haut montrent l'application locale avec les correctifs antérieurs conservés ; le checkout isolé vérifie séparément la portion de design réellement poussée. La CI existante ne se déclenche pas automatiquement sur cette nouvelle branche ; aucune réussite distante de CI n'est revendiquée.


## Lot 1 bis — clarification claire et uniforme (15 octobre 2026)

### Arbitrages et reprise

L'instruction utilisateur la plus récente remplace le maintien du sombre et de la disposition mobile figée. Elle conserve les noms, ordre logique et destinations des liens. Le burger est autorisé, pas obligatoire : ce lot conserve tous les liens visibles et les répartit sur plusieurs lignes. Le header devient non fixe sous 900 px pour ne pas recouvrir les ancres. Aucun changement des droits, sessions, commission administrable de 15 % ou montants historiques ; aucun paiement réel.

| Passage historique | Arbitrage appliqué |
| --- | --- |
| `DESIGN_SYSTEM_GYM.md`, thème sombre premium / cartes sombres | Blanc, papier, violet ; passages anciens explicitement historiques |
| `docs/design/VISUAL_REFERENCE_CONTRACT.md`, Domaines couverts 1 : bleu nuit/lime | Palette claire pour les pages migrées ; règles fonctionnelles et reduced-motion conservées |
| Présent rapport, lot 1 : menu coach sombre et header figé | Navigation claire ; présentation mobile adaptable ; liens inchangés |
| `DOCUMENT_MAITRE_GYM.md`, direction violet/noir/papier | Le noir reste une couleur de texte, pas un fond de header/menu |

Pas de contradiction majeure restante nécessitant un arbitrage. Les anciennes mentions sont conservées comme historique, avec un avertissement prioritaire. Aucune nouvelle couche de gouvernance ni dépendance.

### Réalisation

Socle des comptes : header, navigation coach, champs, listes natives, boutons, pied de page et contrôles flottants blancs/papier/violet. Survol, focus visible, désactivation et erreurs aria-invalid harmonisés. Formulaire coach en grille deux colonnes, une sous 620 px ; zones de texte sur toute la largeur. Groupes de champs et formulaire de connexion sans fond sombre ; bordures des champs explicites face aux anciennes règles forcées. Les mots gardent leurs limites naturelles, les chaînes longues peuvent se replier. Le contrôle natif de langue reste seul visible dans le compte : suppression visuelle du double contrôle superposé, sans retirer la sélection clavier/tactile.

Le pied de page partagé débordait à 900 px à cause de ses cinq colonnes minimales : grilles à deux colonnes sous 1100 px, puis une sous 620 px. Correction mesurée avec Playwright MCP : largeur document 1005 px avant, 885 px après pour une fenêtre de 900 px. La portée CSS reste `#gym-account` (ou `body:has(#gym-account)` pour les contrôles de cookies) : les autres familles de pages restent à migrer dans les lots suivants.

### Références ergonomiques consultées

- [Calendly](https://calendly.com/) : navigation regroupée et hiérarchie titres/descriptions/actions ; consultation HTML, sans mesure visuelle de ses espacements.
- [Planity](https://www.planity.com/) : inspection mobile avec Playwright MCP ; accès au compte visible dans le header, navigation compacte, recherche en blocs lisibles. Principes retenus : repères stables, champs distincts, libellés non comprimés. Aucun texte, identité, politique de paiement ou abonnement copié.
- Superprof, page coaching France : accès automatisé en erreur ; aucune conclusion visuelle tirée de cette page.

La maquette locale approuvée et les tokens du projet restent les références de palette. Les PDF métier, dont `Bussiness Plan.pdf`, ne sont pas modifiés.

### Preuves et livraison de ce lot

Avant : [compte mobile du lot précédent](assets/refonte-clair/compte-avant.png). Aprés : [mobile](assets/refonte-clair/compte-mobile.png), [desktop](assets/refonte-clair/compte-desktop.png), [formulaire mobile](assets/refonte-clair/formulaire-mobile.png).

Validation finale : **build/typage PASS et 26/26 tests PASS**, un worker, desktop/mobile : 14 tests de design aux sept largeurs, 10 parcours et 2 tests admin. Netlify, secrets suivis et frontière client/serveur : PASS. Playwright MCP : document de 316 px dans une fenêtre de 320 px ; captures du vrai build, champs natifs bordés. Les options natives gardent le rendu du navigateur/OS.

Journaux intermédiaires conservés : 40/40 puis 39/40 (contexte de navigation détruit dans le test admin). Rejeu final admin desktop/mobile PASS. Un rejeu 25/26 a identifié le style générique appliqué aux flèches du planning à 320 px ; style restreint au bouton d'actualisation, puis 26/26 PASS. Aucun échec n'est compté comme une réussite de sa campagne.

Tests sur l'arbre local avec correctifs métier antérieurs ; commit ciblé sans ces changements backend. Aucun checkout isolé validé pour ce lot. Logs : `gym-next/playwright-artifacts/light-build-final-scoped.log` et `light-tests-final-scoped.log`. Synthèse : [verification.json](assets/refonte-clair/verification.json). Serveur de test arrêté et onglet MCP temporaire fermé.

Branche : `design/refonte-progressive-lot1`. Le commit ciblé du design et de ses preuves constitue cette livraison ; les changements backend antérieurs restent locaux. Aucun déploiement, aucune fusion, aucun force-push. Retour arrière : revert de ce commit ; les originaux documentaires et données restent préservés.

Prochain lot : découverte (accueil, recherche, annuaire, fiche coach), puis réservation/récapitulatif/paiement, structures/administration selon le tableau des lots. V2/V3 restent incomplets. Les limites de ce lot incluent la vérification visuelle approfondie des écrans sportif/structure/admin et une recette complète de zoom navigateur et de traductions longues ; aucun résultat non testé n'est revendiqué.

## Reprise stratégie — 16 octobre 2026
Les versions techniques de ce journal ne redéfinissent pas le Business Plan p.49–51/62–64. La nouvelle mission autorise des lots de démonstration progressifs, sans agents supplémentaires ni lancement commercial. Matrice des 25 pages, priorités et critères : [couverture Stratégie Perplexity](STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md). Premier lot : session UI et navigation ; services distants et V2/V3 non certifiés.
