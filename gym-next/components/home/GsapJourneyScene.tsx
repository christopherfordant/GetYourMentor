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

    const header = document.querySelector<HTMLElement>('[data-gsap-header]');
    const headerItems = Array.from(document.querySelectorAll<HTMLElement>("[data-gsap-header-item]"));
    const hero = document.querySelector<HTMLElement>('[data-gsap-hero]');
    const heroItems = Array.from(document.querySelectorAll<HTMLElement>("[data-gsap-hero-item]"));
    const heroImage = hero?.querySelector<HTMLElement>('[class*="heroImage__"]');
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-gsap-scene]"));

    gsap.fromTo(header, { autoAlpha: 0, y: -22 }, {
      autoAlpha: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      clearProps: "transform,opacity,visibility",
    });

    const headerCleanup: Array<() => void> = [];
    const smokeParticles: HTMLElement[] = [];

    const emitLandingSmoke = (item: HTMLElement, index: number) => {
      const smokeTimeline = gsap.timeline();
      const particleCount = 7 + (index % 3);

      for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
        const particle = document.createElement("span");
        const direction = particleIndex % 2 === 0 ? 1 : -1;
        const size = 5 + Math.random() * 8;
        particle.className = "header-smoke-particle";
        particle.setAttribute("aria-hidden", "true");
        particle.style.setProperty("--smoke-size", `${size}px`);
        item.appendChild(particle);
        smokeParticles.push(particle);

        smokeTimeline.fromTo(
          particle,
          {
            autoAlpha: 0,
            x: (Math.random() - 0.5) * 24,
            y: 5 + Math.random() * 8,
            scale: 0.2,
          },
          {
            autoAlpha: 0.72,
            x: direction * (18 + Math.random() * 24),
            y: -(12 + Math.random() * 22),
            scale: 1.35 + Math.random() * 0.8,
            duration: 0.24 + Math.random() * 0.12,
            ease: "power2.out",
          },
          particleIndex * 0.025,
        );
        smokeTimeline.to(
          particle,
          {
            autoAlpha: 0,
            y: -(28 + Math.random() * 22),
            scale: 2.1,
            duration: 0.48 + Math.random() * 0.18,
            ease: "power1.out",
            onComplete: () => particle.remove(),
          },
          particleIndex * 0.025 + 0.18,
        );
      }
    };

    const landingTimeline = gsap.timeline({ delay: 0.2 });
    headerItems.forEach((item) => {
      item.classList.add("gsap-header-tab");
      gsap.set(item, { "--tab-progress": 0, autoAlpha: 0 });

      const index = headerItems.indexOf(item);
      const itemTimeline = gsap.timeline({
        onComplete: () => emitLandingSmoke(item, index),
      });
      itemTimeline
        .fromTo(
          item,
          {
            autoAlpha: 0,
            x: index % 2 === 0 ? -150 - index * 18 : 150 + index * 18,
            y: -180 - index * 22,
            rotation: index % 2 === 0 ? -14 : 14,
            scale: 0.7,
            filter: "blur(10px)",
          },
          {
            autoAlpha: 1,
            x: index % 2 === 0 ? 14 : -14,
            y: 12,
            rotation: index % 2 === 0 ? 2 : -2,
            scale: 0.92,
            duration: 0.44,
            ease: "power2.in",
          },
        )
        .to(item, {
          x: 0,
          y: -5,
          rotation: 0,
          scale: 1.04,
          filter: "blur(0px)",
          duration: 0.26,
          ease: "back.out(2.2)",
        })
        .to(item, {
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: "bounce.out",
          clearProps: "filter",
        });
      landingTimeline.add(itemTimeline, index * 0.12);

      const onEnter = () => {
        gsap.killTweensOf(item);
        gsap.to(item, {
          y: -3,
          scale: 1.035,
          color: "#ffffff",
          "--tab-progress": 1,
          duration: 0.34,
          ease: "power3.out",
        });
      };
      const onLeave = () => {
        gsap.to(item, {
          y: 0,
          scale: 1,
          clearProps: "color",
          "--tab-progress": 0,
          duration: 0.42,
          ease: "power3.out",
        });
      };

      item.addEventListener("pointerenter", onEnter);
      item.addEventListener("pointerleave", onLeave);
      item.addEventListener("focus", onEnter);
      item.addEventListener("blur", onLeave);
      headerCleanup.push(() => {
        item.removeEventListener("pointerenter", onEnter);
        item.removeEventListener("pointerleave", onLeave);
        item.removeEventListener("focus", onEnter);
        item.removeEventListener("blur", onLeave);
      });
    });
    landingTimeline.play();

    gsap.fromTo(heroItems, { autoAlpha: 0, y: 54, filter: "blur(12px)" }, {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.25,
      stagger: 0.13,
      delay: 0.18,
      ease: "expo.out",
      clearProps: "filter",
    });

    if (heroImage) {
      gsap.to(heroImage, {
        yPercent: 7,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    if (header) {
      gsap.to(header, {
        backgroundColor: "rgba(8, 14, 29, .78)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 14px 34px rgba(0, 0, 0, .18)",
        paddingTop: "10px",
        paddingBottom: "10px",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "+=180",
          scrub: 0.8,
        },
      });
    }

    scenes.forEach((scene) => {
      const items = gsap.utils.toArray<HTMLElement>("[data-gsap-stagger], [data-gsap-recruit-media], [data-gsap-recruit-copy]", scene);
      if (!items.length) return;
      gsap.set(items, { autoAlpha: 0, y: 78, rotateX: 8, filter: "blur(10px)" });
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 1.15,
        stagger: 0.11,
        ease: "expo.out",
        scrollTrigger: {
          trigger: scene,
          start: "top 78%",
          end: "top 42%",
          scrub: 0.9,
          toggleActions: "play none none reverse",
        },
      });
    });

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

    return () => {
      headerCleanup.forEach((cleanup) => cleanup());
      smokeParticles.forEach((particle) => particle.remove());
      mm.revert();
    };
  }, { scope });

  return <div ref={scope} className="gsap-journey-runtime" aria-hidden="true" />;
}
