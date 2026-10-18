import type { Metadata } from "next";
import { cookies } from "next/headers";
import JsonLd from "@/components/JsonLd";
import HomeV2 from "@/components/redesign/v2/HomeContent";
import HomeV3 from "@/components/redesign/v3/HomeContent";
import { SITE_DESCRIPTION, organizationLd, websiteLd, withLatestRelease, faqLd } from "@/lib/seo";
import { APP_LINK_URL } from "@/lib/links";
import { listEntries } from "@/lib/changelog";
import { readCollection } from "@/lib/collection";
import { qrSvg } from "@/lib/qr";

export const metadata: Metadata = {
  title: { absolute: "Wheeloh — Car Spotting App | Spot, Identify & Collect Cars" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Wheeloh — Car Spotting App", description: SITE_DESCRIPTION },
  // Previews are never indexed; the public site is the original at "/".
  robots: { index: false, follow: true },
};

export default async function Page({ params }: { params: { version: string } }) {
  const [entry] = listEntries();
  const latestUpdate = { slug: entry.slug, title: entry.title };
  const qr = await qrSvg(APP_LINK_URL);
  // The v2 intro plays once per session; reading the cookie makes only /v2 dynamic.
  const intro = params.version === "v2" && !cookies().has("wh-intro");

  return (
    <>
      <JsonLd data={[organizationLd, websiteLd, withLatestRelease(entry), faqLd]} />
      {params.version === "v2" ? (
        <HomeV2 latestUpdate={latestUpdate} collection={readCollection()} qr={qr} intro={intro} />
      ) : (
        <HomeV3 latestUpdate={latestUpdate} qr={qr} />
      )}
    </>
  );
}
