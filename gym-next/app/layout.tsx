import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { InternalNavigationEnhancer } from "@/components/InternalNavigationEnhancer";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import "./globals.css";
import "./legacy-prototype.css";
import "./redesign-2026.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"),
  title: {
    default: "GetYourMentor",
    template: "%s | GetYourMentor",
  },
  description: "Trouvez et reservez votre coach sportif en ligne sur GetYourMentor.",
  applicationName: "GetYourMentor",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1020",
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
        <CookieConsentBanner />
      </body>
    </html>
  );
}
