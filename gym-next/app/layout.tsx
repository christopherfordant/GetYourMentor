import type { Metadata, Viewport } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Manrope } from "next/font/google";
import { InternalNavigationEnhancer } from "@/components/InternalNavigationEnhancer";

const inlineGlobalStyles = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
const inlineLegacyStyles = readFileSync(
  path.join(process.cwd(), "app", "legacy-prototype.css"),
  "utf8",
);
const inlineRedesignStyles = readFileSync(
  path.join(process.cwd(), "app", "redesign-2026.css"),
  "utf8",
);

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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `${inlineGlobalStyles}\n${inlineLegacyStyles}\n${inlineRedesignStyles}` }} />
      </head>
      <body className={manrope.variable}>
        <InternalNavigationEnhancer />
        {children}
      </body>
    </html>
  );
}
