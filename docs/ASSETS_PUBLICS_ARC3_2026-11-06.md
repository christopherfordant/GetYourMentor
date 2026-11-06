# ARC3 ? inventaire des ressources publiques et pr?paration du rangement

## R?sultat du lot ARC3.1 ? 6 novembre 2026

Inventaire statique de **116 fichiers**, **22 084 835 octets** (environ 21,1 Mio), dont **4 pages HTML** dans `gym-next/public/design_assets`. **888 fichiers texte** lus dans les p?rim?tres autoris?s, **513 occurrences de r?f?rences** relev?es. Aucun d?placement, suppression, changement de route ou de m?dia. ARC3.1 termin? ; ARC3 global reste en cours.

Outil reproductible : `python tools/public-assets/audit.py` depuis la racine ; JSON sur la sortie standard, sans ?criture par le programme. L'inventaire livr? se trouve dans [inventory.json](assets/public-assets-2026-11-06/inventory.json). Le rapport et ses propres sorties sont exclus des entr?es pour ?viter une auto-alimentation des r?f?rences.

## Ce qui doit rester en place ? ce stade

| Classe statique | Fichiers | D?cision |
|---|---:|---|
| R?f?rence applicative exacte | 33 | Conserver ; pr?sence en source, pas preuve de route atteignable |
| Pr?fixe applicatif dynamique seulement | 46 | Conserver par prudence ; ne prouve pas que chaque fichier est utilis? |
| Sans r?f?rence applicative d?tect?e, revue n?cessaire | 34 | Ne pas assimiler ? inutilis? ; d?pendances et constructions dynamiques ? r?soudre |
| Entr?e HTML candidate ? revue | 3 | Pr?parer le d?placement avec ses consommateurs ; ne pas supprimer |

`PlatformHeader.tsx` importe `header-equipment-2026-10-30/entrance.js` depuis public. `SportIcon.tsx` et `SportMotionIcon.tsx` construisent les URLs des images du m?me r?pertoire. D?placer le dossier entier casserait ces usages. Les portraits IA, contenus ?ditoriaux, logos et objets sportifs sont ?galement consomm?s par le code applicatif. `demo-visuals.ts` d?finit un pr?fixe utilis? dans des chemins construits : l'analyse conserve tout son r?pertoire sans certifier que chaque fichier est charg?.

Les deux remplacements de racine dans `app/compte/page.tsx` et `app/inscription-club/page.tsx` sont signal?s ? unresolved-root ?. Inspection manuelle : ils chargent `app/legacy-prototype.css`, ?galement analys?. Ce constat ne justifie pas de marquer tous les assets comme utilis?s.

## Quatre d?monstrations, quatre d?pendances ? pr?server

| Entr?e actuelle sous design_assets | Constat | Proposition |
|---|---|---|
| carousel-large-2026-11-03/index.html | R?f?rence documentaire vers la comparaison des rendus | D?placer seulement apr?s conservation de la d?monstration et mise ? jour de son lien courant |
| door-transition-2026-11-02/index.html | Test `tests/door-transition-demo.spec.ts`, liens et preuves historiques | Pr?server la recette de la transition ; ne pas confondre avec le code de navigation actif |
| pentagon-carousel-2026-11-02/index.html | Test `tests/pentagon-preview.spec.ts` et preuves historiques | Archiver la d?monstration localement sans r?introduire ce choix visuel dans le produit |
| header-equipment-2026-10-30/apercu.html | Test `tests/equipment-entrance.spec.ts`, r?pertoire partag? avec le header ; protection par pr?fixe dynamique | Extraire l'HTML seulement ; laisser script et m?dias utilis?s dans public |

Correspondance propos?e, **non ex?cut?e**, et liste des consommateurs : [move-plan.json](assets/public-assets-2026-11-06/move-plan.json). Cible envisag?e `prototypes/design-assets/`, hors public. Les anciens chemins restent op?rationnels dans ce checkout ? l'issue du lot ; aucune preuve historique n'est r??crite.

## P?rim?tre et limites de l'analyse

- M?tadonn?es, taille et SHA256 de tous les fichiers sous design_assets, sans pr?tendre inspecter visuellement chaque image.
- R?f?rences de sources applicatives suivies et brouillons locaux dans app/components/lib ; documents suivis, tests, scripts et configurations autoris?s. Pas de parcours des anciens worktrees, d?pendances, builds, coffres, secrets ou dossiers commerciaux exclus. Les journaux/?tats governance ne sont pas lus.
- R?f?rences exactes, relatives, alias public, URL encod?es, param?tres/fragments et pr?fixes interpol?s distingu?s. Une cha?ne dans un commentaire ou un ancien test n'est pas une preuve de consommation en production. Aucun graphe complet d'accessibilit? runtime n'est revendiqu?.
- **54 litt?raux sans fichier exact trouv?** : 32 dans outils/configurations et 22 dans le texte public. Ils peuvent ?tre des constructions ou r?f?rences externes/historiques ; ce ne sont pas 54 liens publics cass?s d?montr?s. Z?ro litt?ral applicatif exact manquant dans cette analyse. Les chemins dynamiques restent ? r?soudre.
- Un fichier documentaire non UTF-8 (`docs/assets/review-session-2026-11-03/reproductions.json`) non lu ; omission explicitement conserv?e dans le JSON. Ne pas le convertir ni le consid?rer v?rifi?.
- Le contenu de public est destin? ? ?tre servi par Next selon la configuration locale ; aucune v?rification de l'?tat Netlify distant dans ce lot.

## Contr?les r?alis?s

**8 tests Python PASS**, dont fixture Git isol?e : exact/alias, interpolation conservatrice, chemins relatifs/encod?s, URLs externes, racine ind?termin?e, travers?e de parents, liens Markdown et cat?gories. Test d'int?gration : r?sultat reproductible, fichiers avant/apr?s identiques, sources priv?es exclues, sorties d'audit exclues et classification exacte/pr?fixe s?par?e.

**35 tests de l'atelier/Kanban PASS** apr?s mise ? jour. Contr?le du tableau sur ordinateur et mobile en contexte vierge, sans toucher les brouillons de l'utilisateur. Empreintes des 116 fichiers publics et des 18 modifications ant?rieures contr?l?es. Voir [checks.json](assets/public-assets-2026-11-06/checks.json).

Pas de build ou de test visuel applicatif relanc? : aucun fichier applicatif/public, d?pendance, route ou configuration n'a chang?. Cela ne valide pas encore un d?placement ni la disparition d'une d?monstration du build. Aucun service m?tier, migration, agent, paiement, notification ou d?ploiement ex?cut?.

## Suite born?e

**ARC3.2** : pr?parer le serveur local de pr?visualisation hors public et ses tests, r?soudre les d?pendances des quatre HTML, puis d?placer seulement les d?monstrations valid?es avec correspondance et restauration inversables. Pr?server les m?dias et `entrance.js` utilis?s par le produit. Mettre ? jour les tests actuels, laisser les preuves historiques intactes. **ARC3.3** : v?rifier les d?mos d?plac?es, les URLs conserv?es, le contr?le TypeScript et un build isol? avant cl?ture ARC3. Aucun d?ploiement implicite.
