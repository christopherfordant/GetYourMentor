# Reconciliation locale sur donnees fictives

Premier mecanisme GYM-H1.2, pas un correctif deja branche sur le site. Aucun endpoint, coffre, adaptateur Stripe/Supabase ou envoi Telegram. Node24.14 present a ete utilise. Aucun package installe. Le calcul de commission importe directement gym-next/lib/domain/commission.ts avec le support TypeScript natif de Node; Node emet un avertissement de detection ESM, sans modification du package Next.

Depuis la racine du depot :

```powershell
node --test tools/payment-reconciliation/*.test.mjs
node tools/payment-reconciliation/cli.mjs --input tools/payment-reconciliation/example.fixture.json --mode diagnose --output delivery-private/reconciliation-diagnostic-NOUVEL-ESSAI.json
node tools/payment-reconciliation/cli.mjs --input tools/payment-reconciliation/example.fixture.json --mode resume --output delivery-private/reconciliation-resume-NOUVEL-ESSAI.json
```

Choisir des sorties nouvelles : le CLI refuse tout ecrasement, y compris de son entree. La reprise cree une nouvelle copie de travail, pas une modification du fichier original. Le diagnostic produit un rapport et une copie inchangee des donnees fictives. Les deux sorties peuvent etre comparees. Le champ fixture=true est un engagement de l'auteur du fichier, pas une preuve cryptographique de provenance : ne jamais fournir un export reel.

Le CLI desactive fetch et ne charge pas de variables de service. Son fournisseur ne lit que les instantanes inclus dans le fichier. Maximum fichier1Mo,100 lignes/IDs candidats,20 traites par execution au plus (10 par defaut). Les erreurs sont des codes fixes, sans charge utile, identifiant, e-mail ou exception brute dans le rapport console. Le fichier de sortie contient les lignes fictives pour permettre la comparaison; ne pas le confondre avec le rapport expurge.

Le moteur expose un plan pur puis un compare-and-swap (CAS) sur l'empreinte de la ligne complete. Un changement concurrent, meme sans changement de statut, provoque retry et demande une nouvelle lecture. Aucun retry financier ou renvoi Telegram. Le CAS du magasin local est atomique dans un seul processus partage; les sorties de deux CLI independants sont deux simulations independantes, pas une base distribuee.

Les champs fournisseur sont des objets de forme Stripe dans une enveloppe locale : platformVerified, environmentId, platformAccountId et liaison coach sont declares par la fixture. Ils ne prouvent aucun appel /v1/account. Un futur adaptateur devra produire ces informations depuis les verifications serveur existantes. Aucun mode remote n'est accepte ici.

Conception, limites et preuves : docs/RECONCILIATION_H1_2_2026-11-05.md. Le parent H1.2 reste ouvert jusqu'au raccordement metier et aux validations distinctes.


## Extension locale H1.2.2

Le CLI ci-dessus reste fixture-only. Des adaptateurs HTTP127.0.0.1 et SQLite transactionnel, avec CLI operateur prive, sont testes separement : [LOCAL_ADAPTERS.md](LOCAL_ADAPTERS.md). Aucun branchement au produit ni acces distant implicite.
