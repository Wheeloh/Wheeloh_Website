// Server side of /cars, /fr/voitures and the brand pages: metadata, JSON-LD
// and the catalogue data, formatted for the client templates.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { BrandPage, CarsHub, type BrandCard } from "@/components/redesign/shared/pages/CarsContent";
import { pageMetadata } from "@/lib/metadata";
import { HOME_PATH, formatNumber, type Locale } from "@/lib/i18n";
import { ROUTES, brandPath, routePath } from "@/lib/routes";
import { abs, breadcrumbLd, webPageLd } from "@/lib/seo";
import { APP_LINK_URL } from "@/lib/links";
import { qrSvg } from "@/lib/qr";
import {
  CATALOGUE_UPDATED,
  acceleration,
  allBrands,
  bodyStyle,
  countries,
  countryName,
  engine,
  getBrand,
  isIndexable,
  power,
  topSpeed,
  totalModels,
  years,
  type CatalogueBrand,
} from "@/lib/catalogue";

const card = (b: CatalogueBrand, locale: Locale): BrandCard => ({
  id: b.id,
  name: b.name,
  logo: b.logo,
  count: b.models.length,
  href: brandPath(b.id, locale),
});

// ------------------------------------------------------------------- hub

const HUB = {
  en: {
    title: "Cars to Spot: 1,154 Models From 74 Brands",
    description:
      "The Wheeloh car spotting collection: 1,154 models from 74 brands and 14 countries, from Ferrari and Porsche to Pagani. Spot them all with the app.",
    h1: "Cars to spot.",
    subtitle: "1,154 models, 74 brands.",
    intro: (n: number, b: number) =>
      `The Wheeloh collection is the list every spotter is chasing: ${formatNumber(n, "en")} remarkable models from ${b} brands, from the McLaren F1 to the Bugatti Chiron. Pick a brand to see every model to spot.`,
    facts: (n: number, b: number, c: number) => [
      { value: formatNumber(n, "en"), label: "models to collect" },
      { value: String(b), label: "brands" },
      { value: String(c), label: "countries" },
      { value: "30", label: "milestones on the progress road" },
    ],
  },
  fr: {
    title: "Voitures à spotter : 1 154 modèles de 74 marques",
    description:
      "La collection de carspotting Wheeloh : 1 154 modèles de 74 marques et 14 pays, de Ferrari et Porsche à Pagani. Spotte-les toutes avec l'app.",
    h1: "Les voitures à spotter.",
    subtitle: "1 154 modèles, 74 marques.",
    intro: (n: number, b: number) =>
      `La collection Wheeloh, c'est la liste que chassent tous les spotters : ${formatNumber(n, "fr")} modèles remarquables de ${b} marques, de la McLaren F1 à la Bugatti Chiron. Choisis une marque pour voir tous les modèles à spotter.`,
    facts: (n: number, b: number, c: number) => [
      { value: formatNumber(n, "fr"), label: "modèles à collectionner" },
      { value: String(b), label: "marques" },
      { value: String(c), label: "pays" },
      { value: "30", label: "paliers sur la route de progression" },
    ],
  },
};

export const carsHubMetadata = (locale: Locale): Metadata =>
  pageMetadata({ title: HUB[locale].title, description: HUB[locale].description, locale, paths: ROUTES.cars.paths, modifiedTime: CATALOGUE_UPDATED });

export async function CarsHubRoute({ locale }: { locale: Locale }) {
  const t = HUB[locale];
  const qr = await qrSvg(APP_LINK_URL);
  const n = totalModels();
  const brands = allBrands();
  const groups = countries();
  const path = routePath("cars", locale);
  return (
    <>
      <JsonLd
        data={[
          webPageLd({ name: t.title, description: t.description, path, locale, dateModified: CATALOGUE_UPDATED }),
          breadcrumbLd([
            { name: locale === "fr" ? "Accueil" : "Home", path: HOME_PATH[locale] },
            { name: locale === "fr" ? "Voitures" : "Cars", path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t.title,
            numberOfItems: brands.length,
            itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, url: abs(brandPath(b.id, locale)) })),
          },
        ]}
      />
      <CarsHub
        locale={locale}
        h1={t.h1}
        subtitle={t.subtitle}
        intro={t.intro(n, brands.length)}
        facts={t.facts(n, brands.length, groups.length)}
        qr={qr}
        countries={groups.map((g) => ({
          country: countryName(g.country, locale),
          flagKey: g.country,
          brands: g.brands.map((b) => card(b, locale)),
        }))}
      />
    </>
  );
}

// ----------------------------------------------------------------- brand

export const brandStaticParams = () => allBrands().map((b) => ({ brand: b.id }));

function brandCopy(b: CatalogueBrand, locale: Locale) {
  const n = b.models.length;
  const h = b.highlights;
  const country = countryName(b.country, locale);
  if (locale === "fr") {
    const parts = [
      `${b.name} (${country}) compte ${n} modèle${n > 1 ? "s" : ""} dans la collection Wheeloh`,
      h.oldest && h.newest && h.oldest.name !== h.newest.name ? `, de la ${h.oldest.name} (${h.oldest.from}) à la ${h.newest.name} (${h.newest.from})` : "",
      ".",
      h.strongest ? ` La plus puissante : la ${b.name} ${h.strongest.name}, ${power(h.strongest, "fr")}.` : "",
      h.fastest && h.fastest.name !== h.strongest?.name ? ` La plus rapide : la ${h.fastest.name}, ${topSpeed(h.fastest, "fr")}.` : "",
      ` Spotte-en une avec Wheeloh et elle se coche dans ta collection ${b.name}.`,
    ];
    return {
      title: `${b.name} : les ${n} modèles à spotter`,
      description: `Les ${n} modèles ${b.name} de la collection de carspotting Wheeloh : années, puissance, 0–100 km/h, vitesse max et moteur. Spotte-les toutes.`,
      intro: parts.join(""),
    };
  }
  const parts = [
    `${b.name} (${country}) has ${n} model${n > 1 ? "s" : ""} in the Wheeloh collection`,
    h.oldest && h.newest && h.oldest.name !== h.newest.name ? `, from the ${h.oldest.name} (${h.oldest.from}) to the ${h.newest.name} (${h.newest.from})` : "",
    ".",
    h.strongest ? ` The most powerful is the ${b.name} ${h.strongest.name}, at ${power(h.strongest, "en")}.` : "",
    h.fastest && h.fastest.name !== h.strongest?.name ? ` The fastest is the ${h.fastest.name}, at ${topSpeed(h.fastest, "en")}.` : "",
    ` Spot one with Wheeloh and it ticks off in your ${b.name} collection.`,
  ];
  return {
    title: `${b.name} Car Spotting: All ${n} Models to Spot`,
    description: `The ${n} ${b.name} models in the Wheeloh car spotting collection: years, power, 0–100 km/h, top speed and engine. Spot them all.`,
    intro: parts.join(""),
  };
}

export function brandMetadata(id: string, locale: Locale): Metadata {
  const b = getBrand(id);
  if (!b) return { title: locale === "fr" ? "Marque introuvable" : "Brand not found", robots: { index: false } };
  const t = brandCopy(b, locale);
  return pageMetadata({
    title: t.title,
    description: t.description,
    locale,
    paths: { en: brandPath(b.id, "en"), fr: brandPath(b.id, "fr") },
    modifiedTime: CATALOGUE_UPDATED,
    // A brand with one or two models is a thin page: reachable, not indexed.
    noindex: !isIndexable(b),
  });
}

export async function BrandRoute({ id, locale }: { id: string; locale: Locale }) {
  const b = getBrand(id);
  if (!b) notFound();
  const qr = await qrSvg(APP_LINK_URL);
  const t = brandCopy(b, locale);
  const path = brandPath(b.id, locale);
  const hubHref = routePath("cars", locale);
  const h = b.highlights;
  const fr = locale === "fr";
  const span = h.oldest?.from && h.newest?.from ? (h.oldest.from === h.newest.from ? String(h.oldest.from) : `${h.oldest.from}–${h.newest.from}`) : "—";
  const sameCountry = allBrands()
    .filter((x) => x.country === b.country && x.id !== b.id)
    .map((x) => card(x, locale));

  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageLd({ name: t.title, description: t.description, path, locale, dateModified: CATALOGUE_UPDATED, about: b.name }),
            about: { "@type": "Brand", name: b.name, logo: abs(b.logo) },
          },
          breadcrumbLd([
            { name: fr ? "Accueil" : "Home", path: HOME_PATH[locale] },
            { name: fr ? "Voitures" : "Cars", path: hubHref },
            { name: b.name, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: fr ? `Modèles ${b.name} à spotter` : `${b.name} models to spot`,
            numberOfItems: b.models.length,
            itemListElement: b.models.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: `${b.name} ${m}` })),
          },
        ]}
      />
      <BrandPage
        locale={locale}
        name={b.name}
        logo={b.logo}
        country={countryName(b.country, locale)}
        flagKey={b.country}
        intro={t.intro}
        facts={[
          { value: String(b.models.length), label: fr ? "modèles à spotter" : "models to spot" },
          { value: h.strongest ? power(h.strongest, locale) : "—", label: fr ? `max., ${h.strongest?.name ?? ""}` : `max, ${h.strongest?.name ?? ""}` },
          { value: h.fastest ? topSpeed(h.fastest, locale) : "—", label: fr ? `vitesse max, ${h.fastest?.name ?? ""}` : `top speed, ${h.fastest?.name ?? ""}` },
          { value: span, label: fr ? "années couvertes" : "years covered" },
        ]}
        // The specs of the preview models only; the others are named, and their
        // data is in the app (the download invitation over the table's end).
        rows={b.preview.map((m) => ({
          name: m.name,
          years: years(m),
          power: power(m, locale),
          acc: acceleration(m, locale),
          vmax: topSpeed(m, locale),
          engine: engine(m, locale),
          body: bodyStyle(m, locale),
        }))}
        locked={b.models.slice(b.preview.length)}
        models={b.models}
        qr={qr}
        hubHref={hubHref}
        sameCountry={sameCountry}
      />
    </>
  );
}
