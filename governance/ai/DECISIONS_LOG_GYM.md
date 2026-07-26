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

## 2026-07-26 - Arbitrage du cycle recapitulatif

- Decision : ameliorer uniquement la lisibilite du recapitulatif sans changer sa structure ni sa logique de routing
- Pourquoi : la priorite est de confirmer proprement la reservation avant identification, pas d'ouvrir une logique panier ou multi-etapes plus lourde
- Impact : le recapitulatif reste simple, plus net visuellement, et conserve sa sortie vers `/compte` puis `/paiement`
- Sources : `prototype-site/recapitulatif-reservation.html`, `governance/USER_STORIES_MVP_GYM.md`, `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## 2026-07-26 - Arbitrage du cycle paiement

- Decision : renforcer uniquement la lisibilite du recap final sans changer la structure de la page paiement
- Pourquoi : la priorite MVP est de permettre une validation finale claire, pas d'ajouter de nouvelles logiques de paiement
- Impact : la page de paiement conserve sa structure validee, avec un recap plus net avant confirmation
- Sources : `prototype-site/paiement.html`, `governance/TRACEABILITY_MATRIX_GYM.md`, `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## 2026-07-26 - Arbitrage du cycle transverse du tunnel

- Decision : imposer `/creneau` comme etape obligatoire entre `/coach` et `/recapitulatif`
- Pourquoi : la story `US-SPORTIF-05` exige un vrai choix de creneau avant le recapitulatif
- Impact : le tunnel MVP de reference est maintenant ferme et ordonne de bout en bout
- Sources : `governance/USER_STORIES_MVP_GYM.md`, `governance/TRACEABILITY_MATRIX_GYM.md`, `gym-next/components/booking-legacy/ReserverSeanceLegacyPage.tsx`

## 2026-07-26 - Arbitrage du cycle haut de funnel

- Decision : imposer le passage `/ -> /recherche -> /coachs -> /coach` lorsque l'utilisateur part de la home
- Pourquoi : la home ne doit pas court-circuiter l'etape de recherche, qui fait partie de la comprehension du catalogue et de la logique metier MVP
- Impact : la recherche depuis l'accueil envoie desormais vers `/recherche` avec les parametres utiles, et les pages de recherche / annuaire retrouvent des libelles lisibles
- Sources : `governance/USER_STORIES_MVP_GYM.md`, `governance/TRACEABILITY_MATRIX_GYM.md`, `gym-next/components/home-legacy/AccueilLegacyPage.tsx`, `gym-next/components/search-legacy/RechercheCoachLegacyPage.tsx`, `gym-next/components/directory-legacy/SelectionCoachsLegacyPage.tsx`

## 2026-07-26 - Arbitrage du cycle compte et bifurcations

- Decision : stabiliser la page `/compte` avant toute nouvelle extension de dashboard
- Pourquoi : cette route gere a la fois l'identification, les redirections vers `/paiement`, les entrees coach et club, et plusieurs textes corrodes nuisaient a la credibilite du parcours
- Impact : les libelles critiques du compte, du dashboard coach et du dashboard club redeviennent lisibles sans modifier la structure de reference
- Sources : `prototype-site/compte.html`, `prototype-site/inscription-club.html`, `governance/USER_STORIES_MVP_GYM.md`, `gym-next/components/account-legacy/AccountLegacyPage.tsx`
