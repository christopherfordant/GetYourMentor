# Architecture cible — GetYourMentor

## Objectif

Organiser GetYourMentor comme un produit web responsive de coaching sportif, fiable et évolutif, sans dépasser le périmètre MVP défini dans `DOCUMENT_MAITRE_GYM.md`.

Cette architecture est une cible progressive. Elle ne justifie pas une migration globale ni l'ajout de technologies uniquement parce qu'elles sont populaires.

## Décisions structurantes

| Domaine | Décision | Justification |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Stack déjà en place, adaptée au web responsive et au SEO. |
| Styles | CSS Modules et CSS global ciblé | Réduire les dépendances et préserver l'identité visuelle existante. |
| Backend web | Route Handlers Next.js | Garder les règles métier et les secrets côté serveur. |
| Données | Supabase/Postgres + RLS | Persistance, authentification et contrôle par rôle. |
| Paiement | Stripe via serveur et webhook signé | Ne jamais faire confiance au prix ou à l'état envoyés par le navigateur. |
| Emails | Resend, uniquement après configuration réelle | Notifications transactionnelles séparées du parcours principal. |
| Automatisation | n8n hors du chemin critique | Orchestration opérationnelle, jamais source de vérité métier. |
| Déploiement | Netlify + runtime Next.js | Contrat de déploiement déjà versionné. |
| Tests | TypeScript + Playwright + scripts de garde | Couvrir les parcours, les rôles, le responsive et les frontières de sécurité. |
| RAG | Phase ultérieure, retrieval hybride dans Supabase/pgvector | Ne pas ajouter un RAG cosmétique avant d'avoir un besoin mesurable. |
| MCP | Intégration ciblée, permissions minimales | Utiliser un pattern MCP seulement lorsqu'il simplifie un besoin identifié. |

## Structure cible

```text
GetYourMentor/
├─ docs/                         # décisions, architecture, spécifications, validation
│  └─ architecture/
├─ governance/                   # rôles, fil rouge, décisions et contrôle
├─ gym-next/                     # application web Next.js
│  ├─ app/                       # routes, pages et API minces
│  ├─ components/                # composants UI et parcours migrés
│  │  ├─ common/
│  │  ├─ home/
│  │  ├─ search/
│  │  ├─ booking/
│  │  ├─ account/
│  │  └─ legacy/                 # compatibilité temporaire uniquement
│  ├─ lib/                       # accès données, domaine et protections serveur
│  │  ├─ domain/                 # règles métier pures et types
│  │  ├─ repositories/           # Supabase ou adaptateurs de persistance
│  │  ├─ policies/               # autorisation et contrôles
│  │  └─ integrations/           # Stripe, Resend, n8n, fournisseurs externes
│  ├─ public/                    # assets réellement utilisés par l'application
│  ├─ tests/                     # tests fonctionnels et visuels
│  └─ scripts/                   # contrôles reproductibles et smoke tests
├─ supabase/                     # schémas, migrations et vérifications SQL
├─ n8n/                          # workflows exportables, hors logique critique
└─ prototype-site/               # référence historique jusqu'à validation complète
```

## Règles de frontières

1. Les pages `app/` composent l'interface ; elles ne contiennent pas de requêtes Supabase complexes ni de secrets.
2. Les Route Handlers valident les entrées, appliquent l'autorisation, appellent un service/repository et renvoient un contrat stable.
3. Les règles métier de réservation, paiement, annulation et visibilité coach sont testables sans navigateur.
4. Les accès Supabase sont regroupés derrière des adaptateurs ; aucune clé serveur ne doit atteindre un composant client.
5. Les composants `legacy` ne doivent pas être importés dans une nouvelle page sans justification et test de migration.
6. Les fichiers de démonstration et fallbacks ne sont disponibles que via les flags déjà prévus et jamais en production.
7. Les documents et workflows n8n ne deviennent pas une source de vérité concurrente au document maître et au schéma de données.

## Découpage métier recommandé

- **Discovery** : accueil, catalogue, recherche, filtres et fiche coach.
- **Booking** : créneaux, demande, acceptation coach, récapitulatif, annulation et code de réservation.
- **Payments** : montant serveur, Checkout Stripe, webhook, remboursement et états de paiement.
- **Identity** : inscription, connexion, session, rôles et déconnexion.
- **Spaces** : espaces sportif, coach, club léger et administration.
- **Trust** : vérification coach, avis, documents et règles de visibilité.
- **Operations** : rappels, emails, logs, health checks et supervision.

## RAG et MCP

Le RAG n'est pas placé dans le chemin critique des réservations ou paiements. Une future base documentaire pourra utiliser Supabase/Postgres + pgvector, avec retrieval hybride et métadonnées de priorité, conformément à `governance/ai/ARCHITECTURE_IA_RAG_GYM.md`.

Pour MCP, préférer une exposition minimale d'outils et choisir le pattern selon le besoin : wrapper d'API pour une API stable, composite pour un parcours regroupé, event-driven pour un traitement asynchrone. Aucun accès arbitraire aux fichiers, secrets, commandes ou réseaux.

## Plan de migration sans rupture

### Phase 0 — cadrage actuel

- conserver les changements non committés existants ;
- valider le build, les types, la configuration et les tests ;
- tenir cette architecture comme référence ;
- ne plus ajouter de nouvelle fonctionnalité dans `prototype-site/` sauf correction de référence.

### Phase 1 — frontières techniques

- extraire progressivement les types métier vers `gym-next/lib/domain/` ;
- isoler les repositories Supabase ;
- regrouper les règles d'autorisation et les validateurs ;
- maintenir les contrats API existants et leurs tests.

Première extraction réalisée : `gym-next/lib/domain/booking-rules.ts` contient les règles pures de créneaux, transitions et remboursements. `lib/reservations.ts` conserve son contrat public et délègue désormais le calcul du remboursement au domaine.

Deuxième extraction réalisée : `gym-next/lib/repositories/reservation-mapper.ts` centralise la conversion `Reservation` ↔ ligne Supabase. La couche persistence peut maintenant être isolée sans dupliquer le schéma dans les routes.

Troisième extraction réalisée : `gym-next/lib/repositories/reservation-slot-repository.ts` porte désormais les appels Supabase de claims/libération de créneaux. `lib/reservations.ts` conserve seulement des wrappers de compatibilité pour préserver l'erreur publique existante.

Quatrième extraction réalisée : `gym-next/lib/repositories/reservation-repository.ts` centralise la configuration de persistence, la mémoire de démonstration, la lecture, la création et les mises à jour de réservation. Les services métier conservent les contrôles de transition, de paiement et de remboursement, mais ne construisent plus directement les requêtes Supabase CRUD.

Cinquième extraction réalisée : `gym-next/lib/policies/authorization.ts` centralise les règles d'accès aux réservations et profils coach. Les routes conservent leurs messages et statuts HTTP, mais les décisions de rôle ne sont plus dupliquées dans chaque handler.

Sixième extraction réalisée : `gym-next/lib/domain/validation/reservation-input.ts` valide et normalise les données d'entrée d'une réservation avant l'appel au repository ou au coach. Cette validation est indépendante de Next.js et peut être testée ou réutilisée par d'autres adaptateurs.

Septième extraction réalisée : `gym-next/lib/domain/validation/coach-profile-input.ts` centralise les bornes et valeurs autorisées du profil coach, sans changer le contrat de la route de mise à jour.

Huitième extraction réalisée : `gym-next/lib/domain/validation/search-filters.ts` normalise les filtres du catalogue MVP et conserve les quatre sports autorisés, sans élargir le périmètre produit.

### Phase 2 — migration des composants

Migrer une capacité à la fois, dans l'ordre du document maître : accueil, recherche, sélection, réservation, créneau, récapitulatif, compte, paiement, inscription club. Pour chaque capacité : structure, styles, données, interactions, navigation, puis validation desktop/mobile.

### Phase 3 — exploitation

- brancher Supabase, Stripe et Resend réels en préproduction ;
- appliquer et tester la RLS ;
- exécuter les smoke tests et la recette multi-rôles ;
- seulement ensuite envisager RAG, MCP ou automatisations supplémentaires.

## Critères de sortie

Une étape est terminée seulement si :

- le périmètre respecte `DOCUMENT_MAITRE_GYM.md` ;
- les types et le build passent ;
- les tests métier et responsive passent ;
- aucun secret n'est exposé côté client ;
- le mode production échoue proprement sans configuration réelle ;
- la décision et les limites sont documentées ;
- le prototype de référence reste intact jusqu'à validation.

## Documents de référence

- `DOCUMENT_MAITRE_GYM.md`
- `MIGRATION_NEXT_GYM.md`
- `PREPRODUCTION_READINESS_GYM.md`
- `governance/ai/ARCHITECTURE_IA_RAG_GYM.md`
- `governance/FIL_ROUGE_OPERATOIRE_GYM.md`
- `C:/Users/cashe/Documents/projet_automatisations/docs/TECHNOLOGY_SELECTION_GUIDE.md`
- `C:/Users/cashe/Documents/projet_automatisations/docs/MCP_DESIGN_PATTERNS_GUIDE.md`
- `C:/Users/cashe/Documents/projet_automatisations/docs/RAG_RETRIEVAL_ARCHITECTURES_GUIDE.md`
