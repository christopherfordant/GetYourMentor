# Démo liée au portfolio — 22 octobre 2026

Autorisation utilisateur : faire ouvrir la version `54bb709` depuis « Voir la démo » dans son portfolio Lovable. Publication limitée au site de démonstration existant ; aucune activation commerciale ou modification de code applicatif.

- Source exacte : `54bb70980aebaadad402a2a93d38103f5e23a9b4`, 405 fichiers applicatifs comparés au commit avant et après préparation.
- URL : https://getyourmentor-demo-20261014.netlify.app/recherche
- Site Netlify : `86e0379e-4d1a-4cf0-936c-1439397354f4`.
- Déploiement publié : `6ad93730f89f5b5157ba9dd6`, état `ready` confirmé par API ; publié le 21 octobre à 22:06 UTC, soit le 22 octobre à 00:06 Europe/Madrid.
- BUILD_ID : `8aQY_5eM8uylFjzkN44xg`.
- SHA256 du ZIP serveur vérifié : `258d5a4d5835b365f2913724945d34f8fe2e7c4c185360129b91321a26cc023a`, 44 329 835 octets.
- Version précédente pour retour arrière : déploiement `6ad6a2d61f36fd8e0947b34a`, source `bbe20d766b69b03cbe48e80532f6213a02bf00e3`. Restaurer ce déploiement existant si une régression est établie, sans reconstruire une autre source par approximation.

## Vérifications réalisées

Procédure existante `gym-next/scripts/deploy-isolated-demo.py` : vérification de la cible, des seules variables démo attendues, absence de configuration Stripe/Supabase/Resend réelle ; un build Netlify avec plugin Next existant, typage, frontière des secrets client/serveur, matérialisation et validation du runtime, empreintes et publication sans nouveau build. Les avertissements CSS flex-start/flex-end et version du plugin restent des avertissements, pas des échecs cachés.

API health : HTTP 200, mode `demo`, `ready:true`, Stripe/Supabase/Resend désactivés. Ce contrôle lit le stockage mais ne constitue pas une recette complète des données, de la RLS ou des fonctions métier.

Playwright local : page Recherche hébergée HTTP 200, nouveau thème anthracite/orange et titre attendus, aucune erreur JavaScript observée. Playwright MCP : clic réel depuis le bouton du portfolio, ouverture de `/recherche`, titre et rendu Factory confirmés. La démo hébergée active les contrôles et liens de démonstration et le bandeau cookies ; la capture locale n'est donc pas une promesse de pixels identiques dans tous les états.

Portfolio Lovable : quatre fiches dans l'ordre GetYourMentor, Kebab Factory, Pipeline d'automatisation administrative, E-mail → audio avec ElevenLabs ; Guestbook retiré de la page Projets, CV inchangé. Bouton GetYourMentor relié à `/recherche`. Contrôles MCP 320/390/768/1440 : aucun débordement horizontal, images chargées, ordre correct, aucun Guestbook ; persistance après rechargement avec stockage local vide. Aucun lien ElevenLabs inventé. Modifications enregistrées dans Lovable, portfolio non publié dans ce lot.

Preuves de capture, rapport et manifestes expurgés conservés localement dans `C:/Users/cashe/Documents/portfolio-christopher-fordant-private/lovable-previews/`. Aucun secret, cookie, jeton, document privé ni trace brute ajouté au dépôt public. Le déploiement démo ne marque pas V1/V2/V3 terminées. Aucune campagne complète de recette distante ni paiement réel effectué.
