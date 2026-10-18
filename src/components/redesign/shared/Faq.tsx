"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { Reveal, SplitText } from "@/components/redesign/shared/motion/reveal";
import { useCopy, useLocale } from "@/components/redesign/shared/Locale";
import { FAQ_BY_LOCALE } from "@/lib/seo";
import { routePath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const LINK = "font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink";

const COPY = {
  en: {
    title: "Questions,\nanswered.",
    intro: (guide: string) => (
      <>
        Want to go deeper? Read the{" "}
        <Link href={guide} className={LINK}>
          complete car spotting guide
        </Link>
        , our{" "}
        <Link href="/engineering" className={LINK}>
          engineering deep dives
        </Link>{" "}
        or the latest{" "}
        <Link href="/changelog" className={LINK}>
          product updates
        </Link>
        .
      </>
    ),
  },
  fr: {
    title: "Vos questions,\nnos réponses.",
    intro: (guide: string) => (
      <>
        Envie d'aller plus loin ? Lis le{" "}
        <Link href={guide} className={LINK}>
          guide complet du carspotting
        </Link>{" "}
        ou les dernières{" "}
        <Link href="/changelog" className={LINK}>
          nouveautés de l'app
        </Link>{" "}
        (en anglais).
      </>
    ),
  },
};

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  const locale = useLocale();
  const t = useCopy(COPY);
  const items = FAQ_BY_LOCALE[locale];

  return (
    <section id="faq" aria-labelledby="faq-title" className="sheet relative z-10 -mt-10 pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div className="mx-auto grid grid-cols-1 max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="text-display-l font-extrabold">
            <SplitText text={t.title} lineClassNames={["", "text-ash"]} />
          </h2>
          <Reveal as="p" delay={150} className="mt-6 max-w-[34ch] text-lg font-medium leading-relaxed text-ash">
            {t.intro(routePath("carSpotting", locale))}
          </Reveal>
        </div>

        <ul className="border-t border-line lg:col-span-8">
          {items.map((item, i) => {
            const isOpen = open === i;
            const panel = `${uid}-panel-${i}`;
            const button = `${uid}-button-${i}`;
            return (
              <Reveal as="li" key={item.question} delay={Math.min(i, 5) * 60} className="border-b border-line">
                <h3>
                  <button
                    id={button}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-bold tracking-[-0.01em] sm:text-xl"
                  >
                    {item.question}
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-500 ease-out-expo",
                        isOpen ? "rotate-45 bg-ink text-snow" : "bg-mist text-ink group-hover:bg-line",
                      )}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </span>
                  </button>
                </h3>
                <div
                  id={panel}
                  role="region"
                  aria-labelledby={button}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className={cn("max-w-[62ch] pr-14 text-base font-medium leading-relaxed text-ash sm:text-lg", item.link ? "pb-3" : "pb-7")}>
                      {item.answer}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        tabIndex={isOpen ? undefined : -1}
                        className="group mb-7 inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-ink"
                      >
                        {item.link.label}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
