"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useMaintenance } from "@/hooks/useMaintenance";

export default function MaintenanceBar() {
  const { active, message } = useMaintenance();
  const [dismissed, setDismissed] = useState(false);
  const visible = active && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-header overflow-hidden bg-gold text-ink"
        >
          <div className="flex items-center justify-center gap-2 px-10 py-2.5 text-center text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{message}</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors hover:bg-black/10 sm:right-4"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
