> **Décision utilisateur actuelle :** REA sert principalement à comprendre des mécanismes externes autorisés. Playwright pilote et teste les interfaces. Aucun couplage systématique ni utilisation obligatoire de REA à chaque lot. Le nom historique de ce fichier reste conservé pour ses liens ; le pilote sur notre code décrit ci-dessous était une analyse interne, pas une investigation externe.

# REA et Playwright — rôles distincts et historique du 17 octobre 2026

## Catalogue de compétences REA — décision utilisateur du 18 octobre 2026
REA ne réalise pas à lui seul les métiers du projet. Il aide à investiguer des logiciels et des mécanismes externes autorisés ; les constats doivent devenir des exigences originales puis des tests. Cette table est une aide documentaire à la sélection, pas une orchestration exécutable, une installation ou une promesse de gain.

| Problème / déclencheur | Recours à REA et état de preuve | Preuves demandées | Outils complémentaires | Validation / limites |
|---|---|---|---|---|
| Mécanisme d’écriture conditionnelle/concurrence d’un SDK accessible et licencié | Pertinent si documentation/code ne suffisent pas ; essai externe @netlify/blobs déjà documenté | Version/empreintes, sources/relations, hypothèses, cas conflit/répétition/échec, résultats reproductibles | Lecture SDK, tests contractuels avec fetch factice, puis recette intégrée autorisée | Test hors ligne ≠ service Netlify ; pas de charge ni clé réelle sans périmètre |
| Graphe de modules, dépendances ou chemin de données difficile à comprendre | Analyse statique : pilote interne historique, pas preuve d’exécution ; usage externe à qualifier par cible | Fichiers exacts, relations et zones non résolues, lien entre symptôme et mécanisme | rg, revue de code, tests unitaires/intégration | Aucun code privé transmis à un service externe ; ne pas déduire les droits serveur du graphe |
| Réservation, annulation ou abonnement d’un logiciel de référence | Étude conditionnelle ; aucune capacité tierce validée par cette table | Droit d’étude, scénario, observations séparées des hypothèses, mécanisme serveur inconnu explicitement | Documentation publique, Playwright sur périmètre autorisé, tests de notre implémentation | Pas d’accès implicite à un compte tiers, contournement ou copie protégée ; décision commerciale humaine si absente |
| Paiement, webhook, reprise après coupure | Utiliser seulement pour une question externe précise ; garanties actives à vérifier dans notre serveur | Ordre des événements, identifiants masqués, invariants financiers, cas dupliqué/hors ordre/échec | Tests API/intégration, simulateurs locaux, Playwright pour retour utilisateur | Aucun paiement/remboursement réel ; garder idempotence et snapshots ; preuve UI ≠ preuve bancaire |
| Contraste, débordement, focus, menu ou composition responsive | REA généralement inutile : question visuelle déjà couverte | Route/rôle/viewport, captures, styles calculés, reproduction et contrat concerné | Playwright, DOM/CSS, clavier, revue visuelle | Pas de changement de direction validée sans arbitrage ; émulation ≠ appareil réel |
| Exécutable, protocole ou mécanisme inaccessible aux outils testés | Capacité NON QUALIFIÉE dans ce projet ; pas de lancement par défaut | Autorisation explicite, licence, outil/version requis, périmètre, données et risques | Documentation et inspection autorisée ; alternative légère | Aucun moteur binaire/traceur/privilège installé ; demander l’autorisation manquante |

### Protocole de sélection et de preuve
1. Énoncer une question et vérifier si documents, rg, code et tests existants suffisent. Si oui, ne pas lancer REA.
2. Vérifier cible, droits, provenance/licence, versions, données autorisées et outils réellement disponibles. Seules les commandes précédemment testées sont qualifiées ; installation présente ≠ service actif.
3. Fixer un périmètre court de fichiers/scénarios, une borne de temps/itérations et un résultat attendu adaptés aux 8 Go. Aucun budget de tokens précis sans indicateur fiable.
4. Dans le rapport existant du lot : cible/version/source, droit, hypothèses, commande/outils, observations et inconnues, empreintes, état de sortie, coûts réellement mesurés ou inconnus. Matrice mécanisme → exigence GYM → risque → test → preuve.
5. Confronter l’analyse aux tests et aux observations ; ne pas inventer l’algorithme serveur. Réutiliser les scénarios/contrats existants ; capitaliser seulement les leçons vérifiées, datées et révocables.
6. Arrêter si droits absents, source sensible, capacités non qualifiées, boucle sans preuve nouvelle ou coût disproportionné. Continuer les travaux indépendants avec une alternative légère. Demander uniquement l’autorisation/décision indispensable.

Pas de nouvelle investigation externe exécutée dans ce lot. Pas de comparaison de gain avec/sans REA mesurée : la valeur du catalogue reste à évaluer sur une question concrète. PDF d’origine : `sources/Prompt_Maitre_Codex_REA_UIUX_GetYourMentor.pdf`, p.1–2 droits/capacités, p.3–4 UIUX/mémoire/pipeline, p.5 livrables ; les listes de livrables s’adossent aux fichiers existants, sans duplication de registres.

## Historique des essais — ne vaut pas disponibilité actuelle

## Périmètre et sources officielles
REA identifié : [morluto/rea](https://github.com/morluto/rea), site [rea.tools](https://rea.tools/), paquet npm `rea-agents@6.5.0`. Homonymes et forks non utilisés. Licence MIT vérifiée dans LICENSE et paquet ; provenance repository conforme. Documentation [JavaScript](https://github.com/morluto/rea/blob/main/docs/javascript-application-workflows.md), [README](https://github.com/morluto/rea/blob/main/README.md) et manifest package consultés le 17 octobre. Version npm relevée 6.5.0 ; la documentation main peut décrire des fonctions plus récentes, seules les commandes testées sont revendiquées utilisables. Le projet évolue ; version épinglée, pas de mise à jour automatique.

## Répartition et cas concret
Question : comment le retour privé devient-il une suggestion partageable et un vote, sans fuite du message original ?
REA analyse statiquement les modules/types/imports et relations syntaxiques de notre propre code. Playwright pilote le navigateur et vérifie l’envoi, le traitement administratif et la lecture réellement autorisée. La première preuve ne remplace pas la seconde : une relation statique n’atteste pas d’exécution ni de conformité des permissions.

Entrées REA : copie locale bornée de `lib/feedback.ts`, `app/api/feedback/route.ts`, `components/BetaFeedback.tsx`, avec package.json/tsconfig comme contexte, sans .env, session, base ni document privé. Les trois sources sont sélectionnées explicitement ; les dépendances externes ne sont pas incluses. Résultat détaillé local : `gym-next/rea-feedback-evidence.json`. Résumé expurgé et empreintes : `assets/retours-beta-2026-10-17/rea-summary.json`. Ne pas imprimer le graphe brut : il est volumineux et peut contenir des littéraux de code.

L’analyse relève des candidats liés aux champs `published`, `publicTitle`, `publicSummary`, `status`. Les candidats à faible confiance issus de FormData.get ne sont pas des endpoints réseau prouvés. Le contrôle manuel et les tests ciblent donc le passage de modération, la projection publique explicite et les droits serveur, au lieu de transformer ces candidats en défauts certains. Les fetch construits dynamiquement et imports non inclus restent partiellement résolus.

Les tests Playwright doivent établir : utilisateur étranger sans accès au texte privé ; publication uniquement par admin ; partage du résumé relu plutôt que texte initial ; unicité sous vingt demandes concurrentes d’un même compte ; envoi après réponse perdue sans doublon ; erreurs et rendu mobile. Les résultats finaux sont dans `RETOURS_BETA_2026-10-17.md`. Cette chaîne constitue l’essai complémentaire borné ; aucune comparaison de gain qualité/coût avec un audit sans REA n’a été mesurée.

## Installation, ressources et effets
Installation réversible hors application : `C:/Users/cashe/Documents/GYM-tooling/rea-6.5.0`. Commande employée : `npm install --prefix <dossier-isolé> --ignore-scripts --no-audit --no-fund rea-agents@6.5.0`. 173 paquets, 46 s selon npm ; aucun paquet ajouté au package.json/lock de GetYourMentor. npm a signalé une dépendance transitive dépréciée (prebuild-install) ; scripts désactivés, aucune compilation native exécutée ni vulnérabilité absente prétendue.
Node observé : 24.14.0, dans les engines publiés (^22.19 || ^24.11 || >=26). CLI `--version` et `analyze-javascript-application --help` exécutées. Aucun moteur Hopper/Ghidra/IDA, navigateur REA, service distant, clé ou abonnement requis pour cet essai statique. D’autres modes ont leurs propres prérequis et n’ont pas été testés.

Budget analyseur : heap V8 256 MiB, 2 500 nœuds sémantiques maximum, 20 s par source. Ce plafond ne borne pas toute la RAM du processus parent ; pic RAM/CPU non mesuré. Installation CLI locale seulement : pas de setup, MCP REA ou skill enregistré dans Codex, pas de sous-agent. Les appels REA passent par la CLI ; Playwright MCP reste séparé. L’enregistrement MCP permanent reste une opération distincte à vérifier via la documentation actuelle de Codex avant configuration.

Un premier lancement a été interrompu pour séparer l’analyse du build encore actif ; il ne sert pas de preuve. Le lancement complet ultérieur a été capturé par subprocess Python pour conserver le vrai code de sortie, car la progression stderr peut être présentée comme erreur par PowerShell. Reproduction et chiffres finaux dans rea-summary.json. Aucun code de GetYourMentor exécuté par REA pendant l’analyse statique. Pas de document envoyé à un service externe par cette analyse ; seuls les paquets et docs officiels ont été téléchargés.

Désinstallation éventuelle : vérifier le chemin absolu exact du dossier isolé et l’absence de processus qui l’utilisent, puis supprimer uniquement ce dossier si souhaité. Aucune suppression effectuée. Pas de configuration globale à restaurer ; cache npm partagé laissé intact.

## Playwright MCP et limites
MCP a ouvert la maquette par HTTP local et effectué le passage à 390 px. file: était refusé ; le serveur statique propriétaire a été arrêté. L’appel evaluate suivant est resté sans réponse et a été interrompu : aucune mesure ni capture issue de cet appel n’est revendiquée. Un favicon 404 est la seule erreur console observée à l’ouverture de la maquette.
Les recettes applicatives utilisent les dépendances Playwright existantes, un worker et le serveur de test géré par le harness ; ce fallback est identifié, pas présenté comme une exécution MCP. Les captures et mesures finales doivent être vérifiées dans le rapport du lot.

## Investigation externe distincte — offres du 17 octobre 2026

Paquet MIT @netlify/blobs 11.1.4 réellement examiné avec REA pour comprendre les écritures conditionnelles. Analyse statique de deux sources et cinq contrôles locaux avec fetch factice, aucune requête au service Netlify. Détails, droits, provenance, mécanisme et limites dans [OFFRES_ABONNEMENTS_DEMO_2026-10-17.md](OFFRES_ABONNEMENTS_DEMO_2026-10-17.md). Ce cas externe ne transforme pas l’ancien pilote sur notre code en investigation externe, et ne rend pas REA obligatoire pour les autres lots.
