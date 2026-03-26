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
    title: "Réserver en ligne un coach de football",
  },
  basketball: {
    name: "Basketball",
    search: "Coachs de basketball",
    title: "Réserver en ligne un coach de basketball",
  },
  "metiers-de-la-forme": {
    name: "Métiers de la forme",
    search: "Coachs métiers de la forme",
    title: "Réserver en ligne un coach métiers de la forme",
  },
  "sports-de-combat": {
    name: "Sports de combat",
    search: "Coachs sports de combat",
    title: "Réserver en ligne un coach de sports de combat",
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

if (homeSearchForm) {
  homeSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const sportValue = homeSearchForm.querySelector("[data-home-sport-input]")?.value || "football";
    const cityValue = homeSearchForm.querySelector("[data-home-city-input]")?.value || "";
    navigateToSearch(sportValue, cityValue);
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

    if (heading) heading.textContent = `Coachs de ${currentSport.name} à ${city}`;
  });
}

const directoryDictionary = {
  football: {
    name: "Football",
    chips: ["Coach individuel", "Préparation match", "Centre indoor"],
    getTitle: () => "Sélectionnez un coach de football",
    getSubtitle: (city) => `Les meilleurs coachs à proximité de ${city} : réservation en ligne`,
    getCoaches: (city) => [
      { name: "Thomas Dubois", address: `5 Rue du Stade, ${city}`, meta: "4.9 (33 avis) • Premium", morning: ["Jeu. 26"], afternoon: ["Ven. 27"], cta: "Prendre RDV" },
      { name: "Mehdi Rahal", address: `7 Avenue des Appuis, ${city}`, meta: "4.8 (19 avis) • Intensif", morning: ["Lun. 30"], afternoon: ["Mar. 31"], cta: "Voir le coach" },
    ],
  },
  basketball: {
    name: "Basketball",
    chips: ["Shooting", "Défense", "Condition physique"],
    getTitle: () => "Sélectionnez un coach de basketball",
    getSubtitle: (city) => `Les meilleurs coachs à proximité de ${city} : réservation en ligne`,
    getCoaches: (city) => [
      { name: "Sarah Benali", address: `12 Rue des Arceaux, ${city}`, meta: "5.0 (21 avis) • Elite", morning: ["Jeu. 26"], afternoon: ["Sam. 28"], cta: "Prendre RDV" },
      { name: "Nolan Vasseur", address: `18 Quai Central, ${city}`, meta: "4.7 (12 avis) • Junior / Pro", morning: ["Ven. 27"], afternoon: ["Lun. 30"], cta: "Voir le coach" },
    ],
  },
  "metiers-de-la-forme": {
    name: "Métiers de la forme",
    chips: ["Coach individuel", "Salle premium", "Programme forme"],
    getTitle: () => "Sélectionnez un coach de la forme",
    getSubtitle: (city) => `Les meilleurs coachs et studios aux alentours de ${city} : réservation en ligne`,
    getCoaches: (city) => [
      { name: "Studio Form Marseille", address: `5 Rue de la Forme, ${city}`, meta: "5 (33 avis) • Premium", morning: ["Jeu. 26"], afternoon: ["Jeu. 26"], cta: "Prendre RDV" },
      { name: "Kenza Training Club", address: `7 Rue de la République, ${city}`, meta: "4.9 (189 avis) • Club", morning: ["Ven. 27"], afternoon: ["Sam. 28"], cta: "Prendre RDV" },
      { name: "Pulse Mobility", address: `22 Place du Centre, ${city}`, meta: "4.8 (41 avis) • Mobilité", morning: ["Lun. 30"], afternoon: ["Mar. 31"], cta: "Voir le coach" },
    ],
  },
  "sports-de-combat": {
    name: "Sports de combat",
    chips: ["Boxe", "MMA", "Self-défense"],
    getTitle: () => "Sélectionnez un coach de sports de combat",
    getSubtitle: (city) => `Les meilleurs coachs à proximité de ${city} : réservation en ligne`,
    getCoaches: (city) => [
      { name: "Ines Caron Fight Club", address: `4 Boulevard Arena, ${city}`, meta: "4.9 (26 avis) • Performance", morning: ["Jeu. 26"], afternoon: ["Ven. 27"], cta: "Prendre RDV" },
      { name: "Combat Lab", address: `14 Rue des Champions, ${city}`, meta: "4.8 (17 avis) • Club", morning: ["Sam. 28"], afternoon: ["Lun. 30"], cta: "Voir le coach" },
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
      .map((coach) => {
        const detailsLink = buildPath("./reserver-seance.html", {
          sport: sportSlug,
          city,
          coach: coach.name,
        });

        return `
          <article class="coach-result-card">
            <div class="coach-result-media"></div>
            <div class="coach-result-body">
              <div class="coach-result-top">
                <h2>${coach.name}</h2>
                <div class="coach-result-address">${coach.address}</div>
                <div class="coach-result-meta">${coach.meta}</div>
              </div>
              <div class="coach-result-slots">
                <strong>Matin</strong>
                <div class="coach-slot-list">${coach.morning.map((slot) => `<button class="coach-slot" type="button">${slot}</button>`).join("")}</div>
                <strong>Après-midi</strong>
                <div class="coach-slot-list">${coach.afternoon.map((slot) => `<button class="coach-slot" type="button">${slot}</button>`).join("")}</div>
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
      { title: "Avant votre séance", subtitle: "Objectifs, poste et niveau actuel", more: "Le coach prépare la séance selon votre profil et vos axes de progression.", duration: "15min" },
      { title: "Organisation du rendez-vous", subtitle: "Lieu, matériel et confirmation", more: "La séance est confirmée après validation du créneau et du terrain.", duration: "10min" },
      { title: "Conditions de réservation", subtitle: "Annulation et reprogrammation", more: "Toute réservation validée bloque un créneau dédié du coach.", duration: "2min" },
    ],
    services: [
      { title: "Séance technique individuelle", subtitle: "1 joueur - appuis, conduite, lecture du jeu", more: "Travail ciblé sur vos points forts et vos axes de progression.", duration: "30min", price: "35 €" },
      { title: "Séance intensité match", subtitle: "Explosivité, prise d'information et finition", more: "Format premium avec retour personnalisé du coach en fin de séance.", duration: "45min", price: "55 €" },
    ],
  },
  basketball: {
    category: "Basketball - Développement joueur",
    info: [
      { title: "Bilan de départ", subtitle: "Poste, niveau et attentes", more: "Les fondamentaux à travailler sont identifiés avant le rendez-vous.", duration: "15min" },
      { title: "Infos de séance", subtitle: "Terrain, équipement et accès", more: "Le coach confirme la disponibilité du terrain et le matériel utile.", duration: "10min" },
      { title: "Politique de réservation", subtitle: "Annulation et acompte", more: "Annulation possible jusqu'à 24h avant selon le créneau choisi.", duration: "2min" },
    ],
    services: [
      { title: "Shooting et mécanique", subtitle: "Gestuelle, rythme et constance", more: "Séance ciblée pour gagner en régularité et en confiance au tir.", duration: "30min", price: "35 €" },
      { title: "Session intensité", subtitle: "Enchaînements, lecture et cardio", more: "Pour des joueurs ambitieux qui veulent franchir un cap rapidement.", duration: "50min", price: "60 €" },
    ],
  },
  "metiers-de-la-forme": {
    category: "Forme - Coaching premium",
    info: [
      { title: "Avant votre séance", subtitle: "Objectif forme, niveau et contraintes", more: "Le coach adapte la séance à votre niveau, votre énergie du moment et votre objectif.", duration: "15min" },
      { title: "Infos pratiques", subtitle: "Horaires flexibles et accès", more: "La réservation en ligne est validée après confirmation du coach et du lieu de séance.", duration: "10min" },
      { title: "Conditions de réservation", subtitle: "Report et annulation", more: "En cas d'empêchement, le créneau peut être reprogrammé selon les disponibilités.", duration: "2min" },
      { title: "Séances week-end", subtitle: "Sous réserve de disponibilité", more: "Certaines séances du dimanche nécessitent une validation préalable du coach.", duration: "1min" },
    ],
    services: [
      { title: "Coaching remise en forme", subtitle: "Renforcement, cardio doux et mobilité", more: "Une séance claire, progressive et premium pour reprendre ou relancer votre routine.", duration: "30min", price: "35 €" },
      { title: "Coaching transformation", subtitle: "Condition physique, intensité et suivi", more: "Format plus complet pour celles et ceux qui veulent une vraie montée en charge.", duration: "45min", price: "48 €" },
    ],
  },
  "sports-de-combat": {
    category: "Combat - Séance premium",
    info: [
      { title: "Avant votre séance", subtitle: "Objectif, niveau et discipline", more: "Le coach définit le format selon votre pratique et votre expérience.", duration: "10min" },
      { title: "Règles de sécurité", subtitle: "Matériel obligatoire", more: "Gants, protège-tibias ou protections peuvent être fournis sur demande.", duration: "5min" },
    ],
    services: [
      { title: "Cours privé boxe", subtitle: "Technique, cardio et garde", more: "Une session premium, progressive et structurée.", duration: "45min", price: "55 €" },
      { title: "Self-defense premium", subtitle: "Mouvements utiles et confiance", more: "Parfait pour une progression concrète, rassurante et lisible.", duration: "50min", price: "60 €" },
    ],
  },
};

if (bookingPage) {
  const params = new URLSearchParams(window.location.search);
  const sportSlug = params.get("sport") || "metiers-de-la-forme";
  const city = params.get("city") || "Paris";
  const coach = params.get("coach") || "Studio Form Marseille";
  const currentBooking = bookingDictionary[sportSlug] || bookingDictionary["metiers-de-la-forme"];
  const nameNode = document.querySelector("[data-booking-name]");
  const addressNode = document.querySelector("[data-booking-address]");
  const metaNode = document.querySelector("[data-booking-meta]");
  const headingNode = document.querySelector("[data-booking-heading]");
  const categoryNode = document.querySelector("[data-booking-category]");
  const infoList = document.querySelector("[data-booking-info-list]");
  const serviceList = document.querySelector("[data-booking-service-list]");
  const ratingBody = document.querySelector("[data-rating-body]");
  const bookingTabs = document.querySelectorAll("[data-booking-tab]");
  const bookingGhostButtons = document.querySelectorAll("[data-booking-nav]");
  const ratingTabs = document.querySelectorAll("[data-rating-tab]");

  if (nameNode) nameNode.textContent = coach;
  if (addressNode) addressNode.textContent = `10 Rue du Sport, ${city}`;
  if (metaNode) metaNode.textContent = "4.9 (284 avis) • Coaching premium";
  if (headingNode) headingNode.textContent = `Réserver en ligne une séance chez ${coach}`;
  if (categoryNode) categoryNode.textContent = currentBooking.category;

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
              })}">Choisir</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  const setActiveBookingTab = (value) => {
    bookingTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.bookingTab === value);
    });
  };

  bookingGhostButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveBookingTab(button.dataset.bookingNav || "reserver");
      document.querySelector("#booking-services")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  bookingTabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveBookingTab(tab.dataset.bookingTab || "reserver"));
  });

  ratingTabs.forEach((button) => {
    button.addEventListener("click", () => {
      ratingTabs.forEach((node) => node.classList.remove("is-active"));
      button.classList.add("is-active");

      if (!ratingBody) return;

      if (button.dataset.ratingTab === "reviews") {
        ratingBody.innerHTML = `
          <div class="booking-rating-lines booking-rating-reviews">
            <div>"Séance très claire et ultra motivante." <strong>— Camille</strong></div>
            <div>"Coach ponctuel, exercices adaptés et très bonne énergie." <strong>— Mehdi</strong></div>
            <div>"On se sent accompagné du début à la fin." <strong>— Sarah</strong></div>
            <p>Extraits d'avis visibles dans la maquette.</p>
          </div>
        `;
        return;
      }

      ratingBody.innerHTML = `
        <div class="booking-rating-score">4,9</div>
        <div class="booking-rating-lines">
          <div>Accueil <strong>4,9 ★</strong></div>
          <div>Ponctualité <strong>4,9 ★</strong></div>
          <div>Cadre &amp; ambiance <strong>4,8 ★</strong></div>
          <div>Qualité de l'accompagnement <strong>4,9 ★</strong></div>
          <p>284 clients ont donné leur avis</p>
        </div>
      `;
    });
  });
}

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

if (reservationMultiPage) {
  const params = new URLSearchParams(window.location.search);
  const sportSlug = params.get("sport") || "metiers-de-la-forme";
  const city = params.get("city") || "Marseille";
  const coach = params.get("coach") || "Studio Form Marseille";
  const service = params.get("service") || "Coaching remise en forme";
  const duration = params.get("duration") || "30min";
  const price = params.get("price") || "35 €";
  let selectedSlot = params.get("slot") || "10:00";
  let selectedMentor = params.get("mentor") || "Sans préférence";
  let weekIndex = 0;

  const coaches = [
    { id: "SP", name: "Sans préférence" },
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
  if (metaNode) metaNode.textContent = "4.9 (423 avis) • Coaching premium";
  if (serviceNode) serviceNode.textContent = service;
  if (serviceMetaNode) serviceMetaNode.textContent = `${duration} • ${price}`;

  const updateConfirmHref = () => {
    if (!confirmNode) return;
    confirmNode.href = buildPath("./recapitulatif-reservation.html", {
      sport: sportSlug,
      city,
      coach,
      service,
      duration,
      price,
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
        selectedMentor = button.dataset.mentor || "Sans préférence";
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
  const price = params.get("price") || "35 €";
  const slot = params.get("slot") || "10:00";
  const mentor = params.get("mentor") || "Coach confirmé";
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
  if (metaNode) metaNode.textContent = "4.9 (284 avis) • Coaching premium";
  if (datetimeNode) datetimeNode.textContent = `Vendredi 27 mars 2026 à ${slot}`;

  if (servicesNode) {
    servicesNode.innerHTML = `
      <article class="recap-service-card">
        <div class="recap-service-copy">
          <strong>${service}</strong>
          <div>${duration} • ${price} • avec ${mentor}</div>
        </div>
        <a class="recap-link" href="${buildPath("./choix-coach-creneau.html", { sport, city, coach, service, duration, price, slot, mentor })}">Supprimer</a>
      </article>
      <article class="recap-service-card">
        <div class="recap-service-copy">
          <strong>Bilan express avant séance</strong>
          <div>10min • inclus dans votre réservation</div>
        </div>
        <a class="recap-link" href="${buildPath("./reserver-seance.html", { sport, city, coach })}">Modifier</a>
      </article>
    `;
  }

  editNode?.setAttribute("href", buildPath("./choix-coach-creneau.html", { sport, city, coach, service, duration, price, slot, mentor }));

  const accountRedirect = buildPath("./compte.html", {
    redirect: "paiement",
    sport,
    city,
    coach,
    service,
    duration,
    price,
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
  const forgotNode = document.querySelector("[data-account-forgot]");
  const signupNode = document.querySelector("[data-account-signup]");
  const redirect = params.get("redirect");
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

  const setStatus = (message) => {
    if (!statusNode) return;
    statusNode.hidden = false;
    statusNode.textContent = message;
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (redirect === "paiement") {
      window.location.href = paymentTarget;
      return;
    }

    setStatus("Connexion simulée. Vous pouvez maintenant reprendre votre réservation ou naviguer dans le site.");
  });

  signupNode?.addEventListener("click", () => {
    if (redirect === "paiement") {
      window.location.href = paymentTarget;
      return;
    }

    setStatus("Création de compte simulée. Votre profil est prêt pour réserver une prochaine séance.");
  });

  forgotNode?.addEventListener("click", (event) => {
    event.preventDefault();
    setStatus("Un lien de réinitialisation serait envoyé à votre adresse e-mail dans la version finale.");
    document.querySelector("#account-email")?.focus();
  });
}

if (paymentPage) {
  const params = new URLSearchParams(window.location.search);
  const coach = params.get("coach") || "Studio Form Marseille";
  const city = params.get("city") || "Marseille";
  const service = params.get("service") || "Coaching remise en forme";
  const duration = params.get("duration") || "30min";
  const price = params.get("price") || "35 €";
  const slot = params.get("slot") || "10:00";
  const mentor = params.get("mentor") || "Coach confirmé";
  const methodButtons = document.querySelectorAll(".payment-method");
  const submitButton = document.querySelector("[data-payment-submit]");
  const successCard = document.querySelector("[data-payment-success]");
  let selectedMethod = "card";

  document.querySelector("[data-payment-name]")?.replaceChildren(`${coach} - ${city}`);
  document.querySelector("[data-payment-service]")?.replaceChildren(service);
  document.querySelector("[data-payment-duration]")?.replaceChildren(duration);
  document.querySelector("[data-payment-datetime]")?.replaceChildren(`Vendredi 27 mars 2026 à ${slot}`);
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
      selectedMethod === "onsite" ? "Réservation enregistrée" : "Paiement confirmé";
    successCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
