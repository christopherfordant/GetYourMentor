const topbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");

const sportPage = document.querySelector("[data-sport-page]");
const coachDirectoryPage = document.querySelector("[data-coach-directory-page]");
const bookingPage = document.querySelector("[data-booking-page]");
const reservationMultiPage = document.querySelector("[data-reservation-multi-page]");
const recapPage = document.querySelector("[data-recap-page]");
const accountPage = document.querySelector("[data-account-page]");
const paymentPage = document.querySelector("[data-payment-page]");

const sportDictionary = {
  football: {
    name: "Football",
    search: "Coachs de football",
    title: "Rserver en ligne un coach de football",
  },
  basketball: {
    name: "Basketball",
    search: "Coachs de basketball",
    title: "Rserver en ligne un coach de basketball",
  },
  "metiers-de-la-forme": {
    name: "Mtiers de la forme",
    search: "Coachs mtiers de la forme",
    title: "Rserver en ligne un coach mtiers de la forme",
  },
  "sports-de-combat": {
    name: "Sports de combat",
    search: "Coachs sports de combat",
    title: "Rserver en ligne un coach de sports de combat",
  },
};

const normalize = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const inferSportSlug = (value = "") => {
  const normalized = normalize(value);

  if (normalized.includes("basket")) return "basketball";
  if (normalized.includes("combat") || normalized.includes("boxe") || normalized.includes("mma")) return "sports-de-combat";
  if (normalized.includes("forme") || normalized.includes("fitness") || normalized.includes("pilates") || normalized.includes("muscu")) {
    return "metiers-de-la-forme";
  }

  return "football";
};

const buildPath = (page, paramsObject = {}) => {
  const search = new URLSearchParams();

  Object.entries(paramsObject).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${page}?${query}` : page;
};

const navigateToSearch = (sportValue, cityValue) => {
  const sportSlug = inferSportSlug(sportValue);
  const city = cityValue?.trim();

  if (city) {
    window.location.href = buildPath("./selection-coachs.html", { sport: sportSlug, city });
    return;
  }

  window.location.href = buildPath("./recherche-coachs.html", { sport: sportSlug });
};

document.querySelectorAll(".sport-link").forEach((button) => {
  button.addEventListener("click", () => button.blur());
});

if (topbar && hero) {
  const syncTopbarState = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY >= 24);
  };

  syncTopbarState();
  window.addEventListener("scroll", syncTopbarState, { passive: true });
  window.addEventListener("resize", syncTopbarState);
}

const homeSearchForm = document.querySelector("[data-home-search-form]");
const homeSearchPreview = document.querySelector("[data-home-search-preview]");

if (homeSearchForm) {
  const launchHomeSearchPreview = (callback) => {
    if (!hero || !homeSearchPreview) {
      callback();
      return;
    }

    if (hero.classList.contains("is-search-previewing")) {
      return;
    }

    hero.classList.add("is-search-previewing");

    window.setTimeout(() => {
      callback();
    }, 700);
  };

  homeSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const sportValue = homeSearchForm.querySelector("[data-home-sport-input]")?.value || "football";
    const cityValue = homeSearchForm.querySelector("[data-home-city-input]")?.value || "";
    launchHomeSearchPreview(() => navigateToSearch(sportValue, cityValue));
  });

  document.querySelectorAll("[data-home-profile-link]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = buildPath("./reserver-seance.html", {
        sport: button.dataset.sport,
        city: button.dataset.city,
        coach: button.dataset.coach,
      });
    });
  });

  document.querySelectorAll("[data-home-slot-link]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = buildPath("./choix-coach-creneau.html", {
        sport: button.dataset.sport,
        city: button.dataset.city,
        coach: button.dataset.coach,
        service: button.dataset.service,
        duration: button.dataset.duration,
        price: button.dataset.price,
      });
    });
  });

  document.querySelectorAll("[data-home-payment-link]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = buildPath("./paiement.html", {
        city: button.dataset.city,
        coach: button.dataset.coach,
        service: button.dataset.service,
        duration: button.dataset.duration,
        price: button.dataset.price,
        slot: button.dataset.slot,
        mentor: button.dataset.mentor,
        connected: "1",
      });
    });
  });

  document.querySelectorAll(".mini-slot").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".slots-row");
      row?.querySelectorAll(".mini-slot").forEach((node) => node.classList.remove("selected"));
      button.classList.add("selected");
    });
  });
}

if (sportPage) {
  const params = new URLSearchParams(window.location.search);
  const sportSlug = params.get("sport") || "football";
  const currentSport = sportDictionary[sportSlug] || sportDictionary.football;
  sportPage.dataset.sportTheme = sportSlug;
  const title = document.querySelector("[data-sport-title]");
  const kicker = document.querySelector("[data-sport-kicker]");
  const queryInput = document.querySelector("[data-sport-query]");
  const cityInput = document.querySelector("[data-sport-city]");
  const form = document.querySelector("[data-sport-search-form]");
  const cards = document.querySelectorAll(".sport-city-card");
  const cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Nice"];

  if (title) title.textContent = currentSport.title;
  if (kicker) kicker.textContent = currentSport.name;
  if (queryInput) queryInput.value = currentSport.search;

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    navigateToSearch(queryInput?.value || currentSport.name, cityInput?.value || "");
  });

  cards.forEach((card, index) => {
    const heading = card.querySelector("h2");
    const city = cities[index] || "Paris";
    const target = buildPath("./selection-coachs.html", { sport: sportSlug, city });

    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.addEventListener("click", () => {
      window.location.href = target;
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = target;
      }
    });

    if (heading) heading.textContent = `Coachs de ${currentSport.name}  ${city}`;
  });
}

const directoryDictionary = {
  football: {
    name: "Football",
    chips: ["Coach individuel", "Prparation match", "Centre indoor"],
    getTitle: () => "Slectionnez un coach de football",
    getSubtitle: (city) => `Les meilleurs coachs  proximit de ${city} : rservation en ligne`,
    getCoaches: (city) => [
      { name: "Thomas Dubois", address: `5 Rue du Stade, ${city}`, meta: "4.9 (33 avis)  Technique / Tactique / U16", morning: ["Jeu. 26"], afternoon: ["Ven. 27"], cta: "Prendre RDV" },
      { name: "Mehdi Rahal", address: `7 Avenue des Appuis, ${city}`, meta: "4.8 (19 avis)  Performance / Retour blessure", morning: ["Lun. 30"], afternoon: ["Mar. 31"], cta: "Voir le coach" },
    ],
  },
  basketball: {
    name: "Basketball",
    chips: ["Shooting", "Dfense", "Condition physique"],
    getTitle: () => "Slectionnez un coach de basketball",
    getSubtitle: (city) => `Les meilleurs coachs  proximit de ${city} : rservation en ligne`,
    getCoaches: (city) => [
      { name: "Sarah Benali", address: `12 Rue des Arceaux, ${city}`, meta: "5.0 (21 avis)  Shooting / Dfense / U18", morning: ["Jeu. 26"], afternoon: ["Sam. 28"], cta: "Prendre RDV" },
      { name: "Nolan Vasseur", address: `18 Quai Central, ${city}`, meta: "4.7 (12 avis)  Junior / Pro / Analyse vido", morning: ["Ven. 27"], afternoon: ["Lun. 30"], cta: "Voir le coach" },
    ],
  },
  "metiers-de-la-forme": {
    name: "Mtiers de la forme",
    chips: ["Coach individuel", "Salle premium", "Programme forme"],
    getTitle: () => "Slectionnez un coach de la forme",
    getSubtitle: (city) => `Les meilleurs coachs et studios aux alentours de ${city} : rservation en ligne`,
    getCoaches: (city) => [
      { name: "Studio Form Marseille", address: `5 Rue de la Forme, ${city}`, meta: "5 (33 avis)  Individuel / Small group", morning: ["Jeu. 26"], afternoon: ["Jeu. 26"], cta: "Prendre RDV" },
      { name: "Kenza Training Club", address: `7 Rue de la Rpublique, ${city}`, meta: "4.9 (189 avis)  Club / Transformation", morning: ["Ven. 27"], afternoon: ["Sam. 28"], cta: "Prendre RDV" },
      { name: "Pulse Mobility", address: `22 Place du Centre, ${city}`, meta: "4.8 (41 avis)  Visio / Mobilit", morning: ["Lun. 30"], afternoon: ["Mar. 31"], cta: "Voir le coach" },
    ],
  },
  "sports-de-combat": {
    name: "Sports de combat",
    chips: ["Boxe", "MMA", "Self-dfense"],
    getTitle: () => "Slectionnez un coach de sports de combat",
    getSubtitle: (city) => `Les meilleurs coachs  proximit de ${city} : rservation en ligne`,
    getCoaches: (city) => [
      { name: "Ines Caron Fight Club", address: `4 Boulevard Arena, ${city}`, meta: "4.9 (26 avis)  Boxe / Self-dfense / Dbuta", morning: ["Jeu. 26"], afternoon: ["Ven. 27"], cta: "Prendre RDV" },
      { name: "Combat Lab", address: `14 Rue des Champions, ${city}`, meta: "4.8 (17 avis)  MMA / Cardio boxing / Confirm", morning: ["Sam. 28"], afternoon: ["Lun. 30"], cta: "Voir le coach" },
    ],
  },
};

if (coachDirectoryPage) {
  const params = new URLSearchParams(window.location.search);
  const sportSlug = params.get("sport") || "football";
  const city = params.get("city") || "Paris";
  const currentDirectory = directoryDictionary[sportSlug] || directoryDictionary.football;
  const sportInput = document.querySelector("[data-directory-sport-input]");
  const cityInput = document.querySelector("[data-directory-city-input]");
  const title = document.querySelector("[data-directory-title]");
  const subtitle = document.querySelector("[data-directory-subtitle]");
  const chipNodes = document.querySelectorAll("[data-directory-chip]");
  const results = document.querySelector("[data-coach-results]");
  const form = document.querySelector("[data-directory-form]");

  if (sportInput) sportInput.value = currentDirectory.name;
  if (cityInput) cityInput.value = city;
  if (title) title.textContent = currentDirectory.getTitle(city);
  if (subtitle) subtitle.textContent = currentDirectory.getSubtitle(city);

  chipNodes.forEach((chip, index) => {
    chip.textContent = currentDirectory.chips[index] || currentDirectory.chips[0];
    chip.addEventListener("click", () => {
      chipNodes.forEach((node) => node.classList.remove("is-active"));
      chip.classList.add("is-active");
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    navigateToSearch(sportInput?.value || currentDirectory.name, cityInput?.value || city);
  });

  if (results) {
    results.innerHTML = currentDirectory
      .getCoaches(city)
      .map((coach, index) => {
        const detailsLink = buildPath("./reserver-seance.html", {
          sport: sportSlug,
          city,
          coach: coach.name,
        });
        const dayMap = new Map();

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

        const scheduleMarkup = Array.from(dayMap.values())
          .map(
            (entry) => `
              <div class="coach-day-card">
                <strong>${entry.day}</strong>
                <div class="coach-day-periods">
                  ${entry.periods.map((period) => `<span class="coach-day-period">${period}</span>`).join("")}
                </div>
              </div>
            `
          )
          .join("");

        return `
          <article class="coach-result-card coach-result-card--${sportSlug}">
            <div class="coach-result-media coach-result-media--${sportSlug} coach-result-media--${sportSlug}-${index + 1}"></div>
            <div class="coach-result-body">
              <div class="coach-result-top">
                <h2>${coach.name}</h2>
                <div class="coach-result-address">${coach.address}</div>
                <div class="coach-result-meta">${coach.meta}</div>
              </div>
              <div class="coach-result-slots">
                ${scheduleMarkup}
              </div>
              <div class="coach-result-footer">
                <a class="coach-more-link" href="${detailsLink}">Plus d'informations</a>
                <a class="coach-book-button" href="${detailsLink}">${coach.cta}</a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }
}

const bookingDictionary = {
  football: {
    category: "Football - Coaching individuel",
    info: [
      { title: "Avant votre sance", subtitle: "Objectif, poste et niveau actuel", more: "Choisissez un axe clair : technique, tactique, performance, reprise ou retour blessure.", duration: "15min" },
      { title: "Organisation du rendez-vous", subtitle: "Lieu, matriel et confirmation", more: "La sance est confirme aprs validation du crneau et du terrain.", duration: "10min" },
      { title: "Formats disponibles", subtitle: "Individuel, duo, visio", more: "Selon le coach, la sance peut tre organise sur terrain, en centre indoor ou en suivi distance.", duration: "3min" },
      { title: "Conditions de rservation", subtitle: "Annulation et reprogrammation", more: "Toute rservation valide bloque un crneau ddi du coach.", duration: "2min" },
    ],
    services: [
      { title: "Sance technique individuelle", subtitle: "Individuel - appuis, conduite, lecture du jeu", more: "Travail cibl sur vos points forts et vos axes de progression.", duration: "30min", price: "35 ", objective: "Technique", format: "Individuel", packageLabel: "U16 / adultes" },
      { title: "Sance intensit match", subtitle: "Individuel - explosivit, finition, prise d'information", more: "Format premium avec retour personnalis du coach en fin de sance.", duration: "45min", price: "55 ", objective: "Performance", format: "Individuel", packageLabel: "Ados / confirm" },
      { title: "Pack progression 5 sances", subtitle: "5 sances de 45min - technique, tactique et suivi", more: "Tarif total du pack : 240 EUR, soit 48 EUR par sance pour progresser sur plusieurs semaines.", duration: "5 x 45min", price: "240 EUR le pack", objective: "Progression", format: "Pack 5 sances", packageLabel: "48 EUR / sance" },
    ],
  },
  basketball: {
    category: "Basketball - Dveloppement joueur",
    info: [
      { title: "Bilan de dpart", subtitle: "Poste, niveau et attentes", more: "Le coach cadre votre objectif : shooting, dribble, dfense, lecture du jeu ou dtection.", duration: "15min" },
      { title: "Infos de sance", subtitle: "Terrain, quipement et accs", more: "Le coach confirme la disponibilit du terrain et le matriel utile.", duration: "10min" },
      { title: "Formats disponibles", subtitle: "Individuel, analyse vido, suivi distance", more: "Le parcours peut mlanger sance terrain et retour vido pour les joueurs qui veulent aller plus loin.", duration: "3min" },
      { title: "Politique de rservation", subtitle: "Annulation et acompte", more: "Annulation possible jusqu' 24h avant selon le crneau choisi.", duration: "2min" },
    ],
    services: [
      { title: "Shooting et mcanique", subtitle: "Individuel - gestuelle, rythme et constance", more: "Sance cible pour gagner en rgularit et en confiance au tir.", duration: "30min", price: "35 ", objective: "Shooting", format: "Individuel", packageLabel: "U18 / seniors" },
      { title: "Session intensit", subtitle: "Individuel - enchanements, lecture et cardio", more: "Pour des joueurs ambitieux qui veulent franchir un cap rapidement.", duration: "50min", price: "60 ", objective: "Performance", format: "Individuel", packageLabel: "Junior / Pro" },
      { title: "Pack analyse vido + terrain", subtitle: "3 sances terrain et 2 retours vido", more: "Tarif total du pack : 230 EUR pour structurer la progression avec analyse dtaille du jeu.", duration: "5 sessions", price: "230 EUR le pack", objective: "Analyse / progression", format: "Pack hybride", packageLabel: "46 EUR / session" },
    ],
  },
  "metiers-de-la-forme": {
    category: "Forme - Coaching premium",
    info: [
      { title: "Avant votre sance", subtitle: "Objectif forme, niveau et contraintes", more: "Choisissez un objectif clair : remise en forme, bien-tre, reprise, perte de poids ou performance.", duration: "15min" },
      { title: "Infos pratiques", subtitle: "Horaires flexibles et accs", more: "La rservation en ligne est valide aprs confirmation du coach et du lieu de sance.", duration: "10min" },
      { title: "Formats disponibles", subtitle: "Individuel, small group, visio", more: "Selon le coach, la sance peut se faire en studio, en salle, en extrieur, domicile ou distance.", duration: "3min" },
      { title: "Conditions de rservation", subtitle: "Report et annulation", more: "En cas d'empchement, le crneau peut tre reprogramm selon les disponibilits.", duration: "2min" },
      { title: "Sances week-end", subtitle: "Sous rserve de disponibilit", more: "Certaines sances du dimanche ncessitent une validation pralable du coach.", duration: "1min" },
    ],
    services: [
      { title: "Coaching remise en forme", subtitle: "Individuel - salle / domicile - objectif reprise", more: "Une sance claire, progressive et premium pour reprendre ou relancer votre routine.", duration: "30min", price: "35 ", objective: "Remise en forme", format: "Individuel", packageLabel: "Sance simple" },
      { title: "Coaching transformation", subtitle: "Individuel - studio / extrieur - objectif performance", more: "Format plus complet pour celles et ceux qui veulent une vraie monte en charge.", duration: "45min", price: "48 ", objective: "Performance", format: "Individuel", packageLabel: "Sance simple" },
      { title: "Pack transformation 5 sances", subtitle: "5 sances de 45min - individuel ou small group", more: "Tarif total du pack : 210 EUR, soit 42 EUR par sance pour installer une routine et suivre votre progression.", duration: "5 x 45min", price: "210 EUR le pack", objective: "Transformation", format: "Pack 5 sances", packageLabel: "42 EUR / sance" },
    ],
  },
  "sports-de-combat": {
    category: "Combat - Sance premium",
    info: [
      { title: "Avant votre sance", subtitle: "Objectif, niveau et discipline", more: "Le coach adapte la sance selon votre pratique : dbutant, remise en forme, self-dfense ou comptition.", duration: "10min" },
      { title: "Formats disponibles", subtitle: "Solo, duo, mini-groupe", more: "Selon le coach, la sance peut se faire en individuel, deux ou en petit groupe.", duration: "3min" },
      { title: "Rgles de scurit", subtitle: "Matriel obligatoire", more: "Gants, protge-tibias ou protections peuvent tre fournis sur demande.", duration: "5min" },
    ],
    services: [
      { title: "Cours priv boxe", subtitle: "Solo - technique, cardio et garde", more: "Une session premium, progressive et structure.", duration: "45min", price: "55 ", objective: "Technique", format: "Solo", packageLabel: "Dbutant / intermdiaire" },
      { title: "Self-defense premium", subtitle: "Solo ou duo - mouvements utiles et confiance", more: "Parfait pour une progression concrte, rassurante et lisible.", duration: "50min", price: "60 ", objective: "Confiance / self-dfense", format: "Solo / duo", packageLabel: "Adultes" },
      { title: "Pack combat 4 sances", subtitle: "4 sances de 50min - boxe, cardio boxing ou MMA", more: "Tarif total du pack : 220 EUR, soit 55 EUR par sance pour une routine plus rgulire.", duration: "4 x 50min", price: "220 EUR le pack", objective: "Progression", format: "Pack 4 sances", packageLabel: "55 EUR / sance" },
    ],
  },
};

const bookingProfileDictionary = {
  football: {
    followers: "22 joueurs suivis",
    specialty: "Specialite football",
    bio: "Bonjour, je m'appelle Bryce et je partage une experience de terrain fondee sur l'exigence, la lecture du jeu et la repetition utile. Mon objectif est d'aider chaque joueur a progresser avec plus de clarte, de confiance et de regularite.",
    reviews: "284 avis verifies",
    qualification: "Coach premium football",
    diploma: "BEF / UEFA B",
  },
  basketball: {
    followers: "18 joueurs suivis",
    specialty: "Specialite basketball",
    bio: "Bonjour, je m'appelle Sarah et j'accompagne les joueurs qui veulent gagner en mecanique, en rythme et en constance. Chaque seance est construite pour transformer rapidement les automatismes en vrai niveau de jeu.",
    reviews: "192 avis verifies",
    qualification: "Coach premium basketball",
    diploma: "CQP Technicien sportif",
  },
  "metiers-de-la-forme": {
    followers: "31 clients suivis",
    specialty: "Specialite remise en forme",
    bio: "Bonjour, je m'appelle Julien et je propose un accompagnement premium pour reprendre, accelerer ou structurer votre routine. Le cadre est progressif, lisible et adapte a votre energie comme a vos objectifs.",
    reviews: "318 avis verifies",
    qualification: "Coach premium forme",
    diploma: "BPJEPS Activites de la forme",
  },
  "sports-de-combat": {
    followers: "16 athletes suivis",
    specialty: "Specialite sports de combat",
    reviews: "167 avis verifies",
    qualification: "Coach premium combat",
    diploma: "Diplome federale / BPJEPS",
    bio: "Bonjour, je m'appelle Ines et je conçois des sessions precises pour travailler technique, garde, placement et confiance. L'idee est d'allier intensite, securite et progression concrete a chaque rendez-vous.",
  },
};

const bookingGeoDictionary = {
  football: {
    department: "Bouches-du-Rhone",
    address: "Complexe du Prado, 9e arrondissement, Marseille",
    x: "70%",
    y: "76%",
  },
  basketball: {
    department: "Rhone",
    address: "12 Rue des Arceaux, Lyon 7e",
    x: "56%",
    y: "54%",
  },
  "metiers-de-la-forme": {
    department: "Bouches-du-Rhone",
    address: "5 Rue de la Forme, Marseille",
    x: "70%",
    y: "76%",
  },
  "sports-de-combat": {
    department: "Bouches-du-Rhone",
    address: "4 Boulevard Arena, Marseille",
    x: "70%",
    y: "76%",
  },
};

const bookingVisualDictionary = {
  football: {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.14), rgba(14, 18, 28, 0.10)), url("../design_assets/content_library/football/football-field-mentor.jpg") center 18% / cover no-repeat',
    photo:
      'linear-gradient(180deg, rgba(8, 14, 22, 0.12), rgba(8, 14, 22, 0.18)), url("../design_assets/content_library/football/football-youth-coach.jpg") center 18% / cover no-repeat',
  },
  basketball: {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.14), rgba(14, 18, 28, 0.10)), url("../design_assets/content_library/basketball/basketball-training-athlete.jpg") center 14% / cover no-repeat',
    photo:
      'linear-gradient(180deg, rgba(8, 14, 22, 0.12), rgba(8, 14, 22, 0.18)), url("../design_assets/content_library/basketball/basketball-shooting-court.jpg") center 24% / cover no-repeat',
  },
  "metiers-de-la-forme": {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.12), rgba(14, 18, 28, 0.08)), url("../design_assets/sports_sources/fitness.jpg") center 10% / cover no-repeat',
    photo:
      'linear-gradient(180deg, rgba(8, 14, 22, 0.12), rgba(8, 14, 22, 0.18)), url("../design_assets/content_library/fitness/fitness-coach-plank.jpg") center 8% / cover no-repeat',
  },
  "sports-de-combat": {
    hero:
      'linear-gradient(180deg, rgba(14, 18, 28, 0.14), rgba(14, 18, 28, 0.10)), url("../design_assets/content_library/combat/combat-muay-thai-kick.jpg") center 18% / cover no-repeat',
    photo:
      'linear-gradient(180deg, rgba(8, 14, 22, 0.12), rgba(8, 14, 22, 0.18)), url("../design_assets/content_library/combat/combat-boxer-portrait.jpg") center 16% / cover no-repeat',
  },
};

const weekSets = [
  [
    { day: "jeudi", date: "26 mars", slots: ["10:00", "11:00", "11:30", "12:00", "13:30"] },
    { day: "vendredi", date: "27 mars", slots: ["10:00", "10:30", "11:00", "13:30", "14:00"] },
    { day: "samedi", date: "28 mars", slots: ["10:00", "17:30", "18:00"] },
    { day: "dimanche", date: "29 mars", slots: [] },
    { day: "lundi", date: "30 mars", slots: [] },
    { day: "mardi", date: "31 mars", slots: ["10:00", "10:30", "11:00", "11:30", "12:00"] },
    { day: "mercredi", date: "01 avr.", slots: ["10:00", "10:30", "11:00", "11:30", "12:00"] },
  ],
  [
    { day: "jeudi", date: "02 avr.", slots: ["09:30", "10:30", "11:30", "12:30"] },
    { day: "vendredi", date: "03 avr.", slots: ["10:00", "11:00", "16:00"] },
    { day: "samedi", date: "04 avr.", slots: ["09:00", "10:00", "11:00"] },
    { day: "dimanche", date: "05 avr.", slots: ["09:30", "10:30"] },
    { day: "lundi", date: "06 avr.", slots: [] },
    { day: "mardi", date: "07 avr.", slots: ["10:00", "12:00", "14:00"] },
    { day: "mercredi", date: "08 avr.", slots: ["09:30", "10:30", "11:30"] },
  ],
];

if (bookingPage) {
  const params = new URLSearchParams(window.location.search);
  const sportSlug = params.get("sport") || "metiers-de-la-forme";
  const city = params.get("city") || "Paris";
  const coach = params.get("coach") || "Studio Form Marseille";
  const currentBooking = bookingDictionary[sportSlug] || bookingDictionary["metiers-de-la-forme"];
  const currentProfile = bookingProfileDictionary[sportSlug] || bookingProfileDictionary["metiers-de-la-forme"];
  const nameNode = document.querySelector("[data-booking-name]");
  const addressNode = document.querySelector("[data-booking-address]");
  const metaNode = document.querySelector("[data-booking-meta]");
  const headingNode = document.querySelector("[data-booking-heading]");
  const categoryNode = document.querySelector("[data-booking-category]");
  const followersNode = document.querySelector("[data-booking-followers]");
  const followersSecondaryNode = document.querySelector("[data-booking-followers-secondary]");
  const specialtyNode = document.querySelector("[data-booking-specialty]");
  const contentSpecialtyNode = document.querySelector("[data-content-specialty]");
  const contentCoachNameNode = document.querySelector("[data-content-coach-name]");
  const bioNode = document.querySelector("[data-booking-bio]");
  const shortNameNode = document.querySelector("[data-booking-short-name]");
  const scoreLargeNode = document.querySelector("[data-booking-score-large]");
  const scoreCopyNode = document.querySelector("[data-booking-score-copy]");
  const scoreFollowersNode = document.querySelector("[data-booking-score-followers]");
  const qualificationNode = document.querySelector("[data-booking-qualification]");
  const diplomaNode = document.querySelector("[data-booking-diploma]");
  const profileQualificationNode = document.querySelector("[data-booking-profile-qualification]");
  const profileDiplomaNode = document.querySelector("[data-booking-profile-diploma]");
  const galleryMainNode = document.querySelector("[data-booking-gallery-main]");
  const profilePhotoNode = document.querySelector("[data-booking-profile-photo]");
  const infoList = document.querySelector("[data-booking-info-list]");
  const serviceList = document.querySelector("[data-booking-service-list]");
  const ratingBody = document.querySelector("[data-rating-body]");
  const bookingTabs = document.querySelectorAll("[data-booking-tab]");
  const bookingTabsBar = document.querySelector(".booking-tabs-profile");
  const bookingTabsSpacer = document.querySelector("[data-booking-tabs-spacer]");
  const bookingGhostButtons = document.querySelectorAll("[data-booking-nav]");
  const bookingPanes = document.querySelectorAll("[data-booking-pane]");
  const bookingAproposPane = document.querySelector('[data-booking-pane="apropos"]');
  const bookingPageShell = document.querySelector(".booking-page");
  const bookingPaneSide = document.querySelector(".booking-pane-side");
  const bookingFloatingCard = document.querySelector(".booking-score-panel-side");
  const bookingFloatingSpacer = document.querySelector("[data-booking-score-spacer]");
  const bookingGeoCard = document.querySelector(".booking-geo-card");
  const bookingGeoSpacer = document.querySelector("[data-booking-geo-spacer]");
  const bookingGeoMap = document.querySelector(".booking-geo-map");
  const ratingTabs = document.querySelectorAll("[data-rating-tab]");
  const contentUnlockButton = document.querySelector("[data-content-unlock]");
  const contentFeed = document.querySelector("[data-content-feed]");
  const contentLockNote = document.querySelector("[data-content-lock-note]");
  const bookingDaysNode = document.querySelector("[data-booking-days]");
  const bookingSlotsGrid = document.querySelector("[data-booking-slots-grid]");
  const bookingPrevButton = document.querySelector("[data-booking-calendar-prev]");
  const bookingNextButton = document.querySelector("[data-booking-calendar-next]");
  const bookingConfirmNode = document.querySelector("[data-booking-confirm]");
  const geoHoverNodes = document.querySelectorAll("[data-booking-geo-hover]");
  const geoDepartmentNode = document.querySelector("[data-booking-geo-department]");
  const geoLabelNode = document.querySelector("[data-booking-geo-label]");
  const geoCopyNode = document.querySelector("[data-booking-geo-copy]");
  const geoHighlightNode = document.querySelector("[data-booking-geo-highlight]");
  const currentGeo = bookingGeoDictionary[sportSlug] || bookingGeoDictionary["metiers-de-la-forme"];
  const currentVisual = bookingVisualDictionary[sportSlug] || bookingVisualDictionary["metiers-de-la-forme"];
  const bookingSectionTargets = {
    apropos: "#booking-apropos-section",
    planning: "#booking-planning-section",
    contenus: "#booking-contenus-section",
  };
  let bookingWeekIndex = 0;
  let bookingSelectedSlot = params.get("slot") || weekSets[0][0].slots[0] || "10:00";
  const bookingSelectedService =
    currentBooking.services.find((item) => item.title === params.get("service")) || currentBooking.services[0];

  if (nameNode) nameNode.textContent = coach;
  if (addressNode) addressNode.textContent = `9e arrondissement, ${city}`;
  if (metaNode) metaNode.textContent = currentProfile.specialty;
  if (headingNode) headingNode.textContent = `Prenez votre rendez-vous avec ${coach}`;
  if (categoryNode) categoryNode.textContent = currentBooking.category;
  if (followersNode) followersNode.textContent = currentProfile.followers;
  if (followersSecondaryNode) followersSecondaryNode.textContent = currentProfile.followers;
  if (specialtyNode) specialtyNode.textContent = currentProfile.specialty;
  if (contentSpecialtyNode) contentSpecialtyNode.textContent = currentProfile.specialty;
  if (contentCoachNameNode) contentCoachNameNode.textContent = coach;
  if (bioNode) bioNode.textContent = currentProfile.bio;
  if (shortNameNode) shortNameNode.textContent = coach.split(" ").slice(-1)[0] || coach;
  if (scoreLargeNode) scoreLargeNode.textContent = "5 / 5";
  if (scoreCopyNode) scoreCopyNode.textContent = currentProfile.reviews;
  if (scoreFollowersNode) scoreFollowersNode.textContent = currentProfile.followers;
  if (qualificationNode) qualificationNode.textContent = currentProfile.qualification;
  if (diplomaNode) diplomaNode.textContent = currentProfile.diploma;
  if (profileQualificationNode) profileQualificationNode.textContent = currentProfile.qualification;
  if (profileDiplomaNode) profileDiplomaNode.textContent = currentProfile.diploma;
  if (geoDepartmentNode) geoDepartmentNode.textContent = currentGeo.department;
  if (geoLabelNode) geoLabelNode.textContent = currentGeo.department;
  if (galleryMainNode) galleryMainNode.style.background = currentVisual.hero;
  if (profilePhotoNode) profilePhotoNode.style.background = currentVisual.photo;

  const setGeoState = (isActive) => {
    if (geoHighlightNode) {
      geoHighlightNode.classList.toggle("is-active", isActive);
      geoHighlightNode.style.left = currentGeo.x;
      geoHighlightNode.style.top = currentGeo.y;
    }

    if (geoLabelNode) {
      geoLabelNode.textContent = isActive ? currentGeo.address : currentGeo.department;
    }

    if (geoCopyNode) {
      geoCopyNode.textContent = isActive
        ? `Adresse affichee : ${currentGeo.address}`
        : "Survolez le profil du coach pour afficher sa zone et son adresse.";
    }
  };

  const scrollToBookingSection = (value) => {
    const selector = bookingSectionTargets[value] || bookingSectionTargets.apropos;
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateBookingConfirmHref = () => {
    if (!bookingConfirmNode || !bookingSelectedService) return;

    bookingConfirmNode.href = buildPath("./recapitulatif-reservation.html", {
      sport: sportSlug,
      city,
      coach,
      service: bookingSelectedService.title,
      duration: bookingSelectedService.duration,
      price: bookingSelectedService.price,
      objective: bookingSelectedService.objective || "",
      format: bookingSelectedService.format || "",
      package: bookingSelectedService.packageLabel || "",
      slot: bookingSelectedSlot,
      mentor: coach,
    });
  };

  const renderBookingWeek = () => {
    const currentWeek = weekSets[bookingWeekIndex];

    if (bookingDaysNode) {
      bookingDaysNode.innerHTML = currentWeek
        .map(
          (item) => `
            <div class="reservation-day">
              <strong>${item.day}</strong>
              <span>${item.date}</span>
            </div>
          `
        )
        .join("");
    }

    if (bookingSlotsGrid) {
      bookingSlotsGrid.innerHTML = currentWeek
        .map(
          (item) => `
            <div class="reservation-slot-column">
              ${
                item.slots.length
                  ? item.slots
                      .map(
                        (slot) =>
                          `<button class="reservation-slot ${slot === bookingSelectedSlot ? "is-selected" : ""}" type="button" data-booking-slot="${slot}">${slot}</button>`
                      )
                      .join("")
                  : '<button class="reservation-slot" type="button" disabled>-</button>'
              }
            </div>
          `
        )
        .join("");

      bookingSlotsGrid.querySelectorAll("[data-booking-slot]").forEach((button) => {
        button.addEventListener("click", () => {
          bookingSelectedSlot = button.dataset.bookingSlot || bookingSelectedSlot;
          renderBookingWeek();
          updateBookingConfirmHref();
        });
      });
    }
  };

  if (infoList) {
    infoList.innerHTML = currentBooking.info
      .map(
        (item) => `
          <article class="booking-info-item">
            <div class="booking-item-copy">
              <strong>${item.title}</strong>
              <span>${item.subtitle}</span>
              <p>${item.more}</p>
            </div>
            <div class="booking-item-side">
              <strong>${item.duration}</strong>
            </div>
          </article>
        `
      )
      .join("");
  }

  if (serviceList) {
    serviceList.innerHTML = currentBooking.services
      .map(
        (item) => `
          <article class="booking-service-item">
            <div class="booking-item-copy">
              <strong>${item.title}</strong>
              <span>${item.subtitle}</span>
              <p>${item.more}</p>
            </div>
            <div class="booking-item-side">
              <strong>${item.duration} - ${item.price}</strong>
              <a class="booking-choose-button" href="${buildPath("./choix-coach-creneau.html", {
                sport: sportSlug,
                city,
                coach,
                service: item.title,
                duration: item.duration,
                price: item.price,
                objective: item.objective || "",
                format: item.format || "",
                package: item.packageLabel || "",
              })}">Choisir</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  geoHoverNodes.forEach((node) => {
    node.addEventListener("mouseenter", () => setGeoState(true));
    node.addEventListener("mouseleave", () => setGeoState(false));
    node.addEventListener("focusin", () => setGeoState(true));
    node.addEventListener("focusout", () => setGeoState(false));
  });

  const setActiveBookingTab = (value) => {
    bookingTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.bookingTab === value);
    });

    bookingPanes.forEach((pane) => {
      pane.classList.toggle("is-active", pane.dataset.bookingPane === value);
    });
  };

  bookingGhostButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.bookingNav || "planning";
      setActiveBookingTab(target);
      syncBookingStickyLayout();
      requestAnimationFrame(syncBookingStickyLayout);
      scrollToBookingSection(target);
    });
  });

  bookingTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.bookingTab || "apropos";
      setActiveBookingTab(target);
      syncBookingStickyLayout();
      requestAnimationFrame(syncBookingStickyLayout);
      scrollToBookingSection(target);
    });
  });

  renderBookingWeek();
  updateBookingConfirmHref();

  bookingPrevButton?.addEventListener("click", () => {
    bookingWeekIndex = bookingWeekIndex === 0 ? weekSets.length - 1 : bookingWeekIndex - 1;
    renderBookingWeek();
  });

  bookingNextButton?.addEventListener("click", () => {
    bookingWeekIndex = (bookingWeekIndex + 1) % weekSets.length;
    renderBookingWeek();
  });

  const syncBookingTabsBar = () => {
    if (!bookingTabsBar || !topbar || !bookingTabsSpacer || !bookingPageShell) return;

    const desktop = window.innerWidth > 900;

    if (!desktop) {
      bookingTabsBar.style.position = "";
      bookingTabsBar.style.top = "";
      bookingTabsBar.style.left = "";
      bookingTabsBar.style.width = "";
      bookingTabsBar.style.zIndex = "";
      bookingTabsSpacer.style.display = "none";
      bookingTabsSpacer.style.height = "0px";
      return;
    }

    const headerOffset = topbar.getBoundingClientRect().height + 10;
    const footer = document.querySelector(".site-footer");

    bookingTabsBar.style.position = "static";
    bookingTabsBar.style.top = "";
    bookingTabsBar.style.left = "";
    bookingTabsBar.style.width = "";
    bookingTabsBar.style.zIndex = "";
    bookingTabsSpacer.style.display = "none";
    bookingTabsSpacer.style.height = "0px";

    const pageRect = bookingPageShell.getBoundingClientRect();
    const tabsRect = bookingTabsBar.getBoundingClientRect();
    const footerRect = footer?.getBoundingClientRect();
    const scrollY = window.scrollY;
    const pageTop = scrollY + pageRect.top;
    const tabsTop = scrollY + tabsRect.top;
    const footerBottom = footerRect ? scrollY + footerRect.bottom : Number.POSITIVE_INFINITY;
    const tabsHeight = bookingTabsBar.offsetHeight;
    const start = tabsTop - headerOffset;
    const stop = footerBottom - window.innerHeight;

    if (scrollY <= start) {
      return;
    }

    bookingTabsSpacer.style.display = "block";
    bookingTabsSpacer.style.height = `${tabsHeight}px`;

    if (scrollY >= stop) {
      bookingTabsBar.style.position = "absolute";
      bookingTabsBar.style.top = `${Math.max(0, stop + headerOffset - pageTop)}px`;
      bookingTabsBar.style.left = `${Math.round(tabsRect.left - pageRect.left)}px`;
      bookingTabsBar.style.width = `${Math.round(tabsRect.width)}px`;
      bookingTabsBar.style.zIndex = "18";
      return;
    }

    bookingTabsBar.style.position = "fixed";
    bookingTabsBar.style.top = `${Math.round(headerOffset)}px`;
    bookingTabsBar.style.left = `${Math.round(tabsRect.left)}px`;
    bookingTabsBar.style.width = `${Math.round(tabsRect.width)}px`;
    bookingTabsBar.style.zIndex = "18";
  };

  const syncBookingFloatingCard = () => {
    if (!bookingPaneSide || !bookingFloatingCard || !bookingFloatingSpacer || !topbar) return;

    const aproposActive = bookingAproposPane?.classList.contains("is-active");
    const desktop = window.innerWidth > 900;

    if (!desktop || !aproposActive) {
      bookingPaneSide.style.position = "static";
      bookingPaneSide.style.minHeight = "";
      bookingFloatingCard.style.position = "static";
      bookingFloatingCard.style.top = "";
      bookingFloatingCard.style.left = "";
      bookingFloatingCard.style.width = "";
      bookingFloatingCard.style.zIndex = "";
      bookingFloatingCard.classList.remove("is-floating");
      bookingFloatingSpacer.style.display = "none";
      bookingFloatingSpacer.style.height = "0px";
      return;
    }

    const headerOffset = topbar.getBoundingClientRect().height + 10;
    bookingPaneSide.style.position = "relative";
    bookingPaneSide.style.minHeight = "";
    bookingFloatingCard.style.position = "static";
    bookingFloatingCard.style.top = "";
    bookingFloatingCard.style.left = "";
    bookingFloatingCard.style.width = "";
    bookingFloatingCard.style.zIndex = "";
    bookingFloatingCard.classList.remove("is-floating");
    bookingFloatingSpacer.style.display = "none";
    bookingFloatingSpacer.style.height = "0px";

    let floatingTop = headerOffset;
    if (bookingTabsBar) {
      const tabsRect = bookingTabsBar.getBoundingClientRect();
      const tabsStickyThreshold = headerOffset + 4;
      if (tabsRect.top <= tabsStickyThreshold) {
        floatingTop = Math.max(headerOffset, tabsRect.bottom + 8);
      }
    }

    const paneRect = bookingPaneSide.getBoundingClientRect();
    const cardHeight = bookingFloatingCard.offsetHeight;
    const geoHeight = bookingGeoCard?.offsetHeight || 0;
    const footer = document.querySelector(".site-footer");
    const footerRect = footer?.getBoundingClientRect();
    const scrollY = window.scrollY;
    const paneTop = scrollY + paneRect.top;
    const footerTop = footerRect ? scrollY + footerRect.top : Number.POSITIVE_INFINITY;
    const start = paneTop - floatingTop;
    const stop = footerTop - floatingTop - cardHeight - geoHeight - 24;
    const footerVisible = Boolean(footerRect && footerRect.top <= window.innerHeight);

    if (scrollY <= start) {
      return;
    }

    bookingPaneSide.style.minHeight = `${cardHeight + geoHeight + 6}px`;
    bookingFloatingSpacer.style.display = "block";
    bookingFloatingSpacer.style.height = `${cardHeight + 8}px`;

    if (footerVisible) {
      bookingFloatingCard.style.position = "fixed";
      bookingFloatingCard.style.top = `${Math.round(floatingTop)}px`;
      bookingFloatingCard.style.left = `${Math.round(paneRect.left)}px`;
      bookingFloatingCard.style.width = `${Math.round(paneRect.width)}px`;
      bookingFloatingCard.style.zIndex = "12";
      bookingFloatingCard.classList.add("is-floating");
      return;
    }

    if (scrollY >= stop) {
      bookingFloatingCard.style.position = "absolute";
      bookingFloatingCard.style.top = `${Math.max(0, stop - paneTop)}px`;
      bookingFloatingCard.style.left = "0";
      bookingFloatingCard.style.width = "100%";
      bookingFloatingCard.style.zIndex = "6";
      bookingFloatingCard.classList.add("is-floating");
      return;
    }

    bookingFloatingCard.style.position = "fixed";
    bookingFloatingCard.style.top = `${Math.round(floatingTop)}px`;
    bookingFloatingCard.style.left = `${Math.round(paneRect.left)}px`;
    bookingFloatingCard.style.width = `${Math.round(paneRect.width)}px`;
    bookingFloatingCard.style.zIndex = "12";
    bookingFloatingCard.classList.add("is-floating");
  };

  const syncBookingGeoCard = () => {
    if (!bookingPaneSide || !bookingGeoCard || !bookingGeoSpacer || !topbar) return;

    const aproposActive = bookingAproposPane?.classList.contains("is-active");
    const desktop = window.innerWidth > 900;

    if (!desktop || !aproposActive) {
      bookingGeoCard.style.position = "static";
      bookingGeoCard.style.top = "";
      bookingGeoCard.style.left = "";
      bookingGeoCard.style.width = "";
      bookingGeoCard.style.zIndex = "";
      if (bookingGeoMap) bookingGeoMap.style.minHeight = "";
      bookingGeoSpacer.style.display = "none";
      bookingGeoSpacer.style.height = "0px";
      return;
    }

    bookingGeoCard.style.position = "static";
    bookingGeoCard.style.top = "";
    bookingGeoCard.style.left = "";
    bookingGeoCard.style.width = "";
    bookingGeoCard.style.zIndex = "";
    if (bookingGeoMap) bookingGeoMap.style.minHeight = "";
    bookingGeoSpacer.style.display = "none";
    bookingGeoSpacer.style.height = "0px";
    const headerOffset = topbar.getBoundingClientRect().height + 10;
    const paneRect = bookingPaneSide.getBoundingClientRect();
    const noteRect = bookingFloatingCard?.getBoundingClientRect();
    const geoRect = bookingGeoCard.getBoundingClientRect();
    const footer = document.querySelector(".site-footer");
    const footerRect = footer?.getBoundingClientRect();
    const scrollY = window.scrollY;
    const paneTop = scrollY + paneRect.top;
    const geoHeight = bookingGeoCard.offsetHeight;
    const geoTop = scrollY + geoRect.top;
    const footerTop = footerRect ? scrollY + footerRect.top : Number.POSITIVE_INFINITY;
    const noteBottomViewport = noteRect ? noteRect.bottom : headerOffset;
    const floatingTop = Math.max(headerOffset, noteBottomViewport + 8);
    const start = geoTop - floatingTop;
    const stop = footerTop - floatingTop - geoHeight - 12;
    if (scrollY <= start) {
      return;
    }

    bookingGeoSpacer.style.display = "block";
    bookingGeoSpacer.style.height = `${geoHeight + 2}px`;

    if (scrollY >= stop) {
      bookingGeoCard.style.position = "absolute";
      bookingGeoCard.style.top = `${Math.max(0, stop - paneTop)}px`;
      bookingGeoCard.style.left = "0";
      bookingGeoCard.style.width = "100%";
      bookingGeoCard.style.zIndex = "5";
      return;
    }

    bookingGeoCard.style.position = "fixed";
    bookingGeoCard.style.top = `${Math.round(floatingTop)}px`;
    bookingGeoCard.style.left = `${Math.round(paneRect.left)}px`;
    bookingGeoCard.style.width = `${Math.round(paneRect.width)}px`;
    bookingGeoCard.style.zIndex = "9";
  };

  const syncBookingStickyLayout = () => {
    syncBookingTabsBar();
    syncBookingFloatingCard();
    syncBookingGeoCard();
  };

  syncBookingStickyLayout();
  window.addEventListener("scroll", syncBookingStickyLayout, { passive: true });
  window.addEventListener("resize", syncBookingStickyLayout);

  contentUnlockButton?.addEventListener("click", () => {
    contentFeed?.classList.remove("is-locked");
    contentFeed?.classList.add("is-unlocked");
    contentUnlockButton.textContent = "Abonnement actif";
    contentUnlockButton.disabled = true;
    contentLockNote && (contentLockNote.textContent = "Abonnement actif. Tous les contenus du coach sont maintenant visibles.");
  });

  ratingTabs.forEach((button) => {
    button.addEventListener("click", () => {
      ratingTabs.forEach((node) => node.classList.remove("is-active"));
      button.classList.add("is-active");

      if (!ratingBody) return;

      if (button.dataset.ratingTab === "reviews") {
        ratingBody.innerHTML = `
          <div class="booking-rating-lines booking-rating-reviews">
            <div>"Sance trs claire et ultra motivante." <strong> Camille</strong></div>
            <div>"Coach ponctuel, exercices adapts et trs bonne nergie." <strong> Mehdi</strong></div>
            <div>"On se sent accompagn du dbut  la fin." <strong> Sarah</strong></div>
            <p>Extraits d'avis visibles dans la maquette.</p>
          </div>
        `;
        return;
      }

      ratingBody.innerHTML = `
        <div class="booking-rating-score">4,9</div>
        <div class="booking-rating-lines">
          <div>Accueil <strong>4,9 </strong></div>
          <div>Ponctualit <strong>4,9 </strong></div>
          <div>Cadre &amp; ambiance <strong>4,8 </strong></div>
          <div>Qualit de l'accompagnement <strong>4,9 </strong></div>
          <p>284 clients ont donn leur avis</p>
        </div>
      `;
    });
  });
}

if (reservationMultiPage) {
  const params = new URLSearchParams(window.location.search);
  const sportSlug = params.get("sport") || "metiers-de-la-forme";
  const city = params.get("city") || "Marseille";
  const coach = params.get("coach") || "Studio Form Marseille";
  const service = params.get("service") || "Coaching remise en forme";
  const duration = params.get("duration") || "30min";
  const price = params.get("price") || "35 ";
  const objective = params.get("objective") || "";
  const format = params.get("format") || "";
  const packageLabel = params.get("package") || "";
  let selectedSlot = params.get("slot") || "10:00";
  let selectedMentor = params.get("mentor") || "Sans prfrence";
  let weekIndex = 0;

  const coaches = [
    { id: "SP", name: "Sans prfrence" },
    { id: "M", name: "Mika" },
    { id: "T", name: "Titi" },
    { id: "Y", name: "Yullia" },
    { id: "S", name: "Sabine" },
  ];

  const nameNode = document.querySelector("[data-multi-name]");
  const addressNode = document.querySelector("[data-multi-address]");
  const metaNode = document.querySelector("[data-multi-meta]");
  const serviceNode = document.querySelector("[data-multi-service]");
  const serviceMetaNode = document.querySelector("[data-multi-service-meta]");
  const coachGrid = document.querySelector("[data-multi-coaches]");
  const daysNode = document.querySelector("[data-multi-days]");
  const slotsGrid = document.querySelector("[data-multi-slots-grid]");
  const confirmNode = document.querySelector("[data-multi-confirm]");
  const removeNode = document.querySelector("[data-multi-remove]");
  const addNode = document.querySelector("[data-multi-add]");
  const prevButton = document.querySelector("[data-calendar-prev]");
  const nextButton = document.querySelector("[data-calendar-next]");

  if (nameNode) nameNode.textContent = coach;
  if (addressNode) addressNode.textContent = `10 Rue du Sport, ${city}`;
  if (metaNode) metaNode.textContent = "4.9 (423 avis)  Coaching premium";
  if (serviceNode) serviceNode.textContent = service;
  if (serviceMetaNode) serviceMetaNode.textContent = [duration, price, format, objective, packageLabel].filter(Boolean).join("  ");

  const updateConfirmHref = () => {
    if (!confirmNode) return;
    confirmNode.href = buildPath("./recapitulatif-reservation.html", {
      sport: sportSlug,
      city,
      coach,
      service,
      duration,
      price,
      objective,
      format,
      package: packageLabel,
      slot: selectedSlot,
      mentor: selectedMentor,
    });
  };

  const renderCoachOptions = () => {
    if (!coachGrid) return;

    coachGrid.innerHTML = coaches
      .map(
        (item) => `
          <button class="reservation-coach-option ${item.name === selectedMentor ? "is-active" : ""}" type="button" data-mentor="${item.name}">
            <span class="reservation-coach-id">${item.id}</span>
            <span class="reservation-coach-name">${item.name}</span>
            <span class="reservation-coach-radio" aria-hidden="true"></span>
          </button>
        `
      )
      .join("");

    coachGrid.querySelectorAll("[data-mentor]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedMentor = button.dataset.mentor || "Sans prfrence";
        renderCoachOptions();
        updateConfirmHref();
      });
    });
  };

  const renderWeek = () => {
    const currentWeek = weekSets[weekIndex];

    if (daysNode) {
      daysNode.innerHTML = currentWeek
        .map(
          (item) => `
            <div class="reservation-day">
              <strong>${item.day}</strong>
              <span>${item.date}</span>
            </div>
          `
        )
        .join("");
    }

    if (slotsGrid) {
      slotsGrid.innerHTML = currentWeek
        .map(
          (item) => `
            <div class="reservation-slot-column">
              ${
                item.slots.length
                  ? item.slots
                      .map(
                        (slot) =>
                          `<button class="reservation-slot ${slot === selectedSlot ? "is-selected" : ""}" type="button" data-slot="${slot}">${slot}</button>`
                      )
                      .join("")
                  : '<button class="reservation-slot" type="button" disabled>-</button>'
              }
            </div>
          `
        )
        .join("");

      slotsGrid.querySelectorAll("[data-slot]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedSlot = button.dataset.slot || selectedSlot;
          renderWeek();
          updateConfirmHref();
        });
      });
    }
  };

  renderCoachOptions();
  renderWeek();
  updateConfirmHref();

  removeNode?.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = buildPath("./reserver-seance.html", { sport: sportSlug, city, coach });
  });

  addNode?.addEventListener("click", () => {
    window.location.href = buildPath("./reserver-seance.html", { sport: sportSlug, city, coach });
  });

  prevButton?.addEventListener("click", () => {
    weekIndex = weekIndex === 0 ? weekSets.length - 1 : weekIndex - 1;
    renderWeek();
  });

  nextButton?.addEventListener("click", () => {
    weekIndex = (weekIndex + 1) % weekSets.length;
    renderWeek();
  });
}

if (recapPage) {
  const params = new URLSearchParams(window.location.search);
  const sport = params.get("sport") || "metiers-de-la-forme";
  const city = params.get("city") || "Marseille";
  const coach = params.get("coach") || "Studio Form Marseille";
  const service = params.get("service") || "Coaching remise en forme";
  const duration = params.get("duration") || "30min";
  const price = params.get("price") || "35 ";
  const objective = params.get("objective") || "";
  const format = params.get("format") || "";
  const packageLabel = params.get("package") || "";
  const slot = params.get("slot") || "10:00";
  const mentor = params.get("mentor") || "Coach confirm";
  const nameNode = document.querySelector("[data-recap-name]");
  const addressNode = document.querySelector("[data-recap-address]");
  const metaNode = document.querySelector("[data-recap-meta]");
  const servicesNode = document.querySelector("[data-recap-services]");
  const datetimeNode = document.querySelector("[data-recap-datetime]");
  const editNode = document.querySelector("[data-recap-edit]");
  const createNode = document.querySelector("[data-recap-create]");
  const loginNode = document.querySelector("[data-recap-login]");

  if (nameNode) nameNode.textContent = coach;
  if (addressNode) addressNode.textContent = `10 Rue du Sport, ${city}`;
  if (metaNode) metaNode.textContent = "4.9 (284 avis)  Coaching premium";
  if (datetimeNode) datetimeNode.textContent = `Vendredi 27 mars 2026  ${slot}`;

  if (servicesNode) {
    servicesNode.innerHTML = `
      <article class="recap-service-card">
        <div class="recap-service-copy">
          <strong>${service}</strong>
          <div>${duration}  ${price}  avec ${mentor}</div>
          ${sport === "metiers-de-la-forme" ? `<div>${[format, objective, packageLabel].filter(Boolean).join("  ")}</div>` : ""}
        </div>
        <a class="recap-link" href="${buildPath("./choix-coach-creneau.html", { sport, city, coach, service, duration, price, objective, format, package: packageLabel, slot, mentor })}">Supprimer</a>
      </article>
      <article class="recap-service-card">
        <div class="recap-service-copy">
          <strong>Bilan express avant sance</strong>
          <div>10min  inclus dans votre rservation</div>
        </div>
        <a class="recap-link" href="${buildPath("./reserver-seance.html", { sport, city, coach })}">Modifier</a>
      </article>
    `;
  }

  editNode?.setAttribute("href", buildPath("./choix-coach-creneau.html", { sport, city, coach, service, duration, price, objective, format, package: packageLabel, slot, mentor }));

  const accountRedirect = buildPath("./compte.html", {
    redirect: "paiement",
    sport,
    city,
    coach,
    service,
    duration,
    price,
    objective,
    format,
    package: packageLabel,
    slot,
    mentor,
  });

  createNode?.setAttribute("href", accountRedirect);
  loginNode?.setAttribute("href", accountRedirect);
}

const passwordToggle = document.querySelector(".password-toggle");
const passwordInput = document.querySelector("#account-password");

if (passwordToggle && passwordInput) {
  passwordToggle.addEventListener("click", () => {
    const isPasswordHidden = passwordInput.type === "password";
    passwordInput.type = isPasswordHidden ? "text" : "password";
    passwordToggle.classList.toggle("is-visible", isPasswordHidden);
    passwordToggle.setAttribute("aria-label", isPasswordHidden ? "Masquer le mot de passe" : "Afficher le mot de passe");
    passwordToggle.setAttribute("aria-pressed", isPasswordHidden ? "true" : "false");
  });
}

if (accountPage) {
  const params = new URLSearchParams(window.location.search);
  const statusNode = document.querySelector("[data-account-status]");
  const form = document.querySelector("[data-account-form]");
  const createForm = document.querySelector("[data-account-create-form]");
  const forgotNode = document.querySelector("[data-account-forgot]");
  const signupNode = document.querySelector("[data-account-signup]");
  const authShell = document.querySelector("[data-account-auth-shell]");
  const dashboardNodes = document.querySelectorAll("[data-account-dashboard]");
  const titleNode = document.querySelector("[data-account-title]");
  const subtitleNode = document.querySelector("[data-account-subtitle]");
  const dashboardNameNode = document.querySelector("[data-account-dashboard-name]");
  const stepNodes = document.querySelectorAll("[data-account-step]");
  const backButtons = document.querySelectorAll("[data-account-back]");
  const roleButtons = document.querySelectorAll("[data-account-role]");
  const nextSessionNameNode = document.querySelector("[data-coach-next-name]");
  const nextSessionAgeNode = document.querySelector("[data-coach-next-age]");
  const nextSessionClubNode = document.querySelector("[data-coach-next-club]");
  const nextSessionObjectiveNode = document.querySelector("[data-coach-next-objective]");
  const nextSessionLocationNode = document.querySelector("[data-coach-next-location]");
  const nextSessionSlotNode = document.querySelector("[data-coach-next-slot]");
  const nextSessionDateNode = document.querySelector("[data-coach-next-date]");
  const nextSessionLinkNode = document.querySelector("[data-coach-next-link]");
  const nextSessionTrigger = document.querySelector("[data-coach-next-trigger]");
  const coachPreviewNameNode = document.querySelector("[data-coach-preview-name]");
  const coachDisplayToggle = document.querySelector("[data-coach-display-toggle]");
  const coachDisplayMenu = document.querySelector("[data-coach-display-menu]");
  const coachDisplayInputs = document.querySelectorAll("[data-coach-display-target]");
  const redirect = params.get("redirect");
  const mode = params.get("mode");
  const isCoachMode = mode === "coach";
  const isClubMode = mode === "club";
  const paymentTarget = buildPath("./paiement.html", {
    sport: params.get("sport"),
    city: params.get("city"),
    coach: params.get("coach"),
    service: params.get("service"),
    duration: params.get("duration"),
    price: params.get("price"),
    slot: params.get("slot"),
    mentor: params.get("mentor"),
    connected: "1",
  });

  const coachName = params.get("coach") || "Steven Fordant";
  const upcomingSessions = [
    {
      name: "Vazquez Eliott",
      age: "19 ans",
      club: "Sans club",
      objective: "Objectif : perfectionnement dribble",
      location: "Lieu : Gymnase de la Paix",
      slot: "18h - 19h",
      date: "05/04",
      href: "./reserver-seance.html?sport=basketball&city=Lyon&coach=Steven%20Fordant",
    },
    {
      name: "Fordant Christopher",
      age: "22 ans",
      club: "Club Horizon",
      objective: "Objectif : reprise et coordination",
      location: "Lieu : Stade des Docks",
      slot: "19h - 20h",
      date: "06/04",
      href: "./reserver-seance.html?sport=football&city=Marseille&coach=Steven%20Fordant",
    },
    {
      name: "Seck Madison",
      age: "24 ans",
      club: "Sans club",
      objective: "Objectif : gainage et remise en forme",
      location: "Lieu : Studio Centre Ville",
      slot: "20h - 21h",
      date: "07/04",
      href: "./reserver-seance.html?sport=metiers-de-la-forme&city=Lille&coach=Steven%20Fordant",
    },
  ];
  let upcomingSessionIndex = 0;

  if (dashboardNameNode) {
    dashboardNameNode.textContent = coachName;
  }
  if (coachPreviewNameNode) {
    coachPreviewNameNode.textContent = coachName;
  }

  const renderUpcomingSession = () => {
    const currentSession = upcomingSessions[upcomingSessionIndex];
    if (!currentSession) return;
    if (nextSessionNameNode) nextSessionNameNode.textContent = currentSession.name;
    if (nextSessionAgeNode) nextSessionAgeNode.textContent = currentSession.age;
    if (nextSessionClubNode) nextSessionClubNode.textContent = currentSession.club;
    if (nextSessionObjectiveNode) nextSessionObjectiveNode.textContent = currentSession.objective;
    if (nextSessionLocationNode) nextSessionLocationNode.textContent = currentSession.location;
    if (nextSessionSlotNode) nextSessionSlotNode.textContent = currentSession.slot;
    if (nextSessionDateNode) nextSessionDateNode.textContent = currentSession.date;
    if (nextSessionLinkNode) nextSessionLinkNode.setAttribute("href", currentSession.href);
  };

  const setStatus = (message) => {
    if (!statusNode) return;
    statusNode.hidden = false;
    statusNode.textContent = message;
  };

  const setStep = (stepName) => {
    stepNodes.forEach((node) => {
      const shouldShow = node.dataset.accountStep === stepName;
      node.hidden = !shouldShow;
      node.classList.toggle("is-active", shouldShow);
    });
  };

  const setCoachDisplayMenuOpen = (open) => {
    if (!coachDisplayToggle || !coachDisplayMenu) return;
    coachDisplayToggle.setAttribute("aria-expanded", open ? "true" : "false");
    coachDisplayMenu.hidden = !open;
  };

  const syncCoachDisplayBlocks = () => {
    coachDisplayInputs.forEach((input) => {
      const target = input.dataset.coachDisplayTarget;
      if (!target) return;
      document.querySelectorAll(`[data-coach-display-block="${target}"]`).forEach((node) => {
        node.hidden = !input.checked;
      });
    });
  };

  const revealDashboard = (message) => {
    accountPage.classList.add("is-coach-mode");
    if (statusNode) {
      statusNode.hidden = true;
      statusNode.textContent = "";
    }
    setStep("signin");
    authShell?.setAttribute("hidden", "");
    dashboardNodes.forEach((node) => {
      const shouldShow = node.dataset.accountDashboard === (isClubMode ? "club" : "coach");
      node.hidden = !shouldShow;
    });
    if (titleNode) {
      titleNode.hidden = true;
    }
    if (subtitleNode) {
      subtitleNode.hidden = true;
    }
    coachDisplayToggle?.removeAttribute("hidden");
    syncCoachDisplayBlocks();
  };

  coachDisplayToggle?.addEventListener("click", () => {
    const isOpen = coachDisplayToggle.getAttribute("aria-expanded") === "true";
    setCoachDisplayMenuOpen(!isOpen);
  });

  coachDisplayInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncCoachDisplayBlocks();
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setStep(button.dataset.accountBack || "signin");
    });
  });

  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const role = button.dataset.accountRole;
      if (role === "club") {
        window.location.href = buildPath("./inscription-club.html", { source: "compte" });
        return;
      }

      setStep("create");
    });
  });

  nextSessionTrigger?.addEventListener("click", () => {
    upcomingSessionIndex = (upcomingSessionIndex + 1) % upcomingSessions.length;
    renderUpcomingSession();
  });

  document.addEventListener("click", (event) => {
    if (!coachDisplayToggle || !coachDisplayMenu) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (coachDisplayToggle.contains(target) || coachDisplayMenu.contains(target)) return;
    setCoachDisplayMenuOpen(false);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (redirect === "paiement") {
      window.location.href = paymentTarget;
      return;
    }

    if (isCoachMode) {
      revealDashboard("Connexion simulee. Le tableau de bord coach GetYourMentor est maintenant disponible.");
      return;
    }

    if (isClubMode) {
      revealDashboard("Connexion simulee. Le tableau de bord club GetYourMentor est maintenant disponible.");
      return;
    }

    setStatus("Connexion simule. Vous pouvez maintenant reprendre votre rservation ou naviguer dans le site.");
  });

  signupNode?.addEventListener("click", () => {
    if (redirect === "paiement") {
      window.location.href = paymentTarget;
      return;
    }
    setStep("create");
  });

  createForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    setStep("role");
  });

  forgotNode?.addEventListener("click", (event) => {
    event.preventDefault();
    setStatus("Un lien de rinitialisation serait envoy  votre adresse e-mail dans la version finale.");
    document.querySelector("#account-email")?.focus();
  });

  if ((isCoachMode || isClubMode) && params.get("connected") === "1" && redirect !== "paiement") {
    revealDashboard(isClubMode ? "Connexion detectee. Vous retrouvez directement votre espace club." : "Connexion detectee. Vous retrouvez directement votre espace coach.");
  }

  renderUpcomingSession();
}

if (paymentPage) {
  const params = new URLSearchParams(window.location.search);
  const coach = params.get("coach") || "Studio Form Marseille";
  const city = params.get("city") || "Marseille";
  const service = params.get("service") || "Coaching remise en forme";
  const duration = params.get("duration") || "30min";
  const price = params.get("price") || "35 ";
  const objective = params.get("objective") || "";
  const format = params.get("format") || "";
  const packageLabel = params.get("package") || "";
  const slot = params.get("slot") || "10:00";
  const mentor = params.get("mentor") || "Coach confirm";
  const methodButtons = document.querySelectorAll(".payment-method");
  const submitButton = document.querySelector("[data-payment-submit]");
  const successCard = document.querySelector("[data-payment-success]");
  let selectedMethod = "card";

  document.querySelector("[data-payment-name]")?.replaceChildren(`${coach} - ${city}`);
  document.querySelector("[data-payment-service]")?.replaceChildren(service);
  document.querySelector("[data-payment-duration]")?.replaceChildren([duration, format, objective, packageLabel].filter(Boolean).join("  "));
  document.querySelector("[data-payment-datetime]")?.replaceChildren(`Vendredi 27 mars 2026  ${slot}`);
  document.querySelector("[data-payment-price]")?.replaceChildren(price);
  document.querySelector("[data-payment-mentor]")?.replaceChildren(mentor);

  methodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedMethod = button.dataset.method || "card";
      methodButtons.forEach((node) => node.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  submitButton?.addEventListener("click", () => {
    successCard?.removeAttribute("hidden");
    submitButton.textContent =
      selectedMethod === "onsite" ? "Rservation enregistre" : "Paiement confirm";
    successCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
