"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, Flame, Trophy, Wrench } from "lucide-react";
import CountUp from "@/components/redesign/shared/motion/CountUp";
import { Reveal, SplitText, useInView } from "@/components/redesign/shared/motion/reveal";
import Phone from "@/components/redesign/shared/phone/Phone";
import ProgressTrack from "./ProgressTrack";
import PlatesCard from "./PlatesCard";
import FeedScreen from "@/components/redesign/shared/phone/screens/FeedScreen";
import GarageScreen from "@/components/redesign/shared/phone/screens/GarageScreen";
import { ALBUMS, CarAvatar, useSteps } from "@/components/redesign/shared/phone/ui";
import { useCopy, useLocale } from "@/components/redesign/shared/Locale";
import { formatNumber, type Locale } from "@/lib/i18n";
import { routePath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const CARD = "relative overflow-hidden rounded-[2rem] bg-mist";

const COPY = {
  en: {
    title: "One shot.\nThe rest is automatic.",
    intro: "Wheeloh identifies the car, scores the spot, files it in your garage and pins it on the map. You just take the photo.",
    rarity: {
      title: "Rarer cars, bigger scores.",
      body: "Every spot earns points by category — a hypercar is worth far more than a hatchback, and modified cars get a +25% tuning bonus. Post it, watch the likes roll in.",
      link: "How identification and points work",
    },
    garage: { title: "A garage that sorts itself.", body: "Spots land in brand albums on their own. Complete each maker's collection, model by model." },
    map: {
      title: "Every spot, on the map.",
      body: "See exactly where each car was caught. Spot zones — the community's heat map — show where the scene is busiest, and which car meets are on near you.",
      link: "Car meets on Wheeloh",
    },
    rank: { title: "Climb the world ranking.", body: "Every point counts on the Top 50 worldwide — and on the one that matters most, the one with your friends on it." },
    race: {
      title: "Your collection, as a race.",
      body: "Your progress is the share of the 1,154-model catalogue you've spotted, drawn as a road. Your friends sit on the same road at their own percentage — above you means ahead — so you always know who to catch, and by how many cars.",
      stats: ["milestones from 1% to 100%", "levels, Karting pro to Triple Crown king"],
      link: "Browse the 1,154 cars",
    },
    collect: { title: "Collect them all.", body: "Each maker has its own collection. Fill it in one spot at a time — it ticks itself off.", link: "The cars, brand by brand" },
    plates: { title: "Plates disappear.", body: "Erased on your phone, before anything is uploaded.", link: "How plate masking works" },
    news: {
      title: "The car world, daily.",
      body: "Automotive news from the Wheeloh team, right next to your spots.",
      headline: "A Porsche 911 GT3 RS turns heads in Paris with an explosive livery",
      by: "By Wheeloh News",
      when: "1 hour ago",
      alt: "A Porsche 911 GT3 RS with a bold livery in Paris",
    },
    quests: {
      title: "Quests that keep you hunting.",
      body: "Daily challenges, streaks and achievements turn every drive into a hunt.",
      streak: "12-day streak",
      items: ["Spot 3 Italian cars", "Spot a car at a meet", "Share a story"],
    },
    bars: { title: "Points by category", labels: ["Daily", "Sport", "Super", "Hyper"], bonus: "+25% for modified cars" },
    meet: { zones: "Spot zones", day: "Sun", name: "Sunday morning meet", going: (n: number) => `${n} going · 9:00`, join: "Join", joined: "Going" },
    board: { title: "TOP 50 WORLD", you: "You", youTag: "(you)", cars: (n: number) => `${n} cars` },
  },
  fr: {
    title: "Une photo.\nLe reste est automatique.",
    intro: "Wheeloh identifie la voiture, calcule les points du spot, le range dans ton garage et l’épingle sur la carte. Toi, tu prends juste la photo.",
    rarity: {
      title: "Plus c’est rare, plus ça rapporte.",
      body: "Chaque spot rapporte des points selon sa catégorie : une hypercar vaut bien plus qu’une citadine, et les voitures modifiées gagnent un bonus tuning de +25 %. Publie-la et regarde les likes tomber.",
      link: "Comment l’app identifie et note",
    },
    garage: { title: "Un garage qui se range tout seul.", body: "Tes spots arrivent d’eux-mêmes dans des albums par marque. Complète la collection de chaque constructeur, modèle après modèle." },
    map: {
      title: "Chaque spot, sur la carte.",
      body: "Retrouve où chaque voiture a été croisée. Les zones de spots — la heatmap de la communauté — montrent où ça bouge le plus, et quels rassos ont lieu près de chez toi.",
      link: "Les rassos sur Wheeloh",
    },
    rank: { title: "Grimpe au classement mondial.", body: "Chaque point compte dans le Top 50 mondial — et dans celui qui compte vraiment : le classement avec tes amis." },
    race: {
      title: "Ta collection, comme une course.",
      body: "Ta progression, c’est la part des 1 154 modèles du catalogue que tu as spottés, dessinée comme une route. Tes amis roulent sur la même route, à leur propre pourcentage — au-dessus de toi, ils sont devant — pour que tu saches toujours qui rattraper, et de combien de voitures.",
      stats: ["paliers de 1 % à 100 %", "niveaux, de Pro du karting à Roi de la triple couronne"],
      link: "Voir les 1 154 voitures",
    },
    collect: { title: "Attrape-les toutes.", body: "Chaque constructeur a sa collection. Remplis-la un spot à la fois — elle se coche toute seule.", link: "Les voitures, marque par marque" },
    plates: { title: "Les plaques disparaissent.", body: "Effacées sur ton téléphone, avant le moindre envoi.", link: "Comment les plaques sont masquées" },
    news: {
      title: "L’actu auto, chaque jour.",
      body: "Les actus automobiles de l’équipe Wheeloh, juste à côté de tes spots.",
      headline: "Une Porsche 911 GT3 RS fait tourner les têtes à Paris avec une livrée explosive",
      by: "Par Wheeloh News",
      when: "il y a 1 heure",
      alt: "Une Porsche 911 GT3 RS à la livrée voyante dans Paris",
    },
    quests: {
      title: "Des quêtes pour rester en chasse.",
      body: "Défis quotidiens, séries et exploits transforment chaque trajet en chasse.",
      streak: "Série de 12 jours",
      items: ["Spotte 3 voitures italiennes", "Spotte une voiture en rasso", "Partage une story"],
    },
    bars: { title: "Points par catégorie", labels: ["Courante", "Sport", "Super", "Hyper"], bonus: "+25 % pour les voitures modifiées" },
    meet: { zones: "Zones de spots", day: "Dim.", name: "Rasso du dimanche matin", going: (n: number) => `${n} inscrits · 9h00`, join: "Rejoindre", joined: "Inscrit" },
    board: { title: "TOP 50 MONDIAL", you: "Toi", youTag: "(toi)", cars: (n: number) => `${n} voitures` },
  },
};

type FeatureCopy = (typeof COPY)["en"];

export default function Features() {
  const t = useCopy(COPY);
  const locale = useLocale();
  return (
    <section id="features" aria-labelledby="features-title" className="bg-snow py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="features-title" className="text-display-l font-extrabold lg:col-span-7">
            <SplitText text={t.title} lineClassNames={["", "text-ash"]} />
          </h2>
          <Reveal as="p" delay={200} className="max-w-[44ch] text-lg font-medium leading-relaxed text-ash lg:col-span-5 lg:pb-2">
            {t.intro}
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-flow-row-dense md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          <Reveal className={cn(CARD, "min-h-[30rem] md:col-span-2 lg:grid lg:grid-cols-[1fr_minmax(0,22rem)]")}>
            <div className="p-7 sm:p-9">
              <Copy {...t.rarity} href={routePath("identify", locale)} />
              <RarityBars className="mt-8" t={t.bars} />
            </div>
            <PhonePeek className="h-[22rem] lg:h-auto" scale={0.72}>
              {(active) => <FeedScreen active={active} />}
            </PhonePeek>
          </Reveal>

          <Reveal delay={100} className={cn(CARD, "min-h-[30rem]")}>
            <Copy className="p-7 pb-0 sm:p-9 sm:pb-0" {...t.garage} />
            <PhonePeek className="mt-6 h-[20rem]" scale={0.68}>
              {(active) => <GarageScreen active={active} />}
            </PhonePeek>
          </Reveal>

          <Reveal className={cn(CARD, "min-h-[30rem] md:col-span-2 lg:grid lg:grid-cols-[minmax(0,20rem)_1fr]")}>
            <Copy className="p-7 sm:p-9" {...t.map} href={routePath("meets", locale)} />
            <MapPanel className="h-[22rem] lg:h-auto" t={t.meet} />
          </Reveal>

          <Reveal delay={100} className={cn(CARD, "flex min-h-[30rem] flex-col p-7 sm:p-9")}>
            <Copy {...t.rank} />
            <Leaderboard className="mt-7" t={t.board} locale={locale} />
          </Reveal>

          <Reveal className={cn(CARD, "min-h-[30rem] bg-ink text-snow md:col-span-2 lg:grid lg:grid-cols-[1fr_minmax(0,21rem)] lg:gap-6")}>
            <div className="p-7 sm:p-9">
              <Copy tone="dark" {...t.race} href={routePath("cars", locale)} />
              <dl className="mt-8 grid max-w-[22rem] grid-cols-2 gap-3">
                {[
                  { v: "30", l: t.race.stats[0] },
                  { v: "9", l: t.race.stats[1] },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-snow/[0.07] px-4 py-3 ring-1 ring-inset ring-snow/[0.08]">
                    <dt className="sr-only">{s.l}</dt>
                    <dd className="text-xl font-extrabold tabular">{s.v}</dd>
                    <dd className="text-[0.75rem] font-semibold text-smoke">{s.l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="p-3 pt-0 sm:p-4 sm:pt-0 lg:pt-4">
              <ProgressTrack className="h-full" />
            </div>
          </Reveal>

          {/* Column 3 over the last two rows (lg): the collection takes what it
              needs, the plates card takes the rest. Side by side at md. */}
          <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:row-span-2 lg:flex lg:flex-col">
            <Reveal delay={100} className={cn(CARD, "flex flex-col p-7 sm:p-9")}>
              <Copy {...t.collect} href={routePath("cars", locale)} />
              {/* at md this card is stretched to the plates card: the rings sit on its floor */}
              <BrandRings className="mt-auto pt-7" />
            </Reveal>
            <Reveal delay={150} className={cn(CARD, "flex flex-col p-7 sm:p-9 lg:flex-1")}>
              <Copy {...t.plates} href={routePath("plates", locale)} />
              <PlatesCard className="mt-7 flex-1" />
            </Reveal>
          </div>

          <Reveal delay={100} className={cn(CARD, "p-7 sm:p-9")}>
            <Copy title={t.news.title} body={t.news.body} />
            <div className="mt-7 overflow-hidden rounded-2xl bg-snow shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/porsche-gt3rs-sm.jpg" alt={t.news.alt} loading="lazy" className="h-32 w-full object-cover" />
              <div className="p-4">
                <p className="text-[0.9375rem] font-bold leading-snug">{t.news.headline}</p>
                <p className="mt-2 flex items-center justify-between text-[0.75rem] font-semibold text-ash">
                  <span>{t.news.by}</span>
                  <span>{t.news.when}</span>
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} className={cn(CARD, "p-7 sm:p-9")}>
            <Copy title={t.quests.title} body={t.quests.body} />
            <Quests className="mt-7" t={t.quests} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

interface CopyProps {
  title: string;
  body: string;
  /** "Read more" link to the page that covers the feature. */
  link?: string;
  href?: string;
  className?: string;
  tone?: "light" | "dark";
}

function Copy({ title, body, link, href, className, tone = "light" }: CopyProps) {
  return (
    <div className={className}>
      <h3 className={cn("text-display-s font-extrabold", tone === "dark" ? "text-snow" : "text-ink")}>{title}</h3>
      <p className={cn("mt-3 max-w-[36ch] text-[0.9375rem] font-medium leading-relaxed sm:text-base", tone === "dark" ? "text-smoke" : "text-ash")}>
        {body}
      </p>
      {link && href && (
        <Link
          href={href}
          className={cn("group mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-bold", tone === "dark" ? "text-snow" : "text-ink")}
        >
          {link}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/** A phone whose bottom runs past the card edge, cropped like a photo in a layout. */
function PhonePeek({ children, scale = 0.7, className }: { children: (active: boolean) => ReactNode; scale?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -10% 0px" });
  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <Phone scale={scale} tone="dark">
          {children(inView)}
        </Phone>
      </div>
      {/* soften the crop where the phone runs past the card edge */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-mist to-transparent" />
    </div>
  );
}

function RarityBars({ className, t }: { className?: string; t: FeatureCopy["bars"] }) {
  const bars = [18, 34, 58, 84].map((h, i) => ({ label: t.labels[i], h }));
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  return (
    <div ref={ref} className={cn("w-[14rem] rounded-2xl bg-snow p-4 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]", className)}>
      <p className="text-[0.8125rem] font-bold">{t.title}</p>
      <div className="mt-3 flex h-[5.5rem] items-end gap-2">
        {bars.map((b, i) => (
          <span key={b.label} className="flex flex-1 items-end">
            <span
              className={cn("w-full origin-bottom rounded-md transition-transform duration-700 ease-out-expo", i === 3 ? "bg-ink" : "bg-line")}
              style={{ height: b.h, transform: inView ? "scaleY(1)" : "scaleY(0.08)", transitionDelay: `${i * 90}ms` }}
            />
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 text-[0.625rem] font-semibold text-ash">
        {bars.map((b) => (
          <span key={b.label} className="flex-1 text-center">
            {b.label}
          </span>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[0.75rem] font-bold text-spotted">
        <Wrench className="h-3.5 w-3.5" aria-hidden /> {t.bonus}
      </p>
    </div>
  );
}

// --------------------------------------------------------------------- map

const ROADS_MINOR = [
  "M-10 80 L810 20",
  "M-10 170 L810 118",
  "M-10 262 L810 214",
  "M-10 372 L810 322",
  "M-10 470 L810 436",
  "M60 -10 L116 530",
  "M190 -10 L230 530",
  "M330 -10 L360 530",
  "M470 -10 L500 530",
  "M610 -10 L640 530",
  "M730 -10 L760 530",
  "M250 300 C300 260 360 280 390 240",
  "M500 420 C560 380 620 420 690 370",
];
const ROADS_MAJOR = ["M-20 500 C120 420 260 360 400 300 S700 150 820 90", "M-20 200 C200 230 420 280 820 340"];

function WideMap({ drawn }: { drawn: boolean }) {
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="800" height="520" fill="#F3F2F5" />
      <path d="M0 0 H210 C190 70 120 110 0 120 Z" fill="#CDEBD6" />
      <path d="M600 420 L800 380 V520 H560 Z" fill="#CDEBD6" />
      <path d="M430 90 C480 70 540 85 548 120 C556 155 505 170 465 160 C425 150 405 110 430 90 Z" fill="#CDEBD6" />
      <path d="M120 260 L190 244 L206 320 L136 338 Z" fill="#A9DDF0" />
      <path d="M150 350 L196 340 L204 390 L158 398 Z" fill="#A9DDF0" />
      <path d="M300 330 C360 310 430 320 445 355 C410 385 345 388 300 372 Z" fill="#F6EBD3" />
      <path d="M620 200 C660 190 720 200 730 232 C700 254 655 250 620 232 Z" fill="#F6EBD3" />
      <g fill="none" strokeLinecap="round" className={cn("map-roads", drawn && "is-drawn")}>
        {ROADS_MINOR.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="#DCE1E8" strokeWidth="8" pathLength={1} />
            <path d={d} stroke="#FFFFFF" strokeWidth="5" pathLength={1} />
          </g>
        ))}
        {ROADS_MAJOR.map((d, i) => (
          <g key={`m${i}`}>
            <path d={d} stroke="#7F97B2" strokeWidth="13" pathLength={1} />
            <path d={d} stroke="#9DB2C9" strokeWidth="9" pathLength={1} />
          </g>
        ))}
      </g>
      <g fontFamily="var(--font-sans)" fontWeight="700" fontSize="12">
        <rect x="452" y="290" width="38" height="20" rx="3" fill="#F4C934" stroke="#C9A21E" />
        <text x="471" y="304" textAnchor="middle" fill="#1d1d1f">D10</text>
        <rect x="70" y="196" width="46" height="20" rx="3" fill="#F4C934" stroke="#C9A21E" />
        <text x="93" y="210" textAnchor="middle" fill="#1d1d1f">D185</text>
      </g>
    </svg>
  );
}

const PINS = [
  { x: "26%", y: "40%", src: ALBUMS.lambo },
  { x: "54%", y: "58%", src: "/media/senna-square-sm.jpg", fresh: true },
  { x: "76%", y: "28%", src: ALBUMS.ferrari },
];
const HEAT = [
  { x: "30%", y: "45%", r: 170 },
  { x: "58%", y: "60%", r: 210 },
  { x: "78%", y: "32%", r: 150 },
];

function MapPanel({ className, t }: { className?: string; t: FeatureCopy["meet"] }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -10% 0px" });
  // 1 roads + pins · 2 community layer · 3 meet card · 4 joined
  const step = useSteps(inView, [200, 1400, 2200, 3200]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <WideMap drawn={step >= 1} />

      {HEAT.map((h, i) => (
        <span
          key={i}
          className={cn("map-heat absolute rounded-full transition-opacity duration-1000", step >= 2 ? "opacity-100" : "opacity-0")}
          style={{
            left: `calc(${h.x} - ${h.r / 2}px)`,
            top: `calc(${h.y} - ${h.r / 2}px)`,
            width: h.r,
            height: h.r,
            animationDelay: `${i * -0.8}s`,
            background: "radial-gradient(circle, rgba(232,59,58,0.4) 0%, rgba(249,180,1,0.22) 45%, transparent 70%)",
          }}
        />
      ))}

      {PINS.map((p, i) => (
        <div
          key={i}
          className={cn(
            "absolute z-10 -translate-x-1/2 -translate-y-full transition-[transform,opacity] duration-700 ease-out-expo",
            step >= 1 ? "opacity-100" : "-translate-y-[160%] opacity-0",
          )}
          style={{ left: p.x, top: p.y, transitionDelay: step >= 1 ? `${200 + i * 140}ms` : "0ms" }}
        >
          <div className={cn("rounded-[13px] bg-snow p-[3px] shadow-[0_8px_18px_-6px_rgba(0,0,0,0.45)]", p.fresh && "ring-2 ring-spotted")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" loading="lazy" className="h-[52px] w-[52px] rounded-[10px] object-cover" />
          </div>
          <span className="mx-auto block h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-snow" />
        </div>
      ))}

      <span className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-snow px-3 py-2 text-[0.8125rem] font-semibold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]">
        <Flame
          className={cn("h-4 w-4 transition-colors duration-500", step >= 2 ? "text-[#FF821E]" : "text-line")}
          fill={step >= 2 ? "#FF821E" : "currentColor"}
          strokeWidth={1.6}
          aria-hidden
        />
        {t.zones}
      </span>

      <div
        className={cn(
          "absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 rounded-[1.25rem] bg-snow p-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-700 ease-out-expo sm:right-auto sm:w-[23rem]",
          step >= 3 ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0",
        )}
      >
        <span className="flex h-[52px] w-[48px] shrink-0 flex-col items-center justify-center rounded-xl bg-ink text-snow">
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.04em] text-snow/70">{t.day}</span>
          <span className="text-xl font-bold leading-none">14</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-bold">{t.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] font-medium text-ash">
            <span className="flex -space-x-2">
              <CarAvatar src={ALBUMS.mclaren} size={20} className="ring-2 ring-snow" />
              <CarAvatar src={ALBUMS.pagani} size={20} className="ring-2 ring-snow" />
              <CarAvatar src="/media/porsche-gt3rs-sm.jpg" size={20} className="ring-2 ring-snow" />
            </span>
            <span className="tabular">{t.going(step >= 4 ? 19 : 18)}</span>
          </span>
        </span>
        <span
          className={cn(
            "flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 text-[0.8125rem] font-bold text-snow transition-colors duration-300",
            step >= 4 ? "bg-spotted" : "bg-ink",
          )}
        >
          {step >= 4 ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> {t.joined}
            </>
          ) : (
            t.join
          )}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- leaderboard

interface Row {
  id: string;
  name: string;
  cars: number;
  pts: number;
  avatar: string;
  verified?: boolean;
  you?: boolean;
}

const RANKING: Row[] = [
  { id: "louis", name: "Louis", cars: 40, pts: 15600, avatar: ALBUMS.ferrari },
  { id: "ines", name: "Inès", cars: 52, pts: 9850, avatar: ALBUMS.lambo },
  { id: "sylvain", name: "Sylvain", cars: 55, pts: 7350, avatar: "/media/mclaren-675lt-sm.jpg", verified: true },
  { id: "georges", name: "Georges", cars: 10, pts: 5600, avatar: ALBUMS.bugatti },
  { id: "you", name: "You", cars: 31, pts: 5180, avatar: "/media/senna-square-sm.jpg", you: true },
];
const MEDAL = ["bg-gold", "bg-silver", "bg-bronze"];

function Leaderboard({ className, t, locale }: { className?: string; t: FeatureCopy["board"]; locale: Locale }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -10% 0px" });
  // 1 points count up · 2 reorder
  const step = useSteps(inView, [600, 2000]);
  const rows = RANKING.map((r) => (r.you && step >= 1 ? { ...r, pts: 7392, cars: 32 } : r));
  const ordered = step >= 2 ? [...rows].sort((a, b) => b.pts - a.pts) : rows;

  return (
    <div ref={ref} className={cn("overflow-hidden rounded-[1.25rem] bg-snow shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]", className)}>
      <div className="flex items-center justify-between border-b border-line bg-mist px-4 py-3 text-[0.75rem] font-bold tracking-[0.03em] text-ink">
        <span className="flex items-center gap-2">
          <Trophy className="h-4 w-4" strokeWidth={1.8} aria-hidden /> {t.title}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-snow px-2 py-1 text-[0.6875rem] text-ink ring-1 ring-line">
          <Flame className="h-3.5 w-3.5 text-[#F26B1D]" fill="#F26B1D" aria-hidden /> 12
        </span>
      </div>
      <ul className="px-2 pb-2">
        {ordered.map((r, i) => (
          <motion.li
            layout
            key={r.id}
            transition={{ layout: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } }}
            className={cn("flex items-center gap-3 rounded-xl px-2 py-2", r.you && "bg-mist ring-1 ring-inset ring-ink/15")}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.75rem] font-bold tabular",
                i < 3 ? cn(MEDAL[i], "text-snow") : "text-ash",
              )}
            >
              {i + 1}
            </span>
            <CarAvatar src={r.avatar} size={34} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[0.875rem] font-semibold">
                {r.you ? t.you : r.name}
                {r.verified && <BadgeCheck className="h-4 w-4 text-snow" fill="#111" strokeWidth={2} aria-hidden />}
                {r.you && <span className="text-[0.6875rem] font-medium text-ash">{t.youTag}</span>}
              </span>
              <span className="text-[0.75rem] text-ash">{t.cars(r.cars)}</span>
            </span>
            <span translate="no" className="text-[0.8125rem] font-semibold tabular">
              {r.you && step >= 1 ? <CountUp to={7392} from={5180} start duration={1200} /> : formatNumber(r.pts, locale)} pts
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------- brand collection

const BRANDS = [
  { name: "McLaren", logo: "/car-brands/logos/mclaren.png", done: 7, total: 26 },
  { name: "Porsche", logo: "/car-brands/logos/porsche.png", done: 20, total: 66 },
  { name: "Ferrari", logo: "/car-brands/logos/ferrari.png", done: 12, total: 91 },
];

function BrandRings({ className }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className={cn("grid grid-cols-3 gap-3", className)}>
      {BRANDS.map((b, i) => (
        <div key={b.name} className="flex flex-col items-center rounded-2xl bg-snow px-2 pb-3 pt-4 text-center shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]">
          <span className="relative grid h-16 w-16 place-items-center">
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
                strokeDashoffset={inView ? c * (1 - b.done / b.total) : c}
                className="stroke-spotted transition-[stroke-dashoffset] duration-1000 ease-out-expo"
                style={{ transitionDelay: `${i * 120}ms` }}
              />
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.logo} alt="" loading="lazy" className="h-9 w-9 object-contain mix-blend-multiply" />
          </span>
          <span className="mt-2 text-[0.8125rem] font-bold">{b.name}</span>
          <span className="text-[0.75rem] font-semibold text-ash tabular">
            {b.done}/{b.total}
          </span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ quests

function Quests({ className, t }: { className?: string; t: FeatureCopy["quests"] }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false });
  const tick = useSteps(inView, [900, 2000]);
  const quests = [
    { label: t.items[0], done: 2 + (tick >= 1 ? 1 : 0), of: 3 },
    { label: t.items[1], done: 1, of: 1 },
    { label: t.items[2], done: tick >= 2 ? 1 : 0, of: 1 },
  ];
  return (
    <div ref={ref} className={className}>
      <div className="flex items-center justify-between rounded-2xl bg-snow px-4 py-3 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]">
        <span className="flex items-center gap-2 text-[0.9375rem] font-bold">
          <Flame className="h-5 w-5 text-[#F26B1D]" fill="#F26B1D" strokeWidth={1.6} aria-hidden /> {t.streak}
        </span>
        <span className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={cn("h-2 w-2 rounded-full", i < 6 || tick >= 1 ? "bg-[#F26B1D]" : "bg-line")} />
          ))}
        </span>
      </div>
      <ul className="mt-2 space-y-2">
        {quests.map((q) => {
          const done = q.done >= q.of;
          return (
            <li key={q.label} className="rounded-2xl bg-snow px-4 py-3">
              <div className="flex items-center justify-between text-[0.875rem] font-semibold">
                <span className="flex items-center gap-2">
                  <span className={cn("grid h-5 w-5 place-items-center rounded-full transition-colors duration-500", done ? "bg-spotted text-snow" : "bg-line")}>
                    {done && <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />}
                  </span>
                  {q.label}
                </span>
                <span className="tabular text-ash">
                  {Math.min(q.done, q.of)}/{q.of}
                </span>
              </div>
              <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-mist">
                <span
                  className="block h-full rounded-full bg-spotted transition-[width] duration-700 ease-out-expo"
                  style={{ width: `${(Math.min(q.done, q.of) / q.of) * 100}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ------------------------------------------------- reused on feature pages

/** The map card with its car meet, on its own (the car meets page). */
export function MeetsMap({ className }: { className?: string }) {
  const t = useCopy(COPY);
  return <MapPanel className={className} t={t.meet} />;
}

/** The world ranking card, on its own. */
export function RankingCard({ className }: { className?: string }) {
  const t = useCopy(COPY);
  const locale = useLocale();
  return <Leaderboard className={className} t={t.board} locale={locale} />;
}
