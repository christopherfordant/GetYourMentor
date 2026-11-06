# Scripts de travail GetYourMentor

Entrée actuelle en lecture seule, depuis la racine :

```powershell
powershell -NoProfile -NonInteractive -File scripts/show_orchestration_status.ps1
```

Cet inventaire ne lance aucun script, ne consulte pas les processus actifs et ne transforme pas les anciens états en autorisations.

Les 12 anciennes entrées d'orchestration sont conservées, mais leur exécution est désactivée sous les consignes courantes. Leur option `-DryRun` affiche uniquement un descriptif, sans état, journal ou exécutable chargé. Exemple :

```powershell
powershell -NoProfile -NonInteractive -File scripts/run_auto_orchestrator.ps1 -DryRun
```

Ce résultat ne prouve ni mission prête, ni modèle disponible, ni contrôle réussi. Une réactivation demande un lot explicitement autorisé et une modification revue des gardes ; aucun commutateur d'activation n'est ajouté.

Les outils interactifs historiques ne font pas partie de la procédure autorisée : ils ne doivent jamais servir à accepter une protection ou une autorisation à la place de l'utilisateur. Les recettes distantes et outils mémoire exigent leur propre périmètre ; ne pas les lancer en parcourant cet inventaire.

Les contrôles manuels actuels restent ceux du projet : `npm run check:types`, build borné dans un environnement approprié, tests ciblés et procédure Git. Le contrôle pré-push existant reste applicable, avec ses écritures de rapport/état connues.

Catalogue complet, preuves et limites : [rapport d'orchestration](../docs/ORCHESTRATION_ENTREES_ET_GARDES_2026-11-06.md). Les règles racine d'AGENTS.md et le relais courant priment.
