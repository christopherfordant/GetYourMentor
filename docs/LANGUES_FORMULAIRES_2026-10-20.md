# Langues et formulaires d’accès — 20 octobre 2026

Base Git et distant vérifiés : `0130e85cdaf00a3258489052c524d9c1657f18c6`, branche `design/refonte-progressive-lot1`. Candidat isolé : `C:/Users/cashe/Documents/GYM-language-forms-20261020`. Modifications locales antérieures préservées ; aucun changement de backend, de droit ou de règle commerciale.

## Sources et périmètre

AGENTS, procédure/hiérarchie de BRANCH_STRATEGY, préambules maître/index, relais, index des PDF et socle Opquast existant consultés progressivement. Contrat violet/papier de l’accueil et composants existants réutilisés ; aucune prétention de lecture exhaustive des PDF. Référentiel public Opquast V5 consulté le 20 octobre : [source officielle](https://checklists.opquast.com/fr/qualite-numerique/). Les règles pertinentes sont qualifiées dans OPQUAST_SOCLE_2026-10-20.md, sans certification globale.

## Langue : fonctionnement honnête et emplacement

L’ancien LanguageSelector mémorisait fr/en/es/de/it/pt dans localStorage et changeait l’étiquette, sans traduire les contenus ou les routes. Aucun catalogue de traductions ni routage linguistique trouvé dans le périmètre de code inspecté. html lang et SEO existants restent français.

Le composant commun devient une indication statique « Français », sans menu inopérant, écouteur ou stockage ajouté. Son nom technique est conservé pour les imports. Les anciennes préférences gym-language sont ignorées, pas supprimées. Le contenu ne change pas selon la langue du navigateur.

Sur ordinateur, l’indication est dans le header existant ; l’accueil retrouve cette indication sans changer les noms/ordre/destinations de ses liens. Sur mobile, elle apparaît dans le footer commun, une zone de navigation globale accessible sans encombrer le header. Il n’y a pas de choix de langue à placer dans un menu burger tant qu’une seule langue est réellement disponible. Deux emplacements responsive, une seule indication visible. Les pages sans indication dans leur header utilisent le footer aussi sur ordinateur, notamment les pages légales.

Aucune nouvelle route linguistique, traduction automatique, promesse multilingue ou intégration ajoutée. Une future langue nécessitera des contenus effectivement traduits, des destinations équivalentes et leur recette avant activation.

## Formulaires corrigés

| Ensemble | Changements et comportement |
|---|---|
| Connexion sportif/coach/structure/admin | Deux champs utiles avec libellés, required, autocomplete username/current-password. Trois champs d’identité cachés et leur CSS nth-child supprimés. Verrou immédiat + état en cours ; réponse vérifiée avant affichage du compte. Mot de passe affichable. |
| Création de compte puis choix du rôle | Libellés, champs requis, ville facultative, minimum 8 caractères déjà exigé côté serveur, autocomplete et affichage des deux mots de passe. Confirmation email/mot de passe rattachée aux erreurs. CGU/confidentialité liées, case non précochée. Verrou de soumission partagé lors du choix de rôle ; données conservées après refus. |
| Inscription structure | Demande de contact enregistrée, pas création de compte ni affiliation immédiate. Required/optional expliqués, autocomplete, formats et tailles de fichiers indiqués. Saisies conservées après refus réseau/serveur ; succès uniquement après ID/statut/périmètre cohérents ; nouveau clic bloqué après confirmation. Aucun retour humain ou message externe promis. |

Les formulaires utilisent la section commune gym-access-form dans le contrat CSS existant. L’inscription structure reçoit une frontière opt-in gym-club-signup : carte claire, champs bordés, boutons violets, header clair et grille responsive. Les !important sont limités aux propriétés déjà forcées par les styles hérités, dont le bouton vert et les surfaces sombres constatés pendant la recette. Les règles globales anciennes des autres pages ne sont pas supprimées sans audit de leurs usages.

readFormData/readAuthFormData partagent la lecture des confirmations, distinguent refus HTTP et résultat non confirmé, vérifient l’identité attendue et les rôles connus. Au login, le rôle renvoyé par le serveur reste autoritaire ; à l’inscription, le rôle doit correspondre à celui choisi. Ces contrôles d’interface ne remplacent pas l’autorisation serveur.

Timeout d’attente de 15 secondes, aucune relance automatique. Après perte de connexion, le message n’affirme pas l’échec côté serveur. Pour une inscription incertaine, il invite à vérifier la connexion/le compte avant de renouveler la demande. Le parcours structure n’a pas encore de mécanisme serveur de déduplication ou relecture d’une demande incertaine : une nouvelle soumission explicite peut encore produire un doublon. Aucun endpoint parallèle ajouté.

## Vérifications et limites

46 scénarios distincts couverts au total, sans annoncer une unique campagne 46/46 verte : campagne principale 44 réussites et deux assertions obsolètes, reprises ciblées réussies, puis quatre rendus de nouveau vérifiés après la dernière correction du header structure. Les erreurs de tests concernaient l’attribut du tableau sportif (data-athlete-dashboard) et les libellés déjà existants sans avis/note. Aucun faux avis ni score nul ajouté pour satisfaire un test.

Les tests comprennent : réponses injectées rejetées/malformées/connexion perdue, conservation de saisie, doubles soumissions, consentement non précoché, erreurs associées, affichage des mots de passe ; deux parcours intégrés sur les API locales pour compte sportif avec rechargement et demande structure. Huit scénarios sont des tests purs du validateur de réponses, pas des parcours navigateur.

Playwright local Chromium, un worker. Rendus de connexion/création/structure : 320, 390, 768, 1440 px. Indication de langue testée sur accueil/recherche/compte/structure/légal, y compris une préférence en ancienne langue ignorée. Régressions compte coach (sept largeurs), accueil, recherche/annuaire/fiche, footer et cookies. Les tests de découverte comprennent une largeur 720 px équivalente à un viewport réduit et des libellés longs ; cela ne constitue pas une recette exhaustive du zoom navigateur ou de tous les lecteurs d’écran.

Les assertions typographiques finales du footer du lot précédent ont maintenant réussi aux quatre largeurs. Les preuves du précédent lot restent historiques et intactes.

La première tentative intégrée utilisait un sélecteur de tableau incorrect. Une clé de session locale éphémère a aussi été fournie au serveur de développement pour partager les cookies chiffrés entre modules, sans dépendre des Maps mémoire locales. Aucun drapeau de contournement d’authentification utilisé. Clé générée en mémoire, non archivée ; aucun réglage de production modifié. Le lancement du serveur démo normal a été accepté dans ce lot ; le refus automatique du lot précédent n’est pas effacé des preuves historiques.

Les formulaires de réservation, paiement, recherche, édition de profil et administration restent hors de cette migration de formulaires. Leurs règles existantes sont conservées ; aucune déclaration de conformité complète. Les pièces jointes de structure et les données bancaires restent de démonstration : seuls noms de fichiers et fin d’IBAN sont conservés par le stockage démo existant ; aucun transfert bancaire. Authentification Supabase/Google, RLS distante, Netlify et notifications réelles non recettés.

Captures : [connexion mobile](assets/languages-forms-2026-10-20/signin-390.png), [inscription mobile](assets/languages-forms-2026-10-20/signup-390.png), [structure mobile](assets/languages-forms-2026-10-20/structure-card-390.png), [header desktop](assets/languages-forms-2026-10-20/home-1440.png). Données synthétiques uniquement ; aucune session Edge existante utilisée/modifiée. Recherche publique limitée à Opquast ; aucun document privé ni secret envoyé à un service de recherche. Push limité aux fichiers revus du lot vers le dépôt autorisé. Aucune garantie absolue de zéro fuite revendiquée.

## Livraison et reprise

Résultats définitifs, empreintes et limites dans assets/languages-forms-2026-10-20/verification.json. Typage/build/frontière client réussis avant livraison. Pour reproduire les parcours locaux de session, fournir une SESSION_SECRET de test éphémère d’au moins 32 caractères au serveur ; la CI MVP existante la définit déjà. Aucun secret réel ne doit être copié. Aucun déploiement Netlify de ce lot : version en ligne documentée bbe20d7, distincte du commit poussé. Compteurs privés d’usage non consultés ; aucun quota inventé.

Prochaine action : appliquer le même contrat aux formulaires de réservation prioritaires après inventaire, ou qualifier la reprise d’une demande structure dont le résultat est incertain ; choisir un seul lot selon le relais et les dépendances. Ne pas réactiver un faux choix de langue. Retour arrière par revert ciblé après revue, sans reset du travail antérieur ni suppression de données.
