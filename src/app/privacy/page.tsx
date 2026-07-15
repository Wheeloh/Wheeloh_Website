import type { Metadata } from "next";
import PrivacyContent from "@/components/PrivacyContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Wheeloh : quelles données sont traitées et comment nous les protégeons.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", locale: "fr_FR", title: "Politique de confidentialité | Wheeloh" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Accueil", path: "/" },
          { name: "Politique de confidentialité", path: "/privacy" },
        ])}
      />
      <PrivacyContent />
    </>
  );
}
