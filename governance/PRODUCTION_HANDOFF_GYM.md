# GetYourMentor — dossier de passage en préproduction

Dernière mise à jour : 2026-09-18  
Branche : `feat/nextjs-migration`  
Dernier commit livré sur la branche : `050f68e`

Ce document rassemble les contrôles des métiers nécessaires avant une ouverture publique. Il distingue les preuves locales des validations qui doivent être réalisées dans les comptes externes.

## État technique vérifié

- Build Next.js : réussi (`npm.cmd run build`).
- Playwright : 102/102 tests réussis, desktop et mobile.
- TypeScript, configuration Netlify, schéma SQL versionné, frontière des secrets, secrets suivis par Git et workflows n8n : contrôles réussis.
- Parcours fonctionnels couverts : recherche, localisation, filtres, fiche coach, réservation, acceptation, paiement, remboursement, fidélité, messagerie, avis, espace coach, espace sportif, inscription et espace établissement, administration.
- Géolocalisation : position du sportif pour la recherche, position du coach avec rayon d’intervention, position de l’établissement à l’inscription ; les coordonnées exactes du coach ne sont jamais exposées publiquement.
- Sécurité applicative : rôles côté serveur, sessions chiffrées, webhook Stripe signé, limitation d’entrées, limitation de fréquence, contrôle d’origine et absence de secret dans les artefacts client.

## Interventions par métier

### Produit

- Vérifier avec les premiers utilisateurs les quatre sports du MVP et le tunnel demande → validation coach → paiement.
- Confirmer les règles d’annulation : 100 % au-delà de 48 h, 50 % entre 24 h et 48 h.
- Ne pas activer les fonctionnalités V2/V3 exclues du MVP.

### Design et contenu

- Recetter les écrans desktop et mobile déjà couverts par l’audit visuel.
- Relire les textes en français, les états vides, les erreurs et les libellés de localisation.
- Fournir les contenus définitifs des pages juridiques avant indexation publique.

### Développement et QA

- Rejouer le build et la suite Playwright après chaque changement de configuration.
- Tester les rôles sportif, coach, établissement et admin avec des comptes réels de préproduction.
- Tester le paiement Stripe, le rejeu du webhook, les remboursements et les rappels avec des événements de test réels.

### Sécurité et données

- Appliquer `SUPABASE_APP_SCHEMA_GYM.sql` dans le projet de préproduction.
- Exécuter `SUPABASE_PREPRODUCTION_VERIFY.sql`.
- Vérifier RLS, bucket privé, politiques Storage, contraintes de créneau et absence de données de démonstration.
- Confirmer la rotation des secrets et la conservation minimale des pièces justificatives.

### DevOps et hébergement

- Variables Netlify déjà présentes ou configurées : Supabase, Stripe, Resend, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET` et `RESEND_FROM_EMAIL`.
- Contrat de build : base `gym-next`, commande `npm run build`, publication `.next`.
- Blocage actuel : Netlify refuse les nouveaux déploiements avec `Skipped due to account credit usage exceeded`. Le dernier commit n’est donc pas encore servi publiquement.
- Après résolution du quota : relancer un déploiement, vérifier `/api/health`, les logs, le domaine HTTPS et la procédure de rollback.

### SEO et accessibilité

- Métadonnées, canoniques, `robots.txt` et `sitemap.xml` présents.
- Pages privées et API exclues de l’indexation.
- Vérifier au dernier passage les contrastes, le clavier, les labels de formulaires, les messages d’erreur et le consentement cookies.

### Juridique et conformité

- Renseigner avec les informations réelles : raison sociale, adresse, immatriculation, directeur de publication et contact juridique.
- Faire valider CGV, CGU, confidentialité, cookies, accessibilité, TVA, frais, droit de rétractation et règles de remboursement.
- Ne pas définir `LEGAL_CONTENT_APPROVED=true` avant validation par la personne compétente.

### Opérations et support

- Préparer le traitement manuel des premières demandes coach et établissement.
- Définir les délais de réponse, le traitement des litiges, les remboursements et l’escalade des incidents.
- Préparer les indicateurs de lancement : coachs onboardés, recherches, demandes, confirmations, paiements et répétition des séances.

## Conditions de sortie

La mise en production n’est autorisée que lorsque les quatre conditions suivantes sont prouvées :

1. migrations et politiques Supabase appliquées et vérifiées ;
2. configuration Stripe/Resend testée avec événements réels de test ;
3. contenus juridiques validés et variables légales complètes ;
4. déploiement Netlify du commit courant réussi, puis smoke test HTTPS et recette multi-rôles validés.
