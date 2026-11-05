# Reconciliation locale (GYM-H1.2)

Les consignes racine s'appliquent. Ce dossier est un outil local sur fixtures synthetiques, sans route publique ni integration au produit.

- Node 24.14 utilise et teste, sans installation ni changement du package Next. Le module partage de commission TypeScript est charge par le support natif de Node.
- Aucun coffre, variable de service ou compte distant a charger. Aucun adaptateur HTTP ou de notification a ajouter implicitement.
- Port fournisseur en lecture seule. CAS sur la ligne complete; ne pas substituer une simple verification de status a cette garantie.
- Aucun paiement, remboursement, transfert, changement de politique ou renvoi Telegram. Les cas ambigus restent manuels.
- Tests depuis la racine : node --test tools/payment-reconciliation/*.test.mjs.
- CLI : nouvelle copie de sortie obligatoire, aucun ecrasement de l'entree. Ne fournir que des donnees fictives explicites.
- Le raccordement au stockage/fournisseur reels et la validation externe sont des sous-tickets distincts; aucune migration distante ou activation de maintenance autorisee par ce dossier.

## Perimetre autorise H1.2.2 - 5 novembre 2026

La derniere consigne utilisateur autorise explicitement adaptateurs HTTP de lecture sur127.0.0.1 et base SQLite de laboratoire uniquement. Cette exception remplace le refus historique d adaptateur implicite pour ce lot. Ne pas permettre api.stripe.com, Supabase distant, autre hote ou redirection. Aucun paiement, notification ou coffre reel. Le moteur/CLI fixture-only initial reste conserve.
