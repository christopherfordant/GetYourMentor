# Contrats locaux de la façade domain

Depuis la racine du dépôt :

```powershell
node --test tools/domain-contracts/domain.test.cjs
```

Node et la dépendance TypeScript locale de `gym-next/node_modules` sont requis. Aucun téléchargement, serveur ou build. Le chargeur transpile seulement les modules autorisés en mémoire et recrée son cache pour chaque test ; ses mutations ne touchent aucun stockage applicatif.

`coaches.snapshot.json` capture les trois fiches de `gym-next/lib/domain.ts` à la base `7d9fa564248b16642f2a5a4c17fbff5c05fd7981`, avant extraction. La comparaison couvre tous leurs champs et leur ordre. Les autres contrôles couvrent les exports d'exécution, l'identité commune façade/fixture, les mutations et créations, les recherches et filtres, ainsi que l'absence de dépendance d'exécution du modèle pur.

La transpilation et l'inspection des exports de types ne remplacent pas le contrôle sémantique TypeScript global, réservé au coordinateur.
