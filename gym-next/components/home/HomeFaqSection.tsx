"use client";

import styles from "./home-refined.module.css";
import { faqItems } from "./home-data";

export function HomeFaqSection() {
  return (
    <section className={styles.faqSection} data-gsap-scene="faq">
      <p className={styles.sectionKicker}>FAQ</p>
      <h2>Les questions fréquentes</h2>
      <div className={styles.faqList}>
        {faqItems.map((item) => (
          <details key={item.question} className={styles.faqItem} data-gsap-stagger>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
