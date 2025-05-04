"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChangelogMeta {
  date: string;
  title: string;
  description: string;
  file: string;
}

export default function ChangelogPage() {
  const [articles, setArticles] = useState<ChangelogMeta[]>([]);

  useEffect(() => {
    // Récupère la liste des fichiers changelog dynamiquement
    fetch("/changelog/content/index.json")
      .then(res => res.json())
      .then(async (files: string[]) => {
        const metas: ChangelogMeta[] = await Promise.all(files.map(async (file) => {
          const res = await fetch(`/changelog/content/${file}`);
          const text = await res.text();
          const lines = text.split("\n");
          // Extraction naïve :
          const title = lines.find(l => l.startsWith("#"))?.replace(/^#\s*/, "") || file;
          const date = lines.find(l => l.match(/^\*\d{2}\/\d{2}\/\d{4}\*$/))?.replace(/\*/g,"") || file.replace('.md','');
          const description = lines.find((l, i) => i > 1 && l.trim() !== '' && !l.startsWith('#')) || '';
          return { date, title, description, file: file.replace('.md','') };
        }));
        setArticles(metas);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header showNavLinks={true} />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Changelog</div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Dernières nouveautés & annonces</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto">
                  Retrouvez ici toutes les dernières mises à jour, nouveautés et annonces importantes concernant Wheeloh.
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid max-w-2xl gap-8 py-12">
              {articles.map((item, idx) => (
                <motion.div
                  key={item.file}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Link href={`/changelog/${item.file}`} className="block hover:scale-[1.02] transition-transform">
                    <Card className="bg-muted cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-2 mb-2">
                          <span className="text-lg font-semibold">{item.title}</span>
                          <span className="text-sm text-muted-foreground font-medium">{item.date}</span>
                        </div>
                        <p className="text-base text-left text-muted-foreground line-clamp-2 inline">
                          <ReactMarkdown>{item.description}</ReactMarkdown>
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 