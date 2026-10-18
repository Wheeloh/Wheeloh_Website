import LegalContent from "@/components/redesign/shared/pages/LegalContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: "Mentions légales de Wheeloh : éditeur, hébergement, propriété intellectuelle et données personnelles.",
  locale: "fr",
  paths: ROUTES.legal.paths,
});

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
