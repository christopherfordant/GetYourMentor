"use client";

import { useMemo, useState } from "react";
import { buildNextPath, nextRoutes } from "@/lib/next-routes";
import { LanguageSelector } from "@/components/common/LanguageSelector";

type SelectionCoachsLegacyPageProps = {
  legacyStyles: string;
  sport?: string;
  city?: string;
  initialCoaches?: CoachEntry[];
};

type CoachEntry = {
  id?: string;
  city?: string;
  name: string;
  address: string;
  meta: string;
  morning: string[];
  afternoon: string[];
  cta: string;
  gender?: "homme" | "femme";
  practice?: "interieur" | "exterieur";
  level?: "debutant" | "intermediaire" | "confirme";
  format?: "presentiel" | "visio";
  availability?: "morning" | "afternoon";
  price?: number;
  rating?: number;
  verified?: boolean;
  distanceKm?: number;
};

type DirectoryFilters = {
  gender: "all" | CoachEntry["gender"];
  practice: "all" | CoachEntry["practice"];
  level: "all" | CoachEntry["level"];
  format: "all" | CoachEntry["format"];
  availability: "all" | NonNullable<CoachEntry["availability"]>;
  budget: "all" | "under-40" | "40-60" | "over-60";
  rating: "all" | "4" | "4.5";
  verified: boolean;
};

type DirectorySort = "relevance" | "rating-desc" | "price-asc" | "price-desc";

const defaultDirectoryFilters: DirectoryFilters = {
  gender: "all",
  practice: "all",
  level: "all",
  format: "all",
  availability: "all",
  budget: "all",
  rating: "all",
  verified: false,
};

const directoryDictionary = {
  football: {
    name: "Football",
    chips: ["Coach individuel", "Préparation match", "Centre indoor"],
    getTitle: () => "Trouve ton coach de football",
    getSubtitle: (city: string) => `Les meilleurs coachs à proximité de ${city} : réservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Thomas Dubois",
        address: `5 Rue du Stade, ${city}`,
        meta: "4.9 (33 avis)  Technique / Tactique / U16",
        morning: ["Jeu. 26"],
        afternoon: ["Ven. 27"],
        cta: "Voir le profil",
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
    chips: ["Shooting", "Défense", "Condition physique"],
    getTitle: () => "Trouve ton coach de basketball",
    getSubtitle: (city: string) => `Les meilleurs coachs à proximité de ${city} : réservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Sarah Benali",
        address: `12 Rue des Arceaux, ${city}`,
        meta: "5.0 (21 avis)  Shooting / Défense / U18",
        morning: ["Jeu. 26"],
        afternoon: ["Sam. 28"],
        cta: "Voir le profil",
      },
      {
        name: "Nolan Vasseur",
        address: `18 Quai Central, ${city}`,
        meta: "4.7 (12 avis)  Junior / Pro / Analyse vidéo",
        morning: ["Ven. 27"],
        afternoon: ["Lun. 30"],
        cta: "Voir le coach",
      },
    ],
  },
  "metiers-de-la-forme": {
    name: "Fitness",
    chips: ["Coach individuel", "Salle premium", "Programme forme"],
    getTitle: () => "Trouve ton coach fitness",
    getSubtitle: (city: string) =>
      `Les meilleurs coachs et studios aux alentours de ${city} : réservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Studio Form Marseille",
        address: `5 Rue de la Forme, ${city}`,
        meta: "5 (33 avis)  Individuel / Small group",
        morning: ["Jeu. 26"],
        afternoon: ["Jeu. 26"],
        cta: "Voir le profil",
      },
      {
        name: "Kenza Training Club",
        address: `7 Rue de la République, ${city}`,
        meta: "4.9 (189 avis)  Club / Transformation",
        morning: ["Ven. 27"],
        afternoon: ["Sam. 28"],
        cta: "Voir le profil",
      },
      {
        name: "Pulse Mobility",
        address: `22 Place du Centre, ${city}`,
        meta: "4.8 (41 avis)  Visio / Mobilité",
        morning: ["Lun. 30"],
        afternoon: ["Mar. 31"],
        cta: "Voir le coach",
      },
    ],
  },
  "sports-de-combat": {
    name: "Sports de combat",
    chips: ["Boxe", "MMA", "Self-défense"],
    getTitle: () => "Trouve ton coach de sports de combat",
    getSubtitle: (city: string) => `Les meilleurs coachs à proximité de ${city} : réservation en ligne`,
    getCoaches: (city: string): CoachEntry[] => [
      {
        name: "Ines Caron Fight Club",
        address: `4 Boulevard Arena, ${city}`,
        meta: "4.9 (26 avis)  Boxe / Self-défense / Débuta",
        morning: ["Jeu. 26"],
        afternoon: ["Ven. 27"],
        cta: "Voir le profil",
      },
      {
        name: "Combat Lab",
        address: `14 Rue des Champions, ${city}`,
        meta: "4.8 (17 avis)  MMA / Cardio boxing / Confirmé",
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

const navigateToSearch = (sportValue: string, cityValue: string) => {
  const sportSlug = inferSportSlug(sportValue);
  const city = cityValue.trim();

  if (city) {
    window.location.href = buildNextPath(nextRoutes.directory, { sport: sportSlug, city });
    return;
  }

  window.location.href = buildNextPath(nextRoutes.search, { sport: sportSlug });
};

function DirectoryHeader() {
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

function DirectoryToolbar({
  sportLabel,
  city,
  filters,
  onFiltersChange,
  onLocate,
  locationStatus,
  radiusKm,
  onRadiusChange,
  sort,
  onSortChange,
}: {
  sportLabel: string;
  city: string;
  filters: DirectoryFilters;
  onFiltersChange: (filters: DirectoryFilters) => void;
  onLocate: () => void;
  locationStatus: string;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  sort: DirectorySort;
  onSortChange: (sort: DirectorySort) => void;
}) {
  const [sportInput, setSportInput] = useState(sportLabel);
  const [cityInput, setCityInput] = useState(city);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
          <span>Discipline</span>
          <input
            type="text"
            data-directory-sport-input
            value={sportInput}
            onChange={(event) => setSportInput(event.target.value)}
          />
        </label>
        <label className="directory-field">
          <span>Zone d’entraînement</span>
          <input
            type="text"
            data-directory-city-input
            value={cityInput}
            onChange={(event) => setCityInput(event.target.value)}
          />
        </label>
        <label className="directory-field">
          <span>Quand t’entraîner ?</span>
          <input type="text" value="Quand tu veux" data-directory-availability-input readOnly />
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
        <button className="directory-chip directory-chip-secondary" type="button" onClick={onLocate} data-directory-locate>
          Utiliser ma position
        </button>
        <label className="directory-chip directory-chip-secondary">
          Rayon
          <select value={radiusKm} onChange={(event) => onRadiusChange(Number(event.target.value))} aria-label="Rayon de recherche">
            <option value="1">1 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
        </label>
        <button className="directory-chip directory-chip-filter" type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
          Filtres
        </button>
        <label className="directory-chip directory-chip-secondary">
          Trier par
          <select value={sort} onChange={(event) => onSortChange(event.target.value as DirectorySort)} aria-label="Trier les coachs">
            <option value="relevance">Pertinence</option>
            <option value="rating-desc">Mieux notés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </label>
      </div>
      {locationStatus ? <p role="status" data-directory-location-status>{locationStatus}</p> : null}
      {filtersOpen ? (
        <div className="directory-filter-panel" data-directory-filter-panel>
          <label>
            Genre
            <select value={filters.gender} onChange={(event) => onFiltersChange({ ...filters, gender: event.target.value as DirectoryFilters["gender"] })}>
              <option value="all">Tous</option>
              <option value="femme">Femme</option>
              <option value="homme">Homme</option>
            </select>
          </label>
          <label>
            Lieu de pratique
            <select value={filters.practice} onChange={(event) => onFiltersChange({ ...filters, practice: event.target.value as DirectoryFilters["practice"] })}>
              <option value="all">Tous</option>
              <option value="interieur">Intérieur</option>
              <option value="exterieur">Extérieur</option>
            </select>
          </label>
          <label>
            Niveau
            <select value={filters.level} onChange={(event) => onFiltersChange({ ...filters, level: event.target.value as DirectoryFilters["level"] })}>
              <option value="all">Tous</option>
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="confirme">Confirmé</option>
            </select>
          </label>
          <label>
            Format
            <select value={filters.format} onChange={(event) => onFiltersChange({ ...filters, format: event.target.value as DirectoryFilters["format"] })}>
              <option value="all">Tous</option>
              <option value="presentiel">Présentiel</option>
              <option value="visio">Visio</option>
            </select>
          </label>
          <label>
            Disponibilité
            <select value={filters.availability} onChange={(event) => onFiltersChange({ ...filters, availability: event.target.value as DirectoryFilters["availability"] })}>
              <option value="all">Toutes</option>
              <option value="morning">Matin</option>
              <option value="afternoon">Après-midi</option>
            </select>
          </label>
          <label>
            Budget
            <select value={filters.budget} onChange={(event) => onFiltersChange({ ...filters, budget: event.target.value as DirectoryFilters["budget"] })}>
              <option value="all">Tous</option>
              <option value="under-40">Moins de 40 €</option>
              <option value="40-60">40 à 60 €</option>
              <option value="over-60">Plus de 60 €</option>
            </select>
          </label>
          <label>
            Note minimale
            <select value={filters.rating} onChange={(event) => onFiltersChange({ ...filters, rating: event.target.value as DirectoryFilters["rating"] })}>
              <option value="all">Toutes</option>
              <option value="4">4+</option>
              <option value="4.5">4,5+</option>
            </select>
          </label>
          <label className="directory-filter-check">
            <input type="checkbox" checked={filters.verified} onChange={(event) => onFiltersChange({ ...filters, verified: event.target.checked })} />
            Coach vérifié
          </label>
          <button type="button" onClick={() => onFiltersChange(defaultDirectoryFilters)}>Réinitialiser</button>
        </div>
      ) : null}
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
  const detailsLink = buildNextPath(nextRoutes.coach, {
    sport: sportSlug,
    city: coach.city ?? city,
    coach: coach.id ?? coach.name,
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
          {coach.distanceKm != null ? <div className="coach-result-distance">À {coach.distanceKm.toFixed(1)} km</div> : null}
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
  filters,
  sort,
}: {
  sportSlug: string;
  city: string;
  title: string;
  subtitle: string;
  coaches: CoachEntry[];
  filters: DirectoryFilters;
  sort: DirectorySort;
}) {
  const visibleCoaches = [...coaches].filter((coach) => {
    if (filters.gender !== "all" && coach.gender !== filters.gender) return false;
    if (filters.practice !== "all" && coach.practice !== filters.practice) return false;
    if (filters.level !== "all" && coach.level !== filters.level) return false;
    if (filters.format !== "all" && coach.format !== filters.format) return false;
    if (filters.availability === "morning" && coach.morning.length === 0) return false;
    if (filters.availability === "afternoon" && coach.afternoon.length === 0) return false;
    if (filters.verified && !coach.verified) return false;
    if (filters.rating !== "all" && (coach.rating ?? 0) < Number(filters.rating)) return false;
    if (filters.budget === "under-40" && (coach.price ?? 0) >= 40) return false;
    if (filters.budget === "40-60" && ((coach.price ?? 0) < 40 || (coach.price ?? 0) > 60)) return false;
    if (filters.budget === "over-60" && (coach.price ?? 0) <= 60) return false;
    return true;
  }).sort((first, second) => {
    if (sort === "rating-desc") return (second.rating ?? 0) - (first.rating ?? 0);
    if (sort === "price-asc") return (first.price ?? Number.POSITIVE_INFINITY) - (second.price ?? Number.POSITIVE_INFINITY);
    if (sort === "price-desc") return (second.price ?? 0) - (first.price ?? 0);
    return (first.distanceKm ?? Number.POSITIVE_INFINITY) - (second.distanceKm ?? Number.POSITIVE_INFINITY);
  });

  return (
    <section className="coach-directory-content">
      <div className="coach-directory-list">
        <header className="directory-heading">
          <h1 data-directory-title>{title}</h1>
          <p data-directory-subtitle>{subtitle}</p>
        </header>

        <div className="coach-results" data-coach-results>
          {visibleCoaches.map((coach, index) => (
            <CoachResultCard
              key={`${coach.name}-${index}`}
              coach={coach}
              sportSlug={sportSlug}
              city={city}
              index={index}
            />
          ))}
          {visibleCoaches.length === 0 ? <p data-directory-empty>Aucun coach ne correspond à ces filtres.</p> : null}
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
      <p>Ton coaching, ton rythme, ta progression.</p>
      <nav className="footer-links" aria-label="Liens l&eacute;gaux">
        <a href="/legal/cgv">CGV</a>
        <a href="/legal/cgu">CGU</a>
        <a href="/legal/confidentialite">Politique de confidentialit&eacute;</a>
        <a href="/legal/mentions-legales">Mentions l&eacute;gales</a>
      </nav>
      <small>&copy; 2026 GetYourMentor. Tous droits r&eacute;serv&eacute;s.</small>
    </footer>
  );
}

export function SelectionCoachsLegacyPage({
  legacyStyles,
  sport,
  city,
  initialCoaches,
}: SelectionCoachsLegacyPageProps) {
  const sportSlug = useMemo(() => {
    if (sport && sport in directoryDictionary) {
      return sport as keyof typeof directoryDictionary;
    }

    return "football";
  }, [sport]);

  const currentDirectory = directoryDictionary[sportSlug];
  const cityValue = city || "Paris";
  const [filters, setFilters] = useState<DirectoryFilters>(defaultDirectoryFilters);
  const [radiusKm, setRadiusKm] = useState(10);
  const [sort, setSort] = useState<DirectorySort>("relevance");
  const [locationStatus, setLocationStatus] = useState("");
  const [locatedCoaches, setLocatedCoaches] = useState<CoachEntry[] | null>(null);
  const coaches = useMemo(
    () => {
      if (initialCoaches) return initialCoaches;
      return currentDirectory.getCoaches(cityValue).map<CoachEntry>((coach, index) => ({
        ...coach,
        gender: (index % 2 === 0 ? "femme" : "homme") as CoachEntry["gender"],
        practice: (index % 2 === 0 ? "interieur" : "exterieur") as CoachEntry["practice"],
        level: (index % 3 === 0 ? "debutant" : index % 3 === 1 ? "intermediaire" : "confirme") as CoachEntry["level"],
        format: (index % 2 === 0 ? "presentiel" : "visio") as CoachEntry["format"],
        availability: (index % 2 === 0 ? "morning" : "afternoon") as CoachEntry["availability"],
        price: index === 0 ? 40 : 65,
        rating: index === 0 ? 4.9 : 4.2,
        verified: index === 0,
      }));
    },
    [cityValue, currentDirectory, initialCoaches],
  );
  const visibleCoaches = locatedCoaches ?? coaches;

  const locateSportist = () => {
    if (!navigator.geolocation) {
      setLocationStatus("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }
    setLocationStatus("Recherche des coachs à proximité…");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const query = new URLSearchParams({ sport: sportSlug, latitude: String(coords.latitude), longitude: String(coords.longitude), radiusKm: String(radiusKm) });
        const response = await fetch(`/api/coaches?${query.toString()}`);
        if (!response.ok) throw new Error("Recherche indisponible");
        const payload = await response.json() as { data?: Array<CoachEntry & { specialty?: string; city?: string; priceFrom?: number; reviewCount?: number }> };
        setLocatedCoaches((payload.data ?? []).map((coach) => ({
          ...coach,
          address: coach.city ?? "Zone d’intervention",
          meta: `${coach.rating?.toFixed(1) ?? "0.0"} (${coach.reviewCount ?? 0} avis) · ${coach.specialty ?? "Coach sportif"}`,
          morning: [],
          afternoon: [],
          cta: "Voir le profil",
          price: coach.priceFrom,
        })));
        setLocationStatus(`Résultats dans un rayon de ${radiusKm} km.`);
      } catch {
        setLocationStatus("La recherche géolocalisée est momentanément indisponible.");
      }
    }, () => setLocationStatus("Autorisez la position pour rechercher les coachs autour de vous."), { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 });
  };

  return (
    <>
      <style jsx global>{legacyStyles}</style>
      <div className="site-shell coach-profile-shell">
        <DirectoryHeader />
        <main className="coach-directory-page" data-coach-directory-page>
          <DirectoryToolbar sportLabel={currentDirectory.name} city={cityValue} filters={filters} onFiltersChange={setFilters} onLocate={locateSportist} locationStatus={locationStatus} radiusKm={radiusKm} onRadiusChange={(radius) => { setRadiusKm(radius); setLocatedCoaches(null); }} sort={sort} onSortChange={setSort} />
          <DirectoryContent
            sportSlug={sportSlug}
            city={cityValue}
            title={currentDirectory.getTitle()}
            subtitle={currentDirectory.getSubtitle(cityValue)}
            coaches={visibleCoaches}
            filters={filters}
            sort={sort}
          />
        </main>
        <DirectoryFooter />
      </div>
    </>
  );
}
