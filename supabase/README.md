# Supabase — GetYourMentor

## Organisation

- `schemas/memory.sql` : schéma `gym_memory` pour la mémoire documentaire, les décisions, les workflows et le futur RAG ;
- `schemas/app.sql` : schéma applicatif pour les utilisateurs, coachs, réservations, paiements et règles métier ;
- `verification/coach-verification.sql` : contrôles liés à la vérification coach ;
- `verification/preproduction-verify.sql` : contrôles en lecture seule de préproduction.

Les schémas mémoire et applicatif sont volontairement séparés. Le RAG ne doit pas être placé dans le chemin critique des réservations ou des paiements.

Références :

- [`../docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`](../docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md)
- [`../docs/architecture/ARCHITECTURE_TARGET_GYM.md`](../docs/architecture/ARCHITECTURE_TARGET_GYM.md)
- [`../PREPRODUCTION_RUNBOOK_GYM.md`](../PREPRODUCTION_RUNBOOK_GYM.md)

Les fichiers `.temp/` sont générés par la CLI Supabase et ne constituent pas des migrations applicatives.
