# État de reprise courant — GetYourMentor

Mise à jour : 17 octobre 2026. Relais opérationnel ; les résultats ci-dessous ne valent pas clôture V1/V2/V3.

## Ordre de consultation et priorité
1. AGENTS.md puis BRANCH_STRATEGY_GYM.md (procédure Git, budgets et protections).
2. DOCUMENT_MAITRE_GYM.md et docs/README.md (lire les décisions actives avant les historiques).
3. Ce relais, puis les rapports et passages ciblés du lot.
4. PDF métier prioritaires selon le maître ; sources et contrats pertinents.
5. PDF méthodologique V3 et annexes dans docs/sources : méthode complémentaire, pas nouvelle autorisation ni remplacement des règles métier.

Décisions utilisateur conservées : quatre sports, 15 % administrable, montants historiques, maquette HTML validée/palette violette fixe, affiliation à deux accords, démo uniquement. Les anciennes références 10 %/Emergent/3D/STOP génériques ne révoquent pas les décisions explicites de poursuite des lots autorisés. REA vient compléter Playwright pour ses fonctions propres ; pas de nouvelle couche d’agents. Aucun force-push, fusion, production, paiement réel, changement de facturation ni Premium implicite.

## Git, chantier et état distant
Dépôt : C:/Users/cashe/Documents/GetYourMentor. Branche de livraison : design/refonte-progressive-lot1. Base vérifiée cb03d12f68c3f8142d07324906b70575faf466fe ; lire `git log -1` et `git ls-remote origin refs/heads/design/refonte-progressive-lot1` pour le SHA de cette livraison, sans référence auto-référente.
Candidat isolé : C:/Users/cashe/Documents/GYM-beta-feedback, dépendances réutilisées par jonction. Ne pas déployer le dépôt principal sale.
Dernière démo distante documentée : code a4f71cf, déploiement 6ad2cabc5fae491ff7f706a0 ; lecture du 17 octobre dans assets/persistence-reviews-2026-10-17/deploy-sites-after.json. Aucun déploiement ni relecture API Netlify pour le lot bêta. La nouvelle messagerie structures et le module bêta sont des livraisons locales/poussées, pas des fonctionnalités prétendues déjà en ligne. Pas de succès CI distant : workflow principal hors branche de design.

## Résultat du lot actif
`/beta` et `/api/feedback`, lien depuis les comptes, messages privés sportif/coach/structure, suivi d’état, modération admin et résumé partagé uniquement aux membres connectés. Bugs/positifs jamais publiés, suggestions modérées, compteurs issus des votes, un vote par compte et suggestion, vingt demandes concurrentes sans double vote, création idempotente après réponse perdue. Pas de nouvelles données commerciales ni service de feedback externe.
Maquette préalable : maquettes/retours-beta/index.html. Rapport : RETOURS_BETA_2026-10-17.md. Source : Business Plan p.49, Perplexity p.12–13 et matrice de couverture existante. Le vocabulaire de traitement et les plafonds de validation sont des choix techniques de démonstration documentés, pas des conditions commerciales.

Build et typage réussis ; 4/4 tests bêta puis 34/34 régressions ciblées réussis. Complément final clavier/titre long : build et 4/4 bêta PASS, inclus dans les 38 tests des deux campagnes finales. Résultats et empreintes : assets/retours-beta-2026-10-17/verification.json. Les campagnes ne constituent pas une certification globale de V1/V2/V3. Captures beta-390.png et beta-1440.png examinées, quatre largeurs sans débordement dans la campagne. Journaux dans gym-next du candidat ; ne pas les ajouter en bloc.
Défaut corrigé : garde d’origine basée sur URL publique configurée, pas l’hôte interne Next ; origine étrangère toujours refusée. Tests corrigés pour statuts de chargement simultanés et cookie Secure sur loopback dans APIRequestContext, sans changement des protections de l’application.

## REA / Playwright réellement utilisés
REA officiel morluto/rea, paquet 6.5.0, MIT, installé hors projet sous C:/Users/cashe/Documents/GYM-tooling/rea-6.5.0, scripts d’installation désactivés. Aucun MCP/skill REA permanent, provider natif ou sous-agent installé. CLI Node 24.14.0 : analyse statique de trois sources, pas exécution de l’application. Reproduction, version, budgets, installation/désinstallation et sources : REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md. Preuve courte : assets/retours-beta-2026-10-17/rea-summary.json ; JSON complet conservé seulement dans gym-next/rea-feedback-evidence.json du candidat. Ne pas imprimer ce JSON monoligne volumineux : extraire quelques champs avec Python/JSON.
REA relève des relations statiques et inconnues ; Playwright vérifie ensuite les permissions et parcours en exécution. Ne pas convertir un candidat FormData en endpoint certain ni les graphes partiels en audit exhaustif. Aucun gain comparatif coût/qualité mesuré.
Playwright MCP a ouvert/redimensionné la maquette HTTP ; evaluate sans réponse interrompu, aucune capture MCP inventée. Serveur statique propriétaire arrêté. Recette applicative et captures via Playwright local existant ; un worker et serveur gérés par le harness.

## Limites et travail à préserver
Persistance/concurrence du nouveau module en Blobs distants non recettées : aucun déploiement autorisé pour ce lot. Mémoire locale perdue au redémarrage. Réutilisation CAS existante ≠ preuve distante de ce module. RLS réelle, Stripe, charge élevée, i18n complète et audit WCAG exhaustif non validés. L’admin doit relire et anonymiser les résumés ; pas de garantie automatique de détection de données personnelles. Pas de notification externe, suppression/export feedback ou politique légale de conservation ajoutés ; à cadrer avant usage réel.
Dépôt principal : changements préexistants maître/README, governance/ai, webhook Stripe/tests, styles/layout/cookies/HomePageClient, next.config, playwright.config, safety smoke, supabase/README et fichiers non suivis. Préserver ces éléments ; aucune indexation globale, reset, clean ou stash global. Vérifier chaque cible avant copie ; préfixes propres uniquement pour maître/README déjà modifiés.
Quotas Codex/Netlify inconnus ; aucun achat ou économie chiffrée annoncée. Un serveur/build/worker à la fois, REA lourd séparé. Fermer seulement ses processus temporaires ; préserver campagnes, VS Code et sessions connectées.

## Prochaine tranche et dépendances
Offres/abonnements/droits de démonstration, puis contenus/suivi selon la matrice. Commencer par audit des montants/périodicités/limites réellement documentés et des composants déjà présents, puis maquette desktop/mobile. Ne pas déduire une commission différente ou de nouveaux avantages d’un prix de plan. Informations ambiguës : représentation informative explicite et décision nécessaire uniquement avant activation du comportement concerné. Les services réels ne bloquent pas toute la démo.

## Prochain prompt prêt à copier

Reprends GetYourMentor en suivant AGENTS.md, BRANCH_STRATEGY_GYM.md et docs/ETAT_REPRISE_COURANT.md. Vérifie l’état Git/distant avant de travailler, préserve les changements locaux et distingue poussé/déployé. Consulte les rapports RETOURS_BETA_2026-10-17.md, REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md, la matrice STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md, les sources maîtres et contrats visuels.
Réalise le prochain lot documenté : cadrage et maquette des offres/abonnements et droits en démonstration, puis la tranche d’implémentation dont les règles sont réellement définies. Vérifie les forfaits dans les PDF prioritaires et l’existant avant d’ajouter quoi que ce soit. Distingue affichage commercial, état simulé et service réel. N’invente aucune périodicité, prorata ou règle de commission ; les parties indéterminées restent explicitement indisponibles, sans bloquer les travaux indépendants. Garde 15 % administrable et les historiques, aucun paiement ni Premium réel.
Utilise REA comme complément statique ciblé de Playwright selon l’évaluation existante, sans réinstallation répétée ni nouvelle orchestration. Garde les inconnues des graphes, vérifie les comportements par tests et captures aux quatre largeurs. Ne lance pas de build sur le serveur actif. Aucun déploiement Netlify dans ce lot, pas de quota inventé ni achat.
Réalise un lot borné, vérifie, documente, commit/push ciblés sur la branche appropriée et confirme le SHA distant. Mets à jour ce même relais avant la fin avec preuves, limites, prochaines commandes, sources/priorités et prochain prompt autonome. Aucun force-push/fusion/production. Ne déclare pas V1/V2/V3 terminées sans critères satisfaits.
