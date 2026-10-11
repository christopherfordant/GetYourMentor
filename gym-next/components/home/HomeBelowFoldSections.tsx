import Image from "next/image";
import Link from "next/link";
import styles from "./home-refined.module.css";
import { insights, localeColumns, locales, metrics } from "./home-data";

const popularCoaches = [
  { name: "Lucas M.", sport: "Football", rating: "4.9", price: "45€ / h", details: "Paris · Présentiel · Visio", image: "/design_assets/content_library/web_reference/football-coaching.jpg", slug: "football" },
  { name: "Amina K.", sport: "Fitness", rating: "4.8", price: "35€ / h", details: "Lyon · Présentiel · Groupe", image: "/design_assets/content_library/fitness/fitness-coach-plank.jpg", slug: "metiers-de-la-forme" },
  { name: "Nathan B.", sport: "Basketball", rating: "5", price: "50€ / h", details: "Marseille · Présentiel", image: "/design_assets/content_library/web_reference/basketball-coaching.jpg", slug: "basketball" },
  { name: "Sofia D.", sport: "Sports de combat", rating: "4.9", price: "55€ / h", details: "Bordeaux · Présentiel · Visio", image: "/design_assets/content_library/combat/combat-boxer-portrait.jpg", slug: "sports-de-combat" },
  { name: "Thomas R.", sport: "Football", rating: "4.7", price: "40€ / h", details: "Toulouse · Présentiel", image: "/design_assets/content_library/football/football-coach-rain.jpg", slug: "football" },
  { name: "Clara V.", sport: "Fitness", rating: "4.9", price: "30€ / h", details: "Nice · Visio", image: "/design_assets/content_library/fitness/fitness-coach-plank.jpg", slug: "metiers-de-la-forme" },
];

export function HomeBelowFoldSections() {
  return (
    <>
      <section className={styles.metricsSection} data-gsap-scene="metrics">
        <div className={styles.metricsGrid}>
          {metrics.map((metric) => (
            <div key={metric.label} className={styles.metric} data-gsap-stagger>
              <strong>{metric.value}</strong><span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.section} data-gsap-scene="routine" id="coach-space">
        <div className={styles.sectionHeading}><h2>Construis une routine que tu peux tenir</h2></div>
        <div className={styles.insightsGrid}>
          {insights.map((item) => (
            <article key={`${item.value}-${item.copy}`} className={`${styles.insightCard} ${item.featured ? styles.insightCardFeatured : ""}`} data-gsap-stagger>
              <strong>{item.value}</strong><p>{item.copy}</p>
              {item.featured ? <Link href="/compte" className={styles.insightButton}>Je suis coach</Link> : null}
            </article>
          ))}
        </div>
      </section>
      <section className={`${styles.section} ${styles.popularCoachesSection}`} data-gsap-scene="popular-coaches" aria-labelledby="popular-coaches-title">
        <div className={styles.popularCoachesHeading}>
          <div>
            <p className={styles.sectionKicker}>Les mentors</p>
            <h2 id="popular-coaches-title">Coachs populaires cette semaine</h2>
          </div>
          <Link href="/coachs" className={styles.popularCoachesLink}>Voir tous les coachs</Link>
        </div>
        <div className={styles.popularCoachesGrid}>
          {popularCoaches.map((coach) => (
            <article key={`${coach.name}-${coach.sport}`} className={styles.popularCoach}>
              <div className={styles.popularCoachImage}>
                <Image src={coach.image} alt={`Portrait du coach ${coach.name}`} fill loading="lazy" sizes="(max-width: 900px) 88vw, 31vw" className={styles.cardImage} />
                <span className={styles.popularCoachSport}>{coach.sport}</span>
                <span className={styles.popularCoachRating}>★ {coach.rating}</span>
              </div>
              <div className={styles.popularCoachBody}>
                <div className={styles.popularCoachTitle}>
                  <h3>{coach.name}</h3>
                  <strong>{coach.price}</strong>
                </div>
                <p>{coach.details}</p>
                <Link href={`/coachs?sport=${coach.slug}`} className={styles.popularCoachButton}>Voir le profil</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.recruitSection} data-gsap-scene="recruit">
        <div className={styles.recruitMedia} data-gsap-recruit-media>
          <Image src="/design_assets/content_library/football/football-coach-rain.jpg" alt="Coach sur terrain" fill loading="lazy" sizes="(max-width: 900px) 100vw, 50vw" className={styles.cardImage} />
        </div>
        <div className={styles.recruitCopy} data-gsap-recruit-copy>
          <p className={styles.sectionKicker}>Professionnel</p>
          <h2>GetYourMentor recherche des profils partout en France pour digitaliser le coaching sportif</h2>
          <p>Une vitrine claire, un tunnel de réservation lisible, et une gestion du parcours qui reste premium pour les élèves comme pour les coachs.</p>
          <Link href="/compte" className={styles.darkButtonLink}>Découvrir nos offres</Link>
        </div>
      </section>
      <section className={styles.section} data-gsap-scene="locales">
        <div className={styles.sectionHeading}><h2>Des coachs pour chaque façon de progresser</h2></div>
        <div className={styles.localesGrid}>
          {localeColumns.map((column) => (
            <article key={column.slug} className={styles.localeColumn} data-gsap-stagger>
              <h3>{column.title}</h3><p>{column.copy}</p>
              <div className={styles.localeLinks}>{locales.map((city) => <Link key={`${column.slug}-${city}`} href={`/coachs?sport=${column.slug}&city=${city}`}>{city}</Link>)}</div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
