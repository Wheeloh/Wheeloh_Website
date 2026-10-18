"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const COOKIE = "wh-site-version";
const OPTIONS = ["v1", "v2", "v3"] as const;

/**
 * Tiny preview switcher for comparing the site versions. Only appears once
 * a version has been chosen through the URL (?v2=true, ?v3=true…), so
 * regular visitors never see it. Links do a full navigation: the middleware
 * reads the parameter, sets the cookie and reloads the page in that version.
 */
export default function VersionSwitcher() {
  const [current, setCurrent] = useState<string | null>(null);
  const [path, setPath] = useState("/");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)wh-site-version=(v[123])/);
    setCurrent(m ? m[1] : null);
    setPath(window.location.pathname);
  }, []);

  if (!current) return null;

  return (
    <div
      role="group"
      aria-label="Site version preview"
      className="fixed bottom-[5.5rem] right-3 z-switcher flex h-9 items-center gap-0.5 rounded-full bg-[#09090b] p-1 font-sans text-[0.75rem] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/15 lg:bottom-4 lg:right-4"
    >
      <span className="pl-2.5 pr-1.5 text-white/55">Preview</span>
      {OPTIONS.map((v) => (
        <a
          key={v}
          href={`${path}?${v}=true`}
          aria-current={v === current ? "true" : undefined}
          className={
            "grid h-7 w-8 place-items-center rounded-full transition-colors " +
            (v === current ? "bg-white text-[#09090b]" : "text-white/80 hover:bg-white/10")
          }
        >
          {v}
        </a>
      ))}
      <a
        href={`${path}?preview=off`}
        aria-label="Exit preview mode"
        className="ml-0.5 grid h-7 w-7 place-items-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
