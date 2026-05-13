"use client";

import { motion } from "framer-motion";

import { cn } from "@/app/lib/utils";

export function StatPill({
  children,
  className,
  delay = 0,
  tone = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  tone?: "dark" | "light";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={cn(
        "rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-xl transition-transform hover:scale-105",
        tone === "dark"
          ? "border-white/10 bg-white/5 text-white/70"
          : "border-white/20 bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

