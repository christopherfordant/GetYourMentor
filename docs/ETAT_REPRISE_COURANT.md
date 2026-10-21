# Reprise opérationnelle - GetYourMentor

Mise à jour : 21 octobre 2026. V1/V2/V3 et refonte globale incomplets. Aucun travail en arrière-plan.

## Lecture et priorités actives
AGENTS -> BRANCH_STRATEGY_GYM (hiérarchie/priorités) -> préambules maître/index -> ce relais -> docs/sources/README.md -> seules sources du lot et dépendances. Archives au besoin, pas de lecture exhaustive prétendue.
Usage maîtrisé -> contexte préservé -> un lot vérifié. Compteurs Codex/Netlify inaccessibles : aucun quota, plafond évité ou changement de modèle prétendu.
Contrat actif : Factory (police système, anthracite/orange), DESIGN_SYSTEM_GYM.md et couverture REFONTE_PROGRESSIVE_2026-10-15.md. Le violet fixe est historique.
Métier : quatre sports ; affiliations à deux accords ; prix total de groupe par taille fixé par le coach ; acceptation avant paiement ; commission 15 % administrable et historiques figés. Démo sans paiement/notification réels, Premium implicite, fusion, force-push ou production.

## Lot courant - paiement et suivi personnel Factory
`/paiement` : DiscoveryFrame partagé, suppression du header et de l'injection CSS globale dupliqués, module Factory et sélection aria-pressed/soulignée. Styles payment-* hérités exclus des descendants Factory, pas de nouvelle pile de !important. `/suivi` : objectif personnel privé, surfaces/champs/actions harmonisés, rôle métier inchangé ; ce n'est pas un suivi de paiement.
Rapport : [paiement/suivi Factory](PAIEMENT_SUIVI_FACTORY_2026-10-21.md). Contrats : REPRISE_PAIEMENT_SIMULE_2026-10-18.md, SUIVI_PERSONNEL_DEMO_2026-10-17.md, TRANSPORT_PREUVE_PRIVEE_2026-10-20.md. Aucun endpoint, hook métier, stockage ou cookie changé. Ancien test payment-flow attend maintenant l'état connecté avant navigation.
Preuves : docs/assets/factory-payment-progress-2026-10-21/verification.json ; 21 scénarios privés et 10 export public PASS en développement démo ; types/build/frontière/scans PASS sur les deux versions. Runtime compilé non recetté : lancement d'acceptation rejeté automatiquement (« blocked by policy »), aucun contournement. DTO injectés distincts des parcours enregistrés par les endpoints locaux. MCP : consultation anonyme paiement/suivi et styles ; parcours authentifiés validés avec Playwright local, pas MCP.
Lot réservation précédent conservé : RESERVATION_FACTORY_2026-10-21.md ; 69 scénarios privés démo et 9 export compilé lors de cette livraison, non additionnés au lot courant.
Attention recette : cookies de production restent Secure ; les parcours authentifiés ne se valident pas sur un serveur HTTP local de production. Utiliser le serveur de démonstration adapté pour ces tests, sans désactiver la protection. Pas de validation TLS/production, RLS, Stripe ou Netlify revendiquée.

## Git, confidentialité et environnement
Worktree courant : C:/Users/cashe/Documents/GYM-factory-theme-20261021. Base privée d7cbbe3, branche de livraison design/refonte-progressive-lot1 ; export public GetYourMentor-site, base a428f89, branche main. Vérifier HEAD et SHA distant final, pas de SHA autoréférent.
Dossier principal GetYourMentor en retard avec changements antérieurs sans rapport : ne pas les intégrer en bloc. Dépôt privé : documents/preuves ; export public : seuls fichiers publiables inspectés, sans historique privé, PDF, secrets, traces brutes ou captures de comptes réels.
Un serveur, un build, un worker ; pas de build sur les fichiers générés d'un serveur actif. Préserver VS Code/campagnes/sessions, fermer ses seuls processus temporaires. Aucun envoi de données privées à des services d'analyse/recherche.
Aucun déploiement dans ce lot ; version Netlify précédente source bbe20d7 inchangée. Pas de nouvel agent/moteur : REA uniquement pour comprendre un mécanisme externe autorisé si nécessaire, Playwright pour observer/tester.

## Reprise suivante
Prochain lot recommandé : accueil Factory, après inspection d'EditorialHome, des styles et de la couverture active. Préserver sections, navigation, contenu vérifié et données ; ne pas réintroduire un sélecteur de palette. Ne pas recommencer créneaux/récapitulatif/paiement/suivi. Si une priorité métier documentée plus critique apparaît, la justifier avant de choisir ce lot. Même recette responsive, confidentialité et export public ciblé ; aucun déploiement implicite.
Ne pas recommencer les onglets coach/footer : [lot précédent](COACH_ONGLETS_FOOTER_2026-10-21.md), bases livrées 7aebba1 privé / 342e62b public, 18 tests privés et 8 publics lors de cette livraison. Socle Factory : REFONTE_FACTORY_2026-10-21.md.
