"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import DocShell from "@/components/redesign/shared/DocShell";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import AppCta, { QrCard } from "@/components/redesign/shared/AppCta";
import { Reveal } from "@/components/redesign/shared/motion/reveal";
import { Rich } from "@/components/redesign/shared/pages/ContentPage";
import { HOME_PATH, type Locale } from "@/lib/i18n";
import { flagFor } from "@/lib/collection-shared";
import { cn } from "@/lib/utils";

// The /cars hub and the brand pages. Data arrives formatted from the server
// (lib/catalogue.ts stays out of the client bundle). A brand page shows the
// specs of its first models only; the table then fades out under an
// invitation to download the app, where every model's data lives.

export interface BrandCard {
  id: string;
  name: string;
  logo: string;
  count: number;
  href: string;
}

export interface CountryGroup {
  country: string;
  /** English name, for the flag file. */
  flagKey: string;
  brands: BrandCard[];
}

const UI = {
  en: {
    home: "Home",
    cars: "Cars",
    models: (n: number) => `${n} model${n > 1 ? "s" : ""}`,
    how: "How the collection works",
    howBody:
      "Every car you spot is identified, and if it is in the catalogue it ticks off in its brand's collection. Your overall progress is the share of the catalogue you have spotted, drawn as a road with 30 milestones and 9 levels — and your friends are on the same road. [How identification works](/car-identifier).",
    table: ["Model", "Years", "Power", "0–100 km/h", "Top speed", "Engine", "Type"],
    tableCaption: (brand: string) => `${brand} models in the Wheeloh collection, with the figures of their most powerful version`,
    note: "Figures from the Wheeloh car database, for each model's most powerful version.",
    lockTitle: (n: number, brand: string) => `${n} more ${brand} models in the app`,
    lockBody:
      "Every model's full spec sheet, the points it is worth and your progress on the brand: download Wheeloh, it's free.",
    allModels: (n: number, brand: string) => `All ${n} ${brand} models of the collection`,
    inApp: "Specs in the app",
    collect: (brand: string) => `How to collect every ${brand}`,
    steps: [
      { title: "Spot one", body: "Photograph it with Wheeloh: the model is identified in seconds." },
      { title: "It ticks off", body: "The model is marked as spotted in your collection, and the spot is scored." },
      { title: "Complete the brand", body: "Fill the collection model by model and climb the ranking." },
    ],
    same: (country: string) => `More brands from ${country}`,
    all: "All brands",
    cta: { title: "Start ticking them off.", body: "Free on iPhone and Android. Your first spot takes one photo." },
    hubCta: { title: "Your collection is in the app.", body: "See every model's specs, tick off the ones you spot and race your friends. Free on iPhone and Android." },
  },
  fr: {
    home: "Accueil",
    cars: "Voitures",
    models: (n: number) => `${n} modèle${n > 1 ? "s" : ""}`,
    how: "Comment marche la collection",
    howBody:
      "Chaque voiture spottée est identifiée et, si elle fait partie du catalogue, elle se coche dans la collection de sa marque. Ta progression, c'est la part du catalogue que tu as spottée, dessinée comme une route avec 30 paliers et 9 niveaux — et tes amis roulent sur la même route. [Comment l'app identifie une voiture](/fr/identifier-une-voiture).",
    table: ["Modèle", "Années", "Puissance", "0–100 km/h", "Vitesse max", "Moteur", "Type"],
    tableCaption: (brand: string) => `Modèles ${brand} de la collection Wheeloh, avec les chiffres de leur version la plus puissante`,
    note: "Chiffres issus de la base auto de Wheeloh, pour la version la plus puissante de chaque modèle.",
    lockTitle: (n: number, brand: string) => `Les ${n} autres ${brand} sont dans l'app`,
    lockBody:
      "La fiche technique complète de chaque modèle, les points qu'il rapporte et ta progression sur la marque : télécharge Wheeloh, c'est gratuit.",
    allModels: (n: number, brand: string) => `Les ${n} modèles ${brand} de la collection`,
    inApp: "Fiche dans l'app",
    collect: (brand: string) => `Comment collectionner toutes les ${brand}`,
    steps: [
      { title: "Spotte-en une", body: "Prends-la en photo avec Wheeloh : le modèle est identifié en quelques secondes." },
      { title: "Elle se coche", body: "Le modèle est marqué comme spotté dans ta collection, et le spot est noté." },
      { title: "Complète la marque", body: "Remplis la collection modèle après modèle et grimpe au classement." },
    ],
    same: (country: string) => `Autres marques — ${country}`,
    all: "Toutes les marques",
    cta: { title: "Commence à les cocher.", body: "Gratuite sur iPhone et Android. Ton premier spot, c'est une photo." },
    hubCta: { title: "Ta collection est dans l'app.", body: "Vois la fiche de chaque modèle, coche ceux que tu spottes et fais la course avec tes amis. Gratuite sur iPhone et Android." },
  },
};

function BrandGrid({ brands, locale, className }: { brands: BrandCard[]; locale: Locale; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6", className)}>
      {brands.map((b) => (
        <li key={b.id}>
          <Link
            href={b.href}
            className="group flex h-full flex-col items-center rounded-[1.5rem] bg-mist px-3 pb-4 pt-5 text-center transition-[background-color,box-shadow] duration-500 ease-out-expo hover:bg-snow hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.4)]"
          >
            <span className="grid h-14 w-14 place-items-center">
              <Image src={b.logo} alt={`${b.name} logo`} width={56} height={56} className="h-12 w-12 object-contain mix-blend-multiply" />
            </span>
            <span className="mt-3 text-[0.9375rem] font-bold leading-tight">{b.name}</span>
            <span className="mt-1 text-[0.8125rem] font-semibold text-ash tabular">{UI[locale].models(b.count)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------------- hub

interface CarsHubProps {
  locale: Locale;
  h1: string;
  subtitle: string;
  intro: string;
  facts: Array<{ value: string; label: string }>;
  countries: CountryGroup[];
  qr: string;
}

export function CarsHub({ locale, h1, subtitle, intro, facts, countries, qr }: CarsHubProps) {
  const ui = UI[locale];
  return (
    <DocShell
      lang={locale}
      title={h1}
      subtitle={subtitle}
      intro={intro}
      crumbs={[{ href: HOME_PATH[locale], label: ui.home }, { label: ui.cars }]}
    >
      <Reveal as="dl" className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl bg-mist px-4 py-4 sm:px-5">
            <dt className="sr-only">{f.label}</dt>
            <dd className="text-display-s font-extrabold tabular">{f.value}</dd>
            <dd className="mt-1 text-[0.8125rem] font-semibold leading-snug text-ash">{f.label}</dd>
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="mb-16 max-w-[66ch]">
        <h2 className="text-display-s font-extrabold sm:text-display-m">{ui.how}</h2>
        <p className="mt-5 text-[1.0625rem] font-medium leading-relaxed text-ink/80 sm:text-lg">
          <Rich text={ui.howBody} />
        </p>
      </Reveal>

      <AppCta variant="inline" campaign="page_cars_inline" title={ui.hubCta.title} body={ui.hubCta.body} className="mb-16" />

      {countries.map((c) => (
        <Reveal as="section" key={c.country} className="mb-12">
          <h2 className="flex items-center gap-3 text-display-s font-extrabold">
            <Image src={flagFor(c.flagKey)} alt="" width={32} height={22} className="h-[22px] w-8 rounded-[4px] object-cover ring-1 ring-black/10" />
            {c.country}
          </h2>
          <BrandGrid brands={c.brands} locale={locale} className="mt-6" />
        </Reveal>
      ))}

      <AppCta campaign="page_cars" title={ui.cta.title} body={ui.cta.body} qr={qr} className="mt-20" />
    </DocShell>
  );
}

// ----------------------------------------------------------------- brand

export interface BrandRow {
  name: string;
  years: string;
  power: string;
  acc: string;
  vmax: string;
  engine: string;
  body: string;
}

interface BrandPageProps {
  locale: Locale;
  name: string;
  logo: string;
  country: string;
  flagKey: string;
  intro: string;
  facts: Array<{ value: string; label: string }>;
  /** The preview models, with their specs. */
  rows: BrandRow[];
  /** The other models, by name only: their data is in the app. */
  locked: string[];
  /** Every model of the collection, by name. */
  models: string[];
  qr: string;
  hubHref: string;
  sameCountry: BrandCard[];
}

/** Placeholder bars where the locked models' specs would be. */
const BARS = ["w-20", "w-14", "w-10", "w-16", "w-28", "w-24"];

export function BrandPage({ locale, name, logo, country, flagKey, intro, facts, rows, locked, models, qr, hubHref, sameCountry }: BrandPageProps) {
  const ui = UI[locale];
  const teaser = locked.slice(0, 3);
  return (
    <DocShell
      lang={locale}
      title={name}
      subtitle={locale === "fr" ? `${models.length} modèles à spotter.` : `${models.length} models to spot.`}
      intro={intro}
      crumbs={[{ href: HOME_PATH[locale], label: ui.home }, { href: hubHref, label: ui.cars }, { label: name }]}
      meta={
        <span className="flex items-center gap-2">
          <Image src={flagFor(flagKey)} alt="" width={24} height={16} className="h-4 w-6 rounded-[3px] object-cover" />
          {country}
        </span>
      }
      aside={
        <div className="grid aspect-square w-full max-w-[18rem] place-items-center justify-self-end rounded-[2rem] bg-snow p-10">
          <Image src={logo} alt={`${name} logo`} width={200} height={200} className="h-full w-full object-contain mix-blend-multiply" />
        </div>
      }
    >
      <Reveal as="dl" className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0 rounded-2xl bg-mist px-4 py-4 sm:px-5">
            <dt className="sr-only">{f.label}</dt>
            <dd className="truncate text-display-s font-extrabold tabular">{f.value}</dd>
            <dd className="mt-1 text-[0.8125rem] font-semibold leading-snug text-ash">{f.label}</dd>
          </div>
        ))}
      </Reveal>

      <Reveal as="section">
        <div className="relative">
          <div className="overflow-x-auto rounded-[1.5rem] border border-line">
            <table className="w-full min-w-[52rem] border-collapse text-left text-[0.9375rem]">
              <caption className="sr-only">{ui.tableCaption(name)}</caption>
              <thead className="bg-mist text-[0.8125rem] font-bold text-ash">
                <tr>
                  {ui.table.map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 first:pl-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-line">
                    <th scope="row" className="whitespace-nowrap px-4 py-3 pl-6 font-bold">
                      {name} {r.name}
                    </th>
                    <td className="whitespace-nowrap px-4 py-3 tabular">{r.years}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular">{r.power}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular">{r.acc}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular">{r.vmax}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/80">{r.engine}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/80">{r.body}</td>
                  </tr>
                ))}
                {teaser.map((m) => (
                  <tr key={m} aria-hidden className="border-t border-line">
                    <th scope="row" className="whitespace-nowrap px-4 py-3 pl-6 font-bold">
                      {name} {m}
                    </th>
                    {BARS.map((w, i) => (
                      <td key={i} className="px-4 py-3">
                        <span className={cn("block h-3 rounded-full bg-line", w)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {teaser.length > 0 && (
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-44 rounded-b-[1.5rem] bg-gradient-to-b from-snow/0 via-snow/85 to-snow" />
          )}
        </div>

        {locked.length > 0 ? (
          <div
            data-download-cta=""
            className="relative z-10 -mt-14 flex flex-col gap-6 rounded-[2rem] bg-ink p-7 text-snow shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:p-9 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-display-s font-extrabold">
                <Lock className="h-6 w-6 shrink-0" strokeWidth={2.4} aria-hidden />
                {ui.lockTitle(locked.length, name)}
              </p>
              <p className="mt-3 max-w-[54ch] text-base font-medium text-smoke">{ui.lockBody}</p>
              <StoreButtons tone="light" campaign="page_brand_lock" className="mt-7" />
            </div>
            <QrCard qr={qr} className="hidden shrink-0 lg:flex" />
          </div>
        ) : (
          <p className="mt-4 max-w-[80ch] text-[0.8125rem] font-medium leading-relaxed text-ash">{ui.note}</p>
        )}
      </Reveal>

      <Reveal as="section" className="mt-20">
        <h2 className="text-display-s font-extrabold sm:text-display-m">{ui.allModels(models.length, name)}</h2>
        <ul className="mt-7 flex flex-wrap gap-2">
          {models.map((m, i) => {
            const isLocked = i >= rows.length;
            return (
              <li key={m} className="flex items-center gap-1.5 rounded-full bg-mist px-4 py-2 text-[0.9375rem] font-semibold">
                {name} {m}
                {isLocked && <Lock className="h-3.5 w-3.5 text-ash" strokeWidth={2.4} aria-label={ui.inApp} />}
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal as="section" className="mt-20">
        <h2 className="text-display-s font-extrabold sm:text-display-m">{ui.collect(name)}</h2>
        <ol className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
          {ui.steps.map((s, i) => (
            <li key={s.title} className="rounded-[1.5rem] bg-mist p-5 sm:p-6">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-bold text-snow tabular">{i + 1}</span>
              <p className="mt-4 text-lg font-bold leading-snug">{s.title}</p>
              <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-ash">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[1.0625rem] font-medium leading-relaxed text-ink/80">
          <Rich text={ui.howBody} />
        </p>
      </Reveal>

      <AppCta campaign="page_brand" title={ui.cta.title} body={ui.cta.body} qr={qr} className="mt-20" />

      <nav aria-label={ui.all} className="mt-20">
        {sameCountry.length > 0 && (
          <>
            <h2 className="text-display-s font-extrabold">{ui.same(country)}</h2>
            <BrandGrid brands={sameCountry} locale={locale} className="mt-6" />
          </>
        )}
        <Link href={hubHref} className="group mt-8 inline-flex items-center gap-2 text-base font-bold text-ink">
          {ui.all}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </nav>
    </DocShell>
  );
}

