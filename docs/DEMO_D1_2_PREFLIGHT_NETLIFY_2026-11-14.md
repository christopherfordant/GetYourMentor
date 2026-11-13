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
