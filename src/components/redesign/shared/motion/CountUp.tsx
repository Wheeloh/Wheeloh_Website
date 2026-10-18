"use client";

import { useEffect, useRef } from "react";
import { useInViewRef } from "@/components/redesign/shared/motion/reveal";

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  delay?: number;
  className?: string;
  /** Start when `true` instead of when scrolled into view. */
  start?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Renders the final number on the server (so crawlers and no-JS visitors see
 * it), then counts up from `from` the first time it is shown.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1600,
  decimals = 0,
  delay = 0,
  className,
  start,
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const el = useRef<HTMLSpanElement | null>(null);
  const played = useRef(false);

  const run = () => {
    const node = el.current;
    if (!node || played.current) return;
    played.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = prefix + fmt(to, decimals) + suffix;
      return;
    }
    node.textContent = prefix + fmt(from, decimals) + suffix;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration));
      const eased = 1 - Math.pow(2, -10 * p); // ease-out-expo
      node.textContent = prefix + fmt(from + (to - from) * (p === 1 ? 1 : eased), decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const viewRef = useInViewRef<HTMLSpanElement>({
    rootMargin: "0px 0px -10% 0px",
    onChange: (v) => {
      if (v && start === undefined) run();
    },
  });

  useEffect(() => {
    if (start) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  return (
    <span
      ref={(node) => {
        el.current = node;
        viewRef(node);
      }}
      className={className}
    >
      {prefix}
      {fmt(to, decimals)}
      {suffix}
    </span>
  );
}
