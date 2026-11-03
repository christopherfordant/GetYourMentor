# Footer compact : quatre disciplines et flèche — 3 novembre 2026

Correction explicite de l'intention utilisateur : ne plus afficher les quatorze sports dans la rubrique. Les quatre premières disciplines du catalogue sont visibles par défaut, dans une colonne comme les autres rubriques. Les dix suivantes restent disponibles dans un panneau natif `details/summary`, fermé au chargement.

La petite flèche est placée à droite du titre « Disciplines », sans ajouter de cinquième ligne en mode fermé. Son nom accessible précise le nombre de disciplines supplémentaires ; titre au survol et chevron inversé à l'ouverture. L'expansion se fait dans le flux du footer, sans superposition. Repli possible par clic, Entrée ou Espace. Le contrôle fonctionne sans JavaScript ; aucun service, bibliothèque ou compte supplémentaire.

Les quatorze destinations et leur ordre sont conservés ; les liens masqués ne participent pas à la navigation Tab tant que le panneau est fermé. Les autres rubriques, l'éventail et les portes 2,2 secondes sont inchangés. Cette décision remplace la grille à deux colonnes de la livraison `e1162dd`, conservée dans l'historique.

Fichiers : `gym-next/components/SiteFooter.tsx`, `footer-disciplines.module.css`. Contrôles et captures : `assets/footer-fold-2026-11-03/`. Checkout de recette existant `C:/Users/cashe/Documents/GYM-fan-20261103`, serveur arrêté avant reconstruction ; aperçu http://127.0.0.1:3004/ (footer en bas), relance `node delivery-private/start-preview.cjs`.

Aucun déploiement Netlify. Modifications antérieures non vérifiées préservées ; push soumis à la divergence distante connue, sans fusion ou force-push autorisés.

## Contrôles exécutés

Build optimisé avec typage PASS ; frontière client et configuration Netlify PASS. Sur Chromium à 1440/768/390/320 : quatre liens visibles au départ, quatorze après clic, repli par Entrée, ouverture/repli par Espace, liens cachés ignorés par Tab, aucun débordement horizontal. Ordre et quatorze couples libellé/destination comparés à la version initiale : identiques. Captures fermées/ouvertes examinées sur ordinateur et mobile ; colonnes homogènes en mode fermé, expansion dans le flux confirmée. Les destinations n'ont pas changé : les quatorze HTTP 200 du contrôle précédent sont des preuves antérieures réutilisées, pas un nouveau crawl.

Contrôle fil rouge avant push PASS, sorties préexistantes sauvegardées/restaurées octet pour octet. Pas de suite métier complète pour ce changement isolé. Safari/Firefox et téléphone physique non testés. Serveur local final session 62808, port 3004, base de livraison précédente `e1162dd`.
