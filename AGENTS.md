## Nouveau lot autoris? ? 7 novembre 2026, sans fen?tres VS Code suppl?mentaires

La derni?re consigne utilisateur autorise un second lot born?, coordonn? dans la conversation : deux agents natifs en worktrees neufs pour H1.5.2, lecture expurg?e et tests synth?tiques de panne/reprise. Aucune nouvelle fen?tre VS Code, sous-d?l?gation, API payante configur?e, ancien lanceur, service distant m?tier, secret, notification, migration ou d?ploiement. Les anciennes interdictions g?n?rales de d?l?gation sont remplac?es uniquement pour ce lot. Le coordinateur r?serve Kanban, instructions, reprise, int?gration des seuls commits revus et push cibl? sur la branche courante. Un seul contr?le lourd ? la fois ; pr?server tous les brouillons. Arr?ter apr?s livraison, sans boucle persistante. Les anciennes missions ARC5/H1.5.1 restent cl?tur?es.

# GetYourMentor — consignes obligatoires de reprise

Cloture du second lot : missions terminees,voir `docs/multi-agent/2026-11-07/LOT2_COMPTE_RENDU.md`. Cette consigne ne lance aucune boucle persistante et ne permet pas de rejouer les missions fermees. Reprendre uniquement un nouveau lot borne demande par l utilisateur.

## Exception utilisateur bornée — 7 novembre 2026, premier lot parallèle

La consigne utilisateur jointe du 7 novembre autorise pour ce seul lot deux agents exécutants natifs supervisés, sur des worktrees neufs de l'historique nettoyé : ARC-05 (types/fixtures compatibles) et H1.5.1 (projection locale expurgée de supervision Telegram). Cette exception remplace les anciennes interdictions générales de délégation uniquement dans ce périmètre ; elle ne réactive aucun lanceur/boucle historique. Pas de sous-délégation, nouvelle tâche autonome, API payante supplémentaire, compte, opération distante, migration, notification, paiement ou déploiement.

Chaque exécutant travaille uniquement dans son worktree et son allowlist. Le coordinateur seul modifie Kanban, reprise, décisions et instructions communes, effectue l'intégration ciblée autorisée et le push final. Les exécutants peuvent préparer un commit ciblé sans push ; aucun ancien historique fusionné, force-push ou protection désactivée. Les fenêtres VS Code sont des vues du travail, distinctes de l'exécution native des agents. Un seul contrôle lourd/build/campagne navigateur à la fois, aucune modification des brouillons antérieurs. Missions et preuve dans `docs/multi-agent/2026-11-07/`. Arrêt après le premier lot validé, sans poursuite automatique.

Clôture du lot : consulter `docs/multi-agent/2026-11-07/COMPTE_RENDU.md` et le relais courant. Les missions terminées ne doivent pas être relancées à partir de leurs anciennes consignes ; aucune délégation persistante ou nouvelle tâche automatique n'est autorisée par cette exception.

## Chantier documentaire local — 3 novembre 2026

Pour la refonte agentique, consulter `docs/architecture/AGENTIC_REFACTOR_2026-11-03.md`, le Kanban versionné et `tools/agentic-workbench/AGENTS.md`. L'atelier actuel est extractif, local et sans modèle ; ses rôles planifiés ne sont pas des agents lancés. Ne pas publier les documents internes ou ajouter des outils de mutation. Les consignes de sécurité, Git, reprise et exécution séquentielle ci-dessous restent applicables.

Avant toute intervention, lire la « Procédure obligatoire à chaque demande » de [BRANCH_STRATEGY_GYM.md](BRANCH_STRATEGY_GYM.md), puis les documents qu’elle désigne.

À chaque prompt : inventaire Git et documentaire au départ ; vérification, documentation, commit ciblé et push sur la branche appropriée avant la réponse finale de livraison ; confirmation du SHA distant. Préserver les changements antérieurs non vérifiés. Aucun commit vide pour une simple discussion.

Les mises à jour intermédiaires restent possibles. Si le push est bloqué, le signaler précisément sans contourner les contrôles. Aucun force-push, fusion ou déploiement en production n’est autorisé par cette règle.

## Priorités actives — 18 octobre 2026
1. Maîtriser l’usage : compteurs seulement si réellement accessibles ; sinon un seul lot borné par tour, recherches et sorties ciblées, aucun enchaînement illimité. Aucun quota/changement de modèle inventé, achat ou attente artificielle. Conserver les contrôles nécessaires.
2. Préserver le contexte : lire le relais court `docs/ETAT_REPRISE_COURANT.md`, puis les sources spécialisées indiquées pour le lot. Actualiser ce relais avant fin/interruption ; les archives ne sont pas des consignes actives.
3. Réaliser le lot métier selon les décisions prioritaires et dépendances établies. Ces priorités remplacent les anciennes consignes d’enchaînement sans borne ; elles ne remplacent pas les protections métier, Git et sécurité.

## Choix du modèle et économie de tokens — 4 novembre 2026

Avant chaque lot, choisir parmi les modèles GPT réellement disponibles le réglage le plus économe capable de satisfaire ses critères de réussite. Objectif : minimiser les tokens de l'ensemble du travail, reprises comprises, sans promettre un minimum garanti. Un modèle moins cher ne produit pas nécessairement moins de tokens.

- Petites corrections, documentation et extractions bien délimitées : privilégier un modèle léger (par exemple Luna si disponible), avec un effort faible suffisant. Travail technique complexe : préférer un modèle polyvalent adapté (par exemple Sol). Réserver les modèles ou efforts plus élevés aux difficultés démontrées, aux décisions complexes et aux risques qui les justifient. Ces exemples ne remplacent pas la vérification des capacités et disponibilités actuelles.
- Lire le relais puis les seuls fichiers et passages utiles ; utiliser des recherches et sorties ciblées, réutiliser les constats encore valides et produire des comptes rendus concis. Éviter les relectures intégrales, appels et essais redondants. Ne pas retirer des preuves ou contrôles nécessaires pour économiser des tokens.
- Augmenter l'effort ou recommander un modèle plus capable lorsqu'un échec observé, une ambiguïté importante ou un risque le justifie. Ne pas lancer de comparaisons de modèles systématiques ni de nouveaux agents.
- Si la session ne permet pas de changer réellement de modèle, conserver celui utilisé et distinguer recommandation et changement effectué. Ne pas modifier silencieusement la configuration globale, lancer d'appels API payants ou prétendre connaître des quotas, coûts ou compteurs inaccessibles. Les tokens, crédits Codex et frais API sont des mesures distinctes.

Référence indicative consultée le 4 novembre 2026 : https://developers.openai.com/api/docs/guides/model-selection. Les exigences de sécurité, d'exactitude, de vérification et de livraison restent prioritaires.

## Consultation progressive — 18 octobre 2026
Appliquer la section « Hiérarchie et contexte progressif » de BRANCH_STRATEGY_GYM.md. Index des PDF et couverture réelle : docs/sources/README.md ; REA : catalogue dans docs/REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md. Lire le socle et le relais, puis les seules sources du lot. Les V3/V5/REA sont des méthodes, pas des moteurs présumés installés. Aucun agent supplémentaire. Une source présente sur disque n’est pas automatiquement en contexte.
