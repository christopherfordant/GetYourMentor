# Écart entre le déploiement public et le parcours local — 16 novembre 2026

## Contrôles en lecture seule

- Site cible examiné : `https://getyourmentor-demo-20261014.netlify.app/`.
- Réponses observées : `GET /` = 200 ; `GET /api/health` = 200 avec `supabase=false` ; `GET /demo` = 404.
- Le dernier artefact Netlify documenté dans le relevé D1.2 est l’envoi CLI `6af5b42d9df69449340b3d31`, source Git `892ecba8a081de29336e482824d7a177726c48a7`.
- `git cat-file -e 892ecba8a081de29336e482824d7a177726c48a7:gym-next/app/demo/page.tsx` échoue : cette source ne contient pas la route `/demo`.
- La branche de travail `demo/recruiter-supabase-adapter-20261112` contient cette page. Elle a été ajoutée dans le commit `0181f296f6c01d52031a6def347266762ecd64ad` du 14 novembre. Le SHA source de déploiement est un ancêtre de la branche actuelle.

## Conclusion

Le `404` public correspond au fait que l’artefact servi précède l’ajout de `/demo` ; il ne prouve pas que le code local ne possède pas cette route. Le `supabase=false` est un blocage séparé : le runtime public n’a pas la configuration serveur attendue. Un push Git n’a pas déployé le site ; l’artefact répertorié provient d’un envoi CLI.

Aucun compte Netlify, réglage, variable, secret, build de publication ou déploiement n’a été modifié. Le prochain chemin sûr doit permettre de tester un aperçu isolé avec les variables de la base Supabase de démo avant la publication finale, tout en corrigeant le cycle D1.5/D1.8/D1.9. Cette preuve Git/public n’est pas une recette E2E ni une validation RLS runtime.
