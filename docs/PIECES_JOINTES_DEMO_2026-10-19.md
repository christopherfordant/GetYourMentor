# Pièce jointe privée de démonstration — 19 octobre 2026

## Périmètre et sources
Suite de la qualification du même jour, base Git vérifiée `f86307e90a0eacd1a2c81d6b24ca5705bf4aa282`, branche `design/refonte-progressive-lot1`, candidat isolé `GYM-message-attachment-flow`. Demande utilisateur actuelle : réaliser le parcours, sans refaire la qualification ni réclamer une clé de production.

Sources déjà qualifiées : Business Plan p.29 (messagerie et gestion des contenus distinctes), p.33/35 (contenus), p.50 (messagerie MVP), devis p.1 et Stratégie Perplexity p.4–5 ; détails et limites dans [qualification](QUALIFICATION_PIECES_JOINTES_2026-10-19.md). Ces PDF n’ont pas été prétendus relus intégralement dans ce lot ; consultation progressive du relais, de l’index et du rapport spécialisé. Aucun Web/REA/IA, conversion externe, dépendance, agent, moteur ou fournisseur ajouté.

## Résultat et limites techniques choisies
Un fichier **.txt UTF-8**, non vide, maximum **64 Kio**, avec un message texte requis. Choix technique conservateur de cette tranche, pas une règle commerciale ni un format attribué au Business Plan. Aucun PDF, image, vidéo, archive ou exécutable pris en charge.

Validation serveur : schéma de fichier fermé, nom borné à 120 caractères sans séparateurs/contrôles/BiDi interdits, type déclaré text/plain, base64 canonique, taille décodée, UTF-8 strict, refus des contrôles binaires et des signatures/marques actives usuelles (PDF, ZIP, MZ, GIF, balises). Cela ne constitue pas une analyse antivirus ou une certification de document inoffensif. Ni extraction métier ni indexation du texte ; aucune transmission à une IA.

Le POST JSON réutilisé accepte un seul champ attachment valide en démo isolée, avec requestId requis. Multipart et autres intentions de fichiers restent refusés par `MESSAGE_ATTACHMENTS_UNAVAILABLE`. Limite totale 112 Kio, contrôlée sur **les octets réellement lus**, même sans Content-Length ; texte toujours limité à 4000 caractères. Le test de dépassement historique a été ajusté à ce nouveau plafond, sans suppression de sa vérification 413.

## Stockage et association
- Le fournisseur Blobs et son wrapper fetch sans cache sont réutilisés ; pas de seconde base. Octets dans des objets privés `message-files/attachment-UUID`, jamais dans le JSON global ni les réponses de liste.
- Identifiants et empreinte SHA-256 générés côté serveur. Le message conserve seulement nom, taille, type, empreinte et identifiant opaque.
- En local : mémoire du processus serveur, partagée entre ses routes ; arrêt/redémarrage ou autre instance = octets/messages non conservés ni partagés. Ce n’est pas une persistance disque.
- Hébergement : adaptateur Blobs implémenté, non recetté à distance. La capacité statique du SDK ne vaut pas preuve de persistance après redéploiement.
- Préparation des octets puis relecture/intégrité avant liaison au message. La mutation du document de messages conserve le CAS existant ; aucune transaction multi-objet prétendue.
- Les préparations hébergées sont suivies par `pendingMessageFiles` (identifiant/date uniquement) dans l’état existant. Une liaison confirmée retire ce marqueur dans le même CAS que le message.
- Un doublon concurrent renvoie le message initial et compense son nouvel objet inutilisé. Un conflit connu avant commit permet sa suppression. Une erreur réseau/CAS incertaine conserve l’objet privé et son marqueur : **ne pas supprimer un fichier potentiellement lié**.
- Les marqueurs restants doivent être rapprochés des références de messages lors d’une reprise technique autorisée, sans suppression automatique fondée sur l’âge. Aucun job de purge ni politique commerciale de conservation inventée. Ces objets non référencés n’ont pas d’endpoint public de récupération. En local, ils disparaissent avec le processus.

## Droits et téléchargement
Le contrôle coach existant a été extrait pour être partagé avec le téléchargement. Permissions serveur inchangées : coach propriétaire, sportif propriétaire, structure propriétaire distinguée d’un sportif de même adresse. Profil/affiliation et conversation restent vérifiés dans les branches d’envoi existantes. L’administrateur n’obtient pas implicitement un accès aux octets du chat.

GET `/api/messages/[id]/attachment` : session obligatoire, participant vérifié à chaque accès, absence ou non-autorisation = 404, non connecté = 401. Échec technique/intégrité = 503. Limite technique de téléchargements via le garde existant. Ni clé de stockage fournie par le client ni URL publique permanente.

Réponse : `private, no-store`, `nosniff`, CSP restrictive/sandbox, text/plain UTF-8, téléchargement forcé avec nom serveur fixe. Le bouton du navigateur vérifie taille et SHA-256 avant de proposer les octets avec le nom affiché traité comme du texte. Aucun HTML injecté ou aperçu de document actif.

## Interface et reprise
Le formulaire existant reçoit un sélecteur natif étiqueté, nom/état, retrait avant envoi et avertissement sur l’absence d’antivirus. Brouillon et fichier sont conservés après refus ou panne. Envoi explicite seulement ; aucun message externe.

La clé de répétition couvre cible/conversation, texte, réservation et empreinte/nom/taille/type du fichier ; l’identifiant de l’objet préparé n’est pas utilisé pour distinguer deux tentatives identiques. Une clé réutilisée avec un autre contenu est refusée.

Après réponse perdue ou succès malformé, les modifications et nouveaux envois sont bloqués jusqu’à relecture. Si le message concordant est retrouvé, confirmation sans nouvel envoi. Si la relecture échoue, verrou conservé. Si une lecture réussie ne retrouve pas l’envoi, seule une nouvelle tentative **explicite du même brouillon avec la même clé** est permise ; pas de PATCH/POST automatique. Réponses tardives ignorées après démontage/changement de vue coach. La sélection d’un nouveau fichier invalide une lecture client ancienne.

## Preuves et distinctions
Détails : `assets/message-file-flow-2026-10-19/verification.json`.

- Tests de contrats/dépendances locales : lecture dépassant la limite sans en-tête, UTF-8 et contenus refusés, borne exacte 64 Kio, octets manquants/corrompus, panne de stockage injectée, aucun message après échec, compensation d’un objet concurrent inutilisé.
- Parcours intégrés sur véritables endpoints locaux : envois concurrents dédupliqués, comparaison exacte des octets depuis des requêtes authentifiées distinctes, autre sportif/autre coach réellement inscrit/structure de même adresse/admin/non connecté refusés, contenu modifié avec même clé refusé.
- Playwright **local** : sélection/retrait, clavier et envoi, véritable enregistrement puis réponse réseau volontairement coupée, relecture sans doublon, téléchargement navigateur comparé, indisponibilité de téléchargement affichée. Refus serveur et panne de GET injectés pour vérifier conservation/verrou et nouvelle tentative ; ces injections ne sont pas présentées comme une panne réelle du fournisseur.
- Largeurs 320, 390, 768, 1440 : absence de débordement ; captures 390/1440 recadrées sur le formulaire, données synthétiques, examinées visuellement. Contrôles natifs ; langue du bouton fichier dépend du navigateur.
- Les premières campagnes ont révélé des erreurs de fixture/synchronisation et de motif d’interception de query string dans les nouveaux tests ; corrigées sans enlever les vérifications d’isolation, de statut ou de panne. Résultats finaux seuls retenus.

Pas de recette hébergée Blobs, antivirus, RLS Supabase, paiement, notification ou Netlify. Aucune validation V1/V2/V3 globale. Travail antérieur préservé et captures de régression régénérées exclues du commit.

## Livraison, retour arrière et prochaine action
Commit/push ciblés sur la branche existante, SHA distant comparé après livraison ; aucun déploiement. Retour arrière par revert ciblé après examen des messages possédant déjà des métadonnées de fichier : ne pas purger objets/historiques et ne pas utiliser un ancien code pour promettre leur disponibilité.

Prochaine action proposée : recette des chemins hébergés de préparation/CAS/compensation avec doubles de stockage contrôlés, puis recette distante uniquement avec autorisation et périmètre démo/budget établis. Ne pas étendre directement aux PDF/vidéos ni déclarer la persistance distante validée.

Résultats finaux : **8/8** nouveaux tests, **6/6** refus conservés et **26/26** régressions, soit **40 tests distincts réussis** ; deux cas API concernés ont en plus été rejoués avec l’assertion d’envoi étranger refusé. Build final, typage explicite, frontière client/serveur, configuration statique Netlify, Fil Rouge et diff --check conformes. Contrôles locaux uniquement.
