"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Wordmark from "@/components/redesign/shared/brand/Wordmark";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { useInViewRef } from "@/components/redesign/shared/motion/reveal";
import { useSections } from "@/components/redesign/shared/SiteConfig";
import { CONTACT_EMAIL, INSTAGRAM_URL, STATUS_URL, TIKTOK_URL } from "@/lib/seo";
import { appStoreUrl, playStoreUrl } from "@/lib/links";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const sections = useSections();
  const wordmarkRef = useInViewRef<HTMLDivElement>({ rootMargin: "0px 0px -5% 0px" });

  const columns: Array<{ title: string; links: FooterLink[] }> = [
    {
      title: "Product",
      links: [
        ...sections.map((s) => ({ href: `/#${s.id}`, label: s.label })),
        { href: "/changelog", label: "Changelog" },
        { href: "/engineering", label: "Engineering" },
        { href: STATUS_URL, label: "Status", external: true },
      ],
    },
    {
      title: "Get the app",
      links: [
        { href: appStoreUrl("footer"), label: "App Store", external: true },
        { href: playStoreUrl("footer"), label: "Google Play", external: true },
        ...(sections.some((s) => s.id === "affiliate") ? [] : [{ href: "/#affiliate", label: "Affiliate programme" }]),
        { href: "/#contact", label: "Contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/legal", label: "Legal information" },
        { href: "/cgu", label: "Terms (CGU)" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/community-standards", label: "Community standards" },
      ],
    },
    {
      title: "Follow",
      links: [
        { href: INSTAGRAM_URL, label: "Instagram", external: true },
        { href: TIKTOK_URL, label: "TikTok", external: true },
        { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-night text-snow">
      <div aria-hidden className="checker h-3 w-full text-snow/90 [--checker:12px]" />

      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-16 sm:px-8 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="max-w-sm">
            <FlagMark className="h-10 w-auto text-snow" />
            <p className="mt-6 text-lg font-medium leading-snug text-smoke">
              The car spotting app for enthusiasts. Spot, identify and collect the rarest cars around you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
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
          <p>Made for people who stop mid-sentence when a V12 goes by.</p>
        </div>
      </div>
    </footer>
  );
}
