# Cycle 008 - Compte et bifurcations coach / club / paiement

## Date

2026-07-26

## Objectif

Stabiliser la route `/compte` qui sert de pivot pour :

- l'identification
- l'inscription
- l'acces coach
- l'acces club
- la reprise du tunnel vers `/paiement`

## Probleme cible

La structure etait bonne, mais de nombreux textes restaient corrompus sur :

- l'etape d'authentification
- le dashboard coach
- le dashboard club
- le footer

## Decisions appliquees

1. Nettoyage des libelles critiques sans changer la hierarchie de la page.
2. Conservation de la logique de redirection vers `/paiement`.
3. Conservation de la bifurcation club via `/inscription-club`.
4. Aucune extension de fonctionnalite hors scope pendant ce cycle.

## Impact attendu

- page compte plus credible
- bifurcations plus lisibles pour coach et club
- base plus saine avant un futur cycle de verification UI ou responsive

## Fichiers concernes

- `gym-next/components/account-legacy/AccountLegacyPage.tsx`
- `governance/README.md`
- `governance/ai/DECISIONS_LOG_GYM.md`
- `governance/fil_rouge_manifest.json`
