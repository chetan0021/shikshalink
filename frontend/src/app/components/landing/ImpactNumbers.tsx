"use client";

import { motion } from "framer-motion";

import { CounterAnimation } from "@/app/components/ui/CounterAnimation";

const items = [
  { a: 2, b: 3, unit: "Hours", label: "reclaimed per teacher per day" },
  { a: 4, b: 6, unit: "Weeks", label: "earlier dropout detection" },
  { a: 80, b: 90, unit: "%+", label: "school budget utilization target" },
  { a: 12, b: 12, unit: "Languages", label: "supported including Kannada, Hindi, Tamil, Telugu" },
] as const;

export function ImpactNumbers() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(90deg,rgba(43,179,167,0.26),rgba(47,158,119,0.24),rgba(122,203,140,0.20))] py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(10,10,15,0.25),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(10,10,15,0.30),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {items.map((it, idx) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: idx * 0.06 }}
              className="rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur"
            >
              <div className="font-display text-3xl text-white">
                {it.a !== it.b ? (
                  <>
                    <CounterAnimation value={it.a} />–<CounterAnimation value={it.b} />{" "}
                    {it.unit}
                  </>
                ) : (
                  <>
                    <CounterAnimation value={it.a} /> {it.unit}
                  </>
                )}
              </div>
              <div className="mt-3 text-sm text-white/85">{it.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center text-sm text-white/90">
          Designed for India. Built for every state — voice-first support across 12+ Indian languages.
        </div>
      </div>
    </section>
  );
}

