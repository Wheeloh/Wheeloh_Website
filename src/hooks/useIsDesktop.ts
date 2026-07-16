"use client";
import { useState, useEffect } from "react";

// Defaults to `false` (mobile) on SSR and the first client render — this bias
// is deliberate: it guarantees the server and first client paint agree (no
// hydration mismatch), and it means heavy desktop-only components never
// transiently mount on real mobile devices before the media query resolves.
export function useIsDesktop(query = "(min-width: 769px)"): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return isDesktop;
}
