"use client";

import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { Reveal, SplitText, useInViewRef } from "@/components/redesign/shared/motion/reveal";
import { flagFor, type CollectionBrand, type CollectionData } from "@/lib/collection-shared";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "wh-collection";
const EASE = [0.16, 1, 0.3, 1] as const;

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // private mode / blocked storage: the explorer still works for this visit
  }
}

const key = (brand: string, model: string) => `${brand}|${model}`;

// Shown first, before "Show all makers" — the names spotters chase.
const FEATURED = [
  "ferrari",
  "lamborghini",
  "porsche",
  "mclaren",
  "bugatti",
  "pagani",
  "koenigsegg",
  "aston-martin",
  "rolls-royce",
  "bentley",
  "mercedes-benz",
  "bmw",
  "audi",
  "maserati",
  "alpine",
  "lotus",
  "rimac",
  "ford",
];

export default function Collection({ data }: { data: CollectionData }) {
  const [spotted, setSpotted] = useState<Set<string>>(() => new Set());
  const [country, setCountry] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<CollectionBrand | null>(null);
  const gridRef = useInViewRef<HTMLUListElement>({ rootMargin: "0px 0px -10% 0px" });

  useEffect(() => setSpotted(load()), []);

  const toggle = (brand: CollectionBrand, model: string) => {
    setSpotted((prev) => {
      const next = new Set(prev);
      const k = key(brand.id, model);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      save(next);
      return next;
    });
  };

  const reset = () => {
    setSpotted(new Set());
    save(new Set());
  };

  const countries = useMemo(() => {
    const counts = new Map<string, number>();
    data.brands.forEach((b) => counts.set(b.country, (counts.get(b.country) ?? 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [data.brands]);

  const brandCount = (b: CollectionBrand) => b.models.reduce((n, m) => n + (spotted.has(key(b.id, m)) ? 1 : 0), 0);
  const total = spotted.size;
  const pct = (total / data.total) * 100;
  const featured = useMemo(
    () => FEATURED.map((id) => data.brands.find((b) => b.id === id)).filter(Boolean) as CollectionBrand[],
    [data.brands],
  );
  const visible = country !== "all" ? data.brands.filter((b) => b.country === country) : showAll ? data.brands : featured;

  return (
    <section id="collection" aria-labelledby="collection-title" className="sheet relative z-10 -mt-10 pb-24 pt-20 sm:pb-32 sm:pt-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="collection-title" className="text-display-l font-extrabold lg:col-span-7">
            <SplitText text={"1,154 legends.\nHow many have you seen?"} lineClassNames={["", "text-ash"]} />
          </h2>
          <Reveal as="p" delay={200} className="max-w-[44ch] text-lg font-medium leading-relaxed text-ash lg:col-span-5 lg:pb-2">
            The Brand Collection tracks every prestige model from 74 makers, from AC to Zenvo. Tick off the ones you’ve already
            seen — in the app, your spots fill it in on their own.
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* progress + filters */}
          <Reveal className="min-w-0 lg:col-span-4" delay={100}>
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[1.75rem] bg-ink p-6 text-snow sm:p-7">
                <p className="text-sm font-semibold text-smoke">Your collection</p>
                <p className="mt-3 flex items-baseline gap-2 font-extrabold tracking-[-0.04em]">
                  <span className="text-[3.5rem] leading-none tabular">{total}</span>
                  <span className="text-xl text-fog tabular">/ {data.total.toLocaleString("en-US")}</span>
                </p>
                <div className="mt-6 flex items-center justify-between text-sm font-semibold">
                  <span className="tabular">{pct.toFixed(1)}% complete</span>
                  {total > 0 && (
                    <button type="button" onClick={reset} className="flex items-center gap-1.5 text-smoke transition-colors hover:text-snow">
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
                    </button>
                  )}
                </div>
                <span className="mt-3 block h-2 overflow-hidden rounded-full bg-graphite">
                  <span
                    className="block h-full rounded-full bg-spotted transition-[width] duration-700 ease-out-expo"
                    style={{ width: `${Math.max(pct, total ? 0.8 : 0)}%` }}
                  />
                </span>
                <p className="mt-5 text-[0.8125rem] font-medium leading-relaxed text-fog">
                  Saved on this device only. In Wheeloh, every spot completes your collection automatically.
                </p>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-ash">Filter by country</p>
                <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" data-lenis-prevent>
                  <FilterChip active={country === "all"} onClick={() => setCountry("all")}>
                    All makers
                  </FilterChip>
                  {countries.map(([c, n]) => (
                    <FilterChip key={c} active={country === c} onClick={() => setCountry(c)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagFor(c)} alt="" width={16} height={16} className="h-4 w-4 rounded-full object-cover" loading="lazy" />
                      {c}
                      <span className={cn("tabular", country === c ? "text-snow/60" : "text-ash")}>{n}</span>
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* brands */}
          <div className="min-w-0 lg:col-span-8">
            <ul
              ref={gridRef}
              data-stagger
              aria-label="Car makers in the collection"
              className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] sm:gap-3"
            >
              {visible.map((b, i) => {
                const n = brandCount(b);
                return (
                  <li key={b.id} style={{ ["--i" as string]: i }}>
                    <BrandTile brand={b} count={n} onOpen={() => setOpen(b)} />
                  </li>
                );
              })}
            </ul>
            {country === "all" && (
              <div className="mt-6 flex justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                  className="h-12 rounded-full border border-line px-6 text-sm font-bold transition-colors hover:bg-mist"
                >
                  {showAll ? "Show fewer makers" : `Show all ${data.brands.length} makers`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BrandSheet brand={open} spotted={spotted} onToggle={toggle} onClose={() => setOpen(null)} />
    </section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-300",
        active ? "bg-ink text-snow" : "bg-mist text-ink hover:bg-line",
      )}
    >
      {children}
    </button>
  );
}

function Ring({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 68 68" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
      <circle cx="34" cy="34" r={r} fill="none" className="stroke-line" strokeWidth="3" />
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        className="stroke-spotted transition-[stroke-dashoffset] duration-700 ease-out-expo"
      />
    </svg>
  );
}

function BrandTile({ brand, count, onOpen }: { brand: CollectionBrand; count: number; onOpen: () => void }) {
  const total = brand.models.length;
  const done = count === total;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${brand.name}: ${count} of ${total} models spotted`}
      className="group relative flex w-full flex-col items-center rounded-[1.5rem] border border-line bg-snow px-3 pb-4 pt-5 text-center transition-[transform,box-shadow,border-color] duration-500 ease-out-expo hover:-translate-y-1 hover:border-transparent hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] active:scale-[0.98]"
    >
      <span className="relative grid h-[4.25rem] w-[4.25rem] place-items-center">
        <Ring value={count / total} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logo}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
          className="h-10 w-10 object-contain mix-blend-multiply transition-transform duration-500 ease-out-expo group-hover:scale-110"
        />
        {done && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-spotted text-snow ring-2 ring-snow">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          </span>
        )}
      </span>
      <span className="mt-3 line-clamp-1 text-[0.8125rem] font-bold sm:text-[0.9375rem]">{brand.name}</span>
      <span className="text-[0.8125rem] font-semibold text-ash tabular">
        {count}/{total}
      </span>
    </button>
  );
}

function BrandSheet({
  brand,
  spotted,
  onToggle,
  onClose,
}: {
  brand: CollectionBrand | null;
  spotted: Set<string>;
  onToggle: (b: CollectionBrand, model: string) => void;
  onClose: () => void;
}) {
  const [shown, setShown] = useState<CollectionBrand | null>(brand);
  useEffect(() => {
    if (brand) setShown(brand);
  }, [brand]);
  const b = brand ?? shown;
  const count = b ? b.models.filter((m) => spotted.has(key(b.id, m))).length : 0;
  const total = b?.models.length ?? 1;
  const complete = !!b && count === total;

  return (
    <DialogPrimitive.Root open={!!brand} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {brand && b && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-night/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </DialogPrimitive.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="pointer-events-auto flex max-h-[86svh] w-full flex-col rounded-t-[2rem] bg-snow text-ink shadow-2xl outline-none sm:w-[30rem] sm:rounded-[2rem]"
                initial={{ y: "40%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "30%", opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <div className="flex items-center gap-4 border-b border-line px-6 pb-5 pt-6">
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center">
                    <Ring value={count / total} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.logo} alt="" width={34} height={34} className="h-[2.1rem] w-[2.1rem] object-contain mix-blend-multiply" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogPrimitive.Title className="text-display-s font-extrabold">{b.name}</DialogPrimitive.Title>
                    <p className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-ash">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagFor(b.country)} alt="" width={14} height={14} className="h-3.5 w-3.5 rounded-full object-cover" />
                      {b.country} · <span className="tabular">{count} / {total} spotted</span>
                    </p>
                  </div>
                  <DialogPrimitive.Close
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist transition-colors hover:bg-line"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </DialogPrimitive.Close>
                </div>

                <AnimatePresence>
                  {complete && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex items-center justify-center gap-2 overflow-hidden bg-spotted text-sm font-bold text-snow"
                    >
                      <span className="flex items-center gap-2 py-2.5">
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> {b.name} collection complete
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>

                <ul className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" data-lenis-prevent>
                  {b.models.map((m) => {
                    const on = spotted.has(key(b.id, m));
                    return (
                      <li key={m}>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          onClick={() => onToggle(b, m)}
                          className={cn(
                            "flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors duration-300",
                            on ? "bg-spotted/10" : "hover:bg-mist",
                          )}
                        >
                          <span className="text-[1.0625rem] font-semibold">
                            {b.name} {m}
                          </span>
                          <span
                            className={cn(
                              "flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-bold transition-colors duration-300",
                              on ? "text-spotted" : "text-ash",
                            )}
                          >
                            {on && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
                            {on ? "Spotted" : "Not spotted"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-line px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[0.8125rem] font-medium text-ash">
                  Tap a model to mark it as spotted.
                </div>
              </motion.div>
            </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

