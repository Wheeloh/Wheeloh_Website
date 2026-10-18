"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import DocShell, { PROSE } from "@/components/redesign/shared/DocShell";
import StoreButtons from "@/components/redesign/shared/StoreButtons";
import { cn } from "@/lib/utils";

/** "Wheeloh v1.3.0 — The Social Update" → ["Wheeloh v1.3.0", "The Social Update"] */
function splitTitle(title: string): [string, string | undefined] {
  const m = title.match(/^(.*?v?\d+(?:\.\d+){1,2})\s*[—–-]\s*(.+)$/);
  return m ? [m[1], m[2]] : [title, undefined];
}

/** Drops the markdown's own "# title" and "*date*" lines — they live in the hero. */
function stripHeader(md: string) {
  return md.replace(/^\s*#\s+.*\n+/, "").replace(/^\s*\*\d{2}\/\d{2}\/\d{4}\*\s*\n+/, "");
}

export default function ChangelogArticleContent({
  markdown,
  title,
  printed,
}: {
  markdown: string;
  title: string;
  printed: string;
}) {
  const [head, name] = splitTitle(title);
  return (
    <DocShell
      lang="en"
      title={name ?? head}
      subtitle={name ? head : undefined}
      crumbs={[{ href: "/", label: "Home" }, { href: "/changelog", label: "Changelog" }, { label: title }]}
      meta={<span className="tabular">Published {printed}</span>}
    >
      <article className={cn(PROSE, "mx-auto max-w-3xl")}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            img: ({ node, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img {...props} alt={props.alt ?? title} className="mx-auto my-4 max-h-80 rounded-3xl" />
            ),
          }}
        >
          {stripHeader(markdown)}
        </ReactMarkdown>
      </article>

      <div className="mx-auto mt-16 max-w-3xl rounded-[2rem] bg-ink p-8 text-snow sm:p-10">
        <p className="text-display-s font-extrabold">Get the update.</p>
        <p className="mt-2 text-base font-medium text-smoke">Free on iOS and Android.</p>
        <StoreButtons tone="light" campaign="changelog" className="mt-6" />
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm font-semibold">
        <Link href="/changelog" className="group flex items-center gap-2 text-ink">
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden /> All updates
        </Link>
        <span className="text-ash tabular">Published {printed}</span>
      </div>
    </DocShell>
  );
}
