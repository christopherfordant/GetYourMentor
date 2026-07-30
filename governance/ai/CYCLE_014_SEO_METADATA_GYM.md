# Cycle 014 - SEO metadata MVP

## Date

2026-07-29

## Objectif

Renforcer la couche SEO technique des pages MVP migrees vers Next.js sans modifier le design, la structure HTML de reference ni la logique metier.

## Perimetre

- `/`
- `/recherche`
- `/coachs`
- `/coach`
- `/creneau`
- `/recapitulatif`
- `/compte`
- `/paiement`
- `/inscription-club`

## Actions realisees

1. Correction de la metadata globale de l'application.
2. Ajout d'une couche SEO partagee dans `gym-next/lib/seo.ts`.
3. Ajout de titres et descriptions distinctifs par route critique.
4. Ajout d'URLs canoniques coherentes avec les parametres utiles.
5. Verification build Next apres nettoyage du processus Node.
6. Reverification du tunnel metier apres la passe SEO.

## Verifications

### Build

```powershell
npm.cmd run build
```

Resultat :

- build Next : `OK`

### Tunnel metier

```powershell
npm.cmd run pw:business
```

Resultat :

- `10 / 10` tests passes
- desktop : `OK`
- mobile : `OK`

## Impact

- pages MVP plus lisibles pour les moteurs et le partage social
- titres plus differenciants par sport, ville et coach
- aucune regression constatee sur le tunnel de reservation

## Fichiers concernes

- `gym-next/app/layout.tsx`
- `gym-next/app/page.tsx`
- `gym-next/app/recherche/page.tsx`
- `gym-next/app/coachs/page.tsx`
- `gym-next/app/coach/page.tsx`
- `gym-next/app/creneau/page.tsx`
- `gym-next/app/recapitulatif/page.tsx`
- `gym-next/app/compte/page.tsx`
- `gym-next/app/paiement/page.tsx`
- `gym-next/app/inscription-club/page.tsx`
- `gym-next/lib/seo.ts`
