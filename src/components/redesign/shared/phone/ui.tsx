"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, House, Image as ImageIcon, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Plays a little timeline while a screen is on stage: returns the index of
 * the last step reached. Resets when the screen leaves, so it replays.
 */
export function useSteps(active: boolean, at: number[], loopAfter?: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(at.length);
      return;
    }
    let timers: number[] = [];
    const run = () => {
      setStep(0);
      timers = at.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
      // Optionally start over `loopAfter` ms after the last step.
      if (loopAfter) timers.push(window.setTimeout(run, at[at.length - 1] + loopAfter));
    };
    run();
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return step;
}

type Tab = "profile" | "home" | "camera" | "garage" | "chat";

const TABS: Array<{ id: Tab; Icon: typeof User }> = [
  { id: "profile", Icon: User },
  { id: "home", Icon: House },
  { id: "camera", Icon: Camera },
  { id: "garage", Icon: ImageIcon },
  { id: "chat", Icon: MessageSquare },
];

/** The app's bottom tab bar. */
export function TabBar({ active }: { active: Tab }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 h-[88px] bg-snow">
      <div className="flex justify-around px-5 pt-[14px] text-ink">
        {TABS.map(({ id, Icon }) => (
          <Icon
            key={id}
            className="h-[27px] w-[27px]"
            strokeWidth={active === id ? 2.5 : 1.6}
            // Only the house reads well filled; other active icons go bold.
            fill={active === id && id === "home" ? "currentColor" : "none"}
            color="currentColor"
          />
        ))}
      </div>
      <span className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink" />
    </div>
  );
}

/** "Gallery | Albums | Map" — the app's segmented control. */
export function Segmented({ id, items, active, className }: { id: string; items: string[]; active: number; className?: string }) {
  return (
    <div className={cn("relative mx-auto flex h-[38px] w-[300px] rounded-[10px] border border-line bg-snow p-[2px]", className)}>
      {items.map((label, i) => (
        <span key={label} className="relative z-10 flex flex-1 items-center justify-center text-[14px] font-medium text-ink/75">
          {i === active && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 rounded-[8px] bg-[#dcdcde]"
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            />
          )}
          <span className="relative">{label}</span>
        </span>
      ))}
    </div>
  );
}

/** Round avatar made from a car photo, like profile pictures in the app. */
export function CarAvatar({ src, size = 40, className }: { src: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

export const ALBUMS = {
  porsche: "/presentation/PC_albums_trie/PORSCHE_Album.png",
  ferrari: "/presentation/PC_albums_trie/FERRARI_Album.png",
  lambo: "/presentation/PC_albums_trie/LAMBO_Album.png",
  bugatti: "/presentation/PC_albums_trie/BUGATTI_Album.png",
  mclaren: "/presentation/PC_albums_trie/MCLAREN_Album.png",
  pagani: "/presentation/PC_albums_trie/PAGANI_Album.png",
};
