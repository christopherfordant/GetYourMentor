# Cycle 013 - Validation tunnel metier MVP

## Date

2026-07-29

## Objectif

Verifier que le tunnel metier principal du MVP reste fonctionnel de bout en bout en desktop et mobile.

## Perimetre teste

- `/`
- `/recherche?sport=football&city=Paris`
- `/coachs?sport=football&city=Paris`
- `/coach?sport=metiers-de-la-forme&city=Lyon&coach=Studio%20Form%20Marseille`
- `/creneau?...`
- `/recapitulatif?...`
- `/compte?...`

## Commande utilisee

```powershell
npm.cmd run pw:business
```

## Resultat

- `10 / 10` tests Playwright metier passes
- verification desktop : `OK`
- verification mobile : `OK`
- aucun lien critique casse sur le flux :
  - home -> recherche
  - recherche -> coachs
  - coachs -> coach
  - coach -> creneau
  - creneau -> recapitulatif
  - recapitulatif -> compte

## Impact

- le tunnel sportif MVP est valide fonctionnellement
- la prochaine phase peut se concentrer sur la qualite produit, la parite prototype / Next ou la couche SEO sans doute sur la reservation

## Fichiers concernes

- `gym-next/tests/business-flow.spec.ts`
- `governance/ai/DECISIONS_LOG_GYM.md`
- `governance/roles/README_QA.md`
