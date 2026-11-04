# Parcours recruteur — 22 octobre 2026

## Périmètre et sources

Lot borné : recherche → liste → fiche coach → préparation d’une demande. Base distante privée `c0eaf47d775cc17e2904598e842370752a829f2a`, worktree isolé `C:/Users/cashe/Documents/GYM-recrutement-20261022`. Les modifications antérieures du dossier principal, resté à `ddd2f54`, sont exclues et préservées. Contrat Factory en tête de DESIGN_SYSTEM_GYM, relais courant, REFONTE_PROGRESSIVE, règles avis du rapport AVIS_STRUCTURES_PERSISTANCE_2026-10-17 : statistiques tirées des avis enregistrés, acceptation avant paiement. Aucune nouvelle règle commerciale.

## Défaut reproduit et décision

Sur la base actuelle, API de la fiche retardée volontairement dans Chromium : Madison Seck affiche **4.8 / 5 et 24 avis** avant réponse, puis **Pas encore de note / Pas encore d’avis** après HTTP 200. La fiche initialisait son état avec `coachProfiles`, dont les compteurs sont des données de présentation ; l’API utilise les avis enregistrés. Ce décalage ne prouve aucun changement réel d’avis. Première navigation de diagnostic expirée pendant la compilation à froid ; observation obtenue après compilation, puis attente explicite de la réponse API.

Correction : aucune fiche issue du fixture pendant l’attente ; chargement explicite, lecture API sans cache, annulation au démontage et délai borné de 10 s. HTTP 404 donne « introuvable », échec service donne « indisponible » avec réessai au clavier. Aucun profil fictif ne remplace une erreur. Les sous-notes restent indisponibles ; la note est présentée comme calculée sur les avis enregistrés.

Améliorations de cohérence : sans avis, liste et fiche indiquent « Pas encore de note » ; bannière de démonstration aussi sur Recherche (le paramètre existait mais n’était pas transmis). Qualification et diplôme de la fiche sont explicitement simulés/fictifs en mode démo. Le paiement après acceptation est nommé simulation. Les services, les protections, les historiques et la préparation de réservation restent inchangés.

## Vérifications et preuves

Test nouveau : `gym-next/tests/recruiter-discovery.spec.ts` (5 scénarios). Réutilisation du scénario onglets existant de `coach-tabs-footer.spec.ts` (1 scénario, 320/390/768/1440 px). Commande bornée :

```powershell
cd gym-next
npm run check:types
npm run build
npm run check:client-secret-boundary
npm run check:tracked-secrets
npx playwright test tests/recruiter-discovery.spec.ts tests/coach-tabs-footer.spec.ts --grep 'profile|reviews|recruiter journey|coach tabs' --project=desktop-chromium --workers=1 --reporter=line
```

Résultats définitifs dans `assets/recruiter-2026-10-22/verification.json`. Premier passage de configuration interrompu : baseURL restée à 3001 alors que le serveur de diagnostic utilisait 4313 ; aucun défaut produit déduit de ECONNREFUSED. Configuration temporaire corrigée, 6/6 scénarios PASS en développement avant build ; le passage final utilise le build et la configuration habituelle. Aucune protection modifiée.

Les cinq scénarios contrôlent : attente sans compteur fixture ; stats injectées 3.5/2 distinctes des anciennes 4.8/24 ; erreur 503 → réessai → fiche et 404 distinct ; avis chargement → erreur → réessai → vide ; parcours au clavier, coach/ville/prix conservés, aucune mutation API, pas de demande envoyée. Recherche/liste/fiche/préparation sans débordement à 390/768/1440 px. Captures synthétiques locales dans le même dossier. Le scénario de note 3.5/2 et les erreurs sont des réponses injectées de test, jamais de vrais avis.

## Versions et limites

- Hébergé : déploiement Netlify `6ad93730f89f5b5157ba9dd6`, source `54bb70980aebaadad402a2a93d38103f5e23a9b4` selon le rapport de livraison du 22 octobre. Lecture API Netlify effectuée ce lot : identifiant publié identique, état ready, aucun dépôt lié dans les champs repository/repo_url/repo_path. Ce contrôle n’est pas une recette distante métier.
- Local : changements de ce lot sur base c0eaf47, build Next 15.5.27 avec dépendances existantes partagées par jonction, aucun fichier .env recopié. Aucun déploiement ni export vers le dépôt public.
- Poussé : consulter le SHA distant confirmé dans le compte rendu de livraison ; branche privée `design/refonte-progressive-lot1`. Le workflow mvp-gates ne suit pas ses pushes ; aucun workflow de déploiement ajouté.
- Prévu : recette globale V1, services réels, RLS, avis/identités/diplômes réels et validation d’accessibilité exhaustive restent hors lot. Pas de paiement, message, réservation ou notification réels. Test navigateur Chromium local, pas appareil physique, pas certification. Les recommandations V1 du relais restent une prochaine priorité métier distincte.

## Étude de cas pour la vidéo

Besoin : permettre de comparer un coach sans transformer des données de présentation en preuve. Rôle à expliquer : cadrage du parcours, choix de la source de vérité et revue des corrections avec assistance IA au développement ; aucune IA embarquée ajoutée. Démonstration locale : écran de chargement → réponse sans avis, puis erreur contrôlée et réessai. Montrer le test de non-régression et la limite « démo ». Ne pas attribuer les corrections locales au site hébergé.
