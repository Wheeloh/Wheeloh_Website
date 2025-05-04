"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

function stripFrontmatter(md: string) {
  return md.replace(/^---[\s\S]*?---\s*/, '');
}

export default function ChangelogDetailPage() {
  const { date } = useParams();
  const [content, setContent] = useState<string>("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!date) return;
    fetch(`/changelog/content/${date}.md`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.text();
      })
      .then(text => setContent(stripFrontmatter(text)))
      .catch(() => setNotFound(true));
  }, [date]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header showNavLinks={true} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            {notFound ? (
              <div className="text-center text-lg text-destructive">Aucune news trouvée pour cette date.</div>
            ) : (
              <div className="prose prose-lg prose-neutral max-w-3xl mx-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSlug]}
                  components={{
                    img: ({node, ...props}) => (
                      <img {...props} className="rounded-lg mx-auto my-4 max-h-80" />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 