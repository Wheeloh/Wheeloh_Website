import ContentRoute, { contentMetadata } from "@/components/redesign/shared/pages/ContentRoute";
import { identify } from "@/content/identify";

export const metadata = contentMetadata("identify", identify, "en");

export default function Page() {
  return <ContentRoute routeKey="identify" docs={identify} locale="en" />;
}
