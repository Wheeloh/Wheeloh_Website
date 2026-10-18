"use client";

import { useEffect, useRef } from "react";
import { Box, Copy, Crop, Gauge, Image as ImageIcon, MessageSquare, Navigation, ScanLine, Settings, Timer, User, Weight, Zap, ZapOff, ArrowUpToLine, House, Check, Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSteps } from "../ui";
import { PHOTO_TALL, coverBox } from "../photos";

const PREVIEW = { left: 10, top: 104, w: 373, h: 606 };
const box = coverBox(PHOTO_TALL, PREVIEW.w, PREVIEW.h);

const SPECS = [
  { Icon: Zap, label: "Power", value: "789 hp" },
  { Icon: Gauge, label: "Torque", value: "800 Nm" },
  { Icon: Timer, label: "0–100 km/h", value: "2.8 s" },
  { Icon: Navigation, label: "Top speed", value: "340 km/h" },
  { Icon: Weight, label: "Dry weight", value: "1,198 kg" },
  { Icon: Cog, label: "Engine", value: "4.0 L V8 TT" },
];

/** Chapter 1 — the camera identifies the car, then the spec sheet slides up. */
interface CameraScreenProps {
  active: boolean;
  /** Replay the detection every few seconds while on screen. */
  loop?: boolean;
  onStep?: (step: number) => void;
}

export default function CameraScreen({ active, loop = false, onStep }: CameraScreenProps) {
  // 0 idle · 1 detecting · 2 identified · 3 sheet up
  const step = useSteps(active, [250, 2100, 2700], loop ? 5200 : undefined);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    onStep?.(step);
  }, [step, onStep]);

  useEffect(() => {
    if (step !== 1) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1700);
      const v = Math.round((1 - Math.pow(1 - k, 3)) * 100);
      if (pct.current) pct.current.textContent = String(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  return (
    <div className="absolute inset-0 bg-black text-snow">
      {/* top controls */}
      <div className="absolute left-[30px] right-[30px] top-[60px] flex items-center justify-between">
        <span className="flex gap-[22px]">
          <Box className="h-[30px] w-[30px] text-snow/80" strokeWidth={1.6} />
          <Copy className="h-[28px] w-[28px] text-snow/80" strokeWidth={1.6} />
        </span>
        <Settings className="h-[30px] w-[30px]" fill="currentColor" strokeWidth={1.4} color="#000" style={{ fill: "#fff" }} />
      </div>

      {/* preview */}
      <div
        className="absolute overflow-hidden rounded-[22px] bg-carbon"
        style={{ left: PREVIEW.left, top: PREVIEW.top, width: PREVIEW.w, height: PREVIEW.h }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/senna-portrait-sm.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-[50%_72%] transition-transform [transition-duration:1600ms] ease-out-expo",
            step >= 3 ? "scale-[1.08]" : "scale-100",
          )}
        />
        <span className="absolute inset-y-0 left-1/3 w-px bg-snow/25" />
        <span className="absolute inset-y-0 left-2/3 w-px bg-snow/25" />
        <span className="absolute inset-x-0 top-1/3 h-px bg-snow/25" />
        <span className="absolute inset-x-0 top-2/3 h-px bg-snow/25" />

        <div
          className={cn(
            "absolute border transition-[opacity,border-color] duration-500",
            step === 0 ? "opacity-0" : "opacity-100",
            step >= 2 ? "border-spotted" : "border-alert",
          )}
          style={{ left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top }}
        >
          {step >= 2 && (
            <span className="absolute -top-[30px] left-0 flex items-center gap-1 rounded-full bg-spotted px-2.5 py-1 text-[12px] font-bold text-snow">
              <Check className="h-3.5 w-3.5" strokeWidth={3} /> McLaren Senna
            </span>
          )}
        </div>

        {/* detection card */}
        <div className="absolute left-[10px] right-[10px] top-[10px] rounded-[16px] bg-black/45 px-[14px] py-[12px] backdrop-blur-xl">
          <div className="flex items-center justify-between text-[14px] font-medium">
            <span>{step >= 2 ? "Model identified" : "Detecting model…"}</span>
            <span className="tabular text-snow/70">
              <span ref={pct}>{step >= 2 ? 100 : 0}</span>%
            </span>
          </div>
          <span className="mt-[10px] block h-[3px] overflow-hidden rounded-full bg-snow/15">
            <span
              className={cn(
                "block h-full origin-left rounded-full bg-snow transition-transform ease-out",
                step >= 1 ? "scale-x-100 [transition-duration:1700ms]" : "scale-x-0 duration-0",
              )}
            />
          </span>
        </div>

        {/* zoom + side controls */}
        <div className="absolute bottom-[22px] left-1/2 flex -translate-x-1/2 gap-[8px]">
          {[".5×", "1×", "2×"].map((z) => (
            <span
              key={z}
              className={cn(
                "grid h-[34px] w-[34px] place-items-center rounded-full text-[11px] font-bold",
                z === "1×" ? "bg-snow text-ink" : "bg-black/50 text-snow",
              )}
            >
              {z}
            </span>
          ))}
        </div>
        <div className="absolute bottom-[86px] right-[14px] flex flex-col gap-[10px]">
          {[Crop, ScanLine, ZapOff].map((Icon, i) => (
            <span key={i} className="grid h-[46px] w-[46px] place-items-center rounded-[13px] bg-black/55">
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </span>
          ))}
        </div>
        <div className="absolute bottom-[86px] left-[14px] flex flex-col gap-[10px]">
          <span className="grid h-[46px] w-[46px] place-items-center rounded-[13px] bg-black/55">
            <ArrowUpToLine className="h-[22px] w-[22px]" strokeWidth={1.8} />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/porsche-gt3rs-sm.jpg" alt="" loading="lazy" className="h-[46px] w-[46px] rounded-[10px] object-cover ring-2 ring-snow/90" />
        </div>
      </div>

      {/* shutter + notched tab bar */}
      <svg className="absolute bottom-0 left-0" width="393" height="96" viewBox="0 0 393 96" aria-hidden>
        <path d="M0 18 H136 C150 18 154 44 196.5 44 C239 44 243 18 257 18 H393 V96 H0 Z" fill="#0c0c0e" />
      </svg>
      <div className="absolute bottom-[34px] left-0 right-0 flex justify-around px-[18px] text-snow/90">
        <User className="h-[26px] w-[26px]" strokeWidth={1.6} />
        <House className="h-[26px] w-[26px]" strokeWidth={1.6} />
        <span className="w-[70px]" />
        <ImageIcon className="h-[26px] w-[26px]" strokeWidth={1.6} />
        <MessageSquare className="h-[26px] w-[26px]" strokeWidth={1.6} />
      </div>
      <span
        className={cn(
          "absolute bottom-[50px] left-1/2 grid h-[78px] w-[78px] -translate-x-1/2 place-items-center rounded-full border-[5px] border-snow bg-black transition-transform duration-300",
          step === 2 && "scale-90",
        )}
      >
        <span className="h-[60px] w-[60px] rounded-full bg-snow" />
      </span>
      <span className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-snow" />

      {/* spec sheet */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-40 h-[468px] rounded-t-[30px] bg-snow px-[22px] pt-[12px] text-ink shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-transform [transition-duration:900ms] ease-out-expo",
          step >= 3 ? "translate-y-0" : "translate-y-full",
        )}
      >
        <span className="mx-auto block h-[5px] w-[40px] rounded-full bg-line" />
        <div className="mt-[18px] flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-spotted">
              <Check className="h-4 w-4" strokeWidth={3} /> Identified
            </p>
            <p className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.02em]">McLaren Senna</p>
            <p className="text-[13px] font-medium text-ash">McLaren · Ultimate Series · 2018–2022</p>
          </div>
          <span className="mt-1 shrink-0 rounded-full bg-ink px-3 py-1.5 text-[13px] font-bold text-snow tabular">2,212 pts</span>
        </div>
        <div className="mt-[18px] grid grid-cols-2 gap-[10px]">
          {SPECS.map(({ Icon, label, value }, i) => (
            <div
              key={label}
              className={cn(
                "rounded-[16px] bg-mist px-[14px] py-[11px] transition-[opacity,transform] duration-700 ease-out-expo",
                step >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: step >= 3 ? `${250 + i * 70}ms` : "0ms" }}
            >
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-ash">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} /> {label}
              </p>
              <p className="mt-0.5 text-[17px] font-bold tracking-[-0.01em]">{value}</p>
            </div>
          ))}
        </div>
        <span className="mt-[18px] flex h-[52px] items-center justify-center rounded-full bg-ink text-[16px] font-semibold text-snow">
          Add to my garage
        </span>
        <span className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink" />
      </div>
    </div>
  );
}
