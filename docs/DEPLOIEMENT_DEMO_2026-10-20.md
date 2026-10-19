# Déploiement de démonstration — 20 octobre 2026

Demande utilisateur : « déploie le site ». Cette autorisation remplace pour ce lot l'interdiction antérieure de déployer la démo ; aucune publication sur le site historique/production métier.

- URL : https://getyourmentor-demo-20261014.netlify.app
- Site dédié : `86e0379e-4d1a-4cf0-936c-1439397354f4`.
- Sources livrées : `bbe20d766b69b03cbe48e80532f6213a02bf00e3`, branche `design/refonte-progressive-lot1`, local/distant identiques avant construction.
- Déploiement Netlify : `6ad6a2d61f36fd8e0947b34a`, état `ready` confirmé par API après publication.
- BUILD_ID : `OFG4N8A-V0wI-kcusawpX` ; empreinte du paquet dans [la preuve](assets/deployment-2026-10-20/verification.json).

## Vérifications
Typage réussi ; build Netlify réussi ; frontière des secrets client/serveur valide ; paquet Next matérialisé et contrôlé. Sources comparées au commit avant/après préparation. Script existant `deploy-isolated-demo.py`, un seul build et déploiement. Aucun fichier applicatif modifié.

Lecture limitée des réglages du site en mémoire : environnement demo, paiements local simulés, commission 1500 points de base, pas de services réels autorisés. Aucun secret archivé. Authentification existante utilisée sans installation ni modification du plan Netlify.

Après publication : `/api/health` HTTP 200, mode demo, ready true ; `/` HTTP 200, HTML GetYourMentor. La vérification de santé lit le stockage démo existant ; aucune mutation métier ou purge. La version est reliée au commit par le contrôle des sources, le manifeste local et le titre du déploiement, pas par le health qui n'expose pas le SHA.

Navigation Playwright MCP tentée mais sans retour ; attente interrompue. Aucun contrôle visuel réussi revendiqué. Recette métier hébergée TXT non exécutée ; raccordement de l'observateur privé toujours inactif. Les tests locaux antérieurs ne deviennent pas des preuves distantes.

## Préservation et limites
Changements locaux non validés du dépôt principal exclus, dépendances existantes réutilisées. Aucun abonnement/paiement/notification réel, migration, suppression de données ou modification du site historique. Compteurs de consommation/crédits Netlify inconnus, aucun solde garanti.

L'option CLI `--prod` vise ici la publication principale du seul site démo dédié. Elle ne désigne pas le site historique métier.

Retour arrière possible : republier un déploiement antérieur connu du même site démo après revue et autorisation ; aucune restauration des données ni rollback exécuté ici. Prochaine action : recette ciblée du candidat publié si autorisée et prérequis réunis, ou prochain lot métier indépendant. Le plan distant préparé reste NOT_RUN et ses autres accords restent inchangés.
