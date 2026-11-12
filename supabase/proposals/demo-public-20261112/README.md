# Schéma de démonstration recruteur — état courant

Le schéma de `001_demo_schema.sql` est appliqué uniquement au projet Supabase dédié `getyourmentor-demo-recruiter` (réf. non secrète `rqxoovriacgoriimpbwi`, région Paris, offre Free). Il ne doit jamais être appliqué à `getyourmentor-preprod` ou à une base de production.

Le modèle sépare les sessions coach/sportif, les profils fictifs, les réservations dont l'approbation et le paiement sont contraints à `simulated`, et les liaisons Telegram protégées côté serveur. L'accès est limité par RLS. Les parcours et mutations applicatifs ne sont pas encore implémentés.

## Contrôles

`002_demo_rls_tests.sql` contient 34 assertions pgTAP avec identités synthétiques. Les tests ont été exécutés dans le projet dédié : les 34 assertions passent. Ils couvrent les accès anon, sportif, coach et service, l'isolation des données, les fixtures, l'effacement, Telegram et le rejet des modes réels. Les données synthétiques sont dans une transaction annulée ; une vérification a confirmé zéro utilisateur de test, session, coach, réservation ou liaison Telegram restant.

Consulter `docs/SUPABASE_DEMO_PROVISION_2026-11-12.md` pour les preuves et les limites. Le résultat ne valide ni l'application, ni le site Netlify, ni la sécurité globale.

## Garde-fous et suite

- Aucun secret ou clé de projet dans Git ou la conversation ; les secrets sont à saisir uniquement dans le gestionnaire du site démo confirmé.
- Le projet de recette `getyourmentor-preprod` et le projet personnel en pause n'ont pas été touchés.
- Le site GetYourMentor du portfolio n'est pas connecté à cette base.
- Préparer une migration de retour et examiner la compatibilité des routes avant l'intégration.
- Confirmer le site Netlify exact depuis le lien du portfolio avant d'y configurer la moindre variable.
- Ne pas annoncer un vrai coach IA, un paiement réel, ou une notification Telegram fonctionnelle : aucun n'est raccordé ici.
