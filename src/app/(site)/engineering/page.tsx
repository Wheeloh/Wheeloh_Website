import EngineeringContent from "@/components/redesign/shared/pages/EngineeringContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";
import { APP_LINK_URL } from "@/lib/links";
import { qrSvg } from "@/lib/qr";

export const metadata = pageMetadata({
  title: "Engineering",
  description:
    "Research and technical deep dives from the Wheeloh engineering team — vector search, car identification and the systems behind the car spotting app.",
  locale: "en",
  paths: ROUTES.engineering.paths,
});

export default async function Page() {
  const qr = await qrSvg(APP_LINK_URL);
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Engineering", path: "/engineering" },
        ])}
      />
      <EngineeringContent qr={qr} />
    </>
  );
}
