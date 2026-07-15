"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

export default function GarageFeature() {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for mouse position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 300 };
    const mouseX = useSpring(x, springConfig);
    const mouseY = useSpring(y, springConfig);

    // rotation du téléphone
    // rotation du téléphone (très subtile pour garder le téléphone presque plat)
    const containerRotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const containerRotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

    // rotation des albums (prononcé pour l'effet de perspective demandé)
    const albumRotateX = useTransform(mouseY, [-0.5, 0.5], ["20deg", "-20deg"]);
    const albumRotateY = useTransform(mouseX, [-0.5, 0.5], ["-20deg", "20deg"]);

    // Intensités de parallax (x1 = léger, x2 = moyen, x3 = fort)
    const p1 = {
        x: useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
        y: useTransform(mouseY, [-0.5, 0.5], [-8, 8])
    };
    const p2 = {
        x: useTransform(mouseX, [-0.5, 0.5], [-15, 15]),
        y: useTransform(mouseY, [-0.5, 0.5], [-15, 15])
    };
    const p3 = {
        x: useTransform(mouseX, [-0.5, 0.5], [-25, 25]),
        y: useTransform(mouseY, [-0.5, 0.5], [-25, 25])
    };

    const getParallax = (level: number) => {
        if (level === 1) return p1;
        if (level === 3) return p3;
        return p2;
    };

    /**
     * CONFIGURATION DES ALBUMS
     * Change ici les coordonnées (pos), tailles (size) et profondeurs (depth)
     */
    const ALBUMS = [
        { src: "PORSCHE_Album.png", pos: "-left-0 top-16", size: "w-20", depth: "20px", parallax: 1 },
        { src: "FERRARI_Album.png", pos: "-right-0 top-16", size: "w-20", depth: "20px", parallax: 1 },
        { src: "LAMBO_Album.png", pos: "-left-2 top-[43%]", size: "w-20", depth: "30px", parallax: 2 },
        { src: "BUGATTI_Album.png", pos: "-right-2 top-[43%]", size: "w-20", depth: "30px", parallax: 2 },
        { src: "MCLAREN_Album.png", pos: "-left-0 bottom-8", size: "w-20", depth: "20px", parallax: 1 },
        { src: "PAGANI_Album.png", pos: "-right-0 bottom-8", size: "w-20", depth: "20px", parallax: 1 },
    ];

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="relative w-full h-[350px] flex items-center justify-center"
            style={{ perspective: "1200px" }}
        >
            <motion.div
                className="relative w-[150px] h-[300px] md:w-[180px] md:h-[360px]"
                style={{ rotateX: containerRotateX, rotateY: containerRotateY, transformStyle: "preserve-3d" }}
            >
                <img src="/presentation/PC_albums_trie/phone.png" alt="Wheeloh app garage view on a phone" className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl z-20" />

                {ALBUMS.map((album, i) => {
                    const m = getParallax(album.parallax);
                    return (
                        <motion.img
                            key={i}
                            alt={`${album.src.replace(/_Album\.png$/, "").toLowerCase()} car album in the Wheeloh garage`}
                            src={`/presentation/PC_albums_trie/${album.src}`}
                            className={`absolute ${album.pos} ${album.size} h-auto object-contain z-30 drop-shadow-xl`}
                            style={{
                                x: m.x,
                                y: m.y,
                                translateZ: album.depth,
                                rotateX: albumRotateX,
                                rotateY: albumRotateY
                            }}
                        />
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
