# Lot Auto Audit Visuel GYM

## But

Definir un lot auto visuel cible sur les pages sensibles du MVP afin de :

- relancer le cycle auto projet
- verifier la conformite fil rouge
- lancer l'audit Playwright existant
- journaliser le resultat
- memoriser l'etat visuel du site entre deux reprises

## Perimetre

Ce lot :

- ne pousse rien sur GitHub
- ne modifie pas le code applicatif
- reutilise l'audit Playwright deja present dans `gym-next`

## Ordre du lot

1. relire l'etat auto projet
2. lancer `scripts/run_auto_project_cycle.ps1`
3. lancer `npm run pw:audit` dans `gym-next`
4. journaliser le resultat
5. mettre a jour l'etat auto projet

## Pages sensibles couvertes

- `/`
- `/recherche`
- `/coachs`
- `/coach`
- `/creneau`
- `/compte`
- `/inscription-club`

## Statuts possibles

- `CONFORME_AUDIT_OK`
- `CONFORME_AUDIT_KO`
- `ALERTE_AUDIT_NON_LANCE`
- `ALERTE_SUPERVISEUR`

## Resultat attendu

En sortie, on doit connaitre :

- le statut du superviseur
- le statut de l'audit visuel
- l'emplacement des artefacts
- la phase active
- l'action recommandee
