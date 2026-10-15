## Recette active — accueil éditorial et migrations suivantes

Référence : maquette HTML validée dans son ensemble ; les références Emergent et les décisions de recoloration restent historiques.

Largeurs : 320, 390, 430, 621, 768, 900, 1024, 1280, 1440 px. Mesure : scrollWidth <= clientWidth, sans couper globalement le contenu. Vérifier zoom/reflow, textes longs, clavier/tactile et reduced-motion.

Accueil : six sections de la maquette, bande de valeurs, image/étiquette, trois profils, trois panneaux, trois offres, feuille de route, sources adaptées, FAQ existante, footer et navigation mobile. Vérifier tous les onglets, les cinq catégories de dialogues, Échap/retour de focus et la palette violette fixe, y compris après rechargement. Aucun contrôle de changement de coloris ne doit apparaître.

Arbitrage footer actuel : tester à 320, 390, 768 et 1440 px la zone d’utilitaires en tête de footer, remplaçant la position après footer. Mesurer le centrage SVG horizontal/vertical, les cibles 44 px, l’absence de recouvrement avec les liens et de débordement. Tester une page courte sur grand viewport, une page longue, le clavier, la réouverture du consentement et le retour de focus. Vérifier les vrais liens sociaux lorsqu’ils sont fournis ; aucun `#instagram`/`#facebook` fictif. Vérifier l’enveloppe sur la connexion email et Google désactivé avec son icône à gauche et une explication, sans OAuth simulé.

Découverte : recherche, annuaire et fiche doivent employer les typographies de l’accueil, la palette fixe et un header partagé aux sept destinations inchangées. Tester les neuf largeurs, les quatre disciplines, ville/retour arrière, tri, budget/réinitialisation, identité/prix/avis du catalogue, passage vers `/creneau`, sections du profil, état de chargement/erreur, descriptions/canonical et ancres du footer. Les préférences cookies restent accessibles après le footer sans se superposer aux actions ; tester réouverture et retour en haut à 320 px. Vérifier que le planning indicatif montre tous les jours sans débordement de page. Les profils/avis de test portent une mention de démonstration. Ne pas confondre ces tests avec une certification RLS distante, un audit SEO exhaustif ou une recette physique mobile.

Liens : CTA de recherche, quatre disciplines, Mon compte accessible sur mobile, CGU/CGV/confidentialité et ancres historiques parcours/tarifs/FAQ. Préférence de langue maintenue dans le footer.

Les outils et offres prévus sont explicitement descriptifs : aucun POST commercial lors des aperçus et aucune activation Premium. Tester les cookies ouverts/fermés et leur séparation de la barre mobile. Contrôler un seul header et un seul footer.

Captures Playwright MCP : source et application aux mêmes dimensions ; conserver aussi les panneaux coach/structure, une offre ouverte et les grands écrans mobiles. Une preuve de build doit porter autant que possible sur le commit isolé, pas seulement sur un arbre comportant des correctifs antérieurs.

### Historique de recette

# Validation visuelle

## Viewports obligatoires

- 390 × 844
- 430 × 932
- 768 × 1024
- 1280 × 800
- 1440 × 900

## États obligatoires

- chargement stabilisé en haut de page;
- header initial et après scroll;
- menu langue fermé/ouvert/sélection/Échap/clic extérieur;
- hero initial, champs et CTA;
- parcours animé avant, pendant et après révélation;
- reduced-motion;
- absence de débordement horizontal;
- un seul header et un seul footer.

## Critères bloquants

- erreur console non expliquée;
- route ou interaction métier cassée;
- clic intercepté par un wrapper décoratif;
- débordement horizontal mobile;
- transformation 3D du parcours;
- snapshot pris avec `scrollY` non nul quand l'état initial est requis.
