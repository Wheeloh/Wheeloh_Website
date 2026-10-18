import ChangelogListContent from "@/components/redesign/shared/pages/ChangelogListContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { listEntries } from "@/lib/changelog";
import { APP_LINK_URL } from "@/lib/links";
import { qrSvg } from "@/lib/qr";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Changelog",
  description: "Product updates, new features and release notes for Wheeloh, the car spotting app for iPhone and Android.",
  locale: "en",
  paths: ROUTES.changelog.paths,
});

export default async function Page() {
  const qr = await qrSvg(APP_LINK_URL);
  const entries = listEntries().map((e) => ({
    slug: e.slug,
    title: e.title,
    date: e.printed,
    description: e.description,
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Changelog", path: "/changelog" },
        ])}
      />
      <ChangelogListContent entries={entries} qr={qr} />
    </>
  );
}
