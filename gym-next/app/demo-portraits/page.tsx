import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { FanCarousel } from '@/components/discovery/FanCarousel';
import card from '@/components/discovery/fan-mentor-card.module.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Portraits — démonstration locale', robots: { index: false, follow: false } };
const portraits = [['crossfit','CrossFit'],['padel','Padel'],['pilates','Pilates'],['musculation','Musculation'],['boxe','Boxe'],['preparation-physique','Préparation physique']];
export default async function PortraitDemo({ searchParams }: { searchParams: Promise<{ count?: string }> }) {
  if (process.env.GETYOURMENTOR_ACCEPTANCE_MODE !== 'true' || process.env.GETYOURMENTOR_ALLOW_DEMO !== 'true') notFound();
  const requested = Number((await searchParams).count ?? 6);
  const count = [0,1,2,6,8,20].includes(requested) ? requested : 6;
  const items = Array.from({ length: count }, (_,i) => {
    const [id,sport] = portraits[i % portraits.length];
    return { id:`portrait-${i}`,title:`Illustration ${sport}`,content:<article className={card.card}>
      <div className={card.visual}><figure><img src={`/design_assets/ai-coaches-2026-11-03/coach-${id}-640.webp`} width="640" height="640" alt={`Personne fictive : illustration IA pour ${sport}`} loading={i<3?'eager':'lazy'}/><figcaption>Illustration IA · personne fictive</figcaption></figure></div>
      <div className={card.content}><p className={card.discipline}>{sport}</p><h3>Portrait de démonstration</h3><p>Personne fictive · aucun coach inscrit</p>{i>=6&&<p>Répétition de maquette pour tester le volume</p>}</div>
    </article>};
  });
  return <main style={{maxWidth:1520,margin:'auto',padding:'40px 16px',fontFamily:'Arial,sans-serif',color:'#30281f',background:'#f5f2ec',minHeight:'100vh','--gym-ink':'#30281f','--gym-surface':'#fff9f1','--gym-line':'#b7a18b'} as CSSProperties}>
    <a href="/">← Retour à l’accueil</a><h1>Les nouveaux portraits, en éventail</h1><p>Six illustrations de personnes fictives, sans fiche commerciale, tarif, diplôme ou réservation.</p>
    <nav aria-label="Effectif de la maquette" style={{display:'flex',gap:16,flexWrap:'wrap'}}>{[0,1,2,6,8,20].map(n=><a key={n} href={`?count=${n}`}>{n} cartes</a>)}</nav>
    {count ? <FanCarousel label="Portraits fictifs de démonstration" items={items}/> : <p role="status">Aucun portrait dans cet exemple.</p>}
    <h2>La planche des six originaux retenus</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>{portraits.map(([id,sport])=><figure key={id} style={{margin:0}}><img src={`/design_assets/ai-coaches-2026-11-03/coach-${id}-640.webp`} alt={`Illustration IA : ${sport}`} width="640" height="640" style={{width:'100%',height:'auto',borderRadius:12}}/><figcaption>{sport} · illustration IA</figcaption></figure>)}</div>
  </main>;
}
