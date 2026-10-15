# Decisions Log GYM

## 2026-10-15 — Maquette HTML intégralement validée

- La validation actuelle porte sur tous les éléments de la maquette, pas sur une recoloration de l’ancien accueil.
- Référence prioritaire pour les compositions et surfaces ; surfaces foncées ciblées autorisées, sans retour au thème Emergent.
- Premier lot : accueil, trois rôles, trois offres documentées, dialogues, variante de palette, liens utiles et FAQ. Aucune activation Premium ni paiement.
- Les corrections locales de découverte et les travaux métier antérieurs sont préservés. Recette et tableau exhaustif : docs/REFONTE_PROGRESSIVE_2026-10-15.md.

## 2026-10-15 à Harmonisation claire du socle comptes

- Instruction utilisateur prioritaire : remplacer le sombre historique par blanc/papier/violet ; présentation mobile adaptable sans changer les liens ni leurs noms.
- Contradictions résolues : DESIGN_SYSTEM_GYM.md (thème sombre premium), VISUAL_REFERENCE_CONTRACT.md (Identité bleu nuit/lime), premier rapport de refonte (menu coach sombre et disposition figée).
- Contrôles natifs conservés, un seul sélecteur de langue visible dans le compte. Pied de page responsive corrigé à 900 px ; header mobile non fixe pour préserver les ancres.
- Aucun changement de finance, authentification, droits ou déploiement. Livraison et preuves : docs/REFONTE_PROGRESSIVE_2026-10-15.md.

## 2026-10-15 — Refonte progressive validée

- La maquette locale est validée pour l'implémentation dans l'application existante ; header conservé dans ses noms, ordre, destinations et organisation.
- Premier lot : socle visuel et comptes, priorité au panneau coach mobile rétréci par les styles hérités. Vérification Playwright MCP, puis build et recette ; commits ciblés sur une branche design, travail antérieur préservé.
- Commission actuelle 15 % et snapshots inchangés. LangChain/LangGraph non ajoutés sans bénéfice démontré ; aucun agent métier supplémentaire. Nettoyage limité aux doublons dont les références et usages ont été contrôlés.
- Périmètre, preuves et état de livraison : `docs/REFONTE_PROGRESSIVE_2026-10-15.md`. V2/V3 restent à construire selon les critères documentés.

## 2026-09-28 - Socle RAG lexical et contrat MCP lecture seule

- Decision : activer uniquement un socle documentaire lexical gouverné et un contrat MCP allowlisté, sans brancher ces capacités au tunnel métier critique.
- Pourquoi : rendre l’architecture testable sans introduire de fournisseur d’embeddings, de secret ou d’agent non contrôlé.
- Impact : le manifeste `docs/architecture/rag-corpus.json`, la fonction SQL `gym_memory.search_document_chunks` et les contrôles `check:rag-corpus` / `check:mcp-contract` deviennent les garde-fous versionnés. Les embeddings, agents et serveur MCP restent bloqués jusqu’à une validation séparée.
- Sources : `DOCUMENT_MAITRE_GYM.md`, `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`, `docs/mcp/MCP_TOOL_CONTRACT_GYM.md`

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
- Sources : `DOCUMENT_MAITRE_GYM.md`, `governance/FIL_ROUGE_OPERATOIRE_GYM.md`, `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`

## 2026-07-26 - Creation d'une memoire projet compacte

- Decision : creer un contexte RAG local persistant dedie au suivi des routes, correspondances prototype/Next, priorites, risques et regles de protection
- Pourquoi : reduire les pertes de contexte dans les conversations longues et mieux decouper les prochaines phases de production
- Impact : le projet gagne un fil conducteur local reutilisable par role et par cycle
- Sources : `docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md`, `MIGRATION_NEXT_GYM.md`, `CARTOGRAPHIE_GLOBALE_GYM.md`

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

## 2026-07-26 - Arbitrage du cycle inscription club

- Decision : finaliser uniquement les libelles de surface de `/inscription-club` sans changer le parcours
- Pourquoi : la page etait deja fidele a sa structure prototype, il restait surtout des accents et libelles de confort a remettre au propre
- Impact : la page club gagne en clarte immediate tout en conservant exactement la meme logique de passage vers `/compte?mode=club&connected=1`
- Sources : `prototype-site/inscription-club.html`, `governance/USER_STORIES_MVP_GYM.md`, `gym-next/components/club-signup-legacy/InscriptionClubLegacyPage.tsx`

## 2026-07-26 - Arbitrage du cycle shell Next et QA transverse

- Decision : remettre le shell Next non legacy en conformite avec les routes MVP valides
- Pourquoi : meme s'il n'est pas la page active principale aujourd'hui, il ne doit pas reintroduire des routes brouillon ou une logique obsolete lors d'une future bascule
- Impact : les CTA du shell Next pointent de nouveau vers `/recherche`, `/coach` et `/creneau` avec des parametres metier coherents ; la metadata et la documentation transverse sont alignees
- Sources : `gym-next/components/home/HomePageClient.tsx`, `gym-next/components/home/home-data.ts`, `MIGRATION_NEXT_GYM.md`, `governance/ai/MVP_ROUTE_CONTROL_GYM.md`

## 2026-07-26 - Arbitrage du cycle QA Playwright

- Decision : recalibrer les tests Playwright sur le flux metier MVP actuellement valide
- Pourquoi : l'automatisation ne doit pas continuer a verifier un comportement obsolete contredit par le cycle 007
- Impact : les tests de parcours critique suivent maintenant le passage `/ -> /recherche -> /coachs`
- Sources : `governance/ai/CYCLE_007_HAUT_FUNNEL_GYM.md`, `gym-next/tests/business-flow.spec.ts`

## 2026-07-26 - Arbitrage du cycle audit visuel Playwright

- Decision : valider visuellement en desktop et mobile les routes critiques deja migrees sans ouvrir de refonte supplementaire
- Pourquoi : il fallait confirmer que les pages-clés restent lisibles et chargeables apres les cycles de stabilisation metier et de shell Next
- Impact : l'audit visuel Playwright passe sur 14 verifications et les captures locales peuvent servir de base de comparaison pour les prochains cycles UI
- Sources : `gym-next/tests/visual-audit.spec.ts`, `gym-next/scripts/run-playwright-audit.cjs`, `gym-next/playwright-artifacts/`

## 2026-07-29 - Gate fil rouge avant push et hygiene des artefacts locaux

- Decision : imposer un controle fil rouge avant chaque push et ignorer les artefacts locaux d'audit / supervision
- Pourquoi : proteger le document maitre, eviter les pushes hors cadre MVP et garder l'historique Git propre
- Impact : le script `scripts/pre_push_fil_rouge_check.ps1` devient le passage obligatoire avant push ; les dossiers `gym-next/playwright-artifacts/`, `gym-next/playwright-report/`, `gym-next/test-results/` et le log `governance/ai/supervisor_loop.log` ne doivent plus polluer les prochains commits
- Sources : `DOCUMENT_MAITRE_GYM.md`, `governance/FIL_ROUGE_OPERATOIRE_GYM.md`, `scripts/fil_rouge_supervisor.py`, `scripts/pre_push_fil_rouge_check.ps1`

## 2026-07-29 - Validation du tunnel metier Playwright

- Decision : considerer le tunnel MVP sportif comme valide fonctionnellement apres execution Playwright metier complete
- Pourquoi : il fallait confirmer que les routes critiques chainent encore correctement apres les cycles de migration, d'audit visuel et de gouvernance
- Impact : le flux `home -> recherche -> coachs -> coach -> creneau -> recapitulatif -> compte` passe maintenant en desktop et mobile avec `10 / 10` tests OK
- Sources : `gym-next/tests/business-flow.spec.ts`, `governance/ai/MVP_ROUTE_CONTROL_GYM.md`, `governance/ai/CYCLE_013_VALIDATION_TUNNEL_METIER_GYM.md`

## 2026-07-29 - Renforcement SEO technique des routes MVP migrees

- Decision : ajouter des metadata utiles et distinctives sur les routes Next.js critiques sans toucher au design ni a la logique de reservation
- Pourquoi : il fallait rendre les pages MVP plus trouvables et plus propres semantiquement sans casser la parite prototype / Next
- Impact : les pages home, recherche, annuaire, fiche coach, creneau, recapitulatif, compte, paiement et inscription club ont maintenant une couche SEO route par route ; le build Next est valide et le tunnel metier reste `10 / 10` apres la passe SEO
- Sources : `gym-next/lib/seo.ts`, `gym-next/app/layout.tsx`, `gym-next/app/coach/page.tsx`, `governance/ai/CYCLE_014_SEO_METADATA_GYM.md`
