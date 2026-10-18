"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { HOME_PATH, type Locale } from "@/lib/i18n";

// The language of the page being rendered. English by default; the /fr
// layout wraps its pages in <LocaleProvider locale="fr">. Components keep
// their copy next to their markup as { en, fr } pairs and pick one with
// useCopy(), so a string and its translation are always edited together.

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

/** This language's half of a { en, fr } copy object. */
export function useCopy<T>(copy: Record<Locale, T>): T {
  return copy[useContext(LocaleContext)];
}

export const useHomePath = () => HOME_PATH[useContext(LocaleContext)];

/**
 * The root layout renders <html lang="en"> for every page (one root layout
 * keeps the static build and the global 404). French pages mark their own
 * content with lang="fr" and set the document's language once mounted, so
 * screen readers, browser translation and rendering crawlers read it as French.
 */
export function DocumentLang({ lang }: { lang: Locale }) {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = lang;
    return () => {
      html.lang = previous;
    };
  }, [lang]);
  return null;
}
