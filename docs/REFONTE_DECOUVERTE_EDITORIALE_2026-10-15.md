# Livraison — recherche, annuaire et fiche éditoriales

## Résultat et périmètre

Les trois pages `/recherche`, `/coachs` et `/coach` déclinent maintenant l’identité de l’accueil validé : papier, blanc, violet fixe, titres Impact/Arial Narrow, corps Arial/Helvetica, enveloppe 1240 px et cartes adaptées à chaque fonction. Référence : maquette HTML du 15 octobre, design system et contrat visuel actif. Aucun nouveau framework, agent, service RAG, police ou asset externe.

| Page | Composition livrée | Fonctions conservées |
| --- | --- | --- |
| Recherche | Introduction éditoriale + formulaire en deux colonnes, puis villes en cartes ; pile mobile | Quatre disciplines, ville, liens directs vers l’annuaire, retour arrière |
| Annuaire | Introduction, formulaire, filtres natifs, liste comparable et panneau de proximité | Géolocalisation à la demande, rayon, filtres, tri, prix, identité, liens de fiche |
| Fiche | Titre, photo illustrative, informations du catalogue, action de réservation, sections et contact | À propos, planning indicatif, prévisualisation de contenus limitée à la démo, messagerie et passage vers `/creneau` |

Le header et le footer sont communs via `DiscoveryFrame`. Noms, ordre DOM et sept destinations du header conservés ; groupes réorganisés sur mobile. Le logo garde un nom accessible quand son texte visuel est masqué. Les ancres du footer pointent vers les sections actuelles `/#espace`, `/#forfaits` et `/#faq`.

## Simplification et corrections

- Les trois routes ne lisent ni n’injectent plus `legacy-prototype.css` : 115 749 octets de source CSS auparavant dupliquée dans chaque rendu. Ce chiffre ne représente pas un transfert réseau compressé mesuré.
- Une seule feuille `gym-discovery-design.css` et des classes `de-*` remplacent le pont d’overrides précédent sur ces pages. Les règles historiques restent pour les autres pages ; aucune modification de leurs fichiers CSS locaux en cours. L’ancien `HomePageClient` est conservé mais n’est plus la route d’accueil active.
- Headers dupliqués retirés, liens de villes natifs, sélecteurs limités aux quatre sports, états vides et erreurs explicites. Les profils de secours synthétiques du composant annuaire sont retirés ; seules les entrées transmises par le catalogue sont affichées. Le mode démo existant utilise ses fixtures clairement signalées.
- Galerie limitée à son illustration existante : flèches inertes retirées, aucun portrait attribué au coach. Les cartes utilisent des initiales. Les diplômes et avis viennent du catalogue, sans création de certification ou de témoignage.
- Texte générique de fiche remplacé par données et étapes métier documentées. Promesse non sourcée de réponse sous 24 h retirée de la messagerie ; fonctionnement de son API inchangé.
- Planning indicatif réorganisé par jour sur mobile ; aucune colonne cachée ni défilement horizontal obligatoire. Les dates et heures restent des exemples existants, pas des disponibilités réelles. L’étape suivante vérifie les créneaux et les montants.
- Préférences cookies et retour en haut suivent le footer des trois vues. Cela corrige un recouvrement d’action constaté dans les premières captures. Bannière de consentement toujours accessible ; stockage du choix inchangé.
- Chargement/échec de fiche distingués, retour vers l’annuaire, état d’indisponibilité du catalogue. Paramètre de discipline validé avec `Object.hasOwn` pour ne pas accepter une propriété de prototype telle que `constructor`.

## Vérifications et preuves

Copie de test isolée depuis `ede432f`, dépendances locales réutilisées par jonction, sans correctifs métier locaux. Build et typage PASS. Campagne de production : **40/40 tests PASS**, un worker, projets desktop et mobile. Tests : découverte/catalogue 8, nouveaux scénarios éditoriaux 12, tunnel métier 10, accueil 10. Après l’ajout final du nom accessible du logo : nouveau build/typage PASS et **6/6 contrôles responsive ciblés PASS** sur les trois pages ; la campagne complète n’a pas été répétée pour ce seul libellé.

Largeurs : 320, 390, 430, 621, 768, 900, 1024, 1280, 1440 px ; reflow à 720 px et libellé long. Budget/réinitialisation, tri, quatre sports et ville, retour arrière, cohérence identité/prix/avis, ouverture `/creneau`, chargement/erreur, discipline inconnue, langue native, cookies, retour en haut, descriptions et canonical vérifiés. Les tests métier créent puis annulent uniquement une réservation de test ; aucun paiement réel.

Playwright MCP a examiné les trois vues et le planning à 320 px. Les captures finales proviennent également du test de métadonnées, dans le build isolé, après correction des utilitaires. Avant : serveur local sans catalogue ; après : fixtures de démonstration existantes. Les différences de profils entre les captures ne prouvent pas une migration de données.

| Page | Avant desktop | Après desktop | Après mobile |
| --- | --- | --- | --- |
| Recherche | [avant](assets/decouverte-editoriale/avant-recherche-1440.png) | [desktop](assets/decouverte-editoriale/recherche-1440.png) | [mobile](assets/decouverte-editoriale/recherche-390.png) |
| Annuaire | [avant](assets/decouverte-editoriale/avant-annuaire-1440.png) | [desktop](assets/decouverte-editoriale/annuaire-1440.png) | [mobile](assets/decouverte-editoriale/annuaire-390.png) |
| Fiche | [avant](assets/decouverte-editoriale/avant-fiche-1440.png) | [desktop](assets/decouverte-editoriale/fiche-1440.png) | [mobile](assets/decouverte-editoriale/fiche-390.png) |

Empreintes et résultats : `assets/decouverte-editoriale/verification.json`. Journaux locaux ignorés par Git : `gym-next/playwright-artifacts/discovery-editorial/` (builds et recettes). Build final : recherche ~3,20 Ko contre 6,31 Ko auparavant ; annuaire ~6,17 contre 9,66 ; fiche ~7,80 contre 11,5. Ces tailles de bundles ne certifient pas un score Web Vitals.

Contrôles : configuration Netlify, secrets suivis, frontière client/serveur du bundle et schéma Supabase statique PASS ; corpus RAG local 8 documents, évaluation lexicale 8/8. Pas de base RLS distante configurée ni de RAG sémantique testé. Avertissements autoprefixer historiques extérieurs au lot conservés.

## Limites, livraison et suite

Commission administrable de 15 %, montants historiques, API, autorisations et politiques RLS inchangés. Aucun avantage Premium activé. Les métadonnées existantes sont préservées ; le titre de fiche peut encore reprendre l’identifiant de route, et la traduction intégrale du produit n’est pas ajoutée par ce lot. Les images existantes restent utilisées, dont l’image fitness relativement lourde : optimisation à traiter dans un lot de performance dédié.

Le serveur local habituel sans configuration de catalogue montre les états indisponibles, plutôt que des profils inventés. Les captures complètes utilisent exclusivement le mode de recette isolé. Les correctifs comptes/paiements déjà locaux sont préservés et exclus du commit. CI GitHub non déclenchée par push sur cette branche selon le workflow actuel ; aucune fusion ni commande de déploiement.

Branche : `design/refonte-progressive-lot1`, SHA de livraison à lire dans Git. Retour arrière : revert du commit ciblé, sans reset ni suppression des données ou travaux antérieurs. Prochain lot : déclinaison des créneaux et du récapitulatif, puis paiement, avec vérification des états et des droits. V2 et V3 restent incomplètes.
