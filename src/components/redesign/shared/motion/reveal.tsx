"use client";

import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// One IntersectionObserver per (rootMargin, threshold) pair, shared by every
// revealed element. Elements get a `data-in` attribute when they enter the
// view; CSS (globals.css) does the rest — no React re-render per reveal.

type Listener = (inView: boolean) => void;
const observers = new Map<string, IntersectionObserver>();
const listeners = new WeakMap<Element, Listener>();

function observer(rootMargin: string, threshold: number, once: boolean) {
  const key = `${rootMargin}|${threshold}|${once}`;
  let io = observers.get(key);
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.setAttribute("data-in", "");
            listeners.get(el)?.(true);
            if (once) io!.unobserve(el);
          } else if (!once) {
            el.removeAttribute("data-in");
            listeners.get(el)?.(false);
          }
        }
      },
      { rootMargin, threshold },
    );
    observers.set(key, io);
  }
  return io;
}

export interface InViewOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  onChange?: Listener;
}

/** Ref callback that flags the element with `data-in` once it is in view. */
export function useInViewRef<T extends Element>({
  rootMargin = "0px 0px -12% 0px",
  threshold = 0,
  once = true,
  onChange,
}: InViewOptions = {}) {
  const cleanup = useRef<() => void>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  return useCallback(
    (el: T | null) => {
      cleanup.current?.();
      cleanup.current = undefined;
      if (!el) return;
      if (typeof IntersectionObserver === "undefined") {
        el.setAttribute("data-in", "");
        onChangeRef.current?.(true);
        return;
      }
      const io = observer(rootMargin, threshold, once);
      listeners.set(el, (v) => onChangeRef.current?.(v));
      io.observe(el);
      cleanup.current = () => {
        io.unobserve(el);
        listeners.delete(el);
      };
    },
    [rootMargin, threshold, once],
  );
}

/** Boolean in-view state, for components that need to start/stop work. */
export function useInView<T extends Element>(options: Omit<InViewOptions, "onChange"> = {}) {
  const [inView, setInView] = useState(false);
  const ref = useInViewRef<T>({ ...options, onChange: setInView });
  return [ref, inView] as const;
}

type RevealVariant = "rise" | "fade" | "blur" | "mask" | "scale";

interface RevealProps {
  as?: ElementType;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  rootMargin?: string;
  [key: string]: unknown;
}

export function Reveal({
  as = "div",
  variant = "rise",
  delay = 0,
  className,
  style,
  children,
  rootMargin,
  ...rest
}: RevealProps) {
  const ref = useInViewRef<HTMLElement>({ rootMargin });
  return createElement(
    as,
    {
      ref,
      "data-reveal": variant === "rise" ? "" : variant,
      className,
      style: { ...style, ["--d" as string]: delay },
      ...rest,
    },
    children,
  );
}

interface SplitTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  /** Extra class per line (lines are split on "\n"). */
  lineClassNames?: string[];
  /** ms before the first word moves */
  delay?: number;
  /**
   * "view": animate when scrolled into view (default).
   * "parent": an ancestor sets `data-in` (e.g. after the intro).
   */
  trigger?: "view" | "parent";
}

/**
 * Headline whose words rise out of a mask. Words stay real text for SEO and
 * screen readers; "\n" forces a line break.
 */
export function SplitText({ text, as = "span", className, wordClassName, lineClassNames, delay = 0, trigger = "view" }: SplitTextProps) {
  const ref = useInViewRef<HTMLElement>({ rootMargin: "0px 0px -8% 0px" });
  let index = 0;
  const lines = text.split("\n");
  const content = lines.map((line, li) => {
    const words = line.split(" ").filter(Boolean);
    return (
      <span key={li} className={cn("block", lineClassNames?.[li])}>
        {words.map((word, wi) => {
          const i = index++;
          return (
            <span key={wi}>
              <span className="split-line">
                <span className={cn("split-word", wordClassName)} style={{ ["--i" as string]: i }}>
                  {word}
                </span>
              </span>
              {wi < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </span>
    );
  });
  return createElement(
    as,
    {
      ref: trigger === "view" ? ref : undefined,
      className,
      style: { ["--d" as string]: delay },
    },
    content,
  );
}

/** Resolves once the intro (preloader) has finished — immediately if skipped. */
export function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("intro-done")) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener("wheeloh:intro-done", onDone, { once: true });
    // Failsafe: never keep the page waiting on the intro.
    const t = window.setTimeout(onDone, 4000);
    return () => {
      window.removeEventListener("wheeloh:intro-done", onDone);
      window.clearTimeout(t);
    };
  }, []);
  return done;
}
