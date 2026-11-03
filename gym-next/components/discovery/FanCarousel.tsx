"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './fan-carousel.module.css';

export type FanItem = { id: string; title: string; content: ReactNode };
export function FanCarousel({ items, label }: { items: FanItem[]; label: string }) {
  const [selected, setSelected] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const identity = items.map(item => item.id).join('|');
  const count = items.length;
  const active = count ? ((selected % count) + count) % count : 0;
  useLayoutEffect(() => {
    setSelected(0);
    // A changed result set may remove the focused link; keep focus in the carousel.
    if (stage.current?.contains(document.activeElement)) stage.current.focus({ preventScroll: true });
  }, [identity]);
  function move(delta: number) {
    if (count < 2) return;
    if (document.activeElement instanceof Element && document.activeElement.closest('[data-fan-card]')) stage.current?.focus({ preventScroll: true });
    setSelected(value => value + delta);
  }
  if (!count) return null;
  return <div className={styles.carousel} data-fan-carousel data-count={count}>
    <div ref={stage} className={styles.stage} tabIndex={0} role="group" aria-roledescription="carrousel" aria-label={label} data-active={active}
      onKeyDown={event => {
        if ((event.target as HTMLElement).matches('input,textarea,select')) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); move((event.key === 'Home' ? 0 : count - 1) - active); }
      }}
      onPointerDown={event => {
        if (!event.isPrimary || (event.target as Element).closest('a,button,input')) return;
        start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={event => {
        const point = start.current; start.current = null;
        if (!point || point.id !== event.pointerId) return;
        const dx = event.clientX - point.x, dy = event.clientY - point.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1);
      }} onPointerCancel={() => { start.current = null; }} onLostPointerCapture={() => { start.current = null; }} onDragStart={event => event.preventDefault()}>
      {items.map((item, index) => {
        let distance = ((index - active) % count + count) % count;
        if (distance > count / 2) distance -= count;
        const shown = Math.abs(distance) <= 3;
        return <div key={item.id} className={styles.slide} data-fan-card={index} data-active={index === active} data-visible={shown}
          style={{ '--offset': distance, '--depth': Math.abs(distance), '--angle': `${-Math.sign(distance) * Math.min(30, Math.abs(distance) * 13)}deg`, zIndex: count - Math.abs(distance) } as CSSProperties}
          inert={index !== active} aria-hidden={index !== active} role="group" aria-roledescription="diapositive" aria-label={`${index + 1} sur ${count} : ${item.title}`}>
          {item.content}
        </div>;
      })}
    </div>
    <div className={styles.controls}>
      <button type="button" disabled={count < 2} aria-label="Carte précédente" onClick={() => move(-1)}>←</button>
      <p role="status" aria-live="polite" aria-atomic="true">{active + 1} / {count} — {items[active].title}</p>
      <button type="button" disabled={count < 2} aria-label="Carte suivante" onClick={() => move(1)}>→</button>
    </div>
  </div>;
}
