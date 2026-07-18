import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /legal-and-privacy is intentionally NOT disallowed here: it carries
        // its own noindex meta tag, and Google must be allowed to crawl it to
        // ever see that tag and drop it from the index (a robots.txt disallow
        // alone cannot de-index an already-indexed URL).
        disallow: ["/admin", "/invite", "/news", "/user"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
