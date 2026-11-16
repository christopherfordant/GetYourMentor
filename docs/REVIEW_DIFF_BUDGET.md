# Garde de taille des diffs pour la revue

La vérification `Review diff budget` s’exécute à l’ouverture ou à la mise à jour d’une pull request. Elle bloque la vérification si le diff dépasse **400 lignes de code modifiées**, c’est-à-dire les ajouts **plus** les suppressions, calculés par Git entre la base et la tête de la pull request.

Le compteur couvre les extensions de code et de configuration listées dans `tools/review-diff-budget.mjs`. Il ignore la documentation Markdown, les binaires, les fichiers de verrouillage, `project_readable/`, les snapshots et les sorties de build. Le rapport détaille les fichiers les plus volumineux.

Pour repasser sous la limite, découper le travail en changements autonomes et en pull requests empilées si nécessaire. Ne pas réduire les tests ou retirer une correction nécessaire pour satisfaire le seuil. Le garde est déterministe et local : **ce n’est pas un agent IA**, n’envoie aucun code à un service externe et n’ajoute aucune dépendance.

Vérification locale :

```powershell
node --test tools/review-diff-budget.test.mjs
node tools/review-diff-budget.mjs <sha-base> <sha-tete> --max-lines 400
```

La vérification porte sur le diff de la pull request ; elle ne modifie ni les fichiers ni le Kanban.
