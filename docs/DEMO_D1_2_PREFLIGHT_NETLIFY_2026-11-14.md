# GYM-D1.2 — contrôle de reprise Netlify — 14 novembre 2026

## Résultat

La cible publique `https://getyourmentor-demo-20261014.netlify.app/` répond à l’accueil en HTTP 200. `/api/health` répond 200 avec `mode=demo`, `ready=true` et `supabase=false`. La route `/demo` répond 404. Cela confirme l’état public observé, pas le dépôt, la branche ni le commit source du déploiement.

Le compte GitHub `christopherfordant` est connecté en lecture ; `gh repo view` identifie `christopherfordant/GetYourMentor`, dont la branche par défaut est `main`. La consultation des workflows ne montre aucune exécution sur `demo/recruiter-supabase-adapter-20261112`, et le workflow `mvp-gates.yml` ne déclenche ses push gates que sur `feat/nextjs-migration` et `main`. Ces faits ne prouvent pas que ce dépôt, cette branche ou le dernier SHA livré correspondent au site Netlify.

Dans cette session, les onglets navigateur disponibles ne contiennent que le Kanban local `http://127.0.0.1:4325/`. La commande Netlify CLI n’est pas installée/disponible. Aucune session Netlify authentifiée ni métadonnée de déploiement n’a donc pu être consultée. Aucun réglage de compte, secret, variable ou déploiement n’a été modifié.

Le worktree isolé de livraison est propre et se trouve sur `demo/recruiter-supabase-adapter-20261112`, HEAD et `origin` à `57202f8a8f0b081caa89fa5a8f11e8db79d48b29`. Le sous-arbre `gym-next` est identique à celui contrôlé dans le worktree `demo/d1-2-build-audit-20261113` (commit `bf65674403d74bce4e5f796cc3fbc08ac0f72085`). Son audit local rapporte un build réussi, `check:netlify-config` et `check:client-secret-boundary` réussis, mais aussi l’absence de `.netlify/state.json` et de `site_id` dans `netlify.toml`. Le build ne confirme pas l’artefact actuellement servi.

## Décision de suivi

GYM-D1.2 reste `progress`. Ne pas configurer Supabase dans Netlify : `gym-next/lib/runtime.ts` refuse actuellement les variables Supabase dans `isHostedDemo()`, et aucun adaptateur dédié ni preuve de frontière serveur raccordée n’est livré. Le test `supabase=false` confirme qu’aucune connexion Supabase n’est actuellement annoncée par le runtime public.

Pour lever le blocage de provenance, consulter en lecture seule dans Netlify, pour le site `getyourmentor-demo-20261014` :

1. dépôt Git connecté et branche de déploiement de production ;
2. dernier déploiement publié et son SHA de commit ;
3. répertoire de base et commande de build.

Comparer ces valeurs à un SHA et à la configuration du dépôt avant toute action distante. Ne pas confondre site public, branche du checkout, workflow GitHub et projet Supabase. Les valeurs secrètes ne sont ni nécessaires ni à transmettre pour ce contrôle.

Après cette vérification, le lot local suivant pourra compléter le contrat D1.3 pour l’acteur fictif stable et l’acceptation simulée, puis exécuter ses tests dans un environnement PostgreSQL jetable compatible. D1.4 et l’adaptateur restent dépendants de ces contrôles ; aucun parcours applicatif ne doit être annoncé raccordé.

## Addendum — session Netlify authentifiée — 14 novembre 2026

La consultation en lecture seule du tableau de bord Netlify a ensuite permis de confirmer le site visé : projet `getyourmentor-demo-20261014`, URL `https://getyourmentor-demo-20261014.netlify.app/`, Site ID `86e0379e-4d1a-4cf0-936c-1439397354f4`, affiché comme site public de production.

L’activité du projet indique le déploiement publié `6af5b42d9df69449340b3d31`, publié le 12 novembre 2026 à 13:42, « Last deployed from CLI », avec la note de source `892ecba8a081de29336e482824d7a177726c48a7`. La page de détail montre les étapes Initializing/Building/Deploying comme ignorées. Il s’agit donc d’un artefact envoyé depuis la CLI, et non d’une preuve d’un build Netlify déclenché depuis une branche Git. La branche de checkout ayant produit l’artefact n’est pas indiquée par cette fiche. La configuration `netlify.toml` au commit source fixe le contrat du dépôt (base `gym-next`, commande `npm run build`, publication `.next`, Node 22), mais les étapes sautées ne prouvent pas que cette commande a été utilisée pour fabriquer l’artefact publié.

Le commit source `892ecba8…` existe localement, est ancêtre du HEAD de livraison vérifié `9a3de6ca…`, et `git diff 892ecba8… HEAD -- gym-next` est vide. Le sous-arbre applicatif déployé est donc identique au candidat local actuel. Aucun fichier `gym-next/app/demo` n’existe dans les deux arbres ; le 404 correspond à l’absence de route implémentée, pas à une divergence connue entre le code candidat et cette source enregistrée. Le contrôle HTTP de reprise constate toujours `/api/health` avec `supabase=false`.

Le contrôle de build antérieur est documenté dans le worktree de vérification `demo/d1-2-build-audit-20261113`, commit `bf65674403d74bce4e5f796cc3fbc08ac0f72085`. Son sous-arbre `gym-next` est identique à celui du checkout de livraison, vérifié par comparaison Git. Le rapport local indique `npm run build`, `npm run check:netlify-config` et `npm run check:client-secret-boundary` réussis ; aucun secret Supabase n’était configuré pendant ces essais. Le présent document conserve les résultats et cette provenance afin que le ticket ne dépende pas d’un worktree annexe.

### Séquencement des tickets

Le secret Supabase ne doit pas être configuré dans D1.2 : sans adaptateur prêt, cela n’activerait pas le parcours attendu et pourrait rendre le mode existant incohérent. Le ticket D1.2 est donc limité à la provision/identification de l’environnement dédié, à la confirmation du site cible et à la vérification de la frontière serveur/client du candidat sans secrets. La configuration des variables et la publication contrôlée appartiennent à D1.9, après réalisation et recette des tickets D1.3, D1.4, D1.5, D1.7 et D1.8. Cette reclassification est explicite dans le Kanban ; elle ne signifie pas que Supabase est déjà raccordé.

Netlify confirme le nom, l’URL, le Site ID et la source SHA étiquetée du dernier artefact, mais ne fournit pas de branche de production ni de build Git pour ce déploiement CLI. Aucune donnée de variables/secrets n’a été ouverte ; aucun réglage, variable, migration ou déploiement n’a été modifié.
