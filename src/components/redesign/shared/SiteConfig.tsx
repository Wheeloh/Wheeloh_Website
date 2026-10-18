"use client";

import { createContext, useContext, type ReactNode } from "react";

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

const VersionContext = createContext<Version>("v3");

export function SiteConfigProvider({ version, children }: { version: Version; children: ReactNode }) {
  return <VersionContext.Provider value={version}>{children}</VersionContext.Provider>;
}

export const useVersion = () => useContext(VersionContext);
export const useSections = () => SECTIONS[useContext(VersionContext)];
