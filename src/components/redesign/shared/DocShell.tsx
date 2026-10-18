"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/redesign/shared/Header";
import Footer from "@/components/redesign/shared/Footer";
import { Reveal, SplitText } from "@/components/redesign/shared/motion/reveal";
import { cn } from "@/lib/utils";

export interface Crumb {
  href?: string;
  label: string;
}

interface DocShellProps {
  /** Page title. Strings get the split-word entrance; use "\n" for a line break. */
  title: string;
  /** Second line rendered in a quieter tone. */
  subtitle?: string;
  intro?: ReactNode;
  meta?: ReactNode;
  crumbs?: Crumb[];
  lang?: string;
  /** Optional art on the right of the hero (desktop). */
  aside?: ReactNode;
  /** Classes for the white sheet's inner container. */
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Shared layout for every page that isn't the home page: a dark hero band,
 * then a white sheet sliding over it — the same pattern as the app's
 * bottom sheets.
 */
export default function DocShell({
  title,
  subtitle,
  intro,
  meta,
  crumbs,
  lang,
  aside,
  contentClassName,
  children,
}: DocShellProps) {
  return (
    <div lang={lang} className="flex min-h-[100dvh] flex-col bg-night">
      <Header showNavLinks />
      <header className="grain relative overflow-hidden pb-24 pt-32 text-snow sm:pb-28 sm:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_85%_10%,rgba(255,255,255,0.07),transparent_70%)]" />
        <div className="relative mx-auto grid grid-cols-1 max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end">
          <div className={cn(aside ? "lg:col-span-8" : "lg:col-span-10")}>
            {crumbs && crumbs.length > 0 && (
              <Reveal as="nav" variant="fade" aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-fog">
                {crumbs.map((c, i) => (
                  <span key={c.label} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-graphite" aria-hidden />}
                    {c.href ? (
                      <Link href={c.href} className="transition-colors hover:text-snow">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="line-clamp-1 text-smoke">
                        {c.label}
                      </span>
                    )}
                  </span>
                ))}
              </Reveal>
            )}
            <h1 className="text-display-l font-extrabold">
              <SplitText text={title} />
              {subtitle && <SplitText text={subtitle} delay={150} className="block text-smoke" />}
            </h1>
            {intro && (
              <Reveal as="div" delay={250} className="mt-6 max-w-[56ch] text-lg font-medium leading-relaxed text-smoke sm:text-xl">
                {intro}
              </Reveal>
            )}
            {meta && (
              <Reveal as="div" delay={350} className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-fog">
                {meta}
              </Reveal>
            )}
          </div>
          {aside && (
            <Reveal variant="scale" delay={200} className="hidden lg:col-span-4 lg:block">
              {aside}
            </Reveal>
          )}
        </div>
      </header>
      <main className="sheet relative z-10 -mt-10 flex-1 pb-24 pt-14 sm:pb-32 sm:pt-20">
        <div className={cn("mx-auto max-w-[1440px] break-words px-5 sm:px-8", contentClassName)}>{children}</div>
      </main>
      <Footer />
    </div>
  );
}

/** Typography for long-form documents rendered inside the sheet. */
export const PROSE =
  "prose prose-lg max-w-none prose-headings:font-extrabold prose-headings:tracking-[-0.02em] prose-headings:text-ink prose-h1:text-[2rem] prose-h2:mt-14 prose-h2:text-[1.75rem] prose-h3:mt-10 prose-p:text-ink/80 prose-p:leading-relaxed prose-li:text-ink/80 prose-strong:text-ink prose-a:font-semibold prose-a:text-ink prose-a:decoration-line prose-a:underline-offset-4 hover:prose-a:decoration-ink prose-hr:border-line prose-img:rounded-3xl";

/** Legal documents: explicit headings inside, so prose only handles rhythm and colour. */
export const LEGAL_PROSE =
  "prose prose-neutral mx-auto max-w-3xl text-[1.0625rem] leading-relaxed prose-headings:font-extrabold prose-headings:tracking-[-0.015em] prose-headings:text-ink prose-p:text-ink/80 prose-li:text-ink/80 prose-strong:text-ink prose-ul:pl-5";
