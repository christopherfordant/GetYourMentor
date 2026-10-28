# Harmonisation Factory et publication Netlify — 28 octobre 2026

## Périmètre et autorisation

Demande utilisateur : homogénéiser les pages avec Factory, puis publier les modifications sur Netlify. Cette autorisation remplace l'interdiction de déploiement du lot précédent pour le **site de démonstration existant** uniquement. Aucun service commercial, paiement bancaire, envoi externe ou infrastructure supplémentaire activé. Un seul lot de présentation et de publication, sans agent supplémentaire.

Cible vérifiée en lecture via l'API Netlify : `86e0379e-4d1a-4cf0-936c-1439397354f4`, `https://getyourmentor-demo-20261014.netlify.app`. Publication précédente `6ad93730f89f5b5157ba9dd6`, état ready, source indiquée `54bb70980aebaadad402a2a93d38103f5e23a9b4`. Pas de publication du site historique. L'authentification locale Netlify est utilisée en mémoire, aucun jeton ajouté aux sources ou aux preuves.

## Inventaire et réalisation

Base locale `e52f56e92322976d0315e8821305a1a81605cfff`, branche `design/refonte-progressive-lot1`. Distant observé `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`, divergence initiale 5 commits locaux contre 9 distants. Vingt fichiers suivis et 79 entrées non suivies antérieurs préservés hors livraison. Les anciens worktrees sont conservés ; checkout de contrôle dédié `C:/Users/cashe/Documents/GYM-factory-unification-20261028` avec dépendances existantes réutilisées, aucune copie des modifications antérieures non vérifiées.

Défauts démontrés : tokens violets encore par défaut hors wrappers de découverte ; formulaires blancs ; fonds bleu nuit, accents verts et surfaces lavande hérités ; fond de body clair sur l'accueil ; pages légales et récupération sans navigation commune. Plusieurs défauts existaient malgré un body déjà sombre : la vérification des seuls tokens ne suffisait pas.

Changements : Factory devient le contrat global, avec surfaces anthracite, accents orange, police système, bordures lisibles et focus orange clair. Les actions à texte blanc utilisent un orange foncé distinct de l'accent décoratif. Conversion ciblée des surfaces et états des formulaires, comptes, paiement simulé, contenus, suivi, collectif, récupération et footer vers les tokens communs. Maintien de l'identité du header et du menu droit validés. Header commun ajouté aux pages légales et à l'outil admin autorisé ; page 404 et indisponibilités avec header/footer partagés. Aucun changement d'authentification, données, tarif, droits, disponibilités ou parcours bancaire.

| Pages / états | Intervention et couverture |
|---|---|
| Accueil | Fond du document, panneaux de travail, dialogues, typographie, cookies, couleurs héritées |
| Recherche, annuaire, fiche | Contrat Factory commun, champs sombres, erreurs et focus ; disciplines et portraits conservés |
| Créneau, récapitulatif | Contrôles et états héritant des tokens, moteur métier intact |
| Paiement | Surfaces anthracite, méthodes/champs/récapitulatif, états de reprise ; paiement toujours simulé |
| Compte sportif, coach, structure | Accès anonyme et tableaux connectés, secondaires, erreurs, mois, messages et formulaires |
| Inscription structure | Champs, géolocalisation, erreurs et soumission ; aucune demande envoyée pendant la recette visuelle |
| Séances, structures, offres, contenus, suivi | Cartes, champs, actions et états désactivés ; aucun avantage Premium activé |
| Plan du site, six pages légales | Styles communs et navigation ; textes légaux restent provisoires |
| Indisponibilités et 404 | Même cadre et liens de récupération, codes HTTP conservés |
| Administration connaissance | Styles et header adaptés ; accès reste soumis aux protections existantes, fonctionnalité non activée pour la recette |

## Contrôles et limites

Recette locale sur build optimisé dans le checkout isolé : 24 routes/états à 320, 390, 768 et 1440 px, trois espaces connectés à 390/1440 px, cookies et focus. Les sessions des tests locaux sont délivrées par le serveur ; seul le navigateur de test adapte leur cookie Secure pour HTTP loopback, sans modifier l'application. Les tests ne prouvent pas l'authentification de production. Aucune mutation de réservation, paiement, message ou compte réel pour cette recette de présentation.

Diagnostics : premier passage 4 scénarios échoués sur le fond clair de l'accueil et 4 réussis. Défaut corrigé. Deuxième passage 8 réussis ; les captures et une lecture des styles ont ensuite identifié les dernières surfaces bleues et accents verts du paiement, du compte coach et des liens légaux/cookies. Correctifs ajoutés et assertions de surfaces renforcées pour la recette finale. Les captures ne constituent pas un audit exhaustif de contraste, SEO, sécurité ou performance. Pas de score Lighthouse ni de garantie de conversion inventés.

Les carrousels centrés, les nouvelles images IA et les quinze sections Lovable complètes restent des lots distincts ; ils ne sont pas inclus dans cette harmonisation. Les nouveaux sports restent des destinations de découverte avec état vide lorsque le catalogue n'a pas de données. Les documents juridiques ne deviennent pas contractuels par leur présentation. Les fichiers locaux antérieurs, notamment `/demo` non suivi, DemoBanner et account-ux dans le layout, ne sont pas publiés sans vérification.

## Publication et preuves

L'outil existant `gym-next/scripts/deploy-isolated-demo.py` est réutilisé. Option `--prepare-only` ajoutée pour séparer construction/contrôle du paquet et publication. Mode `--prepared` existant conservé : refus si les sources, le BUILD_ID ou l'empreinte du paquet diffèrent de la préparation vérifiée. Les identifiants de site et l'environnement démo sont contrôlés, les services externes sont neutralisés, les variables ne sont pas affichées. Aucune modification des réglages distants ou des données de démonstration.

Les déclencheurs GitHub existants ne ciblent pas cette branche de chantier ; pas de nouveau déclencheur. La publication directe du paquet vérifié est autorisée par la demande actuelle et ne synchronise pas l'historique Git divergent. Push Git et publication Netlify sont rapportés séparément.

Résultats locaux finaux : 16 scénarios Factory/navigation PASS (39,4 s), 9 régressions images/recherche/annuaire PASS (14,2 s). Build optimisé avec vérification des types, configuration Netlify, frontière client/serveur et recherche des secrets suivis PASS. Comparaison SHA256 des 23 fichiers applicatifs du lot entre dossier principal et checkout de contrôle : identiques. Captures finales compte mobile et paiement ordinateur inspectées ; les captures de ce lot sont isolées des preuves historiques du lot navigation.

Commit source, identifiant de déploiement, captures archivées et contrôles distants à consigner après exécution. Ne pas considérer cette préparation comme une publication réussie.

Première publication : source `c6a798c768f87536d664045f2e752066c92f6ee7`, déploiement `6ae2203ef18d4f413b7c1f6b`, ready confirmé via API et alias public. Health 200, démo ready, robots.txt interdisant l'exploration. Le navigateur distant a néanmoins détecté l'absence de meta noindex sur l'accueil (et le header X-Robots-Tag est absent). Correction ciblée du layout : reprise et vérification du seul arbitrage noindex déjà présent localement, sans intégrer DemoBanner/account-ux, plus couleur de barre navigateur Factory. Nouvelle préparation/publication nécessaire ; pas de contrôle distant complet déclaré réussi avant celle-ci.
