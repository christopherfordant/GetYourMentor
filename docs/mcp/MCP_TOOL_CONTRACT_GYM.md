# Contrat MCP minimal — GetYourMentor

## Statut

Ce document définit le contrat d’outils autorisés. Il ne déploie pas de serveur MCP et ne donne aucun accès implicite au dépôt, aux secrets ou au réseau.

Le MCP reste hors du tunnel critique : authentification, recherche de coach, réservation, paiement et gestion de compte.

## Outils autorisés en lecture seule

| Outil | Entrée | Sortie | Pattern |
|---|---|---|---|
| `project.read_source` | identifiant du corpus gouverné, section optionnelle | contenu cité | Local Resource Access |
| `project.search_memory` | question, filtres de priorité, limite | extraits avec citations | Direct API Wrapper |
| `project.read_decision` | identifiant de décision | décision et statut | Direct API Wrapper |
| `project.get_status` | aucun | statut de readiness et contrôles | Composite Service |

## Interdictions non négociables

- aucun accès arbitraire au disque ;
- aucune lecture de `.env`, token, mot de passe ou clé API ;
- aucune commande système exécutée par un outil MCP ;
- aucune écriture dans Supabase sans outil séparé, contrat explicite et validation humaine ;
- aucun appel Stripe, Resend ou Supabase métier depuis un agent documentaire ;
- aucune modification automatique du document maître ou des décisions validées.

## Validation avant activation

Un serveur MCP ne pourra être activé qu’après :

1. tests de permission positifs et négatifs ;
2. journalisation des appels et de la source consultée ;
3. absence de secret dans les sorties ;
4. validation humaine du corpus et des outils ;
5. maintien d’un mode lecture seule par défaut.
