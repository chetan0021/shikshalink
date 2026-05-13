"use client";

import { FileText, IndianRupee, Users } from "lucide-react";
import { motion } from "framer-motion";

import { CounterAnimation } from "@/app/components/ui/CounterAnimation";

const cards = [
  {
    icon: FileText,
    headline: "3–4 Hours",
    label: "Lost daily by teachers to paperwork instead of teaching",
    value: 4,
    suffix: " Hours",
    color: "rgba(255,107,53,0.22)",
  },
  {
    icon: IndianRupee,
    headline: "₹000s Crores",
    label: "School grants unutilized every year due to complex vendor onboarding",
    value: 1000,
    suffix: "s",
    color: "rgba(45,106,79,0.22)",
  },
  {
    icon: Users,
    headline: "2x/Year",
    label: "How often parents engage with schools. That's it.",
    value: 2,
    suffix: "x/Year",
    color: "rgba(76,59,207,0.22)",
  },
] as const;

export function ProblemSection() {
  return (
    <section id="about" className="scroll-mt-28 bg-sl-dark py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
          THE REALITY
        </div>
        <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
          30 Million Children Drop Out Every Year.
        </h2>
        <p className="mt-3 max-w-2xl text-white/70">
          Not because they want to. Because nobody was watching.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c, idx) => (
            <motion.div
              key={c.headline}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: idx * 0.08 }}
              className="group rounded-xl p-6 sl-panel sl-panel-hover"
              style={{
                boxShadow: `0 0 0 1px ${c.color}, 0 0 34px rgba(0,0,0,0.25)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid size-11 place-items-center rounded-lg sl-panel"
                  style={{ boxShadow: `0 0 26px ${c.color}` }}
                >
                  <c.icon className="size-5 text-white/85" />
                </div>
                <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                  Signal
                </div>
              </div>

              <div className="mt-5 font-display text-3xl text-white">
                {idx === 0 ? (
                  <>
                    <CounterAnimation value={3} />–<CounterAnimation value={4} /> Hours
                  </>
                ) : idx === 1 ? (
                  <span>₹000s Crores</span>
                ) : (
                  <>
                    <CounterAnimation value={2} suffix="x/Year" />
                  </>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{c.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center text-white/75">
          The system has people who care. It just has no connective tissue.
        </div>
      </div>
    </section>
  );
}

