# Adaptateurs de laboratoire H1.2.2

Le CLI fixture-only initial reste intact. Nouveau CLI operateur local, pour une base de laboratoire provisionnee separement :

```powershell
node --test tools/payment-reconciliation/*.test.mjs
node tools/payment-reconciliation/operator-cli.mjs --database CHEMIN_LAB_SQLITE --operator-file CHEMIN_TOKEN_PRIVE --provider-key-file CHEMIN_CLE_FICTIVE --ids res-fixture-1
node tools/payment-reconciliation/operator-cli.mjs --database CHEMIN_LAB_SQLITE --operator-file CHEMIN_TOKEN_PRIVE --provider-key-file CHEMIN_CLE_FICTIVE --ids res-fixture-1 --mode resume
```

Les chemins ci-dessus sont des emplacements a remplacer, jamais des valeurs secretes. Le premier appel est un diagnostic. Aucun assistant de connexion ni coffre reel n'est necessaire pour reproduire les tests.

La commande de tests cree automatiquement les faux serveurs HTTP127.0.0.1, initialise les bases temporaires et les operateurs/cles fictifs, execute ces deux modes puis nettoie les seuls fichiers crees. Elle teste aussi les processus distincts. Pour comprendre la preparation manuelle, voir la fonction lab dans adapters.test.mjs : initializeLab provisionne la base neuve avec rows,environment,bindings et operator; il ne fait pas partie du chemin CLI autorise. Ne pas utiliser de copie de donnees reelles.

SQLite est exclusivement un backend de laboratoire, Supabase du produit reste inchange. L'operateur ne peut pas donner un role/permission JSON : sa cle doit correspondre a un hash, modes, cibles et expiration deja provisionnes dans la base. Les protections sont cote programme local; toute personne qui peut modifier directement les fichiers de base peut en modifier l'autorite. Conserver fichiers et ACL hors de portee des utilisateurs non autorises. Aucun endpoint de maintenance n'ecoute.

Les URL autorisees sont uniquement http://127.0.0.1:PORT sans identifiant, query ou fragment. Ni localhost/DNS, ni redirection ou proxy automatique. Enregistrement distant et cles live refuses. Le token fournisseur des tests est une simple fixture, pas un acces Stripe. Les requetes HTTP sont uniquement GET.

Sch?ma et rollback sont SQLite local uniquement; ne pas les lancer sur Supabase. Pour une verification complete : docs/RECONCILIATION_ADAPTATEURS_H1_2_2_2026-11-05.md. Les avertissements Node relatifs a SQLite experimental et a la detection du module TypeScript sont attendus avec Node24.14, sans installation ni modification de package.

## Preparation PostgreSQL H1.2.3 - 5 novembre

Port explicite localPostgres/postgresStore/runPostgresMaintenance, PostgreSQL12.15 isole, aucun acces Supabase/Stripe. Instructions et limites : ../../docs/RECONCILIATION_POSTGRES_H1_2_3_2026-11-05.md. Les scripts postgres-rehearsal.mjs puis postgres-integration.mjs exigent GYM_LOCAL_PG_PORT=55441 et un cluster jetable vierge cree explicitement. Ils ne font pas partie de la commande historique *.test.mjs et ne s'executent pas implicitement. Ne jamais les lancer sur une base existante. Pas de client distant, ni de secrets charges. Ne pas supprimer les protections loopback.
