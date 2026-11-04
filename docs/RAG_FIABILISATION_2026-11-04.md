# Fiabilisation locale du RAG avant A5

## Périmètre et décision

Lot isolé issu de `b3103ad`, sans les brouillons du dépôt principal. Le lexical reste actif dans l'atelier. Aucun appel Supabase, téléchargement, embedding, fournisseur payant, migration, route applicative ou déploiement ajouté. Stockage vectoriel retenu : Supabase + pgvector, sans activation nouvelle.

## Défaut reproduit et correction

La question « Quand décolleront les missions habitées vers Jupiter ? » obtenait `memory-rag:42:0` avec seulement deux correspondances : « quand » et « vers ». Le seuil de deux mots acceptait ainsi une relation purement grammaticale. Correction : compléter les mots-outils français exclus de la tokenisation, dont les interrogatifs et prépositions. Aucune planète, discipline ni domaine hors sujet n'est ajouté à une liste noire. Classement, budget, droits, citations et revue humaine restent inchangés.

Une règle expérimentale exigeant la moitié des mots de la question dans un passage a été essayée puis retirée : elle dégradait trois références historiques et un contrôle pertinent. Aucun résultat de cet essai n'est présenté comme validation indépendante. La correction retenue conserve le seuil exploratoire existant ; elle ne garantit pas la compréhension du sujet ou la résolution des ambiguïtés.

## Comparaison à critères constants

- Historique : **12/12 avant et après**, citations exactes et fenêtre des trois premiers documents contrôlées par le script existant.
- Contrôles documentaires : **2/3 avant, 3/3 après** ; Jupiter s'abstient désormais.
- Rejeu diagnostique A4.3 : **45/53 avant, 47/53 après**, sans cas auparavant conforme devenu non conforme selon les critères A4.3. Les deux gains concernent Jupiter réel et synthétique. Il reste six cas non conformes. Ce total utilise les critères A4.3, avec documents attendus comme alternatives ; il ne remplace pas la fenêtre plus stricte des évaluations historiques.
- **35 tests Node réussis**, dont six nouveaux : correspondances grammaticales hors sujet, question pertinente voisine, ambiguïté insuffisamment sourcée, sources absentes/privées/désactivées/supprimées, instruction suspecte, corpus réel/source de vérité.

Les cas étaient déjà connus : aucun de ces résultats n'est une mesure indépendante de généralisation. A4.3, son jeu, son seuil vectoriel et ses preuves restent inchangés. Les nouvelles sorties sont dans [le dossier de preuves](assets/rag-quality-2026-11-04/). Aucun nouveau benchmark vectoriel exécuté.

Les six échecs restants sont la paraphrase de réglage, les deux passages contradictoires non récupérés ensemble, les paraphrases de parcours, séparation et mobile, et l'ambiguïté de validation. Ils ne sont pas masqués par le succès de Jupiter. La question ambiguë sans indices suffisants s'abstient ; cela ne constitue pas une détection générale des ambiguïtés.

Le serveur local a été contrôlé par HTTP : Jupiter s'abstient, la source de vérité cite le maître, mode `extractive-lexical`, zéro embedding, cinq nouveaux tickets avec leurs statuts attendus. Une capture statique à 1440 pixels est disponible et a été examinée. Le contrôle interactif Playwright reste **incomplet** : création d'un contexte refusée (`Not allowed`), clic dans la page existante en délai dépassé, inspection suivante interrompue. Aucun succès de navigation interactive ou de contrôle mobile revendiqué. Aucun stockage utilisateur réinitialisé. Les tests serveur automatisés passent ; aucune interface de production modifiée.

## Annotations proposées

[Six questions et leurs passages candidats](RAG_ANNOTATIONS_A_RELIRE_2026-11-04.md), également en JSON : identifiants, chemins, lignes, SHA256 des sources, extraits exacts et empreintes des extraits. Sélection automatique dans les documents historiquement attendus. Les candidates ne sont ni exhaustives ni un gold indépendant ; **zéro validation humaine obtenue**. La fiche prévoit confirmation, rejet, omissions et motif/date sans les remplir à la place d'un humain.

## Diagnostic de troncature

Tokeniseur E5 local qualifié, empreinte vérifiée, préfixe `passage: ` inclus. Les mêmes huit passages A4.3 dépassent 256 tokens : 282 à 391 tokens. Selon le passage, 84 à 484 caractères de fin sont invisibles au modèle tronqué. [Identifiants, versions, limites et aperçus de fin perdue](assets/rag-quality-2026-11-04/truncation.json).

Deux stress distincts contiennent 1 313 et 1 315 tokens. L'information décisive commence au caractère 5 300 ; la troncature s'arrête au caractère 1 024. La perte de cette information est donc effectivement démontrée, contrairement au cas tardif trop court d'A4.3.

Proposition locale : fenêtres de 200 tokens de corps avec recouvrement de 32, chacune revérifiée à 256 tokens maximum, préfixe compris. Les offsets exacts permettent de revenir au passage parent et à sa version sans changer la citation d'origine. Les huit passages réels sont entièrement couverts sans trou ; les deux fins décisives sont présentes dans les fenêtres proposées. Huit fenêtres par stress.

**Cette mesure porte sur la visibilité du texte, pas sur un gain de rappel vectoriel.** Aucune inférence d'embeddings exécutée et aucun nouveau découpage activé. Avant adoption : mesurer le classement, les doublons, le coût d'indexation et le budget de contexte, puis définir les identifiants/versionnement des fenêtres et les invalidations. Les citations actuelles restent complètes et inchangées.

## Reproduction

```powershell
node --test tools/agentic-workbench/tests/*.test.mjs
node gym-next/scripts/evaluate-rag-corpus.mjs
node gym-next/scripts/evaluate-rag-corpus.mjs --controls
node tools/agentic-workbench/audit_relevance.mjs
python tools/agentic-workbench/audit_truncation.py
```

Le diagnostic Python nécessite uniquement le tokeniseur et la dépendance déjà présents ; il refuse un asset modifié et ne télécharge rien. Le rejeu exige le même jeu figé. Les résultats d'un corpus ultérieurement modifié doivent être archivés séparément et leurs versions comparées.

## Kanban et conditions avant A5

`GYM-Q1` et ses trois sous-tickets livrent correction, propositions d'annotations et diagnostic, avec rôles planifiés RAG/QA, exécution séquentielle. Estimations distinctes du temps consommé laissé à `null`. Les échéances S2 restent prévisionnelles, sans engagement ni durée réelle inventée.

Prochain ticket : **GYM-Q2**, bloqué sur relecture humaine et constitution d'un nouveau jeu réservé avant tout réglage. A5 et A5.1 dépendent désormais explicitement de ce ticket. Il faut aussi comparer le découpage proposé à critères fixés, traiter les ambiguïtés/contradictions restantes et définir le contrat serveur d'autorisation, versions et abstention avant une intégration autorisée. Aucune orchestration LangGraph ou architecture complète déclarée terminée.

Les modifications du JSON versionné ne réinitialisent pas les déplacements sauvegardés dans le navigateur utilisateur. Une carte terminée n'est pas une preuve suffisante ; consulter les fichiers associés.
