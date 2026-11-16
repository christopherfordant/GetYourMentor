# D1 — readiness locale du candidat, 16 novembre 2026

## Découpage retenu

Le Kanban mélangeait implémentation locale, intégration à Supabase, recette du site public et publication finale. Cela créait une dépendance circulaire : D1.5/D1.8 exigeaient un runtime raccordé, tandis que D1.9 était chargé de la configuration et dépendait lui-même de D1.8.

Le chantier est désormais séparé ainsi :

1. **D1.2–D1.4** : cibles, schéma et sessions démo isolées ; preuves historiques conservées.
2. **D1.5–D1.7** : candidat local, tests avec doubles explicites et textes exacts du scénario de démonstration.
3. **D1.8** : aperçu non-production isolé, variables de serveur limitées à l’aperçu, recette réelle Supabase/RLS et navigateur.
4. **D1.9** : publication finale sur le site portfolio, seulement après réussite de D1.8.

Le futur aperçu doit être vérifié dans Netlify avant configuration. Le dashboard du site indique un dernier déploiement depuis CLI et aucun dépôt Git n’est documenté dans les preuves actuelles. L’interface Netlify ouverte en lecture seule montre le projet `getyourmentor-demo-20261014`, l’activité de déploiement et la séparation Production/Previews. Cela ne prouve ni l’existence d’une branche de prévisualisation raccordée, ni que les variables serveur peuvent être isolées dans ce projet. Aucun réglage ou déploiement n’a été effectué.

Préflight complémentaire : la page Environment variables s’ouvre mais ne rend aucun détail exploitable dans la session automatisée. Aucun CLI `netlify`, fichier `.netlify/state.json` ni `netlify.toml` n’est présent dans le checkout. La commande de statut `npx --yes netlify-cli@latest status` n’a produit aucune sortie et a été interrompue ; aucune installation réussie n’est constatée. L’accès technique ne permet donc pas encore de confirmer la portée deploy-preview des variables.

## Résultats candidats locaux

- Accueil : l’entrée recruteur annonce explicitement l’acceptation automatique simulée, le paiement sans carte ni débit et l’absence de décision par un coach réel ou une IA. Elle reste conditionnée à la configuration serveur de la démo.
- `/demo` : le parcours local affiche le caractère fictif du coach, l’acceptation automatique de démonstration, l’absence de paiement réel, et la conservation des profils fictifs lors de l’effacement de la session.
- Aucun appel Telegram n’est attendu dans le scénario par défaut ; ce choix est explicitement vérifié par les tests de route et de parcours.
- Commandes exécutées depuis `gym-next/` le 16 novembre :
  - `npx playwright test tests/demo-booking.spec.ts tests/demo-home-entry.spec.ts tests/demo-recruiter-session.spec.ts --reporter=line` : **36/36 réussis** (Chromium desktop et mobile). Les API Supabase sont simulées : ceci vérifie le contrat et l’interface, pas le runtime distant.
  - `npm run check:types` : réussi.

## Runtime et publication — encore non validés

Le contrôle public en lecture seule reste : accueil 200, `/api/health` avec `supabase=false`, `/demo` 404. Le SHA publié consigné, `892ecba8…`, précède l’ajout de la route `/demo`. Le projet Supabase dédié existe et les migrations additives 004/009/012 y ont été appliquées manuellement ; l’historique CLI doit être réconcilié avant toute exécution des migrations. RLS activé dans les métadonnées ne vaut pas test runtime des autorisations.

Avant D1.8, confirmer dans Netlify que l’aperçu est isolé de Production et que les variables d’aperçu ne deviennent pas accessibles au navigateur. Configurer uniquement l’URL et la clé publique du projet de démonstration et, si les routes serveur le nécessitent, le secret serveur de ce seul projet, dans le contexte d’aperçu uniquement. Ne jamais configurer la clé privilégiée dans `NEXT_PUBLIC_*`, un bundle, un commit ou une conversation. N’effectuer aucune mutation métier réelle. Si le contexte isolé ou ses protections ne sont pas démontrables, arrêter avant configuration et publier le blocage précis.

Après configuration, vérifier `/api/health`, `/demo`, création/relecture/effacement de sessions isolées, deux testeurs sans accès croisé, réservation idempotente, confirmation non-financière et absence d’appel Stripe/Telegram. Nettoyer les données jetables créées durant la recette et vérifier que les fixtures partagées restent intactes. Conserver le production runtime inchangé pendant cette étape.

## Git et changements préexistants

Branche `demo/recruiter-supabase-adapter-20261112`, début de lot `4cfc0934b39d1718ee4a6923791daf46aafcc453`, upstream aligné à ce SHA. `main` et cette branche ont une divergence importante documentée ; aucune fusion générale n’est recommandée. Garder le travail D1 isolé et préparer une promotion séparée après recette.

Le fichier préexistant `docs/DEMO_D15_LOCAL_FLOW_2026-11-14.md` est resté hors de cette modification : son état local contenait des notes antérieures qui ne sont pas réécrites ici. Aucun changement de base distante, réglage Netlify, déploiement ou suppression de worktree n’a été réalisé.
