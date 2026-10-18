import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { clubs } from "@/content/clubs";

export const metadata = contentMetadata("clubs", clubs, "fr");

export default function Page() {
  return <ContentRoute routeKey="clubs" docs={clubs} locale="fr" />;
}
