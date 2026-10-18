"use client";

import type { ReactNode } from "react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { Reveal } from "@/components/redesign/shared/motion/reveal";
import { useCopy } from "@/components/redesign/shared/Locale";
import { cn } from "@/lib/utils";

// The download call to action of every page that isn't the home: a dark
// band (store buttons + the QR code on desktop) at the end of a page, or a
// light inline card between sections. Both carry data-download-cta, which
// MobileCta and the header's "Get the app" use to find the page's own CTA.

const COPY = {
  en: {
    title: "Spot your first car today.",
    body: "Free on iPhone and Android. Identify it, score it, collect it.",
    scan: "Scan to download",
    store: "Opens the right store",
  },
  fr: {
    title: "Spotte ta première voiture aujourd'hui.",
    body: "Gratuite sur iPhone et Android. Identifie-la, gagne des points, collectionne-la.",
    scan: "Scanne pour télécharger",
    store: "Ouvre le bon store",
  },
};

interface AppCtaProps {
  campaign: string;
  title?: ReactNode;
  body?: ReactNode;
  /** Build-time SVG of the download QR code (lib/qr.ts). */
  qr?: string;
  variant?: "band" | "inline";
  className?: string;
}

export function QrCard({ qr, className }: { qr: string; className?: string }) {
  const t = useCopy(COPY);
  return (
    <div className={cn("flex items-center gap-4 rounded-[1.75rem] bg-snow p-3 pr-6 text-left text-ink", className)}>
      <span
        className="block h-[5.5rem] w-[5.5rem] shrink-0 rounded-2xl bg-snow p-1.5 [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qr }}
        aria-hidden
      />
      <span>
        <span className="block text-base font-bold">{t.scan}</span>
        <span className="block text-sm font-medium text-ash">{t.store}</span>
      </span>
    </div>
  );
}

export default function AppCta({ campaign, title, body, qr, variant = "band", className }: AppCtaProps) {
  const t = useCopy(COPY);

  if (variant === "inline") {
    return (
      <Reveal
        data-download-cta=""
        className={cn("flex flex-col gap-5 rounded-[1.75rem] bg-mist p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7", className)}
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink">
            <FlagMark className="w-6 text-snow" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold leading-snug">{title ?? t.title}</span>
            <span className="mt-1 block text-[0.9375rem] font-medium leading-relaxed text-ash">{body ?? t.body}</span>
          </span>
        </div>
        <StoreButtons tone="dark" campaign={campaign} className="shrink-0" />
      </Reveal>
    );
  }

  return (
    <Reveal
      data-download-cta=""
      className={cn("grain relative overflow-hidden rounded-[2rem] bg-ink p-8 text-snow sm:p-12", className)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_90%_10%,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-display-s font-extrabold sm:text-display-m">{title ?? t.title}</p>
          <p className="mt-3 max-w-[52ch] text-base font-medium text-smoke sm:text-lg">{body ?? t.body}</p>
          <StoreButtons tone="light" campaign={campaign} className="mt-8" />
        </div>
        {qr && <QrCard qr={qr} className="hidden shrink-0 lg:flex" />}
      </div>
    </Reveal>
  );
}
