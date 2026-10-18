"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { boostLabel, RARITIES, RARITY, SKINS, type Skin } from "../engine/skins";
import Coin from "./Coin";
import SkinPreview from "./SkinPreview";
import { CRATE_COST, DUPLICATE_REFUND, openCrate, type Garage, type Opening } from "./store";

// The garage: open crates with the coins won in the 404 games, collect
// paint jobs, put one on the car. The crate spins a reel of skins that
// slows down onto the one you got.

const TILE = 112;
const GAP = 8;
const SPIN_MS = 5600;

function RarityTag({ skin, className }: { skin: Skin; className?: string }) {
  const r = RARITY[skin.rarity];
  return (
    <span className={cn("text-[0.6875rem] font-bold uppercase tracking-[0.08em]", className)} style={{ color: r.color }}>
      {r.label}
    </span>
  );
}

function Reel({ opening, onDone }: { opening: Opening; onDone: () => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [moving, setMoving] = useState(false);

  // land on the winning tile, a little off its centre so it feels earned
  useLayoutEffect(() => {
    const w = frame.current?.clientWidth ?? 600;
    const jitter = (Math.random() - 0.5) * TILE * 0.6;
    const target = opening.win * (TILE + GAP) + TILE / 2 - w / 2 + jitter;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setMoving(true);
        setX(-target);
      }),
    );
    return () => cancelAnimationFrame(id);
  }, [opening]);

  useEffect(() => {
    if (!moving) return;
    const id = window.setTimeout(onDone, SPIN_MS + 250);
    return () => window.clearTimeout(id);
  }, [moving, onDone]);

  return (
    <div ref={frame} className="relative overflow-hidden rounded-2xl bg-ink py-4">
      <div
        ref={strip}
        className="flex"
        style={{
          gap: GAP,
          transform: `translateX(${x}px)`,
          transition: moving ? `transform ${SPIN_MS}ms cubic-bezier(0.08, 0.62, 0.1, 1)` : "none",
        }}
      >
        {opening.reel.map((s, i) => (
          <div key={i} className="relative shrink-0 overflow-hidden rounded-xl bg-white/[0.06]" style={{ width: TILE, height: 84 }}>
            <SkinPreview skin={s} w={TILE} h={72} />
            <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: RARITY[s.rarity].color }} />
          </div>
        ))}
      </div>
      {/* the marker */}
      <span className="pointer-events-none absolute inset-y-2 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-[#F5B83D] shadow-[0_0_14px_2px_rgba(245,184,61,0.7)]" />
      <span className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}

function Confetti({ color }: { color: string }) {
  const bits = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.3;
    const d = 90 + (i % 5) * 26;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d - 30, r: (i * 47) % 360, c: i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? color : "#F5B83D", delay: (i % 4) * 30 };
  });
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/3" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="wh-confetti absolute h-2 w-1.5 rounded-[1px]"
          style={{ background: b.c, ["--x" as string]: `${b.x}px`, ["--y" as string]: `${b.y}px`, ["--r" as string]: `${b.r}deg`, animationDelay: `${b.delay}ms` }}
        />
      ))}
    </span>
  );
}

export default function GaragePanel({
  garage,
  onChange,
  onClose,
}: {
  garage: Garage;
  onChange: (g: Garage) => void;
  onClose: () => void;
}) {
  const [opening, setOpening] = useState<Opening | null>(null);
  const [revealed, setRevealed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pending = useRef<Garage | null>(null);
  const spinning = !!opening && !revealed;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !spinning) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, spinning]);

  const open = () => {
    const res = openCrate(garage);
    if (!res) return;
    setRevealed(false);
    setOpening(res.opening);
    // the price is paid now; the skin (or the refund) lands when the reel stops
    onChange({ ...garage, coins: garage.coins - CRATE_COST, opened: res.garage.opened });
    pending.current = res.garage;
  };

  const reveal = () => {
    if (pending.current) onChange(pending.current);
    pending.current = null;
    setRevealed(true);
  };

  const equip = (id: string) => onChange({ ...garage, equipped: id });

  const owned = new Set(garage.owned);
  const can = garage.coins >= CRATE_COST;
  const won = opening?.skin;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={() => !spinning && onClose()}>
      <style>{`
        .wh-confetti { animation: wh-confetti 1.1s cubic-bezier(.2,.7,.3,1) forwards; opacity: 0; }
        @keyframes wh-confetti { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(var(--x), calc(var(--y) + 90px)) rotate(var(--r)); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .wh-confetti { animation: none; } }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="garage-title"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92svh] w-full max-w-[46rem] flex-col overflow-hidden rounded-t-[1.75rem] bg-snow text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] sm:rounded-[1.75rem]"
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-7">
          <h2 id="garage-title" className="text-xl font-extrabold tracking-[-0.02em]">
            Garage
          </h2>
          <span className="ml-auto flex h-9 items-center gap-1.5 rounded-full bg-mist px-3 text-[0.875rem] font-bold tabular" translate="no">
            <Coin /> {garage.coins}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            disabled={spinning}
            aria-label="Close the garage"
            className="grid h-9 w-9 place-items-center rounded-full bg-mist transition-colors hover:bg-line disabled:opacity-40"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-5 sm:px-7">
          {/* the crate */}
          {!opening ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl bg-ink p-5 text-snow sm:flex-row sm:p-6">
              <div className="relative grid h-24 w-28 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#2B2D35] to-[#121214] ring-1 ring-white/10">
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-[#F5B83D]/80 shadow-[0_0_18px_2px_rgba(245,184,61,0.45)]" />
                <FlagMark className="relative h-8 w-auto text-snow" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-lg font-extrabold">Mystery crate</p>
                <p className="mt-1 text-sm font-medium text-snow/65">A random car for your garage. Rarer ones drive better. One you already have gives back {DUPLICATE_REFUND} coins.</p>
                <p className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[0.75rem] font-semibold sm:justify-start">
                  {RARITIES.map((r) => (
                    <span key={r} style={{ color: RARITY[r].color === "#8E929C" ? "#B9BCC4" : RARITY[r].color }}>
                      {RARITY[r].label} {RARITY[r].weight}%
                    </span>
                  ))}
                </p>
              </div>
              <button
                type="button"
                onClick={open}
                disabled={!can}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#F5B83D] px-6 text-[0.9375rem] font-bold text-ink transition-transform active:scale-[0.97] disabled:bg-white/10 disabled:text-snow/50"
              >
                Open · <Coin /> {CRATE_COST}
              </button>
            </div>
          ) : !revealed ? (
            <Reel opening={opening} onDone={reveal} />
          ) : (
            won && (
              <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-center text-snow">
                <span
                  className="pointer-events-none absolute left-1/2 top-10 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl"
                  style={{ background: RARITY[won.rarity].color, opacity: 0.35 }}
                />
                {(won.rarity === "epic" || won.rarity === "legendary") && <Confetti color={RARITY[won.rarity].color} />}
                <div className="relative">
                  <SkinPreview skin={won} w={240} h={130} live className="mx-auto" />
                  <RarityTag skin={won} className="mt-2 block" />
                  <p className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">{won.name}</p>
                  <p className="mt-1 text-[0.75rem] font-semibold" style={{ color: RARITY[won.rarity].color === "#8E929C" ? "#B9BCC4" : RARITY[won.rarity].color }}>
                    {boostLabel(won.rarity)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-snow/65">
                    {opening!.duplicate ? (
                      <span className="inline-flex items-center gap-1">
                        Already in your garage · +{opening!.refund} <Coin className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      "New in your garage"
                    )}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    {garage.equipped !== won.id && (
                      <button type="button" onClick={() => equip(won.id)} className="inline-flex h-11 items-center rounded-full bg-snow px-5 text-[0.9375rem] font-bold text-ink">
                        Put it on the car
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={open}
                      disabled={!can}
                      className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[#F5B83D] px-5 text-[0.9375rem] font-bold text-ink disabled:bg-white/10 disabled:text-snow/50"
                    >
                      Open another · <Coin /> {CRATE_COST}
                    </button>
                    <button type="button" onClick={() => setOpening(null)} className="inline-flex h-11 items-center rounded-full bg-white/10 px-5 text-[0.9375rem] font-semibold text-snow">
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
          {!can && !spinning && (
            <p className="mt-3 text-center text-[0.8125rem] font-medium text-ash">
              Coins come from the games: cones knocked over, laps, coins picked up and things smashed in the chase.
            </p>
          )}

          {/* the collection */}
          <div className="mt-7 flex items-baseline justify-between">
            <h3 className="text-base font-extrabold">Collection</h3>
            <span className="text-sm font-semibold text-ash tabular">
              {garage.owned.length} / {SKINS.length}
            </span>
          </div>
          {RARITIES.map((r) => (
            <div key={r} className="mt-4">
              <p className="mb-2 flex flex-wrap items-baseline gap-x-2 text-[0.6875rem] font-bold uppercase tracking-[0.08em]" style={{ color: RARITY[r].color }}>
                {RARITY[r].label}
                <span className="font-semibold normal-case tracking-normal text-ash">{boostLabel(r)}</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {SKINS.filter((s) => s.rarity === r).map((s) => {
                  const have = owned.has(s.id);
                  const on = garage.equipped === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!have || spinning}
                      onClick={() => equip(s.id)}
                      aria-pressed={on}
                      className={cn(
                        "group relative flex flex-col items-center rounded-2xl border p-2 pb-2.5 text-center transition-colors",
                        on ? "border-ink bg-mist" : "border-line hover:border-ink/30",
                        !have && "cursor-default hover:border-line",
                      )}
                    >
                      <span className="relative">
                        <SkinPreview skin={s} w={120} h={70} className={cn(!have && "opacity-[0.12] grayscale")} />
                        {!have && <Lock className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-ash" aria-hidden />}
                      </span>
                      <span className="mt-1 text-[0.8125rem] font-bold">{have ? s.name : "???"}</span>
                      <span className="mt-0.5 flex h-4 items-center gap-1 text-[0.6875rem] font-semibold text-ash">
                        {on ? (
                          <>
                            <Check className="h-3 w-3" aria-hidden /> On the car
                          </>
                        ) : have ? (
                          "Tap to equip"
                        ) : (
                          "Locked"
                        )}
                      </span>
                      <span className="absolute inset-x-3 top-0 h-[3px] rounded-b-full" style={{ background: RARITY[s.rarity].color, opacity: have ? 1 : 0.35 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

