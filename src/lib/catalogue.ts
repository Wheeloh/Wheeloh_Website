// The collection catalogue behind /cars and /fr/voitures: the 74 brands and
// 1,154 models a Wheeloh spotter collects. From the app's car database, each
// brand carries only a preview — the specs of its first few models and four
// headline figures; the rest is in the app. Built by
// scripts/build-car-catalogue.mjs. Server-side only.
import data from "@/data/car-catalogue.json";
import { formatNumber, type Locale } from "@/lib/i18n";

/** Date of the app's catalogue export (public/car-brands/data.json). */
export const CATALOGUE_UPDATED = "2026-05-24";

/** Brands with fewer models get a page, but stay out of the index. */
const MIN_INDEXED_MODELS = 3;

export interface CatalogueModel {
  name: string;
  from?: number;
  to?: number;
  hp?: number;
  /** 0–100 km/h, seconds */
  acc?: number;
  /** top speed, km/h */
  vmax?: number;
  /** displacement (L), layout, aspiration — or electric */
  l?: number;
  cyl?: string;
  asp?: string;
  ev?: boolean;
  body?: string;
  versions?: number;
}

export interface CatalogueBrand {
  id: string;
  name: string;
  country: string;
  logo: string;
  /** Every model of the brand's collection, by name. */
  models: string[];
  /** The first models, with their specs: what a brand page shows. */
  preview: CatalogueModel[];
  highlights: {
    strongest?: { name: string; hp: number };
    fastest?: { name: string; vmax: number };
    oldest?: { name: string; from: number };
    newest?: { name: string; from: number };
  };
}

const BRANDS = (data as { brands: CatalogueBrand[] }).brands;

export const allBrands = () => BRANDS;
export const getBrand = (id: string) => BRANDS.find((b) => b.id === id);
export const isIndexable = (b: CatalogueBrand) => b.models.length >= MIN_INDEXED_MODELS;
export const indexableBrands = () => BRANDS.filter(isIndexable);
export const totalModels = () => BRANDS.reduce((n, b) => n + b.models.length, 0);

const COUNTRY_FR: Record<string, string> = {
  "United Kingdom": "Royaume-Uni",
  "United States": "États-Unis",
  Italy: "Italie",
  Japan: "Japon",
  Germany: "Allemagne",
  France: "France",
  Sweden: "Suède",
  "South Korea": "Corée du Sud",
  China: "Chine",
  Croatia: "Croatie",
  Netherlands: "Pays-Bas",
  Lebanon: "Liban",
  Denmark: "Danemark",
  Russia: "Russie",
};

export const countryName = (country: string, locale: Locale) => (locale === "fr" ? COUNTRY_FR[country] ?? country : country);

/** Countries in catalogue order of importance (most brands first). */
export function countries(): Array<{ country: string; brands: CatalogueBrand[] }> {
  const by = new Map<string, CatalogueBrand[]>();
  for (const b of BRANDS) by.set(b.country, [...(by.get(b.country) ?? []), b]);
  return Array.from(by.entries())
    .map(([country, brands]) => ({ country, brands }))
    .sort((a, b) => b.brands.length - a.brands.length);
}

// ------------------------------------------------------------ formatting

export const years = (m: CatalogueModel) => (m.from ? (m.to && m.to !== m.from ? `${m.from}–${m.to}` : String(m.from)) : "—");

export const power = (m: CatalogueModel, locale: Locale) =>
  m.hp ? `${formatNumber(m.hp, locale)} ${locale === "fr" ? "ch" : "hp"}` : "—";

export const acceleration = (m: CatalogueModel, locale: Locale) =>
  m.acc ? `${m.acc.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 1 })} s` : "—";

export const topSpeed = (m: CatalogueModel, locale: Locale) => (m.vmax ? `${formatNumber(m.vmax, locale)} km/h` : "—");

const LAYOUT: Record<string, Record<Locale, string>> = {
  L3: { en: "inline-3", fr: "3 cyl. en ligne" },
  L4: { en: "inline-4", fr: "4 cyl. en ligne" },
  L5: { en: "inline-5", fr: "5 cyl. en ligne" },
  L6: { en: "inline-6", fr: "6 cyl. en ligne" },
  L8: { en: "inline-8", fr: "8 cyl. en ligne" },
  F4: { en: "flat-4", fr: "4 cyl. à plat" },
  F6: { en: "flat-6", fr: "6 cyl. à plat" },
  F12: { en: "flat-12", fr: "12 cyl. à plat" },
  ROTARY: { en: "rotary", fr: "rotatif" },
};

const ASPIRATION: Record<string, Record<Locale, string>> = {
  natural: { en: "naturally aspirated", fr: "atmosphérique" },
  turbo: { en: "turbo", fr: "turbo" },
  biturbo: { en: "twin-turbo", fr: "biturbo" },
  quadturbo: { en: "quad-turbo", fr: "quadri-turbo" },
  supercharged: { en: "supercharged", fr: "compresseur" },
  twincharged: { en: "twincharged", fr: "turbo + compresseur" },
  hybrid: { en: "hybrid", fr: "hybride" },
};

function layoutKey(cyl: string) {
  const c = cyl.replace(/\s+/g, " ").trim();
  const inline = c.match(/^(?:L|Inline)\s?(\d+)$/i);
  if (inline) return `L${inline[1]}`;
  const flat = c.match(/^Flat[- ]?(\d+)$/i);
  if (flat) return `F${flat[1]}`;
  if (/^rotary/i.test(c)) return "ROTARY";
  return c.toUpperCase();
}

function aspirationKey(asp: string) {
  const a = asp.toLowerCase();
  if (a.startsWith("natural")) return "natural";
  if (/^(bi|twin)-?turbo/.test(a)) return "biturbo";
  if (a.startsWith("quad")) return "quadturbo";
  if (a.startsWith("tri")) return "biturbo";
  if (a === "turbo") return "turbo";
  if (a.startsWith("supercharg")) return "supercharged";
  if (a.startsWith("twincharg")) return "twincharged";
  if (a.startsWith("hybrid")) return "hybrid";
  return a;
}

export function engine(m: CatalogueModel, locale: Locale) {
  if (m.ev) return locale === "fr" ? "Électrique" : "Electric";
  const parts: string[] = [];
  if (m.l) parts.push(`${m.l.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`);
  if (m.cyl) {
    const k = layoutKey(m.cyl);
    parts.push(LAYOUT[k]?.[locale] ?? k);
  }
  if (m.asp && aspirationKey(m.asp) !== "electric") {
    const k = aspirationKey(m.asp);
    parts.push(ASPIRATION[k]?.[locale] ?? m.asp);
  }
  return parts.length ? parts.join(" ") : "—";
}

const CATEGORY: Array<[RegExp, Record<Locale, string>]> = [
  [/hypercar/i, { en: "Hypercar", fr: "Hypercar" }],
  [/supercar/i, { en: "Supercar", fr: "Supercar" }],
  [/grand tourer/i, { en: "Grand tourer", fr: "GT" }],
  [/luxury/i, { en: "Luxury", fr: "Luxe" }],
  [/sports/i, { en: "Sports car", fr: "Sportive" }],
];
const SHAPE: Array<[RegExp, Record<Locale, string>]> = [
  [/targa/i, { en: "Targa", fr: "Targa" }],
  [/roadster|spider|spyder/i, { en: "Roadster", fr: "Roadster" }],
  [/convertible|cabrio/i, { en: "Convertible", fr: "Cabriolet" }],
  [/coup/i, { en: "Coupé", fr: "Coupé" }],
  [/saloon|sedan/i, { en: "Saloon", fr: "Berline" }],
  [/suv/i, { en: "SUV", fr: "SUV" }],
  [/estate|wagon/i, { en: "Estate", fr: "Break" }],
  [/hatch/i, { en: "Hatchback", fr: "Compacte" }],
  [/mpv/i, { en: "MPV", fr: "Monospace" }],
];

/** "Supercar Coupé" → "Supercar · Coupé" / "Sports Roadster" → "Sportive · Roadster". */
export function bodyStyle(m: CatalogueModel, locale: Locale) {
  if (!m.body) return "—";
  const cat = CATEGORY.find(([re]) => re.test(m.body!))?.[1][locale];
  const shape = SHAPE.find(([re]) => re.test(m.body!))?.[1][locale];
  return [cat, shape].filter(Boolean).join(" · ") || m.body;
}
