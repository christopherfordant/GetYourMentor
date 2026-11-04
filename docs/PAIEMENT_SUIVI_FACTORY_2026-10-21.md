# Paiement et suivi personnel — Factory

## Périmètre et sources
Demande utilisateur du 21 octobre 2026 ; bases privée d7cbbe3 et publique a428f89. Lecture progressive AGENTS, procédure de branches et hiérarchie active, préambules du maître/index, relais, index des PDF, DESIGN_SYSTEM_GYM, couverture de refonte, RESERVATION_FACTORY, TRANSPORT_PREUVE_PRIVEE, RECAPITULATIF_SERVEUR, REPRISE_PAIEMENT_SIMULE et SUIVI_PERSONNEL_DEMO. Aucun PDF annoncé relu intégralement ; aucun RAG, MemPalace ou moteur REA annoncé utilisé.

Point de périmètre : `/suivi` est l'objectif personnel privé du sportif, pas une confirmation de paiement. Le chemin de paiement reste récapitulatif → identification/rattachement → réservation acceptée → simulation → confirmation/compte. Aucune nouvelle redirection vers `/suivi` ni nouvelle signification commerciale.

## Réalisation
Le paiement réutilise DiscoveryFrame et son header/menu mobile/footer, avec une variante `payment`. Suppression de la lecture et de l'injection intégrale de legacy-prototype.css et du header dupliqué. Module de présentation existant réécrit avec les tokens Factory : grille deux colonnes puis pile mobile, cartes anthracite, actions orange profond, sélection soulignée et aria-pressed, erreurs distinctes, champs fictifs readonly, focus et textes longs. Aucun asset importé.

Les sélecteurs payment-* des deux feuilles globales héritées excluent désormais les descendants Factory via `:not(:where(.gym-theme-factory *))`, sans changer leur spécificité ni le rendu des pages encore anciennes. Cela retire les règles concurrentes bleues/jaunes au lieu d'ajouter des !important. Le module conserve les hooks de test historiques.

`/suivi` utilise une variante `progress`. Son module remplace les surfaces blanches codées en dur par les tokens et les actions contrastées ; champs, cartes, métriques et messages adaptés. Objectif, synthèse, consentement fictif et distinction entre statut payé et présence réelle inchangés.

Sources publiques consultées sans information privée : [WAI — notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) et [Opquast V5](https://checklists.opquast.com/fr/qualite-numerique/). Contrôles ciblés, aucune conformité globale ou certification revendiquée. REA non nécessaire à cette migration locale de styles.

## Protections et recette
Aucun endpoint, validateur, hook useDemoPayment, PersonalProgress, cookie ou stockage métier modifié. Droits par rôle/propriétaire, preuves HttpOnly, acceptation avant paiement, absence de répétition automatique après réponse incertaine, montants serveur, quatre sports et commission de séances 15 % avec historiques conservés. Le chemin Stripe n'a pas été activé ou recetté.

Playwright MCP : consultation réelle du paiement sans identifiant et du suivi anonyme à 390 px ; contrôle de surfaces/typographie/absence de débordement. Aucun paiement ni connexion réussie revendiqué par MCP. Les parcours authentifiés, simulations et captures définitives sont contrôlés avec Playwright local, en distinguant DTO injectés et données enregistrées par les endpoints.

Incidents de recette : génération initiale du nouveau fichier de test avec accents altérés, corrigée en UTF-8 ; origine localhost/127.0.0.1 initialement incohérente, corrigée dans l'environnement de test sans assouplir le refus d'origine ; contraste d'alerte écrasé par le reset partagé, corrigé dans le module. L'ancien test payment-flow attend maintenant l'état connecté avant de naviguer. Les créneaux des tentatives incomplètes imposent une mémoire démo vierge pour une nouvelle campagne, sans purge des données réelles.

Résultats définitifs : 21 scénarios privés PASS et 10 scénarios sur l'export public PASS, tous en développement démo loopback ; quatre largeurs couvertes. Types et builds PASS dans les deux dépôts ; frontière client/serveur et scans de secrets PASS. Modes et empreintes : `assets/factory-payment-progress-2026-10-21/verification.json`. Captures avant issues des preuves privées précédemment commitées, captures après synthétiques du lot ; captures pleine page finales de l'export public. Ne pas publier de traces brutes ou de références d'accès.

Le lancement d'un serveur compilé d'acceptation a été rejeté par le contrôle automatique avec le seul motif « blocked by policy ». Aucun contournement effectué : recette publique avec son serveur de développement démo existant. Build réussi ne signifie pas recette du runtime compilé ou de l'authentification en production HTTPS. Le runner ferme son serveur après les tests.

## Livraison et limites
Documents/preuves uniquement dans le dépôt privé ; export public limité au patch code/tests et README inspectés, sans copie d'historique privé ni PDF. Vérification de l'index, encodage et secrets avant chaque push. Le dossier principal et ses modifications antérieures restent préservés.

Mémoire locale perdue au redémarrage, paiements et objectifs fictifs, aucune attestation bancaire ou de présence. Aucune validation production HTTPS, Stripe, RLS distante ou Netlify ; aucun déploiement demandé ou déclenché. Compteurs Codex/Netlify non accessibles. Pas d'agent ou d'infrastructure ajouté.

Retour arrière : revert ciblé après revue, sans migration ni suppression de données ; maintenir les deux exports cohérents. Prochaine tranche recommandée : accueil Factory, après lecture de la couverture active et inspection de ses composants ; ne pas recommencer la réservation/paiement/suivi ni déclarer V1/V2/V3 achevées.
