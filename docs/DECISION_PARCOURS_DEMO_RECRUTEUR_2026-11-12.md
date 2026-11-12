# Décision de parcours — démo recruteur GetYourMentor

Date : 12 novembre 2026. Décision issue de l'accord utilisateur donné à la recommandation du parcours individuel. Cette note fixe le comportement attendu ; elle ne décrit pas une fonctionnalité déjà livrée.

## Expérience retenue

Le recruteur suit son propre essai, sans identifiant ni mot de passe partagé. L'accueil proposera deux entrées séparées : « Tester le parcours sportif » et « Tester le parcours coach ». La session sera temporaire, propre au navigateur/testeur et effaçable. Un raccourci de démonstration partagé n'est pas retenu pour la première version.

### Parcours sportif

1. Démarrer une session individuelle sans demander d'adresse e-mail ou de numéro si aucun besoin métier ne l'exige.
2. Choisir un profil de coach fictif, explicitement identifié, puis un créneau de démonstration clairement non réel.
3. Afficher le récapitulatif et une validation automatique déterministe du scénario.
4. Simuler la confirmation du paiement et montrer une réservation acceptée dans le compte de démonstration.
5. Confirmer le résultat dans le site et proposer « Effacer mon essai ».

La confirmation n'est pas une décision d'un coach réel ni d'une IA connectée ; le libellé doit dire « validation simulée ». Aucun débit, transfert, créneau réel ou disponibilité réelle ne doit être suggéré. La première version ne demande ni ne stocke de numéro de carte ni de CVC : elle peut afficher une référence fictive de carte de test (par exemple une marque et les quatre derniers chiffres), sans envoyer de données bancaires à un fournisseur. Une vraie intégration Stripe en mode test serait un lot ultérieur distinct, non couvert par cette simulation.

### Parcours coach

Le testeur crée un profil fictif et des créneaux fictifs dans sa propre session, puis voit la façon dont un sportif peut consulter une offre. Ces informations ne deviennent pas un profil public et ne sont pas visibles aux autres testeurs. Les fixtures communes ne servent qu'à illustrer le choix du sportif.

## Données, notification et effacement

- Chaque essai est rattaché à une identité Auth temporaire et aux données dont elle est propriétaire. Les parcours coach et sportif sont séparés ; aucune donnée personnelle n'est demandée par défaut.
- Le bouton d'effacement supprime la session Auth courante et ses profils, créneaux, réservations et états Telegram associés. Il ne touche jamais aux fixtures communes ni aux données d'un autre testeur. La rétention automatique prévue est limitée à la durée de l'essai (24 heures), à confirmer dans le schéma et les tests.
- La confirmation dans le site est le canal par défaut. Aucune notification n'est envoyée au téléphone ou au bot personnel du propriétaire pour chaque visiteur.
- Telegram ne peut être qu'une option séparée, avec consentement explicite, bot dédié à la démonstration, révocation et stockage serveur minimal/chiffré. Sans cette configuration, le site confirme le résultat sans prétendre qu'un message a été envoyé.

## Conditions avant ouverture publique

1. Un projet Supabase réservé à la démo, distinct de `getyourmentor-preprod`, et une base locale Supabase jetable pour les tests.
2. Revue et exécution des tests RLS, notamment visiteur anonyme, sportif A, sportif B, coach et service serveur ; contrôle de lecture croisée, suppression propre et conservation des fixtures.
3. Routes serveur qui contrôlent propriétaire et rôle avant toute mutation privilégiée ; aucune clé service dans le navigateur.
4. Identification du dépôt, du site Netlify et de la branche qui servent effectivement le lien du portfolio. Le site `gregarious-fox-fff605` n'est pas la cible du lien du portfolio et doit rester hors de ce déploiement.
5. Tests de bout en bout sur le bon site, puis relecture des textes pour distinguer données fictives, validation simulée et paiement non financier.

## État

Cette décision n'est pas une recette réussie ni une autorisation de publication. À la date de cette note, aucun projet Supabase dédié n'est disponible, les outils locaux PostgreSQL/Supabase ne sont pas installés, et la route `/demo` du site lié au portfolio répondait 404 au contrôle antérieur. Les tickets GYM-D1.2 à D1.9 restent ouverts ou bloqués selon leurs dépendances. Aucun code applicatif ni configuration Netlify n'est modifié par cette note.
