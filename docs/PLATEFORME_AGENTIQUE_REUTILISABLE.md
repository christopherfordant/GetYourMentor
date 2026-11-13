# Plateforme de développement agentique réutilisable — cadrage

Date du cadrage : 13 novembre 2026. Ce document pilote un chantier versionné dans le Kanban GetYourMentor ; il ne crée ni second Kanban, ni base mémoire, ni agent LLM supplémentaire.

## Provenance et niveau de certitude

La demande a été relue dans la fenêtre locale « ChatGPT Classic », dans la conversation « Docker expliqué en français », à partir du passage où Christopher demande une véritable plateforme agentique réutilisable. La lecture s’est faite visuellement dans l’application ; aucun export intégral de la conversation ni copie de capture n’est archivé. Le périmètre retenu couvre les messages visibles après ce passage jusqu’aux demandes sur la sélection ciblée du Kanban, les limites de contexte, la reprise, les coûts et les tests. Les formulations ci-dessous sont des synthèses, non des citations exhaustives.

L’image jointe à la demande a été ouverte dans cette fenêtre. Elle liste notamment GitHub Spec Kit, Voiceflow avec un CRM (Notion, Airtable ou HubSpot selon le besoin), « Open claw »/OpenClaw, « Babylovegrowththai », « Explee », Higgsfield, Heycatchai et Crush AI. Certains noms sont peu lisibles ou incertains dans la capture ; ils sont enregistrés comme pistes à vérifier, pas comme choix confirmés. Le mot « Cambon » dans le message utilisateur n’est pas identifiable avec certitude. Aucune disponibilité, licence, gratuité, tendance ou intégrabilité de ces outils n’est affirmée ici.

## Exigences retrouvées

| Exigence issue de la conversation | Statut | Traitement retenu |
|---|---|---|
| Construire une plateforme de développement agentique réutilisable pour créer des SaaS, applications web, API et applications mobiles | Souhait confirmé | Cible de long terme, construite par petits lots et validée hors du seul cas GetYourMentor |
| Réutiliser le mécanisme dans différents projets VS Code et avec Codex comme Claude Code | Souhait confirmé | Noyau local commun et adaptateurs minces par projet et assistant ; compatibilité à prouver, pas présumée |
| Faire intervenir plusieurs rôles/agents, attribuer le travail, suivre tickets, sous-tickets, sprints, échéances et durée | Souhait initial, précisé ensuite | Garder rôles et charges dans le Kanban comme planification ; ne pas les présenter comme agents ou temps réellement exécutés. Le parallélisme est optionnel, borné et subordonné à l’isolation Git |
| Optimiser les tokens pour chaque tâche et quel que soit le projet | Souhait confirmé | Réduire les lectures et appels inutiles par sélection déterministe. Ne pas ajouter un second LLM consommateur de tokens pour « économiser » sans bénéfice net mesuré |
| Consulter seulement la partie utile du Kanban au lieu de charger tout le tableau | Besoin confirmé | Réutiliser `task-context.mjs`, déjà livré en lecture seule sur le backlog canonique ; généralisation ultérieure seulement si un besoin multi-projet concret est prouvé |
| Conserver l’interface Kanban visuelle déjà créée par Codex et toutes ses tâches | Contrainte confirmée | Ne pas reconstruire l’interface, ne pas perdre de cartes, ne pas prendre `localStorage` pour la source officielle |
| Enrichir les cartes pour indiquer objectif, contexte, fichiers, dépendances, validation et informations à lire | Proposition approuvée dans l’échange | Garder les champs compacts et des références vers des documents, plutôt que des cellules massives ou la copie de documents maîtres |
| Reprendre sans oublier les décisions et résultats entre sessions, tout en respectant les limites de contexte | Besoin confirmé | Kanban pour le travail ; `AGENTS.md` pour les règles stables ; `docs/ETAT_REPRISE_COURANT.md` pour le relais court ; rapports versionnés pour les preuves |
| Détecter les erreurs et éviter de répéter les essais ; tester le code après les tâches et prévenir les régressions | Besoin confirmé, modalités à cadrer | Tests ciblés par ticket, contrôles plus lourds aux étapes adaptées, checkpoints ciblés. Pas de rollback automatique de toute une série de commits |
| Utiliser Git proprement, commits fréquents/ciblés et préserver les lots validés | Besoin confirmé | Une branche/worktree par chantier quand utile ; commit après un lot contrôlé ; retour arrière ciblé et réversible |
| Évaluer LangGraph, LangChain et des outils cités dans une capture | Pistes exploratoires, pas décisions | Comparer seulement lorsqu’un besoin précis (état durable, interruption/reprise, branches conditionnelles, connecteurs) n’est pas couvert simplement par l’existant |
| Ajouter RAG ou base vectorielle à l’outil de développement | Non confirmé comme exigence ; l’utilisateur demande d’examiner les acquis existants | Ne pas réutiliser le RAG métier pour sélectionner des tickets. Recherche documentaire actuelle séparée ; index vectoriel non requis pour le Kanban |
| Rester gratuit, local et efficace, sans augmenter la complexité inutilement | Contrainte confirmée dans le prompt Kanban et les échanges | Privilégier les outils déjà présents, déterministes et sans service payant ; documenter coûts inconnus et dépendances avant adoption |

## Couverture du prompt initial en six phases

Ces exigences sont conservées séparément de la vision réutilisable ajoutée dans les échanges ultérieurs.

1. **Audit** — Le Kanban est servi depuis `backlog.json`. L’interface le lit et conserve les déplacements de colonnes dans le `localStorage` versionné par SHA ; elle exporte une copie JSON mais ne modifie pas le fichier canonique ni Git. Le lecteur ciblé sélectionne une tâche à partir du JSON. Le flux de création/archivage des cartes n’est pas fourni par cette interface ; les tickets officiels sont édités dans le dépôt puis soumis aux contrôles et à Git. Risques documentés : brouillons d’une autre version conservés et non appliqués automatiquement ; aucune synchronisation multi-utilisateur/GitHub Projects.
2. **Lecture sélective** — Déjà réalisée pour GetYourMentor : `--ticket ID`, `--details`, `--next`, filtres locaux, aucun appel modèle et aucune lecture des chemins documentaires arbitraires. `--next` ne choisit que les feuilles `ready` avec dépendances `done`, sinon renvoie `no-ready-ticket`. La sortie est bornée par ses champs et cinq candidats, mais un paramètre utilisateur de taille maximale n’est pas confirmé comme configurable ; ce point reste un critère à traiter dans PLAT.3 si un besoin de taille est démontré.
3. **Enrichissement compatible** — Le modèle existant porte objectif, périmètre, fichiers, dépendances, critères, tests, preuves, priorité, statut, sprint, commits via l’historique Git et prochaine action. La compatibilité rétroactive doit être conservée lors d’une évolution de schéma ; toute migration de stockage exige sauvegarde, lecture/écriture de transition, assertions de non-perte et plan de retour arrière. Aucun schéma n’est migré par ce lot.
4. **Optimisation** — La récupération progressive existe. Les octets de sortie ont été mesurés lors de K1, pas les tokens. Aucune télémétrie de tokens/crédits fiable n’est supposée. La non-relecture de fichiers inchangés n’est pas encore mesurée ; avant d’introduire un cache, établir la répétition et l’invalidation nécessaires. La limite de réponse configurable reste à vérifier ; ne pas tronquer un critère ou une preuve pour atteindre une taille arbitraire.
5. **Sécurité et qualité** — Les tests du workbench vérifient dépendances, preuves, statuts et contrôles documentaires. Les brouillons préexistants sont préservés ; les changements se font dans des worktrees et commits ciblés. Une tâche ne devient pas `done` si sa preuve/validation attendue échoue. Toute évolution future du stockage doit partir d’une sauvegarde vérifiée ; aucun stockage destructif ni action distante dans le périmètre actuel.
6. **Validation** — K1 a vérifié le lookup ciblé, la sélection/dépendances, le résultat sans tâche prête, l’intégrité du backlog et le rendu du Kanban. Le premier lot PLAT ajoute les mêmes invariants et l’affichage des nouvelles cartes ; il ne prétend pas tester une synchronisation distante qui n’existe pas.

## État vérifié dans GetYourMentor

Sources consultées dans le worktree propre `C:\Users\cashe\Documents\GYM-kanban-context-20261113`, branche `chore/kanban-context-selector-20261113`, SHA `7381ee1f8666450e734092ba39b4289d9b4efb72` : `AGENTS.md`, `BRANCH_STRATEGY_GYM.md`, `tools/agentic-workbench/AGENTS.md`, `docs/ETAT_REPRISE_COURANT.md`, le modèle opérationnel du Kanban, `docs/architecture/AGENTIC_REFACTOR_2026-11-03.md`, `docs/KANBAN_CONTEXT_READER_2026-11-13.md`, le backlog canonique et le lecteur de contexte.

- L’atelier `tools/agentic-workbench/` contient une interface visuelle et un backlog versionné. `tools/agentic-workbench/backlog.json` est la source de vérité ; les déplacements de cartes du navigateur restent des brouillons.
- `task-context.mjs` fournit `--ticket`, `--details` et `--next`, sans modèle, sans accès arbitraire aux fichiers et sans mutation. Le dernier état donne `no-ready-ticket`.
- `docs/ETAT_REPRISE_COURANT.md` sépare déjà le relais de reprise des tickets et des preuves détaillées.
- L’assistant documentaire est lexical et extractif. Il est distinct du Kanban ; aucun LangGraph, LangChain, agent LLM de développement, orchestration multi-agent active ou outil externe évoqué dans l’image n’est raccordé par ce code.
- Les tickets existants GYM-A1…A5 cadrent l’atelier documentaire et une éventuelle orchestration applicative de connaissances. GYM-A5 est bloqué par A4 et Q2 ; il ne constitue pas une autorisation de transformer ces tickets en plateforme générale ni d’ouvrir les parcours métier.
- Le dépôt principal `C:\Users\cashe\Documents\GetYourMentor` porte de nombreux changements locaux non validés. Ils sont hors périmètre et demeurent intacts. Les branches de recette/démo ont des cibles distinctes et ne sont pas mélangées à ce plan.
- L’architecture du 3 novembre avait déjà évalué un graphe natif Node, LangGraph JS, Postgres/pgvector et d’autres options pour un assistant documentaire. Ce résultat reste une preuve historique située : il ne tranche pas automatiquement le choix d’un outil de développement transversal.

## Diagnostic et architecture proposée

Le meilleur premier choix n’est pas d’ajouter un agent coordinateur LLM. Un tel agent relirait le même Kanban et les mêmes documents, consommerait lui aussi du contexte et introduirait une seconde décision probabiliste. Le gain recherché — sélectionner et transmettre le contexte utile — est mieux couvert par du code local déterministe, puis par l’assistant de développement déjà utilisé.

Architecture progressive proposée :

1. **Socle commun local** : contrat de projet minimal décrivant la source des tâches, règles d’accès, commandes de vérification, documents de reprise et limites d’action. Aucun chemin personnel codé en dur.
2. **Adaptateurs de projet** : le GetYourMentor adapter lit son backlog JSON canonique ; un futur projet pourra fournir un adaptateur compatible (fichier ou service de tickets) sans changer le cœur. Le choix d’une source reste explicite par projet.
3. **Adaptateurs d’assistant** : consignes courtes conformes à Codex (`AGENTS.md`) et Claude Code (`CLAUDE.md` ou mécanisme documenté au moment de l’essai), renvoyant au même contrat de projet au lieu de dupliquer sa logique. Les capacités actuelles doivent être vérifiées au moment de l’intégration.
4. **Flux d’exécution** : sélectionner une tâche admissible → charger ses détails et dépendances → consulter les références ciblées → proposer/valider le plan selon le risque → modifier un périmètre limité → exécuter les contrôles définis → consigner preuves/statut → checkpoint Git → mettre à jour le relais et s’arrêter au lot convenu.
5. **Supervision et sécurité** : lecture seule par défaut pour le sélecteur ; écritures bornées au ticket ; secrets exclus du contexte et des journaux ; approbation explicite selon cible pour migrations, services distants, paiements, notifications, déploiements et opérations irréversibles.
6. **Mémoire** : règles durables courtes dans les fichiers d’instructions ; état opérationnel dans le relais existant ; critères et dépendances dans le Kanban ; preuves détaillées dans des rapports liés. Pas de base mémoire parallèle.
7. **Observabilité** : journal local minimal du ticket, références consultées, fichiers modifiés, commandes/tests et SHA. Ne pas enregistrer les prompts complets, secrets ou contenus privés. Mesurer tokens/crédits réels uniquement si une télémétrie fiable est disponible ; les octets lus ou temps de commande sont des indicateurs indirects, explicitement étiquetés.

### Outils exploratoires : décision provisoire

| Piste | Valeur possible | Décision actuelle |
|---|---|---|
| Noyau CLI local sans LLM | Filtrage, validation de schéma, résumés de ticket déterministes, faible dépendance | Retenu comme direction ; réutiliser le lecteur avant toute généralisation |
| LangGraph | Graphe durable, interruptions, reprise et décisions humaines pour workflows multi-étapes | À réévaluer seulement si le workflow réel requiert ces primitives ; pas installé/activé pour ce plan |
| LangChain | Intégrations et composants LLM | Pas requis pour filtrer un Kanban ni pour le premier noyau ; dépendances et appels supplémentaires à justifier |
| RAG/embeddings/pgvector | Recherche dans un corpus documentaire volumineux ou sémantique | Hors sélecteur de tickets ; l’assistant RAG existant reste séparé et soumis à ses tickets/validations |
| GitHub Spec Kit | Formalisation spec → plan → tâches | Piste de comparaison locale et non obligatoire ; le Kanban et ses critères existent déjà |
| OpenClaw / catalogue d’API publique | Intégrations externes éventuelles | Aucun branchement sans source officielle, périmètre, licence, allowlist, gestion des secrets et tests de sécurité |
| Voiceflow + CRM, Babylovegrowth, Explee, Higgsfield, Heycatchai, Crush AI | Automatisation de conversation, visibilité, contenus ou publication selon le produit exact | Hors noyau de développement agentique ; à examiner uniquement pour un besoin produit indépendant et après vérification des noms, prix, données et droits |
| « Cambon » | Référence incertaine dans le texte transcrit | Non évaluée ; ne pas deviner l’outil visé |

## Plan durable piloté par le Kanban

Les estimations sont des fourchettes de planification, pas du temps passé. Les dates de sprint sont proposées, non contractuelles. Les chemins réels du futur prototype sont à confirmer au début du ticket, à partir de `AGENTS.md`, du contrat, du worktree et du backlog actifs. Aucun ticket ci-dessous ne signifie que le travail correspondant est déjà fait.

| Ticket | Lot / objectif | Dépendances | Fichiers candidats à confirmer | Critères d’acceptation et contrôles | Risques / accès |
|---|---|---|---|---|---|
| GYM-PLAT.1 | Audit ciblé, exigences et choix d’architecture documentés | — | Ce document ; relais ; backlog | Provenance et statuts distingués ; existant réutilisé ; alternatives et limites consignées ; JSON et liens vérifiés | Conversation visuelle non exportée ; noms partiellement ambigus. Réalisé dans ce premier lot |
| GYM-PLAT.2 | Définir un contrat portable de projet et la frontière entre données canoniques, reprise et preuves | PLAT.1 | `tools/agentic-workbench/AGENTS.md`, README du workbench, éventuel `project.yaml` à décider | Contrat minimal documenté ; validation stricte ; ancien Kanban préservé ; aucun secret ou chemin personnel ; test d’un projet exemple | Toute migration de format demande sauvegarde, compatibilité rétroactive et revue |
| GYM-PLAT.3 | Extraire/réutiliser un adaptateur Kanban local en lecture seule | PLAT.2 | `task-context.mjs`, tests associés, `backlog.json` | Lookup ID, prochaine tâche admissible, dépendances, aucun prêt, schémas invalides, tests sans écriture, taille de sortie configurable si justifiée, compatibilité des anciennes tâches ; pas de lecture globale par LLM | Ne généraliser que si le contrat ajoute une capacité mesurable sans casser l’atelier |
| GYM-PLAT.4 | Fournir des consignes minces Codex/Claude Code pour le même flux | PLAT.2 | `AGENTS.md`, `CLAUDE.md` éventuel, docs d’usage | Les deux environnements renvoient au même contrat ; commandes et limites vérifiées ; aucun doublon de règles divergentes | Vérifier la documentation officielle et les versions au moment du ticket |
| GYM-PLAT.5 | Formaliser reprise, preuve et checkpoints Git par tâche | PLAT.3, PLAT.4 | `docs/ETAT_REPRISE_COURANT.md`, tests, scripts existants | Reprise après interruption démontrée ; lien ticket→preuve→SHA ; rollback ciblé testé sur fixture ; pas de reset global | Commit/push dépendent des protections et de la branche ; déploiement toujours séparé |
| GYM-PLAT.6 | Définir la matrice de permissions, validations humaines et observabilité locale | PLAT.2 | `AGENTS.md`, procédures sécurité, outillage de tests | Refus par défaut des actions hors allowlist ; journal sans secret/contenu ; tests des refus et approbations ; mesures qualifiées comme réelles ou proxies | Les accès externes/compte utilisateur requièrent configuration et validation du propriétaire |
| GYM-PLAT.7 | Prouver la portabilité sur un second projet local non sensible et comparer les assistants | PLAT.3–PLAT.6 | Fixture synthétique/temporaire et adaptateurs | Même tâche récupérée et reprise ; aucune donnée GYM lue ; parité de contrôles Codex/Claude observée ; mesure du contexte par octets seulement si utile | Deuxième projet et assistants disponibles à confirmer ; aucun accès aux dossiers personnels en masse |
| GYM-PLAT.8 | Décider si un orchestrateur/LLM/RAG apporte un gain net et préparer une version réutilisable | PLAT.7 | Prototype et rapports comparatifs | Comparaison contre la baseline déterministe : qualité, reprises, latence, tokens si compteur réel, surface de risque, coûts/licences ; adoption seulement sans régression démontrée | LangGraph/LangChain/services peuvent introduire coût et maintenance ; toute installation ou service distant reste optionnel et autorisé |

### Ordre proposé et sprints

- **S6 — Contrat et adaptateurs (23–27 novembre, proposition)** : PLAT.2, puis PLAT.3 et PLAT.4 si les critères du contrat sont validés. Sortie : lecture et instructions portables sans migration métier.
- **S7 — Fiabilité et gouvernance (30 novembre–4 décembre, proposition)** : PLAT.5 et PLAT.6. Sortie : reprise vérifiable, garde-fous testés, journal sans contenu sensible.
- **S8 — Preuve de réutilisation et décision d’outillage (7–11 décembre, proposition)** : PLAT.7 puis PLAT.8. Sortie : preuve sur second projet ou décision documentée de ne pas généraliser ; aucune adoption d’un framework par défaut.

Capacité supposée pour la planification : un exécutant séquentiel, pas une équipe d’agents actifs. Chaque charge Kanban reste une estimation et doit être recalibrée après le premier prototype. Une seule validation lourde à la fois. Le périmètre dépasse un lot ; la suite doit reprendre ticket par ticket.

## Premier lot réellement effectué

Ce lot est limité à la lecture visuelle de la conversation, à la revue ciblée des documents maîtres et de l’état de travail existant, puis à ce cadrage. Aucune fonctionnalité métier, dépendance, base de données, RAG, agent ou service n’a été ajouté. Le plan et les tickets proposés constituent une préparation ; les tickets planifiés ne sont pas déclarés exécutés.

Contrôles exécutés : suite Node de l’atelier **41/41 PASS** ; `--ticket GYM-PLAT.2 --details` expose PLAT.1 comme dépendance terminée et PLAT.2 au backlog ; `--next` conserve `no-ready-ticket` ; backlog valide avec 96 tickets (87 préexistants + 9 GYM-PLAT), 8 sprints, identifiants et dépendances résolus. Playwright local sur l’interface existante : HTTP 200, cartes PLAT visibles à 1 440 px et 390 px, aucune erreur de page ni débordement horizontal. Preuves machine : `docs/assets/agentic-platform-plan-2026-11-13/verification.json`. Aucun parcours métier, RAG, base, framework ou service distant modifié.

## Conditions de reprise

Au début de chaque lot, vérifier le dépôt, la branche, les modifications locales et l’état distant ; lire ce document par section et le relais courant, puis récupérer la tâche avec `node tools/agentic-workbench/task-context.mjs --ticket ID` et `--details` si nécessaire. Ne pas compter une carte locale comme preuve. Arrêter au premier lot contrôlé si le contexte disponible ne permet plus de vérifier correctement ; mettre alors à jour le relais court avec les résultats, preuves, blocages, branche/SHA et prochaine action. Aucun compteur de tokens ou de crédits n’est inventé.
