"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Mounts children only once the wrapper scrolls near the viewport, so heavy
// third-party embeds never load until a real visitor actually reaches them.
// The wrapper reserves `minHeight` up front so there is no layout shift when
// the content mounts.
export default function LazyMount({
  children,
  minHeight = 490,
  rootMargin = "300px",
  className,
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={{ minHeight }} className={className}>
      {visible ? children : null}
    </div>
  );
}
