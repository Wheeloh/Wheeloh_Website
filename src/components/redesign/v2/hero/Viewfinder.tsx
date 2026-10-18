"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PHOTO_TALL, PHOTO_WIDE, SENNA, coverBox } from "@/components/redesign/shared/phone/photos";

export type DetectPhase = "idle" | "detecting" | "done";

const ZOOMS = [
  { id: 0.5, label: ".5×", scale: 0.9 },
  { id: 1, label: "1×", scale: 1.03 },
  { id: 2, label: "2×", scale: 1.45 },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

interface ViewfinderProps {
  size: { w: number; h: number };
  tall: boolean;
  phase: DetectPhase;
  percentRef: React.RefObject<HTMLSpanElement>;
  barRef: React.RefObject<HTMLSpanElement>;
  spots: number;
  onShutter: () => void;
  hudRef: React.RefObject<HTMLDivElement>;
}

const Viewfinder = forwardRef<HTMLImageElement, ViewfinderProps>(function Viewfinder(
  { size, tall, phase, percentRef, barRef, spots, onShutter, hudRef },
  imgRef,
) {
  const [zoom, setZoom] = useState<0.5 | 1 | 2>(1);
  const [flash, setFlash] = useState(0);
  const zoomRef = useRef<HTMLDivElement>(null);
  const parallax = useRef({ x: 0, y: 0 });
  const photo = tall ? PHOTO_TALL : PHOTO_WIDE;
  const box = useMemo(() => (size.w > 0 ? coverBox(photo, size.w, size.h) : null), [photo, size.w, size.h]);
  const scale = ZOOMS.find((z) => z.id === zoom)!.scale;

  const applyTransform = () => {
    const el = zoomRef.current;
    if (!el) return;
    const { x, y } = parallax.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };
  useEffect(applyTransform);

  // Gentle parallax on the photo, like moving the phone a little.
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const k = zoom === 0.5 ? 0 : 10;
    parallax.current = {
      x: -((e.clientX - r.left) / r.width - 0.5) * k,
      y: -((e.clientY - r.top) / r.height - 0.5) * k,
    };
    applyTransform();
  };

  const shutter = () => {
    setFlash((f) => f + 1);
    onShutter();
  };

  const common = { alt: "An orange McLaren Senna driving past the Eiffel Tower, framed in the Wheeloh camera", priority: true, quality: 82 };
  const wide = getImageProps({ ...common, src: PHOTO_WIDE.src, width: PHOTO_WIDE.width, height: PHOTO_WIDE.height, sizes: "100vw" });
  const narrow = getImageProps({ ...common, src: PHOTO_TALL.src, width: PHOTO_TALL.width, height: PHOTO_TALL.height, sizes: "100vw" });

  return (
    <div className="absolute inset-0" onPointerMove={onMove} onPointerLeave={() => { parallax.current = { x: 0, y: 0 }; applyTransform(); }}>
      {/* Photo + detection box share the zoom/parallax transform */}
      <div
        ref={zoomRef}
        className="hero-photo absolute inset-0 overflow-hidden rounded-[1.25rem] transition-transform [transition-duration:1100ms] ease-out-expo"
        style={{ transformOrigin: box ? `${box.originX}px ${box.originY}px` : "50% 65%" }}
      >
        <picture>
          <source media="(min-width: 640px)" srcSet={wide.props.srcSet} sizes="100vw" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            ref={imgRef}
            {...narrow.props}
            className="absolute inset-0 h-full w-full select-none object-cover object-[50%_72%] sm:object-[50%_70%]"
            draggable={false}
          />
        </picture>

        {box && (
          <div aria-hidden className="absolute inset-0" style={{ opacity: "var(--hud, 1)" }}>
          <div
            className={cn(
              "detect-box absolute transition-[border-color,opacity] duration-700",
              phase === "idle" ? "opacity-0" : "opacity-100",
              phase === "done" ? "border-snow/70" : "border-alert/90",
            )}
            style={{ left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top }}
            data-phase={phase}
          >
            {(["tl", "tr", "bl", "br"] as const).map((c) => (
              <span key={c} className={cn("detect-corner", `detect-corner-${c}`, phase === "done" ? "border-snow" : "border-alert")} />
            ))}
            {phase === "detecting" && <span className="detect-sweep" />}
          </div>
          </div>
        )}
      </div>

      {/* Bottom scrim so controls stay legible on the road */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />

      <div ref={hudRef} className="absolute inset-0">
        {/* Rule-of-thirds grid, as in the app camera */}
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0">
          <span className="absolute inset-y-0 left-1/3 w-px bg-snow/25" />
          <span className="absolute inset-y-0 left-2/3 w-px bg-snow/25" />
          <span className="absolute inset-x-0 top-1/3 h-px bg-snow/25" />
          <span className="absolute inset-x-0 top-2/3 h-px bg-snow/25" />
        </div>

        {/* Detection status — the app's frosted progress card */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.6, ease: EASE } }}
          className="hero-pill absolute left-3 right-3 top-3 overflow-hidden rounded-[1.25rem] bg-black/45 text-snow backdrop-blur-xl sm:left-4 sm:right-auto sm:top-4 sm:w-[min(23rem,calc(100%-2rem))]"
          aria-live="polite"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {phase !== "done" ? (
              <motion.div
                key="detecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="px-4 py-3.5"
              >
                <div className="flex items-center justify-between text-[0.8125rem] font-medium">
                  <span className="flex items-center gap-2.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-snow/30 border-t-snow" />
                    {phase === "idle" ? "Point at a car…" : "Detecting model…"}
                  </span>
                  <span className="tabular text-snow/70">
                    <span ref={percentRef}>0</span>%
                  </span>
                </div>
                <span className="mt-3 block h-[3px] overflow-hidden rounded-full bg-snow/15">
                  <span ref={barRef} className="block h-full w-full origin-left scale-x-0 rounded-full bg-snow" />
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
                className="px-4 pb-4 pt-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-spotted">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 animate-ping-soft rounded-full bg-spotted" />
                      <span className="relative h-2 w-2 rounded-full bg-spotted" />
                    </span>
                    Identified
                  </span>
                  <span className="rounded-full bg-snow px-2.5 py-1 text-[0.75rem] font-bold text-ink tabular">
                    {SENNA.points.toLocaleString("en-US")} pts
                  </span>
                </div>
                <p className="mt-2 text-[1.375rem] font-bold leading-tight tracking-[-0.02em]">{SENNA.name}</p>
                <p className="text-[0.8125rem] font-medium text-snow/65">{SENNA.line}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 max-sm:[@media(max-height:760px)]:hidden">
                  {SENNA.specs.map((s) => (
                    <span key={s} className="rounded-full bg-snow/10 px-2.5 py-1 text-[0.75rem] font-semibold text-snow/90 ring-1 ring-inset ring-snow/15">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Camera controls */}
        <div className="hero-controls absolute inset-x-0 bottom-4 flex flex-col items-center gap-4 sm:bottom-6">
          <div className="flex items-center gap-2 max-sm:[@media(max-height:760px)]:hidden" role="group" aria-label="Zoom">
            {ZOOMS.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setZoom(z.id)}
                aria-pressed={zoom === z.id}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-[0.6875rem] font-bold tabular transition-[background-color,color,transform] duration-300 active:scale-90",
                  zoom === z.id ? "bg-snow text-ink" : "bg-black/45 text-snow backdrop-blur-md hover:bg-black/60",
                )}
              >
                {z.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <AnimatePresence>
              {spots > 0 && (
                <motion.span
                  key={spots}
                  initial={{ opacity: 0, y: -48, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -120, scale: 1 }}
                  transition={{ duration: 1.6, ease: EASE, times: [0, 0.15, 0.7, 1] }}
                  className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-spotted px-3 py-1 text-sm font-bold text-snow shadow-lg tabular"
                  aria-hidden
                >
                  +{SENNA.points.toLocaleString("en-US")} pts
                </motion.span>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={shutter}
              aria-label="Spot this car"
              className="group grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border-[4px] border-snow transition-transform duration-200 active:scale-90 max-sm:[@media(max-height:760px)]:h-14 max-sm:[@media(max-height:760px)]:w-14"
            >
              <span className="h-[3.4rem] w-[3.4rem] rounded-full bg-snow transition-transform duration-300 ease-out-expo group-hover:scale-90 max-sm:[@media(max-height:760px)]:h-10 max-sm:[@media(max-height:760px)]:w-10" />
            </button>
          </div>
        </div>
      </div>

      {/* Shutter flash */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.span
            key={flash}
            aria-hidden
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 bg-snow"
          />
        )}
      </AnimatePresence>
    </div>
  );
});

export default Viewfinder;
