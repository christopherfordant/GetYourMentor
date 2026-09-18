# GetYourMentor — dossier de preuves de préproduction

Ce document est un modèle d’archivage. Il ne contient aucun secret et ne vaut
ni validation juridique, ni audit de sécurité indépendant, ni recette utilisateur.
Compléter chaque section avec la date, l’environnement et un lien ou un fichier
de preuve. Ne jamais y copier une clé, un token, un webhook secret ou une donnée
personnelle inutile.

## 1. Identité de la version testée

- Commit déployé : `À renseigner`
- Branche / tag : `À renseigner`
- Date UTC : `À renseigner`
- URL de préproduction : `À renseigner`
- Environnement : `préproduction uniquement`
- Responsable de la validation : `À renseigner`

## 2. Supabase

- Projet de préproduction : identifiant non sensible uniquement
- Migration `SUPABASE_APP_SCHEMA_GYM.sql` appliquée le : `À renseigner`
- Script `SUPABASE_PREPRODUCTION_VERIFY.sql` exécuté le : `À renseigner`
- Résultat archivé dans : `À renseigner`
- Six tables présentes et RLS active : `À valider`
- Bucket `club-documents` privé : `À valider`
- Coachs vérifiés initiaux documentés : `À valider`
- Test anon/service role séparé : `À valider`
- Rétention et suppression des pièces club définies : `À valider`

## 3. Stripe — mode test

- Compte et environnement test identifiés : `À renseigner`
- Endpoint webhook préproduction configuré : `À valider`
- Événement signé demande → paiement testé : `À valider`
- Signature invalide refusée : `À valider`
- Événement rejoué traité sans double effet : `À valider`
- Preuve archivée sans secret ni numéro de carte : `À renseigner`

- `payment_intent` conservé et remboursement idempotent testé : `À valider`
- Échec du remboursement : réservation conservée dans un état cohérent : `À valider`

## 4. Resend

- Domaine ou adresse d’envoi vérifié : `À valider`
- Email de confirmation reçu sur une adresse de recette : `À valider`
- Contenu et logs vérifiés sans donnée sensible inutile : `À valider`
- Preuve archivée : `À renseigner`

## 5. Netlify et runtime

Mise à jour du 18/09/2026 : la branche `feat/nextjs-migration` contient le commit `1b1f144` et le build local Netlify valide la base `gym-next`, la publication `.next`, le runtime Next.js et la fonction planifiée des rappels H-72. Le site public `gregarious-fox-fff605.netlify.app` répond en HTTPS et `/api/health` renvoie `status: ok`, mais les routes récentes renvoient encore `404` : le site public n’est donc pas aligné sur cette branche. Une publication CLI a de nouveau été refusée par Netlify avec `403 Forbidden`. La migration Supabase réelle et la recette Stripe/Resend restent à valider séparément.

- Site relié au dépôt et à la branche attendue : `À valider`
- Build Netlify réussi avec `gym-next` et `.next` : `À valider`
- Variables protégées configurées dans l’interface Netlify : `À valider`
- `GET /api/health` renvoie `status: ok`, `mode: production`, `ready: true` : `À valider`
- `BASE_URL=... npm.cmd run check:preproduction-runtime` réussi : `À valider`
- HTTPS, domaine et redirections vérifiés : `À valider`
- Logs d’erreur et alerte de santé configurés : `À valider`
- Procédure de rollback testée ou approuvée : `À valider`

## 6. Recette fonctionnelle multi-rôles

- Sportif : inscription, recherche, demande, acceptation, paiement test, annulation, avis : `À valider`
- Coach : inscription, profil, créneaux, acceptation/refus, messages : `À valider`
- Club : demande d’affiliation, statut propre, accès isolé : `À valider`
- Administrateur : vérification coach et consultation minimale : `À valider`
- Isolation entre comptes et rôles : `À valider`
- Responsive 360, 390, 768 et 1440 px : `À valider`
- Aucun contenu de démonstration exposé en production : `À valider`

## 7. Validation finale avant ouverture

- Contenus juridiques fournis et validés par le responsable compétent : `À valider`
- Politique de support, remboursement et incident : `À valider`
- Données de test supprimées ou clairement isolées : `À valider`
- Approbation explicite pour ouvrir la préproduction aux utilisateurs de recette : `À valider`

## Règle d’archivage

Une section marquée `À valider` ne doit pas être présentée comme terminée.
Archiver les sorties de commandes et captures dans un espace contrôlé, en
masquant les secrets, tokens, adresses personnelles et données bancaires.
