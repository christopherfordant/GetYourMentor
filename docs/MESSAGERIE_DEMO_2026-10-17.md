# Messagerie bilatérale en démonstration — 17 octobre 2026

Base 739b87b vérifiée sur GitHub, checkout isolé GYM-messaging-completion. Sources : Business Plan p.29/50 (messages/historique/modèles/recherche), contrat visuel et comptes existants. Le correctif local messages.ts qui relie Blobs a été examiné et repris ; autres correctifs locaux clubs/reviews exclus.

## Changements
Le sportif contacte un coach validé depuis sa fiche. Coach et sportif répondent depuis la messagerie du compte, avec recherche locale, dates Europe/Paris, actualisation et erreurs visibles. Aucun nouvel écran ni design indépendant : extension des cartes de compte existantes. Aucun email/SMS ni abonnement activé.
Identités imposées serveur, pas celles du JSON. Une réponse exige une conversation accessible ; autre sportif/autre coach refusés. Club/admin ne peuvent envoyer de réponse. Lecture admin conservée. Référence de réservation initiale autorisée seulement à son propriétaire et pour le bon coach. UUID serveur, textes bornés, limite 60 messages/minute par clé client (limite technique démo, pas offre commerciale).
Stockage Message existant : senderEmail conserve le propriétaire sportif historique ; coachId et authorRole précisent conversation et auteur. Anciens messages restent lisibles via résolution du destinataire historique ; aucun champ Supabase ajouté ni réponse coach activée sur fournisseur réel. requestId/replyToId facultatifs, répétition du même envoi renvoyant le même message, contenu différent pour la même clé refusé. Atomicité Blobs réutilisée, aucune seconde base. En mémoire locale, insertion synchrone ; en hébergement, lecture/écriture via readDemoState/mutateDemoState.
Formulaire de contact : erreur réseau libère le bouton, pas de succès fictif ; identifiant conservé pour réessai identique, nouvelle saisie vaut nouveau message. Réponse compte : garde synchrone contre double soumission, brouillon conservé après erreur. Pas de polling supplémentaire.

## Vérifications
Build et typage PASS ; campagne 16/16 PASS : message-replies/contact-flow/club-dashboard/signout, desktop/mobile, un worker. Contrat Netlify et frontière client/serveur PASS. Contrôle final secrets et pré-push avant livraison. Rejeu message-replies pour captures et contrôle du champ non masqué : consigné après résultat, pas de couverture ajoutée artificiellement.
Scénarios : identité forgée ignorée, autres comptes exclus, rôle non autorisé, répétitions parallèles sans doublon, clé réutilisée avec contenu différent 409, référence étrangère 403, coach répond via UI puis sportif retrouve sa réponse, recherche vide, réseau interrompu sans faux succès, panne de lecture avec réessai, déconnexion.
Largeurs 320/390/768/1440 sans débordement ; champ de réponse testé via elementFromPoint après focus. Première capture révélait une bannière cookies apparue après un test isVisible trop précoce : recette corrigée pour attendre la présence du contrôle cookies puis refuser avant captures. Pas de conclusion basée sur la première capture masquée.
Captures finales : [coach mobile](assets/messages-demo-2026-10-17/coach-390.png), [coach desktop](assets/messages-demo-2026-10-17/coach-1440.png). Données exclusivement fictives @example.com. MCP a ouvert le compte local, mais sa connexion ne montrait pas la messagerie : aucune preuve de compte connecté MCP revendiquée ; UI réellement vérifiée par Playwright de test.

## Limites et suite
Push ciblé sur design/refonte-progressive-lot1, SHA distant confirmé séparément. Pas encore déployé ; persistance Blobs implémentée mais conservation distante des messages après redéploiement non encore validée. RLS Supabase/notifications externes non validées. Club, pièces jointes, regroupement conversationnel avancé et temps réel ne sont pas livrés. Historique par nom ancien : attribution au profil résolu actuellement, sans réattribution automatique si renommé ; nouveaux échanges utilisent coachId stable.
Retour arrière : revert ciblé, conserver messages et champs supplémentaires ; ne pas restaurer aveuglément une vieille démo qui ignore authorRole. Déploiement futur uniquement sur site démo 86e0379e-4d1a-4cf0-936c-1439397354f4.
Suite autonome : persistance avis/clubs et recette distante, puis retours bêta/suggestions/votes documentés. V1/V2/V3 restent incomplets.

### Résultat complémentaire
Rejeu final 8/8 PASS de message-replies après stabilisation des sélecteurs accessibles (textbox par rôle, le texte saisi ne doit pas changer la recherche du label). Captures renouvelées, champ non masqué aux quatre largeurs. La campagne intermédiaire 6/8 n’est pas comptée comme une réussite. Pré-push CONFORME sur candidat isolé.

## Lot structures et fidélité — reprise du 17 octobre 2026

Base Git/distant `a4f71cf0581742aa63fcf07fefec2cdfce960cc8`, candidat isolé `GYM-structures-messages`. Objectif : rendre les échanges coach–structure utilisables dans le même moteur, et retirer la promesse commerciale non établie du palier fidélité. Sources : Business Plan p.29/32/49–50, consentements bilatéraux décidés par l’utilisateur, matrice Perplexity p.4/11 et PDF maître V3 p.2/10. Aucun nouveau droit d’apporteur, abonnement ou flux financier.

### Comportements vérifiés

La structure et le coach peuvent chacun démarrer un échange avec un contact affilié actif ; le serveur vérifie profil coach validé et deux consentements. Contacts issus du chargement Affiliations déjà utilisé, pas de second catalogue ni polling. L’interface compte structure reçoit MessageInbox existant ; le coach utilise ce même composant. Réponses, recherche, actualisation, erreurs récupérables et protection des répétitions réutilisées. Modèle d’accueil coach modifiable, jamais envoyé automatiquement. Aucun email/SMS réel.

Champ ownerRole facultatif ajouté au format démo ; absence historique = sportif. senderEmail conserve le propriétaire de la conversation (sportif ou structure), authorRole indique l’auteur réel. Identités et coachId dérivés côté serveur, pas des champs forgés du client. Le sportif et une structure étrangère ne peuvent lire/répondre à ces échanges. Déduplication dans le même store Blobs via requestId, propriétaire, coach, auteur et contenu. GET club autorisé uniquement en démo isolée ; branche Supabase réelle inchangée. L’affiliation active est requise à l’initiation ; la révocation n’existe pas encore et aucune politique post-révocation n’est prétendue livrée.

Le composant LegacyClubDashboard inutilisé a été retiré après vérification de ses références et de sa portée ; ses cinq conversations statiques n’étaient pas rendues par le compte actif. Le footer partagé est conservé. Durant la préparation locale, une suppression trop large avait retiré AccountFooter ; le typage l’a détectée, le fichier a été repris depuis sa base et seul le nœud de fonction inutilisé a été retiré. Build et typage finaux passent.

Fidélité : nombre de séances payées conservé, palier de cinq explicitement indicatif en démo ; aucun avantage ni réduction activé. Hors démo, rubrique « Mes séances payées », sans progression commerciale inventée. Les montants, la commission de 15 %, les plannings et les paramètres de navigation restent inchangés.

### Vérifications et preuves

Build de production PASS (journal local structures-messages-build.log), typage relancé PASS. Campagne ciblée **20/20 PASS** : structure-messages, message-replies, contact-flow, club-dashboard, loyalty-flow, desktop et mobile. Régression indépendante **22/22 PASS** : affiliations et account-session-controls (quatre rôles, isolation, concurrence, deux accords, erreurs et déconnexion). Un worker/serveur à la fois. Le serveur géré par Playwright est arrêté après chaque campagne. Capture du textarea contrôlée par sa valeur, pas par un nœud texte.

Largeurs 320/390/768/1440 sans débordement dans le scénario d’échange. Captures du composant : [structure mobile](assets/structures-messages-2026-10-17/club-390.png), [structure desktop](assets/structures-messages-2026-10-17/club-1440.png). Captures coach actualisées dans assets/messages-demo-2026-10-17. Avant : historique Git a4f71cf, sans boîte de réception dans ClubDashboard ; captures coach antérieures disponibles dans le parent. Pas de faux avant structure fabriqué. Inspection visuelle des captures avec Playwright local ; aucune nouvelle preuve MCP revendiquée dans cette reprise.

Contrats Netlify, frontière client/serveur et secrets suivis PASS, conformité pré-push contrôlée avant livraison. Aucun nouveau build distant, déploiement Netlify, analytics, agent ni dépendance installée. Les preuves distantes du lot précédent sont maintenant archivées dans AVIS_STRUCTURES_PERSISTANCE_2026-10-17.md ; elles ne valent pas recette hébergée de la nouvelle messagerie structure.

### Reprise, limites et retour arrière

État code poussé à vérifier par SHA ; démo hébergée reste sur le code a4f71cf / déploiement 6ad2cabc5fae491ff7f706a0. Cette tranche est testée localement, pas déployée ; pas de CI distante ni RLS Supabase certifiée. Messagerie temps réel, pièces jointes, notifications externes et effets d’une future révocation restent hors lot. V1/V2/V3 non terminées.

Retour arrière : revert ciblé sur la branche de travail, sans purge du store ni suppression des conversations ; conserver ownerRole dans les sauvegardes. Une version antérieure refuse l’accès club à l’API ; ne pas promettre l’accès aux échanges après ce retour. Déploiement isolé seulement quand une recette distante justifie son usage et budget.

Prochain lot : maquette séparée des retours bêta/suggestions/votes (Business Plan p.49, Perplexity p.12–13), puis tranche limitée avec auth existante, validation, vote unique et modération admin dans DemoState, avant abonnements/contenus/suivi simulés. L’état et les dépendances sont dans la matrice de couverture existante. PDF maître V3 complet dans docs/sources ; aucune infrastructure Guardian/REA ajoutée.

## Complément livré — 19 octobre 2026
Classement par correspondant/date avec recherche combinée dans le même composant : [rapport du lot](FILTRES_MESSAGERIE_2026-10-18.md). Droits et stockage inchangés ; aucune nouvelle messagerie, notification externe, pagination ou pièce jointe. Les preuves historiques ci-dessus restent datées ; recette de ce complément dans son propre rapport.
