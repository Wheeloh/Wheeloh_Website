import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { carSpotting } from "@/content/carSpotting";

export const metadata = contentMetadata("carSpotting", carSpotting, "fr");

export default function Page() {
  return <ContentRoute routeKey="carSpotting" docs={carSpotting} locale="fr" />;
}
