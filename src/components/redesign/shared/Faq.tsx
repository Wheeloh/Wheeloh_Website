"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Reveal, SplitText } from "@/components/redesign/shared/motion/reveal";
import { FAQ_ITEMS } from "@/lib/seo";
import { cn } from "@/lib/utils";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="sheet relative z-10 -mt-10 pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="faq-title" className="text-display-l font-extrabold">
            <SplitText text={"Questions,\nanswered."} lineClassNames={["", "text-ash"]} />
          </h2>
          <Reveal as="p" delay={150} className="mt-6 max-w-[34ch] text-lg font-medium leading-relaxed text-ash">
            Want to go deeper? Read our{" "}
            <Link href="/engineering" className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink">
              engineering deep dives
            </Link>{" "}
            or browse the latest{" "}
            <Link href="/changelog" className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink">
              product updates
            </Link>
            .
          </Reveal>
        </div>

        <ul className="border-t border-line lg:col-span-8">
          {FAQ_ITEMS.map((item, i) => {
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
                    <p className="max-w-[62ch] pb-7 pr-14 text-base font-medium leading-relaxed text-ash sm:text-lg">{item.answer}</p>
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
