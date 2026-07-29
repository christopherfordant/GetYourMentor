import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Manrope } from "next/font/google";
import { InternalNavigationEnhancer } from "@/components/InternalNavigationEnhancer";

const inlineGlobalStyles = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
const inlineLegacyStyles = readFileSync(
  path.join(process.cwd(), "app", "legacy-prototype.css"),
  "utf8",
);

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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `${inlineGlobalStyles}\n${inlineLegacyStyles}` }} />
      </head>
      <body className={manrope.variable}>
        <InternalNavigationEnhancer />
        {children}
      </body>
    </html>
  );
}
