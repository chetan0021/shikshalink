"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { brand } from "@/app/lib/constants";
import { cn } from "@/app/lib/utils";
import { SignInForm } from "@/app/components/auth/SignInForm";
import { RequestAccessForm } from "@/app/components/auth/RequestAccessForm";

const stats = [
  "30 million children drop out every year",
  "Teachers spend 40% of their time on paperwork",
  "School grants worth crores go unspent annually",
] as const;

function useRotatingText(items: readonly string[], everyMs = 3000) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % items.length), everyMs);
    return () => window.clearInterval(t);
  }, [items.length, everyMs]);
  return items[idx] ?? "";
}

function MapOutlineBackdrop() {
  // A subtle animated “India outline” vibe without external assets.
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,107,53,0.16),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(76,59,207,0.16),transparent_45%)]" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[44px] border border-[rgba(255,107,53,0.20)]"
        animate={{ rotate: [0, 3, 0], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        style={{ boxShadow: "0 0 0 1px rgba(255,107,53,0.10), 0 0 60px rgba(255,107,53,0.10)" }}
      />
      <motion.div
        className="absolute left-[46%] top-[52%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[36px] border border-[rgba(76,59,207,0.18)]"
        animate={{ rotate: [0, -4, 0], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 8.5, ease: "easeInOut", repeat: Infinity }}
        style={{ boxShadow: "0 0 0 1px rgba(76,59,207,0.10), 0 0 60px rgba(76,59,207,0.10)" }}
      />
    </div>
  );
}

export function AuthCard() {
  const [tab, setTab] = React.useState<"signin" | "request">("signin");
  const rotating = useRotatingText(stats, 3000);

  return (
    <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 px-4 py-10 md:grid-cols-5 md:gap-6 md:px-6">
      <section className="relative hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 md:col-span-3 md:block">
        <MapOutlineBackdrop />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
              Shiksha Link
            </div>
            <div className="mt-5 max-w-xl font-display text-4xl leading-tight text-white">
              “Every child deserves someone watching out for them.”
            </div>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.14em] text-white/60">
                Reality check
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={rotating}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white/80"
                >
                  {rotating}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative">
            <div className="font-display text-2xl text-white">{brand.name}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.14em] text-white/65">
              {brand.tagline}
            </div>
          </div>
        </div>
      </section>

      <section className="md:col-span-2">
        <div className="rounded-2xl bg-sl-light p-7 text-sl-text shadow-[0_0_0_1px_rgba(10,10,15,0.06)] md:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="font-display text-2xl">Welcome</div>
            <Link href="/" className="text-sm text-black/60 hover:text-black">
              Back to home
            </Link>
          </div>

          <div className="mt-6 rounded-full border border-black/10 bg-white p-1">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={cn(
                "w-1/2 rounded-full px-4 py-2 text-sm transition-colors",
                tab === "signin"
                  ? "bg-sl-primary/12 text-sl-text shadow-[0_0_0_1px_rgba(255,107,53,0.25)]"
                  : "text-black/60 hover:text-black",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("request")}
              className={cn(
                "w-1/2 rounded-full px-4 py-2 text-sm transition-colors",
                tab === "request"
                  ? "bg-sl-primary/12 text-sl-text shadow-[0_0_0_1px_rgba(255,107,53,0.25)]"
                  : "text-black/60 hover:text-black",
              )}
            >
              Request Access
            </button>
          </div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {tab === "signin" ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <SignInForm onRequestAccess={() => setTab("request")} />
                </motion.div>
              ) : (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <RequestAccessForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}

