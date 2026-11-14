# GYM-D1.4 — adaptateur local des sessions de démonstration

Date : 14 novembre 2026. Checkout isolé `C:/Users/cashe/Documents/GYM-demo-isolated-20261112`, branche `demo/recruiter-supabase-adapter-20261112`. Ce lot complète le contrat SQL déjà validé ; il n’active aucune intégration distante.

## Réalisation

- `gym-next/app/api/demo/session` expose le démarrage, la relecture et l’effacement d’une session sportive anonyme. Le cookie est chiffré AES-GCM, `HttpOnly`, `Secure`, `SameSite=Strict`, limité à 24 h ; le jeton et le jeton de renouvellement ne sont jamais renvoyés au navigateur.
- Le serveur crée une identité anonyme Supabase, la vérifie via Auth, puis insère sa session sportive avec le jeton utilisateur et la politique RLS. La relecture vérifie à nouveau Auth et la ligne détenue. Le renouvellement Auth reste lié au même utilisateur anonyme.
- L’effacement appelle la fonction SQL propriétaire avec le jeton authentifié, puis supprime uniquement cette identité anonyme par l’Admin API côté serveur. Une reprise après effacement SQL partiel reste possible tant que le cookie chiffré est encore valide.
- `/api/cron/demo-session-purge` exige un secret distinct vérifié en temps constant. La fonction Netlify `demo-session-purge-schedule.mts` le déclenche toutes les heures et refuse les autres Site ID, URL et environnements. Avant de purger les lignes expirées, le serveur vérifie chaque identité comme anonyme puis la supprime via Auth ; si une identité ne peut être vérifiée ou effacée, le lot s’arrête et ne lance pas la purge des lignes restantes.
- Les routes requièrent le feature flag et les variables namespacées `GYM_DEMO_*`, l’URL du site exact, son Site ID et le projet Supabase dédié `rqxoovriacgoriimpbwi`. Ces valeurs ne sont pas configurées ni consultées dans ce lot. Toute configuration Supabase ou Netlify demeure reportée au ticket prévu.

## Contrôles locaux

- `npm run check:types` : réussi.
- `npm run build` : réussi ; Next répertorie `/api/demo/session` et `/api/cron/demo-session-purge` comme routes dynamiques.
- `npx playwright test tests/demo-recruiter-session.spec.ts --project=desktop-chromium` : 12/12 réussis. Les tests injectent des réponses HTTP en mémoire et couvrent la cible autorisée, le cookie chiffré, le renouvellement, l’identité anonyme, la persistance RLS, l’effacement SQL/Auth, la purge TTL, l’origine, le cron, le parcours réel des handlers et le refus de configuration locale.
- `npm run check:client-secret-boundary` : réussi, aucun marqueur de secret serveur dans `.next/static`.
- `npm run check:netlify-config` : réussi ; le contrat Netlify existant est inchangé.
- `npm run check:tracked-secrets` : réussi.
- `node supabase/proposals/demo-public-20261112/validate-proposal.mjs` : réussi.
- `node --test tools/agentic-workbench/tests/*.test.mjs` : 35/35 réussis.

## Limites et reprise

Les appels Supabase ont été simulés par des réponses déterministes ; aucun runtime Supabase, compte Netlify, projet distant ou secret n’a été sollicité. La fonction planifiée n’a pas été exécutée par Netlify. La route demeure désactivée en l’absence de configuration dédiée. `/demo` et le raccordement du parcours de réservation ne sont pas implémentés dans ce lot ; aucune réservation ni paiement n’a été créé. La dernière observation publique archivée dans `docs/DEMO_D1_2_PREFLIGHT_NETLIFY_2026-11-14.md` indique `supabase=false` et `/demo` 404 ; elle n’a pas été réactualisée ici.

GYM-D1.4 est clos pour le contrat et l’implémentation locale validés par les contrôles cités. Le runtime Supabase dédié et le déclencheur Netlify réel restent à valider lors de D1.8/D1.9. Le parcours sportif /demo n’est pas encore implémenté dans ce lot.
