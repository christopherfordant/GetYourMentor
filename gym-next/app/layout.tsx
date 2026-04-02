import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "GetYourMentor Next",
  description: "Base de migration Next.js du prototype GetYourMentor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
