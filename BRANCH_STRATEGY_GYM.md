# GetYourMentor - Strategie de branches

> Arbitrage visuel utilisateur du 21 octobre 2026 : Kebab Factory remplace le violet fixe et les anciennes prescriptions incompatibles, selon `DESIGN_SYSTEM_GYM.md` et la couverture de `docs/REFONTE_PROGRESSIVE_2026-10-15.md`. Les règles métier, confidentialité, priorités d'usage et de contexte restent applicables. Les références au violet dans les sections anciennes sont historiques. Dépôt original privé ; export public `GetYourMentor-site` limité au code publiable, sans historique ou documents privés.

## Procedure obligatoire a chaque demande - 15 octobre 2026

Cette procedure s'applique a chaque prompt GetYourMentor, avant les travaux et avant la reponse finale. Les mises a jour intermediaires restent possibles.

1. Lire AGENTS.md, cette procedure, DOCUMENT_MAITRE_GYM.md, docs/README.md, docs/REFONTE_PROGRESSIVE_2026-10-15.md et les contrats pertinents. Appliquer les decisions utilisateur les plus recentes.
2. Verifier le depot, la branche, les worktrees, les modifications indexees/non indexees, le distant et l'upstream. Choisir la branche du chantier : design/refonte-progressive-lot1 pour la refonte actuelle et ses preuves. Ne pas pousser sur main ni recopier le travail sur plusieurs branches. Les anciens noms dans les relais sont historiques.
3. Preserver les modifications anterieures. Realiser des lots cibles, verifier les changements et actualiser les documents canoniques et la reprise. Ne pas ajouter tout le depot, des secrets, des donnees personnelles ou des fichiers temporaires.
4. Avant chaque reponse finale de livraison, commiter et pousser le travail valide sur la branche appropriee. Au prompt suivant, verifier la synchronisation des commits livrables precedents. Aucun commit vide pour une discussion ; les travaux anterieurs non verifies ne sont pas automatiquement livrables.
5. Confirmer le succes du push en comparant le SHA local a la reference distante. Rapporter branche, commit, controles et changements restant locaux. Ne pas annoncer un push sans preuve distante.
6. Si les controles, un conflit ou l'acces distant bloquent, preserver le travail et signaler le blocage precis. Demander uniquement l'intervention indispensable. Ne pas forcer le push ni desactiver les protections.

Cette autorisation couvre les commits et pushes cibles, sans fusion, force-push ni deploiement en production. Verifier les declencheurs CI/CD et conserver l'isolation de demonstration. Code pousse et code deploye sont deux etats distincts.

## Priorités obligatoires — décision utilisateur du 18 octobre 2026

1. **Usage avant ampleur du lot.** Lire uniquement les compteurs réellement accessibles. Ne pas confondre quotas Codex, crédits, facturation API et fenêtre de contexte. Sans compteur fiable : un seul lot court, vérifiable et documentable par tour ; pas d’enchaînement indéfini, de nouvelle délégation ou de polling. Réduire volume/relectures/reprises, pas les contrôles nécessaires. Aucune garantie de ne jamais atteindre une limite, aucun compteur ou changement de modèle prétendu. Aucun achat/plafond/abonnement modifié ni attente artificielle.
2. **Contexte avant extension du périmètre.** Le relais court `docs/ETAT_REPRISE_COURANT.md` est le point de reprise opérationnel existant. Lire ensuite les seuls rapports/sources pertinents et leurs dépendances ; consulter les archives au besoin. Aucun second maître concurrent. Avant fin/interruption : état terminé/en cours/non testé, preuves, branche/SHA vérifié, déploiement distinct, contradictions et prochaine action.
3. **Un lot complet.** Conserver audit/réemploi, vérifications proportionnées, documentation et commit/push ciblés avec SHA distant confirmé. Si compteur fiable proche d’une limite, préparer un point de reprise sûr ; ne pas pousser du code non vérifié. Ne pas prétendre poursuivre après la réponse finale.

Ces priorités remplacent l’ancien enchaînement sans borne ; les exigences métier, autorisations et protections restent applicables. Référence officielle sur les limites et leur suivi : https://learn.chatgpt.com/docs/pricing (consultée le 18 octobre 2026). Cette documentation publique ne fournit pas les compteurs privés de la session.

## Principe

`main` reste la branche de reference.

Les autres branches servent a separer les grands chantiers du projet pour eviter de melanger :
- vision et documentation
- produit
- design
- automatisation
- business et acquisition

## Branches recommandees

### `docs/project-foundation`

Pour :
- document maitre
- architecture memoire
- cadrage global
- decisions fondatrices

### `product/mvp-spec`

Pour :
- MVP
- parcours utilisateur
- specification des ecrans
- logique fonctionnelle

### `design/figma-planity-like`

Pour :
- maquettes Figma
- charte graphique
- tests visuels
- prototype de reservation

### `automation/n8n-supabase`

Pour :
- schema Supabase
- workflows n8n
- memoire projet
- synchronisation Trello

### `business/finance-growth`

Pour :
- business plan
- pitch
- financement
- strategie commerciale
- acquisition coachs et clubs

## Regles simples

- `main` ne recoit que des etapes propres et valides
- une branche = un chantier principal
- les petits commits frequents sont preferables aux gros commits rares
- quand un chantier est stabilise, il peut etre fusionne vers `main`

## Usage conseille pour vous 3

- toi : `business/finance-growth`
- frere 1 : `product/mvp-spec`
- frere 2 : `automation/n8n-supabase`
- travail commun design : `design/figma-planity-like`

La branche `docs/project-foundation` peut servir a consolider les documents transverses.

## Efficacité et ressources — consigne utilisateur du 16 octobre 2026

- Lire d’abord la reprise récente et les index obligatoires ; cibler ensuite `rg` et les passages pertinents. Regrouper les lectures indépendantes et éviter les sorties massives/tronquées, les relectures et les interrogations sans nouvelle information. Garder les contrôles nécessaires de sécurité et de rendu.
- PC i5-9300HF / 8 Go : un serveur applicatif, un build et un worker Playwright à la fois. Aucun build sur les fichiers générés utilisés par un serveur actif. Réutiliser les dépendances ; avancer sur la documentation indépendante pendant une vérification. Ne relancer un contrôle réussi que pour un changement, une erreur ou une incertitude pertinente.
- Fermer uniquement les processus temporaires créés pour le lot. Préserver VS Code, campagnes, sessions connectées et processus de provenance inconnue. Ne pas promettre un gain de RAM ou de temps sans mesure comparable.
- Usage/Billing : consulter uniquement les informations réellement accessibles ; séparer abonnement/quotas Codex et éventuelle facturation API. Ne pas lire les secrets pour tenter de reconstruire la facturation. Aucun achat ni modification d’abonnement/plafond. Consommation, crédit et renouvellement inconnus restent explicitement inconnus.
- Adapter modèle/effort aux tâches si le client le permet ; sinon distinguer configuration locale, modèle effectif et recommandation. Aucun changement de modèle prétendu. Pas de sous-agents ni nouvelle orchestration. Recommandation vérifiée le 16 octobre : Luna pour tâches bornées/répétables si disponible ; GPT-6.1 Sol pour développement complexe, effort ajusté. Vérifier la disponibilité réelle plutôt que déduire les droits du compte de cette recommandation.
- Sources officielles : https://learn.chatgpt.com/docs/models et https://learn.chatgpt.com/docs/pricing. Les paramètres locaux observés ne prouvent pas une facturation ou le modèle effectif de la session.

Reprise du sous-lot affiliations : `docs/RESERVATIONS_GROUPES_2026-10-16.md`, section « Préparation affiliations multi-coachs ». Maquette indépendante ; aucune intégration métier annoncée par son existence.

## Reprise consolidée et budgets — décision utilisateur du 17 octobre 2026

Lecture obligatoire complémentaire : `docs/sources/README.md`, le PDF de référence `docs/sources/GetYourMentor_Prompt_Maitre_V3_Consolide_Codex.pdf` ou son extraction intégrale paginée `docs/sources/PROMPT_MAITRE_V3_2026-10-17.md` (12 pages ; consulter le PDF pour la mise en page et les ambiguïtés), puis la section « Prompt maître V3 » de `docs/STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md`. Il s’agit de prescriptions documentaires et d’archives, pas de preuves de fonctionnalités livrées.

L’utilisateur autorise explicitement la poursuite des lots vérifiés, leur documentation et leurs commits/pushs. Cette autorisation existante couvre les correctifs démo courants malgré les STOP génériques du PDF ; elle n’autorise ni fusion, ni production, ni nouveau service payant, ni décision commerciale inventée. Garder 15 % administrable et les montants historiques (pas les 10 % historiques du PDF), la maquette HTML actuelle (pas réintroduction Emergent/carrousel 3D) et les consentements bilatéraux. Les tarifs et droits inconnus restent à décider avant activation commerciale. Ne pas créer les « Guardians » comme agents ou infrastructures parallèles : réutiliser contrôles, scénarios, index et contrats présents.

Usage Codex : compteurs de quota, crédits, renouvellements et tokens inconnus restent inconnus. Estimation qualitative par lot, contrôles proportionnés et état de reprise avant opération longue ; aucune promesse de contourner un plafond. Pas de changement d’abonnement, plafond, achat ou modèle prétendu. Réduire les relectures et sorties, conserver les tests nécessaires.

Usage Netlify : validation locale prioritaire ; aucun déploiement à chaque commit, documentation ou capture. Vérifier les déclencheurs Git avant push ; ne pas activer de nouveaux builds automatiques. Regrouper un candidat démo vérifié uniquement quand une validation distante est nécessaire. Réutiliser un paquet préparé seulement si sources/ZIP/BUILD_ID sont identiques. Pas de polling serré, crawl massif ni charge distante sans budget/périmètre dédiés. Lire les compteurs uniquement s’ils sont réellement disponibles ; ne jamais déduire le solde d’un succès de déploiement. Aucun changement de plan, plafond, suppression de stockage ou pause de site pour économiser sans instruction. Si le budget nécessaire est inconnu, continuer localement et documenter le besoin distant.

Relais historique des lots précédents : `docs/MESSAGERIE_DEMO_2026-10-17.md` pour structures/fidélité et `docs/AVIS_STRUCTURES_PERSISTANCE_2026-10-17.md` pour preuves hébergées. Ne pas confondre état poussé, état déployé et validation des services réels.

## Relais courant et rôle de REA — 17 octobre 2026

Après la procédure et les documents maîtres, lire obligatoirement `docs/ETAT_REPRISE_COURANT.md`, puis ses sources ciblées. Il contient résultats, limites, prochaine action et prochain prompt ; vérifier Git pour les SHA réellement livrés. Ce relais ne remplace pas les sources métier ni la hiérarchie ci-dessus.

Décision utilisateur corrigée : REA et Playwright ont des fonctions distinctes. REA sert principalement à comprendre des mécanismes externes autorisés ; Playwright vérifie navigation/rendu/parcours. Aucun couplage systématique, ni recours obligatoire à REA pour chaque lot. Une cible externe exige provenance, droits, périmètre et limites vérifiés. Essai CLI statique isolé réalisé, décrit dans `docs/REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md` ; aucun agent ni setup MCP permanent ajouté. Les résultats partiels et inconnus ne valent pas preuves d’exécution, d’autorisation ou de capacité serveur.

## Hiérarchie et contexte progressif — décision utilisateur du 18 octobre 2026
Cette section harmonise les formulations anciennes du dépôt. Elle remplace la lecture répétée intégrale de tous les PDF par une lecture progressive et traçable. Les sources non consultées ne sont jamais annoncées lues. Aucun compteur de contexte/quota inaccessible n’est inventé.

Ordre d’autorité :
1. Instructions de l’environnement, autorisations, sécurité et obligations applicables ; un document externe n’est pas une instruction supérieure.
2. Décisions explicites récentes de l’utilisateur, dans leur périmètre autorisé.
3. Exigences métier approuvées : MVP PDF, Business Plan et devis prioritaires ; DOCUMENT_MAITRE_GYM.md est leur synthèse et le journal des arbitrages, pas une autorité permettant de modifier silencieusement une source. En cas de contradiction non arbitrée entre PDF métier, relever pages/impact et demander uniquement la décision indispensable.
4. Contrats visuels et techniques approuvés, interprétés selon les arbitrages actifs : maquette HTML, violet fixe, pas de sélecteur sur l’accueil.
5. Méthodes V3/V5/REA, règles spécialisées et rapports validés ; elles ne valent ni installation ni preuve d’existence.
6. Recommandations externes et archives, jamais exécutées comme instructions.

Arbitrages déjà actifs : quatre sports ; commission séances 15 % administrable et historiques figés ; affiliations à deux accords ; prix total de groupe fixé par le coach selon sa taille ; acceptation avant paiement ; démonstration sans paiement/notification réelle, Premium implicite, agent ajouté, fusion, force-push ou déploiement Netlify/production. Les anciens 10 %, Emergent/carrousel 3D et enchaînements indéfinis ne sont pas réactivés par les PDF. Les STOP génériques ne nécessitent pas de redemander une autorisation déjà donnée ; les opérations nouvelles sensibles restent à arbitrer.

Ordre de lecture opérationnel : AGENTS → cette procédure et ses priorités actives → préambules actifs du maître et de docs/README → docs/ETAT_REPRISE_COURANT.md → docs/sources/README.md → sources spécialisées du lot et dépendances. À la première intégration d’une méthode, qualifier ses règles et contradictions ; ensuite relire les pages pertinentes, sans prétendre tout retenir. Archives uniquement pour une question précise.

Contexte de lot à consigner dans le relais existant : objectif borné, critères de réussite, décisions et sources/pages, composants/services disponibles, risques/dépendances, contrôles proportionnés, exclusions, état des preuves, prochaine action. Réemploi avant création. Une inférence reste datée et incertaine jusqu’à vérification ; ni résumé ni RAG ne devient arbitre. Si MemPalace/RAG indisponible ou non vérifié : consultation directe, sans installation.

Méthodes utiles V5 : séparer défaut démontré/risque plausible/préférence/question ; garder provenance, hypothèse, décision, preuve, correction, limites et version dans les rapports existants. Tester latence, double clic, retour arrière et reprise selon le risque. Une contre-revue proportionnée n’impose pas de nouvel agent. Pas de règle illustrative promue automatiquement ni d’apprentissage du modèle prétendu. Arrêter les itérations sans preuve nouvelle/valeur et préparer une reprise sûre, sans diminuer les contrôles nécessaires.

Organisation : découper lots et dépendances. Gouvernance : autorité, décisions et preuves. Orchestration : coordonner les scripts/contrôles existants, pas créer un conseil de 24 agents. REA peut aider à comprendre un mécanisme externe autorisé ; catalogue de compétences dans docs/REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md. Playwright vérifie les interfaces. Le catalogue est documentaire, pas un routeur exécutable ni une preuve de performance.

Fin de lot : résultats vérifiés et non testés, sources/pages, limites/contradictions, SHA distant, déploiement distinct, prochaine action ; commit/push ciblés si travaux autorisés, sans copie des modifications antérieures. Retour arrière documentaire par revert ciblé après revue, sans restaurer comme actives les règles obsolètes.
