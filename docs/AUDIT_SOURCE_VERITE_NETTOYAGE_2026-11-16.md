# Audit de la source de vérité et nettoyage ciblé — 16 novembre 2026

## Résumé

Le dépôt est sur `design/refonte-progressive-lot1`, au commit `37fa3bd7f872d858ec63c007b2b5234897e50478`, synchronisé avec son upstream au début de l’audit. La configuration racine `netlify.toml` fixe `gym-next/` comme base de build, lance `npm run build` et publie `.next` : c’est la source applicative de ce dépôt.

Le site GetYourMentor lié au portfolio répond en HTTP 200 ; son `/api/health` renvoie `mode: demo` et `supabase: null`. Le portfolio répond aussi en HTTP 200. L’ancienne URL `gregarious-fox-fff605.netlify.app` répond séparément en HTTP 200 : elle n’est pas la cible de ce dépôt et reste une référence historique. La CLI Netlify n’est pas disponible et l’accès au tableau de bord n’a pas été utilisé : le commit et la branche exacts déployés sur les deux sites ne sont donc pas établis par cet audit. Le fichier local `.netlify/state.json` ne suffit pas à prouver le rattachement d’un domaine.

## Carte des versions

| Emplacement / cible | Rôle établi | Preuves et décision |
|---|---|---|
| `gym-next/` | Application Next.js du dépôt | `netlify.toml`, `gym-next/package.json`, routes et scripts applicatifs. À conserver comme source du code produit. |
| `prototype-site/` | Prototype statique historique | Consommé par `gym-next/lib/migration-pages.ts`, `MIGRATION_NEXT_GYM.md`, les documents d’architecture et les tests de migration. À conserver comme référence de migration, sans le confondre avec l’application publiée. |
| `docs/prototype-site/` | Copie documentaire historique, non canonique | 18 fichiers suivis contre 20 dans la référence racine ; 14 de mêmes chemins étaient identiques avant correction des chemins. Conservée comme archive dans ce lot : son retrait dépasserait seule le garde de revue de 400 lignes de code. `docs/index.html` et les index actifs pointent vers `prototype-site/`. |
| `gym-next/public/design_assets/` | Emplacement unique des médias visuels servis | Inventaire statique conservateur : 110 fichiers, 22 029 798 octets, aucune ressource classée sans référence. Les références dynamiques et la portée runtime restent des limites ; aucun média public n’a été supprimé. |
| `assets/design/` | Provenance / sources non servies | 27 fichiers visuels avaient chacun un homologue de même chemin et SHA-256 sous `gym-next/public/design_assets/` (10 423 070 octets au total). Les 27 copies ont été retirées ; `content_library/sources.json` est conservé et ses neuf chemins `file` pointent vers l’unique copie publique. |
| `prototypes/design-assets/` | Démonstrations visuelles isolées | Prototypes de carrousel, transition 3D et arrivée des équipements, distincts de l’application. Conservés. |
| `scripts/` et `gym-next/scripts/` | Outils de dépôt / scripts d’application | Leurs fonctions et consommateurs diffèrent ; les dossiers homonymes ne sont pas des doublons et sont conservés. |
| `montage_planity/` et dossiers de preuves | Références et traces historiques | Sources de conception et captures contextualisées ; aucune suppression décidée sur le seul critère du nom, de l’âge ou de l’absence de manifeste. Conservés. |

## Nettoyage exécuté

- Les binaires dupliqués dans `assets/design/` ont été comparés individuellement par SHA-256 avant suppression. Les originaux publics et le manifeste de provenance ont été conservés.
- Les liens des deux prototypes ont été dirigés vers `gym-next/public/design_assets/`. `docs/prototype-site/` reste suivi comme archive ; son retrait physique est reporté, car il dépasse le garde de revue de 400 lignes de code. Les index, scripts et routage documentaire désignent `prototype-site/` comme référence canonique.
- Les index `project_readable/INDEX.*` ont été filtrés des 17 entrées `docs/prototype-site/` et 26 entrées `docs/design_assets/` devenues absentes ; les 18 aperçus texte dérivés ont été retirés. Le manifeste actif a un aperçu unique sous `project_readable/assets/design/`. Les aperçus du script et du hub modifiés ont été rafraîchis sans régénérer tout le corpus.
- Les empreintes détaillées, tailles, comparaison du prototype historique, chemins vérifiés et limites de l’inventaire sont archivés dans `docs/assets/audit-source-truth-2026-11-16/cleanup-verification.md`.
- `scripts/extract_project_docs.py` ne traite plus `docs/prototype-site/` comme une source spéciale ; le superviseur et son manifeste ne surveillent plus ce doublon.
- Les index HTML historiques suivis ont reçu des chemins vers le prototype canonique et les médias publics. Les états de supervision préexistants n’ont pas été réécrits ; leurs entrées de l’ancien chemin restent des traces d’état antérieur, pas des chemins de source actifs.
- Aucun worktree, brouillon non suivi, dossier privé, compte, base, configuration Netlify ni historique Git n’a été supprimé ou modifié.

L’index et les hubs générés ont également retiré 33 références vers des sources absentes ; 17 aperçus manquants pour des sources existantes sont maintenant indiqués indisponibles. L’index final contient 501 sources présentes. Les hubs ont 644 et 124 liens locaux, tous vérifiés.

## Images et limites de l’inventaire

Le contrôle `tools/public-assets/audit.py` analyse les références statiques dans des racines de code et de documentation sélectionnées ; il ne prouve pas la joignabilité runtime. Après nettoyage, il a analysé 110 fichiers publics (22 029 798 octets), 926 fichiers texte et 552 références ; il n’a classé aucun média public comme sans référence. Les 32 ressources indiquées `retain-review-required` ne sont pas déclarées inutiles et restent en place. Les autres groupes de doublons SHA-256 dans les captures datées et les ressources de démonstration ne sont pas supprimés : leurs contextes historiques ou usages de prototype doivent rester intacts.

Les dossiers commerciaux déjà archivés hors dépôt, les 79 worktrees recensés et les modifications locales antérieures ont été préservés. Le dossier local non suivi `gym-next/assets/` n’a pas été inspecté ni touché.

## Contrôles

- Comparaison SHA-256 des 27 paires avant suppression ; chaque homologue public existait.
- Validation JSON et existence des neuf chemins du manifeste de provenance.
- Vérification statique des URLs locales du prototype conservé et du chemin de redirection documentaire.
- Audit conservateur des médias publics ; aucun fichier public supprimé.
- `git diff --check` sur le périmètre final.
- Pas de build Next complet : le code applicatif et le répertoire public n’ont pas été modifiés. Le rendu public a été contrôlé en HTTP, mais son commit de déploiement reste inaccessible.

## État Git et suites

Les changements de cet audit sont isolés dans le commit ciblé de la branche `design/refonte-progressive-lot1`. `GYM-ARC6` reste `progress` : l’audit et le nettoyage ciblé ne remplacent pas la revue humaine du développeur ni les autres critères de ce ticket. Aucun déploiement n’a été effectué.

À examiner lors de la revue : confirmer dans Netlify le site, la branche et le commit réellement publiés pour le domaine lié au portfolio ; revoir séparément les éléments statiques classés à vérifier avant tout autre nettoyage d’images.
