# Gestion des contenus de démonstration — 17 octobre 2026

Suite du catalogue livré dans 921047c. Source : Business Plan p.29 (gestion et suppression de contenus), p.33 et p.50 (droits et accès). La suppression physique est limitée aux brouillons/ressources retirées sans acquisition ; les ventes et accès historiques restent conservés. Cette restriction protège l’intégrité des accès dans la démo, sans inventer un droit de révocation commercial.

- Bouton propriétaire « Supprimer le brouillon » uniquement si non publié et aucune vente ; confirmation native et annulation possible. Le serveur revérifie auteur, version, publication et acquisitions dans la mutation CAS existante. Aucune suppression étrangère, publique ou acquise ; aucun droit implicitement accordé à l’admin.
- Téléchargements GET bornés à 30/minute par compte et clé client selon le garde existant, avant mutation du compteur. Réponse 429 après la limite ; aucun nouvel appel de stockage pour incrémenter lors du refus. Une requête HEAD contrôle les droits mais n’incrémente pas le compteur et n’envoie pas le corps. Le compteur désigne des demandes de téléchargement acceptées, pas une preuve de réception/lecture.
- Aucun changement de commission, achat réel, abonnement, nouvelle infrastructure ou déploiement. Sources TXT uniquement et limite mémoire locale inchangées.

Recette : API propriétaire/étranger/sportif, versions périmées, refus de supprimer une ressource publiée ou acquise, conservation de l’accès après retrait ; HEAD sans corps ni incrément, 30 téléchargements acceptés puis refus ; UI confirmation annulée puis acceptée, brouillon disparu ; parcours contenus et aperçus d’offres rejoués en desktop/mobile. Résultats et empreintes dans `assets/gestion-contenus-2026-10-17/verification.json`, captures du brouillon 390/1440. Le premier lot reste référencé pour les quatre largeurs et cas précédents.

Aucune recette Blobs/RLS distante ou mesure de charge réelle revendiquée. Limiteur en mémoire selon le mécanisme existant : ne garantit pas un quota distribué strict après redémarrage ou multi-instance. Les accès du contenu continuent d’être contrôlés indépendamment du limiteur. Retour arrière : revert ciblé de ce lot, aucune purge du DemoState.

Prochaine tranche : objectifs personnels et suivi de séances en démonstration d’après BP p.32/50. Une séance payée dont le créneau est passé ne prouve pas une présence réelle ; ne pas la présenter comme performance mesurée. Pas de données de santé réelles ou d’accès coach implicite.
