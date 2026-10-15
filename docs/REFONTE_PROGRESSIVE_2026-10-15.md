# Refonte progressive GetYourMentor — état de reprise

## Décision et références

Le 15 octobre, l'utilisateur valide la maquette locale `GetYourMentor_Audit_Design_2026-10-15/maquette/index.html` comme direction de refonte progressive, puis demande l'implémentation d'un premier lot vérifié, documenté et poussé. Le header conserve noms, ordre, destinations et organisation. Les vérifications visuelles utilisent Playwright MCP. Aucune publication en production, aucun paiement réel.

Références métier : les trois PDF prioritaires du document maître ; Business Plan p. 30 et 35–36 pour les offres, MVP p. 1 et devis p. 1–2 pour les fonctions. Audit local `GetYourMentor_Audit_Design_2026-10-15/AUDIT.md`. La commission actuelle reste **15 %**, administrable avec historique. Premium à 0 %, contenus à 20 % et abonnements restent des fonctionnalités prévues, pas activées par la refonte.

## Inventaire et périmètre

Routes existantes : `/`, `/recherche`, `/coachs`, `/coach`, `/creneau`, `/recapitulatif`, `/compte`, `/paiement`, `/inscription-club`, `/structures`, `/demo`, `/legal/[slug]`, `/admin/knowledge`. L'administration métier est également un mode de `/compte`.

Composants à préserver : header propre à chaque famille de pages, sélecteur de langue, navigation, cookies, session/authentification, autorisations et modules de réservation/paiement. Les pages héritées injectent `legacy-prototype.css` ; `redesign-2026.css`, `final-motion-overrides.css`, le style JSX et les corrections de comptes ont des règles concurrentes. Ne pas ajouter une nouvelle collection d'overrides par page sans frontière de migration explicite.

Le dépôt avait de nombreuses modifications antérieures, dont les correctifs de paiements et de comptes et des journaux de supervision. Référence initiale : `27c2a5b`. Le diff complet, les empreintes et les originaux des deux fichiers touchés sont sauvegardés dans `gym-next/playwright-artifacts/refonte-lot1-2026-10-15/`. Ces changements antérieurs restent locaux ; ils ne sont pas automatiquement inclus dans le commit de design.

## Lots proposés

| Lot | Périmètre et résultat attendu | Vérifications / retour arrière |
|---|---|---|
| 1 — comptes et socle | Tokens partagés ; frontière opt-in du compte ; panneau coach complet, contrastes, navigation mobile ; header seulement recoloré | Largeurs 320/390/768/1440, contrat du header, clavier, formulaires, rôles, cookies ; retirer l'import et le marqueur pour revenir au style précédent |
| 2 — découverte | Accueil, recherche, annuaire et fiche coach selon la maquette ; cohérence des informations et mentions d'acceptation | Captures desktop/mobile et parcours recherche→profil ; rollback par commit |
| 3 — réservation | Créneaux, récapitulatif et paiement : états, annulation, dates, montants et simulation explicites | Régression métier, droits et snapshots ; rollback sans modifier les réservations |
| 4 — structures/admin | Inscription structure et administration homogènes ; maquettes avant nouvelles fonctions | Vérification des rôles et données privées ; aucun nouveau bénéficiaire de paiement implicite |
| V2 — fiabilité et gestion | Affiliations, permissions, groupes et communication documentés ; séquençage après dépendances métier | Spécifications et maquettes des états nouveaux, capacité/concurrence, permissions et canaux réels |
| V3 — valeur additionnelle | Premium, contenus protégés, suivi et statistiques seulement selon périmètre arbitré | Billing, droits serveur, consentements, critères de suivi et maquettes validés avant activation |

Les termes V2/V3 doivent rester cohérents avec les documents métier existants : ce tableau est un ordre de travail, pas une redéfinition ni une déclaration de livraison de ces versions. Les critères de suivi, le bénéficiaire structure et les conditions d'abonnement restent des arbitrages distincts.

## Lot 1 : changement réalisé

- `gym-design-tokens.css` porte la palette validée : violet #872BBF, papier #F6F4F0, encre #141316, surfaces blanches et contrastes cohérents. Les variables sont préfixées ; elles ne changent pas les autres pages.
- `gym-account-design.css` applique cette direction uniquement dans `#gym-account[data-gym-design="pitch-v1"]`. Le marqueur est ajouté au composant existant et la feuille au layout. Aucun déplacement ou renommage d'élément du header ; seules couleurs et bordures sont adaptées.
- Cause mesurée avec Playwright MCP : `.account-panel` en flex et `.account-dashboard` rétréci à **99 px** sur mobile ; passage à un panneau bloc et une grille bornée. L'aperçu DOM donne **308 px** après adaptation initiale. La suppression d'un scroll interne parasite libère aussi de la largeur ; le header garde ses groupes et leur ordre.
- Menu coach sombre avec liens clairs et cibles de 44 px ; groupes de liens repliés en lignes sur mobile. Cartes, champs et images bornés, grille pleine largeur sous 900 px. Les styles du header n'imposent aucun nouveau display, ordre, alignement ou texte.
- Suppression ciblée du reflet décoratif `account-panel::before` : sa hauteur suivait le tableau de bord entier (plus de 9 500 px) et sa rotation provoquait un débordement horizontal à 1 877 px pour une fenêtre de 390 px. Sans cet effet, Playwright MCP mesure 375 px de largeur de document dans une fenêtre de 390 px avec scrollbar. Le contenu reste déplié ; aucune donnée n'est masquée pour faire passer le contrôle. Le libellé latéral « Vérification » est corrigé.
- Les déclarations prioritaires restent nécessaires à la frontière avec les anciennes règles forcées. Elles sont centralisées dans une seule feuille de migration du compte ; suppression des anciennes couches à prévoir après migration des routes, pas avant contrôle de leurs consommateurs.
- Aucun changement de logique financière, aucun nouvel abonnement, aucune nouvelle dépendance applicative. Le problème des séances annulées dans les « prochaines séances » appartient au lot métier suivant et n'est pas dissimulé par du CSS.

## Simplification : constat initial

LangChain/LangGraph : **non ajoutés**. Aucun besoin mesurable ne justifie ces dépendances pour une refonte visuelle ou le contrôle du tunnel. Les Route Handlers et les tests existants suffisent ici.

RAG/gouvernance/orchestration : les contrôles de corpus et contrats sont référencés par `package.json` et la CI ; les schémas et documents métier ont des consommateurs. Aucune suppression globale justifiée sur ce premier lot. Les tableaux de bord historiques non rendus, scripts de diagnostic à la racine et couches CSS sont candidats à une analyse de références séparée. Les documents originaux ne sont pas des doublons à effacer.

## Vérifications et livraison

Typage et build optimisé : **PASS**, journaux `types-final.log` et `build-release.log`. Contrat Netlify et frontière secrets du bundle client : **PASS**. Garde production et isolation du module structures : **PASS**, journal `production-safety.log`.

Recette : les **38 scénarios distincts sont vérifiés**, sans annoncer une campagne unique à 38/38. La campagne `tests-release.log` donne **36/38** ; les deux échecs utilisent un sélecteur `data-account-dashboard="sportif"` qui n'existe pas dans le composant sportif. Après remplacement par le titre réellement affiché « Mes réservations », les deux scénarios sont rejoués : **2/2 PASS** dans `tests-business-final.log`, desktop et mobile. La connexion et l'annulation de la réservation de recette passent par le navigateur, pour respecter le cookie Secure même en HTTP local, sans modifier les règles de l'application.

Les huit nouveaux scénarios `account-design.spec.ts` vérifient largeur utile du planning, absence de débordement, contraste du menu, clavier, champs présents et contrat des sept liens du header, aux quatre largeurs et sur les deux profils de navigateur. Les trente scénarios de régression couvrent comptes/déconnexions, cookies, navigation, réservation et tunnel structures avec paiement simulé. La première recette intermédiaire révélant le reflet décoratif reste archivée ; elle a été interrompue pour corriger la cause avant recompilation.

Playwright MCP a servi à reproduire le défaut sur la démo existante, mesurer les largeurs, prévisualiser les styles dans le DOM puis vérifier le vrai build local. Les captures suivantes proviennent du build final, pas d'une image de maquette : [mobile avant](assets/refonte-lot1/coach-mobile-before.png), [mobile après](assets/refonte-lot1/coach-mobile.png), [desktop après](assets/refonte-lot1/coach-desktop.png). Les journaux et empreintes sont dans `gym-next/playwright-artifacts/refonte-lot1-2026-10-15/`.

Les tests et le serveur ont été exécutés séquentiellement avec un worker. Aucun serveur additionnel conservé. Aucun nouveau déploiement Netlify dans ce lot ; le rendu contrôlé est local et la démo publique conserve sa version précédente. Les travaux backend antérieurs restent dans l'arbre de travail et ne sont pas inclus automatiquement dans le commit visuel.

Branche de travail : `design/refonte-progressive-lot1`. Aucun force-push ni fusion dans `main`. Le commit sélectionne seulement la refonte, les tests associés et les mises à jour documentaires correspondantes. Les snapshots locaux et le diff de référence ne sont pas poussés ; trois captures optimisées accompagnent le rapport. Le test de réservation inclut explicitement la correction connexe de choix d'un créneau libre et d'annulation de sa propre fixture, nécessaire au rejeu fiable.

Retour arrière : revert du commit de design sur cette branche ; pour l'arbre de travail courant, retirer l'import de `gym-account-design.css` et les attributs opt-in du composant, sans effacer les changements backend antérieurs. Prochain lot : découverte (accueil/recherche/annuaire/fiche) et cohérence des informations. **V2 et V3 ne sont pas livrées** par ce premier lot.
