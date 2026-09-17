# GetYourMentor — readiness préproduction

Ce document décrit l’état vérifié du MVP. Il ne remplace ni une validation juridique, ni un audit de sécurité indépendant, ni une recette utilisateur réelle.

## État des contrôles

| Contrôle | État | Preuve / remarque |
|---|---|---|
| Build Next.js production | PASS | `npm.cmd run build` passe et génère 24 routes, dont `/api/health` et `/api/auth/sign-out`. |
| Parcours fonctionnels Playwright | PASS local / À revalider CI | Le 2026-09-18, 44/44 tests passent sur `desktop-chromium` et 44/44 sur `mobile-chromium` (88/88 local, mono-worker), incluant API, réservation, paiement, comptes, coach, admin, santé, limites d’entrée, bornes de créneau, déconnexion, confidentialité des réservations, minimisation bancaire, webhook invalide, catalogue vérifié, workflow club, validation MIME et responsive. La CI distante doit être revalidée après les derniers commits. |
| Vulnérabilités dépendances de production | PASS | `npm.cmd audit --omit=dev --audit-level=high` retourne `found 0 vulnerabilities`; Next.js est en 15.5.25. |
| Contrôles reproductibles CI | À revalider CI | `.github/workflows/mvp-gates.yml` rejoue installation, audit, contrôle de configuration, build et Playwright. Le run historique `35272360288` concernait `cf0e0e5` ; il ne constitue pas une preuve des commits actuels. |
| Fallback démonstration explicite | PASS | Les fallbacks mémoire/local ne sont autorisés qu’avec `GETYOURMENTOR_ALLOW_DEMO=true`; le run CI du garde-fou `bbb13bb` est vert. |
| Endpoint de santé | PASS | `/api/health` ne renvoie aucun secret et distingue le mode démo d’une configuration production dégradée. |
| Échec fermé sans secrets | PASS | Runtime vérifié : sans configuration réelle ni flag démo, `/api/health` répond `503 degraded` avec tous les contrôles à `false`. |
| Limites des entrées API | PASS | Limites de taille JSON/formulaire/webhook et bornes de champs ajoutées, avec test Playwright desktop/mobile. |
| Protection d’origine | PASS | Les mutations API provenant d’une origine étrangère sont refusées en production réelle ; le webhook sans en-tête `Origin` reste recevable. |
| Sessions multi-instance | PASS | En production, les sessions utilisent un cookie AES-GCM avec `SESSION_SECRET` et une durée de vie de 7 jours ; la `Map` mémoire reste limitée au mode démo. |
| Déconnexion | PASS | `POST /api/auth/sign-out` supprime le cookie et l’accès authentifié est refusé après déconnexion. |
| Données bancaires club | PASS | Le parcours club ne conserve que les 4 derniers caractères de l’IBAN ; l’IBAN complet n’est pas stocké dans le modèle métier. |
| Rôles Supabase | PASS code / À valider en préproduction | Les rôles sont lus depuis `app_metadata` et écrits côté serveur ; il reste à vérifier la migration des comptes réels et les accès par rôle dans Supabase. |
| Catalogue coach persistant | PASS code / À valider en préproduction | La page `/coachs` lit le catalogue serveur quand Supabase est configuré et utilise les identifiants coach persistés ; les disponibilités doivent encore être validées avec les données réelles. |
| Absence de faux catalogue en production | PASS code / À valider Supabase | Si Supabase est configuré mais ne contient aucun coach, l’application renvoie un catalogue vide ; les coachs de démonstration ne sont utilisés que dans le mode démo explicite. |
| Vérification coach avant exposition | PASS code / À valider recette admin | Le catalogue public, la fiche publique, la messagerie et la réservation refusent les profils non vérifiés ; l’accès privé du coach et de l’administrateur reste disponible. |
| Demandes club persistantes | PASS code / À valider Supabase | Les demandes club sont stockées dans `gym_club_leads` quand Supabase est configuré ; le mode mémoire reste limité à la démonstration et seuls les noms de fichiers et quatre caractères d’IBAN sont conservés. |
| Stockage des pièces club | PASS code / BLOCKED préproduction | Les fichiers sont envoyés côté serveur vers un bucket Supabase Storage privé, sous un chemin isolé par demande, avec nettoyage en cas d’échec et validation de taille/MIME. Un endpoint admin vérifie le rôle et renvoie une URL signée de 5 minutes ; il reste à appliquer le schéma, tester les politiques d’accès et définir la rétention/suppression avant archivage réel. |
| Tarif de réservation | PASS | Le montant d’une réservation est désormais dérivé du tarif du coach côté serveur ; le prix envoyé par le navigateur est ignoré et couvert par le parcours API. |
| Confidentialité des réservations | PASS | La lecture publique renvoie uniquement les créneaux occupés ; les listes détaillées exigent un rôle autorisé et sont filtrées par sportif, coach ou administrateur. |
| Minimisation des données coach | PASS | `bankAccountLast4` est retiré des réponses publiques ; il reste réservé aux usages serveur du profil coach autorisé. |
| Bornes des données métier | PASS | Les créneaux, dates et tarifs de profil sont bornés côté serveur avant traitement ou persistance. |
| Concurrence des créneaux | PASS code / À valider Supabase | Une contrainte unique `(coach_id, slot)` dans `gym_reservation_slot_claims` protège les créations concurrentes après application du schéma ; les conflits sont renvoyés en `409`. |
| SEO technique de base | PASS | Métadonnées, `/robots.txt` et `/sitemap.xml` ajoutés et servis par l’application. |
| En-têtes HTTP de base | PASS | `nosniff`, `Referrer-Policy`, `X-Frame-Options` et `Permissions-Policy` vérifiés sur la réponse HTTP. |
| Configuration de production | BLOCKED | Le contrôle `npm.cmd run check:production-config` détecte l’absence des secrets Supabase, Stripe, Resend et de l’URL HTTPS. |
| Tunnel sans données réelles | PASS code / À valider préproduction | En mode production sans Supabase ou sans coach vérifié, `/creneau`, `/recapitulatif` et `/paiement` affichent un état indisponible et ne présentent pas les valeurs de démonstration. |
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
