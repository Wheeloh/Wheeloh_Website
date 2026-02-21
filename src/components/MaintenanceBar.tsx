"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface MaintenanceConfig {
    active: boolean;
    message: string;
}

export default function MaintenanceBar() {
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState<MaintenanceConfig | null>(null);

    useEffect(() => {
        fetch('/maintenance.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                if (data.active) {
                    setIsVisible(true);
                }
            })
            .catch(err => console.error("Could not load maintenance config", err));
    }, []);

    if (!isVisible || !config) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-orange-500 text-white relative z-[100] flex flex-col items-center justify-center px-4 py-2 sm:px-6 lg:px-8 overflow-hidden font-medium border-b border-orange-600 dark:border-orange-600 shadow-sm"
                >
                    <div className="flex items-center space-x-2 text-sm text-center pr-6 sm:pr-0">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{config.message}</span>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-orange-600 rounded-md transition-colors"
                        aria-label="Dismiss message"
                    >
                        <X className="h-4 w-4 shrink-0" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
