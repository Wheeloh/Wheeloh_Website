import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { meets } from "@/content/meets";

export const metadata = contentMetadata("meets", meets, "en");

export default function Page() {
  return <ContentRoute routeKey="meets" docs={meets} locale="en" />;
}
