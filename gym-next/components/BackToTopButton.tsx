"use client";

import { useEffect, useState } from "react";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <a className={`back-to-top${visible ? " is-visible" : ""}`} href="#top" aria-label="Remonter en haut de la page" aria-hidden={!visible} tabIndex={visible ? 0 : -1}>↑</a>;
}
