export type SportSlug =
  | "football"
  | "basketball"
  | "metiers-de-la-forme"
  | "sports-de-combat";

export const sportLinks: Array<{ label: string; slug: SportSlug }> = [
  { label: "Football", slug: "football" },
  { label: "Basketball", slug: "basketball" },
  { label: "Metiers de la forme", slug: "metiers-de-la-forme" },
  { label: "Sports de combat", slug: "sports-de-combat" },
];

export const profileSlides = [
  {
    name: "Thomas Dubois",
    meta: "Football • Paris",
    detail: "Specialiste preparation match • 12 ans d'experience",
    price: "50 EUR / seance",
    cta: "Voir le profil",
    image: "/design_assets/content_library/football/football-field-mentor.jpg",
  },
  {
    name: "Sarah Benali",
    meta: "Basketball • Lyon",
    detail: "Technique individuelle • Seances intensives",
    price: "65 EUR / seance",
    cta: "Decouvrir le coach",
    image: "/design_assets/content_library/basketball/basketball-training-athlete.jpg",
  },
  {
    name: "Julien Morel",
    meta: "Metiers de la forme • Lille",
    detail: "Remise en forme • Coaching progressif",
    price: "42 EUR / seance",
    cta: "Voir ses seances",
    image: "/design_assets/content_library/fitness/fitness-bench-trainer.jpg",
  },
  {
    name: "Ines Caron",
    meta: "Sports de combat • Marseille",
    detail: "Self-defense • Conditionnement physique",
    price: "70 EUR / seance",
    cta: "Reserver ce coach",
    image: "/design_assets/content_library/combat/combat-boxer-portrait.jpg",
  },
];

export const slotSlides = [
  {
    title: "Choisissez jusqu'a 3 creneaux",
    visual: "/design_assets/info_resa_accueil.jpeg",
    selection: "1 creneau selectionne",
    cta: "Proposer mes creneaux",
    slots: ["10:30", "15:00"],
  },
  {
    title: "Selectionnez un creneau prioritaire",
    visual: "/design_assets/content_library/basketball/basketball-shooting-court.jpg",
    selection: "2 creneaux selectionnes",
    cta: "Envoyer mes disponibilites",
    slots: ["08:00", "18:30"],
  },
  {
    title: "Ajoutez un creneau de secours",
    visual: "/design_assets/content_library/fitness/fitness-coach-plank.jpg",
    selection: "3 creneaux selectionnes",
    cta: "Valider ma selection",
    slots: ["12:15", "19:00"],
  },
  {
    title: "Validez vos disponibilites",
    visual: "/design_assets/content_library/combat/combat-muay-thai-kick.jpg",
    selection: "Pret a envoyer",
    cta: "Continuer",
    slots: ["09:45", "17:15"],
  },
];

export const paymentSlides = [
  {
    title: "Thomas Dubois • Football",
    date: "Mer. 26 Mars • 14:00",
    detail: "Seance 1h30 • Paris",
    total: "62 EUR",
  },
  {
    title: "Sarah Benali • Basketball",
    date: "Jeu. 28 Mars • 18:30",
    detail: "Seance 1h00 • Lyon",
    total: "74 EUR",
  },
  {
    title: "Julien Morel • Metiers de la forme",
    date: "Ven. 29 Mars • 08:00",
    detail: "Seance 45 min • Lille",
    total: "48 EUR",
  },
  {
    title: "Ines Caron • Sports de combat",
    date: "Sam. 30 Mars • 12:15",
    detail: "Seance 1h15 • Marseille",
    total: "79 EUR",
  },
];

export const metrics = [
  { value: "500+", label: "Coachs certifies" },
  { value: "10K+", label: "Reservations" },
  { value: "4.9/5", label: "Note moyenne" },
];

export const insights = [
  { value: "+ 50%", copy: "de frequence sur les reservations de seances prises en ligne" },
  { value: "4x", copy: "moins d'oublis avec les rappels automatiques des seances" },
  {
    value: "50%",
    copy: "des reservations prises en dehors des horaires d'ouverture",
    featured: true,
  },
  { value: "+50 000", copy: "seances et demandes de coaching gerees sur la plateforme" },
  { value: "5 RDV", copy: "reserves toutes les secondes sur les creneaux les plus demandes" },
  { value: "> 5 millions EUR", copy: "de reservations sportives generees pour les coachs partenaires" },
];

export const localeColumns = [
  {
    title: "Football",
    copy: "Nos coachs football populaires en France",
    slug: "football" as SportSlug,
  },
  {
    title: "Basketball",
    copy: "Nos coachs basketball populaires en France",
    slug: "basketball" as SportSlug,
  },
  {
    title: "Metiers de la forme",
    copy: "Nos coachs forme populaires en France",
    slug: "metiers-de-la-forme" as SportSlug,
  },
  {
    title: "Sports de combat",
    copy: "Nos coachs combat populaires en France",
    slug: "sports-de-combat" as SportSlug,
  },
];

export const locales = [
  "Bordeaux",
  "Lille",
  "Lyon",
  "Marseille",
  "Montpellier",
  "Nantes",
  "Nice",
  "Paris",
  "Strasbourg",
  "Toulouse",
];

export const faqItems = [
  {
    question: "Qu'est-ce que GetYourMentor ?",
    answer:
      "GetYourMentor est une plateforme qui aide les sportifs a trouver un coach, envoyer une demande de reservation et payer seulement apres validation du coach.",
  },
  {
    question: "Comment reserver une seance sur GetYourMentor ?",
    answer:
      "Vous choisissez un coach, une seance, puis vous proposez un a trois creneaux. Le coach accepte ou refuse avant toute etape de paiement.",
  },
  {
    question: "Est-ce que je dois payer en ligne sur GetYourMentor ?",
    answer:
      "Oui, mais uniquement une fois que le coach a valide votre demande. Aucun paiement n'est declenche avant acceptation.",
  },
  {
    question: "Comment gerer mes demandes et mes reservations ?",
    answer:
      "Depuis votre espace compte, vous pouvez consulter vos demandes envoyees, vos validations, vos reservations confirmees et vos informations de paiement.",
  },
  {
    question: "Comment devenir coach partenaire sur GetYourMentor ?",
    answer:
      "Vous pouvez rejoindre le reseau en creant votre compte professionnel puis en completant votre profil, vos sports, vos disponibilites et vos conditions de seance.",
  },
];
