"use client";

import { Check, X } from "lucide-react";
import { useInView } from "@/components/redesign/shared/motion/reveal";
import { useSteps } from "@/components/redesign/shared/phone/ui";
import { useCopy } from "@/components/redesign/shared/Locale";
import { cn } from "@/lib/utils";

// The feed's photo game, as the app plays it (posts/guess): the photo starts
// zoomed in on the car and zooms out after every attempt, then shows in full
// once revealed, with a 420 ms ease-out-cubic tween. Each field turns green or
// red; a green field stays filled in. Strings are the app's own (posts.guess).
// The app maps its kGuessZoomScales curve (8, 5.8, 4, 2.6, 1.5) onto a first
// zoom fitted to the car, between 4.5 and 11 (guessGameZoomScale); this photo
// is small, so it starts at the lowest first zoom the app allows, 4.5.
const ZOOM = [8, 5.8, 4, 2.6, 1.5].map((ref) => 1.5 + (4.5 - 1.5) * ((ref - 1.5) / (8 - 1.5)));
// Centre of the car in the photo (the app centres on its YOLO car box). The
// full-size photo, so the first, tightest crops stay sharp.
const ORIGIN = "52% 56%";

const COPY = {
  en: {
    title: "Guess the car!",
    attempts: "Attempts",
    fields: ["Make", "Model", "Year"],
    won: "Nailed it!",
    answer: "It was: Porsche 911 GT3 RS (2023)",
    alt: "A Porsche 911 GT3 RS, the answer of a Guess the car game in the Wheeloh feed",
  },
  fr: {
    title: "Devine la caisse !",
    attempts: "Essais",
    fields: ["Marque", "Modèle", "Année"],
    won: "Bravo !",
    answer: "C'était : Porsche 911 GT3 RS (2023)",
    alt: "Une Porsche 911 GT3 RS, la réponse d'une partie de Devine la caisse dans le feed Wheeloh",
  },
};

// Three attempts: make right, then the model, then the year.
const ATTEMPTS: Array<Array<[string, boolean]>> = [
  [["Porsche", true], ["Cayman GT4", false], ["2021", false]],
  [["Porsche", true], ["911 GT3 RS", true], ["2019", false]],
  [["Porsche", true], ["911 GT3 RS", true], ["2023", true]],
];

export default function GuessCard({ className }: { className?: string }) {
  const t = useCopy(COPY);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -10% 0px" });
  // 1, 2, 3: an attempt is played · 4: the answer shows
  const step = useSteps(inView, [1400, 2900, 4400, 5000], 3600);
  const played = Math.min(step, ATTEMPTS.length);
  const won = played === ATTEMPTS.length;
  const scale = won ? 1 : ZOOM[played];

  return (
    <div ref={ref} className={cn("overflow-hidden rounded-[1.5rem] bg-snow shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/porsche-gt3rs.jpg"
          alt={t.alt}
          loading="lazy"
          className="h-full w-full object-cover [transition:transform_420ms_cubic-bezier(0.33,1,0.68,1)]"
          style={{ transform: `scale(${scale})`, transformOrigin: ORIGIN }}
        />
        {/* the app's diagonal watermark, shown while the game starts */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700",
            played === 0 ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="-rotate-[18deg] text-[2rem] font-black tracking-[-0.02em] text-snow/90 [text-shadow:0_3px_12px_rgba(0,0,0,0.6)] sm:text-[2.375rem]">
            {t.title}
          </span>
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-[0.8125rem] font-semibold text-ash">
          <span>{t.attempts}</span>
          <span className="flex gap-1.5" aria-hidden>
            {Array.from({ length: ZOOM.length }).map((_, i) => (
              <span key={i} className={cn("h-2 w-2 rounded-full transition-colors duration-500", i < played ? "bg-ink" : "bg-line")} />
            ))}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-[0.9fr_1.3fr_0.7fr] gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ash">
          {t.fields.map((f) => (
            <span key={f} className="px-2">
              {f}
            </span>
          ))}
        </div>
        <ul className="mt-1.5 space-y-1.5">
          {ATTEMPTS.map((row, i) => (
            <li
              key={i}
              className={cn(
                "grid grid-cols-[0.9fr_1.3fr_0.7fr] gap-1.5 transition-[opacity,transform] duration-500 ease-out-expo",
                played > i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              )}
            >
              {row.map(([value, ok], j) => (
                <span
                  key={j}
                  className={cn(
                    "flex min-w-0 items-center gap-1 rounded-xl px-2 py-2 text-[0.8125rem] font-semibold text-snow",
                    ok ? "bg-spotted" : "bg-alert",
                  )}
                >
                  {ok ? <Check className="h-3 w-3 shrink-0" strokeWidth={3.5} aria-hidden /> : <X className="h-3 w-3 shrink-0" strokeWidth={3.5} aria-hidden />}
                  <span className="truncate tabular">{value}</span>
                </span>
              ))}
            </li>
          ))}
        </ul>
        <p className={cn("mt-3 text-[0.8125rem] font-semibold text-ash transition-opacity duration-500", step >= 4 ? "opacity-100" : "opacity-0")}>
          <span className="font-bold text-spotted">{t.won}</span> {t.answer}
        </p>
      </div>
    </div>
  );
}
