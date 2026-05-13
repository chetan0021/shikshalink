"use client";

import { motion } from "framer-motion";

const logos = [
  "Bhashini",
  "OpenAI Whisper",
  "Claude API",
  "WhatsApp Business API",
  "UDISE+",
  "Next.js",
  "Supabase",
] as const;

export function TechStack() {
  return (
    <section className="bg-sl-dark py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
          BUILT WITH
        </div>
        <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
          Enterprise-grade AI. Government-ready.
        </h2>
        <p className="mt-3 max-w-2xl text-white/70">
          DPDP Act aligned, audit-friendly, and designed for public systems.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {logos.map((l, idx) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.04 }}
              className="rounded-xl border bg-white/5 p-5 text-white/85 sl-silver-border"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{l}</div>
                <div className="text-xs sl-text-silver uppercase tracking-[0.14em]">
                  Verified
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-sm text-white/70">
          <span className="sl-text-silver">Enterprise-grade AI</span>.{" "}
          <span className="sl-text-gold">Government-ready compliance</span>. DPDP Act aligned.
        </div>
      </div>
    </section>
  );
}

