"use client";

import * as React from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Button } from "@/app/components/ui/Button";
import { StatPill } from "@/app/components/ui/StatPill";
import { OptionalHeroBackground } from "@/app/components/landing/OptionalHeroBackground";
import { cn } from "@/app/lib/utils";

function AmbientGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-[var(--sl-bg-dark)] pt-24 text-white">
      <OptionalHeroBackground />
      <AmbientGrain />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(94,196,177,0.12),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(125,211,192,0.10),transparent_48%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sl-primary)] drop-shadow-[0_0_8px_rgba(94,196,177,0.4)]">
              Built for Bharat’s public schools
            </div>

            <h1 className="mt-6 font-display text-5xl leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
              <SplitLine text="Every School Needs" />
              <span className="block mt-2">
                <motion.span
                  initial={{ backgroundPositionX: "0%" }}
                  animate={{ backgroundPositionX: "120%" }}
                  transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
                  className="sl-text-gradient inline-block bg-[length:200%_100%] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  One Connected View. In Real Time.
                </motion.span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              Shiksha Link connects teachers, parents, students and administrators with AI — surfacing dropout risk,
              simplifying paperwork, and unlocking grants before it’s too late.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="muted">DPDP-ready</Badge>
              <Badge variant="muted">Audit-friendly</Badge>
              <Badge variant="accent">Pilot clusters</Badge>
              <Badge variant="accent">Govt workflows</Badge>
              <Badge variant="muted">Voice-first · 12+ languages</Badge>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" variant="primary" className="animate-pulse-glow shadow-[0_0_20px_rgba(94,196,177,0.3)]">
                <a href="#how">See How It Works</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                <Link href="/auth">Request Access</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl sl-glass shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
              <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Signal preview</div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 animate-pulse rounded-full bg-[var(--sl-primary)] shadow-[0_0_8px_var(--sl-primary)]" />
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sl-primary)]">Live</div>
                  </div>
                </div>
              </div>

              <div className="bg-transparent p-6 text-white">
                <div className="mt-0 grid gap-4">
                  <PreviewRow
                    title="Dropout risk alert"
                    value="Preetham (Tumkur) — attendance dip 3 days"
                    color="rgba(94,196,177,0.4)"
                  />
                  <PreviewRow
                    title="Parent voice insight"
                    value="Kannada WhatsApp audio — concern detected"
                    color="rgba(125,211,192,0.4)"
                  />
                  <PreviewRow
                    title="Grant match"
                    value="Lab equipment vendors — 2 approved options"
                    color="rgba(255,255,255,0.2)"
                  />
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Live stats</div>
                  <MiniGraphs />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatPill delay={0.1} tone="light" className="text-center">
                250M students
              </StatPill>
              <StatPill delay={0.2} tone="light" className="text-center">
                10M teachers
              </StatPill>
              <StatPill delay={0.3} tone="light" className="text-center">
                30M dropouts/year
              </StatPill>
              <StatPill delay={0.4} tone="light" className="text-center">
                43,000+ schools in Karnataka alone
              </StatPill>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <motion.a
            href="#about"
            className="group flex items-center gap-2 text-sm text-[var(--sl-ink-muted)] transition-colors hover:text-[var(--sl-ink)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
              className="grid size-8 place-items-center rounded-full border border-black/[0.1] bg-white/60"
            >
              <ArrowDown className="size-4 text-[var(--sl-ink)]" />
            </motion.span>
            <span>Scroll</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function SplitLine({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
          className="mr-3 inline-block"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

function PreviewRow({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.08]"
      style={{ boxShadow: `0 0 0 1px ${color}, 0 0 12px ${color.replace("0.4", "0.1")}` }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{title}</div>
      <div className="mt-2 text-sm font-medium text-white/90">{value}</div>
    </motion.div>
  );
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "muted" | "accent";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md",
        variant === "accent"
          ? "border-[var(--sl-primary)]/40 bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]"
          : "border-white/10 bg-white/5 text-white/60",
      )}
    >
      {children}
    </div>
  );
}

function MiniGraphs() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const seriesA = [
    { t: "Mon", v: 18 },
    { t: "Tue", v: 22 },
    { t: "Wed", v: 21 },
    { t: "Thu", v: 28 },
    { t: "Fri", v: 31 },
    { t: "Sat", v: 34 },
    { t: "Sun", v: 33 },
  ];
  const seriesB = [
    { t: "W1", v: 7 },
    { t: "W2", v: 11 },
    { t: "W3", v: 9 },
    { t: "W4", v: 15 },
    { t: "W5", v: 18 },
  ];

  if (!mounted) {
    return (
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="h-[116px] rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="mt-3 h-[80px] rounded-lg bg-white/5" />
        </div>
        <div className="h-[116px] rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="mt-3 h-[80px] rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  const gridStroke = "rgba(242,241,238,0.10)";
  const tipBg = "rgba(26,28,27,0.95)";
  const tipBorder = "rgba(255,255,255,0.14)";

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="text-xs uppercase tracking-[0.14em] text-white/60">Risk signals</div>
        <div className="mt-2 h-[80px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seriesA} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fillSage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(90,125,111,0.45)" />
                  <stop offset="100%" stopColor="rgba(90,125,111,0.02)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <Tooltip
                contentStyle={{
                  background: tipBg,
                  border: `1px solid ${tipBorder}`,
                  borderRadius: 12,
                }}
                labelStyle={{ color: "rgba(242,241,238,0.9)" }}
                itemStyle={{ color: "rgba(242,241,238,0.9)" }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="rgba(120,165,145,0.95)"
                strokeWidth={2}
                fill="url(#fillSage)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="text-xs uppercase tracking-[0.14em] text-white/60">Engagement trend</div>
        <div className="mt-2 h-[80px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seriesB} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <Tooltip
                contentStyle={{
                  background: tipBg,
                  border: `1px solid ${tipBorder}`,
                  borderRadius: 12,
                }}
                labelStyle={{ color: "rgba(242,241,238,0.9)" }}
                itemStyle={{ color: "rgba(242,241,238,0.9)" }}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="rgba(160,195,175,0.9)"
                strokeWidth={2}
                dot={{ r: 2, stroke: "transparent", fill: "rgba(160,195,175,0.95)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
