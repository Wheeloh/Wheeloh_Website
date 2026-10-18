// The site's two languages. English lives at the root (the URLs Google
// already knows), French under /fr. Safe to import from server and client.

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The home page of each language. */
export const HOME_PATH: Record<Locale, string> = { en: "/", fr: "/fr" };

/** og:locale values. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR" };

/** Number formatting used across the copy ("1,154" / "1 154"). */
export const NUMBER_LOCALE: Record<Locale, string> = { en: "en-US", fr: "fr-FR" };

export const formatNumber = (n: number, locale: Locale) => n.toLocaleString(NUMBER_LOCALE[locale]);

/** "/#features" or "/fr#features". */
export const sectionHref = (id: string, locale: Locale) => `${HOME_PATH[locale] === "/" ? "/" : HOME_PATH[locale]}#${id}`;
