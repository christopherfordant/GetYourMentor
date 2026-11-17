# Contrôle D1.8 - contexte de l’alias Netlify - 17 novembre 2026

## Résultat

Le candidat local du commit `d3da6a8a883138a5afe69d0c3e7b5d0c4000de2d` a été construit et envoyé en déploiement brouillon sur le seul site `getyourmentor-demo-20261014` (site ID `86e0379e-4d1a-4cf0-936c-1439397354f4`). Netlify a attribué l’alias `https://gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app`. L’API Netlify classe ce déploiement en contexte `branch-deploy`, branche `gym-demo-preview-20261117`, état `ready`, sans publication sur l’URL de production. Les métadonnées inspectées indiquent que le site n’est pas raccordé à un dépôt Git Netlify.

L’inspection en lecture seule des noms et portées des variables (sans lire leurs valeurs secrètes) montre que les six valeurs `GYM_DEMO_*` sont définies pour `deploy-preview`, mais absentes du contexte `branch-deploy`/branche de l’alias et de `production`. Comme l’alias est classé branche, son runtime ne reçoit pas la configuration Deploy Preview.

## Contrôles HTTP réels

- `GET /demo` : HTTP 200.
- `GET /api/health` : HTTP 200, `recruiterDemo.available=false`, `recruiterDemo.status=disabled`, contrôle Supabase faux.
- `GET /api/demo/catalog` : HTTP 503, configuration de démonstration indisponible.
- `GET /robots.txt` : HTTP 200, `Disallow: /` ; `GET /sitemap.xml` liste toutefois l’alias et `X-Robots-Tag` est absent. Le sitemap et l’assemblage de configuration du prochain déploiement sont corrigés localement ; ces protections ne sont pas encore publiées.
- Le parcours Supabase n’a pas été exécuté. Aucun testeur ni réservation n’a été créé ; aucun paiement ni message externe n’a été déclenché.
- La navigation Playwright distante a expiré ; aucun rendu visuel n’est revendiqué.
- Aucun réglage Netlify Production n’a été modifié et aucun déploiement Production n’a été effectué.

## Garde locale

Le code autorise désormais cet alias exact uniquement quand `CONTEXT=branch-deploy`. Le script de déploiement exige maintenant des variables démo associées au contexte de la branche exacte et demande explicitement au CLI le contexte `branch:<alias>`. Il refusera de reconstruire ou publier cet alias tant que cette portée n’est pas prouvée. Le traitement du sitemap exclut maintenant les hôtes de démonstration. La configuration déployée conserve aussi les en-têtes `X-Robots-Tag` au lieu de les perdre en ajoutant le plugin Netlify.

Le prochain contrôle distant nécessite, dans Netlify, des valeurs pour le seul contexte de branche `gym-demo-preview-20261117`, avec portées fonctions/runtime adaptées : `GYM_DEMO_SESSION_ENABLED`, `GYM_DEMO_SUPABASE_URL`, `GYM_DEMO_SUPABASE_PUBLISHABLE_KEY`, `GYM_DEMO_SUPABASE_SECRET_KEY`, `GYM_DEMO_SESSION_SECRET`, `GYM_DEMO_PURGE_SECRET` et `NEXT_PUBLIC_APP_URL` pointant vers l’alias ci-dessus. Conserver les valeurs `deploy-preview` existantes et laisser ces variables démo absentes de Production. Ne jamais exposer les secrets dans Git ou la conversation.

## Contrôles locaux

- `npm run build` : réussi. Le build signale des avertissements Autoprefixer existants sur `start`/`flex-start` dans les feuilles CSS ; aucune erreur de compilation/type.
- `npx playwright test tests/demo-recruiter-session.spec.ts tests/seo-metadata.spec.ts --reporter=line --workers=1` : 32 tests réussis sur Chromium desktop et mobile après reconstruction locale propre.
- `python -m py_compile scripts/deploy-isolated-demo.py` : réussi.
- `node scripts/check-client-secret-boundary.mjs` : réussi, aucun marqueur de secret serveur dans `.next/static`.
- Le test unitaire du sitemap vérifie désormais qu’un hôte de démonstration ne figure pas dans le sitemap.
- `git diff --check` : réussi.

## Suite

GYM-D1.8 reste `blocked` : l’alias existe mais n’est pas raccordé à Supabase au runtime, et le parcours isolé n’a pas été testé. GYM-D1.9 reste `backlog`. Après configuration du contexte de branche exact, relancer le garde-fou, redéployer le même alias et contrôler santé, parcours complet, persistance, isolation et effacement avec deux sessions jetables avant de modifier les statuts.
