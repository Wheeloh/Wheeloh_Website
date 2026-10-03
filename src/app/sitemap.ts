import type { MetadataRoute } from "next";
import { execSync } from "node:child_process";
import { SITE_URL } from "@/lib/seo";
import { listEntries } from "@/lib/changelog";

// Native, dynamic sitemap. Replaces next-sitemap: accurate content-derived
// lastmod, includes changelog detail routes, and no self-referencing index.
// /invite, /news, /user and /legal-and-privacy are intentionally excluded.

// Fallback used only if git history is unavailable at build time (e.g. a
// shallow clone) — never falls back to `new Date()`, which would make every
// static route report an identical, meaningless "now" lastmod on every build.
const FALLBACK_DATE = new Date("2026-07-22T00:00:00.000Z");

/** Real last-content-change date for a source file, via git history. */
function lastCommitDate(file: string): Date {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${file}`, {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
    return iso ? new Date(iso) : FALLBACK_DATE;
  } catch {
    return FALLBACK_DATE;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: Array<{ path: string; priority: number; file: string }> = [
    { path: "/", priority: 1, file: "src/components/HomeContent.tsx" },
    { path: "/engineering", priority: 0.7, file: "src/components/EngineeringContent.tsx" },
    { path: "/engineering/semantic-car-search", priority: 0.7, file: "src/components/SemanticCarSearchContent.tsx" },
    { path: "/changelog", priority: 0.7, file: "src/components/ChangelogListContent.tsx" },
    { path: "/legal", priority: 0.4, file: "src/components/LegalContent.tsx" },
    { path: "/cgu", priority: 0.4, file: "src/components/CguContent.tsx" },
    { path: "/privacy", priority: 0.4, file: "src/components/PrivacyContent.tsx" },
    { path: "/community-standards", priority: 0.4, file: "src/components/CommunityStandardsContent.tsx" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority, file }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastCommitDate(file),
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
