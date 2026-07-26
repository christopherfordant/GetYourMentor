# Cycle 007 - Haut de funnel home > recherche > coachs

## Date

2026-07-26

## Objectif

Verifier et corriger la continuite metier entre :

- `/`
- `/recherche`
- `/coachs`
- `/coach`

Sans casser la structure legacy migree.

## Probleme cible

La home envoyait directement vers `/coachs` lorsqu'une ville etait renseignee, ce qui court-circuitait l'etape `/recherche`.

En parallele, plusieurs libelles du haut de funnel restaient degrades ou mojibakes, ce qui nuisait a la lisibilite MVP.

## Decisions appliquees

1. La recherche depuis la home passe desormais toujours par `/recherche`.
2. Le parametre `city` est transmis jusqu'a la page `/recherche`.
3. La page `/recherche` rehydrate correctement la ville dans son formulaire.
4. Les textes de recherche et d'annuaire du haut de funnel sont nettoyes sans changer la structure HTML migree.

## Impact attendu

- parcours plus coherent pour l'utilisateur
- meilleure continuite entre intention, recherche et selection
- reduction des incoherences visuelles et textuelles sur les pages critiques amont

## Fichiers concernes

- `gym-next/components/home-legacy/AccueilLegacyPage.tsx`
- `gym-next/app/recherche/page.tsx`
- `gym-next/components/search-legacy/RechercheCoachLegacyPage.tsx`
- `gym-next/components/directory-legacy/SelectionCoachsLegacyPage.tsx`
- `governance/ai/DECISIONS_LOG_GYM.md`
- `governance/README.md`
- `governance/fil_rouge_manifest.json`
