"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import Wordmark from "@/components/redesign/shared/brand/Wordmark";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { useInViewRef } from "@/components/redesign/shared/motion/reveal";
import { useSections } from "@/components/redesign/shared/SiteConfig";
import { useCopy, useLocale } from "@/components/redesign/shared/Locale";
import { CONTACT_EMAIL, INSTAGRAM_URL, LINKEDIN_URL, STATUS_URL, TIKTOK_URL } from "@/lib/seo";
import { appStoreUrl, playStoreUrl } from "@/lib/links";
import { sectionHref } from "@/lib/i18n";
import { alternatePath, routePath, type RouteKey } from "@/lib/routes";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

// The guide and feature pages, linked from every page of the site.
const EXPLORE: RouteKey[] = ["carSpotting", "identify", "plates", "meets", "guess", "clubs", "cars"];

const COPY = {
  en: {
    tagline: "The car spotting app for enthusiasts. Spot, identify and collect the rarest cars around you.",
    product: "Product",
    explore: "Explore",
    getApp: "Get the app",
    legal: "Legal",
    follow: "Follow",
    affiliate: "Affiliate programme",
    explored: ["What is car spotting?", "Car identifier", "Licence plate blur", "Car meets", "Guess the car", "Car clubs", "Cars to spot"],
    legalLinks: ["Legal information", "Terms (CGU)", "Privacy policy", "Community standards"],
    signature: "Made for people who stop mid-sentence when a V12 goes by.",
    language: "Language",
  },
  fr: {
    tagline: "L'app de carspotting pour les passionnés. Repère, identifie et collectionne les voitures les plus rares autour de toi.",
    product: "Produit",
    explore: "Découvrir",
    getApp: "Télécharger l'app",
    legal: "Légal",
    follow: "Suivre",
    affiliate: "Programme d'affiliation",
    explored: ["C'est quoi le carspotting ?", "Identifier une voiture", "Flouter une plaque", "Rassos auto", "Devine la caisse", "Clubs auto", "Voitures à spotter"],
    legalLinks: ["Mentions légales", "CGU", "Confidentialité", "Standards communautaires"],
    signature: "Pour celles et ceux qui s'arrêtent au milieu d'une phrase quand passe un V12.",
    language: "Langue",
  },
};

export default function Footer() {
  const year = new Date().getFullYear();
  const sections = useSections();
  const locale = useLocale();
  const t = useCopy(COPY);
  const pathname = usePathname();
  const wordmarkRef = useInViewRef<HTMLDivElement>({ rootMargin: "0px 0px -5% 0px" });

  const columns: Array<{ title: string; links: FooterLink[] }> = [
    {
      title: t.product,
      links: [
        ...sections.map((s) => ({ href: sectionHref(s.id, locale), label: s.label })),
        { href: "/changelog", label: "Changelog" },
        { href: "/engineering", label: "Engineering" },
        { href: STATUS_URL, label: "Status", external: true },
      ],
    },
    {
      title: t.explore,
      links: EXPLORE.map((key, i) => ({ href: routePath(key, locale), label: t.explored[i] })),
    },
    {
      title: t.getApp,
      links: [
        { href: appStoreUrl("footer"), label: "App Store", external: true },
        { href: playStoreUrl("footer"), label: "Google Play", external: true },
        ...(sections.some((s) => s.id === "affiliate") ? [] : [{ href: sectionHref("affiliate", locale), label: t.affiliate }]),
        { href: sectionHref("contact", locale), label: "Contact" },
      ],
    },
    {
      title: t.legal,
      links: [
        { href: "/legal", label: t.legalLinks[0] },
        { href: "/cgu", label: t.legalLinks[1] },
        { href: "/privacy", label: t.legalLinks[2] },
        { href: "/community-standards", label: t.legalLinks[3] },
      ],
    },
    {
      title: t.follow,
      links: [
        { href: INSTAGRAM_URL, label: "Instagram", external: true },
        { href: TIKTOK_URL, label: "TikTok", external: true },
        { href: LINKEDIN_URL, label: "LinkedIn", external: true },
        { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-night text-snow">
      <div aria-hidden className="checker h-3 w-full text-snow/90 [--checker:12px]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-16 sm:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <FlagMark className="h-10 w-auto text-snow" />
            <p className="mt-6 text-lg font-medium leading-snug text-smoke">{t.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-5">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-fog">{col.title}</p>
                {col.links.map((l) =>
                  l.external || l.href.startsWith("mailto:") ? (
                    <a
                      key={l.label}
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener" : undefined}
                      className="group inline-flex w-fit items-center gap-1 break-all text-[0.9375rem] font-medium text-snow/85 transition-colors hover:text-snow"
                    >
                      {l.label}
                      {l.external && (
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                      )}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href}
                      prefetch={false}
                      className="w-fit text-[0.9375rem] font-medium text-snow/85 transition-colors hover:text-snow"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </nav>
            ))}
          </div>
        </div>

        <div ref={wordmarkRef} className="mt-20 lg:mt-28">
          <Wordmark animated title={null} className="w-full text-snow" />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-graphite pt-6 text-sm font-medium text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Wheeloh SAS · Versailles, France</p>
          <nav aria-label={t.language} className="flex items-center gap-3">
            {(["en", "fr"] as const).map((l) =>
              l === locale ? (
                <span key={l} aria-current="true" className="text-snow">
                  {l === "en" ? "English" : "Français"}
                </span>
              ) : (
                <Link key={l} href={alternatePath(pathname, l)} hrefLang={l} lang={l} prefetch={false} className="transition-colors hover:text-snow">
                  {l === "en" ? "English" : "Français"}
                </Link>
              ),
            )}
          </nav>
          <p>{t.signature}</p>
        </div>
      </div>
    </footer>
  );
}
