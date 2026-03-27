# Lecture simplifiee du projet

Si un fichier du projet n'est pas affichable dans l'editeur parce qu'il est binaire ou mal encode, regarde d'abord ici.

Points d'entree utiles :

- [../visualiser-documents.html](../visualiser-documents.html) : hub visuel pour ouvrir les originaux et les versions lisibles
- [INDEX.md](./INDEX.md) : liste complete des fichiers et de leur version lisible quand elle existe
- `*.txt` dans ce dossier : extractions lisibles des `.docx`, `.xlsx`, `.pptx`, `.pdf` et fichiers texte du projet

Cas courants :

- `.docx`, `.xlsx`, `.pptx`, `.pdf` : le contenu est extrait ici en `.txt`
- images : elles restent des assets visuels, donc pas de version texte
- `.xls` anciens : non extraits automatiquement pour l'instant

Pour regenerer les extractions :

```powershell
python scripts/extract_project_docs.py
```
