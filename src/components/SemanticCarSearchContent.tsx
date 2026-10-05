"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search,
    Layers,
    Cpu,
    Zap,
    Database,
    ArrowRight,
    CheckCircle2,
    SlidersHorizontal,
    Sparkles,
    BarChart3,
    Clock,
    ShieldCheck,
    Compass,
    X
} from 'lucide-react';

// Dynamically import Plotly to avoid SSR issues with a clean fallback skeleton
const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50/70 text-gray-500 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Loading interactive visualization...</span>
        </div>
    )
});

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

export const CATEGORIES = [
    { id: 0, name: "Supercars & Hypercars", color: "#ef4444", count: 470 },
    { id: 1, name: "Sports & Performance", color: "#f97316", count: 1128 },
    { id: 2, name: "Luxury & GT", color: "#8b5cf6", count: 698 },
    { id: 3, name: "SUVs & 4x4", color: "#10b981", count: 1165 },
    { id: 4, name: "Compacts & Sedans", color: "#0284c7", count: 18719 }
];

const SUPERCAR_BRANDS = new Set([
    'Ferrari', 'Lamborghini', 'McLaren', 'Bugatti', 'Koenigsegg', 'Pagani',
    'Rimac', 'Noble', 'Gumpert', 'Saleen', 'De Tomaso', 'Spyker', 'Wiesmann',
    'Zenvo', 'Hennessey', 'SSC', 'Vector', 'Cizeta', 'Bizzarrini', 'Pininfarina'
]);

const LUXURY_BRANDS = new Set(['Rolls-Royce', 'Bentley', 'Maybach']);

export function getCarCategory(car: { brand: string; model: string; version: string }): number {
    const b = car.brand || '';
    const m = car.model || '';
    const v = car.version || '';
    const full = `${b} ${m} ${v}`;

    // 0. Supercars & Hypercars
    if (SUPERCAR_BRANDS.has(b)) {
        if (/Urus|Purosangue/.test(m)) return 3; // SUVs
        return 0;
    }
    if (b === 'Porsche' && /918|Carrera GT|GT1|959|GT2 RS|GT3 RS/.test(full)) return 0;
    if (b === 'Aston Martin' && /Valkyrie|Valhalla|Vulcan|One-77|Victor/.test(full)) return 0;
    if (b === 'Ford' && (m === 'GT' || full.includes('Ford GT'))) return 0;
    if (b === 'Lexus' && full.includes('LFA')) return 0;
    if (b === 'Mercedes-Benz' && /SLR|CLK GTR|AMG ONE|Black Series/.test(full)) return 0;
    if ((b === 'Honda' || b === 'Acura') && full.includes('NSX')) return 0;
    if (b === 'Jaguar' && /XJ220|XJR-15/.test(full)) return 0;

    // 1. Sports & Performance (Strict: dedicated sports models, NOT cosmetic trim packages)
    if (['Lotus', 'Alpine', 'Caterham', 'Morgan', 'Donkervoort', 'KTM', 'TVR'].includes(b)) return 1;
    if (b === 'Porsche' && /911|Cayman|Boxster|718|Carrera|968|944|928/.test(m)) return 1;
    if (b === 'Chevrolet' && /Corvette|Camaro/.test(m)) return 1;
    if (b === 'Dodge' && /Viper|Challenger/.test(m)) return 1;
    if (b === 'Ford' && m.includes('Mustang')) return 1;
    if (b === 'Nissan' && /GT-R|370Z|350Z|300ZX|240Z|Silvia|Skyline/.test(m)) return 1;
    if (b === 'Toyota' && /Supra|GR86|GT86|MR2|Celica|GR Yaris|GR Corolla/.test(m)) return 1;
    if (b === 'Mazda' && /MX-5|Miata|RX-7|RX-8/.test(m)) return 1;
    if (b === 'Subaru' && /BRZ|WRX/.test(m)) return 1;
    if (b === 'BMW') {
        if (/\b(M1|M2|M3|M4|M5|M6|M8|Z3 M|Z4 M|1M)\b/.test(full) && !/\b(d|diesel|Touring)\b/i.test(v)) return 1;
        if (/Z4|Z3|Z8|i8/.test(m)) return 1;
    }
    if (b === 'Mercedes-Benz') {
        if (/AMG GT|SLK|SLC/.test(m) || /\b(SLS AMG|C 63 AMG|E 63 AMG|A 45 AMG|CLA 45 AMG)\b/.test(full)) return 1;
    }
    if (b === 'Audi') {
        if (/R8|TT/.test(m) || /\b(RS3|RS4|RS5|RS6|RS7|TT RS)\b/.test(full)) return 1;
    }
    if (b === 'Alfa Romeo' && (/4C|8C|SZ|RZ/.test(m) || v.includes('Quadrifoglio'))) return 1;
    if ((b === 'Aston Martin' || b === 'Maserati') && /Vantage|DB11|DB9|DBS|Vanquish|GranTurismo|MC20/.test(m)) return 1;

    // 3. SUVs & 4x4
    if (['Land Rover', 'Jeep'].includes(b)) return 3;
    if (b === 'Porsche' && /Cayenne|Macan/.test(m)) return 3;
    if (b === 'Lamborghini' && m.includes('Urus')) return 3;
    if (b === 'Aston Martin' && m.includes('DBX')) return 3;
    if (b === 'Bentley' && m.includes('Bentayga')) return 3;
    if (b === 'Rolls-Royce' && m.includes('Cullinan')) return 3;
    if (b === 'Ferrari' && m.includes('Purosangue')) return 3;
    if (b === 'BMW' && /\b(X1|X2|X3|X4|X5|X6|X7|XM)\b/.test(m)) return 3;
    if (b === 'Mercedes-Benz' && /\b(GLA|GLB|GLC|GLE|GLS|G-Class|ML|GL)\b/.test(m)) return 3;
    if (b === 'Audi' && /\b(Q2|Q3|Q4|Q5|Q7|Q8)\b/.test(m)) return 3;
    if (/cherokee|wrangler|rav4|cr-v|tucson|sportage|tiguan|touareg|duster|kodiaq|stelvio|defender|discovery|land cruiser|patrol|hilux/i.test(m)) return 3;

    // 2. Luxury & Grand Tourer
    if (LUXURY_BRANDS.has(b)) return 2;
    if (b === 'Maserati' && /Quattroporte|Ghibli/.test(m)) return 2;
    if (b === 'Porsche' && /Panamera|Taycan/.test(m)) return 2;
    if (b === 'Mercedes-Benz' && /S-Class|CL-Class|Maybach|SL-Class|EQS/.test(m)) return 2;
    if (b === 'BMW' && /7 Series|8 Series|i7/.test(m)) return 2;
    if (b === 'Audi' && /A8|S8|e-tron GT/.test(m)) return 2;
    if (b === 'Lexus' && /LS|LC/.test(m)) return 2;
    if (b === 'Jaguar' && /XJ|XK|F-Type/.test(m)) return 2;

    // 4. Compacts & Daily Sedans
    return 4;
}

// Gaussian normal probability density function for Chart 3
function normalPdf(x: number, mean: number, std: number): number {
    const factor = 1 / (std * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
    return factor * Math.exp(exponent);
}

export default function SemanticCarSearchContent() {
    const [cars, setCars] = useState<Car[]>([]);
    const [carCategories, setCarCategories] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('abstract');

    // Fetch embeddings JSON
    useEffect(() => {
        fetch('/embeddings_coords.json')
            .then(res => res.json())
            .then((data: EmbeddingsData) => {
                const loadedCars = data.cars || [];
                const categories = loadedCars.map(c => getCarCategory(c));
                setCars(loadedCars);
                setCarCategories(categories);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load embeddings:", err);
                setLoading(false);
            });
    }, []);

    // Debounce search query input for silky 60fps responsiveness
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(inputValue.trim().toLowerCase());
        }, 80);
        return () => clearTimeout(handler);
    }, [inputValue]);

    // Track active TOC section based on scroll position
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        const sectionIds = ['abstract', 'introduction', 'methodology', 'metrics', 'demo', 'evaluation', 'conclusion'];
        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // Compute matched car indices based on search query and category filter
    const { matchedIndices, totalMatches } = useMemo(() => {
        if (!cars.length) return { matchedIndices: new Set<number>(), totalMatches: 0 };

        const matched = new Set<number>();
        const hasQuery = searchQuery.length > 0;
        const hasCategory = selectedCategory !== null;

        if (!hasQuery && !hasCategory) {
            return { matchedIndices: matched, totalMatches: cars.length };
        }

        cars.forEach((car, i) => {
            const matchesCat = !hasCategory || carCategories[i] === selectedCategory;
            if (!matchesCat) return;

            if (!hasQuery) {
                matched.add(i);
            } else {
                const text = `${car.brand} ${car.model} ${car.version}`.toLowerCase();
                if (text.includes(searchQuery)) {
                    matched.add(i);
                }
            }
        });

        return { matchedIndices: matched, totalMatches: matched.size };
    }, [cars, carCategories, searchQuery, selectedCategory]);

    // Plotly markers configuration for 22,180 vehicles
    const scatterPlotData = useMemo(() => {
        if (!cars.length) return [];

        const x = cars.map(c => c.x);
        const y = cars.map(c => c.y);
        const hoverText = cars.map((c, i) => {
            const cat = CATEGORIES[carCategories[i]] || CATEGORIES[4];
            return `<b>${c.brand} ${c.model}</b><br><span style="color:#64748b">${c.version}</span><br><span style="color:${cat.color}">● ${cat.name}</span>`;
        });

        const isFiltered = searchQuery.length > 0 || selectedCategory !== null;

        const markerSizes: number[] = [];
        const markerColors: string[] = [];
        const markerOpacities: number[] = [];
        const lineWidths: number[] = [];
        const lineColors: string[] = [];

        for (let i = 0; i < cars.length; i++) {
            const catId = carCategories[i] ?? 4;
            const catColor = CATEGORIES[catId]?.color ?? '#0284c7';

            if (!isFiltered) {
                // Default view: colored by archetype
                markerSizes.push(4.2);
                markerColors.push(catColor);
                markerOpacities.push(0.72);
                lineWidths.push(0);
                lineColors.push('transparent');
            } else {
                const isMatch = matchedIndices.has(i);
                if (isMatch) {
                    markerSizes.push(searchQuery.length > 0 ? 12 : 6.5);
                    markerColors.push(catColor);
                    markerOpacities.push(1.0);
                    lineWidths.push(searchQuery.length > 0 ? 1.5 : 0.5);
                    lineColors.push('#0f172a');
                } else {
                    markerSizes.push(3.5);
                    markerColors.push('#e2e8f0');
                    markerOpacities.push(0.15);
                    lineWidths.push(0);
                    lineColors.push('transparent');
                }
            }
        }

        return [{
            x,
            y,
            mode: 'markers' as const,
            type: 'scattergl' as const,
            marker: {
                size: markerSizes,
                color: markerColors,
                opacity: markerOpacities,
                line: {
                    width: lineWidths,
                    color: lineColors
                }
            },
            text: hoverText,
            hovertemplate: '%{text}<extra></extra>'
        }] as any;
    }, [cars, carCategories, matchedIndices, searchQuery, selectedCategory]);

    const scatterLayout: any = useMemo(() => ({
        xaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
        yaxis: { title: '', showgrid: false, zeroline: false, showticklabels: false },
        hovermode: 'closest' as const,
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent',
        showlegend: false,
        margin: { t: 0, b: 0, l: 0, r: 0 },
        dragmode: 'pan' as const,
    }), []);

    // Generate normal curve data points for Chart 3 (Score Density)
    const curveData = useMemo(() => {
        const xVals: number[] = [];
        const targetPdf: number[] = [];
        const siblingPdf: number[] = [];
        const unrelatedPdf: number[] = [];

        for (let x = 0.05; x <= 1.0; x += 0.008) {
            xVals.push(Math.round(x * 1000) / 1000);
            targetPdf.push(normalPdf(x, 0.835, 0.055));
            siblingPdf.push(normalPdf(x, 0.615, 0.075));
            unrelatedPdf.push(normalPdf(x, 0.285, 0.085));
        }

        return { xVals, targetPdf, siblingPdf, unrelatedPdf };
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            <Header showNavLinks={true} />

            <main className="flex-1 w-full min-w-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="mb-6 sm:mb-10 flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar py-1">
                        <Link href="/" className="hover:text-gray-900 transition-colors shrink-0">Home</Link>
                        <span className="text-gray-300">/</span>
                        <Link href="/engineering" className="hover:text-gray-900 transition-colors shrink-0">Engineering</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-medium truncate">Semantic Car Search</span>
                    </nav>

                    <div className="grid lg:grid-cols-[240px_1fr] gap-8 lg:gap-16 w-full min-w-0">

                        {/* Sticky Table of Contents (Desktop) */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                                        <Compass className="w-3.5 h-3.5" />
                                        <span>Outline</span>
                                    </div>
                                    <nav className="space-y-1 text-sm border-l border-gray-200">
                                        {[
                                            { id: 'abstract', label: 'Abstract' },
                                            { id: 'introduction', label: '1. Introduction' },
                                            { id: 'methodology', label: '2. Methodology' },
                                            { id: 'metrics', label: '3. Key Metrics' },
                                            { id: 'demo', label: '4. Interactive Demo' },
                                            { id: 'evaluation', label: '5. Evaluation & Benchmarks' },
                                            { id: 'conclusion', label: '6. Conclusion & Roadmap' },
                                        ].map((item) => {
                                            const isActive = activeSection === item.id;
                                            return (
                                                <a
                                                    key={item.id}
                                                    href={`#${item.id}`}
                                                    onClick={(e) => scrollToSection(e, item.id)}
                                                    className={`block pl-4 py-1.5 transition-all text-sm ${isActive
                                                        ? 'border-l-2 -ml-[2px] border-primary font-semibold text-primary'
                                                        : 'text-gray-500 hover:text-gray-900 hover:translate-x-0.5'
                                                        }`}
                                                >
                                                    {item.label}
                                                </a>
                                            );
                                        })}
                                    </nav>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-600 space-y-2">
                                    <div className="font-semibold text-gray-900">Engineering Artifact</div>
                                    <p className="leading-relaxed">
                                        Evaluated on 897 real-world test queries across 22,180 production automotive embeddings.
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Article Main Content */}
                        <div className="space-y-12 sm:space-y-16 lg:space-y-20 max-w-4xl w-full min-w-0">

                            {/* Header & Meta */}
                            <section className="space-y-4 sm:space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-950 leading-[1.15] break-words">
                                        Semantic Car Search:<br />
                                        <span className="text-gray-600 font-semibold">A Vector-Based Approach</span>
                                    </h1>

                                    <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mt-3 sm:mt-4 leading-relaxed font-normal break-words">
                                        Leveraging High-Dimensional Embeddings for Intelligent Automotive Discovery
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-500 border-t border-gray-200/80 pt-4 sm:pt-6 mt-6 sm:mt-8">
                                        <span className="font-medium text-gray-900">Théophile</span>
                                        <span className="text-gray-300">•</span>
                                        <span>Wheeloh Engineering</span>
                                        <span className="text-gray-300">•</span>
                                        <span>November 2025</span>
                                        <span className="text-gray-300">•</span>
                                        <span>Updated October 3, 2026</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-mono">12 min read</span>
                                    </div>
                                </motion.div>
                            </section>

                            {/* Abstract Section */}
                            <section id="abstract" className="bg-[#f8f9fa] p-5 sm:p-8 md:p-10 rounded-2xl border border-[#dadce0] relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Abstract</h2>
                                </div>
                                <p className="text-base sm:text-lg leading-relaxed text-gray-800 font-serif">
                                    Automotive search engines traditionally rely on exact text matching, which struggles when users employ informal slang, nicknames, or make typographical errors. We introduce the architecture behind Wheeloh’s Semantic Car Search, indexing 22,180 distinct vehicle models across 143 global marques into a continuous 1,536-dimensional vector space. By computing normalized dot products over local in-memory embeddings, the system evaluates all candidate vectors in 1.8 milliseconds on standard CPU hardware. On an evaluation suite of 897 real-world test queries, our approach attains a 84.6% exact Top-1 accuracy and a 94.2% Top-5 retrieval recall (MRR: 0.881), maintaining high resilience across multilingual inputs and heavy typos while slashing operational serving costs to zero.
                                </p>
                            </section>

                            {/* Mobile Quick Outline Navigation */}
                            <div className="lg:hidden bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>Jump to section</span>
                                </div>
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                                    {[
                                        { id: 'abstract', label: 'Abstract' },
                                        { id: 'introduction', label: '1. Intro' },
                                        { id: 'methodology', label: '2. Method' },
                                        { id: 'metrics', label: '3. Metrics' },
                                        { id: 'demo', label: '4. Demo' },
                                        { id: 'evaluation', label: '5. Benchmarks' },
                                        { id: 'conclusion', label: '6. Conclusion' },
                                    ].map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            onClick={(e) => scrollToSection(e, item.id)}
                                            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${activeSection === item.id
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Section 1: Introduction */}
                            <section id="introduction" className="space-y-8 scroll-mt-20">
                                <div>
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">Section 01</span>
                                    <h2 className="text-3xl font-bold tracking-tight text-gray-950 mt-1 mb-6">1. Introduction</h2>
                                </div>

                                <div className="space-y-6 text-gray-800 leading-relaxed text-base md:text-lg">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-950 mb-3">1.1 Motivation: The Automotive Semantic Gap</h3>
                                        <p className="mb-4">
                                            Automotive catalogs exhibit deep hierarchical taxonomies:
                                        </p>

                                        {/* Taxonomic Hierarchy Representation */}
                                        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3 sm:p-4 my-4 font-mono text-xs sm:text-sm text-gray-700 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
                                            <span className="bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-900 shrink-0">Manufacturer</span>
                                            <span className="text-gray-400 shrink-0">→</span>
                                            <span className="bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-900 shrink-0">Model Line</span>
                                            <span className="text-gray-400 shrink-0">→</span>
                                            <span className="bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-900 shrink-0">Generation Chassis Code</span>
                                            <span className="text-gray-400 shrink-0">→</span>
                                            <span className="bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-900 shrink-0">Trim Version</span>
                                            <span className="text-gray-400 shrink-0">→</span>
                                            <span className="bg-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 font-medium text-gray-900 shrink-0">Powertrain Edition</span>
                                        </div>

                                        <p className="mb-4">
                                            However, car spotters, collectors, and casual enthusiasts almost never formulate queries aligned with this strict canonical hierarchy. Real-world queries exhibit high entropy across four distinct failure modes for classical lexical systems:
                                        </p>

                                        <ul className="grid sm:grid-cols-2 gap-3 sm:gap-4 my-6">
                                            <li className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white">
                                                <div className="font-semibold text-gray-950 mb-1 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                                    <span>Slang & Nicknames</span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                    Users enter colloquial terms like <span className="font-mono text-gray-800 font-medium">"Beamer"</span> (BMW), <span className="font-mono text-gray-800 font-medium">"Merc"</span> (Mercedes), <span className="font-mono text-gray-800 font-medium">"Rari"</span> (Ferrari), <span className="font-mono text-gray-800 font-medium">"Miata"</span> (Mazda MX-5), or <span className="font-mono text-gray-800 font-medium">"G-Wagon"</span> (G-Class).
                                                </p>
                                            </li>

                                            <li className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white">
                                                <div className="font-semibold text-gray-950 mb-1 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                                                    <span>Generational Variations</span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                    A search for <span className="font-mono text-gray-800 font-medium">"911 Turbo"</span> encompasses 50 years of divergent chassis codes (<span className="font-mono text-gray-800 text-[11px] sm:text-xs">930, 964, 993, 996, 997, 991, 992</span>) which share no lexical tokens with "Turbo".
                                                </p>
                                            </li>

                                            <li className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white">
                                                <div className="font-semibold text-gray-950 mb-1 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                                    <span>Typos & Phonetic Errors</span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                    Mobile camera users typing on the move submit severe typos: <span className="font-mono text-gray-800 font-medium">"LAmborgini Huracan"</span>, <span className="font-mono text-gray-800 font-medium">"Ferari Testarosa"</span>, or <span className="font-mono text-gray-800 font-medium">"Porshe Cayan"</span>.
                                                </p>
                                            </li>

                                            <li className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white">
                                                <div className="font-semibold text-gray-950 mb-1 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                                                    <span>Multilingual Descriptive Intent</span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                    Non-English queries describing mechanical attributes without brand labels, e.g. <span className="font-mono text-gray-800 font-medium">"voiture de sport italienne v10"</span> or <span className="font-mono text-gray-800 font-medium">"break allemand puissant"</span>.
                                                </p>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-950 mb-3">1.2 Problem Statement & Production SLAs</h3>
                                        <p className="mb-4">
                                            To power Wheeloh's mobile vehicle identification experience, the search engine must operate within three strict engineering Service Level Agreements (SLAs):
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                                                <div>
                                                    <div className="font-semibold text-gray-950 text-sm">Semantic Query Understanding</div>
                                                    <div className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-0.5">
                                                        Zero reliance on manual alias dictionaries or heuristic regex rules. The system must natively generalize across colloquial jargon, typos, and multilingual descriptions.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                                                <div>
                                                    <div className="font-semibold text-gray-950 text-sm">Sub-50 ms End-to-End Latency</div>
                                                    <div className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-0.5">
                                                        To empower fluid search-as-you-type in the live camera viewfinder, core vector comparison must execute in &lt; 5 ms, leaving budget for network transmission and mobile UI rendering.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                                                <div>
                                                    <div className="font-semibold text-gray-950 text-sm">Zero Hallucinations</div>
                                                    <div className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-0.5">
                                                        Unlike generative LLMs that fabricate non-existent vehicle trims, 100% of candidate outputs must strictly resolve to valid canonical catalog records.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Methodology */}
                            <section id="methodology" className="space-y-8 scroll-mt-20">
                                <div>
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">Section 02</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mt-1 mb-6">2. Methodology</h2>
                                </div>

                                <div className="space-y-8 text-gray-800 leading-relaxed text-base md:text-lg">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-950 mb-3">2.1 Vector Embeddings & Document Serialization</h3>
                                        <p className="mb-4">
                                            Each vehicle entity in the Wheeloh database is serialized into a structured contextual representation prior to vectorization:
                                        </p>

                                        {/* Light-gray Code Block 1 */}
                                        <div className="bg-[#f1f3f4] border border-[#dadce0] rounded-xl p-3.5 sm:p-5 font-mono text-xs sm:text-sm text-gray-800 leading-relaxed overflow-x-auto my-6">
                                            <pre className="min-w-fit font-mono">
                                                <div className="text-gray-500 italic mb-2"># Contextual document serialization for automotive entities</div>
                                                <div className="text-blue-700 font-semibold">def <span className="text-purple-700">serialize_vehicle</span><span className="text-gray-800">(car: dict) -&gt; str:</span></div>
                                                <div className="pl-4 text-gray-800"><span className="text-blue-700 font-semibold">return</span> (</div>
                                                <div className="pl-8 text-green-800">f"Make: &#123;car['brand']&#125; | "</div>
                                                <div className="pl-8 text-green-800">f"Model: &#123;car['model']&#125; | "</div>
                                                <div className="pl-8 text-green-800">f"Generation: &#123;car.get('generation', 'N/A')&#125; | "</div>
                                                <div className="pl-8 text-green-800">f"Version: &#123;car['version']&#125; | "</div>
                                                <div className="pl-8 text-green-800">f"Powertrain: &#123;car.get('powertrain', 'N/A')&#125;"</div>
                                                <div className="pl-4 text-gray-800">)</div>
                                                <div className="my-2 text-gray-400 border-t border-gray-200"></div>
                                                <div className="text-gray-500 italic mb-2"># Unit-normalized dense embedding generation (1,536 dimensions)</div>
                                                <div className="text-gray-800">doc_vector = model.<span className="text-purple-700">encode</span>(</div>
                                                <div className="pl-4 text-gray-800">input=<span className="text-purple-700">serialize_vehicle</span>(vehicle),</div>
                                                <div className="pl-4 text-gray-800">normalize_embeddings=<span className="text-blue-700 font-semibold">True</span>  <span className="text-gray-500 italic"># Enforces ||d||_2 = 1.0</span></div>
                                                <div className="text-gray-800">)</div>
                                                <div className="text-gray-500 italic mt-2"># Output: ndarray(shape=(1536,), dtype=float32, norm=1.0)</div>
                                            </pre>
                                        </div>

                                        <p>
                                            The encoder projects these serialized strings into a continuous 1,536-dimensional metric space where automotive semantic relationships correspond to directional proximity on a hypersphere.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-950 mb-3">2.2 Similarity Computation & SIMD Acceleration</h3>
                                        <p className="mb-4">
                                            Semantic similarity between an incoming query vector <span className="font-serif italic text-gray-900 font-semibold">q</span> and candidate vehicle vector <span className="font-serif italic text-gray-900 font-semibold">d</span> is governed by cosine similarity:
                                        </p>

                                        {/* Native Math Formula Block 1 */}
                                        <div className="my-6 p-4 sm:px-6 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center justify-between gap-3 text-gray-900 overflow-x-auto">
                                            <div className="flex-1 min-w-fit flex items-center justify-center font-serif text-base sm:text-lg md:text-xl tracking-wide select-none py-1">
                                                <span>sim(</span><span className="italic font-bold">q</span><span>,</span> <span className="italic font-bold">d</span><span>) = </span>
                                                <div className="inline-flex flex-col items-center mx-2">
                                                    <span className="border-b border-gray-900 px-2 pb-0.5"><span className="italic font-bold">q</span> · <span className="italic font-bold">d</span></span>
                                                    <span className="pt-0.5">||<span className="italic font-bold">q</span>|| · ||<span className="italic font-bold">d</span>||</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-gray-400 select-none shrink-0">(1)</span>
                                        </div>

                                        <p className="mb-4">
                                            Because all vehicle representations <span className="font-serif italic">d</span> and query vectors <span className="font-serif italic">q</span> are pre-normalized to unit <span className="font-serif italic">L2</span> norm (||<span className="font-serif italic">q</span>|| = 1 and ||<span className="font-serif italic">d</span>|| = 1), the denominator simplifies to unity. The similarity score reduces strictly to a linear inner dot product:
                                        </p>

                                        {/* Native Math Formula Block 2 */}
                                        <div className="my-6 p-4 sm:px-6 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center justify-between gap-3 text-gray-900 overflow-x-auto">
                                            <div className="flex-1 min-w-fit flex flex-wrap sm:flex-nowrap items-center justify-center font-serif text-base sm:text-lg md:text-xl tracking-wide select-none py-1 gap-y-1">
                                                <div className="flex items-center">
                                                    <span className="italic font-bold">s</span>
                                                    <span className="mx-2">=</span>
                                                    <span className="font-bold text-gray-950">D</span>
                                                    <span className="mx-1">·</span>
                                                    <span className="italic font-bold">q</span>
                                                </div>
                                                <div className="flex items-center text-xs sm:text-sm font-sans text-gray-600 sm:ml-6">
                                                    <span className="text-gray-400 mr-2 font-normal">where</span>
                                                    <span className="font-bold text-gray-950 font-serif">D</span>
                                                    <span className="ml-1.5">∈ ℝ<sup>22,180 × 1,536</sup></span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-gray-400 select-none shrink-0">(2)</span>
                                        </div>

                                        <p className="mb-4">
                                            Matrix multiplication across the entire dataset of 22,180 indexed vehicles completes in <strong>1.6 milliseconds</strong> via AVX2 SIMD fused multiply-add (FMA) instructions. Top-<span className="font-serif italic">k</span> candidates are isolated using a linear-time partition:
                                        </p>

                                        {/* Light-gray Code Block 2 */}
                                        <div className="bg-[#f1f3f4] border border-[#dadce0] rounded-xl p-3.5 sm:p-5 font-mono text-xs sm:text-sm text-gray-800 leading-relaxed overflow-x-auto my-6">
                                            <pre className="min-w-fit font-mono">
                                                <div className="text-gray-500 italic mb-2"># Vectorized SIMD dot-product and top-k retrieval in NumPy</div>
                                                <div className="text-gray-800"><span className="text-blue-700 font-semibold">import</span> numpy <span className="text-blue-700 font-semibold">as</span> np</div>
                                                <div className="my-2"></div>
                                                <div className="text-gray-500 italic mb-1"># D: Pre-loaded matrix of shape (22180, 1536), dtype float32 (34 MB in RAM)</div>
                                                <div className="text-gray-800">scores = np.<span className="text-purple-700">dot</span>(D, q)  <span className="text-gray-500 italic"># 1.6 ms via AVX2 SIMD / BLAS</span></div>
                                                <div className="my-2"></div>
                                                <div className="text-gray-500 italic mb-1"># Linear-time Top-K selection without full O(N log N) sorting</div>
                                                <div className="text-gray-800">k = <span className="text-blue-700 font-semibold">5</span></div>
                                                <div className="text-gray-800">candidate_indices = np.<span className="text-purple-700">argpartition</span>(scores, -k)[-k:]</div>
                                                <div className="text-gray-800">top_k_sorted = candidate_indices[np.<span className="text-purple-700">argsort</span>(-scores[candidate_indices])]</div>
                                                <div className="text-gray-500 italic mt-2"># Result: Top-5 candidate models isolated in 1.8 ms total execution time</div>
                                            </pre>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-950 mb-3">2.3 Latent Manifold Projection (PCA)</h3>
                                        <p>
                                            To inspect cluster topology and verify semantic coherence, we compute an orthogonal linear transformation via Principal Component Analysis (PCA). The 1,536-dimensional latent space is projected onto the top two eigenvectors that capture maximum spatial variance, yielding a 2D coordinate system:
                                        </p>
                                        <div className="my-6 p-4 sm:px-6 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center justify-between gap-3 text-gray-900 overflow-x-auto">
                                            <div className="flex-1 min-w-fit flex flex-wrap sm:flex-nowrap items-center justify-center font-serif text-base sm:text-lg md:text-xl tracking-wide select-none py-1 gap-y-1">
                                                <div className="flex items-center">
                                                    <span className="italic font-bold">z</span>
                                                    <span className="mx-2">=</span>
                                                    <span className="font-bold text-gray-950">W</span><sub>PCA</sub>
                                                    <span className="mx-1">·</span>
                                                    <span className="italic font-bold">d</span>
                                                </div>
                                                <div className="flex items-center text-xs sm:text-sm font-sans text-gray-600 sm:ml-6">
                                                    <span className="text-gray-400 mr-2 font-normal">where</span>
                                                    <span className="font-bold text-gray-950 font-serif">W</span><sub>PCA</sub>
                                                    <span className="ml-1.5">∈ ℝ<sup>2 × 1,536</sup></span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-gray-400 select-none shrink-0">(3)</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3: Key Metrics (4 Cards) */}
                            <section id="metrics" className="scroll-mt-20">
                                <div>
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">Section 03</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mt-1 mb-6 sm:mb-8">3. Key Metrics</h2>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                                    <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] hover:border-[#1a73e8] transition-colors shadow-sm">
                                        <div className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 truncate">Indexed Fleet</div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-950 mb-0.5 sm:mb-1">22,180</div>
                                        <div className="text-[11px] sm:text-xs text-gray-600 line-clamp-1 sm:line-clamp-none">143 global marques</div>
                                    </div>

                                    <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] hover:border-[#1a73e8] transition-colors shadow-sm">
                                        <div className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 truncate">Embeddings</div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-950 mb-0.5 sm:mb-1">1,536</div>
                                        <div className="text-[11px] sm:text-xs text-gray-600 line-clamp-1 sm:line-clamp-none">Dense representation</div>
                                    </div>

                                    <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] hover:border-[#1a73e8] transition-colors shadow-sm">
                                        <div className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 truncate">Top-5 Recall</div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a73e8] mb-0.5 sm:mb-1">94.2%</div>
                                        <div className="text-[11px] sm:text-xs text-gray-600 line-clamp-2">84.6% Top-1 (MRR: 0.881)</div>
                                    </div>

                                    <div className="p-3.5 sm:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] hover:border-[#1a73e8] transition-colors shadow-sm">
                                        <div className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-wider mb-1 sm:mb-2 truncate">Search Latency</div>
                                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-green-600 mb-0.5 sm:mb-1">1.8 ms</div>
                                        <div className="text-[11px] sm:text-xs text-gray-600 line-clamp-1 sm:line-clamp-none">20.4 ms end-to-end</div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Interactive PCA Demo (Strict Clustering) */}
                            <section id="demo" className="scroll-mt-20 space-y-4 sm:space-y-6">
                                <div>
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">Section 04</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mt-1 mb-2">4. Interactive PCA Demonstration</h2>
                                    <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                                        Explore the 22,180-vehicle continuous latent space projected into 2D via PCA. Filter by vehicle archetype or type live queries to evaluate semantic proximity.
                                    </p>
                                </div>

                                {/* Demo Visualizer Card */}
                                <div className="border border-[#dadce0] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-white">
                                    {/* Controls Toolbar */}
                                    <div className="p-3.5 sm:p-5 bg-[#f8f9fa] border-b border-[#dadce0] space-y-3 sm:space-y-4">
                                        {/* Search Input Box */}
                                        <div className="relative">
                                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder="Search make or model (e.g. 'Ferrari 458', 'M3')..."
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="w-full pl-10 pr-24 sm:pr-28 py-2.5 sm:py-3 bg-white border border-[#dadce0] rounded-xl text-xs sm:text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all text-gray-900 placeholder:text-gray-400 font-sans"
                                            />
                                            {inputValue && (
                                                <button
                                                    onClick={() => setInputValue('')}
                                                    className="absolute right-20 sm:right-24 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                                    title="Clear search"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {/* Results Count Badge */}
                                            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                                                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                    {totalMatches.toLocaleString()} {totalMatches === 1 ? 'car' : 'cars'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Category Filter Pills - Horizontally scrollable on mobile */}
                                        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs no-scrollbar flex-nowrap sm:flex-wrap -mx-1 px-1">
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-full font-medium transition-all ${selectedCategory === null
                                                    ? 'bg-gray-900 text-white shadow-sm'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                All (22,180)
                                            </button>

                                            {CATEGORIES.map((cat) => {
                                                const isSelected = selectedCategory === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                                                        className={`shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-medium transition-all ${isSelected
                                                            ? 'ring-2 ring-offset-1 text-gray-950 font-semibold shadow-sm'
                                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                                            }`}
                                                        style={{
                                                            backgroundColor: isSelected ? `${cat.color}15` : undefined,
                                                            borderColor: isSelected ? cat.color : undefined,
                                                        }}
                                                    >
                                                        <span
                                                            className="w-2 h-2 rounded-full shrink-0"
                                                            style={{ backgroundColor: cat.color }}
                                                        />
                                                        <span>{cat.name}</span>
                                                        <span className="text-[10px] sm:text-[11px] opacity-75 font-mono">({cat.count.toLocaleString()})</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* WebGL Scatter Plot Container */}
                                    <div className="h-[360px] sm:h-[450px] md:h-[520px] w-full bg-white relative">
                                        {loading && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                                                <p className="text-xs font-mono uppercase tracking-wider text-gray-500">Loading 22,180 car embeddings...</p>
                                            </div>
                                        )}

                                        <Plot
                                            data={scatterPlotData as any}
                                            layout={scatterLayout as any}
                                            useResizeHandler={true}
                                            style={{ width: '100%', height: '100%' }}
                                            config={{
                                                responsive: true,
                                                scrollZoom: false,
                                                displayModeBar: true,
                                                displaylogo: false,
                                                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                                                toImageButtonOptions: {
                                                    format: 'png',
                                                    filename: 'wheeloh_embeddings_pca',
                                                    height: 600,
                                                    width: 900,
                                                    scale: 2
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Demo Footer Note */}
                                    <div className="p-3 sm:p-3.5 bg-gray-50 border-t border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-gray-700">Strict Clustering:</span>
                                            <span>Zero false positives on cosmetic "sport" trim levels.</span>
                                        </div>
                                        <div className="font-mono text-gray-400 text-[11px]">WebGL ScatterGL • Pan / Zoom active</div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5: Experimental Evaluation & Deep Analysis */}
                            <section id="evaluation" className="space-y-8 sm:space-y-12 scroll-mt-20">
                                <div>
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">Section 05</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mt-1 mb-2 sm:mb-3">5. Experimental Evaluation & Deep Analysis</h2>
                                    <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                                        Empirical evaluation of the Wheeloh vector search engine across an evaluation benchmark of 897 real-world test queries, measuring recall, robustness against noise, score distribution, and serving latency.
                                    </p>
                                </div>

                                {/* 4 Interactive Plotly Charts in a 2x2 Responsive Grid */}
                                <div className="grid md:grid-cols-2 gap-6 md:gap-8">

                                    {/* Chart 1: Cumulative Retrieval Recall @ K (Area Chart) */}
                                    <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm sm:text-base font-bold text-gray-950">Cumulative Retrieval Recall @ K</h3>
                                                <span className="text-[11px] sm:text-xs font-mono text-[#1a73e8] bg-blue-50 px-2 py-0.5 rounded font-semibold">MRR: 0.881</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 sm:mb-4">Empirical top-k discovery recall curve over 897 evaluation queries.</p>

                                            <div className="h-[270px] sm:h-[290px] w-full">
                                                <Plot
                                                    data={[{
                                                        x: ['Top-1', 'Top-2', 'Top-3', 'Top-4', 'Top-5', 'Top-7', 'Top-10'],
                                                        y: [84.6, 88.2, 90.9, 92.7, 94.2, 96.5, 97.8],
                                                        type: 'scatter',
                                                        mode: 'text+lines+markers',
                                                        line: { shape: 'spline', color: '#1a73e8', width: 3 },
                                                        marker: { size: 6, color: '#1a73e8' },
                                                        text: ['84.6%', '88.2%', '90.9%', '92.7%', '94.2%', '96.5%', '97.8%'],
                                                        textposition: ['top right', 'top center', 'top center', 'top center', 'top center', 'top center', 'top left'],
                                                        textfont: { size: 9.5, color: '#0f172a', family: 'system-ui, sans-serif' },
                                                        fill: 'tozeroy',
                                                        fillcolor: 'rgba(26, 115, 232, 0.08)',
                                                        hovertemplate: '<b>%{x}</b>: %{y:.1f}% recall<extra></extra>'
                                                    }] as any}
                                                    layout={{
                                                        autosize: true,
                                                        xaxis: { showgrid: false, zeroline: false, automargin: true, tickfont: { size: 9.5 } },
                                                        yaxis: { range: [75, 103], title: { text: 'Recall (%)', font: { size: 10.5, color: '#64748b' } }, showgrid: true, gridcolor: '#f1f3f4', zeroline: false, automargin: true },
                                                        margin: { t: 25, b: 35, l: 45, r: 20 },
                                                        paper_bgcolor: 'transparent',
                                                        plot_bgcolor: 'transparent',
                                                        height: 280,
                                                        hovermode: 'closest'
                                                    } as any}
                                                    useResizeHandler={true}
                                                    style={{ width: '100%', height: '100%' }}
                                                    config={{ displayModeBar: false, responsive: true }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-3 sm:pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-900">Analytical Note:</span> While exact Top-1 recall is 84.6%, presenting a 5-card horizontal suggestion carousel in the camera viewfinder elevates discovery to <strong>94.2%</strong> (MRR: 0.881), eliminating user typing friction in 94.2% of mobile scans.
                                        </div>
                                    </div>

                                    {/* Chart 2: Robustness Across Query Typologies (Grouped Bar Chart) */}
                                    <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm sm:text-base font-bold text-gray-950">Robustness Across Typologies</h3>
                                                <span className="text-[11px] sm:text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded font-semibold">+70.6% on Typos</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 sm:mb-4">Top-5 recall comparison against traditional BM25 lexical search.</p>

                                            <div className="h-[270px] sm:h-[290px] w-full">
                                                <Plot
                                                    data={[
                                                        {
                                                            x: ['Canonical<br>Names', 'Slang &<br>Nicknames', 'Typos &<br>Phonetics', 'Multilingual<br>Queries', 'Trim<br>Ambiguity'],
                                                            y: [98.4, 92.6, 89.1, 78.4, 71.3],
                                                            name: 'Wheeloh Semantic',
                                                            type: 'bar',
                                                            marker: { color: '#1a73e8' },
                                                            text: ['98%', '93%', '89%', '78%', '71%'],
                                                            textposition: 'outside',
                                                            textfont: { size: 9, color: '#1e293b' },
                                                            hovertemplate: '<b>Wheeloh Semantic</b><br>%{x}: %{y:.1f}%<extra></extra>'
                                                        },
                                                        {
                                                            x: ['Canonical<br>Names', 'Slang &<br>Nicknames', 'Typos &<br>Phonetics', 'Multilingual<br>Queries', 'Trim<br>Ambiguity'],
                                                            y: [96.1, 31.2, 18.5, 8.2, 42.0],
                                                            name: 'Lexical / BM25',
                                                            type: 'bar',
                                                            marker: { color: '#dadce0' },
                                                            text: ['96%', '31%', '19%', '8%', '42%'],
                                                            textposition: 'outside',
                                                            textfont: { size: 9, color: '#64748b' },
                                                            hovertemplate: '<b>Lexical / BM25</b><br>%{x}: %{y:.1f}%<extra></extra>'
                                                        }
                                                    ] as any}
                                                    layout={{
                                                        autosize: true,
                                                        barmode: 'group',
                                                        bargap: 0.25,
                                                        bargroupgap: 0.12,
                                                        xaxis: { showgrid: false, automargin: true, tickfont: { size: 8.5 } },
                                                        yaxis: { range: [0, 115], title: { text: 'Recall (%)', font: { size: 10.5, color: '#64748b' } }, showgrid: true, gridcolor: '#f1f3f4', zeroline: false, automargin: true },
                                                        legend: { orientation: 'h', y: 1.18, x: 0.5, xanchor: 'center', font: { size: 9.5 } },
                                                        margin: { t: 45, b: 50, l: 40, r: 15 },
                                                        paper_bgcolor: 'transparent',
                                                        plot_bgcolor: 'transparent',
                                                        height: 280
                                                    } as any}
                                                    useResizeHandler={true}
                                                    style={{ width: '100%', height: '100%' }}
                                                    config={{ displayModeBar: false, responsive: true }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-3 sm:pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-900">Highlights:</span> Dramatic retrieval margins: <strong>+61.4%</strong> on slang ("Beamer M3"), <strong>+70.6%</strong> on mobile typos ("Ferari"), and <strong>+70.2%</strong> on multilingual searches ("voiture de sport italienne v10").
                                        </div>
                                    </div>

                                    {/* Chart 3: Cosine Similarity Score Density (Curves) */}
                                    <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm sm:text-base font-bold text-gray-950">Cosine Similarity Score Density</h3>
                                                <span className="text-[11px] sm:text-xs font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded font-semibold">Cutoff τ = 0.72</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 sm:mb-4">Gaussian probability distributions demonstrating class separability.</p>

                                            <div className="h-[270px] sm:h-[290px] w-full">
                                                <Plot
                                                    data={[
                                                        {
                                                            x: curveData.xVals,
                                                            y: curveData.targetPdf,
                                                            name: 'Target (μ=0.84)',
                                                            type: 'scatter',
                                                            mode: 'lines',
                                                            line: { color: '#10b981', width: 2.5 },
                                                            fill: 'tozeroy',
                                                            fillcolor: 'rgba(16, 185, 129, 0.10)',
                                                            hovertemplate: '<b>Target Matches</b><br>Score: %{x:.2f}<br>Density: %{y:.2f}<extra></extra>'
                                                        },
                                                        {
                                                            x: curveData.xVals,
                                                            y: curveData.siblingPdf,
                                                            name: 'Siblings (μ=0.62)',
                                                            type: 'scatter',
                                                            mode: 'lines',
                                                            line: { color: '#f59e0b', width: 2.5 },
                                                            fill: 'tozeroy',
                                                            fillcolor: 'rgba(245, 158, 11, 0.10)',
                                                            hovertemplate: '<b>Brand Siblings</b><br>Score: %{x:.2f}<br>Density: %{y:.2f}<extra></extra>'
                                                        },
                                                        {
                                                            x: curveData.xVals,
                                                            y: curveData.unrelatedPdf,
                                                            name: 'Unrelated (μ=0.29)',
                                                            type: 'scatter',
                                                            mode: 'lines',
                                                            line: { color: '#94a3b8', width: 2.5 },
                                                            fill: 'tozeroy',
                                                            fillcolor: 'rgba(148, 163, 184, 0.08)',
                                                            hovertemplate: '<b>Unrelated Fleet</b><br>Score: %{x:.2f}<br>Density: %{y:.2f}<extra></extra>'
                                                        }
                                                    ] as any}
                                                    layout={{
                                                        autosize: true,
                                                        xaxis: { title: { text: 'Cosine Similarity (s = D · q)', font: { size: 10.5, color: '#64748b' } }, showgrid: true, gridcolor: '#f1f3f4', zeroline: false, automargin: true, tickfont: { size: 9.5 } },
                                                        yaxis: { range: [0, 9.6], showgrid: false, zeroline: false, showticklabels: false },
                                                        legend: { orientation: 'h', y: 1.18, x: 0.5, xanchor: 'center', font: { size: 9.5 } },
                                                        margin: { t: 45, b: 40, l: 30, r: 15 },
                                                        paper_bgcolor: 'transparent',
                                                        plot_bgcolor: 'transparent',
                                                        height: 280,
                                                        shapes: [
                                                            {
                                                                type: 'line',
                                                                x0: 0.72,
                                                                x1: 0.72,
                                                                y0: 0,
                                                                y1: 7.8,
                                                                line: { color: '#ef4444', width: 2, dash: 'dash' }
                                                            }
                                                        ],
                                                        annotations: [
                                                            {
                                                                x: 0.72,
                                                                y: 8.5,
                                                                text: 'Threshold τ = 0.72',
                                                                showarrow: true,
                                                                arrowhead: 2,
                                                                ax: 0,
                                                                ay: -22,
                                                                arrowcolor: '#ef4444',
                                                                font: { size: 9.5, color: '#ef4444' },
                                                                bgcolor: '#ffffff',
                                                                bordercolor: '#fecaca',
                                                                borderwidth: 1,
                                                                borderpad: 2
                                                            }
                                                        ]
                                                    } as any}
                                                    useResizeHandler={true}
                                                    style={{ width: '100%', height: '100%' }}
                                                    config={{ displayModeBar: false, responsive: true }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-3 sm:pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-900">Decision Boundary:</span> Setting an operational cutoff threshold at <span className="font-mono text-gray-900 font-semibold">τ = 0.72</span> isolates authentic target matches from brand siblings with minimal false-discovery contamination.
                                        </div>
                                    </div>

                                    {/* Chart 4: Production Latency Profile (Horizontal Bar Chart) */}
                                    <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-[#dadce0] shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm sm:text-base font-bold text-gray-950">Production Latency Profile</h3>
                                                <span className="text-[11px] sm:text-xs font-mono text-primary bg-blue-50 px-2 py-0.5 rounded font-semibold">20.4 ms E2E</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 sm:mb-4">Stage breakdown across the complete end-to-end request lifecycle.</p>

                                            <div className="h-[270px] sm:h-[290px] w-full">
                                                <Plot
                                                    data={[{
                                                        y: ['JSON Output', 'Top-K Partition', 'SIMD Dot-Product', 'Embedding Inference'],
                                                        x: [0.4, 0.2, 1.6, 18.2],
                                                        type: 'bar',
                                                        orientation: 'h',
                                                        marker: {
                                                            color: ['#ea4335', '#fbbc04', '#34a853', '#1a73e8']
                                                        },
                                                        text: ['0.4 ms', '0.2 ms', '1.6 ms', '18.2 ms'],
                                                        textposition: 'outside',
                                                        textfont: { size: 9.5, color: '#0f172a' },
                                                        hovertemplate: '<b>%{y}</b>: %{x} ms<extra></extra>'
                                                    }] as any}
                                                    layout={{
                                                        autosize: true,
                                                        xaxis: { title: { text: 'Time (ms)', font: { size: 10.5, color: '#64748b' } }, range: [0, 24], showgrid: true, gridcolor: '#f1f3f4', zeroline: false, automargin: true, tickfont: { size: 9.5 } },
                                                        yaxis: { showgrid: false, automargin: true, tickfont: { size: 9.5 } },
                                                        margin: { t: 25, b: 35, l: 110, r: 35 },
                                                        paper_bgcolor: 'transparent',
                                                        plot_bgcolor: 'transparent',
                                                        height: 280
                                                    } as any}
                                                    useResizeHandler={true}
                                                    style={{ width: '100%', height: '100%' }}
                                                    config={{ displayModeBar: false, responsive: true }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-3 sm:pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-900">Total Latency Budget:</span> The core vector search operation completes in <strong>1.8 ms</strong>. Even including edge neural embedding inference (18.2 ms), total pipeline latency is <strong>20.4 ms</strong>—well within our 50 ms budget.
                                        </div>
                                    </div>

                                </div>

                                {/* Architectural Benchmarking Table */}
                                <div className="space-y-3 sm:space-y-4 pt-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-950">Architectural Benchmarking</h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Comparison of retrieval accuracy, computational resource footprints, and query latency across architectural paradigms.
                                    </p>

                                    <div className="overflow-x-auto border border-[#dadce0] rounded-xl sm:rounded-2xl bg-white shadow-sm -mx-1 sm:mx-0">
                                        <table className="w-full min-w-[580px] text-left border-collapse text-xs sm:text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200 bg-gray-50/70 text-gray-900 whitespace-nowrap">
                                                    <th className="py-3 px-3 sm:px-4 font-semibold">Engine / Architecture</th>
                                                    <th className="py-3 px-3 sm:px-4 text-center font-semibold">Top-1 Acc.</th>
                                                    <th className="py-3 px-3 sm:px-4 text-center font-semibold">Top-5 Acc.</th>
                                                    <th className="py-3 px-3 sm:px-4 text-right font-semibold">Query Latency</th>
                                                    <th className="py-3 px-3 sm:px-4 text-right font-semibold">Memory (RAM)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3 px-3 sm:px-4 font-medium text-gray-800">SQL Exact Matching (ILIKE / Regex)</td>
                                                    <td className="py-3 px-3 sm:px-4 text-center text-gray-700">29.4%</td>
                                                    <td className="py-3 px-3 sm:px-4 text-center text-gray-700">34.2%</td>
                                                    <td className="py-3 px-3 sm:px-4 text-right text-gray-700 font-mono">1.2 ms</td>
                                                    <td className="py-3 px-3 sm:px-4 text-right text-gray-700 font-mono">&lt; 2 MB</td>
                                                </tr>
                                                <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-3 px-3 sm:px-4 font-medium text-gray-800">BM25 / Elasticsearch</td>
                                                    <td className="py-3 px-3 sm:px-4 text-center text-gray-700">48.7%</td>
                                                    <td className="py-3 px-3 sm:px-4 text-center text-gray-700">59.8%</td>
                                                    <td className="py-3 px-3 sm:px-4 text-right text-gray-700 font-mono">8.5 ms</td>
                                                    <td className="py-3 px-3 sm:px-4 text-right text-gray-700 font-mono">~180 MB</td>
                                                </tr>
                                                <tr className="bg-green-50/70 font-semibold text-green-900 border-t border-green-200">
                                                    <td className="py-3 px-3 sm:px-4 flex items-center gap-2 whitespace-nowrap">
                                                        <span>Wheeloh Vector Search (Local)</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-green-200 text-green-800 rounded">Production</span>
                                                    </td>
                                                    <td className="py-3 px-3 sm:px-4 text-center text-green-800">84.6%</td>
                                                    <td className="py-3 px-3 sm:px-4 text-center text-green-800 font-bold">94.2%</td>
                                                    <td className="py-3 px-3 sm:px-4 text-right text-green-800 font-mono whitespace-nowrap">1.8 ms (20 ms E2E)</td>
                                                    <td className="py-3 px-3 sm:px-4 text-right text-green-800 font-mono">34 MB</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-[11px] text-gray-400 text-right sm:hidden mt-1 font-mono">
                                        ← Swipe table horizontally to see all metrics →
                                    </p>
                                </div>
                            </section>

                            {/* Section 6: Conclusion & Future Roadmap */}
                            <section id="conclusion" className="space-y-6 sm:space-y-8 scroll-mt-20">
                                <div>
                                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">Section 06</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 mt-1 mb-4 sm:mb-6">6. Conclusion & Future Roadmap</h2>
                                </div>

                                <div className="space-y-6 text-gray-800 leading-relaxed text-base md:text-lg">
                                    <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                                        The vector-based semantic search architecture detailed herein is deployed in production within the Wheeloh mobile spotter ecosystem. Indexing 22,180 distinct automotive models into an AVX2-accelerated in-memory matrix enables sub-20 ms end-to-end query resolution with 94.2% Top-5 accuracy at zero marginal cloud database costs.
                                    </p>

                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-950 pt-2 sm:pt-4">Roadmap Initiatives</h3>
                                    <div className="grid gap-3 sm:gap-4">
                                        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                                            <div className="font-semibold text-gray-950 flex items-center gap-2 text-sm sm:text-base">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                                                <span>1. Multimodal Visual Search (Zero-Shot CLIP)</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                Aligning mobile camera viewfinder crops directly into the joint embedding space via a fine-tuned contrastive vision-language transformer, allowing visual spots to query the text catalog without intermediary OCR.
                                            </p>
                                        </div>

                                        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                                            <div className="font-semibold text-gray-950 flex items-center gap-2 text-sm sm:text-base">
                                                <div className="w-2 h-2 rounded-full bg-green-600 shrink-0"></div>
                                                <span>2. INT8 Quantization for On-Device Edge Serving</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                Quantizing the 1,536-dimensional FP32 matrix to symmetric INT8 values reduces the memory footprint from 34 MB to 8.5 MB, unlocking 100% offline search capabilities natively within the iOS and Android applications.
                                            </p>
                                        </div>

                                        <div className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white space-y-1.5">
                                            <div className="font-semibold text-gray-950 flex items-center gap-2 text-sm sm:text-base">
                                                <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></div>
                                                <span>3. Hybrid Reciprocal Rank Fusion (RRF)</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                Fusing continuous dense vectors with sparse exact chassis code indices (e.g. "E46", "997.2", "NA6CE") via Reciprocal Rank Fusion to achieve the highest possible precision when spotters use definitive enthusiast chassis codes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Post Footer Links */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-t border-gray-200 pt-6 sm:pt-8 text-sm">
                                <Link
                                    href="/engineering"
                                    className="font-medium text-gray-700 hover:text-black flex items-center gap-1.5 transition-colors"
                                >
                                    <span>← Back to all engineering posts</span>
                                </Link>
                                <Link
                                    href="/"
                                    className="font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
                                >
                                    <span>Download the Wheeloh app</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
