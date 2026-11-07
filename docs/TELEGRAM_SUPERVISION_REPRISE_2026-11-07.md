# Supervision Telegram et traitement des incidents ? 7 novembre 2026

## Port?e

Lot H1.5.2 : lecture serveur sans mutation, compteurs expurg?s et tests synth?tiques du moteur existant. Aucun appel Telegram/Supabase r?el, secret charg?, t?che planifi?e, interface publique ou renvoi d?clench?. La lecture interne ne remplace pas une autorisation op?rateur. Ne pas exposer les agr?gats globaux dans un compte coach/sportif : ils concernent plusieurs utilisateurs.

## Contrat de lecture

Le module de supervision agr?ge une photographie du stockage existant, sans passer par `mutateTelegram` qui r??crit le stockage m?me pour un callback de lecture. L'impl?mentation est revue avec ses tests avant livraison. Une erreur de stockage doit produire un ?tat indisponible expurg?, jamais z?ro notification pr?sent? comme un succ?s. Seul le fichier absent (ENOENT) en mode aper?u local produit un ?tat vide sans cr?er de fichier ; une ligne distante absente ou un contenu invalide reste une erreur. Aucun message brut, destinataire, identifiant de chat, cl?, URL fournisseur ou exception brute ne doit ?tre retourn?.

Une lecture ne r?serve pas les messages et n'autorise aucune reprise. Les compteurs sont ponctuels : une nouvelle ?criture peut intervenir apr?s la photographie. `retryAt.due` compte des ?ch?ances sur tous les statuts ; ce n'est pas une liste de messages ?ligibles. `accepted` signifie acceptation de la requ?te par Telegram, pas lecture ni r?ception sur le t?l?phone.

## Proc?dure op?rateur propos?e, non activ?e

1. Confirmer l'environnement, le droit op?rateur et le p?rim?tre avant tout acc?s aux donn?es. Ne pas r?utiliser les anciennes autorisations de recette comme une autorisation de production.
2. Lire les agr?gats avec une horloge coh?rente. Si le stockage est indisponible, diagnostiquer l'acc?s hors des journaux publics ; ne pas en d?duire une file vide et ne pas changer de stockage de secours.
3. Distinguer les ?tats suivants avant toute d?cision :

| ?tat | Interpr?tation | Action s?re |
|---|---|---|
| pending | Pas encore accept? ; un 429 peut avoir fix? une ?ch?ance | Respecter l'?ch?ance et v?rifier configuration, allowlist et liaison. Aucun envoi initi? par la supervision. |
| sending | Tentative r?serv?e, r?sultat pas encore enregistr? | Attendre la fin de la tentative ; une r?servation expir?e doit ?tre examin?e comme incertaine, pas remise aveugl?ment en attente. |
| accepted | Telegram a accept? la requ?te | Ne pas renvoyer pour obtenir un accus? de lecture. |
| failed | Refus explicite de type 4xx dans le moteur actuel | Corriger la cause apr?s diagnostic autoris? ; aucune r?initialisation automatique du statut. |
| uncertain | Livraison possible sans preuve exploitable, panne ou r?ponse non interpr?table | Ne pas renvoyer automatiquement : risque de doublon. Revue humaine n?cessaire ; r?solution et preuve dans une proc?dure future. |
| statut inconnu ou m?tadonn?es invalides | Anomalie de donn?es | Signaler avec des compteurs, sans publier la ligne ou l'exception. |

4. Une alerte future peut signaler `uncertain > 0`, des m?tadonn?es invalides ou une hausse des ?checs. Ce sont des crit?res de conception, pas des seuils op?rationnels valid?s ; aucune cadence, alerte externe ou SLA n'est activ? ici.
5. Une reprise future doit utiliser les services m?tier et leurs gardes : configuration active, destinataire autoris?, liaison toujours valable, statut et ?ch?ance, d?duplication et concurrence. Ne pas modifier une ligne manuellement pour forcer un renvoi.
6. Archiver uniquement environnement non secret, version, horodatage, compteurs, d?cision et preuve expurg?e. Ne pas recopier les textes, cl?s, emails ou identifiants dans le Kanban.

## Limites ? conserver ouvertes

Les tests de ce lot isolent le code avec des d?pendances simul?es ; ils ne prouvent pas le CAS distant, la r?ception t?l?phone, la concurrence r?elle fournisseur ou la disponibilit? en production. La mutation distante historique, les droits d'acc?s op?rateur et la maintenance des liaisons n'ont pas ?t? r?audit?s globalement.

Le moteur limite une ex?cution ? dix s?lections ; ce n'est pas un ordonnanceur durable. Les tentatives incertaines ne sont pas relanc?es automatiquement. Le nettoyage historique apr?s sept jours supprime des messages et conserve leurs empreintes de d?duplication : les indicateurs ne constituent donc pas un historique complet des incidents. Ni politique de r?tention ni d?clenchement du moteur ne sont modifi?s par la lecture.

Le ticket parent H1.5 reste ouvert pour H1.5.3 : autorisation et exposition op?rateur, alertes, exploitation et ?ventuelle recette externe distincte. A5/RAG et les pr?requis humains restent inchang?s.
