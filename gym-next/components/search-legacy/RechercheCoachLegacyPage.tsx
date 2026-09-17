"use client";

import { useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { LanguageSelector } from "@/components/common/LanguageSelector";

type RechercheCoachLegacyPageProps = {
  legacyStyles: string;
  sport?: string;
  city?: string;
};

const sportDictionary = {
  football: {
    name: "Football",
    search: "Coachs de football",
    title: "Trouver un coach de football qui te correspond",
  },
  basketball: {
    name: "Basketball",
    search: "Coachs de basketball",
    title: "Trouver un coach de basketball qui te correspond",
  },
  "metiers-de-la-forme": {
    name: "Fitness",
    search: "Coachs fitness",
    title: "Trouver un coach fitness qui te correspond",
  },
  "sports-de-combat": {
    name: "Sports de combat",
    search: "Coachs sports de combat",
    title: "Trouver un coach de sports de combat qui te correspond",
  },
} as const;

const cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Nice"];

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

const navigateToSearch = (sportValue: string, cityValue: string) => {
  const sportSlug = inferSportSlug(sportValue);
  const city = cityValue.trim();

  if (city) {
    window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city });
    return;
  }

  window.location.href = buildNextPath(nextRoutes.search, { sport: sportSlug });
};

function RechercheHeader() {
  return (
    <header className="topbar topbar-light">
      <div className="brand-lockup">
        <a className="brand-name brand-link brand-name-dark" href={nextRoutes.home}>
          GetYourMentor
        </a>
      </div>

      <nav className="sports-nav sports-nav-dark" aria-label="Sports">
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=football`}>
          Football
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=basketball`}>
          Basketball
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=metiers-de-la-forme`}>
          Fitness
        </a>
        <a className="sport-link sport-link-dark" href={`${nextRoutes.search}?sport=sports-de-combat`}>
          Sports de combat
        </a>
      </nav>

      <div className="topbar-actions">
        <LanguageSelector />
        <a className="topbar-link topbar-link-dark" href={`${nextRoutes.account}?mode=coach`}>
          Je suis coach
        </a>
        <a className="account-button" href={nextRoutes.account}>
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

function RechercheHeroSection({
  title,
  initialQuery,
  initialCity,
}: {
  title: string;
  initialQuery: string;
  initialCity: string;
}) {
  const [queryValue, setQueryValue] = useState(initialQuery);
  const [cityValue, setCityValue] = useState(initialCity);

  return (
    <section className="sport-hero">
      <h1 className="sport-title" data-sport-title>
        {title}
      </h1>

      <form
        className="sport-search-card"
        data-sport-search-form
        onSubmit={(event) => {
          event.preventDefault();
          navigateToSearch(queryValue, cityValue);
        }}
      >
        <label className="sport-search-field">
          <span>Quelle discipline ?</span>
          <input
            type="text"
            data-sport-query
            placeholder="Football, fitness, boxe..."
            value={queryValue}
            onChange={(event) => setQueryValue(event.target.value)}
          />
        </label>

        <label className="sport-search-field">
          <span>Où veux-tu t’entraîner ?</span>
          <input
            type="text"
            placeholder="Ville, salle ou visio"
            value={cityValue}
            data-sport-city
            onChange={(event) => setCityValue(event.target.value)}
          />
        </label>

        <button className="search-button" type="submit">
          Explorer les coachs
        </button>
      </form>
    </section>
  );
}

function RechercheResultsSection({
  sportSlug,
  sportName,
}: {
  sportSlug: string;
  sportName: string;
}) {
  return (
    <section className="sport-results">
      <p className="sport-kicker" data-sport-kicker>
        {sportName}
      </p>

      <div className="sport-card-grid" data-sport-grid>
        <article
          className="sport-city-card city-paris"
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[0] });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[0] });
            }
          }}
        >
          <div className="sport-city-media"></div>
          <div className="sport-city-copy">
            <p>Decouvrez nos</p>
            <h2>Coachs de {sportName} - Paris</h2>
          </div>
        </article>

        <article
          className="sport-city-card city-lyon"
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[1] });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[1] });
            }
          }}
        >
          <div className="sport-city-media"></div>
          <div className="sport-city-copy">
            <p>Decouvrez nos</p>
            <h2>Coachs de {sportName} - Lyon</h2>
          </div>
        </article>

        <article
          className="sport-city-card city-marseille"
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[2] });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[2] });
            }
          }}
        >
          <div className="sport-city-media"></div>
          <div className="sport-city-copy">
            <p>Decouvrez nos</p>
            <h2>Coachs de {sportName} - Marseille</h2>
          </div>
        </article>

        <article
          className="sport-city-card city-bordeaux"
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[3] });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[3] });
            }
          }}
        >
          <div className="sport-city-media"></div>
          <div className="sport-city-copy">
            <p>Decouvrez nos</p>
            <h2>Coachs de {sportName} a Bordeaux</h2>
          </div>
        </article>

        <article
          className="sport-city-card city-lille"
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[4] });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[4] });
            }
          }}
        >
          <div className="sport-city-media"></div>
          <div className="sport-city-copy">
            <p>Decouvrez nos</p>
            <h2>Coachs de {sportName} a Lille</h2>
          </div>
        </article>

        <article
          className="sport-city-card city-nice"
          role="link"
          tabIndex={0}
          onClick={() => {
            window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[5] });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city: cities[5] });
            }
          }}
        >
          <div className="sport-city-media"></div>
          <div className="sport-city-copy">
            <p>Decouvrez nos</p>
            <h2>Coachs de {sportName} a Nice</h2>
          </div>
        </article>
      </div>
    </section>
  );
}

function RechercheFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">GETYOURMENTOR</div>
      <p>Ton coaching, ton rythme, ta progression.</p>
      <nav className="footer-links" aria-label="Liens legaux">
        <a href={`${nextRoutes.home}#faq-title`}>CGV</a>
        <a href={`${nextRoutes.home}#faq-title`}>CGU</a>
        <a href={`${nextRoutes.home}#faq-title`}>Politique de confidentialite</a>
        <a href={`${nextRoutes.home}#faq-title`}>Mentions legales</a>
      </nav>
      <small>&copy; 2026 GetYourMentor. Tous droits reserves.</small>
    </footer>
  );
}

export function RechercheCoachLegacyPage({
  legacyStyles,
  sport,
  city,
}: RechercheCoachLegacyPageProps) {
  const sportSlug = useMemo(() => {
    if (sport && sport in sportDictionary) {
      return sport as keyof typeof sportDictionary;
    }

    return "football";
  }, [sport]);

  const currentSport = sportDictionary[sportSlug];
  const cityValue = city || "Paris";

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell sport-page-shell">
        <RechercheHeader />
        <main className="sport-page" data-sport-page data-sport-theme={sportSlug}>
          <RechercheHeroSection
            title={currentSport.title}
            initialQuery={currentSport.search}
            initialCity={cityValue}
          />
          <RechercheResultsSection sportSlug={sportSlug} sportName={currentSport.name} />
        </main>
        <RechercheFooter />
      </div>
    </>
  );
}
