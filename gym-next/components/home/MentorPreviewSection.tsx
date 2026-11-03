"use client";
import { useEffect, useState } from 'react';
import { CoachVisual } from '@/components/discovery/CoachVisual';
import { FanCarousel, type FanItem } from '@/components/discovery/FanCarousel';
import card from '@/components/discovery/fan-mentor-card.module.css';
import { readMentorPreview, type MentorPreview } from '@/lib/mentor-preview';
import { demoCoachPortraits } from '@/lib/demo-coach-portraits';
import { knownDiscoverySport } from '@/lib/discovery-sports';
import { buildNextPath, nextRoutes } from '@/lib/next-routes';
import styles from '@/components/discovery/mentor-carousel.module.css';

type Preview = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: MentorPreview[]; demo: boolean; showDemoPortraits: boolean };
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
  const items: FanItem[] = result.state === 'ready' ? result.data.map(coach => {
    const sport = knownDiscoverySport(coach.sport);
    const href = buildNextPath(nextRoutes.coach, { sport: sport?.[0] ?? coach.sport, city: coach.city, coach: coach.id });
    return { id: `coach:${coach.id}`, title: coach.name, content: <article className={card.card} data-mentor-id={coach.id}>
      <div className={card.visual}><CoachVisual coachId={coach.id} name={coach.name} photoUrl={coach.photoUrl} demo={result.demo} compactCaption sizes="(max-width: 760px) 78vw, 340px" /></div>
      <div className={card.content}><p className={card.discipline}>{sport?.[1] ?? coach.sport}</p><h3 title={coach.name}>{coach.name}</h3><p className={card.summary}>{coach.specialty}</p><p>{coach.city || 'Lieu à confirmer'}</p>
        <p className={card.price}>{coach.priceFrom === null ? 'Tarif à confirmer' : <>À partir de <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(coach.priceFrom)}</strong></>}</p>
        <a href={href}>Voir la fiche <span aria-hidden="true">↗</span><span className={card.srOnly}> de {coach.name}</span></a>
      </div></article> };
  }) : [];
  const showPortraits = result.state === 'ready' && result.demo && result.showDemoPortraits && result.data.length > 0;
  if (showPortraits) items.push(...demoCoachPortraits.map(([id, sport]) => ({
    id: `illustration:${id}`, title: `Coach ${sport} — démo`, content: <article className={card.card} data-demo-coach-portrait={id}>
      <div className={card.visual}><figure><img src={`/design_assets/ai-coaches-2026-11-03/coach-${id}-640.webp`} width="640" height="640" alt={`Illustration IA : personne fictive pour ${sport}`} loading="lazy" decoding="async" /><figcaption>Illustration IA · démo</figcaption></figure></div>
      <div className={card.content}><p className={card.discipline}>{sport}</p><h3>Coach {sport}</h3><p>Profil fictif de démonstration</p><p>Aucune séance proposée</p><a href={`/demo-portraits?portrait=${id}#portrait-detail`}>Découvrir ce portrait <span aria-hidden="true">↗</span><span className={card.srOnly}> {sport}, démonstration</span></a></div>
    </article>,
  })));
  return <section id="mentors" className={styles.section} aria-labelledby="mentors-title" aria-busy={result.state === 'loading'}>
    <div className={styles.heading}><div><p className={styles.eyebrow}>Le catalogue</p><h2 id="mentors-title">Tous les mentors</h2><p>Découvre un aperçu du catalogue et consulte les fiches pour préparer ta séance.</p></div><a className={styles.seeAll} href={nextRoutes.directory} aria-label="Voir tous les mentors">Voir tout ↗</a></div>
    {result.state === 'loading' ? <div className={styles.state} role="status">Chargement des mentors…</div> : result.state === 'error' ? <div className={styles.state}><p role="alert">Les mentors ne peuvent pas être affichés pour le moment.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Réessayer</button><a href={nextRoutes.directory}>Ouvrir l’annuaire</a></div> : !result.data.length ? <div className={styles.state}><p>Aucun mentor n’est disponible dans le catalogue pour le moment.</p><a href={nextRoutes.search}>Explorer les disciplines</a></div> : <>
      {result.demo && <p className={styles.demo}>Catalogue de démonstration : aucune séance réelle ne peut être réservée ici.</p>}
      <p className={styles.demo}>{result.data.length} profil{result.data.length > 1 ? 's' : ''} dans cet aperçu. Informations détaillées, montant et durée à vérifier sur la fiche avant confirmation.</p>
      {showPortraits && <p className={styles.demo}>L’éventail comprend aussi six portraits de coachs fictifs pour présenter le rendu. Ces illustrations ne correspondent pas à des coachs inscrits et ne proposent aucune réservation.</p>}
      <FanCarousel label="Aperçu des mentors" items={items} />
    </>}
  </section>;
}
