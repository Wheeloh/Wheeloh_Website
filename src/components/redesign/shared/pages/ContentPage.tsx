"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import DocShell from "@/components/redesign/shared/DocShell";
import AppCta, { QrCard } from "@/components/redesign/shared/AppCta";
import { Reveal } from "@/components/redesign/shared/motion/reveal";
import Phone from "@/components/redesign/shared/phone/Phone";
import CameraScreen from "@/components/redesign/shared/phone/screens/CameraScreen";
import { useInView } from "@/components/redesign/shared/motion/reveal";
import PlatesCard from "@/components/redesign/v3/PlatesCard";
import { MeetsMap, RankingCard } from "@/components/redesign/v3/Features";
import { ClubCard } from "@/components/redesign/v3/Community";
import GuessCard from "@/components/redesign/shared/GuessCard";
import { HOME_PATH, type Locale } from "@/lib/i18n";
import { richTokens } from "@/lib/richtext";
import type { PageDoc, Showcase } from "@/content/types";
import { cn } from "@/lib/utils";

const INLINE_LINK = "font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink";

/** **bold** and [label](/path) inside the copy. */
export function Rich({ text, linkClassName = INLINE_LINK }: { text: string; linkClassName?: string }) {
  return (
    <>
      {richTokens(text).map((t, i) =>
        "bold" in t ? (
          <strong key={i} className="font-bold text-ink">
            {t.bold}
          </strong>
        ) : "href" in t ? (
          <Link key={i} href={t.href} className={linkClassName}>
            {t.label}
          </Link>
        ) : (
          <Fragment key={i}>{t.text}</Fragment>
        ),
      )}
    </>
  );
}

function CameraShowcase() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -10% 0px" });
  return (
    <div ref={ref} className="flex justify-center rounded-[2rem] bg-night py-8">
      <Phone scale={0.62} tone="light">
        <CameraScreen active={inView} loop />
      </Phone>
    </div>
  );
}

const SHOWCASES: Record<Showcase, () => ReactNode> = {
  camera: () => <CameraShowcase />,
  plates: () => (
    <div className="rounded-[2rem] bg-mist p-5 sm:p-7">
      <PlatesCard />
    </div>
  ),
  meets: () => (
    <div className="overflow-hidden rounded-[2rem] bg-mist">
      <MeetsMap className="h-[24rem]" />
    </div>
  ),
  guess: () => (
    <div className="rounded-[2rem] bg-mist p-4 sm:p-5">
      <GuessCard />
    </div>
  ),
  clubs: () => (
    <div className="rounded-[2rem] bg-mist p-3 sm:p-4">
      <ClubCard />
    </div>
  ),
  ranking: () => (
    <div className="rounded-[2rem] bg-mist p-4 sm:p-5">
      <RankingCard />
    </div>
  ),
};

const UI = {
  en: { home: "Home", faq: "Questions", more: "Keep exploring", updated: "Updated" },
  fr: { home: "Accueil", faq: "Questions fréquentes", more: "À découvrir aussi", updated: "Mis à jour le" },
};

interface ContentPageProps {
  doc: PageDoc;
  locale: Locale;
  /** Store links attribution. */
  campaign: string;
  related: Array<{ href: string; title: string; body: string }>;
  /** Printed date of the last content change. */
  updated: string;
  /** Build-time SVG of the download QR code. */
  qr: string;
  /** Extra content between the sections and the FAQ (e.g. a data table). */
  children?: ReactNode;
}

/**
 * The guide and feature pages: the dark hero band of the other pages, then
 * the text on the left and the app's own widget on the right (above the text
 * on phones), the visible FAQ, the store buttons and related pages. The
 * download is offered three times: an inline card after the second section,
 * the QR code under the widget (desktop) and the closing band.
 */
export default function ContentPage({ doc, locale, campaign, related, updated, qr, children }: ContentPageProps) {
  const ui = UI[locale];
  const showcase = doc.showcase ? SHOWCASES[doc.showcase]() : null;

  return (
    <DocShell
      lang={locale}
      title={doc.h1}
      subtitle={doc.subtitle}
      intro={<Rich text={doc.intro} linkClassName="font-semibold text-snow underline decoration-graphite underline-offset-4 hover:decoration-snow" />}
      crumbs={[{ href: HOME_PATH[locale], label: ui.home }, { label: doc.crumb }]}
      meta={
        <span className="tabular">
          {ui.updated} {updated}
        </span>
      }
    >
      {doc.facts && (
        <Reveal as="dl" className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {doc.facts.map((f) => (
            <div key={f.label} className="rounded-2xl bg-mist px-4 py-4 sm:px-5">
              <dt className="sr-only">{f.label}</dt>
              <dd className="text-display-s font-extrabold tabular">{f.value}</dd>
              <dd className="mt-1 text-[0.8125rem] font-semibold leading-snug text-ash">{f.label}</dd>
            </div>
          ))}
        </Reveal>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        {showcase && (
          <aside className="min-w-0 lg:order-2 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              {showcase}
              <QrCard qr={qr} className="mt-4 hidden bg-mist lg:flex" />
            </div>
          </aside>
        )}

        <article className={cn("min-w-0", showcase ? "lg:order-1 lg:col-span-7" : "lg:col-span-8")}>
          {doc.sections.map((s, si) => (
            <Fragment key={s.h2}>
              {si === 2 && <AppCta variant="inline" campaign={`${campaign}_inline`} className="mb-14" />}
              <Reveal as="section" className="mb-14 last:mb-0">
                <h2 className="text-display-s font-extrabold sm:text-display-m">{s.h2}</h2>
                {s.paragraphs?.map((p, i) => (
                  <p key={i} className="mt-5 max-w-[66ch] text-[1.0625rem] font-medium leading-relaxed text-ink/80 sm:text-lg">
                    <Rich text={p} />
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-6 space-y-3">
                    {s.list.map((item) => (
                      <li key={item} className="flex gap-3 text-[1.0625rem] font-medium leading-relaxed text-ink/80">
                        <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-snow">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <Rich text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.steps && (
                  <ol className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {s.steps.map((step, i) => (
                      <li key={step.title} className="rounded-[1.5rem] bg-mist p-5 sm:p-6">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-bold text-snow tabular">{i + 1}</span>
                        <p className="mt-4 text-lg font-bold leading-snug">{step.title}</p>
                        <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-ash">
                          <Rich text={step.body} />
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </Reveal>
            </Fragment>
          ))}
        </article>
      </div>

      {children}

      {doc.faq && doc.faq.length > 0 && (
        <section aria-labelledby="page-faq" className="mt-20 border-t border-line pt-16">
          <h2 id="page-faq" className="text-display-m font-extrabold">
            {ui.faq}
          </h2>
          <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
            {doc.faq.map((item) => (
              <Reveal key={item.question} className="min-w-0">
                <dt className="text-xl font-bold leading-snug tracking-[-0.01em]">{item.question}</dt>
                <dd className="mt-3 text-[1.0625rem] font-medium leading-relaxed text-ash">
                  <Rich text={item.answer} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      <AppCta campaign={campaign} title={doc.cta.title} body={doc.cta.body} qr={qr} className="mt-20" />

      {related.length > 0 && (
        <nav aria-labelledby="page-related" className="mt-20">
          <h2 id="page-related" className="text-display-s font-extrabold">
            {ui.more}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group flex h-full flex-col rounded-[1.5rem] border border-line p-6 transition-[border-color,box-shadow] duration-500 ease-out-expo hover:border-transparent hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.4)]"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="text-lg font-bold leading-snug">{r.title}</span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist transition-[background-color,color,transform] duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-ink group-hover:text-snow">
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                  </span>
                  <span className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-ash">{r.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </DocShell>
  );
}
