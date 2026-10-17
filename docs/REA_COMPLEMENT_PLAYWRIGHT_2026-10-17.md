> **Décision utilisateur actuelle :** REA sert principalement à comprendre des mécanismes externes autorisés. Playwright pilote et teste les interfaces. Aucun couplage systématique ni utilisation obligatoire de REA à chaque lot. Le nom historique de ce fichier reste conservé pour ses liens ; le pilote sur notre code décrit ci-dessous était une analyse interne, pas une investigation externe.

# REA et Playwright — rôles distincts et historique du 17 octobre 2026

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
