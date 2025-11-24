"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';
import Link from 'next/link';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Car {
    x: number;
    y: number;
    brand: string;
    model: string;
    version: string;
}

interface EmbeddingsData {
    cars: Car[];
}

export default function EngineeringPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [filteredIndices, setFilteredIndices] = useState<number[] | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/embeddings_coords.json')
            .then(res => res.json())
            .then((data: EmbeddingsData) => {
                setCars(data.cars);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load embeddings:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredIndices(null);
            return;
        }

        const query = searchQuery.toLowerCase();
        const indices: number[] = [];
        cars.forEach((car, i) => {
            const text = `${car.brand} ${car.model} ${car.version}`.toLowerCase();
            if (text.includes(query)) {
                indices.push(i);
            }
        });
        setFilteredIndices(indices);
    }, [searchQuery, cars]);

    // Prepare Plotly data
    const x = cars.map(c => c.x);
    const y = cars.map(c => c.y);
    const hoverText = cars.map(c => `<b>${c.brand} ${c.model}</b><br>${c.version}`);

    let markerSize: number[] | number = 6;
    let markerColor: string[] | string | number[] = '#1a73e8'; // Default blue
    let markerOpacity: number[] | number = 0.6;

    if (filteredIndices !== null) {
        markerSize = cars.map((_, i) => filteredIndices.includes(i) ? 12 : 4);
        markerColor = cars.map((_, i) => filteredIndices.includes(i) ? '#ea4335' : '#e2e8f0'); // Red for match, light gray for others
        markerOpacity = cars.map((_, i) => filteredIndices.includes(i) ? 1 : 0.3);
    } else {
        // Gradient based on X if no filter, or just uniform
        markerColor = x;
    }

    const plotData: any[] = [{
        x: x,
        y: y,
        mode: 'markers',
        type: 'scattergl',
        marker: {
            size: markerSize,
            color: markerColor,
            colorscale: filteredIndices === null ? 'Viridis' : undefined,
            opacity: markerOpacity,
            line: { width: 0 }
        },
        text: hoverText,
        hovertemplate: '%{text}<extra></extra>'
    }];

    const layout: any = {
        xaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
        yaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
        hovermode: 'closest',
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent',
        showlegend: false,
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 500,
        dragmode: 'pan',
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchQuery(inputValue);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
            <Header showNavLinks={true} />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-[250px_1fr] gap-12">

                        {/* Sidebar / Table of Contents */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 space-y-8">
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Contents</h4>
                                    <nav className="space-y-2">
                                        {['Abstract', 'Introduction', 'Methodology', 'Metrics', 'Demo', 'Results', 'Conclusion'].map((item) => (
                                            <a
                                                key={item}
                                                href={`#${item.toLowerCase()}`}
                                                onClick={(e) => scrollToSection(e, item.toLowerCase())}
                                                className="block text-sm text-gray-600 hover:text-primary hover:translate-x-1 transition-all"
                                            >
                                                {item}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="space-y-20 max-w-4xl">

                            {/* Header Section */}
                            <section className="text-center md:text-left">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-black">
                                        Semantic Car Search:<br />
                                        <span className="text-gray-600">A Vector-Based Approach</span>
                                    </h1>
                                    <p className="text-xl text-gray-700 mb-8 max-w-2xl">
                                        Leveraging High-Dimensional Embeddings for Intelligent Automotive Discovery
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-6">
                                        <span className="flex items-center gap-2">
                                            {/* Removed the dot as requested */}
                                            Théophile
                                        </span>
                                        <span>•</span>
                                        <span>Wheeloh Engineering</span>
                                        <span>•</span>
                                        <span>November 2025</span>
                                    </div>
                                </motion.div>
                            </section>

                            {/* Abstract */}
                            <section id="abstract" className="bg-gray-50 p-8 md:p-10 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Abstract</h3>
                                <p className="text-lg leading-relaxed mb-4 text-black">
                                    We present a novel semantic search system for automotive data, leveraging state-of-the-art
                                    vector embeddings to enable intelligent query understanding beyond traditional keyword matching.
                                    Our approach indexes <strong>22,180 vehicle models</strong> into a 1,536-dimensional vector space
                                    using a high-performance transformer model.
                                </p>
                                <p className="text-lg leading-relaxed text-black">
                                    The system achieves a <strong>75.6% validation accuracy</strong> on 897 test queries,
                                    demonstrating robust performance in matching user intent to relevant vehicles. Through
                                    efficient batch processing and local vector comparisons, we reduce search latency from
                                    ~7 minutes to <strong>~2 seconds</strong> for bulk operations.
                                </p>
                            </section>

                            {/* Introduction */}
                            <section id="introduction">
                                <h2 className="text-3xl font-bold mb-8 text-black">1. Introduction</h2>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 text-black">1.1 Motivation</h3>
                                        <p className="text-gray-800 leading-relaxed mb-4">
                                            Traditional automotive search systems rely on exact string matching, failing to capture
                                            semantic relationships between queries. A user searching for "Beamer M3" should find
                                            BMW M3 results, yet keyword-based systems struggle with:
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-800">
                                            <li>Brand synonyms (Beamer → BMW, Merco → Mercedes)</li>
                                            <li>Model variations (911 Turbo → 911 Turbo S)</li>
                                            <li>Typographical errors (Ferari → Ferrari)</li>
                                            <li>Cross-language queries (voiture sportive → sports car)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 text-black">1.2 Problem Statement</h3>
                                        <p className="text-gray-800 leading-relaxed mb-4">
                                            Given a database of 22,180 automotive models and user queries in natural language,
                                            design a system that:
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2 text-gray-800">
                                            <li>Understands semantic intent beyond literal text</li>
                                            <li>Scales efficiently for real-time search</li>
                                            <li>Maintains accuracy across diverse query patterns</li>
                                            <li>Minimizes computational cost</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Methodology */}
                            <section id="methodology">
                                <h2 className="text-3xl font-bold mb-8 text-black">2. Methodology</h2>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 text-black">2.1 Vector Embeddings</h3>
                                        <p className="text-gray-800 leading-relaxed mb-6">
                                            We employ a state-of-the-art transformer model to transform textual
                                            car descriptions into dense 1,536-dimensional vectors.
                                        </p>

                                        <div className="bg-gray-100 p-6 rounded-lg font-mono text-sm overflow-x-auto text-gray-900">
                                            <div className="text-gray-500 italic mb-2"># Example: Vector representation</div>
                                            <div className="mb-1">text = <span className="text-green-700">"Ferrari 458 Italia"</span></div>
                                            <div className="mb-1">embedding = model.encode(</div>
                                            <div className="pl-4 mb-1">input=text,</div>
                                            <div className="pl-4 mb-1">dimensions=<span className="text-blue-700">1536</span></div>
                                            <div>)</div>
                                            <div className="text-gray-500 italic mt-2"># Result: [0.021, -0.034, 0.156, ...] (1536 dimensions)</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 text-black">2.2 Similarity Computation</h3>
                                        <p className="text-gray-800 leading-relaxed">
                                            Semantic similarity between a query Q and document D is computed using cosine similarity
                                            in the embedded space. Since the embeddings are pre-normalized, this simplifies to a dot product,
                                            enabling rapid batch comparisons via NumPy matrix operations.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Metrics */}
                            <section id="metrics">
                                <h2 className="text-3xl font-bold mb-8 text-black">3. Key Metrics</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Indexed Vehicles", value: "22,180" },
                                        { label: "Dimensions", value: "1,536" },
                                        { label: "Accuracy", value: "75.6%" },
                                        { label: "Bulk Search Time", value: "~2s" },
                                    ].map((metric, i) => (
                                        <Card key={i} className="p-6 text-center hover:border-primary transition-colors bg-white">
                                            <div className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-black">{metric.value}</div>
                                            <div className="text-sm text-gray-600 font-medium">{metric.label}</div>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            {/* Demo */}
                            <section id="demo" className="scroll-mt-20">
                                <h2 className="text-3xl font-bold mb-4 text-black">4. Interactive Demonstration</h2>
                                <p className="text-gray-800 mb-8">
                                    Explore the 22,180-vehicle embedding space reduced to 2D via PCA.
                                    Search for any car model to see semantic clustering in action.
                                </p>

                                {/* Demo Container matching HTML CSS */}
                                <div className="border border-[#dadce0] rounded-2xl overflow-hidden my-10">
                                    {/* Demo Controls */}
                                    <div className="p-5 bg-[#f8f9fa] border-b border-[#dadce0] flex gap-2.5">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Type to search (e.g., 'Ferrari', 'SUV', 'Electric')..."
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="w-full px-4 py-3 border border-[#dadce0] rounded-lg text-base outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all font-sans text-gray-900 placeholder:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Visualization */}
                                    <div className="h-[500px] w-full bg-white relative">
                                        {loading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
                                            </div>
                                        )}
                                        <Plot
                                            data={plotData}
                                            layout={layout}
                                            useResizeHandler={true}
                                            style={{ width: '100%', height: '100%' }}
                                            config={{
                                                displayModeBar: true,
                                                displaylogo: false,
                                                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                                                toImageButtonOptions: {
                                                    format: 'png',
                                                    filename: 'wheeloh_embeddings',
                                                    height: 500,
                                                    width: 700,
                                                    scale: 1
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Results */}
                            <section id="results">
                                <h2 className="text-3xl font-bold mb-8 text-black">5. Experimental Results</h2>

                                <div className="grid md:grid-cols-2 gap-8 mb-12">
                                    <Card className="p-6 bg-white">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 text-center">Match Distribution</h4>
                                        <div className="h-[250px]">
                                            <Plot
                                                data={[{
                                                    values: [678, 219],
                                                    labels: ['Match Found', 'No Match'],
                                                    type: 'pie',
                                                    marker: { colors: ['#22c55e', '#ef4444'] },
                                                    textinfo: 'percent',
                                                    hole: 0.6
                                                }]}
                                                layout={{
                                                    showlegend: true,
                                                    legend: { orientation: 'h', y: -0.1 },
                                                    margin: { t: 0, b: 0, l: 0, r: 0 },
                                                    height: 250,
                                                    paper_bgcolor: 'transparent'
                                                }}
                                                useResizeHandler={true}
                                                style={{ width: '100%', height: '100%' }}
                                                config={{ displayModeBar: false }}
                                            />
                                        </div>
                                    </Card>

                                    <Card className="p-6 bg-white">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 text-center">Confidence Levels</h4>
                                        <div className="h-[250px]">
                                            <Plot
                                                data={[{
                                                    x: ['High', 'Medium', 'Low'],
                                                    y: [612, 45, 21],
                                                    type: 'bar',
                                                    marker: { color: ['#22c55e', '#eab308', '#ef4444'] }
                                                }]}
                                                layout={{
                                                    yaxis: { showgrid: true, gridcolor: '#f1f3f4' },
                                                    xaxis: { showgrid: false },
                                                    showlegend: false,
                                                    margin: { t: 10, b: 30, l: 30, r: 10 },
                                                    height: 250,
                                                    paper_bgcolor: 'transparent',
                                                    plot_bgcolor: 'transparent'
                                                }}
                                                useResizeHandler={true}
                                                style={{ width: '100%', height: '100%' }}
                                                config={{ displayModeBar: false }}
                                            />
                                        </div>
                                    </Card>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="py-4 font-semibold text-black">Approach</th>
                                                <th className="py-4 text-right font-semibold text-black">Time (897 queries)</th>
                                                <th className="py-4 text-right font-semibold text-black">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="py-4 text-gray-700">Individual API Calls</td>
                                                <td className="py-4 text-right text-gray-700">~7 min</td>
                                                <td className="py-4 text-right text-gray-700">~$0.25</td>
                                            </tr>
                                            <tr className="bg-green-50/50">
                                                <td className="py-4 pl-4 font-medium text-black">Our Approach (Batch + Local)</td>
                                                <td className="py-4 text-right font-bold text-green-700">~2s</td>
                                                <td className="py-4 text-right font-bold text-green-700 pr-4">~$0.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Conclusion */}
                            <section id="conclusion">
                                <h2 className="text-3xl font-bold mb-6 text-black">6. Conclusion & Future Work</h2>
                                <p className="text-lg text-gray-800 leading-relaxed mb-8">
                                    We successfully demonstrated a production-ready semantic search system for automotive
                                    data, achieving 75.6% validation accuracy while reducing search latency by 210× compared
                                    to naive approaches.
                                </p>

                                <h3 className="text-xl font-semibold mb-4 text-black">Future Directions</h3>
                                <ul className="list-disc pl-6 space-y-2 text-gray-800">
                                    <li><strong>Multimodal Search:</strong> Incorporate vehicle images via CLIP embeddings</li>
                                    <li><strong>Fine-tuning:</strong> Domain-specific embedding models for automotive terminology</li>
                                    <li><strong>Real-time Updates:</strong> Incremental indexing for new vehicle releases</li>
                                </ul>
                            </section>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
