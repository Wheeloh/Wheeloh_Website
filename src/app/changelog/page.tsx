import type { Metadata } from "next";
import ChangelogListContent from "@/components/ChangelogListContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { listEntries } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Product updates, new features and release notes for the Wheeloh car-spotting app.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    url: "/changelog",
    title: "Changelog | Wheeloh",
    description: "Latest updates and release notes for Wheeloh.",
  },
};

export default function Page() {
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
      <ChangelogListContent entries={entries} />
    </>
  );
}
