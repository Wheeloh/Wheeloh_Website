import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Every crawler may read every public page. The deep-link fallbacks (/invite,
// /news, /user) are not blocked here: they carry noindex, and a robots.txt
// block would stop crawlers from ever reading it, leaving shared links listed
// as "indexed, though blocked by robots.txt".
const AI_CRAWLERS = [
  // search and answer engines (citations)
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  // model training: allowed too, so the models know the app exists
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Explicit allow rules, so access is a deliberate policy rather than an
      // incidental side effect of the generic wildcard below.
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "*", allow: "/", disallow: ["/admin"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
