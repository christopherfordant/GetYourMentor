# Configuration Netlify de l’aperçu D1.8 — 18 novembre 2026

## Cible et état initial

- Site vérifié dans le tableau Netlify : `getyourmentor-demo-20261014` (site ID `86e0379e-4d1a-4cf0-936c-1439397354f4`).
- Aperçu ciblé : `https://gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app`.
- Le déploiement reste un `branch-deploy` de `gym-demo-preview-20261117`.
- Projet Supabase dédié vérifié : `getyourmentor-demo-recruiter` (`rqxoovriacgoriimpbwi`). Aucun autre projet n’a été utilisé.
- Checkout : `demo/recruiter-supabase-adapter-20261112`, HEAD `aa1ff81aa3442be8da8561e553e01e1e379c0c7a`, identique à l’upstream au début de ce lot.
- Les modifications préexistantes `docs/DEMO_D15_LOCAL_FLOW_2026-11-14.md` et `gym-next/scripts/__pycache__/` ont été préservées.

## Configuration branch-only vérifiée

Dans l’interface Netlify, des valeurs spécifiques ont été ajoutées au seul contexte de branche `gym-demo-preview-20261117` pour :

- `GYM_DEMO_SESSION_ENABLED` ;
- `GYM_DEMO_SUPABASE_URL` ;
- `GYM_DEMO_SUPABASE_PUBLISHABLE_KEY` ;
- `GYM_DEMO_SESSION_SECRET` ;
- `GYM_DEMO_PURGE_SECRET` ;
- `NEXT_PUBLIC_APP_URL` (URL de l’alias ci-dessus).

Les valeurs des secrets ne sont pas relues ni consignées. Les valeurs préexistantes des contextes Deploy Preview ont été conservées. Les variables `GYM_DEMO_*` restent absentes de Production ; la valeur Production préexistante de `NEXT_PUBLIC_APP_URL` n’a pas été modifiée.

## Blocage restant : clé Supabase serveur

`GYM_DEMO_SUPABASE_SECRET_KEY` ne possède toujours pas de valeur pour le contexte de branche. L’interface Supabase masque la clé secrète existante et bloque sa copie depuis le navigateur automatisé. Une nouvelle clé serveur a été créée pour tester le flux, mais sa valeur n’a pas pu être récupérée ; cette clé inutilisée a été supprimée et son absence a été vérifiée dans la liste des clés. Aucun secret n’a été écrit dans le dépôt ou la conversation.

Aucune clé n’a donc été ajoutée à Netlify pour cette variable. La configuration est incomplète et l’aperçu ne doit pas être considéré comme opérationnel.

## Vérification du runtime, sans déploiement

Requêtes HTTPS effectuées le 18 novembre 2026 sur l’alias après la configuration :

- `GET /api/health` : HTTP 200 ; `checks.supabase=false`, `recruiterDemo.available=false`, `recruiterDemo.status=disabled`.
- `GET /api/demo/catalog` : HTTP 503.

Aucun build/déploiement n’a été lancé. Aucun réglage de Production, migration Supabase, session, réservation, paiement ou notification externe n’a été effectué. Les résultats HTTP ne prouvent pas le parcours métier.

## Action manuelle nécessaire

Dans le projet Supabase `getyourmentor-demo-recruiter`, créer une nouvelle clé `secret` destinée exclusivement à l’aperçu, la copier directement lors de sa création, puis la saisir dans Netlify : site `getyourmentor-demo-20261014` → variables d’environnement → `GYM_DEMO_SUPABASE_SECRET_KEY` → ajouter une valeur pour la branche `gym-demo-preview-20261117`, portée Builds/Functions/Runtime. Ne pas ajouter de valeur Production et ne pas transmettre la clé dans le chat.

Après cette saisie, relancer le préflight du dépôt. Le déploiement de l’alias et la recette D1.8 ne sont pas inclus dans cette vérification de configuration et nécessitent leurs contrôles dédiés.
