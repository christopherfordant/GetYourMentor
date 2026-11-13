# Lecteur local de contexte Kanban — 13 novembre 2026

## Décision

L'atelier affichait et filtrait le Kanban, mais n'avait pas de commande dédiée pour fournir à une reprise un ticket canonique et ses dépendances. Le Kanban reste stocké uniquement dans `tools/agentic-workbench/backlog.json` ; aucun stockage ni second RAG n'a été ajouté.

Le lecteur `tools/agentic-workbench/task-context.mjs` propose trois formes d'accès :

```powershell
node tools/agentic-workbench/task-context.mjs --ticket GYM-D1.3
node tools/agentic-workbench/task-context.mjs --ticket GYM-D1.3 --details
node tools/agentic-workbench/task-context.mjs --next
```

La lecture par identifiant retourne le statut officiel, priorité, sprint, responsable planifié, cible résolue, dépendances et blocage/prochaine action. `--details` ajoute objectif, périmètre, critères d'acceptation, chemins, tests et preuves. La commande lit toujours le chemin fixe du backlog voisin ; l'utilisateur ne peut fournir ni chemin source ni fichier. Elle ne lit pas les documents référencés, les secrets, les comptes ou le `localStorage` et ne modifie rien.

`--next` sélectionne uniquement un sous-ticket dont le statut canonique vaut `ready` et dont toutes les dépendances valent `done`, avec priorité P0 avant P1, puis ordre sprint et identifiant comme départage déterministe. S'il n'existe aucun ticket prêt, elle renvoie `no-ready-ticket` et jusqu'à cinq candidats avec leur état et dépendances non résolues ; ces candidats ne sont pas présentés comme prêts et leur statut n'est pas changé.

Le nouveau suivi est `GYM-K1` / `GYM-K1.1` dans le Kanban, Sprint S5. Le parent garde l'objectif, le sous-ticket porte les critères d'implémentation et de vérification. Les 85 tickets préexistants ont été conservés.

Pour continuer un chantier sur plusieurs sessions, le Kanban reste le suivi des tâches et `docs/ETAT_REPRISE_COURANT.md` conserve le relais court (décisions, preuves, ouvertures et prochaine action). Aucun stockage de mémoire parallèle n'est nécessaire. Si un lot risque de dépasser le contexte exploitable ou d'empêcher ses contrôles, il doit être arrêté sur un point vérifiable et repris avec ce relais ; aucun quota ou seuil de tokens n'est inventé.

## Vérifications

- Suite Node de l'atelier : **41 tests passés, 0 échec**.
- Contrôle navigateur Playwright avec contextes neufs : recherche du ticket puis ouverture de sa fiche sur desktop (1440 px) et mobile (390 px) ; aucune barre de défilement horizontale détectée.
- `--next` sur le backlog de cette reprise retourne `no-ready-ticket`. Il n'y a donc pas de tâche officielle déclarée prête à cet instant. La réponse bornée sur les cinq meilleurs candidats fait **6 825 octets**.
- Mesure ponctuelle de texte sérialisé : backlog complet **117 098 octets** ; contexte détaillé de GYM-D1.3 **3 396 octets** (contexte de base **1 299 octets**). C'est une comparaison de taille du texte, pas une mesure de tokens ni de crédits. Le programme doit quand même lire le JSON complet localement pour appliquer les règles de priorité et de dépendances ; seule la sortie compacte est destinée à la reprise.
- Aucun changement du RAG, du comportement métier, de l'interface, des bases ou d'un service distant.

## Limites

La sélection est mécanique et s'appuie exclusivement sur les statuts versionnés. Elle n'infère pas qu'un ticket `progress`, `prepare` ou `backlog` peut commencer. La commande ne choisit pas les documents maîtres à lire : elle fournit les références présentes dans le ticket, puis la procédure de reprise détermine les lectures nécessaires. Aucun gain de tokens réels n'est affirmé.

Le test navigateur historique `tools/agentic-workbench/tests/browser-check.cjs` contient des nombres de cartes figés pour un ancien backlog. Le contrôle de cette livraison a été effectué dans des contextes Playwright isolés sans modifier ni rejouer ce script historique.
