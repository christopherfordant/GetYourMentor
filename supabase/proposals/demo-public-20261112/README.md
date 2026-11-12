# Proposition de stockage de la démo publique

Cette proposition n'est **ni une migration prête à appliquer ni une intégration applicative**. Elle ne doit jamais être appliquée à `getyourmentor-preprod` ni à une base de production. Le projet de démo n'étant pas disponible, aucune cible ne peut être associée ou testée.

Le schéma isole des sessions coach/sportif rattachées à `auth.users`, des profils fictifs, des réservations de démonstration dont validation et paiement sont contraints à `simulated`, et une liaison Telegram optionnelle avec identifiant chiffré côté serveur. Les clients ne peuvent lire que les profils fictifs publics et les données auxquelles leur `auth.uid()` est associé. Les mutations de réservations et le cycle Telegram restent côté serveur ; les routes devront revérifier l'identité et le propriétaire avant d'utiliser `service_role`.

La suppression d'une session efface ses profils coach et ses réservations sportives. La suppression du compte Auth nécessite une route serveur authentifiée qui supprime uniquement l'utilisateur courant après confirmation ; supprimer un coach ne doit pas supprimer les réservations appartenant aux sportifs. Les clés de chiffrement et `service_role` ne sont jamais envoyées au client.

## Prérequis d'exécution

- projet Supabase dédié à la démonstration, avec politiques et API configurées ;
- Supabase CLI, Docker et PostgreSQL de test disponibles ;
- deux utilisateurs Auth jetables créés dans la transaction de test ;
- revue du schéma et des migrations de l'application avant d'ajouter les adaptations du dépôt.

Le fichier `002_demo_rls_tests.sql` prépare 34 assertions pgTAP avec trois utilisateurs synthétiques : visiteur `anon`, deux testeurs distincts (coach et sportifs) sous `authenticated`, et vérification des privilèges du service serveur. Il inclut visibilité inter-testeurs, suppression refusée d'une session étrangère et d'une fixture commune, effacement propre et maintien des données de l'autre testeur, consentement/révocation Telegram et rejet des modes d'approbation/paiement non simulés. Il devra être revu puis exécuté par `supabase test db` sur une base locale jetable avant toute migration distante.

Aucun résultat pgTAP ou RLS réelle n'est revendiqué dans cette livraison. Seuls le contrôle statique et l'intégrité textuelle sont exécutables ici : Supabase CLI, `psql` et Docker ne sont pas disponibles. Le rôle `anon` reçoit `SELECT` sur les sessions uniquement parce que la politique des coachs fictifs évalue une sous-requête sur cette table ; aucune politique de session ne cible `anon`, donc RLS doit lui renvoyer zéro ligne. Les coachs fictifs restent les seules lignes publiques des profils.
