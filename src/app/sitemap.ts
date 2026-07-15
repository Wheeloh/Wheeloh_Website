import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { listEntries } from "@/lib/changelog";

// Native, dynamic sitemap. Replaces next-sitemap: accurate content-derived
// lastmod, includes changelog detail routes, and no self-referencing index.
// /invite, /news, /user and /legal-and-privacy are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/engineering", priority: 0.7 },
    { path: "/engineering/semantic-car-search", priority: 0.7 },
    { path: "/changelog", priority: 0.7 },
    { path: "/legal", priority: 0.4 },
    { path: "/cgu", priority: 0.4 },
    { path: "/privacy", priority: 0.4 },
    { path: "/community-standards", priority: 0.4 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  const changelogEntries: MetadataRoute.Sitemap = listEntries().map((entry) => ({
    url: `${SITE_URL}/changelog/${entry.slug}`,
    lastModified: new Date(entry.iso),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...changelogEntries];
}
