"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flag, RotateCcw, Siren, Star, TrafficCone, type LucideIcon } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import Wordmark from "@/components/redesign/shared/brand/Wordmark";
import { cn } from "@/lib/utils";
import { formatTime, store, type Box, type Difficulty, type Game, type GameEnd, type GameHooks, type Hud, type HudCell, type Room } from "./engine/core";
import { skinById } from "./engine/skins";
import Coin from "./garage/Coin";
import { loadGarage, saveGarage, type Garage } from "./garage/store";
import { ConeGame } from "./games/cones";

// the garage panel loads when it is opened
const GaragePanel = dynamic(() => import("./garage/GaragePanel"), { ssr: false });

const LEVELS: Difficulty[] = ["easy", "normal", "hard"];
const LEVEL_KEY = "wh-404-chase-level";

interface Pop {
  id: number;
  n: number;
  why: string;
  at: number;
}

type Mode = "cones" | "circuit" | "chase";
type GameClass = new (canvas: HTMLCanvasElement, hooks: GameHooks) => Game;

const MODES: { id: Mode; label: string; Icon: LucideIcon; done?: string }[] = [
  { id: "cones", label: "Cones", Icon: TrafficCone },
  { id: "circuit", label: "Circuit", Icon: Flag, done: "Chequered flag." },
  { id: "chase", label: "Chase", Icon: Siren, done: "Busted." },
];

// The cones are the page's own game; the other two load when picked.
const LOAD: Record<Mode, () => Promise<GameClass>> = {
  cones: async () => ConeGame,
  circuit: async () => (await import("./games/circuit")).CircuitGame,
  chase: async () => (await import("./games/chase")).ChaseGame,
};

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

function Cell({ cell, now }: { cell: HudCell; now: number }) {
  if (cell.stars) {
    return (
      <span className="flex gap-0.5" aria-label={`Wanted level ${cell.stars.n} of ${cell.stars.of}`}>
        {Array.from({ length: cell.stars.of }, (_, i) => (
          <Star key={i} className={cn("h-3.5 w-3.5", i < cell.stars!.n ? "fill-ink text-ink" : "text-line")} strokeWidth={2.2} aria-hidden />
        ))}
      </span>
    );
  }
  if (cell.bar !== undefined) {
    const v = Math.max(0, Math.min(1, cell.bar));
    return (
      <span className="flex items-center gap-1.5" aria-label={`Car health ${Math.round(v * 100)}%`}>
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ash">Car</span>
        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-black/[0.08]">
          <span
            className={cn("block h-full rounded-full transition-[width] duration-300", v > 0.5 ? "bg-ink" : v > 0.25 ? "bg-[#F5A524]" : "bg-[#E5322D]")}
            style={{ width: `${v * 100}%` }}
          />
        </span>
      </span>
    );
  }
  if (cell.clock) {
    const { from, to } = cell.clock;
    return (
      <span className="w-11 tabular" role="timer">
        {formatTime(from ? (to ?? now) - from : 0)}
      </span>
    );
  }
  return (
    <span className={cn("tabular", cell.tone === "good" && "text-[oklch(0.5_0.16_145)]", cell.tone === "bad" && "text-[#E5322D]")}>
      {cell.pre && <span className="text-ash">{cell.pre}</span>}
      {cell.main && <span className="font-extrabold">{cell.main}</span>}
      {cell.post && <span className="text-ash">{cell.post}</span>}
    </span>
  );
}

const pill = "pointer-events-auto rounded-full bg-snow shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06]";

export default function NotFoundGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [run, setRun] = useState(0);
  const [hud, setHud] = useState<Hud | null>(null);
  const [end, setEnd] = useState<GameEnd | null>(null);
  const [hint, setHint] = useState<{ x: number; y: number } | null>(null);
  const [lights, setLights] = useState<number | "go" | null>(null);
  const [lightsTop, setLightsTop] = useState(80);
  const [coarse, setCoarse] = useState(false);
  const [now, setNow] = useState(0);
  const [garage, setGarage] = useState<Garage | null>(null);
  const garageRef = useRef<Garage | null>(null);
  const [garageOpen, setGarageOpen] = useState(false);
  const [pops, setPops] = useState<Pop[]>([]);
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState<Difficulty>("normal");
  const levelRef = useRef<Difficulty>("normal");

  // the garage and the chase level live in this browser
  useEffect(() => {
    const g = loadGarage();
    garageRef.current = g;
    setGarage(g);
    const l = store.json<Difficulty>(LEVEL_KEY);
    if (l && LEVELS.includes(l)) {
      levelRef.current = l;
      setLevel(l);
    }
  }, []);

  const updateGarage = (next: Garage) => {
    garageRef.current = next;
    saveGarage(next);
    setGarage(next);
  };

  // coins won in a game: into the garage, and a "+3" floating off the counter
  const earn = (n: number, why: string) => {
    const g = garageRef.current;
    if (g) updateGarage({ ...g, coins: g.coins + n });
    const t = performance.now();
    setPops((list) => {
      const last = list[list.length - 1];
      if (last && last.why === why && t - last.at < 700) return [...list.slice(0, -1), { ...last, n: last.n + n, at: t }];
      return [...list.slice(-3), { id: t, n, why, at: t }];
    });
  };
  useEffect(() => {
    if (!pops.length) return;
    const id = window.setTimeout(() => setPops((list) => list.filter((p) => performance.now() - p.at < 1300)), 1350);
    return () => window.clearTimeout(id);
  }, [pops]);

  const pickLevel = (l: Difficulty) => {
    levelRef.current = l;
    setLevel(l);
    store.set(LEVEL_KEY, l);
    setRun((n) => n + 1);
  };

  // the game to open: the link's #circuit / #chase, or the cones
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    const h = window.location.hash.slice(1);
    setMode(h === "circuit" || h === "chase" ? h : "cones");
  }, []);

  const choose = (m: Mode) => {
    if (m === mode) return;
    window.history.replaceState(null, "", m === "cones" ? window.location.pathname + window.location.search : `#${m}`);
    setMode(m);
  };

  // 1 / 2 / 3 switch games, Enter starts over
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (garageOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        if (t && t.closest("a, button")) return; // a focused link or button keeps its Enter
        e.preventDefault();
        setRun((n) => n + 1);
        return;
      }
      const i = ["Digit1", "Digit2", "Digit3"].indexOf(e.code);
      if (i >= 0) choose(MODES[i].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, garageOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // one game at a time on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mode) return;
    let game: Game | null = null;
    let gone = false;
    setHud(null);
    setEnd(null);
    setHint(null);
    setLights(null);
    setStarted(false);
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const room = (): Room => ({
      top: barRef.current?.getBoundingClientRect().bottom ?? 0,
      avoid: msgRef.current ? inkBox(msgRef.current) : null,
      hintHalf: touch ? 80 : 145,
    });
    const hooks: GameHooks = {
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      room,
      onHud: setHud,
      // under the car, but always whole on screen
      onReady: (p) => {
        const half = touch ? 80 : 145;
        setHint({ x: Math.min(Math.max(p.x, half + 12), window.innerWidth - half - 12), y: p.y });
      },
      onFirstInput: () => {
        setHint(null);
        setStarted(true);
      },
      onEnd: setEnd,
      onEarn: earn,
      skin: () => skinById(garageRef.current?.equipped),
      difficulty: () => levelRef.current,
      onLights: (l) => {
        if (l !== null) setLightsTop((barRef.current?.getBoundingClientRect().bottom ?? 60) + 14);
        setLights(l);
      },
    };
    LOAD[mode]().then((G) => {
      if (gone) return;
      game = new G(canvas, hooks);
      gameRef.current = game;
      if (garageOpenRef.current) game.setPaused(true);
    });
    return () => {
      gone = true;
      game?.destroy();
      gameRef.current = null;
    };
  }, [mode, run]); // eslint-disable-line react-hooks/exhaustive-deps

  // the game holds still while the garage is open
  const garageOpenRef = useRef(false);
  useEffect(() => {
    garageOpenRef.current = garageOpen;
    gameRef.current?.setPaused(garageOpen);
  }, [garageOpen]);

  // overlays under the top bar (start lights, difficulty) follow its height
  const hasHud = hud !== null;
  useEffect(() => {
    const place = () => setLightsTop((barRef.current?.getBoundingClientRect().bottom ?? 60) + 14);
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [mode, hasHud]);

  // lights out: "go" shows for a moment
  useEffect(() => {
    if (lights !== "go") return;
    const id = window.setTimeout(() => setLights(null), 900);
    return () => window.clearTimeout(id);
  }, [lights]);

  // running clocks, at 10 fps
  const live = !garageOpen && !!hud?.cells.some((c) => c.clock && c.clock.from > 0 && c.clock.to === undefined);
  useEffect(() => {
    if (!live) return;
    setNow(performance.now());
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [live]);

  const again = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur(); // give the arrow keys back to the car
    setRun((n) => n + 1);
  };

  const cones = mode === "cones";
  const current = MODES.find((m) => m.id === mode);

  return (
    <div data-version="v3" className="relative h-[100svh] w-full select-none overflow-hidden bg-snow text-ink">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full touch-none" />

      {/* top bar: home, the games, the run */}
      <div
        ref={barRef}
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 sm:gap-3 sm:p-4 lg:px-8"
      >
        <Link
          href="/"
          aria-label="Wheeloh — home"
          className={cn(pill, "flex h-11 shrink-0 items-center gap-2.5 pl-3.5 pr-4 text-ink sm:pr-5 max-[359px]:pr-3.5", !cones && "max-sm:pr-3.5")}
        >
          <FlagMark className="h-[18px] w-auto" />
          {/* racing, a phone needs the room for the lap and the clock */}
          <Wordmark className={cn("h-[15px] w-auto max-[359px]:hidden", !cones && "max-sm:hidden")} title={null} />
        </Link>

        {hud && (
          <div
            translate="no" // scores and clocks: nothing to translate
            className={cn(pill, "relative order-2 flex h-11 items-center gap-2 whitespace-nowrap pl-3 pr-1.5 text-[0.8125rem] font-semibold sm:gap-3 sm:pl-4")}
          >
            {hud.cells.map((c, i) => (
              <span key={i} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && <span className="h-4 w-px bg-line" aria-hidden />}
                <Cell cell={c} now={now} />
              </span>
            ))}
            <button
              type="button"
              onClick={again}
              aria-label={hud.reset}
              aria-keyshortcuts="Enter"
              title={`${hud.reset} (Enter)`}
              className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink transition-colors hover:bg-line"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            </button>
            {hud.meter !== undefined && hud.meter > 0.01 && (
              <span className="absolute inset-x-4 -bottom-1.5 h-1 overflow-hidden rounded-full bg-black/[0.08]" aria-hidden>
                <span className="block h-full rounded-full bg-[#E5322D]" style={{ width: `${hud.meter * 100}%` }} />
              </span>
            )}
          </div>
        )}

        <div className="order-3 flex w-full items-center gap-2 lg:absolute lg:left-1/2 lg:top-4 lg:w-auto lg:-translate-x-1/2">
        <div role="tablist" aria-label="Games" className={cn(pill, "flex h-11 flex-1 items-center gap-1 p-1 lg:flex-none")}>
          {MODES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              title={`${m.label} (${i + 1})`}
              onPointerEnter={() => void LOAD[m.id]()}
              onClick={(e) => {
                e.currentTarget.blur();
                choose(m.id);
              }}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-semibold transition-colors lg:flex-none",
                mode === m.id ? "bg-ink text-snow" : "text-ink hover:bg-mist",
              )}
            >
              <m.Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              {m.label}
            </button>
          ))}
        </div>
        {garage && (
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              setGarageOpen(true);
            }}
            onPointerEnter={() => void import("./garage/GaragePanel")}
            aria-label={`Garage: ${garage.coins} coins`}
            className={cn(pill, "relative flex h-11 shrink-0 items-center gap-1.5 px-3.5 text-[0.8125rem] font-bold transition-colors hover:bg-mist")}
            translate="no"
          >
            <Coin />
            <span className="tabular">{garage.coins}</span>
            <span className="text-ash max-sm:hidden">· Garage</span>
            {/* coins just won float off the counter */}
            {pops.map((p) => (
              <span key={p.id} className="wh-pop pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F5B83D] px-2 py-0.5 text-[0.75rem] font-extrabold text-ink shadow-[0_6px_16px_-6px_rgba(0,0,0,0.4)]">
                +{p.n} <span className="font-semibold opacity-70">{p.why === "cone" && p.n > 1 ? "cones" : p.why}</span>
              </span>
            ))}
          </button>
        )}
        </div>
      </div>

      <style>{`
        .wh-pop { animation: wh-pop 1.3s cubic-bezier(.2,.7,.3,1) forwards; }
        @keyframes wh-pop { 0% { opacity: 0; transform: translate(-50%, -6px) scale(.9); } 15% { opacity: 1; transform: translate(-50%, 0) scale(1); } 75% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, 10px); } }
        @media (prefers-reduced-motion: reduce) { .wh-pop { animation-duration: .01s; animation-delay: 1.2s; } }
      `}</style>

      {/* chase: how hard, before the start */}
      {mode === "chase" && !started && !end && (
        <div className="pointer-events-none absolute inset-x-0 flex justify-center px-3" style={{ top: lightsTop }}>
          <div role="radiogroup" aria-label="Difficulty" className={cn(pill, "flex h-11 items-center gap-1 p-1 pl-3.5 text-[0.8125rem] font-semibold")}>
            <span className="pr-1.5 text-ash">Difficulty</span>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={level === l}
                onClick={(e) => {
                  e.currentTarget.blur();
                  if (l !== level) pickLevel(l);
                }}
                className={cn("h-9 rounded-full px-3.5 capitalize transition-colors", level === l ? "bg-ink text-snow" : "hover:bg-mist")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* start lights (circuit) */}
      {lights !== null && (
        <div
          aria-live="assertive"
          className="pointer-events-none absolute left-1/2 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-3 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)]"
          style={{ top: lightsTop }}
        >
          {lights === "go" ? (
            <span className="px-4 text-[0.9375rem] font-extrabold tracking-[0.12em] text-[#3DDC84]">GO</span>
          ) : (
            Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={cn("h-6 w-6 rounded-full transition-colors duration-100", i < lights ? "bg-[#FF3B30] shadow-[0_0_14px_2px_rgba(255,59,48,0.65)]" : "bg-white/[0.12]")}
              />
            ))
          )}
        </div>
      )}

      {/* how to drive, under the car until the first move */}
      {hint && (
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-snow/85 px-2.5 py-1 text-[0.8125rem] font-semibold text-ash backdrop-blur-sm"
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

      {/* end of a circuit or chase run */}
      {!cones && end && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-5 pb-24 sm:pb-28">
          <div className={cn(pill, "w-full max-w-[24rem] rounded-[1.75rem] p-7 text-center")} aria-live="polite">
            <p className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">{end.title ?? current?.done}</p>
            <p className="mt-2 text-base font-medium text-ash">
              {end.lead} <span className="font-bold text-ink tabular">{end.value}</span>
              {end.tail && <> · {end.tail}</>}
            </p>
            {!!end.coins && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-sm font-bold" translate="no">
                <Coin /> +{end.coins} coins
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={again}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[0.9375rem] font-semibold text-snow transition-transform active:scale-[0.97]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Again
              </button>
              <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full bg-mist px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-line">
                Back to home <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* the message: in full with the cones, folded away while racing */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10 [@media(max-height:540px)]:p-5">
        {cones ? (
          <div ref={msgRef} className="pointer-events-auto max-w-[30rem]">
            <p className="text-sm font-semibold text-ash">Error 404</p>
            <h1 className="mt-2 text-[2.5rem] font-extrabold leading-none tracking-[-0.035em] sm:text-display-l [@media(max-height:540px)]:text-[2rem]">
              Wrong turn.
            </h1>
            <p
              className="mt-3 text-base font-medium text-ash sm:text-lg [@media(max-height:540px)]:mt-2 [@media(max-height:540px)]:text-sm"
              aria-live="polite"
            >
              {end ? (
                <>
                  {end.lead} <span className="font-bold text-ink tabular">{end.value}</span>
                  {end.tail && <> · {end.tail}</>}
                  {!!end.coins && <> · +{end.coins} coins</>}.
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
              {end && (
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
        ) : (
          <div ref={msgRef} className={cn(pill, "inline-flex max-w-full items-center gap-3 py-1.5 pl-4 pr-1.5 sm:-m-3 lg:-m-5")}>
            <h1 className="sr-only">Error 404: wrong turn.</h1>
            <p className="min-w-0 truncate text-[0.8125rem] font-semibold text-ash">
              Error 404 · <span className="text-ink">Wrong turn.</span>
            </p>
            <Link href="/" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[0.8125rem] font-semibold text-snow">
              Home <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        )}
      </div>

      {garageOpen && garage && <GaragePanel garage={garage} onChange={updateGarage} onClose={() => setGarageOpen(false)} />}
    </div>
  );
}
