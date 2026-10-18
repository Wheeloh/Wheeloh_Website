import JsonLd from "@/components/JsonLd";
import HomeContent from "@/components/redesign/v3/HomeContent";
import { faqLdFor, organizationLd, websiteLd, withLatestRelease } from "@/lib/seo";
import { APP_LINK_URL } from "@/lib/links";
import { listEntries } from "@/lib/changelog";
import { qrSvg } from "@/lib/qr";
import type { Locale } from "@/lib/i18n";

/** The home page in either language (server side: data, QR code, JSON-LD). */
export default async function HomePage({ locale }: { locale: Locale }) {
  const [entry] = listEntries();
  const qr = await qrSvg(APP_LINK_URL);

  return (
    <>
      <JsonLd data={[organizationLd, websiteLd, withLatestRelease(entry, locale), faqLdFor(locale)]} />
      <HomeContent latestUpdate={{ slug: entry.slug, title: entry.title }} qr={qr} />
    </>
  );
}
