// Shape of the guide and feature pages' copy (src/content/*.ts). Strings may
// use **bold** and [label](/path) — see lib/richtext.ts.
import type { RouteKey } from "@/lib/routes";
import type { FaqItem } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

/** The app widget shown next to the text. */
export type Showcase = "camera" | "plates" | "meets" | "guess" | "clubs" | "ranking";

export interface PageSection {
  h2: string;
  paragraphs?: string[];
  list?: string[];
  steps?: Array<{ title: string; body: string }>;
}

export interface PageDoc {
  /** <title>, before the "| Wheeloh" template. */
  title: string;
  /** Meta description: under 155 characters. */
  description: string;
  /** Breadcrumb label. */
  crumb: string;
  h1: string;
  subtitle?: string;
  /** The hero's paragraph: the page's answer in two sentences. */
  intro: string;
  facts?: Array<{ value: string; label: string }>;
  showcase?: Showcase;
  sections: PageSection[];
  faq?: FaqItem[];
  cta: { title: string; body: string };
  related: RouteKey[];
}

export type LocalizedDoc = Record<Locale, PageDoc>;
