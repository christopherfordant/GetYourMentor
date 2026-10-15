# Audit des écarts — refonte progressive, 15 octobre 2026

## Périmètre et priorité

Premier lot : retrait du changement de coloris de l’accueil et alignement documentaire. La maquette HTML validée reste la référence, avec cette exception explicitement demandée. Les autres pages seront déclinées par familles ; leur refonte intégrale n’est pas livrée dans ce lot.

Les décisions utilisateur récentes précisent les contrats. Les exigences métier viennent du document maître et des trois PDF prioritaires ; les recommandations secondaires ne les remplacent pas. Commission administrable de 15 % et historiques inchangés. Aucun paiement, activation Premium, changement de droits ou migration dans ce lot.

## Écarts et recommandations

| Priorité / état | Constat et référence | Traitement / dépendances |
| --- | --- | --- |
| P1 corrigé dans le code | Bouton « Comparer avec le vert », état React et CSS de variante sur `/`, contraires à la dernière demande | Retirer le contrôle et ses règles inutilisées ; conserver violet, profils, dialogues, langue, FAQ et liens. Vérifier mobile et rechargement. |
| P1 corrigé dans les contrats | DESIGN_SYSTEM_GYM, VISUAL_REFERENCE_CONTRACT, DESIGN_TOKENS, VISUAL_ACCEPTANCE autorisaient encore la variante | Aligner les règles actives ; les preuves antérieures restent historiques. |
| P1 prochain lot | Recherche, annuaire et fiche utilisent toujours les composants `*-legacy` et les CSS hérités : `app/recherche/page.tsx`, `app/coachs/page.tsx`, `app/coach/page.tsx` | Leur migration claire précédente ne reprend pas toute la composition éditoriale. Décliner typographie et composants ; préserver paramètres sport/ville/coach et navigation. Vérifier filtres et passage `/coach → /creneau`. |
| P1 à qualifier séparément | Nombreux correctifs comptes/paiements locaux absents du dernier commit distant | Préserver et vérifier leurs dépendances avant livraison. L’aperçu local ne prouve pas que ces correctifs sont poussés. |
| P2 divergence | Stratégie perplexity p. 4 exclut les paiements du MVP et limite le produit au rapprochement coach/club | Conserver le tunnel et les quatre rôles exigés par le MVP prioritaire p. 1 et le devis p. 1–2. |
| P2 divergence | Stratégie perplexity p. 6 propose 50 €/mois coach et 200 €/mois club, sportifs financés par le club | Conserver les offres prévues de 19,99 et 29,99 € du Business Plan p. 35–36. Aucune séance gratuite implicite. Supplément 3,99 €, périodicité à confirmer. |
| P2 à planifier | SEO local, contenus et segmentation : Stratégie perplexity p. 18–23 | Prévoir contenus sourcés et maillage réel. Aucun blog vide, faux chiffre, faux avis ou route fictive créé. Dépendance : données et stratégie éditoriale vérifiées. |
| P2 utile | Bêta et retours utilisateur : Stratégie perplexity p. 5, 9–14 | Lots testables et captures ; l’émulation ne vaut pas un test sur appareil physique. |
| P2 limite documentaire | PDF « erreurs/corrections par métier » non identifiés sous ces noms dans l’inventaire | Utiliser les rôles DESIGN/QA/SEO/CTO/DEVOPS/PRODUCT disponibles. Références exactes à préciser si d’autres PDF sont attendus ; cela ne bloque pas le premier lot. |
| P2 CI observée | `.github/workflows/mvp-gates.yml` ne se déclenche pas sur push de `design/refonte-progressive-lot1` | Contrôles locaux ciblés, sans les présenter comme une CI distante. Extension éventuelle dans un lot CI dédié, sans modifier le déploiement. |

## Sources et connaissances

- Consignes de reprise, stratégie de branches, document maître, index et état de reprise ; design system, contrat, tokens et recette visuelle.
- Maquette HTML et preuves du lot précédent ; Business Plan p. 30, 35–36, MVP prioritaire p. 1 et devis prioritaire p. 1–2.
- `Stratégie/Stratégie_/Stratégie perplexity.pdf` : extraction locale, 25 pages. Pages 4 et 6 rendues et examinées visuellement ; page 19 rendue pour contrôle SEO. Certains caractères spéciaux sont mal extraits ; le rendu confirme le tableau des tarifs et les exclusions MVP. Originaux préservés, aucun envoi externe.
- `docs/governance/Prompt_Codex_V5_Intelligence_Professionnelle_Adaptative.pdf`, p. 1–3 : provenance, scénarios et classification des défauts utiles. Ses propositions de moteurs et ses instructions d’attendre une validation ne remplacent pas l’autorisation actuelle de refonte et de push. Aucun moteur ou agent ajouté.
- Architecture mémoire/RAG, readiness, contexte, fil rouge, orchestrateur et rôles DESIGN/QA/SEO. Les missions automatiques d’août ne remplacent pas les décisions utilisateur d’octobre.

Pas de configuration locale du RAG distant. Recherche directe dans les sources ; `check:rag-corpus` et `evaluate:rag` passent (8 documents, 8 cas lexicaux). Ces contrôles ne certifient ni recherche sémantique ni ingestion de tous les PDF : les PDF ont été consultés directement.

## Phases suivantes et retour arrière

1. Accueil à palette fixe, contrats, preuves et push ciblé.
2. Recherche, annuaire, fiche : compositions éditoriales et composants partagés, paramètres et routes préservés.
3. Créneaux, récapitulatif, paiement : états métier, autorisations et idempotence selon les changements.
4. Comptes et structures : responsive, navigation, déconnexion et données isolées des trois profils.
5. Administration et transversal : RLS en environnement de test, SEO, performances et CI/CD. Ne pas certifier ces domaines depuis des captures.

Retour arrière : revert du commit ciblé, sans reset du dépôt, des données ou des travaux antérieurs. Prototype original inchangé. Résultats et preuves du lot : `REFONTE_PROGRESSIVE_2026-10-15.md`.
