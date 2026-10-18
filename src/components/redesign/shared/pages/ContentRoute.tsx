// Server side of a guide or feature page: its <head> and JSON-LD, then the
// ContentPage template. Each route file is two lines that call these.
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ContentPage from "@/components/redesign/shared/pages/ContentPage";
import { pageMetadata } from "@/lib/metadata";
import { HOME_PATH, type Locale } from "@/lib/i18n";
import { ROUTES, routePath, type RouteKey } from "@/lib/routes";
import { articleLd, breadcrumbLd, faqPageLd, webPageLd } from "@/lib/seo";
import { plainText } from "@/lib/richtext";
import { APP_LINK_URL } from "@/lib/links";
import { qrSvg } from "@/lib/qr";
import { ROUTE_CARDS } from "@/content/labels";
import type { LocalizedDoc } from "@/content/types";

/** "18 October 2026" / "18 octobre 2026". */
export const printedDate = (iso: string, locale: Locale) =>
  new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function contentMetadata(routeKey: RouteKey, docs: LocalizedDoc, locale: Locale): Metadata {
  const doc = docs[locale];
  return pageMetadata({
    title: doc.title,
    description: doc.description,
    locale,
    paths: ROUTES[routeKey].paths,
    type: routeKey === "carSpotting" ? "article" : "website",
    modifiedTime: ROUTES[routeKey].updated,
  });
}

export default async function ContentRoute({ routeKey, docs, locale }: { routeKey: RouteKey; docs: LocalizedDoc; locale: Locale }) {
  const doc = docs[locale];
  const qr = await qrSvg(APP_LINK_URL);
  const path = routePath(routeKey, locale);
  const updated = ROUTES[routeKey].updated;
  const related = doc.related.flatMap((key) => {
    const card = ROUTE_CARDS[key]?.[locale];
    return card ? [{ href: routePath(key, locale), ...card }] : [];
  });

  const page =
    routeKey === "carSpotting"
      ? articleLd({ headline: doc.title, description: doc.description, path, datePublished: updated, dateModified: updated, locale })
      : webPageLd({ name: doc.title, description: doc.description, path, locale, dateModified: updated });

  return (
    <>
      <JsonLd
        data={[
          page,
          breadcrumbLd([
            { name: locale === "fr" ? "Accueil" : "Home", path: HOME_PATH[locale] },
            { name: doc.crumb, path },
          ]),
          ...(doc.faq?.length ? [faqPageLd(doc.faq.map((f) => ({ question: f.question, answer: plainText(f.answer) })))] : []),
        ]}
      />
      <ContentPage doc={doc} locale={locale} campaign={`page_${routeKey}`} related={related} updated={printedDate(updated, locale)} qr={qr} />
    </>
  );
}
