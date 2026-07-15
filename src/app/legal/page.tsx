import type { Metadata } from "next";
import LegalContent from "@/components/LegalContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales de Wheeloh : éditeur, hébergement, propriété intellectuelle et données personnelles.",
  alternates: { canonical: "/legal" },
  openGraph: { url: "/legal", locale: "fr_FR", title: "Mentions légales | Wheeloh" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Accueil", path: "/" },
          { name: "Mentions légales", path: "/legal" },
        ])}
      />
      <LegalContent />
    </>
  );
}
