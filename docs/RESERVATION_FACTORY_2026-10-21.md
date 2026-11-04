# Factory : créneaux et récapitulatif

## Sources et périmètre
Lot demandé le 21 octobre, bases privée `7aebba1` et publique `342e62b`. Worktree Factory existant, travaux du dossier principal préservés. AGENTS, procédure, préambules/index/relais, contrat Factory, couverture, rapports formulaire/reprise, récapitulatif serveur et transport privé consultés progressivement. Aucun PDF annoncé relu intégralement. Les sources historiques parlant d'un récapitulatif par paramètres d'URL sont remplacées par les contrats serveur plus récents.

Application limitée à l'activation Factory de `slot`/`recap`, aux styles `gym-booking-design.css` et à un token de surface d'erreur partagé. Aucun endpoint, composant métier de réservation, validateur, stockage, cookie, règle commerciale ou mécanisme de reprise modifié.

## Réalisation
Les couleurs violettes et surfaces blanches codées en dur sont remplacées par les tokens communs : anthracite, surfaces de cartes, textes clairs, accents orange, actions orange profond, erreurs lisibles. Typographie système et arrondis partagés. Sélection de créneau indiquée par aria-pressed existant, graisse, soulignement et bordure ; l'information ne repose pas uniquement sur la couleur. Focus, survol, désactivation et chargement restent distincts. Progression active soulignée ; résumé et identification gardent leur hiérarchie desktop/mobile existante.

Le calendrier à sept jours conserve son défilement horizontal borné et son aide mobile. La région est focusable ; les contrôles hors champ restent atteignables au clavier. Pas de grille parallèle, changement de dates ou réécriture des disponibilités. Les ajustements du header, des onglets coach et de réserve cookies du lot précédent sont réutilisés.

Références publiques consultées sans données privées : [WAI — instructions de formulaires](https://www.w3.org/WAI/tutorials/forms/instructions/) et [Opquast V5](https://checklists.opquast.com/fr/qualite-numerique/). Vérifications ciblées de lisibilité, navigation clavier, sélection et confirmation ; aucune conformité globale revendiquée. REA non nécessaire pour cette transposition CSS ; aucune installation ou couche d'agents ajoutée.

## Vérifications et preuves
Recette de développement sur l'export : 23 scénarios distincts vérifiés, dont reprise après réponse perdue, idempotence/concurrence, accès étranger refusé, cookie expiré/rotation/rattachement, données serveur face aux paramètres commerciaux falsifiés, chargement/erreurs et absence de paiement avant acceptation. Premier passage 22/23 : sélecteur d'alerte ambigu avec l'annonceur Next.js, corrigé par ciblage de l'erreur métier ; scénario ciblé repassé 1/1.

Les nouveaux contrôles visuels utilisent le catalogue local pour la sélection, et un DTO synthétique injecté pour le récapitulatif : cette dernière preuve ne valide pas l'autorisation serveur. Les suites de reprise et suivi exercent séparément des demandes réellement enregistrées en mémoire locale. Les traces et reçus bruts ne sont pas publiés.

MCP : rendu avant/après et mesures à 320/390/768/1440 ; pas de débordement de page. Une tentative de clic MCP n'a pas satisfait le contrôle de stabilité et une sélection clavier n'a pas été confirmée dans cette session de développement ; ne pas la compter comme parcours réussi. La sélection et le clavier sont validés par Playwright local. Le récapitulatif visuel utilise uniquement une réponse synthétique, sans jeton. Captures dans `docs/assets/factory-booking-2026-10-21`. Les résultats compilés définitifs et scans sont consignés dans verification.json et le relais.

Résultats finaux : 69 scénarios PASS sur le serveur de démonstration privé en développement ; export compilé 9 scénarios PASS (Factory réservation, thème, onglets/footer et smoke). Deux scénarios visuels repassés pour produire les quatre captures définitives de l'export compilé, avec profils synthétiques et sans preuve privée ; ne pas les ajouter au nombre de scénarios distincts. Types/build/frontière client et scans PASS sur les deux versions.

La première recette privée en production HTTP a donné 56 succès et 13 échecs : quatre attentes visuelles de violet devenues historiques, actualisées, et des parcours dépendant de cookies Secure non transportés sur HTTP. Source `lib/auth.ts` et cookie `gym-booking-browser` conservés sans modification. Les 69 scénarios ont ensuite été vérifiés en mode démo adapté ; aucune validation d'authentification HTTPS de production n'est revendiquée. Cette distinction de modes ne vaut pas correction ou désactivation des protections.

## Limites, livraison et suite
Mode démonstration conservé : calendrier simulé et données en mémoire perdues au redémarrage. Pas de paiement réel, notification ou activation Premium. Quatre sports, droits, acceptation avant paiement, capacités, tarifs des groupes, 15 % administrable et historiques inchangés. Aucun fournisseur réel, RLS distante ou Netlify validé.

Documents et preuves dans le dépôt privé autorisé ; export public limité aux fichiers de code/tests et texte public vérifiés, sans documents métier ni historique privé. Inspection du diff et scans, sans garantie de risque nul. Les captures ne contiennent aucun compte réel, cookie ou preuve privée. Aucun déploiement, force-push ou fusion.

Prochain lot recommandé : `/paiement` et `/suivi`, avec lecture préalable des contrats de preuve/paiement/reprise et mêmes tokens, sans activer de paiement réel. Mise à jour du relais existant, pas de maître concurrent. Retour arrière par revert ciblé après revue, sans migration de données. Compteurs d'usage inconnus, aucune activité annoncée en arrière-plan.
