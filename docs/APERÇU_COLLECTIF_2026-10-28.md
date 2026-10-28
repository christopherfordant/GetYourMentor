# Accueil Factory — aperçu collectif, 28 octobre 2026

## Périmètre et état réel

Un seul lot, sans agent supplémentaire ni déploiement. Ajout de « Entraîne-toi à plusieurs » après les mentors. Trois cartes de séances au maximum, en grille responsive ; un second carrousel n'est pas nécessaire pour cet aperçu court. Aucun visuel IA supplémentaire, aucune offre ajoutée au dépôt de données du site. Le titre reprend l'observation archivée de Lovable ; ses interactions et son backend n'ont pas été revérifiés et ne sont pas présumés opérationnels.

L'aperçu est explicitement pour **deux participants**. Le prix affiché est le montant total configuré par le coach pour cette taille, jamais un prix individuel multiplié/divisé. Les autres tailles restent accessibles depuis le filtre du catalogue collectif existant. L'indication du nombre de places restantes concerne le créneau affiché, distinct de la capacité totale ; disponibilité et tarif sont revérifiés par le serveur à la demande.

## Audit et réemploi

| Élément | Constat avant ce lot | Traitement / preuve |
|---|---|---|
| Accueil | Aperçu mentors, aucun aperçu des offres collectives | Une nouvelle section, distincte des personnes et des abonnements |
| `/seances`, `/api/sessions` | Catalogue collectif coach/structure, uniquement en démonstration isolée ; calcul existant des places | Réemploi de `publicSessionOffer` et `matchesSession`, aucun second moteur de capacité |
| Offres coach | Profil validé, créneaux datés, capacité ; pas d'affiliation obligatoire | Conservé |
| Offres structure | Double consentement requis à la publication ; absence de recontrôle dans le catalogue et la demande | Garde partagée `hasActiveOfferAffiliation` : catalogue collectif et réservation refusent une affiliation inactive ; aperçu filtre également les deux accords |
| Filtres collectifs | Quatorze options visuelles pour un parseur/moteur limité à quatre disciplines | Quatre choix métier dans ce formulaire ; quatorze entrées du header inchangées |
| Détail d'une offre | Toutes les cartes présentées sans sélection directe par ID | `/seances?participants=2&offer=ID` sélectionne une seule séance éligible ; retour conservant les critères ; état indisponible si retirée/complète/incompatible |
| Réservation / paiement | Demande → acceptation → paiement simulé ; tarif serveur, capacité pondérée, commission historisée | Réutilisé, aucun paiement réel ou tarif commercial activé |
| Données initiales locales | Aucune offre dans `memoryStructureOffers` | État vide honnête ; jeux d'essai uniquement dans le processus local isolé |

Sources actives : `AGENTS.md`, procédure/hiérarchie de `BRANCH_STRATEGY_GYM.md`, préambules maître/index, relais courant, sources/index et rapports Factory/mentors/Lovable. Contrats spécialisés consultés : `DECOUVERTE_COLLECTIVE_2026-10-17.md`, `RESERVATIONS_GROUPES_2026-10-16.md`, `ETATS_PLANNING_COLLECTIF_2026-10-18.md`. Les anciens arbitrages violet sont supplantés par Factory ; les quatorze labels de découverte n'élargissent pas les quatre sports du backend. Les recettes d'octobre 16–18 et du lot mentors ne prouvent pas ce nouveau lot déployé.

## Composants, routes et données

- `CollectivePreviewSection` + CSS module : titre, introduction, grille, prix total, date en Europe/Paris, coach/structure, lieu explicite ou à confirmer, ville du coach identifiée comme telle. Chargement, erreur, réessai, vide ; requête annulée au démontage et délai de dix secondes. Aucun portrait attribué à une nouvelle identité.
- `GET /api/sessions/preview` : démonstration isolée exclusivement, désactivé si Supabase configuré, `no-store`, trois résultats au maximum. Projection publique explicitement autorisée : id, titre, coachName, sport, ville, origine, durée, lieu, créneau, capacité, places restantes, montant total. Aucun email organisateur/participant, dossier privé ou coordonnées GPS.
- `collective-preview.ts` : validation du DTO, discipline métier connue, date valide/future, disponibilité explicitement calculée, capacité et prix total entiers valides, aucun doublon d'ID. Une capacité seule n'est pas interprétée comme des places libres.
- `collective-preview-server.ts` : réutilisation des dépôts existants ; lecture des coachs mutualisée par requête, puis au plus 24 offres candidates triées par premier créneau futur et ID ; arrêt à trois résultats éligibles, affiliations mutualisées par structure dans l'aperçu. Aucun cache partagé privé.
- « Voir tout » → `/seances?participants=2` ; carte → `/seances?participants=2&offer=ID` ; formulaire existant → `POST /api/reservations` → compte sportif. Aucun paramètre de prix ou de rôle client ne fait autorité.

### Limites précises

Le stockage démo mémoire/Netlify Blobs lit des ensembles monolithiques : la taille des lectures initiales n'est **pas** bornée par une pagination SQL. Le plafond de 24 concerne les projections candidates et le plafond de trois la réponse publique. Une séance éligible au-delà des 24 premières candidates peut ne pas figurer dans cet aperçu ; il n'annonce pas l'exhaustivité ni « les plus populaires ». Le catalogue `/api/sessions` existant et son chargement de détail restent non paginés ; optimiser le dépôt et le catalogue constitue une dépendance de montée en charge.

Le backend Supabase collectif n'est pas implémenté dans ce lot. En dehors de la démonstration isolée, l'API d'aperçu retourne 503 et la section affiche l'indisponibilité ; les destinations collectives existantes ne sont pas activées en production par ce lot. Pas de preuve distante pour ces nouvelles fonctions, pas de métrique de conversion, pas de calendrier réel. Une séance devenue indisponible après affichage est refusée à la demande ; pas d'abonnement temps réel.

La sélection de détail réutilise la page catalogue (son H1 et sa canonique), sans nouvelle page SEO d'offre. Pages collectives non indexables comme auparavant. Les formulaires collectifs hors `/seances` restent ceux du dépôt ; aucune refonte générale de ces espaces n'est revendiquée.

## Contrôles et preuves

Vérifications dans le checkout isolé `C:/Users/cashe/Documents/GYM-collective-preview-20261028`, base `c881b6ebafb264d9978776aadb688a42f4075c93`, dépendances locales existantes. Aucun changement antérieur non vérifié recopié. Serveur de recette en production locale, port 4321, fournisseurs Supabase/Stripe/Resend désactivés, mémoire de test uniquement.

- **9 scénarios nouveaux validés** dans `tests/collective-preview.spec.ts` : double consentement/garde d'activation ; refus des capacités supposées, dates passées, tarif absent, places insuffisantes et sport inconnu ; parcours aperçu/détail/retour aux quatre largeurs 320/390/768/1440 ; chargement/503/réessai/vide/réponse invalide/offre retirée ; tactile Chromium émulé et mouvement réduit avec menu, cookies, footer ; API réelle locale publication → aperçu borné → réservation, prix serveur, épuisement des places, refus du paiement avant accord.
- **7 régressions ciblées validées** : quatre scénarios mentors (centrage, clavier, portraits et cartes latérales aux quatre largeurs), consentement/isolation et deux fondations participants/capacité/concurrence/libération des places. Les relances ne sont pas additionnées : **16 scénarios distincts**.
- Typage standard isolé, build Next et frontière client/secrets validés. Build avec avertissements Autoprefixer préexistants (`end`/`start`) ; aucun contrôle désactivé.
- Premier passage UI : quatre échecs sur le sélecteur de test du champ Discipline, présent dans les instantanés. Sélecteur corrigé (`select[name="sport"] option`), relance complète des neuf scénarios réussie. Aucun succès prétendu avant cette correction.
- Captures inspectées mobile/ordinateur dans `docs/assets/collective-preview-2026-10-28` : aperçu et formulaire aux quatre largeurs, cohabitation tactile à 390. Les cartes et textes des captures sont **des fixtures de recette**, pas des offres livrées au catalogue. Certaines captures longues incluent les éléments fixes/cookies ; la capture tactile montre l'état après fermeture du consentement. Pas de test sur téléphone physique.

Manifeste des versions, empreintes des fichiers et résultats : `docs/assets/collective-preview-2026-10-28/verification.json`. Les captures historiques du carrousel éventuellement réécrites par la régression restent dans le checkout isolé ; elles ne remplacent pas les preuves du lot précédent.

## Git, CI/CD et suite

Branche de chantier : `design/refonte-progressive-lot1`, upstream identique. Départ : 9 commits locaux et 9 distants divergents ; distant lu par `ls-remote` : `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Vingt fichiers suivis modifiés, 79 entrées non suivies et 47 worktrees antérieurs préservés ; un checkout de vérification ajouté. Aucun reset, nettoyage, pull, rebase, fusion ou force-push.

Seuls les fichiers applicatifs/tests, le présent rapport, les nouvelles preuves et le relais de ce lot sont destinés au commit. Workflow `mvp-gates.yml` : push seulement sur `feat/nextjs-migration` et `main`, pas sur la branche de chantier. Configuration Netlify lue : build Next dans `gym-next`, aucun déploiement commandé. Le paramétrage distant d'auto-build Netlify n'est pas requalifié ici ; le rejet du push empêche toute modification du dépôt distant par ce lot. Tentative de push normal et SHA distant final consignés dans le relais et la livraison.

Prochain lot recommandé : qualifier les critères/données d'une seule autre rubrique Lovable avant de l'implémenter. Priorité technique préalable à une ouverture hors démo : dépôt collectif paginé, contrat public partagé avec le détail et recette des autorisations sur backend cible. Ne pas multiplier les sélections de mentors identiques, ni inventer proximité, popularité, créneaux ou promotions.

Résultat Git observé : commit applicatif `2602624bb56322de6280305619a70107c5388c2e`, push normal rejeté non-fast-forward (code 1), distant relu inchangé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Vingt fichiers suivis modifiés et 79 entrées non suivies antérieurs restent hors commit. Ce complément documentaire ne change pas le code testé. Après déplacement de la garde d'affiliation vers le module métier partagé, build/typage/frontière client-secrets revalidés et deux scénarios concernés relancés avec succès ; aucune modification de l'UI entre les captures et ce dernier build.
