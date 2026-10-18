"use client";

import { ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/components/redesign/shared/Locale";
import { ALBUMS, Segmented, TabBar, useSteps } from "../ui";

const COPY = {
  en: {
    title: "Garage",
    tabs: ["Gallery", "Albums", "Map"],
    fresh: "New spot",
    collection: "McLaren collection",
    album: (brand: string) => `${brand} album in a Wheeloh garage`,
  },
  fr: {
    title: "Garage",
    tabs: ["Galerie", "Albums", "Carte"],
    fresh: "Nouveau spot",
    collection: "Collection McLaren",
    album: (brand: string) => `Album ${brand} d’un garage Wheeloh`,
  },
};

const BRAND_NAMES: Record<string, string> = {
  porsche: "Porsche",
  ferrari: "Ferrari",
  lambo: "Lamborghini",
  bugatti: "Bugatti",
  mclaren: "McLaren",
  pagani: "Pagani",
};

const GRID = [
  { key: "porsche", src: ALBUMS.porsche },
  { key: "ferrari", src: ALBUMS.ferrari },
  { key: "lambo", src: ALBUMS.lambo },
  { key: "bugatti", src: ALBUMS.bugatti },
  { key: "mclaren", src: ALBUMS.mclaren },
  { key: "pagani", src: ALBUMS.pagani },
];

const CARD = 174;
const GAP = 13;
const LEFT = 16;
const TOP = 160;
const pos = (i: number) => ({ x: LEFT + (i % 2) * (CARD + GAP), y: TOP + Math.floor(i / 2) * (CARD + GAP) });
const MCLAREN = pos(4);

/** Chapter 3 — the new spot drops into its brand album. */
export default function GarageScreen({ active }: { active: boolean }) {
  // 1 card appears · 2 flies to the album · 3 album bumps, count 7 · 4 collection progress
  const step = useSteps(active, [300, 1250, 2000, 2400]);
  const t = useCopy(COPY);

  const flyStyle =
    step >= 2
      ? { transform: `translate3d(${MCLAREN.x + CARD / 2 - 196.5}px, ${MCLAREN.y + CARD / 2 - 252}px, 0) scale(0.25)`, opacity: step >= 3 ? 0 : 1 }
      : { transform: "translate3d(0, 0, 0) scale(1)", opacity: step >= 1 ? 1 : 0 };

  return (
    <div className="absolute inset-0 bg-snow text-ink">
      <div className="absolute inset-x-0 top-[60px] flex items-center justify-center">
        <p className="text-[24px] font-bold tracking-[-0.01em]">{t.title}</p>
        <ListFilter className="absolute right-[26px] h-[26px] w-[26px]" strokeWidth={1.8} />
      </div>
      <Segmented id="garage" items={t.tabs} active={1} className="absolute left-1/2 top-[104px] -translate-x-1/2" />

      {GRID.map((a, i) => {
        const p = pos(i);
        const isMcLaren = a.key === "mclaren";
        return (
          <div
            key={a.key}
            className={cn(
              "absolute overflow-hidden rounded-[18px] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-out-expo",
              isMcLaren && step === 3 && "scale-[1.06]",
            )}
            style={{ left: p.x, top: p.y, width: CARD, height: CARD }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.src} alt={t.album(BRAND_NAMES[a.key])} loading="lazy" className="h-full w-full object-cover" />
            {isMcLaren && (
              <span
                className={cn(
                  "absolute bottom-[9px] right-[9px] grid h-[30px] w-[30px] place-items-center rounded-full text-[14px] font-bold text-snow transition-colors duration-500",
                  step >= 3 ? "bg-spotted" : "bg-[#3a3a3a]",
                )}
              >
                {step >= 3 ? 7 : 6}
              </span>
            )}
          </div>
        );
      })}

      {/* the fresh spot flying into its album */}
      <div
        className="absolute left-1/2 top-[166px] z-20 -ml-[86px] w-[172px] origin-center rounded-[22px] bg-snow p-[6px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.45)] transition-[transform,opacity] [transition-duration:750ms] [transition-timing-function:cubic-bezier(0.65,0,0.35,1)]"
        style={flyStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/senna-square-sm.jpg" alt="" loading="lazy" className="h-[118px] w-full rounded-[16px] object-cover object-[50%_65%]" />
        <p className="px-[4px] pb-[2px] pt-[7px] text-[13px] font-bold leading-tight">McLaren Senna</p>
        <p className="px-[4px] pb-[4px] text-[11px] font-semibold text-spotted">{t.fresh}</p>
      </div>

      {/* brand collection progress */}
      <div
        className={cn(
          "absolute inset-x-[14px] bottom-[98px] z-30 rounded-[20px] bg-ink px-[16px] py-[14px] text-snow shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-700 ease-out-expo",
          step >= 4 ? "translate-y-0 opacity-100" : "translate-y-[30px] opacity-0",
        )}
      >
        <div className="flex items-center justify-between text-[14px] font-bold">
          <span>{t.collection}</span>
          <span className="tabular text-snow/70">7 / 26</span>
        </div>
        <span className="mt-[10px] block h-[6px] overflow-hidden rounded-full bg-snow/15">
          <span
            className="block h-full rounded-full bg-spotted transition-[width] [transition-duration:1200ms] ease-out-expo"
            style={{ width: step >= 4 ? "27%" : "23%" }}
          />
        </span>
      </div>

      <TabBar active="garage" />
    </div>
  );
}
