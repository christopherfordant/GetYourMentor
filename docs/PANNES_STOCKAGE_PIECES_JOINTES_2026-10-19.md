# Pannes et compensations des pièces jointes — 19 octobre 2026

## Reprise et périmètre
Base locale/distante vérifiée `16823758709c0a7ae6ccbed7e391254264ffd8e0`, branche `design/refonte-progressive-lot1`. Candidat isolé `GYM-message-file-faults`, modifications antérieures préservées. Lecture progressive : AGENTS, hiérarchie active BRANCH_STRATEGY, préambules maître/index, relais, index des sources et rapports pièces jointes/qualification. Aucun PDF prétendu relu intégralement ni nouvelle règle commerciale tirée d’une archive.

Lot strictement limité aux échecs du stockage, écritures conditionnelles, concurrence et compensations du TXT existant. Formats/64 Kio, droits, interface, commission 15 % et historiques inchangés. Pas de purge, politique de conservation, outil d’administration, nouvelle infrastructure ou fournisseur.

## Défauts reproduits puis corrigés
| Défaut | Preuve avant correction | Correction |
| --- | --- | --- |
| Le résultat du `set(..., onlyIfNew:true)` était ignoré | Objet déjà présent avec les mêmes octets : le double retourne `modified:false`, mais le code confirmait le message | Exiger `written.modified === true` ; sinon erreur explicite et marqueur conservé, sans supprimer l’objet préexistant |
| Une chaîne d’erreur décidait d’une compensation destructive | Message réellement enregistré puis réponse perdue avec le même texte qu’un conflit métier : les octets liés étaient supprimés | `MessageConflictError` émis par la validation métier ; seule cette classe autorise la compensation. Un message fournisseur identique reste une erreur technique incertaine |

Le POST traduit désormais cette même classe métier en 409. Une erreur technique portant son texte ne devient plus artificiellement un conflit. Le chemin 502/relecture existant reste applicable. Aucun changement de texte/interface nécessaire.

Contrat SDK inspecté **localement** dans `@netlify/blobs/dist/main.d.ts`, types CreateOnlyOptions/UpdateOnlyOptions/WriteResult : une écriture conditionnelle peut résoudre sa promesse avec `modified:false`, sans ETag de modification. Rien n’est déduit d’un simple await réussi.

## Points d’injection limités
Les fonctions existantes acceptent un fournisseur serveur optionnel pour les tests : read/mutate du document, opérations binaires. Sans injection, elles utilisent les mêmes contrôles d’environnement et le fournisseur existant. Aucune variable activant un faux service, route HTTP de test ou option client permettant d’injecter un fournisseur.

Le moteur de messages, le CAS et les fonctions de compensation restent uniques : les tests appellent ces fonctions réelles avec un double des seules opérations du SDK. Pas de copie parallèle du calcul métier. Le double n’instancie pas le SDK, ne possède ni fetch, URL distante ni identifiant ; états/octets sont copiés, ETags évalués, refus conditionnels matérialisés par `modified:false`.

## Scénarios et invariants
23 scénarios exécutés dans les deux configurations du projet (46 tests sans navigateur/serveur applicatif pour cette campagne) :
- échecs avant/après écriture de préparation ou d’octets ; absence/corruption à la relecture ;
- refus conditionnel binaire, huit refus de commit épuisant les tentatives, puis conflits récupérables avec relecture fraîche ;
- échec avant commit, commit réel suivi d’une réponse perdue, erreur technique imitant le texte du conflit ;
- répétition d’un envoi confirmé, concurrence identique, conflit de texte/fichier/conversation parent dans le périmètre de clé existant ;
- compensation réussie, suppression refusée ou effectuée avec réponse perdue, échec du retrait du marqueur ;
- reprise après écriture binaire incertaine et compensation de doublon/conflit concurrent.

Assertions : un seul message pour des tentatives identiques, octets liés conservés après résultat incertain, objet inutilisé compensé seulement sur chemin certain, marqueur maintenu si le résultat reste inconnu, aucune charge binaire base64 dans le document global. Une préparation abandonnée après écriture incertaine peut rester privée et suivie : aucun nettoyage fondé sur son âge n’est ajouté.

Les deux défauts donnaient **4 échecs sur 38 exécutions** avant correction (deux scénarios dans deux configurations). Après correction et ajout de cas de concurrence/compensation, **46/46** passent. Les premières campagnes ne sont pas additionnées aux résultats finaux.

## Régressions et niveaux de preuve
Résultats finaux et empreintes : `assets/message-file-faults-2026-10-19/verification.json`.
- Doubles déterministes : branches de stockage hébergé/CAS exécutées par injection locale. Ce ne sont **pas** des appels ou une validation du fournisseur hébergé.
- Parcours intégrés locaux : stockage mémoire réel, API/auth/permissions/déduplication, refus de formats, reprise explicite du formulaire après réponse incertaine et panne de lecture. Les injections HTTP du test de formulaire restent distinguées des écritures locales réelles.
- Interface inchangée : aucune nouvelle campagne visuelle complète ni nouvelle capture livrée. Captures et preuves visuelles du lot précédent restent référencées dans `PIECES_JOINTES_DEMO_2026-10-19.md`.
- Build, typage et frontière client/serveur locaux ; contrôle Netlify statique seulement. Aucune recette distante de persistance, RLS, Stripe ou antivirus. Pas de connexion Netlify/Supabase, installation, document privé envoyé, ni agent/REA/Web utilisé.

## Limites qui demeurent
Sans transaction multi-objet, un objet préparé et son message ne sont pas commités ensemble. La vérification des octets précède la confirmation, mais ne garantit pas qu’un fournisseur ne les perde pas ultérieurement ; le téléchargement continue de vérifier existence et intégrité. Une panne de lecture/commit peut donc laisser un objet sans message ou un message confirmé côté stockage sans réponse client : réconciliation par relecture, jamais suppression aveugle.

Les marqueurs incertains ne sont pas purgés automatiquement. La rétention et les coûts réels restent à qualifier ; la démo locale reste en mémoire jusqu’à arrêt du processus. Les tests de double ne prouvent ni la fidélité de toutes les caractéristiques du service ni la persistance entre déploiements/instances. TXT uniquement, sans antivirus.

## Livraison et suite
Commit/push ciblés sur la branche existante, SHA distant à vérifier après livraison ; aucun déploiement, paiement, abonnement ou notification externe. Retour arrière : revert ciblé après inspection des références de fichiers ; ne pas supprimer les objets/historiques ni restaurer une compensation décidée par simple texte d’erreur.

Prochaine action proposée : préparer une recette distante minimale (sites/accès, budget, données synthétiques, scénario et retour arrière), puis ne l’exécuter qu’avec l’autorisation applicable ; sinon sélectionner un autre lot métier indépendant du stockage distant. Ne pas refaire cette campagne ou étendre les formats sans nouveau besoin démontré.

Résultats définitifs : **46/46** exécutions avec doubles, **6/6** parcours locaux ciblés des fichiers, **6/6** refus de formats et **4/4** régressions API texte/structure, soit **62 exécutions réussies**. Build, typage explicite, frontière client/serveur, configuration Netlify statique et Fil Rouge conformes. Aucune capture visuelle nouvelle ou validation distante.
