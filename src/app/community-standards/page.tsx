import type { Metadata } from "next";
import CommunityStandardsContent from "@/components/CommunityStandardsContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Standards Communautaires",
  description:
    "Standards communautaires de Wheeloh : les règles qui garantissent une communauté de passionnés respectueuse.",
  alternates: { canonical: "/community-standards" },
  openGraph: { url: "/community-standards", locale: "fr_FR", title: "Standards Communautaires | Wheeloh" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Accueil", path: "/" },
          { name: "Standards Communautaires", path: "/community-standards" },
        ])}
      />
      <CommunityStandardsContent />
    </>
  );
}
