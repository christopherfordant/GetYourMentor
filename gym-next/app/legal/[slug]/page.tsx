import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildCanonical } from "@/lib/seo";

const documents = {
  cgv: {
    sections: [["Objet", "GetYourMentor met en relation des sportifs et des coachs independants pour des seances reservees via la plateforme."], ["Reservation et paiement", "Une demande devient une reservation apres validation du coach. Le paiement est realise via le prestataire affiche au moment du reglement."], ["Annulation", "Sauf regle particuliere affichee lors de la commande, le remboursement est de 100 % au-dela de 48 heures et de 50 % entre 24 et 48 heures avant la seance."], ["Validation juridique", "L identite du vendeur, la TVA, les frais et le droit de retractation doivent etre completes et valides avant ouverture publique."]],
    label: "Conditions générales de vente",
    description: "Le document contractuel applicable aux réservations et paiements.",
  },
  cgu: {
    sections: [["Compte", "L utilisateur fournit des informations exactes, conserve ses identifiants et utilise la plateforme pour une activite licite."], ["Roles", "Les sportifs, coachs, etablissements et administrateurs disposent de droits distincts. Les coachs ne sont visibles qu apres validation."], ["Disponibilite", "La plateforme peut etre interrompue pour maintenance ou securite."]],
    label: "Conditions générales d’utilisation",
    description: "Le document qui encadrera l’utilisation de GetYourMentor.",
  },
  confidentialite: {
    sections: [["Donnees traitees", "Identite, coordonnees, reservations, messages, paiements et localisation lorsque l utilisateur l autorise."], ["Finalites", "Creer le compte, rechercher, reserver, notifier et prevenir la fraude."], ["Droits", "Toute personne peut demander l acces, la rectification, l effacement, la limitation ou la portabilite de ses donnees selon le cadre applicable."], ["Conservation", "Les durees, le responsable de traitement et le contact doivent etre renseignés par le responsable juridique."]],
    label: "Politique de confidentialité",
    description: "Le document qui précisera les traitements de données et les droits des personnes.",
  },
  "mentions-legales": {
    sections: [["Editeur", "Denomination, forme juridique, adresse, immatriculation et directeur de publication : informations a renseigner par le porteur du projet."], ["Hebergement", "Hebergeur applicatif : Netlify. Donnees applicatives : Supabase. Les coordonnees contractuelles doivent etre completees avant publication."], ["Contact", "Adresse de contact du service : a renseigner avant ouverture publique."]],
    label: "Mentions légales",
    description: "Les informations légales de l’éditeur et de l’hébergeur.",
  },
  cookies: {
    sections: [["Cookies necessaires", "La plateforme peut utiliser les cookies strictement necessaires a la session et a la securite."], ["Mesure d audience", "Aucun outil non necessaire ne doit etre active sans le consentement requis."], ["Gestion", "Les choix de consentement devront etre raccordes au bandeau cookies avant mise en production."]],
    label: "Gestion des cookies",
    description: "Le document et les choix de consentement relatifs aux cookies.",
  },
  accessibilite: {
    sections: [["Engagement", "GetYourMentor vise une experience responsive, lisible au clavier et compatible avec les technologies d assistance."], ["Limites connues", "La conformite doit etre auditee sur inscription, recherche, reservation, paiement et compte."], ["Contact", "Le canal de signalement doit etre renseigne avant ouverture publique."]],
    label: "Accessibilité",
    description: "La déclaration d’accessibilité et les moyens de contact associés.",
  },
} as const;

function getDocument(slug: string) {
  return documents[slug as keyof typeof documents];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = getDocument(slug);
  if (!document) return {};

  return {
    title: `${document.label} — GetYourMentor`,
    description: document.description,
    robots: { index: false, follow: false },
    alternates: { canonical: buildCanonical(`/legal/${slug}`) },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = getDocument(slug);
  if (!document) notFound();

  return (
    <main className="legal-placeholder-page">
      <div className="legal-placeholder-card">
        <p className="legal-placeholder-kicker">Brouillon a valider</p>
        <h1>{document.label}</h1>
        <p>
          Cette page est volontairement informative. Aucun texte juridique n’est déduit ou présenté comme applicable.
          Les informations à fournir et à valider avant toute ouverture publique devront être rédigées et validées par la personne compétente.
        </p>
        <p className="legal-placeholder-topic">Périmètre prévu : {document.description}</p>
        <div className="legal-sections">
          {document.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
        </div>
        <Link href="/">Retour à l’accueil</Link>
      </div>
    </main>
  );
}
