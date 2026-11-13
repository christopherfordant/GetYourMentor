# GYM-D1.2 — audit du build et de la frontière client/serveur

Date : 13 novembre 2026. Audit local uniquement ; aucune variable Netlify, donnée Supabase, migration, notification ni publication n’a été touchée.

## Périmètre et provenance

Le build a été lancé dans le worktree `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`, commit `ebd5ea40cff3076f57a14d3e0d12249417a7d4f5`. Une comparaison Git a confirmé que le sous-arbre `gym-next` est identique à celui de la branche Kanban actuelle `chore/kanban-context-selector-20261113` au commit `7381ee1f8666450e734092ba39b4289d9b4efb72`.

## Contrôles exécutés

- `npm ci` : terminé, 78 paquets ajoutés ; npm a signalé une vulnérabilité critique dans l’arbre audité. Aucun `npm audit fix` ni changement du lockfile n’a été effectué ; le paquet concerné reste à identifier dans un lot sécurité dédié.
- `npm run build` : réussi avec Next.js 15.5.27. Le manifeste a généré 38 pages statiques/dynamiques ; aucune route `/demo` n’est présente. Des avertissements Autoprefixer préexistants signalent `start` à remplacer par `flex-start` dans des feuilles CSS ; ils n’ont pas été modifiés.
- `npm run check:client-secret-boundary` : réussi après le build — aucun marqueur de secret serveur trouvé dans `.next/static`. Ce résultat porte sur le code et l’environnement bâtis ; aucun secret Supabase n’était configuré.
- `npm run check:netlify-config` : réussi — `base = gym-next`, commande `npm run build`, publication `.next`.
- Source `lib/runtime.ts` : `isHostedDemo()` exige actuellement l’absence des variables Supabase, Stripe et e-mail. Le mode hébergé actuel n’est donc pas compatible avec un raccordement Supabase par simple ajout de variables.
- Répertoire `.netlify/state.json` absent et aucun `site_id` déclaré dans `netlify.toml` : l’identité réelle du site Netlify, sa branche source et son artefact actuellement servi ne sont pas confirmés par ces contrôles locaux.

## Décision et suite

GYM-D1.2 reste en cours. Les contrôles locaux du build sont désormais documentés, mais ils ne prouvent ni le raccordement du site public au projet Supabase dédié ni la bonne cible Netlify. Ne configurer aucune variable ni clé tant que l’identité du site et sa branche de build ne sont pas confirmées en lecture seule, et tant que l’adaptateur de démonstration n’a pas une frontière client/serveur adaptée. La prochaine action est de confirmer ces métadonnées dans le compte Netlify ou avec un CLI déjà authentifié, sans modifier la configuration.
