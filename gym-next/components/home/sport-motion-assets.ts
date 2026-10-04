export type MotionSport = "football" | "basketball" | "fitness" | "combat";

export type MotionAsset = {
  id: string;
  sport: MotionSport;
  src: string;
  alt: string;
};

export const motionAssets: MotionAsset[] = [
  { id: "football-ball", sport: "football", src: "/design_assets/motion/football-ball-realistic.png", alt: "Ballon de football" },
  { id: "football-boots", sport: "football", src: "/design_assets/motion/football-boots-realistic.png", alt: "Chaussures de football" },
  { id: "football-cone", sport: "football", src: "/design_assets/motion/football-cone-realistic.png", alt: "Cône d’entraînement de football" },
  { id: "basketball-ball", sport: "basketball", src: "/design_assets/motion/basketball-realistic.png", alt: "Ballon de basketball" },
  { id: "basketball-hoop", sport: "basketball", src: "/design_assets/motion/basketball-hoop-realistic.png", alt: "Panier de basketball" },
  { id: "basketball-shoes", sport: "basketball", src: "/design_assets/motion/basketball-shoes-realistic.png", alt: "Chaussures de basketball" },
  { id: "fitness-dumbbell", sport: "fitness", src: "/design_assets/motion/dumbbell-realistic.png", alt: "Haltère de fitness" },
  { id: "fitness-kettlebell", sport: "fitness", src: "/design_assets/motion/kettlebell-realistic.png", alt: "Kettlebell de fitness" },
  { id: "fitness-band", sport: "fitness", src: "/design_assets/motion/resistance-band-realistic.png", alt: "Élastique de résistance" },
  { id: "combat-glove", sport: "combat", src: "/design_assets/motion/boxing-glove-realistic.png", alt: "Gant de boxe" },
  { id: "combat-mitt", sport: "combat", src: "/design_assets/motion/focus-mitt-realistic.png", alt: "Pattes d’ours de combat" },
  { id: "combat-shin-guards", sport: "combat", src: "/design_assets/motion/shin-guards-realistic.png", alt: "Protège-tibias de combat" },
];
