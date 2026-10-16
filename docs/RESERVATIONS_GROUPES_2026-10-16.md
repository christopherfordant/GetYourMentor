# Réservations de groupe — 16 octobre 2026

## Reprise et sources
Base et distant vérifiés : `e1311ec82fd49b9f617307947bb234f695eb3266`, branche `design/refonte-progressive-lot1`. Candidat isolé : `C:/Users/cashe/Documents/GYM-group-booking`. Aucun ajout global des changements locaux antérieurs.
MVP PDF p.1 : individuel / 2–4 / 4 et plus ; informations nom, prénom, âge, email pour les réservants supplémentaires. Devis PDF p.1–2 : capacité multi-participants et réservations groupées. Business Plan, document maître et précédent lot : demande/acceptation/paiement, commission de 15 %, planning, annulation. Recherche MemPalace et lecture directe des PDF effectuées. Le PDF ne fixe pas une formule de tarif de groupe.
**Arbitrage utilisateur explicite : prix total fixé par le coach selon la taille du groupe.** Aucun tarif individuel multiplié, rabais ou montant par défaut inventé. Les valeurs 65/99 EUR utilisées dans la recette sont fictives.
Le document historique `Ateliers/Sports - Cibles/Basketball.docx`, section Encadrement de mineurs (copie texte locale consultée), mentionne une autorisation parentale écrite. Cela ne vaut pas validation juridique, ni consentement acquis. Aucune donnée médicale ou pièce sensible ajoutée.

## Parcours livré
- Maquette séparée avant intégration : `maquettes/reservation-groupe/index.html`, ouverture locale par double-clic. Desktop et mobile ; aucune API ni publication depuis la maquette.
- Coach : carte Mes tarifs de groupe dans le compte. Un prix total, en EUR, par nombre de participants. Réglage réservé au coach de la session ; fonctionnement démonstration uniquement. Sans tarif pour la taille demandée, envoi indisponible et refus serveur explicite.
- Sportif : depuis `/structures`, choisir la séance, le créneau et le nombre total, réservant compris ; renseigner uniquement les autres personnes ; récapitulatif des places, prix total et paiement après accord. Les informations saisies sont conservées lorsque le nombre est temporairement réduit puis augmenté, sans transmettre les champs exclus.
- Demande unique, coach unique, paiement unique et annulation complète. Aucun compte, invitation ou message automatique pour les autres personnes. Le sportif est ici un participant : réservation uniquement pour des tiers sans participation du réservant non ajoutée.
- Capacité du moteur existant pondérée par participantCount ; anciennes réservations sans ce champ = une place. Une proposition horaire ne compte jamais comme une personne. Écriture atomique locale et adaptateur CAS existant réutilisés ; refus/annulation libèrent toutes les places. Déplacement des séances structure par annulation et nouvelle demande, comme au lot précédent.
- Montant serveur issu du tarif total du coach ; snapshot à la demande avec commission administrable de 15 %. Modifier le tarif ne modifie pas les réservations engagées. Paiement/remboursement simulés sur le total historique, sans transfert réel.

## Confidentialité
| Lecteur | Informations supplémentaires |
| --- | --- |
| Sportif réservant | Nombre, noms, prénoms, âges, emails saisis pour son groupe |
| Coach concerné | Nombre, noms, prénoms et âges ; emails retirés des réponses GET et PATCH |
| Structure propriétaire de la séance | Nombre et état ; aucune liste nominative ni email |
| Administrateur authentifié | Données métier dans le périmètre existant du back-office |
| Autre sportif / public | Pas de détails privés ; disponibilités publiques limitées aux statuts, dates et durées |
Les participants n’acquièrent aucun droit de connexion. Tous les scénarios utilisent des identités fictives @example.com.

## Garde-fous et limites
Les bornes 50 participants, âge 0–120 et prix total 0,01–10 000 EUR sont des limites techniques d’entrée, pas des capacités ou offres commerciales. La capacité réelle de la demande reste celle de la séance publiée.
Le premier parcours groupé concerne les séances collectives des structures avec coach affilié déjà documenté. Le calendrier individuel `/creneau` n’est pas transformé en catalogue de séances collectives sans capacité explicite. La politique d’encadrement des mineurs reste à valider avant usage réel ; la démo affiche cette limite sans simuler une autorisation parentale.
Les tarifs de groupe sont actuellement communs aux séances de démonstration proposées par le coach pour une même taille de groupe. Tarification distincte par prestation/durée et suppression/édition avancée d’une grille restent un lot ultérieur ; aucun devis automatique inventé.
Groupes limités au stockage démo local/hébergé existant ; création groupée refusée avec persistance Supabase réelle. Aucune migration distante, recette RLS, validation Netlify multi-instance, activation Premium, notification ou transaction réelle. Stockage local réinitialisé au redémarrage.

## Vérification et livraison
Build, typage, tests de cardinalité/validation/capacité/concurrence, tarif total, confidentialité, paiement et remboursement historiques ; régression individuelle et comptes. **72/72 PASS**, puis **10/10 PASS** sur le build final après renforcement de l’isolation Supabase ; build/typage, frontière client-serveur, contrat Netlify et smoke production PASS. Première campagne : lecture de réponse après navigation dans le test groupé ; correction par vérification via l’API du réservant, puis campagne complète verte. MCP a contrôlé la maquette et le formulaire intégré aux quatre largeurs ; le dernier rejeu MCP après arrêt automatique du serveur a reçu un refus de connexion, sans invalider les contrôles visuels précédents (UI inchangée) et les captures finales Playwright. Résultats et captures : `assets/group-booking/verification.json`. Un serveur, un worker et un build à la fois. Journaux locaux dans le candidat sous `gym-next/group-*.log` et `gym-next/playwright-artifacts/group-booking/`.
Retour arrière : revert du commit ciblé ; conserver les originaux métier et les autres changements locaux. V2/V3 restent incomplètes. Aucun déploiement.
Prochain lot : affiliations multi-coachs et définition explicite des séances collectives coach hors structure ; recette du stockage hébergé isolé et politique mineurs avant ouverture réelle.
