// One builder for every page's <head>: canonical, hreflang, Open Graph and
// Twitter. A page's `openGraph` / `twitter` replaces the layout's whole block
// (Next merges metadata shallowly), so each page sets all of it here instead
// of inheriting half of it — that is how the home lost its preview image and
// the changelog articles kept the home's twitter:title.
import type { Metadata } from "next";
import { OG_LOCALE, type Locale } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/seo";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Wheeloh — the car spotting app",
};

interface PageMetadataOptions {
  /** <title> before the "| Wheeloh" template. */
  title: string;
  /** Use the title as is, without the template. */
  absoluteTitle?: boolean;
  description: string;
  locale: Locale;
  /** This page's path in each language it exists in. */
  paths: Partial<Record<Locale, string>>;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  locale,
  paths,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageMetadataOptions): Metadata {
  const url = paths[locale] ?? paths.en ?? paths.fr ?? "/";
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const translated = Object.keys(paths).length > 1;
  const others = (Object.keys(paths) as Locale[]).filter((l) => l !== locale);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      ...(translated && {
        languages: { ...paths, "x-default": paths.en ?? url },
      }),
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      url,
      title: fullTitle,
      description,
      locale: OG_LOCALE[locale],
      ...(others.length > 0 && { alternateLocale: others.map((l) => OG_LOCALE[l]) }),
      images: [OG_IMAGE],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
