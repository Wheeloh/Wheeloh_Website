"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Intro = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Function to finish loading
        const completeLoading = () => {
            setProgress(100);
            // Small delay to allow progress bar animation to finish
            setTimeout(() => {
                onComplete();
            }, 500);
        };

        if (document.readyState === "complete") {
            completeLoading();
        } else {
            const handleLoad = () => completeLoading();
            window.addEventListener("load", handleLoad);

            // Fallback in case load event never fires or takes too long (max 3s)
            const fallbackTimer = setTimeout(completeLoading, 3000);

            return () => {
                window.removeEventListener("load", handleLoad);
                clearTimeout(fallbackTimer);
            };
        }
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white"
            initial={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-8"
            >
                <img
                    src="/applogo.svg"
                    alt="Wheeloh Logo"
                    className="h-16 w-auto md:h-24 brightness-0 invert"
                />
            </motion.div>

            <div className="h-1 w-64 overflow-hidden rounded-full bg-gray-800">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </motion.div>
    );
};

export default Intro;
