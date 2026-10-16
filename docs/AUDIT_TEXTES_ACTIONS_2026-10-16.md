# Textes visiteurs et actions réelles — premier lot, 16 octobre 2026

## Résultat et périmètre

Accueil et six pages légales nettoyés ; accès utiles depuis les trois panneaux et les informations d'offres. Ce premier lot n'achève pas toutes les fonctionnalités du site. Base locale/distante confirmée `f0472db`, branche `design/refonte-progressive-lot1`. Les correctifs comptes, paiements, structures, configuration et supervision déjà locaux sont préservés et exclus du candidat livré.

Build et typage dans un checkout isolé, huit fichiers de code/test comparés par empreinte, dépendances existantes via jonction. Recette de production avec fixtures locales : **74/74 tests PASS**, puis **6/6 contrôles des comptes connectés PASS**, un worker. Le relevé de contrôles ne certifie pas que chaque bouton relevé fonctionne : il documente également les défauts ci-dessous. Aucune activation commerciale, paiement réel, modification d'API, de droits, de calcul de commission ou de RLS.

## Textes retirés et comportements corrigés

| Avant | Maintenant | Effet réel |
| --- | --- | --- |
| Sources PDF et pages, « texte proposé », pitch et validation visuelle | Contenu destiné aux sportifs, coachs et structures | Références conservées dans ce rapport, pas affichées comme consignes de projet |
| « Revenir à la maquette », « aperçu de conception » | Informations pratiques, fermeture explicite | Dialogue natif, Échap et retour de focus conservés |
| « Voir mon espace » sélectionnait un panneau de présentation | « Découvrir cet espace » | Action de sélection décrite correctement, sans prétendre connecter l'utilisateur |
| « Prévisualiser le récapitulatif » ouvrait seulement une explication | « Trouver une séance » ouvre `/recherche?sport=football` | Recherche réelle ; explication de réservation séparée |
| « Examiner la demande » dans une demande inventée | « Gérer mes demandes » ouvre `/compte?mode=coach` | Écran de connexion ou compte selon la session, aucune nouvelle demande fictive |
| Coach A/B et affiliations illustratives | Connexion structure et inscription via `/inscription-club` | Routes existantes, pas d'équipe ou de permissions créées par l'accueil |
| Feuille de route technique et « direction validée » | Guide du parcours et questions/informations | Mêmes sections, ancres, composition, header et palette ; aucune nouvelle maquette nécessaire |
| « À développer », « à vérifier », forfait « documenté » | « Prochainement », « souscription indisponible » | Fonction indisponible explicitée, alternative vers recherche ou compte, aucun achat simulé |
| Consignes au porteur du projet sur les pages légales | Informations manquantes indiquées au visiteur | Provisoire et noindex conservés ; aucun texte juridique prétendu validé |
| Gestion cookies décrite comme restant à raccorder | Indication du contrôle existant dans le footer | Réouverture du bandeau testée |
| `/legal/toString` et `/legal/__proto__` pouvaient résoudre une propriété héritée | Recherche sur propriétés propres uniquement | Routes inconnues/internes : 404 testée ; aucun contrat métier modifié |

## Inventaire des pages et des fonctions

Le relevé machine couvre **21 entrées** dans les projets desktop et mobile ; quatre largeurs chacune. Les trois espaces connectés sont aussi observés avec les fixtures de recette. Pas de débordement horizontal mesuré dans ces états. Ce n'est pas une certification de toutes les fenêtres, traductions ou interactions sur appareils physiques.

| Famille | Fonctionnement observé / disponible | Simulation, absence ou dépendance |
| --- | --- | --- |
| Accueil | Navigation, quatre disciplines, onglets clavier, FAQ, cookies, dialogues et nouveaux accès réels testés | Présentation des parcours sans données personnelles ; suivi, favoris, contenus et Premium indisponibles |
| Recherche / annuaire | Sport, ville, filtres, tri, réinitialisation et profil ; tests existants passent | Catalogue/notes/tarifs de recette dans cette validation ; disponibilité commerciale non certifiée |
| Fiche coach | Informations, choix de séance et passage au créneau testés | Contact nécessite session et API ; aucune livraison d'email réel testée ; contenus protégés non activés |
| Créneaux / récapitulatif | Choix, erreur/reprise, contexte URL et lien vers compte testés | Calendrier à horaires seuls, dates illustratives ; réservation datée réelle à terminer |
| Compte sportif | Connexion de recette, demandes, messagerie et fidélité identifiées ; capture mobile | Avantage fidélité affiché ne prouve pas une remise réellement appliquée ; suivi partagé/favoris absents |
| Compte coach | Connexion, demande/acceptation via tests existants, profil et ancres identifiées | Sections absentes pour vérification, invitations, aide ; flèches sans handler et certains liens de profil incohérents dans la base committée |
| Compte structure | Inscription et API affiliation, séparation avec sportif testées | Base committée : tableau historique illustratif, nombreux menus sans section et planning non opérationnel. Correction locale non livrée ici |
| Paiement | Entrée et tunnel de demande couverts en recette | Aucun paiement réel testé ; accepter avant payer, prestataire et montants historiques préservés ; correctifs financiers locaux exclus |
| Administration | Entrée `/compte?mode=admin` inventoriée ; knowledge renvoie 404 avec garde désactivée | Tableau admin connecté non recetté dans ce lot ; aucune validation du RAG distant |
| Légal et cookies | Six pages accessibles, noindex, contenu provisoire, refus et réouverture testés | Identité juridique, contact, durées et approbation complète à fournir avant lancement |
| `/structures`, `/demo` | Présentes dans l'arbre de travail local non committé | 404 dans le candidat isolé de ce lot ; ne pas annoncer leur livraison ni leur déploiement |
| Footer / connexion externe | Préférences et retour en haut partagés ; Google désactivé avec explication | URL sociales officielles toujours non fournies, OAuth Google absent ; aucune icône ne vaut connexion réelle |

### Limites prioritaires : pas de validation implicite

1. **P0 — déconnexion dans la version committée.** Le lien latéral coach/club `Déconnexion` pointe vers `/` ; ce lien seul n'appelle pas l'API de déconnexion. Le test API de déconnexion passe, ce qui ne répare pas le lien. Une déconnexion UI existe dans les correctifs locaux préexistants : la vérifier dans un lot isolé avant commit, avec invalidation effective et retour arrière protégé. Ce rapport distingue la base livrée de l'arbre local ; ne pas écraser ces correctifs.
2. **P1 — menus des comptes et planning.** Réparer ou désactiver clairement les contrôles sans action et les ancres absentes ; retirer les chiffres illustratifs non signalés ; relier le profil au bon coach/sport/ville. Inventaire des labels et destinations dans `assets/textes-actions-2026-10-16/inventaire-comptes.json`. Les boutons des tableaux historiques sont visibles mais ne sont pas tous opérationnels.
3. **P1 — réservation datée.** Stockage d'une date et d'un fuseau, capacité et collisions, puis cohérence demande/acceptation/paiement ; dépend du modèle et des API, pas d'une recoloration.
4. **P1 — services et droits réels.** Vérifier Supabase/auth/RLS, prestataire de paiement, webhook, email et règles légales dans un environnement de préproduction autorisé. Le checkout isolé sans configuration est correctement refusé par le contrôle de production ; cela ne renseigne pas l'état d'une configuration Netlify distante. Aucune clé à envoyer dans le chat ni activation réelle implicitement autorisée.
5. **P2 — offres et fonctions futures.** Billing, conditions HT/TTC/engagement/résiliation et périodicité du supplément structure avant souscription ; droits serveur avant vente de contenus, critères avant suivi partagé. Aucune activation du 0 % Premium : commission actuelle 15 % administrable et historiques conservés.

## Sources, règles et limites de la preuve

Documents de reprise : AGENTS, BRANCH_STRATEGY, DOCUMENT_MAITRE, docs/README, REFONTE_PROGRESSIVE et REFONTE_RESERVATION du 15 octobre, contrat visuel et recette. Recherche MemPalace exécutée : retours historiques seulement, confrontés au code et aux preuves actuelles ; aucune nouvelle gouvernance ou infrastructure.

Références précédemment visibles déplacées ici sans changer leurs arbitrages : hero, pitch p. 1, 7–12, 28 ; sportif MVP p. 1, pitch p. 9/28 et classeur Sportifs ; coach pitch p. 8, 13–14, Business Plan p. 35 et parcours coach converti p. 1–3 ; structure pitch p. 15, Business Plan p. 35–36, maquette club diapositives 4/5/7 ; offre sportif pitch p. 16 et Business Plan p. 30/35. Ces références de provenance ne prétendent pas qu'une fonction commerciale soit opérationnelle. Aucune nouvelle source juridique ni condition commerciale inventée.

Dernière demande utilisateur prioritaire : les sections qui exposaient la conception sont adaptées en guide et aide visiteurs. Les anciens contrats qui prescrivaient une feuille de route/sources visibles deviennent historiques sur ce point ; les compositions, tokens, ancres et fonctions du header sont conservés.

Playwright MCP : contexte Edge headless distinct des sessions utilisateur, avant/après accueil, trois panneaux aux quatre largeurs, dialogues, puis trois comptes connectés avec données fictives. Les tests utilisent le serveur défini par la configuration de recette existante, jamais des paiements réels. Les erreurs de sélecteur de l'audit intermédiaire et la fermeture automatique d'un serveur en fin de tests ne sont pas présentées comme des défauts applicatifs.

Build/typage PASS, 74+6 tests PASS. Configuration Netlify et frontière client/serveur PASS. Contrôle de production : rejet attendu des variables et approbations absentes du checkout isolé. Aucune certification distante RLS, SEO globale, Core Web Vitals ou OAuth. Aucune nouvelle dépendance ; premier chargement accueil indiqué par le build : 111 kB, sans conclure à une amélioration de performance mesurée.

## Aperçus, livraison et retour arrière

- [Accueil desktop](assets/textes-actions-2026-10-16/accueil-1440.png) · [mobile](assets/textes-actions-2026-10-16/accueil-390.png).
- [Avant desktop](assets/textes-actions-2026-10-16/avant-desktop.png) · [avant mobile](assets/textes-actions-2026-10-16/avant-mobile.png). Les dimensions réelles sont consignées dans verification.json ; l'avant desktop est celui du serveur de revue précédent, pas du candidat corrigé.
- [Panneau coach](assets/textes-actions-2026-10-16/coach-390.png) · [structure](assets/textes-actions-2026-10-16/structure-390.png) · [information suivi](assets/textes-actions-2026-10-16/informations-suivi.png).
- [Inventaire pages](assets/textes-actions-2026-10-16/inventaire-pages.json) · [comptes](assets/textes-actions-2026-10-16/inventaire-comptes.json) · [empreintes et résultats](assets/textes-actions-2026-10-16/verification.json).

Push ciblé sur `design/refonte-progressive-lot1` après contrôle des secrets suivis et comparaison SHA distant. Aucune fusion, force-push ou publication en production. La CI GitHub existante ne se déclenche pas sur cette branche de design ; la configuration ne prouve pas un déploiement. Retour arrière par revert du commit du lot, sans reset des corrections locales ou des données. Prochain lot : déconnexion UI et menus inertes des comptes, puis réservation datée et services.

## Rectification et lot suivant — 16 octobre 2026
La base Git 1b1d9aa contient déjà un handler de déconnexion coach/club (POST sign-out). Le lien n’était donc pas seulement une navigation vers `/` : le diagnostic P0 ci-dessus était inexact. Le nouveau lot fiabilise l’erreur, partage l’action entre quatre rôles et protège l’affichage contre les paramètres URL. Preuves et périmètre : `STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md`. Les autres limites de ce rapport restent actives tant qu’un lot ne les traite pas explicitement.
