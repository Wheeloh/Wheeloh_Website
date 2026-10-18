"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useLenis } from "@studio-freight/react-lenis";
import Wordmark from "@/components/redesign/shared/brand/Wordmark";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { useSections } from "@/components/redesign/shared/SiteConfig";
import { useCopy, useHomePath, useLocale } from "@/components/redesign/shared/Locale";
import { INSTAGRAM_URL, STATUS_URL, TIKTOK_URL } from "@/lib/seo";
import { sectionHref, type Locale } from "@/lib/i18n";
import { alternatePath } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showNavLinks?: boolean;
}

const PAGE_LINKS = [
  { href: "/changelog", label: "Changelog" },
  { href: "/engineering", label: "Engineering" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  en: {
    home: "Wheeloh — home",
    getApp: "Get the app",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    main: "Main",
    mobile: "Mobile",
    menu: "Menu",
    contact: "Contact",
    other: { label: "Français", lang: "fr" as Locale },
  },
  fr: {
    home: "Wheeloh — accueil",
    getApp: "Télécharger",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    main: "Principal",
    mobile: "Mobile",
    menu: "Menu",
    contact: "Contact",
    other: { label: "English", lang: "en" as Locale },
  },
};

/** Smooth in-page scrolling through Lenis, falling back to a normal navigation. */
export function useSectionLink() {
  const lenis = useLenis();
  const pathname = usePathname();
  const home = useHomePath();
  return (id: string) => (e: React.MouseEvent) => {
    if (pathname !== home) return; // let the browser navigate to /#id
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.replaceState(null, "", `#${id}`);
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };
}

export default function Header({ showNavLinks = true }: HeaderProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useCopy(COPY);
  const home = useHomePath();
  const isHome = pathname === home;
  const lenis = useLenis();
  const goTo = useSectionLink();
  const sections = useSections();
  // "Get the app": the home's download band, or this page's own download CTA.
  const toDownload = (e: React.MouseEvent) => {
    if (isHome) return goTo("download")(e);
    const cta = document.querySelector<HTMLElement>("[data-download-cta]");
    if (!cta) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(cta, { offset: -96, duration: 1.6 });
    else cta.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 160);
          last = y;
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy for the home page sections.
  useEffect(() => {
    if (!isHome) {
      setActive(PAGE_LINKS.find((l) => pathname.startsWith(l.href))?.href ?? null);
      return;
    }
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const current = sections.find((s) => visible.get(s.id));
        setActive(current ? current.id : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome, pathname, sections]);

  // Freeze the page behind the mobile menu.
  useEffect(() => {
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [menuOpen, lenis]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = [
    ...sections.map((s) => ({ key: s.id, href: sectionHref(s.id, locale), label: s.label, section: s.id as string | null })),
    ...PAGE_LINKS.map((p) => ({ key: p.href, href: p.href, label: p.label, section: null as string | null })),
  ];
  // Six links need the extra room of an xl viewport; five fit from lg.
  const wide = links.length > 5;
  const indicator = hovered ?? active;
  const pill =
    "pointer-events-auto bg-snow text-ink shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06]";

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-140%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="pointer-events-none fixed inset-x-0 top-0 z-header"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <Link
            href={home}
            aria-label={t.home}
            className={cn(pill, "group flex h-11 shrink-0 items-center gap-2.5 rounded-full pl-3.5 pr-5 transition-transform duration-300 ease-out-expo active:scale-[0.97]")}
          >
            <FlagMark className="h-[18px] w-auto text-ink transition-transform duration-500 ease-out-expo group-hover:-rotate-6" />
            <Wordmark className="h-[15px] w-auto" title={null} />
          </Link>

          {showNavLinks && (
            <nav
              aria-label={t.main}
              className={cn(
                pill,
                "absolute left-1/2 hidden h-11 -translate-x-1/2 items-center rounded-full p-1",
                wide ? "xl:flex" : "lg:flex",
              )}
              onMouseLeave={() => setHovered(null)}
            >
              {links.map((l) => {
                const on = indicator === (l.section ?? l.href);
                const current = active === (l.section ?? l.href);
                return (
                  <Link
                    key={l.key}
                    href={l.href}
                    prefetch={false}
                    onClick={l.section ? goTo(l.section) : undefined}
                    onMouseEnter={() => setHovered(l.section ?? l.href)}
                    onFocus={() => setHovered(l.section ?? l.href)}
                    onBlur={() => setHovered(null)}
                    aria-current={current ? (l.section ? "location" : "page") : undefined}
                    className={cn(
                      "relative flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[0.8125rem] font-semibold tracking-[-0.005em] transition-colors duration-300",
                      on ? "text-snow" : "text-ink/70 hover:text-ink",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={sectionHref("download", locale)}
              onClick={toDownload}
              className={cn(
                pill,
                "group hidden h-11 items-center gap-2 whitespace-nowrap rounded-full pl-5 pr-1.5 text-[0.8125rem] font-semibold sm:flex",
              )}
            >
              {t.getApp}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-snow transition-transform duration-500 ease-out-expo group-hover:rotate-[-45deg]">
                <ArrowDownRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
            {showNavLinks && (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? t.closeMenu : t.openMenu}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className={cn(pill, "relative grid h-11 w-11 place-items-center rounded-full", wide ? "xl:hidden" : "lg:hidden")}
              >
                <span
                  className={cn(
                    "absolute h-[2px] w-[18px] rounded-full bg-ink transition-transform duration-500 ease-out-expo",
                    menuOpen ? "rotate-45" : "-translate-y-[4px]",
                  )}
                />
                <span
                  className={cn(
                    "absolute h-[2px] w-[18px] rounded-full bg-ink transition-transform duration-500 ease-out-expo",
                    menuOpen ? "-rotate-45" : "translate-y-[4px]",
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className={cn("fixed inset-0 z-menu flex flex-col bg-night px-6 pb-8 pt-28", wide ? "xl:hidden" : "lg:hidden")}
            data-lenis-prevent
          >
            <nav aria-label={t.mobile} className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {[...links, { key: "contact", href: sectionHref("contact", locale), label: t.contact, section: "contact" }].map((l, i) => (
                <motion.div
                  key={l.key}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.12 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    prefetch={false}
                    onClick={(e) => {
                      if (l.section) goTo(l.section)(e);
                      setMenuOpen(false);
                    }}
                    className="group flex items-center justify-between border-b border-graphite py-4 text-display-s font-bold text-snow"
                  >
                    {l.label}
                    <ArrowUpRight className="h-5 w-5 text-fog transition-transform duration-300 group-active:translate-x-0.5" aria-hidden />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              className="mt-8 space-y-6"
            >
              <StoreButtons tone="light" campaign="mobile_menu" />
              <div className="flex gap-5 text-sm font-semibold text-smoke">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="hover:text-snow">Instagram</a>
                <a href={TIKTOK_URL} target="_blank" rel="noopener" className="hover:text-snow">TikTok</a>
                <a href={STATUS_URL} target="_blank" rel="noopener" className="hover:text-snow">Status</a>
                <Link href={alternatePath(pathname, t.other.lang)} hrefLang={t.other.lang} lang={t.other.lang} className="ml-auto hover:text-snow">
                  {t.other.label}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
