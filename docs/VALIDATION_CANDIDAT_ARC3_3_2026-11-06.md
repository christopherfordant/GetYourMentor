# ARC3.3 — validation du candidat après extraction des prototypes

## Résultat du 6 novembre 2026

**Build Next isolé réussi**, contrôle TypeScript inclus. Les six fichiers extraits ne sont plus servis par le candidat : quatre HTML et deux fichiers du comparatif de carrousels répondent **404**. Les **110 fichiers publics conservés** répondent **200**, avec un contenu SHA256 identique à l'inventaire avant rangement. Le manifeste de build servi correspond bien au candidat construit.

ARC3.3 et le parent ARC3 sont terminés dans ce périmètre local : inventaire ARC3.1, extraction ARC3.2 et validation ARC3.3. Aucun déploiement ou validation de production commerciale n'est revendiqué.

## Isolation et reproductibilité

La copie est créée sous `delivery-private/arc33-candidate-*`, avec les sources actuelles de `gym-next`, sans `.env`, clés de service ni copie du build d'origine. Les dépendances existantes sont réutilisées ; aucun paquet installé. Les 92 sources TypeScript archivées restent présentes dans le candidat et exclues par la configuration actuelle, sans masquer les sources actives.

Le candidat inclut les brouillons préexistants du workspace pour représenter son état réel. Leur présence dans une recette réussie ne vaut pas approbation, commit ou déploiement de tous ces changements. Les 18 fichiers antérieurement modifiés sont préservés et exclus du commit de ce lot. Aucun code applicatif ou fichier public n'a été modifié ici.

L'environnement ne reprend pas les clés des sessions connectées. Paiement local, fixtures de démonstration et secret de session éphémère. Un garde des accès HTTP de haut niveau autorise seulement le loopback et les GET/HEAD des polices publiques Google nécessaires au build ; il ne constitue pas une sandbox système. Aucun accès aux services métier Supabase, Stripe ou Telegram. Le contrôle navigateur complémentaire refuse les origines externes.

Commandes depuis la racine, avec Node et les dépendances déjà disponibles :

```powershell
node tools/public-assets/validate-candidate.cjs
node tools/public-assets/serve-candidate.cjs
```

La seconde commande reste au premier plan sur `127.0.0.1:3006`. Elle refuse un candidat hors du dossier attendu et n'arrête pas un éventuel service occupant ce port. Dans un autre terminal :

```powershell
node tools/public-assets/check-candidate.mjs
node gym-next/node_modules/@playwright/test/cli.js test -c tools/public-assets/application.config.cjs
```

Le serveur temporaire de cette recette a été arrêté après vérification ; le candidat reste privé pour réouverture. Les aperçus statiques précédents et les processus de provenance différente ne sont pas arrêtés. Aucun nouveau workflow automatique de build ou de publication ajouté.

## Contrôles réalisés

| Contrôle | Résultat et portée |
|---|---|
| Build Next et TypeScript | PASS dans la copie isolée ; `.next` d'origine non utilisé comme destination |
| Identité du serveur testé | Manifeste `_buildManifest.js` du BUILD_ID téléchargé et comparé aux octets du candidat |
| Ressources conservées | 110 GET réels, statuts 200 et SHA256 identiques |
| Fichiers extraits | Six GET réels, statuts 404 |
| Chemins internes représentatifs | Guide/manifeste des prototypes, outil et document governance : quatre 404 |
| Frontière des secrets client | Contrôle existant PASS sur les chunks du candidat ; pas une recherche exhaustive de tout secret possible |
| Régressions Playwright applicatives | Six scénarios PASS : captures accueil/annuaire desktop/mobile, mouvement réduit, arrivée du header et liens, menu Sports mobile, ouverture 3D complète 2 200 ms |
| Parcours complémentaire | Accueil avec éventail de neuf entrées de démonstration, navigation au-delà d'un tour, annuaire football puis fiche réellement liée ; ordinateur/mobile |
| Navigateur complémentaire | Images de fiche chargées, pas de débordement horizontal de fiche, erreur JavaScript, réponse en échec ou requête externe observée |
| Kanban | 35 tests PASS et contrôle desktop/mobile en contexte vierge ; parent ARC3 et ses trois enfants terminés |

Preuves : [build.json](assets/prototype-candidate-2026-11-06/build.json), [http-assets.json](assets/prototype-candidate-2026-11-06/http-assets.json), [browser.json](assets/prototype-candidate-2026-11-06/browser.json), [checks.json](assets/prototype-candidate-2026-11-06/checks.json) et captures dans le même dossier. Les captures de cette recette n'écrasent pas les preuves historiques.

La préparation initiale du build réutilisait une liste locale des archives ; sa collecte a ensuite été rendue autonome dans l'outil livré. Une comparaison a confirmé les mêmes 92 sources copiées, sans relancer inutilement le même build. Le mode de démarrage livré a également été exécuté et l'identité HTTP contrôlée à nouveau.

## Limites et prochaine priorité

Le build émet des avertissements CSS non bloquants de compatibilité Autoprefixer (`start` / `flex-start`) et de cache Webpack ; aucun correctif de style sans rapport avec le rangement n'a été ajouté. Cette recette ne couvre ni tous les sports, tous les liens ou navigateurs, ni les comptes connectés, inscriptions, réservation ou paiement distant. La disponibilité des pages Netlify n'a pas été inspectée.

Les démonstrations restent consultables via leur serveur local dédié, selon [prototypes/README.md](../prototypes/README.md). La suppression de leur exposition dans le candidat n'affirme pas qu'un ancien déploiement les a déjà retirées.

Prochaine priorité recommandée : **ARC-04**, index des documents actuels, historiques et copies, avec matrice des contrôles CI réellement déclenchés. Ce chantier documentaire doit préserver les sources et les décisions actives ; aucune reprise d'agent, migration ou autorisation de production implicite.
