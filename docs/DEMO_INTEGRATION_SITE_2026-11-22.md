# Intégration de la démo au site — 22 novembre 2026

## Constat

Sur l’aperçu public avant cette modification, l’accueil présentait déjà une entrée « Testez le parcours sportif » qui menait à `/demo`. La route de démonstration utilisait toutefois un écran autonome, sans l’en-tête ni le pied de page partagés, avec une palette verte distincte. La démo donnait donc l’impression d’être un site à part.

## Ajustements locaux

- `/demo` reprend maintenant l’en-tête et le pied de page communs du site, avec les disciplines et un retour explicite à l’accueil.
- Le parcours comporte un fil d’Ariane et une étiquette « Démonstration » ; son contenu fictif et la simulation du paiement restent clairement annoncés.
- Les couleurs utilisent la palette sombre et orange du site.
- L’action Notifications est retirée de l’en-tête sur cette route : le parcours ne crée pas de notification dans le compte du sportif.
- Le titre de page n’ajoute plus deux fois « GetYourMentor ».
- Le CTA de l’accueil, le parcours métier, l’API et le stockage ne sont pas modifiés.

## Contrôles effectués

- `npm run check:types` : réussi.
- Aperçu navigateur local `http://localhost:3012/demo` : HTTP 200 après compilation ; le titre, l’en-tête partagé, le fil d’Ariane, l’avertissement de démonstration et le pied de page sont présents.
- Rendu desktop et viewport mobile 390 px inspectés. La largeur du document mobile était de 375 px et ne dépassait pas la zone affichée.
- L’accueil de l’aperçu existant a été inspecté : son CTA conditionnel pointe vers `/demo`.
- Le backend local de démonstration n’est pas configuré : `/api/demo/session` répond HTTP 503 et l’interface affiche l’état indisponible prévu. Le parcours complet n’a donc pas été retesté dans cet environnement ; sa recette précédente sur l’aperçu figure dans `docs/DEMO_D1_8_OUTILS_MCP_2026-11-21.md`.
- Aucun déploiement, changement de compte, de variable ou de base Supabase n’a été réalisé. L’aperçu public consulté correspond encore à l’ancienne présentation.

## Suivi

GYM-D1.9 reste ouvert. Le critère d’intégration à l’interface commune est ajouté à ce ticket, mais sa publication exige toujours les vérifications et autorisations de la cible Netlify prévues par celui-ci.
