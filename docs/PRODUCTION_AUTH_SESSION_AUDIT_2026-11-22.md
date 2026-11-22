# Audit des sessions et de la déconnexion — 22 novembre 2026

## Portée et limites

Audit statique du checkout `product/production-readiness-20261122` au commit `b10b97aa0180f78f7de93ec9a45d8dbc5e2c6f5f`. Il ne valide pas le comportement du site public ni une configuration Supabase de production. Aucun code applicatif, compte, service distant ou secret n’a été modifié ou interrogé.

## Chemin observé dans le code

1. `gym-next/components/account-legacy/AccountSessionControls.tsx` envoie `POST /api/auth/sign-out`, diffuse un signal de déconnexion aux autres onglets via `localStorage`, puis redirige.
2. `gym-next/app/api/auth/sign-out/route.ts` appelle `signOut()` et renvoie `{ ok: true }`.
3. `gym-next/lib/auth.ts` expire le cookie `gym_session`. En mode Supabase, `signIn()` obtient un access token et le place dans l’enveloppe de session ; `currentSession()` décode ensuite l’enveloppe localement. `requireRole()` valide le rôle à partir de cette session décodée et ne vérifie pas l’état de la session chez Supabase.
4. `gym-next/lib/session-envelope.ts` chiffre et authentifie l’enveloppe avec AES-GCM et lui donne une durée maximale de sept jours (`SESSION_MAX_AGE_SECONDS`). L’enveloppe est stateless : aucune liste de révocation persistante n’est consultée dans le chemin de `currentSession()`.

## Conclusion vérifiable

La déconnexion normale du navigateur expire son cookie. Le code examiné ne révoque pas explicitement la session chez Supabase et ne rend pas invalide une copie de cookie déjà obtenue. **Inférence de risque, non reproduite en exécution :** un cookie scellé copié pourrait rester accepté par `requireRole()` jusqu’à son expiration, sous réserve des autres protections de chaque route. L’expiration du cookie local ne démontre donc pas une révocation serveur.

`gym-next/tests/signout.spec.ts` vérifie la déconnexion locale/de démonstration, l’absence du cookie courant et un accès refusé à `/api/messages`. Ces assertions ne couvrent ni la révocation Supabase ni la réutilisation d’un cookie capturé avant logout. `gym-next/tests/account-session-controls.spec.ts` couvre la synchronisation d’onglets, pas la révocation distante. Cette vérification est une lecture de code, pas un test runtime.

Les dépendances installées de l’application (`gym-next/node_modules`) sont absentes dans ce checkout ; la suite Playwright de l’application n’a donc pas été exécutée. Aucun test de staging n’a été fait. Les suites de gouvernance du dépôt seront exécutées séparément.

## Choix d’implémentation à instruire

Avant d’écrire le parcours de production, comparer et choisir une politique de session qui permette une révocation vérifiable :

- **Session Supabase SSR avec cookies et middleware** : utiliser les primitives officielles Supabase SSR/Next.js, renouveler les tokens côté serveur et vérifier l’utilisateur selon le flux documenté. Vérifier les versions et leur état de stabilité avant adoption.
- **Registre de révocation serveur durable** : conserver un identifiant de session révocable et le vérifier sur chaque requête protégée. Le stockage doit être partagé entre les instances Netlify ; un `Map` en mémoire n’est pas suffisant.

Ne pas combiner les solutions sans besoin démontré. Dans les deux cas, définir le comportement si la révocation échoue, éviter le succès trompeur du endpoint logout, protéger les cookies, et tester : cookie courant, cookie capturé avant logout, expiration, renouvellement, changement de rôle, panne fournisseur et sessions multi-onglets. L’implémentation de production dépend aussi de l’identification de la cible et du projet Supabase dédiés (GYM-PROD.2), encore bloquée.

## Références officielles consultées

- [Supabase Auth — Sign out](https://supabase.com/docs/guides/auth/signout) : la révocation de refresh token ne rend pas instantanément invalide un access token déjà émis ; celui-ci reste valide jusqu’à expiration.
- [Supabase Auth — Server-side rendering](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&package-manager=npm) : intégration SSR et gestion des cookies côté serveur.
- [Supabase Auth — Choosing a server-side package](https://supabase.com/docs/guides/auth/choosing-a-server-package) : état et recommandations des bibliothèques serveur.

