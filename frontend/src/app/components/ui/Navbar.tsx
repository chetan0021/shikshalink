"use client";

import * as React from "react";
import Link from "next/link";

import { brand, navLinks } from "@/app/lib/constants";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/Button";
import { LanguageSwitcher } from "@/app/components/ui/LanguageSwitcher";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 transition-all md:px-6",
          scrolled
            ? "mt-3 rounded-xl sl-glass shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
            : "mt-4",
        )}
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className={cn(
              "grid size-9 place-items-center rounded-lg ring-1",
              scrolled
                ? "border border-white/10 bg-white/10 text-white ring-white/10"
                : "border border-[var(--sl-primary)]/40 bg-[var(--sl-primary)]/10 text-[var(--sl-primary)] ring-[var(--sl-primary)]/20 shadow-[0_0_12px_rgba(94,196,177,0.2)]",
            )}
          >
            <span className="font-display text-base tracking-tight">SL</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-base text-white/90">{brand.name}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {brand.tagline}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/auth"
            className="text-sm font-medium text-white/50 transition-colors hover:text-white"
          >
            Sign In
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild size="sm" variant="ghost" className="hidden border border-white/10 text-white/60 hover:bg-white/5 hover:text-white md:inline-flex">
            <a href="#how">See How It Works</a>
          </Button>
          <Button asChild size="sm" variant="primary" className="animate-pulse-glow">
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
