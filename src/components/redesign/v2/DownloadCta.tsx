"use client";

import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { Reveal, SplitText, useInViewRef } from "@/components/redesign/shared/motion/reveal";

const COUNTRIES = "France, Belgium, Switzerland, Luxembourg, the Netherlands, the UK, the US, Canada and Australia";

export default function DownloadCta({ qr }: { qr: string }) {
  const flagRef = useInViewRef<HTMLDivElement>({ once: false, rootMargin: "0px" });
  return (
    <section id="download" aria-labelledby="download-title" className="grain relative overflow-hidden bg-night pb-28 pt-24 text-snow sm:pb-40 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_35%_at_50%_22%,rgba(255,255,255,0.09),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-5 text-center sm:px-8">
        <div ref={flagRef} className="download-flag">
          <FlagMark motion="wave" className="w-28 text-snow sm:w-40" />
        </div>
        <h2 id="download-title" className="mt-12 text-display-xl font-extrabold sm:mt-16">
          <SplitText text={"The next one is\naround the corner."} />
        </h2>
        <Reveal as="p" delay={200} className="mt-6 max-w-[46ch] text-lg font-medium leading-relaxed text-smoke">
          Free on iOS and Android. Available in {COUNTRIES}.
        </Reveal>
        <Reveal delay={320} className="mt-10 flex flex-col items-center gap-8 lg:flex-row lg:gap-10">
          <StoreButtons tone="light" size="lg" campaign="download_section" className="justify-center" />
          <div className="hidden items-center gap-4 rounded-[1.75rem] bg-snow p-3 pr-6 text-left text-ink lg:flex">
            <span className="block h-[5.5rem] w-[5.5rem] rounded-2xl bg-snow p-1.5 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} aria-hidden />
            <span>
              <span className="block text-base font-bold">Scan to download</span>
              <span className="block text-sm font-medium text-ash">Opens the right store</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
