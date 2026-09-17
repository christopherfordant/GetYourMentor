import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/recherche", "/coachs", "/coach", "/inscription-club"],
      disallow: ["/api/", "/compte", "/paiement", "/recapitulatif", "/creneau"],
    },
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
