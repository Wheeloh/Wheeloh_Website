"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DocShell from "@/components/redesign/shared/DocShell";
import { Reveal } from "@/components/redesign/shared/motion/reveal";

interface BlogPost {
    title: string;
    description: string;
    date: string;
    author: string;
    href: string;
    tags: string[];
    image: string;
    imageAlt: string;
    stats: Array<{ value: string; label: string }>;
}

const posts: BlogPost[] = [
    {
        title: "Semantic Car Search: A Vector-Based Approach",
        description: "Leveraging High-Dimensional Embeddings for Intelligent Automotive Discovery. How we indexed 22,180 vehicle models into a 1,536-dimensional vector space.",
        date: "November 24, 2025",
        author: "Théophile",
        href: "/engineering/semantic-car-search",
        tags: ["Machine Learning", "Vector Search", "Engineering"],
        image: "/media/catalogue-map.jpg",
        imageAlt: "Map of the 22,180 car models in the Wheeloh catalogue, coloured by category",
        stats: [
            { value: "22,180", label: "models indexed" },
            { value: "84.6%", label: "top-1 accuracy" },
            { value: "1.8 ms", label: "per search" },
        ],
    }
];

export default function EngineeringBlog() {
    return (
        <DocShell
            lang="en"
            title="Engineering"
            subtitle="How Wheeloh works."
            crumbs={[{ href: "/", label: "Home" }, { label: "Engineering" }]}
            intro={
                <>
                    Research and technical deep dives from the{" "}
                    <Link href="/" className="font-semibold text-snow underline decoration-graphite underline-offset-4 hover:decoration-snow">Wheeloh</Link>{" "}
                    team. Follow shipping updates on our{" "}
                    <Link href="/changelog" className="font-semibold text-snow underline decoration-graphite underline-offset-4 hover:decoration-snow">changelog</Link>.
                </>
            }
        >
            <ul className="grid gap-8">
                {posts.map((post) => (
                    <Reveal as="li" key={post.href}>
                        <Link
                            href={post.href}
                            className="group grid overflow-hidden rounded-[2rem] border border-line transition-[box-shadow,border-color] duration-500 ease-out-expo hover:border-transparent hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)] lg:grid-cols-12"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden bg-night lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]">
                                <Image
                                    src={post.image}
                                    alt={post.imageAlt}
                                    fill
                                    sizes="(min-width: 1024px) 58vw, 100vw"
                                    className="object-cover transition-transform [transition-duration:1400ms] ease-out-expo group-hover:scale-[1.06]"
                                />
                            </div>
                            <div className="flex flex-col p-7 sm:p-10 lg:col-span-5">
                                <p className="text-sm font-semibold text-ash">{post.tags.join(" · ")}</p>
                                <h2 className="mt-3 text-display-s font-extrabold lg:text-display-m">{post.title}</h2>
                                <p className="mt-4 text-base font-medium leading-relaxed text-ash sm:text-lg">{post.description}</p>
                                <dl className="mt-8 grid grid-cols-3 gap-2">
                                    {post.stats.map((s) => (
                                        <div key={s.label} className="rounded-2xl bg-mist px-3 py-3">
                                            <dt className="sr-only">{s.label}</dt>
                                            <dd className="text-lg font-extrabold tabular sm:text-xl">{s.value}</dd>
                                            <dd className="text-[0.75rem] font-semibold text-ash">{s.label}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-6 lg:mt-10">
                                    <span className="text-sm font-semibold text-ash">
                                        {post.author} · {post.date}
                                    </span>
                                    <span className="flex items-center gap-2 text-sm font-bold">
                                        Read
                                        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-snow transition-transform duration-500 ease-out-expo group-hover:rotate-45">
                                            <ArrowUpRight className="h-5 w-5" aria-hidden />
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </Reveal>
                ))}
            </ul>
        </DocShell>
    );
}
