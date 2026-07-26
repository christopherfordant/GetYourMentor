# Cycle 009 - Finalisation inscription club

## Date

2026-07-26

## Objectif

Finaliser la route `/inscription-club` sans reouvrir son scope fonctionnel.

## Probleme cible

La structure et la logique de la page etaient deja conformes, mais quelques libelles restaient sans accents ou avec une lisibilite inegale.

## Decisions appliquees

1. Nettoyage des libelles visibles de la page club.
2. Conservation stricte de la structure du prototype.
3. Conservation de la sortie vers `/compte?mode=club&connected=1`.

## Impact attendu

- meilleure perception de qualite
- aucun risque de derive sur le parcours club

## Fichiers concernes

- `gym-next/components/club-signup-legacy/InscriptionClubLegacyPage.tsx`
- `governance/README.md`
- `governance/ai/DECISIONS_LOG_GYM.md`
- `governance/fil_rouge_manifest.json`
