import type { Metadata } from "next";
import SemanticCarSearchContent from "@/components/SemanticCarSearchContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, techArticleLd } from "@/lib/seo";

const PATH = "/engineering/semantic-car-search";
const HEADLINE = "Semantic Car Search: A Vector-Based Approach";
const DESCRIPTION =
  "Leveraging high-dimensional embeddings for intelligent automotive discovery — indexing 22,180 vehicle models into a 1,536-dimensional vector space.";
const PUBLISHED = "2025-11-24";
const MODIFIED = "2025-11-24";

export const metadata: Metadata = {
  title: HEADLINE,
  description: DESCRIPTION,
  authors: [{ name: "Théophile" }],
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: PATH,
    title: HEADLINE,
    description: DESCRIPTION,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: ["Théophile"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          techArticleLd({
            headline: HEADLINE,
            description: DESCRIPTION,
            author: "Théophile",
            path: PATH,
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
          }),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Engineering", path: "/engineering" },
            { name: "Semantic Car Search", path: PATH },
          ]),
        ]}
      />
      <SemanticCarSearchContent />
    </>
  );
}
