# Démonstrations locales GetYourMentor

Les prototypes historiques sont conservés hors du répertoire publié par Next.js. Ils ne sont ni des pages du produit ni une validation des parcours de réservation/paiement.

Depuis la racine du dépôt :

```powershell
node tools/public-assets/preview.mjs
```

Ouvrir **http://127.0.0.1:4336/**. Le serveur reste au premier plan ; `Ctrl+C` l'arrête. Il échoue si le port est occupé plutôt que de réutiliser un service inconnu. Aucun secret, service métier ou installation supplémentaire n'est nécessaire.

Les quatre chemins `/design_assets/...` restent utilisables **sur ce serveur local seulement**. Ils pointent vers les fichiers déplacés via `manifest.json`. Ils ne sont plus présents dans `gym-next/public` et ne sont pas redirigés par le site applicatif. Les anciens rapports/captures sont des preuves historiques, pas des liens publics actuels.

| Démonstration | URL sur 127.0.0.1:4336 |
|---|---|
| Trois carrousels comparés | `/design_assets/carousel-large-2026-11-03/index.html` |
| Ouverture 3D | `/design_assets/door-transition-2026-11-02/index.html` |
| Objets sportifs | `/design_assets/header-equipment-2026-10-30/apercu.html` |
| Ancien pentagone | `/design_assets/pentagon-carousel-2026-11-02/index.html` |

Les images et scripts partagés restent dans `gym-next/public/design_assets`. Le serveur ne sert que les fichiers explicitement listés et typés dans le manifeste, sans parcourir le dépôt via HTTP. Aucun annuaire, API, route applicative, document privé ou accès distant n'est fourni. Les boutons de recherche et de fiche du pentagone historique nécessitent le vrai site et ne fonctionnent pas sur cet aperçu ; les flèches et cartes restent vérifiables.

Les six fichiers déplacés conservent leurs octets d'origine et leurs SHA256. `.gitattributes` désactive la normalisation de fin de ligne de ces archives pour préserver ces empreintes entre systèmes. Le déplacement peut être inversé à partir des entrées `moved: true` du manifeste : remettre les six fichiers à `gym-next/public` + leur URL. Ne pas écraser des fichiers qui auraient été recréés depuis ; comparer d'abord les empreintes, puis restaurer les trois tests depuis le commit antérieur. Le serveur de prévisualisation n'est pas une dépendance du build Next.

## Contrôles

```powershell
node --test tools/public-assets/preview.test.mjs
node gym-next/node_modules/@playwright/test/cli.js test -c tools/public-assets/prototypes.config.cjs
```

Le second contrôle démarre puis arrête son serveur dédié sur un port loopback éphémère ; l'aperçu manuel peut rester ouvert. Les captures de cette recette vont dans `delivery-private/prototype-tests`, jamais dans les anciennes preuves. Les tests applicatifs (header réel, captures des pages et navigation 3D active) restent dans la configuration Playwright normale et sont exclus explicitement de cette recette autonome. La fixture commune démarre aussi l'aperçu automatiquement dans la suite habituelle : aucun serveur supplémentaire à préparer manuellement. `PW_PROTOTYPE_BASE_URL` permet de réutiliser explicitement un aperçu HTTP existant sur `127.0.0.1` ; il n'est alors pas arrêté par les tests.

Rapport courant : [extraction ARC3.2](../docs/EXTRACTION_PROTOTYPES_ARC3_2_2026-11-06.md). Aucune mise en production implicite.
