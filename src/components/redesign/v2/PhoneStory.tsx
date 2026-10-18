"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { CalendarDays, Flame, Layers, Search, Target, Wrench } from "lucide-react";
import Phone, { PHONE_H } from "@/components/redesign/shared/phone/Phone";
import CameraScreen from "@/components/redesign/shared/phone/screens/CameraScreen";
import FeedScreen from "@/components/redesign/shared/phone/screens/FeedScreen";
import GarageScreen from "@/components/redesign/shared/phone/screens/GarageScreen";
import MapScreen from "@/components/redesign/shared/phone/screens/MapScreen";
import RankScreen from "@/components/redesign/shared/phone/screens/RankScreen";
import { useInViewRef } from "@/components/redesign/shared/motion/reveal";
import { cn } from "@/lib/utils";

const CHAPTERS = [
  {
    label: "Identify",
    title: "Point. Shoot. Named.",
    body: "One photo is all it takes. Wheeloh names the make, model and exact version, then pulls up the full spec sheet — power, torque, 0–100, top speed, weight.",
  },
  {
    label: "Score",
    title: "Rarer cars, bigger scores.",
    body: "Every spot earns points by category: a hypercar is worth far more than a hatchback, and modified cars earn a +25% tuning bonus. Post it and watch the likes roll in.",
  },
  {
    label: "Collect",
    title: "A garage that sorts itself.",
    body: "Spots land in your garage, grouped into brand albums. Complete each maker's collection, model by model.",
  },
  {
    label: "Map",
    title: "Every spot, on the map.",
    body: "See exactly where each car was caught. The community heat map shows where the scene is busiest — and which car meets are on near you.",
  },
  {
    label: "Compete",
    title: "Climb the world ranking.",
    body: "Daily quests, streaks and achievements keep the hunt going. Every point counts on the Top 50 worldwide.",
  },
];

const SCREENS = [CameraScreen, FeedScreen, GarageScreen, MapScreen, RankScreen];

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export default function PhoneStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneBoxRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [active, setActive] = useState(0);
  const [scale, setScale] = useState(0.8);
  const [inView, setInView] = useState(false);
  const viewRef = useInViewRef<HTMLDivElement>({ once: false, rootMargin: "0px", onChange: setInView });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const update = (p: number) => {
    const n = CHAPTERS.length;
    const idx = Math.min(n - 1, Math.floor(p * n));
    setActive((v) => (v === idx ? v : idx));
    barRefs.current.forEach((el, i) => {
      if (el) el.style.transform = `scaleX(${seg(p, i / n, (i + 1) / n)})`;
    });
  };
  useMotionValueEvent(scrollYProgress, "change", update);
  useEffect(() => update(scrollYProgress.get()), [scrollYProgress]);

  // Fit the phone to the viewport height.
  useEffect(() => {
    const el = phoneBoxRef.current;
    if (!el) return;
    const fit = () => {
      const h = el.clientHeight;
      setScale(Math.max(0.42, Math.min(0.92, h / PHONE_H)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} aria-labelledby="story-title" className="relative h-[520svh] bg-night">
      <div ref={viewRef} className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* soft light behind the phone */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_68%_55%,rgba(255,255,255,0.08),transparent_70%)] max-lg:bg-[radial-gradient(70%_40%_at_50%_42%,rgba(255,255,255,0.08),transparent_70%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 pb-6 pt-[4.75rem] sm:px-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-10 lg:pt-24">
          {/* copy */}
          <div className="max-lg:contents lg:order-1 lg:col-span-5 lg:flex lg:h-full lg:flex-col lg:justify-center">
            <h2 id="story-title" className="order-0 text-[1.625rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-snow sm:text-display-m lg:text-display-l">
              One shot.
              <br />
              <span className="text-smoke">The rest is automatic.</span>
            </h2>

            {/* story-style progress, one segment per chapter */}
            <div className="order-2 mt-5 flex gap-1.5 lg:mt-12" aria-hidden>
              {CHAPTERS.map((c, i) => (
                <span key={c.label} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-graphite">
                  <span
                    ref={(el) => {
                      barRefs.current[i] = el;
                    }}
                    className="absolute inset-0 origin-left scale-x-0 rounded-full bg-snow"
                  />
                </span>
              ))}
            </div>

            <div className="relative order-3 mt-4 min-h-[9.5rem] sm:min-h-[8.5rem] lg:mt-8 lg:min-h-[13rem]">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.title}
                  className={cn(
                    "absolute inset-x-0 top-0 transition-[opacity,transform,filter] duration-700 ease-out-expo",
                    i === active
                      ? "translate-y-0 opacity-100 blur-0"
                      : cn("pointer-events-none opacity-0 blur-[6px]", i < active ? "-translate-y-6" : "translate-y-6"),
                  )}
                >
                  <p className="text-sm font-semibold text-fog tabular">
                    {String(i + 1).padStart(2, "0")} · {c.label}
                  </p>
                  <h3 className="mt-2 text-display-s font-bold text-snow lg:text-display-m">{c.title}</h3>
                  <p className="mt-3 max-w-[38ch] text-[0.9375rem] font-medium leading-relaxed text-smoke sm:text-lg">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* phone */}
          <div ref={phoneBoxRef} className="relative order-1 mt-4 min-h-0 flex-1 lg:order-2 lg:col-span-7 lg:mt-0 lg:h-[calc(100svh-9rem)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Phone scale={scale} tone={active === 0 ? "light" : "dark"}>
                  {SCREENS.map((Screen, i) => (
                    <div
                      key={i}
                      aria-hidden={i !== active}
                      className={cn(
                        "absolute inset-0 transition-[transform,opacity] [transition-duration:800ms] ease-out-expo",
                        i === active ? "translate-x-0 opacity-100" : i < active ? "-translate-x-[30%] opacity-0" : "translate-x-full opacity-100",
                      )}
                    >
                      <Screen active={inView && i === active} />
                    </div>
                  ))}
                </Phone>
                <Satellites active={active} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small app cards floating around the phone, one pair per chapter (desktop). */
function Satellites({ active }: { active: number }) {
  const items: Array<{ chapter: number; className: string; node: ReactNode }> = [
    { chapter: 0, className: "right-[calc(100%-1rem)] top-[16%]", node: <Chip icon={<Search className="h-4 w-4" />} title="22,180 models" sub="searched in under 2 ms" /> },
    { chapter: 0, className: "left-[calc(100%-1rem)] top-[34%]", node: <Chip icon={<Target className="h-4 w-4" />} title="Make · model · version" sub="down to the exact trim" /> },
    { chapter: 1, className: "left-[calc(100%-1rem)] top-[14%]", node: <Chip icon={<Wrench className="h-4 w-4" />} title="+25% tuning bonus" sub="body kits, wheels, exhausts" accent /> },
    { chapter: 1, className: "right-[calc(100%-1rem)] bottom-[22%]", node: <RarityBars /> },
    { chapter: 2, className: "right-[calc(100%-1rem)] top-[24%]", node: <Chip icon={<Layers className="h-4 w-4" />} title="1,154 legends" sub="in the brand collection" /> },
    { chapter: 3, className: "left-[calc(100%-1rem)] top-[40%]", node: <Chip icon={<CalendarDays className="h-4 w-4" />} title="Car meets nearby" sub="see who's going" /> },
    { chapter: 4, className: "right-[calc(100%-1rem)] bottom-[20%]", node: <Chip icon={<Flame className="h-4 w-4 text-[#F26B1D]" />} title="12-day streak" sub="quests reset every day" /> },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden min-[1360px]:block">
      {items.map((it, i) => (
        <div
          key={i}
          className={cn(
            "absolute transition-[opacity,transform] duration-700 ease-out-expo",
            it.className,
            it.chapter === active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
          style={{ transitionDelay: it.chapter === active ? "350ms" : "0ms" }}
        >
          {it.node}
        </div>
      ))}
    </div>
  );
}

function Chip({ icon, title, sub, accent }: { icon: ReactNode; title: string; sub: string; accent?: boolean }) {
  return (
    <div className="flex w-max max-w-[14rem] items-center gap-2.5 rounded-2xl bg-snow py-2.5 pl-2.5 pr-4 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl", accent ? "bg-spotted text-snow" : "bg-mist text-ink")}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[0.875rem] font-bold leading-tight">{title}</span>
        <span className="block text-[0.75rem] font-medium leading-snug text-ash">{sub}</span>
      </span>
    </div>
  );
}

function RarityBars() {
  const bars = [
    { label: "Daily", h: 18 },
    { label: "Sport", h: 34 },
    { label: "Super", h: 58 },
    { label: "Hyper", h: 84 },
  ];
  return (
    <div className="w-[12rem] rounded-2xl bg-snow p-4 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
      <p className="text-[0.8125rem] font-bold">Points by category</p>
      <div className="mt-3 flex h-[5.5rem] items-end gap-2">
        {bars.map((b, i) => (
          <span key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={cn("w-full rounded-md", i === 3 ? "bg-ink" : "bg-line")} style={{ height: b.h }} />
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 text-[0.625rem] font-semibold text-ash">
        {bars.map((b) => (
          <span key={b.label} className="flex-1 text-center">
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
