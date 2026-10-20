# Socle qualité Opquast — 20 octobre 2026

Annexe opérationnelle du document maître existant, à consulter pour toute modification de navigation, footer, formulaire ou parcours. Aucun maître concurrent, nouvel agent ou outil ajouté. La hiérarchie et les décisions utilisateur de BRANCH_STRATEGY_GYM restent applicables. Le mode démo ne devient pas une certification ou une validation juridique.

Source publique : [référentiel officiel V5 2025–2030](https://checklists.opquast.com/fr/qualite-numerique/), consulté le 20 octobre. Sélection de règles et reformulations, pas reproduction intégrale. Le choix du footer du compte coach est une décision de design de l'utilisateur ; Opquast ne prescrit pas son apparence exacte.

## Règles retenues et preuves à demander

| Priorité / règles | Application au projet | État / contrôle |
|---|---|---|
| P1 — [15](https://checklists.opquast.com/fr/qualite-numerique/15), 29 | Confidentialité accessible ; choix cookies compréhensibles et révisables. | Lien et bouton communs ; ouverture/fermeture et retour du focus testés. Texte de confidentialité encore provisoire. |
| P1 — [158](https://checklists.opquast.com/fr/qualite-numerique/158), [180](https://checklists.opquast.com/fr/qualite-numerique/180) | Navigation stable et présentation homogène. | SiteFooter partagé : accueil, découverte, comptes, paiement, légal, inscription structure et outil admin. 19 vues publiques contrôlées ; admin non recetté connecté. |
| P1 — 137, 152 | Liens compréhensibles et destinations existantes. | Libellé Accessibilité corrigé ; adresse mail non vérifiée retirée ; ancres d'accueil existantes conservées. Pas de compte social inventé. |
| P1 — 165–167 | Focus perceptible, clavier et ordre compréhensible. | Préférences et lien confidentialité parcourus au clavier ; contrôle responsive ciblé. Audit clavier complet hors lot. |
| P1 — 182 | Contraste suffisant. | Tokens foncés sur blanc conservés ; pas de certification globale des contrastes. |
| P2 — [171](https://checklists.opquast.com/fr/qualite-numerique/171) | Plan du site accessible. | Nouvelle page /plan-du-site, liée depuis chaque footer partagé. |
| P1 — 101, 105–107, 112 | Identification et contacts fiables. | À compléter avec informations validées du propriétaire ; mentions légales/contact accessibles mais provisoires. Aucun contact fictif ajouté. |
| P1 — 23, 26–28 | Sortie du compte, isolation et confidentialité. | Garder les protections existantes ; prochaine modification d'authentification exige une recette par rôle. Non réaudité globalement ici. |
| P1 — formulaires et e-commerce | Erreurs explicites, consentement, prix total, confirmation et reprise fiables. | Vérifier par prochain lot métier ; conserver paiement simulé et règles historiques. Aucun changement commercial dans ce lot. |

## Réalisation du footer

Référence observée : https://getyourmentor-demo-20261014.netlify.app/compte?mode=coach avec Playwright local, session neuve sans authentification. Captures avant dans assets/footer-opquast-2026-10-20 (bannière initiale visible). Les variantes réduites EditorialHome/DiscoveryFrame sont remplacées par SiteFooter ; l'inscription structure et l'outil privé admin le réutilisent. Les footers déjà partagés conservent leur composant. Les pages d'erreur système et réponses API ne sont pas des pages publiques recettées ici.

Quatre colonnes desktop, deux colonnes mobile, largeur fluide et flux normal. Une rangée réserve la place des préférences et du retour en haut ; aucun z-index utilisé pour masquer les liens. Pas de footer fixé ou de hauteur imposée. La déclaration des titres est renforcée dans la règle partagée pour empêcher la police éditoriale de l'accueil de fuir dans le footer.

Support : FAQ, accessibilité, cookies, plan du site. Mentions légales et contact mènent à la page existante signalant les renseignements manquants. Aucun mail non vérifié ou API de diagnostic présenté comme centre d'aide. Les réseaux n'apparaissent que si social-links.ts contient des URL officielles vérifiées ; les futures ouvertures externes sont annoncées dans le nom accessible.

## Limites et suite

Ce lot ne valide pas les 245 règles. Les contenus juridiques, coordonnées officielles, contacts, durées de conservation, fermeture/export des comptes et accès rapides restent à qualifier selon les preuves existantes, sans lancer un nouvel audit global automatique. Le sélecteur de langue existant du header n'est pas une preuve de traduction complète. Une allégation publique de conformité serait prématurée.

Recette locale : comparaison des liens sur 19 vues, utilitaires et absence de débordement sur cinq pages à 320/390/768/1440 px, navigation confidentialité et retour du focus cookies. Captures après avec consentement déjà enregistré : elles ne sont pas un avant/après pixel identique de la bannière initiale. Outil Playwright local ; aucune preuve MCP ajoutée. Build/typage et résultat final dans assets/footer-opquast-2026-10-20/verification.json.

Aucun déploiement dans ce lot, aucune modification des droits, paiements ou données. Retour arrière : revert ciblé après revue, sans reset des changements antérieurs. Prochaine priorité qualité : qualifier les mentions et les moyens de contact documentés avant toute ouverture commerciale.

Contrôle final : typage/build/frontière client PASS. Les six tests d’interface ont réussi avant le dernier ajustement de police/casse des titres. La relance du serveur local a été refusée par le contrôle automatique sans motif détaillé ; aucune preuve visuelle finale de cet ajustement ni exécution des nouvelles assertions typographiques revendiquée. Les captures montrent l’état juste avant ce raffinement.
