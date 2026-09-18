import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildCanonical } from "@/lib/seo";

const documents = {
  cgv: {
    label: "Conditions générales de vente",
    description: "Le document contractuel applicable aux réservations et paiements.",
  },
  cgu: {
    label: "Conditions générales d’utilisation",
    description: "Le document qui encadrera l’utilisation de GetYourMentor.",
  },
  confidentialite: {
    label: "Politique de confidentialité",
    description: "Le document qui précisera les traitements de données et les droits des personnes.",
  },
  "mentions-legales": {
    label: "Mentions légales",
    description: "Les informations légales de l’éditeur et de l’hébergeur.",
  },
  cookies: {
    label: "Gestion des cookies",
    description: "Le document et les choix de consentement relatifs aux cookies.",
  },
  accessibilite: {
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

export default async function LegalPlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = getDocument(slug);
  if (!document) notFound();

  return (
    <main className="legal-placeholder-page">
      <div className="legal-placeholder-card">
        <p className="legal-placeholder-kicker">Préproduction</p>
        <h1>{document.label}</h1>
        <p className="legal-placeholder-status">Document à fournir et à valider avant toute ouverture publique.</p>
        <p>
          Cette page est volontairement informative. Aucun texte juridique n’est déduit ou présenté comme applicable.
          Le contenu final devra être rédigé et validé par la personne compétente avant le lancement.
        </p>
        <p className="legal-placeholder-topic">Périmètre prévu : {document.description}</p>
        <Link href="/">Retour à l’accueil</Link>
      </div>
    </main>
  );
}
