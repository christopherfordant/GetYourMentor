import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { FanCarousel } from '@/components/discovery/FanCarousel';
import card from '@/components/discovery/fan-mentor-card.module.css';
import { demoCoachPortraits } from '@/lib/demo-coach-portraits';
import { isLocalPortraitPreview } from '@/lib/runtime';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Portraits — démonstration locale', robots: { index: false, follow: false } };
const portraits = demoCoachPortraits;
export default async function PortraitDemo({ searchParams }: { searchParams: Promise<{ count?: string; portrait?: string }> }) {
  if (!isLocalPortraitPreview()) notFound();
  const params = await searchParams;
  const selected = portraits.find(([id]) => id === params.portrait);
  const requested = Number(params.count ?? 6);
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
    {selected && <section id="portrait-detail" style={{margin:'24px 0',padding:20,border:'1px solid #c8b7a2',borderRadius:16,display:'flex',flexWrap:'wrap',gap:24,alignItems:'center'}}><img src={`/design_assets/ai-coaches-2026-11-03/coach-${selected[0]}-640.webp`} width="240" height="240" alt={`Illustration IA : personne fictive pour ${selected[1]}`} style={{borderRadius:12,maxWidth:'100%',height:'auto'}}/><div><h2>Coach {selected[1]} — démonstration</h2><p>Portrait créé par IA, représentant une personne fictive.</p><p>Aucun compte coach, diplôme, avis, tarif ou créneau n’est associé à cette illustration.</p><a href="/#mentors">Revenir à l’éventail de l’accueil</a></div></section>}
    <nav aria-label="Effectif de la maquette" style={{display:'flex',gap:16,flexWrap:'wrap'}}>{[0,1,2,6,8,20].map(n=><a key={n} href={`?count=${n}`}>{n} cartes</a>)}</nav>
    {count ? <FanCarousel label="Portraits fictifs de démonstration" items={items}/> : <p role="status">Aucun portrait dans cet exemple.</p>}
    <h2>La planche des six originaux retenus</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>{portraits.map(([id,sport])=><figure key={id} style={{margin:0}}><img src={`/design_assets/ai-coaches-2026-11-03/coach-${id}-640.webp`} alt={`Illustration IA : ${sport}`} width="640" height="640" style={{width:'100%',height:'auto',borderRadius:12}}/><figcaption>{sport} · illustration IA</figcaption></figure>)}</div>
  </main>;
}
