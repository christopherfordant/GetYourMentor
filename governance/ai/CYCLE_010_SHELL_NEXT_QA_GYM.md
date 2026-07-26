# Cycle 010 - Shell Next et QA transverse

## Date

2026-07-26

## Objectif

Eviter qu'une future bascule vers le shell Next non legacy reintroduise des routes non conformes ou des libelles trop techniques.

## Probleme cible

Le shell `HomePageClient` contenait encore :

- une redirection home incoherente avec le cycle 007
- un lien brouillon vers `/coach/slug-provisoire`
- un lien brouillon vers `/reservation/creneau`
- plusieurs libelles de surface non stabilises

## Decisions appliquees

1. Alignement des CTA du shell Next sur les routes MVP valides.
2. Nettoyage des libelles de `home-data` et du footer du shell Next.
3. Alignement de la metadata globale Next.js sur une valeur produit.
4. Mise a jour de la documentation transverse pour rester coherente avec les cycles precedents.

## Impact attendu

- base Next plus propre pour une future activation
- moins de risque de regression documentaire ou de routing
- meilleure coherence entre gouvernance, shell Next et tunnel MVP

## Fichiers concernes

- `gym-next/app/layout.tsx`
- `gym-next/components/home/HomePageClient.tsx`
- `gym-next/components/home/home-data.ts`
- `MIGRATION_NEXT_GYM.md`
- `RESPONSIVE_LAYOUT_GYM.md`
- `governance/README.md`
- `governance/ai/DECISIONS_LOG_GYM.md`
- `governance/fil_rouge_manifest.json`
