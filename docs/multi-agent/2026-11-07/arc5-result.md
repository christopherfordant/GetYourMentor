# ARC-05 — extraction compatible des types et fixtures

Lot exécuté dans `C:/Users/cashe/Documents/GYM-parallel-arc5-20261107`, branche `agent/20261107-arc5`, base propre `7d9fa564248b16642f2a5a4c17fbff5c05fd7981`. Aucun sous-agent. Instructions racine, coordination et mission ARC5 consultées ; préambules maître/index, procédure/hiérarchie et relais consultés progressivement. Aucun document commun modifié.

## Résultat

- `gym-next/lib/domain/model.ts` porte `CoachProfile`, `ReservationStatus` et `Reservation`, avec un import purement typé de `SportSlug`.
- `gym-next/lib/fixtures/coaches.ts` porte l'unique tableau mutable `coachProfiles`, avec un import purement typé de `CoachProfile`.
- `gym-next/lib/domain.ts` reste la façade des exports historiques et conserve les six fonctions. Ses fonctions utilisent exactement le tableau réexporté ; aucun clone, gel ou registre supplémentaire.
- `tools/domain-contracts/` contient les quatre tests Node, le snapshot des trois fiches avant extraction et la commande documentée.

Une comparaison directe avec `git show 7d9fa56:gym-next/lib/domain.ts` confirme l'identité textuelle des trois déclarations de types, du tableau et des six fonctions, hors normalisation des fins de ligne. Les signatures et contenus sont conservés.

Consommateurs vérifiés par recherche puis lecture ciblée : `lib/auth.ts` (tableau/création), `lib/repositories/demo-state.ts` (clone initial), `lib/public-coach.ts` et `lib/recipe-coach-approval.ts` (types), ainsi que les imports mixtes et purement typés des composants et routes. Ils conservent leur chemin historique. Les types référencés `participants` et `commission` sont présents. Aucune dépendance à une archive ou à un brouillon absent identifiée ; aucun consommateur modifié.

## Vérifications et limites

`node --test tools/domain-contracts/domain.test.cjs` : **4/4 PASS**. Exports d'exécution inchangés, données intégrales/ordre, identité du tableau et de ses objets, mutations dans les deux sens, création/dédoublonnage, recherche par défaut/encodage, filtres sport/ville/validation et alias fitness, modèle sans dépendance d'exécution. Chaque chargeur a son propre cache et sa propre fixture en mémoire.

`git diff --check` : PASS. Le contrôle sémantique TypeScript global reste à réaliser par le coordinateur ; la transpilation locale n'en constitue pas une preuve. Aucun build, serveur, navigateur, installation, réseau/API ou service externe exécuté. Aucun changement métier, UI, auth, paiement, Telegram ou configuration. Aucun push, merge ou déploiement ; intégration et livraison distante réservées au coordinateur. Le SHA du commit ciblé sera communiqué au coordinateur après création.
