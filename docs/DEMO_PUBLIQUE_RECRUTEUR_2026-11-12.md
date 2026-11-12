# Démo publique GetYourMentor — audit et plan de préparation

Date : 12 novembre 2026. Audit documentaire, Git et navigation publique en lecture seule. Aucun déploiement, compte, paiement, notification, migration ou écriture distante n’a été effectué.

## Cible identifiée

Le lien GetYourMentor depuis la page Projets du portfolio mène à `https://getyourmentor-demo-20261014.netlify.app/`. Le portfolio est un site statique, séparé, sans base applicative. L’application actuellement liée est donc la cible à remplacer ou mettre à jour ; le site Netlify `gregarious-fox-fff605` n’est pas la référence déduite du lien du portfolio.

Observation publique du 12 novembre : la page d’accueil annonce une démo non commerciale, cinq profils de démonstration et précise qu’aucune séance réelle ne peut être réservée. `https://getyourmentor-demo-20261014.netlify.app/demo` répond HTTP 404. La page publiée ne fournit donc pas aujourd’hui un guide testable des deux parcours.

## Environnements et stockage

| Cible | Constat vérifié | Conséquence |
|---|---|---|
| Portfolio | Site statique, lien externe vers la démo GetYourMentor | Aucune « base du portfolio » à adapter ; son lien pourra rester inchangé si la démo publique cible est correctement mise à jour. |
| Démo liée `getyourmentor-demo-20261014` | Site public distinct ; la route `/demo` est absente du déploiement observé | Ne pas considérer les préparatifs locaux comme publiés. |
| `getyourmentor-preprod` (`pqxqqbwesfrefzjoawmx`) | Projet Supabase de recette référencé par un autre site Netlify déclaré en mode production dans l’audit courant | Ne pas ouvrir ce projet aux recruteurs ni changer ses variables ou données pour cette demande. |
| Candidat local dans le dépôt source | `isHostedDemo()` refuse Supabase, Stripe et les clés mail ; stockage de démonstration prévu via Netlify Blobs. La page locale `/demo` présente des identifiants partagés. | Bonne isolation fournisseur pour une démonstration temporaire, mais insuffisant pour l’objectif demandé de données privées par testeur, effacement autonome et base Supabase. Le candidat n’a pas été déclaré vérifié ni publiable. |

Le contrôle `/api/health` de l’ancienne version Netlify annonce essentiellement la présence de variables ; ce résultat n’établit pas qu’une lecture métier Supabase fonctionne. Aucun accès aux tables ou contrôle RLS distant n’a été effectué dans cet audit.

## Contrôles exécutés dans ce lot

- Playwright sur le site lié : accueil chargée ; texte de démonstration consulté ; `/demo` retourne HTTP 404.
- `npm run check:types` depuis `gym-next` sur le checkout principal : PASS (code retour 0). Ce contrôle couvre les fichiers présents dans le checkout, y compris les brouillons locaux ; il ne valide pas leur publication ni les services distants.
- `node --test tools/agentic-workbench/tests/*.test.mjs` : 35/35 PASS après correction du rôle Kanban aux valeurs du schéma (`Securite`).
- JSON du Kanban : parse valide, identifiants uniques et dix tickets GYM-D1 présents ; `git diff --check` : PASS.

Aucun parcours métier n’a été exécuté de nouveau dans ce lot. Les preuves historiques de recette restent limitées à leurs environnements et ne qualifient pas le site public actuel.

## Parcours et écarts

| Élément | Affirmé / observé | Preuve disponible | Travail restant |
|---|---|---|---|
| Coach et sportif | La page publique propose une démo non commerciale, mais interdit la réservation réelle. | Inspection Playwright de l’accueil public ; réponse 404 de `/demo`. | Donner à chaque visiteur un espace isolé, permettre les deux parcours sans comptes partagés et vérifier les données. |
| Demande puis acceptation | Recettes antérieures attestent des demandes réelles en environnement de recette après approbation administrative bornée ; cela ne prouve pas le candidat public. | `docs/CONNECT_PARCOURS_TEST_2026-11-04.md`, section des essais du 5 novembre. | Reproduire de manière explicitement simulée dans un tenant de démo, sans faire passer une acceptation simulée pour la décision d’un coach réel. |
| Paiement | L’application publique actuelle n’annonce pas un débit testable de bout en bout. Le candidat local vise une confirmation simulée ; les recettes historiques Stripe test sont une expérience distincte. | `docs/ETAT_DEMO_2026-10-15.md`, `docs/CONNECT_PARCOURS_TEST_2026-11-04.md`, tests locaux présents. | Isoler un parcours sans Stripe live ni transfert Connect, vérifier les états et éviter tout libellé « paiement effectué » ambigu. |
| Telegram | La recette historique a reçu des notifications sur le bot du propriétaire. Ce n’est pas un consentement générique des recruteurs. | `docs/CONNECT_PARCOURS_TEST_2026-11-04.md`. | Prévoir un consentement Telegram initié par le testeur et un bot dédié/isolé, ou afficher une confirmation dans le site. Pas de message via le bot personnel sans consentement. |
| Effacement | Des opérations de suppression existent pour certains objets métier, mais aucun parcours global de suppression du compte et des données d’un visiteur n’a été démontré. | Recherche ciblée des routes/API et tests. | Implémenter et vérifier l’effacement des données appartenant au seul testeur, avec preuve d’absence de résidus ; conserver les fixtures partagées non personnelles. |
| Coach IA | Aucun moteur IA réellement connecté au parcours public n’a été confirmé. | Documents de recette et code local examinés ; aucune preuve publique. | Nommer l’étape « validation de démonstration simulée » sauf nouvelle intégration et test d’une vraie IA. |

## État Git observé

Le dépôt principal est sur `design/refonte-progressive-lot1`, au SHA `531566485be4829eecb7d0b28421424c3a3049c9`, identique à la référence distante lue durant l’audit. Il contient de nombreux changements suivis et non suivis préexistants, dont des fichiers locaux de parcours démo. Ils ont été préservés ; aucun fichier applicatif n’a été modifié. Le dépôt `GetYourMentor-site` est un export antérieur, pas le dépôt source du site Netlify actuellement lié. Aucun push vers `feat/nextjs-migration` n’est approprié pour cet objectif.

## Décision technique de préparation

Préparer une application de démonstration explicitement publique, mais isolée des données de recette et de toute production métier. Avant toute connexion distante, créer/identifier un projet Supabase dédié à la démo, avec données synthétiques, RLS testée, secrets uniquement côté serveur et une procédure d’effacement par propriétaire de données. Ne pas réutiliser `getyourmentor-preprod` sans décision explicite et audit de son contenu/permissions. Le paiement reste une simulation locale ou Stripe test sans transferts ; Telegram est facultatif, initié et consenti par chaque testeur, avec retour écran si la notification n’est pas disponible.

Les tickets de préparation sont suivis dans `tools/agentic-workbench/backlog.json` sous `GYM-D1`. Les dates et charges sont des estimations de planification, pas des durées consommées ni des engagements.
