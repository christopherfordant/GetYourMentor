# Catalogue de disciplines — adaptation locale du 2 novembre 2026

La dernière demande étend le fonctionnement métier aux disciplines déjà présentes dans la découverte. Elle remplace la séparation antérieure « quatre disciplines métier / quatorze destinations de découverte ». Aucun déploiement, migration distante, achat, nouveau compte réel ou changement de données distantes n'est autorisé dans ce lot.

## Diagnostic et interventions

| Emplacement | Restriction initiale | Conséquence | Intervention |
| --- | --- | --- | --- |
| Navigation / découverte | 14 destinations déjà présentes, contre 4 dans le métier | Catalogue visuel plus large que les données acceptées | Source commune `lib/sports-catalogue.ts`, re-export compatible |
| Types, aperçu mentors, récapitulatif et demandes coach | Unions et validations limitées à 4 valeurs | Nouveaux sports rejetés ou cartes indisponibles | Types et validations issus du catalogue commun |
| Séances collectives | Filtre limité à 4 ; une valeur inconnue effaçait le filtre | Recherche élargie involontairement | 14 options, état inconnu explicite et résultats fermés |
| Recherche / annuaire / fiche | Alias partiel, retour silencieux football ou fitness | Identité du sport perdue | Alias Fitness cohérent ; valeurs inconnues conservées/signalisées, aucun coach de secours pour un nouveau sport sans sélection |
| Compte coach | Disciplines libres, pas de modification du sport structuré | Impossible de choisir une nouvelle discipline principale | Sélecteur → validation → PATCH propriétaire existant → stockage → API / filtres |
| Accueil / footer / plan / métadonnées | Anciennes listes et labels de quatre disciplines | Informations et destinations incomplètes | Listes dynamiques, vocabulaire durable, liens et métadonnées adaptés |
| Visuels | Quatre grandes scènes ; icônes détaillées dans le header seulement | Risque d'illustration incorrecte pour les autres sports | Équipements locaux partagés ; remplacement neutre sans scène d'un autre sport |
| SQL | Contraintes sport de deux tables limitées à 4 | Écritures des nouveaux sports bloquées sur ce schéma | Schéma neuf adapté, migration préparée et non exécutée |

## Catalogue et compatibilité

Le catalogue comporte **14 disciplines** : Football, Basketball, Fitness, Sports de combat, Boxe, MMA, Pilates, Coaching sportif, CrossFit, Préparation physique, Musculation, HYROX, Perte de poids et Padel.

Identifiants de découverte : `football`, `basketball`, `metiers-de-la-forme`, `sports-de-combat`, `boxe`, `mma`, `pilates`, `coaching-sportif`, `crossfit`, `preparation-physique`, `musculation`, `hyrox`, `perte-de-poids`, `padel`. En stockage, seul l'alias historique `metiers-de-la-forme` devient **`fitness`**, déjà utilisé par les profils et réservations. Les URL `sport=fitness` restent reconnues dans les vues de découverte. Aucun identifiant existant ni historique n'est réécrit.

Le type `SportSlug`, les libellés et les équipements décoratifs partagent maintenant cette source. Les textes ne figent pas le nombre dans l'interface. Les accessoires réutilisés sont des équipements génériques déjà validés, pas de nouvelles photos de coach ni de promesses de pratique. Les quatre scènes IA restent associées à leur discipline ; les autres disciplines ont un panneau neutre avec leur équipement et leur nom. Aucun visuel généré ou téléchargé dans ce lot.

Une discipline affichée ne prouve ni l'existence d'un coach ni celle d'un créneau réservable. Les pages sans résultat restent vides avec leurs critères. Aucun profil ou créneau n'est créé pour remplir un carrousel. Le pentagone sans cadre et les portes à 2 200 ms ne sont pas modifiés.

## Chaîne de données et limites métier

Le formulaire du coach renseigne une **discipline principale structurée**, distincte du champ libre « Disciplines ». L'API conserve l'authentification coach, la restriction au propriétaire et les limites de requête ; la valeur est validée puis normalisée avant le mapping du stockage. Les réservations continuent à prendre leur discipline depuis le coach côté serveur, jamais depuis le prix ou le sport d'une URL commerciale. Les instantanés historiques ne sont pas réécrits. Le catalogue de séances courant reprend la discipline principale du coach selon son comportement existant ; la gestion relationnelle de plusieurs disciplines par coach n'est pas inventée dans cette adaptation.

La création d'un brouillon coach conserve son ancien défaut technique Fitness et son statut non validé ; le propriétaire peut maintenant choisir sa discipline principale. Cette valeur par défaut n'ajoute aucun coach au catalogue public. Les listes de quatre presets d'animation et les données des anciens pilotes `HomePageClient` / `AccueilLegacyPage`, non utilisés par les routes actives, sont des références historiques : elles ne sont pas assimilées au catalogue public. Le fichier `HomePageClient` déjà modifié et non vérifié du dépôt principal est préservé.

## SQL préparé, jamais appliqué

`supabase/schemas/app.sql` définit les 14 valeurs stockées pour `gym_coaches.sport` et `gym_reservations.sport`. Migration : `supabase/migrations/20261102_expand_sports_catalogue.sql`, transaction, remplacement des deux contraintes nommées et validation des données existantes. Aucun changement de RLS, rôle, prix, compte ou table d'historique.

Avant une exécution future : vérifier le schéma réellement déployé, les noms des contraintes, les valeurs existantes, les verrous et la procédure de retour. Une base distante restant limitée à quatre sports continuera à refuser les nouvelles valeurs tant que la migration n'a pas été approuvée et appliquée. Le contrôle statique du schéma ne constitue pas une exécution PostgreSQL. Aucun accès ni migration distante réalisé.

## Vérification et livraison

Résultats précis, empreintes, captures et statut Git : `assets/sports-catalogue-2026-11-02/verification.json`. Le build optimisé et les contrôles TypeScript, schéma de référence, configuration Netlify et frontière client/serveur sont exécutés. Recette Playwright : toutes les disciplines, alias historiques, états vides et inconnus, formulaire coach, autorisation propriétaire, DTO des réservations, filtrage collectif, contenu responsive, clavier et mouvement réduit. Les écritures de recette portent uniquement sur le serveur local et ses fixtures, puis la discipline d'origine est restaurée.

Défauts intermédiaires : anciennes attentes de test à cinq options, sélecteur englobant l'annonceur Next.js, cookie Secure non envoyé automatiquement par le client HTTP de recette et accent de libellé altéré par un outil Windows. Attentes et préparation de session corrigées sans affaiblir les protections ; libellé corrigé avant build final. Relances non additionnées comme nouveaux scénarios. Les deux défauts de tests métier antérieurs déjà documentés ne sont pas déclarés résolus par ce lot.

Les contrôles navigateur portent sur Chromium et le mobile émulé. Aucun paiement, notification, compte réel ou compatibilité globale de production revendiqué. Le site public reste sur sa livraison précédente ; l'aperçu de ce lot est local uniquement.

Aperçu : **http://127.0.0.1:3003/**, exemple [recherche Padel à Lyon](http://127.0.0.1:3003/recherche?sport=padel&city=Lyon). Serveur Next sur loopback, session 37668, checkout `C:/Users/cashe/Documents/GYM-sports-catalogue-20261102`. Relance : `node delivery-private/start-preview.cjs` depuis ce checkout ; interrompre le lanceur pour arrêter le serveur. Les anciens aperçus et le site public ne sont pas remplacés. Une requête héritée `/favicon.ico` en 404 a été observée dans la fenêtre connectée ; ce lot ne revendique pas un audit global des ressources du site. Les contrôles fonctionnels et captures ont abouti dans Playwright isolé ; un clic supplémentaire sur le consentement de la fenêtre connectée a expiré.
