"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Intro from "./Intro";

export default function GlobalLoader() {
    const [showIntro, setShowIntro] = useState(true);

    return (
        <AnimatePresence mode="wait">
            {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
        </AnimatePresence>
    );
}
