# GetYourMentor - Strategie de branches

## Procedure obligatoire a chaque demande - 15 octobre 2026

Cette procedure s'applique a chaque prompt GetYourMentor, avant les travaux et avant la reponse finale. Les mises a jour intermediaires restent possibles.

1. Lire AGENTS.md, cette procedure, DOCUMENT_MAITRE_GYM.md, docs/README.md, docs/REFONTE_PROGRESSIVE_2026-10-15.md et les contrats pertinents. Appliquer les decisions utilisateur les plus recentes.
2. Verifier le depot, la branche, les worktrees, les modifications indexees/non indexees, le distant et l'upstream. Choisir la branche du chantier : design/refonte-progressive-lot1 pour la refonte actuelle et ses preuves. Ne pas pousser sur main ni recopier le travail sur plusieurs branches. Les anciens noms dans les relais sont historiques.
3. Preserver les modifications anterieures. Realiser des lots cibles, verifier les changements et actualiser les documents canoniques et la reprise. Ne pas ajouter tout le depot, des secrets, des donnees personnelles ou des fichiers temporaires.
4. Avant chaque reponse finale de livraison, commiter et pousser le travail valide sur la branche appropriee. Au prompt suivant, verifier la synchronisation des commits livrables precedents. Aucun commit vide pour une discussion ; les travaux anterieurs non verifies ne sont pas automatiquement livrables.
5. Confirmer le succes du push en comparant le SHA local a la reference distante. Rapporter branche, commit, controles et changements restant locaux. Ne pas annoncer un push sans preuve distante.
6. Si les controles, un conflit ou l'acces distant bloquent, preserver le travail et signaler le blocage precis. Demander uniquement l'intervention indispensable. Ne pas forcer le push ni desactiver les protections.

Cette autorisation couvre les commits et pushes cibles, sans fusion, force-push ni deploiement en production. Verifier les declencheurs CI/CD et conserver l'isolation de demonstration. Code pousse et code deploye sont deux etats distincts.

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

Dernier relais : `docs/MESSAGERIE_DEMO_2026-10-17.md` pour structures/fidélité et `docs/AVIS_STRUCTURES_PERSISTANCE_2026-10-17.md` pour preuves hébergées. Ne pas confondre état poussé, état déployé et validation des services réels.
