"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";
import {
  faqItems,
  insights,
  localeColumns,
  locales,
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

function StepDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={index === activeIndex ? styles.dotActive : styles.dot} />
      ))}
    </div>
  );
}

export function HomePageClient() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [sportInput, setSportInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [profileIndex, setProfileIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);
  const [paymentIndex, setPaymentIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY >= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeProfile = profileSlides[profileIndex];
  const activeSlot = slotSlides[slotIndex];
  const activePayment = paymentSlides[paymentIndex];
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
      <header className={`${styles.topbar} ${isScrolled ? styles.topbarScrolled : ""}`}>
        <div className={styles.brandLockup}>
          <Link href="/" className={styles.brandName}>
            GetYourMentor
          </Link>
        </div>

        <nav className={styles.sportsNav} aria-label="Sports">
          {sportLinks.map((sport) => (
            <Link key={sport.slug} href={`/recherche?sport=${sport.slug}`} className={styles.sportLink}>
              {sport.label}
            </Link>
          ))}
        </nav>

        <div className={styles.topbarActions}>
          <Link href="/compte" className={styles.topbarLink}>
            Je suis un professionnel du sport
          </Link>
          <Link href="/compte" className={styles.accountButton}>
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
        <section className={styles.hero}>
          <div className={styles.heroBackdrop}>
            <Image
              src="/design_assets/hero_accueil_whatsapp.jpeg"
              alt="Athletes et coachs en mouvement"
              fill
              priority
              className={styles.heroImage}
            />
          </div>
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Coaching sportif premium</p>
            <h1 className={styles.heroTitle}>Réservez votre coach</h1>
            <p className={styles.heroCopy}>Simple - Immédiat - 24h/24</p>

            <div className={styles.searchCard}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Que cherchez-vous ?</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="Nom du coach, sport..."
                  value={sportInput}
                  onChange={(event) => setSportInput(event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Ou</span>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="Adresse, ville"
                  value={cityInput}
                  onChange={(event) => setCityInput(event.target.value)}
                />
              </label>

              <button className={styles.searchButton} type="button" onClick={handleSearch}>
                Rechercher
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Comment ça marche ?</h2>
          </div>

          <div className={styles.howGrid}>
            <article className={styles.stepCard}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>1</span>
                <h3>Trouvez votre coach</h3>
              </div>
              <div className={styles.miniScreen}>
                <div className={styles.slideMedia}>
                  <Image src={activeProfile.image} alt={activeProfile.name} fill className={styles.cardImage} />
                </div>
                <div className={styles.slideContent}>
                  <h4>{activeProfile.name}</h4>
                  <p className={styles.slideMeta}>{activeProfile.meta}</p>
                  <p className={styles.slideDetail}>{activeProfile.detail}</p>
                  <span className={styles.pill}>{activeProfile.price}</span>
                  <button
                    className={styles.darkButton}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/coach?sport=${inferSportSlug(activeProfile.meta)}&city=${encodeURIComponent(activeCity)}&coach=${encodeURIComponent(activeProfile.name)}`,
                      )
                    }
                  >
                    {activeProfile.cta}
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

            <article className={styles.stepCard}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>2</span>
                <h3>Proposez vos créneaux</h3>
              </div>
              <div className={styles.miniScreen}>
                <p className={styles.slideCaption}>{activeSlot.title}</p>
                <div className={styles.slotVisual}>
                  <Image src={activeSlot.visual} alt={activeSlot.title} fill className={styles.cardImage} />
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
                  onClick={() =>
                    router.push(
                      `/creneau?sport=${inferSportSlug(activeProfile.meta)}&city=${encodeURIComponent(activeCity)}&coach=${encodeURIComponent(activeProfile.name)}`,
                    )
                  }
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

            <article className={styles.stepCard}>
              <div className={styles.stepHead}>
                <span className={styles.stepNumber}>3</span>
                <h3>Confirmez et payez</h3>
              </div>
              <div className={styles.miniScreen}>
                <div className={styles.paymentVisual} />
                <span className={styles.paymentStrong}>{activePayment.title}</span>
                <span className={styles.paymentRow}>{activePayment.date}</span>
                <span className={styles.paymentRow}>{activePayment.detail}</span>
                <div className={styles.paymentTotal}>
                  <span>Total</span>
                  <strong>{activePayment.total}</strong>
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
          </div>
        </section>

        <section className={styles.metricsSection}>
          <div className={styles.metricsGrid}>
            {metrics.map((metric) => (
              <div key={metric.label} className={styles.metric}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="coach-space">
          <div className={styles.sectionHeading}>
            <h2>Optimisez la prise de rendez-vous coaching en ligne</h2>
          </div>
          <div className={styles.insightsGrid}>
            {insights.map((item) => (
              <article
                key={`${item.value}-${item.copy}`}
                className={`${styles.insightCard} ${item.featured ? styles.insightCardFeatured : ""}`}
              >
                <strong>{item.value}</strong>
                <p>{item.copy}</p>
                {item.featured ? (
                  <Link href="/compte" className={styles.insightButton}>
                    Je suis un professionnel du sport
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.recruitSection}>
          <div className={styles.recruitMedia}>
            <Image
              src="/design_assets/content_library/football/football-coach-rain.jpg"
              alt="Coach sur terrain"
              fill
              className={styles.cardImage}
            />
          </div>
          <div className={styles.recruitCopy}>
            <p className={styles.sectionKicker}>Professionnel</p>
            <h2>GetYourMentor recherche des profils partout en France pour digitaliser le coaching sportif</h2>
            <p>
              Une vitrine claire, un tunnel de réservation lisible, et une gestion du parcours qui reste premium
              pour les élèves comme pour les coachs.
            </p>
            <Link href="/compte" className={styles.darkButtonLink}>
              Découvrir nos offres
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Trouvez votre coach sportif partout en France</h2>
          </div>
          <div className={styles.localesGrid}>
            {localeColumns.map((column) => (
              <article key={column.slug} className={styles.localeColumn}>
                <h3>{column.title}</h3>
                <p>{column.copy}</p>
                <div className={styles.localeLinks}>
                  {locales.map((city) => (
                    <Link key={`${column.slug}-${city}`} href={`/coachs?sport=${column.slug}&city=${city}`}>
                      {city}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <p className={styles.sectionKicker}>FAQ</p>
          <h2>Les questions fréquentes</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.siteFooter}>
        <div className={styles.footerBrand}>GETYOURMENTOR</div>
        <p>Trouvez votre coach sportif en quelques clics</p>
        <nav className={styles.footerLinks} aria-label="Liens legaux">
          <a href="#cgv">CGV</a>
          <a href="#cgu">CGU</a>
          <a href="#privacy">Politique de confidentialité</a>
          <a href="#legal">Mentions légales</a>
        </nav>
        <small>&copy; 2026 GetYourMentor. Tous droits réservés.</small>
      </footer>
    </div>
  );
}
