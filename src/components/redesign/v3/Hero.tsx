"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { Reveal, SplitText, useInView } from "@/components/redesign/shared/motion/reveal";
import Phone, { PHONE_H } from "@/components/redesign/shared/phone/Phone";
import CameraScreen from "@/components/redesign/shared/phone/screens/CameraScreen";
import { useCopy } from "@/components/redesign/shared/Locale";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  en: {
    badge: "New",
    kicker: "The car spotting app",
    title: "Spot it before it’s gone.",
    body: "Point your camera at any car. Wheeloh identifies it in seconds, files it in your garage and turns every street into a leaderboard.",
    meta: "Free · iOS & Android · English & French · 9 countries",
    card: { kicker: "New spot", saved: "Saved to your garage" },
  },
  fr: {
    badge: "Nouveau",
    kicker: "L’app de carspotting",
    title: "Spotte-la avant qu’elle file.",
    body: "Vise n’importe quelle voiture. Wheeloh l’identifie en quelques secondes, la range dans ton garage et transforme chaque rue en classement.",
    meta: "Gratuit · iOS et Android · Français et anglais · 9 pays",
    card: { kicker: "Nouveau spot", saved: "Ajouté à ton garage" },
  },
};

interface HeroProps {
  latestUpdate?: { slug: string; title: string };
}

/**
 * The phone runs the real camera flow (detect → identify → spec sheet) in a
 * loop, and a "New spot" card pops out of it the moment the Senna is
 * identified. Mouse moves tilt the phone and shift the card; scrolling moves
 * them at different speeds. The page never stops scrolling for any of it.
 */
export default function Hero({ latestUpdate }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageEl = useRef<HTMLDivElement | null>(null);
  const [stageInView, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px" });
  const [scale, setScale] = useState(0.72);
  const [identified, setIdentified] = useState(false);
  const reduced = useReducedMotion();
  const k = reduced ? 0 : 1;
  const t = useCopy(COPY);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const yPhone = useTransform(scrollYProgress, [0, 1], [0, -40 * k]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -210 * k]);

  const setStage = useCallback(
    (el: HTMLDivElement | null) => {
      stageEl.current = el;
      stageInView(el);
    },
    [stageInView],
  );

  // Fit the phone to the stage height.
  useEffect(() => {
    const el = stageEl.current;
    if (!el) return;
    const fit = () => setScale(Math.max(0.5, Math.min(0.8, (el.clientHeight - 24) / PHONE_H)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    e.currentTarget.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const onLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  const onStep = useCallback((step: number) => {
    if (step >= 2) setIdentified(true);
  }, []);

  return (
    <section ref={sectionRef} id="home" className="relative overflow-hidden bg-snow pb-12 pt-24 sm:pt-28 lg:pb-20 lg:pt-32">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-6">
        <div className="min-w-0 lg:col-span-6 lg:pr-6 xl:col-span-5">
          {latestUpdate && (
            <Reveal variant="fade">
              <Link
                href={`/changelog/${latestUpdate.slug}`}
                className="group inline-flex max-w-full items-center gap-2 rounded-full bg-mist py-1 pl-1 pr-3 text-[0.8125rem] font-semibold text-ink ring-1 ring-inset ring-black/[0.05] transition-colors hover:bg-line"
              >
                <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[0.6875rem] font-bold text-snow">{t.badge}</span>
                <span className="min-w-0 truncate">{latestUpdate.title}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Reveal>
          )}
          <h1 className="mt-6">
            <Reveal as="span" delay={80} className="block text-base font-semibold text-ash sm:text-lg">
              {t.kicker}
            </Reveal>
            <SplitText
              as="span"
              text={t.title}
              delay={140}
              className="mt-3 block text-[2.625rem] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-display-l xl:text-display-xl"
            />
          </h1>
          <Reveal as="p" delay={480} className="mt-6 max-w-[36ch] text-lg font-medium leading-relaxed text-ash sm:text-xl">
            {t.body}
          </Reveal>
          <Reveal delay={600} className="mt-8">
            <StoreButtons tone="dark" campaign="hero" />
          </Reveal>
          <Reveal as="p" variant="fade" delay={760} className="mt-5 text-sm font-medium text-ash">
            {t.meta}
          </Reveal>
        </div>

        <div
          ref={setStage}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="relative min-w-0 h-[32rem] sm:h-[38rem] lg:col-span-6 lg:h-[min(46rem,calc(100svh-9rem))] lg:min-h-[34rem] xl:col-span-7 [perspective:1600px]"
          style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div style={{ y: yPhone }}>
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 1.2, ease: EASE, delay: 0.2 }}
              >
                <div className="hover-float">
                  <div
                    className="transition-transform duration-700 ease-out [transform-style:preserve-3d]"
                    style={{ transform: "rotateX(calc(var(--my) * -4deg)) rotateY(calc(var(--mx) * 6deg))" }}
                  >
                    <Phone scale={scale} tone="light">
                      <CameraScreen active={inView} loop onStep={onStep} priority />
                    </Phone>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <Floating
            y={yC}
            show={identified}
            fromPhone
            depth={18}
            floatDelay="-0.6s"
            className="bottom-[4%] left-3 sm:left-[8%] xl:left-[6%]"
          >
            <NewSpotCard />
          </Floating>
        </div>
      </div>
    </section>
  );
}

interface FloatingProps {
  y: MotionValue<number>;
  delay?: number;
  show?: boolean;
  fromPhone?: boolean;
  depth?: number;
  floatDelay?: string;
  className?: string;
  children: ReactNode;
}

function Floating({ y, delay = 0, show = true, fromPhone = false, depth = 10, floatDelay = "0s", className, children }: FloatingProps) {
  const reduced = useReducedMotion();
  const hidden = fromPhone ? { opacity: 0, x: 140, y: -80, scale: 0.6 } : { opacity: 0, y: 40, scale: 0.92 };
  return (
    <motion.div style={{ y }} className={cn("absolute z-20", className)}>
      <motion.div
        initial={hidden}
        animate={show ? { opacity: 1, x: 0, y: 0, scale: 1 } : hidden}
        transition={reduced ? { duration: 0 } : { duration: 1, ease: EASE, delay }}
      >
        <div className="hover-float" style={{ ["--float-delay" as string]: floatDelay }}>
          <div
            className="transition-transform duration-700 ease-out"
            style={{ transform: `translate(calc(var(--mx) * ${depth}px), calc(var(--my) * ${Math.round(depth * 0.7)}px))` }}
          >
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewSpotCard() {
  const t = useCopy(COPY).card;
  return (
    <div className="flex w-[14rem] items-center gap-3 rounded-[1.25rem] bg-ink p-2 pr-4 text-snow shadow-[0_30px_60px_-24px_rgba(0,0,0,0.5)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/senna-square-sm.jpg" alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-[0.9rem] object-cover object-[50%_65%]" />
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[0.6875rem] font-bold text-spotted">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> {t.kicker}
        </p>
        <p className="truncate text-[0.9375rem] font-bold leading-tight">McLaren Senna</p>
        <p className="text-[0.75rem] font-medium text-snow/60">{t.saved}</p>
      </div>
    </div>
  );
}
