// Every indexable page of the site, in each language it exists in. The
// sitemap, the hreflang tags, the language switcher and the IndexNow ping
// all read this list, so a page added here is wired everywhere at once.
// Safe to import from client code (no Node APIs).
import { HOME_PATH, type Locale } from "@/lib/i18n";

export interface SiteRoute {
  /** Path per language. A page written in one language only has one entry. */
  paths: Partial<Record<Locale, string>>;
  /** Last meaningful content change (yyyy-mm-dd): the sitemap's lastmod. */
  updated: string;
  priority: number;
}

export const ROUTES = {
  home: { paths: { en: "/", fr: "/fr" }, updated: "2026-10-18", priority: 1 },
  carSpotting: { paths: { en: "/car-spotting", fr: "/fr/carspotting" }, updated: "2026-10-18", priority: 0.9 },
  identify: { paths: { en: "/car-identifier", fr: "/fr/identifier-une-voiture" }, updated: "2026-10-18", priority: 0.8 },
  plates: { paths: { en: "/license-plate-blur", fr: "/fr/flouter-plaque-immatriculation" }, updated: "2026-10-18", priority: 0.8 },
  meets: { paths: { en: "/car-meets", fr: "/fr/rasso-voiture" }, updated: "2026-10-18", priority: 0.8 },
  guess: { paths: { en: "/guess-the-car", fr: "/fr/devine-la-voiture" }, updated: "2026-10-18", priority: 0.7 },
  clubs: { paths: { en: "/car-clubs", fr: "/fr/clubs-auto" }, updated: "2026-10-18", priority: 0.7 },
  cars: { paths: { en: "/cars", fr: "/fr/voitures" }, updated: "2026-10-18", priority: 0.8 },
  engineering: { paths: { en: "/engineering" }, updated: "2025-11-24", priority: 0.5 },
  semanticSearch: { paths: { en: "/engineering/semantic-car-search" }, updated: "2026-10-03", priority: 0.5 },
  changelog: { paths: { en: "/changelog" }, updated: "2026-10-03", priority: 0.6 },
  legal: { paths: { fr: "/legal" }, updated: "2026-07-22", priority: 0.3 },
  cgu: { paths: { fr: "/cgu" }, updated: "2026-07-22", priority: 0.3 },
  privacy: { paths: { fr: "/privacy" }, updated: "2026-07-22", priority: 0.3 },
  communityStandards: { paths: { fr: "/community-standards" }, updated: "2026-07-22", priority: 0.3 },
} satisfies Record<string, SiteRoute>;

export type RouteKey = keyof typeof ROUTES;

/** A route's path in a language (falls back to the language it exists in). */
export function routePath(key: RouteKey, locale: Locale): string {
  const paths: Partial<Record<Locale, string>> = ROUTES[key].paths;
  return paths[locale] ?? paths.en ?? paths.fr ?? "/";
}

/** Brand pages: /cars/porsche ↔ /fr/voitures/porsche. */
export const brandPath = (slug: string, locale: Locale) => `${routePath("cars", locale)}/${slug}`;

/** The same page in the other language, for the language switcher. Falls
 * back to that language's home when the page has no translation. */
export function alternatePath(pathname: string, target: Locale): string {
  const clean = pathname.replace(/\/$/, "") || "/";
  for (const route of Object.values(ROUTES) as SiteRoute[]) {
    if (Object.values(route.paths).includes(clean)) return route.paths[target] ?? HOME_PATH[target];
  }
  for (const from of ["en", "fr"] as const) {
    const prefix = `${routePath("cars", from)}/`;
    if (clean.startsWith(prefix)) return brandPath(clean.slice(prefix.length), target);
  }
  return HOME_PATH[target];
}
