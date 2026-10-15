# Documentation GetYourMentor

> **Lecture obligatoire a chaque prompt :** `../AGENTS.md` et la procedure de `../BRANCH_STRATEGY_GYM.md` avant les travaux ; verification, documentation, commit et push cibl' avant la reponse finale de livraison.

## Entrées principales

- [`REFONTE_PROGRESSIVE_2026-10-15.md`](REFONTE_PROGRESSIVE_2026-10-15.md) — maquette validée, lots de migration, tests et livraison du design ;

- [`../DOCUMENT_MAITRE_GYM.md`](../DOCUMENT_MAITRE_GYM.md) — source de vérité produit ;
- [`architecture/`](./architecture/) — architecture applicative, mémoire et RAG ;
- [`../governance/`](../governance/) — décisions, rôles, fil rouge et contrôles ;
- [`../supabase/`](../supabase/) — schémas et vérifications de données ;
- [`../n8n/`](../n8n/) — workflows d’orchestration exportables ;
- [`../project_readable/INDEX.md`](../project_readable/INDEX.md) — index généré des documents lisibles.

## Fichiers conservés à la racine

Certains fichiers restent volontairement à la racine car des scripts, contrôles, exports ou anciennes références les utilisent encore :

- spécifications MVP et document maître ;
- documents de migration et de design actuellement consommés par la gouvernance ;
- runbooks de préproduction pendant la phase de stabilisation.

Ils ne doivent pas être dupliqués dans `docs/`. Pour une nouvelle décision structurante, utiliser les documents canoniques de `docs/architecture/` ou `governance/`.

## Générés et archives

- `project_readable/` est généré par `scripts/extract_project_docs.py` et ne doit pas être édité manuellement ;
- `.mempalace*` sont des données locales d’exécution ;
- `mempalace/` contient l’outil local et n’est pas une source produit ;
- `visualiser-documents.html` est un export de consultation et doit être régénéré après un déplacement documentaire.

## Règle de déplacement

Avant de déplacer un fichier, rechercher toutes ses références avec `rg`, mettre à jour les scripts et les liens dans le même changement, puis exécuter les contrôles concernés. Les originaux métier ne sont jamais supprimés pour réduire un doublon supposé.
