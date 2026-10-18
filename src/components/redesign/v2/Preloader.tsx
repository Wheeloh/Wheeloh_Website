"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";

/**
 * First-visit intro: the Wheeloh flag assembles tile by tile, a progress line
 * fills while the page loads, then the curtain lifts onto the viewfinder.
 * Rendered in the server HTML (so it covers the very first paint). `play` is
 * decided by the page from the `wh-intro` session cookie, so repeat visits
 * never ship the curtain at all; reduced motion and no-JS are handled in CSS.
 */
export default function Preloader({ play }: { play: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(play);
  const lenis = useLenis();

  useEffect(() => {
    const root = document.documentElement;
    const done = () => {
      root.classList.add("intro-done");
      window.dispatchEvent(new Event("wheeloh:intro-done"));
    };
    if (!play || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(false);
      done();
      return;
    }
    lenis?.stop();
    window.scrollTo(0, 0);

    const t0 = performance.now();
    const MIN = 1250;
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);

    let raf = 0;
    let leaving = false;
    const tick = (now: number) => {
      const elapsed = now - t0;
      // Creep to 85% on time alone, finish once the page has loaded.
      const target = loaded ? 1 : Math.min(0.85, elapsed / 1600);
      const current = Number(barRef.current?.dataset.p ?? 0);
      const next = current + (target - current) * 0.12;
      if (barRef.current) {
        barRef.current.dataset.p = String(next);
        barRef.current.style.transform = `scaleX(${next})`;
      }
      const ready = (loaded && next > 0.985 && elapsed > MIN) || elapsed > 2600;
      if (ready && !leaving) {
        leaving = true;
        ref.current?.classList.add("is-leaving");
        document.cookie = "wh-intro=1; path=/; SameSite=Lax";
        lenis?.start();
        done();
        window.setTimeout(() => setMounted(false), 1100);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div ref={ref} className="preloader" aria-hidden>
        <div className="preloader-inner flex flex-col items-center">
          <FlagMark motion="intro" className="w-24 text-snow sm:w-28" />
          <span className="mt-10 block h-px w-36 overflow-hidden bg-graphite">
            <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-snow" />
          </span>
        </div>
      </div>
    </>
  );
}
