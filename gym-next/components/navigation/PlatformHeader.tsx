"use client";
import { useRef, useState, type ReactNode } from 'react';
import { discoverySports } from '@/lib/discovery-sports';
import styles from './navigation.module.css';

export function PlatformHeader({ children }: { children?: ReactNode }) {
  const [sportsOpen, setSportsOpen] = useState(false);
  const bell = useRef<HTMLButtonElement>(null);
  const notifications = useRef<HTMLDialogElement>(null);
  const sportsTrigger = useRef<HTMLButtonElement>(null);
  const sportsPanel = useRef<HTMLDivElement>(null);
  return <header className={styles.header} data-platform-header>
    <div className={styles.top}>
      <a className={styles.brand} href="/" aria-label="GetYourMentor, accueil"><b aria-hidden="true">GYM<span>↗</span></b><span>GetYourMentor</span></a>
      <div className={styles.actions}>
        <button className={styles.sportsToggle} ref={sportsTrigger} aria-expanded={sportsOpen} aria-controls="platform-sports" type="button" onClick={() => setSportsOpen(value => !value)}>Sports</button>
        <button className={styles.bell} ref={bell} aria-label="Notifications" aria-haspopup="dialog" type="button" onClick={() => { setSportsOpen(false); notifications.current?.showModal(); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg>
        </button>
        <a className={styles.account} href="/compte">Mon compte <span aria-hidden="true">↗</span></a>
        {children}
      </div>
    </div>
    <div className={styles.sportsPanel} ref={sportsPanel} id="platform-sports" data-open={sportsOpen} onKeyDown={event => {
      if (event.key === 'Escape') { setSportsOpen(false); sportsTrigger.current?.focus(); }
    }}>
      <nav className={styles.sports} aria-label="Sports">{discoverySports.map(([slug, label]) => <a href={`/recherche?sport=${slug}`} key={slug}>{label}</a>)}</nav>
    </div>
    <dialog ref={notifications} className={styles.notifications} aria-labelledby="notifications-title" onClose={() => bell.current?.focus()} onClick={event => {
      const box = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) notifications.current?.close();
    }}>
      <div className={styles.notificationHead}><h2 id="notifications-title">Notifications</h2><button type="button" aria-label="Fermer les notifications" onClick={() => notifications.current?.close()}>×</button></div>
      <p>Retrouve le suivi de tes demandes de séance et tes échanges dans ton compte.</p>
      <a className={styles.account} href="/compte">Ouvrir mon compte ↗</a>
    </dialog>
  </header>;
}
