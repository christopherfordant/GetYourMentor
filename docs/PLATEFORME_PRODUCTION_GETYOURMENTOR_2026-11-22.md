# Mise en production de GetYourMentor — plan de fiabilisation

Date du cadrage : 22 novembre 2026
Source examinée : `demo/recruiter-supabase-adapter-20261112` à `b551debca6b51c9948ed775f083a9f048948f7c8`.

## Intention produit

Le site doit permettre à un membre de créer et vérifier son compte, trouver un coach, demander un créneau, recevoir la décision du coach, payer via Stripe Checkout/Connect, puis retrouver sa réservation dans son espace. Le parcours doit se dérouler dans l’interface GetYourMentor ; la page Stripe hébergée peut s’ouvrir dans le même onglet et revenir vers le site.

Le parcours recruteur de démonstration reste séparé : acteur fictif, réservation et paiement sans valeur financière, base isolée et effacement de ses seules données. Il ne doit jamais partager les variables, le projet Supabase ou les clés Stripe du produit réel.

## État vérifié

Contrôle HTTP en lecture seule le 22 novembre 2026 :

| Cible | Résultat | Interprétation |
| --- | --- | --- |
| Site Netlify principal, `/api/health` | `200`, `mode=demo`, `supabase=false`, `stripe=false`, `legal=false`, `cronSecret=false` | Ce runtime n’est pas configuré ni prêt pour des réservations/paiements réels. |
| Site Netlify principal, `/demo` | `404` | La version actuellement publiée ne sert pas la route de démo. |
| Aperçu de branche, `/api/health` | `200`, Supabase de démo actif, `recruiterDemo=ready` | L’aperçu vérifié est fonctionnel dans le périmètre de démonstration, pas en mode commercial. |

Le code du checkout et du webhook Stripe est explicitement limité aux objets et clés de test (`cs_test_`, `livemode=false`). Il refuse le mode live. L’aperçu n’est donc pas promouvable tel quel pour encaisser des paiements.

Sources de preuve : `docs/DEMO_D1_8_OUTILS_MCP_2026-11-21.md`, `docs/DEMO_D1_8_LOGIQUE_METIER_2026-11-21.md`, `docs/DEMO_INTEGRATION_SITE_2026-11-22.md` et les réponses publiques consignées ci-dessus. Aucun compte, donnée, variable secrète ou enregistrement distant n’a été consulté ou modifié dans ce cadrage.

## Choix d’architecture recommandés

1. **Deux environnements et deux données isolées.** Garder la démo recruteur sur son aperçu/site et son projet Supabase dédiés. Préparer un projet Supabase distinct pour la production et des contextes Netlify distincts. Ne pas réutiliser `getyourmentor-demo-recruiter`, `getyourmentor-preprod` ou l’ancien site `gregarious-fox-fff605` comme production sans audit et décision explicites.
2. **Authentification réelle.** Inscription avec e-mail vérifié, connexion, récupération de compte, limitation d’abus et révocation de session vérifiée côté serveur. L’audit statique du 22 novembre montre que le logout actuel expire le cookie du navigateur, mais ne démontre pas la révocation d’une enveloppe copiée ; voir `docs/PRODUCTION_AUTH_SESSION_AUDIT_2026-11-22.md`. Avant implémentation, comparer une session Supabase SSR et un registre de révocation durable partagé entre instances. Pour les courriels transactionnels, configurer un SMTP transactionnel vérifié dans Supabase Auth ; ne pas utiliser l’API Gmail personnelle comme moteur d’envoi du produit. N’ajouter le SMS qu’en présence d’un besoin produit précis et d’un fournisseur d’authentification compatible. Telegram est une notification facultative sur consentement, pas un mécanisme OTP par défaut.
3. **Réservation comme machine d’état serveur.** `requested → accepted | declined → payment_pending → paid`, avec annulation/remboursement comme états distincts. Le coach réellement responsable du profil décide ; aucun auto-accept fictif dans le parcours réel. Réservation de créneau atomique et idempotente ; l’interface ne peut jamais déclarer un paiement réussi à partir du seul retour du navigateur.
4. **Stripe Connect live séparé du mode test.** Créer/configurer les comptes Connect réels des coaches, vérifier le parcours d’onboarding, les frais plateforme retenus et leur base de calcul, le paiement, les webhooks signés, l’idempotence, les remboursements, contestations et rapprochements. Conserver le montant brut, les frais et les identifiants fournisseur nécessaires au suivi. Aucun passage en live tant que les responsabilités de plateforme, KYC et paramètres contractuels ne sont pas validés par le propriétaire.
5. **Après paiement : fermer la session, pas effacer l’historique transactionnel.** Une déconnexion automatique après confirmation est techniquement possible si le produit le confirme, mais supprimer immédiatement le compte, la réservation et le dossier de paiement casserait le suivi de séance, l’assistance, les remboursements, les contestations et les obligations de conservation. La recommandation est de révoquer la session ou d’afficher un bouton « Se déconnecter », tout en gardant les données nécessaires avec accès restreint. Une demande d’effacement doit supprimer/anonymiser les données non obligatoires et suivre une politique de rétention validée ; elle ne doit pas supprimer les pièces comptables qui doivent être conservées.
6. **Courriel et téléphone.** Le courriel vérifié suffit pour le premier lancement si le modèle de risque le permet. Une validation SMS peut être ajoutée ensuite via le fournisseur Auth/SMS choisi. L’API Telegram ne remplace pas un fournisseur de codes SMS ; Telegram peut envoyer des notifications de réservation uniquement après consentement explicite et avec un mécanisme de retrait.
7. **Qualité d’exploitation.** Vérifier RLS par rôles et propriété, secrets exclusivement serveur, journalisation sans donnée sensible, alertes d’échec de webhook, sauvegardes/restauration, migrations versionnées, environnements CI Preview/Staging/Production, tests des parcours et contrôle de rollback. Le SEO, les métadonnées, sitemap/robots, performance et accessibilité sont des critères de lancement, pas des arguments marketing inventés.

## Ordre des lots

Le détail des tickets, critères et dépendances est dans `tools/agentic-workbench/backlog.json` sous GYM-PROD. Un seul ticket actif à la fois ; les rôles sont des responsables de planification et ne représentent pas des agents réellement lancés.

1. Établir l’état de Production et les différences avec l’aperçu (fait dans ce lot).
2. Identifier/désigner les ressources de Production et vérifier leur isolation, sans afficher de valeurs secrètes.
3. Construire et tester l’authentification et le cycle de vie réel des comptes.
4. Fiabiliser le parcours réservation → décision coach → paiement en attente.
5. Créer le chemin Stripe Connect live après validation des prérequis opérateur et de paiement.
6. Ajouter les messages transactionnels requis et, séparément, une notification Telegram consentie si elle apporte une valeur démontrée.
7. Durcir sécurité, RLS, rétention, CI/CD et exploitation ; valider SEO, performance et accessibilité.
8. Recetter sur Staging isolé de bout en bout, y compris pannes, webhooks, conflits de créneau et reprise après reconnexion.
9. Revue de lancement et déploiement Production seulement après validation des critères, de la cible et des obligations opérateur.

## Actions volontairement différées

- Aucun secret ou token n’est récupéré, copié dans le dépôt ou demandé dans la conversation.
- Aucun projet Supabase ni site Netlify n’est créé, modifié ou reconfiguré dans ce lot.
- Aucun compte réel, e-mail, SMS, message Telegram, paiement, remboursement, migration distante ou déploiement Production n’a été exécuté.
- Le compte rendu n’annonce pas que le produit est prêt pour encaisser.

Le prochain blocage concret est la désignation et la vérification en lecture seule du projet Supabase de Production et du site/contexte Netlify de Production, distincts des ressources de démonstration et de préproduction. Le Kanban garde ce ticket bloqué jusqu’à l’existence de cette cible vérifiable.
