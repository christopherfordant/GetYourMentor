# Inventaire local des ressources publiques

Validation du candidat après extraction : [rapport ARC3.3](../../docs/VALIDATION_CANDIDAT_ARC3_3_2026-11-06.md). Contrairement à l'inventaire en lecture seule, `validate-candidate.cjs` écrit une copie et un build sous `delivery-private` ainsi que des preuves locales. `serve-candidate.cjs` démarre ce candidat uniquement sur le loopback ; `check-candidate.mjs` contrôle ses ressources par HTTP. Aucun déploiement ni installation automatique.

Aperçu des prototypes extraits : [guide](../../prototypes/README.md), commande `node tools/public-assets/preview.mjs`. La recette HTTP est `node --test tools/public-assets/preview.test.mjs` ; les scénarios de démonstration utilisent `tools/public-assets/prototypes.config.cjs`. L'inventaire ci-dessous reste statique et ne doit pas assimiler les anciens chemins publics des rapports historiques à des erreurs du site actif.

Depuis la racine du dépôt, avec Python standard et Git :

```powershell
python tools/public-assets/audit.py
python -m unittest discover -s tools/public-assets -p test_audit.py -v
```

Le programme écrit uniquement le JSON sur la sortie standard. Rediriger explicitement si une preuve sur disque est souhaitée. Il ne lance ni navigateur, build, serveur, suppression, déplacement ou accès réseau. Les tests créent un dépôt temporaire isolé et le nettoient après contrôle.

Périmètre fixe : `gym-next/public/design_assets`, sources applicatives suivies et brouillons app/components/lib, documents suivis et outils/configurations autorisés. L'inventaire énumère les sources réellement lues et les omissions. Pas de lecture des coffres, `.env`, dépendances, builds, anciens worktrees ou dossiers privés. Les noms et chemins du JSON restent des preuves locales au dépôt ; ne pas publier cet outil et ses rapports sur le site.

Les références exactes, préfixes dynamiques et racines indéterminées sont distincts. Une référence en source ne démontre pas une route atteignable ; une absence de référence ne démontre pas un fichier inutilisé. Aucune décision de suppression ou de déplacement n'est automatisée. Le code n'est pas un parseur exhaustif de JavaScript/CSS et ne remplace pas les tests navigateur/build après un déplacement.

Résultat et plan de rangement : [rapport ARC3](../../docs/ASSETS_PUBLICS_ARC3_2026-11-06.md). Les constantes datées d'exclusion des propres sorties doivent être adaptées lors d'un audit futur avec une autre destination ; ne pas interpréter un rapport qui s'indexe lui-même comme un nouveau consommateur.
