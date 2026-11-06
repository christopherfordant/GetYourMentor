# TS1 — périmètre TypeScript actif, 6 novembre 2026

## Correction

Le `include` large de `gym-next/tsconfig.json` sélectionnait aussi les anciennes copies de code dans `gym-next/playwright-artifacts`. Ces copies ne sont pas des composants actifs : elles conservent d'anciennes signatures et des imports de fichiers disparus. Elles produisaient 20 diagnostics sans rapport avec le correctif ARC1.

Modification unique de configuration : ajouter `playwright-artifacts` à `exclude`, en conservant `node_modules`. Aucun déplacement, suppression ni réécriture des archives ; aucune modification du code métier. Les commandes npm, le mode strict, les options du compilateur et le `include` restent identiques.

`exclude` ne constitue pas une frontière de sécurité : TypeScript peut toujours charger un fichier exclu s'il est importé par une source active. Le programme compilé a donc été examiné également : il ne contient aucun fichier d'archives. Les références à `playwright-artifacts` observées dans les tests/scripts sont des chemins de sortie de captures, pas des imports d'anciens composants.

## Contrôles réellement exécutés

- Même compilateur TypeScript et configuration initiale conservée localement : **20 erreurs avant, zéro après**.
- Racines de compilation : 470 avant, 378 après ; les **92 seules racines retirées** sont sous `playwright-artifacts/`. Les sources actives, tests et types Next générés restent couverts.
- Options du compilateur et `include` comparés : inchangés.
- Erreur volontaire fournie seulement en mémoire dans une source active : diagnostic TS2322 bien détecté. Aucun fichier fautif écrit sur disque. La correction ne désactive pas le contrôle des erreurs actives.
- Commande réelle **`npm run check:types` réussie**, avec le tsconfig corrigé, sans adaptation du lanceur.

Résultats : [compiler.json](assets/types-scope-2026-11-06/compiler.json). Contrôles de préservation et résultat du build dans le même dossier. Scripts d'analyse et journaux détaillés conservés dans `delivery-private`, hors Git.

## Build isolé et limites

Un snapshot local des sources courantes, des tests et des 92 fichiers d'archives a été créé dans `delivery-private/types-build-*`. Les dépendances déjà installées sont réutilisées, sans installation. Aucun fichier `.env` ni coffre n'est copié ou chargé. Le répertoire `.next` original et les éventuels serveurs existants ne sont pas remplacés.

Un premier essai sans HTTPS externe a bloqué sur la récupération de Manrope par `next/font`. Ce n'est pas une erreur TypeScript. L'essai suivant autorise uniquement les lectures publiques Google Fonts et loopback ; les hôtes de services métier restent bloqués et aucun accès Supabase/Stripe/Telegram n'est configuré. Télémétrie désactivée, session locale éphémère, fournisseur de paiement local, données de démonstration.

Le snapshot reflète le dossier courant, y compris les modifications antérieures conservées. Il ne transforme pas ces modifications en livrables approuvés et ne prouve pas l'état de Netlify. Le résultat final du build est consigné dans [build.json](assets/types-scope-2026-11-06/build.json) ; le premier blocage est conservé séparément dans `build-initial-offline.json`.

**Résultat final : build Next réussi, BUILD_ID généré, code de sortie 0.** Le contrôle existant de frontière des secrets dans les bundles client réussit également sur ce build isolé. Aucun serveur applicatif lancé et aucun déploiement effectué.

## Suivi et reprise

Ticket dédié **GYM-TS1** et quatre sous-tickets : diagnostic, exclusion ciblée, contrôles, documentation/livraison. Ne pas confondre avec la recommandation ARC-02 sur l'orchestration. Estimations proposées, temps réel non mesuré, aucun agent supplémentaire. Les tickets existants ne sont ni rouverts ni clôturés par cette correction.

Parent et quatre enfants terminés après contrôles. Les 35 tests de l'atelier/Kanban passent ; affichage vérifié par Playwright sur ordinateur et mobile en contextes neufs, sans modifier les brouillons personnels. H1 reste en cours et A5 en backlog. [Preuves du tableau](assets/types-scope-2026-11-06/kanban.json).

Retour arrière : retirer la seule entrée d'exclusion du tsconfig ; les archives restent en place et les erreurs historiques réapparaîtront. Aucune opération sur des données ou migration nécessaire.

Prochaine priorité locale recommandée : inventorier et clarifier les scripts d'orchestration actifs/historiques (ARC-02), avant une éventuelle extension agentique. A5, la relecture humaine des annotations RAG et la recette distante H1.2.3 restent des travaux distincts. Aucun déploiement ou nouveau paiement ne découle de cette livraison.
