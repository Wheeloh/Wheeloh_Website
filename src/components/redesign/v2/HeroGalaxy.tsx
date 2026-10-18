"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, ChevronRight, Search, X } from "lucide-react";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { SplitText, useIntroDone } from "@/components/redesign/shared/motion/reveal";
import Viewfinder, { type DetectPhase } from "./hero/Viewfinder";
import { PHOTO_TALL, PHOTO_WIDE, SENNA, TALL_QUERY } from "@/components/redesign/shared/phone/photos";
import { CATEGORY_LABELS, categoryCss, loadLabels, loadPoints, type CarLabel, type GalaxyLabels } from "./galaxy/data";
import type { GalaxyEngine } from "./galaxy/engine";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 4);

// Scroll choreography, as fractions of the pinned section.
const P = {
  copyOut: [0, 0.05],
  hudOut: [0, 0.035],
  expand: [0.025, 0.115],
  scan: [0.12, 0.2],
  assemble: [0.2, 0.44],
  count: [0.27, 0.42],
  tint: [0.47, 0.56],
  yaw: [0.44, 0.94],
  focus: [0.68, 0.8],
  explore: 0.86,
} as const;

const CAPTIONS: Array<{ range: [number, number]; title: string; body: string }> = [
  {
    range: [0.12, 0.25],
    title: "Every shot becomes a search.",
    body: "The moment you press the shutter, Wheeloh starts reading the car — and goes looking for it.",
  },
  {
    range: [0.27, 0.46],
    title: "22,180 models. 143 makers.",
    body: "This is the catalogue Wheeloh searches. Every dot is a real car, from daily hatchbacks to one-off hypercars.",
  },
  {
    range: [0.48, 0.67],
    title: "Placed by meaning.",
    body: "Similar cars sit side by side — supercars with supercars, estates with estates.",
  },
  {
    range: [0.69, 0.86],
    title: "Found: McLaren Senna.",
    body: "Matching a car against the entire catalogue takes under two milliseconds. Then the fun starts.",
  },
  {
    range: [0.87, 1.2],
    title: "Now find yours.",
    body: "Search the catalogue — try “Senna”, “911” or even “Miata”.",
  },
];

interface HeroGalaxyProps {
  latestUpdate?: { slug: string; title: string };
}

export default function HeroGalaxy({ latestUpdate }: HeroGalaxyProps) {
  const ready = useIntroDone();
  const prefersReduced = useReducedMotion();
  const reduced = useRef(false);
  reduced.current = !!prefersReduced;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const countRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const legendRef = useRef<HTMLUListElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const neighbourRefs = useRef<Array<SVGLineElement | null>>([]);
  const neighbourDotRefs = useRef<Array<SVGCircleElement | null>>([]);
  const neighbourListRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<GalaxyEngine | null>(null);
  const progress = useRef(0);
  const counted = useRef(false);
  const inView = useRef(true);
  const geometry = useRef({ slotX: 0, slotY: 0, slotW: 0, slotH: 0, W: 0, H: 0 });

  const [slotSize, setSlotSize] = useState({ w: 0, h: 0 });
  const [tall, setTall] = useState(false);
  const [phase, setPhase] = useState<DetectPhase>("idle");
  const [spots, setSpots] = useState(0);
  const [engineReady, setEngineReady] = useState(false);
  const [labels, setLabels] = useState<GalaxyLabels | null>(null);
  const [neighbours, setNeighbours] = useState<Array<{ i: number; label: CarLabel }>>([]);
  const [hover, setHover] = useState<{ i: number; label: CarLabel } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<number[]>([]);
  const [selected, setSelected] = useState<{ i: number; label: CarLabel } | null>(null);
  const [exploring, setExploring] = useState(false);
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected?.i ?? null;
  const neighboursRef = useRef(neighbours);
  neighboursRef.current = neighbours;
  const hoverRef = useRef(hover);
  hoverRef.current = hover;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // ---------------------------------------------------------------- layout
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const slot = slotRef.current;
    if (!stage || !slot) return;
    const s = stage.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    geometry.current = { slotX: r.left - s.left, slotY: r.top - s.top, slotW: r.width, slotH: r.height, W: s.width, H: s.height };
    setSlotSize((prev) => (prev.w === r.width && prev.h === r.height ? prev : { w: r.width, h: r.height }));
    setTall(window.matchMedia(TALL_QUERY).matches);
    engineRef.current?.resize();
    apply(progress.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsoLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    if (slotRef.current) ro.observe(slotRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // ------------------------------------------------------------ choreography
  const countUp = () => {
    const [models, makers] = countRefs.current;
    const set = (k: number) => {
      if (models) models.textContent = Math.round(22180 * k).toLocaleString("en-US");
      if (makers) makers.textContent = String(Math.round(143 * k));
    };
    if (reduced.current) return set(1);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 1800);
      set(t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      if (t < 1) requestAnimationFrame(tick);
    };
    set(0);
    requestAnimationFrame(tick);
  };

  const apply = useCallback((p: number) => {
    progress.current = p;
    const g = geometry.current;
    const rm = reduced.current;

    const copy = copyRef.current;
    if (copy) {
      const c = seg(p, P.copyOut[0], P.copyOut[1]);
      copy.style.opacity = String(1 - c);
      copy.style.transform = `translate3d(0, ${-c * 36}px, 0)`;
      copy.style.visibility = c >= 1 ? "hidden" : "visible";
    }

    const hud = hudRef.current;
    if (hud) {
      const h = seg(p, P.hudOut[0], P.hudOut[1]);
      hud.style.opacity = String(1 - h);
      hud.style.visibility = h >= 1 ? "hidden" : "visible";
      windowRef.current?.style.setProperty("--hud", String(1 - h));
    }

    const win = windowRef.current;
    if (win && g.W) {
      const e = rm ? 0 : inOut(seg(p, P.expand[0], P.expand[1]));
      win.style.left = `${g.slotX * (1 - e)}px`;
      win.style.top = `${g.slotY * (1 - e)}px`;
      win.style.width = `${g.slotW + (g.W - g.slotW) * e}px`;
      win.style.height = `${g.slotH + (g.H - g.slotH) * e}px`;
      win.style.borderRadius = `${(g.W < 640 ? 24 : 28) * (1 - e)}px`;
      const scan = seg(p, P.scan[0], P.scan[1]);
      win.style.setProperty("--scan", String(scan));
      const gone = rm ? seg(p, 0.06, 0.16) : scan >= 1 ? 1 : 0;
      win.style.opacity = String(1 - gone);
      win.style.visibility = gone >= 1 ? "hidden" : "visible";
      const line = scanRef.current;
      if (line) {
        line.style.top = `${(scan * 1.1 - 0.05) * 100}%`;
        line.style.opacity = !rm && scan > 0 && scan < 1 ? "1" : "0";
      }
    }

    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (canvas) canvas.style.opacity = rm ? String(seg(p, 0.1, 0.2)) : "1";
    if (engine) {
      engine.setState({
        scan: rm ? (p > 0.1 ? 1 : 0) : seg(p, P.scan[0], P.scan[1]),
        assemble: rm ? (p > 0.16 ? 1 : 0) : inOut(seg(p, P.assemble[0], P.assemble[1])),
        tint: seg(p, P.tint[0], P.tint[1]),
        yaw: rm ? 0 : inOut(seg(p, P.yaw[0], P.yaw[1])) * 0.8,
        focus: selectedRef.current !== null ? 1 : rm ? (p > P.focus[0] ? 1 : 0) : inOut(seg(p, P.focus[0], P.focus[1])) * (1 - 0.35 * seg(p, P.explore, 1)),
      });
      const active = inView.current && p > 0.08;
      if (active) engine.start();
      else engine.stop();
    }

    CAPTIONS.forEach((cap, i) => {
      const el = captionRefs.current[i];
      if (!el) return;
      const [a, b] = cap.range;
      const span = b - a;
      const fin = seg(p, a, a + span * 0.2);
      const fout = i === CAPTIONS.length - 1 ? 0 : seg(p, b - span * 0.18, b);
      const o = fin * (1 - fout);
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(1 - fin) * 28 - fout * 28}px, 0)`;
      el.style.visibility = o > 0.01 ? "visible" : "hidden";
    });

    if (p >= P.count[0] && !counted.current) {
      counted.current = true;
      countUp();
    }

    const legend = legendRef.current;
    if (legend) legend.style.setProperty("--tint", String(seg(p, P.tint[0], P.tint[1])));

    const exploringNow = p >= P.explore;
    setExploring((v) => (v === exploringNow ? v : exploringNow));
  }, []);

  useMotionValueEvent(scrollYProgress, "change", apply);
  useEffect(() => {
    apply(scrollYProgress.get());
  }, [apply, scrollYProgress, engineReady]);

  // Pause WebGL when the section is off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      apply(progress.current);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [apply]);

  // ------------------------------------------------------------- WebGL boot
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let booted = false;
    let engine: GalaxyEngine | null = null;
    const boot = async () => {
      if (booted) return;
      booted = true;
      window.removeEventListener("scroll", early);
      try {
        const [{ GalaxyEngine }, points] = await Promise.all([import("./galaxy/engine"), loadPoints()]);
        if (cancelled || !canvasRef.current) return;
        engine = new GalaxyEngine(canvasRef.current, { reduced: reduced.current });
        engine.setPoints(points, 10276);
        engineRef.current = engine;
        engine.onFrame = () => drawOverlays();
        setEngineReady(true);
      } catch (err) {
        console.warn("Galaxy disabled:", err);
      }
    };
    // Let the hero settle first; start right away if the visitor scrolls.
    const hasIdle = "requestIdleCallback" in window;
    const handle = hasIdle ? window.requestIdleCallback(() => boot(), { timeout: 1500 }) : window.setTimeout(boot, 600);
    function early() {
      if (progress.current > 0.005) boot();
    }
    window.addEventListener("scroll", early, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", early);
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      engine?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Feed the photo to the engine once both exist (and again on art-direction change).
  useEffect(() => {
    const engine = engineRef.current;
    const img = imgRef.current;
    if (!engineReady || !engine || !img) return;
    const photo = tall ? PHOTO_TALL : PHOTO_WIDE;
    const feed = () => engine.setPhoto({ img, objectPosition: photo.objectPosition, focusUV: photo.focusUV });
    if (img.complete && img.naturalWidth) feed();
    img.addEventListener("load", feed);
    return () => img.removeEventListener("load", feed);
  }, [engineReady, tall]);

  // Labels are only needed once the galaxy is on screen.
  useEffect(() => {
    if (!engineReady) return;
    let alive = true;
    const unsub = scrollYProgress.on("change", (p) => {
      if (p > 0.3) {
        unsub();
        loadLabels().then((l) => alive && setLabels(l)).catch(() => {});
      }
    });
    if (scrollYProgress.get() > 0.3) loadLabels().then((l) => alive && setLabels(l)).catch(() => {});
    return () => {
      alive = false;
      unsub();
    };
  }, [engineReady, scrollYProgress]);

  // Nearest neighbours of the Senna, shown when the camera lands on it.
  useEffect(() => {
    const engine = engineRef.current;
    if (!labels || !engine) return;
    const seen = new Set<string>([SENNA.name]);
    const list: Array<{ i: number; label: CarLabel }> = [];
    for (const i of engine.nearest(labels.senna, 40)) {
      const l = labels.label(i);
      const key = `${l.brand} ${l.version}`;
      if (seen.has(key) || i === labels.senna) continue;
      seen.add(key);
      list.push({ i, label: l });
      if (list.length === 4) break;
    }
    setNeighbours(list);
  }, [labels]);

  // ------------------------------------------------------- overlays per frame
  const drawOverlays = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const p = progress.current;
    const focusOn = selectedRef.current ?? 10276;
    const marker = markerRef.current;
    const show = selectedRef.current !== null ? 1 : seg(p, 0.72, 0.76);
    if (marker) {
      const pos = engine.project(focusOn);
      if (pos && show > 0) {
        marker.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        marker.style.opacity = String(show);
      } else marker.style.opacity = "0";
    }
    const nShow = selectedRef.current !== null ? 0 : seg(p, 0.76, 0.8) * (1 - seg(p, 0.9, 0.95));
    const anchor = engine.project(focusOn);
    const list = neighbourListRef.current;
    if (list) {
      list.style.opacity = String(anchor ? nShow : 0);
      if (anchor) list.style.transform = `translate3d(${anchor.x + 28}px, ${anchor.y + 26}px, 0)`;
    }
    neighbourRefs.current.forEach((line, k) => {
      const n = neighboursRef.current[k];
      if (!line || !n || !anchor) return;
      const pos = engine.project(n.i);
      const dot = neighbourDotRefs.current[k];
      if (!pos || nShow <= 0) {
        line.setAttribute("opacity", "0");
        dot?.setAttribute("opacity", "0");
        return;
      }
      // from the left edge of the k-th row to the neighbour's dot
      line.setAttribute("x1", String(anchor.x + 24));
      // list top (26) + caption row (26) + half a row (12)
      line.setAttribute("y1", String(anchor.y + 64 + k * 24));
      line.setAttribute("x2", String(pos.x));
      line.setAttribute("y2", String(pos.y));
      line.setAttribute("opacity", String(nShow * 0.55));
      if (dot) {
        dot.setAttribute("cx", String(pos.x));
        dot.setAttribute("cy", String(pos.y));
        dot.setAttribute("opacity", String(nShow));
      }
    });
    const tip = tooltipRef.current;
    if (tip && hoverRef.current) {
      const pos = engine.project(hoverRef.current.i);
      if (pos) tip.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    }
  };
  // --------------------------------------------------------------- pointer
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const engine = engineRef.current;
    const stage = stageRef.current;
    if (!engine || !stage) return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    engine.setPointer((x / r.width) * 2 - 1, (y / r.height) * 2 - 1);
    if (!labels || progress.current < 0.47 || e.pointerType !== "mouse") return;
    // No hover-picking through the search UI or other controls.
    if ((e.target as HTMLElement).closest("input, button, a, label, ul")) {
      if (hoverRef.current) setHover(null);
      return;
    }
    const i = engine.pick(x, y, 14);
    if (i < 0) {
      if (hoverRef.current) setHover(null);
      return;
    }
    if (hoverRef.current?.i !== i) setHover({ i, label: labels.label(i) });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || !labels || progress.current < 0.47) return;
    const engine = engineRef.current;
    const stage = stageRef.current;
    if (!engine || !stage) return;
    const r = stage.getBoundingClientRect();
    const i = engine.pick(e.clientX - r.left, e.clientY - r.top, 24);
    setHover(i >= 0 ? { i, label: labels.label(i) } : null);
  };

  // ------------------------------------------------------------------ search
  useEffect(() => {
    if (!labels) return;
    const q = query.trim();
    const t = window.setTimeout(() => setResults(q.length >= 2 ? labels.search(q, 6) : []), 90);
    return () => window.clearTimeout(t);
  }, [query, labels]);

  const pick = (i: number) => {
    const engine = engineRef.current;
    if (!labels || !engine) return;
    selectedRef.current = i;
    setSelected({ i, label: labels.label(i) });
    setResults([]);
    setHover(null);
    engine.setHighlight([i]);
    engine.setFocusIndex(i);
    apply(progress.current);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    const engine = engineRef.current;
    engine?.setHighlight(null);
    engine?.setFocusIndex(10276);
    selectedRef.current = null;
    apply(progress.current);
  };

  // --------------------------------------------------------------- detection
  const detectTimer = useRef(0);
  const runDetection = useCallback((duration: number) => {
    cancelAnimationFrame(detectTimer.current);
    if (reduced.current) {
      setPhase("done");
      return;
    }
    setPhase("detecting");
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const eased = k < 0.85 ? out(k / 0.85) * 0.93 : 0.93 + (k - 0.85) / 0.15 * 0.07;
      if (percentRef.current) percentRef.current.textContent = String(Math.round(eased * 100));
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (k < 1) detectTimer.current = requestAnimationFrame(tick);
      else window.setTimeout(() => setPhase("done"), 180);
    };
    detectTimer.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => runDetection(2000), 900);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(detectTimer.current);
    };
  }, [ready, runDetection]);

  const onShutter = () => {
    setSpots((s) => s + 1);
    runDetection(1200);
  };

  // ------------------------------------------------------------------ render
  return (
    <section ref={sectionRef} id="home" aria-label="Wheeloh, the car spotting app" className="relative h-[520svh] bg-night">
      {/* Anchor for "The catalogue" — the formed galaxy */}
      <div id="galaxy" aria-hidden className="pointer-events-none absolute inset-x-0 top-[38%] h-[30%]" />

      <div
        ref={stageRef}
        className="grain sticky top-0 h-[100svh] overflow-hidden"
        data-ready={ready || undefined}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerLeave={() => {
          engineRef.current?.setPointer(0, 0);
          setHover(null);
        }}
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
        {/* Soft floor so the galaxy never ends on a hard edge as the section scrolls away */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-night via-night/60 to-transparent" />

        {/* Hero layout: copy + the slot the viewfinder starts in */}
        <div className="pointer-events-none relative z-30 mx-auto flex h-full max-w-[1440px] flex-col px-3 pb-5 pt-[4.25rem] sm:px-6 sm:pt-[5.25rem] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:px-8 lg:pb-8 lg:pt-[5.5rem]">
          <div ref={slotRef} className="min-h-[13rem] flex-1 lg:order-2 lg:h-full" />
          <div
            ref={copyRef}
            data-in={ready || undefined}
            className="pointer-events-auto relative flex flex-col justify-end px-2 pt-5 sm:px-1 lg:order-1 lg:justify-center lg:pt-0"
          >
            {latestUpdate && (
              <Link
                href={`/changelog/${latestUpdate.slug}`}
                data-hero-item
                style={{ ["--d" as string]: 150 }}
                className="group mb-6 hidden w-fit max-w-full items-center gap-2 rounded-full bg-snow/10 py-1 pl-1 pr-3 text-[0.8125rem] font-semibold text-snow ring-1 ring-inset ring-snow/15 transition-colors hover:bg-snow/15 lg:inline-flex"
              >
                <span className="shrink-0 rounded-full bg-snow px-2 py-0.5 text-[0.6875rem] font-bold text-ink">New</span>
                <span className="min-w-0 truncate">{latestUpdate.title}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            )}
            <h1>
              <span data-hero-item style={{ ["--d" as string]: 200 }} className="block text-[0.9375rem] font-semibold text-smoke sm:text-lg">
                The car spotting app
              </span>
              <SplitText
                as="span"
                trigger="parent"
                text="Spot it before it’s gone."
                delay={250}
                className="mt-2 block text-[2.375rem] font-extrabold leading-[0.98] tracking-[-0.035em] max-sm:[@media(max-height:760px)]:text-[2rem] sm:text-display-l lg:mt-3 lg:text-display-xl"
              />
            </h1>
            <p
              data-hero-item
              style={{ ["--d" as string]: 650 }}
              className="mt-4 max-w-[34ch] text-[0.9375rem] font-medium leading-relaxed text-smoke max-sm:[@media(max-height:760px)]:mt-3 max-sm:[@media(max-height:760px)]:text-sm sm:text-lg lg:mt-6"
            >
              Point your camera at any car. Wheeloh identifies it in seconds, files it in your garage and turns every street into a leaderboard.
            </p>
            <div data-hero-item style={{ ["--d" as string]: 780 }} className="mt-5 lg:mt-8">
              <StoreButtons tone="light" campaign="hero" />
            </div>
            <p data-hero-item style={{ ["--d" as string]: 900 }} className="mt-5 hidden text-sm font-medium text-fog lg:block">
              Free · iOS &amp; Android · English &amp; French · 9 countries
            </p>
            <div
              data-hero-item
              style={{ ["--d" as string]: 1100 }}
              aria-hidden
              className="absolute bottom-0 left-1 hidden items-center gap-3 text-xs font-semibold text-fog lg:[@media(min-height:820px)]:flex"
            >
              <span className="relative block h-8 w-px overflow-hidden bg-graphite">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_2s_var(--ease-in-out-quart)_infinite] bg-snow" />
              </span>
              Scroll to scan
            </div>
          </div>
        </div>

        {/* The viewfinder window (its rect is driven by the scroll) */}
        <div
          ref={windowRef}
          className="absolute z-20 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_calc(var(--scan,0)*110%_-_10%),#000_calc(var(--scan,0)*110%))]"
          style={{ left: 0, top: 0, width: 0, height: 0 }}
        >
          <div className="hero-window absolute inset-0 bg-carbon">
            <Viewfinder
              ref={imgRef}
              size={slotSize}
              tall={tall}
              phase={phase}
              percentRef={percentRef}
              barRef={barRef}
              spots={spots}
              onShutter={onShutter}
              hudRef={hudRef}
            />
          </div>
        </div>
        <div
          ref={scanRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-20 h-px bg-snow opacity-0 shadow-[0_0_24px_6px_rgba(255,255,255,0.55)]"
        />

        {/* Galaxy captions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 mx-auto max-w-[1440px] px-5 pb-8 sm:px-8 lg:pb-14">
          <div className="relative">
            {CAPTIONS.map((cap, i) => (
              <div
                key={cap.title}
                ref={(el) => {
                  captionRefs.current[i] = el;
                }}
                className={cn("max-w-[30rem] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]", i === 0 ? "relative" : "absolute bottom-0 left-0")}
                style={{ opacity: 0, visibility: "hidden" }}
              >
                {i === 1 ? (
                  <h2 className="text-display-m font-extrabold text-snow">
                    <span ref={(el) => { countRefs.current[0] = el; }} className="tabular">22,180</span> models.{" "}
                    <span ref={(el) => { countRefs.current[1] = el; }} className="tabular">143</span> makers.
                  </h2>
                ) : (
                  <h3 className="text-display-m font-extrabold text-snow">{cap.title}</h3>
                )}
                <p className="mt-3 text-[0.9375rem] font-medium leading-relaxed text-smoke sm:text-base">{cap.body}</p>

                {i === 2 && (
                  <ul ref={legendRef} style={{ opacity: "var(--tint, 0)" }} className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-[0.8125rem] font-semibold text-snow/90 sm:flex sm:flex-wrap">
                    {CATEGORY_LABELS.map((c, k) => (
                      <li key={c.name} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: categoryCss(k), boxShadow: `0 0 10px ${categoryCss(k)}` }} />
                        {c.name}
                        <span className="tabular text-fog">{c.count.toLocaleString("en-US")}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {i === 4 && (
                  <div className={cn("relative mt-5 max-w-[26rem]", exploring ? "pointer-events-auto" : "pointer-events-none")}>
                    <label className="flex h-12 items-center gap-3 rounded-full bg-snow pl-4 pr-1.5 text-ink shadow-[0_10px_40px_-10px_rgba(255,255,255,0.35)] [text-shadow:none] focus-within:ring-2 focus-within:ring-snow/40">
                      <Search className="h-4 w-4 shrink-0 text-ash" aria-hidden />
                      <span className="sr-only">Search the Wheeloh catalogue</span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && results[0] !== undefined) pick(results[0]);
                          if (e.key === "Escape") clearSearch();
                        }}
                        placeholder={labels ? "Search 22,180 models" : "Loading the catalogue…"}
                        disabled={!labels}
                        className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] font-semibold outline-none placeholder:font-medium placeholder:text-ash"
                        tabIndex={exploring ? 0 : -1}
                      />
                      {(query || selected) && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          aria-label="Clear search"
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-ink transition-colors hover:bg-line"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                    </label>
                    {results.length > 0 && (
                      <ul aria-label="Matching cars" className="absolute bottom-full mb-2 w-full overflow-hidden rounded-3xl bg-snow p-1.5 text-ink shadow-2xl [text-shadow:none]">
                        {results.map((i) => {
                          const l = labels!.label(i);
                          return (
                            <li key={i}>
                              <button
                                type="button"
                                onClick={() => pick(i)}
                                className="flex w-full flex-col rounded-[1.1rem] px-3.5 py-2 text-left transition-colors hover:bg-mist focus-visible:bg-mist"
                              >
                                <span className="text-[0.75rem] font-semibold text-ash">{l.brand} · {l.model}</span>
                                <span className="text-[0.9375rem] font-bold">{l.version}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <Link
                      href="/engineering/semantic-car-search"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-snow underline-offset-4 hover:underline [text-shadow:none]"
                      tabIndex={exploring ? 0 : -1}
                    >
                      How our semantic car search works <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Focus marker (Senna, or the searched car) */}
        <div ref={markerRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-30" style={{ opacity: 0 }}>
          <span className="absolute -left-5 -top-5 h-10 w-10 rounded-full border border-snow/80" />
          <span className="absolute -left-5 -top-5 h-10 w-10 animate-ping-soft rounded-full border border-snow/60" />
          <span className="absolute left-7 top-[-0.9rem] whitespace-nowrap rounded-full bg-snow px-3 py-1.5 text-[0.8125rem] font-bold text-ink shadow-xl">
            {selected ? `${selected.label.brand} ${selected.label.version}` : SENNA.name}
          </span>
        </div>
        {/* Nearest neighbours of the focus car, linked to their dots */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-30 hidden h-full w-full sm:block">
          {neighbours.map((n, k) => (
            <g key={n.i}>
              <line
                ref={(el) => {
                  neighbourRefs.current[k] = el;
                }}
                stroke="white"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0"
              />
              <circle
                ref={(el) => {
                  neighbourDotRefs.current[k] = el;
                }}
                r="3.5"
                fill="white"
                opacity="0"
              />
            </g>
          ))}
        </svg>
        <div ref={neighbourListRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-30 hidden sm:block" style={{ opacity: 0 }}>
          <p className="mb-1 h-[22px] text-[0.6875rem] font-semibold leading-[22px] text-fog">Its neighbours on the map</p>
          {neighbours.map((n) => (
            <p key={n.i} className="h-6 whitespace-nowrap text-[0.8125rem] font-semibold leading-6 text-snow/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
              {n.label.brand} {n.label.version}
            </p>
          ))}
        </div>

        {/* Hover tooltip */}
        <div ref={tooltipRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-40">
          {hover && (
            <div className="-translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-2xl bg-snow px-3.5 py-2 text-ink shadow-2xl">
              <p className="text-[0.6875rem] font-semibold text-ash">{hover.label.brand} · {hover.label.model}</p>
              <p className="text-[0.875rem] font-bold">{hover.label.version}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
