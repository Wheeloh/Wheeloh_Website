"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Intro = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(100);
        }, 500);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
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
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                />
            </div>
        </motion.div>
    );
};

export default Intro;
