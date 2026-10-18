import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import JsonLd from "@/components/JsonLd";
import {
  SITE_DESCRIPTION,
  organizationLd,
  websiteLd,
  withLatestRelease,
  faqLd,
} from "@/lib/seo";
import { listEntries } from "@/lib/changelog";

export const metadata: Metadata = {
  title: { absolute: "Wheeloh — Car Spotting App | Spot, Identify & Collect Cars" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Wheeloh — Car Spotting App", description: SITE_DESCRIPTION },
};

export default function Page() {
  const [latestUpdate] = listEntries();

  return (
    <>
      <JsonLd data={[organizationLd, websiteLd, withLatestRelease(latestUpdate), faqLd]} />
      <HomeContent
        latestUpdate={{ slug: latestUpdate.slug, title: latestUpdate.title }}
      />
    </>
  );
}
