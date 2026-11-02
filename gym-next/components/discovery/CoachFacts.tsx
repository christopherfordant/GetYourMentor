import type { MentorPreview } from '@/lib/mentor-preview';
import styles from './coach-facts.module.css';

type Facts = Pick<MentorPreview, 'sessionTypes' | 'format' | 'practice' | 'level'>;
const formats = { presentiel: 'Présentiel', visio: 'Visio' };
const practices = { interieur: 'En intérieur', exterieur: 'En extérieur' };
const levels = { debutant: 'Débutant', intermediaire: 'Intermédiaire', confirme: 'Confirmé' };

export function CoachFacts({ coach, profile = false }: { coach: Facts; profile?: boolean }) {
  const sessions = coach.sessionTypes?.trim() || (coach.format ? formats[coach.format] : 'À confirmer avec le coach');
  return <dl className={styles.facts}>
    <div><dt>Formats déclarés</dt><dd data-booking-session-types={profile ? '' : undefined}>{sessions}</dd></div>
    {coach.practice && <div><dt>Cadre indiqué</dt><dd>{practices[coach.practice]}</dd></div>}
    {coach.level && <div><dt>Niveau indiqué</dt><dd>{levels[coach.level]}</dd></div>}
  </dl>;
}
