# GetYourMentor — runbook de préproduction

Ce runbook prépare une préproduction contrôlée. Il ne constitue pas une validation juridique, une certification de sécurité ou une recette utilisateur.

## 1. Préparer Supabase

1. Créer un projet Supabase dédié à la préproduction, distinct d’une éventuelle production.
2. Exécuter `SUPABASE_SCHEMA_GYM.sql` si le schéma mémoire de projet est nécessaire.
3. Exécuter ensuite `SUPABASE_APP_SCHEMA_GYM.sql`. Ce script crée uniquement la
   structure et n’injecte aucun coach de démonstration.
4. Vérifier l’existence des tables `public.gym_coaches`, `public.gym_reservations`, `public.gym_reviews`, `public.gym_messages`, `public.gym_reservation_slot_claims` et `public.gym_club_leads`.
5. Créer uniquement des profils coach réels, documentés et vérifiés ; un catalogue
   vide est attendu tant que la recette administrateur n’est pas effectuée.
6. Vérifier que la RLS est activée sur ces six tables.
7. Vérifier que l’accès direct anonyme ne permet aucune lecture ou écriture inattendue.

Requêtes de contrôle à exécuter dans l’éditeur SQL Supabase :

```sql
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('gym_coaches', 'gym_reservations', 'gym_reviews',
    'gym_messages', 'gym_reservation_slot_claims', 'gym_club_leads')
order by c.relname;

select id, name, public
from storage.buckets
where id = 'club-documents';

select count(*) as initial_verified_coaches
from public.gym_coaches
where verified = true;
```

Résultats attendus avant recette : les six lignes indiquent `rls_enabled = true`,
le bucket `club-documents` indique `public = false`, et le catalogue vérifié est
vide tant qu’aucun coach réel n’a été validé. Tester ensuite les lectures et
écritures avec les clés anon et service role séparément ; ne jamais utiliser la
clé service role dans le navigateur.

Le MVP utilise actuellement des appels serveur avec la clé `SUPABASE_SERVICE_ROLE_KEY`. Cette clé ne doit jamais être envoyée au navigateur. Les tables ont la RLS activée et aucune politique client générique n’est ajoutée par le script : toute ouverture d’accès direct devra faire l’objet d’une conception et de tests RLS par rôle.

Les champs `logo` et `identity` sont envoyés côté serveur vers le bucket privé `club-documents` lorsque Supabase est configuré ; seuls les noms et chemins internes sont conservés dans la demande, jamais une URL publique. L’endpoint admin `/api/admin/club-leads/[id]/documents/[kind]` vérifie le rôle, renvoie une URL signée de 5 minutes et expose une suppression ciblée par `DELETE`. Avant de considérer les justificatifs comme archivés, appliquer le schéma, tester les politiques privées et définir la durée de rétention ainsi que la procédure de suppression.

Les rôles applicatifs Supabase doivent être conservés dans `app_metadata`, mis à jour uniquement côté serveur avec la clé service role. Ne pas utiliser `user_metadata` pour autoriser un accès coach ou administrateur, car ces métadonnées peuvent être modifiées par l’utilisateur.

## 2. Renseigner les variables protégées

Dans l’environnement de préproduction uniquement, renseigner les noms suivants à partir de valeurs générées par les services :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET` avec au moins 32 caractères aléatoires
- `NEXT_PUBLIC_APP_URL` avec une URL HTTPS réelle
- `PAYMENT_PROVIDER=stripe`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Ne jamais committer un fichier `.env.local`, une clé Stripe, une clé Supabase service role ou une clé Resend.

Avant déploiement, exécuter :

```powershell
cd C:\Users\cashe\Documents\GetYourMentor\gym-next
npm.cmd run check:production-config
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=high
npx.cmd playwright install chromium
npx.cmd playwright test --reporter=line --workers=1
```

Le contrôle de configuration doit réussir sans utiliser `GETYOURMENTOR_ALLOW_DEMO`.
Il vérifie aussi les URLs HTTPS, les placeholders et les formats attendus des clés Stripe/Resend ; il ne journalise aucune valeur secrète.

La limitation de fréquence applicative est un premier garde-fou par processus. Avant ouverture publique ou déploiement multi-instance, compléter avec une règle edge/WAF ou un store partagé (par exemple Redis) et vérifier les seuils avec les limites du fournisseur.

La suite Playwright doit être exécutée avec un worker unique afin d’éviter les
collisions entre scénarios qui partagent le store de démonstration local. Elle
couvre les parcours API, réservation, paiement, comptes, administration,
inscription club, sécurité des accès, responsive et pages juridiques de
préproduction. La CI reprend exactement cette commande.

Avant d’ouvrir la préproduction, vérifier aussi l’existence de `public.gym_reservation_slot_claims` et l’unicité de `(coach_id, slot)`. Deux créations simultanées sur un même coach et un même créneau doivent produire une seule réponse acceptée et une réponse `409`.

Pour une demande créée avant connexion, conserver le `claimToken` renvoyé par
`POST /api/reservations` dans le parcours de navigation jusqu’au paiement. Les
lectures détaillées et le paiement exigent ce jeton tant que la demande n’a pas
encore de propriétaire ; ne jamais le journaliser. Après un Checkout Stripe,
vérifier que l’email du client est rattaché à la réservation par le webhook.

## 3. Configurer les services externes

### Stripe

- Utiliser d’abord le mode test.
- Configurer l’endpoint `POST /api/webhooks/stripe` sur l’URL HTTPS de préproduction.
- Conserver et renseigner le secret de signature du webhook.
- Vérifier le scénario demande → acceptation coach → Checkout → webhook signé → réservation payée.
- Vérifier les signatures invalides et les événements rejoués.

### Resend

- Vérifier le domaine ou l’adresse d’expédition.
- Renseigner `RESEND_FROM_EMAIL` avec une adresse autorisée.
- Tester une confirmation avec une adresse de recette.
- Vérifier qu’aucune donnée sensible inutile n’apparaît dans le contenu de l’email ou les logs.

## 4. Vérifier le runtime déployé

Après déploiement, appeler `GET /api/health`.

Résultat attendu en préproduction configurée :

```json
{
  "status": "ok",
  "mode": "production",
  "ready": true
}
```

Les champs `checks` doivent tous être à `true`. Si la réponse est `503` avec `status: degraded`, ne pas ouvrir l’environnement aux utilisateurs.

## 5. Recette avant ouverture

- Sportif : inscription, recherche, demande de réservation, réception du message, paiement test, annulation, avis.
- Coach : inscription, profil, réception de demande, acceptation/refus, créneaux, messages.
- Administrateur : consultation, vérification d’un coach, contrôle des données.
- Sécurité : accès entre comptes, URLs directes, webhook invalide, absence de secrets côté client.
- Responsive : mobile 360/390 px, tablette 768 px, desktop 1440 px.
- Observabilité : logs d’erreur, santé, webhook, email, rollback documenté.

## Smoke test production sans secrets

Après le build, exécuter `npm.cmd run check:production-safety`. Ce smoke test
démarre le bundle avec des variables vides et vérifie que l’application reste
fermée sans services réels : santé `503`, tunnel de réservation indisponible et
catalogue sans coach de démonstration.

## 6. Rollback

Avant toute migration ou activation de service : conserver le commit déployé, la sauvegarde Supabase et la configuration de l’environnement. En cas d’échec, revenir au dernier commit validé par la CI, désactiver le webhook de préproduction si nécessaire et restaurer uniquement après diagnostic.
