"use client";
import { useEffect, useState } from 'react';
import { collectiveDetailsHref, readCollectivePreview, type CollectivePreview } from '@/lib/collective-preview';
import { formatBookingSlot } from '@/lib/domain/booking-time';
import { knownDiscoverySport } from '@/lib/discovery-sports';
import styles from './collective-preview.module.css';
type Result = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: CollectivePreview[] };
export function CollectivePreviewSection() {
  const [result, setResult] = useState<Result>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    setResult({ state: 'loading' });
    fetch('/api/sessions/preview', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Indisponible');
      const data = readCollectivePreview(await response.json());
      if (active) setResult({ state: 'ready', data });
    }).catch(() => { if (active) setResult({ state: 'error' }); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  return <section id="collectif" className={styles.section} aria-labelledby="collectif-title" aria-busy={result.state === 'loading'}>
    <div className={styles.heading}><div><p className={styles.eyebrow}>Les séances collectives</p><h2 id="collectif-title">Entraîne-toi à plusieurs</h2><p>Un aperçu des séances pour deux participants, au tarif total fixé par le coach.</p></div><a href="/seances?participants=2" aria-label="Voir toutes les séances pour deux participants">Voir tout ↗</a></div>
    {result.state === 'loading' ? <div className={styles.state} role="status">Chargement des séances collectives…</div> : result.state === 'error' ? <div className={styles.state}><p role="alert">Les séances collectives ne sont pas disponibles pour le moment.</p><button type="button" onClick={() => setAttempt(n => n + 1)}>Réessayer</button></div> : <>
      <p className={styles.note}>Démonstration : aucune séance réelle. Les places et le tarif sont revérifiés lors de la demande. Paiement simulé après acceptation du coach.</p>
      {!result.data.length ? <div className={styles.state}><p>Aucune séance pour deux participants à présenter pour le moment.</p><a href="/seances?participants=2">Consulter le catalogue collectif</a></div> : <div className={styles.grid}>{result.data.map(offer => <article className={styles.card} key={offer.id} data-collective-id={offer.id}>
        <p className={styles.eyebrow}>{knownDiscoverySport(offer.sport)?.[1] ?? offer.sport} · {offer.source === 'coach' ? 'Coach' : 'Structure'}</p><h3>{offer.title}</h3><p>{offer.coachName ? `Avec ${offer.coachName}` : 'Coach à consulter sur la fiche'}</p>
        <p><time dateTime={offer.slot}>{formatBookingSlot(offer.slot)}</time><br />Horaires Europe/Paris · {offer.duration}</p><p>{offer.location ? `Lieu : ${offer.location}` : 'Lieu à confirmer sur la fiche'}{offer.city ? ` · Ville du coach : ${offer.city}` : ''}</p>
        <p>{offer.capacity} places au total · {offer.remaining} restantes sur ce créneau</p><p className={styles.price}><strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(offer.totalCents / 100)}</strong> au total pour deux participants</p>
        <a className={styles.cta} href={collectiveDetailsHref(offer.id)}>Voir la séance<span className={styles.srOnly}> : {offer.title}</span><span aria-hidden="true">↗</span></a>
      </article>)}</div>}
    </>}
  </section>;
}
