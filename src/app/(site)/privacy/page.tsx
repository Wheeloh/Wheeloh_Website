import PrivacyContent from "@/components/redesign/shared/pages/PrivacyContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Wheeloh : quelles données sont traitées et comment nous les protégeons.",
  locale: "fr",
  paths: ROUTES.privacy.paths,
});

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
