import "./globals.css";
import "./legacy-prototype.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { InternalNavigationEnhancer } from "@/components/InternalNavigationEnhancer";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "GetYourMentor",
  description: "Trouvez et réservez votre coach sportif en ligne sur GetYourMentor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={manrope.variable}>
        <InternalNavigationEnhancer />
        {children}
      </body>
    </html>
  );
}
