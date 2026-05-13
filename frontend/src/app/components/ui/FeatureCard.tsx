"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/app/lib/utils";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  accent: "teal" | "purple" | "amber" | "indigo";
}) {
  const accentMap: Record<typeof accent, string> = {
    teal: "rgba(45,106,79,0.28)",
    purple: "rgba(153, 96, 255, 0.25)",
    amber: "rgba(255,107,53,0.22)",
    indigo: "rgba(76,59,207,0.25)",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-black/5 bg-white p-6",
        "shadow-[0_0_0_1px_rgba(10,10,15,0.06)]",
      )}
      style={{ boxShadow: `0 0 0 1px rgba(10,10,15,0.06), 0 0 34px ${accentMap[accent]}` }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,107,53,0.10),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(76,59,207,0.10),transparent_40%)]" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div
            className="grid size-11 place-items-center rounded-full border border-black/10 bg-white"
            style={{ boxShadow: `0 0 22px ${accentMap[accent]}` }}
          >
            <Icon className="size-5 text-sl-text" />
          </div>
          <div className="text-xs uppercase tracking-[0.14em] text-black/55">
            Module
          </div>
        </div>

        <div className="mt-5 font-display text-2xl text-sl-text">{title}</div>
        <p className="mt-3 text-sm leading-relaxed text-black/70">{description}</p>

        <Link
          href={href}
          className="mt-5 inline-flex items-center text-sm font-medium text-sl-accent hover:underline"
        >
          Learn more →
        </Link>
      </div>
    </motion.div>
  );
}

