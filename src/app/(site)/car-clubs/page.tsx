import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { clubs } from "@/content/clubs";

export const metadata = contentMetadata("clubs", clubs, "en");

export default function Page() {
  return <ContentRoute routeKey="clubs" docs={clubs} locale="en" />;
}
