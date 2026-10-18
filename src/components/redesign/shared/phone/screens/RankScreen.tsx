"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from "@/components/redesign/shared/motion/CountUp";
import { ALBUMS, CarAvatar, Segmented, TabBar, useSteps } from "../ui";

interface Row {
  id: string;
  name: string;
  cars: number;
  pts: number;
  avatar: string;
  verified?: boolean;
  you?: boolean;
}

const BASE: Row[] = [
  { id: "louis", name: "Louis", cars: 40, pts: 15600, avatar: ALBUMS.ferrari },
  { id: "ines", name: "Inès", cars: 52, pts: 9850, avatar: ALBUMS.lambo },
  { id: "sylvain", name: "Sylvain", cars: 55, pts: 7350, avatar: "/media/mclaren-675lt-sm.jpg", verified: true },
  { id: "georges", name: "Georges", cars: 10, pts: 5600, avatar: ALBUMS.bugatti },
  { id: "mathieu", name: "Mathieu", cars: 24, pts: 5240, avatar: ALBUMS.porsche },
  { id: "you", name: "You", cars: 31, pts: 5180, avatar: "/media/senna-square-sm.jpg", you: true },
];

const MEDAL = ["bg-gold", "bg-silver", "bg-bronze"];

/** Chapter 5 — the Senna's points push you up the world ranking. */
export default function RankScreen({ active }: { active: boolean }) {
  // 1 points count up · 2 reorder · 3 celebrate
  const step = useSteps(active, [500, 1900, 2300]);
  const rows = BASE.map((r) => (r.you && step >= 1 ? { ...r, pts: 7392, cars: 32 } : r));
  const ordered = step >= 2 ? [...rows].sort((a, b) => b.pts - a.pts) : rows;

  return (
    <div className="absolute inset-0 bg-snow text-ink">
      <div className="absolute inset-x-0 top-[60px] flex items-center justify-center">
        <p className="text-[24px] font-bold tracking-[-0.01em]">Leaderboard</p>
        <span className="absolute right-[18px] flex items-center gap-1 rounded-full bg-mist px-[10px] py-[6px] text-[13px] font-bold">
          <Flame className="h-4 w-4 text-[#F26B1D]" fill="#F26B1D" strokeWidth={1.6} /> 12
        </span>
      </div>
      <Segmented id="rank" items={["Friends", "Country", "World"]} active={2} className="absolute left-1/2 top-[104px] -translate-x-1/2" />

      <div className="absolute inset-x-[14px] top-[160px] overflow-hidden rounded-[20px] border border-line">
        <div className="flex items-center justify-center gap-2 border-b border-line bg-mist py-[12px] text-[14px] font-semibold tracking-[0.02em]">
          <Trophy className="h-[18px] w-[18px]" strokeWidth={1.8} /> TOP 50 WORLD
        </div>
        <div className="relative px-[8px] py-[6px]">
          {ordered.map((r, i) => (
            <motion.div
              layout
              key={r.id}
              transition={{ layout: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } }}
              className={cn(
                "relative flex items-center gap-[12px] rounded-[16px] px-[10px] py-[9px]",
                r.you && "bg-snow shadow-[0_0_0_1.5px_#1d1d20]",
              )}
            >
              <span
                className={cn(
                  "grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[14px] font-bold tabular",
                  i < 3 ? cn(MEDAL[i], "text-snow") : "text-ink",
                )}
              >
                {i + 1}
              </span>
              <CarAvatar src={r.avatar} size={50} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[16px] font-semibold">
                  {r.name}
                  {r.verified && <BadgeCheck className="h-[17px] w-[17px] text-snow" fill="#111" strokeWidth={2} />}
                  {r.you && <span className="text-[12px] font-medium text-ash">(you)</span>}
                </span>
                <span className="text-[13px] text-ash">{r.cars} cars</span>
              </span>
              <span className="text-[15px] font-semibold tabular">
                {r.you && step >= 1 ? <CountUp to={7392} from={5180} start duration={1200} /> : r.pts.toLocaleString("en-US")} pts
              </span>
              {r.you && step >= 3 && <Burst />}
            </motion.div>
          ))}
        </div>
      </div>

      <TabBar active="profile" />
    </div>
  );
}

/** Little checkered-tile burst when you climb onto the podium. */
function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const d = 70 + (i % 3) * 22;
        return (
          <motion.span
            key={i}
            className={cn("absolute left-[46px] top-1/2 h-[7px] w-[7px] rounded-[1.5px]", i % 2 ? "bg-ink" : "bg-gold")}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.6, opacity: 0, rotate: 180, scale: 0.6 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}
