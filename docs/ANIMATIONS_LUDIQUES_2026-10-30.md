# Animations ludiques adaptées — 30 octobre 2026

## Demande et réalisation

Adapter les effets de montage au header, aux cartes coachs et au panneau droit. Factory conservé, aucun paquet/service/agent ajouté, aucune génération IA ni crédit HeyGen. Lot local sans déploiement.

- Sports : quatorze liens conservés, SVG locaux décoratifs. Ballons en rebond, combat en petit coup, raquette en rotation, Pilates/perte de poids en oscillation, haltères en impulsion. Courtes particules orange autour des icônes ; pas d'explosion des textes. Survol si pointeur fin et focus visible au clavier ; pas de boucle ni délai de navigation.
- Cartes accueil et annuaire : portrait légèrement incliné (4°/2°, agrandissement 2,5 %) et reflet de 650 ms. Texte, bouton, géométrie du clic et échelle du carrousel conservés. Aucune note/disponibilité inventée, images et légendes IA préservées.
- Panneau : ouverture 300 ms, liens en éventail espacés de 24 ms (fin à 444 ms). Dialogue natif, fermeture Échap/fond/bouton, focus et verrouillage du défilement réutilisés. Fermeture immédiate.
- Mouvement réduit : aucune animation décorative ni inclinaison ; focus/couleurs statiques conservés. Pas de son ni de nouvelles requêtes externes.

L'instruction du jour remplace dans ce périmètre l'ancienne préférence sans 3D. Les informations restent lisibles, pas de verso masquant les tarifs ni d'effet sur les formulaires/paiements.

## Sources et isolation

Consultés : AGENTS, procédure/hiérarchie BRANCH_STRATEGY, préambules maître/index, relais et index des sources ; navigation Factory du 28 octobre, DESIGN_SYSTEM, socle Opquast et composants actuels. PDF historiques non annoncés relus intégralement. Sources directes, aucun moteur RAG/REA présumé.

Base `7688873edb5df20b98d3e57efea46ea7fb7bb472`. Checkout détaché `C:/Users/cashe/Documents/GYM-motion-20261030`, dépendances existantes par jonction, aucun fichier .env copié. Branche unique `design/refonte-progressive-lot1`. Vingt fichiers suivis antérieurement modifiés préservés hors lot. Aucun pull, fusion, rebase ou force-push.

## Contrôles et limites

Deux builds optimisés et contrôle des types réussis ; le second couvre l'extension à l'annuaire. Avertissements Autoprefixer existants hors lot. Première tentative avant compilation : jonction node_modules créée dans un sous-dossier incorrect ; seule cette jonction a été retirée, cible préservée. Secrets suivis, configuration Netlify et frontière client/serveur contrôlés.

Premier passage : 23/24 scénarios réussis. Le test tactile existant utilisait le port 4320 au lieu du serveur déclaré 3001 ; correction pour réutiliser baseURL, aucun contrôle désactivé. Premières captures avant chargement des portraits : attente réelle complete/naturalWidth ajoutée. Deuxième passage : 22/26, quatre échecs du nouveau test car le clic de fermeture des cookies déplaçait son focus avant Entrée ; focus du lien explicitement rétabli dans le test. Les dix-huit régressions passent, puis les nouveaux scénarios sont relancés après cette correction. Résultats finaux dans `assets/playful-motion-2026-10-30/verification.json` et rapports Playwright associés, sans addition des relances.

Chromium local, tactile émulé et quatre largeurs ; pas de certification globale d'accessibilité, Safari/Firefox ou téléphone physique. Réservations, finance, authentification et services réels hors modification.

## Livraison

Résultat final : 33 scénarios distincts PASS (18 régressions, 8 nouveaux desktop, 7 nouveaux tactile), 1 test de survol ignoré uniquement dans le projet tactile. Quatre largeurs, clavier, retour du focus, ouverture répétée, mouvement réduit, vrais liens et chargement des portraits vérifiés. Captures header desktop, menu mobile, mentors et annuaire inspectées.

Le lancement d'un serveur d'aperçu persistant après les tests a été rejeté par le contrôle automatique : « blocked by policy », sans motif détaillé. Aucun contournement ni serveur supplémentaire lancé. L'onglet ouvert pendant la recette n'est plus un aperçu navigable ; les captures et le build contrôlé sont conservés.

État Git final dans le relais et verification.json. Workflow GitHub push hors branche de chantier, paramètres Git/Netlify distants non certifiés. Aucun déploiement commandé. Le rejet non-fast-forward préexistant reste à traiter séparément sans perdre les commits locaux/distants.
