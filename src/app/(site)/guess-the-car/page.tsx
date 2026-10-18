import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { guess } from "@/content/guess";

export const metadata = contentMetadata("guess", guess, "en");

export default function Page() {
  return <ContentRoute routeKey="guess" docs={guess} locale="en" />;
}
