# GYM-D1.3 — état de la proposition de schéma

Mis à jour le 13 novembre 2026 depuis le Kanban du dépôt principal.

La proposition additive est conservée sur la branche de travail isolée `demo/recruiter-supabase-adapter-20261112`, commit `ebd5ea40cff3076f57a14d3e0d12249417a7d4f5`. Elle ajoute des créneaux, le rejeu idempotent des réservations, les transitions atomiques, un rollback gardé, des tests pgTAP proposés et un smoke PostgreSQL 12 avec shim local. Elle n’est pas intégrée au checkout principal ni au produit.

## Contrôles

- Le validateur statique de la proposition passe.
- Le smoke tourne sur un cluster PostgreSQL 12.15 jetable, séparé du service PostgreSQL présent sur la machine. Il vérifie l’accès aux seuls créneaux fixture pour anon, la confidentialité d’un créneau coach privé, l’interdiction des mutations navigateur, le rejeu identique, le refus d’un rejeu divergent, l’indisponibilité d’un créneau déjà réservé, la libération après annulation et les transitions finales.
- Le rollback a refusé une table contenant un créneau sans supprimer la donnée, puis a réussi après suppression de la donnée de test.
- Les 35 tests Node de l’atelier Kanban passent.

## Limites et suite

Le smoke avec un shim n’équivaut pas à Supabase. Les 25 assertions pgTAP de la proposition n’ont pas été exécutées : le Supabase CLI et pgTAP ne sont pas disponibles dans l’environnement vérifié. La concurrence réelle entre deux transactions n’a pas été exercée. Aucun changement Supabase distant, Netlify ou applicatif n’a été effectué.

GYM-D1.3 reste **En cours**. Prochaine étape selon le ticket : exécuter la suite pgTAP sur une instance Supabase locale/jetable, contrôler les droits/fonctions dans son environnement réel et tester deux réservations concurrentes avant d’intégrer l’adaptateur. Ne pas marquer le ticket terminé sur la seule base du smoke PostgreSQL.

Résultats détaillés et limites sur la branche de travail : `docs/assets/demo-schema-d13-2026-11-13/CONTROL_RESULTS.md`.
