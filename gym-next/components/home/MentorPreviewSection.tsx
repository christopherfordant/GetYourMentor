"use client";
import { useEffect, useState } from 'react';
import { CoachVisual } from '@/components/discovery/CoachVisual';
import { CenteredCarousel } from '@/components/discovery/CenteredCarousel';
import { readMentorPreview, type MentorPreview } from '@/lib/mentor-preview';
import { knownDiscoverySport } from '@/lib/discovery-sports';
import { buildNextPath, nextRoutes } from '@/lib/next-routes';
import styles from '@/components/discovery/mentor-carousel.module.css';

type Preview = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: MentorPreview[]; demo: boolean };
export function MentorPreviewSection() {
  const [result, setResult] = useState<Preview>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    setResult({ state: 'loading' });
    fetch('/api/coaches/preview', { signal: controller.signal, cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('Catalogue indisponible');
      const payload = readMentorPreview(await response.json());
      if (active) setResult({ state: 'ready', ...payload });
    }).catch(() => { if (active) setResult({ state: 'error' }); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  return <section id="mentors" className={styles.section} aria-labelledby="mentors-title" aria-busy={result.state === 'loading'}>
    <div className={styles.heading}><div><p className={styles.eyebrow}>Le catalogue</p><h2 id="mentors-title">Tous les mentors</h2><p>Découvre un aperçu du catalogue et consulte les fiches pour préparer ta séance.</p></div><a className={styles.seeAll} href={nextRoutes.directory} aria-label="Voir tous les mentors">Voir tout ↗</a></div>
    {result.state === 'loading' ? <div className={styles.state} role="status">Chargement des mentors…</div> : result.state === 'error' ? <div className={styles.state}><p role="alert">Les mentors ne peuvent pas être affichés pour le moment.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Réessayer</button><a href={nextRoutes.directory}>Ouvrir l’annuaire</a></div> : !result.data.length ? <div className={styles.state}><p>Aucun mentor n’est disponible dans le catalogue pour le moment.</p><a href={nextRoutes.search}>Explorer les disciplines</a></div> : <>
      {result.demo && <p className={styles.demo}>Catalogue de démonstration : aucune séance réelle ne peut être réservée ici.</p>}
      <CenteredCarousel label="Tous les mentors" items={result.data.map(coach => {
        const sport = knownDiscoverySport(coach.sport);
        const href = buildNextPath(nextRoutes.coach, { sport: sport?.[0] ?? coach.sport, city: coach.city, coach: coach.id });
        return { id: coach.id, content: <article className={styles.card} data-mentor-id={coach.id}>
          <div className={styles.visual}><CoachVisual coachId={coach.id} name={coach.name} photoUrl={coach.photoUrl} demo={result.demo} sizes="(max-width: 420px) 76vw, 320px" /></div>
          <div className={styles.content}><p className={styles.discipline}>{sport?.[1] ?? coach.sport}</p><h3>{coach.name}</h3><p>{coach.specialty}</p><p>{coach.city || 'Lieu à confirmer'}</p><p className={styles.price}>{coach.priceFrom === null ? 'Tarif à confirmer' : <>À partir de <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(coach.priceFrom)}</strong></>}</p><a href={href}>Voir la fiche <span aria-hidden="true">↗</span><span className={styles.srOnly}> de {coach.name}</span></a></div>
        </article> };
      })} />
    </>}
  </section>;
}
