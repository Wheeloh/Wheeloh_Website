"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, Flag, Lock, Map as MapIcon, Minus, Plus, Target, Users } from "lucide-react";
import { useInView } from "@/components/redesign/shared/motion/reveal";
import { ALBUMS } from "@/components/redesign/shared/phone/ui";
import { useCopy } from "@/components/redesign/shared/Locale";
import { cn } from "@/lib/utils";

// The app's advancement strings in each language.
const COPY = {
  en: { models: "19 / 1154 models", rank: "#15 of 29", pending: "104 friend(s) not placed yet", level: "Level 1", name: "Karting pro", start: "STARTING LINE", me: "Me" },
  fr: { models: "19 / 1154 modèles", rank: "15e sur 29", pending: "104 ami(s) pas encore placé(s)", level: "Niveau 1", name: "Pro du karting", start: "LIGNE DE DÉPART", me: "Moi" },
};

// The app's "Progress bar" screen: a road rising from the starting line,
// one milestone per step (1 %, 2 %, 3 %…), friends placed on the same road
// at their own percentage, and a named level every few milestones.
// Colours and proportions follow the app's road_style.dart.
const W = 400;
const H = 560;
const Y0 = 500; // 0 %
const STEP = 92; // one milestone (here one percent) of track
const ME = 1.6; // 19 of 1154 models
const yAt = (pct: number) => Y0 - pct * STEP;

// Cubic bezier, monotonic in y, from just below 0 % to past the top edge.
const P = [
  [200, 530],
  [180, 390],
  [244, 180],
  [220, -30],
];
function bez(t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
}
function tAtY(y: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 28; i++) {
    const m = (lo + hi) / 2;
    if (bez(m)[1] > y) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
const at = (pct: number) => bez(tAtY(yAt(pct)));
const ROAD = `M ${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`;
const pos = (pct: number, dx = 0) => {
  const [x, y] = at(pct);
  return { left: `${((x + dx) / W) * 100}%`, top: `${(y / H) * 100}%` };
};

interface Friend {
  pct: number;
  dx: number;
  src?: string;
  initial?: string;
  badge?: string;
}

// Kept clear of the user's own bubble (left of the road around 1.6 %).
const FRIENDS: Friend[] = [
  { pct: 0.18, dx: -74, src: ALBUMS.lambo },
  { pct: 0.34, dx: 70, src: ALBUMS.ferrari, badge: "+3" },
  { pct: 0.55, dx: -80, initial: "P" },
  { pct: 0.78, dx: 72, src: ALBUMS.bugatti },
  { pct: 0.95, dx: -72, src: ALBUMS.pagani },
  { pct: 1.3, dx: 74, src: "/media/mclaren-675lt-sm.jpg" },
  { pct: 1.75, dx: 76, src: "/media/porsche-gt3rs-sm.jpg" },
  { pct: 2.3, dx: -84, src: ALBUMS.porsche, badge: "+2" },
  { pct: 2.55, dx: 70, src: ALBUMS.mclaren },
  { pct: 2.9, dx: -74, src: "/media/senna-portrait-sm.jpg" },
  { pct: 3.55, dx: 72, initial: "A" },
  { pct: 4.25, dx: -76, initial: "L" },
];

const MILESTONES = [1, 2, 3, 4];

export default function ProgressTrack({ className }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -10% 0px" });
  const uid = useId();
  const clipRect = useRef<SVGRectElement>(null);
  const me = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const [passed, setPassed] = useState(false);
  const t = useCopy(COPY);

  // One rAF loop drives the white "done" road, the avatar and its bubble,
  // like the app's replay when you come back with new cars.
  useEffect(() => {
    const apply = (pct: number) => {
      const [x, y] = at(pct);
      if (clipRect.current) {
        clipRect.current.setAttribute("y", String(y));
        clipRect.current.setAttribute("height", String(H - y + 60));
      }
      if (me.current) {
        me.current.style.left = `${(x / W) * 100}%`;
        me.current.style.top = `${(y / H) * 100}%`;
      }
      if (bubble.current) bubble.current.textContent = `${pct.toFixed(1)}%`;
      setPassed(pct >= 1);
    };
    if (!inView) {
      apply(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(ME);
      return;
    }
    const t0 = performance.now() + 500;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 2200));
      // ease-in-out cubic, as in the app's replay
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      apply(e * ME);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const stateOf = (pct: number) => (pct <= 1 && passed ? "reached" : pct === (passed ? 2 : 1) ? "next" : "locked");

  return (
    <div ref={ref} className={cn("flex flex-col overflow-hidden rounded-[1.5rem] bg-[#0B0B0D] text-snow", className)}>
      {/* HUD */}
      <div className="flex items-center justify-between px-4 pt-4 text-[0.8125rem] font-bold">
        <span className="text-[#8C8C95] tabular">{t.models}</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#1C1C20] px-3 py-1.5 text-snow tabular ring-1 ring-inset ring-[#2B2B31]">
          <Users className="h-3.5 w-3.5" aria-hidden /> {t.rank}
        </span>
      </div>
      <p className="mt-1.5 text-center text-[0.6875rem] font-semibold text-[#55555E]">{t.pending}</p>

      {/* the road */}
      <div className="relative mx-auto mt-1 w-full max-w-[26rem] flex-1" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <pattern id={`${uid}-zig`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 10 L20 30 L40 10" fill="none" stroke="#16161A" strokeWidth="1.5" />
            </pattern>
            <clipPath id={`${uid}-done`}>
              <rect ref={clipRect} x="0" y={H} width={W} height="0" />
            </clipPath>
          </defs>
          <rect width={W} height={H} fill={`url(#${uid}-zig)`} />
          {/* tick labels, white once reached */}
          {[0, 1, 2, 3, 4, 5].map((pct) => (
            <text
              key={pct}
              x="46"
              y={yAt(pct) + 4}
              textAnchor="end"
              fill={pct === 0 || (pct === 1 && passed) ? "#ffffff" : "#55555E"}
              fontSize={pct === 5 ? 12 : 11}
              fontWeight={pct === 5 ? 900 : 700}
              fontFamily="var(--font-sans)"
            >
              {pct}%
            </text>
          ))}
          {/* untravelled road + the white part behind you */}
          <path d={ROAD} fill="none" stroke="#1A1A1E" strokeWidth="24" strokeLinecap="round" />
          <path d={ROAD} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.4" strokeDasharray="7 7" />
          <g clipPath={`url(#${uid}-done)`}>
            <path d={ROAD} fill="none" stroke="#ffffff" strokeWidth="24" strokeLinecap="round" />
            <path d={ROAD} fill="none" stroke="rgba(0,0,0,0.13)" strokeWidth="2.4" strokeDasharray="7 7" />
          </g>
          {/* islands under the milestone boxes */}
          {MILESTONES.map((pct) => {
            const [x, y] = at(pct);
            return <rect key={pct} x={x - 35} y={y - 24} width="70" height="48" rx="18" fill="#1C1C20" />;
          })}
        </svg>

        {/* milestone boxes */}
        {MILESTONES.map((pct) => {
          const state = stateOf(pct);
          return (
            <div
              key={pct}
              className={cn(
                "absolute grid aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28%] border transition-[background-color,border-color,box-shadow] duration-500",
                state === "reached" && "border-[#2B2B31] bg-[#232327]",
                state === "next" && "border-[1.8px] border-snow bg-[#141417] shadow-[0_0_18px_rgba(255,255,255,0.12)]",
                state === "locked" && "border-[#2B2B31] bg-[#1C1C20]",
              )}
              style={pos(pct)}
            >
              {state === "reached" && (
                <span className="grid h-[48%] w-[48%] place-items-center rounded-full bg-snow text-[#0B0B0D]">
                  <Check className="h-[62%] w-[62%]" strokeWidth={3.5} />
                </span>
              )}
              {state === "next" && <Flag className="h-[42%] w-[42%] text-snow" fill="currentColor" strokeWidth={1.5} />}
              {state === "locked" && <Lock className="h-[40%] w-[40%] text-[#55555E]" strokeWidth={2.2} />}
            </div>
          );
        })}

        {/* level banner (5 % opens level 1) */}
        <div
          className="absolute left-[14%] right-[6%] flex items-center gap-3 rounded-[22px] border border-[#2B2B31] bg-gradient-to-b from-[#17171B] to-[#101012] px-3 py-2.5"
          style={{ top: `${((yAt(5) - 32) / H) * 100}%` }}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1C1C20] text-[0.9375rem] font-black text-[#8C8C95]">1</span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[#8C8C95]">{t.level}</span>
            <span className="block truncate text-[1rem] font-black text-snow">{t.name}</span>
          </span>
          <Lock className="h-4 w-4 shrink-0 text-[#55555E]" strokeWidth={2.2} aria-hidden />
        </div>

        {/* friends */}
        {FRIENDS.map((f, i) => {
          const ahead = f.pct >= ME;
          return (
            <div
              key={i}
              className={cn(
                "absolute aspect-square w-[8.5%] -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-700 ease-out-expo",
                inView ? "opacity-100" : "scale-50 opacity-0",
              )}
              style={{ ...pos(f.pct, f.dx), transitionDelay: inView ? `${300 + i * 70}ms` : "0ms" }}
            >
              <span
                className={cn(
                  "block h-full w-full overflow-hidden rounded-full border-2 bg-[#1C1C20] p-[1.5px] shadow-[0_6px_14px_rgba(0,0,0,0.6)]",
                  ahead ? "border-snow" : "border-[#7A7A83]",
                )}
              >
                {f.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.src} alt="" loading="lazy" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center rounded-full bg-[#2B2B31] text-[0.75rem] font-black text-snow">{f.initial}</span>
                )}
              </span>
              {f.badge && (
                <span className="absolute -bottom-1.5 -right-2 rounded-full border-[1.5px] border-[#1C1C20] bg-snow px-1.5 py-[1px] text-[0.625rem] font-black leading-none text-[#0B0B0D]">
                  {f.badge}
                </span>
              )}
            </div>
          );
        })}

        {/* you: 50 px avatar, white ring, sonar halo and the percent bubble */}
        <div ref={me} className="absolute aspect-square w-[12.5%] -translate-x-1/2 -translate-y-1/2" style={pos(0)}>
          <span aria-hidden className="sonar absolute inset-[-16%] rounded-full bg-snow/45" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/senna-square-sm.jpg"
            alt=""
            loading="lazy"
            className="relative h-full w-full rounded-full object-cover object-[50%_65%] ring-[3px] ring-snow"
          />
          <span
            ref={bubble}
            className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[9px] bg-snow px-2 py-1 text-[0.75rem] font-black text-[#0B0B0D] tabular"
          >
            0.0%
          </span>
        </div>

        {/* minimap strip, as on the right edge of the app */}
        <div aria-hidden className="absolute bottom-[6%] right-[1.5%] top-[4%] w-[5%] rounded-full bg-[#141417] ring-1 ring-inset ring-[#2B2B31]">
          <span className="absolute inset-x-[2px] top-[52%] h-[22%] rounded-full bg-snow/90" />
          {[18, 30, 41, 66, 78, 88].map((t) => (
            <span key={t} className="absolute left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#7A7A83]" style={{ top: `${t}%` }} />
          ))}
          <span className="absolute left-1/2 top-[62%] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#0B0B0D] ring-1 ring-snow" />
        </div>

        <p className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-3 text-[0.6875rem] font-black tracking-[0.18em] text-[#8C8C95]">
          <span aria-hidden className="checker h-[14px] w-[42px] bg-[#1C1C20] text-snow [--checker:7px]" />
          {t.start}
          <span aria-hidden className="checker h-[14px] w-[42px] bg-[#1C1C20] text-snow [--checker:7px]" />
        </p>
      </div>

      {/* toolbar */}
      <div
        aria-hidden
        className="mx-auto mb-3 mt-2 flex items-center gap-0.5 rounded-[26px] border border-[#2B2B31] bg-[#1C1C20]/95 p-1 text-snow shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]"
      >
        {[Minus, Plus, MapIcon, ArrowUp, ArrowDown].map((Icon, i) => (
          <span key={i} className="grid h-9 w-9 place-items-center">
            <Icon className="h-4 w-4" strokeWidth={2.4} />
          </span>
        ))}
        <span className="ml-1 flex h-9 items-center gap-1.5 rounded-[21px] bg-snow px-3.5 text-[0.8125rem] font-black text-[#0B0B0D]">
          <Target className="h-4 w-4" strokeWidth={2.4} /> {t.me}
        </span>
      </div>
    </div>
  );
}
