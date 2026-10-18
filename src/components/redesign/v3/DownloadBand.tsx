"use client";

import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { Reveal, SplitText, useInViewRef } from "@/components/redesign/shared/motion/reveal";
import { useCopy, useLocale } from "@/components/redesign/shared/Locale";
import { STORE_COUNTRIES } from "@/lib/seo";

const COPY = {
  en: {
    title: "The next one is\naround the corner.",
    body: (countries: string) => `Free on iOS and Android. Available in ${countries}.`,
    scan: "Scan to download",
    store: "Opens the right store",
  },
  fr: {
    title: "La prochaine est\nau coin de la rue.",
    body: (countries: string) => `Gratuite sur iOS et Android. Disponible dans 9 pays : ${countries}.`,
    scan: "Scanne pour télécharger",
    store: "Ouvre le bon store",
  },
};

/** The one dark block of the page: the download call to action, running straight into the footer. */
export default function DownloadBand({ qr }: { qr: string }) {
  const flagRef = useInViewRef<HTMLDivElement>({ once: false, rootMargin: "0px" });
  const t = useCopy(COPY);
  const locale = useLocale();
  return (
    <section
      id="download"
      aria-labelledby="download-title"
      className="grain relative overflow-hidden rounded-t-sheet bg-night pb-24 pt-20 text-snow sm:pb-32 sm:pt-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_35%_at_50%_18%,rgba(255,255,255,0.09),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-5 text-center sm:px-8">
        <div ref={flagRef} className="download-flag">
          <FlagMark motion="wave" className="w-24 text-snow sm:w-32" />
        </div>
        <h2 id="download-title" className="mt-10 text-display-xl font-extrabold sm:mt-14">
          <SplitText text={t.title} />
        </h2>
        <Reveal as="p" delay={200} className="mt-6 max-w-[46ch] text-lg font-medium leading-relaxed text-smoke">
          {t.body(STORE_COUNTRIES[locale])}
        </Reveal>
        <Reveal delay={320} className="mt-10 flex flex-col items-center gap-8 lg:flex-row lg:gap-10">
          <StoreButtons tone="light" size="lg" campaign="download_section" className="justify-center" />
          <div className="hidden items-center gap-4 rounded-[1.75rem] bg-snow p-3 pr-6 text-left text-ink lg:flex">
            <span
              className="block h-[5.5rem] w-[5.5rem] rounded-2xl bg-snow p-1.5 [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
              aria-hidden
            />
            <span>
              <span className="block text-base font-bold">{t.scan}</span>
              <span className="block text-sm font-medium text-ash">{t.store}</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
