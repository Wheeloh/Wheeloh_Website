"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocale } from "@/components/redesign/shared/Locale";

// What differs between the two redesign previews, besides the home page
// itself: the home sections the header, footer and mobile menu link to.

export const VERSIONS = ["v2", "v3"] as const;
export type Version = (typeof VERSIONS)[number];

export interface SectionLink {
  id: string;
  label: string;
}

export const SECTIONS: Record<Version, SectionLink[]> = {
  v2: [
    { id: "features", label: "How it works" },
    { id: "galaxy", label: "The catalogue" },
    { id: "collection", label: "Collection" },
    { id: "community", label: "Community" },
  ],
  v3: [
    { id: "features", label: "How it works" },
    { id: "community", label: "Community" },
    { id: "affiliate", label: "Affiliates" },
  ],
};

// French labels for the same sections, by id.
const LABELS_FR: Record<string, string> = {
  features: "Fonctionnement",
  galaxy: "Le catalogue",
  collection: "Collection",
  community: "Communauté",
  affiliate: "Affiliés",
};

const VersionContext = createContext<Version>("v3");

export function SiteConfigProvider({ version, children }: { version: Version; children: ReactNode }) {
  return <VersionContext.Provider value={version}>{children}</VersionContext.Provider>;
}

export const useVersion = () => useContext(VersionContext);
export function useSections(): SectionLink[] {
  const sections = SECTIONS[useContext(VersionContext)];
  const locale = useLocale();
  return useMemo(
    () => (locale === "fr" ? sections.map((s) => ({ ...s, label: LABELS_FR[s.id] ?? s.label })) : sections),
    [sections, locale],
  );
}
