import type { Metadata } from "next";
import CguContent from "@/components/CguContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU)",
  description:
    "Conditions Générales d'Utilisation de l'application et du site Wheeloh.",
  alternates: { canonical: "/cgu" },
  openGraph: { url: "/cgu", locale: "fr_FR", title: "CGU | Wheeloh" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Accueil", path: "/" },
          { name: "CGU", path: "/cgu" },
        ])}
      />
      <CguContent />
    </>
  );
}
