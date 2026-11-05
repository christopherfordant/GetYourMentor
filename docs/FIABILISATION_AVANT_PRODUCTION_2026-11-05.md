# Audit cible et premier lot de fiabilisation - 5 novembre 2026

## Methode

Revue ciblee du code et des preuves de recette des commits85c4f78 et7226788; aucune operation distante ni nouveau paiement ou message. Les probabilites ci-dessous sont qualitatives, non mesurees : elles servent a ordonner les travaux, pas a annoncer un taux d'incident. GYM-B1 reste termine dans son perimetre.

| Priorite / impact | Observation et probabilite | Etat et preuve | Suite |
|---|---|---|---|
| P0 / acces prive | Cookie chiffre sans date serveur dans auth.ts; un cookie conserve pourrait etre rejoue au-dela des sept jours annonces. Condition reproductible, frequence inconnue | Ecart code certain; correction GYM-H1.1 du present lot | Enveloppe datee, refus anciens cookies, tests limites et retour connexion |
| P1 / financier | cancelReservation persiste pending ou succeeded, mais webhook Stripe ne traite que checkout.session.completed, pas le cycle des remboursements differes | Remboursement immediat teste externe; reconciliation differee manquante dans le perimetre relu. Probabilite non mesuree | GYM-H1.2 : concevoir reprise et tests avant operation distante; conserver regles de remboursement existantes |
| P1 / coherence apres interruption | Webhook signe avec fenetre300s, gardes montant/titulaire/environnement, statut et reprises503. Rejeux apres paiement/remboursement verifies | Protections implementees et teste(es), mais pas de balayage durable autonome constate dans routes relues;503 initial inexpliqu? | GYM-H1.2 : reconciliation bornee et diagnostic sans re-paiement |
| P1 / compte incomplet | signUp cree Auth, puis app_metadata, puis profil coach : panne intermediaire laisse une creation partielle | Risque identifie par code, scenarios de reprise non demontres ici; probabilite inconnue | GYM-H1.3 : reprise idempotente, sans auto-confirmer un e-mail |
| P1 / acces revoque | Nouvelle expiration locale ne revalide pas a chaque requete le role/revocation Supabase; accessToken n'est pas renouvelle par ce lot | Limite non corrigee ni testee; deconnexion observee seulement par suppression du cookie du navigateur | GYM-H1.4 : definir duree/revalidation fournisseur et revocation, avant production |
| P1 / notifications | Outbox CAS, deduplication,429 retryAt, uncertain sans renvoi aveugle; transaction metier non annulee sur panne | Acceptation et telephone/rejeux testes; reprise automatique planifiee et resolution uncertain non demontrees en exploitation | GYM-H1.5 : audit declenchement et tests de panne/reprise sans envoi reel |
| P1 / environnement | Plateforme test verifiee, reservation liee a environnement, refus croises, coffre DPAPI et frontiere client | Code et tests fournisseurs/externes precedents disponibles; audit de rotation live/exploitation non execute | Ne pas activer live; procedures et secrets production distincts necessaires |
| P2 / observabilite | Diagnostic webhook recette limite a phase/codeHTTP, pas de payload; notifyTelegram intercepte les erreurs et expose des etats en stockage | Absence de supervision de production demontree; probabilite d'une erreur silencieuse non mesuree | GYM-H1.5 : indicateurs expurges, alertes et procedure de traitement, pas de logs bruts |
| P2 / approbation | recipeCoachApproved borne1h, projet/origine/mode/compte, refuse hebergement et verification professionnelle fictive | Garde presente; revocation/expiration de recette deja documentees, pas de nouveau renouvellement ici | Guide impose verification, aucune extension automatique |

## Premier lot execute : GYM-H1.1

Duree conservee : sept jours, deja definie par SESSION_MAX_AGE du cookie. Enveloppe AES-GCM version1 avec issuedAt et expiresAt authentifies; lecture serveur verifie dates entieres, absence d'emission future, expiration stricte, duree maximale et structure d'identite. Refus de l'ancien format sans date, des segments supplementaires, du contenu altere et d'une autre cle. Retour null donc reconnexion normale, jamais migration silencieuse du cookie. Le stockage memoire de secours local recoit aussi une echeance.

Fichiers : lib/session-envelope.ts et lib/auth.ts. Aucun changement des roles, tarifs, droits de reservation ou contrats financiers. Les sessions precedentes du coffre deviennent inutilisables pour s'authentifier apres mise a jour du serveur; les mots de passe et comptes restent inchanges. Aucun deploiement : cette consequence est locale pour le build livre.

Tests unitaires : ouverture valide quatre roles, borne exacte7jours, reprise avec nouveau cookie, ancien format, dates invalides/futures/non bornees, mauvais type/role/version, alteration et cle incorrecte. Tests navigateur sur serveur local isole, secret ephemere de fixture : cookie expire ou ancien encore present mais API401 et formulaire de connexion, connexion normale200, role sportif, deconnexion401. Les fixtures ne sont pas des comptes Supabase ni des preuves de nouvelle recette financiere.

Limites : pas de revocation globale immediate des cookies copies avant leur expiration, pas de refresh/revalidation Supabase a chaque requete, pas de test de l'horloge systeme/revocation externe, pas d'audit global de conformite. Ces limites restent ouvertes dans GYM-H1, pas masquees par la cloture du premier sous-ticket.

## Livraison et decisions

Preuves expurgees : docs/assets/session-hardening-2026-11-05/. Guide : DEMONSTRATION_PARCOURS_2026-11-05.md. Resultats exacts des commandes dans checks.json; aucun test non execute revendique. Capture browser synthetique et captures du Kanban local. Temps reel non mesure, estimations et dates cibles proposees.

Aucune nouvelle decision metier imposee. Avant paiements reels : pays/obligations/frais/litiges, verification professionnelle des coachs, politique de revocation et exploitation doivent etre valides par le proprietaire. Aucun achat, migration, compte distant modifie, notification ou paiement nouveau, deploiement ou bascule live.


## Avancement H1.2 - 5 novembre 2026

Premier moteur local et CLI fixture-only livres avec tests de reprise et concurrence. H1.2.1 termine, parent H1.2 en cours : aucun raccordement produit ou validation externe revendiques. Rapport : [RECONCILIATION_H1_2_2026-11-05.md](RECONCILIATION_H1_2_2026-11-05.md). Suite : adaptateurs metier et CAS durable H1.2.2, puis recette externe distincte H1.2.3. Les autres ecarts H1 restent ouverts.
