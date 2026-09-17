# GetYourMentor — runbook de préproduction

Ce runbook prépare une préproduction contrôlée. Il ne constitue pas une validation juridique, une certification de sécurité ou une recette utilisateur.

## 1. Préparer Supabase

1. Créer un projet Supabase dédié à la préproduction, distinct d’une éventuelle production.
2. Exécuter `SUPABASE_SCHEMA_GYM.sql` si le schéma mémoire de projet est nécessaire.
3. Exécuter ensuite `SUPABASE_APP_SCHEMA_GYM.sql`.
4. Vérifier l’existence des tables `public.gym_coaches`, `public.gym_reservations`, `public.gym_reviews`, `public.gym_messages`, `public.gym_reservation_slot_claims` et `public.gym_club_leads`.
5. Vérifier que la RLS est activée sur ces six tables.
6. Vérifier que l’accès direct anonyme ne permet aucune lecture ou écriture inattendue.

Le MVP utilise actuellement des appels serveur avec la clé `SUPABASE_SERVICE_ROLE_KEY`. Cette clé ne doit jamais être envoyée au navigateur. Les tables ont la RLS activée et aucune politique client générique n’est ajoutée par le script : toute ouverture d’accès direct devra faire l’objet d’une conception et de tests RLS par rôle.

Les champs `logo` et `identity` sont envoyés côté serveur vers le bucket privé `club-documents` lorsque Supabase est configuré ; seuls les noms et chemins internes sont conservés dans la demande, jamais une URL publique. Avant de considérer les justificatifs comme archivés, appliquer le schéma, tester les politiques privées, ajouter l’accès admin par URL signée courte et définir la procédure de suppression/rétention.

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
```

Le contrôle de configuration doit réussir sans utiliser `GETYOURMENTOR_ALLOW_DEMO`.

Avant d’ouvrir la préproduction, vérifier aussi l’existence de `public.gym_reservation_slot_claims` et l’unicité de `(coach_id, slot)`. Deux créations simultanées sur un même coach et un même créneau doivent produire une seule réponse acceptée et une réponse `409`.

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

## 6. Rollback

Avant toute migration ou activation de service : conserver le commit déployé, la sauvegarde Supabase et la configuration de l’environnement. En cas d’échec, revenir au dernier commit validé par la CI, désactiver le webhook de préproduction si nécessaire et restaurer uniquement après diagnostic.
