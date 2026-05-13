"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/app/components/ui/Button";

export function CTABanner() {
  return (
    <section className="bg-sl-dark py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border bg-white/5 p-8 md:p-10 sl-silver-border sl-silver-ring"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(43,179,167,0.14),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(122,203,140,0.10),transparent_56%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
                Join the pilot
              </div>
              <div className="mt-3 font-display text-3xl text-white">
                Ready to connect your school cluster?
              </div>
              <div className="mt-2 text-white/75">
                <span className="sl-text-silver">Premium rollout support</span> ·{" "}
                <span className="sl-text-gold">Government workflows</span>
              </div>
            </div>
            <Button asChild size="lg" variant="glass" className="animate-pulse-glow">
              <Link href="/auth">Request Early Access</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

