"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CalendarDays, Check, Flame, Images, MapPin, Newspaper, Send, ShieldCheck, Users, X } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { Reveal, SplitText, useInView } from "@/components/redesign/shared/motion/reveal";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Loops through `n` states every `ms` while visible. */
function useLoop(active: boolean, n: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setI(n - 1);
      return;
    }
    const t = window.setInterval(() => setI((v) => (v + 1) % n), ms);
    return () => window.clearInterval(t);
  }, [active, n, ms]);
  return i;
}

interface PanelProps {
  title: string;
  body: string;
  icon: ReactNode;
  children: (active: boolean) => ReactNode;
}

function Panel({ title, body, icon, children }: PanelProps) {
  const [ref, inView] = useInView<HTMLLIElement>({ once: false, rootMargin: "0px -5% 0px -5%" });
  return (
    <li
      ref={ref}
      className="flex w-[82vw] max-w-[24rem] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] bg-carbon ring-1 ring-inset ring-snow/[0.06] sm:w-[23rem] lg:w-[25rem] lg:max-w-none"
    >
      <div className="relative h-[17.5rem] overflow-hidden sm:h-[19rem]">{children(inView)}</div>
      <div className="flex flex-1 flex-col px-6 pb-7 pt-5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-snow/[0.07] text-smoke">{icon}</span>
        <h3 className="mt-4 text-display-s font-bold text-snow">{title}</h3>
        <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-smoke">{body}</p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------- mini UIs

function CommunityUI({ active }: { active: boolean }) {
  const joined = useLoop(active, 2, 2200) === 1;
  return (
    <div className="absolute inset-0 p-5">
      <div className="overflow-hidden rounded-3xl bg-snow text-ink">
        <div className="relative h-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/porsche-gt3rs-sm.jpg" alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute -bottom-6 left-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink ring-4 ring-snow">
            <FlagMark className="w-8 text-snow" />
          </span>
        </div>
        <div className="px-4 pb-4 pt-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold leading-tight">Paris Spotter</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ash">
                <Users className="h-3.5 w-3.5" aria-hidden /> Community · Public
              </p>
            </div>
            <span
              className={cn(
                "flex h-9 items-center gap-1 rounded-full px-4 text-sm font-bold transition-colors duration-500",
                joined ? "bg-spotted text-snow" : "bg-ink text-snow",
              )}
            >
              {joined && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
              {joined ? "Joined" : "Join"}
            </span>
          </div>
          <div className="mt-4 flex gap-2 text-[0.75rem] font-bold">
            {["News", "Polls", "Albums", "Meets"].map((t, i) => (
              <span key={t} className={cn("rounded-full px-3 py-1.5", i === 0 ? "bg-ink text-snow" : "bg-mist text-ink")}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const FEED = {
  Public: [
    { name: "McLaren Senna", who: "Sylvain", src: "/media/senna-square-sm.jpg", pts: "2,212" },
    { name: "Porsche 911 GT3 RS", who: "Inès", src: "/media/porsche-gt3rs-sm.jpg", pts: "1,420" },
  ],
  Private: [
    { name: "McLaren 675LT", who: "Theo", src: "/media/mclaren-675lt-sm.jpg", pts: "1,856" },
    { name: "Bugatti Veyron", who: "Louis", src: "/presentation/PC_albums_trie/BUGATTI_Album.png", pts: "2,480" },
  ],
};

function FeedsUI({ active }: { active: boolean }) {
  const tab = useLoop(active, 2, 2600) === 0 ? "Public" : "Private";
  return (
    <div className="absolute inset-0 flex flex-col items-center p-5">
      <div className="relative flex h-11 rounded-full bg-snow p-1 text-sm font-semibold text-ink">
        {(["Public", "Private"] as const).map((t) => (
          <span key={t} className="relative z-10 flex items-center px-5">
            {tab === t && (
              <motion.span layoutId="feeds-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 34 }} />
            )}
            <span className={cn("transition-colors duration-300", tab === t ? "text-snow" : "text-ash")}>{t}</span>
          </span>
        ))}
      </div>
      <div className="relative mt-4 w-full flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === "Private" ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === "Private" ? -40 : 40 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0 space-y-2.5"
          >
            {FEED[tab].map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-2xl bg-snow/[0.06] p-2.5 ring-1 ring-inset ring-snow/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.9375rem] font-bold text-snow">{p.name}</p>
                  <p className="text-[0.8125rem] font-medium text-fog">
                    by {p.who} · <span className="tabular">{p.pts} pts</span>
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MeetUI({ active }: { active: boolean }) {
  const going = useLoop(active, 2, 2400) === 1;
  return (
    <div className="absolute inset-0 grid place-items-center p-5">
      <div className="w-full rounded-3xl bg-snow p-4 text-ink">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-12 flex-col items-center justify-center rounded-xl bg-ink text-snow">
            <span className="text-[0.625rem] font-bold uppercase text-snow/70">Sun</span>
            <span className="text-xl font-bold leading-none">14</span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">Sunday morning meet</p>
            <p className="flex items-center gap-1 text-[0.8125rem] font-semibold text-ash">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Place d’Armes, Versailles
            </p>
          </div>
        </div>
        <svg viewBox="0 0 300 90" className="mt-4 h-[5.5rem] w-full rounded-2xl bg-mist" aria-hidden>
          <path d="M-10 70 C60 40 120 80 180 50 S280 20 320 40" stroke="#9DB2C9" strokeWidth="9" fill="none" />
          <path d="M40 -10 L80 100 M190 -10 L210 100" stroke="#fff" strokeWidth="6" fill="none" />
          <circle cx="150" cy="52" r="14" className="fill-alert/20" />
          <circle cx="150" cy="52" r="6" className="fill-alert" />
        </svg>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ash">
            <span className="flex -space-x-2">
              {["/media/senna-square-sm.jpg", "/media/mclaren-675lt-sm.jpg", "/media/porsche-gt3rs-sm.jpg"].map((s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={s} src={s} alt="" loading="lazy" className="h-7 w-7 rounded-full object-cover ring-2 ring-snow" />
              ))}
            </span>
            <span className="tabular">{going ? 19 : 18} going</span>
          </span>
          <span
            className={cn(
              "flex h-9 items-center gap-1 rounded-full px-4 text-sm font-bold text-snow transition-colors duration-500",
              going ? "bg-spotted" : "bg-ink",
            )}
          >
            {going && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
            {going ? "Going" : "I’m going"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChatUI({ active }: { active: boolean }) {
  const step = useLoop(active, 5, 1100);
  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-2 p-5 text-[0.875rem] font-medium">
      <Bubble show={step >= 0} side="left">Senna on Quai Branly right now</Bubble>
      <Bubble show={step >= 1} side="right">No way. Where exactly?</Bubble>
      <Bubble show={step >= 2} side="left" bare>
        <span className="flex items-center gap-3 rounded-2xl bg-snow p-2 pr-4 text-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/senna-square-sm.jpg" alt="" loading="lazy" className="h-12 w-12 rounded-xl object-cover" />
          <span>
            <span className="block text-[0.8125rem] font-bold">McLaren Senna</span>
            <span className="block text-[0.75rem] font-semibold text-ash">Spot · 2,212 pts</span>
          </span>
        </span>
      </Bubble>
      <div className="flex h-8 items-center">
        <AnimatePresence>
          {step >= 3 && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="ml-auto flex gap-1 rounded-full bg-snow/10 px-3 py-2"
            >
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-blink rounded-full bg-snow" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-snow/[0.08] py-1.5 pl-4 pr-1.5 text-fog">
        <span className="flex-1 text-[0.8125rem]">Message…</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-snow text-ink">
          <Send className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

function Bubble({ show, side, bare, children }: { show: boolean; side: "left" | "right"; bare?: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10, scale: show ? 1 : 0.96 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn(side === "right" ? "ml-auto" : "mr-auto", "max-w-[85%] origin-bottom")}
    >
      {bare ? (
        children
      ) : (
        <span className={cn("block rounded-[1.25rem] px-4 py-2.5", side === "right" ? "rounded-br-md bg-snow text-ink" : "rounded-bl-md bg-snow/10 text-snow")}>
          {children}
        </span>
      )}
    </motion.div>
  );
}

function StoryUI({ active }: { active: boolean }) {
  const shared = useLoop(active, 2, 2600) === 1;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4 p-5">
      <div
        className={cn(
          "relative h-[15rem] w-[8.5rem] overflow-hidden rounded-[1.25rem] bg-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-snow/10 transition-transform duration-700 ease-out-expo sm:h-[16rem] sm:w-[9rem]",
          shared ? "-rotate-3 scale-[1.03]" : "rotate-0",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/mclaren-675lt-sm.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[60%_50%]" />
        <span className="absolute inset-x-2 top-2 flex gap-1">
          <span className="h-0.5 flex-1 rounded-full bg-snow" />
          <span className="h-0.5 flex-1 rounded-full bg-snow/40" />
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <span className="block text-[0.75rem] font-bold text-snow">McLaren 675LT</span>
          <span className="mt-0.5 block text-[0.625rem] font-semibold text-snow/70">1,856 pts · New York</span>
          <span className="mt-2 flex items-center gap-1 rounded-full bg-snow px-2 py-1 text-[0.5625rem] font-bold text-ink">
            <FlagMark className="w-3 text-ink" /> Spotted on Wheeloh
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-2 text-[0.8125rem] font-bold">
        <span
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2.5 transition-colors duration-500",
            shared ? "bg-spotted text-snow" : "bg-snow text-ink",
          )}
        >
          {shared ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {shared ? "Shared" : "Share to story"}
        </span>
        <span className="rounded-full bg-snow/10 px-4 py-2.5 text-snow/80">Save image</span>
      </div>
    </div>
  );
}

function QuestsUI({ active }: { active: boolean }) {
  const tick = useLoop(active, 3, 1600);
  const quests = [
    { label: "Spot 3 Italian cars", done: 2 + (tick >= 1 ? 1 : 0), of: 3 },
    { label: "Spot a car at a meet", done: 1, of: 1 },
    { label: "Share a story", done: tick >= 2 ? 1 : 0, of: 1 },
  ];
  return (
    <div className="absolute inset-0 p-5">
      <div className="flex items-center justify-between rounded-2xl bg-snow px-4 py-3 text-ink">
        <span className="flex items-center gap-2 text-base font-bold">
          <Flame className="h-5 w-5 text-[#F26B1D]" fill="#F26B1D" aria-hidden /> 12-day streak
        </span>
        <span className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={cn("h-2 w-2 rounded-full", i < 6 || tick >= 1 ? "bg-[#F26B1D]" : "bg-line")} />
          ))}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {quests.map((q) => {
          const done = q.done >= q.of;
          return (
            <li key={q.label} className="rounded-2xl bg-snow/[0.06] px-4 py-3 ring-1 ring-inset ring-snow/[0.06]">
              <div className="flex items-center justify-between text-[0.875rem] font-semibold text-snow">
                <span className="flex items-center gap-2">
                  <span className={cn("grid h-5 w-5 place-items-center rounded-full transition-colors duration-500", done ? "bg-spotted" : "bg-snow/15")}>
                    {done && <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />}
                  </span>
                  {q.label}
                </span>
                <span className="tabular text-fog">
                  {Math.min(q.done, q.of)}/{q.of}
                </span>
              </div>
              <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-snow/10">
                <span className="block h-full rounded-full bg-spotted transition-[width] duration-700 ease-out-expo" style={{ width: `${(Math.min(q.done, q.of) / q.of) * 100}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const ROLL = [
  { src: "/presentation/PC_albums_trie/PORSCHE_Album.png", ok: true },
  { src: "/media/senna-square-sm.jpg", ok: true },
  { src: null, ok: false },
  { src: "/presentation/PC_albums_trie/FERRARI_Album.png", ok: true },
  { src: "/presentation/PC_albums_trie/LAMBO_Album.png", ok: true },
  { src: "/media/mclaren-675lt-sm.jpg", ok: true },
];

function SyncUI({ active }: { active: boolean }) {
  const pass = useLoop(active, 2, 3200);
  const [scanned, setScanned] = useState(0);
  useEffect(() => {
    if (!active) return;
    setScanned(0);
    const ts = ROLL.map((_, i) => window.setTimeout(() => setScanned(i + 1), 450 + i * 330));
    return () => ts.forEach(window.clearTimeout);
  }, [active, pass]);
  return (
    <div className="absolute inset-0 p-5">
      <div className="grid grid-cols-3 gap-2">
        {ROLL.map((r, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-graphite">
            {r.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full flex-col justify-between bg-snow p-2 text-ink">
                <span className="h-1.5 w-10 rounded-full bg-line" />
                <span className="h-1.5 w-14 rounded-full bg-line" />
                <span className="h-6 rounded-md bg-mist" />
                <span className="text-[0.5625rem] font-bold text-ash">Screenshot</span>
              </span>
            )}
            <AnimatePresence>
              {scanned > i && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={cn(
                    "absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-snow ring-2 ring-carbon",
                    r.ok ? "bg-spotted" : "bg-alert",
                  )}
                >
                  {r.ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                </motion.span>
              )}
            </AnimatePresence>
            {scanned === i && <span className="sync-scan absolute inset-x-0 top-0 h-full" />}
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-smoke">
        <ShieldCheck className="h-4 w-4 text-spotted" aria-hidden />
        <span className="tabular">{ROLL.slice(0, scanned).filter((r) => r.ok).length}</span> cars found ·{" "}
        <span className="tabular">{ROLL.slice(0, scanned).filter((r) => !r.ok).length}</span> screenshot skipped
      </p>
    </div>
  );
}

function NewsUI() {
  return (
    <div className="absolute inset-0 p-5">
      <div className="overflow-hidden rounded-3xl bg-snow text-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/porsche-gt3rs-sm.jpg" alt="" loading="lazy" className="h-36 w-full object-cover" />
        <div className="p-4">
          <p className="text-[1.0625rem] font-bold leading-snug">A Porsche 911 GT3 RS turns heads in Paris with an explosive livery</p>
          <p className="mt-2 flex items-center justify-between text-[0.75rem] font-semibold text-ash">
            <span>By Wheeloh News</span>
            <span>1 hour ago</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const PANELS: PanelProps[] = [
  {
    title: "Start a community.",
    body: "Car club, school crew or one-marque fan page — publish news, polls, posts and albums for everyone.",
    icon: <Users className="h-4 w-4" aria-hidden />,
    children: (a) => <CommunityUI active={a} />,
  },
  {
    title: "Two feeds, zero noise.",
    body: "Private shows your friends and clubs, in order. Public surfaces the best spots from everyone.",
    icon: <Images className="h-4 w-4" aria-hidden />,
    children: (a) => <FeedsUI active={a} />,
  },
  {
    title: "Find the meets.",
    body: "Discover car meets near you, say you’re going and see who else will be there.",
    icon: <CalendarDays className="h-4 w-4" aria-hidden />,
    children: (a) => <MeetUI active={a} />,
  },
  {
    title: "Chat about it.",
    body: "Message friends one-to-one or in groups, and drop spots straight into the conversation.",
    icon: <Send className="h-4 w-4" aria-hidden />,
    children: (a) => <ChatUI active={a} />,
  },
  {
    title: "Made for Stories.",
    body: "Turn any spot into a polished Instagram story in a single tap.",
    icon: <Images className="h-4 w-4" aria-hidden />,
    children: (a) => <StoryUI active={a} />,
  },
  {
    title: "Quests that keep you hunting.",
    body: "Daily challenges, streaks and achievements turn every drive into a hunt.",
    icon: <Flame className="h-4 w-4" aria-hidden />,
    children: (a) => <QuestsUI active={a} />,
  },
  {
    title: "Import years of spots.",
    body: "Scan your camera roll in one tap. Only genuine camera shots count — screenshots and downloads are filtered out.",
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    children: (a) => <SyncUI active={a} />,
  },
  {
    title: "The car world, daily.",
    body: "Automotive news from the Wheeloh team, right next to your spots.",
    icon: <Newspaper className="h-4 w-4" aria-hidden />,
    children: () => <NewsUI />,
  },
];

export default function Community() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Desktop: vertical scroll drives the horizontal track. Mobile: native swipe.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const measure = () => {
      setPinned(mq.matches);
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (trackRef.current) trackRef.current.style.transform = pinned ? `translate3d(${-p * distance}px, 0, 0)` : "";
  });
  useEffect(() => {
    if (trackRef.current) trackRef.current.style.transform = pinned ? `translate3d(${-scrollYProgress.get() * distance}px, 0, 0)` : "";
  }, [pinned, distance, scrollYProgress]);

  return (
    <section
      id="community"
      ref={sectionRef}
      aria-labelledby="community-title"
      className="grain relative bg-night"
      style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={cn("flex flex-col overflow-hidden py-20 sm:py-28", pinned && "sticky top-0 h-[100svh] justify-center py-0")}>
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <h2 id="community-title" className="text-display-l font-extrabold text-snow lg:col-span-7">
              <SplitText text={"Built for the scene,\nnot just the camera."} lineClassNames={["", "text-smoke"]} />
            </h2>
            <Reveal as="p" delay={150} className="max-w-[42ch] text-lg font-medium leading-relaxed text-smoke lg:col-span-5 lg:pb-2">
              Wheeloh is where spotters meet, chat, compete and show off. Here’s what happens after the shot.
            </Reveal>
          </div>
        </div>
        <ul
          ref={trackRef}
          className={cn(
            "mt-10 flex gap-4 px-5 sm:px-8 lg:mt-14 lg:gap-5",
            pinned ? "w-max will-change-transform lg:px-[max(2rem,calc((100vw-1440px)/2+2rem))]" : "no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-px-5",
          )}
        >
          {PANELS.map((p) => (
            <Panel key={p.title} {...p} />
          ))}
        </ul>
      </div>
    </section>
  );
}
