"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Send, ShieldCheck, Users, X } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import { Reveal, SplitText, useInView } from "@/components/redesign/shared/motion/reveal";
import { ALBUMS, useSteps } from "@/components/redesign/shared/phone/ui";
import { useCopy, useLocale } from "@/components/redesign/shared/Locale";
import { routePath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  en: {
    title: "Built for the scene,\nnot just the camera.",
    intro: "Wheeloh is where spotters meet, chat, compete and show off. Here's what happens after the shot.",
    panels: {
      community: {
        title: "Start a community.",
        body: "Car club, school crew or one-marque fan page — publish news, polls, posts and albums for everyone.",
        link: "Car clubs on Wheeloh",
      },
      chat: { title: "Chat about it.", body: "Message friends one-to-one or in groups, and drop spots straight into the conversation." },
      story: { title: "Made for Stories.", body: "Turn any spot into a polished Instagram story in a single tap." },
      sync: {
        title: "Import years of spots.",
        body: "Scan your camera roll in one tap. Only genuine camera shots count — screenshots and downloads are filtered out.",
      },
    },
    club: { kind: "Community · Public", join: "Join", joined: "Joined", tabs: ["News", "Polls", "Albums", "Meets"], cover: "A Porsche 911 GT3 RS, cover of the Paris Spotter community" },
    chat: { first: "Senna on Quai Branly right now", reply: "No way. Where exactly?", spot: "Spot · Quai Branly", input: "Message…" },
    story: { city: "New York", stamp: "Spotted on Wheeloh", share: "Share to story", shared: "Shared", save: "Save image", alt: "A McLaren 675LT spotted in New York, turned into an Instagram story" },
    sync: { screenshot: "Screenshot", found: "cars found", skipped: "screenshot skipped" },
  },
  fr: {
    title: "Pensé pour la scène,\npas juste pour la photo.",
    intro: "Wheeloh, c’est là que les spotters se retrouvent, discutent, s’affrontent et se montrent. Voici ce qui se passe après la photo.",
    panels: {
      community: {
        title: "Crée ta communauté.",
        body: "Club auto, bande du lycée ou fan page d’une marque — publie actus, sondages, posts et albums pour tout le monde.",
        link: "Les clubs auto sur Wheeloh",
      },
      chat: { title: "Parles-en.", body: "Écris à tes amis en privé ou en groupe, et envoie tes spots directement dans la conversation." },
      story: { title: "Fait pour les stories.", body: "Transforme n’importe quel spot en story Instagram soignée, en un seul tap." },
      sync: {
        title: "Importe des années de spots.",
        body: "Analyse ta pellicule en un tap. Seules les vraies photos prises avec l’appareil comptent — captures d’écran et téléchargements sont écartés.",
      },
    },
    club: { kind: "Communauté · Publique", join: "Rejoindre", joined: "Membre", tabs: ["Actus", "Sondages", "Albums", "Rassos"], cover: "Une Porsche 911 GT3 RS, couverture de la communauté Paris Spotter" },
    chat: { first: "Senna quai Branly, là maintenant", reply: "Sérieux ? Où exactement ?", spot: "Spot · Quai Branly", input: "Message…" },
    story: { city: "New York", stamp: "Spottée sur Wheeloh", share: "Partager en story", shared: "Partagée", save: "Enregistrer l’image", alt: "Une McLaren 675LT spottée à New York, transformée en story Instagram" },
    sync: { screenshot: "Capture", found: "voitures trouvées", skipped: "capture écartée" },
  },
};

type CommunityCopy = (typeof COPY)["en"];

/** Loops through `n` states every `ms` while visible. */
function useLoop(active: boolean, n: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setI(n - 1);
      return;
    }
    const t = window.setInterval(() => setI((v) => (v + 1) % n), ms);
    return () => window.clearInterval(t);
  }, [active, n, ms]);
  return i;
}

export default function Community() {
  const t = useCopy(COPY);
  const locale = useLocale();
  return (
    <section id="community" aria-labelledby="community-title" className="bg-snow py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end">
          <h2 id="community-title" className="text-display-l font-extrabold lg:col-span-7">
            <SplitText text={t.title} lineClassNames={["", "text-ash"]} />
          </h2>
          <Reveal as="p" delay={150} className="max-w-[42ch] text-lg font-medium leading-relaxed text-ash lg:col-span-5 lg:pb-2">
            {t.intro}
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-16">
          <Panel delay={0} {...t.panels.community} href={routePath("clubs", locale)}>
            {(a) => <CommunityUI active={a} t={t.club} />}
          </Panel>
          <Panel delay={100} {...t.panels.chat}>
            {(a) => <ChatUI active={a} t={t.chat} />}
          </Panel>
          <Panel delay={0} {...t.panels.story}>
            {(a) => <StoryUI active={a} t={t.story} />}
          </Panel>
          <Panel delay={100} {...t.panels.sync}>
            {(a) => <SyncUI active={a} t={t.sync} />}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({
  title,
  body,
  link,
  href,
  delay,
  children,
}: {
  title: string;
  body: string;
  link?: string;
  href?: string;
  delay: number;
  children: (active: boolean) => ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -8% 0px" });
  return (
    <Reveal delay={delay} className="rounded-[2rem] bg-mist p-3 sm:p-4">
      <div ref={ref} className="relative h-[18rem] overflow-hidden rounded-[1.5rem]">
        {children(inView)}
      </div>
      <div className="px-3 pb-4 pt-5 sm:px-5 sm:pb-5">
        <h3 className="text-display-s font-extrabold">{title}</h3>
        <p className="mt-2 max-w-[44ch] text-[0.9375rem] font-medium leading-relaxed text-ash sm:text-base">{body}</p>
        {link && href && (
          <Link href={href} className="group mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-bold text-ink">
            {link}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>
    </Reveal>
  );
}

function CommunityUI({ active, t }: { active: boolean; t: CommunityCopy["club"] }) {
  const joined = useLoop(active, 2, 2400) === 1;
  return (
    <div className="absolute inset-0 p-4 sm:p-5">
      <div className="overflow-hidden rounded-3xl bg-snow text-ink shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]">
        <div className="relative h-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/porsche-gt3rs-sm.jpg" alt={t.cover} loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute -bottom-6 left-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink ring-4 ring-snow">
            <FlagMark className="w-8 text-snow" />
          </span>
        </div>
        <div className="px-4 pb-4 pt-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold leading-tight">Paris Spotter</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] font-semibold text-ash">
                <Users className="h-3.5 w-3.5" aria-hidden /> {t.kind}
              </p>
            </div>
            <span
              className={cn(
                "flex h-9 items-center gap-1 rounded-full px-4 text-sm font-bold transition-colors duration-500",
                joined ? "bg-spotted text-snow" : "bg-ink text-snow",
              )}
            >
              {joined && <Check className="h-4 w-4" strokeWidth={3} aria-hidden />}
              {joined ? t.joined : t.join}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[0.75rem] font-bold">
            {t.tabs.map((tab, i) => (
              <span key={tab} className={cn("rounded-full px-3 py-1.5", i === 0 ? "bg-ink text-snow" : "bg-mist text-ink")}>
                {tab}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatUI({ active, t }: { active: boolean; t: CommunityCopy["chat"] }) {
  const step = useSteps(active, [900, 1900, 2900]);
  return (
    <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4 text-[0.875rem] font-medium sm:p-5">
      <Bubble show side="left">{t.first}</Bubble>
      <Bubble show={step >= 1} side="right">
        {t.reply}
      </Bubble>
      <Bubble show={step >= 2} side="left" bare>
        <span className="flex items-center gap-3 rounded-2xl bg-snow p-2 pr-4 text-ink shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/senna-square-sm.jpg" alt="" loading="lazy" className="h-12 w-12 rounded-xl object-cover object-[50%_65%]" />
          <span>
            <span className="block text-[0.8125rem] font-bold">McLaren Senna</span>
            <span className="block text-[0.75rem] font-semibold text-ash">{t.spot}</span>
          </span>
        </span>
      </Bubble>
      <div className="flex h-8 items-center">
        <AnimatePresence>
          {step >= 3 && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="ml-auto flex gap-1 rounded-full bg-snow px-3 py-2 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.3)]"
            >
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-blink rounded-full bg-ink" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-snow py-1.5 pl-4 pr-1.5 text-ash shadow-[0_8px_20px_-12px_rgba(0,0,0,0.3)]">
        <span className="flex-1 text-[0.8125rem]">{t.input}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-snow">
          <Send className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

function Bubble({ show, side, bare, children }: { show: boolean; side: "left" | "right"; bare?: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10, scale: show ? 1 : 0.96 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn(side === "right" ? "ml-auto" : "mr-auto", "max-w-[85%] origin-bottom")}
    >
      {bare ? (
        children
      ) : (
        <span
          className={cn(
            "block rounded-[1.25rem] px-4 py-2.5",
            side === "right" ? "rounded-br-md bg-ink text-snow" : "rounded-bl-md bg-snow text-ink shadow-[0_8px_20px_-12px_rgba(0,0,0,0.3)]",
          )}
        >
          {children}
        </span>
      )}
    </motion.div>
  );
}

function StoryUI({ active, t }: { active: boolean; t: CommunityCopy["story"] }) {
  const shared = useLoop(active, 2, 2600) === 1;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4 p-4 sm:p-5">
      <div
        className={cn(
          "relative h-[15rem] w-[8.5rem] overflow-hidden rounded-[1.25rem] bg-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out-expo sm:h-[16rem] sm:w-[9rem]",
          shared ? "-rotate-3 scale-[1.03]" : "rotate-0",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/mclaren-675lt-sm.jpg" alt={t.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[60%_50%]" />
        <span className="absolute inset-x-2 top-2 flex gap-1">
          <span className="h-0.5 flex-1 rounded-full bg-snow" />
          <span className="h-0.5 flex-1 rounded-full bg-snow/40" />
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <span className="block text-[0.75rem] font-bold text-snow">McLaren 675LT</span>
          <span className="mt-0.5 block text-[0.625rem] font-semibold text-snow/70">{t.city}</span>
          <span className="mt-2 flex w-fit items-center gap-1 rounded-full bg-snow px-2 py-1 text-[0.5625rem] font-bold text-ink">
            <FlagMark className="w-3 text-ink" /> {t.stamp}
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-2 text-[0.8125rem] font-bold">
        <span
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2.5 text-snow transition-colors duration-500",
            shared ? "bg-spotted" : "bg-ink",
          )}
        >
          {shared ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {shared ? t.shared : t.share}
        </span>
        <span className="rounded-full bg-snow px-4 py-2.5 text-ink shadow-[0_8px_20px_-12px_rgba(0,0,0,0.3)]">{t.save}</span>
      </div>
    </div>
  );
}

const ROLL = [
  { src: ALBUMS.porsche, ok: true },
  { src: "/media/senna-square-sm.jpg", ok: true },
  { src: null, ok: false },
  { src: ALBUMS.ferrari, ok: true },
  { src: ALBUMS.lambo, ok: true },
  { src: "/media/mclaren-675lt-sm.jpg", ok: true },
];

function SyncUI({ active, t }: { active: boolean; t: CommunityCopy["sync"] }) {
  const pass = useLoop(active, 2, 3400);
  const [scanned, setScanned] = useState(0);
  useEffect(() => {
    if (!active) return;
    setScanned(0);
    const ts = ROLL.map((_, i) => window.setTimeout(() => setScanned(i + 1), 450 + i * 330));
    return () => ts.forEach(window.clearTimeout);
  }, [active, pass]);
  const found = ROLL.slice(0, scanned).filter((r) => r.ok).length;
  const skipped = ROLL.slice(0, scanned).filter((r) => !r.ok).length;
  return (
    <div className="absolute inset-0 p-4 sm:p-5">
      <div className="grid grid-cols-3 gap-2">
        {ROLL.map((r, i) => (
          <div key={i} className="relative aspect-[5/4] overflow-hidden rounded-xl bg-line">
            {r.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full flex-col justify-between bg-snow p-2 text-ink">
                <span className="h-1.5 w-10 rounded-full bg-line" />
                <span className="h-1.5 w-14 rounded-full bg-line" />
                <span className="h-5 rounded-md bg-mist" />
                <span className="text-[0.5625rem] font-bold text-ash">{t.screenshot}</span>
              </span>
            )}
            <AnimatePresence>
              {scanned > i && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={cn(
                    "absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-snow ring-2 ring-snow",
                    r.ok ? "bg-spotted" : "bg-alert",
                  )}
                >
                  {r.ok ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                </motion.span>
              )}
            </AnimatePresence>
            {scanned === i && <span className="sync-scan absolute inset-x-0 top-0 h-full" />}
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-ash">
        <ShieldCheck className="h-4 w-4 text-spotted" aria-hidden />
        <span className="tabular">{found}</span> {t.found} · <span className="tabular">{skipped}</span> {t.skipped}
      </p>
    </div>
  );
}

// ------------------------------------------------- reused on feature pages

/** The community card, on its own (the car clubs page). */
export function ClubCard({ className }: { className?: string }) {
  const t = useCopy(COPY);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -8% 0px" });
  return (
    <div ref={ref} className={cn("relative h-[18rem] overflow-hidden rounded-[1.5rem]", className)}>
      <CommunityUI active={inView} t={t.club} />
    </div>
  );
}

/** The chat card, on its own. */
export function ChatCard({ className }: { className?: string }) {
  const t = useCopy(COPY);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, rootMargin: "0px 0px -8% 0px" });
  return (
    <div ref={ref} className={cn("relative h-[18rem] overflow-hidden rounded-[1.5rem]", className)}>
      <ChatUI active={inView} t={t.chat} />
    </div>
  );
}
