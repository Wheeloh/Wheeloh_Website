import type { Metadata } from "next";
import LegalAndPrivacyContent from "@/components/redesign/shared/pages/LegalAndPrivacyContent";

// Orphan duplicate of /legal + /privacy combined — kept so the route exists
// in every site version; noindex like the original.
export const metadata: Metadata = {
  title: "Mentions légales et confidentialité",
  robots: { index: false, follow: true },
  alternates: { canonical: "/legal" },
};

export default function Page() {
  return <LegalAndPrivacyContent />;
}
