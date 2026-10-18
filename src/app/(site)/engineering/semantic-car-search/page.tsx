import { Suspense } from "react";
import SemanticCarSearchContent from "@/components/redesign/shared/pages/SemanticCarSearchContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, techArticleLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import { ROUTES } from "@/lib/routes";

const PATH = "/engineering/semantic-car-search";
const HEADLINE = "Semantic Car Search: A Vector-Based Approach";
const DESCRIPTION =
  "Leveraging high-dimensional embeddings for intelligent automotive discovery — indexing 22,180 vehicle models into a 1,536-dimensional vector space.";
const PUBLISHED = "2025-11-24";
const MODIFIED = "2026-10-03";

export const metadata = {
  ...pageMetadata({
    title: HEADLINE,
    description: DESCRIPTION,
    locale: "en",
    paths: ROUTES.semanticSearch.paths,
    type: "article",
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
  }),
  authors: [{ name: "Théophile" }],
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
      <Suspense fallback={<div className="min-h-screen bg-night" />}>
        <SemanticCarSearchContent />
      </Suspense>
    </>
  );
}
