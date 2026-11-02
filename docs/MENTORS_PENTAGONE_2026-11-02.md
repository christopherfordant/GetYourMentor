# Mentors : adaptation Lovable et pentagone intégré — 2 novembre 2026

## Périmètre et diagnostic

Demande exécutée localement, sans déploiement, migration distante, achat, nouveau compte ni nouvelle dépendance. Base isolée : `731cc4ba03e57e98813e98359e8d3d7d09f0944e`, checkout `C:/Users/cashe/Documents/GYM-mentors-integration-20261102`. Les vingt modifications suivies antérieures du dépôt principal sont exclues du lot.

La référence Lovable a été réellement ouverte avec Playwright : accueil, carte du catalogue et fiche `/mentor/m1`, dont l'onglet de présentation. L'accès initial différé a finalement abouti ; aucun écran inaccessible n'est présenté comme consulté. Captures recadrées dans `assets/mentors-integration-2026-11-02/`, sans URL de session ni contexte de compte.

| Section | État initial | Apport utile de Lovable | Intervention retenue |
| --- | --- | --- | --- |
| Mentors accueil | Aperçu public borné, carrousel horizontal ; pentagone autonome | Informations de comparaison plus visibles | Pentagone intégré aux composants, spécialité, ville, présentation et formats existants |
| Annuaire | Critères et cartes existants | Carte reliée à une fiche plus informative | Même composant de faits déclarés ; format issu des données, pas déduit du texte |
| Fiche coach | Présentation, diplômes, formats, réservation existants | Séparation présentation / séance / planning | Informations déclarées regroupées ; qualification du profil clarifiée |
| Séances collectives | Aperçu en grille et parcours existants | Comparaison simultanée | Grille préservée, aucune deuxième scène 3D |
| Guide, espace, FAQ, devenir mentor | Ancres et destinations réelles du panneau droit | Parcours simples selon le contenu | Compositions et accès existants conservés |
| Offres, popularité, proximité, prochain créneau | Données insuffisantes pour les blocs de la référence | Potentiel futur sous réserve de données réelles | Aucun classement, promotion, distance, horaire ou compteur fabriqué |

La référence affiche notamment des tarifs individuel/groupe, packs et créneaux. Ils ne deviennent pas des fonctionnalités locales par imitation visuelle. Les parcours locaux gardent l'acceptation du coach avant paiement, contrairement à la promesse de confirmation immédiate observée dans la référence.

## Informations et provenance

Les trois profils disponibles en recette sont les données de démonstration préexistantes de `gym-next/lib/domain.ts`. Leurs portraits viennent de la bibliothèque IA existante, affichée explicitement comme illustration de démonstration, jamais comme photographie réelle.

| Information affichée | Source et règle |
| --- | --- |
| Identité, discipline, spécialité, ville, prix de départ | Champs existants du catalogue ; aucun résultat ou nouveau coach ajouté |
| Présentation | `description` existante, abrégée sur la carte et intégrale dans la fiche |
| Formats | `sessionTypes` déclaré, sinon `format` explicite ; absence : « À confirmer avec le coach » |
| Cadre / niveau | `practice` et `level` seulement lorsqu'ils existent ; « Niveau indiqué », sans transformer le niveau principal en condition d'éligibilité |
| Diplômes | Texte déclaré inchangé : le suffixe « à compléter » n'est plus supprimé ; aucune certification indépendante prétendue |
| Validation | « Profil validé dans le catalogue », distinct d'une qualification certifiée |
| Prix | « À partir de … » ; unité et durée non stockées ici, donc pas d'invention de tarif horaire ou par personne. Montant et durée précisés avant confirmation |

Chaîne existante examinée : `CoachProfile` → `CoachProfileEditor` et ses champs → validation de profil → route PATCH protégée par rôle → mapping de stockage existant → requête publique bornée → validation du payload → carte / annuaire / fiche. Les champs utilisés existaient déjà : aucune migration, nouveau formulaire ou écriture sur un compte réel nécessaire.

La requête d'aperçu sélectionne exclusivement douze colonnes publiques, profils validés, limite six, délai huit secondes. Le DTO public est maintenant une liste positive explicite, y compris les sous-objets tarifaires : coordonnées GPS précises, état interne de vérification, compte bancaire et futurs champs privés ne sont pas propagés par un spread. Le mode propriétaire authentifié reste distinct du mode public. Aucun document d'identité ou justificatif n'est rendu public.

## Composition et interactions

Une seule scène pentagonale, dans l'aperçu des mentors de l'accueil réel (`EditorialHome` → `MentorPreviewSection`). Elle réutilise les composants et les données, pas un iframe du prototype.

- Zéro profil : état vide ; un/deux : cartes simples ; trois/quatre : profils réels complétés par des accès explicites à l'annuaire et, si nécessaire, à la recherche. Ces faces sont des actions de parcours, pas de faux mentors ni des explications de conception.
- Cinq profils : cinq véritables cartes ; six : premier groupe de cinq et second groupe d'une carte, accessibles par « Autres profils ». L'aperçu reste borné à six ; le catalogue complet reste dans l'annuaire.
- Flèches manuelles, clavier, balayage tactile, navigation sans arrêt après un tour. Aucune rotation automatique. Une seule face active accessible ; les autres sont inertes. Le focus quitte une face avant sa désactivation.
- Mouvement réduit respecté ; hauteur mesurée selon le contenu ; textes longs bornés sur la carte, fiche complète accessible ; portrait manquant sans fausse photo.
- Les micro-effets de portrait préexistants sont conservés par composition CSS. Les portes de navigation restent à **2 200 ms**, avec leurs temporisations inchangées.

## Vérifications et livraison

Aperçu applicatif laissé ouvert : **http://127.0.0.1:3002/#mentors**. Next démarre sur loopback uniquement depuis le checkout isolé ; données de recette, clé de session éphémère, aucune configuration Supabase/Stripe/Resend héritée. Après correction du paramétrage local de recette, API mentors et séances HTTP 200 et rechargement complet du navigateur vérifiés. Trois profils et cinq faces visibles, rotation rejouée, aucune largeur débordante observée. Captures `review-final-desktop.png` et `review-final-mobile.png`.

Serveur : lanceur PID 16948, Next PID 15572, session d'exécution 23571 au moment du contrôle. Pour rouvrir après arrêt : `node delivery-private/start-preview.cjs` depuis `C:/Users/cashe/Documents/GYM-mentors-integration-20261102` (build vérifié conservé). Pour arrêter, interrompre ce lanceur ou, après vérification de leur identité, arrêter ses deux processus. Le serveur statique historique sur 4321 reste un aperçu distinct de l'ancien prototype.

Résultats définitifs, captures, état du serveur et livraison Git : `assets/mentors-integration-2026-11-02/verification.json`. Les captures « before » proviennent du build antérieur dont les sources des composants ont été comparées, pas d'une reconstruction supposée. Les nouveaux tests remplacent les attentes du précédent carrousel horizontal par celles du pentagone ; les limites de requête et de données restent testées.

Défauts intermédiaires : typage de projection corrigé avant build ; sélecteur d'onglet et convention de mouvement réduit corrigés dans les tests ; anciens sélecteurs du carrousel horizontal adaptés. Couleur de CTA et contraste des onglets de fiche corrigés après inspection visuelle. Les relances ne constituent pas des scénarios supplémentaires.

Recette ciblée : **35 cas ordinateur et 18 cas mobile PASS**, avant le dernier ajustement CSS des onglets. Le parcours vers la fiche, ses contrastes et son contenu font l'objet d'une relance des deux formats sur le build final ; résultats dans le manifeste de vérification. Les deux anciens tests `business-flow` observés en échec lors du premier lancement étendu ont aussi été exécutés seuls sur le build précédent : mêmes échecs reproduits. Le premier sélecteur `body` traverse les deux copies temporaires des portes dans Shadow DOM ; le second attend un lien de connexion sur un récapitulatif dépourvu de réservation valide. Le lancement étendu a été interrompu après identification d'anciens sélecteurs de carrousel : aucun bilan complet n'en est déduit. Ces défauts de recette antérieurs restent à traiter séparément ; la suite globale n'est pas déclarée verte.

Limites : Chromium ordinateur et tactile émulé, pas de Safari/Firefox ni de téléphone physique. Services distants, véritables disponibilités, justificatifs et édition d'un compte réel non testés. Pas de reprise des avis, badges, chiffres, promotions, niveaux d'éligibilité, packs ou classement de Lovable sans sources et fonctionnalités appropriées. L'adaptation globale n'est donc pas déclarée terminée.

Les anciens prototypes et rapports sont préservés. Le retour utilisateur sur la nouvelle scène précède toute généralisation éventuelle ; les autres sections gardent leurs compositions adaptées.
