"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function GsapJourneyScene() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = document.querySelector<HTMLElement>('[data-gsap-section="journey"]');
    if (!section) return;

    const cards = gsap.utils.toArray<HTMLElement>("[data-gsap-card]", section);
    const heading = section.querySelector<HTMLElement>("[data-gsap-heading]");
    const lightLine = section.querySelector<HTMLElement>("[data-gsap-line]");
    if (!cards.length) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
      gsap.set(cards, {
        autoAlpha: 0,
        y: 110,
        rotateX: 14,
        rotateY: (index) => (index - 1) * 5,
        scale: 0.84,
        filter: "blur(14px)",
        transformOrigin: "50% 100%",
      });

      gsap.set([heading, lightLine].filter(Boolean), { autoAlpha: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top+=72",
          end: "+=1500",
          pin: true,
          scrub: 1.15,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: "labelsDirectional",
            duration: { min: 0.25, max: 0.8 },
            delay: 0.12,
            ease: "power2.out",
          },
        },
      });

      timeline
        .to(heading, { autoAlpha: 1, y: -8, duration: 0.18, ease: "power2.out" })
        .to(lightLine, { autoAlpha: 1, scaleX: 1, duration: 0.16, ease: "power2.out" }, "<")
        .addLabel("coach")
        .to(cards[0], { autoAlpha: 1, y: 0, rotateX: 0, rotateY: -1.5, scale: 1, filter: "blur(0px)", duration: 0.34, ease: "expo.out" })
        .addLabel("slots")
        .to(cards[1], { autoAlpha: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1, filter: "blur(0px)", duration: 0.34, ease: "expo.out" })
        .addLabel("payment")
        .to(cards[2], { autoAlpha: 1, y: 0, rotateX: 0, rotateY: 1.5, scale: 1, filter: "blur(0px)", duration: 0.34, ease: "expo.out" })
        .to(cards, { y: (index) => (index - 1) * -10, duration: 0.22, ease: "power1.inOut" });

      return () => timeline.scrollTrigger?.kill();
    });

    mm.add("(max-width: 900px)", () => {
      gsap.set(cards, { autoAlpha: 0, y: 70, scale: 0.94, filter: "blur(10px)" });
      cards.forEach((card) => {
        gsap.to(card, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            end: "top 46%",
            scrub: 0.8,
          },
        });
      });
    });

    return () => mm.revert();
  }, { scope });

  return <div ref={scope} className="gsap-journey-runtime" aria-hidden="true" />;
}
