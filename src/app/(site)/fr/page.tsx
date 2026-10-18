import HomePage from "@/components/redesign/v3/HomePage";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";
import { SITE_DESCRIPTIONS } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Wheeloh — L’app de carspotting | Spotte et identifie les voitures",
  absoluteTitle: true,
  description: SITE_DESCRIPTIONS.fr,
  locale: "fr",
  paths: ROUTES.home.paths,
});

export default function Page() {
  return <HomePage locale="fr" />;
}
