import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import JsonLd from "@/components/JsonLd";
import {
  SITE_DESCRIPTION,
  organizationLd,
  websiteLd,
  mobileAppLd,
  faqLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Wheeloh — Car Spotting App | Spot, Identify & Collect Cars" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Wheeloh — Car Spotting App", description: SITE_DESCRIPTION },
};

export default function Page() {
  return (
    <>
      <JsonLd data={[organizationLd, websiteLd, mobileAppLd, faqLd]} />
      <HomeContent />
    </>
  );
}
