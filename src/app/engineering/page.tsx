import type { Metadata } from "next";
import EngineeringContent from "@/components/EngineeringContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Engineering",
  description:
    "Research and technical deep dives from the Wheeloh engineering team — vector search, car identification and the systems behind the app.",
  alternates: { canonical: "/engineering" },
  openGraph: {
    url: "/engineering",
    title: "Engineering | Wheeloh",
    description: "Technical deep dives from the Wheeloh engineering team.",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Engineering", path: "/engineering" },
        ])}
      />
      <EngineeringContent />
    </>
  );
}
