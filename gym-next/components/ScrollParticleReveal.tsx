"use client";

import { useEffect } from "react";

const CARD_SELECTOR = [
  ".stepCard",
  ".insightCard",
  ".localeColumn",
  ".sport-city-card",
  ".coach-result-card",
  ".coach-profile-card",
  ".coach-booking-card",
  ".booking-card",
  ".booking-contact-card",
  ".reservation-card",
  ".payment-card",
  ".payment-summary-card",
  ".recap-service-card",
  ".recap-date-card",
  ".recap-auth-card",
  ".auth-card",
  ".account-dashboard-card",
  ".account-panel",
  ".club-signup-form-card",
  ".reservation-selection-panel",
  ".reservation-calendar-card",
].join(",");

export function ScrollParticleReveal() {
  useEffect(() => {
    document.documentElement.classList.add("scroll-reveal-ready");

    const cards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));
    cards.forEach((card, index) => {
      card.classList.add("scroll-particle-card");
      card.style.setProperty("--particle-delay", `${Math.min(index % 5, 4) * 55}ms`);
    });

    if (typeof IntersectionObserver === "undefined") {
      cards.forEach((card) => card.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return null;
}
