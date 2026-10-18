import HomePage from "@/components/redesign/v3/HomePage";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";
import { SITE_DESCRIPTIONS } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Wheeloh — Car Spotting App | Spot, Identify & Collect Cars",
  absoluteTitle: true,
  description: SITE_DESCRIPTIONS.en,
  locale: "en",
  paths: ROUTES.home.paths,
});

export default function Page() {
  return <HomePage locale="en" />;
}
