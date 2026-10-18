"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { appStoreUrl, playStoreUrl } from "@/lib/links";
import { useMaintenance } from "@/hooks/useMaintenance";

export function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M17 14.5l4.2-4.5L4.9 1.2C4.8 1.1 4.6 1.1 4.3 1L17 14.5z" />
      <path d="M23 21l5.9-3.2c.7-.4 1.1-1 1.1-1.8s-.4-1.5-1.1-1.8L23 11l-4.7 5L23 21z" />
      <path d="M2.4 1.9C2.1 2.2 2 2.6 2 3v26c0 .4.1.8.4 1.2L15.6 16 2.4 1.9z" />
      <path d="M17 17.5L4.3 31c.2 0 .4-.1.6-.2L21.2 22 17 17.5z" />
    </svg>
  );
}

interface StoreButtonsProps {
  /** "light": white buttons for dark backgrounds. "dark": black buttons for light ones. */
  tone?: "light" | "dark";
  size?: "md" | "lg";
  campaign?: string;
  className?: string;
}

export default function StoreButtons({ tone = "light", size = "md", campaign = "app_download", className }: StoreButtonsProps) {
  const maintenance = useMaintenance();

  const guard = (store: string) => (e: React.MouseEvent) => {
    if (maintenance.active) {
      e.preventDefault();
      toast.error(maintenance.message || `Wheeloh is currently unavailable on ${store}`);
    }
  };

  // Phones: one compact row (icon + store name). Larger screens: full badges.
  const base = cn(
    "group relative inline-flex items-center gap-2.5 rounded-full font-semibold transition-[transform,background-color,box-shadow] duration-300 ease-out-expo active:scale-[0.97] max-sm:h-12 max-sm:flex-1 max-sm:justify-center max-sm:px-4",
    size === "lg" ? "sm:h-[3.75rem] sm:gap-3 sm:pl-5 sm:pr-7" : "sm:h-[3.25rem] sm:gap-3 sm:pl-4 sm:pr-6",
    tone === "light"
      ? "bg-snow text-ink hover:bg-white hover:shadow-[0_10px_40px_-8px_rgba(255,255,255,0.35)]"
      : "bg-ink text-snow hover:bg-black hover:shadow-[0_12px_32px_-10px_rgba(0,0,0,0.55)]",
  );

  const stores = [
    { name: "App Store", kicker: "Download on the", href: appStoreUrl(campaign), Icon: AppleIcon },
    { name: "Google Play", kicker: "Get it on", href: playStoreUrl(campaign), Icon: PlayIcon },
  ];

  return (
    <div className={cn("flex items-center gap-2.5 sm:flex-wrap sm:gap-3", className)}>
      {stores.map(({ name, kicker, href, Icon }) => (
        <a
          key={name}
          href={maintenance.active ? "#" : href}
          target={maintenance.active ? undefined : "_blank"}
          rel="noopener"
          onClick={guard(name)}
          aria-disabled={maintenance.active || undefined}
          className={cn(base, maintenance.active && "opacity-60")}
        >
          <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-500 ease-out-expo group-hover:-rotate-6 group-hover:scale-110", size === "lg" ? "sm:h-7 sm:w-7" : "sm:h-6 sm:w-6")} />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[0.625rem] font-medium uppercase tracking-[0.06em] opacity-70 max-sm:hidden">{kicker}</span>
            <span className={cn("whitespace-nowrap text-[0.9375rem] tracking-[-0.01em] sm:mt-1", size === "lg" ? "sm:text-lg" : "sm:text-base")}>{name}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
