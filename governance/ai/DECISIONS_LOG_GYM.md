# Decisions Log GYM

## Regle

Ce journal ne recense que les decisions structurantes ayant un impact sur :

- la logique metier
- la structure des pages
- la migration Next.js
- les priorites MVP
- la gouvernance

## 2026-07-26 - Mise en place d'une orchestration RAG locale

- Decision : instaurer une orchestration obligatoire des prompts metiers dans l'ordre `CTO > PRODUCT > DESIGN > DEVOPS > QA > SEO`
- Pourquoi : eviter les arbitrages en ordre inverse, les corrections UI hors scope et la perte de coherence entre produit, code et documentation
- Impact : toutes les futures missions importantes doivent passer par cette sequence ou justifier une exception
- Sources : `DOCUMENT_MAITRE_GYM.md`, `governance/FIL_ROUGE_OPERATOIRE_GYM.md`, `governance/ai/ARCHITECTURE_IA_RAG_GYM.md`

## 2026-07-26 - Creation d'une memoire projet compacte

- Decision : creer un contexte RAG local persistant dedie au suivi des routes, correspondances prototype/Next, priorites, risques et regles de protection
- Pourquoi : reduire les pertes de contexte dans les conversations longues et mieux decouper les prochaines phases de production
- Impact : le projet gagne un fil conducteur local reutilisable par role et par cycle
- Sources : `ARCHITECTURE_MEMOIRE_GYM.md`, `MIGRATION_NEXT_GYM.md`, `CARTOGRAPHIE_GLOBALE_GYM.md`

## 2026-07-26 - Arbitrage du cycle fiche coach

- Decision : ne pas ouvrir un nouveau parcours `devenir-partenaire` pendant le cycle `/coach`
- Pourquoi : la priorite reste la stabilite du tunnel sportif et la parite prototype / Next sur les pages critiques
- Impact : le lien header `Je suis un professionnel du sport` reste temporairement rattache a une route Next.js existante plutot qu'a une destination absente
- Sources : `prototype-site/reserver-seance.html`, `governance/USER_STORIES_MVP_GYM.md`, `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## 2026-07-26 - Arbitrage du cycle creneau

- Decision : renforcer la robustesse du retour vers `/coach` sans changer la structure de `/creneau`
- Pourquoi : la priorite reste la continuite du tunnel sportif et la lisibilite immediate des controles critiques
- Impact : le lien `Supprimer` garde un fallback contextuel, et le calendrier retrouve des controles credibles
- Sources : `prototype-site/choix-coach-creneau.html`, `governance/USER_STORIES_MVP_GYM.md`, `governance/ai/MVP_ROUTE_CONTROL_GYM.md`
