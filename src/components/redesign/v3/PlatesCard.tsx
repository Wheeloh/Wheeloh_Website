"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Palette, Trash2 } from "lucide-react";
import { useInView } from "@/components/redesign/shared/motion/reveal";
import { cn } from "@/lib/utils";
import { PLATE_DEMOS, PLATE_PHOTO, type PlateDemo } from "./plates";

// The app's publish page (direction B): the photo on black, then the white
// sheet and its plate row. Strings, sizes and timings are the app's own
// (postCreation i18n, plate_mask_status_row.dart, plate_reveal_timing.dart).
type Phase = "searching" | "masking" | "masked";

const SEARCH_MS = 900; // "Looking for plates…" before the box is known
const RENDER_MS = 1200; // glow on the plate while the engine renders (shortened)
const GLOW_OUT_DELAY = 250; // kPlateGlowOutDelay
const HOLD_MS = 3800; // the result, before the next photo

export default function PlatesCard({ className }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -15% 0px" });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("searching");
  const [glow, setGlow] = useState<"off" | "on" | "fading">("off");
  const [shown, setShown] = useState(false);
  const [manual, setManual] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = photoRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Back to the automatic loop whenever the card leaves the screen.
  useEffect(() => {
    if (!inView) {
      setManual(false);
      setShown(false);
    }
  }, [inView]);

  useEffect(() => {
    if (!inView || manual) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("masked");
      setGlow("off");
      return;
    }
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const play = () => {
      setPhase("searching");
      setGlow("off");
      at(SEARCH_MS, () => {
        setPhase("masking");
        setGlow("on");
      });
      at(SEARCH_MS + RENDER_MS, () => setPhase("masked"));
      at(SEARCH_MS + RENDER_MS + GLOW_OUT_DELAY, () => setGlow("fading"));
      at(SEARCH_MS + RENDER_MS + HOLD_MS, () => {
        setIndex((i) => (i + 1) % PLATE_DEMOS.length);
        play();
      });
    };
    play();
    return () => timers.forEach(window.clearTimeout);
  }, [inView, manual]);

  const toggle = () => {
    setManual(true);
    setPhase("masked");
    setGlow("off");
    setShown((v) => !v);
  };

  const demo = PLATE_DEMOS[index];
  const masked = phase === "masked" && !shown;

  return (
    <div ref={ref} className={cn("flex min-h-[25rem] flex-col overflow-hidden rounded-[1.5rem] bg-black", className)}>
      {/* photo, nothing on it but the round buttons */}
      <div ref={photoRef} className="relative min-h-[16rem] flex-1">
        {PLATE_DEMOS.map((d, i) => (
          <Photo key={d.id} demo={d} size={size} active={i === index} masked={i === index && masked} glow={i === index ? glow : "off"} />
        ))}
        <div aria-hidden className="absolute inset-x-3 top-3 flex justify-between text-snow">
          <Round>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          </Round>
          <span className="flex gap-2">
            <Round>
              <Palette className="h-4 w-4" strokeWidth={1.8} />
            </Round>
            <Round>
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            </Round>
          </span>
        </div>
        {/* progress line along the photo's bottom edge while the analysis runs */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-snow/15">
          <span
            className={cn(
              "block h-full origin-left bg-snow transition-[transform,opacity] ease-out",
              phase === "searching" && "scale-x-[0.35] opacity-100 [transition-duration:900ms]",
              phase === "masking" && "scale-x-[0.85] opacity-100 [transition-duration:1200ms]",
              phase === "masked" && "scale-x-100 opacity-0 duration-500",
            )}
          />
        </span>
      </div>

      {/* the white sheet */}
      <div className="rounded-t-[1.25rem] bg-snow px-3 pb-3 pt-2">
        <span aria-hidden className="mx-auto mb-2.5 block h-1 w-9 rounded-full bg-[#DADADA]" />
        <PlateRow phase={phase} shown={shown} demo={demo} onToggle={toggle} />
      </div>
    </div>
  );
}

function Round({ children }: { children: React.ReactNode }) {
  return <span className="grid h-8 w-8 place-items-center rounded-full bg-black/35 backdrop-blur-sm">{children}</span>;
}

/** Cover-fit maths: where the plate box sits in the photo element. */
function plateRect(demo: PlateDemo, w: number, h: number) {
  const [bx, by, bw, bh] = demo.box;
  const px = bx + bw / 2;
  const py = by + bh / 2;
  const scale = Math.max(w / PLATE_PHOTO.width, h / PLATE_PHOTO.height);
  const dw = PLATE_PHOTO.width * scale;
  const dh = PLATE_PHOTO.height * scale;
  const ox = (w - dw) * px;
  const oy = (h - dh) * py;
  return { position: `${px * 100}% ${py * 100}%`, left: ox + bx * dw, top: oy + by * dh, width: bw * dw, height: bh * dh };
}

function Photo({
  demo,
  size,
  active,
  masked,
  glow,
}: {
  demo: PlateDemo;
  size: { w: number; h: number };
  active: boolean;
  masked: boolean;
  glow: "off" | "on" | "fading";
}) {
  const r = plateRect(demo, size.w, size.h);
  // The app's glow geometry (plateGlowGeometry): margin max(2.5, 0.22 h),
  // at least 22 × 11, radius min(h / 2, max(3, 0.26 h)).
  const pad = Math.max(2.5, r.height * 0.22);
  let gw = r.width + pad * 2;
  let gh = r.height + pad * 2;
  let gx = r.left - pad;
  let gy = r.top - pad;
  if (gw < 22) {
    gx -= (22 - gw) / 2;
    gw = 22;
  }
  if (gh < 11) {
    gy -= (11 - gh) / 2;
    gh = 11;
  }
  const radius = Math.min(gh / 2, Math.max(3, gh * 0.26));
  const img = "absolute inset-0 h-full w-full object-cover";

  return (
    <div className={cn("absolute inset-0 transition-opacity duration-500", active ? "opacity-100" : "opacity-0")} aria-hidden={!active}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/media/plates/${demo.id}-before.jpg`}
        alt={`${demo.car}, before masking`}
        width={PLATE_PHOTO.width}
        height={PLATE_PHOTO.height}
        loading="lazy"
        decoding="async"
        className={img}
        style={{ objectPosition: r.position }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/media/plates/${demo.id}-after.jpg`}
        alt={`${demo.car}, its plate erased by Wheeloh`}
        width={PLATE_PHOTO.width}
        height={PLATE_PHOTO.height}
        loading="lazy"
        decoding="async"
        className={cn(img, "transition-opacity duration-200 ease-linear", masked ? "opacity-100" : "opacity-0")}
        style={{ objectPosition: r.position }}
      />
      {size.w > 0 && (
        <span
          aria-hidden
          className={cn("plate-glow", glow === "on" && "is-on", glow === "fading" && "is-fading")}
          style={{ left: gx, top: gy, width: gw, height: gh, ["--r" as string]: `${radius}px` }}
        >
          <span className="ombre" />
          <span className="halo">
            <span className="anneau" />
          </span>
          <span className="lisere" />
          <span className="anneau" />
        </span>
      )}
    </div>
  );
}

/** `.clair .ligne-plaque`: the grey row of the white sheet. */
function PlateRow({ phase, shown, demo, onToggle }: { phase: Phase; shown: boolean; demo: PlateDemo; onToggle: () => void }) {
  return (
    <div
      className="flex h-12 items-center gap-2.5 rounded-[14px] bg-[#F3F3F3] px-3 text-[13px] font-semibold leading-tight text-black"
      aria-live="polite"
    >
      <span className="grid w-[18px] shrink-0 place-items-center">
        {phase === "searching" && <PlateGlyph />}
        {phase === "masking" && <span className="plate-dot h-2 w-2 rounded-full bg-black" />}
        {phase === "masked" &&
          (shown ? <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden /> : <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />)}
      </span>
      <span className={cn("min-w-0 flex-1 truncate", phase === "searching" && "font-medium text-[#6B6B6B]")}>
        {phase === "searching" ? "Looking for plates…" : phase === "masking" ? "Masking the plate…" : shown ? "Plate visible" : "Plate hidden"}
      </span>
      {phase === "masked" && (
        <>
          {/* the plate's vignette, 14 px high */}
          <span
            aria-hidden
            className="block h-[14px] shrink-0 rounded-[2px] bg-cover bg-center shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
            style={{ width: 14 * demo.aspect, backgroundImage: `url(/media/plates/${demo.id}-plate-${shown ? "before" : "after"}.jpg)` }}
          />
          <button
            type="button"
            onClick={onToggle}
            className="-mr-1 flex h-11 min-w-11 items-center justify-center px-1 underline decoration-black/45 decoration-1 underline-offset-2"
          >
            {shown ? "Hide" : "Show"}
          </button>
        </>
      )}
    </div>
  );
}

/** The app's plate pictogram: a rounded rectangle and two strokes (18 px). */
function PlateGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="#6B6B6B" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
      <rect x="2.8" y="7.3" width="18.4" height="9.4" rx="2" />
      <path d="M6.6 12h2.6M11 12h6.4" />
    </svg>
  );
}
