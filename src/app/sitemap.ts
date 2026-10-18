import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { listEntries } from "@/lib/changelog";
import { ROUTES, brandPath, type SiteRoute } from "@/lib/routes";
import { LOCALES } from "@/lib/i18n";
import { indexableBrands, CATALOGUE_UPDATED } from "@/lib/catalogue";

// Native, dynamic sitemap built from lib/routes.ts: one <url> per page and
// language, each listing its translations (hreflang) so Google pairs /x with
// /fr/x. lastmod comes from the explicit content dates in the registry, never
// from git (a file move or a shallow CI clone would reset them all).
// /invite, /news and /user (deep-link fallbacks) are intentionally excluded.

const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

function entriesFor(route: Pick<SiteRoute, "paths" | "priority">, lastModified: Date): MetadataRoute.Sitemap {
  const locales = LOCALES.filter((l) => route.paths[l]);
  const languages =
    locales.length > 1
      ? {
          ...Object.fromEntries(locales.map((l) => [l, abs(route.paths[l]!)])),
          "x-default": abs(route.paths.en ?? route.paths[locales[0]]!),
        }
      : undefined;
  return locales.map((l) => ({
    url: abs(route.paths[l]!),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route.priority,
    ...(languages && { alternates: { languages } }),
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const changelog = listEntries();
  const latestRelease = changelog[0]?.iso;

  const pages = (Object.entries(ROUTES) as Array<[string, SiteRoute]>).flatMap(([key, route]) =>
    entriesFor(route, new Date(key === "changelog" && latestRelease ? latestRelease : route.updated)),
  );

  const brands = indexableBrands().flatMap((b) =>
    entriesFor({ paths: { en: brandPath(b.id, "en"), fr: brandPath(b.id, "fr") }, priority: 0.6 }, new Date(CATALOGUE_UPDATED)),
  );

  const releases: MetadataRoute.Sitemap = changelog.map((entry) => ({
    url: `${SITE_URL}/changelog/${entry.slug}`,
    lastModified: new Date(entry.iso),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...pages, ...brands, ...releases];
}
