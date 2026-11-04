# A4.3 — Comparaison locale lexical / vectoriel

## Décision

Conserver le lexical dans le produit et l'atelier actuels. Le vectoriel E5 à seuil **0,84** est un candidat expérimental intéressant pour les paraphrases, mais son remplacement général n'est pas validé : sur le corpus gouverné il perd une référence positive que le lexical retrouve. Ne pas corriger ce seuil à partir des échecs de validation.

A4.3 est terminé pour la comparaison bornée et la justification du seuil. Les sous-tickets S2 sont ainsi documentés, mais aucune architecture agentique complète, ingestion privée, orchestration applicative ou activation publique n'est déclarée terminée. L'intégration A5 reste distincte.

## Protocole fixé avant les inférences

Sources d'exécution : checkout propre issu de `3728929`, sans les 18 fichiers locaux modifiés du dossier principal. Le manifeste gouverné est chargé avec le moteur existant, limité à ses huit documents. Aucun parcours libre du disque, envoi à Supabase ou appel d'un fournisseur d'embeddings. Les tableaux NumPy sont volatils en RAM ; ils ne constituent pas une autre base vectorielle. Le choix de stockage demeure Supabase + pgvector.

[Jeu annoté et protocole](architecture/rag-comparison-2026-11-04.json) : 16 passages synthétiques dont quatre privés/inactifs et 38 questions (16 réglage, 22 validation). Les passages synthétiques et le corpus réel sont évalués séparément, jamais mélangés dans une recherche. S'ajoutent 12 références historiques et trois contrôles documentaires, uniquement diagnostiques. Les annotations ont été écrites avant l'inférence ; leur SHA256 est archivé. Elles sont internes à ce travail, sans jugement indépendant d'un recruteur ou d'un expert externe.

Le jeu comprend formulations exactes, synonymes, ambiguïté, deux passages contradictoires, absence d'information, hors sujet, documents privés/archivés/supprimés/désactivés et injections. Les états inactifs sont des fixtures de contrat de chargement ; ils ne remplacent pas la recette Supabase A4.2. La question Jupiter de validation est une formulation déjà connue, appliquée à une nouvelle fixture : elle n'est pas un exemple indépendant totalement inédit. Validation signifie ici « non utilisée pour choisir le seuil ».

Même validation du principal et de la question via `runAssistant`, mêmes règles de revue des sources suspectes, filtrage avant restitution, citations exactes et budgets : huit passages, 7 200 unités JS de texte, trois passages par document et diversification initiale. La seule admission sémantique étudiée remplace la couverture lexicale native par le seuil cosine ; il ne s'agit pas d'un changement des droits. Les fonctions communes de sélection et revue ont été extraites/exportées sans changer le comportement du lexical.

## Réglage et méthode hybride

Grille préfixée : 0,60 à 0,98 par pas de 0,02, plus un seuil au-delà de un pour la référence « tout abstention ». Coût de réglage : deux points par faux positif négatif + proportion des cas positifs dont tous les passages attendus ne sont pas retrouvés + statuts de sécurité/revue incorrects. Cette pondération privilégie l'abstention, sans valeur universelle. Départage à coût égal par le seuil le plus élevé.

Le minimum observé est **0,84**, coût 0,286, sans faux positif sur les six cas négatifs de réglage ; les sept positifs ont cinq ensembles complets retrouvés. À 0,86, le coût augmente à 0,571. Ces nombres proviennent uniquement du réglage, pas des 22 cas de validation ou du corpus réel.

L'hybride RRF à constante 60 avait une condition préenregistrée : des succès propres à chacune des deux méthodes sur le réglage. Le lexical a un succès propre (`t-log`), le vectoriel aucun. **Pas de benchmark hybride exécuté**, ni de performance hybride inventée. Son mécanisme de fusion et ses protections sont testés unitairement ; une nouvelle expérience hybride demanderait de nouveaux exemples réservés, sans réutiliser cette validation pour régler les paramètres.

## Résultats

| Mesure | Lexical actuel | Vectoriel, seuil 0,84 |
|---|---:|---:|
| Réglage : statut et passages attendus conformes | 15/16 | 14/16 |
| Validation : statut et passages attendus conformes | 16/22 | 19/22 |
| Validation : positifs avec tous les passages attendus | 5/10 | 7/10 |
| Recall moyen des passages annotés, plafond huit | 55 % | 75 % |
| Validation : faux positifs parmi sept négatifs | 1/7 | 0/7 |
| Validation : abstentions sur dix positifs | 4/10 | 2/10 |
| Références et contrôles réels : conformité documentaire | 14/15 | 14/15 |
| Références réelles positives retrouvées | 12/12 | 11/12 |

Le résultat global inclut des cas faciles de droits et de sources absentes : parmi les sept négatifs de validation, trois ont un ensemble autorisé vide. Il ne faut pas présenter 19/22 comme une précision générale de 86 % sur des demandes réelles. Pas d'inférence statistique sur une population ni de précision de passage calculée sur le corpus réel, dont les documents pertinents sont annotés comme alternatives incomplètes.

Constats concrets :
- La contradiction « 10 % ou 15 % » conserve les deux passages avec le vectoriel, un seul avec le lexical. Aucune méthode ne résout automatiquement la contradiction.
- La question de validation sur la séparation du paiement et celle sur le mobile provoquent encore une abstention vectorielle. L'ambiguïté de validation ne restitue qu'une des deux pistes attendues.
- Jupiter produit un faux positif lexical dans la fixture et dans le corpus réel ; le vectoriel s'abstient. Le défaut lexical préexistait et reste présent dans le produit.
- « Quel document est la source de vérité du produit ? » est retrouvé par le lexical, mais le vectoriel s'abstient au seuil figé. Cette perte suffit à exclure une bascule automatique sur la seule amélioration synthétique.

Les résultats détaillés contiennent uniquement identifiants, versions et mesures, sans texte de corpus ni vecteurs : [results.json](assets/rag-comparison-2026-11-04/results.json).

## Troncature, ressources et reproductibilité

Même découpage complet pour les méthodes : les citations et le lexical utilisent le passage intégral ; le vectoriel ne voit que ses 256 premiers tokens. Huit passages réels sont tronqués (282 à 391 tokens d'origine). Le cas synthétique placé en fin de passage n'a finalement pas dépassé le plafond : il teste une position tardive, **pas une perte démontrée par troncature**. Il faudra ajouter un stress test distinct avant toute conclusion sur les informations perdues ; les annotations de validation n'ont pas été modifiées après coup.

Réemploi des poids/cache et du pipeline qualifié : E5 quantifié 384 dimensions, préfixes query/passage, moyenne masquée et L2, CPU, deux threads intra-op et un inter-op. Empreintes vérifiées avant usage ; aucun téléchargement ajouté par le benchmark. Télémétrie ONNX explicitement désactivée. Le script n'appelle pas de client HTTP ou de base ; il ne s'agit pas d'un audit réseau par capture de paquets.

Dernière répétition : chargement 0,736 s ; encodage local des 629 passages autorisés 16,019 s ; médiane encodage de requête et produit scalaire 9,63 ms ; pic processus 548 823 040 octets, environ 523 Mio. La médiane du classement Node seul est distincte. Ces mesures excluent notamment la tokenisation, les échanges Python/Node, le transport réseau et Supabase ; aucune comparaison de latence de bout en bout ou capacité de production n'est revendiquée.

Une répétition du même protocole, après désactivation explicite de la télémétrie et durcissement défensif du filtre, conserve exactement le seuil, les identifiants/statuts des **106 couples cas/méthode** et les troncatures. Les temps varient normalement. [Empreintes et répétition](assets/rag-comparison-2026-11-04/reproducibility.json).

Reproduction depuis le checkout de ce lot :

```powershell
python tools/agentic-workbench/compare_retrieval.py --output delivery-private/comparison-replay.json
node --test tools/agentic-workbench/tests/*.test.mjs
node gym-next/scripts/evaluate-rag-corpus.mjs
```

Python nécessite les versions déjà qualifiées de NumPy, ONNX Runtime et tokenizers ; le script échoue si les assets locaux vérifiés manquent. Il ne les télécharge pas. Les révisions et hashes sont dans le rapport A4.1. Les versions des sources sont archivées : un autre corpus ou de nouvelles sources peuvent changer les résultats. Les empreintes du code et du jeu figé permettent de comparer un replay.

## Suite recommandée et limites

Garder le lexical pour les références documentaires exactes, en traitant son faux positif Jupiter dans un lot correctif distinct. Étudier le vectoriel en parallèle et sous revue humaine sur les paraphrases ; s'abstenir ou demander une précision quand les sources restent absentes, ambiguës ou contradictoires. Le seuil 0,84 n'est qu'un paramètre de cet essai, pas une probabilité de vérité.

Avant intégration A5 : annotations humaines au niveau des passages réels, nouveaux exemples de validation indépendants, traitement mesuré de la troncature, stratégie d'abstention/ambiguïté et contrat serveur d'autorisation/versions. Une ingestion distante du corpus ou une modification du produit nécessitera son autorisation propre. Ni le script d'évaluation ni ses tableaux mémoire ne sont ajoutés aux routes du site.

Contrôles : 29 tests Node réussis, dont trois nouveaux sur l'évaluation (source privée à score maximal, droits, budget commun, revue d'injection). Les 12 évaluations historiques restent réussies ; le contrôle Jupiter est conservé en échec documenté, sans masquer sa limite. Kanban et assistant contrôlés en contextes navigateur neufs à 1440/390 : A4.3 terminé, 13 sous-tickets, assistant toujours `extractive-lexical` avec zéro appel d'embeddings. Aucun stockage utilisateur réinitialisé ; serveur temporaire arrêté. [Preuve navigateur](assets/rag-comparison-2026-11-04/browser.json). Git et préservation du dossier principal : `delivery-private/rag-comparison-git.json`.
