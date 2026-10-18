import CommunityStandardsContent from "@/components/redesign/shared/pages/CommunityStandardsContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Standards Communautaires",
  description: "Standards communautaires de Wheeloh : les règles qui garantissent une communauté de passionnés respectueuse.",
  locale: "fr",
  paths: ROUTES.communityStandards.paths,
});

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
