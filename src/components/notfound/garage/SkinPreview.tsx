"use client";

import { useEffect, useRef } from "react";
import { Car } from "../engine/car";
import type { Skin } from "../engine/skins";

/** A skin on the game's own car, drawn on a small canvas. */
export default function SkinPreview({
  skin,
  w = 120,
  h = 72,
  live = false,
  angle = -0.3,
  className,
}: {
  skin: Skin;
  w?: number;
  h?: number;
  /** Keep animating (shifting paint). */
  live?: boolean;
  angle?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext("2d")!;
    const car = new Car(Math.min(w * 0.6, h * 1.15));
    car.place(w / 2, h / 2, angle);
    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      car.draw(g, "player", (now - t0) / 1000, skin);
      if (live && skin.holo) raf = requestAnimationFrame(draw);
    };
    draw(t0);
    return () => cancelAnimationFrame(raf);
  }, [skin, w, h, live, angle]);

  return <canvas ref={ref} style={{ width: w, height: h }} className={className} aria-hidden />;
}
