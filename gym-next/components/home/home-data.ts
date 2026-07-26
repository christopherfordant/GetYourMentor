export type SportSlug =
  | "football"
  | "basketball"
  | "metiers-de-la-forme"
  | "sports-de-combat";

export const sportLinks: Array<{ label: string; slug: SportSlug }> = [
  { label: "Football", slug: "football" },
  { label: "Basketball", slug: "basketball" },
  { label: "Métiers de la forme", slug: "metiers-de-la-forme" },
  { label: "Sports de combat", slug: "sports-de-combat" },
];

export const profileSlides = [
  {
    name: "Thomas Dubois",
    meta: "Football - Paris",
    detail: "Spécialiste préparation match - 12 ans d'expérience",
    price: "50 EUR / séance",
    cta: "Voir le profil",
    image: "/design_assets/content_library/football/football-field-mentor.jpg",
  },
  {
    name: "Sarah Benali",
    meta: "Basketball - Lyon",
    detail: "Technique individuelle - Séances intensives",
    price: "65 EUR / séance",
    cta: "Découvrir le coach",
    image: "/design_assets/content_library/basketball/basketball-training-athlete.jpg",
  },
  {
    name: "Julien Morel",
    meta: "Métiers de la forme - Lille",
    detail: "Remise en forme - Coaching progressif",
    price: "42 EUR / séance",
    cta: "Voir ses séances",
    image: "/design_assets/content_library/fitness/fitness-bench-trainer.jpg",
  },
  {
    name: "Ines Caron",
    meta: "Sports de combat - Marseille",
    detail: "Self-defense - Conditionnement physique",
    price: "70 EUR / séance",
    cta: "Réserver ce coach",
    image: "/design_assets/content_library/combat/combat-boxer-portrait.jpg",
  },
];

export const slotSlides = [
  {
    title: "Choisissez jusqu'à 3 créneaux",
    visual: "/design_assets/info_resa_accueil.jpeg",
    selection: "1 créneau sélectionné",
    cta: "Proposer mes créneaux",
    slots: ["10:30", "15:00"],
  },
  {
    title: "Sélectionnez un créneau prioritaire",
    visual: "/design_assets/content_library/basketball/basketball-shooting-court.jpg",
    selection: "2 créneaux sélectionnés",
    cta: "Envoyer mes disponibilités",
    slots: ["08:00", "18:30"],
  },
  {
    title: "Ajoutez un créneau de secours",
    visual: "/design_assets/content_library/fitness/fitness-coach-plank.jpg",
    selection: "3 créneaux sélectionnés",
    cta: "Valider ma sélection",
    slots: ["12:15", "19:00"],
  },
  {
    title: "Validez vos disponibilités",
    visual: "/design_assets/content_library/combat/combat-muay-thai-kick.jpg",
    selection: "Prêt à envoyer",
    cta: "Continuer",
    slots: ["09:45", "17:15"],
  },
];

export const paymentSlides = [
  {
    title: "Thomas Dubois - Football",
    date: "Mer. 26 mars - 14:00",
    detail: "Séance 1h30 - Paris",
    total: "62 EUR",
  },
  {
    title: "Sarah Benali - Basketball",
    date: "Jeu. 28 mars - 18:30",
    detail: "Séance 1h00 - Lyon",
    total: "74 EUR",
  },
  {
    title: "Julien Morel - Métiers de la forme",
    date: "Ven. 29 mars - 08:00",
    detail: "Séance 45 min - Lille",
    total: "48 EUR",
  },
  {
    title: "Ines Caron - Sports de combat",
    date: "Sam. 30 mars - 12:15",
    detail: "Séance 1h15 - Marseille",
    total: "79 EUR",
  },
];

export const metrics = [
  { value: "500+", label: "Coachs certifiés" },
  { value: "10K+", label: "Réservations" },
  { value: "4.9/5", label: "Note moyenne" },
];

export const insights = [
  { value: "+ 50%", copy: "de fréquence sur les réservations de séances prises en ligne" },
  { value: "4x", copy: "moins d'oublis avec les rappels automatiques des séances" },
  {
    value: "50%",
    copy: "des réservations prises en dehors des horaires d'ouverture",
    featured: true,
  },
  { value: "+50 000", copy: "séances et demandes de coaching gérées sur la plateforme" },
  { value: "5 RDV", copy: "réservés toutes les secondes sur les créneaux les plus demandés" },
  { value: "> 5 millions EUR", copy: "de réservations sportives générées pour les coachs partenaires" },
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
    title: "Métiers de la forme",
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
      "GetYourMentor est une plateforme qui aide les sportifs à trouver un coach, envoyer une demande de réservation et payer seulement après validation du coach.",
  },
  {
    question: "Comment réserver une séance sur GetYourMentor ?",
    answer:
      "Vous choisissez un coach, une séance, puis vous proposez un à trois créneaux. Le coach accepte ou refuse avant toute étape de paiement.",
  },
  {
    question: "Est-ce que je dois payer en ligne sur GetYourMentor ?",
    answer:
      "Oui, mais uniquement une fois que le coach a validé votre demande. Aucun paiement n'est déclenché avant acceptation.",
  },
  {
    question: "Comment gérer mes demandes et mes réservations ?",
    answer:
      "Depuis votre espace compte, vous pouvez consulter vos demandes envoyées, vos validations, vos réservations confirmées et vos informations de paiement.",
  },
  {
    question: "Comment devenir coach partenaire sur GetYourMentor ?",
    answer:
      "Vous pouvez rejoindre le réseau en créant votre compte professionnel puis en complétant votre profil, vos sports, vos disponibilités et vos conditions de séance.",
  },
];
