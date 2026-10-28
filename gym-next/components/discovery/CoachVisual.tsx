"use client";
import { useEffect, useRef, useState } from 'react';
import { coachVisual } from '@/lib/demo-visuals';
import styles from './visual-library.module.css';

export function CoachVisual({ coachId, name, demo = false, photoUrl, priority = false }: {
  coachId?: string; name: string; demo?: boolean; photoUrl?: string; priority?: boolean;
}) {
  const visual = coachVisual(coachId, demo, photoUrl);
  const [failedSource, setFailedSource] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);
  // An SSR image can fail before React attaches onError during hydration.
  useEffect(() => {
    const image = imageRef.current;
    if (visual && image?.complete && image.naturalWidth === 0) setFailedSource(visual.src);
  }, [visual?.src]);
  const showImage = visual && failedSource !== visual.src;
  return <figure className={styles.portrait} data-coach-visual={coachId ?? 'unknown'}>
    {showImage ? <img ref={imageRef} src={visual.src} srcSet={visual.small ? `${visual.small} 640w, ${visual.src} 1280w` : undefined}
      sizes="(max-width: 760px) 100vw, 42vw" width="1536" height="1024"
      alt={visual.ai ? 'Portrait illustratif créé par IA, sans représentation de la personne nommée.' : `Photo de ${name}`}
      loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedSource(visual.src)} />
      : <div className={styles.initials} role="img" aria-label={`Photo indisponible pour ${name}`}>
        <span aria-hidden="true">{name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('')}</span>
      </div>}
    {showImage && visual.ai && <figcaption>Illustration IA · profil de démonstration</figcaption>}
  </figure>;
}
