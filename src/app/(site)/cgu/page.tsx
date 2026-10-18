import CguContent from "@/components/redesign/shared/pages/CguContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Conditions Générales d'Utilisation (CGU)",
  description: "Conditions Générales d'Utilisation de l'application et du site Wheeloh.",
  locale: "fr",
  paths: ROUTES.cgu.paths,
});

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
