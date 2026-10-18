"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { APP_LINK_URL, detectPlatform, type Platform } from "@/lib/links";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useCopy } from "@/components/redesign/shared/Locale";
import { cn } from "@/lib/utils";

const COPY = {
  en: { title: "Get Wheeloh", ios: "Free on iPhone", android: "Free on Android", other: "Free · iOS & Android", cta: "Download" },
  fr: { title: "Télécharger Wheeloh", ios: "Gratuit sur iPhone", android: "Gratuit sur Android", other: "Gratuit · iOS et Android", cta: "Installer" },
};

/**
 * Floating "Get Wheeloh" pill for phones, like the app's own floating
 * controls. Appears once the hero buttons are gone, hides near the download
 * section and the footer so it never doubles up with them.
 */
export default function MobileCta() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [visible, setVisible] = useState(false);
  const maintenance = useMaintenance();
  const t = useCopy(COPY);

  useEffect(() => {
    setPlatform(detectPlatform());
    // Hidden next to any download CTA of the page (the home's band, the
    // AppCta of the other pages), the contact form and the footer.
    const blockers = Array.from(document.querySelectorAll<HTMLElement>("#download, #contact, [data-download-cta], footer"));
    const blocked = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? blocked.add(e.target) : blocked.delete(e.target)));
      update();
    });
    blockers.forEach((el) => io.observe(el));
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.9 && blocked.size === 0);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  if (maintenance.active) return null;

  // app.wheeloh.com picks the right store itself; the label just previews it.
  const href = APP_LINK_URL;
  const sub = platform === "ios" ? t.ios : platform === "android" ? t.android : t.other;

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-sticky transition-[transform,opacity] duration-500 ease-out-expo lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[150%] opacity-0",
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener"
        tabIndex={visible ? 0 : -1}
        className="flex h-16 items-center gap-3 rounded-full bg-snow pl-2 pr-2 text-ink shadow-[0_18px_50px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/5 active:scale-[0.98]"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink">
          <FlagMark className="w-6 text-snow" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-base font-bold">{t.title}</span>
          <span className="block truncate text-[0.8125rem] font-medium text-ash">{sub}</span>
        </span>
        <span className="flex h-12 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-semibold text-snow">
          {t.cta} <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </a>
    </div>
  );
}
