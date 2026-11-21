# D1.8 - audit logique metier et disponibilites, 21 novembre 2026

## Perimetre et source

- Depot : `GYM-demo-isolated-20261112`.
- Branche : `demo/recruiter-supabase-adapter-20261112`.
- Base distante verifiee avant le lot : `cc22a6764359f006d2fcf709d30a509def31d67b`.
- Correction livree localement par le commit `02c657f556369078ca9d15088d5e9469f178e1b3`.
- Aucun acces Supabase distant, aucune modification Netlify et aucun deploiement dans ce lot.

## Constat metier

Le RPC `gym_demo_book_and_accept_fixture` materialise et verrouille le creneau, puis refuse atomiquement un creneau deja reserve. Le parcours ne permet donc pas une double reservation ; une course entre lecture du catalogue et reservation peut encore produire le conflit HTTP 409 attendu.

Le defaut etait dans la lecture du catalogue : `listDemoFixtures` renvoyait les modeles de creneaux sans lire l'etat de `gym_demo_slots`. Apres la reservation d'un creneau par un testeur, un autre testeur voyait encore ce creneau comme disponible et decouvrait le conflit seulement apres avoir clique.

## Correction

Le catalogue serveur lit les identifiants des acteurs fictifs actifs et les seuls creneaux `booked` qui leur appartiennent, au moyen de la cle publishable et des politiques RLS deja prevues pour les fixtures publiques. Il masque les modeles deja pris et les horaires passes. Aucun identifiant de coach ou creneau interne n'est renvoye dans la reponse du catalogue. La cle serveur n'est pas utilisee pour ces lectures ; les policies des coachs et creneaux de fixture sont celles des migrations `001_demo_schema.sql` et `004_demo_schedule_idempotency.sql`.

Quand aucun acteur fictif n'a encore ete cree, le catalogue conserve les modeles futurs ; le RPC cree ensuite l'acteur et le creneau dans la transaction de reservation. La reservation atomique reste la source de verite en cas de concurrence : une disponibilite peut changer apres l'affichage et le serveur peut alors renvoyer 409.

## Paiement simule

La relecture du RPC `gym_demo_confirm_simulated_payment` a confirme que `false` signifie que la reservation etait deja en etat `simulated_confirmed`. Ce n'est pas un paiement refuse : c'est le resultat idempotent d'une seconde demande. La route API renvoie alors correctement l'etat final `{ confirmed: true, realPayment: false }`. Un test de non-regression couvre maintenant ce cas. Aucun appel Stripe, debit ou message externe n'est effectue.

## Preuves et controles

- Test rouge avant correction : le test `le catalogue masque un créneau déjà réservé par un autre testeur` echouait en recevant aussi `tennis-matin`, bien que le mock de la table le donne comme reserve.
- Tests API/metier apres correction : 5/5 passes (filtrage des creneaux pris, routes et isolation par session, conflit atomique, seconde confirmation idempotente, refus ferme sans configuration Supabase).
- Parcours navigateur local sur le serveur Next construit : 2/2 passes sur desktop Chromium et mobile Chromium. Les endpoints de demonstration etaient interceptes par les mocks Playwright ; ce resultat ne constitue pas un test Supabase distant.
- TypeScript (`tsc --noEmit --incremental false`) : passe.
- Build Next local, Next.js 15.5.27 : passe, y compris controle de types.
- `check:client-secret-boundary` sur le build local : passe, aucun marqueur de secret serveur dans `.next/static`.
- `git diff --cached --check` : passe.
- Aucune migration SQL n'a ete ajoutee ; les tests pgTAP n'ont donc pas ete relances.

## Limites et prochaine action

La recette avec Supabase reel, la RLS distante, deux sessions distinctes, l'effacement et les courses sur le runtime Netlify ne sont pas prouves par ces tests locaux. Le controle HTTPS refait le 21 novembre repond 200 sur `/api/health` avec `ready=true` et `checks.supabase=false`. `/api/demo/catalog` repond actuellement 404 avec une page HTML prerendue (`X-Nextjs-Prerender: 1`, `Age` superieur a neuf jours), ce qui indique un artefact ou cache qui ne sert pas la route ; ce n'est pas une preuve du statut de l'adaptateur Supabase. GYM-D1.8 reste bloque.

Le candidat Netlify prepare depuis le commit `ff62b55` est maintenant obsolete pour le code applicatif. Pour reprendre D1.8, reconstruire et verifier un candidat a partir de `02c657f` dans le worktree de build isole, puis publier uniquement l'alias de preproduction apres autorisation explicite et disponibilite des variables dediees. Ne pas toucher a Production, a l'ancien site, a `getyourmentor-preprod`, `gym_memory` ou n8n.
