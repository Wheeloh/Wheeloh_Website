import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { plates } from "@/content/plates";

export const metadata = contentMetadata("plates", plates, "fr");

export default function Page() {
  return <ContentRoute routeKey="plates" docs={plates} locale="fr" />;
}
