export type MigrationPage = {
  id: string;
  label: string;
  source: string;
  route: string;
  status: "A faire" | "En cours" | "Valide";
};

export const migrationPages: MigrationPage[] = [
  {
    id: "accueil",
    label: "Accueil",
    source: "prototype-site/accueil.html",
    route: "/",
    status: "En cours",
  },
  {
    id: "recherche",
    label: "Recherche coachs",
    source: "prototype-site/recherche-coachs.html",
    route: "/recherche",
    status: "A faire",
  },
  {
    id: "selection",
    label: "Selection coachs",
    source: "prototype-site/selection-coachs.html",
    route: "/coachs",
    status: "A faire",
  },
  {
    id: "profil",
    label: "Reserver seance / profil coach",
    source: "prototype-site/reserver-seance.html",
    route: "/coach/[slug]",
    status: "A faire",
  },
  {
    id: "creneau",
    label: "Choix coach creneau",
    source: "prototype-site/choix-coach-creneau.html",
    route: "/reservation/creneau",
    status: "A faire",
  },
  {
    id: "recap",
    label: "Recapitulatif reservation",
    source: "prototype-site/recapitulatif-reservation.html",
    route: "/reservation/recapitulatif",
    status: "A faire",
  },
  {
    id: "compte",
    label: "Compte / dashboards",
    source: "prototype-site/compte.html",
    route: "/compte",
    status: "A faire",
  },
  {
    id: "paiement",
    label: "Paiement",
    source: "prototype-site/paiement.html",
    route: "/paiement",
    status: "A faire",
  },
  {
    id: "club",
    label: "Inscription club",
    source: "prototype-site/inscription-club.html",
    route: "/inscription/club",
    status: "A faire",
  },
];
