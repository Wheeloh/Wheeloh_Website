import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { guess } from "@/content/guess";

export const metadata = contentMetadata("guess", guess, "fr");

export default function Page() {
  return <ContentRoute routeKey="guess" docs={guess} locale="fr" />;
}
