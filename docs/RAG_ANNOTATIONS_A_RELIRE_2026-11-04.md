# Passages proposés à la relecture humaine

Aucune annotation validée par un humain. Ces candidats automatiques ne constituent pas un jeu de référence indépendant. Pour chaque question : confirmer/rejeter les passages, ajouter les omissions, noter le motif et la date.

## historical:source-of-truth

Quel document est la source de vérité du produit ?

Statut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.

- master:187:1200 — DOCUMENT_MAITRE_GYM.md:571–572, version a4f5786bd2a183bec05cdbdfad6a2abf99f7e5a703b68514cfc123b429f0cdf4

> un premier module de fidelite.
> 13. L'equipe se donne une verite unique dans ce document maitre.

- master:5:0 — DOCUMENT_MAITRE_GYM.md:11–11, version a4f5786bd2a183bec05cdbdfad6a2abf99f7e5a703b68514cfc123b429f0cdf4

> > Parcours recruteur — 22 octobre : [correction de la note transitoire et preuves](docs/REVUE_RECRUTEUR_2026-10-22.md). Source de vérité API, états attente/erreur/absent distincts et données de démonstration explicites. Lot local ciblé, aucun déploiement ; les règles métier restent inchangées.

Décision humaine : ______ ; passages manquants : ______ ; motif/date : ______

## historical:critical-path

Le RAG peut-il décider ou bloquer une réservation ou un paiement ?

Statut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.

- architecture:13:0 — docs/architecture/ARCHITECTURE_TARGET_GYM.md:76–76, version c794f3dbc551315332f198c188e20e0cc44f253092907e2db93bdba92b2e7e3f

> Le RAG n'est pas placé dans le chemin critique des réservations ou paiements. Une future base documentaire pourra utiliser Supabase/Postgres + pgvector, avec retrieval hybride et métadonnées de priorité, conformément à `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`.

- memory-rag:34:0 — docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md:90–93, version f31d17b850b56d2229970b1947e7250aba84b6507ee05329ed8c773bc57bfb19

> - relier Trello, n8n, Supabase et les documents ;
> - automatiser l’ingestion et les briefs ;
> - exposer uniquement les outils MCP nécessaires, avec droits minimaux ;
> - garder le RAG hors du chemin critique de réservation, paiement et authentification.

Décision humaine : ______ ; passages manquants : ______ ; motif/date : ______

## historical:mcp-safety

Quels accès sont interdits à un outil MCP ?

Statut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.

- architecture:14:0 — docs/architecture/ARCHITECTURE_TARGET_GYM.md:78–78, version c794f3dbc551315332f198c188e20e0cc44f253092907e2db93bdba92b2e7e3f

> Pour MCP, préférer une exposition minimale d'outils et choisir le pattern selon le besoin : wrapper d'API pour une API stable, composite pour un parcours regroupé, event-driven pour un traitement asynchrone. Aucun accès arbitraire aux fichiers, secrets, commandes ou réseaux.

- memory-rag:34:0 — docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md:90–93, version f31d17b850b56d2229970b1947e7250aba84b6507ee05329ed8c773bc57bfb19

> - relier Trello, n8n, Supabase et les documents ;
> - automatiser l’ingestion et les briefs ;
> - exposer uniquement les outils MCP nécessaires, avec droits minimaux ;
> - garder le RAG hors du chemin critique de réservation, paiement et authentification.

Décision humaine : ______ ; passages manquants : ______ ; motif/date : ______

## historical:mvp-flow

Quel est le parcours principal de réservation du MVP ?

Statut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.

- mvp-screens:5:0 — MVP_ECRANS_GYM.md:24–24, version e28ae73f0a6997a42c1e19f46ff36fe763f5097c5455bd14f0bb045b3ca1381b

> ## 2. Parcours MVP principal

- master:192:0 — DOCUMENT_MAITRE_GYM.md:586–590, version a4f5786bd2a183bec05cdbdfad6a2abf99f7e5a703b68514cfc123b429f0cdf4

> - structurer le board Trello
> - preparer la base de coachs et clubs a contacter
> - finaliser le pitch court et la version de prospection
> - decider du mode de construction technique
> - realiser la maquette Figma / Figma Make du parcours principal

Décision humaine : ______ ; passages manquants : ______ ; motif/date : ______

## historical:web-first

Pourquoi GetYourMentor commence-t-il par un site web responsive plutôt qu’une application mobile native ?

Statut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.

- master:187:0 — DOCUMENT_MAITRE_GYM.md:560–571, version a4f5786bd2a183bec05cdbdfad6a2abf99f7e5a703b68514cfc123b429f0cdf4

> 1. GYM commence comme un site web responsive.
> 2. Le MVP reste volontairement simple et centre sur coach + sportif.
> 3. Le club entre dans le MVP en mode leger, pas en gestion avancee.
> 4. La direction visuelle est propre a GetYourMentor : une application web responsive de coaching sportif, mobile-first, sombre, dynamique et orientee progression.
> 5. La reservation du MVP fonctionne en demande de reservation validee par le coach, pas en agenda instantane complexe.
> 6. Une maquette courte de 5 a 8 ecrans doit etre realisee avant le developpement complet pour valider le process, la charte graphique et le MVP.
> 7. Les fonctions V2/V3 restent hors lancement.
> 8. L'interface du MVP est en francais par defaut avec selecteur de langue.
> 9. Le MVP ne montre que 4 sports : `football`, `basketball`, `fitness`, `sports de combat`.
> 10. La direction visuelle de la maquette MVP utilise un theme bleu nuit, un accent vert performance et un accent orange pour les etats actifs.
> 11. L'application peut traduire automatiquement l'interface selon la langue disponible de l'utilisateur, avec changement manuel possible.
> 12. La maquette doit montrer explicitement le paiement apres acceptation du coach et

- architecture:7:0 — docs/architecture/ARCHITECTURE_TARGET_GYM.md:27–49, version c794f3dbc551315332f198c188e20e0cc44f253092907e2db93bdba92b2e7e3f

> ```text
> GetYourMentor/
> ├─ docs/                         # décisions, architecture, spécifications, validation
> │  └─ architecture/
> ├─ governance/                   # rôles, fil rouge, décisions et contrôle
> ├─ gym-next/                     # application web Next.js
> │  ├─ app/                       # routes, pages et API minces
> │  ├─ components/                # composants UI et parcours migrés
> │  │  ├─ common/
> │  │  ├─ home/
> │  │  ├─ search/
> │  │  ├─ booking/
> │  │  ├─ account/
> │  │  └─ legacy/                 # compatibilité temporaire uniquement
> │  ├─ lib/                       # accès données, domaine et protections serveur
> │  │  ├─ domain/                 # règles métier pures et types
> │  │  ├─ repositories/           # Supabase ou adaptateurs de persistance
> │  │  ├─ policies/               # autorisation et contrôles
> │  │  └─ integrations/           # Stripe, Resend, n8n, fournisseurs externes
> │  ├─ public/                    # assets réellement utilisés par l'application
> │  ├─ tests/                     # tests fonctionnels et visuels
> │  └─ scripts/                   # contrôles reproductibles et smoke tests
> ├─ supabase/                     # schémas, migra

Décision humaine : ______ ; passages manquants : ______ ; motif/date : ______

## historical:rag-boundary

Le RAG doit-il être placé dans le chemin critique de réservation paiement authentification ?

Statut : proposé, à vérifier. Justification : document historiquement attendu ; pertinence exacte et exhaustivité non validées.

- architecture:5:0 — docs/architecture/ARCHITECTURE_TARGET_GYM.md:11–23, version c794f3dbc551315332f198c188e20e0cc44f253092907e2db93bdba92b2e7e3f

> | Domaine | Décision | Justification |
> |---|---|---|
> | Frontend | Next.js + React + TypeScript | Stack déjà en place, adaptée au web responsive et au SEO. |
> | Styles | CSS Modules et CSS global ciblé | Réduire les dépendances et préserver l'identité visuelle existante. |
> | Backend web | Route Handlers Next.js | Garder les règles métier et les secrets côté serveur. |
> | Données | Supabase/Postgres + RLS | Persistance, authentification et contrôle par rôle. |
> | Paiement | Stripe via serveur et webhook signé | Ne jamais faire confiance au prix ou à l'état envoyés par le navigateur. |
> | Emails | Resend, uniquement après configuration réelle | Notifications transactionnelles séparées du parcours principal. |
> | Automatisation | n8n hors du chemin critique | Orchestration opérationnelle, jamais source de vérité métier. |
> | Déploiement | Netlify + runtime Next.js | Contrat de déploiement déjà versionné. |
> | Tests | TypeScript + Playwright + scripts de garde | Couvrir les parcours, les rôles, le responsive et les frontières de sécurité. |
> | RAG | Phase ultérieure, retrieval hybride dans Supabase/pgvector | Ne pas ajouter un RAG cosmétique avant d'avoir un besoin mesurable. |
> | MC

- memory-rag:34:0 — docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md:90–93, version f31d17b850b56d2229970b1947e7250aba84b6507ee05329ed8c773bc57bfb19

> - relier Trello, n8n, Supabase et les documents ;
> - automatiser l’ingestion et les briefs ;
> - exposer uniquement les outils MCP nécessaires, avec droits minimaux ;
> - garder le RAG hors du chemin critique de réservation, paiement et authentification.

Décision humaine : ______ ; passages manquants : ______ ; motif/date : ______
