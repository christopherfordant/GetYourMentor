"use client";
import { useEffect, useRef, useState } from 'react';
import { availableNavigationSections } from '@/lib/discovery-sports';
import styles from './navigation.module.css';
export function SectionDrawer() {
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) trigger.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const overflow = document.body.style.overflow;
    const paddingRight = document.body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.overflow = 'hidden';
    if (gutter > 0) document.body.style.paddingRight = `${currentPadding + gutter}px`;
    return () => { document.body.style.overflow = overflow; document.body.style.paddingRight = paddingRight; };
  }, [open]);
  const close = () => drawer.current?.close();
  return <>
    <button ref={trigger} className={styles.handle} hidden={open} aria-label="Ouvrir les sections" aria-expanded={open} aria-controls="site-section-drawer" type="button" onClick={() => { drawer.current?.showModal(); setOpen(true); }}><span aria-hidden="true">‹</span></button>
    <dialog className={styles.drawer} ref={drawer} id="site-section-drawer" aria-labelledby="sections-title" onClose={() => setOpen(false)} onClick={event => {
      const box = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) close();
    }}>
      <button className={styles.closeHandle} type="button" aria-label="Fermer les sections" onClick={close}><span aria-hidden="true">›</span></button>
      <div className={styles.drawerPanel}><div className={styles.drawerHead}><p>GETYOURMENTOR</p><h2 id="sections-title">Explore les sections.</h2></div>
        <nav aria-label="Sections du site">{availableNavigationSections.map(section => <a key={section.href} href={section.href} onClick={close}><span>{section.label}</span><span aria-hidden="true">↗</span></a>)}</nav>
        <a className={styles.drawerAccount} href="/compte" onClick={close}>Mon compte ↗</a>
      </div>
    </dialog>
  </>;
}
