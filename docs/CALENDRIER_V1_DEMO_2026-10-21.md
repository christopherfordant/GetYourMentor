# V1 démo — export manuel du calendrier sportif

## Sources, choix et exclusions
Demande de clôture V1 du 21 octobre, base privée 93871bd et publique af463c1. Consultation progressive AGENTS/procédure/préambules/relais, index PDF, couverture stratégie et rapport paiement/suivi. Définition V1 relue dans l'extraction locale du Business Plan p.49–50, MVP/V1 p.1 ; offres et contenus confrontés aux services et tests. Checklist intégrée à STRATEGIE_PERPLEXITY_COUVERTURE, aucun maître concurrent.

BP p.50 prévoit calendriers et trackers. Aucune implémentation .ics/iCalendar repérée dans le code avant ce lot. Tranche choisie : un fichier privé à importer manuellement pour une séance acceptée/payée appartenant au sportif. Pas de connexion Google/Apple, invitation email, synchronisation, abonnement agenda, tracker ou programme d'entraînement. Cela ne valide pas toute l'intégration documentaire.

## Contrat
GET `/api/reservations/[id]/calendar`, démo isolée et session sportif uniquement ; propriétaire relu côté serveur. Pas d'authentification par URL, claimToken ou cookie anonyme de réservation. Compte étranger/inexistant : 404 ; autres rôles : 403 ; absence de session : 401 ; requested/refusé/annulé ou horaire/durée inexploitable : 409. Aucun changement des autres permissions.

Le créneau convenu réutilise reservationStart et durationMinutes ; début/fin UTC portables entre fuseaux, aucun repli sur une proposition parmi plusieurs sans horaire convenu. Durée et dates validées par les fonctions existantes, pas de date reconstruite. Aucun paiement déclenché ou attesté par l'export.

Format étudié sur la [RFC 5545 officielle](https://www.rfc-editor.org/rfc/rfc5545), sections lignes, dates et événement. CRLF, repli de lignes à 75 octets sans couper UTF-8, UID stable issu du hash de l'identifiant, DTSTAMP/DTSTART/DTEND UTC. Champs textuels constants : pas de saisie utilisateur, email, participant, nom de coach, ville, montant, code de réservation, preuve d'accès ou URL. Aucun ATTENDEE/ORGANIZER/METHOD/VALARM. CLASS:PRIVATE est une indication, pas un chiffrement.

Réponse attachment .ics, private/no-store, nosniff, no-referrer. Pas de journal de données exportées ou de modification de réservation. Le navigateur effectue un GET explicite, contrôle le type/format et déclenche le téléchargement ; état de préparation, erreur sans réussite fictive et nouvelle tentative de lecture possible. Réponse tardive après démontage ignorée. L'action est bloquée pendant une transition incertaine de la réservation via les verrous existants.

Le bouton est présent dans le compte sportif de démonstration pour les séances exportables. Styles et composants du compte existant réutilisés, pas de migration anticipée de tout le compte. Après déplacement/annulation, l'utilisateur doit mettre son agenda à jour ; un import répété peut être traité différemment selon son logiciel, aucune déduplication universelle ou import réussi prétendu.

## Preuves et limites
Résultats définitifs : 8 scénarios privés et 4 export public PASS en développement démo, types/build/frontière client et scans de secrets PASS dans les deux dépôts. Empreintes et modes : `assets/calendar-v1-2026-10-21/verification.json`. Tests : dates et changement d'heure, créneau retenu, statuts, UTF-8, absence de champs privés/injection, UID stable ; API authentifiée sur données locales réellement enregistrées, quatre rôles et isolation, HEAD, absence de mutation, refus après annulation ; UI clavier/téléchargement, échec injecté puis reprise, quatre largeurs. Les scénarios injectés ne valent pas preuve serveur.

MCP : séance fictive créée/acceptée via les endpoints locaux et compte sportif consulté ; clic expiré sur le contrôle de stabilité, aucune réussite de téléchargement MCP revendiquée. Le téléchargement est validé par Playwright local. Premier test d'annulation corrigé pour emprunter l'endpoint sportif existant ; aucun changement métier pour le faire passer. Les tests publics utilisent la fixture de leur catalogue anonymisé, pas l'identifiant du coach du dépôt privé. Un lancement depuis la mauvaise racine a échoué avant recette et utilisé un cache npx temporaire ; exécution finale avec le binaire local existant, sans dépendance ajoutée au projet. Les captures historiques écrasées par d'anciens tests ont été rétablies depuis leur version initialement propre ; seules les captures ciblées du lot sont ajoutées.

Aucun envoi à un calendrier externe, pas de recette Outlook/Apple/Google réelle ou sur appareil physique ; seul le fichier téléchargé est contrôlé. Production HTTPS, Supabase/RLS et Netlify non validés ici. Démo locale en mémoire et limites de persistance existantes conservées ; aucun secret/cookie/doc privé publié dans l'export GitHub. REA non nécessaire ; aucun agent/framework ajouté.

Retour arrière : revert ciblé code/documents après revue, aucune donnée à migrer ou supprimer. Étape suivante recommandée : recommandations explicables V1 en réutilisant catalogue et préférences explicitement choisies ; garder ouvertes les autres lignes de la checklist.
