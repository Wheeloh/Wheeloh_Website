"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, BadgeCheck, Check, ImagePlus } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { Reveal, SplitText } from "@/components/redesign/shared/motion/reveal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const FilloutStandardEmbed = dynamic(() => import("@/components/FilloutEmbedLazy"), { ssr: false });

const PERKS = [
  {
    title: "An exclusive affiliate badge",
    body: "Shown on your profile, your posts and the leaderboard.",
  },
  {
    title: "Import your own car photos",
    body: "Publish shots from your camera — full quality, straight into the app.",
  },
];

export default function Affiliate() {
  return (
    <section id="affiliate" aria-labelledby="affiliate-title" className="sheet relative z-10 -mt-10 pb-24 pt-20 sm:pb-32 sm:pt-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 lg:pr-10">
          <h2 id="affiliate-title" className="text-display-l font-extrabold">
            <SplitText text={"Already shooting cars?\nJoin the affiliates."} lineClassNames={["", "text-ash"]} />
          </h2>
          <Reveal as="p" delay={150} className="mt-6 max-w-[44ch] text-lg font-medium leading-relaxed text-ash">
            The Wheeloh affiliate programme is for car photographers and creators who want their work seen by the people who
            care most.
          </Reveal>
          <ul className="mt-10 space-y-5">
            {PERKS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={250 + i * 90} className="flex gap-4">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-snow">
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                </span>
                <span>
                  <span className="block text-lg font-bold">{p.title}</span>
                  <span className="block text-base font-medium text-ash">{p.body}</span>
                </span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={450} className="mt-10">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-ink pl-7 pr-2 text-base font-semibold text-snow transition-transform duration-300 active:scale-[0.97]"
                >
                  Apply to the programme
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-snow text-ink transition-transform duration-500 ease-out-expo group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" aria-hidden />
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[40rem] overflow-y-auto rounded-[2rem] border-0 p-6 sm:p-8" data-lenis-prevent>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold tracking-[-0.02em]">Affiliate programme application</DialogTitle>
                  <DialogDescription>Review the requirements below before submitting your application.</DialogDescription>
                </DialogHeader>
                <div className="h-[520px] py-2">
                  <FilloutStandardEmbed filloutId="3nF36BZAZ3us" />
                </div>
              </DialogContent>
            </Dialog>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={100} className="lg:col-span-6">
          <ProfileCard />
        </Reveal>
      </div>
    </section>
  );
}

/** An affiliate profile, app style — tilts toward the cursor. */
function ProfileCard() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div className="mx-auto max-w-[30rem] [perspective:1200px]" onPointerMove={onMove} onPointerLeave={reset}>
      <div
        ref={ref}
        className="overflow-hidden rounded-[2.25rem] bg-snow shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] transition-transform duration-500 ease-out-expo [transform-style:preserve-3d]"
      >
        <div className="relative h-44 sm:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/mclaren-675lt-sm.jpg" alt="" loading="lazy" className="h-full w-full object-cover object-[50%_60%]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="px-6 pb-7 sm:px-8">
          <div className="relative z-10 -mt-12 flex items-end justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/senna-square-sm.jpg" alt="" loading="lazy" className="h-24 w-24 rounded-full object-cover ring-[5px] ring-snow" />
            <span className="affiliate-badge relative mb-2 inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-3.5 py-2 text-sm font-bold text-snow">
              <FlagMark className="w-4 text-snow" /> Affiliate
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-2xl font-extrabold tracking-[-0.02em]">
            Your name <BadgeCheck className="h-6 w-6 text-snow" fill="#111" strokeWidth={2} aria-hidden />
          </p>
          <p className="text-base font-medium text-ash">@yourhandle · Car photographer</p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              { v: "128", l: "Spots" },
              { v: "41.2k", l: "Points" },
              { v: "#12", l: "Country" },
            ].map((s) => (
              <span key={s.l} className="rounded-2xl bg-mist py-3">
                <span className="block text-xl font-extrabold tabular">{s.v}</span>
                <span className="block text-[0.8125rem] font-semibold text-ash">{s.l}</span>
              </span>
            ))}
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm font-bold">
            <ImagePlus className="h-4 w-4" aria-hidden /> Imported from your camera
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["/media/porsche-gt3rs-sm.jpg", "/media/senna-portrait-sm.jpg", "/media/mclaren-675lt-sm.jpg"].map((src, i) => (
              <span key={src} className="relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                {i === 2 && (
                  <span className="absolute inset-0 grid place-items-center bg-black/55 text-lg font-extrabold text-snow">+24</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
