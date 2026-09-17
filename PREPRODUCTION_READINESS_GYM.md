# GetYourMentor — readiness préproduction

Ce document décrit l’état vérifié du MVP. Il ne remplace ni une validation juridique, ni un audit de sécurité indépendant, ni une recette utilisateur réelle.

## État des contrôles

| Contrôle | État | Preuve / remarque |
|---|---|---|
| Build Next.js production | PASS | `npm.cmd run build` passe et génère 25 routes, dont `/api/health` et `/api/auth/sign-out`. |
| Parcours fonctionnels Playwright | PASS | 78 tests réussis, incluant API, réservation, paiement, comptes, coach, admin, santé, limites d’entrée, déconnexion et responsive. |
| Vulnérabilités dépendances de production | PASS | `npm.cmd audit --omit=dev --audit-level=high` retourne `found 0 vulnerabilities`; Next.js est en 15.5.25. |
| Contrôles reproductibles CI | PASS | `.github/workflows/mvp-gates.yml` rejoue installation, audit, build et Playwright ; run GitHub vérifié avec succès sur `1291595`. |
| Fallback démonstration explicite | PASS | Les fallbacks mémoire/local ne sont autorisés qu’avec `GETYOURMENTOR_ALLOW_DEMO=true`; le run CI du garde-fou `bbb13bb` est vert. |
| Endpoint de santé | PASS | `/api/health` ne renvoie aucun secret et distingue le mode démo d’une configuration production dégradée. |
| Échec fermé sans secrets | PASS | Runtime vérifié : sans configuration réelle ni flag démo, `/api/health` répond `503 degraded` avec tous les contrôles à `false`. |
| Limites des entrées API | PASS | Limites de taille JSON/formulaire/webhook et bornes de champs ajoutées, avec test Playwright desktop/mobile. |
| Protection d’origine | PASS | Les mutations API provenant d’une origine étrangère sont refusées en production réelle ; le webhook sans en-tête `Origin` reste recevable. |
| Sessions multi-instance | PASS | En production, les sessions utilisent un cookie AES-GCM avec `SESSION_SECRET` et une durée de vie de 7 jours ; la `Map` mémoire reste limitée au mode démo. |
| Déconnexion | PASS | `POST /api/auth/sign-out` supprime le cookie et l’accès authentifié est refusé après déconnexion. |
| Données bancaires club | PASS | Le parcours club ne conserve que les 4 derniers caractères de l’IBAN ; l’IBAN complet n’est pas stocké dans le modèle métier. |
| SEO technique de base | PASS | Métadonnées, `/robots.txt` et `/sitemap.xml` ajoutés et servis par l’application. |
| En-têtes HTTP de base | PASS | `nosniff`, `Referrer-Policy`, `X-Frame-Options` et `Permissions-Policy` vérifiés sur la réponse HTTP. |
| Configuration de production | BLOCKED | Le contrôle `npm.cmd run check:production-config` détecte l’absence des secrets Supabase, Stripe, Resend et de l’URL HTTPS. |
| Paiement réel | BLOCKED | Le MVP reste en mode local tant qu’un compte Stripe, une clé serveur et un webhook ne sont pas configurés. |
| Emails transactionnels | BLOCKED | Resend et une adresse d’expédition vérifiée sont nécessaires. |
| Persistance/authentification réelle | BLOCKED | Supabase doit être créé, configuré, migré et testé avec ses politiques d’accès. |
| Contenus juridiques | BLOCKED | Les liens CGU, confidentialité et mentions légales pointent encore vers des ancres de démonstration. Aucun texte juridique ne doit être inventé. |
| Recette utilisateurs | À faire | Tests avec de vrais sportifs, coachs et administrateur à planifier. |
| Déploiement | À faire | Domaine HTTPS, variables protégées, monitoring, sauvegardes et procédure de rollback à définir. |

## Limites connues du mode MVP

- Le mode local mémoire est explicitement réservé à la démonstration (`GETYOURMENTOR_ALLOW_DEMO=true`) et n’est pas utilisable par inadvertance en production.
- Sans Supabase, les comptes, sessions et données métier ne sont pas persistants.
- Sans Stripe, le paiement réel n’est pas activé.
- Sans Resend, les notifications ne sont pas envoyées réellement.
- Les APIs publiques doivent encore être durcies avant exposition large : limitation de débit, journalisation, validation de taille des entrées et tests de charge ciblés.
- Les politiques RLS Supabase doivent être revues et testées avec les rôles sportif, coach, club et administrateur avant ouverture publique.

## Ordre de passage recommandé

1. Rédiger et valider les contenus légaux avec le responsable compétent.
2. Créer/configurer Supabase, appliquer `SUPABASE_APP_SCHEMA_GYM.sql`, puis tester les rôles et la RLS.
3. Créer/configurer Stripe en mode test, enregistrer le webhook et vérifier les transitions de réservation.
4. Créer/configurer Resend et tester les emails avec une adresse vérifiée.
5. Renseigner les variables dans l’environnement de préproduction et exécuter `npm.cmd run check:production-config`.
6. Déployer en préproduction HTTPS, exécuter les tests Playwright contre cette URL et réaliser la recette multi-rôles.
7. Corriger les écarts, effectuer une revue sécurité finale, puis seulement décider d’une mise en production.

## Garde ajoutée

Le script `gym-next/scripts/check-production-config.mjs` échoue volontairement si une configuration de production est incomplète. Il ne journalise aucune valeur secrète.
