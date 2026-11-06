# Index documentaire, CI et dossiers apparentés

Lecture seule, sans déplacement, suppression, synchronisation, lancement d'agent ou accès réseau. Nécessite Python 3.11+, Git et PyYAML déjà disponibles dans la session ; aucun paquet n'est installé automatiquement.

```powershell
python tools/documentation-audit/audit.py
python tools/documentation-audit/audit.py --inspect-siblings
python -m unittest discover -s tools/documentation-audit -p test_audit.py -v
```

Le JSON est écrit sur la sortie standard. `--inspect-siblings` ajoute une inspection **superficielle** des dossiers apparentés immédiatement voisins du dépôt : noms GetYourMentor/GYM et worktrees déclarés. Aucun document, clé, état métier ou fichier source des voisins n'est ouvert. Le registre Git et, pour un autre dépôt, le chemin de ses métadonnées Git servent à distinguer les worktrees des dépôts indépendants. Les anciens SHA des worktrees ne sont pas réintroduits dans le rapport. Les autres dossiers personnels restent hors périmètre.

Dans le dépôt courant : empreintes des Markdown suivis par Git, catégories d'orientation et groupes strictement identiques. Les copies non suivies, fichiers ignorés et dossiers commerciaux exclus ne sont pas lus. Une empreinte identique établit l'égalité des octets ; l'absence de groupe identique ne démontre pas l'absence de copies éditoriales. La qualification sémantique reste ciblée et les inconnus sont affichés explicitement.

Les YAML sont lus avec `BaseLoader`, sans exécution et en conservant la clé `on`. La correspondance de branche n'est calculée que pour les noms exacts présents ici ; des motifs non pris en charge donnent un résultat indéterminé. Aucune consultation de GitHub Actions, des protections de branche ou des réglages Netlify n'est effectuée. Aucun workflow ni secret n'est activé. Les valeurs d'environnement ne sont pas exportées.

Cet outil produit un index, pas un nouveau document maître ni une autorisation. [Guide documentaire et matrice CI](../../docs/architecture/DOCUMENTATION_CI_2026-11-06.md).
