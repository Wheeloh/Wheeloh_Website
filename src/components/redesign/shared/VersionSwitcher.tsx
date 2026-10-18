"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const OPTIONS = ["v1", "v2", "v3"] as const;

/**
 * DEV ONLY: the root layout renders it in `next dev` alone. Compares the
 * site (v3) with the older versions. Links do a full navigation: the dev
 * middleware reads the parameter, sets or clears the cookie and reloads the
 * page in that version.
 */
export default function VersionSwitcher() {
  const path = usePathname() || "/";
  const [current, setCurrent] = useState<string>("v3");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)wh-site-version=(v[12])/);
    setCurrent(m ? m[1] : "v3");
  }, [path]);

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
    </div>
  );
}
