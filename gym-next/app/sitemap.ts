import { discoverySports } from '@/lib/sports-catalogue';
import { isHostedDemo } from '@/lib/runtime';
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isHostedDemo()) return [];
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(/\/$/, "");
  const publicRoutes = ["/", "/recherche", "/coachs", "/coach", "/inscription-club"];

  return [...publicRoutes, ...discoverySports.map(([slug]) => `/recherche?sport=${slug}`)].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
