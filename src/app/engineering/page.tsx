"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
    title: string;
    description: string;
    date: string;
    author: string;
    href: string;
    tags: string[];
    image?: string;
}

const posts: BlogPost[] = [
    {
        title: "Semantic Car Search: A Vector-Based Approach",
        description: "Leveraging High-Dimensional Embeddings for Intelligent Automotive Discovery. How we indexed 22,180 vehicle models into a 1,536-dimensional vector space.",
        date: "November 24, 2025",
        author: "Théophile",
        href: "/engineering/semantic-car-search",
        tags: ["Machine Learning", "Vector Search", "Engineering"],
        image: "/embeddings_viz_preview.png" // We might need to create this or use a placeholder
    }
];

export default function EngineeringBlog() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-black font-sans">
            <Header showNavLinks={true} />

            <main className="flex-1">
                <section className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                            Engineering
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl leading-relaxed">
                            Updates, research, and technical deep dives from the Wheeloh engineering team.
                        </p>
                    </motion.div>

                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.href}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group cursor-pointer flex flex-col h-full"
                            >
                                <Link href={post.href} className="flex flex-col h-full">
                                    <div className="aspect-video bg-gray-100 rounded-2xl mb-6 overflow-hidden relative border border-gray-100 transition-colors group-hover:border-gray-200">
                                        {/* Placeholder for visual if image is missing, or actual image */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-1/2 h-1/2 bg-white/50 rounded-full blur-3xl"></div>
                                        </div>
                                        {/* Simple abstract representation */}
                                        <div className="absolute inset-0 p-8 flex items-center justify-center opacity-60">
                                            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800 fill-current">
                                                <circle cx="20" cy="50" r="2" />
                                                <circle cx="80" cy="30" r="2" />
                                                <circle cx="50" cy="70" r="2" />
                                                <circle cx="40" cy="40" r="2" />
                                                <line x1="20" y1="50" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" />
                                                <line x1="40" y1="40" x2="80" y2="30" stroke="currentColor" strokeWidth="0.5" />
                                                <line x1="20" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="0.5" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <div className="flex gap-3 mb-4 flex-wrap">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-xs font-semibold uppercase tracking-wider text-black">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="text-2xl font-bold mb-3 group-hover:text-gray-600 transition-colors leading-tight">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                            {post.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                {post.date}
                                            </div>
                                            <div className="flex items-center text-black font-medium group-hover:translate-x-1 transition-transform">
                                                Read Article <ArrowRight className="ml-2 w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
