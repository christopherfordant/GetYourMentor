import { sportVisual, sportVisuals, visualPath } from '@/lib/demo-visuals';
import styles from './visual-library.module.css';
export function SportIllustration({ sport }: { sport: string }) {
  const key = sport === "fitness" ? "metiers-de-la-forme" : sport;
  if (!Object.hasOwn(sportVisuals,key)) return null;
  const visual = sportVisual(sport);
  return <figure className={styles.scene} data-sport-illustration={visual.asset}>
    <img src={visualPath(visual.asset, 1280)} srcSet={`${visualPath(visual.asset, 640)} 640w, ${visualPath(visual.asset, 1280)} 1280w`}
      sizes="(max-width: 760px) 100vw, 760px" alt={visual.alt} width="1536" height="1024" loading="lazy" decoding="async" />
    <figcaption>Scène d’entraînement créée par IA · personnages fictifs</figcaption>
  </figure>;
}
