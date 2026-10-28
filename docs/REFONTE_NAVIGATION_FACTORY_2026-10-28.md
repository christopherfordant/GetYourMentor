# Refonte Lovable / Factory — lot 1, navigation — 28 octobre 2026

## Autorité et périmètre livré

Décision utilisateur : la référence Lovable prime pour les sections, contenus, labels, disciplines, carrousels et règles effectivement vérifiées. Exceptions : thème Factory, structure du header local, bibliothèque d'images IA prioritaire, panneau latéral droit validé. L'ajout des disciplines et l'accès coach via Mon compte sont autorisés sans nouvelle validation. Aucun déploiement, service commercial réel ou contournement de Git.

**Lot borné de ce tour : point de retour avant refonte, socle Factory de l'accueil/découverte, navigation commune, menu droit, routes de découverte étendues, cloche d'accès au compte et entrée coach.** Les carrousels centrés, les nouvelles images et les nouveaux blocs de découverte ne sont pas annoncés livrés : ils ont des dépendances métier et constituent les lots suivants.

## Sauvegarde et Git

- Base avant travaux : `88e00f9021af8eabcb9da04d209ba185499c1197`.
- Commit de checkpoint réalisé avant les modifications applicatives : `b9a025ea33611103e420c72cb558208e878332c2`, tag local annoté `checkpoint/avant-refonte-lovable-2026-10-28`. [Description et portée de la sauvegarde](POINT_RETOUR_AVANT_REFONTE_2026-10-28.md).
- Patch local des 20 fichiers suivis antérieurement modifiés, inventaire des 79 entrées non suivies et SHA initial conservés hors dépôt. Les fichiers non suivis restent sur disque, pas archivés par le patch. Aucune promesse de sauvegarde intégrale.
- Push du checkpoint rejeté `non-fast-forward` (code 1), distant relu `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Le tag reste local ; aucun nouveau ref distant créé pour contourner ce rejet. Aucun pull, rebase, merge ou force-push.
- Branche de livraison unique `design/refonte-progressive-lot1`. Les changements applicatifs de ce lot portent sur des fichiers propres au départ ou nouveaux. Les 20 modifications antérieures ne sont pas incorporées en bloc.

## Référence et connaissances disponibles

[Projet Lovable](https://lovable.dev/projects/447e4f2f-dfd3-455d-a936-0e3025ea0276), [audit des 15 rubriques](AUDIT_SECTIONS_LOVABLE_MENU_2026-10-28.md), observations expurgées du 28 octobre, maquette validée et [bibliothèque IA](IMAGES_IA_2026-10-28.md). Socle et lecture progressive du dépôt appliqués ; V3/V5/REA ne sont pas présentés comme des moteurs installés. Compétence Sites appliquée en mode local uniquement, aucune nouvelle infrastructure ou publication Sites.

Réouverture du projet dans la session navigateur existante : éditeur accessible mais iframe de prévisualisation restée sur un état générique lors de la reprise. Une lecture DOM n'a pas abouti et a été arrêtée ; un snapshot ciblé a confirmé l'absence de panneau exploitable. La cloche était visible dans l'audit précédent, mais son ouverture, ses événements, ses liens et les états lu/non lu ne sont toujours pas vérifiés. Aucune fonctionnalité de backend Lovable déduite de l'icône.

## Réalisations

### Header et accès

`PlatformHeader` commun à l'accueil, recherche/annuaire/fiche et autres cadres DiscoveryFrame, compte, paiement et inscription structure. Logo/nom, sports et Mon compte conservés comme structure ; retrait de Je suis coach de ces headers actifs. Les composants historiques d'accueil non utilisés par la route `/` et déjà modifiés antérieurement restent hors lot.

Le header propose 14 entrées : les quatre familles locales conservées, complétées par les entrées de référence (football et basketball communs ne sont pas dupliqués). Fitness et Sports de combat restent disponibles pour les anciens liens ; coaching sportif, boxe et MMA sont aussi exposés avec leurs labels propres. Source commune `lib/discovery-sports.ts`, utilisée par le header, la recherche et l'annuaire. Sur mobile, panneau Sports déroulant ; sur ordinateur, navigation sur plusieurs lignes sans compression extrême.

Les nouvelles catégories ont des routes de recherche et d'annuaire effectives, avec état vide lorsqu'aucun profil ne correspond. **Cela n'étend pas encore le modèle de création/réservation de coach au-delà des quatre sports métier existants.** Aucun coach qualifié pour le padel/boxe/etc. inventé pour remplir les résultats. Le visuel football de repli n'est plus affiché pour une discipline sans image adaptée.

Depuis Mon compte, choix explicite Espace sportif / coach / structure, conservant le contexte de réservation normalisé déjà fourni par le serveur. Le mode est une intention d'interface/authentification ; le serveur conserve l'autorité sur le rôle. Les contrôles d'identifiants et de session existants ne sont pas modifiés. Les réglages d'affichage coach présents dans l'ancien header sont conservés.

### Menu latéral

Panneau droit Factory, ouverture vers la gauche, flèche discrète seule au repos avec cible 44×56 px, fermeture par flèche/Échap/fond, dialogue natif pour l'inertie et le clavier, retour du focus après réaffichage du déclencheur, blocage du scroll de fond et mouvement réduit.

Monté par `ClientEnhancers` sans modifier le layout antérieurement modifié. Il existe sur toutes les routes du shell, y compris les pages hors cadre DiscoveryFrame. Sept entrées actives pointent vers les fonctions/ancres réellement présentes : Tous les mentors, Entraîne-toi à plusieurs, Découvrir la plateforme, Ton espace, Fais-toi guider, Questions fréquentes, Deviens mentor. Un accès Mon compte complète le panneau.

La maquette approuvée contenait quinze libellés proposés, mais huit autres rubriques de découverte ne sont pas artificiellement activées avant leur implémentation. Les futures ancres et sélections seront ajoutées avec leurs blocs ; aucun lien mort ou alias trompeur vers le même catalogue sous des promesses différentes. Deviens mentor mène à Mon compte, puis au choix coach.

### Cloche

Adaptation limitée et explicite : dialogue Notifications avec un accès réel à Mon compte pour retrouver demandes et échanges. Aucun compteur, alerte, persistance lu/non lu ou envoi externe inventé. Ce n'est pas annoncé comme une reproduction fonctionnelle de la cloche Lovable. Un flux de notifications isolé par compte reste à concevoir après inspection de la référence et qualification des événements existants.

### Factory et qualité

Tokens Factory explicites, accent orange/deep orange, surfaces anthracite et police système sur les wrappers accueil/découverte. Les surfaces blanches codées en dur de la feuille Discovery sont remplacées par les tokens de surface ; les principales surfaces de l'accueil sont adaptées. La bibliothèque IA reste identique, ses légendes consomment les tokens. Les contenus des comptes/paiements non migrés gardent leurs styles hérités : ce lot ne certifie pas la refonte visuelle de toutes leurs zones internes.

Les routes restent des ancres HTML explorables ; pas de données structurées de prix, note ou disponibilité ajoutées. Pas de faux indicateur de conversion, carte de chaleur ou mesure de performance inventée. Les labels/paragraphes des autres sections de l'accueil seront repris avec le lot de contenu, sans doublons de sélection.

## Matrice de dépendances des sections

| Référence | Réemploi / statut après ce lot | Données ou adaptation à réaliser ensuite |
|---|---|---|
| Ça démarre bientôt | Créneaux/séances existants, bloc d'accueil non livré | Heure de référence, disponibilités futures, capacité et limite de résultats |
| Offres du moment | Non livré ; aperçu abonnements distinct | Promotions vérifiées, période/éligibilité, montants et historiques |
| Les mentors qui te correspondent | Recherche/filtres conservés, pas de recommandation revendiquée | Préférences explicites et sélection expliquée |
| Pour atteindre un objectif | Suivi privé existant, bloc public non livré | Objectifs de découverte distincts des données privées |
| À proximité | Annuaire avec géolocalisation conservé | Aperçu sur accueil, autorisation et distances réelles |
| Les JIM les plus demandés | Non livré | Définition JIM/popularité, comptage autorisé, pas tri par note rebaptisé |
| Disponible ce soir | Non livré | Créneaux datés/fuseau, pas alias du filtre après-midi |
| Entraîne-toi à plusieurs | Menu relié à `/seances` existant | Aperçu d'accueil à partir des offres et capacités |
| Ton coach se déplace | Non livré | Mode domicile, zone et frais validés, confidentialité adresse |
| Nouveaux mentors | Non livré | Date de publication fiable et profil validé |
| Fais-toi guider | Menu relié au guide `/#suite` existant | Harmoniser copie et recherche selon référence |
| Explication encadrement/parcours | Blocs existants préservés | Recomposition sans doublon avec le guide |
| Ils ont trouvé leur mentor | Avis par coach existants, bloc accueil non livré | Avis utilisables/autorisés, aucun témoignage synthétique présenté comme réel |
| Deviens mentor | Menu → Mon compte → Espace coach | Contenu d'acquisition prioritaire de référence à reprendre |
| Tous les mentors | Menu/header → annuaire, routes étendues | Carrousel centré, catalogue et pagination, nouveaux profils démo/visuels identifiés |

Prochain lot après cette navigation : définir un modèle de carte et un carrousel central mis en avant, puis brancher un premier aperçu réel du catalogue et les entrées collectives. Les nouvelles images IA seront générées selon le catalogue effectivement retenu, sans attribuer de faux portraits à des personnes réelles. Les sélections à critère métier restent séparées ; ne pas répéter les trois fixtures dans toutes les rubriques.

## Vérifications et livraison

Checkout détaché de contrôle `C:/Users/cashe/Documents/GYM-navigation-refonte-20261028`, base checkpoint b9a025e plus patch ciblé du lot. Aucun commit distant intégré, aucune autre branche de livraison. Dépendances existantes réutilisées par jonction node_modules ; fichiers `.next` propres au checkout. Ni variables privées, ni anciennes copies ignorées `playwright-artifacts`, ni modifications locales antérieures copiées pour faire passer un contrôle.

Premier build optimisé et contrôle de frontière client/serveur PASS. Contrôle types ciblé du dossier principal PASS avec configuration temporaire, sans modifier la configuration canonique ; contrôle types standard du checkout isolé également PASS. Recette sur le build isolé en démonstration locale (Supabase/Stripe/Resend neutralisés). Une fixture sportive est inscrite en mémoire pour contrôler qu'une intention coach ne change pas son rôle ; mauvais mot de passe refusé et paramètres URL non authentifiants vérifiés. Aucun compte réel, réservation, paiement ou notification réelle.

Premier passage des huit scénarios navigation : trois PASS/cinq FAIL. Deux échecs venaient d'une attente de navigation Sports visible alors qu'elle est repliée sur mobile ; un d'un intitulé de connexion attendu incorrect ; deux ont révélé le retour de focus avant réaffichage de la flèche. Attentes corrigées et vrai défaut de focus corrigé ; verrouillage du défilement de fond ajouté. Une corruption d'accents dans deux textes insérés par script a aussi été corrigée avant les captures finales.

Diagnostics supplémentaires : une règle globale CSS placée dans un module a été rejetée par le build, déplacée puis remplacée par une compensation de scroll locale au dialogue. Les mesures successives ont identifié la gouttière de 15 px et une cible de fermeture partiellement hors écran ; retrait de la gouttière globale et compensation du padding lors du verrouillage de fond. Le mode d'acceptation local historique accepte l'amorçage de comptes inconnus : le test de sécurité a été recentré explicitement sur un compte enregistré, dont le rôle reste serveur et le mot de passe est vérifié. Ce comportement local historique n'est pas une validation d'authentification production, Supabase ou démo hébergée, et reste à qualifier séparément.

Résultats finaux : build optimisé, typage standard isolé et frontière des secrets client/serveur PASS ; huit scénarios navigation PASS (18,5 s), puis neuf contrôles de régression images/recherche/annuaire PASS (22 s). Les huit scénarios couvrent notamment six routes à 320/390/768/1440 px, clavier/focus, menu, cloche, quatorze disciplines, contexte de réservation et rôle du compte enregistré. Le test historique de découverte attend désormais les quatorze options approuvées, au lieu de quatre ; aucun contrôle désactivé.

Captures finales du menu à 320, 390, 768 et 1440 px dans `docs/assets/navigation-refonte-2026-10-28/`, captures 390 et 1440 inspectées visuellement. Le fichier `verification.json` borne la version et la portée de ces preuves. Les contrôles sur le build local ne prouvent ni le fonctionnement de services réels ni une recette hébergée. Workflow GitHub inchangé : push limité à main/feat/nextjs-migration, pas à cette branche ; contrat Netlify inchangé, état des réglages distants non vérifié. Aucun déploiement commandé.

Livraison Git : tentative normale sur `design/refonte-progressive-lot1` ; blocage non-fast-forward déjà confirmé au checkpoint, distant `d50b9eb5cfceeb4b79b4105b9417eb5d94f3793a`. Le résultat du push final est consigné dans le relais. Aucun contournement, fusion ou synchronisation automatique. Les vingt fichiers suivis et soixante-dix-neuf entrées non suivies antérieurs restent hors commit.
