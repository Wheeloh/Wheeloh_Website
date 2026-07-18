import type { Metadata } from "next";
import LegalAndPrivacyContent from "@/components/LegalAndPrivacyContent";

// Orphan duplicate of /legal + /privacy combined — nothing links to this route.
// noindex (not just a robots.txt disallow) so Google can actually crawl it,
// see this tag, and drop it from the index if it was indexed previously.
// A robots.txt disallow alone can never de-index an already-indexed URL: it
// blocks the crawl that would let Google discover the noindex tag at all.
export const metadata: Metadata = {
  title: "Mentions légales et confidentialité",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal" },
};

export default function Page() {
  return <LegalAndPrivacyContent />;
}
