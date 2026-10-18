"use client";

import { Check, Flame, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALBUMS, CarAvatar, Segmented, TabBar, useSteps } from "../ui";

// A hand-drawn street map in the app's map style (light basemap, blue-grey
// arterials, yellow route shields) — vector so it stays crisp at any scale.
function StreetMap({ drawn }: { drawn: boolean }) {
  const minor = [
    "M-10 70 L410 20",
    "M-10 160 L410 118",
    "M-10 262 L410 214",
    "M-10 372 L410 322",
    "M-10 470 L410 436",
    "M40 -10 L96 640",
    "M150 -10 L190 640",
    "M262 -10 L292 640",
    "M352 -10 L372 640",
    "M120 300 C170 260 230 280 260 240",
    "M30 520 C90 480 140 520 210 470",
  ];
  const major = ["M-20 610 C80 520 150 430 230 330 S360 160 420 90", "M-20 240 C120 260 260 300 420 380"];
  return (
    <svg viewBox="0 0 393 610" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="393" height="610" fill="#F3F2F5" />
      <path d="M0 0 H118 C108 60 70 96 0 104 Z" fill="#CDEBD6" />
      <path d="M300 470 L393 448 V610 H286 Z" fill="#CDEBD6" />
      <path d="M210 120 C250 104 290 118 296 150 C302 184 262 196 230 186 C198 176 186 136 210 120 Z" fill="#CDEBD6" />
      <path d="M58 300 L112 286 L124 352 L70 366 Z" fill="#A9DDF0" />
      <path d="M78 380 L114 372 L120 414 L84 420 Z" fill="#A9DDF0" />
      <path d="M150 380 C200 360 250 372 262 404 C230 430 180 432 150 418 Z" fill="#F6EBD3" />
      <path d="M300 250 C330 240 372 250 380 280 C350 300 312 296 300 280 Z" fill="#F6EBD3" />
      <g fill="none" strokeLinecap="round" className={cn("map-roads", drawn && "is-drawn")}>
        {minor.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#DCE1E8" strokeWidth="8" pathLength={1} />
            <path d={d} stroke="#FFFFFF" strokeWidth="5" pathLength={1} />
          </g>
        ))}
        {major.map((d, i) => (
          <g key={`m${i}`}>
            <path d={d} stroke="#7F97B2" strokeWidth="13" pathLength={1} />
            <path d={d} stroke="#9DB2C9" strokeWidth="9" pathLength={1} />
          </g>
        ))}
      </g>
      <g fontFamily="var(--font-sans)" fontWeight="700" fontSize="12">
        <rect x="206" y="318" width="38" height="20" rx="3" fill="#F4C934" stroke="#C9A21E" />
        <text x="225" y="332" textAnchor="middle" fill="#1d1d1f">D10</text>
        <rect x="40" y="236" width="46" height="20" rx="3" fill="#F4C934" stroke="#C9A21E" />
        <text x="63" y="250" textAnchor="middle" fill="#1d1d1f">D185</text>
      </g>
    </svg>
  );
}

const PINS = [
  { x: 92, y: 196, src: ALBUMS.lambo },
  { x: 268, y: 150, src: ALBUMS.ferrari },
  { x: 180, y: 300, src: "/media/senna-square-sm.jpg", fresh: true },
  { x: 318, y: 360, src: ALBUMS.porsche },
  { x: 120, y: 450, src: ALBUMS.bugatti },
];

const HEAT = [
  { x: 120, y: 220, r: 120 },
  { x: 260, y: 300, r: 150 },
  { x: 150, y: 470, r: 100 },
];

/** Chapter 4 — spots on the map, the community heat map and a meet nearby. */
export default function MapScreen({ active }: { active: boolean }) {
  // 1 roads + pins · 2 community layer · 3 meet card · 4 joined
  const step = useSteps(active, [200, 1500, 2300, 3300]);

  return (
    <div className="absolute inset-0 bg-snow text-ink">
      <div className="absolute inset-x-0 top-[60px] flex items-center justify-center">
        <p className="text-[24px] font-bold tracking-[-0.01em]">Garage</p>
        <ListFilter className="absolute right-[26px] h-[26px] w-[26px]" strokeWidth={1.8} />
      </div>
      <Segmented id="map" items={["Gallery", "Albums", "Map"]} active={2} className="absolute left-1/2 top-[104px] -translate-x-1/2" />

      <div className="absolute inset-x-0 bottom-[88px] top-[154px] overflow-hidden">
        <StreetMap drawn={step >= 1} />

        {/* community heat map */}
        {HEAT.map((h, i) => (
          <span
            key={i}
            className={cn("map-heat absolute rounded-full transition-opacity duration-1000", step >= 2 ? "opacity-100" : "opacity-0")}
            style={{
              left: h.x - h.r / 2,
              top: h.y - h.r / 2,
              width: h.r,
              height: h.r,
              animationDelay: `${i * -0.8}s`,
              background: "radial-gradient(circle, rgba(232,59,58,0.42) 0%, rgba(249,180,1,0.22) 45%, transparent 70%)",
            }}
          />
        ))}

        {PINS.map((p, i) => (
          <div
            key={i}
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-full transition-[transform,opacity] duration-700 ease-out-expo",
              step >= 1 ? "opacity-100" : "-translate-y-[160%] opacity-0",
            )}
            style={{ left: p.x, top: p.y, transitionDelay: step >= 1 ? `${i * 110}ms` : "0ms" }}
          >
            <div className={cn("rounded-[13px] bg-snow p-[3px] shadow-[0_8px_18px_-6px_rgba(0,0,0,0.45)]", p.fresh && "ring-2 ring-spotted")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" loading="lazy" className="h-[50px] w-[50px] rounded-[10px] object-cover" />
            </div>
            <span className="mx-auto block h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-snow" />
          </div>
        ))}

        <span
          className={cn(
            "absolute right-[12px] top-[12px] z-20 flex items-center gap-2 rounded-full bg-snow px-[12px] py-[8px] text-[13px] font-semibold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)] transition-colors duration-500",
          )}
        >
          <Flame className={cn("h-4 w-4 transition-colors duration-500", step >= 2 ? "text-[#FF821E]" : "text-line")} fill={step >= 2 ? "#FF821E" : "currentColor"} strokeWidth={1.6} />
          Spot zones
        </span>

        {/* meet card */}
        <div
          className={cn(
            "absolute inset-x-[12px] bottom-[12px] z-20 flex items-center gap-[12px] rounded-[20px] bg-snow p-[12px] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-700 ease-out-expo",
            step >= 3 ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0",
          )}
        >
          <span className="flex h-[52px] w-[48px] shrink-0 flex-col items-center justify-center rounded-[12px] bg-ink text-snow">
            <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-snow/70">Sun</span>
            <span className="text-[20px] font-bold leading-none">14</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold">Sunday morning meet</span>
            <span className="mt-[3px] flex items-center gap-[6px] text-[12px] font-medium text-ash">
              <span className="flex -space-x-2">
                <CarAvatar src={ALBUMS.mclaren} size={20} className="ring-2 ring-snow" />
                <CarAvatar src={ALBUMS.pagani} size={20} className="ring-2 ring-snow" />
                <CarAvatar src="/media/porsche-gt3rs-sm.jpg" size={20} className="ring-2 ring-snow" />
              </span>
              <span className="tabular">{step >= 4 ? 19 : 18} going · 9:00</span>
            </span>
          </span>
          <span
            className={cn(
              "flex h-[36px] items-center gap-1 rounded-full px-[14px] text-[13px] font-bold transition-colors duration-300",
              step >= 4 ? "bg-spotted text-snow" : "bg-ink text-snow",
            )}
          >
            {step >= 4 ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> Going
              </>
            ) : (
              "Join"
            )}
          </span>
        </div>
      </div>

      <TabBar active="garage" />
    </div>
  );
}
