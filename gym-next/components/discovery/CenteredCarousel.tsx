"use client";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './mentor-carousel.module.css';

export function CenteredCarousel({ items, label }: { items: Array<{ id: string; content: ReactNode }>; label: string }) {
  const initial = Math.floor((items.length - 1) / 2);
  const [active, setActive] = useState(Math.max(0, initial));
  const [dragging, setDragging] = useState(false);
  const current = useRef(Math.max(0, initial));
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointer: number; x: number; scroll: number } | null>(null);
  const frame = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const identity = items.map(item => item.id).join('|');

  function nearest() {
    const rail = track.current;
    if (!rail) return 0;
    const middle = rail.scrollLeft + rail.clientWidth / 2;
    let closest = 0, distance = Infinity;
    Array.from(rail.children).forEach((child, index) => {
      const item = child as HTMLElement;
      const delta = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
      if (delta < distance) { distance = delta; closest = index; }
    });
    return closest;
  }
  function moveTo(index: number, instant = false) {
    const rail = track.current;
    if (!rail || !rail.children.length) return;
    const next = Math.max(0, Math.min(index, rail.children.length - 1));
    const item = rail.children[next] as HTMLElement;
    current.current = next;
    setActive(next);
    rail.scrollTo({ left: item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2, behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  useEffect(() => {
    current.current = Math.max(0, Math.floor(((track.current?.children.length ?? 1) - 1) / 2));
    const observer = new ResizeObserver(() => moveTo(current.current, true));
    if (track.current) observer.observe(track.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); if (settle.current) clearTimeout(settle.current); };
  }, [identity]);
  function finishDrag() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    moveTo(nearest());
  }
  return <div className={styles.carousel} role="group" aria-roledescription="carrousel" aria-label={label} data-centered-carousel>
    <div className={styles.rail} ref={track} tabIndex={0} role="group" aria-label="Cartes des mentors" data-dragging={dragging}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const index = event.key === 'ArrowRight' ? current.current + 1 : event.key === 'ArrowLeft' ? current.current - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
        if (index !== null) { event.preventDefault(); moveTo(index); }
      }}
      onScroll={() => {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => setActive(nearest()));
        if (settle.current) clearTimeout(settle.current);
        settle.current = setTimeout(() => { current.current = nearest(); setActive(current.current); }, 130);
      }}
      onFocusCapture={event => {
        // Recenter keyboard focus without moving a lateral link between pointer
        // down and click, which would cancel its native navigation.
        if (!(event.target as HTMLElement).matches(':focus-visible')) return;
        const item = (event.target as HTMLElement).closest<HTMLElement>('[data-carousel-item]');
        if (item) moveTo(Number(item.dataset.carouselItem), true);
      }}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || (event.target as HTMLElement).closest('a,button,input,select,textarea')) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        drag.current = { pointer: event.pointerId, x: event.clientX, scroll: event.currentTarget.scrollLeft };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={event => { if (drag.current) event.currentTarget.scrollTo({ left: drag.current.scroll - (event.clientX - drag.current.x), behavior: 'instant' }); }}
      onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
      {items.map((item, index) => <div key={item.id} className={styles.slide} data-carousel-item={index} data-active={index === active} role="group" aria-roledescription="diapositive" aria-label={`${index + 1} sur ${items.length}`} aria-current={index === active ? 'true' : undefined}>{item.content}</div>)}
    </div>
    <div className={styles.controls}>
      <button type="button" aria-label="Mentor précédent" disabled={active === 0} onClick={() => moveTo(current.current - 1)}>←</button>
      <p role="status" aria-live="polite" aria-atomic="true">Mentor {active + 1} sur {items.length}</p>
      <button type="button" aria-label="Mentor suivant" disabled={active === items.length - 1} onClick={() => moveTo(current.current + 1)}>→</button>
    </div>
  </div>;
}
