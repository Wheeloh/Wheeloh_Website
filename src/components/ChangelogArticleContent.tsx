"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

export default function ChangelogArticleContent({
  markdown,
  title,
  printed,
}: {
  markdown: string;
  title: string;
  printed: string;
}) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header showNavLinks={true} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            {/* Breadcrumb — contextual internal links */}
            <nav
              aria-label="Breadcrumb"
              className="max-w-3xl mx-auto mb-8 flex items-center gap-1 text-sm text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground hover:underline underline-offset-4">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/changelog" className="hover:text-foreground hover:underline underline-offset-4">Changelog</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground line-clamp-1">{title}</span>
            </nav>

            <article className="prose prose-lg prose-neutral max-w-3xl mx-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  img: ({ node, ...props }) => (
                    <img {...props} alt={props.alt ?? title} className="rounded-lg mx-auto my-4 max-h-80" />
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </article>

            <div className="max-w-3xl mx-auto mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm">
              <p className="text-muted-foreground">Published {printed}</p>
              <div className="flex gap-4">
                <Link href="/changelog" className="font-medium hover:underline underline-offset-4">← See all updates</Link>
                <Link href="/" className="font-medium hover:underline underline-offset-4">Download Wheeloh →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
