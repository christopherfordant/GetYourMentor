# Second lot supervis?, sans fen?tre suppl?mentaire ? 7 novembre 2026

## R?sultat

La nouvelle consigne utilisateur autorisait de continuer avec plusieurs agents pilot?s dans cette conversation. Deux agents natifs ont effectivement travaill? en m?me temps, chacun dans un worktree propre issu de `6e62d05`. Aucune fen?tre VS Code suppl?mentaire ouverte ; les fen?tres pr?c?dentes et les sessions utilisateur sont pr?serv?es. Les dossiers isolent les changements, les fen?tres ne sont pas n?cessaires ? l'ex?cution des agents.

| Mission | Ex?cutant r?el | Mod?le/effort demand? | R?sultat |
|---|---|---|---|
| H1.5.2.1 | `/root/telegram_reader2` | gpt-6.1-sol, medium | Lecture interne sans ?criture et compteurs expurg?s |
| H1.5.2.2 | `/root/telegram_failure2` | gpt-6.1-sol, medium | Tests isol?s des pannes,429 et absence de renvoi aveugle |

Sol a ?t? retenu pour les contrats asynchrones/stockage et le harnais VM d'un moteur ? effets de bord. Aucun param?tre global chang?, installation, API payante suppl?mentaire configur?e ou sous-d?l?gation. Compteurs de tokens et facturation non accessibles : aucune ?conomie chiffr?e promise.

## Code int?gr? et revue

`readTelegramSnapshot` lit le stockage existant sans utiliser `mutateTelegram`. ? distance : un GET, aucun PATCH, aucun repli local sur erreur. Localement : lecture s?rialis?e dans la file existante, sans cr?ation/?criture ; ENOENT seul signifie une file vide de d?monstration. Contenu invalide ou indisponible : erreur fixe expurg?e. Le corps historique de mutation reste textuellement identique.

`readTelegramSupervision` est un point d'entr?e serveur interne qui transforme la photographie en agr?gats. Il ne dispose d'aucune route publique, interface, cron ou consommateur actif. L'autorisation op?rateur reste ? mettre en place avant toute exposition. `server-only` prot?ge l'import c?t? client ; l'alias du Next install? a ?t? v?rifi?. Cela ne remplace pas une autorisation. Aucun message, email, identifiant de chat ou exception brute retourn? par la supervision.

L'agent QA a reproduit deux d?fauts : `retry_after` infini ou d?bordant cr?ait une ?ch?ance infinie. Le coordinateur a confirm? les deux tests rouges avant correction, puis ajout? le repli existant de 60 secondes lorsque le calcul n'est pas fini. Les valeurs finies et le minimum d'une seconde gardent leur comportement. Aucun nouveau plafond arbitraire, renvoi incertain ou changement de garde destinataire.

Sources agents : `d11f79d` int?gr? par `b56462e`, puis `2fabf32` int?gr? par `df5eb3c`. Correction coordinateur : `43b06b9`. [R?sultat lecteur](reader2-result.md) et [r?sultat QA avant correction](failure2-result.md). Le rapport QA conserve ses ?checs initiaux : ils ne d?crivent pas le r?sultat final corrig?.

## V?rifications

- 54 tests cibl?s PASS : 4 contrats domaine,5 projection,7 lecture,38 moteur Telegram.
- TypeScript complet PASS, plafond Node384Mio et sans modification des options.
- 31 tests des protections historiques PASS ; anciens lanceurs toujours bloqu?s.
- 35 tests atelier/Kanban PASS. Deux descriptions de tests manquantes dans les nouvelles cartes ont ?t? compl?t?es apr?s l'?chec initial du contr?le documentaire.
- Kanban v?rifi? sur ordinateur et mobile : badges/identifiants r?els, tickets du lot termin?s et suite ouverte ; contextes vierges et brouillons localStorage pr?serv?s.
- 18 fichiers ant?rieurement modifi?s pr?serv?s octet pour octet ; deux worktrees agents propres.

[Contr?les structur?s](../../assets/parallel2-2026-11-07/checks.json), [ex?cution](../../assets/parallel2-2026-11-07/execution.json), [Kanban](../../assets/parallel2-2026-11-07/kanban.json). Captures dans le m?me dossier. Tests synth?tiques : aucune lecture de stockage r?el, secret, notification ou service m?tier distant. Pas de build global ou recette applicative/fournisseur revendiqu?e.

## Suite et limites

H1.5.2 et ses deux enfants sont termin?s dans ce p?rim?tre local. H1.5 reste ouvert avec H1.5.3 : exposition op?rateur autoris?e, alertes, exploitation et ?ventuelle recette externe distincte. Aucun ordonnanceur, alerte ou reprise automatique activ?. La file locale est s?rialis?e dans ce processus seulement ; pas une preuve de verrouillage interprocessus ni de CAS Supabase.

La [proc?dure propos?e](../../TELEGRAM_SUPERVISION_REPRISE_2026-11-07.md) distingue acceptation Telegram/r?ception t?l?phone et ?ch?ance/autorisation de renvoi, ainsi que les limites de r?tention historique. A5 et ses validations humaines restent inchang?s. Aucun d?ploiement, migration, paiement ou notification. Agents termin?s, aucune boucle autonome apr?s cette livraison. Les worktrees sont conserv?s pour examen, sans nouvelle fen?tre n?cessaire.
