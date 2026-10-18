import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import HomeContent from "@/components/redesign/v3/HomeContent";
import { SITE_DESCRIPTION, organizationLd, websiteLd, withLatestRelease, faqLd } from "@/lib/seo";
import { APP_LINK_URL } from "@/lib/links";
import { listEntries } from "@/lib/changelog";
import { qrSvg } from "@/lib/qr";

export const metadata: Metadata = {
  title: { absolute: "Wheeloh — Car Spotting App | Spot, Identify & Collect Cars" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  // A page's openGraph replaces the layout's whole block, so the preview
  // image has to be listed here too (the other pages list it as well).
  openGraph: {
    url: "/",
    title: "Wheeloh — Car Spotting App",
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Wheeloh — Spot, identify and collect the rarest cars around you" }],
  },
};

export default async function Page() {
  const [entry] = listEntries();
  const qr = await qrSvg(APP_LINK_URL);

  return (
    <>
      <JsonLd data={[organizationLd, websiteLd, withLatestRelease(entry), faqLd]} />
      <HomeContent latestUpdate={{ slug: entry.slug, title: entry.title }} qr={qr} />
    </>
  );
}
