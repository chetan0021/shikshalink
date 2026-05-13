"use client";

import { motion } from "framer-motion";
import { Bell, ClipboardCheck, PhoneCall, Wallet } from "lucide-react";

const steps = [
  {
    time: "7:00 AM",
    title: "Yellamma receives a Kannada voice message on WhatsApp",
    icon: PhoneCall,
  },
  {
    time: "7:15 AM",
    title: "She responds by voice. AI detects worry about Preetham's attendance.",
    icon: Bell,
  },
  {
    time: "8:30 AM",
    title: "Manjunath sees a dropout risk alert on his dashboard. No form filled.",
    icon: ClipboardCheck,
  },
  {
    time: "9:00 AM",
    title: "BEO's panel flags a lab equipment grant — two approved vendors surfaced instantly.",
    icon: Wallet,
  },
] as const;

export function StoryTimeline() {
  return (
    <section className="bg-sl-dark py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
          A DAY WITH SHIKSHA LINK
        </div>
        <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
          A small signal. A fast response. A child stays in school.
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <motion.div
              key={s.time}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: idx * 0.06 }}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,107,53,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(76,59,207,0.12),transparent_45%)] opacity-70" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/70">
                    {s.time}
                  </div>
                  <div className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5">
                    <s.icon className="size-5 text-white/80" />
                  </div>
                </div>

                <div className="mt-5 text-sm leading-relaxed text-white/80">
                  {s.title}
                </div>

                <div className="mt-5 h-32 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Mock screen
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-4/5 rounded-full bg-white/15" />
                    <div className="h-2 w-3/5 rounded-full bg-white/15" />
                    <div className="h-2 w-2/3 rounded-full bg-white/15" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

