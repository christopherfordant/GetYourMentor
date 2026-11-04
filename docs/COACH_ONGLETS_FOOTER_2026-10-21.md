# Fiche coach : onglets et accès au footer

## Périmètre et sources
Lot demandé le 21 octobre, base privée `d411117`, export public `741673e`. Reprise dans le worktree Factory existant ; changements antérieurs du dossier principal préservés. AGENTS, procédure/hiérarchie, préambules, relais, rapport Factory, couverture et socle Opquast consultés progressivement. Contrat anthracite/orange conservé ; aucune modification des règles métier, permissions, commissions ou données historiques.

Références publiques : [WAI-ARIA Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [Opquast 165 : focus visible](https://checklists.opquast.com/fr/qualite-numerique/le-focus-clavier-nest-ni-supprime-ni-masque), [166 : navigation clavier](https://checklists.opquast.com/fr/qualite-numerique/le-site-est-integralement-utilisable-au-clavier). Application ciblée, pas certification ni prescription Opquast d'une apparence exacte. Consultation directe suffisante : aucun moteur REA ou autre service d'analyse ajouté/exécuté.

## Causes observées
- Le bandeau change réellement un panneau. Trois boutons avec aria-pressed ne décrivaient pas ce modèle ; le changement déclenchait un scrollIntoView sur le panneau, faisant sortir le bandeau de l'écran.
- Footer normal accessible cookies fermés. Bannière fixe ouverte à 390 px : dernière mention à 824 px, bannière dès 638 px, donc recouvrement démontré avec MCP.
- Les anciens paddings séparés de découverte et accueil entraient en concurrence avec le footer partagé. La recette a révélé le cas accueil à 320 px, corrigé en supprimant ces deux réserves historiques et en centralisant le calcul.
- La règle historique masquant le retour en haut avec les cookies n'est plus nécessaire lorsque sa place est réservée dans le footer.

## Correction
Tablist avec trois tabs, aria-selected, aria-controls et panneaux nommés via aria-labelledby. Un seul tab dans l'ordre de tabulation ; flèches gauche/droite avec boucle, Home/End, Entrée/Espace natifs, Tab vers le panneau actif. Activation immédiate des panneaux déjà montés. Plus de scroll automatique à chaque changement ; « Réserver » active Planning et lui donne le focus. Pas de navigation collante ajoutée. État actif souligné et gras, cibles 48 px, flex permettant le retour à la ligne avec texte agrandi.

Bannière cookies : ResizeObserver mesure hauteur et décalage inférieur ; espace réellement nécessaire + 8 px réservé tant qu'elle est ouverte. Recalcul au redimensionnement et changement de cible footer ; nettoyage à la fermeture/démontage. Le footer garde son flux et sa hauteur naturelle. Pas de hauteur fixe, recouvrement par z-index ou grande marge arbitraire ajoutée. Les contrôles cookies et retour en haut restent dans leur rangée ; retour en haut disponible lorsque le défilement le justifie. aria-haspopup supprimé : la bannière est une région, pas un dialogue modal.

## Vérifications et preuves
Nouveau scénario de clavier/reflow/toucher sur les trois onglets ; sélection et panneau vérifiés aux quatre largeurs 320/390/768/1440. Recette footer : fiche, recherche, annuaire, accueil, compte coach, page cookies, récapitulatif en erreur, inscription structure, paiement ; quatre largeurs, cookies ouverts/fermés, contrôle géométrique et elementFromPoint de chaque lien/bouton visible. La fermeture rend le focus et supprime la réserve. Une page peut demander plusieurs défilements : pas d'obligation que tout le footer tienne sur un écran.

Émulation Chromium mobile avec tap effectif ; pas un appareil physique. Agrandissement des textes d'onglets de 13 à 26 px et libellé long, plus viewport 320 px ; pas un contrôle de zoom navigateur réel. Chargement/erreur du profil et parcours de catalogue conservés. Tests démo locaux, réponses injectées distinguées des services distants ; aucun paiement ni message externe.

MCP avant/après : recouvrement confirmé puis dernière mention au-dessus de la bannière sur les quatre largeurs, focus maintenu sur Planning après flèche. Captures synthétiques dans `docs/assets/coach-tabs-footer-2026-10-21`. Les dimensions d'image peuvent exclure les barres de défilement. Le premier passage a corrigé une assertion de test utilisant top au lieu de y ; autres reprises ciblées après suppression des paddings concurrents. Quelques navigations HMR ont répondu 404 pendant recompilation ; ne pas les présenter comme recette de build. Les commandes MCP attendant un état non encore hydraté ont été reprises après attente explicite. Résultats finaux types/build/recettes compilées dans verification.json et le relais.

Résultats définitifs : 18 scénarios PASS sur le build privé en recette locale ; export compilé 7 scénarios desktop PASS + 1 scénario tactile mobile PASS. Une recette mobile antérieure 3/3 reste une preuve complémentaire, pas ajoutée au total final. Types/build/frontière client et scan des fichiers suivis PASS sur les deux versions. Premier démarrage manuel du build public incomplet : variable CI absente, donc catalogue refusé par la protection de production ; configuration de recette loopback corrigée, aucun garde-fou du code désactivé, puis campagne entière réussie. Aucun fournisseur distant validé.

MCP compilé final à 900 px de hauteur : à 390 px de largeur, dernière mention à 666 px, bannière dès 694 px ; à 1440 px, dernière mention à 750 px, bannière dès 774 px. Retour en haut visible quand le défilement dépasse son seuil. Captures finales onglets/footer refaites sur cette version compilée.

## Confidentialité, livraison et suite
Documents/preuves dans le dépôt privé ; export public limité aux composants/styles/tests nécessaires, inspectés et sans historique privé. Aucun secret, document métier ou capture de compte réel envoyé à un service externe. Pas de garantie absolue de confidentialité.

Retour arrière : revert ciblé après revue, sans migration de données. Aucune fusion, force-push ou publication Netlify/production. Prochain lot : `/creneau` et `/recapitulatif` vers les tokens Factory, après lecture de leurs contrats de reprise, preuves et dates. Ne pas relancer cette refonte d'onglets ou supprimer les protections pour harmoniser l'apparence.
