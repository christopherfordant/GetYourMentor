# Cycle 011 - QA Playwright routes critiques

## Date

2026-07-26

## Objectif

Recaler les tests Playwright metier sur le flux MVP actuellement valide.

## Probleme cible

Le scenario automatisé `home vers recherche puis annuaire coachs` attendait encore l'ancien comportement direct vers `/coachs`, alors que le cycle 007 a valide le passage obligatoire par `/recherche`.

## Decisions appliquees

1. Mise a jour du test metier pour suivre `/ -> /recherche -> /coachs`.
2. Verification explicite du contenu de la page recherche avant passage a l'annuaire.

## Impact attendu

- QA automatisee coherente avec le fil rouge
- moins de faux positifs / faux echecs sur les parcours critiques

## Fichiers concernes

- `gym-next/tests/business-flow.spec.ts`
