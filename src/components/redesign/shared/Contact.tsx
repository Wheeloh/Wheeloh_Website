"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import LazyMount from "@/components/LazyMount";
import { Reveal, SplitText } from "@/components/redesign/shared/motion/reveal";
import { CONTACT_EMAIL, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/seo";

const FilloutStandardEmbed = dynamic(() => import("@/components/FilloutEmbedLazy"), { ssr: false });

const CHANNELS = [
  { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Instagram", value: "@wheeloh_app", href: INSTAGRAM_URL },
  { label: "TikTok", value: "@bywheeloh", href: TIKTOK_URL },
];

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-snow pb-24 text-ink sm:pb-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid gap-12 border-t border-line pt-20 sm:pt-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="contact-title" className="text-display-l font-extrabold">
              <SplitText text={"Talk to\nthe team."} lineClassNames={["", "text-ash"]} />
            </h2>
            <Reveal as="p" delay={150} className="mt-6 max-w-[38ch] text-lg font-medium leading-relaxed text-ash">
              A question about the app, some feedback or a partnership idea? We read everything.
            </Reveal>
            <ul className="mt-10 border-t border-line">
              {CHANNELS.map((c, i) => (
                <Reveal as="li" key={c.label} delay={200 + i * 70} className="border-b border-line">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener" : undefined}
                    className="group flex items-center justify-between gap-4 py-5"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ash">{c.label}</span>
                      <span className="block break-all text-lg font-bold sm:text-xl">{c.value}</span>
                    </span>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mist transition-[background-color,color,transform] duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-ink group-hover:text-snow">
                      <ArrowUpRight className="h-5 w-5" aria-hidden />
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-[2rem] bg-mist p-3 sm:p-5">
              <LazyMount minHeight={490} className="w-full">
                <FilloutStandardEmbed filloutId="nbbX3d69vzus" dynamicResize />
              </LazyMount>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
