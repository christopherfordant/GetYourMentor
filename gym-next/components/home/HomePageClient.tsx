"use client";

import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import styles from "./home-refined.module.css";
const HomeFaqSection = dynamic(
  () => import("./HomeFaqSection").then((module) => module.HomeFaqSection),
  { ssr: false, loading: () => <div aria-hidden="true" className="home-deferred-placeholder home-deferred-placeholder-faq" /> },
);
const HomeBelowFoldSections = dynamic(
  () => import("./HomeBelowFoldSections").then((module) => module.HomeBelowFoldSections),
  { ssr: false, loading: () => <div aria-hidden="true" className="home-deferred-placeholder home-deferred-placeholder-sections" /> },
);
import {
  metrics,
  paymentSlides,
  profileSlides,
  slotSlides,
  sportLinks,
  type SportSlug,
} from "./home-data";

const normalize = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const inferSportSlug = (value = ""): SportSlug => {
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

const sportVisuals: Record<SportSlug, string> = {
  football: "/design_assets/content_library/emergent/football.jpg",
  basketball: "/design_assets/content_library/emergent/basketball.jpg",
  "metiers-de-la-forme": "/design_assets/content_library/emergent/fitness.jpg",
  "sports-de-combat": "/design_assets/content_library/emergent/combat.jpg",
};

const experienceSlides = [
  { title: "Séances en extérieur", copy: "Entraîne-toi au grand air avec un plan sur-mesure.", image: sportVisuals.football },
  { title: "Stratégie de jeu", copy: "Analyse, placements et prise de décision pour passer un cap.", image: sportVisuals["metiers-de-la-forme"] },
  { title: "Préparation physique", copy: "Un plan progressif pour gagner en force, mobilité et confiance.", image: sportVisuals["metiers-de-la-forme"] },
  { title: "Préparation mentale", copy: "Concentration, régularité et confiance dans chaque séance.", image: sportVisuals["sports-de-combat"] },
];

const experienceGalleries = [
  [sportVisuals.basketball, sportVisuals["metiers-de-la-forme"]],
  [sportVisuals.football, sportVisuals["sports-de-combat"]],
  [sportVisuals.basketball, sportVisuals.football],
  [sportVisuals["metiers-de-la-forme"], sportVisuals.basketball],
];

function StepDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={index === activeIndex ? styles.dotActive : styles.dot} />
      ))}
    </div>
  );
}

export function HomePageClient({ allowDemoFallback = false }: { allowDemoFallback?: boolean }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [sportInput, setSportInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [profileIndex, setProfileIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [paymentIndex, setPaymentIndex] = useState(0);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [experienceIndex, setExperienceIndex] = useState(0);
  const journeyViewportRef = useRef<HTMLDivElement>(null);
  const journeyTrackRef = useRef<HTMLDivElement>(null);
  const journeyDragRef = useRef<any>(null);

  // GSAP is intentionally initialized after the first paint. This keeps the
  // mobile hero responsive while preserving the same journey interactions.
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    const initialize = async () => {
      const [{ Draggable }, { InertiaPlugin }] = await Promise.all([
        import("gsap/Draggable"),
        import("gsap/InertiaPlugin"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(Draggable, InertiaPlugin);

      const viewport = journeyViewportRef.current;
      const track = journeyTrackRef.current;
      if (!viewport || !track) return;

    const getSlide = () => track.querySelector<HTMLElement>("[data-journey-slide]");
    const getSlideWidth = () => getSlide()?.getBoundingClientRect().width || viewport.getBoundingClientRect().width;
    const getStride = () => getSlideWidth() + Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
    const getCenterOffset = () => (viewport.getBoundingClientRect().width - getSlideWidth()) / 2;
    const snapX = (value: number) => {
      const stride = getStride();
      const offset = getCenterOffset();
      return stride ? offset - Math.round((offset - value) / stride) * stride : value;
    };
    const updateIndex = (value: number) => {
      const stride = getStride();
      const offset = getCenterOffset();
      if (!stride) return;
      setJourneyIndex(Math.max(0, Math.min(3, Math.round((offset - value) / stride))));
    };
    const getBounds = () => {
      const offset = getCenterOffset();
      return { minX: offset - getStride() * 3, maxX: offset };
    };

    const draggable = Draggable.create(track, {
      type: "x",
      inertia: true,
      bounds: getBounds(),
      edgeResistance: 0.86,
      snap: snapX,
      allowNativeTouchScrolling: true,
      lockAxis: true,
      onDrag: function () { updateIndex(this.x); },
      onThrowUpdate: function () { updateIndex(this.x); },
      onRelease: function () { updateIndex(this.x); },
    })[0];
    gsap.set(track, { x: getCenterOffset() });
    journeyDragRef.current = draggable;
    const onResize = () => { draggable.applyBounds(getBounds()); gsap.set(track, { x: snapX(draggable.x) }); };
    window.addEventListener("resize", onResize);
    cleanup = () => {
      window.removeEventListener("resize", onResize);
      draggable.kill();
      journeyDragRef.current = null;
    };
    };

    void initialize();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const goToJourney = (index: number) => {
    const next = Math.max(0, Math.min(3, index));
    setJourneyIndex(next);
    const track = journeyTrackRef.current;
    const viewport = journeyViewportRef.current;
    if (track && viewport) {
      const slide = track.querySelector<HTMLElement>("[data-journey-slide]");
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0");
      const stride = (slide?.getBoundingClientRect().width || viewport.getBoundingClientRect().width) + gap;
      const offset = (viewport.getBoundingClientRect().width - (slide?.getBoundingClientRect().width || viewport.getBoundingClientRect().width)) / 2;
      const targetX = offset - next * stride;
      gsap.killTweensOf(track);
      gsap.to(track, {
        x: targetX,
        duration: 0.8,
        ease: "expo.out",
        overwrite: true,
        onComplete: () => journeyDragRef.current?.update(true),
      });
    }
  };

  const goToExperience = (index: number) => {
    setExperienceIndex((index + experienceSlides.length) % experienceSlides.length);
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY >= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeProfile = profileSlides[profileIndex];
  const activeSlot = slotSlides[slotIndex];
  const activePayment = paymentSlides[paymentIndex];
  const experiencePreviousIndex = (experienceIndex + experienceSlides.length - 1) % experienceSlides.length;
  const experienceNextIndex = (experienceIndex + 1) % experienceSlides.length;
  const displayedProfile = allowDemoFallback ? activeProfile : {
    ...activeProfile,
    name: "Coach vérifié",
    meta: "Profil réel après recherche",
    detail: "Compare les disponibilités, le format et les informations du coach.",
    price: "Tarif affiché sur le profil",
    cta: "Explorer les coachs",
  };
  const displayedPayment = allowDemoFallback ? activePayment : {
    ...activePayment,
    title: "Session à confirmer",
    date: "Après validation du coach",
    detail: "Paiement sécurisé après acceptation",
    total: "Selon le coach",
  };
  const activeCity = activeProfile.meta.split(" - ")[1] || "Paris";

  const searchTarget = useMemo(() => {
    const sport = inferSportSlug(sportInput || activeProfile.meta);
    const city = cityInput.trim();
    return city ? `/recherche?sport=${sport}&city=${encodeURIComponent(city)}` : `/recherche?sport=${sport}`;
  }, [activeProfile.meta, cityInput, sportInput]);

  const handleSearch = () => {
    router.push(searchTarget);
  };

  return (
    <div className={styles.page}>
      <header data-gsap-header className={`${styles.topbar} ${isScrolled ? styles.topbarScrolled : ""}`}>
        <div className={styles.brandLockup}>
          <Link href="/" className={styles.brandName} data-gsap-header-item>
            <span className={styles.brandIcon} aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 8v8M4.5 10v4M9.5 6v12M17 8v8m2.5-6v4M14.5 6v12M9.5 12h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>
            GetYourMentor
          </Link>
        </div>

        <nav className={styles.sportsNav} aria-label="Sports">
          {sportLinks.map((sport) => (
              <Link key={sport.slug} href={`/recherche?sport=${sport.slug}`} className={styles.sportLink} data-gsap-header-item data-sport-tab={sport.slug}>
              {sport.label}
            </Link>
          ))}
        </nav>

        <div className={styles.topbarActions}>
          <LanguageSelector />
          <Link href="/compte?mode=coach" className={styles.topbarLink} data-gsap-header-item>
            Je suis coach
          </Link>
          <Link href="/compte" className={styles.accountButton} data-gsap-header-item>
            <span className={styles.accountIcon} aria-hidden="true">
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
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} data-gsap-hero>
          <div className={styles.heroBackdrop}>
            <Image
              src="/design_assets/content_library/emergent/hero-athlete.webp"
              alt="Athlète en pleine action sportive"
                fill
                priority
                sizes="100vw"
              quality={65}
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent} data-gsap-hero-content>
            <p className={styles.eyebrow} data-gsap-hero-item>Plateforme #1 en France</p>
            <h1 className={styles.heroTitle} data-gsap-hero-item><span>Trouve ton coach.</span> <span className={styles.heroAccent}>Progresse vraiment.</span></h1>
            <p className={styles.heroCopy} data-gsap-hero-item>Des coachs certifiés en Football, Basketball, Fitness et Sports de combat. Réserve ta session en quelques clics.</p>

            <div className={styles.searchCard} data-gsap-hero-item>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Quel sport ?</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  data-home-sport-input
                  placeholder="Football, fitness..."
                  value={sportInput}
                  onChange={(event) => setSportInput(event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Où t’entraîner ?</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  data-home-city-input
                  placeholder="Ville ou visio"
                  value={cityInput}
                  onChange={(event) => setCityInput(event.target.value)}
                />
              </label>

              <button className={styles.searchButton} type="button" aria-label="Rechercher" data-home-search-button onClick={handleSearch}>
                Trouver un coach
              </button>
            </div>
            <div className={styles.heroMetrics} data-gsap-hero-item aria-label="Repères GetYourMentor">
              {metrics.map((metric) => (
                <div key={metric.label} className={styles.heroMetric}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sportRail} data-gsap-scene="sports" aria-labelledby="sport-rail-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionKicker}>Choisir son terrain</p>
            <h2 id="sport-rail-title">Choisis ton terrain de jeu</h2>
          </div>
          <div className={styles.sportRailGrid}>
            {sportLinks.map((sport, index) => (
              <Link key={sport.slug} href={`/recherche?sport=${sport.slug}`} className={styles.sportRailCard} data-gsap-stagger data-sport-motion={sport.slug === "metiers-de-la-forme" ? "fitness" : sport.slug === "sports-de-combat" ? "combat" : sport.slug}>
                <Image src={sportVisuals[sport.slug]} alt="" fill loading="lazy" sizes="(max-width: 900px) 100vw, 25vw" quality={60} className={styles.sportRailImage} />
                <span className={styles.sportRailShade} aria-hidden="true" />
                <span className={styles.sportRailCopy}>
                  <span className={styles.sportRailIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <strong className={styles.sportRailLabel}>{sport.label}</strong>
                  <span className={styles.sportRailAction}>{sport.coachCount}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.experienceSection}`} data-gsap-scene="experiences" aria-labelledby="experience-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionKicker}>Expériences</p>
            <h2 id="experience-title">Un coaching sur-mesure</h2>
            <span className={styles.experienceCounter}>{String(experienceIndex + 1).padStart(2, "0")} / 04</span>
          </div>
          <div className={styles.experienceCarousel} aria-live="polite">
            <div className={styles.experienceMedia}>
              <div className={styles.experienceStage} aria-label="Carrousel des expériences">
                {[experiencePreviousIndex, experienceIndex, experienceNextIndex].map((slideIndex, position) => (
                  <div key={slideIndex} className={`${styles.experienceSlide} ${position === 1 ? styles.experienceSlideActive : position === 0 ? styles.experienceSlideSideLeft : styles.experienceSlideSideRight}`}>
                    <Image src={experienceSlides[slideIndex].image} alt={experienceSlides[slideIndex].title} fill loading="lazy" sizes="(max-width: 900px) 76vw, 52vw" quality={60} className={styles.experienceImage} />
                  </div>
                ))}
              </div>
              <div className={styles.experienceShade} aria-hidden="true" />
              <div className={styles.experienceCaption}>
                <h3>{experienceSlides[experienceIndex].title}</h3>
                <p>{experienceSlides[experienceIndex].copy}</p>
              </div>
            </div>
            <div className={styles.experienceControls} aria-label="Navigation des expériences">
              <button className={styles.carouselButton} type="button" aria-label="Expérience précédente" onClick={() => goToExperience(experienceIndex - 1)}>‹</button>
              <div className={styles.experienceDots}>
                {experienceSlides.map((slide, index) => <button key={slide.title} type="button" aria-label={`Aller à l'expérience ${index + 1}`} aria-current={experienceIndex === index} onClick={() => goToExperience(index)} />)}
              </div>
              <button className={styles.carouselButton} type="button" aria-label="Expérience suivante" onClick={() => goToExperience(experienceIndex + 1)}>›</button>
            </div>
          </div>
        </section>

        <section className={styles.section} data-gsap-section="journey">
          <div className={styles.sectionHeading} data-gsap-heading>
            <p className={styles.sectionKicker}>Ton parcours</p>
            <h2>De l'inscription à ton premier record</h2>
            <p className={styles.carouselHint}>Fais glisser pour découvrir les 4 étapes</p>
          </div>
          <div className="journey-light-line" data-gsap-line aria-hidden="true" />

          <div className={styles.carouselViewport} aria-live="polite" ref={journeyViewportRef}>
          <div className={styles.carouselControls} aria-label="Navigation du parcours">
            <button className={styles.carouselButton} type="button" aria-label="Étape précédente" disabled={journeyIndex === 0} onClick={() => goToJourney(journeyIndex - 1)}>‹</button>
            <span className={styles.carouselCounter}>{String(journeyIndex + 1).padStart(2, "0")} / 04</span>
            <button className={styles.carouselButton} type="button" aria-label="Étape suivante" disabled={journeyIndex === 3} onClick={() => goToJourney(journeyIndex + 1)}>›</button>
          </div>
          <div className={styles.howGrid} ref={journeyTrackRef}>
            <article className={styles.stepCard} data-gsap-card data-journey-slide data-active={journeyIndex === 0}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>1</span>
                <h3>Choisis ton coach</h3>
              </div>
              <div className={styles.miniScreen}>
                <div className={styles.slideMedia}>
                  <Image src={displayedProfile.image} alt={displayedProfile.name} fill sizes="(max-width: 900px) 100vw, 33vw" className={styles.cardImage} />
                </div>
                <div className={styles.slideContent}>
                  <h4>{displayedProfile.name}</h4>
                  <p className={styles.slideMeta}>{displayedProfile.meta}</p>
                  <p className={styles.slideDetail}>{displayedProfile.detail}</p>
                  <span className={styles.pill}>{displayedProfile.price}</span>
                  <button
                    className={styles.darkButton}
                    type="button"
                    onClick={() => router.push(allowDemoFallback
                      ? `/coach?sport=${inferSportSlug(activeProfile.meta)}&city=${encodeURIComponent(activeCity)}&coach=${encodeURIComponent(activeProfile.name)}`
                      : searchTarget)}
                  >
                    {displayedProfile.cta}
                  </button>
                </div>
                <div className={styles.stepActions}>
                  <button
                    className={styles.arrowButton}
                    type="button"
                    onClick={() => setProfileIndex((current) => (current + profileSlides.length - 1) % profileSlides.length)}
                  >
                    ‹
                  </button>
                  <StepDots count={profileSlides.length} activeIndex={profileIndex} />
                  <button
                    className={styles.arrowButton}
                    type="button"
                    onClick={() => setProfileIndex((current) => (current + 1) % profileSlides.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </article>

            <article className={styles.stepCard} data-gsap-card data-journey-slide data-active={journeyIndex === 1}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>2</span>
                <h3>Bloque tes créneaux</h3>
              </div>
              <div className={styles.miniScreen}>
                <p className={styles.slideCaption}>{activeSlot.title}</p>
                <div className={styles.slotVisual}>
                  <Image src={activeSlot.visual} alt={activeSlot.title} fill sizes="(max-width: 900px) 100vw, 33vw" className={styles.cardImage} />
                </div>
                <div className={styles.slotRow}>
                  {activeSlot.slots.map((slot, index) => (
                    <button key={slot} className={index === 0 ? styles.slotSelected : styles.slotButton} type="button">
                      {slot}
                    </button>
                  ))}
                </div>
                <p className={styles.slotSelection}>{activeSlot.selection}</p>
                <button
                  className={styles.softButton}
                  type="button"
                    onClick={() => router.push(allowDemoFallback
                      ? `/creneau?sport=${inferSportSlug(activeProfile.meta)}&city=${encodeURIComponent(activeCity)}&coach=${encodeURIComponent(activeProfile.name)}`
                      : searchTarget)}
                >
                  {activeSlot.cta}
                </button>
                <div className={styles.stepActions}>
                  <button
                    className={styles.arrowButton}
                    type="button"
                    onClick={() => setSlotIndex((current) => (current + slotSlides.length - 1) % slotSlides.length)}
                  >
                    ‹
                  </button>
                  <StepDots count={slotSlides.length} activeIndex={slotIndex} />
                  <button
                    className={styles.arrowButton}
                    type="button"
                    onClick={() => setSlotIndex((current) => (current + 1) % slotSlides.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </article>

            <article className={styles.stepCard} data-gsap-card data-journey-slide data-active={journeyIndex === 2}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>3</span>
                <h3>Valide ta session</h3>
              </div>
              <div className={styles.miniScreen}>
                <div className={styles.paymentVisual} />
                <span className={styles.paymentStrong}>{displayedPayment.title}</span>
                <span className={styles.paymentRow}>{displayedPayment.date}</span>
                <span className={styles.paymentRow}>{displayedPayment.detail}</span>
                <div className={styles.paymentTotal}>
                  <span>Total</span>
                  <strong>{displayedPayment.total}</strong>
                </div>
                <button className={styles.darkButton} type="button" onClick={() => router.push("/paiement")}>
                  Payer maintenant
                </button>
                <div className={styles.stepActions}>
                  <button
                    className={styles.arrowButton}
                    type="button"
                    onClick={() => setPaymentIndex((current) => (current + paymentSlides.length - 1) % paymentSlides.length)}
                  >
                    ‹
                  </button>
                  <StepDots count={paymentSlides.length} activeIndex={paymentIndex} />
                  <button
                    className={styles.arrowButton}
                    type="button"
                    onClick={() => setPaymentIndex((current) => (current + 1) % paymentSlides.length)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </article>
            <article className={styles.stepCard} data-gsap-card data-journey-slide data-active={journeyIndex === 3}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>4</span>
                <h3>Progresse avec ton coach</h3>
              </div>
              <div className={styles.miniScreen}>
                <div className={styles.progressVisual} aria-hidden="true">
                  <span>OBJECTIF</span><strong>+ 18%</strong><small>de régularité ce mois-ci</small>
                </div>
                <div className={styles.slideContent}>
                  <h4>Un rythme qui tient</h4>
                  <p className={styles.slideDetail}>Suivi personnalisé, objectifs atteints, résultats réels.</p>
                  <Link className={styles.darkButtonLink} href="/compte">Voir mon espace</Link>
                </div>
              </div>
            </article>
          </div>
          </div>
        </section>

        <HomeBelowFoldSections />

        <HomeFaqSection />
      </main>

      <SiteFooter />

      <nav className={styles.mobileNav} aria-label="Navigation principale">
        <Link href="/" className={styles.mobileNavItemActive}><span aria-hidden="true">⌂</span><span>Accueil</span></Link>
        <Link href="/recherche?sport=football" className={styles.mobileNavItem}><span aria-hidden="true">⌕</span><span>Explorer</span></Link>
        <Link href="/creneau" className={styles.mobileNavItem}><span aria-hidden="true">◷</span><span>Sessions</span></Link>
        <Link href="/compte" className={styles.mobileNavItem}><span aria-hidden="true">◯</span><span>Profil</span></Link>
      </nav>
    </div>
  );
}
