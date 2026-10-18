# Qualification des pièces jointes de messagerie — 19 octobre 2026

## Conclusion et décision de ce lot
**Qualification et refus explicite livrés ; transfert de fichier non implémenté.** La messagerie existante ne possède pas de parcours binaire protégé réutilisable de bout en bout. Le SDK installé peut stocker des octets : il ne manque donc pas nécessairement un abonnement, une clé ou un service externe pour poursuivre en démo. Il manque une implémentation et sa recette, pas une capacité générale du fournisseur.

La demande utilisateur autorise cette qualification puis une intégration conditionnelle. Aucun bouton, upload simulé ou nouveau stockage n’est ajouté dans cette tranche. Ne pas marquer les pièces jointes comme réalisées. Aucun blocage global de GetYourMentor ni intervention utilisateur indispensable établi.

## Sources et portée de la recherche
PDF consultés localement par extraction `pypdf`, sans conversion externe, originaux préservés. Recherche ciblée des mentions messagerie/fichiers/upload/pièces jointes, puis lecture des passages pertinents ; ni audit visuel intégral ni lecture exhaustive des exigences revendiqués.

| Source / page physique | Constat | Conséquence |
| --- | --- | --- |
| Business Plan (`Bussiness Plan.pdf`), p.29 | Messagerie entre coachs/clubs/salles et sportifs ; notifications, modèles, filtres/recherche. PDF/vidéo/photo/audio figurent sous **gestion des contenus** | Ces formats ne sont pas une spécification explicite de pièces jointes de chat |
| Business Plan, p.33/35 | Achat/téléchargement et vente de contenus | Ne pas réutiliser les droits d’achat comme autorisation d’une conversation |
| Business Plan, p.50 | Messagerie coach–sportif du MVP | Aucun format/poids de pièce jointe défini dans ce passage |
| MVP général, p.1 | Aucune mention explicite de pièce jointe trouvée par extraction ciblée | Ne pas attribuer à cette source une règle absente |
| `Copie de Devis DEV - GetYourMentor.pdf`, p.1 | Justificatifs/diplômes et stockage sécurisé Supabase ; chat sécurisé lié aux réservations | Documents administratifs et messagerie sont deux domaines distincts |
| Stratégie Perplexity, p.4–5 | Messagerie simple coach–club ; fichiers Figma dans le processus de conception | Aucun contrat de transfert documentaire dans le chat établi |

L’absence de mention repérée ne prouve pas l’absence dans toutes les pièces historiques. Périmètre : ces quatre sources prioritaires et documents canoniques du lot. Les anciennes mentions « pièces jointes à traiter » de la matrice sont un backlog, pas la preuve d’un format métier validé. La demande utilisateur actuelle autorise l’étude ; une proposition technique reste possible sans inventer de tarif ou droit Premium.

## Qualification technique vérifiée dans le code
| Élément | Preuve locale | Réemploi / limite |
| --- | --- | --- |
| Modèle Message et persistance | `gym-next/lib/messages.ts` | Texte/métadonnées seulement. Local : tableau mémoire, non durable après arrêt ; hébergé : `state.messages` dans JSON partagé ; aucune donnée binaire ni référence de fichier |
| Messagerie | `gym-next/app/api/messages/route.ts` | Auth/participants, historique, clés de répétition et réponses réutilisables ; JSON, texte requis, limite déclarative 32 Kio. Aucun endpoint upload/download de messagerie |
| Stockage démo | `gym-next/lib/repositories/demo-state.ts` | `getStore`, document `state` JSON versionné/CAS. Aucun adaptateur binaire exposé ; conserver l’atomicité des messages sans ajouter de base parallèle |
| Capacité SDK | Déclarations locales `@netlify/blobs/dist/main.d.ts` : entrée ArrayBuffer/Blob et lecture arrayBuffer/blob/stream | Capacité statique disponible ; aucune écriture/lecture distante exécutée. La présence du SDK ne prouve pas le contrôle d’accès, la liaison atomique ou le nettoyage des fichiers |
| Justificatifs coach/structure | `gym-next/lib/coaches.ts`, `gym-next/lib/clubs.ts` et routes documents existantes | Uploads privés Supabase, rôles/processus administratifs ; configuration réelle distincte, non réutilisable telle quelle en démo isolée. Ne pas exposer les justificatifs aux conversations |
| Contenus démo | `gym-next/app/api/contents/[id]/route.ts`, `gym-next/lib/demo-contents.ts` | Téléchargement TXT généré avec achat/propriété ; ni stockage de fichier envoyé ni autorisations conversationnelles |
| Schéma | `supabase/schemas/app.sql` : gym_messages et buckets coach/club documents | Pas de schéma attachant un objet à une conversation dans les passages examinés ; aucune validation RLS distante |

Aucune valeur de secret ou de session lue pour cette qualification. Pas de tentative d’accès à Supabase/Netlify ou d’installation. Pas de conversion ou analyse automatique de fichiers utilisateurs.

## Correctif de refus explicite
Inspection statique : le POST n’examinait pas les champs de fichiers JSON ; il pouvait réussir pour le texte alors qu’un appelant avait ajouté un champ de pièce jointe. Ce risque n’est pas présenté comme un incident observé en production.

Après authentification et les garde-fous existants :
- `multipart/form-data` refusé avant lecture des fichiers ;
- présence de `attachment`, `attachments`, `file` ou `files` dans le JSON refusée, y compris null/tableau vide ;
- réponse HTTP 415, code stable `MESSAGE_ATTACHMENTS_UNAVAILABLE`, indication qu’aucun message/fichier n’a été enregistré ;
- requête dépassant la limite déclarée existante : 413 ; non connecté/admin non autorisé : 401 ;
- aucun message partiel ni consommation de la clé de répétition. Un envoi ultérieur **explicite** du texte seul reste possible et dédupliqué.

Il s’agit du refus de ces intentions de fichier connues, pas d’une validation exhaustive de tous les champs JSON, ni d’une analyse antivirus, MIME ou contenu. La limite actuelle dépend de Content-Length : ne pas la présenter comme une limite fiable des octets réellement lus sans en-tête. Le futur upload devra borner la lecture réelle indépendamment de cet en-tête.

## Conditions du prochain lot d’intégration
Réutiliser le SDK et les contrôles conversationnels existants, sans fournisseur/agent supplémentaire. Prochaine tranche proposée : un seul fichier de démonstration à formats techniques strictement limités, sans vidéo initialement. Formats/tailles à documenter comme choix techniques conservateurs, pas comme droits commerciaux issus du PDF.

À implémenter et vérifier ensemble avant tout affichage d’upload :
1. Adaptateur privé local/hébergé au-dessus du fournisseur existant, clé serveur opaque ; octets hors du JSON global de toutes les réservations et messages.
2. Lecture serveur bornée, validation du contenu et du nom, types refusés par défaut, aucun HTML/SVG ou contenu actif affiché ; antivirus absent signalé, aucune garantie de fichier inoffensif.
3. Liaison fichier/message et compensation en cas d’échec, cohérence avec requestId et conflits ; résultat incertain relu sans renvoi automatique, traitement des objets orphelins explicite.
4. Téléchargement authentifié, participants autorisés vérifiés à chaque accès, sans URL publique permanente ni clé de stockage contrôlée par le client ; en-têtes privés/no-store, nosniff, attachment, noms sûrs.
5. UI accessible conservant texte/fichier en cas d’échec, retrait avant envoi, taille/format indiqués, aucun succès avant preuve serveur. Tests intégrés avec octets synthétiques comparés, refus étrangers, concurrence, coupure réseau et absence de fichier ; puis responsive aux quatre largeurs.

Ce travail reste réalisable en démo sans paiement ni activation Premium. Ne pas détourner les buckets de justificatifs. Aucune règle de conservation ou de quota commercial inventée.

## Vérifications et livraison
Résultats définitifs dans `assets/message-attachments-2026-10-19/verification.json`. Tests Playwright locaux via véritables endpoints et comptes synthétiques ; refus de fichier, pas recette d’un transfert binaire. Régressions texte/modèles/filtres/structures à distinguer des tests du refus. Aucun changement visuel : les captures précédentes restent applicables, pas de nouvelle campagne responsive revendiquée.

Branche `design/refonte-progressive-lot1`, base `b2330d0114b61c20b308d00d582d32e1a6364a68`, candidat isolé `GYM-message-attachments-review`. Aucun changement des historiques, rôles, commissions, réservations, Premium, CI/CD ou déploiement. Travaux antérieurs préservés. Retour arrière : revert du seul commit après revue, sans suppression de données ni force-push. V1/V2/V3 restent incomplets.

Résultats finaux : **6/6** tests du refus explicite et **26/26** régressions existantes réussis. Build, typage explicite, frontière client/serveur, contrôle statique Netlify et Fil Rouge conformes. Avertissements CSS/cache webpack non bloquants ; styles inchangés. Aucun fichier utilisateur transféré. Captures anciennes régénérées par les tests et rapports de supervision exclus du commit.
