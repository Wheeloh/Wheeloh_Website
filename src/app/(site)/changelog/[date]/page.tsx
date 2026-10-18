import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChangelogArticleContent from "@/components/redesign/shared/pages/ChangelogArticleContent";
import JsonLd from "@/components/JsonLd";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { listSlugs, readEntry } from "@/lib/changelog";
import { pageMetadata } from "@/lib/metadata";
import { APP_LINK_URL } from "@/lib/links";
import { qrSvg } from "@/lib/qr";

export function generateStaticParams() {
  return listSlugs().map((date) => ({ date }));
}

export async function generateMetadata({ params }: { params: { date: string } }): Promise<Metadata> {
  try {
    const entry = readEntry(params.date);
    const path = `/changelog/${params.date}`;
    // The release title already starts with "Wheeloh": no "| Wheeloh" suffix.
    return pageMetadata({
      title: entry.title,
      absoluteTitle: true,
      description: entry.description || `Wheeloh changelog — ${entry.title}`,
      locale: "en",
      paths: { en: path },
      type: "article",
      publishedTime: entry.iso,
      modifiedTime: entry.iso,
    });
  } catch {
    return { title: "Changelog", robots: { index: false } };
  }
}

export default async function Page({ params }: { params: { date: string } }) {
  if (!listSlugs().includes(params.date)) notFound();
  const entry = readEntry(params.date);
  const path = `/changelog/${params.date}`;
  const qr = await qrSvg(APP_LINK_URL);
  return (
    <>
      <JsonLd
        data={[
          articleLd({
            headline: entry.title,
            description: entry.description,
            path,
            datePublished: entry.iso,
            dateModified: entry.iso,
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Changelog", path: "/changelog" },
            { name: entry.title, path },
          ]),
        ]}
      />
      <ChangelogArticleContent markdown={entry.body} title={entry.title} printed={entry.printed} qr={qr} />
    </>
  );
}
