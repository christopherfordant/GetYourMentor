# Observateur privé d’un message synthétique — 19 octobre 2026

## Périmètre et résultat
Base Git/distant `c776aa48a9d07e7f9fde74ff04b319da56b4215f`, branche `design/refonte-progressive-lot1`, candidat isolé `GYM-private-message-observer`. Évaluateur pur et adaptateur à lecture injectée uniquement, sans fournisseur, route, CLI, installation ou variable d’activation. Aucun stockage distant, déploiement ou fichier utilisateur lu.

Sources de reprise : AGENTS/BRANCH_STRATEGY et priorités actives, préambules maître/index, relais, index des sources, procédure hébergée et son plan, rapports TXT et pannes. Lecture progressive, aucune prétention de relecture exhaustive des PDF. Réemploi du type Message et du validateur MessageAttachment ; aucun second moteur ou agent.

## Entrées privées et sortie autorisée
Les attentes doivent décrire un seul fixture connu : synthetic:true, runId ASCII [a-z0-9-] de 8 à 48 caractères, requestId recipe-{runId}-message-1, propriétaire @example.com, ID du message/coach, destinataire, rôles, références facultatives, texte synthétique contenant le runId, métadonnées complètes du TXT attendu. Ce sont des contraintes de diagnostic synthétique, pas une nouvelle règle commerciale du chat. Elles ne prouvent pas à elles seules la provenance synthétique : le futur opérateur doit l’attester et appliquer les droits.

La sortie est un nouvel objet figé : status, targetFound, scopeMatched, metadataConformant, unexpectedProperties, payloadDetected, inspectionComplete. Aucun objet d’entrée n’est joint/spread dans le résultat ; ni texte, email, ID, nom de fichier, octets, valeur inconnue, nom de propriété inattendue ou message d’exception ne sort.

Statuts : PASS (schéma/fixture concordants), FAIL (non-conformité constatée), INDETERMINATE (inspection impossible/incomplète), MISMATCH (autre cible/périmètre, non parcouru), NOT_FOUND, REFUSED (attentes/accord invalides) et READ_FAILED (erreur constante). Un constat partiel n’est jamais promu en PASS.

## Inspection et limites exactes
Objets ordinaires/null-prototype et propriétés de données seulement ; aucun getter, fonction ou toJSON exécuté. Descripteurs accesseurs, symboles, objets spéciaux non pris en charge, cycles ou dépassements donnent INDETERMINATE. Les erreurs de réflexion, y compris un Proxy qui lève une exception, ne sont pas propagées.

Attentes et entrée de message/métadonnées : au plus 32 propriétés par objet racine. Champs attendus de Message et cinq champs de MessageAttachment autorisés explicitement. Cible/périmètre comparés avant descente ; wrappers globaux users/messages/reservations/coaches/clubs/pendingMessageFiles refusés, sans parcours de leurs entrées.

Valeurs inattendues : descente ≤4 niveaux, 128 nœuds, 64 propriétés traversées et budget de chaînes conservateur à trois octets par unité UTF-16, limité par MAX_MESSAGE_REQUEST_BYTES. Détection de vues binaires/ArrayBuffer et de chaînes inattendues ayant une forme base64. Cette dernière est un **signal de suspicion**, avec faux positifs possibles ; elle ne décode ni ne certifie le sens du contenu. Les propriétés inattendues sont refusées même sans signal binaire.

Les limites bornent la descente, pas la création initiale d’un objet par le lecteur ni le coût initial d’énumération de ses clés. Le futur lecteur doit imposer sa propre taille maximale et fournir un snapshot JSON ordinaire. Aucun diagnostic général ne peut rendre sûr du code arbitraire exécuté par un Proxy ; les données JSON du fournisseur ne sont pas du code. Un texte autorisé correspondant exactement au fixture peut contenir une représentation encodée : PASS n’est pas une garantie sémantique d’absence universelle d’encodage.

Si inspectionComplete est false, les booléens négatifs restent inconnus/incomplets, pas des certificats d’absence. La conformité des métadonnées signifie validation du contrat et égalité avec les attentes ; elle ne télécharge pas le fichier et ne recalcule pas son empreinte sur le fournisseur. Les étapes D1/D4 de la recette restent distinctes.

## Adaptateur privé non raccordé
observeSelectedMessage exige authorization === true et des attentes valides avant toute lecture. La copie des attentes/métadonnées et le sélecteur sont figés avant l’await ; un changement ultérieur de l’entrée n’altère pas la vérification. Le lecteur injecté reçoit seulement la cible/périmètre nécessaires, jamais une demande de dump global. Il est appelé au plus une fois, sans retry, écriture ou suppression. Une erreur devient READ_FAILED, sans détail original.

Aucun lecteur réel n’est fourni par défaut. Ce port de lecture n’implémente pas l’authentification ni la sélection sûre dans un document réel : le futur raccordement doit les appliquer, protéger les accès, sélectionner un seul message et limiter sa taille sans exposer d’autres entrées. Aucun flag HTTP ou client ne peut activer ce code dans l’application actuelle.

## Vérifications et preuves
Tests exclusivement synthétiques avec lecteur local : conformité, absence/autre cible, métadonnées manquantes/invalides/incohérentes, base64/octet/nested, limites, cycles/getters/toJSON, wrappers globaux, contexte refusé sans lecture, une lecture figée sans écriture/suppression, erreur expurgée et mutation des attentes pendant await. Valeurs sentinelles vérifiées absentes de toutes les sorties sérialisées. Preuves : `assets/private-message-observer-2026-10-19/verification.json`.

Aucune campagne visuelle ou ancienne recette relancée : aucune route, configuration, dépendance, composant ni service métier existant n’est modifié. Les nouveaux modules non raccordés sont vérifiés par tests et typage ; un build de l’application n’apporterait pas de preuve supplémentaire de leur activation. Aucun build ou SDK distant revendiqué.

## Reprise et livraison
Plan distant : seul le champ de disponibilité locale est ajouté, pas les accords/budget/comptes/version ni private_state_observer_ready. Ancien plan conservé octet pour octet et preuve précédente marquée historique. Recette distante NOT_RUN, raccordement privé non actif.

Commit/push ciblés et SHA distant comparé après livraison, sans données réelles ou changements locaux sans rapport. Aucun déploiement, paiement, notification, fusion/force-push ou suppression. Retour arrière par revert ciblé, sans changement des messages/objets historiques.

Prochaine action : revoir le raccordement privé et ses droits/taille/sélection dans le cadre de la recette, sans l’activer avant autorisation, version publiée prouvée, budget et comptes synthétiques prêts ; ou reprendre un lot métier indépendant. Les modules locaux et leurs tests ne valident aucun stockage hébergé.

Résultats finaux : **41 scénarios, 82 exécutions réussies** dans les deux configurations du runner local, typage explicite réussi, imports compilés et absence de raccordement applicatif vérifiés, plan/archives/liens et Fil Rouge conformes. Aucun navigateur/serveur applicatif ou fournisseur lancé pour ces tests.
