# Sources documentaires de référence

> Décision utilisateur du 21 octobre : Kebab Factory devient la référence de typographie et de palette ; le violet fixe mentionné dans les synthèses anciennes est remplacé. Les PDF métier ne sont pas modifiés. Contrat actif : `DESIGN_SYSTEM_GYM.md`, couverture `docs/REFONTE_PROGRESSIVE_2026-10-15.md` et relais courant. Les méthodes REA/V3/V5 gardent leur rôle et ne prouvent pas l'existence d'outils.

## Lecture et importance — consolidation du 18 octobre 2026
La hiérarchie applicable est celle de [BRANCH_STRATEGY_GYM.md](../../BRANCH_STRATEGY_GYM.md), section « Hiérarchie et contexte progressif ». Ce fichier est un index, pas un maître concurrent. Les décisions humaines récentes peuvent remplacer une prescription ancienne ; une extraction ou une synthèse n’atteste pas une implémentation.

| Source | Rôle et consultation | Arbitrage/reprise |
|---|---|---|
| [V3 consolidé](GetYourMentor_Prompt_Maitre_V3_Consolide_Codex.pdf), [texte paginé](PROMPT_MAITRE_V3_2026-10-17.md) | Méthode, 12 pages avec annexes V1/V2 ; couverture par domaines existante, pas exhaustive par sous-exigence | 15 % et maquette actuelle priment sur 10 % et Emergent/3D ; pas de Guardians automatiques |
| [V5](../governance/Prompt_Codex_V5_Intelligence_Professionnelle_Adaptative.pdf), [texte paginé](V5_ADAPTATIVE_2026-10-18.md) | Méthode, 5 pages ; hiérarchie p.1, mémoire/revue p.1–3, budgets p.4, phases p.5 | Réutiliser preuves/scénarios/conditions d’arrêt ; moteurs M1–M6 et orchestration multi-agents proposés, non autorisés automatiquement |
| [REA/UIUX original](Prompt_Maitre_Codex_REA_UIUX_GetYourMentor.pdf), [texte paginé](REA_UIUX_2026-10-18.md) | V1 du 17 octobre, 5 pages lues textuellement ; contenu déjà largement repris dans l’annexe A du V3 | Original conservé pour provenance, pas un second plan d’implémentation ; catalogue dans le document REA existant |
| [Audit paiements](GetYourMentor_Prompt_Audit_Paiements_Abonnements_Acces.pdf), [texte paginé](AUDIT_PAIEMENTS_2026-10-18.md) | Audit du 14 octobre, 4 pages ; lecture directe p.1, reste à qualifier | 10 % et présomptions Stripe historiques non applicables par défaut ; commission séances actuelle 15 %, paiement local simulé |

Ces trois nouvelles copies sont binaires identiques aux originaux Downloads, conservés. V3 vérifié identique lors du diagnostic précédent. Extraction locale uniquement, aucune transmission externe. La mise en page et les images ne sont pas certifiées ; ouvrir/rendre les pages lorsqu’une décision visuelle dépend du PDF. Aucun OCR nécessaire pour les trois PDF copiés : texte extractible sur chaque page.

## Inventaire des PDF disponibles

Les sources strictement commerciales (plans d’affaires, devis, financement, pitch decks, analyse concurrentielle, sondage et stratégie de lancement) ont été déplacées hors du dépôt le 16 novembre 2026. Les originaux sont conservés localement dans le dossier privé frère `GetYourMentor-private/business-materials/` ; ils ne sont pas disponibles dans un clone Git. Les mentions antérieures sont historiques et ne constituent pas des sources opérationnelles actuelles.
Périmètre : PDF techniques et de gouvernance actuellement disponibles dans le dépôt, complétés par les trois sources méthodologiques explicites ci-dessus. Cet inventaire ne couvre pas les documents privés déplacés ni toutes les pièces jointes historiques.

| Fichier | Pages | SHA-256 | Importance / couverture constatée | Extraction |
|---|---:|---|---|---|
| `GetYourMentor MVP_V1 - Fonctionnalités générales.pdf` | 1 | `2c9d579b5b16d6c682ff08e2591c6c6fb704b30e4da1a5092e9ad659cdc2d8e6` | Métier prioritaire ; p.1 lue au diagnostic précédent | Extraction locale existante `project_readable/GetYourMentor MVP_V1 - Fonctionnalités générales.pdf.txt` ; disponibilité Git non garantie |
| `Prompt_Codex_V5_Intelligence_Professionnelle_Adaptative (1).pdf` | 5 | `d630e931073bf4c79747e48e5f76489884d7227f7d69397d8f1f7bd7203af361` | Méthode proposée ; 5 pages lues au diagnostic précédent ; moteurs non présumés livrés | `docs/sources/V5_ADAPTATIVE_2026-10-18.md` |
| `docs/governance/Prompt_Codex_V5_Intelligence_Professionnelle_Adaptative.pdf` | 5 | `d630e931073bf4c79747e48e5f76489884d7227f7d69397d8f1f7bd7203af361` | Méthode proposée ; 5 pages lues au diagnostic précédent ; moteurs non présumés livrés | `docs/sources/V5_ADAPTATIVE_2026-10-18.md` |
| `docs/sources/GetYourMentor_Prompt_Audit_Paiements_Abonnements_Acces.pdf` | 4 | `b9bce627ea7abb254d7a3a033bdf353216717c8812c73329751fc704ff6f635e` | Audit historique ; p.1 consultée, p.2–4 à qualifier ; 10 % remplacés | `docs/sources/AUDIT_PAIEMENTS_2026-10-18.md` |
| `docs/sources/Prompt_Maitre_Codex_REA_UIUX_GetYourMentor.pdf` | 5 | `dc2841e7af59fc66c03b6b30dada31286b39302ae87077048cad5a8fb5f1513d` | Méthode REA/UIUX V1 ; texte des 5 pages consulté ce lot ; pas de nouvelle capacité installée | `docs/sources/REA_UIUX_2026-10-18.md` |
| `docs\governance\Prompt_Codex_V5_Intelligence_Professionnelle_Adaptative.pdf` | 5 | `d630e931073bf4c79747e48e5f76489884d7227f7d69397d8f1f7bd7203af361` | Méthode proposée ; 5 pages lues au diagnostic précédent ; moteurs non présumés livrés | `docs/sources/V5_ADAPTATIVE_2026-10-18.md` |
| `docs\sources\GetYourMentor_Prompt_Maitre_V3_Consolide_Codex.pdf` | 12 | `530361e26ab2884acdf02e2a2326815669ed7fd8d48787d87be2d5af7a59e464` | Méthode V3 ; corps principal consulté, annexes partiellement relues, couverture fine ouverte | `docs/sources/PROMPT_MAITRE_V3_2026-10-17.md` |
| `gym-next\public\docs\brief_motion_design_plateforme_sport_nextjs.pdf` | 8 | `32837294703236dbbc42cf513deff514ee9a7adcbac8a773d136c3c6bb51db77` | Référence visuelle technique ; non relue ce lot | Pas d’extraction référencée dans ce lot |

## Références visuelles et reprise
La maquette prioritaire est `C:/Users/cashe/Documents/GetYourMentor_Audit_Design_2026-10-15/maquette/index.html` (fichier local externe au dépôt). Texte HTML inspecté au diagnostic précédent ; pas de nouvelle recette navigateur ce lot. Contrat : [DESIGN_SYSTEM_GYM.md](../../DESIGN_SYSTEM_GYM.md), préambule actuel ; palette violette fixe, pas de sélecteur sur l’accueil. Les anciens fonds exclusivement clairs ou anciens thèmes généraux ne révoquent pas la validation HTML.

Couverture produit : [matrice existante](../STRATEGIE_PERPLEXITY_COUVERTURE_2026-10-16.md). REA : [catalogue et protocole existants](../REA_COMPLEMENT_PLAYWRIGHT_2026-10-17.md). Reprise : [relais courant](../ETAT_REPRISE_COURANT.md). Lire les sources du lot et leurs dépendances ; ne pas charger toutes les archives à chaque requête.

## Lacunes restant ouvertes
- Qualification ligne à ligne des annexes V3, du PDF audit p.2–4 et de toutes les sous-exigences V5 non achevée ; aucune conformité V1/V2/V3/V5 annoncée.
- Les supports commerciaux sont conservés dans l’archive privée locale et ne sont plus intégrés au dépôt.
- Disponibilité/pertinence du RAG et de MemPalace non recettées ce lot ; accès direct aux fichiers utilisé. Aucun compteur privé Codex ou budget Netlify observé.
