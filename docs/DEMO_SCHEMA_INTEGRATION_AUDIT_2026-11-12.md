# Audit d'intégration du schéma de démo — 12 novembre 2026

## Résultat

Le projet `getyourmentor-demo-recruiter` (`rqxoovriacgoriimpbwi`) et le schéma `gym_demo_*` sont disponibles. Cela ne permet pas de brancher simplement la variable Supabase au candidat applicatif actuel. La route publique attendue est toujours absente : lecture HTTP du 12 novembre, accueil `200`, `/demo` `404` sur `https://getyourmentor-demo-20261014.netlify.app/`. Le lien de portfolio est documenté vers ce domaine. `gregarious-fox-fff605` reste une cible différente et exclue.

## Incompatibilités observées

| Frontière | Candidat local | Schéma `gym_demo_*` | Conséquence |
|---|---|---|---|
| Identité | `gym-next/lib/auth.ts` émet le cookie applicatif `gym_session` ; les connexions Supabase existantes utilisent mot de passe et access token, pas l'authentification anonyme retenue pour le parcours recruteur. | Chaque session dépend d'un `auth.users.id` et des politiques RLS `authenticated`. | Ajouter un flux anonyme dédié, lier le jeton Auth au cookie serveur et vérifier qu'aucun identifiant reçu du navigateur ne remplace `auth.uid()`. |
| Mode démo hébergé | `gym-next/lib/runtime.ts:isHostedDemo()` exige actuellement l'absence des variables Supabase, y compris la clé anonyme. | Le nouveau parcours doit appeler Supabase dans le projet dédié. | Ajouter ces variables à l'aveugle ferait sortir l'application de son mode démo existant sans activer de dépôt `gym_demo_*` compatible. |
| Réservations | `gym-next/app/api/reservations/route.ts` passe par les services métier et repositories existants, et accepte des comptes/cookies de l'application. | Le schéma réserve des instantanés fictifs à `gym_demo_reservations`, avec validation et paiement contraints à `simulated`. | Créer des routes / repositories isolés ; ne pas détourner les tables, paiements ou données de vrais parcours. |
| Effacement / rétention | Aucun flux public dédié de session anonyme et d'effacement Auth n'a été établi dans la cible Netlify. | Supprimer la session supprime les lignes métier en cascade ; le `expires_at` de 24 h ne déclenche pas à lui seul une purge. | Prévoir une suppression idempotente et sûre de l'identité anonyme côté serveur, plus un mécanisme de rétention explicitement testé. |
| Interface publique | Le brouillon `gym-next/app/demo/page.tsx` dans le checkout de travail est non suivi et contient encore des comptes partagés (`demo-password`). La route publique actuelle est 404. | La décision exclut les comptes partagés. | Ne pas promouvoir ce fichier tel quel ; remplacer ses instructions et l'intégrer seulement après revue du checkout de travail. |
| Secrets / environnement | La cible de domaine est identifiée, mais aucune configuration de service n'a été vérifiée ou écrite dans Netlify. | Seule la clé publique peut être accessible au client si le modèle RLS l'autorise ; la clé `service_role` doit rester serveur. | Séparer configuration publique et secrets serveur, limiter les contextes Netlify au site de démo, puis contrôler les artefacts client avant déploiement. |

L'inspection du checkout principal a été en lecture seule. Il contient des changements suivis et non suivis préexistants, dont le brouillon `/demo`; ils n'ont été ni copiés, ni modifiés, ni indexés. L'audit ne valide pas leur état Git ni leur aptitude à être publiés.

## Marche arrière

`supabase/proposals/demo-public-20261112/003_rollback_empty_demo_schema.sql` propose une marche arrière manuelle : verrouillage des quatre tables, refus si l'une contient une ligne, retrait explicite des politiques puis suppression des seules tables `gym_demo_*`. Vérifier visuellement la référence projet `rqxoovriacgoriimpbwi` dans le tableau Supabase avant toute exécution. La marche arrière n'a pas été exécutée ; le schéma hébergé reste intact. Le contrôle Node est statique et ne remplace pas une exécution SQL.

## Contrôles de ce lot

- Lecture seule des sources d'identité, mode runtime, page `/demo` et API de réservation du checkout de travail.
- Lecture HTTP publique : accueil Netlify `200`, `/demo` `404`.
- `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` : PASS, y compris les garde-fous statiques de la marche arrière.
- `node --test tools/agentic-workbench/tests/*.test.mjs` : 35/35 PASS.
- Aucun accès à des données métier Supabase, aucune migration distante, variable Netlify, notification ou publication dans ce lot.

## Suite recommandée

1. Implémenter dans une branche dédiée un adaptateur Supabase propre au parcours recruteur : authentification anonyme, sessions coach/sportif, lecture des fixtures et mutations strictement limitées aux lignes de la session.
2. Tester l'effacement Auth (y compris deux parcours séparés), les sessions expirées et une vraie politique de purge 24 h sur une base jetable.
3. Revoir les diffs de travail du checkout applicatif ; ne reprendre que les fichiers de parcours nécessaires, sans ses comptes partagés.
4. Déployer seulement après validation du build, de la frontière client/serveur, des parcours isolés et de la configuration du site Netlify `getyourmentor-demo-20261014`.

GYM-D1.2 et GYM-D1.3 restent en cours. GYM-D1.4 reste bloqué sur l'absence de l'implémentation applicative et de la purge testée ; les tickets dépendants ne sont pas clos.
