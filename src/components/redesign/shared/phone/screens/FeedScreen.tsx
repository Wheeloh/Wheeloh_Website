"use client";

import { Bell, Bookmark, Check, Heart, MapPin, MessageSquare, Search, Timer, Weight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "@/components/redesign/shared/motion/CountUp";
import { TabBar, useSteps } from "../ui";

/** Chapter 2 — the spot is posted to the feed and earns its points. */
export default function FeedScreen({ active }: { active: boolean }) {
  // 1 toast in · 2 points count · 3 like · 4 toast out
  const step = useSteps(active, [350, 900, 2300, 3600]);

  return (
    <div className="absolute inset-0 bg-snow text-ink">
      {/* header */}
      <div className="absolute inset-x-0 top-[58px] flex items-center justify-between px-[22px]">
        <span className="grid h-[44px] w-[44px] place-items-center rounded-full bg-snow shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
          <Search className="h-[21px] w-[21px]" strokeWidth={2} />
        </span>
        <span className="flex h-[44px] items-center rounded-full bg-snow p-[3px] text-[14px] font-semibold shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
          <span className="rounded-full bg-ink px-[18px] py-[9px] text-snow">Public</span>
          <span className="px-[18px] text-ash">Private</span>
        </span>
        <span className="relative grid h-[44px] w-[44px] place-items-center rounded-full bg-snow shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
          <Bell className="h-[21px] w-[21px]" strokeWidth={2} />
          <span className="absolute right-[9px] top-[9px] h-[8px] w-[8px] rounded-full bg-alert ring-2 ring-snow" />
        </span>
      </div>

      {/* post */}
      <div className="absolute inset-x-0 top-[118px] px-[12px]">
        <div className="flex items-center gap-[10px] px-[6px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/mclaren-675lt-sm.jpg" alt="" loading="lazy" className="h-[44px] w-[44px] rounded-[12px] object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold leading-tight">
              Sylvain <span className="font-medium text-ash">· just now</span>
            </p>
            <p className="mt-[2px] flex items-center gap-1 text-[13px] text-ash">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} /> Quai Branly, Paris
            </p>
          </div>
          <span className="text-[20px] leading-none tracking-[2px] text-ink">···</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/senna-square-sm.jpg"
          alt=""
          loading="lazy"
          className="mt-[10px] h-[369px] w-full rounded-[16px] object-cover object-[50%_62%]"
        />
        <div className="mt-[12px] flex items-start justify-between gap-2 px-[6px]">
          <p className="text-[19px] font-bold leading-tight tracking-[-0.01em]">
            McLaren Senna ·{" "}
            <span className="tabular">
              {step >= 2 ? <CountUp to={2212} start duration={1300} /> : "0"}
            </span>{" "}
            pts
          </p>
          <span className="flex shrink-0 items-center gap-[14px] pt-[2px] text-[16px] font-semibold">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-[21px] w-[21px]" strokeWidth={1.9} /> 3
            </span>
            <span className="flex items-center gap-1">
              <Heart
                className={cn("h-[21px] w-[21px] transition-transform duration-300", step >= 3 && "scale-110 text-alert")}
                strokeWidth={1.9}
                fill={step >= 3 ? "currentColor" : "none"}
              />
              <span className="tabular">{step >= 3 ? <CountUp to={48} from={12} start duration={1100} /> : 12}</span>
            </span>
            <Bookmark className="h-[21px] w-[21px]" strokeWidth={1.9} />
          </span>
        </div>
        <p className="mt-[6px] flex items-center gap-2 px-[6px] text-[13px] text-ash">
          <Zap className="h-3.5 w-3.5" strokeWidth={2} /> 789 hp
          <span>·</span>
          <Timer className="h-3.5 w-3.5" strokeWidth={2} /> 2.8 s
          <span>·</span>
          <Weight className="h-3.5 w-3.5" strokeWidth={2} /> 1,198 kg
        </p>
        <p className="mt-[8px] px-[6px] text-[15px] leading-snug">Caught it on Quai Branly. Still shaking.</p>
      </div>

      {/* in-app toast */}
      <div
        className={cn(
          "absolute inset-x-[14px] top-[54px] z-30 flex items-center gap-3 rounded-[20px] bg-ink px-[14px] py-[12px] text-snow shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-700 ease-out-expo",
          step >= 1 && step < 4 ? "translate-y-0 opacity-100" : "-translate-y-[140%] opacity-0",
        )}
      >
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-spotted">
          <Check className="h-[18px] w-[18px]" strokeWidth={3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold">Spot saved to your garage</span>
          <span className="block text-[12px] font-medium text-snow/65">Supercar category · +2,212 pts</span>
        </span>
      </div>

      <TabBar active="home" />
    </div>
  );
}
