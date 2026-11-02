import { ContactCoachForm } from "@/components/booking-legacy/ContactCoachForm";
import { CoachFacts } from './CoachFacts';
import type { MentorPreview } from '@/lib/mentor-preview';

type ProfileDetails = { bio: string; specialty: string; diploma: string; disciplines?: string; sessionTypes?: string; availability?: string } & Pick<MentorPreview, 'format' | 'practice' | 'level'>;

export function CoachDetails({ coach, profile, isActive }: { coach: string; profile: ProfileDetails; isActive: boolean }) {
  return <section className={`de-booking-pane${isActive ? " is-active" : ""}`} hidden={!isActive} data-booking-pane="apropos" id="booking-apropos-section">
    <div className="de-booking-pane-grid">
      <div className="de-booking-pane-main">
        <article className="de-booking-story-card">
          <p className="de-eyebrow">SON APPROCHE</p>
          <h2>À propos de {coach}</h2>
          <p data-booking-bio>{profile.bio || "Présentation non renseignée."}</p>
          <CoachFacts coach={profile} profile />
          <div className="de-booking-story-points">
            <div className="de-booking-story-point"><strong>Disciplines</strong><span data-booking-disciplines>{profile.disciplines || profile.specialty || "Non renseignées"}</span></div>
            <div className="de-booking-story-point"><strong>Diplômes déclarés</strong><span data-booking-public-diplomas>{profile.diploma || "Non renseignés"}</span></div>
            <div className="de-booking-story-point"><strong>Disponibilités indicatives</strong><span data-booking-availability>{profile.availability || "Sur demande"}</span></div>
          </div>
          <p className="de-note">Formats, diplômes et horaires indicatifs déclarés dans le profil. La validation du profil ne constitue pas une certification de chaque qualification. Les créneaux sont vérifiés avant la demande de réservation.</p>
        </article>
        <article className="de-booking-story-card">
          <p className="de-eyebrow">TA PROCHAINE ÉTAPE</p><h2>De l’envie à la séance.</h2>
          <div className="de-booking-story-sequence">
            <div className="de-booking-story-sequence-item"><span>01</span><strong>Propose tes disponibilités</strong><span>Les créneaux sont vérifiés à l’étape suivante.</span></div>
            <div className="de-booking-story-sequence-item"><span>02</span><strong>Attends l’acceptation du coach</strong><span>Une demande ne confirme pas encore la séance.</span></div>
            <div className="de-booking-story-sequence-item"><span>03</span><strong>Passe au paiement</strong><span>Après acceptation, depuis ton compte.</span></div>
          </div>
          <p>Les conditions de réservation et d’annulation sont précisées dans les <a href="/legal/cgv">conditions de vente</a>. Aucun avantage Premium n’est activé depuis cette fiche.</p>
        </article>
      </div>
      <ContactCoachForm coach={coach} />
    </div>
  </section>;
}
