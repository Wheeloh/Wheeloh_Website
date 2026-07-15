// Server component: emits one or more <script type="application/ld+json"> tags
// into the initial HTML (so crawlers see the structured data without running JS).
// Must be rendered from a Server Component page.tsx, never a "use client" file.

type JsonLdData = Record<string, unknown>;

export default function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
