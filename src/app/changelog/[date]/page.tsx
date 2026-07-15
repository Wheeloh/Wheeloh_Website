import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChangelogArticleContent from "@/components/ChangelogArticleContent";
import JsonLd from "@/components/JsonLd";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import { listSlugs, readEntry } from "@/lib/changelog";

export function generateStaticParams() {
  return listSlugs().map((date) => ({ date }));
}

export async function generateMetadata({
  params,
}: {
  params: { date: string };
}): Promise<Metadata> {
  try {
    const entry = readEntry(params.date);
    const path = `/changelog/${params.date}`;
    return {
      title: entry.title,
      description: entry.description || `Wheeloh changelog — ${entry.title}`,
      alternates: { canonical: path },
      openGraph: {
        type: "article",
        url: path,
        title: entry.title,
        description: entry.description,
        modifiedTime: entry.iso,
        publishedTime: entry.iso,
      },
    };
  } catch {
    return { title: "Changelog", robots: { index: false } };
  }
}

export default function Page({ params }: { params: { date: string } }) {
  if (!listSlugs().includes(params.date)) notFound();
  const entry = readEntry(params.date);
  const path = `/changelog/${params.date}`;
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
      <ChangelogArticleContent markdown={entry.body} title={entry.title} printed={entry.printed} />
    </>
  );
}
