"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import Wordmark from "@/components/redesign/shared/brand/Wordmark";
import { cn } from "@/lib/utils";
import { ConeGame, type Box, type Room } from "./ConeGame";

const BEST_KEY = "wh-404-best";

/** The message's ink: its lines of text and its buttons, not its box. */
function inkBox(el: HTMLElement): Box | null {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  const add = (r: DOMRect) => {
    if (!r.width || !r.height) return;
    x1 = Math.min(x1, r.left);
    y1 = Math.min(y1, r.top);
    x2 = Math.max(x2, r.right);
    y2 = Math.max(y2, r.bottom);
  };
  const range = document.createRange();
  el.querySelectorAll("h1, p").forEach((t) => {
    range.selectNodeContents(t);
    add(range.getBoundingClientRect());
  });
  el.querySelectorAll("a, button").forEach((b) => add(b.getBoundingClientRect()));
  return x2 > x1 ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
}

const time = (ms: number) => {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
};

function Key({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <kbd
      className={cn(
        "grid h-7 place-items-center rounded-md border border-line bg-snow font-sans text-[0.75rem] font-bold text-ink shadow-[0_1px_0_rgba(0,0,0,0.08)]",
        wide ? "px-2.5" : "w-7",
      )}
    >
      {children}
    </kbd>
  );
}

export default function NotFoundGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ConeGame | null>(null);
  const [round, setRound] = useState(0);
  const [stats, setStats] = useState({ down: 0, total: 0 });
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [wonAt, setWonAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setCoarse(touch);
    try {
      const stored = Number(localStorage.getItem(BEST_KEY));
      if (stored > 0) setBest(stored);
    } catch {
      // storage blocked: no best time, the game still works
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const room = (): Room => ({
      top: barRef.current?.getBoundingClientRect().bottom ?? 0,
      avoid: msgRef.current ? inkBox(msgRef.current) : null,
      hintHalf: touch ? 80 : 145,
    });
    const game = new ConeGame(canvas, {
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      room,
      onStats: (down, total) => setStats({ down, total }),
      onReady: (p) => setHint(p),
      onFirstInput: () => {
        setHint(null);
        setStartedAt(performance.now());
      },
      onWin: () => setWonAt(performance.now()),
    });
    gameRef.current = game;
    return () => game.destroy();
  }, []);

  // the clock, at 10 fps while a run is on
  useEffect(() => {
    if (startedAt === null || wonAt !== null) return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt, wonAt]);

  useEffect(() => {
    if (wonAt === null || startedAt === null) return;
    const run = wonAt - startedAt;
    setBest((b) => {
      const next = b === null ? run : Math.min(b, run);
      try {
        localStorage.setItem(BEST_KEY, String(Math.round(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, [wonAt, startedAt]);

  const again = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur(); // give the arrow keys back to the car
    setStartedAt(null);
    setWonAt(null);
    setNow(0);
    setRound((n) => n + 1);
  };

  // once the message is back to its first line, the number is laid out again around it
  useEffect(() => {
    if (round > 0) gameRef.current?.reset();
  }, [round]);

  const won = wonAt !== null;
  const elapsed = startedAt === null ? 0 : (wonAt ?? now) - startedAt;

  return (
    <div data-version="v3" className="relative h-[100svh] w-full select-none overflow-hidden bg-snow text-ink">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full touch-none" />

      {/* top bar: home + the run */}
      <div
        ref={barRef}
        className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:gap-3 sm:p-4 lg:px-8"
      >
        <Link
          href="/"
          aria-label="Wheeloh — home"
          className="pointer-events-auto flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-snow pl-3.5 pr-4 text-ink sm:pr-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] max-[359px]:pr-3.5"
        >
          <FlagMark className="h-[18px] w-auto" />
          <Wordmark className="h-[15px] w-auto max-[359px]:hidden" title={null} />
        </Link>
        {stats.total > 0 && (
          <div className="pointer-events-auto flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-snow pl-3 pr-1.5 text-[0.8125rem] font-semibold shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] sm:gap-3 sm:pl-4">
            <span className="tabular">
              <span className="font-extrabold">{stats.down}</span>
              <span className="text-ash"> / {stats.total} down</span>
            </span>
            <span className="h-4 w-px bg-line" aria-hidden />
            <span className="w-11 tabular" role="timer">
              {time(elapsed)}
            </span>
            <button
              type="button"
              onClick={again}
              aria-label="Put the cones back"
              className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink transition-colors hover:bg-line"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* how to drive, under the car until the first move */}
      {hint && (
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[0.8125rem] font-semibold text-ash transition-opacity duration-500"
          style={{ left: hint.x, top: hint.y }}
        >
          {coarse ? (
            "Hold anywhere to drive"
          ) : (
            <>
              <span className="flex gap-1">
                <Key>
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.4} aria-label="left" />
                </Key>
                <Key>
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.4} aria-label="up" />
                </Key>
                <Key>
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.4} aria-label="down" />
                </Key>
                <Key>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} aria-label="right" />
                </Key>
              </span>
              drive
              <span className="ml-2">
                <Key wide>space</Key>
              </span>
              drift
            </>
          )}
        </div>
      )}

      {/* the message */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10 [@media(max-height:540px)]:p-5">
        <div ref={msgRef} className="pointer-events-auto max-w-[30rem]">
          <p className="text-sm font-semibold text-ash">Error 404</p>
          <h1 className="mt-2 text-[2.5rem] font-extrabold leading-none tracking-[-0.035em] sm:text-display-l [@media(max-height:540px)]:text-[2rem]">
            Wrong turn.
          </h1>
          <p
            className="mt-3 text-base font-medium text-ash sm:text-lg [@media(max-height:540px)]:mt-2 [@media(max-height:540px)]:text-sm"
            aria-live="polite"
          >
            {won ? (
              <>
                All {stats.total} cones down in <span className="font-bold text-ink tabular">{time(elapsed)}</span>
                {best !== null && (
                  <>
                    {" "}
                    · best <span className="tabular">{time(best)}</span>
                  </>
                )}
                .
              </>
            ) : (
              "This page doesn't exist. The cones do."
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 [@media(max-height:540px)]:mt-4">
            <Link
              href="/"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink pl-6 pr-2 text-[0.9375rem] font-semibold text-snow transition-transform active:scale-[0.97]"
            >
              Back to home
              <span className="grid h-8 w-8 place-items-center rounded-full bg-snow text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
            {won && (
              <button
                type="button"
                onClick={again}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-mist px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-line"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
