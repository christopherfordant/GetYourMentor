"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './pentagon-carousel.module.css';

export type PentagonItem = { id: string; title: string; content: ReactNode; utility?: boolean };
const modulo = (value: number) => ((value % 5) + 5) % 5;

export function PentagonCarousel({ items, label }: { items: PentagonItem[]; label: string }) {
  const [page, setPage] = useState(0);
  const [step, setStep] = useState(0);
  const [height, setHeight] = useState(650);
  const [reduced, setReduced] = useState(false);
  const [turning, setTurning] = useState(false);
  const [resizing, setResizing] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const pageCount = Math.ceil(items.length / 5);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const group = items.slice(currentPage * 5, currentPage * 5 + 5);
  const isPentagon = group.length === 5;
  const active = modulo(step);
  const signature = group.map(item => item.id).join('|');

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(media.matches); if (media.matches) setTurning(false); };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let frame = 0;
    const resize = () => { setResizing(true); setTurning(false); cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setResizing(false)); }); };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    const element = stage.current;
    if (!element || !isPentagon) return;
    const update = () => {
      const measured = Array.from(element.querySelectorAll<HTMLElement>('[data-pentagon-face] > *')).map(card => card.scrollHeight);
      setHeight(value => Math.max(value, 650, ...measured));
    };
    const observer = new ResizeObserver(update);
    element.querySelectorAll<HTMLElement>('[data-pentagon-face] > *').forEach(card => observer.observe(card));
    update(); return () => observer.disconnect();
  }, [signature, isPentagon]);

  function move(delta: number) {
    if (!delta || !isPentagon) return;
    const focused = document.activeElement;
    if (focused instanceof Element && focused.closest('[data-pentagon-face]')) stage.current?.focus({ preventScroll: true });
    setTurning(!reduced); setStep(value => value + delta);
  }
  function changePage() {
    setStep(0); setTurning(false); setHeight(650); setPage((currentPage + 1) % pageCount);
  }
  if (!items.length) return null;
  return <div className={styles.carousel} data-mentor-pentagon data-page={currentPage + 1}>
    {isPentagon ? <>
      <div ref={stage} className={styles.stage} tabIndex={0} role="group" aria-roledescription="carrousel" aria-label={label}
        data-step={step} data-active={active} data-state={turning ? 'turning' : 'idle'}
        style={{ '--turn': `${-step * 72}deg`, '--face-height': `${height}px`, '--turn-duration': reduced || resizing ? '0ms' : '850ms' } as CSSProperties}
        onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}
        onPointerDown={event => { if ((event.target as Element).closest('a,button') || !event.isPrimary) return; start.current = { x: event.clientX, y: event.clientY, id: event.pointerId }; }}
        onPointerUp={event => { const point = start.current; start.current = null; if (!point || point.id !== event.pointerId) return; const dx = event.clientX - point.x, dy = event.clientY - point.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1); }}
        onPointerCancel={() => { start.current = null; }}>
        <div className={styles.floor} aria-hidden="true" />
        <div className={styles.ring} data-pentagon-ring onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setTurning(false); }}>
          {group.map((item, index) => <div key={item.id} className={styles.face} data-pentagon-face={index} data-active={index === active} data-utility={item.utility || undefined}
            style={{ '--face': index } as CSSProperties} inert={index !== active} aria-hidden={index !== active} role="group" aria-label={`Face ${index + 1} sur 5 : ${item.title}`}>{item.content}</div>)}
        </div>
        <button className={`${styles.arrow} ${styles.previous}`} type="button" aria-label="Face précédente" onClick={() => move(-1)}>‹</button>
        <button className={`${styles.arrow} ${styles.next}`} type="button" aria-label="Face suivante" onClick={() => move(1)}>›</button>
      </div>
      <div className={styles.controls}><p role="status" aria-live="polite" aria-atomic="true">Face {active + 1} / 5 — {group[active].title}</p><div className={styles.dots} aria-label="Choisir une face">{group.map((item, index) => <button key={item.id} type="button" aria-label={`Afficher ${item.title}`} aria-pressed={index === active} onClick={() => { let delta = modulo(index - active); if (delta > 2) delta -= 5; move(delta); }}>{index + 1}</button>)}</div></div>
    </> : <div className={styles.grid} data-mentor-grid>{group.map(item => <div key={item.id}>{item.content}</div>)}</div>}
    {pageCount > 1 && <div className={styles.pagination}><p>Groupe {currentPage + 1} / {pageCount} de cet aperçu</p><button type="button" onClick={changePage}>Autres profils <span aria-hidden="true">→</span></button></div>}
  </div>;
}
