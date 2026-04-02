"use client";

import { useMemo, useState } from "react";

type SelectionCoachsLegacyPageProps = {
  legacyStyles: string;
  sport?: string;
  city?: string;
};

type CoachEntry = {
  name: string;
  address: string;
  meta: string;
  morning: string[];
  afternoon: string[];
  cta: string;
};

const directoryDictionary = {
  football: {
    name: "Football",
    chips: ["Coach individuel", "Prparation match", "Centre indoor"],
    getTitle: () => "Slectionnez un coach de football",
    getSubtitle: (city: string) => `Les meilleurs coachs  proximit de ${city} : rservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Thomas Dubois",
        address: `5 Rue du Stade, ${city}`,
        meta: "4.9 (33 avis)  Technique / Tactique / U16",
        morning: ["Jeu. 26"],
        afternoon: ["Ven. 27"],
        cta: "Prendre RDV",
      },
      {
        name: "Mehdi Rahal",
        address: `7 Avenue des Appuis, ${city}`,
        meta: "4.8 (19 avis)  Performance / Retour blessure",
        morning: ["Lun. 30"],
        afternoon: ["Mar. 31"],
        cta: "Voir le coach",
      },
    ],
  },
  basketball: {
    name: "Basketball",
    chips: ["Shooting", "Dfense", "Condition physique"],
    getTitle: () => "Slectionnez un coach de basketball",
    getSubtitle: (city: string) => `Les meilleurs coachs  proximit de ${city} : rservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Sarah Benali",
        address: `12 Rue des Arceaux, ${city}`,
        meta: "5.0 (21 avis)  Shooting / Dfense / U18",
        morning: ["Jeu. 26"],
        afternoon: ["Sam. 28"],
        cta: "Prendre RDV",
      },
      {
        name: "Nolan Vasseur",
        address: `18 Quai Central, ${city}`,
        meta: "4.7 (12 avis)  Junior / Pro / Analyse vido",
        morning: ["Ven. 27"],
        afternoon: ["Lun. 30"],
        cta: "Voir le coach",
      },
    ],
  },
  "metiers-de-la-forme": {
    name: "Mtiers de la forme",
    chips: ["Coach individuel", "Salle premium", "Programme forme"],
    getTitle: () => "Slectionnez un coach de la forme",
    getSubtitle: (city: string) =>
      `Les meilleurs coachs et studios aux alentours de ${city} : rservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Studio Form Marseille",
        address: `5 Rue de la Forme, ${city}`,
        meta: "5 (33 avis)  Individuel / Small group",
        morning: ["Jeu. 26"],
        afternoon: ["Jeu. 26"],
        cta: "Prendre RDV",
      },
      {
        name: "Kenza Training Club",
        address: `7 Rue de la Rpublique, ${city}`,
        meta: "4.9 (189 avis)  Club / Transformation",
        morning: ["Ven. 27"],
        afternoon: ["Sam. 28"],
        cta: "Prendre RDV",
      },
      {
        name: "Pulse Mobility",
        address: `22 Place du Centre, ${city}`,
        meta: "4.8 (41 avis)  Visio / Mobilit",
        morning: ["Lun. 30"],
        afternoon: ["Mar. 31"],
        cta: "Voir le coach",
      },
    ],
  },
  "sports-de-combat": {
    name: "Sports de combat",
    chips: ["Boxe", "MMA", "Self-dfense"],
    getTitle: () => "Slectionnez un coach de sports de combat",
    getSubtitle: (city: string) => `Les meilleurs coachs  proximit de ${city} : rservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Ines Caron Fight Club",
        address: `4 Boulevard Arena, ${city}`,
        meta: "4.9 (26 avis)  Boxe / Self-dfense / Dbuta",
        morning: ["Jeu. 26"],
        afternoon: ["Ven. 27"],
        cta: "Prendre RDV",
      },
      {
        name: "Combat Lab",
        address: `14 Rue des Champions, ${city}`,
        meta: "4.8 (17 avis)  MMA / Cardio boxing / Confirm",
        morning: ["Sam. 28"],
        afternoon: ["Lun. 30"],
        cta: "Voir le coach",
      },
    ],
  },
} as const;

const normalize = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const inferSportSlug = (value = "") => {
  const normalized = normalize(value);

  if (normalized.includes("basket")) return "basketball";
  if (normalized.includes("combat") || normalized.includes("boxe") || normalized.includes("mma")) {
    return "sports-de-combat";
  }
  if (
    normalized.includes("forme") ||
    normalized.includes("fitness") ||
    normalized.includes("pilates") ||
    normalized.includes("muscu")
  ) {
    return "metiers-de-la-forme";
  }

  return "football";
};

const buildPath = (page: string, paramsObject: Record<string, string>) => {
  const search = new URLSearchParams();

  Object.entries(paramsObject).forEach(([key, value]) => {
    if (`${value}`.trim() !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${page}?${query}` : page;
};

const navigateToSearch = (sportValue: string, cityValue: string) => {
  const sportSlug = inferSportSlug(sportValue);
  const city = cityValue.trim();

  if (city) {
    window.location.href = buildPath("./selection-coachs.html", { sport: sportSlug, city });
    return;
  }

  window.location.href = buildPath("./recherche-coachs.html", { sport: sportSlug });
};

function DirectoryHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link brand-name-dark" href="./accueil.html">
          GetYourMentor
        </a>
      </div>

      <nav className="sports-nav sports-nav-dark" aria-label="Sports">
        <a className="sport-link sport-link-dark" href="./recherche-coachs.html?sport=football">
          Football
        </a>
        <a className="sport-link sport-link-dark" href="./recherche-coachs.html?sport=basketball">
          Basketball
        </a>
        <a className="sport-link sport-link-dark" href="./recherche-coachs.html?sport=metiers-de-la-forme">
          Metiers de la forme
        </a>
        <a className="sport-link sport-link-dark" href="./recherche-coachs.html?sport=sports-de-combat">
          Sports de combat
        </a>
      </nav>

      <div className="topbar-actions">
        <a className="topbar-link topbar-link-dark" href="./devenir-partenaire.html">
          Je suis un professionnel du sport
        </a>
        <a className="account-button" href="./compte.html">
          <span className="account-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Mon compte</span>
        </a>
      </div>
    </header>
  );
}

function DirectoryToolbar({
  sportLabel,
  city,
}: {
  sportLabel: string;
  city: string;
}) {
  const [sportInput, setSportInput] = useState(sportLabel);
  const [cityInput, setCityInput] = useState(city);

  return (
    <section className="coach-directory-toolbar">
      <form
        className="coach-directory-search"
        aria-label="Recherche coach"
        data-directory-form
        onSubmit={(event) => {
          event.preventDefault();
          navigateToSearch(sportInput, cityInput);
        }}
      >
        <label className="directory-field">
          <span>Sport</span>
          <input
            type="text"
            data-directory-sport-input
            value={sportInput}
            onChange={(event) => setSportInput(event.target.value)}
          />
        </label>
        <label className="directory-field">
          <span>Ville</span>
          <input
            type="text"
            data-directory-city-input
            value={cityInput}
            onChange={(event) => setCityInput(event.target.value)}
          />
        </label>
        <label className="directory-field">
          <span>Disponibilit&eacute;</span>
          <input type="text" value="&Agrave; tout moment" data-directory-availability-input readOnly />
        </label>
        <button className="directory-search-button" type="submit" aria-label="Rechercher">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M20 20 15.5 15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </form>

      <div className="directory-chip-row" aria-label="Filtres">
        <button className="directory-chip directory-chip-filter" type="button">
          Filtres
        </button>
        <button className="directory-chip directory-chip-secondary" type="button">
          Trier par :
        </button>
        <button className="directory-chip directory-chip-secondary" type="button">
          Avis :
        </button>
      </div>
    </section>
  );
}

function CoachResultCard({
  coach,
  sportSlug,
  city,
  index,
}: {
  coach: CoachEntry;
  sportSlug: string;
  city: string;
  index: number;
}) {
  const detailsLink = buildPath("./reserver-seance.html", {
    sport: sportSlug,
    city,
    coach: coach.name,
  });

  const dayMap = new Map<string, { day: string; periods: string[] }>();

  coach.morning.forEach((slot) => {
    const existing = dayMap.get(slot) || { day: slot, periods: [] };
    existing.periods.push("Matin");
    dayMap.set(slot, existing);
  });

  coach.afternoon.forEach((slot) => {
    const existing = dayMap.get(slot) || { day: slot, periods: [] };
    existing.periods.push("Apres-midi");
    dayMap.set(slot, existing);
  });

  return (
    <article className={`coach-result-card coach-result-card--${sportSlug}`}>
      <div
        className={`coach-result-media coach-result-media--${sportSlug} coach-result-media--${sportSlug}-${index + 1}`}
      ></div>
      <div className="coach-result-body">
        <div className="coach-result-top">
          <h2>{coach.name}</h2>
          <div className="coach-result-address">{coach.address}</div>
          <div className="coach-result-meta">{coach.meta}</div>
        </div>
        <div className="coach-result-slots">
          {Array.from(dayMap.values()).map((entry) => (
            <div className="coach-day-card" key={`${coach.name}-${entry.day}`}>
              <strong>{entry.day}</strong>
              <div className="coach-day-periods">
                {entry.periods.map((period) => (
                  <span className="coach-day-period" key={`${entry.day}-${period}`}>
                    {period}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="coach-result-footer">
          <a className="coach-more-link" href={detailsLink}>
            Plus d'informations
          </a>
          <a className="coach-book-button" href={detailsLink}>
            {coach.cta}
          </a>
        </div>
      </div>
    </article>
  );
}

function DirectoryContent({
  sportSlug,
  city,
  title,
  subtitle,
  coaches,
}: {
  sportSlug: string;
  city: string;
  title: string;
  subtitle: string;
  coaches: CoachEntry[];
}) {
  return (
    <section className="coach-directory-content">
      <div className="coach-directory-list">
        <header className="directory-heading">
          <h1 data-directory-title>{title}</h1>
          <p data-directory-subtitle>{subtitle}</p>
        </header>

        <div className="coach-results" data-coach-results>
          {coaches.map((coach, index) => (
            <CoachResultCard
              key={`${coach.name}-${index}`}
              coach={coach}
              sportSlug={sportSlug}
              city={city}
              index={index}
            />
          ))}
        </div>
      </div>

      <aside className="coach-directory-map" aria-label="Carte des coachs">
        <div className="coach-map-panel">
          <div className="coach-map-grid"></div>
          <div className="coach-map-water"></div>
          <span className="map-pin map-pin-1"></span>
          <span className="map-pin map-pin-2"></span>
          <span className="map-pin map-pin-3"></span>
          <span className="map-pin map-pin-4"></span>
          <span className="map-pin map-pin-5"></span>
        </div>
      </aside>
    </section>
  );
}

function DirectoryFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">GETYOURMENTOR</div>
      <p>Trouvez votre coach sportif en quelques clics</p>
      <nav className="footer-links" aria-label="Liens l&eacute;gaux">
        <a href="./accueil.html#faq-title">CGV</a>
        <a href="./accueil.html#faq-title">CGU</a>
        <a href="./accueil.html#faq-title">Politique de confidentialit&eacute;</a>
        <a href="./accueil.html#faq-title">Mentions l&eacute;gales</a>
      </nav>
      <small>&copy; 2026 GetYourMentor. Tous droits r&eacute;serv&eacute;s.</small>
    </footer>
  );
}

export function SelectionCoachsLegacyPage({
  legacyStyles,
  sport,
  city,
}: SelectionCoachsLegacyPageProps) {
  const sportSlug = useMemo(() => {
    if (sport && sport in directoryDictionary) {
      return sport as keyof typeof directoryDictionary;
    }

    return "football";
  }, [sport]);

  const currentDirectory = directoryDictionary[sportSlug];
  const cityValue = city || "Paris";

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell coach-profile-shell">
        <DirectoryHeader />
        <main className="coach-directory-page" data-coach-directory-page>
          <DirectoryToolbar sportLabel={currentDirectory.name} city={cityValue} />
          <DirectoryContent
            sportSlug={sportSlug}
            city={cityValue}
            title={currentDirectory.getTitle()}
            subtitle={currentDirectory.getSubtitle(cityValue)}
            coaches={currentDirectory.getCoaches(cityValue)}
          />
        </main>
        <DirectoryFooter />
      </div>
    </>
  );
}
