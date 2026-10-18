import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// iPhone-class frame drawn in CSS. Screens are built at the device's logical
// size (393×852) and the whole phone is scaled with one transform, so every
// in-app measurement stays true to the real UI.
export const SCREEN_W = 393;
export const SCREEN_H = 852;
const BEZEL = 7;
export const PHONE_W = SCREEN_W + BEZEL * 2;
export const PHONE_H = SCREEN_H + BEZEL * 2;

interface PhoneProps {
  scale: number;
  children: ReactNode;
  className?: string;
  /** Status bar text colour for the current screen. */
  tone?: "dark" | "light";
}

export default function Phone({ scale, children, className, tone = "dark" }: PhoneProps) {
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})` }}
      >
        {/* side buttons */}
        <span aria-hidden className="absolute -left-[3px] top-[150px] h-[34px] w-[4px] rounded-l-[2px] bg-[#2a2a2d]" />
        <span aria-hidden className="absolute -left-[3px] top-[210px] h-[62px] w-[4px] rounded-l-[2px] bg-[#2a2a2d]" />
        <span aria-hidden className="absolute -left-[3px] top-[285px] h-[62px] w-[4px] rounded-l-[2px] bg-[#2a2a2d]" />
        <span aria-hidden className="absolute -right-[3px] top-[230px] h-[96px] w-[4px] rounded-r-[2px] bg-[#2a2a2d]" />

        {/* titanium frame */}
        <div className="absolute inset-0 rounded-[64px] bg-[#101012] shadow-[0_0_0_1px_#4a4a50,0_50px_100px_-30px_rgba(0,0,0,0.75),0_30px_60px_-30px_rgba(0,0,0,0.6)]" />
        <div aria-hidden className="absolute inset-[1px] rounded-[63px] ring-1 ring-inset ring-white/[0.07]" />

        {/* screen */}
        <div
          className="absolute overflow-hidden rounded-[57px] bg-snow"
          style={{ left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H }}
        >
          {children}
          <StatusBar tone={tone} />
          {/* dynamic island */}
          <span aria-hidden className="absolute left-1/2 top-[11px] h-[37px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}

function StatusBar({ tone }: { tone: "dark" | "light" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[54px] items-center justify-between px-[34px] pt-[6px] transition-colors duration-500",
        tone === "dark" ? "text-ink" : "text-snow",
      )}
    >
      <span className="text-[16px] font-semibold tracking-[-0.01em]">9:41</span>
      <span className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="6" width="3" height="6" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .6C5.3.6 2.8 1.7.9 3.4L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.3c1.4 0 2.7.5 3.7 1.4l1.1-1.2A7 7 0 0 0 8 3.9c-1.8 0-3.5.7-4.8 1.8l1.1 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.2c-.6 0-1.2.2-1.6.6L8 11l1.6-1.7c-.4-.4-1-.6-1.6-.6Z" />
        </svg>
        <span
          className="relative flex h-[12px] w-[25px] items-center rounded-[4px] border p-[1.5px]"
          style={{ borderColor: "color-mix(in srgb, currentColor 40%, transparent)" }}
        >
          <span className="h-full w-[78%] rounded-[2px] bg-current" />
          <span
            className="absolute -right-[3px] top-1/2 h-[4px] w-[1.5px] -translate-y-1/2 rounded-r"
            style={{ background: "color-mix(in srgb, currentColor 40%, transparent)" }}
          />
        </span>
      </span>
    </div>
  );
}
