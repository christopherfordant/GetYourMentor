# Catalogue et accès aux contenus — 17 octobre 2026

## Sources et périmètre
Business Plan, pages physiques 29–30 : déposer/supprimer, formats PDF/vidéo/photo/audio, abonnement exclusif, suivi ventes/revenus/téléchargements ; p.33 : boutique interne et achat/téléchargement depuis le compte ; p.35 : commission contenus 20 %, exemple 100/80/20 ; p.50 : marketplace et droits. Le texte p.35 place aussi la création parmi les bénéfices Premium et comporte une formulation ambiguë sur les coachs concernés. L’aperçu `/offres` n’accorde aucun droit commercial : cette tranche est une simulation isolée, ouverte aux profils coachs de démonstration, sans activation Premium. Aucun abonnement sportif au contenu inventé.

Audit : aucune boutique, bibliothèque ou vente de contenus trouvée dans les routes/services avant ce lot ; `public/design_assets/content_library` est une collection d’images de design, pas ce module. Réutilisation du DemoState et de sa mutation CAS existante ; deux champs facultatifs, aucun autre moteur de paiement/stockage, dépendance ou migration Supabase. `demoContentsEnabled` reprend la garde d’isolation déjà utilisée pour les aperçus d’offres.

## Tranche réellement réalisée
- Maquette HTML avant implémentation : `maquettes/contenus-demo/index.html`, captures 390/1440 et absence de débordement aux quatre largeurs prévues.
- `/contenus` : catalogue, brouillons de l’auteur, bibliothèque, lecture et téléchargement TXT. Lien dans le compte, aucun changement de navigation du header. Métadonnées noindex/nofollow.
- Coach : création de texte fictif et prix fictif choisi explicitement (bornes techniques 0,01 à 10 000 EUR, pas une grille commerciale), confirmation de démonstration ; brouillon privé. Profil validé serveur requis pour publier. Retrait de la vente conserve le texte et les accès déjà acquis ; pas de suppression physique d’une ressource vendue.
- Sportif : confirmation explicite d’achat simulé, vérification serveur de version/prix, reçu historique figé à 20 % contenus, centimes entiers et arrondi arithmétique. Commission séances administrable et historiques inchangés. Achat répété/concurrent retourne l’accès existant sans nouvelle vente ; aucune commande externe, débit, transfert ou notification.
- Propriété dérivée de la session, jamais du formulaire. Catalogue sans texte privé, email auteur/acheteur, identifiant de requête ou propriétaire interne. Ni structure ni admin ne reçoivent un accès implicite au texte privé ; aucun droit administratif documentaire non établi ajouté.
- Corps complet réservé à l’auteur ou au compte acheteur, y compris après retrait. Download en texte brut avec Content-Disposition attachment, nosniff et private/no-store ; pas de HTML exécutable, URL distante ou téléversement de fichier arbitraire.
- État vide/chargement/erreur, actualisation, formulaires natifs et clavier. Création avec identifiant conservé si réponse réseau perdue ; réemploi avec autre contenu rejeté. Mutations de publication versionnées : après réponse ambiguë, actualiser au lieu de supposer un échec.
- Auteur : nombres de ventes fictives, revenu net simulé, demandes de téléchargement. Ce dernier compteur mesure les réponses de téléchargement demandées, pas la lecture, la réception intégrale ou des personnes uniques.

## Limites explicites
TXT uniquement, pas PDF/vidéo/photo/audio ni antivirus/stockage binaire. Pas de modification du texte vendu, abonnement exclusif, packs, remboursement de contenus, licence d’exploitation commerciale, fiscalité ou transfert réel. Retrait réversible, pas destruction des acquisitions historiques. Pas de conseil médical généré ni ressources sportives prétendues authentiques. La bibliothèque est personnelle au compte ; aucune invitation de tiers.

Mémoire locale volatile au redémarrage ; champs Blobs partagés ajoutés mais aucune recette distante de cette tranche, aucun déploiement ni consommation cloud intentionnelle. La preuve CAS locale du SDK du lot précédent reste applicable à sa version ; elle ne démontre pas la persistance distante du nouveau module. RLS distante, Stripe, appareils physiques, charge et conformité WCAG exhaustive non certifiés.

REA non relancé : aucune nouvelle question externe justifiée ; son rôle d’investigation externe autorisée reste distinct de Playwright. MCP a ouvert `/contenus` ; unique erreur console observée : favicon.ico 404 préexistant. Capture MCP en timeout, ne pas la présenter comme réussie. Captures et parcours issus de Playwright local existant.

## Vérifications et livraison
Résultats précis et empreintes dans `assets/contenus-demo-2026-10-17/verification.json`. Contrôles fonctionnels : rôles, brouillon non public, propriété, consentement, prix forgé, concurrence/doublons, téléchargement protégé, retrait, version périmée, isolation et commission de séances inchangée. Recettes UI 320/390/768/1440, création après réponse perdue, clavier, bibliothèque persistante sur rechargement. Build/typage et régressions accueil/offres/commission selon preuves finales.

Retour arrière : revert ciblé du commit de ce lot sur la branche de travail, après conservation des travaux ultérieurs. Les champs facultatifs du DemoState n’imposent pas de migration destructive ; ne pas effacer l’état partagé pour annuler le code. Aucun reset/force-push/déploiement automatique.

Suite : consolider retrait/suppression de brouillons et règles d’accès, puis suivi des objectifs/progrès selon les sources et dépendances. V1/V2/V3 restent incomplets.
